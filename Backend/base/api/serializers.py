from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from base.models import TurfDetails,TurfImage, Booking, Payment

#user model serializer
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(required=False, allow_blank=True) 


    class Meta:
        model = User
        fields = ['id','first_name', 'last_name','email','username', 'password', 'phone_number']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("This email is already in use.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise ValidationError("Username already exits.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
            email=validated_data['email'],
            username= validated_data['username'],
            password=validated_data['password'],
            phone_number=validated_data['phone_number']
        )
        return user

# Turf Model Serializer
class TurfImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TurfImage
        fields = ('image',)

class TurfDetailsSerializer(serializers.ModelSerializer):
    turf_images = TurfImageSerializer(many=True, read_only=True)

    class Meta:
        model = TurfDetails
        fields = ('id', 'name', 'description', 'price', 'turf_images')


# Booking Serializer
class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['user', 'turf', 'phone_number', 'date', 'start_time', 'end_time','amount', 'payment_status','booking_date']



# Payment Serializer
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'amount', 'payment_method', 'phone_number']