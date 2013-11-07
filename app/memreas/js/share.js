/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

// MACROS for tab indices.
var SHAREPAGE_TAB_MEMREAS 	= 1;		// tab index of memreas details on share page
var SHAREPAGE_TAB_MEDIA 	= 2;		// tab index of media on share page
var SHAREPAGE_TAB_FRIENDS 	= 3;		// tab index of friends on share page

// google map object
var location_map = null;
// geocoder object to get the location address from langtitude and longtitude
var geocoder = null;

var event_id = "";

// initialize the akordeon.
share_initAkordeon = function() {
	$('#ckb_canpost')[0].checked = false;
	$('#ckb_canadd')[0].checked = false;

    $('#buttons').akordeon();
    	$('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
	$('#buttons2').akordeon();
       	$('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
	$('#buttons3').akordeon();
       	$('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
	$('#buttons4').akordeon();
       	$('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
	$('#buttons5').akordeon();
    	$('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
}

// initialize and customize the scroll bar.
share_customScrollbar = function () {
	$("ul.scrollClass").mCustomScrollbar({
		scrollButtons:{
			enable:true
		}
	});
		
	$("#tab-content div.hideCls").hide(); // Initially hide all content
	$("#tabs li:first").attr("id","current"); // Activate first tab
	$("#tab-content div:first").fadeIn(); // Show first tab content*/
	
	$('#tabs a').click(function(e) {
		
		e.preventDefault();        
		$("#tab-content div.hideCls").hide(); //Hide all content
		$("#tabs li").attr("id",""); //Reset id's
		$(this).parent().attr("id","current"); // Activate this
		$('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
	});
		
	//ajax demo fn
	$("a[rel='load-content']").click(function(e){
		
		e.preventDefault();
		var $this=$(this),
			url=$this.attr("href");
		$this.addClass("loading");
		$.get(url,function(data){
			$this.removeClass("loading");
			$("ul.scrollClass .mCSB_container").html(data); //load new content inside .mCSB_container
			$("ul.scrollClass").mCustomScrollbar("update"); //update scrollbar according to newly loaded content
			$("ul.scrollClass").mCustomScrollbar("scrollTo","top",{scrollInertia:200}); //scroll to top
		});
	});
	$("a[rel='append-content']").click(function(e){
		e.preventDefault();
		var $this=$(this),
			url=$this.attr("href");
		$this.addClass("loading");
		$.get(url,function(data){
			$this.removeClass("loading");
			$("ul.scrollClass .mCSB_container").append(data); //append new content inside .mCSB_container
			$("ul.scrollClass").mCustomScrollbar("update"); //update scrollbar according to newly appended content
			$("ul.scrollClass").mCustomScrollbar("scrollTo","h2:last",{scrollInertia:2500,scrollEasing:"easeInOutQuad"}); //scroll to appended content
		});
	});
}

// popup the window with google map when focus the location text field.
share_showGoogleMap = function(div_id) {
	popup('locationmap');
	share_initGoogleMap(div_id);
}

// close the popup window with google map.
share_closeGoogleMap = function() {
	$('#txt_location').val($('#searchTextField').val());
	disablePopup('locationmap');
}

// initialize the google map.
share_initGoogleMap = function(div_id) {
	if (location_map == null || typeof location_map == "undefined") {
         var lat = 44.88623409320778,
             lng = -87.86480712897173,
             latlng = new google.maps.LatLng(lat, lng),
             image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';

		 // create the google map object.
         var mapOptions = {
             center: new google.maps.LatLng(lat, lng),
             zoom: 13,
             mapTypeId: google.maps.MapTypeId.ROADMAP,
             panControl: true,
             panControlOptions: {
                 position: google.maps.ControlPosition.TOP_RIGHT
             },
             zoomControl: true,
             zoomControlOptions: {
                 style: google.maps.ZoomControlStyle.LARGE,
                 position: google.maps.ControlPosition.TOP_left
             }
         },
         location_map = new google.maps.Map(document.getElementById(div_id), mapOptions),
             marker = new google.maps.Marker({
                 position: latlng,
                 map: location_map,
                 icon: image
             });

		 // set the search text field as auto-complete.
         var input = document.getElementById('searchTextField');
         var autocomplete = new google.maps.places.Autocomplete(input, {
             types: ["geocode"]
         });

         autocomplete.bindTo('bounds', location_map);
         var infowindow = new google.maps.InfoWindow();

         google.maps.event.addListener(autocomplete, 'place_changed', function (event) {
             infowindow.close();
             var place = autocomplete.getPlace();
             if (place.geometry.viewport) {
                 location_map.fitBounds(place.geometry.viewport);
             } else {
                 location_map.setCenter(place.geometry.location);
                 location_map.setZoom(17);
             }

             moveMarker(place.name, place.geometry.location);
         });
         google.maps.event.addListener(location_map, 'click', function (event) {
             //$('.MapLat').val(event.latLng.lat());
             //$('.MapLon').val(event.latLng.lng());
             //alert(event.latLng.place.name)
         });
         $("#searchTextField").focusin(function () {
             $(document).keypress(function (e) {
                 if (e.which == 13) {
                     return false;
                     infowindow.close();
                     var firstResult = $(".pac-container .pac-item:first").text();
                     var geocoder = new google.maps.Geocoder();
                     geocoder.geocode({
                         "address": firstResult
                     }, function (results, status) {
                         if (status == google.maps.GeocoderStatus.OK) {
                             var lat = results[0].geometry.location.lat(),
                                 lng = results[0].geometry.location.lng(),
                                 placeName = results[0].address_components[0].long_name,
                                 latlng = new google.maps.LatLng(lat, lng);

                             moveMarker(placeName, latlng);
                             $("input").val(firstResult);
                         }
                     });
                 }
             });
         });

         function moveMarker(placeName, latlng) {
             marker.setIcon(image);
             marker.setPosition(latlng);
             infowindow.setContent(placeName);
         }
	}
	
	// get the current location.
	var err_msg = "Error while getting location. Device GPS/location may be disabled."
	var geoPositionOptions = $.extend({
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 300000
	}, { timeout: 30000 } );
	
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition ( 
			function(position) {
				var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				if (geocoder == null)
					geocoder = new google.maps.Geocoder();
				geocoder.geocode({'latLng': latlng}, function(results, status) {
				  	if (status == google.maps.GeocoderStatus.OK) {
						if (results[1]) {
					 	 	$('#searchTextField').val(results[1].formatted_address);
						}
				  	} else {
				  	}
				});			
				location_map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			}, 
			function(error) {
				alert(err_msg);
			},
			geoPositionOptions
		);	
	} else {
		alert(err_msg);
	}
}

// add the new event by request to the server.
share_addEvent = function() {
	var name = $('#txt_name').val();
	if (name == "" || name == $('#txt_name')[0].defaultValue) {
		alert("You have to input the name.");
		return;
	}

	var date = $('#dtp_date').val();
	if (date == "" || date == $('#dtp_date')[0].defaultValue) {
		date = "";
		//alert("You have to input the date.");
		//return;
	}
	
	var location = $('#txt_location').val();
	if (location == "" || location == $('#txt_location')[0].defaultValue) {
		location = "";
		//alert("You have to input the address.");
		//return;
	}
	
	var date_from = $('#dtp_from').val();
	if (date_from == "" || date_from == $('#dtp_from')[0].defaultValue) {
		date_from = "";
		//alert("You have to input the viewable from date.");
		//return;
	}
	
	var date_to = $('#dtp_to').val();
	if (date_to == "" || date_to == $('#dtp_to')[0].defaultValue) {
		date_to = "";
		//alert("You have to input the viewable to date.");
		//return;
	}
	
	var date_selfdestruct = $('#dtp_selfdestruct').val();
	if (date_selfdestruct == "" || date_selfdestruct == $('#dtp_selfdestruct')[0].defaultValue) {
		date_selfdestruct = "";
		//alert("You have to input the date for self destruct.");
		//return;
	}

	var ckb_canpost 	 = ($('#ckb_canpost')[0].checked ? 0 : 1);
	var ckb_canadd 		 = ($('#ckb_canadd')[0].checked ? 0 : 1);
	var ckb_public 		 = ($('#ckb_public')[0].checked ? 0 : 1);
 	var ckb_viewable 	 = ($('#ckb_viewable')[0].checked ? 0 : 1);
	var ckb_selfdestruct = ($('#ckb_selfdestruct')[0].checked ? 0 : 1);
	
	// send the request.
	ajaxRequest(
		'addevent',
		[
			{ tag: 'user_id', 					value: $('#user_id')[0].getAttribute('val') },
			{ tag: 'event_name', 				value: name },
			{ tag: 'event_date', 				value: formatDateToDMY(date) },
			{ tag: 'event_location', 			value: location },
			{ tag: 'event_from', 				value: formatDateToDMY(date_from) },
			{ tag: 'event_to', 					value: formatDateToDMY(date_to) },
			{ tag: 'is_friend_can_add_friend', 	value: ckb_canadd },
			{ tag: 'is_friend_can_post_media', 	value: ckb_canpost },
			{ tag: 'event_self_destruct', 		value: formatDateToDMY(date_selfdestruct) },
			{ tag: 'is_public', 				value: ckb_public }
		],
		function(ret_xml) {
			// parse the returned xml.
			var status   = getValueFromXMLTag(ret_xml, 'status');
			var message  = getValueFromXMLTag(ret_xml, 'message');
			var event_id = getValueFromXMLTag(ret_xml, 'event_id');
			
			if (status.toLowerCase() == 'success') {
				alert(event_id + ' was registered successfully.');
				share_gotoPage(SHAREPAGE_TAB_MEDIA);
			}
			else {
				alert(message);
			}
		}
	);
}

// clear all fields on details page when click "cancel" button.
share_clearMemreas = function() {
	var i = 0;
	var text_ids = ['txt_name', 'txt_location', 'dtp_date', 'dtp_from', 'dtp_to', 'dtp_selfdestruct'];
	var checkbox_ids = ['ckb_canpost', 'ckb_canadd', 'ckb_public', 'ckb_viewable', 'ckb_selfdestruct'];

	clearTextField(text_ids);
	clearCheckBox(checkbox_ids);
}

share_clickCkbPublic = function() {
	if ($('#ckb_public')[0].checked == true) {
		$('#ckb_canpost')[0].checked = false;
		$('#ckb_canadd')[0].checked = false;
	}
}

// go to the other page (1: memreas details, 2: media, 3: friends)
share_gotoPage = function(tab_no) {
	$('#tabs li:nth-child(' + tab_no + ') a').click();
}

// add the comment to Media when click "next" button on the Media Page.
share_addComment = function() {

}

// clear all fields on Media page when click "cancel" button.
share_clearMedia = function() {
	clearTextField('txt_comment');
}