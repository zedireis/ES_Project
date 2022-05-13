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

  1.  Uncomment WhiteNoise library in djangoRestaurant/settings.py
  2.  npm run build
  3.  python manage.py collectstatic
  4.  Create a zip from the root folder (not a zip of a folder with root inside)
  5.  Upload and deploy
