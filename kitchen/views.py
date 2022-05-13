from django.shortcuts import render, HttpResponse
from djangoRestaurant.decorators import needs_login
# Create your views here.

@needs_login
def homepage(request,user):
    s = "<h1>Welcome to kitchen homepage!</h1>"
    return HttpResponse(s)