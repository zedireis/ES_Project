from django.urls import path, include
from . import views
from users import urls as user_urls
from kitchen import views as kitchen
from restaurant import views as restaurant


urlpatterns = [
    path('api/', include(user_urls)),
    path('kitchen/', views.index ),
    path('kitchen/homepage',  kitchen.homepage),
    path('kitchen/create_food', kitchen.CreateFood.as_view()),
    path('kitchen/food_list', kitchen.ListFood.as_view()),
    path('restaurant/', views.index ),
    path('restaurant/choose',  views.index),
    path('kitchen/listOrders', kitchen.getListOrders),
]