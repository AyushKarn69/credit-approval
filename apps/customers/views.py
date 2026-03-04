from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Customer
from .serializers import RegisterCustomerSerializer

class RegisterCustomerView(APIView):
    def post(self, request):
        serializer = RegisterCustomerSerializer(data=request.data)
        if serializer.is_valid():
            approved_limit = round(36 * serializer.validated_data['monthly_income'] / 100000) * 100000
            customer = Customer.objects.create(
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
                age=serializer.validated_data['age'],
                phone_number=serializer.validated_data['phone_number'],
                monthly_salary=serializer.validated_data['monthly_income'],
                approved_limit=approved_limit,
            )
            return Response({
                'customer_id': customer.customer_id,
                'name': f"{customer.first_name} {customer.last_name}",
                'age': customer.age,
                'monthly_income': customer.monthly_salary,
                'approved_limit': customer.approved_limit,
                'phone_number': customer.phone_number,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
