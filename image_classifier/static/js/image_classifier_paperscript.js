var SERVER_BASE_ADDR = window.location.origin + "/image_classifier"

var background = new Raster()
var canvas = $("#myCanvas")
var canvas_col = $("#canvas_col")
var width_measure_span = $("#width_measure")


var current_img_index = 0
var attempt_img_index = null


var path_array = []
var selected_path = null
var total_image_count = 0

var sb_timer = null

var save_and_loading_bool = false



var alphabet_char_list = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

var numsymbol_char_list = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '%', '*', '~', '<', '>', '(', ')', '+', '-', '=', '[', ']', '{', '}', '/', '\\', ';', ':', '"', '!', 'µ', 'Å', 'λ', '∇', 'Δ', '.', ',']


function adjust_canvas_size() {


    var img_original_w = background.width
    var img_original_h = background.height

    var img_aspect_ratio = img_original_w / img_original_h



    var project_width = paper.project.view.size.width
    var project_height = paper.project.view.size.height

    console.log("project width")
    console.log(project_width)
    console.log("project height")
    console.log(project_height)

    var column_height = $("#canvas_col").height()
    console.log("column_height")
    console.log(column_height)



    var project_new_width
    var project_new_height
    var column_width = width_measure_span.width()

    var canvas_aspect_ratio = column_height / column_width
    console.log(canvas_aspect_ratio)

    if (canvas_aspect_ratio > 1) {

        project_new_width = column_width
        project_new_height = column_width
    } else {
        project_new_width = column_height
        project_new_height = column_height
    }


    paper.view.viewSize.width = project_new_width
    paper.view.viewSize.height = project_new_height


    canvas.width = project_new_width
    canvas.height = project_new_height

    background.set({ width: project_new_width, height: project_new_height, position: view.center })
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

function save_progress(imgno, callback) {
    if (save_and_loading_bool) {
        return
    }
    save_and_loading_bool = true
    var targeturl = SERVER_BASE_ADDR + "/saveprogress"
    var sendjson = {}
    sendjson["class_value"] = fetch_class_value()
    sendjson["img_index"] = imgno
    $.ajax({
        url: targeturl,
        type: "post",
        contentType: "application/json",
        data: JSON.stringify(sendjson),
        success: function(data) {
            console.log("progress save successful")
            callback()
        },
        error: function(req, e) {
            console.log("error saving progress")
            sb_msg("failed to save data")
        }

    })
}

function fetch_class_value() {
    var class_value_text = $("#class_value_span").text()
    if (class_value_text == "NULL" || class_value_text == "null") {
        return null
    }
    return class_value_text
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
                set_class_value(null)
            } else {
                set_class_value(data.class_value)
            }
            save_and_loading_bool = false

        },
        error: function(req, e) {
            console.log("inside fetch_progress error")
            sb_msg("failed to load saved data")

            save_and_loading_bool = false
        }

    })
}

function set_class_value(classvalue) {

    if (classvalue == null) {
        $("#class_value_span").text("NULL")
        return
    }
    $("#class_value_span").text(classvalue)
}

function check_is_imgno_ok(imgno) {
    if (imgno < 0 || imgno >= total_image_count) {
        return false
    }
    return true
}

function onKeyDown(e) {
    console.log(e)
    if (e.event.altKey == true && e.event.key == "s") {
        console.log("save triggered")
    }

    if (e.event.altKey == false && e.event.ctrlKey == false) {
        var keyvalue = e.event.key
        if (alphabet_char_list.includes(keyvalue)) {
            set_class_value(keyvalue)
        } else if (numsymbol_char_list.includes(keyvalue)) {
            set_class_value(keyvalue)
        }
    }

    if (e.event.key == "ArrowRight") {
        go_to_next()
    }

    if (e.event.key == "ArrowLeft") {
        go_to_prev()
    }

    if (e.event.key == " ") {
        set_class_value("background")
    }

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
    background.set({ source: imgurl, position: view.center })

}


$("#go_prev_btn").click(function(e) {

    go_to_prev()

})

$("#go_next_btn").click(function(e) {
    go_to_next()
})

function go_to_specific_imgno(imgno) {
    attempt_img_index = imgno
    save_progress(current_img_index, load_specific_imgno)
}

function go_to_next() {
    save_progress(current_img_index, load_next_imgno)

}

function go_to_prev() {
    save_progress(current_img_index, load_prev_imgno)

}

function load_specific_imgno() {
    load_imgno(attempt_img_index)
}

function load_next_imgno() {
    load_imgno(current_img_index + 1)
}

function load_prev_imgno() {
    load_imgno(current_img_index - 1)
}

function update_current_img_index() {
    $("#current_index_textbox").val(current_img_index + 1)
}


background.onLoad = function() {


    adjust_canvas_size()

    current_img_index = attempt_img_index
    update_current_img_index()

    fetch_progress(current_img_index)

}

function fetch_unlabeled_index() {
    var targeturl = SERVER_BASE_ADDR + "/fetch_unlabeled_index"
    $.ajax({
        url: targeturl,
        type: "get",
        success: function(data) {
            console.log(data)
            if (data.img_index == null) {
                alert("no unlabeled images found")
            } else {
                load_imgno(data.img_index)
            }
        },
        error: function(req, e) {
            sb_msg("failed to fetch unlabeled index")
        }

    })
}

$("#find_unlabeld_button").click(function(e) {
    fetch_unlabeled_index()
})


$("#micro_spchar_button").click(function(e) {
    set_class_value('µ')
})
$("#armstrong_spchar_button").click(function(e) {
    set_class_value('Å')
})
$("#lambda_spchar_button").click(function(e) {
    set_class_value('λ')
})
$("#inverse_triangle_spchar_button").click(function(e) {
    set_class_value('∇')
})
$("#triangle_spchar_button").click(function(e) {
    set_class_value('Δ')
})


$("#current_index_textbox").keypress(function(e) {
    e.stopPropagation()
    console.log(e)
    if (e.keyCode == 13) {
        var target_imgno = $("#current_index_textbox").val()
        var int_target_imgno = parseInt(target_imgno)
        console.log(int_target_imgno)
        if (int_target_imgno == null) {
            update_current_img_index()
        } else {
            int_target_imgno--
            go_to_specific_imgno(int_target_imgno)
        }

    }

})



load_total_image_count(load_imgno)