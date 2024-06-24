# base/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

# user Model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  
    last_name = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=12)

    USENAME_FIELD = "email"


    def __str__(self):
        return self.email 

# Turf Model
class TurfDetails(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class TurfImage(models.Model):
    turf = models.ForeignKey(TurfDetails, related_name='turf_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='turfs/')

    def __str__(self):
        return f"Image for {self.turf.name}"
    
