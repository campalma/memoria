from django.http import HttpResponse

# Create your views here.

def collect(request):
	return HttpResponse("Hello, world. You're at the poll index.")