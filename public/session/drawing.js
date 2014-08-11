function Drawing(lineColor, lineWidth, composite)
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

Drawing.toJSON = function(){
    var temp = {
        "lineColor": this.lineColor,
        "lineWidth": this.lineWidth,
        "composite": this.composite
    };
    return JSON.stringify(temp);
}

Line.prototype = Drawing.prototype;
Line.prototype.constructor = Line;
function Line(context, lineColor, lineWidth, composite, startPos, endPos)
{
    this.setContextColorWidthComposite(context, lineColor, lineWidth, composite);
    this.startPos = startPos;
    this.endPos = endPos;
}
Line.prototype.drawSelf = function(){
    
}
Drawing.toJSON = function(){
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
function Rect(context, lineColor, lineWidth, composite, startPos, dims)
{
    this.setContextColorWidthComposite(context, lineColor, lineWidth, composite);
    this.startPos = startPos;
    this.endPos = endpos;
}
Rect.prototype.drawSelf = function(){
    
}
Drawing.toJSON = function(){
    var temp = {
        "startPos": this.startPos,
        "dims": this.dims,
        "lineColor": this.lineColor,
        "lineWidth": this.lineWidth,
        "composite": this.composite
    };
    return JSON.stringify(temp);
}

