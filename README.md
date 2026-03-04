# Credit Approval System REST API
# A complete Django+DRF based credit scoring and loan approval system with Celery background workers

## Project Overview
A REST API for credit approval that calculates credit scores, checks eligibility, and manages loans using a credit scoring engine. Built with Django, PostgreSQL, Redis, and Celery.

## How to Run

### Prerequisites
- Docker and Docker Compose installed

### Quick Start
```bash
docker-compose up --build
```

All services (Django web, PostgreSQL, Redis, Celery worker) will start automatically. The application will:
1. Run database migrations
2. Ingest data from Excel files
3. Start the API server on http://localhost:8000

## API Endpoints

### 1. Register Customer
**POST /register**

Request:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "age": 30,
  "monthly_income": 50000,
  "phone_number": 9999999999
}
```

Response (201):
```json
{
  "customer_id": 1,
  "name": "John Doe",
  "age": 30,
  "monthly_income": 50000,
  "approved_limit": 1800000,
  "phone_number": 9999999999
}
```

### 2. Check Loan Eligibility
**POST /check-eligibility**

Request:
```json
{
  "customer_id": 1,
  "loan_amount": 100000,
  "interest_rate": 10,
  "tenure": 12
}
```

Response (200):
```json
{
  "customer_id": 1,
  "approval": true,
  "interest_rate": 10,
  "corrected_interest_rate": 10,
  "tenure": 12,
  "monthly_installment": 8792.00
}
```

### 3. Create Loan
**POST /create-loan**

Request:
```json
{
  "customer_id": 1,
  "loan_amount": 100000,
  "interest_rate": 10,
  "tenure": 12
}
```

Response when approved (201):
```json
{
  "loan_id": 1,
  "customer_id": 1,
  "loan_approved": true,
  "message": "",
  "monthly_installment": 8792.00
}
```

Response when denied (200):
```json
{
  "loan_id": null,
  "customer_id": 1,
  "loan_approved": false,
  "message": "EMI burden exceeds 50% of monthly salary",
  "monthly_installment": 8792.00
}
```

### 4. View Specific Loan
**GET /view-loan/<loan_id>**

Response (200):
```json
{
  "loan_id": 1,
  "customer": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": 9999999999,
    "age": 30
  },
  "loan_amount": 100000,
  "interest_rate": 10,
  "monthly_repayment": 8792.00,
  "tenure": 12
}
```

### 5. View Customer Active Loans
**GET /view-loans/<customer_id>**

Response (200):
```json
[
  {
    "loan_id": 1,
    "loan_amount": 100000,
    "interest_rate": 10,
    "monthly_repayment": 8792.00,
    "repayments_left": 10
  }
]
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DJANGO_SECRET_KEY | Django secret key | dev-key |
| DJANGO_DEBUG | Debug mode | True |
| DJANGO_SETTINGS_MODULE | Settings module | config.settings.development |
| DB_NAME | PostgreSQL database name | credit_db |
| DB_USER | PostgreSQL user | credit_user |
| DB_PASSWORD | PostgreSQL password | credit_pass |
| DB_HOST | PostgreSQL host | db |
| DB_PORT | PostgreSQL port | 5432 |
| REDIS_URL | Redis connection URL | redis://redis:6379/0 |

## Running Tests
```bash
docker-compose exec web pytest
```

## Project Structure
- `config/` - Django settings and configuration
- `apps/customers/` - Customer registration and management
- `apps/loans/` - Loan creation and management with credit engine
- `apps/ingestion/` - Excel data ingestion via Celery
- `apps/common/` - Shared utilities and exception handling
- `data/` - Excel files for data ingestion

## Credit Scoring Logic
- **On-time EMI payments**: 35 points
- **Loan experience**: 20 points
- **Recent loan activity**: 20 points
- **Loan volume vs approved limit**: 25 points
- **Total score**: 0-100

Interest rate adjustment based on credit score:
- Score > 50: Original rate
- Score 30-50: Minimum 12%
- Score 10-30: Minimum 16%
- Score ≤ 10: Loan denied

## Quick Reference Commands

### Docker Commands
```bash
docker compose up --build              # Start all services
docker compose down                    # Stop all services
docker compose logs web                # View web server logs
docker compose logs celery             # View worker logs
docker compose exec web bash           # Open container shell
```

### Django Commands
```bash
docker compose exec web python manage.py migrate           # Run migrations
docker compose exec web python manage.py makemigrations   # Create migrations
docker compose exec web python manage.py shell            # Django shell
docker compose exec web python manage.py createsuperuser  # Create admin
```

### Testing
```bash
docker compose exec web pytest                    # Run all tests
docker compose exec web pytest apps/loans/tests.py        # Run specific test
docker compose exec web pytest -v                 # Verbose output
docker compose exec web pytest --cov=apps         # Coverage report
```

### Database
```bash
docker compose exec db psql -U credit_user -d credit_db   # PostgreSQL CLI
\dt                                    # List tables
\d app_customers_customer              # Describe table
SELECT COUNT(*) FROM app_customers_customer;  # Count records
```

### Clean Up
```bash
docker compose down -v                 # Remove volumes too
docker system prune -a                 # Clean all docker resources
docker volume prune                    # Remove unused volumes
```
