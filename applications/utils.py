from django.db import models
from django.utils.translation import gettext_lazy as _


class UniqueNameMixin(models.Model):
    class Meta:
        abstract = True

    name = models.CharField(verbose_name=_('name'), max_length=100, unique=True)

    def __str__(self):
        return self.name
