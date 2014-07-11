var cookie = readCookie("sc");
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