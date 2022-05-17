from functools import wraps
from wsgiref.util import request_uri
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
import jwt, datetime
from users.models import User

def needs_login(function):
    def is_logged(request):
        token = request.COOKIES.get('jwt')

        if not token:
            #raise AuthenticationFailed('Unauthenticated!')
            response = redirect("/"+request.path.split("/")[1])
            return response

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            #raise AuthenticationFailed('Unauthenticated!')
            #raise PermissionDenied
            response = redirect("/"+request.path.split("/")[1])
            return response

        user = User.objects.filter(id=payload['id']).first()

        return function(request,user)
    return is_logged

def is_staff(function):
    def staff(request, user):
        
        if user.role > 1:
            return function(request,user)
        else:
            raise PermissionDenied
    return staff

def needs_login_class(function):
    def is_logged(classe,request):
        token = request.COOKIES.get('jwt')

        if not token:
            #raise AuthenticationFailed('Unauthenticated!')
            response = redirect("/"+request.path.split("/")[1])
            return response

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            #raise AuthenticationFailed('Unauthenticated!')
            #raise PermissionDenied
            response = redirect("/"+request.path.split("/")[1])
            return response

        user = User.objects.filter(id=payload['id']).first()

        return function(classe,request,user)
    return is_logged

def is_staff_class(function):
    def staff(classe, request, user):
        
        if user.role > 1:
            return function(classe,request,user)
        else:
            raise PermissionDenied
    return staff