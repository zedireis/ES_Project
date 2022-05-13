from django.db import models
from django.contrib.auth.models import AbstractUser
from users.managers import CustomUserManager


# Create your models here.
class User(AbstractUser):
    CLIENT = 1
    STAFF = 2

    ROLE_CHOICES = (
          (CLIENT, 'Client'),
          (STAFF, 'Staff'),
      )

    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    role = models.PositiveSmallIntegerField(choices=ROLE_CHOICES, blank=True, null=True)
    username = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Client(User):
    class Meta:
        proxy = True

    def get_queryset(self):
        return super().get_queryset().filter(role=self.CLIENT)

    def save(self, *args, **kwargs):
        self.role = self.CLIENT
        super().save(*args, **kwargs)

class Staff(User):
    class Meta:
        proxy = True

    def get_queryset(self):
        return super().get_queryset().filter(role=self.STAFF)

    def save(self, *args, **kwargs):
        self.role = self.STAFF
        super().save(*args, **kwargs)