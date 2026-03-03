from django.db import models

class Loan(models.Model):
    loan_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey('customers.Customer', on_delete=models.PROTECT, related_name='loans')
    loan_amount = models.FloatField()
    tenure = models.IntegerField()
    interest_rate = models.FloatField()
    monthly_repayment = models.FloatField()
    emis_paid_on_time = models.IntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        app_label = 'loans'

    def __str__(self):
        return f"Loan {self.loan_id} - Customer {self.customer_id}"
