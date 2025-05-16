from django.urls import path
from .views import filtration

urlpatterns = [
    path('api/filtrate/', filtration, name='filtration'), 
]