var fps=1000/30;
var marker=new Object();
var client0,client1,client2,client3,client4;

function initialize() {
  $(function(){
    var socket = io.connect();
    //map表示
    var mapdiv = document.getElementById("map_canvas");
    var latlng = new google.maps.LatLng(35.681382, 139.766084);
    var opts = {
      zoom: 15,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(mapdiv, opts);

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

    //他クライアントのマーカー更新
    socket.on("emit_from_server_point",function(data){
      if(!marker[data.id]){
        marker[data.id] = new google.maps.Marker({
        position: new google.maps.LatLng(data.latitude,data.longitude),
        map: map,
        title: data.id
        });
      }else{
        marker[data.id].setPosition(new google.maps.LatLng(data.latitude,data.longitude));
      }
    });

    //他クライアントマーカー削除
    socket.on("disconnect_message",function(data){
      if(marker[data.id]){
        marker[data.id].setMap(null);
        console.log(data.id+"削除");
      }else{
        console.log(data.id+"削除失敗");
      }
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
