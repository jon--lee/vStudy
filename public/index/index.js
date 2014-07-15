var cookie = readCookie("sc"); //cookies name for session id should always be "sc" //
if(cookie != null)
{
    console.log("value: " + cookie);
    $("#restore").css("display", "block");
    $("#signUpSection").css("height", "420px");
    $("#restore a").attr("href", cookie + "/");
}
/*else
{
    createCookie("sessioncode", "lol");
}*/

$(document).ready(function(){
    var socket = io("/index");
    
    //only if the link needs to be more secure/longer
    socket.on("getUuid", function(code){
        alert("code: " + code); 
    });
    
    var code;
    var link;
    socket.emit("requestCode");
    socket.on("getCode", function(tcode){
        code = tcode;
        link = document.URL + code + "/";
        $("#linkInput").val(link);
    });
    
    
    $("#quickSessionButton").click(function(){
        if($("#linkInput").val() != "")
        {
            socket.emit('createSession', code);
            window.location = link;
        }
    });
    $("#restoreSessionButton").click(function(){
        if($("#restoreLinkInput").val() != "")
        {
            window.location = restoreLink;
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

