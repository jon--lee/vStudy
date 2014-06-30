$( document ).ready(function() {
    var socket = io();
    
    
    $("#quickSessionButton").click(function(){
        if($("#linkInput").val() != "")
        {
            alert("there's something here");
        }
    });
});

