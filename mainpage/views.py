from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse

def main(request):
    return render(request, 'main.html')