var rect_create_fn
var gt_box_color = 'green'
var pred_box_color = "red"


function init() {
    rect_create_fn = document.custom.rect_create_fn
}

var init_obj = { init: init }

document.custom = new Object()
document.custom.test3_init = init

class Box {
    constructor(boxjsonobj, _type) {
        // create path and keep a reference of it.
        this.char_value = boxjsonobj.char_value
        this.type = _type

        var rectpath = rect_create_fn(boxjsonobj)

        if (_type == "gt") {
            rectpath.fillColor = gt_box_color
        } else if (_type == "pred") {
            rectpath.fillColor = pred_box_color
        } else {
            rectpath.fillColor = 'grey'
        }

        rectpath.opacity = 0.4

        this.path = rectpath
        this.index = boxjsonobj.index
    }

}

function create_box(boxjsonobj, _type) {
    return new Box(boxjsonobj, _type)

}

document.custom.create_box = create_box