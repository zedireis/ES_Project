from django.urls import path, include
from . import views
from users import urls as user_urls
from kitchen import views as kitchen
from restaurant import views as restaurant


urlpatterns = [
    path('api/', include(user_urls)),
    path('kitchen/', views.index ),
    path('kitchen/homepage',  kitchen.homepage),
    path('restaurant/', views.index ),
    path('restaurant/homepage',  restaurant.homepage),
]