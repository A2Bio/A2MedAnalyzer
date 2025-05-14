from django.urls import path
from . import views

urlpatterns = [
    path('', views.test_gwas, name='test_gwas'),
]
