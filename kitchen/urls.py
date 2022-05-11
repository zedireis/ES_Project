from django.urls import path
from kitchen import views

urlpatterns = [
    path('homepage/', views.homepage),
]