
var path = null;
var path_arrays = [];
var selected_path_array=[]

// The mouse has to drag at least 20pt
// before the next drag event is fired:
tool.minDistance = 10;

drawing_state = false

var total_image_number = 0
var current_image_index =0
var load_attempt_image_index = 0

var slidebar = document.getElementById("progress_slidebar")

slidebar.addEventListener("pointerup", function(){
	console.log("pointer up")
	var new_slidebar_value = this.value
	if(new_slidebar_value != current_image_index){
		goto_specific_imageno(new_slidebar_value)
		
	}
})


$("#current_index_textbox").on("keypress",function(e){
	if(e.which===13){
		$(this).attr("disabled","disabled")

		var inputvalue = $(this).val()

		inputvalue = parseInt(inputvalue)

		if(Number.isInteger(inputvalue)){
			console.log("integer confirmed")

			if(inputvalue<=0 || inputvalue > parseInt(total_image_number)){
				alert("input out of range")
				$(this).val(parseInt(current_image_index+1))
				
			}
			else{
				var zerobase_attempt_index = parseInt(inputvalue -1)
				goto_specific_imageno(zerobase_attempt_index)
			}
			

		}
		else{
			alert("please input an integer")
			$(this).val(parseInt(current_image_index+1))

		}

		$(this).removeAttr("disabled")
	}
})

// var csrftoken = getCookie('csrftoken')

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            console.log(cookies[i])
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        // if (!(csrfSafeMethod(settings.type) && sameOrigin(settings.url))) {
        //     // if (!csrfSafeMethod(settings.type) && !this.crossDomain){
        //     // Send the token to same-origin, relative URLs only.
        //     // Send the token only if the method warrants CSRF protection
        //     // Using the CSRFToken value acquired earlier
        //     // xhr.setRequestHeader("X-CSRFToken", "CcVK5u7uUKZAxa3is9ROgd8o9oX31rLBFc61hePIWgc5WxcerxbMJWizz86Qldok");
        //     xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        // }
        // console.log("adding ",getCookie('csrftoken'))
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    },
    crossDomain: true,
    xhrFields: {
        withCredentials: true
    }
    
});



document.SERVER_BASE_ADDR = window.location.origin

var SERVER_BASE_ADDR = window.location.origin

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


var init_img_url = SERVER_BASE_ADDR+"/img/0"

var background = new Raster({source: init_img_url, position:view.center})
var backrect = null



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

function normalize_paths(segments){
	var img_w = paper.project.view.size.width
	var img_h = paper.project.view.size.height 

	var i
	for(i=0;i< segments.length;i++){
		var sel_segment = segments[i]
		var j
		for(j=0;j<sel_segment.length;j++){
			sel_segment[j][0] = sel_segment[j][0] / img_w
			sel_segment[j][1] = sel_segment[j][1] / img_h
		}

	}
}

function denormalize_paths(segments){
	var img_w = paper.project.view.size.width
	var img_h = paper.project.view.size.height 

	var i
	for(i=0;i< segments.length;i++){
		var sel_segment = segments[i]
		var j
		for(j=0;j<sel_segment.length;j++){
			sel_segment[j][0] = sel_segment[j][0] * img_w
			sel_segment[j][1] = sel_segment[j][1] * img_h
		}

	}
}


function erase_all_paths(){
	var i
	for(i=0;i<path_arrays.length;i++){
		var path = path_arrays[i]
		path.remove()
	}

	path_arrays=[]
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

				reinit_project()
				console.log("fetched path data:", data.pathdata)

				var pathdata=data.pathdata
				var i
				for(i=0;i<pathdata.length;i++){
					var realpathdata = pathdata[i][1]

					var segments = realpathdata.segments
					denormalize_paths(segments)

					var path = new Path(realpathdata)
					path.onClick = function(event){
						this.fullySelected = !this.fullySelected
						
					}
					path_arrays.push(path)


				}

				
			}
			else{
				console.log("fetch saved progress is fail")
				reinit_project()

			}

        }
    })
	
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

}





function return_any_hit_paths(event){
	var i;
	var hit_positive_paths=[]
	console.log("path_arrays size:", path_arrays.length)
	for(i=0;i< path_arrays.length ; i++){
		var sel_path = path_arrays[i]
		console.log(sel_path)
		var hitresult = sel_path.hitTest(event.point, {handles:true, tolerance:10})
		console.log(i,"th try. hitresult: ", hitresult)
		if(hitresult){
			hit_positive_paths.push(sel_path)
		}
	}

	if(hit_positive_paths.length==0){
		return null
	}
	else{
		return hit_positive_paths[0]
	}
}

function return_any_hit_paths_v2(event){
	var hitresult = path.hitTestAll(event.point,{tolerance: 10})
	console.log(hitresult)

	if(hitresult.length==0){
		return null
	}
	else{
		return hitresult[0].item
	}
}

function onMouseDown(event) {


	if (path == null) {
		drawing_state = true
		path = new Path();
		path.strokeColor = 'black';
		path.fullySelected = true;
		return;
	}


	selected_path = return_any_hit_paths(event)


	if (selected_path) {
		drawing_state = false
		path.fullySelected = true;
	}
	else {
		path.fullySelected = false
		drawing_state = true
		path = new Path();
		path.strokeColor = 'black'
		
		path.fullySelected = true;
	}

}

function onMouseDrag(event) {

	console.log(drawing_state)
	if (drawing_state) {
		path.add(event.point);
	}
	else {
		return
	}

}

function update_selected_paths(){
	var i;
	selected_path_array=[]
	for(i=0;i< path_arrays.length;i++){
		var sel_path = path_arrays[i]
		if(sel_path.fullySelected){
			selected_path_array.push(sel_path)
		}
	}
}

function onMouseUp(event) {
	if (drawing_state) {
		path.selected = false;
		path.smooth();
		path.closed = true;
		path.onClick = function(event){
			this.fullySelected = !this.fullySelected
			
		}

		if(path.segments.length<10){
			path.remove()
			update_selected_paths()
			return
		}
		
		path.strokeWidth = 10
		path.fillColor=new Color(1,0,0)
		path.opacity=0.5

		path_arrays.push(path)

	}

	update_selected_paths()

}

function del_selected_paths(){
	var i
	for(i=0;i< selected_path_array.length;i++){
		var sel_path = selected_path_array[i]
		sel_path.remove()
		remove_path_from_total_path_list(sel_path)
	}
}

function remove_path_from_total_path_list(path){
	var i
	for(i=0;i<path_arrays.length;i++){
		if(path===path_arrays[i]){
			path_arrays.splice(i,1)
			console.log("splice done!")
			return
		}
	}

	console.log("no remove from total path array done")
}

function saveprogress(successcallback){
	var exported_json = paper.project.exportJSON({asString:false})
	console.log(exported_json)

	// extract only the paths
	var firstlayer = exported_json[0]

	var what = firstlayer[1]
	console.log(what)


	var patharray=[]
	var i
	for(i=0;i< what.children.length;i++){
		console.log(what.children[i])
		if(what.children[i][0]=="Path"){
			patharray.push(what.children[i])
		}
	}

	var sendjson={}
	sendjson.image_number = current_image_index
	

	// normalize the paths
	for(i=0;i<patharray.length;i++){
		var selpath = patharray[i]
		var segments = selpath[1].segments
		console.log("blah:", selpath[1])
		console.log("before normalizing ", segments[0])
		normalize_paths(segments)
		console.log("after normalizing ", segments[0])
	}

	


	sendjson.path_array=patharray

	saveprogress_url = SERVER_BASE_ADDR+"/saveprogress"


	$.ajax({
		url: saveprogress_url,
		type: 'post',
		xhrFields: {
			withCredentials: true
		},
		data: JSON.stringify(sendjson),
		success: function(data){
			console.log("saveprogress success", data)
			successcallback()
		}
	})
}


function onKeyDown(event){
	console.log(event.key)
	if(event.key=='delete'){
		console.log("delete pressed")
		del_selected_paths()
	}
	
	else if(event.key=='s'){
		saveprogress()
		
	}

	else if(event.key=='a'){
		console.log(path_arrays)
	}

	else if(event.key=="page-down"){
		console.log("page down pressed")
		save_and_goto_next_image()
	}
	else if(event.key=='page-up'){
		console.log("page up pressed")
		save_and_goto_prev_image()
	}
}

function save_and_goto_next_image(){
	saveprogress(goto_next_image)
}

function save_and_goto_prev_image(){
	saveprogress(goto_prev_image)
}

$("#go_prev_btn").click(save_and_goto_prev_image)
$("#go_next_btn").click(save_and_goto_next_image)

