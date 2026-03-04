from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Loan
from .serializers import CheckEligibilitySerializer, CreateLoanSerializer, LoanDetailSerializer
from django.apps import apps

class CheckEligibilityView(APIView):
    def post(self, request):
        serializer = CheckEligibilitySerializer(data=request.data)
        if serializer.is_valid():
            customer_id = serializer.validated_data['customer_id']
            Customer = apps.get_model('customers', 'Customer')
            try:
                customer = Customer.objects.get(customer_id=customer_id)
            except Customer.DoesNotExist:
                return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
            
            loan_amount = serializer.validated_data['loan_amount']
            interest_rate = serializer.validated_data['interest_rate']
            tenure = serializer.validated_data['tenure']
            
            from .credit_engine import check_loan_eligibility
            result = check_loan_eligibility(customer, loan_amount, interest_rate, tenure)
            
            return Response({
                'customer_id': customer_id,
                'approval': result['approval'],
                'interest_rate': result['interest_rate'],
                'corrected_interest_rate': result['corrected_interest_rate'],
                'tenure': result['tenure'],
                'monthly_installment': result['monthly_installment'],
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateLoanView(APIView):
    def post(self, request):
        serializer = CreateLoanSerializer(data=request.data)
        if serializer.is_valid():
            customer_id = serializer.validated_data['customer_id']
            Customer = apps.get_model('customers', 'Customer')
            try:
                customer = Customer.objects.get(customer_id=customer_id)
            except Customer.DoesNotExist:
                return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
            
            loan_amount = serializer.validated_data['loan_amount']
            interest_rate = serializer.validated_data['interest_rate']
            tenure = serializer.validated_data['tenure']
            
            from .credit_engine import check_loan_eligibility, calculate_emi
            result = check_loan_eligibility(customer, loan_amount, interest_rate, tenure)
            
            if result['approval']:
                from datetime import date
                from dateutil.relativedelta import relativedelta
                
                start_date = date.today()
                end_date = start_date + relativedelta(months=tenure)
                
                loan = Loan.objects.create(
                    customer=customer,
                    loan_amount=loan_amount,
                    tenure=tenure,
                    interest_rate=result['corrected_interest_rate'],
                    monthly_repayment=result['monthly_installment'],
                    start_date=start_date,
                    end_date=end_date,
                )
                return Response({
                    'loan_id': loan.loan_id,
                    'customer_id': customer_id,
                    'loan_approved': True,
                    'message': '',
                    'monthly_installment': loan.monthly_repayment,
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'loan_id': None,
                    'customer_id': customer_id,
                    'loan_approved': False,
                    'message': result.get('reason', 'Loan denied'),
                    'monthly_installment': result['monthly_installment'],
                }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ViewLoanView(APIView):
    def get(self, request, loan_id):
        try:
            loan = Loan.objects.get(loan_id=loan_id)
        except Loan.DoesNotExist:
            return Response({'error': 'Loan not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = LoanDetailSerializer(loan)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ViewCustomerLoansView(APIView):
    def get(self, request, customer_id):
        Customer = apps.get_model('customers', 'Customer')
        try:
            customer = Customer.objects.get(customer_id=customer_id)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        from datetime import date
        active_loans = Loan.objects.filter(
            customer=customer,
            end_date__gte=date.today()
        )
        
        loans_data = []
        for loan in active_loans:
            days_left = (loan.end_date - date.today()).days
            repayments_left = max(0, (days_left + 15) // 30)
            
            loans_data.append({
                'loan_id': loan.loan_id,
                'loan_amount': loan.loan_amount,
                'interest_rate': loan.interest_rate,
                'monthly_repayment': loan.monthly_repayment,
                'repayments_left': repayments_left,
            })
        
        return Response(loans_data, status=status.HTTP_200_OK)
