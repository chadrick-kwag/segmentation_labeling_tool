document.SERVER_BASE_ADDR = window.location.origin + "/bbxviewer"

var SERVER_BASE_ADDR = window.location.origin + "/bbxviewer"

var load_attempt_image_index =0
var current_image_index =0
var total_image_number =0

var slidebar = document.getElementById("progress_slidebar")



var init_img_url = SERVER_BASE_ADDR+"/img/0"
var current_box_array=[]

var background = new Raster({source: init_img_url, position:view.center})
var backrect = null

var path_array=[]

fetch_total_image_number()

background.onLoad = function(){

	
	
	current_image_index = load_attempt_image_index

	console.log("current_image_index after backimg onload", current_image_index)

	slidebar.value = current_image_index
	console.log("slidebar value after background onload:", slidebar.value)


	// update current index span value
	// $("#current_index_span").text(parseInt(current_image_index) +1)
	$("#current_index_textbox").val(parseInt(current_image_index) +1)

	
	// path_array=[]
	erase_all_paths()
	console.log("raster onload")

	fetch_savedprogress(current_image_index)

	
}

slidebar.addEventListener("pointerup", function(){
	console.log("pointer up")
	var new_slidebar_value = this.value
	if(new_slidebar_value != current_image_index){
		goto_specific_imageno(new_slidebar_value)
		
	}
})




function fetch_total_image_number() {
   
	var sendaddr = SERVER_BASE_ADDR +"/info"
	
    $.ajax({
        url: sendaddr,
        type: 'get',
        xhrFields: {
            withCredentials: true
        },
        dataType: 'json',
        success: function(data) {
			total_image_number = data.number_of_images
			
			slidebar.setAttribute("max", total_image_number-1)
			
			$("#total_image_number_span").text(total_image_number )

		},
		error: function(e){
			console.log("ajax error occured")
		}
    })
}



function draw_boxes(){
    var i;
    for(i=0;i<current_box_array.length;i++){

        var canvas_w = background.width 
        var canvas_h = background.height

        var box = current_box_array[i]

        var p1 = new Point(canvas_w * box.x1, canvas_h * box.y1)
        var p2 = new Point(canvas_w * box.x2 , canvas_h * box.y2)
        var rect = new Rectangle(p1,p2)
        var path = new Path.Rectangle(rect)

        path.fillColor = 'blue'
        path.opacity = 0.5
        console.log(rect)

        path_array.push(path)
    }

    console.log("draw rect finished")
    
}


function erase_all_paths(){
	var i
	for(i=0;i<path_array.length;i++){
		var path = path_array[i]
		path.remove()
	}

	path_arrays=[]
}


function reinit_project(){

	var img_original_w = background.width
	var img_original_h = background.height

	var img_aspect_ratio = img_original_w / img_original_h



	var project_width = paper.project.view.size.width
	var project_height = paper.project.view.size.height


	var changed_project_width = Math.round(project_height * img_aspect_ratio)
	var changed_project_height = Math.round(project_height)


	var newsize = new Size(changed_project_width, changed_project_height)

	paper.view.viewSize.width = changed_project_width
	paper.view.viewSize.height = changed_project_height


    background.set({width: changed_project_width, height: changed_project_height, position:view.center})
    
    draw_boxes()

}


function fetch_savedprogress(imgno){
	var sendurl = SERVER_BASE_ADDR+"/fetchprogress/" + imgno

	$.ajax({
        url: sendurl,
        type: 'get',

        xhrFields: {
            withCredentials: true
        },
        dataType: 'json',
        success: function(data) {
			if(data.succeed){


                var img_original_w = background.width
                var img_original_h = background.height

                console.log("img_original_w:" + img_original_w + ", img_original_h:" + img_original_h)

                // normalize the coord values
                current_box_array = []
                var i
                for(i=0;i< data.boxes.length;i++){
                    var box = data.boxes[i]

                    box['x1'] /= img_original_w
                    box['x2'] /= img_original_w
                    box['y1'] /= img_original_h
                    box['y2'] /= img_original_h


                    current_box_array.push(box)

                }

				reinit_project()
				console.log("fetched box data:", data.boxes)


				
			}
			else{
				console.log("fetch saved progress is fail")
				reinit_project()

			}

        }
    })
	
}




function goto_next_image(){
	load_attempt_image_index = parseInt(current_image_index)+ 1
	var retval = load_image(load_attempt_image_index)
	if(!retval){
		console.log("cannot proceed to next image index. current imageindex:", current_image_index)
	}
	
}

function goto_specific_imageno(imageno){
	load_attempt_image_index = imageno
	var retval = load_image(load_attempt_image_index)
	if(!retval){
		console.log("cannot execute load_image with new index:", load_attempt_image_index)
	}
}


function goto_prev_image(){
	load_attempt_image_index = parseInt(current_image_index) -1
	var retval = load_image(load_attempt_image_index)
	if(!retval){
		console.log("cannot proceed to prev image index")
	}
}

function load_image(image_number){
	// check if imagenumber is valid
	if(image_number<0 || image_number > (total_image_number-1)){
		return false
	}

	var new_img_url= SERVER_BASE_ADDR+"/img/" + image_number
	background.set({source: new_img_url})

	return true

	
}


$("#go_prev_btn").click(goto_prev_image)
$("#go_next_btn").click(goto_next_image)