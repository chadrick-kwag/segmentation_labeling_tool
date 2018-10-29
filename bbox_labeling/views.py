from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from mysite1.settings import STATIC_DIR
from django.core.files.images import ImageFile

import json, os

static_dirpath = os.path.join(STATIC_DIR, "bbox_labeling")
img_dirpath = os.path.join(static_dirpath, "images")
save_dirpath = os.path.join(static_dirpath, "saves")

if not os.path.exists(img_dirpath):
    os.makedirs(img_dirpath)

if not os.path.exists(save_dirpath):
    os.makedirs(save_dirpath)


img_files = os.listdir(img_dirpath)
img_files = sorted(img_files)


label_files_dict={}
for file in os.listdir(save_dirpath):
    basename, ext = os.path.splitext(file)
    if ext!=".json":
        continue
    
    label_files_dict[basename] = file

# Create your views here.

def main(request):
    return render(request, "bbox_labeling/main.html")

@csrf_exempt
def save_progress(request):
    postdata = request.body.decode("utf-8")

    postdata = json.loads(postdata)
    # print(postdata)

    imgno = postdata["img_index"]

    imgfile = img_files[imgno]

    imgbasename, _ = os.path.splitext(imgfile)

    del postdata["img_index"]

    postdata["imgfile"] = imgfile

    imgpath = os.path.join(img_dirpath, imgfile)

    django_imgfile = ImageFile(open(imgpath, 'rb'))
    img_w = django_imgfile.width
    img_h = django_imgfile.height

    postdata["img_w"] = img_w
    postdata["img_h"] = img_h

    save_json_filename ="{}.json".format(imgbasename)
    save_json_filepath = os.path.join(save_dirpath, save_json_filename)

    with open(save_json_filepath, 'w') as fd:
        json.dump(postdata, fd)

    label_files_dict[imgbasename] = save_json_filename


    return HttpResponse(status=200)


def fetch_total_image_number(request):
    retjson={}
    retjson['total_image_number'] = len(img_files)

    return JsonResponse(retjson)

def get_image(request, imgno):
    if imgno >= len(img_files) or imgno < 0:
        return HttpResponse(status=400)

    selected_imgfile = img_files[imgno]

    _, ext = os.path.splitext(selected_imgfile)

    if ext==".jpeg" or ext == ".jpg":
        content_type = "image/jpeg"
    elif ext == ".png":
        content_type = "image/png"
    else:
        print("invalid image ext: {}".format(ext))
        return HttpResponse(status=400)

    
    
    sel_imgfile_path = os.path.join(img_dirpath,selected_imgfile)
    with open(sel_imgfile_path,'rb') as fd:
        return HttpResponse(fd.read(), content_type=content_type)



def fetchprogress(request, imgno):
    sel_imgfile = img_files[imgno]

    imgbasename, _ = os.path.splitext(sel_imgfile)

    fetched_save_file = label_files_dict.get(imgbasename, None)

    if fetched_save_file is None:
        retjson = {}
        retjson["success"] = False
        return JsonResponse(retjson)

    fetched_save_filepath = os.path.join(save_dirpath, fetched_save_file)

    with open(fetched_save_filepath, 'r') as fd:
        retjson = json.load(fd)
        retjson["success"] = True
    
    return JsonResponse(retjson)

