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

function initialize() {
	//var latlng = new google.maps.LatLng(25.02,121.54);
	var myOptions = {
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true,
		};
	
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	//map.disableDragging(); 
	//map.disableDoubleClickZoom();
	var browserSupportFlag = false;
	if(navigator.geolocation) {
    	browserSupportFlag = true;
    	navigator.geolocation.getCurrentPosition( function(position) {
      		initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			placeMe(initialLocation);
      		map.setCenter(initialLocation);
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
	
	google.maps.event.addListener(map, "rightclick", showMenu);
	google.maps.event.addListener(map, "click", singleClick);
	geocoder = new google.maps.Geocoder();
}
function singleClick(event) {
	$("#toolbar").fadeOut();
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
	//$("div#map-menu").slideDown();
	leftVal=mouseX+"px";
  	topVal=mouseY+"px";

	$("#toolbar").css({display:'none',left:leftVal,top:topVal}).slideDown('fast');
	/*
	$( "#map-menu" ).dialog({
			height: 170,
			width: 300,
			resizable: false,
			modal: true
	});
	
	
	var marker = new google.maps.Marker({
		position: event.latLng,
		map: map
		});
	
	markers.push(marker);
		
	content = "TODO";
    infowindow.setContent(content);
	infowindow.open(map, marker);
	*/
}

//Google map end