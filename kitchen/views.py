from django.shortcuts import render, HttpResponse
from djangoRestaurant.decorators import is_staff, is_staff_class, needs_login, needs_login_class
from frontend.views import index
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import default_storage
from djangoRestaurant.settings import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
import boto3
import json
from kitchen.models import Food
from django.http import JsonResponse
from rest_framework.decorators import api_view

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

@api_view(['GET'])
def getListOrders(request):
    print("######  Entrei na step funciton  ######")
    
    if request.method == 'GET':
        client = boto3.client('stepfunctions',
        region_name='us-east-1',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        aws_session_token=AWS_SESSION_TOKEN
)
        #client = boto3.client('stepfunctions', region_name='us-east-1')
        Arn = 'arn:aws:states:us-east-1:998371520618:stateMachine:getOrders'
        response = client.start_sync_execution(stateMachineArn=Arn)

        output = json.loads(response["output"])
        return JsonResponse(output, safe=False)