var lineWidth = 4;          //default value
var eraserLineWidth = 30;
var lineColor = '#00000'    //default value
var boxMode = false;
const ERASE = "destination-out";  //constant, do not change
const DRAW = "source-over";       //constant, do not change
var composite = DRAW;

//makes it so that all images are resizable
var maxSelectorIndex = 200;
setImageUI();

function setImageUI()
{
    $('.image').resizable({
    containment: "#imageContainer",
    start: function(event, ui){
        console.log("started resizing");
        maxSelectorIndex++;
        $(this).parent().css("z-index", maxSelectorIndex.toString());
    },
    stop: function(event, ui){
        console.log("stopped resizing");    //should send info via websocket now
        sendImage($(this));
    }
});

$('.draggableHelper').draggable({
    containment: '#imageContainer',
    start: function(){
        console.log("Start dragging");
        maxSelectorIndex++;
        $(this).css("z-index", maxSelectorIndex.toString());
    },
    stop: function(){
        console.log("stop dragging");       //should send info via websocket now
        sendImage($(this));
    }
});
}



function sendImage(imageElement)
{
    var image = new Image();
    image.setImage(imageElement);
    socket.emit("sendImage", room, JSON.stringify(image));
}


//http://jqueryui.com/draggable/#events for reading stops and starts and drags
//recommend that when sending info via websocket, only send the stops, or else too much info would jam up the channel

//consider a delay when the user is drawing before sending the info to the other user as there may be lag when continuously sending information.


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

var isDown = false;
var coords = {x: -1, y: -1};
var canvas = document.getElementById('canvas');
canvasContent = $('#canvasContent');
var imageContainer = $('#imageContainer');
canvas.width = canvasContent.width();
canvas.height = canvasContent.height();
//imageContainer.css("width", canvasContent.width() + "px");
//imageContainer.css("height", canvasContent.height() + "px");
/*$(window).resize(function(){
    canvas.width = canvasContent.width();
    canvas.height = canvasContent.height();
});*/

var context = canvas.getContext("2d");
resetContext();
/*context.beginPath();
context.moveTo(100, 150);
context.lineTo(450, 50);
context.lineWidth = defaultLineWidth;
context.lineCap = 'round';
context.stroke();*/

socket.on('sendPaint', function (drawingJSON){
    var drawing = JSON.parse(drawingJSON);
    context.lineWidth = drawing["lineWidth"];
    context.strokeStyle = drawing["lineColor"];
    context.globalCompositeOperation = drawing["composite"];
    context.beginPath();
    context.moveTo(drawing["startCoords"].x, drawing["startCoords"].y);
    context.lineTo(drawing["endCoords"].x, drawing["endCoords"].y);
    context.stroke();
    //now manually reset the styles for this peer
    resetContext();
    
});


socket.on('sendImage', function(imageJSON){
   var image = JSON.parse(imageJSON);
    
});

//MUST BE OFF THE SELECTOR TO DO ANY OF THESE FUNCTIONS

canvas.addEventListener('mousemove', mouseMove);

canvas.addEventListener('mouseup', mouseUp);

canvas.addEventListener('mouseout', mouseUp);

canvas.addEventListener('mousedown', mouseDown);

function mouseMove(evt)
{
    if(isDown && !onSelector && !boxMode){
        var newCoords = getMousePos(canvas, evt);
        context.beginPath();
        context.moveTo(coords.x, coords.y);
        context.lineTo(newCoords.x, newCoords.y);
        context.stroke();
        //send information to the peer
        var drawing = {
            "startCoords": coords,
            "endCoords": newCoords,
            "lineWidth": lineWidth,
            "lineColor": lineColor,
            "composite": composite
        };
        drawingJSON = JSON.stringify(drawing);
        socket.emit("sendPaint", room, drawingJSON);
        coords = newCoords;
        console.log("this is getting called");
    }
    if(boxMode && isDown && !onSelector)
    {
        console.log("drawing box");
        //show the box
        $('#cursor').css('display', 'block');
        var newCoords = getMousePos(canvas, evt);
        var startPos = {};
        startPos.x = coords.x;
        startPos.y = coords.y;
        if(newCoords.x < coords.x)
        {
            startPos.x = newCoords.x;
        }
        if(newCoords.y < coords.y)
        {
            startPos.y = newCoords.y;
        }
        console.log(coords.x + " - " + newCoords.x);
        console.log(coords.y + " - " + newCoords.y);
        var dims = {w: Math.abs(coords.x - newCoords.x), h: Math.abs(coords.y - newCoords.y)};
        $('#cursor').height(dims.h);
        $('#cursor').width(dims.w);
        $('#cursor').css({left: startPos.x + "px", top: startPos.y + "px"});
    }
}
function mouseUp(evt)
{
    isDown = false;
    if(boxMode)
    {
        $('#cursor').css('display', 'none');
        //use the area as an eraser
        var newCoords = getMousePos(canvas, evt);
        var startPos = {};
        startPos.x = coords.x;
        startPos.y = coords.y;
        if(newCoords.x < coords.x)
        {
            startPos.x = newCoords.x;
        }
        if(newCoords.y < coords.y)
        {
            startPos.y = newCoords.y;
        }
        var dims = {w: Math.abs(coords.x - newCoords.x), h: Math.abs(coords.y - newCoords.y)};
        context.beginPath();
        context.rect(startPos.x, startPos.y, dims.w, dims.h);
        context.fillStyle = "rgba(0,0,0,1)";
        context.fill();
        context.stroke();
    }
}

function mouseDown(evt)
{
    isDown = true;
    coords = getMousePos(canvas, evt);
}


$('#colorList li').click(function(e){
    console.log("li clicked");
    if($(this).attr("id") == "eraserButton")
    {
        boxMode = false;
        console.log("eraser clicked");
        lineColor = "rgba(0,0,0,1)";
        composite = ERASE;
        resetContext();
        
    }
    else if($(this).attr("id") == "boxEraserButton")
    {
        boxMode = true;
        lineColor = "rgba(0,0,0,1)";
        composite = ERASE;
        resetContext();
    }
    else
    {
        boxMode = false;
        lineColor = $(this).css("background-color");
        composite = DRAW;
        console.log("line color: " + lineColor);
        resetContext();
    }
    togglePencilOptions();
});




//erase everything on the canvas (including images)
//must also reset the context stuff

$('#clearButton').click(function(){
    canvas.width = canvas.width;
    resetContext();
    hideImages();
});

function resetContext()
{
    
    //context = canvas.getContext('2d');
    if(composite == "destination-out")
    {
        if(boxMode){
            context.lineWidth = 0;
        }
        else {
            context.lineWidth = eraserLineWidth;
        }
    }
    else
    {
        context.lineWidth = lineWidth;
    }
    context.globalCompositeOperation = composite;
    context.strokeStyle = lineColor;
    context.lineCap = 'round';
}
//images are merely hidden from the view, should inquire whether or not this affects performance to have stagnant "images" still on the page.
function hideImages()
{
    $('#imageContainer div').hide(0);
}


////////////END CANVAS SETUP CODE///////////////////