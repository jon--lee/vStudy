var lineWidth = 4;          //default value
var lineColor = '#00000'    //default value

//makes it so that all images are resizable
var maxSelectorIndex = 200;
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

var context;
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
    context.beginPath();
    context.moveTo(drawing["startCoords"].x, drawing["startCoords"].y);
    context.lineTo(drawing["endCoords"].x, drawing["endCoords"].y);
    context.stroke();
    //now reset the styles for this peer
    context.lineWidth = lineWidth;
    context.strokeStyle = lineColor;
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
    if(isDown && !onSelector){
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
            "lineColor": lineColor
        };
        drawingJSON = JSON.stringify(drawing);
        socket.emit("sendPaint", room, drawingJSON);
        coords = newCoords;
    }
}
function mouseUp(evt)
{
    isDown = false;
}

function mouseDown(evt)
{
    isDown = true;
    coords = getMousePos(canvas, evt)
}


$('#colorList li').click(function(e){
    console.log("li clicked");
    lineColor = $(this).css("background-color");
    console.log("line color: " + lineColor);
    resetContext();
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
    context = canvas.getContext('2d');
    context.lineWidth = lineWidth;
    context.strokeStyle = lineColor;
    context.lineCap = 'round';
}
//images are merely hidden from the view, should inquire whether or not this affects performance to have stagnant "images" still on the page.
function hideImages()
{
    $('#imageContainer div').hide(0);
}


////////////END CANVAS SETUP CODE///////////////////