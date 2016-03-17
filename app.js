var express = require("express"),
	app = express(),
	http = require("http").Server(app);
var io = require('socket.io').listen(http);

app.use(express.static(__dirname+"/public"));
http.listen(process.env.PORT || 3000);
console.log("server starting");
