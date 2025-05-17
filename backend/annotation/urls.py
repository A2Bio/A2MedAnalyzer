from django.urls import path
from .views import annotate

urlpatterns = [
    path('', annotate, name='annotate'),  # http://localhost:8000/api/annotation/
]