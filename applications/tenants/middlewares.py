from django.db import connection
from django_tenants.middleware.main import TenantMainMiddleware
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import Tenant


class UserTenantMiddleware(TenantMainMiddleware):
    def process_request(self, request):
        if self._requires_public(request):
            return self._setup_public_tenant()
        return self._setup_user_tenant(request)

    def _requires_public(self, request):
        if self._is_public_path(request.path):
            return True
        user = self._get_user_from_jwt(request)
        if user is None:
            return True
        request.user = user
        if self._is_public_admin(user):
            return True
        return False

    @staticmethod
    def _is_public_path(path):
        return (path.startswith('/admin/') or
                path.startswith('/healthcheck/') or
                path.startswith('/tenants/auth/'))

    @staticmethod
    def _is_public_admin(user):
        return user.tenant is None

    @staticmethod
    def _setup_public_tenant():
        tenant, _ = Tenant.objects.get_or_create(schema_name='public')
        connection.set_tenant(tenant)
        return None

    @staticmethod
    def _get_user_from_jwt(request):
        try:
            jwt_auth = JWTAuthentication()
            auth_result = jwt_auth.authenticate(request)
            if auth_result is not None:
                user, token = auth_result
                return user
        except (InvalidToken, TokenError):
            pass
        return None

    @staticmethod
    def _setup_user_tenant(request):
        request.tenant = request.user.tenant
        connection.set_tenant(request.tenant)
        return None
