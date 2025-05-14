from django.urls import path
from . import views

urlpatterns = [
    path('', views.test_annotation, name='test_annotation'),
]
