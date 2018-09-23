import cv2 , json, os, sys , numpy as np 

sys.path.append("..")
from mysite1.settings import STATIC_DIR


def generate_converted_pngs(imagedir, savedir, converted_output_dir, middle_callback):
    image_file_list = os.listdir(imagedir)
    image_file_list = sorted(image_file_list)

    

    for image_no in range(len(image_file_list)):
        img_filepath =  os.path.join(imagedir, image_file_list[image_no])
        json_filepath = os.path.join(savedir, "{:04d}.json".format(image_no))

        orig_img = cv2.imread(img_filepath)

        img_h, img_w, _ = orig_img.shape
        
        with open(json_filepath,'r') as fd:
            savejson = json.load(fd)

        segments=[]

        for path in savejson:
            processed_segment=[]
            name = path[0]
            segment = path[1]['segments']

            for point in segment:
                realpoint = point[0]
                rx = realpoint[0] * img_w
                ry = realpoint[1] * img_h
                processed_segment.append((rx,ry))
            
            segments.append(processed_segment)


        # create blank cv2 canvas

        draw_array = np.zeros((img_h, img_w, 3))

        cv2_polys = []

        for sel_segment in segments:
            single_poly=[]

            for point in sel_segment:
                # print(point)
                rx,ry = point
                _rx = int(rx)
                _ry = int(ry)

                single_poly.append([_rx,_ry])

            single_poly = np.array(single_poly,np.int32)

            single_poly = single_poly.reshape(-1,1,2)

            cv2_polys.append(single_poly)

        # img = cv2.polylines(draw_array, [path],1, (255,255,255), 3)

        img = cv2.fillPoly(draw_array,cv2_polys, (255,255,255))
        output_filepath = os.path.join(converted_output_dir, "{:04d}.png".format(image_no))
        cv2.imwrite(output_filepath, img)

        if image_no != (len(image_file_list) -1):

            middle_callback(float(image_no)/ (len(image_file_list)-1) )
    
    # final 
    middle_callback(1.0)
    
    
    
    


# imagedir = os.path.join(STATIC_DIR, "images" )
# savedir = os.path.join(STATIC_DIR, "saves")

# image_file_list = os.listdir(imagedir)
# image_file_list = sorted(image_file_list)

# test_image_no = 0


# test_img_filepath = os.path.join(imagedir, image_file_list[test_image_no])
# test_json_file = os.path.join(savedir, "{:04d}.json".format(test_image_no))


# orig_img = cv2.imread(test_img_filepath)

# img_h, img_w, _ = orig_img.shape


# with open(test_json_file,'r') as fd:
#     savejson = json.load(fd)

# segments=[]

# for path in savejson:
#     processed_segment=[]
#     name = path[0]
#     segment = path[1]['segments']

#     for point in segment:
#         realpoint = point[0]
#         rx = realpoint[0] * img_w
#         ry = realpoint[1] * img_h
#         processed_segment.append((rx,ry))
    
#     segments.append(processed_segment)


# # create blank cv2 canvas

# draw_array = np.zeros((img_h, img_w, 3))

# cv2_polys = []

# for sel_segment in segments:
#     single_poly=[]

#     for point in sel_segment:
#         # print(point)
#         rx,ry = point
#         _rx = int(rx)
#         _ry = int(ry)

#         single_poly.append([_rx,_ry])

#     single_poly = np.array(single_poly,np.int32)

#     single_poly = single_poly.reshape(-1,1,2)

#     cv2_polys.append(single_poly)

# # img = cv2.polylines(draw_array, [path],1, (255,255,255), 3)

# img = cv2.fillPoly(draw_array,cv2_polys, (255,255,255))

# cv2.imwrite("test.png", img)
