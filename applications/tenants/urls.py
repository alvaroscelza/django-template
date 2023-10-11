from rest_framework.routers import DefaultRouter

from applications.tenants.views.organizations_view import OrganizationsView

router = DefaultRouter()
router.register(r'organizations', OrganizationsView, basename='organizations')
urlpatterns = router.urls
