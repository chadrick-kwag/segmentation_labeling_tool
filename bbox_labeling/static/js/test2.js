// what
var SERVER_BASE_ADDR = window.location.origin + "/bbxlabeling"
var testimg_url = window.location.origin + "/static/bbox_labeling/testimage.jpg"


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

var popupbox = $("#popup")
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


function adjust_canvas_size() {

    // console.log("inside adjust_canvas_size")

    // console.log(canvas)
    // console.log(width_measure_span.width())

    var img_original_w = background.width
    var img_original_h = background.height

    var img_aspect_ratio = img_original_w / img_original_h



    var project_width = paper.project.view.size.width
    var project_height = paper.project.view.size.height

    // console.log("project_width:" + project_width)
    // console.log("project height:" + project_height)

    // console.log(canvas_col)


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

    // console.log("after adjusted project view width:" + paper.view.viewSize.width)
    // console.log("after adjusted project view height: " + paper.view.viewSize.height)

    canvas.width = project_new_width
    canvas.height = project_new_height



    background.set({ width: project_new_width, height: project_new_height, position: view.center })

    // console.log(canvas)



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

function onMouseDown(event) {

    unselect_all()

    if (drawing_state == false) {
        drawing_state = true

        mouse_down_start_point = event.point

        return
    }
}


function onMouseDrag(event) {
    if (drawing_state) {
        if (drawing_path != null) {
            drawing_path.remove()
        }


        var rectangle = new Rectangle(mouse_down_start_point, event.point)
        drawing_path = new Path.Rectangle(rectangle)
        drawing_path.fillColor = label_good_color
        drawing_path.opacity = 0.5
    }

}

function onMouseUp(event) {
    if (drawing_state) {
        drawing_state = false


        if (drawing_path == null) {
            return
        }

        // check if the drawn box is too small. if so, then ignore it.
        if (is_drawn_box_toosmall(drawing_path)) {
            drawing_path.remove()
            return
        }


        // by now, the drawn box is a valid one. 


        drawing_path.selected = true
        add_onclick_listener_to_path(drawing_path)
            // drawing_path.onClick = function(event) {
            //     console.log(this)
            //     this.selected = true
            //     selected_path = this
            //     show_popupbox_for_selected_path(this)
            // }

        selected_path = drawing_path


        path_array.push(drawing_path)
        drawing_path = null


        show_clean_popupbox()
    }
}


function add_onclick_listener_to_path(givenpath) {
    givenpath.onClick = function(event) {
        console.log(this)
        this.selected = true
        selected_path = this
        show_popupbox_for_selected_path(this)
    }
}

function is_drawn_box_toosmall(drawn_path) {

    var drawn_bounds = drawing_path.bounds // this is in pcoords
        // console.log("drawn bounds:")
        // console.log(drawn_bounds)

    var topleft = drawn_bounds.topLeft
    var bottomRight = drawn_bounds.bottomRight

    var vcoords_bounds_topleft = view.projectToView(topleft)
    var vcoords_bounds_bottomRight = view.projectToView(bottomRight)

    // console.log("vcoords_bounds_topleft")
    // console.log(vcoords_bounds_topleft)

    var vcoords_box_width = vcoords_bounds_bottomRight.x - vcoords_bounds_topleft.x
    var vcoords_box_height = vcoords_bounds_bottomRight.y - vcoords_bounds_topleft.y

    // console.log(vcoords_box_width)

    if (vcoords_box_width < min_drawn_box_width || vcoords_box_height < min_drawn_box_height) {
        return true
    }

    return false




}

function unselect_all() {

    // if popupbox was shown, save it
    var popupbox_visibility = $("#popup").css("visibility")
    if (popupbox_visibility == "visible") {
        save_char_value_in_dict($("#bbox_value").val())
    }

    hide_popupbox()

    console.log("inside unselect_all")
    var i
    console.log(path_array)
    for (i = 0; i < path_array.length; i++) {
        var selpath = path_array[i]
        selpath.selected = false
        console.log(selpath.selected)
    }



    selected_path = null


}

function delete_all_path() {
    for (var i = 0; i < path_array.length; i++) {
        var sel_path = path_array[i]
        sel_path.remove()


    }
}


function delete_selected_path() {
    console.log("inside delete_selected_path")



    if (selected_path == null) {
        return
    }

    delete bbox_label_dict[selected_path]
    delete bbox_path_dict[selected_path]

    var i
    for (i = 0; i < path_array.length; i++) {
        if (selected_path == path_array[i]) {
            console.log("found match")
            selected_path.remove()

            path_array.splice(i, 1)
            break
        }
    }

    update_stats()
    hide_popupbox()
    console.log("called hide_popupbox")

}


function onKeyDown(event) {
    console.log(event.key)
    if (event.key == "delete") {
        delete_selected_path()
    }
    if (event.key == 's') {
        save_current_progress()
    }

}


function show_popupbox() {
    popupbox.css("visibility", "visible")
    $("#bbox_value").focus()

    update_stats()
}

function hide_popupbox() {
    console.log("inside hide_popupbox")
    popupbox.css("visibility", "hidden")

    if (selected_path != null) {
        var bbox_value = $("#bbox_value").val()
        if (bbox_value == "" || bbox_value == null) {
            selected_path.fillColor = label_notdone_color
        } else {
            selected_path.fillColor = label_good_color
        }
    }

    update_stats()
}


$("#bbox_value").keypress(function(e) {

    e.stopPropagation()

    console.log("inside bbox_value's keypress")
    console.log(e)
    if (e.keyCode == 13) {
        save_char_value_in_dict($("#bbox_value").val())
    }
})

$("#save_bbox_info").click(function(e) {
    save_char_value_in_dict($("#bbox_value").val())
})


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

function save_current_progress() {

    sb_save_processing()


    var savedata = new Object()
    savedata["img_index"] = current_img_index

    var path_list = []

    console.log(bbox_label_dict)
    console.log("path number to save: " + Object.keys(bbox_label_dict).length)

    for (var key in bbox_label_dict) {
        var tempobj = new Object()


        // console.log("key")
        // console.log(key)

        var sel_path = bbox_path_dict[key]
        var sel_path_exportjson = sel_path.exportJSON({
            "asString": false
        })

        tempobj["path"] = sel_path_exportjson
            // console.log(sel_path_exportjson)

        normalize_path_json(sel_path_exportjson)

        tempobj["char_value"] = bbox_label_dict[key]

        path_list.push(tempobj)
    }

    savedata["path_list"] = path_list

    // console.log("data to send")
    // console.log(savedata)



    var saveurl = SERVER_BASE_ADDR + "/save"
    $.ajax({
        url: saveurl,
        type: "POST",
        data: JSON.stringify(savedata),
        contentType: "application/json;char-set",
        success: function(data) {
            console.log("save success")
            sb_save_successful()
        },
        error: function(req, err) {
            console.log(err)
            sb_save_failed()

        }
    })
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

$("#manual_save_btn").click(function(e) {
    save_current_progress()
})

$("#statpopover").popover({
    html: true,
    content: function() {
        return $("#stat_div").html()
    }
})


function update_stats() {
    var total_count = path_array.length
    var unlabeled_count = 0

    console.log(bbox_label_dict)
    for (var key in bbox_label_dict) {
        if (bbox_label_dict[key] == "" || bbox_label_dict[key] == null) {
            unlabeled_count++
        }
    }


    console.log("total_count " + total_count)

    $(".total_count_class").text(total_count)
    $(".unlabeled_count_class").text(unlabeled_count)
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
            if (!data.success) {
                restore_paths([])
            } else {
                restore_paths(data.path_list)
            }

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

    sb_loading_icon()

    if (!check_is_imgno_ok(imgno)) {
        return // do nothing
    }

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

$("#lambda_spchar_item").click(function(e) {
    $("#bbox_value").val('λ')
})

$("#micro_spchar_item").click(function(e) {
    $("#bbox_value").val('µ')
})

$("#armstrong_spchar_item").click(function(e) {
    $("#bbox_value").val('Å')
})

$("#triangle_spchar_item").click(function(e) {
    $("#bbox_value").val('Δ')
})

$("#inverse_triangle_spchar_item").click(function(e) {
    $("#bbox_value").val('∇')
})

$("#convert_btn").click(function(e) {
    attempt_convert()
})


function attempt_convert() {
    var targeturl = SERVER_BASE_ADDR + "/convert_check"
    $.ajax({
        url: targeturl,
        type: "get",
        success: function(d) {
            if (!d.check_passed) {
                $("#testmodal").modal('show')
            } else {
                main_convert()
            }

        }
    })
}

function main_convert() {
    var targeturl = SERVER_BASE_ADDR + "/convert"
    $.ajax({
        url: targeturl,
        type: "get",
        success: function(d) {
            if (d.result_dirpath) {
                alert("convert result saved in : " + d.result_dirpath)
            }
        }


    })
}

$("#force_convert_btn").click(function(e) {
    $("#testmodal").modal("hide")
    main_convert()
})

function update_current_img_index() {
    $("#current_index_textbox").val(current_img_index + 1)
}


background.onLoad = function() {

    background.opacity = 0.7

    // console.log("background load finished")
    // console.log("view.center")
    // console.log(view.center)
    delete_all_path()
    adjust_canvas_size()

    current_img_index = attempt_img_index
    update_current_img_index()

    // adjust the view center and background center


    fetch_progress(current_img_index)

}

// console.log("first view center")
// console.log(view.center)

update_stats()
load_total_image_count(load_imgno)

// load_imgno(current_img_index)