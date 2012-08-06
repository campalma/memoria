import urllib2
import simplejson

API_URL = "https://ajax.googleapis.com/ajax/services/search/news?v=%(version)s&rsz=%(rsz)s&topic=%(topic)s&start=%(start)s"
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

def collect():
	result = collect_all_news_from_topic("s")
	return result

def collect_all_news_from_topic(topic_key):
	results = []
	collected_titles = []
	starts = get_topic_starts(topic_key)
	for start in starts:
		url = API_URL % {"version": VERSION, "rsz": RSZ, "topic": topic_key, "start": start}
		json = urllib2.urlopen(url).read()
		api_result = simplejson.loads(json)
		news = api_result["responseData"]["results"]
		for article in news:
			if not (article["titleNoFormatting"] in collected_titles):
				article["topic"] = TOPICS[topic_key]
				results.append(article)
				collected_titles.append(article["titleNoFormatting"])
	return results

def get_topic_starts(topic_key):
	starts = []
	url = API_URL % {"version": VERSION, "rsz": RSZ, "topic": topic_key, "start": "0"}
	json = urllib2.urlopen(url).read()
	api_result = simplejson.loads(json)
	pages = api_result["responseData"]["cursor"]["pages"]

	for page in pages:
		starts.append(page["start"])
	
	return starts

def add_topic(article, topic):
	article["topic"] = topic