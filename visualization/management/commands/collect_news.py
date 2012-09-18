from visualization.views import collect
from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
	args = 'none'
	help = 'Task for collecting news'

	def handle(self, *args, **options):
		request = ""
		collect(request)
		self.stdout.write('Successfully collected news')