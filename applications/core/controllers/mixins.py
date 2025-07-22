from abc import ABC

from rest_framework.viewsets import ModelViewSet


class ReadableWritableModelController(ModelViewSet, ABC):
    writable_serializer = None
    readable_serializer = None
    filterset_fields = '__all__'

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return self.readable_serializer
        return self.writable_serializer
