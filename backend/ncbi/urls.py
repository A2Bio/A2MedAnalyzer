from django.urls import path
from .views import ncbi_gene_info

urlpatterns = [
    path('', ncbi_gene_info, name='ncbi_gene_info'),
]
