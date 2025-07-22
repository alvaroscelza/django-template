import os
from datetime import timedelta
from pathlib import Path

from django.utils.translation import gettext_lazy as _

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')
APP_NAME = '<<app name>>'
APP_DESCRIPTION = _('<<app description>>')
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]
BASE_DIR = Path(__file__).parent.parent
CORS_ALLOW_ALL_ORIGINS = True
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://localhost').split(',')
DATABASE_ROUTERS = ('django_tenants.routers.TenantSyncRouter',)
# TODO:  In next line, use 'django_tenants.postgresql_backend' for multi tenants.
DATABASES = {'default': {'ENGINE': 'django.db.backends.postgresql_psycopg2', 'NAME': os.getenv('DATABASE_NAME'),
                         'USER': os.getenv('DATABASE_USER'), 'PASSWORD': os.getenv('DATABASE_PASSWORD'),
                         'HOST': os.getenv('DATABASE_HOST'), 'PORT': os.getenv('DATABASE_PORT')}}
DEBUG = os.getenv('DEBUG', False)
# region INSTALLED_APPS
# TODO: keep this to use single tenant
# DJANGO_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles'
# ]
# LOCAL_APPS = [
#     'applications.apps.CoreConfig'
# ]
# EXTERNAL_APPS = [
#     'rest_framework',
#     'rest_framework_simplejwt',
#     'corsheaders',
#     'drf_spectacular',
#     'django_filters',
#     'drf_excel',
#     'debug_toolbar',
# ]
# INSTALLED_APPS = DJANGO_APPS + LOCAL_APPS + EXTERNAL_APPS
# TODO: keep this to use multi tenant
# SHARED_APPS = (
#     # Django Apps
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#
#     # External Apps
#     'django_tenants',
#     'rest_framework',
#     'rest_framework_simplejwt',
#     'corsheaders',
#     'drf_spectacular',
#     'django_filters',
#     'drf_excel',
#
#     # Internal Apps
#     'applications.apps.TenantsConfig',
# )
# TENANT_APPS = (
#     # Django Apps
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#
#     # Internal Apps
#     'applications.apps.CoreConfig',
#     'applications.apps.AccountingConfig',
#     'applications.apps.FatteningConfig',
#     'applications.apps.PregnancyConfig',
#     'applications.apps.TillageConfig',
#     'applications.apps.VaccinesConfig',
# )
# INSTALLED_APPS = list(SHARED_APPS) + \
#     [app for app in TENANT_APPS if app not in SHARED_APPS]
# endregion INSTALLED_APPS
# region Internationalization
LANGUAGE_CODE = 'es'
LANGUAGES = [('es', _('Spanish'))]
LOCALE_PATHS = [os.path.join(BASE_DIR, 'locale')]
TIME_ZONE = 'America/Montevideo'
USE_I18N = True
USE_L10N = True
USE_TZ = True
USE_DECIMAL_SEPARATOR = True
DECIMAL_SEPARATOR = ','
USE_THOUSAND_SEPARATOR = True
THOUSAND_SEPARATOR = '.'
# endregion
MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
REST_FRAMEWORK = {
    'COERCE_DECIMAL_TO_STRING': False,
    'DATETIME_FORMAT': '%Y-%m-%d %H:%M:%S.%f',
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer',
                                 'rest_framework.renderers.BrowsableAPIRenderer'],
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend',
                                'rest_framework.filters.OrderingFilter',
                                'rest_framework.filters.SearchFilter'],
    'EXCEPTION_HANDLER': 'applications.utils.exception_handler',
    'PAGE_SIZE': 10
}
ROOT_URLCONF = 'config.urls'
SECRET_KEY = os.getenv('SECRET_KEY')
SIMPLE_JWT = {'ACCESS_TOKEN_LIFETIME': timedelta(days=30)}
# region Static files (CSS, JavaScript, Images)
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static_storage')
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
# endregion
SWAGGER_SETTINGS = {
    'USE_SESSION_AUTH': False,
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    }
}
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates',
              'DIRS': [TEMPLATE_DIR],
              'APP_DIRS': True,
              'OPTIONS': {'context_processors': ['django.template.context_processors.debug',
                                                 'django.template.context_processors.request',
                                                 'django.contrib.auth.context_processors.auth',
                                                 'django.contrib.messages.context_processors.messages']}}]
TENANT_MODEL = 'tenants.Tenant'
TENANT_DOMAIN_MODEL = 'tenants.Domain'
TEST_RUNNER = 'applications.core.tests.en_test_runner.EnTestRunner'
WSGI_APPLICATION = 'config.wsgi.application'
