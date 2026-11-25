from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Event,EventRegistration
from .serializers import EventSerializer,EventRegistrationSerializer
from accounts.permissions import IsApprovedOrganizer
from django.utils import timezone
from django.db import transaction
from django.db.models import Count, Q


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsApprovedOrganizer])
def create_event(request):
    serializer = EventSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(organizer=request.user)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_list(request):
    events = Event.objects.filter(
        status='published'
    ).order_by('-created_at')
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_detail(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    # Published events are visible to everyone.
    # Draft events are visible only to their organizer or admin.
    if event.status != 'published':
        if event.organizer != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to view this event.'},
                status=status.HTTP_403_FORBIDDEN
            )
    serializer = EventSerializer(event)
    return Response(serializer.data)



@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsApprovedOrganizer])
def update_event(request, event_id):

    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    # Only the event owner or admin can update it
    if event.organizer != request.user and not request.user.is_staff:
        return Response(
            {'error': 'You can only update your own events.'},
            status=status.HTTP_403_FORBIDDEN
        )
    serializer = EventSerializer(
        event,
        data=request.data,
        partial=(request.method == 'PATCH')
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsApprovedOrganizer])
def cancel_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    # Only the owner or admin can cancel
    if event.organizer != request.user and not request.user.is_staff:
        return Response(
            {'error': 'You can only cancel your own events.'},
            status=status.HTTP_403_FORBIDDEN
        )
    if event.status == 'cancelled':
        return Response(
            {'message': 'This event is already cancelled.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    event.status = 'cancelled'
    event.save()
    return Response({
        'message': 'Event cancelled successfully.',
        'event_id': event.id,
        'status': event.status
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    if event.status != 'published':
        return Response(
            {'error': 'This event is not available for registration.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if timezone.now() > event.registration_deadline:
        return Response(
            {'error': 'Registration deadline has passed.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    with transaction.atomic():
        existing = EventRegistration.objects.filter(
            event=event,
            participant=request.user
        ).first()
        if existing and existing.status in ['registered', 'waitlisted']:
            return Response(
                {'error': 'You already have an active registration.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        registered_count = EventRegistration.objects.filter(
            event=event,
            status='registered'
        ).count()
        waitlisted_count = EventRegistration.objects.filter(
            event=event,
            status='waitlisted'
        ).count()
        if registered_count < event.capacity:
            new_status = 'registered'
        elif waitlisted_count < event.waitlist_capacity:
            new_status = 'waitlisted'
        else:
            return Response(
                {'error': 'Event and waiting list are both full.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if existing:
            registration = existing
            registration.status = new_status
            registration.registered_at = timezone.now()
            registration.save()
        else:
            registration = EventRegistration.objects.create(
                event=event,
                participant=request.user,
                status=new_status
            )
    serializer = EventRegistrationSerializer(registration)
    if new_status == 'registered':
        message = 'Successfully registered for the event.'
    else:
        message = 'Event is full. You have been added to the waiting list.'
    return Response(
        {
            'message': message,
            'registration': serializer.data
        },
        status=status.HTTP_201_CREATED
    )



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_registrations(request):
    registrations = EventRegistration.objects.filter(
        participant=request.user
    ).select_related('event').order_by('-registered_at')
    serializer = EventRegistrationSerializer(
        registrations,
        many=True
    )
    return Response(serializer.data)



@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cancel_registration(request, registration_id):
    try:
        registration = EventRegistration.objects.get(
            id=registration_id,
            participant=request.user
        )
    except EventRegistration.DoesNotExist:
        return Response(
            {'error': 'Registration not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    if registration.status == 'cancelled':
        return Response(
            {'error': 'Registration is already cancelled.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    with transaction.atomic():
        was_registered = registration.status == 'registered'
        registration.status = 'cancelled'
        registration.save()
        promoted = None
        if was_registered:
            promoted = EventRegistration.objects.filter(
                event=registration.event,
                status='waitlisted'
            ).order_by('registered_at', 'id').first()
            if promoted:
                promoted.status = 'registered'
                promoted.save()
    response_data = {
        'message': 'Registration cancelled successfully.'
    }
    if promoted:
        response_data['promoted_participant'] = promoted.participant.username
    return Response(response_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsApprovedOrganizer])
def my_organized_events(request):
    events = Event.objects.filter(
        organizer=request.user
    ).order_by('-created_at')
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsApprovedOrganizer])
def event_statistics(request):
    events = Event.objects.filter(
        organizer=request.user
    ).annotate(
        total_registrations=Count('registrations'),
        active_registrations=Count(
            'registrations',
            filter=Q(registrations__status='registered')
        ),
        cancelled_registrations=Count(
            'registrations',
            filter=Q(registrations__status='cancelled')
        ),
		waitlisted_registrations=Count(
			'registrations',
			filter=Q(registrations__status='waitlisted')
		)

    )
    data = []
    for event in events:
        data.append({
            'event_id': event.id,
            'title': event.title,
            'capacity': event.capacity,
            'total_registrations': event.total_registrations,
            'active_registrations': event.active_registrations,
            'waitlisted_registrations': event.waitlisted_registrations,
			'waitlist_capacity': event.waitlist_capacity,
            'cancelled_registrations': event.cancelled_registrations,
            'available_seats': max(
                event.capacity - event.active_registrations, 0
            )
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsApprovedOrganizer])
def event_participants(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    if event.organizer != request.user and not request.user.is_staff:
        return Response(
            {'error': 'You do not have permission to view these participants.'},
            status=status.HTTP_403_FORBIDDEN
        )
    registrations = EventRegistration.objects.filter(
        event=event
    ).select_related('participant').order_by('status', 'registered_at', 'id')
    data = []
    for registration in registrations:
        data.append({
            'registration_id': registration.id,
            'participant_id': registration.participant.id,
            'username': registration.participant.username,
            'email': registration.participant.email,
            'status': registration.status,
            'registered_at': registration.registered_at
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_event_list(request):
    events = Event.objects.all().select_related(
        'organizer'
    ).order_by('-created_at')
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_registration_list(request):
    registrations = EventRegistration.objects.select_related(
        'event', 'participant'
    ).order_by('-registered_at')

    data = []

    for registration in registrations:
        data.append({
            'registration_id': registration.id,
            'event_title': registration.event.title,
            'participant': registration.participant.username,
            'email': registration.participant.email,
            'status': registration.status,
            'registered_at': registration.registered_at
        })

    return Response(data)
