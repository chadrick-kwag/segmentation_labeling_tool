// class Box {
//     constructor(boxjsonobj, _type) {
//         // create path and keep a reference of it.
//         this.char_value = boxjsonobj.char_value
//         this.type = _type

//         var img_w = background.width
//         var img_h = background.height

//         var x = boxjsonobj.x1 * img_w
//         var y = boxjsonobj.y1 * img_h
//         var w = (boxjsonobj.x2 - boxjsonobj.x1) * img_w
//         var h = (boxjsonobj.y2 - boxjsonobj.y1) * img_h

//         // var rect = new Rectangle(x, y, w, h)
//         // var rectpath = new Path.Rectangle(rect)

//         // if (_type == "gt") {
//         //     rectpath.fillColor = gt_box_color
//         // } else if (_type == "pred") {
//         //     rectpath.fillcolor = pred_box_color
//         // } else {
//         //     rectpath.fillcolor = 'grey'
//         // }

//         // rectpath.opacity = 0.5

//         // this.path = rectpath
//     }

// }



var gt_box_color = 'green'
var pred_box_color = 'blue'


var SERVER_BASE_ADDR = window.location.origin + "/bbox_pairing_vis"
var testimg_url = window.location.origin + "/static/bbox_pairing_vis/testimage.jpg"


var background = new Raster()
var canvas = $("#myCanvas")
var canvas_col = $("#canvas_col")
var width_measure_span = $("#width_measure")

var zoom_factor = 1.25
var _minZoom = 1
var _maxZoom = 10


var min_drawn_box_width = 20
var min_drawn_box_height = 20


var drawing_path = null
var drawing_state = false

var mouse_down_start_point = null


var bbox_label_dict = new Object()
var bbox_path_dict = new Object()

var current_img_index = 0
var attempt_img_index = null


var path_array = []
var selected_path = null
var total_image_count = 0


var label_good_color = "green"
var label_notdone_color = "red"

var sb_timer = null


var gt_box_list = []
var pred_box_list = []

var pairing_count = 0


function adjust_canvas_size() {


    var img_original_w = background.width
    var img_original_h = background.height

    var img_aspect_ratio = img_original_w / img_original_h



    var project_width = paper.project.view.size.width
    var project_height = paper.project.view.size.height



    var project_new_width
    var project_new_height
    var column_width = width_measure_span.width()

    if (img_aspect_ratio < 1) {

        project_new_height = column_width
        project_new_width = Math.round(project_new_height * img_aspect_ratio)


    } else {


        project_new_width = column_width
        project_new_height = Math.round(project_new_width / img_aspect_ratio)

    }



    paper.view.viewSize.width = project_new_width
    paper.view.viewSize.height = project_new_height


    canvas.width = project_new_width
    canvas.height = project_new_height



    background.set({ width: project_new_width, height: project_new_height, position: view.center })



}



$("#myCanvas").mousewheel(function(event) {
    // console.log("what")

    var mousePosition = new paper.Point(event.offsetX, event.offsetY)
    changeZoomCentered(event.deltaY, mousePosition);
})


function changeZoomCentered(delta, mousePos) {



    // console.log("inside changezoomcentered")
    if (!delta) {
        return;
    }
    var view = project.view;
    var oldZoom = view.zoom;
    var previous_viewcenter_pcoords = view.center;
    var mousepos_pcoords = view.viewToProject(mousePos);

    // console.log("mousepos pcoords:")
    // console.log(mousepos_pcoords)

    var newZoom
    if (delta > 0) {
        newZoom = view.zoom * zoom_factor
    } else {
        newZoom = view.zoom / zoom_factor
    }


    newZoom = setZoomConstrained(newZoom)
        // console.log("newZoom:" + newZoom)
        // console.log(newZoom)

    if (newZoom == null) {
        return;
    }

    var zoomScale = oldZoom / newZoom;
    var mousepos_prev_viewcenter_delta = mousepos_pcoords.subtract(previous_viewcenter_pcoords)

    // this has the affect of slightly moving towards the mouseposition
    var new_viewcenter_pcoords = mousepos_pcoords.subtract(mousepos_prev_viewcenter_delta.multiply(zoomScale))

    var temprect = view.bounds

    view.center = new_viewcenter_pcoords

    adjust_zoom_center_excess_or_deficit(view.bounds)


}


function adjust_zoom_center_excess_or_deficit(viewbounds) {
    /**
     * will adjust the view.center if window is showing the outside of the background image.
     */

    // console.log("inside adjust_zoom_center")

    if (viewbounds.x < 0) {
        // console.log("viewbounds.x:" + viewbounds.x)
        // console.log("adjusting the viewcenter to the right by " + viewbounds.x)

        view.center = view.center.add(new Point(-viewbounds.x, 0))
    }

    if (viewbounds.right > background.bounds.width) {
        var x_excess = viewbounds.right - background.bounds.width

        // console.log("excess x. adjusting the viewcenter to the left by " + x_excess)
        view.center = view.center.subtract(new Point(x_excess, 0))
    }

    if (viewbounds.y < 0) {
        var y_deficit = -viewbounds.y
        view.center = view.center.add(new Point(0, y_deficit))
    }

    if (viewbounds.bottom > background.bounds.height) {
        var y_excess = viewbounds.bottom - background.bounds.height
        view.center = view.center.subtract(new Point(0, y_excess))
    }

}


function setZoomConstrained(zoom) {
    if (_minZoom) {
        zoom = Math.max(zoom, _minZoom);
    }
    if (_maxZoom) {
        zoom = Math.min(zoom, _maxZoom);
    }
    var view = project.view;
    if (zoom != view.zoom) {
        view.zoom = zoom;
        return zoom;
    }

    // console.log("returning null")
    return null;
}





function add_onclick_listener_to_path(givenpath) {
    givenpath.onClick = function(event) {
        console.log(this)
        this.selected = true
        selected_path = this
        show_popupbox_for_selected_path(this)
    }
}







function save_char_value_in_dict(char_value) {

    console.log("inside save_char_value_in_dict. selected_path=" + selected_path)

    bbox_label_dict[selected_path] = char_value
    bbox_path_dict[selected_path] = selected_path

    hide_popupbox()

}


function show_clean_popupbox() {
    $("#bbox_value").val(null)
    show_popupbox()
}

function show_popupbox_for_selected_path(given_selected_path) {
    load_char_value_in_popupbox(given_selected_path)
    show_popupbox()
}

function load_char_value_in_popupbox(given_selected_path) {
    var saved_value = bbox_label_dict[given_selected_path]

    $("#bbox_value").val(saved_value)
}


function sb_save_successful() {
    $("#status_bar").empty()
    sb_msg("save successful")
}

function sb_save_failed() {
    $("#status_bar").empty()
    sb_msg("save failed")

}

function sb_save_processing() {
    sb_empty()
    $("#status_bar").append("<i class='fa fa-spinner fa-spin '></i> saving...")
}

function sb_msg(msg) {

    if (sb_timer != null) {
        clearTimeout(sb_timer)
    }

    sb_empty()
    htmlmsg = "<p>" + msg + "</p>"
    $("#status_bar").append(htmlmsg)

    sb_timer = setTimeout(sb_empty, 3000)

}


function sb_loading_icon() {
    sb_empty()
    $("#status_bar").append("<i class='fa fa-spinner fa-spin '></i>")
}

function sb_empty() {
    $("#status_bar").empty()
}



$("#statpopover").popover({
    html: true,
    content: function() {
        return $("#stat_div").html()
    }
})


// function update_stats() {
//     var total_count = path_array.length
//     var unlabeled_count = 0

//     console.log(bbox_label_dict)
//     for (var key in bbox_label_dict) {
//         if (bbox_label_dict[key] == "" || bbox_label_dict[key] == null) {
//             unlabeled_count++
//         }
//     }


//     console.log("total_count " + total_count)

//     $(".total_count_class").text(total_count)
//     $(".unlabeled_count_class").text(unlabeled_count)
// }


function update_stats() {
    var precision = pairing_count / pred_box_list.length
    var recall = pairing_count / gt_box_list.length

    precision = precision.toFixed(3)
    recall = recall.toFixed(3)

    $("#precision_span").html(precision)
    $("#recall_span").html(recall)
}

function load_total_image_count(callback) {
    var sendurl = SERVER_BASE_ADDR + "/info"
    $.ajax({
        url: sendurl,
        type: "get",
        success: function(data) {
            // console.log(data)
            $("#total_image_number_span").text(data.total_image_number)
            total_image_count = data.total_image_number

            callback(current_img_index)
        }
    })
}


function normalize_path_json(inputjson) {
    /**
     * normalizes the segment part of the exportedjson of path, inline.
     */
    var actual_path_obj = inputjson[1]
        // console.log("actual_path_obj")
        // console.log(actual_path_obj)

    var segments = actual_path_obj.segments

    for (var i = 0; i < segments.length; i++) {
        var item = segments[i]

        item[0] = item[0] / background.width
        item[1] = item[1] / background.height
    }

    // console.log("after normalization")
    // console.log(inputjson)
}


function fetch_progress(imgno) {
    var targeturl = SERVER_BASE_ADDR + "/fetchprogress/" + imgno
    $.ajax({
        url: targeturl,
        type: "get",
        success: function(data) {
            console.log(data)
            if (data.img_no != current_img_index) {
                // fetch progress is outdated. ignore it.
                return
            }

            console.log(data)

            if (!data.success) {
                restore_boxes(null)
            } else {
                restore_boxes(data)
            }


            // console.log("after restoring..")
            // console.log(gt_box_list)

            // console.log("pred_box_list")
            // console.log(pred_box_list)

            update_stats()
        },
        error: function(req, e) {
            console.log("inside fetch_progress error")
            sb_msg("failed to load saved data")
        }

    })
}

function check_is_imgno_ok(imgno) {
    if (imgno < 0 || imgno >= total_image_count) {
        return false
    }
    return true
}


function load_imgno(imgno) {



    if (!check_is_imgno_ok(imgno)) {
        if (total_image_count == 0) {
            alert("no images available")
        }
        return // do nothing
    }

    sb_loading_icon()

    attempt_img_index = imgno

    var imgurl = SERVER_BASE_ADDR + "/img/" + imgno
    console.log(imgurl)


    // restoring view zoom and center coordinates to default before switching images
    view.zoom = 1

    if (background.position.x != 0 && background.position.y != 0) {
        view.center = background.position
    }

    background.set({ source: imgurl, position: view.center })

}


function restore_boxes(received_json) {

    if (received_json == null) {
        sb_empty()
    }

    var gt_boxes = received_json.gt_boxes
    for (var i = 0; i < gt_boxes.length; i++) {
        var box = gt_boxes[i]
        var created_box = create_box(box, "gt")
        gt_box_list.push(created_box)
    }

    var pred_boxes = received_json.pred_boxes
    for (var i = 0; i < pred_boxes.length; i++) {
        var box = pred_boxes[i]
        var created_box = create_box(box, "pred")
        pred_box_list.push(created_box)
    }

    var pairing_infos = received_json.pair_info_list
    pairing_count = pairing_infos.length
    for (var i = 0; i < pairing_infos.length; i++) {
        var pairing_info = pairing_infos[i]

        var pred_box_index = pairing_info.pred_box_index
        var found_pred_box = null
        for (var j = 0; j < pred_box_list.length; j++) {
            if (pred_box_index == pred_box_list[j].index) {
                found_pred_box = pred_box_list[j]
                break
            }
        }

        if (found_pred_box == null) {
            console.log("could not find predbox with index " + pred_box_index)
            continue
        }

        found_pred_box.path.fillColor = "blue"

    }

    sb_empty()
}


function restore_paths(received_path_list) {

    // denormalize

    for (var i = 0; i < received_path_list.length; i++) {
        var sel_path_obj = received_path_list[i]
        var sel_path_array = sel_path_obj.path
        var actual_path_obj = sel_path_array[1]
        var segments = actual_path_obj.segments
        for (var j = 0; j < segments.length; j++) {
            var sel_array = segments[j]
            sel_array[0] = sel_array[0] * background.width
            sel_array[1] = sel_array[1] * background.height
        }
    }


    // restore path_array, bbox_label_dict, bbox_path_dict

    // clean the variables
    bbox_label_dict = new Object()
    bbox_path_dict = new Object()
    path_array = []

    for (var i = 0; i < received_path_list.length; i++) {
        var sel_path_obj = received_path_list[i]
        var sel_path_array = sel_path_obj.path

        var char_val = sel_path_obj.char_value

        var restored_path = new Path()
        restored_path.importJSON(sel_path_array)

        // update fillcolor
        if (char_val != "") {
            restored_path.fillColor = label_good_color
        } else {
            restored_path.fillColor = label_notdone_color
        }



        add_onclick_listener_to_path(restored_path)


        path_array.push(restored_path)
        bbox_path_dict[restored_path] = restored_path
        bbox_label_dict[restored_path] = char_val

    }

    // this is the final stage of loading sequence
    console.log("calling sb_emtpy after restore path")
    sb_empty()

}

$("#go_prev_btn").click(function(e) {

    load_imgno(current_img_index - 1)

})

$("#go_next_btn").click(function(e) {
    load_imgno(current_img_index + 1)
})





function update_current_img_index() {
    $("#current_index_textbox").val(current_img_index + 1)
}

function delete_all_boxes() {
    // todo
    for (var i = 0; i < pred_box_list.length; i++) {
        var pred_box = pred_box_list[i]
        pred_box.path.remove()
    }

    for (var i = 0; i < gt_box_list.length; i++) {
        var gt_box = gt_box_list[i]
        gt_box.path.remove()
    }

    pred_box_list = []
    gt_box_list = []
}


background.onLoad = function() {

    background.opacity = 0.7

    delete_all_boxes()
    adjust_canvas_size()

    current_img_index = attempt_img_index
    update_current_img_index()

    fetch_progress(current_img_index)

}


// update_stats()
load_total_image_count(load_imgno)

function rect_create_fn(boxjsonobj) {
    var img_w = background.width
    var img_h = background.height


    var x = boxjsonobj.x1 * img_w
    var y = boxjsonobj.y1 * img_h
    var w = (boxjsonobj.x2 - boxjsonobj.x1) * img_w
    var h = (boxjsonobj.y2 - boxjsonobj.y1) * img_h

    var rect = new Rectangle(x, y, w, h)
    var rectpath = new Path.Rectangle(rect)

    return rectpath
}

document.custom.rect_create_fn = rect_create_fn

var create_box = document.custom.create_box

var test3_init = document.custom.test3_init
test3_init()