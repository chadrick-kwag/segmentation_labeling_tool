from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse

from mysite1.settings import STATIC_DIR
import os, json

filename_map={}

## init
imagedirpath = os.path.join(STATIC_DIR,'images')
savedirpath = os.path.join(STATIC_DIR,'saves')
filelist = os.listdir(imagedirpath)
filelist = sorted(filelist)

for i, filename in enumerate(filelist):
    filename_map[i] = filename




def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

def main(request):
    return render(request, 'work/ext.html')


def fetch_image_numbers(request):
    # imagedirpath = os.path.join(STATIC_DIR,'images')
    # filelist = os.listdir(imagedirpath)

    returnjson={}
    returnjson['number_of_images'] = len(filelist)

    response = HttpResponse(json.dumps(returnjson), content_type="application/json")
    return response


def fetch_image(request, imgno):

    # imagedirpath = os.path.join(STATIC_DIR,'images')
    # filelist = os.listdir(imagedirpath)

    # filelist = sorted(filelist)

    # selected_file = filelist[imgno]

    selected_file = filename_map[imgno]
    selected_file_fullpath = os.path.join(imagedirpath, selected_file)

    _, ext = os.path.splitext(selected_file)

    if not os.path.exists(selected_file_fullpath):
        return HttpResponse("no file found")


    content_type=""
    if ext=='.jpg' or ext=='.jpeg':
        content_type = "image/jpeg"
    elif ext=='.png':
        content_type = "image/png"
    else:
        return HttpResponse("image extention weird")

    with open(selected_file_fullpath, 'rb') as f:
        return HttpResponse(f.read(), content_type=content_type)
    
    
def saveprogress(request):
    if request.body is None:
        return HttpResponse("no body")
    if len(request.body) ==0:
        return HttpResponse("body length is zero")
    # print("whaaaat")
    # print(request.body)


    request_jsondata = json.loads(request.body.decode('utf-8'))

    image_number = request_jsondata["image_number"]
    print("received save data for image_number={}".format(image_number))

    pathdata = request_jsondata["path_array"]

    # fetch savefilename

    savefilepath = os.path.join(savedirpath,"{:04d}.json".format(image_number))
    with open(savefilepath,'w') as fd:
        json.dump(pathdata,fd)


    return HttpResponse("test response")



def fetchprogress(request, imgno):
    if imgno <0 or imgno > len(filename_map):
        print("imgno incorrect")
        return JsonResponse({'succeed': False,'failreason':'incorrect imgno'})
    
    fetch_savefilepath = os.path.join(savedirpath, "{:04d}.json".format(imgno))

    if not os.path.exists(fetch_savefilepath):
        print("{} not found".format(fetch_savefilepath))
        return JsonResponse({'succeed': False,'failreason':"file not exist"})
    
    with open(fetch_savefilepath,'r') as fd:
        readjson = json.load(fd)
    
    return JsonResponse({'succeed': True, 'pathdata': readjson})


def launch_conversion(request):
    # check if number of saves match number of images
    savefiles = os.listdir(savedirpath)

    if len(savefiles) != len(filename_map):
        return JsonResponse({'launch_possible': False})
    
    
    return JsonResponse({'launch_possible': True})