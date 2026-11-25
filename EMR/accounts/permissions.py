
from rest_framework.permissions import BasePermission
from .models import OrganizerApplication

class IsApprovedOrganizer(BasePermission):
    message = "You must have an approved organizer application to access this feature."
    def has_permission(self, request, view):
        # Allow administrators
        if request.user and request.user.is_staff:
            return True
        # Check whether the user has an approved application
        return OrganizerApplication.objects.filter(
            user=request.user,
            status='approved'
        ).exists()
