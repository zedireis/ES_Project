from django.db import models

# Create your models here.
class Food(models.Model):
    name = models.CharField(max_length=30)
    cost = models.FloatField()
    photo = models.ImageField(upload_to="food_images/")

    def __str__(self):
        return self.name