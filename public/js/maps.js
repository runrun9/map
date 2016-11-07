﻿var fps=1000/30;
var marker=new Object();
var infoWindow=new Object();
var count=0;
var roomname=null;
var id=null;

function initialize() {
  $(function(){
    var socket = io.connect();
    //map表示
    var mapdiv = document.getElementById("map_canvas");
    var latlng = new google.maps.LatLng(35.681382, 139.766084);
    var opts = {
      zoom: 15,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      mapTypeControlOptions: { mapTypeIds: ['my_style', google.maps.MapTypeId.ROADMAP] }
    };
    var map = new google.maps.Map(mapdiv, opts);
    var style =[{
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ hue: '#6d4d38' }, { saturation: '-70' }, { gamma: '0.5' }]
    }];
    var lopanType = new google.maps.StyledMapType(style, {name: 'my_style'});
    map.mapTypes.set('my_style', lopanType);
    map.setMapTypeId('my_style');

    //コンテナ作成
    var container = document.createElement('div');
    createContainer(container);
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(container);

    function createContainer(container) {
      container.style.margin = '10px';
      container.style.padding = '10px';
      container.style.border = '1px solid #000';
      container.style.background = '#FFF';
      container.innerText = "同時接続人数 : "+count;
    }

  //現在地取得
    if (navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(successCallback,errorCallback);
       } else {
         alert("ブラウザが対応していません");
       }

    function successCallback(position) {
      //成功したときの処理
      map.setCenter(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
      // result = '緯度:' + position.coords.latitude + '<br />';
      // result += '経度:' + position.coords.longitude + '<br />';
      // document.getElementById("geo").innerHTML = result;

      //初期マーカー作成
      marker["my_marker"] = new google.maps.Marker({
        position: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
        map: map,
        title: "自分"
      });
      //吹き出し作成
      infoWindow[id] = new google.maps.InfoWindow();
      marker["my_marker"].addListener('click', function() { // マーカーをクリックしたとき
        infoWindow[id].setContent('<div class="infoWindow">部屋 : '+roomname+'</div>');
        infoWindow[id].open(map, marker["my_marker"]); // 吹き出しの表示
      });

      //GPS更新
      var options = { enableHighAccuracy: true };
      watchId = navigator.geolocation.watchPosition(onSuccess,errorCallback,options);
    }
    function errorCallback(error) {
       //失敗のときの処理
       alert("現在地を取得できません");
    }

    function onSuccess(position){
      marker["my_marker"].setPosition(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
      console.log("GPS更新");
      socket.json.emit("emit_from_client_point",{
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    }

    //接続時id取得
    socket.on("emit_id",function(data){
      id=data;
    });

    //他クライアントのマーカー更新
    socket.on("emit_from_server_point",function(data){
      if(!marker[data.id]){
        marker[data.id] = new google.maps.Marker({
        position: new google.maps.LatLng(data.latitude,data.longitude),
        map: map,
        title: data.id
        });
        //吹き出し作成
        infoWindow[data.id] = new google.maps.InfoWindow({
          content: '<div class="infoWindow">部屋 : '+data.room+'</div>'
        });
        marker[data.id].addListener('click', function() { // マーカーをクリックしたとき
          click_infoWindow(data.id);
        });
        make_polygon(data.latitude,data.longitude);
      }else{
        marker[data.id].setPosition(new google.maps.LatLng(data.latitude,data.longitude));
      }
    });

    function make_polygon(lat,long){
      var pos = marker["my_marker"].getPosition();
      var thete = Math.atan2(long-pos.lng(),lat-pos.lat());
      console.log(long);
      console.log(pos.lng());
      console.log(lat);
      console.log(pos.lat());
      console.log(thete);
    }

    //他クライアントマーカークリック時処理
    function click_infoWindow(id){
      infoWindow[id].open(map, marker[id]); // 吹き出しの表示
    }

    //他クライアントマーカー削除
    socket.on("disconnect_message",function(data){
      if(marker[data]){
        marker[data].setMap(null);
        console.log(data+"削除");
      }else{
        console.log(data+"削除失敗");
      }
    });

    //同時接続人数reset
    socket.on("reset_count",function(data){
      count=data;
      console.log(data);
      container.innerText = "同時接続人数 : "+count;
    });

    //入室
    $("#roomForm").submit(function(e){
      e.preventDefault();
      roomname=$("#form").val();
      socket.emit("emit_from_client_in",roomname);
      $("#roomForm").remove();
      console.log(roomname);
    });

    //OpenData選択
    $("li").click(function(e){
      console.log(e.target.id);
      socket.emit("get_OpenData",e.target.id);
    });

    //OpenDataの座標をマーカーとして出力
    socket.on("set_OpenData",function(data){
      temporary_marker= new google.maps.Marker({
        position: new google.maps.LatLng(data.latitude,data.longitude),
        map: map,
        icon: "blue2.png"
      });
    });

    //ループ
    // function loop(){
    //   navigator.geolocation.getCurrentPosition(successCallbackloop,errorCallbackloop);
    //   function successCallbackloop(position) {
    //     marker.setPosition(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
    //   }
    //   function errorCallbackloop(error) {
    //      //失敗のときの処理
    //      alert("現在地を取得できません");
    //   }
    // }

  //クリックでマーカー
    // google.maps.event.addListener(map,"click",function(event){
    //   var marker = new google.maps.Marker({
    //     position: event.latLng,
    //     map: map,
    //     title: "ワイ"
    //   });
    // });

    //infoウィンドウ
    // var infoWindow = new google.maps.InfoWindow({
    //   content: "<h1>自宅</h1>",
    //   position: map.getCenter()
    // });
    // infoWindow.open(map);

    //マーカー
    // var marker = new google.maps.Marker({
    //   position: map.getCenter(),
    //   map: map
    // });
    //マーカークリック動作
    // var infoWindow = new google.maps.InfoWindow({
    //   content: "マーカークリック"
    // });
    // google.maps.event.addListener(marker,"click",function(event){
    //   infoWindow.open(map,marker);
    // });
  // startFunc();
  });
}
