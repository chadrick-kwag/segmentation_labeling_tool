$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})


$("#convert_btn").click(function(){

    var targeturl = document.SERVER_BASE_ADDR +"/convert"
    $.ajax({
        url: targeturl,
        type: 'get',
        dataType:'json',
        success: function(data){
            console.log(data.launch_possible)
        }
    })
})

