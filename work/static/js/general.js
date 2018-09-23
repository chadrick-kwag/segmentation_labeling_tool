$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

var channelsocket = null
function try_connect_channel(){
    channelsocket = new WebSocket('ws://'+ window.location.host+"/convertprogress")
    channelsocket.onmessage = function(e){
        console.log(e)
        var datajson = JSON.parse(e.data)
        if(datajson.progress!=null){
            var progress = parseFloat(datajson.progress).toFixed(2) * 100
            console.log(progress)
    
            update_progress_value(progress)
        }
        


    }
    channelsocket.onclose = function(e){
        console.log("channel socket closed", e)
    }
    channelsocket.onopen= function(e){
        show_mask()
        console.log("channel socket open")
        
    }
    
}

$("#convert_btn").click(function(){

    var targeturl = document.SERVER_BASE_ADDR +"/convert"
    $.ajax({
        url: targeturl,
        type: 'get',
        dataType:'json',
        success: function(data){
            console.log(data.launch_possible)

            if(data.launch_possible){
                try_connect_channel()
            }
            else{
                alert("cannot launch conversion due to incomplete labeling")
            }

            
        }
    })
})

function show_mask(){
    console.log("triggered show_mask")
    $("#progress_screen").width("100%")
}

function hide_mask(){
    console.log("triggered hide_mask")
    $("#progress_screen").width("0%")
}

function update_progress_value(newvalue){
    var newtext = newvalue + "%"
    $("#progress_textspan").text(newtext)

    if(newvalue=="100"){
        console.log("setting timeout for closing")
        setTimeout(hide_mask, 1000)
    }
}

$("#close_overlay_btn").click(hide_mask)