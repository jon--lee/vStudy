//////////////////////////////////////////////
///////////////DRAWING CLASS//////////////////
//////////////////////////////////////////////
function Drawing(context, color, width, comp)
{
    this.setContextColorWidthComposite(context, color, width, comp);
}
Drawing.prototype.setContextColorWidthComposite = function(context, color, width, comp){
    this.context = context;
    this.lineColor = color;
    console.log("setting color: " + this.lineColor);
    this.lineWidth = width;
    this.composite = comp;
}
Drawing.prototype.drawSelf = function(){
}





//////////////////////////////////////////////
/////////////////LINE CLASS///////////////////
//////////////////////////////////////////////
Line.prototype = Drawing.prototype;
Line.prototype.constructor = Line;
function Line(context, startPos, endPos, color, width, comp)
{
    this.startPos = startPos;
    this.endPos = endPos;
    this.setContextColorWidthComposite(context, color, width, comp);
}
Line.prototype.drawSelf = function(){
    context.lineWidth = this.lineWidth;
    context.globalCompositeOperation = this.composite;
    context.strokeStyle = this.lineColor;
    console.log("drawing with color: " + this.lineColor);
    context.beginPath();
    context.moveTo(this.startPos.x, this.startPos.y);
    context.lineTo(this.endPos.x, this.endPos.y);
    context.stroke();
    
}
Line.prototype.toJSON = function(){
    var temp = {
        "startPos": this.startPos,
        "endPos": this.endPos,
        "lineColor": this.lineColor,
        "lineWidth": this.lineWidth,
        "composite": this.composite
    };
    return JSON.stringify(temp);
}



//////////////////////////////////////////////
/////////////////RECT CLASS///////////////////
//////////////////////////////////////////////

Rect.prototype.setContextColorWidthComposite = Drawing.prototype.setContextColorWidthComposite;
function Rect(context, startPos, dims, color, width, comp)
{
    this.startPos = startPos;
    this.dims = dims;
    this.setContextColorWidthComposite(context, color, width, comp);
}


/*Rect.prototype.toJSON = function(){
    var temp = {
        "startPos": this.startPos,
        "dims": this.dims,
        "lineColor": this.lineColor,
        "lineWidth": this.lineWidth,
        "composite": this.composite
    };
    return JSON.stringify(temp);
}*/





















/*function Drawing(lineColor, lineWidth, composite)
{
    this.lineColor = lineColor;
    this.lineWidth = lineWidth;
    this.composite = composite;
}

Drawing.prototype.setContextColorWidthComposite = function(context, lineColor, lineWidth, composite){
    this.context = context;
    this.lineColor = lineColor;
    this.lineWidth = lineWidth;
    this.composite = composite;
}

Drawing.prototype.drawSelf = function(){
    alert("drawing self");
}

Drawing.prototype.toJSON = function(){
    var temp = {
        "lineColor": this.lineColor,
        "lineWidth": this.lineWidth,
        "composite": this.composite
    };
    return JSON.stringify(temp);
}

Line.prototype = Drawing.prototype;
Line.prototype.constructor = Line;
function Line(context, startPos, endPos, lineColor, lineWidth, composite)
{
    console.log("constructor called");
    this.startPos = startPos;
    this.endPos = endPos;
    this.setContextColorWidthComposite(context, lineColor, lineWidth, composite);
}
Line.prototype.drawSelf = function(){
    console.log("draw self called");
    if(this.lineColor == null || this.lineWidth == null || this.composite == null)
    {
        console.log("darwing this line with default");
        //drawing using default context settings
        context.beginPath();
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(endPos.x, endPos.y);
        context.stroke();
    }
    else
    {
        //drawing using given context settings
        console.log("drawing using other settings");
    }
}
Line.prototype.toJSON = function(){
    console.log("to json called");
    var temp = {
        "startPos": this.startPos,
        "endPos": this.endPos,
        "lineColor": this.lineColor,
        "lineWidth": this.lineWidth,
        "composite": this.composite
    };
    return JSON.stringify(temp);
}




Rect.prototype = Drawing.prototype;
Rect.prototype.constructor = Rect;
function Rect(context, startPos, dims, lineColor, lineWidth, composite)
{
    this.startPos = startPos;
    this.dims = dims;
    this.setContextColorWidthComposite(context, lineColor, lineWidth, composite);
}
Rect.prototype.drawSelf = function(){
    
}
Rect.prototype.toJSON = function(){
    var temp = {
        "startPos": this.startPos,
        "dims": this.dims,
        "lineColor": this.lineColor,
        "lineWidth": this.lineWidth,
        "composite": this.composite
    };
    return JSON.stringify(temp);
}*/

