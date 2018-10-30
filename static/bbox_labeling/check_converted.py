"""
visualize the converted annotation file to check if the converted annotation file has preserved the saved label data.
tests a single label save.
"""

import cairocffi as cairo , json, os 

test_annotation_file = "181030_0108/TEM_02_small_blur.json"

with open(test_annotation_file, 'r') as fd:
    annot_json = json.load(fd)

img_w = annot_json['img_w']
img_h = annot_json['img_h']

surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, img_w, img_h)
context = cairo.Context(surface)

context.set_source_rgb(1,1,1)
context.paint()

bbox_list = annot_json["bboxes"]

for bbox in bbox_list:
    x1 = bbox["x1"] * img_w 
    x2 = bbox["x2"] * img_w 
    y1 = bbox["y1"] * img_h 
    y2 = bbox["y2"] * img_h 
    char_val = bbox["char_value"]

    bbox_w = x2 - x1 
    bbox_h = y2 - y1 

    context.set_source_rgb(0,0,0)
    context.rectangle(x1,y1,bbox_w, bbox_h)
    context.set_line_width(2)
    context.stroke()

surface.write_to_png("output.png")