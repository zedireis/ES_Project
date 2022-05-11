from django.urls import path
from restaurant import views

urlpatterns = [
    path('homepage/', views.homepage),
]