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
[ if the bucket name is not available change to other. Then you need to change the bucket name also in Lambda addUser -> lambda_handler() and Lambda searchUser]

---- Then we need to add a user manualy ----

S3 upload [photo.jpg] -> Properties -> Metadata -> Type : User Defined , Key : x-amz-meta-FullName , Value : [name of the person]

---- Then we need to run rekognition on the photo ----

Lambda -> Name : addUser , Language : Pyhton 3.9 -> Permissions -> Execution Role : Use an existing role -> Lab Role

https://pastebin.com/gcNGafuf
Password: <!-- es_project -->

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

	    response = \
		rekognition.index_faces(Image={'S3Object': {'Bucket': bucket,
					'Name': key}}, CollectionId='users')
	    return response


	def update_index(tableName, faceId, fullName):
	    response = dynamodb.put_item(TableName=tableName,
					 Item={'RekognitionId': {'S': faceId},
					 'FullName': {'S': fullName}})


	def list_collections():

	    max_results = 2

	    # Display all the collections

	    print('Displaying collections...')
	    response = rekognition.list_collections(MaxResults=max_results)
	    collection_count = 0
	    done = False

	    while done == False:
		collections = response['CollectionIds']

		for collection in collections:
		    print(collection)
		    collection_count += 1
		if 'NextToken' in response:
		    nextToken = response['NextToken']
		    response = \
			rekognition.list_collections(NextToken=nextToken,
			    MaxResults=max_results)
		else:

		    done = True

	    return collection_count


	# --------------- Main handler ------------------

	def lambda_handler(event, context):

	    collection_count = list_collections()
	    if collection_count == 0:
		response = rekognition.create_collection(CollectionId='users')

	    # Get the object from the event

	    bucket = 'projeto-es'
	    key = event['filename']

	    # bucket = event['Records'][0]['s3']['bucket']['name']
	    # key = urllib.unquote_plus(event['Records'][0]['s3']['object']['key'].encode('utf8'))

	    try:

		# Calls Amazon Rekognition IndexFaces API to detect faces in S3 object
		# to index faces into specified collection

		response = index_faces(bucket, key)

		# Commit faceId and full name object metadata to DynamoDB

		if response['ResponseMetadata']['HTTPStatusCode'] == 200:
		    faceId = response['FaceRecords'][0]['Face']['FaceId']

		    ret = s3.head_object(Bucket=bucket, Key=key)
		    personFullName = ret['Metadata']['fullname']

		    update_index('users', faceId, personFullName)

		# Print response to console

		print(response)

		return response
	    except Exception, e:
		print(e)
		print('Error processing object {} from bucket {}. '.format(key,
		      bucket))
		raise e


---- Create a test with input ----

	{
	  "filename": "photo.jpg"
	}

---- Now with the user created, we can use a lambda to run rekognize (See ahead) ----

Lambda -> Name : searchUser , Language : Pyhton 3.9

https://pastebin.com/SqGFWWSk
Password: <!-- es_project -->

	import json
	import boto3
	import botocore
	import base64

	def lambda_handler(event, context):
	    # TODO implement
	    rekognition = boto3.client('rekognition', region_name='us-east-1')
	    dynamodb = boto3.client('dynamodb', region_name='us-east-1')

	    #file = event['photo'].encode('utf-8')
	    #image64 = base64.b64decode(file)
	    bucket = 'projeto-es'

	    try:
		response = rekognition.search_faces_by_image(
		    CollectionId='users',
		    MaxFaces=1,
		    Image={'S3Object':{'Bucket':bucket,'Name':event['photo']}},
		    #Image={'Bytes': image64},

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

https://pastebin.com/Au2D1hZk
Password: <!-- es_project -->

StepFunction -> Name : cookFood , Type : Express

https://pastebin.com/jvzAxYSD
Password: <!-- es_project -->

StepFunction -> Name : listOrders , Type : Express

https://pastebin.com/TsRq7bw9
Password: <!-- es_project -->

Lambda -> Name : confirmReception , Language : Pyhton 3.9

https://pastebin.com/iyJNwmxf
Password: <!-- es_project -->

StepFunction -> Name : confirmReception , Type : Express

https://pastebin.com/Yd3vpYgn
Password: <!-- es_project -->
