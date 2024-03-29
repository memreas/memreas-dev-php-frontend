/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
// MACROS for tab indices.
var SHAREPAGE_TAB_MEMREAS = 0;
// tab index of memreas details on share page
var SHAREPAGE_TAB_MEDIA = 1;
// tab index of media on share page
var SHAREPAGE_TAB_FRIENDS = 2;
// tab index of friends on share page

// google map object
var location_map = null;
// geocoder object to get the location address from langtitude and longtitude
var geocoder = null;

var user_id = LOGGED_USER_ID;
// signed user id
var event_id = "";
// created event id
var media_ids = [];
// array of selected media id
var device_id = "";
// current device id

var media_page_index = '1';
// page index number for media
var media_limit_count = '200';
// limit count of media

// For selling media
var sell_media_price = 0;

var friendList = null;
var current_sharefriendnw_selected = '';

//
// doneAction related objects
//
var event_share_object = {};
var media_share_object = {};
var friends_share_object = {};

$(function() {
    $("a[title=share]").click(function() {
	event_id = -1;
	$('#tabs-share li:nth-child(1) a').click();
	event_id = '';
	$("#ckb_canpost").attr('checked', true);
	$("#ckb_canadd").attr('checked', true);
	$("#ckb_public").attr('checked', false);
	$("#ckb_viewable").attr('checked', false);
	$("#ckb_selfdestruct").attr('checked', false);
	$("#ckb_sellmedia").attr('checked', false);
    });
    user_id = $("input[name=user_id]").val();
    share_initObjects();
    share_customScrollbar();
    $("#cmb_socialtype").chosen({
	width : "95%"
    });

    function resizeBlueIMpGallerypanel() {
	var queueHeight = $(window).height();
	if (queueHeight > 205) {
	    queueHeight = queueHeight - 205;
	}

	$(".linksDatacnt").attr(
		'style',
		'height: ' + queueHeight + 'px; min-height: ' + queueHeight
			+ 'px !important');
    }

    function resizeshareGalleryPanel() {
	var queueHeight = $(window).height();
	if (queueHeight > 205) {
	    queueHeight = queueHeight - 205;
	}

	$("#share_medialist").attr(
		'style',
		'height: ' + queueHeight + 'px; min-height: ' + queueHeight
			+ 'px !important; overflow:auto;');
    }

    resizeshareGalleryPanel();
    $(window).resize(function() {
	resizeshareGalleryPanel();

    });

    // Handle for checkbox viewable and self destruct
    $("#ckb_viewable").change(function() {
	if ($(this).is(":checked")) {
	    $("#dtp_from").removeAttr('disabled');
	    $("#dtp_to").removeAttr('disabled');

	    if ($("#ckb_selfdestruct").is(":checked")) {
		$("#ckb_selfdestruct").removeAttr("checked").change();
	    }
	} else {
	    $("#dtp_from").val('').attr('disabled', true);
	    $("#dtp_to").val('').attr('disabled', true);
	}
    });

    $("#ckb_selfdestruct").change(function() {
	if ($(this).is(":checked")) {
	    $("#dtp_selfdestruct").removeAttr('disabled');
	    if ($("#ckb_viewable").is(":checked")) {
		$("#ckb_viewable").removeAttr("checked").change();
	    }
	} else
	    $("#dtp_selfdestruct").val('').attr('disabled', true);
    });

    $("#ckb_sellmedia").change(function() {
	if ($(this).is(":checked")) {
	    $("#ckb_canpost").attr('checked', false);
	    $("#ckb_canadd").attr('checked', false);
	    $("#ckb_public").attr("checked", true);
	    $("#ckb_selfdestruct").attr("checked", false);
	    $("#dtp_selfdestruct").val('').attr('disabled', true);
	    $("#ckb_viewable").attr("checked", true);
	    popup("popupSellMedia");
	} else {
	    $(this).attr('checked', false);
	    sell_media_price = 0;		
	    event_share_object.sell_media_price = 0;
	    event_share_object.sellmedia_duration_from = '';
	    event_share_object.sellmedia_duration_to = '';
	}
    });
});

// initialize the share page objects.
share_initObjects = function() {
    // Initially get the user id.
    // user_id = $('#user_id')[0].getAttribute('val');

    // event function when click "media" tab
    $('#tabs-share li:nth-child(2) a').on('click', function() {
	share_getAllMedia();
    });

    // event function when click "Friends" tab
    $('#tabs-share li:nth-child(3) a').on('click', function() {
	share_changeSocialType();
    });

    $("#cmb_socialtype").change(function(e) {
	share_changeSocialType();
    });

    if (!userBrowser[0].ios) {
	ar_initAudio();
    }
};

// initialize the akordeon.
share_initAkordeon = function() {
    $('#ckb_canpost')[0].checked = false;
    $('#ckb_canadd')[0].checked = false;

    $('#buttons').akordeon();
    $('#button-less').akordeon({
	buttons : false,
	toggle : true,
	itemsOrder : [ 2, 0, 1 ]
    });
    $('#buttons2').akordeon();
    $('#button-less').akordeon({
	buttons : false,
	toggle : true,
	itemsOrder : [ 2, 0, 1 ]
    });
    $('#buttons3').akordeon();
    $('#button-less').akordeon({
	buttons : false,
	toggle : true,
	itemsOrder : [ 2, 0, 1 ]
    });
    $('#buttons4').akordeon();
    $('#button-less').akordeon({
	buttons : false,
	toggle : true,
	itemsOrder : [ 2, 0, 1 ]
    });
    $('#buttons5').akordeon();
    $('#button-less').akordeon({
	buttons : false,
	toggle : true,
	itemsOrder : [ 2, 0, 1 ]
    });
};

// change the friend list by social type.
share_changeSocialType = function() {
    var socialType = $("#cmb_socialtype option:selected").val();
    // Reset friend element
    switch (socialType) {
    case "memreas":
	if (mr_friendsInfo == null) {
	    friendList = null;
	    memreas_getFriendList();
	} else {
	    share_addFriends(mr_friendsInfo);
	}
	break;
    default:
	$("#cmb_socialtype option[value=memreas]").attr('selected', true);
	share_changeSocialType();
	break;
    }
};

// initialize and customize the scroll bar.
share_customScrollbar = function() {

    $("#tab-content-share div.hideCls").hide();
    // Initially hide all content
    $("#tabs-share li:first").attr("id", "current");
    // Activate first tab
    $("#tab-content-share div:first").fadeIn();
    // Show first tab content*/

    $('#tabs-share a').click(
	    function(e) {

		e.preventDefault();
		$("#tab-content-share div.hideCls").hide();
		// Hide all content
		$("#tabs-share li").attr("id", "");
		// Reset id's
		$(this).parent().attr("id", "current");
		// Activate this
		$('#' + $(this).attr('title')).fadeIn();
		// Show content for
		// current tab
		if (!($('#' + $(this).attr('title') + " .scroll-area")
			.hasClass('mCustomScrollbar'))) {
		    $('#' + $(this).attr('title') + " .scroll-area")
			    .mCustomScrollbar({
				scrollButtons : {
				    enable : true
				}
			    });
		}
		$('#' + $(this).attr('title') + " .scroll-area")
			.mCustomScrollbar("update");
	    });

    // ajax demo fn
    $("a[rel='load-content']").click(function(e) {

	e.preventDefault();
	var $this = $(this), url = $this.attr("href");
	$this.addClass("loading");
	$.get(url, function(data) {
	    $this.removeClass("loading");
	    $("ul.scrollClass .mCSB_container").html(data);
	    // load new content
	    // inside
	    // .mCSB_container
	    $("ul.scrollClass").mCustomScrollbar("update");
	    // update scrollbar
	    // according to
	    // newly loaded
	    // content
	    $("ul.scrollClass").mCustomScrollbar("scrollTo", "top", {
		scrollInertia : 200
	    });
	    // scroll to top
	});
    });
    $("a[rel='append-content']").click(function(e) {
	e.preventDefault();
	var $this = $(this), url = $this.attr("href");
	$this.addClass("loading");
	$.get(url, function(data) {
	    $this.removeClass("loading");
	    $("ul.scrollClass .mCSB_container").append(data);
	    // append new
	    // content
	    // inside
	    // .mCSB_container
	    $("ul.scrollClass").mCustomScrollbar("update");
	    // update scrollbar
	    // according to
	    // newly appended
	    // content
	    $("ul.scrollClass").mCustomScrollbar("scrollTo", "h2:last", {
		scrollInertia : 2500,
		scrollEasing : "easeInOutQuad"
	    });
	    // scroll to appended content
	});
    });
};

// popup the window with google map when focus the location text field.
// div_id: identifier of div for google map.
share_showGoogleMap = function(div_id) {
    popup('dlg_locationmap');
    share_initGoogleMap(div_id);
};

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
};

// initialize the google map.
share_initGoogleMap = function(div_id) {
    if (location_map == null || typeof location_map == "undefined") {
	var lat = 44.88623409320778, lng = -87.86480712897173, latlng = new google.maps.LatLng(
		lat, lng), image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';

	// create the google map object.
	var mapOptions = {
	    center : new google.maps.LatLng(lat, lng),
	    zoom : 13,
	    mapTypeId : google.maps.MapTypeId.ROADMAP,
	    panControl : true,
	    panControlOptions : {
		position : google.maps.ControlPosition.TOP_RIGHT
	    },
	    zoomControl : true,
	    zoomControlOptions : {
		style : google.maps.ZoomControlStyle.LARGE,
		position : google.maps.ControlPosition.TOP_left
	    }
	}, location_map = new google.maps.Map(document.getElementById(div_id),
		mapOptions), marker = new google.maps.Marker({
	    position : latlng,
	    map : location_map,
	    icon : image
	});

	// set the search text field as auto-complete.
	var input = document.getElementById('txt_locationmap_address');
	var autocomplete = new google.maps.places.Autocomplete(input, {
	    types : [ "geocode" ]
	});

	autocomplete.bindTo('bounds', location_map);
	var infowindow = new google.maps.InfoWindow();

	google.maps.event.addListener(autocomplete, 'place_changed', function(
		event) {
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
	var err_msg = "Error while getting location. Device GPS/location may be disabled.";
	var geoPositionOptions = $.extend({
	    enableHighAccuracy : true,
	    timeout : 10000,
	    maximumAge : 10000
	}, {
	    timeout : 10000
	});

	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
		var latlng = new google.maps.LatLng(position.coords.latitude,
			position.coords.longitude);
		if (geocoder == null)
		    geocoder = new google.maps.Geocoder();
		geocoder.geocode({
		    'latLng' : latlng
		}, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
			if (results[1]) {
			    $('#txt_locationmap_address').val(
				    results[1].formatted_address);
			}
		    } else {
		    }
		});
		if (location_map)
		    location_map
			    .setCenter(new google.maps.LatLng(
				    position.coords.latitude,
				    position.coords.longitude));
	    }, function(error) {
		jerror(err_msg);
	    }, geoPositionOptions);
	} else {
	    jerror(err_msg);
	}
    }
};

function undoSellMedia() {
    	$('#ckb_sellmedia').attr('checked', false);
	event_share_object.sellmedia_duration_from = '';
	event_share_object.sellmedia_duration_to = '';
	event_share_object.sell_media_price = 0;
	sell_media_price = 0;
	if ($("#popupSellMedia").is(":visible")) {
	    disablePopup('popupSellMedia');
	}
	
}

function checkSellMedia(submitAction=false) {
    if (!$('#ckb_sellmedia').is(":checked")) {
	undoSellMedia();
    } else if ($("#popupSellMedia").is(":visible") && submitAction) {
	event_share_object.sellmedia_price_select = $("#sellmedia_price").val();
	if (event_share_object.sellmedia_price_select == '') {
	    $('#loadingpopup').fadeOut(200);
	    jerror("please select the price");
	    return false;
	}

	// check sell duration...
	event_share_object.passDuration = checkSellMediaDuration();
	if (!event_share_object.passDuration) {
	    $('#loadingpopup').fadeOut(200);
	    return false;
	}

	event_share_object.sellmedia_duration_from = $(
		"#sellmedia_duration_from").val();
	event_share_object.sellmedia_duration_to = $("#sellmedia_duration_to")
		.val();

	if (!$("#ckb_sellmedia_agree").is(":checked")) {
	    jerror("You must agree with our terms and conditions");
	    return false;
	}
	event_share_object.sell_media_price = sell_media_price = event_share_object.sellmedia_price_select;
	disablePopup('popupSellMedia');
    }
    return true;
}

// Check valid duration
function checkSellMediaDuration() {
    event_share_object.sellmedia_duration_from = $("#sellmedia_duration_from")
	    .val();
    event_share_object.sellmedia_duration_to = $("#sellmedia_duration_to")
	    .val();

    // Reset default values
    if (event_share_object.sellmedia_duration_from == 'available from') {
	event_share_object.sellmedia_duration_from = '';
    }
    if (event_share_object.sellmedia_duration_to == 'available to') {
	event_share_object.sellmedia_duration_to = '';
    }

    if (event_share_object.sellmedia_duration_from != ''
	    || event_share_object.sellmedia_duration_to != '') {
	if (event_share_object.sellmedia_duration_from == '') {
	    jerror("please set available from");
	    return false;
	}
	if (event_share_object.sellmedia_duration_to == '') {
	    jerror('please set available to');
	    return false;
	}

	var date_from = new Date(event_share_object.sellmedia_duration_from);
	var date_to = new Date(event_share_object.sellmedia_duration_to);

	var date1 = new Date(date_from);
	var date2 = new Date(date_to);
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

	if (date_to <= date_from) {
	    jerror("Duration to date must be greater than date from");
	    return false;
	}

	var current_date = new Date();
	current_date = current_date.setHours(00, 00, 00, 00);
	if (date_from < current_date) {
	    jerror("Duration from date must be current or a later date");
	    return false;
	}

	if (date_to < current_date) {
	    jerror("Duration to date must be greater than start date");
	    return false;
	}

	//
	// Set viewable checkbox and dates
	//
	$("#ckb_selfdestruct").prop('checked', false);
	$("#ckb_viewable").prop('checked', true);
	$("#dtp_from").val(event_share_object.sellmedia_duration_from);
	$("#dtp_to").val(event_share_object.sellmedia_duration_to);

	// Sell media public as default
	if (event_share_object.sell_media_price > 0) {
	    event_share_object.ckb_public = 1;
	    event_share_object.ckb_canpost = 0;
	    event_share_object.ckb_canadd = 0;
	    event_share_object.date_from = event_share_object.sellmedia_duration_from;
	    event_share_object.date_to = event_share_object.sellmedia_duration_to;
	}

	event_share_object.ckb_viewable = getCheckBoxValue('ckb_viewable');
	event_share_object.ckb_selfdestruct = getCheckBoxValue('ckb_selfdestruct');

	return true;
    } else {
	jerror("Please specify dates for viewing");
	return false;
    }
}

// add the new event by request to the server.
share_addEvent = function() {
    $('#loadingpopup').fadeIn(200);

    // Precheck for selling media is popup or not and check for correction
    if (!checkSellMedia()) {
	return false;
    };

    // check map...
    share_closeGoogleMap(true);

    event_share_object.name = getElementValue('txt_name');
    if (event_share_object.name == "") {
	$('#loadingpopup').fadeOut(200);
	jerror("name is required.");
	return false;
    }
    if (checkValidDateFromTo(true)) {
	event_share_object.date = getElementValue('dtp_date');
	event_share_object.location = getElementValue('txt_location');
	event_share_object.date_from = getElementValue('dtp_from');
	event_share_object.date_to = getElementValue('dtp_to');
	event_share_object.date_selfdestruct = getElementValue('dtp_selfdestruct');

	event_share_object.ckb_canpost = getCheckBoxValue('ckb_canpost');
	event_share_object.ckb_canadd = getCheckBoxValue('ckb_canadd');
	event_share_object.ckb_public = getCheckBoxValue('ckb_public');

	// Sell media public as default
	if (event_share_object.sell_media_price > 0) {
	    event_share_object.ckb_public = 1;
	    event_share_object.ckb_canpost = 0;
	    event_share_object.ckb_canadd = 0;
	    event_share_object.date_from = event_share_object.sellmedia_duration_from;
	    event_share_object.date_to = event_share_object.sellmedia_duration_to;
	}

	event_share_object.ckb_viewable = getCheckBoxValue('ckb_viewable');
	event_share_object.ckb_selfdestruct = getCheckBoxValue('ckb_selfdestruct');

	//
	// Share Page Changes: Move to ajaxAddEvent
	//
	shareDisableFields();

	//
	// call ajaxAddEvent only if done
	//
	$('#loadingpopup').fadeOut(200);
	return true;
    }
    //
    // failed check so return false
    //
    $('#loadingpopup').fadeOut(200);
    return false;
};

//
// may not be necessary
//
doneAction = function(medianext) {

    /*
     * if media details ! filled out then goto media details and show error if
     * media detail and done then just add event if media detail and media and
     * done then add event, in success call addexistingmediatoevent if media
     * detail and media and friends and done then add event, in success call
     * addexisting mediat to event, in success call addfrientto event else next
     * button.
     */

    if (medianext === 'done') {
	//
	// Check if memreas details name filled out...
	//
	setTimeout(function() {
	    //
	    // Call ajaxAddEvent which will call ajaxAddMedia and ajaxAddFriends
	    // on success
	    //
	    if (share_addEvent()) {
		ajaxAddEvent();
	    }
	}, 2000);
    }

    //
    // Goto media page
    //
    if (medianext == 'medianext') {
	setTimeout(function() {
	    $('.mmediaclick').trigger('click');
	}, 2000);
    }

    if (medianext == 'friendnext') {
	//
	// Goto friends page
	// 
	setTimeout(function() {
	    $('.mfriendsclick').trigger('click');
	}, 2000);
    }

};

//
// call ajax add event
//
ajaxAddEvent = function() {

    ajaxRequest(
	    'addevent',
	    [ {
		tag : 'user_id',
		value : user_id
	    }, {
		tag : 'event_name',
		value : event_share_object.name
	    }, {
		tag : 'event_date',
		value : event_share_object.date
	    }, {
		tag : 'event_location',
		value : event_share_object.location
	    }, {
		tag : 'event_from',
		value : event_share_object.date_from
	    }, {
		tag : 'event_to',
		value : event_share_object.date_to
	    }, {
		tag : 'is_friend_can_add_friend',
		value : event_share_object.ckb_canadd.toString()
	    }, {
		tag : 'is_friend_can_post_media',
		value : event_share_object.ckb_canpost.toString()
	    }, {
		tag : 'event_self_destruct',
		value : event_share_object.date_selfdestruct
	    }, {
		tag : 'is_public',
		value : event_share_object.ckb_public.toString()
	    }, {
		tag : 'price',
		value : event_share_object.sell_media_price.toString()
	    }, {
		tag : 'duration_from',
		value : event_share_object.sellmedia_duration_from
	    }, {
		tag : 'duration_to',
		value : event_share_object.sellmedia_duration_to
	    } ],
	    function(ret_xml) {
		// parse the returned xml.
		var status = getValueFromXMLTag(ret_xml, 'status');
		var message = getValueFromXMLTag(ret_xml, 'message');
		event_id = getValueFromXMLTag(ret_xml, 'event_id');
		if (status.toLowerCase() == 'success') {
		    jsuccess('Event "' + event_share_object.name
			    + '" was registered successfully.');

		    event_share_object.hasMedia = false;
		    event_share_object.hasFriends = false;
		    //
		    // Check media and call share_AddComment which calls the
		    // Ajax
		    // function
		    //
		    media_ids = fetch_selected_media();
		    if (media_ids.length > 0) {
			event_share_object.hasMedia = true;
			share_uploadMedias(true);
		    }

		    //
		    // Check friends and call add friends which calls the ajax
		    // function
		    //
		    if (mr_friendsInfo != null) {
			if (mr_friendsInfo.length > 0) {
			    event_share_object.hasFriends = true;
			    share_makeGroup();
			    mr_friendsInfo = [];
			}
		    }

		    //
		    // clear variable ans redirect to memreas page
		    //
		    console.log('FrinedObg' + event_share_object.hasFriends);
		    console.log('mediaObg' + event_share_object.hasFriends);
		    if ((!event_share_object.hasMedia && !event_share_object.hasFriends)) {
			share_clearMemreas();
			$('.memrsclick').trigger('click');
		    } else {
			share_clearMemreas();
			$('.memrsclick').trigger('click');
		    }

		} else {
		    jerror(message);
		}
		shareEnableFields();
	    }, 'undefined', true);

};

// Prevent enter invalid character to duration media selling price
$(function() {
    $("#sellmedia_duration").keydown(
	    function(e) {
		// Allow: backspace, delete, tab, escape, enter and .
		if ($.inArray(e.keyCode, [ 46, 8, 9, 27, 13, 110, 190 ]) !== -1
			||
			// Allow: Ctrl+A
			(e.keyCode == 65 && e.ctrlKey === true) ||
			// Allow: home, end, left, right
			(e.keyCode >= 35 && e.keyCode <= 39)) {
		    // let it happen, don't do anything
		    return;
		}
		// Ensure that it is a number and stop the keypress
		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))
			&& (e.keyCode < 96 || e.keyCode > 105)) {
		    e.preventDefault();
		}
	    });
});

function shareDisableFields() {
    addLoading(".share-event-name", 'input', '');
    $("#dtp_date").attr('readonly', true);
    $("#txt_location").attr('readonly', true);
    $("#ckb_canpost").attr('readonly', true);
    $("#ckb_canadd").attr('readonly', true);
    $("#ckb_public").attr('readonly', true);
    $("#ckb_viewable").attr('readonly', true);
    $("#dtp_from").attr('readonly', true);
    $("#dtp_to").attr('readonly', true);
    $("#ckb_selfdestruct").attr('readonly', true);
    $("#dtp_selfdestruct").attr('readonly', true);
    disableButtons("#tab1-share");
}

function shareEnableFields() {
    removeLoading(".share-event-name");
    $("#dtp_date").removeAttr('readonly');
    $("#txt_location").removeAttr('readonly');
    $("#ckb_canpost").removeAttr('readonly');
    $("#ckb_canadd").removeAttr('readonly');
    $("#ckb_public").removeAttr('readonly');
    $("#ckb_viewable").removeAttr('readonly');
    $("#dtp_from").removeAttr('readonly');
    $("#dtp_to").removeAttr('readonly');
    $("#ckb_selfdestruct").removeAttr('readonly');
    $("#dtp_selfdestruct").removeAttr('readonly');
    enableButtons("#tab1-share");
}

// clear all fields on details page when click "cancel" button.
share_clearMemreas = function(sendBackToDetails) {
    console.log(arguments.callee.toString());

    var i = 0;
    // text fields to clear
    var text_ids = [ 'txt_name', 'txt_location', 'dtp_date', 'dtp_from',
	    'dtp_to', 'dtp_selfdestruct', 'sellmedia_duration_from',
	    'sellmedia_duration_to' ];
    clearTextField(text_ids);

    //
    // reset checkboxes
    //
    $("#ckb_canpost").prop('checked', true);
    $("#ckb_canadd").prop('checked', true);
    $("#ckb_public").prop('checked', false);
    $("#ckb_viewable").prop('checked', false);
    $("#ckb_selfdestruct").prop('checked', false);
    $("#ckb_sellmedia_agree").prop('checked', false);
    $("#ckb_sellmedia").prop('checked', false);

    //
    // reset vars
    //
    medianext = "next";
    event_share_object.hasMedia = false;
    event_share_object.hasFriends = false;

    //
    // reset price
    //
    $("#sellmedia_price option:eq(0)").attr("selected", "selected");

    if (sendBackToDetails) {
	//
	// send user back to details
	//
	jconfirm('Are you sure want to restart progress?',
		'$("a[title=share]").click()');
    }
};
// click event function for "public (anyone can add or post)" checkbox.
share_clickCkbPublic = function() {
    console.log(arguments.callee.toString());

    $(this).toggleClass('public_ck_attr');
    if (!getCheckBoxValue('ckb_public')) {
	setCheckBoxValue('ckb_canpost', true);
	setCheckBoxValue('ckb_canadd', true);
    }
    if ($('#ckb_public').is(":checked")) {

	$('#ckb_canpost').removeAttr('disabled');
	$('#ckb_canadd').removeAttr('disabled');

    } else {

	$('#ckb_canpost').removeAttr('checked');
	$('#ckb_canadd').removeAttr('checked');
	$('#ckb_canpost').attr('disabled', 'disabled');
	$('#ckb_canadd').attr('disabled', 'disabled');

    }
};

// go to the other page (1: memreas details, 2: media, 3: friends)
/*
 * share_gotoPage = function(tab_no) { // // Check code here to see navigation //
 * $('#tabs-share li:nth-child(' + tab_no + ') a').click(); };
 */

// add the comment to Media when click "next" button on the Media Page.
share_addComment = function() {
    share_uploadMedias(function() {
	var comments = getElementValue('txt_comment');
	var media_id = "";

	if (media_ids.length > 0)
	    media_id = media_ids[0];

	var audio_media_id = "";

	// Prepair request params
	var request_params = [ {
	    tag : 'event_id',
	    value : event_id
	}, {
	    tag : 'user_id',
	    value : user_id
	}, {
	    tag : 'comments',
	    value : comments
	}, {
	    tag : 'audio_media_id',
	    value : audio_media_id
	} ];

	var count = 3;
	for ( var key in media_ids) {
	    request_params[++count] = new Array();
	    request_params[count]['tag'] = 'media_id';
	    request_params[count]['value'] = media_ids[key];
	}

	ajaxRequest('addcomments', request_params, function(ret_xml) {
	    // parse the returned xml.
	    var status = getValueFromXMLTag(ret_xml, 'status');
	    var message = getValueFromXMLTag(ret_xml, 'message');

	    if (status.toLowerCase() == 'success') {
		jsuccess('comments were added successfully.');
	    } else {
		jerror(message);
	    }
	});
    });
};

function fetch_selected_media() {
    var media_id_list = new Array();
    var count = 0;
    $("ul#share_medialist li.setchoosed")
	    .each(
		    function() {
			media_id_list[++count] = $(this).find('a').attr('id');
			$(this)
				.find('a')
				.append(
					'<img src="/memreas/img/loading-line.gif" class="loading-small loading" />');
		    });
    return media_id_list;
}

share_uploadMedias = function(success) {
    media_ids = fetch_selected_media();
    var media_id_params = [];
    var increase = 0;
    for ( var key in media_ids) {
	var media_id = media_ids[key].replace('share-', '');
	media_id_params[increase++] = {
	    tag : 'media_id',
	    value : media_id
	};
    }

    media_share_object.params = [ {
	tag : 'event_id',
	value : event_id
    }, {
	tag : 'media_ids',
	value : media_id_params
    } ];
    disableButtons("#tab2-share");

    //
    // Call addexistingmediatoevent if done
    //
    ajaxAddExistingMediaToEvent();
};

//
// call ajax add existing media to event
//
ajaxAddExistingMediaToEvent = function() {

    ajaxRequest('addexistmediatoevent', media_share_object.params, function(
	    xml_response) {
	if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
	    media_id_list = new Array();
	    count = 0;
	    $("ul#share_medialist li.setchoosed").each(function() {
		media_id_list[++count] = $(this).find('a').attr('id');
		$(this).find('a').find('img.loading').remove();
	    });
	    enableButtons("#tab2-share");
	} else {
	    enableButtons("#tab2-share");
	}

	//
	// clear variables and Redirect to memreas tab after success
	//
	console.log('if (!event_share_object.hasFriends) --> '
		+ !event_share_object.hasFriends);
	if (!event_share_object.hasFriends) {
	    console.log('share_clearMemreas(true)...');
	    share_clearMemreas();
	    console.log('CHECK HERE>>>>>>>>');
	    share_clearMedia();
	    $('.memrsclick').trigger('click');
	    console.log('redirecting to memreas tab...');
	}

    }, 'undefined', true);

};

// clear all fields on Media page when click "cancel" button.
share_clearMedia = function() {
    console.log('share_clearMedia CHECK HERE>>>>>>>>');
    // var mediaList = $("#share_medialist .mCSB_container li a img");
    var mediaList = $("#share_medialist  li ");
    var selectedImg = $('.selected-gallery');
    for (var i = 0; i < mediaList.length; i++) {
	$(mediaList[i]).removeClass('setchoosed');
	$(selectedImg).attr('style', 'display:none;');
    }
};

// get all media from user id and event id.
share_getAllMedia = function() {
    if (checkReloadItem('share_listmedia')) {

	ajaxRequest(
		'listallmedia',
		[ {
		    tag : 'event_id',
		    value : ''
		}, {
		    tag : 'user_id',
		    value : user_id
		}, {
		    tag : 'device_id',
		    value : device_id
		}, {
		    tag : 'limit',
		    value : media_limit_count
		}, {
		    tag : 'page',
		    value : media_page_index
		}, {
		    tag : 'metadata',
		    value : '1'
		} ],
		function(response) {
		    if (getValueFromXMLTag(response, 'status') == "Success") {

			var medias = getSubXMLFromTag(response, 'media');
			var count_media = medias.length;
			var jtarget_element = $('#share_medialist');
			$(jtarget_element).mCustomScrollbar({
			    scrollButtons : {
				enable : true
			    }
			});
			jtarget_element.empty();
			console.log("media " + count_media);
			for (var json_key = 0; json_key < count_media; json_key++) {
			    console.log("json key " + json_key);
			    var media = medias[json_key];
			    var _media_type = getValueFromXMLTag(media, 'type');
			    var _media_url = getMediaThumbnail(media,
				    '/memreas/img/small-pic-3.jpg');
			    var _media_id = getValueFromXMLTag(media,
				    'media_id');
			    var _media_transcode_status = getValueFromXMLTag(
				    media, 'media_transcode_status');
			    var metadata = getValueFromXMLTag(media, 'metadata')
				    .replace("<!--[CDATA[", "").replace(
					    "]]-->", "");

			    //
			    // Checking for sale event with media copyright
			    //
			    metadata = JSON.parse(metadata);
			    var copyright_count = 0;
			    if ($("#ckb_sellmedia").is(":checked")) {
				if ((!metadata.S3_files.copyright)
					|| (metadata.S3_files.copyright == 'null')) {
				    console.log('copyright-->'
					    + metadata.S3_files.copyright);
				    // continue;
				}
				copyright_count++;
			    }
			    //
			    // If copyright_count > 0 then proceed
			    // else undo checkbox, send user back to details tab
			    // and show jerror("you must have media with
			    // copyright to sell")
			    //
			    if (copyright_count == 0) {
				// see comment above
				$("#ckb_sellmedia").attr('checked', false);
				jerror("you must have media with copyright to sell");
				$('.memrsclick').trigger('click');

			    } else {

				// Video section
				//
				if (_media_type == 'video') {
				    //
				    // Check if web transcode is completed or
				    // not
				    //
				    if (_media_transcode_status.toLowerCase() == 'success') {
					var _main_video_media = getValueFromXMLTag(
						media, 'media_url_web');
					_main_video_media = removeCdataCorrectLink(_main_video_media);
					jtarget_element
						.append('<li class="video-media" id="share-'
							+ _media_id
							+ '-parent" media-url="'
							+ _main_video_media
							+ '"><a href="javascript:;" id="share-'
							+ _media_id
							+ '" class="image-sync" onclick="return imageChoosed(this.id);"><img src="'
							+ _media_url
							+ '" alt=""><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a></li>');
				    }
				} else {
				    //
				    // Image section
				    //
				    jtarget_element
					    .append('<li id="share-'
						    + _media_id
						    + '-parent"><a href="javascript:;" id="share-'
						    + _media_id
						    + '" class="image-sync" onclick="return imageChoosed(this.id);"><img src="'
						    + _media_url
						    + '" alt=""></a></li>');
				}

			    }

			    //

			    ajaxScrollbarElement('#share_medialist');
			}

		    } else
			jerror("There is no media");
		});
    }
};

// clear the friend list.
share_clearFriendsList = function() {
    if (friendList == null) {
	friendList = $('#share_friendslist .mCSB_container');
    }
    friendList.empty();
};

// add friends to the list from social friends information.
share_addFriends = function(info) {
    if (friendList == null) {
	friendList = $('#share_friendslist .mCSB_container');
	friendList.empty();

	var i = 0, el;

	for (i = 0; i < info.length; i++) {

	    el = '';
	    el += '<li>';
	    el += '<figure class="pro-pics2" id="'
		    + info[i].div_id
		    + '" onclick="javascript:share_clickFriends(this.id);"><img src="/memreas/img/profile-pic.jpg" class="new-memreas" alt="" '
		    + (info[i].selected ? 'class="setchoosed"' : '')
		    + '></figure>';
	    el += '<aside class="pro-pic_names2" name="'
		    + info[i].name
		    + '" id="a'
		    + info[i].div_id
		    + '" onclick="javascript:share_clickFriends(this.id.substr(1));">'
		    + info[i].name + '</aside>';
	    el += '</li>';

	    friendList.append(el);
	}

	var imgList = $('#share_friendslist .mCSB_container li img');

	for (i = 0; i < imgList.length; i++) {
	    if (info[i].photo) {
		$(imgList[i]).prop('src', info[i].photo);
	    } else {
		$(imgList[i]).prop('src', '/memreas/img/profile-pic.jpg');
	    }
	    // $(imgList[i]).prop('src', info[i].photo);

	}
	$('#share_friendslist').mCustomScrollbar('update');

    }

};

share_clickFriends = function(id) {
    var type = id.substr(0, 2);
    var idx = parseInt(id.substr(3));
    if (isNaN(idx))
	idx = (id.substr(10));

    if (type == "mr") {
	mr_friendsInfo[idx].selected = !mr_friendsInfo[idx].selected;
	if (mr_friendsInfo[idx].selected) {
	    $('#' + id + ' img').addClass('setchoosed');
	    $('#' + id).next('aside').css('border', '3px solid green');
	} else {
	    $('#' + id + ' img').removeClass('setchoosed');
	    $('#' + id).next('aside').css('border', '3px solid #FFF');
	}
    }
};

// make the group with selected friends and e-mail list.
share_makeGroup = function() {
    /*
     * - not called unless we have event_id if (event_id == '') { jerror('Please
     * complete event detail at step 1'); return false; }
     */
    var emailList = splitByDelimeters(getElementValue('txt_emaillist'), [ ',',
	    ';' ]);
    friends_share_object.emailTags = [];
    if (emailList.length > 0) {
	var counter = 0;
	for (i = 0; i < emailList.length; i++) {
	    friends_share_object.emailTags[counter++] = {
		tag : 'email',
		value : emailList[i]
	    };
	}
    }
    var groupName = getElementValue('txt_groupname');
    friends_share_object.selFriends = [];
    var i = 0, count = 0;

    if (mr_friendsInfo) {
	for (i = 0; i < mr_friendsInfo.length; i++) {
	    if (mr_friendsInfo[i].selected) {
		friends_share_object.selFriends[count++] = {
		    tag : 'friend',
		    value : [ {
			tag : 'friend_name',
			value : mr_friendsInfo[i].name
		    }, {
			tag : 'friend_id',
			value : mr_friendsInfo[i].id
		    }, {
			tag : 'network_name',
			value : 'memreas'
		    }, {
			tag : 'profile_pic_url',
			value : ''
		    } ]
		};
	    }
	}

	//
	// Share Page Changes: Move to ajaxAddFriendToEvent
	// Add friend to event
	//
	ajaxAddFriendToEvent();
    }// end if (mr_friendsInfo)

    /*
     * if (groupName != '') { // send the request. ajaxRequest('creategroup', [ {
     * tag : 'group_name', value : groupName }, { tag : 'user_id', value :
     * user_id }, { tag : 'friends', value : friends_share_object.selFriends } ],
     * function(ret_xml) { // parse the returned xml. var status =
     * getValueFromXMLTag(ret_xml, 'status'); var message =
     * getValueFromXMLTag(ret_xml, 'message'); if (status.toLowerCase() ==
     * 'success') { // jsuccess('group was created successfully.');
     * share_gotoPage(SHAREPAGE_TAB_MEMREAS); } // else // jerror(message); }); }
     * 
     * if (friends_share_object.emailTags.length == 0 &&
     * friends_share_object.selFriends.length == 0) { share_clearMemreas(true);
     * $("a.memreas").click(); return; }
     */
};

//
// call ajax add existing media to event
//
ajaxAddFriendToEvent = function() {

    ajaxRequest('addfriendtoevent', [ {
	tag : 'user_id',
	value : user_id
    }, {
	tag : 'emails',
	value : friends_share_object.emailTags
    }, {
	tag : 'event_id',
	value : event_id
    }, {
	tag : 'friends',
	value : friends_share_object.selFriends
    } ], function(ret_xml) {
	// parse the returned xml.
	var status = getValueFromXMLTag(ret_xml, 'status');
	var message = getValueFromXMLTag(ret_xml, 'message');
	if (status.toLowerCase() == 'success') {
	    jsuccess('your friends added successfully.');
	    setTimeout(function() {
		//
		// User already sent to memreas tab from share add
		//
	    }, 2000);
	} else {
	    jerror(message);
	}
	//
	// Friends request succeeded so clear list
	//
	mr_friendsInfo = null;
	// share_changeSocialType();

	//
	// Clearvariables
	//
	share_clearMemreas(true);
	share_clearFriendsList();

	//
	// Redirect to memreas tab after success
	//
	$('.memrsclick').trigger('click');

    });

};

// clear all fields on Friends page when click "cancel" button.
share_clearFriends = function() {
    clearTextField([ 'txt_emaillist', 'txt_groupname' ]);
    clearCheckBox('ckb_makegroup');

};

/**
 * Update checkbox when date fill in
 */
$(function() {
    $("#dtp_date").datepicker();
    $("#dtp_from").datepicker();
    $("#dtp_to").datepicker();
    $("#dtp_selfdestruct").datepicker();
    $("#sellmedia_duration_from").datepicker();
    $("#sellmedia_duration_to").datepicker();
    $("#dtp_from").change(function() {
	var filledin = $(this).val();
	if (filledin != '')
	    $("#ckb_viewable").attr('checked', 'checked');
	else
	    $("#ckb_viewable").attr('checked', false);
    });
    /* fix select date from */
    $("input#ckb_viewable").change(function() {
	if (!$(this).is(":checked")) {
	    $("#dtp_from").val('from');
	    $("#dtp_to").val('to');
	}
    });
    $("#dtp_from").change(function() {
	checkValidDateFromTo();
    });
    $("#dtp_to").change(function() {
	var current_date = new Date();
	var date_to = new Date($(this).val());
	if (date_to < current_date) {
	    jerror('Date to can not less than today.');
	    $("#dtp_to").val('').focus();
	} else
	    checkValidDateFromTo();
    });
});

function getThreeLetterMonth(index) {
    var monthNames = [ "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG",
	    "SEP", "OCT", "NOV", "DEC" ];

    return monthNames(index);

}

function fetchDateFormatted(month, day, year) {
    var date = day + '-' + getThreeLetterMonth(month) + '-' + year;
    return date;
}

function checkValidDateFromTo(isSubmit) {
    var date_viewable_from = $("#dtp_from").val();
    var date_viewable_to = $("#dtp_to").val();

    // dates are set so check
    if (date_viewable_from != 'from' && date_viewable_to != 'to') {
	var date_from = new Date(date_viewable_from);
	var date_to = new Date(date_viewable_to);

	var current_date = new Date();
	if (date_from > date_to) {
	    jerror('Viewable date must valid. From date must less than to date.');
	    $("#dtp_to").val('').focus();
	    return false;
	}
	if (date_to < current_date) {
	    jerror('Date to can not less than today.');
	    $("#dtp_to").val('').focus();
	    return false;
	}
    }
    if (isSubmit) {
	if (date_viewable_from != 'from'
		&& (date_viewable_to == 'to' || date_viewable_to == '')) {
	    jerror('Please specify date to');
	    $("#dtp_to").focus();
	    return false;
	} else if (date_viewable_to != 'to'
		&& (date_viewable_from == 'from' || date_viewable_from == '')) {
	    jerror('Please specify date from.');
	    $("#dtp_from").focus();
	    return false;
	} else {
	    // Check if date created and viewable
	    var event_create_date = $("#dtp_date").val();
	    if (event_create_date != '' || event_create_date != 'from') {
		if (date_viewable_from != '' || date_viewable_from != 'from') {
		    var date_from = new Date(date_viewable_from);
		    var date_create = new Date(event_create_date);
		    if (date_from < date_create) {
			jerror('Viewable date must greater than event date create.');
			return false;
		    }
		}
	    }
	}

	// Check destruct date
	var seftdestruct_date = $("#dtp_selfdestruct").val();
	var jDestructElement = $("#dtp_seftdestruct");
	if (seftdestruct_date != '') {
	    destruct_date = new Date(seftdestruct_date);
	    var event_create_date = $("#dtp_date").val();
	    if (event_create_date != '' || event_create_date != 'from') {

		// Check if destruct date less than creating date
		var event_create_date = $("#dtp_date").val();
		if (event_create_date != '' || event_create_date != 'from') {
		    var date_from = new Date(event_create_date);
		    if (destruct_date < date_from) {
			jerror('Ghost date must be larger or equal to the event date.');
			jDestructElement.focus();
			return false;
		    }
		}

		// Check if destruct date less than viewable from and to
		var date_viewable_from = $("#dtp_from").val();
		var date_viewable_to = $("#dtp_to").val();

		if (date_viewable_from != 'from' || date_viewable_from != '') {
		    var date_from = new Date(date_viewable_from);
		    if (destruct_date < date_from) {
			jerror('Destruct date must larger than viewable date from');
			jDestructElement.focus();
			return false;
		    }
		}

		if (date_viewable_to != 'to' || date_viewable_to != '') {
		    var date_to = new Date(date_viewable_to);
		    if (destruct_date < date_to) {
			jerror('Destruct date must larger than viewable date to');
			jDestructElement.focus();
			return false;
		    }
		}
	    }
	}
	return true;
    }
}

// Click to register seller from share tab
function registerSeller() {
    $("a.more").trigger('click');
    $(".sell-media-tab").trigger('click');
}

// Click to active subscription
function activeSubscription() {
    $("a.more").trigger('click');
    $("a.subscription-tab").trigger('click');
}

function shareCheckSellMedia() {
    if (userObject.plan != 'FREE' && userObject.type != 'Free user'
	    && (userObject.type).indexOf('seller') >= 0)
	return true;
    else
	return false;
}

function sharePopupMarketTerm() {
    // checking for sell media popup is activated
    if ($("#popupSellMedia").is(":visible"))
	var callBackTab = "popupSellMedia";
    if ($("#popupBuyMedia").is(":visible"))
	var callBackTab = "popupBuyMedia";
    if ($("#popupBuyCredit").is(":visible"))
	var callBackTab = "popupBuyCredit";

    $("#popupMarketTerms").find("a.callback-btn").attr("onclick",
	    "reactiveLastMarketTab('" + callBackTab + "');")
    disablePopup(callBackTab);
    popup("popupMarketTerms");
}

function reactiveLastMarketTab(callbackId) {
    disablePopup("popupMarketTerms");
    popup(callbackId);
}