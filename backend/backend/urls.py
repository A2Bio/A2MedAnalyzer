from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/gwas/', include('gwas_api.urls')),
    path('api/annotation/', include('annotation.urls')),
    path('api/visualization/', include('visualization.urls')),

    # React SPA — ловим всё остальное и отдаём index.html
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
