
var gotThisUserMedia = false;
var cookie = readCookie("sc");
showPopup($(".instruction"));                        //THIS IS HERE FOR TESTING AND SHOULD BE PUT IN THE IF(COOKIE==NULL) SECTION FOR PRODUCTION
configureInstructions();
if(cookie == null)
{
    //display the popup
    console.log("the pop up menu is being displayed! jk there's nothing cuz i'm lazy");
}
else
{
    console.log("this user has already used this site! don't do anything!");
}
//regardless of what is happening, reset the cookie (because old use may be going to new session
var code = location.pathname.substring(1, location.pathname.length - 1);
createCookie("sc", code);


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
});

function hidePopup(){
    $('.popup').fadeOut();
}


