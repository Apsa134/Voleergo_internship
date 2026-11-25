
from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_event, name='create_event'),
	path('list/', views.event_list, name='event_list'),
	path('<int:event_id>/', views.event_detail, name='event_detail'),
	path('<int:event_id>/update/', views.update_event, name='update_event'),
	path('<int:event_id>/cancel/', views.cancel_event, name='cancel_event'),
	path('<int:event_id>/register/', views.register_event, name='register_event'),
	path('my-registrations/', views.my_registrations, name='my_registrations'),
	path('registrations/<int:registration_id>/cancel/', views.cancel_registration, name='cancel_registration'),
	path('my-events/', views.my_organized_events, name='my_organized_events'),
	path('dashboard/statistics/', views.event_statistics, name='event_statistics'),
	path('<int:event_id>/participants/',views.event_participants,name='event_participants'),
	path('admin/all-events/', views.admin_event_list, name='admin_event_list'),
	path('admin/registrations/',views.admin_registration_list,name='admin_registration_list'),


]
