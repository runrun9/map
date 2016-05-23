var express = require("express"),
	app = express(),
	http = require("http").Server(app);
var io = require('socket.io').listen(http);

var count=0;

app.use(express.static(__dirname+"/public"));
http.listen(process.env.PORT || 3000);
console.log("server starting");

io.sockets.on("connection",function(socket){
	count++;
	socket.emit("reset_count",count);
	socket.broadcast.emit("reset_count",count);
	socket.on("emit_from_client_point",function(data){
		console.log(socket.id+" : "+data.latitude+" , "+data.longitude+" , count : "+count);
		socket.json.broadcast.emit("emit_from_server_point",{
			id: socket.id,
			latitude: data.latitude,
			longitude: data.longitude
		});
	});

	socket.on("disconnect", function () {
		count--;
		socket.broadcast.emit("disconnect_message",socket.id);
		socket.broadcast.emit("reset_count",count);
	});

});
