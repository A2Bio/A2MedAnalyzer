from django.urls import path
from .views import studies_by_disease_trait

urlpatterns = [
    path('studies-by-disease-trait/<str:trait>/', studies_by_disease_trait, name='studies_by_disease_trait'),
]
