def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    if annual_rate == 0:
        return round(principal / tenure_months, 2)
    
    r = annual_rate / (12 * 100)
    denominator = (1 + r) ** tenure_months - 1
    emi = principal * r * (1 + r) ** tenure_months / denominator
    return round(emi, 2)


def calculate_credit_score(customer) -> int:
    from django.apps import apps
    from datetime import date, datetime
    
    Loan = apps.get_model('loans', 'Loan')
    loans = Loan.objects.filter(customer=customer)
    
    if not loans.exists():
        return 50
    
    total_loan_amount = sum(loan.loan_amount for loan in loans)
    if total_loan_amount > customer.approved_limit:
        return 0
    
    total_emis = sum(loan.emis_paid_on_time for loan in loans) if loans else 0
    total_emis_expected = loans.count() * 10
    on_time_ratio = total_emis / total_emis_expected if total_emis_expected > 0 else 0
    on_time_score = on_time_ratio * 35
    
    loan_count_score = min(loans.count() / 10, 1) * 20
    
    current_year = date.today().year
    loans_this_year = loans.filter(start_date__year=current_year).count()
    activity_score = min(loans_this_year / 3, 1) * 20
    
    volume_ratio = min(total_loan_amount / customer.approved_limit, 1)
    volume_score = volume_ratio * 25
    
    final_score = int(round(on_time_score + loan_count_score + activity_score + volume_score))
    return min(final_score, 100)


def check_loan_eligibility(customer, loan_amount, interest_rate, tenure) -> dict:
    from django.apps import apps
    
    Loan = apps.get_model('loans', 'Loan')
    active_loans = Loan.objects.filter(customer=customer)
    current_emi_sum = sum(loan.monthly_repayment for loan in active_loans)
    new_emi = calculate_emi(loan_amount, interest_rate, tenure)
    
    if current_emi_sum + new_emi > customer.monthly_salary * 0.5:
        return {
            'approval': False,
            'interest_rate': interest_rate,
            'corrected_interest_rate': interest_rate,
            'monthly_installment': new_emi,
            'tenure': tenure,
            'reason': 'EMI burden exceeds 50% of monthly salary',
        }
    
    credit_score = calculate_credit_score(customer)
    
    if credit_score > 50:
        corrected_rate = interest_rate
        approval = True
    elif credit_score > 30:
        corrected_rate = max(interest_rate, 12.0)
        approval = True
    elif credit_score > 10:
        corrected_rate = max(interest_rate, 16.0)
        approval = True
    else:
        corrected_rate = interest_rate
        approval = False
    
    corrected_emi = calculate_emi(loan_amount, corrected_rate, tenure)
    
    return {
        'approval': approval,
        'interest_rate': interest_rate,
        'corrected_interest_rate': corrected_rate,
        'monthly_installment': corrected_emi,
        'tenure': tenure,
        'reason': 'Credit score too low' if not approval else '',
    }
