from django.shortcuts import render, HttpResponse
from djangoRestaurant.decorators import  needs_login
from frontend.views import index

# Create your views here.
@needs_login
def homepage(request,user):
    return index(request)