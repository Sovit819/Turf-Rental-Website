import os
from django.contrib.auth.models import AbstractUser
from django.db import models

# For handling the images to delete when Turf is deleted. For related code see the last of this file
from django.db.models.signals import post_delete, pre_delete
from django.dispatch import receiver


# user Model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  
    last_name = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=12, unique=True)

    def __str__(self):
        return self.email 

# Turf Model
class TurfDetails(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.FloatField(max_length=50)

    def __str__(self):
        return self.name

class TurfImage(models.Model):
    turf = models.ForeignKey(TurfDetails, related_name='turf_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='turfs/')

    def __str__(self):
        return f"Image for {self.turf.name}"
    
    
#Booking Model
class Booking(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    turf = models.ForeignKey(TurfDetails, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=15)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    payment_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    booking_date = models.DateField()
    
    def __str__(self):
        return f"Booking by {self.user.email} for {self.turf.name} on {self.date}"

#Payment Model
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('online', 'Online Payment'),
        ('cash', 'Cash'),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)
    phone_number = models.CharField(max_length=15)
    transaction_uuid = models.CharField(max_length=50)
    
    def __str__(self):
        return f"Payment for {self.booking.turf.name} by {self.booking.user.email} - {self.amount} via {self.get_payment_method_display()}"


#For handling the images from the media folder 

@receiver(post_delete, sender=TurfImage)
def delete_turf_image_file(sender, instance, **kwargs):
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)

@receiver(pre_delete, sender=TurfDetails)
def delete_related_images(sender, instance, **kwargs):
    for image in instance.turf_images.all():
        if image.image:
            if os.path.isfile(image.image.path):
                os.remove(image.image.path)