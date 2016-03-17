function initialize() {
  var useragent = navigator.userAgent;
  var mapdiv = document.getElementById("map_canvas");

  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapdiv.style.width = '600px';
    mapdiv.style.height = '600px';
  } else {
    mapdiv.style.width = '600px';
    mapdiv.style.height = '600px';
  }
  var latlng = new google.maps.LatLng(35.873438, 139.731934);
  var opts = {
    zoom: 15,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(mapdiv, opts);

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position){
      map.setCenter(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
    },function(){
      alert("現在地を取得できません");
    })
  }else{
    alert("ブラウザが対応していません");
  }

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

}
