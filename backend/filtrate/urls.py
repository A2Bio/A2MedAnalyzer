from django.urls import path
from .views import filtrate

urlpatterns = [
    path('', filtrate, name='filtrate'),  # Эндпоинт: http://localhost:8000/api/filtrate/
]