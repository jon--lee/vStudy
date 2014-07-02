var onSelector = false;
$('#pencilButton').css('background', '#41cb41');
$('#pencilDetail').css('background', '#41cb41');

$('#pencilButton').click(function(){
    if(onSelector) {swap();}
});

$('#selectorButton').click(function(){
    if(!onSelector) {swap();}
});


function swap(){
    if(onSelector)
    {
        $('#pencilButton').css('background', '#41cb41');
        $('#pencilDetail').css('background', '#41cb41');
        $('#selectorButton').css('background', '#cbcbcb');
        $('#canvas').css('z-index', 3000);
        $('#canvasContent div').css('z-index', 1);              //converts all divs in canvas content to the back
        $('#canvasContent img').css('border', '1px solid transparent');
    }
    else{
        $('#selectorButton').css('background', '#41cb41');
        $('#pencilButton').css('background', '#cbcbcb');
        $('#pencilDetail').css('background', '#cbcbcb');
        $('#canvas').css('z-index', 1);
        $('#canvasContent div').css('z-index', 3000);               //converts all the divs in canvas content to the front
        
        $('#canvasContent img').css('border', '1px solid #cbcbcb');
    }
    onSelector = !onSelector;
}


$('#pencilDetail').click(function(){
    $('#menuItems ul li div').css('visibility', 'visible');
});


$('#clearButton').mousedown(function(){
    $('#clearButton').css('background', '#41cb41');
});
$('#clearButton').mouseup(function(){
    $('#clearButton').css('background', '#cbcbcb');
});
$('#clearButton').mouseout(function(){
    $('#clearButton').css('background', '#cbcbcb');
});



