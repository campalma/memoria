# Django stuff
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core import serializers
from json import dumps
from datetime import date

# Models import
from visualization.models import Article, Cluster, Topic, Continent

CLUSTERS_TO_VISUALIZE = 100

# Collect news using some api
def collect(request):
	Article.collect_with_google()

# Visualize clusters
def visualize(request):
	return render_to_response("visualize.html", {})

# Ajax query: get last 50 news
def clusters_query(request):
	excluded = Topic.get_excluded_topics(request.GET);
	clusters = Cluster.objects.all()
	for e in excluded:
		clusters = clusters.exclude(topic=e)
	continent_display = request.GET["display_continent"];
	if(continent_display=="Unknown"):
		continent_display = None
	if(continent_display!="All"):
		clusters = clusters.filter(continent_location__name=continent_display)
	if(request.GET["min_date"]!=""):
		clusters = clusters.exclude(date__lte = request.GET["min_date"])
		print request.GET["min_date"]
	if(request.GET["max_date"]!=""):
		clusters = clusters.exclude(date__gte = request.GET["max_date"])
	clusters = sorted(clusters.order_by("-date")[:CLUSTERS_TO_VISUALIZE], key=lambda x:x.relevancy, reverse=True)
	json = serializers.serialize("json", clusters)
	return HttpResponse(json, mimetype='application/json')

# Ajax query: get news that belongs to a cluster
def cluster_news_query(request, id):
	articles = Article.objects.filter(cluster__id = id).order_by("-published_date")
	json = serializers.serialize("json", articles)
	return HttpResponse(json, mimetype='application/json')

# Ajax query: get last 50 news before max_date
def cluster_query_by_date(request):
	max_date = request.GET["date"]
	clusters = Cluster.objects.filter(date__lte = max_date).order_by("date")[:CLUSTERS_TO_VISUALIZE]
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
	json = dumps(response)
	return HttpResponse(json, mimetype='application/json')

def locations_query(request, cluster_id):
	cluster = Cluster.objects.get(id=cluster_id)
	locations = cluster.location.all()
	json = serializers.serialize("json", locations)
	return HttpResponse(json, mimetype='application/json')
