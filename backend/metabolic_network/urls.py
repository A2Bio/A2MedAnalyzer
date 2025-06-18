from django.urls import path
from .views import metabolic_network

urlpatterns = [
    path('', metabolic_network, name='metabolic_network'), 
]