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
	var theme = Timeline.ClassicTheme.create();
    theme.event.track.gap = 0;
    //theme.event.tape.height = 16;
    
    if(userkey == "-1") {
    	var dataset = [
        	{
            	title: "Public",
            	theme: "blue",
            	id: "publicMsg",
            	type: "json_string",
            	options: {
                	url: "check"    // Must be a local URL
            	}
        	}];
    	
    }
    else {
    	var dataset = [
        	{
            	title: "Public",
            	theme: "blue",
            	id: "publicMsg",
            	type: "json_string",
            	options: {
                	url: "check"    // Must be a local URL
            	}
        	},
            {
            	title: "Private",
            	theme: "green",
            	id: "privateMsg",
            	type: "json_string",
            	options: {
                	url: "check?sender=" + userkey   // Must be a local URL
            	}
        	}
        ];
    }

	tm = TimeMap.init({
        mapId: "map_canvas",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required)
        options: {
            eventIconPath: "images/timemap/",
            showMapTypeCtrl: false,
            showMapCtrl: false,
            mapType: "normal"
        },
        datasets: dataset,
        bandInfo: [ 
            { 
               width:          "70%", 
               intervalUnit:   Timeline.DateTime.WEEK, 
		       intervalPixels: 100,
		       theme: theme
            }, 
            { 
               width:          "30%", 
               intervalUnit:   Timeline.DateTime.MONTH, 
		       intervalPixels: 200, 
               overview:       true
            } 
       ]
    });
    map = tm.getNativeMap();
    google.maps.event.addListener(map, "rightclick", showMenu);
	google.maps.event.addListener(map, "click", singleClick);
	
	//$("#timelinecontainer").set
	$('div#timelinecontainer').addClass('minimize');
	//initializeMap();
});

function submitMsg(e){
	var dat = {	
				"start" : $('input#from').val(),
                "point" : {
                    "lat" : eventLocation.lat(),
                    "lon" : eventLocation.lng() 
                    },
                "title" : $('input#title').val(),
                "options" : {
                   	"description": $('textarea#message').val() 
                   	}
               };
	
	if($('input#from').val() != $('input#to').val())
		dat["end"] = $('input#to').val();
	
	if($('input:radio[name=type]:checked').val() == "0")
		tm.datasets['publicMsg'].loadItem(dat);
	else 
		tm.datasets['privateMsg'].loadItem(dat);
	
	tm.refreshTimeline();
	
	$.ajax({
	   type: "POST",
	   url: "post",
	   data: { 
		   sender: userkey,
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
	   }
	});
	$( "#new-marker-form" ).dialog('close');
	
	//placeMarker(eventLocation, $('textarea#message').val());
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
// toggle the visibility of a dataset
function toggleDataset(dsid, toggle) {
    if (toggle) {
        tm.datasets[dsid].show();
    } else {
        tm.datasets[dsid].hide();
    }
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