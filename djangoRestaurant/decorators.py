from functools import wraps
from django.core.exceptions import PermissionDenied
import jwt, datetime
from users.models import User

def needs_login(function):
    def is_logged(request):
        token = request.COOKIES.get('jwt')

        if not token:
            #raise AuthenticationFailed('Unauthenticated!')
            raise PermissionDenied

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            #raise AuthenticationFailed('Unauthenticated!')
            raise PermissionDenied

        user = User.objects.filter(id=payload['id']).first()

        return function(request,user)
    return is_logged