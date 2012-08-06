import urllib2
import urllib
import simplejson
from lib.incf.countryutils import transformations

APP_ID = "tCS56LbV34Eh0a2m8DvlsePMwKh2qoUj0_d5J8IqenbpAzi6i_qNPjSgE8398Dw-"

def get_continent_from_string(string):
	yahooUrl = 'http://wherein.yahooapis.com/v1/document'
	data = urllib.urlencode({'documentContent': string.encode('ascii', 'ignore'), 'documentType': 'text/plain', 'appid': APP_ID, 'outputType': 'json'})
	response = urllib2.urlopen(yahooUrl, data)
	json = response.read()
	data = simplejson.loads(json)
	if "document" in data:
		countries = []
		continents = []
		for i in get_all(data["document"], "name"):
			countries.append(i)
		
		for country in countries:
			try:
				continents.append(transformations.cn_to_ctn(country))
			except KeyError:
				pass

		return continents

	else:
		return []
			
def getLinkPlace(url):
	yahooUrl = 'http://wherein.yahooapis.com/v1/document'
	data = urllib.urlencode({'documentURL': url, 'documentType': 'text/plain', 'appid': APP_ID, 'outputType': 'json'})
	response = urllib2.urlopen(yahooUrl, data)
	json = response.read()
	data = simplejson.loads(json)
	if "document" in data:
		return listify(get_all(data["document"], "name"))

	else:
		return None

def get_all(data, key):
    sub_iter = []
    if isinstance(data, dict):
        if key in data:
            yield data[key]
        sub_iter = data.itervalues()
    if isinstance(data, list):
        sub_iter = data
    for x in sub_iter:
        for y in get_all(x, key):
            yield y