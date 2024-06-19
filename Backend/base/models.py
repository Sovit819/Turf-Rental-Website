# base/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  
    last_name = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=12)

    USENAME_FIELD = "email"


    def __str__(self):
        return self.email 
