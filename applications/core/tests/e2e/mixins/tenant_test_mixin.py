from datetime import date

from django.contrib.auth import get_user_model
from django.db import connection
from django_tenants.test.cases import TenantTestCase
from django_tenants.test.client import TenantClient
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from applications.tenants.models import Tenant


class DrfTenantsClient(TenantClient, APIClient):
    def generic(self, *args, **kwargs):
        request = super().generic(*args, **kwargs)
        connection.set_tenant(self.tenant)
        return request


class DrfTenantsTestCase(APITestCase, TenantTestCase):
    @classmethod
    def setUpClass(cls):
        Tenant.objects.get_or_create(schema_name='public', defaults={'schema_name': 'public'})
        super().setUpClass()
    
    def setUp(self):
        super().setUp()
        self.client = DrfTenantsClient(self.tenant)
        self._login()
        # self.client.login()

    def _login(self):
        birthdate = date(1990, 1, 1)
        user = get_user_model().objects.create_user('testuser', 'test@example.com', 'testpass123', birthdate=birthdate,
            life_expectancy=80, tenant=self.tenant)
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
