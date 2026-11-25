from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.utils import timezone
from .serializers import RegistrationSerializer,CurrentUserSerializer,ProfileUpdateSerializer,OrganizerApplicationSerializer
from .models import UserProfile,OrganizerApplication
from .permissions import IsApprovedOrganizer

@api_view(['POST'])
def register(request):
	serializer = RegistrationSerializer(data = request.data)
	if serializer.is_valid():
		with transaction.atomic():
			user = serializer.save()
			UserProfile.objects.create(user=user)
		return Response(
			{
				'message':"Registration successfull!"
			},
			status=status.HTTP_201_CREATED
		)
	return Response(
		serializer.errors,
		status=status.HTTP_400_BAD_REQUEST

	)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({
        'message': 'You are authenticated!',
        'username': request.user.username,
        'email': request.user.email
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = CurrentUserSerializer(request.user,context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile = request.user.profile
    serializer = ProfileUpdateSerializer(
        profile,
        data=request.data,
        partial=True
    )
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully.',
            'profile': serializer.data
        })
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_organizer(request):
    serializer = OrganizerApplicationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(
            {
                'message': 'Organizer application submitted successfully.',
                'application': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_organizer_application(request):
    applications = OrganizerApplication.objects.filter(
        user=request.user
    ).order_by('-applied_at')
    serializer = OrganizerApplicationSerializer(
        applications,
        many=True
    )
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def all_organizer_applications(request):
    applications = OrganizerApplication.objects.all().order_by('-applied_at')
    serializer = OrganizerApplicationSerializer(
        applications,
        many=True
    )
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def review_organizer_application(request, application_id):
    try:
        application = OrganizerApplication.objects.get(id=application_id)
    except OrganizerApplication.DoesNotExist:
        return Response(
            {'error': 'Application not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    new_status = request.data.get('status')
    if new_status not in ['approved', 'rejected']:
        return Response(
            {'error': 'Status must be approved or rejected.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if application.status != 'pending':
        return Response(
            {'error': 'This application has already been reviewed.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    application.status = new_status
    application.reviewed_at = timezone.now()
    application.save()
    return Response({
        'message': f'Application {new_status} successfully.',
        'application_id': application.id,
        'status': application.status,
        'reviewed_at': application.reviewed_at
    })

@api_view(['GET'])
@permission_classes([IsApprovedOrganizer])
def organizer_test(request):
    return Response({
        'message': 'Welcome! You have organizer access.',
        'username': request.user.username
    })
