
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone

from .models import User, UserProfile, OrganizerApplication


# Register User only if it hasn't already been registered
if not admin.site.is_registered(User):
    admin.site.register(User, UserAdmin)


if not admin.site.is_registered(UserProfile):
    admin.site.register(UserProfile)


@admin.register(OrganizerApplication)
class OrganizerApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'organization_name',
        'status',
        'applied_at',
        'reviewed_at'
    )

    list_filter = ('status',)
    search_fields = ('user__username', 'organization_name')

    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            if obj.status in ['approved', 'rejected']:
                obj.reviewed_at = timezone.now()
            elif obj.status == 'pending':
                obj.reviewed_at = None

        super().save_model(request, obj, form, change)
