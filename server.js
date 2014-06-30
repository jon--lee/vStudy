var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');


/* handling the page loading */

app.get('/', function(req, res){
    res.sendfile('public/index/index.html');
});

app.get('/session/', function(req, res){
    res.sendfile('public/about/index.html');
});

app.get('/testing/', function(req, res){
    res.sendfile('public/session/index.html');
});

app.use(express.static(__dirname + '/public'));

http.listen(process.env.PORT ||3000, function(){
    //console.log('listening on *:3000');
});

/* end handling the page loading */


/* handling the index server side */
var indexNSP = io.of("/index");

indexNSP.on("connection", function(socket){
    socket.on("requestUuid", function(){
        var code = uuid.v4();
        socket.emit("getUuid", code);
    });
    
    //the code that is sent here will determine the new link
    //code should not be a link
    socket.on("createSession", function(code){
        app.get("/" + code + "/", function(req, res){
            res.sendfile('public/session/index.html');
        });
    });
});
/*end handling the index server side */






var sessionNSP = io.of("/session");

var roomsClient = {};

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

	socket.on('create or join', function (room) {
		var numClients = getNumClients(room);

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);
        console.log("there are " + numClients + " in this room");
		if (numClients == 0){
			socket.join(room);
            roomsClient[socket.id].push(room);
			socket.emit('created', room);
		} else if (numClients == 1) {
			sessionNSP.in(room).emit('join', room);
			socket.join(room);
            roomsClient[socket.id].push(room);
			socket.emit('joined', room);
		} else { // max two clients
			socket.emit('full', room);
		}
		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

	});
    
    socket.on("leaveRoom", function(room){
        socket.leave(room);
        console.log("broadcasting to room that peer left");
        socket.broadcast.to(room).emit("peerLeft", room);
        delete roomsClient[socket.id];
    });
    
    socket.on("disconnect", function(){
        for (var i = 0; i < roomsClient[socket.id].length; i++)
        {
            room = roomsClient[socket.id][i];
            socket.leave(room);
            console.log("broadcasting to room that peer left");
            socket.broadcast.to(room).emit("peerLeft", room);
        }
        delete roomsClient[socket.id];
    });
    
});


//the room at key "room" must be defined (this method does not check for that and will throw an error
function getNumClients(room)
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

