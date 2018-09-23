$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

var channelsocket = null
function try_connect_channel(){
    channelsocket = new WebSocket('ws://'+ window.location.host+"/convertprogress")
    channelsocket.onmessage = function(e){
        console.log(e)
    }
    channelsocket.onclose = function(e){
        console.log("channel socket closed", e)
    }
    channelsocket.onopen= function(e){
        console.log("channel socket open")
        channelsocket.send(JSON.stringify({
            'message': "whaaaaat"
        }))
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

            try_connect_channel()
        }
    })
})

