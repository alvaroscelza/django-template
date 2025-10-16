from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django_tenants.admin import TenantAdminMixin

from applications.tenants.models import Tenant, User


@admin.register(Tenant)
class TenantAdmin(TenantAdminMixin, admin.ModelAdmin):
    pass


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Tenant Information', {'fields': ('tenant',)}),
        ('Personal Information', {'fields': ('birthdate', 'life_expectancy')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Tenant Information', {'fields': ('tenant',)}),
        ('Personal Information', {'fields': ('birthdate', 'life_expectancy')}),
    )
    list_display = BaseUserAdmin.list_display + ('tenant', 'birthdate', 'life_expectancy', 'age')
    list_filter = BaseUserAdmin.list_filter + ('tenant',)
