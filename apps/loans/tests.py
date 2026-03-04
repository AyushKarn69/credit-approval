import pytest
from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.customers.models import Customer
from apps.loans.models import Loan
from apps.loans.credit_engine import (
    calculate_emi,
    calculate_credit_score,
    check_loan_eligibility
)


class CalculateEMITests(TestCase):
    def test_calculate_emi_standard(self):
        principal = 100000
        annual_rate = 10
        tenure_months = 12
        emi = calculate_emi(principal, annual_rate, tenure_months)
        self.assertAlmostEqual(emi, 8792.00, places=2)

    def test_calculate_emi_zero_rate(self):
        principal = 100000
        annual_rate = 0
        tenure_months = 12
        emi = calculate_emi(principal, annual_rate, tenure_months)
        self.assertEqual(emi, round(100000 / 12, 2))


class CalculateCreditScoreTests(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            customer_id=1,
            first_name='John',
            last_name='Doe',
            age=30,
            phone_number=9999999999,
            monthly_salary=50000,
            approved_limit=1800000,
        )

    def test_credit_score_no_loans(self):
        score = calculate_credit_score(self.customer)
        self.assertEqual(score, 50)

    def test_credit_score_debt_exceeds_limit(self):
        Loan.objects.create(
            loan_id=1,
            customer=self.customer,
            loan_amount=2000000,
            tenure=12,
            interest_rate=10,
            monthly_repayment=8792.00,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
        )
        score = calculate_credit_score(self.customer)
        self.assertEqual(score, 0)


class CheckLoanEligibilityTests(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            customer_id=1,
            first_name='John',
            last_name='Doe',
            age=30,
            phone_number=9999999999,
            monthly_salary=50000,
            approved_limit=1800000,
        )

    def test_eligibility_approved_above_50(self):
        result = check_loan_eligibility(self.customer, 100000, 10, 12)
        self.assertTrue(result['approval'])
        self.assertEqual(result['interest_rate'], 10)
        self.assertEqual(result['corrected_interest_rate'], 10)

    def test_eligibility_rate_corrected_slab_30_50(self):
        Loan.objects.create(
            loan_id=1,
            customer=self.customer,
            loan_amount=500000,
            tenure=12,
            interest_rate=10,
            monthly_repayment=4500.00,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
            emis_paid_on_time=6,
        )
        result = check_loan_eligibility(self.customer, 50000, 8, 12)
        self.assertTrue(result['approval'])
        self.assertGreaterEqual(result['corrected_interest_rate'], 12.0)

    def test_eligibility_emi_burden_denied(self):
        Loan.objects.create(
            loan_id=1,
            customer=self.customer,
            loan_amount=500000,
            tenure=12,
            interest_rate=10,
            monthly_repayment=22000.00,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
        )
        result = check_loan_eligibility(self.customer, 100000, 10, 12)
        self.assertFalse(result['approval'])


@pytest.mark.django_db
class APIEndpointsTests:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.customer = Customer.objects.create(
            customer_id=1,
            first_name='John',
            last_name='Doe',
            age=30,
            phone_number=9999999999,
            monthly_salary=50000,
            approved_limit=1800000,
        )

    def test_register_success(self):
        response = self.client.post('/register', {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'age': 28,
            'monthly_income': 60000,
            'phone_number': 8888888888,
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['customer_id'] is not None
        assert response.data['approved_limit'] == 2160000

    def test_register_missing_fields(self):
        response = self.client.post('/register', {
            'first_name': 'Jane',
            'last_name': 'Smith',
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_check_eligibility_customer_not_found(self):
        response = self.client.post('/check-eligibility', {
            'customer_id': 999,
            'loan_amount': 100000,
            'interest_rate': 10,
            'tenure': 12,
        })
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_loan_approved(self):
        response = self.client.post('/create-loan', {
            'customer_id': 1,
            'loan_amount': 100000,
            'interest_rate': 10,
            'tenure': 12,
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['loan_approved'] is True
        assert response.data['loan_id'] is not None

    def test_create_loan_denied(self):
        Loan.objects.create(
            loan_id=100,
            customer=self.customer,
            loan_amount=500000,
            tenure=12,
            interest_rate=10,
            monthly_repayment=22000.00,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
        )
        response = self.client.post('/create-loan', {
            'customer_id': 1,
            'loan_amount': 100000,
            'interest_rate': 10,
            'tenure': 12,
        })
        assert response.status_code == status.HTTP_200_OK
        assert response.data['loan_approved'] is False
        assert response.data['loan_id'] is None

    def test_view_loan_success(self):
        loan = Loan.objects.create(
            loan_id=1,
            customer=self.customer,
            loan_amount=100000,
            tenure=12,
            interest_rate=10,
            monthly_repayment=8792.00,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
        )
        response = self.client.get(f'/view-loan/{loan.loan_id}')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['loan_id'] == 1
        assert 'customer' in response.data

    def test_view_loan_not_found(self):
        response = self.client.get('/view-loan/999')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_view_loans_by_customer(self):
        Loan.objects.create(
            loan_id=1,
            customer=self.customer,
            loan_amount=100000,
            tenure=12,
            interest_rate=10,
            monthly_repayment=8792.00,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
        )
        response = self.client.get(f'/view-loans/{self.customer.customer_id}')
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert len(response.data) == 1

