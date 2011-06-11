//Google map start
var map;
var markers = [];
var infowindow = new google.maps.InfoWindow();
var eventLocation;

// capture mouse
var mouseX;
var mouseY;

document.onmousemove=getMouseCoordinates;

function getMouseCoordinates(event)
{
	ev = event || window.event;
	mouseX = ev.pageX;
	mouseY = ev.pageY;
}

function initializeMap() {
	/*
	var myOptions = {
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true,
		};
	
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	*/
	var browserSupportFlag = false;
	if(navigator.geolocation) {
    	browserSupportFlag = true;
    	navigator.geolocation.getCurrentPosition( function(position) {
      		initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			placeMe(initialLocation);
      		map.setCenter(initialLocation);
      		map.setZoom(13);
    	}, 
		function() {
      		handleNoGeolocation(browserSupportFlag);
		});
	}
	
	function handleNoGeolocation(errorFlag) {
    	if (errorFlag == true) {
      		alert("Geolocation service failed.");
      		initialLocation = new google.maps.LatLng(25.02,121.54);
    	} else {
      		alert("Your browser doesn't support geolocation.");
      		initialLocation = new google.maps.LatLng(25.02,121.54);
    	}
    	map.setCenter(initialLocation);
		placeMe(initialLocation);
  	}
}
function singleClick(event) {
	$("#rightMenu").fadeOut();
}
function placeMe (pos) {
	var marker = new google.maps.Marker({
		position: pos,
		map: map,
		title:"Me",
		content:"I am here!!"
		});
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.content);
    	infowindow.open(map,marker);
  	});
	markers.push(marker);
}
function loadMarker(msg) {
	for (x in msg){	
		//alert(msg[x].Location);
		var latlon = msg[x].Location.split(",");
		var tmp = new google.maps.LatLng(latlon[0], latlon[1]);
		var m = unidec(msg[x].Draft);
		placeMarker(tmp, m);
	}
}
function placeMarker(loc, msg) {
	var marker = new google.maps.Marker({
		position: loc,
		map: map,
		content: msg
		});
		
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.content);
    	infowindow.open(map,marker);
  	});
  	
	markers.push(marker);
}

function showMenu(event) {
	eventLocation = event.latLng;

	leftVal=mouseX+"px";
  	topVal=mouseY+"px";

	$("#rightMenu").css({display:'none',left:leftVal,top:topVal}).slideDown('fast');
}

//Google map end