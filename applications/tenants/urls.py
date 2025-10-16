from rest_framework.routers import DefaultRouter

from applications.tenants.controllers import GoogleAuthController

router = DefaultRouter()
router.register(r'auth/google', GoogleAuthController, basename='google-auth')
urlpatterns = router.urls
