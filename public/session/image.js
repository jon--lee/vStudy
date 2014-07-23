function Image(width, height, x, y, index, id)
{
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.index = index;             //pass in as a string
    this.id = id;
}

Image.prototype.setImage = function(img)
{
    this.width = img.innerWidth();
    this.height = img.innerHeight();
    this.x = img.position().left;
    this.y = img.position().top;
    this.index = img.css('z-index');    //saved as a string
    this.id = img.attr('id');
}

