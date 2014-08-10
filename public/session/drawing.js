function Drawing(lineColor, lineWidth, composite)
{
    this.lineColor = lineColor;
    this.lineWidth = lineWidth;
    this.composite = composite;
}

Rect.prototype = new Drawing();
Rect.prototype.constructor = Rect;
function Line(lineColor, lineWidth, composite, startPos, endPos)
{
    
}