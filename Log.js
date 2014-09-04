function Log(roomId){
    this.actions = [];
    this.roomId = roomId;
}

Log.prototype.getId = function(){
    return this.id;
}

Log.prototype.getActions = function(){
    return this.actions;
}

Log.prototype.addAction = function(action){
    this.actions.push(action);
}

Log.prototype.clear = function(){
    this.actions = [];
}

module.exports = Log;

