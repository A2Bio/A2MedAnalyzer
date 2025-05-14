import os
from pathlib import Path

# --- Основные настройки ---
BASE_DIR = Path(__file__).resolve().parent.parent


# Устанавливаем порт из переменной окружения, если она задана
PORT = os.environ.get('PORT', 8000)

SECRET_KEY = 'django-insecure-1y6@jhdj+-dbj*fa-v=qt!as*n$tu($ie^8n=ib1&lwi110)$2'

DEBUG = False

ALLOWED_HOSTS = [
    'a2medanalyzer.onrender.com',  # Публичный домен
    'localhost',  # Локальный хост для разработки
    '127.0.0.1',  # Локальный хост для разработки
    ]

# --- Приложения ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Приложения
    'gwas_api',
    'annotation',
    'visualization',
    'rest_framework',
    'corsheaders',  # frontend на React
]

# --- Middleware ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# --- Шаблоны (если не используешь — можно оставить как есть) ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, '../frontend/build')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


WSGI_APPLICATION = 'backend.wsgi.application'

# --- База данных ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# --- Пароли ---
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# --- Язык и время ---
LANGUAGE_CODE = 'ru-ru'

TIME_ZONE = 'Europe/Moscow'

USE_I18N = True
USE_TZ = True

# --- Статические файлы ---
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, '../frontend/build/static'),  # путь к React-статике
]
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.FileSystemStorage'


# --- Ключ по умолчанию ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- CORS (frontend отдельно) ---
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://a2medanalyzer.onrender.com',  # Публичный фронт
]

# Дополнительные настройки для работы на продакшн-среде:
CSRF_TRUSTED_ORIGINS = [
    'https://a2medanalyzer.onrender.com',
]