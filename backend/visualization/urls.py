from django.urls import path
from . import views

urlpatterns = [
    path('', views.test_viz, name='test_viz'),
]
