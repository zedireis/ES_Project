from django.urls import path, include
from . import views
from users import urls as user_urls


urlpatterns = [
    path('api/', include(user_urls)),
    path('kitchen/', views.index ),
    path('kitchen/homepage', views.index ),
    #path('restaurant/', views.index ),
]