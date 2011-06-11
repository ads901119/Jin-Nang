// JavaScript Document
var tm;

$(document).ready(function(e){
	// Tabs
	$('#tabs').tabs();
	
	//button set
	$("#format").buttonset();
	$("div#radio").buttonset();
	$("#moreToggle").button();
	$('#moreToggle').click(toggleFilters);
	$('#logBtn').button();
	$('#logBtn2').button();
	
	$( "#new-marker-form" ).dialog({
			height: 500,
			width: 300,
			resizable: false,
			modal: true,
			autoOpen: false,
			buttons: {"建立": submitMsg,
					 Cancel: function() { $( this ).dialog( "close" );}}
	});	
	
	$( "#new" ).button().click(showDialog);
	$( "#other" ).button();
	
	var dates = $( "#from, #to" ).datepicker({
			showButtonPanel: true,
			dateFormat: "yy-mm-dd",
			onSelect: function( selectedDate ) {
				var option = this.id == "from" ? "minDate" : "maxDate",
					instance = $( this ).data( "datepicker" ),
					date = $.datepicker.parseDate(
						instance.settings.dateFormat ||
						$.datepicker._defaults.dateFormat,
						selectedDate, instance.settings );
				dates.not( this ).datepicker( "option", option, date );
			}
		});
	
	// timemap
	var jsonURL = "check?sender=" + uname;

	tm = TimeMap.init({
        mapId: "map_canvas",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required)
        options: {
            eventIconPath: "images/timemap/",
            showMapTypeCtrl: false,
            showMapCtrl: false,
            mapType: "normal"
        },
        datasets: [
            {
            	title: "JSON String Dataset",
            	theme: "orange",
            	id: "mydata",
            	type: "json_string",
            	options: {
                	url: jsonURL    // Must be a local URL
            	}
        	}
        ],
        bandInfo: [ 
            { 
               width:          "70%", 
               intervalUnit:   Timeline.DateTime.WEEK, 
		       intervalPixels: 80,
            }, 
            { 
               width:          "30%", 
               intervalUnit:   Timeline.DateTime.MONTH, 
		       intervalPixels: 330, 
               overview:       true
            } 
       ]
    });
    map = tm.getNativeMap();
    google.maps.event.addListener(map, "rightclick", showMenu);
	google.maps.event.addListener(map, "click", singleClick);
	
	//$("#timelinecontainer").set
	$('div#timelinecontainer').addClass('minimize');
	initializeMap();
});

/*
*  Javascript functions
*/

function submitMsg(e){
	$.ajax({
	   type: "POST",
	   url: "post",
	   data: { 
		   sender: uname,
		   title: $('input#title').val(),
		   message: $('textarea#message').val(),
		   location: eventLocation.lat() + ',' + eventLocation.lng(),
		   type: $('input:radio[name=type]:checked').val(),
		   receiver: 'Shawn',
		   start: $('input#from').val(),
		   end: $('input#to').val()
		   },
	   success: function(msg){
		 alert( "Data Saved!!");
		 $('input#title').val("");
		 $('textarea#message').val("");
		 $('input#from').val("");
		 $('input#to').val("");
	   }
	});
	$( "#new-marker-form" ).dialog('close');
	placeMarker(eventLocation, $('textarea#message').val());
}
function loadMessage(){
	$.ajax({
	   type: "POST",
	   dataType: "json",
	   url: "check",
	   data: { 
		   sender:'Andrew'
		   },
	   success: loadMarker
	});
}
function unidec(str) { 
	return unescape(str.replace(/\\/g, "%")) 
} 
function showDialog(e){
	$("#rightMenu").fadeOut();
	$( "#new-marker-form" ).dialog('open');
}

var showTimeline = false;
function toggleFilters(e){
	if(showTimeline) {
		$('#timeline').addClass('hideBack');
		$('.header').slideDown("", function(){
			$('div#timelinecontainer').addClass('minimize');
		});
		showTimeline = false;
	}
	else {
		$('div#timelinecontainer').removeClass('minimize');
		$('.header').slideUp( "", function (){
			$('#timeline').removeClass('hideBack');
		});
		showTimeline = true;
	}
}