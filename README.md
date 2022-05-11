# ES_Project

------------ PREPARE ENVIRONMENT ---------------
		
	https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-python-django.html
		
------------ RUNNING LOCALHOST ---------------

    source ~/eb-virt/bin/activate
    
    python manage.py collectstatic
    
    python manage.py runserver
    
------------ AWS DEPLOY ---------------

  1.  Create a zip from this repository
  2.  Upload and deploy
