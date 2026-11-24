from rest_framework import serializers
from .models import User,UserProfile,OrganizerApplication

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match.'}
            )
        return data
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'profile_picture']
    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None


class CurrentUserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'profile_picture']


class OrganizerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerApplication
        fields = [
            'id',
            'organization_name',
            'reason',
            'status',
            'applied_at',
            'reviewed_at'
        ]
        read_only_fields = ['id', 'status', 'applied_at', 'reviewed_at']