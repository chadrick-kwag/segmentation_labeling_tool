var SERVER_BASE_ADDR = window.location.origin

$("#go_to_segmentation_tool_btn").click(function (){
    console.log("goto segmentation tool")
    var segmentation_tool_url = SERVER_BASE_ADDR + "/sgmtool"
    location.href = segmentation_tool_url
})

$("#go_to_bbxviewer_btn").click(function (){
    console.log("goto segmentation tool")
    var bbxviewer_url = SERVER_BASE_ADDR + "/bbxviewer"
    location.href = bbxviewer_url
})

$("#go_to_bboxlabeling_btn").click(function (){
    var bbxviewer_url = SERVER_BASE_ADDR + "/bbxlabeling"
    location.href = bbxviewer_url
})


$("#go_to_bbox_pairing_vis").click(function (){
    var targeturl = SERVER_BASE_ADDR + "/bbox_pairing_vis"
    location.href = targeturl
})


$("#go_to_image_classifier").click(function (){
    var targeturl = SERVER_BASE_ADDR + "/imageclassifier"
    location.href = targeturl
})