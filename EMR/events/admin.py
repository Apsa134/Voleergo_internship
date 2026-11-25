
from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'organizer',
        'category',
        'start_date',
        'status',
        'capacity'
    )
    list_filter = ('status', 'category', 'start_date')
    search_fields = ('title', 'organizer__username', 'venue')
    ordering = ('-created_at',)
