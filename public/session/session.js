$( document ).ready(function() {
    var gotThisUserMedia = false;
    var cookie = readCookie("sc");
                            //THIS IS HERE FOR TESTING AND SHOULD BE PUT IN THE IF(COOKIE==NULL) SECTION FOR PRODUCTION
    var newCode = location.pathname.substring(1, location.pathname.length - 1);
    if(cookie == null || newCode != cookie)
    {
        //display the popup
        showPopup($(".instruction"));
        configureInstructions();
    }
    

    //regardless of what is happening, reset the cookie (because old use may be going to new session
    //var code = location.pathname.substring(1, location.pathname.length - 1);
    createCookie("sc", newCode, 1);
});

function makeid()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function showPopup(obj){
    obj.fadeIn();
}

function configureInstructions(){
    
    $('#popupContent input').val(document.URL);
    $("#copyButton").attr("data-clipboard-text", document.URL);
    $('#popupContent input').select();
    var clip = new ZeroClipboard($("#copyButton"));
}

$('#instructionOverlay, #closePopupButton').click(function(){
    hidePopup(); 
    //$("#mobilePopup").fadeIn(800);
});

function hidePopup(obj){
    if(obj != null)
    {
        obj.fadeOut();
    }
    else
    {
        $('.popup').fadeOut();
    }
}



$('.light').mouseenter(function(){
    $(this).animate({backgroundColor: "#fff" });
}).mouseleave(function(){
    $(this).css('background', "#ebebeb" );
    $(this).css('border', '0px');
}).mousedown(function(){
    $(this).css('border-top', '1px solid transparent');
}).mouseup(function(){
    $(this).css('background', '#fff');
    $(this).css('border', '0px');
});

$('#mobilePopup').click(function(e){
    if(!$(e.target).is('#mobilePopup button')){
        window.open("https://google.com", '_blank');        //send user away and then close this pop up
        hidePopup($(this));
    }
});

$('#videoDisabledPopup').click(function(e){
    if(!$(e.target).is('#videoDisabledPopup button')){
        var link;
        if(webrtcDetectedBrowser == "chrome") {link = "https://support.google.com/chrome/answer/2693767?hl=en";}
        window.open(link, '_blank');        //send user away and then close this pop up
        hidePopup($(this));
    }
});

$('.xButton').click(function(){
    hidePopup($(this).parent().parent());
});
