
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('protected/', views.protected_view, name='protected'),
	path('me/', views.current_user, name='current_user'),
	path('profile/update/', views.update_profile, name='update_profile'),
	path('organizer/apply/', views.apply_organizer, name='apply_organizer'),
	path('organizer/my-application/',views.my_organizer_application,name='my_organizer_application'),
	path('admin/organizer-applications/',views.all_organizer_applications,name='all_organizer_applications'),
	path('admin/organizer-applications/<int:application_id>/review/',views.review_organizer_application,name='review_organizer_application'),


]
