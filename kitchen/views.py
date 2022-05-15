from django.shortcuts import render, HttpResponse
from djangoRestaurant.decorators import is_staff, needs_login
from frontend.views import index
# Create your views here.

@needs_login
@is_staff
def homepage(request,user):
    return index(request)