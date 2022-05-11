from django.shortcuts import render, HttpResponse

# Create your views here.
def homepage(request):
    s = "<h1>Welcome to restaurant homepage!</h1>"
    return HttpResponse(s)