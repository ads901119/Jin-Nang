// JavaScript Document
$(function(){
  // Tabs
  $('#tabs').tabs();
  
  //button set
  $( "#format" ).buttonset();
  $( "#moreToggle" ).button();
  
  //Time slider
  $( "#slider-range" ).slider({
	  range: true,
	  min: 0,
	  max: 70,
	  values: [ 0, 24 ],
	  slide: function( event, ui ) {
		  $( "#amount" ).val( ui.values[ 0 ] + "小時 - " + ui.values[ 1 ] + "小時後的訊息" );
	  }
  });
  $( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 ) + "小時 - " + $( "#slider-range" ).slider( "values", 1 ) + "小時後的訊息");
});
function toggleFilters(e){
	$('.header').slideToggle();
	$('.advFilters').slideToggle();
}
			
//Google map start
var map;
    var markers = [];
    var infowindow = new google.maps.InfoWindow();
    function initialize() {
        var latlng = new google.maps.LatLng(25.02,121.54);
        var myOptions = {
            zoom: 15,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            
            navigationControl: true,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.DEFAULT
            },
            mapTypeControl: false 
            
        };
        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      
        google.maps.event.addListener(map, "click", placeMarker);
        geocoder = new google.maps.Geocoder();
    }
    
    function placeMarker(event) {
        //if (marker)
        //    marker.setMap(null);  // clear the old marker
        var marker = new google.maps.Marker({
			position: event.latLng,
			map: map
        });
		markers.push(marker);
		
		content = "TODO";
        infowindow.setContent(content);
        infowindow.open(map, marker);
    }
    


/*
     results[]: {
        types[]: string,
        formatted_address: string,
        address_components[]: {
            short_name: string,
            long_name: string,
            types[]: string
        },
        geometry: {
            location: LatLng,
            location_type: GeocoderLocationType
            viewport: LatLngBounds,
            bounds: LatLngBounds
        }
     }
*/
//Google map end

$(document).ready(function(e){
	$('#moreToggle').click(toggleFilters);
	initialize();
});