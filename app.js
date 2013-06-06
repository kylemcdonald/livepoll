
var express = require('express'),
	http = require('http'),
	path = require('path');
var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/status.json', function(req, res){
  res.send(mouseCollection);
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io = require('socket.io').listen(server);

var mouseCollection = new Object();
var newFrame = true;
var userId = 0;
io.sockets.on('connection', function (socket) {

	socket.userId = userId++;

	socket.on('m', function (data) {
		mouseCollection[socket.userId] = data;
		newFrame = true;
	});

	socket.on('disconnect', function() {
		delete mouseCollection[socket.userId];
	});

	socket.emit('id', socket.userId);
});

setInterval(function() {
	if(newFrame) {
		io.sockets.emit('mc', mouseCollection);
		newFrame = false;
	}
}, 100);