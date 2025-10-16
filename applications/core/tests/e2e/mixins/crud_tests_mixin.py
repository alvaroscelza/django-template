from factory.django import DjangoModelFactory
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from applications.core.models import UniqueNameMixin


class CRUDTestsMixin:
    factory: DjangoModelFactory
    list_url_name: str
    detail_url_name: str
    model: UniqueNameMixin
    creation_data: dict
    put_data: dict
    client: APIClient
    response = None
    object_in_database = None
    list_ordering_fields: list = None

    def test_create_ok(self):
        url = reverse(self.list_url_name)

        self.response = self.client.post(url, self.creation_data, format='json', HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_201_CREATED

    def test_create_error_not_authenticated(self):
        url = reverse(self.list_url_name)
        self.client.force_authenticate(user=None)

        self.response = self.client.post(url, self.creation_data, format='json')

        assert self.response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_ok(self):
        existing_object = self.factory.create()
        url = reverse(self.detail_url_name, args=[existing_object.id])

        self.response = self.client.delete(url)

        assert self.response.status_code == status.HTTP_204_NO_CONTENT
        result = self.model.objects.all()
        assert result.count() == 0

    def test_delete_error_not_authenticated(self):
        url = reverse(self.detail_url_name, args=[1])
        self.client.force_authenticate(user=None)

        self.response = self.client.delete(url)

        assert self.response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_ok(self):
        url = reverse(self.list_url_name)
        how_many = 5
        self.factory.create_batch(how_many)

        self.response = self.client.get(url, HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_200_OK
        assert self.response.data['count'] == how_many
        assert self.response.data['next'] is None
        assert self.response.data['previous'] is None
        assert len(self.response.data['results']) == how_many

    def test_list_ok_ordering_by_fields(self):
        self.test_list_ok()
        if self.list_ordering_fields:
            objects_in_bd = self.model.objects.all().order_by(*self.list_ordering_fields)
        else:
            objects_in_bd = self.model.objects.all()

        actual_results = self.response.data['results']

        assert len(actual_results) == len(objects_in_bd)
        for i, (api_result, db_object) in enumerate(zip(actual_results, objects_in_bd)):
            assert api_result['id'] == db_object.pk

    def test_list_error_not_authenticated(self):
        url = reverse(self.list_url_name)
        self.client.force_authenticate(user=None)

        self.response = self.client.get(url, HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_ok(self):
        self.object_in_database = self.factory.create()
        url = reverse(self.detail_url_name, args=[self.object_in_database.id])

        self.response = self.client.get(url, HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_200_OK

    def test_retrieve_error_not_authenticated(self):
        url = reverse(self.detail_url_name, args=[1])
        self.client.force_authenticate(user=None)

        self.response = self.client.get(url, HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_put_ok(self):
        self.object_in_database = self.factory.create()
        url = reverse(self.detail_url_name, args=[self.object_in_database.id])

        self.response = self.client.put(url, self.put_data, format='json', HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_200_OK
        self.object_in_database = self.model.objects.get()

    def test_put_error_not_authenticated(self):
        url = reverse(self.detail_url_name, args=[1])
        self.client.force_authenticate(user=None)

        self.response = self.client.put(url, {}, format='json', HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_patch_ok(self):
        self.object_in_database = self.factory.create()
        url = reverse(self.detail_url_name, args=[self.object_in_database.id])

        self.response = self.client.patch(url, self.put_data, format='json', HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_200_OK
        self.object_in_database = self.model.objects.get()

    def test_patch_error_not_authenticated(self):
        url = reverse(self.detail_url_name, args=[1])
        self.client.force_authenticate(user=None)

        self.response = self.client.patch(url, {}, format='json', HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_401_UNAUTHORIZED

    def list_filtering_tester(self, filtering_field, value_to_filter, is_nested_resource=False):
        self.factory.create_batch(10)
        self.factory.create_batch(5, **{filtering_field: value_to_filter})
        value_to_filter = value_to_filter.pk if is_nested_resource else value_to_filter
        url = reverse(self.list_url_name)
        url = '{}?{}={}'.format(url, filtering_field, value_to_filter)

        self.response = self.client.get(url, HTTP_ACCEPT='application/json')

        assert self.response.status_code == status.HTTP_200_OK
        assert self.response.data['count'] == 5
        assert self.response.data['next'] is None
        assert self.response.data['previous'] is None
        assert len(self.response.data['results']) == 5
