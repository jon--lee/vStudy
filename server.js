var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');
var Log = require('./Log.js');


/* handling the page loading */

app.get('/', function(req, res){
    res.sendfile('public/index/index.html');
});

app.get('/session/', function(req, res){
    res.sendfile('public/about/index.html');
});



app.use(express.static(__dirname + '/public'));

http.listen(process.env.PORT ||3000, function(){
    console.log('hey, listening on ' + process.env.PORT);
});
/* end handling the page loading */

//list of all the sessions by their id codes
sessions = [];

/* handling the index server side */
var indexNSP = io.of("/index");

indexNSP.on("connection", function(socket){
    socket.on("requestUuid", function(){
        var code = uuid.v4();
        socket.emit("getUuid", code);
    });
    
    socket.on("requestCode", function(){
        var code =  makeid();
        while(sessions.indexOf(code) > -1)
            code = makeid();
        socket.emit("getCode", code);
    });
    
    //the code that is sent here will determine the new link
    //code should not be a link
    socket.on("createSession", function(code){
        sessions.push(code);
        app.get("/" + code + "/", function(req, res){
            res.sendfile('public/session/index.html');
        });
    });
});
/*end handling the index server side */


function makeid()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}



var sessionNSP = io.of("/session");

var roomsClient = {};

sessionsData = {};

//each session will look like this
/*
sessions[room] = {
    dims: {x: 100, y: 100},
    log: new Log(room)
}
*/

var sessionLogs = {};
var sessionsImages = {};


//io.sockets.on('connection', function (socket){
sessionNSP.on('connection', function (socket){
    roomsClient[socket.id] = [];
	function log(){
		var array = [">>> Message from server: "];
	  for (var i = 0; i < arguments.length; i++) {
	  	array.push(arguments[i]);
	  }
	    socket.emit('log', array);
	}

    //the server receives this message, logs it, then sends it right back to everyone else
	socket.on('message', function (message) {
		log('Got message: ', message);
    // For a real app, should be room only (not broadcast)
		socket.broadcast.emit('message', message);
	});

	socket.on('create or join', function (room, localDims) {
		var numClients = getNumClients(room);
        //console.log("got dims -- h: " + localDims.h + " and w: " + localDims.w);
		//log('Room ' + room + ' has ' + numClients + ' client(s)');
		//log('Request to create or join room', room);
		if (numClients == 0){
			socket.join(room);
            socket.emit('joined', room);
            roomsClient[socket.id].push(room);
			socket.emit('created', room);
		} else if (numClients == 1) {
			sessionNSP.in(room).emit('join', room);
			socket.join(room);
            roomsClient[socket.id].push(room);
			socket.emit('joined', room);
		} else { // max two clients
            socket.join(room);
			socket.emit('full', room);
		}
        
        //create logs if non-existant
        if(sessionsData[room] == null){
            sessionsData[room] = {dims: localDims, log: new Log(room)};
        }
        else    //load the logs as they do exist already
        {
            var actions = sessionsData[room].log.getActions();
            var modifiedDims = {w: localDims.w, h: localDims.h};
            if(sessionsData[room].dims.w > modifiedDims.w)
            {
                modifiedDims.w = sessionsData[room].dims.w;
            }
            if(sessionsData[room].dims.h > modifiedDims.h)
            {
                modifiedDims.h = sessionsData[room].dims.h;
            }
            //sending paint actions
            socket.nsp.to(room).emit("updateDims", modifiedDims);
            for (var i = 0; i < actions.length; i++){    
                    //socket.emit("sendAction", actions[i]);    // this is not used because the canvas size is updated so everyone must have new stuff
                    socket.nsp.to(room).emit("sendAction", actions[i]);
            }
        }
        
        
        
        
		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

	});
    socket.on("leaveRoom", function(room){
        console.log("leave room called");
        //socket.leave(room);
        
        socket.broadcast.to(room).emit("peerLeft", room);
        //delete roomsClient[socket.id];
        removeFromRoom(room, socket.id);
        
    });
    socket.on("disconnect", function(){
        console.log("disconnnect called");
        /*if(roomsClient[socket.id] != null){
            for (var i = 0; i < roomsClient[socket.id].length; i++)
            {
                room = roomsClient[socket.id][i];
                socket.leave(room);
                socket.broadcast.to(room).emit("peerLeft", room);
                removeFromRoom(room, socket.id);
            }
            delete roomsClient[socket.id];
        }*/
    });
    
    //should log this
    socket.on("sendPaint", function(room, drawingJSON){
        sessionsData[room].log.addAction(drawingJSON);
        socket.broadcast.to(room).emit("sendAction", drawingJSON);
    });
    
    //should log this
    socket.on("sendImage", function(room, imageJSON){
        //console.log(imageJSON);
    });
    
    
    socket.on("sendImageURL", function(room, url, id){
        var action = {
            "url": url,
            "id": id,
            "style": "newImage"
        }
        sessionsData[room].log.addAction(JSON.stringify(action));
        socket.broadcast.to(room).emit("sendImageURL", url, id);
    });
    
    socket.on("sendImageCoordsDims", function(room, id, x, y, w, h){
        var action = {
            "id": id,
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "style": "image"
        }
        sessionsData[room].log.addAction(JSON.stringify(action));
        socket.broadcast.to(room).emit("sendImageCoordsDims", id, x, y, w, h);
    });
    
    socket.on("clearLogs", function(room){
        sessionsData[room].log.clear();
    });
    
    socket.on("pauseRemote", function(room){
        socket.broadcast.to(room).emit("pauseRemote");
    });
    socket.on("playRemote", function(room){
        socket.broadcast.to(room).emit("playRemote");
    });
    
});

function removeFromRoom(room, socketid)
{
    var i = roomsClient[socketid].indexOf(room);
    if(i>-1){ roomsClient[socketid].splice(i,1); }
}


function getNumClients(room)
{
    var roomlist = sessionNSP.adapter.rooms[room];
    var numClients = 0;
    if(roomlist){
        for (var id in roomlist){
            numClients++;
        }
    }
    return numClients;
}

//the room at key "room" must be defined (this method does not check for that and will throw an error
/*function getNumClient2(room)
{
    var count = 0;
    for (var clientId in roomsClient)
    {
        var i = roomsClient[clientId].indexOf(room);
        if(i > -1)
        {
            count++;
        }
    }
    return count;
}

function getNumClients3(roomid){
    var room = io.sockets.adapter.rooms[roomid];
    localCount = 0;
    if (room) {
        for (var id in room) {
            localCount ++;
        }
    }
    else
    {
        console.log("no room!");
    }
    return localCount;
}
*/
function findClientsSocketByRoomId(roomId) {
var res = []
, room = io.sockets.adapter.rooms[roomId];

if (room) {
    for (var id in room) {
    res.push(io.sockets.adapter.nsp.connected[id]);
    }
}
return res;

}

