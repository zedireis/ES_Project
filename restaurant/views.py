import base64
import json
import operator
from django.shortcuts import render, HttpResponse
from rest_framework.response import Response
from djangoRestaurant.decorators import  needs_login
from frontend.views import index
from djangoRestaurant.settings import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
from rest_framework.views import APIView
import boto3
import itertools
from kitchen.models import Food

# Create your views here.
@needs_login
def homepage(request,user):
    return index(request)

class ConfirmView(APIView):
    def put(self, request):
        try:
            file = request.data['photo']
        except KeyError:
            return Response({"details":"Does not have a image"})

        client = boto3.client('stepfunctions',
            region_name='us-east-1',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            aws_session_token=AWS_SESSION_TOKEN
        )

        #client = boto3.client('stepfunctions', region_name='us-east-1')

        with file.open("rb") as image_file:
            image64 = base64.b64encode(image_file.read())

        items_list = eval(request.data['items'])

        
        price = 0

        d = sorted(items_list, key=operator.itemgetter("name"))
        for i,g in itertools.groupby(d, key=operator.itemgetter("name")):
            f = Food.objects.filter(name=i).first()
            if(f is not None):
                price += round(getattr(f, "cost"),2) * len(list(g))


        json_string = json.dumps({"photo":image64.decode("utf8"),"price":str(price),"items":items_list})

        Arn = 'arn:aws:states:us-east-1:752013087098:stateMachine:ConfirmUser'
        order = client.start_sync_execution(stateMachineArn=Arn, input=json_string)

        if(order["status"]=="FAILED"):
            output = order["cause"]
        else:
            output = order["output"]

        response = Response()

        response.data = {
            'message' : 'Success',
            'details' : output
        }

        return response



