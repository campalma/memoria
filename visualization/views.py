# Django stuff
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core import serializers
import json
from datetime import date

# Models import
from visualization.models import Article, Cluster, Topic, Continent

# Collect news using some api
def collect(request):
	Article.collect_with_google()
	clusters = Cluster.objects.all()
	return HttpResponse(clusters)

# Visualize clusters
def visualize(request):
	return render_to_response("visualize.html", {})

# Ajax query: get last 50 news
def clusters_query(request):
	clusters = Cluster.objects.all().order_by("-date")[:50]
	json = serializers.serialize("json", clusters)
	return HttpResponse(json, mimetype='application/json')

# Ajax query: get news that belongs to a cluster
def cluster_news_query(request, id):
	articles = Article.objects.filter(cluster__id = id).order_by("-published_date")
	json = serializers.serialize("json", articles)
	return HttpResponse(json, mimetype='application/json')

# Ajax query: get last 50 news before max_date
def cluster_query_by_date(request):
	print "adsfasdfasfaf"
	max_date = request.GET["date"]
	clusters = Cluster.objects.filter(date__lte = max_date).order_by("date")[:50]
	json = serializers.serialize("json", clusters)
	return HttpResponse(json, mimetype='application/json')

def get_topics(request):
	topics = Topic.objects.all()
	json = serializers.serialize("json", topics)
	return HttpResponse(json, mimetype='application/json')

def get_continents(request):
	continents = Continent.objects.all()
	response = {}
	for continent in continents:
		response[continent.id] = continent.name
	response = json.dumps(response)
	return HttpResponse(response, mimetype='application/json')