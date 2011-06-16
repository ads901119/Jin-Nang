// timemap
var tm;
var map;

// new message form
var title, content, start, end, allFields, tips;

$(document).ready(function(e){
	// Tabs
	$('#tabs').tabs();
	
	//button set
	$("#format").buttonset();
	$("div#radio").buttonset();
	$("#moreToggle").button({icons: {primary: "ui-icon-transferthick-e-w"}});
	$('#moreToggle').click(toggleFilters);
	$('#about').button({icons: {primary: "ui-icon-info"}});
	$('#config').button({icons: {primary: "ui-icon-gear"}});
	$('#logBtn').button();
	$('#logBtn2').button();
	
	// color box set up
	$("#about").colorbox({width:"650", inline:true, href:"#aboutBox"});
	
	if (userkey == "-1") {
	//if (useremail == "") {
		$('#logBtn').colorbox({width:"650", href:"login"});
		$('#logBtn2').colorbox({width:"650", href:"login"});
	}
	
	// New message form
	$( "#new-marker-form" ).dialog({
			height: 530,
			width: 300,
			resizable: false,
			modal: true,
			autoOpen: false,
			buttons: {"建立": submitMsg,
					 Cancel: function() { $( this ).dialog( "close" );}}
	});	
	title = $( "#title" );
	content = $( "#message" );
	start = $( "#from" );
	end = $( "#to");
	allFields = $( [] ).add( title ).add( content ).add( start ).add( end );
	tips = $( ".validateTips" );	
	
	// Right click menu
	$( "#new" ).button({icons: {primary: "ui-icon-tag"}}).click(showDialog);
	$( "#other" ).button({icons: {primary: "ui-icon-star"}});
	
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
    
    if(userkey == "-1") { // Not logged in
    	var dataset = [
        	{
            	title: "Public",
            	theme: "blue",
            	id: "publicMsg",
            	type: "json_string",
            	options: {
                	url: "public"
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
                	url: "public"
            	}
        	},
            {
            	title: "Private",
            	theme: "red",
            	id: "privateMsg",
            	type: "json_string",
            	options: {
                	url: "check"
            	}
        	}
        ];
    }
	
	today = new String;
	d = new Date();
	today = today.concat(d.getFullYear(), "-", d.getMonth()+1,"-", d.getDate());
	//alert(today);
	
	tm = TimeMap.init({
        mapId: "map_canvas",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required)
        scrollTo: today,
        options: {
            eventIconPath: "images/timemap/",
            showMapTypeCtrl: false,
            showMapCtrl: true,
            mapType: "normal"
        },
        datasets: dataset,
        bandInfo: [ 
            { 
               width:          "85%", 
               intervalUnit:   Timeline.DateTime.WEEK, 
		       intervalPixels: 100,
		       theme: theme
            }, 
            { 
               width:          "15%", 
               intervalUnit:   Timeline.DateTime.MONTH, 
		       intervalPixels: 200, 
               overview:       true
            } 
       ]
    });
    map = tm.getNativeMap();
    google.maps.event.addListener(map, "rightclick", showMenu);
	google.maps.event.addListener(map, "click", singleClick);

	$('div#timelinecontainer').addClass('minimize');
	initializeMap();
});

function submitMsg(e){
	if(isValid()){
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
		
		if(start.val() != end.val())
			dat["end"] = end.val();
		
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
			   title: title.val(),
			   message: content.val(),
			   location: eventLocation.lat() + ',' + eventLocation.lng(),
			   type: $('input:radio[name=type]:checked').val(),
			   receiver: 'Shawn',
			   start: start.val(),
			   end: (end.val() ? end.val() : start.val())
			   },
		   success: function(msg){
			 //alert( "Data Saved!!");
			 title.val("");
			 content.val("");
		   }
		});
		$( "#new-marker-form" ).dialog('close');
	}
}
function updateTips( t ) {
	tips.text( t ).fadeIn();
	setTimeout(function() {
		tips.fadeOut();
		allFields.removeClass( "ui-state-error" );
		}, 5000 );
}
function checkNotNull(i, n) {
	if ( i.val() ) {
		return true;
	} else {	
		i.addClass("ui-state-error");
		updateTips("請輸入" + n + "...");
		return false;
	}
}
function isValid(){
	var bValid = true;
	allFields.removeClass( "ui-state-error" );

	bValid = bValid && checkNotNull(title, "標題");
	bValid = bValid && checkNotNull(content, "訊息");
	bValid = bValid && checkNotNull(start, "開始時間");

	return bValid;
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
function notyet(){
	alert("抱歉！此功能尚未完成！");
}
// toggle the visibility of a dataset
function toggleDataset(dsid, toggle) {
    if (toggle) {
        tm.datasets[dsid].show();
    } else {
        tm.datasets[dsid].hide();
    }
}

// Timeline toggle
var showTimeline = false;
function toggleFilters(e){
	if(showTimeline) {
		$('#timeline').addClass('hideBack');
		$('.header').slideDown("", function(){
			$('div#timelinecontainer').addClass('minimize');
		});
		$("div#map").animate({
		    top: "120px"
		  });
		showTimeline = false;
	}
	else {
		$('div#timelinecontainer').removeClass('minimize');
		$('.header').slideUp( "", function (){
			$('#timeline').removeClass('hideBack');
			tm.refreshTimeline();
		});
		$("div#map").animate({
		    top: "280px"
		  });
		showTimeline = true;
	}
}

