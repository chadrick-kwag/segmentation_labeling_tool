from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt 

from mysite1.settings import STATIC_DIR
import os, json

filename_map={}

def make_dir_is_not_exist(dirpath):
    if not os.path.exists(dirpath):
        os.makedirs(dirpath)

## init
imagedirpath = os.path.join(STATIC_DIR,'images')
savedirpath = os.path.join(STATIC_DIR,'saves')

make_dir_is_not_exist(imagedirpath)
make_dir_is_not_exist(savedirpath)


filelist = os.listdir(imagedirpath)
filelist = sorted(filelist)






for i, filename in enumerate(filelist):
    filename_map[i] = filename




def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

def main(request):
    return render(request, 'work/ext.html')


def fetch_image_numbers(request):

    returnjson={}
    returnjson['number_of_images'] = len(filelist)

    response = HttpResponse(json.dumps(returnjson), content_type="application/json")
    return response


def fetch_image(request, imgno):

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
    
    
@csrf_exempt
def saveprogress(request):
    if request.body is None:
        return HttpResponse("no body")
    if len(request.body) ==0:
        return HttpResponse("body length is zero")

    request_jsondata = json.loads(request.body.decode('utf-8'))

    image_number = request_jsondata["image_number"]

    pathdata = request_jsondata["path_array"]

    # fetch savefilename

    savefilepath = os.path.join(savedirpath,"{:04d}.json".format(int(image_number)) )
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
        return JsonResponse({'launch_possible': False, 'fail_reason': "insufficient labeling"})

    # check for any empty json save files
    empty_files_count =0
    for savefile in savefiles:
        savefilepath = os.path.join(savedirpath, savefile)

        with open(savefilepath, 'r') as fd:
            savejson = json.load(fd)
        
        if len(savejson)==0:
            empty_files_count+=1
    
    if empty_files_count >0:
        return JsonResponse({'launch_possible': False, 'fail_reason': "{} image saves are empty saves".format(empty_files_count)})
        
    
    
    return JsonResponse({'launch_possible': True})