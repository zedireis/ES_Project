import base64
import json
import operator
from django.shortcuts import render, HttpResponse
from rest_framework.response import Response
from djangoRestaurant.decorators import  needs_login
from frontend.views import index
from djangoRestaurant.settings import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN, DEBUG
from rest_framework.views import APIView
import boto3
import itertools
from kitchen.models import Food
from botocore.exceptions import ClientError
import uuid

# Create your views here.
@needs_login
def homepage(request,user):
    return index(request)

class ConfirmView(APIView):
    def post(self, request):
        if DEBUG :
            client = boto3.client('stepfunctions',
                region_name='us-east-1',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                aws_session_token=AWS_SESSION_TOKEN
            )
        else:
            client = boto3.client('stepfunctions')

        json_string = json.dumps({"tag":request.data['locationTag']})

        Arn = 'arn:aws:states:us-east-1:752013087098:stateMachine:confirmReception'
        order = client.start_sync_execution(stateMachineArn=Arn, input=json_string)

        print(order)

        if(order["status"]=="FAILED"):
            output = order["cause"]
        else:
            output = "Reception confirmed. Thank you for using our service!"

        response = Response()

        response.data = {
            'message' : 'Success',
            'details' : output
        }

        return response
            
        
    def put(self, request):

        #return Response({"details" : "CONSEGUISTE"})

        try:
            file = request.data['photo']
        except KeyError:
            print("Error")
            return Response({"details":"Does not have a image"})

        if DEBUG :
            client = boto3.client('stepfunctions',
                region_name='us-east-1',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                aws_session_token=AWS_SESSION_TOKEN
            )

            s3 = boto3.client('s3',
                region_name='us-east-1',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                aws_session_token=AWS_SESSION_TOKEN
            )
        else:
            client = boto3.client('stepfunctions')
            s3 = boto3.client('s3')

        #client = boto3.client('stepfunctions', region_name='us-east-1')

        UUID = str(uuid.uuid1())

        with file.open("rb") as image_file:
            s3.upload_fileobj(image_file, 'projeto-es', UUID)
            #image64 = base64.b64encode(image_file.read())
        
        items_list = eval(request.data['items'])

        tag = request.data['locationTag']

        price = 0

        d = sorted(items_list, key=operator.itemgetter("name"))
        for i,g in itertools.groupby(d, key=operator.itemgetter("name")):
            f = Food.objects.filter(name=i).first()
            if(f is not None):
                price += round(getattr(f, "cost"),2) * len(list(g))


        json_string = json.dumps({"photo":UUID,"price":str(price),"items":items_list,"tag":tag})
        #json_string = json.dumps({"photo":image64.decode("utf8"),"price":str(price),"items":items_list})

        Arn = 'arn:aws:states:us-east-1:752013087098:stateMachine:ConfirmUser'
        order = client.start_sync_execution(stateMachineArn=Arn, input=json_string)

        if(order["status"]=="FAILED"):
            output = order["cause"]
        else:
            output = "Your order was confirmed! Please wait"

        response = Response()

        response.data = {
            'message' : 'Success',
            'details' : output
        }

        print(order)

        return response



