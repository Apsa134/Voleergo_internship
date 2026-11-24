from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.
class User(AbstractUser):
	email = models.EmailField(unique=True)

	def __str__(self):
		return self.username
    

class UserProfile(models.Model):


    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    phone_number = models.CharField(max_length=15, blank=True)

    profile_picture = models.ImageField(
        upload_to='profiles/',
        blank=True,
        null=True
    )

    def __str__(self):
        return self.user.username
