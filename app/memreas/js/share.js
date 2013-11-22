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

var user_id  = "";		// signed user id
var event_id = "";		// created event id
var media_id = "";		// selected media id

var friendList = null;

// initialize the share page objects.
share_initObjects = function() {
	// Initially get the user id.
	user_id = $('#user_id')[0].getAttribute('val');

	$('#tabs li:nth-child(3) a').on('click', function() {
		facebook_getFriendList();
		twitter_init();
	});
}

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
// div_id: identifier of div for google map.
share_showGoogleMap = function(div_id) {
	popup('dlg_locationmap');
	share_initGoogleMap(div_id);
}

// close the popup window with google map.
// save_address: variable indicating if the address is saved or not.
share_closeGoogleMap = function(save_address) {
	if (save_address == true) {
		var addr = $('#txt_locationmap_address').val();
		if (addr != "")
			$('#txt_location').val(addr);
		else
			setDefaultValue('txt_location');
	}
	
	disablePopup('dlg_locationmap');
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
         var input = document.getElementById('txt_locationmap_address');
         var autocomplete = new google.maps.places.Autocomplete(input, {
             types: ["geocode"]
         });

         autocomplete.bindTo('bounds', location_map);
         var infowindow = new google.maps.InfoWindow();

         google.maps.event.addListener(autocomplete, 'place_changed', function (event) {
             infowindow.close();
             
             var place = autocomplete.getPlace();
             if (typeof place.geometry == "undefined")
             	return;
             	
             if (place.geometry.viewport) {
                 location_map.fitBounds(place.geometry.viewport);
             } else {
                 location_map.setCenter(place.geometry.location);
                 location_map.setZoom(17);
             }

             moveMarker(place.name, place.geometry.location);
         });

         function moveMarker(placeName, latlng) {
             marker.setIcon(image);
             marker.setPosition(latlng);
             infowindow.setContent(placeName);
         }
	}
	
	if (isElementEmpty('txt_location')) {
		// get the current location.
		var err_msg = "Error while getting location. Device GPS/location may be disabled."
		var geoPositionOptions = $.extend({
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 10000
		}, { timeout: 10000 } );
		
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition ( 
				function(position) {
					var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					if (geocoder == null)
						geocoder = new google.maps.Geocoder();
					geocoder.geocode({'latLng': latlng}, function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							if (results[1]) {
								$('#txt_locationmap_address').val(results[1].formatted_address);
							}
						} else {
						}
					});
					if (location_map)
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
}

// add the new event by request to the server.
share_addEvent = function() {
	var name = getElementValue('txt_name');
	if (name == "") {
		alert("You have to input the name.");
		return;
	}

	var date 				= getElementValue('dtp_date');
	var location 			= getElementValue('txt_location');
	var date_from 			= getElementValue('dtp_from');
	var date_to 			= getElementValue('dtp_to');
	var date_selfdestruct 	= getElementValue('dtp_selfdestruct');

	var ckb_canpost 	 	= getCheckBoxValue('ckb_canpost');
	var ckb_canadd 		 	= getCheckBoxValue('ckb_canadd');
	var ckb_public 		 	= getCheckBoxValue('ckb_public');
 	var ckb_viewable 	 	= getCheckBoxValue('ckb_viewable');
	var ckb_selfdestruct 	= getCheckBoxValue('ckb_selfdestruct');
	
	// send the request.
	ajaxRequest(
		'addevent',
		[
			{ tag: 'user_id', 					value: user_id },
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
			
			event_id = getValueFromXMLTag(ret_xml, 'event_id');
			
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
	var text_ids 	 = ['txt_name', 'txt_location', 'dtp_date', 'dtp_from', 'dtp_to', 'dtp_selfdestruct'];
	var checkbox_ids = ['ckb_canpost', 'ckb_canadd', 'ckb_public', 'ckb_viewable', 'ckb_selfdestruct'];

	clearTextField(text_ids);
	clearCheckBox(checkbox_ids);
}

// click event function for "public (anyone can add or post)" checkbox.
share_clickCkbPublic = function() {
	if (!getCheckBoxValue('ckb_public')) {
		setCheckBoxValue('ckb_canpost', true);
		setCheckBoxValue('ckb_canadd', true);
	}
}

// go to the other page (1: memreas details, 2: media, 3: friends)
share_gotoPage = function(tab_no) {
	$('#tabs li:nth-child(' + tab_no + ') a').click();
}

// add the comment to Media when click "next" button on the Media Page.
share_addComment = function() {
	var comments 	= getElementValue('txt_comment');
	audio_media_id	= "";

	// send the request.
	ajaxRequest(
		'addcomments',
		[
			{ tag: 'event_id', 				value: event_id },
			{ tag: 'media_id', 				value: media_id },
			{ tag: 'user_id', 				value: user_id },
			{ tag: 'comments', 				value: comments },
			{ tag: 'audio_media_id', 		value: audio_media_id }
		],
		function(ret_xml) {
			// parse the returned xml.
			var status   = getValueFromXMLTag(ret_xml, 'status');
			var message  = getValueFromXMLTag(ret_xml, 'message');
			
			if (status.toLowerCase() == 'success') {
				alert('comments was added successfully.');
				share_gotoPage(SHAREPAGE_TAB_FRIENDS);
			}
			else {
				alert(message);
			}
		}
	);
}

// clear all fields on Media page when click "cancel" button.
share_clearMedia = function() {
	clearTextField('txt_comment');
}

// clear the friend list.
share_clearFriendsList = function() {
	if (friendList == null)
		friendList = $('#share_friendslist .mCSB_container');
		
	friendList.empty();
}

// add friends to the list from social friends information.
share_addFriends = function(info) {
	if (friendList == null)
		friendList = $('#share_friendslist .mCSB_container');

	friendList.empty();

	var i = 0, el;

	for (i = 0; i < info.length; i++) {
		el = '';
		el += '<li>';
		el += '<figure class="pro-pics2"><img src="/memreas/img/profile-pic.jpg" alt=""></figure>';
		el += '<aside class="pro-pic_names2">' + info[i].name + '</aside>';
		el += '</li>';
							
		friendList.append(el);
	}

	var imgList = $('#share_friendslist .mCSB_container li img');

	for (i = 0; i < imgList.length; i++) {
		$(imgList[i]).prop('src', info[i].photo);
	}
}