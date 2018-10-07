from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse
from mysite1.settings import STATIC_DIR

import os , json


bbxviewer_static_dir = os.path.join(STATIC_DIR,"bbxviewer")


imagedirpath = os.path.join(bbxviewer_static_dir,'images')
labeldirpath = os.path.join(bbxviewer_static_dir, 'labels')

imgfilelist = os.listdir(imagedirpath)
imgfilelist = sorted(imgfilelist)

labelfilelist = os.listdir(labeldirpath)

labelfilemap={}

for f in labelfilelist:
    basename, _ = os.path.splitext(f)
    labelfilemap[basename] = f



def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

def workbench(request):
    return render(request, 'workbench.html')

def get_image(request, imgno):
    selected_file = imgfilelist[imgno]
    print("selected_file:{}".format(selected_file))
    selected_file_fullpath = os.path.join(imagedirpath, selected_file)
    
    if not os.path.exists(selected_file_fullpath):
        return HttpResponse("no file found")

    _, ext = os.path.splitext(selected_file)

    content_type=""
    if ext=='.jpg' or ext=='.jpeg':
        content_type = "image/jpeg"
    elif ext=='.png':
        content_type = "image/png"
    else:
        return HttpResponse("image extention weird")

    with open(selected_file_fullpath, 'rb') as f:
        return HttpResponse(f.read(), content_type=content_type)


def fetch_total_image_number(request):
    returnjson={}
    returnjson['number_of_images'] = len(imgfilelist)

    response = HttpResponse(json.dumps(returnjson), content_type="application/json")
    return response


def fetch_matching_label_file_with_imgno(imgno):
    imgfilename = imgfilelist[imgno]
    basename, _ = os.path.splitext(imgfilename)

    labelfilename = labelfilemap[basename]

    return os.path.join(labeldirpath, labelfilename)





def fetchprogress(request, imgno):
    if imgno <0 or imgno > len(labelfilelist):
        print("imgno incorrect")
        return JsonResponse({'succeed': False,'failreason':'incorrect imgno'})
    
    fetch_savefilepath = fetch_matching_label_file_with_imgno(imgno)
    print("fetched_labelfile:{}".format(fetch_savefilepath))

    if not os.path.exists(fetch_savefilepath):
        print("{} not found".format(fetch_savefilepath))
        return JsonResponse({'succeed': False,'failreason':"file not exist"})
    
    with open(fetch_savefilepath,'r') as fd:
        readjson = json.load(fd)

    boxes= readjson['boxes']
    
    return JsonResponse({'succeed': True, 'boxes': boxes})