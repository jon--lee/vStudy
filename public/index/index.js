$( window ).load(function() {
    var socket = io("/index");
    
    //only if the link needs to be more secure/longer
    socket.on("getUuid", function(code){
        alert("code: " + code); 
    });
    
    var code = makeid();
    console.log(code.length);
    var link = document.URL + code + "/";
    $("#linkInput").val(link);
    
    
    $("#quickSessionButton").click(function(){
        if($("#linkInput").val() != "")
        {
            socket.emit('createSession', code);
            window.location = link;
        }
    });
    
    function makeid()
    {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 15; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
});

