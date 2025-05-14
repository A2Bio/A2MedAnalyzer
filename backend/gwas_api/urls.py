from django.urls import path
from .views import search_gwas_by_trait

urlpatterns = [
    path("search/", search_gwas_by_trait, name="search_gwas_by_trait"),
]
