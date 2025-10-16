from django.db.models import Model, CharField


class CleanModelMixin(Model):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(**kwargs)


class UniqueNameMixin(CleanModelMixin):
    class Meta:
        abstract = True

    name = CharField(max_length=75, unique=True)
