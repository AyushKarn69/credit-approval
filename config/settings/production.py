from .base import *

DEBUG = False
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-change-this')
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
