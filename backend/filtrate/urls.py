from django.urls import path
from .views import filtrate

urlpatterns = [
    path('', filtrate, name='filtrate'), 
]