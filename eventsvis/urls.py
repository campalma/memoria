from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
#	url(r'^collect/', 'visualization.views.collect'),
	url(r'^visualize/', 'visualization.views.visualize'),
	url(r'^api/clustersquery', 'visualization.views.clusters_query'),
	url(r'^api/clusternewsquery/(\d+)/', 'visualization.views.cluster_news_query'),
    url(r'^api/locationsquery/(\d+)/', 'visualization.views.locations_query'),
    url(r'^api/clustersbydate/', 'visualization.views.cluster_query_by_date'),
    url(r'^api/topics/', 'visualization.views.get_topics'),
    url(r'^api/continents/', 'visualization.views.get_continents'),
    # Examples:
    # url(r'^$', 'eventsvis.views.home', name='home'),
    # url(r'^eventsvis/', include('eventsvis.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
