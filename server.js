var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var response={users:[]};
var connectedUsers={};
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(path.resolve(__dirname+ '/views/index.html'));
});

io.on('connection', function(socket){

  console.log('a user connected');
  
  socket.on('username',function(data){
    console.log(data.username+' is connected');
    // response.users.push(username);
    response.users.push({name: data.username, socket: socket.id, avatar: data.avatar});
    connectedUsers[socket.id]=socket;
    console.log('ONLINE USERS: ');
    console.log(response.users);
    io.emit('show online users',response);
  });

  socket.on('private message',function(data){
    console.log('PRIVATE MESSAGE RECEIVED');
    var targetID = data.to;
    var fromID = socket.id;
    var targetSocket = connectedUsers[targetID];
    data.msg["fromID"]=fromID;
    //data.msg={fromID:   , type:    , content:    }
    console.log(data.msg);
    targetSocket.emit('private message',data.msg);
  });
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
    var index='';
    // connectedUsers.delete(connectedUsers[socket.id]);
    for(i in response.users){
      if(response.users[i].socket == socket.id){
        index=i;
        break;
      }
    }
    delete connectedUsers[socket.id];
    response.users.splice(index,1);
    io.emit('remove disconnected users',socket.id);
  });
  
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});