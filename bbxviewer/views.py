from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

# Create your views here.

from mysite1.settings import STATIC_DIR


def main(request):
    return render(request, 'main.html')