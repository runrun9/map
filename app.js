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
	socket.on("emit_from_client_point",function(data){
		console.log(socket.id+" : "+data.latitude+" , "+data.longitude);
		console.log("count : "+count);
	});

	socket.on("disconnect", function () {
		count--;
	});

});
