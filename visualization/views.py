from django.http import HttpResponse
from visualization.models import Article

# Create your views here.

def collect(request):
	response = Article.collect_with_google()
	return HttpResponse(response)