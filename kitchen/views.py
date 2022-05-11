from django.shortcuts import render, HttpResponse

# Create your views here.
def homepage(request):
    s = "<h1>Welcome to kitchen homepage!</h1>"
    return HttpResponse(s)