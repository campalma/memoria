import urllib2
import simplejson
from time import sleep

API_URL = "http://ajax.googleapis.com/ajax/services/search/news?v=%(version)s&rsz=%(rsz)s&topic=%(topic)s&start=%(start)s&ned=%(ned)s"
RSZ = "8"
VERSION = "1.0"

TOPICS = {
	"h": "Top Headlines",
	"w": "World",
	"b": "Business",
	"n": "Nation",
	"t": "Science and Technology",
	"el": "Elections",
	"p": "Politics",
	"e": "Entertainment",
	"s": "Sports",
	"m": "Health"
}

#ZONES = ["us"]#, "uk"]#, "au", "es", "es_cl", "es_ar"]
#ZONES = ["uk"]
#ZONES = ["es"]
#ZONES = ["au"]
#ZONES = ["es_ar"]
ZONES = ["en_za"]

def collect():
	result = []
	for zone in ZONES:
		print "Zone: "+zone
		for topic,v in TOPICS.iteritems():
			print "Topic: "+v
			result.extend(collect_all_news_from_topic(topic, zone))
	return result

def collect_all_news_from_topic(topic_key, zone):
	results = []
	collected_titles = []
	starts = get_topic_starts(topic_key, zone)
	for start in starts:
		print "Start: "+start
		url = API_URL % {"version": VERSION, "rsz": RSZ, "topic": topic_key, "start": start, "ned": zone}
		json = urllib2.urlopen(url).read()
		api_result = simplejson.loads(json)
		news = api_result["responseData"]["results"]
		for article in news:
			if not (article["titleNoFormatting"] in collected_titles):
				article["topic"] = TOPICS[topic_key]
				article["page"] = int(start)+1
				results.append(article)
				collected_titles.append(article["titleNoFormatting"])
	return results

def get_topic_starts(topic_key, zone):
	starts = []
	url = API_URL % {"version": VERSION, "rsz": RSZ, "topic": topic_key, "start": "0", "ned": zone}
	json = urllib2.urlopen(url).read()
	api_result = simplejson.loads(json)
	if "pages" in api_result["responseData"]["cursor"]:
		pages = api_result["responseData"]["cursor"]["pages"]
	else:
		pages = []

	for page in pages:
		starts.append(page["start"])
	
	return starts

def add_topic(article, topic):
	article["topic"] = topic