from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

from mysite1.settings import STATIC_DIR
import os, json


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

def main(request):
    return render(request, 'work/ext.html')


def fetch_image_numbers(request):
    imagedirpath = os.path.join(STATIC_DIR,'images')
    filelist = os.listdir(imagedirpath)

    returnjson={}
    returnjson['number_of_images'] = len(filelist)

    response = HttpResponse(json.dumps(returnjson), content_type="application/json")
    return response
