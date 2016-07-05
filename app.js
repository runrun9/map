var express = require("express"),
	app = express(),
	http = require("http").Server(app);
var io = require('socket.io').listen(http);

var count=0;
var roomList=new Object();
var id_room=new Object();

app.use(express.static(__dirname+"/public"));
http.listen(process.env.PORT || 3000);
console.log("server starting");

io.sockets.on("connection",function(socket){
	count++;
	//id送信
	socket.emit("emit_id",socket.id);
	socket.emit("reset_count",count);
	socket.broadcast.emit("reset_count",count);
	socket.on("emit_from_client_point",function(data){
		console.log(socket.id+" : "+data.latitude+" , "+data.longitude+" , count : "+count);
		socket.json.broadcast.to(id_room[socket.id]).emit("emit_from_server_point",{
			id: socket.id,
			room: id_room[socket.id],
			latitude: data.latitude,
			longitude: data.longitude
		});
	});

	socket.on("disconnect", function () {
		count--;
		roomList[id_room[socket.id]]--;
		socket.leave(id_room[socket.id]);
		socket.broadcast.emit("disconnect_message",socket.id);
		socket.broadcast.emit("reset_count",count);
	});

	//入室
	socket.on("emit_from_client_in", function (data) {
		if(!roomList[data]){
			roomList[data]=1;
			socket.join(data);
			id_room[socket.id]=data;
			console.log("create : "+data);
			console.log("count : "+roomList[data]);
		}
		else{
			roomList[data]++;
			socket.join(data);
			id_room[socket.id]=data;
			console.log("joined : "+data);
			console.log("count : "+roomList[data]);
		}
	});

});
