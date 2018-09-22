var path = null;
var path_arrays = [];
var selected_path_array=[]

// The mouse has to drag at least 20pt
// before the next drag event is fired:
tool.minDistance = 10;

drawing_state = false



console.log(paper.project)


// init

// var raster = new Raster('testimg')
// raster.position = view.center

console.log(paper)



var background = new Raster({source: 'test.png', position:view.center})

var img_original_w = background.width
var img_original_h = background.height

var backrect = new Path.Rectangle({
	point:[0,0],
	size:[img_original_w, img_original_h],
	fillColor: 'white'
})

backrect.sendToBack()

var img_aspect_ratio = img_original_w / img_original_h

console.log("img original w,h:",img_original_w, img_original_h)


var project_width = paper.project.view.size.width
var project_height = paper.project.view.size.height

console.log("original project size:", project_width, project_height)

var changed_project_width = Math.round(project_height * img_aspect_ratio)
var changed_project_height = Math.round(project_height)

// console.log(changed_project_width)



var newsize = new Size(changed_project_width, changed_project_height)

// paper.project.view.size.set(newsize)
paper.view.viewSize.width = changed_project_width
paper.view.viewSize.height = changed_project_height

console.log("new project size:", paper.project.view.size)

background.set({width: changed_project_width, height: changed_project_height, position:view.center})
backrect.set({width: changed_project_width, height: changed_project_height})

console.log("after changed background img size:", background.width, background.height)



// create new project

console.log(background)




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

	console.log("mouse down2222333");

	if (path == null) {
		drawing_state = true
		path = new Path();
		path.strokeColor = 'black';
		path.fullySelected = true;
		return;
	}

	// var hitresult = path.hitTest(event.point, { handles: true, tolerance: 10 })

	selected_path = return_any_hit_paths(event)

	// console.log("hitresult1111", hitresult);

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
	console.log("inside update_selected_paths")
	var i;
	selected_path_array=[]
	for(i=0;i< path_arrays.length;i++){
		var sel_path = path_arrays[i]
		if(sel_path.fullySelected){
			selected_path_array.push(sel_path)
		}
	}

	console.log("updated selected paths size:", selected_path_array.length)

	// for(i=0;i<path_arrays.length;i++){
	// 	console.log(path_arrays[i])
	// }

	console.log(paper.project.view.size)
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


function onKeyDown(event){
	if(event.key=='delete'){
		console.log("delete pressed")
		del_selected_paths()
	}
	
	else if(event.key=='s'){

		var link = document.getElementById("savecanvas")
		
		console.log("s pressed")

		background.visible = false

		paper.view.element.toBlob(function(blob) {
			link.href = URL.createObjectURL(blob);
			// console.log(something)
			console.log(link)
			link.onclick = function(event){
				console.log("inside link onclick")
				background.visible = true

				event.preventDefault()
			};

			console.log("about to click...")
			link.click()

			
		},'image/png')

		

	}

	else if(event.key=='h'){
		console.log('h pressed')

		background.visible= !background.visible
	}
}