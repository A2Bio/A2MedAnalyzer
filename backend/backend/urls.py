from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/gwas/', include('gwas_api.urls')),
    path('api/annotation/', include('annotation.urls')),
    path('api/visualization/', include('visualization.urls')),
]
