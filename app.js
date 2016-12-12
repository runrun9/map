var express = require("express"),
	app = express(),
	routes = require("./routes/routes"),
	http_req = require("http"),
	http = http_req.Server(app);
var io = require('socket.io').listen(http);

var count=0;
var roomList=new Object();
var id_room=new Object();

app.use(express.static(__dirname+"/public"));
http.listen(process.env.PORT || 3000);
console.log("server starting");

//routing
app.get("/json",routes.json)

io.sockets.on("connection",function(socket){
	count++;
	//id送信
	socket.emit("emit_id",socket.id);
	socket.emit("reset_count",count);
	socket.broadcast.emit("reset_count",count);

	//位置情報取得
	socket.on("emit_from_client_point",function(data){
		// console.log(socket.id+" : "+data.latitude+" , "+data.longitude+" , to "+id_room[socket.id]+" , count : "+count);
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

	//OpenData送信
	socket.on("get_OpenData",function(data){
		console.log(data);
		http_req.get(data, function(res){
			var body = '';
		  res.setEncoding('utf8');
			res.on('data', function(chunk){
		      body += chunk;
		  });
		  res.on('end', function(str){
				data = JSON.parse(body);
				for(var i in data){
					socket.json.emit("set_OpenData",{
						latitude:data[i]["http://www.w3.org/2003/01/geo/wgs84_pos#lat"][0]["value"],
						longitude:data[i]["http://www.w3.org/2003/01/geo/wgs84_pos#long"][0]["value"]
					});
	      	socket.json.broadcast.to(id_room[socket.id]).emit("set_OpenData",{
						latitude:data[i]["http://www.w3.org/2003/01/geo/wgs84_pos#lat"][0]["value"],
						longitude:data[i]["http://www.w3.org/2003/01/geo/wgs84_pos#long"][0]["value"]
					});
				}
		  });
		}).on('error', function(e){
		  console.log(e.message); //エラー時
		});
	});

});
