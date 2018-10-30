from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from mysite1.settings import STATIC_DIR
from django.core.files.images import ImageFile

import json, os, datetime

static_dirpath = os.path.join(STATIC_DIR, "bbox_labeling")
img_dirpath = os.path.join(static_dirpath, "images")
save_dirpath = os.path.join(static_dirpath, "saves")
annotation_output_dirpath = os.path.join(static_dirpath, "annotations")

if not os.path.exists(img_dirpath):
    os.makedirs(img_dirpath)

if not os.path.exists(save_dirpath):
    os.makedirs(save_dirpath)

if not os.path.exists(annotation_output_dirpath):
    os.makedirs(annotation_output_dirpath)


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
    print("inside save_progress")
    postdata = request.body.decode("utf-8")

    print("creating postdata")
    postdata = json.loads(postdata)
    # print(postdata)

    imgno = postdata["img_index"]

    imgfile = img_files[imgno]

    imgbasename, _ = os.path.splitext(imgfile)

    del postdata["img_index"]

    postdata["imgfile"] = imgfile

    imgpath = os.path.join(img_dirpath, imgfile)
    print("reading django imagefile")
    django_imgfile = ImageFile(open(imgpath, 'rb'))
    img_w = django_imgfile.width
    img_h = django_imgfile.height

    print("setting img_w and img_h in postdata")

    postdata["img_w"] = img_w
    postdata["img_h"] = img_h

    save_json_filename ="{}.json".format(imgbasename)
    save_json_filepath = os.path.join(save_dirpath, save_json_filename)

    print("wrriting to json file")
    with open(save_json_filepath, 'w') as fd:
        # json.dump(postdata, fd)
        fd.write(json.dumps(postdata)+"\n")

    print("adding to label_files_dict")
    label_files_dict[imgbasename] = save_json_filename

    print("returnign http response")
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
    print("fetching savefile from label_files_dict")
    fetched_save_file = label_files_dict.get(imgbasename, None)

    if fetched_save_file is None:
        retjson = {}
        retjson["success"] = False
        return JsonResponse(retjson)

    fetched_save_filepath = os.path.join(save_dirpath, fetched_save_file)
    print("fetched_save_filepath:{}".format(fetched_save_filepath))

    with open(fetched_save_filepath, 'r') as fd:
        # retjson = json.load(fd)
        retjson = json.loads(fd.read())
        retjson["success"] = True
    
    return JsonResponse(retjson)

def convert_check(request):
    retjson={}
    if not check_if_label_all_done():
        retjson["check_passed"]=False 
        return JsonResponse(retjson)
    
    retjson["check_passed"] = True

    return JsonResponse(retjson)

def convert_test(request):

    retjson={}
    
    result_dirpath = convert_saves_to_annotations()
   
    retjson['result_dirpath'] = result_dirpath

    return JsonResponse(retjson)
    
def check_if_label_all_done():
    if len(label_files_dict)!= len(img_files):
        return False
    else:
        return True

def fetch_dirname_available(dirpath, dirbasename):
    firstcheck = os.path.join(dirpath, dirbasename)
    if not os.path.exists(firstcheck):
        return firstcheck
    
    for i in range(100):
        iterable_dirbasename = "{}_{:02d}".format(dirbasename,i)
        newdirpath = os.path.join(dirpath, iterable_dirbasename)
        if not os.path.exists(newdirpath):
            return newdirpath
    
    raise Exception("unable to create dir with dirbasename: {}".format(dirbasename))


def convert_saves_to_annotations():
    timestamp = datetime.datetime.now().strftime("%y%m%d_%H%M")
    # target_annotation_dirpath = os.path.join(annotation_output_dirpath, timestamp)

    target_annotation_dirpath = fetch_dirname_available(annotation_output_dirpath, timestamp)

    os.makedirs(target_annotation_dirpath)

    for _,v in label_files_dict.items():
        label_filepath = os.path.join(save_dirpath, v)
        with open(label_filepath) as fd:
            jsondata = json.load(fd)
        
        annot_json={}
        annot_json['imgfile'] = jsondata['imgfile']
        annot_json['img_h'] = jsondata['img_h']
        annot_json['img_w'] = jsondata['img_w']

        path_list = jsondata['path_list']


        rect_list =[]

        for path_wrapper in path_list:
            char_value = path_wrapper["char_value"]
            path_array = path_wrapper["path"]
            realpathobj = path_array[1]
            segments = realpathobj['segments']
            x1,y1,x2,y2 = parse_segments_to_diagrectcoords(segments)

            rect = {}
            rect["x1"] = x1
            rect["y1"] = y1
            rect["x2"] = x2
            rect["y2"] = y2
            rect["char_value"] = char_value

            rect_list.append(rect)
        
        annot_json["bboxes"] = rect_list

        # using the same basename 
        annot_file_path = os.path.join(target_annotation_dirpath, v)
        with open(annot_file_path, 'w') as fd:
            json.dump(annot_json, fd)

    return target_annotation_dirpath
    




def parse_segments_to_diagrectcoords(segments):
    topleft = segments[1]
    bottomright = segments[3]

    x1 = topleft[0]
    y1 = topleft[1]

    x2 = bottomright[0]
    y2 = bottomright[1]

    return x1,y1,x2,y2


