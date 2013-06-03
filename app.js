
var express = require('express'),
	http = require('http'),
	path = require('path');
var app = express();

app.set('port', 3000);
app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io = require('socket.io').listen(server);

var mouseCollection = new Object();
var newFrame = true;
io.sockets.on('connection', function (socket) {

	socket.on('mouse', function (data) {
		mouseCollection[socket.id] = data;
		newFrame = true;
	});

	socket.on('update', function() {
		if(newFrame) {
			socket.emit('mouseCollection', mouseCollection);
			newFrame = false;
		}
	});

	socket.on('disconnect', function() {
		delete mouseCollection[socket.id];
	});
});