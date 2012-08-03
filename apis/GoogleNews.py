import urllib2
import simplejson

API_URL = "https://ajax.googleapis.com/ajax/services/search/news?v=%(version)s&rsz=%(rsz)s&topic=%(topic)s&start=%(start)s"

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
	result = []
	url = API_URL % {"version": "1.0", "rsz": "8", "topic": "h", "start": "0"}
	json = urllib2.urlopen(url).read()
	api_result = simplejson.loads(json)
	news = api_result["responseData"]["results"]
	for article in news:
		result.append(article)
	return result