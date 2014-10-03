var canvas = document.getElementById('canvas');
canvasContent = $('#canvasContent');
var imageContainer = $('#imageContainer');
canvas.width = canvasContent.width();
canvas.height = canvasContent.height();




///////////ALL VIDEO AND SOCKET STUFF STARTS HERE//////////////////


//'use strict';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var videoButtonClicked = false;
var gettingUserMedia = false;
var loc = $('#localVideo');
//var gotThisUserMedia = false;
//var constraints = {audio: true, video: true};
var constraints = {
 "audio": true,
 "video": {
  "mandatory": {
   "minWidth": "320",
   "maxWidth": "1280",
   "minHeight": "180",
   "maxHeight": "720",
   "minFrameRate": "5",
  },
  "optional": []
 }
}
var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

/////////////////////////////////////////////

var room = location.pathname.substring(1);
if (room === '') {
//  room = prompt('Enter room name:');
  room = 'foo';
} else {
  //
}

//var socket = io.connect();
//var socket = io("/session");
var dims = {w: canvas.width, h: canvas.height};
if (room !== '') {
  //console.log('Create or join room', room);
  socket.emit('create or join', room, dims);
}

socket.on('created', function (room){
  console.log('Created room ' + room);
  isInitiator = true;
});

//deconstruct the page and warn that it is full
socket.on('full', function (room){
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  //isChannelReady = true;
});

socket.on('joined', function (room){
  console.log('This peer has joined room ' + room);
  //isChannelReady = true;
});

socket.on('peerLeft', function(room){
    console.log("your peer left the room");
    //isChannelReady = false;
    isInitiator = true;
    hangup();
});
socket.on('log', function (array){
  console.log.apply(console, array);
});

////////////////////////////////////////////////

//when this function is called, the client sends an arbitrary message to the server
function sendMessage(message){
	//console.log('Client sending message: ', message);
  // if (typeof message === 'object') {
  //   message = JSON.stringify(message);
  // }
  socket.emit('message', message);
}

//everyone else receives the message, logs it
//if the message is "got user media", then maybeStart is called
// if the message is "offer" and the client is not the initiator and the chat is not already started then maybeStart is also called
socket.on('message', function (message){
  //console.log('Client received message:', message);
  if (message === 'got user media') {
      isStarted = false;
      if(isChannelReady){
        maybeStart();
          doCall();
      }
  } else if (message.type === 'offer') {
    //if (!isInitiator && !isStarted) {
      maybeStart();
    //}
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

function handleUserMedia(stream) {
  //console.log('Adding local stream.');
  //localVideo.src = window.URL.createObjectURL(stream);
    attachMediaStream(localVideo, stream);
  localStream = stream;
    isChannelReady = true;
  sendMessage('got user media');
    gettingUserMedia = false;
    gotThisUserMedia = true;
    videoButtonClicked = false;
  /*if (isInitiator) {
    maybeStart();
  }*/
}

//clear the page for use without the video
//make the image constraints wider
function handleUserMediaError(error){
  //console.log('getUserMedia error: ', error);
    isChannelReady = false;
    if(videoButtonClicked && webrtcDetectedBrowser == "chrome")
    {
        //show popup
        $('#videoDisabledPopup').fadeIn(800);
    }
    videoButtonClicked = false;
    gettingUserMedia = false;
    gotThisUserMedia = false;
    isChannelReady =false;
    socket.emit("leaveRoom", room);
    deselectVideo();
    $('.draggableHelper').draggable({
        containment: '#canvasContent'                         
    });
    $('.image').resizable({
        containment: "#imageContainer",
    });

}

//var constraints = {video: true, audio: true};
if(!gettingUserMedia){
    getUserMedia(constraints, handleUserMedia, handleUserMediaError);
    gettingUserMedia = true;
}

//console.log('Getting user media with constraints', constraints);

if (location.hostname != "localhost") {
  //requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    requestTurn('');
}

function maybeStart() {
    //console.log("isStarted: " + isStarted + " and isChannelReady: " + isChannelReady);
  if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    //console.log('isInitiator: ', isInitiator);
    /*if (isInitiator) {
      doCall();
    }*/
  }
}

window.onbeforeunload = function(e){
	sendMessage('bye');
}

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    //console.log('Created RTCPeerConnnection');
  } catch (e) {
    //console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
      return;
  }
}

function handleIceCandidate(event) {
  //console.log('handleIceCandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate});
  } else {
    //console.log('End of candidates.');
  }
}

/*function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;
}*/

function handleCreateOfferError(event){
  //console.log('createOffer() error: ', e);
}

function doCall() {
  //console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  //console.log('Sending answer to peer.');
  pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
}

function setLocalAndSendMessage(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  pc.setLocalDescription(sessionDescription);
  //console.log('setLocalAndSendMessage sending message' , sessionDescription);
  sendMessage(sessionDescription);
}

function requestTurn(turn_url) {
  var turnExists = false;
  for (var i in pc_config.iceServers) {
    if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    //console.log('Getting TURN server from ', turn_url);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
      	//console.log('Got TURN server: ', turnServer);
        pc_config.iceServers.push({
          'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turn_url, true);
    xhr.send();
  }
}

function handleRemoteStreamAdded(event) {
    //console.log('Remote stream added.');
    attachMediaStream(remoteVideo, event.stream);
  //remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;
    //console.log("remote stream added");
    //play($('#localVideo'), $('#localVideoOverlay'))
    /////////////MAKE THE LOCAL VIDEO START PLAYING AS SOON AS THE REMOTE VIDEO IS ADDED///////////////////
    
}

function handleRemoteStreamRemoved(event) {
  //console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  //console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
//  console.log('Session terminated.');
  // stop();
  // isInitiator = false;
}

function stop() {
  isStarted = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
  pc.close();
  pc = null;
}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
  var sdpLines = sdp.split('\r\n');
  var mLineIndex;
  // Search for m line.
  for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('m=audio') !== -1) {
        mLineIndex = i;
        break;
      }
  }
  if (mLineIndex === null) {
    return sdp;
  }

  // If Opus is available, set it as the default in m line.
  for (i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('opus/48000') !== -1) {
      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      if (opusPayload) {
        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
      }
      break;
    }
  }

  // Remove CN in m line and sdp.
  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
}

function extractSdp(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(' ');
  var newLine = [];
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) { // Format of media starts from the fourth.
      newLine[index++] = payload; // Put target payload to the first.
    }
    if (elements[i] !== payload) {
      newLine[index++] = elements[i];
    }
  }
  return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
  var mLineElements = sdpLines[mLineIndex].split(' ');
  // Scan from end for the convenience of removing an item.
  for (var i = sdpLines.length-1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) {
        // Remove CN payload from m line.
        mLineElements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
}

$('#localVideo, #localVideoOverlay').click(function(){
    //var locVid = $('#localVideo');
    if(loc.get(0).paused)
    {
        if(isChannelReady){  
            play(loc, $('#localVideoOverlay'));
            console.log("telling the remote user to play!");
            socket.emit("playRemote", room);
        }
    }
    else
    {
        pause(loc, $('#localVideoOverlay'));
        console.log("telling the remote user to pause");
        socket.emit("pauseRemote", room);
    }
});

socket.on("pauseRemote", function (){
    console.log("got it, should be pausing remote");
    pause($('#remoteVideo'), $('#remoteVideoOverlay'));
});
socket.on("playRemote", function(){
    console.log("got it should be playing now");
    play($('#remoteVideo'), $('#remoteVideoOverlay'));
});

function play(vid, overlay)
{
    vid.get(0).play();
    overlay.css('display', 'none');
}

function pause(vid, overlay)
{
    vid.get(0).pause();
    overlay.css('display', 'block');
}

//snapshot button is always behind overlay so you can guarantee that it will not be clicked when overlay is present (ie paused)
$('#snapshotButton').click(function(){
    if(isChannelReady)
    {
        var temp = $('#localVideoOverlay').css('background');
        $('#localVideoOverlay').css('background', '#FFF');
        $('#localVideoOverlay').css('display', 'block');
        $('#localVideoOverlay').fadeOut(100);
        setTimeout(function(){
            $('#localVideoOverlay').css('background', temp);
        }, 100);
        makeImage();
    }
});


function makeImage(){
    
    var snapshot = document.getElementById('snapshot');
    var locVid = document.getElementById('localVideo')
    snapshot.width = locVid.clientWidth;
    snapshot.height = locVid.clientHeight;
    var c = snapshot.getContext('2d');
    c.fillRect(0, 0, snapshot.width, snapshot.height);
    c.drawImage(locVid, 0, 0, snapshot.width, snapshot.height);
    
    iurl = snapshot.toDataURL("image/png");
    makeImageHelper(iurl);
    socket.emit("sendImageURL", room, iurl);
    /*maxSelectorIndex++;
    var div = $("<div>", {
        class: 'draggableHelper',
    }).css("display", "inline-block").css("z-index", maxSelectorIndex.toString());
    var img = $('<img>');
    img.attr('src', snapshot.toDataURL("image/png"));
    console.log(snapshot.toDataURL("image/png"));

    //code to be added to production marked
    socket.emit("sendImageURL", room, img.attr("src"));
    //production marked end
    
    
    img.attr('class', 'image ui-widget-content');
    img.appendTo(div);
    div.appendTo($('#imageContainer'));
    
    setImageUI();*/
    
}

socket.on("sendImageURL", function(url){
    makeImageHelper(url);
    /*console.log(url);
    maxSelectorIndex++;
    var div = $("<div>", {
        class: 'draggableHelper',
    }).css("display", "inline-block").css("z-index", maxSelectorIndex.toString());
    var img = $('<img>');
    img.attr('src', url);
    img.attr('class', 'image ui-widget-content');
    img.appendTo(div);
    div.appendTo($('#imageContainer'));
    
    setImageUI();*/
});

function makeImageHelper(url)
{
    maxSelectorIndex++;
    var div = $("<div>", {
        class: 'draggableHelper',
    }).css("display", "inline-block").css("z-index", maxSelectorIndex.toString());
    var img = $('<img>');
    img.attr('src', url);
    img.attr('class', 'image ui-widget-content');
    img.appendTo(div);
    div.appendTo($('#imageContainer'));
    
    setImageUI();
}

//minimize the video by hiding it and showing the "open video" button
$('#minimizeButton').click(function(){
    deselectVideo();
});

//minimize the video by hiding it and showing the "open video" button
$('#closeButton').click(function(){
    deselectVideo();
    $('#localVideoOverlay, #remoteVideoOverlay').css('display', 'none');
    if(localStream != null){ localStream.stop(); }
    isStarted = false;
    gotThisUserMedia = false;
    isChannelReady = false;
});

$('#videoButton').mouseover(function(){
    select($(this));
});

$('#videoButton').mouseout(function(){
    if(videoOpen == false)
    {
        deselect($(this));
    }
});

$('#videoButton').click(function(){
    if(videoOpen == false)
    {
        videoButtonClicked = true;
        select($(this));
        videoOpen = true;
        
        $('#videos').show("slow");
        
        if(!isStarted && !gettingUserMedia)
        {
            getUserMedia(constraints, handleUserMedia, handleUserMediaError);
            gettingUserMedia = true;
        }
    }
});


function deselectVideo()
{
    $('#videos').hide(300);
    videoOpen = false;
    deselect($('#videoButton'));
}


