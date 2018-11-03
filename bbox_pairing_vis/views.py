from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from mysite1.settings import STATIC_DIR
from django.views.decorators.csrf import csrf_exempt

import json, os, datetime

static_dirpath = os.path.join(STATIC_DIR, "bbox_pairing_vis")
img_dirpath = os.path.join(static_dirpath, "images")
pairing_info_dirpath = os.path.join(static_dirpath, "pairing_info")

if not os.path.exists(img_dirpath):
    os.makedirs(img_dirpath)

if not os.path.exists(pairing_info_dirpath):
    os.makedirs(pairing_info_dirpath)


pairing_info_files = os.listdir(pairing_info_dirpath)
imgfiles = os.listdir(img_dirpath)

def main(request):
    return render(request, "bbox_pairing_vis/main.html")



def fetch_total_image_number(request):
    retjson={}
    retjson['total_image_number'] = len(pairing_info_files)

    return JsonResponse(retjson)


def get_image(request, imgno):
    if imgno >= len(pairing_info_files) or imgno < 0:
        return HttpResponse(status=400)

    # selected_imgfile = img_files[imgno]
    selected_pairing_info_file = pairing_info_files[imgno]
    basename, _ = os.path.splitext(selected_pairing_info_file)

    search_query= basename + "."
    searched_img_file=None
    for item in imgfiles:
        if search_query in item:
            searched_img_file= item
            break
    
    if searched_img_file is None:
        print("failed to find matching image")
        return HttpResponse(status=400)

    _, ext = os.path.splitext(searched_img_file)

    if ext==".jpeg" or ext == ".jpg":
        content_type = "image/jpeg"
    elif ext == ".png":
        content_type = "image/png"
    else:
        print("invalid image ext: {}".format(ext))
        return HttpResponse(status=400)

    
    
    searched_img_file = os.path.join(img_dirpath, searched_img_file)
    with open(searched_img_file,'rb') as fd:
        return HttpResponse(fd.read(), content_type=content_type)


def fetchprogress(request, imgno):

    selected_pairing_info_file = pairing_info_files[imgno]

    if selected_pairing_info_file is None:
        retjson = {}
        retjson["success"] = False
        retjson["img_no"] = imgno
        return JsonResponse(retjson)

    fetched_save_filepath = os.path.join(pairing_info_dirpath, selected_pairing_info_file)
    print("fetched_save_filepath:{}".format(fetched_save_filepath))

    with open(fetched_save_filepath, 'r') as fd:
        # retjson = json.load(fd)
        retjson = json.loads(fd.read())
        retjson["success"] = True
        retjson["img_no"] = imgno
        
    
    return JsonResponse(retjson)