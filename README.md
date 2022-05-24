# ES_Project

------------ PREPARE ENVIRONMENT ---------------
		
	https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-python-django.html
		
In the case of npm not having modules

	npm install @babel/core @babel/preset-env @babel/preset-react babel-loader react react-dom react-router-dom webpack webpack-cli webpack-watch-files-plugin axios
	
------------ RUNNING LOCALHOST ---------------

    source ~/eb-virt/bin/activate
    
    npm run dev
    
    python manage.py collectstatic
    
    python manage.py runserver
    
------------ AWS DEPLOY ---------------

Create a RDS Database to store users
https://i.imgur.com/eAP0Ipd.png

For 1st deployment we need to create a superuser
Go to .ebextensions/django.conf

Under container_commands add:

	04_create_superuser:
	    command: "source /var/app/venv/*/bin/activate && python3 manage.py createsuperuser --noinput"
	    leader_only: true
	 
! Remove this command after first deployment

Create a file .env in root folder with the following variables:
		
	SECRET_KEY=-m9^rld@118=938pc38h56p^70$n=*+r2@3a6zyjs&6r!(-j_e

	DJANGO_SUPERUSER_EMAIL=superuser@email.com

	DJANGO_SUPERUSER_USERNAME=admin

	DJANGO_SUPERUSER_PASSWORD=admin

	AWS_ACCESS_KEY_ID=

	AWS_SECRET_ACCESS_KEY=

	RDS_DB_NAME=ebdb

	RDS_HOSTNAME=

	RDS_PORT=5432

	RDS_USERNAME=projetoes

	RDS_PASSWORD=

  1.  Set Debug=False in djangoRestaurant/settings.py
  2.  Create a zip from the root folder (not a zip of a folder with root inside)
  3.  Upload and deploy

------------ NEEDED STEP FUNCTIONS ---------------
	
----  In order for this to work we need to Create a Dynamo DB and S3 Bucket ----

DynamoDB -> Create table -> Name : users , PartitionKey : RekognitionId (String)

S3 -> Create bucket -> Name : projeto-es

---- Then we need to add a user manualy ----

S3 upload [photo.jpg] -> Properties -> Metadata -> Type : User Defined , Key : x-amz-meta-FullName , Value : [name of the person]

---- Then we need to run rekognition on the photo ----

Lambda -> Name : addUser , Language : Pyhton 3.9

	from __future__ import print_function

	import boto3
	from decimal import Decimal
	import json
	import urllib

	print('Loading function')

	dynamodb = boto3.client('dynamodb')
	s3 = boto3.client('s3')
	rekognition = boto3.client('rekognition')


	# --------------- Helper Functions ------------------

	def index_faces(bucket, key):

	    response = rekognition.index_faces(
		Image={"S3Object":
		    {"Bucket": bucket,
		    "Name": key}},
		    CollectionId="users")
	    return response

	def update_index(tableName,faceId, fullName):
	    response = dynamodb.put_item(
		TableName=tableName,
		Item={
		    'RekognitionId': {'S': faceId},
		    'FullName': {'S': fullName}
		    }
		) 


	def list_collections():

	    max_results=2

	    #Display all the collections
	    print('Displaying collections...')
	    response=rekognition.list_collections(MaxResults=max_results)
	    collection_count=0
	    done=False

	    while done==False:
		collections=response['CollectionIds']

		for collection in collections:
		    print (collection)
		    collection_count+=1
		if 'NextToken' in response:
		    nextToken=response['NextToken']
		    response=rekognition.list_collections(NextToken=nextToken,MaxResults=max_results)

		else:
		    done=True

	    return collection_count

	# --------------- Main handler ------------------

	def lambda_handler(event, context):

	    collection_count = list_collections()
	    if (collection_count == 0):
		response = rekognition.create_collection(
		    CollectionId='users'
		)

	    # Get the object from the event
	    bucket = 'projeto-es'
	    key = event['filename']

	    #bucket = event['Records'][0]['s3']['bucket']['name']
	    #key = urllib.unquote_plus(event['Records'][0]['s3']['object']['key'].encode('utf8'))

	    try:

		# Calls Amazon Rekognition IndexFaces API to detect faces in S3 object 
		# to index faces into specified collection

		response = index_faces(bucket, key)

		# Commit faceId and full name object metadata to DynamoDB

	Lambda Used in this Step Function -> Name : SearchUser , Language : Pyhton 3.9

		import json
		import boto3
		import botocore
		import base64

		def lambda_handler(event, context):
		    # TODO implement
		    rekognition = boto3.client('rekognition', region_name='us-east-1')
		    dynamodb = boto3.client('dynamodb', region_name='us-east-1')

		    file = event['photo'].encode('utf-8')
		    image64 = base64.b64decode(file)

		    try:
			response = rekognition.search_faces_by_image(
			    CollectionId='users',
			    MaxFaces=1,
			    Image={'Bytes': image64}
			)
		    except rekognition.exceptions.from_code('InvalidParameterException') as e:
			return {
			    'statusCode': 404,
			    'details':'No faces in image'
			}

		    print ("1st -> "+response['FaceMatches'][0]['Face']['FaceId'],response['FaceMatches'][0]['Face']['Confidence'])

		    for match in response['FaceMatches']:
			print (match['Face']['FaceId'],match['Face']['Confidence'])

		    face = dynamodb.get_item(
			TableName='users',  
			Key={'RekognitionId': {'S': match['Face']['FaceId']}}
			)

		    if 'Item' in face:
			print (face['Item']['FullName']['S'])
			return {
			    'statusCode' : 200,
			    'details' : 'found',
			    'user' : face['Item']['FullName']['S'],
			    'confidence' : response['FaceMatches'][0]['Face']['Confidence']
			}
		    else:
			print ('no match found in person lookup')
			return {
			    'statusCode': 403,
			    'details':'not found'
			}

---- Create a test with input ----

	{
	  "filename": "photo.jpg"
	}

---- Now with the user created, we can use a lambda to run rekognize (See ahead) ----

Lambda -> Name : searchUser , Language : Pyhton 3.9

	import json
	import boto3
	import botocore
	import base64

	def lambda_handler(event, context):
	    # TODO implement
	    rekognition = boto3.client('rekognition', region_name='us-east-1')
	    dynamodb = boto3.client('dynamodb', region_name='us-east-1')

	    file = event['photo'].encode('utf-8')
	    image64 = base64.b64decode(file)

	    try:
		response = rekognition.search_faces_by_image(
		    CollectionId='users',
		    MaxFaces=1,
		    Image={'Bytes': image64}
		)
	    except rekognition.exceptions.from_code('InvalidParameterException') as e:
		return {
		    'statusCode': 404,
		    'details':'No faces in image'
		}

	    print ("1st -> "+response['FaceMatches'][0]['Face']['FaceId'],response['FaceMatches'][0]['Face']['Confidence'])

	    for match in response['FaceMatches']:
		print (match['Face']['FaceId'],match['Face']['Confidence'])

	    face = dynamodb.get_item(
		TableName='users',  
		Key={'RekognitionId': {'S': match['Face']['FaceId']}}
		)

	    if 'Item' in face:
		print (face['Item']['FullName']['S'])
		return {
		    'statusCode' : 200,
		    'details' : 'found',
		    'user' : face['Item']['FullName']['S'],
		    'confidence' : response['FaceMatches'][0]['Face']['Confidence']
		}
	    else:
		print ('no match found in person lookup')
		return {
		    'statusCode': 403,
		    'details':'not found'
		}
		
---- But we will run it inside a StepFunction ----

StepFunction -> Name : ConfirmUser , Type : Express

	{
	  "Comment": "A description of my state machine",
	  "StartAt": "Rekognize user",
	  "States": {
	    "Rekognize user": {
	      "Type": "Task",
	      "Resource": "arn:aws:states:::lambda:invoke",
	      "Parameters": {
		"Payload.$": "$",
		"FunctionName": "arn:aws:lambda:us-east-1:752013087098:function:searchUser:$LATEST"
	      },
	      "Retry": [
		{
		  "ErrorEquals": [
		    "Lambda.ServiceException",
		    "Lambda.AWSLambdaException",
		    "Lambda.SdkClientException"
		  ],
		  "IntervalSeconds": 2,
		  "MaxAttempts": 6,
		  "BackoffRate": 2
		}
	      ],
	      "Next": "Pass",
	      "ResultPath": "$.rekognize"
	    },
	    "Pass": {
	      "Type": "Pass",
	      "Next": "Choice",
	      "Parameters": {
		"user.$": "$.rekognize.Payload.user",
		"statusCode.$": "$.rekognize.Payload.statusCode",
		"items.$": "$.items",
		"price.$": "$.price"
	      }
	    },
	    "Choice": {
	      "Type": "Choice",
	      "Choices": [
		{
		  "Variable": "$.statusCode",
		  "NumericEquals": 200,
		  "Next": "DynamoDB PutItem"
		},
		{
		  "Variable": "$.statusCode",
		  "NumericEquals": 403,
		  "Next": "Fail (1)"
		}
	      ],
	      "Default": "Fail"
	    },
	    "DynamoDB PutItem": {
	      "Type": "Task",
	      "Resource": "arn:aws:states:::dynamodb:putItem",
	      "Parameters": {
		"TableName": "Orders",
		"Item": {
		  "UUID": {
		    "S.$": "States.Format('{}_{}', $.user, $$.State.EnteredTime)"
		  },
		  "Items": {
		    "L.$": "$.items..name"
		  },
		  "Price": {
		    "N.$": "$.price"
		  }
		}
	      },
	      "Next": "Success",
	      "Catch": [
		{
		  "ErrorEquals": [
		    "States.ALL"
		  ],
		  "ResultPath": "$.error",
		  "Next": "Fail"
		}
	      ]
	    },
	    "Fail": {
	      "Type": "Fail",
	      "Cause": "No face found"
	    },
	    "Success": {
	      "Type": "Succeed"
	    },
	    "Fail (1)": {
	      "Type": "Fail",
	      "Cause": "No such user"
	    }
	  }
	}
