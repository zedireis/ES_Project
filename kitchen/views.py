from django.shortcuts import render, HttpResponse
from djangoRestaurant.decorators import is_staff, is_staff_class, needs_login, needs_login_class
from frontend.views import index
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import default_storage
from djangoRestaurant.settings import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
import boto3
from kitchen.models import Food

from kitchen.serializers import FoodSerializer

# Create your views here.
@needs_login
@is_staff
def homepage(request,user):
    return index(request)

class CreateFood(APIView):
    @needs_login_class
    @is_staff_class
    def get(self, request, user):
        return index(request)

    parser_classes = [MultiPartParser]

    @needs_login_class
    @is_staff_class
    def post(self, request, user):
        #file_name = default_storage.save("imagem.png", request.data['image'])
        try:
            file = request.data['photo']
        except KeyError:
            return Response({"details":"Does not have a image"})
        serializer = FoodSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class ListFood(APIView):
    def get(self, request):
        foods = Food.objects.all().values()
        return Response({"food_list" : foods})