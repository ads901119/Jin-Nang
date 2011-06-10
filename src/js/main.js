// JavaScript Document
$(function(){
	// Tabs
	$('#tabs').tabs();
	
	//button set
	$("#format").buttonset();
	$("div#radio").buttonset();
	$("#moreToggle").button();
	$('#logBtn').button();
	$('#logBtn2').button();
	
	$( "#new-marker-form" ).dialog({
			height: 400,
			width: 300,
			resizable: false,
			modal: true,
			autoOpen: false,
			buttons: {"建立": submitMsg,
					 Cancel: function() { $( this ).dialog( "close" );}}
	});	
	
	$( "#new" ).button().click(showDialog);
	$( "#other" ).button();

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

$(document).ready(function(e){
	$('#moreToggle').click(toggleFilters);
	initialize();
	loadMessage();
});

/*
*  Javascript functions
*/

function submitMsg(e){
	$.ajax({
	   type: "POST",
	   url: "post",
	   data: { 
		   sender:'Andrew',
		   title: $('input#title').val(),
		   message: $('textarea#message').val(),
		   location: eventLocation.lat() + ',' + eventLocation.lng(),
		   type: $('input:radio[name=type]:checked').val(),
		   receiver: 'Shawn',
		   begintime: '2011-06-02-11-10-00',
		   endtime: '2011-06-02-11-11-00'
		   },
	   success: function(msg){
		 alert( "Data Saved: " + msg );
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
function toggleFilters(e){
	$('.header').slideToggle();
	$('.advFilters').slideToggle();
}