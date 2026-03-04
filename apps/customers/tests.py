import pytest
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.customers.models import Customer


class RegisterCustomerTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_success(self):
        response = self.client.post('/register', {
            'first_name': 'John',
            'last_name': 'Doe',
            'age': 30,
            'monthly_income': 50000,
            'phone_number': 9999999999,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['customer_id'], 1)
        self.assertEqual(response.data['approved_limit'], 1800000)

    def test_register_missing_fields(self):
        response = self.client.post('/register', {
            'first_name': 'John',
            'last_name': 'Doe',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_invalid_age(self):
        response = self.client.post('/register', {
            'first_name': 'John',
            'last_name': 'Doe',
            'age': 150,
            'monthly_income': 50000,
            'phone_number': 9999999999,
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_invalid_income(self):
        response = self.client.post('/register', {
            'first_name': 'John',
            'last_name': 'Doe',
            'age': 30,
            'monthly_income': -5000,
            'phone_number': 9999999999,
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

