from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda request: redirect('/api/gwas/')),  # Редирект на страницу /api/gwas/
    path('api/gwas/', include('gwas_api.urls')),
    path('api/annotation/', include('annotation.urls')),
    path('api/visualization/', include('visualization.urls')),
]
