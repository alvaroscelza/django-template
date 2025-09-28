#!/usr/bin/env python
import os
from datetime import date

import django
from django.contrib.auth import get_user_model
from django.core.management import call_command
from dotenv import load_dotenv

def main():
    load_dotenv()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()  # Needed for migrating and createsuperuser
    call_command("makemigrations", interactive=False)
    call_command("migrate", interactive=False)
    call_command("collectstatic", "--no-input")
    _create_superuser_if_non_existent()
    _execute_run_command()

def _create_superuser_if_non_existent():
    user_model = get_user_model()
    superuser_name = os.environ.get("DJANGO_SUPERUSER_USERNAME")
    if not user_model.objects.filter(username=superuser_name).exists():
        superuser_email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        superuser_password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        # noinspection PyUnresolvedReferences
        create_superuser = user_model.objects.create_superuser
        default_birthdate = date(1990, 1, 1)
        create_superuser(username=superuser_name, email=superuser_email, password=superuser_password,
                         birthdate=default_birthdate, life_expectancy=80)

def _execute_run_command():
    gunicorn_command = f"gunicorn --timeout 600 config.wsgi:application"
    os.execvp("gunicorn", gunicorn_command.split())

if __name__ == "__main__":
    main()
