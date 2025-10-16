from django.contrib.auth.models import AbstractUser
from django.db.models import ForeignKey, PROTECT
from django_tenants.models import TenantMixin, DomainMixin


class Domain(DomainMixin):
    pass


class Tenant(TenantMixin):
    pass


class User(AbstractUser):
    tenant = ForeignKey(Tenant, on_delete=PROTECT, null=True, blank=True)
