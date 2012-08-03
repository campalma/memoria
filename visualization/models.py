from django.db import models

class Cluster(models.Model):
	image = models.URLField(max_length=500)
	relevancy = models.IntegerField()
	is_local = models.BooleanField()
	location = models.CharField(max_length=200)
	continent_location = models.CharField(max_length=100)
	added_date = models.DateTimeField(auto_now_add=True)
	date = models.DateTimeField()

class Article(models.Model):
	title = models.CharField(max_length=500)
	url = models.URLField(max_length=500)
	category = models.CharField(max_length=100)
	location = models.CharField(max_length=200)
	publisher = models.CharField(max_length=200)
	content = models.CharField(max_length=1000)
	published_date = models.DateTimeField()
	added_date = models.DateTimeField(auto_now_add=True)
	cluster = models.ForeignKey(Cluster)
