var onSelector = false;
var videoOpen = true;
var selectedColor = '#45b745'
select($('#pencilButton'));
select($('#pencilDetail'));
select($('#videoButton'));

$('#videos').draggable({
    containment: "#content",
    cancel: "video, #options, .videoOverlay"
});


$('#pencilButton').click(function(){
    if(onSelector) {swap();}
});

$('#selectorButton').click(function(){
    if(!onSelector) {swap();}
});
////////////////////TESTING///////////////////
$('#menuItems ul li:not(#colorList > li)').mouseover(function(){
    select($(this));
});


$('#pencilButton').mouseover(function(){
    select($(this));
    select($('#pencilDetail'));
});
$('#pencilDetail').mouseover(function(){
    select($('#pencilButton'));
    select($(this));
});
$('#pencilButton').mouseout(function(){
    if(onSelector)
    {
        deselect($(this));
        deselect($('#pencilDetail'));
    }
});
$('#pencilDetail').mouseout(function(){
    if(onSelector)
    {
        deselect($(this));
        deselect($('#pencilButton'));
    }
});

$('#selectorButton').mouseout(function(){
    if(!onSelector)
    {
        deselect($(this));
    }
});

$('#pencilDetail').click(togglePencilOptions);
$('#colorList, #pencilOptions').click(function(e){
    e.stopPropagation();
});

$('#clearButton, #addButton').mouseout(function(){
    deselect($(this));
});


//////////////////////END TESTING ///////////////////////

function swap(){
    if(onSelector)
    {
        select($('#pencilButton'));
        select($('#pencilDetail'));
        deselect($('#selectorButton'));
        $('#canvas').css('z-index', 7999);
        $('#canvasContent img').css('border', '1px solid transparent');
    }
    else{
        select($('#selectorButton'));
        deselect($('#pencilButton'));
        deselect($('#pencilDetail'));
        $('#canvas').css('z-index', 1);
        
        $('#canvasContent img').css('border', '1px solid #cbcbcb');
    }
    onSelector = !onSelector;
}



function togglePencilOptions()
{
    if($('#pencilOptions').css('display') == 'none')
    {
        $('#pencilOptions').css('display', 'block');
    }
    else
    {
        $('#pencilOptions').css('display', 'none');
    }
}







function select(obj)
{
    obj.css('background', selectedColor);
}

function deselect(obj)
{
    obj.css('background', 'transparent');
}


//minimize the video by hiding it and showing the "open video" button
$('#minimizeButton').click(function(){
    
});


