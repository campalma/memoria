from django.db import models
from apis import GoogleNews
from datetime import datetime
from time import strptime
from apis import Placemaker

class Continent(models.Model):
	name = models.CharField(max_length=100)

class Location(models.Model):
	name = models.CharField(max_length=100)

class Topic(models.Model):
	name = models.CharField(max_length=100)
	short_name = models.CharField(max_length=500)
	color = models.CharField(max_length=7)

	@staticmethod
	def get_excluded_topics(get_request):
		topics = Topic.objects.all()
		excluded = []
		for t in topics:
			if not (t.short_name in get_request):
				excluded.append(t)
		return excluded

class Cluster(models.Model):
	image = models.URLField(max_length=500)
	relevancy = models.IntegerField()
	is_local = models.BooleanField()
	topic = models.ForeignKey(Topic)
	location = models.ManyToManyField(Location)
	continent_location = models.ManyToManyField(Continent)
	added_date = models.DateTimeField(auto_now_add=True)
	date = models.DateTimeField()

class Article(models.Model):
	title = models.CharField(max_length=500)
	url = models.URLField(max_length=500)
	location = models.CharField(max_length=200)
	publisher = models.CharField(max_length=200)
	content = models.CharField(max_length=1000)
	published_date = models.DateTimeField()
	added_date = models.DateTimeField(auto_now_add=True)
	cluster = models.ForeignKey(Cluster)

	@staticmethod
	def collect_with_google():
		google_news = GoogleNews.collect()
		for google_article in google_news:
			cluster_content = ""
			cluster = Cluster()
			if("image" in google_article):
				cluster.image = google_article["image"]["url"]
			else:
				cluster.image = "http://panhandletickets.com/images/not_available.jpg"
			if("relatedStories" in google_article):
				cluster.relevancy = (len(google_article["relatedStories"]) + 1)*100/google_article["page"]
			else:
				cluster.relevancy = 100/google_article["page"]
			cluster.topic = Topic.objects.get(name=google_article["topic"])
			cluster.is_local = False
			cluster.date = format_date(google_article["publishedDate"])
			cluster.save()

			article = Article()
			article.title = google_article["titleNoFormatting"]
			article.url = google_article["unescapedUrl"]
			article.location = google_article["location"]
			article.publisher = google_article["publisher"]
			cluster_content += google_article["titleNoFormatting"] + " "
			if "content" in google_article:
				article.content = google_article["content"]
				cluster_content += google_article["content"]+ " "
			else:
				article.content = ""
			article.published_date = format_date(google_article["publishedDate"])
			article.cluster = cluster
			article.save()
			if("relatedStories" in google_article):
				article_related_stories = google_article["relatedStories"]
				for related in article_related_stories:
					article = Article()
					article.title = related["titleNoFormatting"]
					article.url = related["unescapedUrl"]
					article.location = related["location"]
					article.publisher = related["publisher"]
					if "content" in related:
						article.content = related["content"]
						cluster_content += related["content"]+ " "
					else:
						article.content = ""
					article.published_date = format_date(related["publishedDate"])
					article.cluster = cluster
					article.save()
			cluster.save()
			cluster_countries = Placemaker.get_countries_from_string(cluster_content)
			for country in cluster_countries:
				try:
					l = Location.objects.get(name=country)
				except Location.DoesNotExist:
					l = Location()
					l.name = country
					l.save()
				cluster.location.add(l)

			cluster_continents = Placemaker.get_continents_from_countries(cluster_countries)
			for continent in cluster_continents:
				try:
					c = Continent.objects.get(name=continent)
				except Continent.DoesNotExist:
					c = Continent()
					c.name = continent
					c.save()
				cluster.continent_location.add(c)
			cluster.save()

def format_date(google_date):
	t = strptime(google_date[:-6], "%a, %d %b %Y %H:%M:%S")
	return datetime(*t[:6]).strftime('%Y-%m-%d %H:%M:%S')
