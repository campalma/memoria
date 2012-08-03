from django.http import HttpResponse
from visualization.models import Article, Cluster
from django.shortcuts import render_to_response

# Create your views here.

def collect(request):
	Article.collect_with_google()
	clusters = Cluster.objects.all()
	return HttpResponse(clusters)

def visualize(request):
	clusters = Cluster.objects.all()
	return render_to_response("visualize.html", {"clusters": clusters})
