var onSelector = false;
var videoOpen = true;
var selectedColor = '#45b745'
select($('#pencilButton'));
select($('#pencilDetail'));
select($('#videoButton'));

$('#pencilButton').click(function(){
    if(onSelector) {swap();}
});

$('#selectorButton').click(function(){
    if(!onSelector) {swap();}
});
////////////////////TESTING///////////////////
$('#menuItems ul li').mouseover(function(){
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


$('#pencilDetail').click(function(){
    $('#menuItems ul li div').css('visibility', 'visible');
});



$('#clearButton').mouseout(function(){
    deselect($(this));
});
$('#addButton').mouseout(function(){
    deselect($(this));
});








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


