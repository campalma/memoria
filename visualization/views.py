# Django stuff
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core import serializers
from datetime import date

# Models import
from visualization.models import Article, Cluster

def collect(request):
	Article.collect_with_google()
	clusters = Cluster.objects.all()
	return HttpResponse(clusters)

def visualize(request):
	clusters = Cluster.objects.all()
	return render_to_response("visualize.html", {"clusters": clusters})

def clusters_query(request):
	clusters = Cluster.objects.all().order_by("-relevancy")
	json = serializers.serialize("json", clusters)
	return HttpResponse(json, mimetype='application/json')

def cluster_news_query(request, id):
	articles = Article.objects.filter(cluster__id = id).order_by("-published_date")
	json = serializers.serialize("json", articles)
	return HttpResponse(json, mimetype='application/json')