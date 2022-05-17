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
