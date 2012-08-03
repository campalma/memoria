from django.http import HttpResponse
from visualization.models import Article, Cluster

# Create your views here.

def collect(request):
	Article.collect_with_google()
	clusters = Cluster.objects.all()
	return HttpResponse(clusters)

def visualize(request):
	clusters = Cluster.objects.all()
	return HttpResponse(clusters)
