#!/usr/bin/env python
import os
import sys

import django
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management import execute_from_command_line
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
    print(f'Superuser name: {superuser_name}')
    if not user_model.objects.filter(username=superuser_name).exists():
        call_command("createsuperuser", "--no-input")

def _execute_run_command():
    environment = os.environ.get("ENVIRONMENT", "development")
    if environment == "development":
        execute_from_command_line(sys.argv)
    else:
        gunicorn_command = f"gunicorn --timeout 600 config.wsgi:application"
        os.execvp("gunicorn", gunicorn_command.split())


if __name__ == "__main__":
    main()
