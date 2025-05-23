from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/traits/', include('traits.urls')),
    path('api/annotation/', include('annotation.urls')),
    path('api/filtrate/', include('filtrate.urls')),
]

# Обслуживание медиафайлов
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# React SPA для остальных маршрутов, исключая /media/
urlpatterns += [
    re_path(r'^(?!media/).*$', TemplateView.as_view(template_name='index.html')),
]