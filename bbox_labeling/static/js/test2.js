// what
var SERVER_BASE_ADDR = window.location.origin + "/bbxlabeling"
var init_img_url = SERVER_BASE_ADDR + "/img/0"
var testimg_url = window.location.origin + "/static/bbox_labeling/testimage.jpg"

var background = new Raster({ source: testimg_url, position: view.center })
var canvas = $("#myCanvas")
var canvas_col = $("#canvas_col")
var width_measure_span = $("#width_measure")

var zoom_factor = 1.25
var _minZoom = 1
var _maxZoom = 10


var drawing_path = null
var drawing_state = false

var mouse_down_start_point = null

var popupbox = $("#popup")

background.onLoad = function() {
    console.log("background load finished")
    adjust_canvas_size()
}


var path_array = []
var selected_path = null


function adjust_canvas_size() {

    console.log("inside adjust_canvas_size")

    console.log(canvas)
    console.log(width_measure_span.width())

    var img_original_w = background.width
    var img_original_h = background.height

    var img_aspect_ratio = img_original_w / img_original_h



    var project_width = paper.project.view.size.width
    var project_height = paper.project.view.size.height

    console.log("project_width:" + project_width)
    console.log("project height:" + project_height)

    console.log(canvas_col)


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



    // var changed_project_width = Math.round(project_height * img_aspect_ratio)
    // var changed_project_height = Math.round(project_height)


    // var newsize = new Size(changed_project_width, changed_project_height)

    paper.view.viewSize.width = project_new_width
    paper.view.viewSize.height = project_new_height

    console.log("after adjusted project view width:" + paper.view.viewSize.width)
    console.log("after adjusted project view height: " + paper.view.viewSize.height)

    canvas.width = project_new_width
    canvas.height = project_new_height



    background.set({ width: project_new_width, height: project_new_height, position: view.center })

    console.log(canvas)



}




// function onResize(event) {
//     // Whenever the window is resized, recenter the path:
//     // path.position = view.center;
//     adjust_canvas_size()
// }


$("#myCanvas").mousewheel(function(event) {
    console.log("what")

    var mousePosition = new paper.Point(event.offsetX, event.offsetY)
    changeZoomCentered(event.deltaY, mousePosition);
})


function changeZoomCentered(delta, mousePos) {
    console.log("inside changezoomcentered")
    if (!delta) {
        return;
    }
    var view = project.view;
    var oldZoom = view.zoom;
    var oldCenter = view.center;
    var viewPos = view.viewToProject(mousePos);

    console.log(viewPos)

    var newZoom
    if (delta > 0) {
        newZoom = view.zoom * zoom_factor
    } else {
        newZoom = view.zoom / zoom_factor
    }


    newZoom = setZoomConstrained(newZoom)
    console.log("newZoom:" + newZoom)
    console.log(newZoom)

    if (newZoom == null) {
        return;
    }

    var zoomScale = oldZoom / newZoom;
    var centerAdjust = viewPos.subtract(oldCenter);
    var offset = viewPos.subtract(centerAdjust.multiply(zoomScale)).subtract(oldCenter);

    view.center = view.center.add(offset);
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

    console.log("returning null")
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
        drawing_path.fillColor = 'blue'
        drawing_path.opacity = 0.5
    }

}

function onMouseUp(event) {
    if (drawing_state) {
        drawing_state = false


        console.log("dddd")
        if (drawing_path == null) {
            return
        }
        drawing_path.selected = true
        drawing_path.onClick = function(event) {
            console.log("debug")
            console.log(this)
            this.selected = true
            selected_path = this
        }


        path_array.push(drawing_path)
        drawing_path = null


        show_popupbox()
            // drawing_path.selected = false
            // drawing_path.smooth()
            // drawing_path.closed = true

        // if (drawing_path.segments.length < 10) {
        //     drawing_path.remove()
        //     return
        // }
    }
}

function unselect_all() {
    console.log("inside unselect_all")
    var i
    console.log(path_array)
    for (i = 0; i < path_array.length; i++) {
        var selpath = path_array[i]
        selpath.selected = false
        console.log(selpath.selected)
    }
}


function delete_selected_path() {
    console.log("inside delete_selected_path")
    if (selected_path == null) {
        return
    }

    var i
    for (i = 0; i < path_array.length; i++) {
        if (selected_path == path_array[i]) {
            console.log("found match")
            selected_path.remove()
            path_array.splice(i, 1)
            return
        }
    }
}


function onKeyDown(event) {
    console.log(event.key)
    if (event.key == "delete") {
        delete_selected_path()
    }
}


function show_popupbox() {
    popupbox.css("visibility", "visible")
}

function hide_popupbox() {
    popupbox.css("visibility", "hide")
}