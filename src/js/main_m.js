// JavaScript Document
function toggleFilters(e){
	$('.advFilters').slideToggle();
	$('div#footer').toggleClass('ui-footer-fixed');
	$('div#footer').toggleClass('ui-fixed-overlay');
	if($('a#moreBtn > span > span.ui-btn-text').html() == 'More') {
		$('a#moreBtn > span > span.ui-btn-text').html('Less');
		$('span.ui-icon-arrow-u').addClass('ui-icon-arrow-d');
		$('span.ui-icon-arrow-u').removeClass('ui-icon-arrow-u');
	}
	else {
		$('a#moreBtn > span > span.ui-btn-text').html('More');
		$('span.ui-icon-arrow-d').addClass('ui-icon-arrow-u');
		$('span.ui-icon-arrow-d').removeClass('ui-icon-arrow-d');
	}
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
      
        //google.maps.event.addListener(map, "click", placeMarker);
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
	//$('#moreBtn').click(toggleFilters);
	initialize();
	$.mobile.selectmenu.prototype.options.nativeMenu = false;
});