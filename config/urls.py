from django.conf import settings
from django.conf.urls.i18n import i18n_patterns
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.utils.translation import gettext_lazy as _

urlpatterns = i18n_patterns(path('admin/', admin.site.urls), prefix_default_language=False)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

admin.site.site_header = '<<Project Name>>'
admin.site.index_title = _('<<Project description>>')
admin.site.site_title = '<<Project Name>>'
