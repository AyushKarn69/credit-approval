from django.core.management.base import BaseCommand
from apps.ingestion.tasks import ingest_customer_data, ingest_loan_data

class Command(BaseCommand):
    help = 'Ingest customer and loan data from xlsx files'

    def handle(self, *args, **options):
        self.stdout.write('Ingesting customer data...')
        result1 = ingest_customer_data()
        self.stdout.write(result1)
        
        self.stdout.write('Ingesting loan data...')
        result2 = ingest_loan_data()
        self.stdout.write(result2)
        
        self.stdout.write(self.style.SUCCESS('Ingestion complete.'))
