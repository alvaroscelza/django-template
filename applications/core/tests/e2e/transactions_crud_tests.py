from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from applications.core.models import Transaction
from applications.core.tests.e2e.mixins.crud_tests_mixin import CRUDTestsMixin
from applications.core.tests.e2e.mixins.tenant_test_mixin import DrfTenantsTestCase
from applications.core.tests.factories.accounts_factories import AccountsFactory
from applications.core.tests.factories.concepts_factories import ConceptsFactory
from applications.core.tests.factories.month_factories import MonthsFactory
from applications.core.tests.factories.transactions_factories import TransactionsFactory


class TransactionTests(DrfTenantsTestCase, CRUDTestsMixin):
    factory = TransactionsFactory
    list_url_name = 'transactions-list'
    detail_url_name = 'transactions-detail'
    model = Transaction
    list_ordering_fields = ['-month__starting_date', '-id']
    creation_data = {'amount': 100.50, 'detail': 'Test transaction', 'account': None, 'concept': None, 'month': None}
    put_data = {'amount': 200.75, 'detail': 'Updated transaction', 'account': None, 'concept': None, 'month': None}
    client: APIClient
    user: get_user_model() = None

    def setUp(self):
        super().setUp()
        self.account = AccountsFactory.create()
        self.concept = ConceptsFactory.create()
        self.month = MonthsFactory.create()
        self.creation_data.update({'account': self.account.pk, 'concept': self.concept.pk, 'month': self.month.pk})
        self.put_data.update({'account': self.account.pk, 'concept': self.concept.pk, 'month': self.month.pk})

    def test_create_transaction_without_concept(self):
        transaction_data = self.creation_data.copy()
        transaction_data.pop('concept')
        url = reverse('transactions-list')

        response = self.client.post(url, transaction_data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert Transaction.objects.count() == 1
        transaction = Transaction.objects.first()
        assert transaction.concept is None

    def test_create_transaction_validation_errors(self):
        invalid_data = {'amount': 'invalid_amount'}
        url = reverse('transactions-list')

        response = self.client.post(url, invalid_data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Transaction.objects.count() == 0

    def test_transaction_filtering_by_account(self):
        other_account = AccountsFactory()
        TransactionsFactory(account=self.account)
        TransactionsFactory(account=other_account)
        url = reverse('transactions-list')
        
        response = self.client.get(url, {'account': self.account.pk})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['account']['id'] == self.account.pk

    def test_transaction_filtering_by_concept(self):
        other_concept = ConceptsFactory()
        TransactionsFactory(concept=self.concept)
        TransactionsFactory(concept=other_concept)
        url = reverse('transactions-list')
        
        response = self.client.get(url, {'concept': self.concept.pk})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['concept']['id'] == self.concept.pk

    def test_transaction_filtering_by_month(self):
        other_month = MonthsFactory()
        TransactionsFactory(month=self.month)
        TransactionsFactory(month=other_month)
        url = reverse('transactions-list')
        
        response = self.client.get(url, {'month': self.month.pk})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['month']['id'] == self.month.pk

    def test_transaction_ordering(self):
        TransactionsFactory(amount=Decimal('100.00'))
        TransactionsFactory(amount=Decimal('200.00'))
        url = reverse('transactions-list')
        
        response = self.client.get(url, {'ordering': 'amount'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
        assert response.data['results'][0]['amount'] == 100.00
        assert response.data['results'][1]['amount'] == 200.00

    def test_transaction_pagination(self):
        TransactionsFactory.create_batch(25)
        url = reverse('transactions-list')
        
        response = self.client.get(url, {'page_size': 10})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 10
        assert 'count' in response.data
        assert 'next' in response.data
        assert 'previous' in response.data
