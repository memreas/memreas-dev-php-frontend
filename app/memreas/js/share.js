/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
// MACROS for tab indices.
var SHAREPAGE_TAB_MEMREAS = 1; // tab index of memreas details on share page
var SHAREPAGE_TAB_MEDIA = 2; // tab index of media on share page
var SHAREPAGE_TAB_FRIENDS = 3; // tab index of friends on share page

// google map object
var location_map = null;
// geocoder object to get the location address from langtitude and longtitude
var geocoder = null;

var user_id = $("input[name=user_id]").val(); // signed user id
var event_id = ""; // created event id
var media_ids = []; // array of selected media id
var device_id = ""; // current device id

var media_page_index = '1'; // page index number for media
var media_limit_count = '200'; // limit count of media

// For selling media
var sell_media_price = 0;

var friendList = null;
var current_sharefriendnw_selected = '';

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
			$("#ckb_viewable").attr("checked", true);
                                // alert('hello');
			popup("popupSellMedia");
			return false;
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

	if (!userBrowser[0].ios)
		ar_initAudio();
}

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
}

// change the friend list by social type.
share_changeSocialType = function() {
	var socialType = $("#cmb_socialtype option:selected").val();
	// Reset friend element
	friendList = null;
	switch (socialType) {
	case "memreas":
		if (mr_friendsInfo == null)
			memreas_getFriendList();
		else
			share_addFriends(mr_friendsInfo);
		break;
	default:
		$("#cmb_socialtype option[value=memreas]").attr('selected', true);
		share_changeSocialType();
		break;
	}
}

// initialize and customize the scroll bar.
share_customScrollbar = function() {

	$("#tab-content-share div.hideCls").hide(); // Initially hide all content
	$("#tabs-share li:first").attr("id", "current"); // Activate first tab
	$("#tab-content-share div:first").fadeIn(); // Show first tab content*/

	$('#tabs-share a').click(
			function(e) {

				e.preventDefault();
				$("#tab-content-share div.hideCls").hide(); // Hide all content
				$("#tabs-share li").attr("id", ""); // Reset id's
				$(this).parent().attr("id", "current"); // Activate this
				$('#' + $(this).attr('title')).fadeIn(); // Show content for
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
			$("ul.scrollClass .mCSB_container").html(data); // load new content
															// inside
															// .mCSB_container
			$("ul.scrollClass").mCustomScrollbar("update"); // update scrollbar
															// according to
															// newly loaded
															// content
			$("ul.scrollClass").mCustomScrollbar("scrollTo", "top", {
				scrollInertia : 200
			}); // scroll to top
		});
	});
	$("a[rel='append-content']").click(function(e) {
		e.preventDefault();
		var $this = $(this), url = $this.attr("href");
		$this.addClass("loading");
		$.get(url, function(data) {
			$this.removeClass("loading");
			$("ul.scrollClass .mCSB_container").append(data); // append new
																// content
																// inside
																// .mCSB_container
			$("ul.scrollClass").mCustomScrollbar("update"); // update scrollbar
															// according to
															// newly appended
															// content
			$("ul.scrollClass").mCustomScrollbar("scrollTo", "h2:last", {
				scrollInertia : 2500,
				scrollEasing : "easeInOutQuad"
			}); // scroll to appended content
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
		var err_msg = "Error while getting location. Device GPS/location may be disabled."
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
}

// Check valid duration
function checkSellMediaDuration() {
    //debugger;
	var sellmedia_duration_from = $("#sellmedia_duration_from").val();
	var sellmedia_duration_to = $("#sellmedia_duration_to").val();

	// Reset default values
	if (sellmedia_duration_from == 'available from')
		sellmedia_duration_from = '';
	if (sellmedia_duration_to == 'available to')
		sellmedia_duration_to = '';

	if (sellmedia_duration_from != '' || sellmedia_duration_to != '') {
		if (sellmedia_duration_from == '') {
			jerror("please input available from");
			return false;
		}
		if (sellmedia_duration_to == '') {
			jerror('please input available to');
			return false;
		}

		var date_from = new Date(sellmedia_duration_from);
		var date_to = new Date(sellmedia_duration_to);
                
                var date1 = new Date(date_from);
                var date2 = new Date(date_to);
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                //alert(diffDays);

		if (date_to <= date_from) {
			jerror("Date to must be larger than date from");
			return false;
		}

		var cdate = new Date();
		var current_date = ("0" + (cdate.getMonth() + 1)).slice(-2) + '/'
				+ ("0" + cdate.getDate()).slice(-2) + '/' + cdate.getFullYear();
		current_date = new Date(current_date);

		if (date_from < current_date) {
			jerror("Date from must be larger than date today");
			return false;
		}

		if (date_to < current_date) {
			jerror("Date to must be larger than date today");
			return false;
		}
                if(diffDays >30){
                    jerror('Date  should be selected only for 30 days ');
                    return false;
                }

		return true;
	} else {
		jerror("Please specify media available for viewing");
		return false;
	}
}

// add the new event by request to the server.
share_addEvent = function(medianext) {
    //debugger;
	var sellmedia_duration_from = '';
	var sellmedia_duration_to = ''

	// Precheck for selling media is popup or not and check for correction
	if ($("#popupSellMedia").is(":visible")) {
		var sellmedia_price_select = $("#sellmedia_price").val();
		if (sellmedia_price_select == '') {
			jerror("please select the price");
			return false;
		}

		var passDuration = checkSellMediaDuration();
		if (!passDuration)
			return false;

		sellmedia_duration_from = $("#sellmedia_duration_from").val();
		sellmedia_duration_to = $("#sellmedia_duration_to").val();

		if (!$("#ckb_sellmedia_agree").is(":checked")) {
			jerror("You must agree with our terms and conditions");
			return false;
		}
		sell_media_price = sellmedia_price_select;
	}

	disablePopup('popupSellMedia');
	share_closeGoogleMap(true);
	var name = getElementValue('txt_name');
	if (name == "") {
		jerror("You have to input the name.");
		return;
	}
	if (checkValidDateFromTo(true)) {

		var date = getElementValue('dtp_date');
		var location = getElementValue('txt_location');
		var date_from = getElementValue('dtp_from');
		var date_to = getElementValue('dtp_to');
		var date_selfdestruct = getElementValue('dtp_selfdestruct');

		var ckb_canpost = getCheckBoxValue('ckb_canpost');
		var ckb_canadd = getCheckBoxValue('ckb_canadd');
		var ckb_public = getCheckBoxValue('ckb_public');

		// Sell media public as default
		if (sell_media_price > 0) {
			ckb_public = 1;
			ckb_canpost = 0;
			ckb_canadd = 0;
			date_from = sellmedia_duration_from;
			date_to = sellmedia_duration_to;
		}

		var ckb_viewable = getCheckBoxValue('ckb_viewable');
		var ckb_selfdestruct = getCheckBoxValue('ckb_selfdestruct');

		// Checking for selling media
		if ($("#ckb_sellmedia").is(":checked") && sell_media_price > 0 ) {
                    //alert('hello');
                    
			//popup("popupSellMedia");
			//return true;
		}

		// send the request.
		shareDisableFields();
		ajaxRequest('addevent', [ {
			tag : 'user_id',
			value : user_id
		}, {
			tag : 'event_name',
			value : name
		}, {
			tag : 'event_date',
			value : formatDateToDMY(date)
		}, {
			tag : 'event_location',
			value : location
		}, {
			tag : 'event_from',
			value : formatDateToDMY(date_from)
		}, {
			tag : 'event_to',
			value : formatDateToDMY(date_to)
		}, {
			tag : 'is_friend_can_add_friend',
			value : ckb_canadd.toString()
		}, {
			tag : 'is_friend_can_post_media',
			value : ckb_canpost.toString()
		}, {
			tag : 'event_self_destruct',
			value : formatDateToDMY(date_selfdestruct)
		}, {
			tag : 'is_public',
			value : ckb_public.toString()
		}, {
			tag : 'price',
			value : sell_media_price.toString()
		}, {
			tag : 'duration_from',
			value : sellmedia_duration_from
		}, {
			tag : 'duration_to',
			value : sellmedia_duration_to
		} ], function(ret_xml) {
			// parse the returned xml.
                        
                        console.log('Sell Media: '+ret_xml);
			var status = getValueFromXMLTag(ret_xml, 'status');
			var message = getValueFromXMLTag(ret_xml, 'message');

			 event_id = getValueFromXMLTag(ret_xml, 'event_id');

			if (status.toLowerCase() == 'success') {
				jsuccess('Event "' + name + '" was registered successfully.');
				pushReloadItem('view_my_events');
                                
                                if(medianext =='next'){
                                          setTimeout(function() {
					var text_ids = [ 'txt_name', 'txt_location', 'dtp_date',
							'dtp_from', 'dtp_to', 'dtp_selfdestruct' ];
					clearTextField(text_ids);
					share_gotoPage(SHAREPAGE_TAB_MEDIA);
				}, 2000);
                                        }
				
				sell_media_price = 0;
			} else {
				jerror(message);
			}
			shareEnableFields();
		}, 'undefined', true);
	}
}

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
share_clearMemreas = function(confirmed) {
	if (confirmed) {
		var i = 0;
		var text_ids = [ 'txt_name', 'txt_location', 'dtp_date', 'dtp_from',
				'dtp_to', 'dtp_selfdestruct' ];

		clearTextField(text_ids);
		$("a[title=share]").click();
	} else {
		jconfirm('Are you sure want to restart progress?',
				'share_clearMemreas(true)');
	}
}

// click event function for "public (anyone can add or post)" checkbox.
share_clickCkbPublic = function() {

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
}

// go to the other page (1: memreas details, 2: media, 3: friends)
share_gotoPage = function(tab_no) {
	$('#tabs-share li:nth-child(' + tab_no + ') a').click();
}

// add the comment to Media when click "next" button on the Media Page.
share_addComment = function(next_step) {
	if (event_id == '') {
		jerror("Please complete event detail at step 1");
		return false;
	}

	media_ids = fetch_selected_media();
	if (media_ids.length <= 0) {
		jconfirm("You didn't add any media! Continue?",
				'share_uploadMedias(true)');
		return false;
	} else {
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
					jsuccess('comments was added successfully.');
                                        if(next_step =='next'){
                                           setTimeout(function() {
						share_gotoPage(SHAREPAGE_TAB_FRIENDS);
					}, 2000); 
                                        }
                                        
					
				} else {
					jerror(message);
				}
			});
		});
	}
}

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

	var params = [ {
		tag : 'event_id',
		value : event_id
	}, {
		tag : 'media_ids',
		value : media_id_params
	} ];
	disableButtons("#tab2-share");
	ajaxRequest('addexistmediatoevent', params, function(xml_response) {
		if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
			jsuccess(getValueFromXMLTag(xml_response, 'message'));

			var media_id_list = new Array();
			var count = 0;
			$("ul#share_medialist li.setchoosed").each(function() {
				media_id_list[++count] = $(this).find('a').attr('id');
				$(this).find('a').find('img.loading').remove();
			});
			enableButtons("#tab2-share");
			setTimeout(function() {
				share_gotoPage(SHAREPAGE_TAB_FRIENDS);
			}, 500);
		} else {
			enableButtons("#tab2-share");
			jerror(getValueFromXMLTag(xml_response, 'message'));
		}
	}, 'undefined', true);
}

// clear all fields on Media page when click "cancel" button.
share_clearMedia = function() {
	clearTextField('txt_comment');

	var mediaList = $("#share_medialist .mCSB_container li a img");

	for (var i = 0; i < mediaList.length; i++) {
		$(mediaList[i]).removeClass('setchoosed');
	}
}

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

						var sellmedia_price_select = $("#sellmedia_price").val();

						if ($("#ckb_sellmedia").is(":checked")) {
							var event_for_sale = true;
						}
						else {
							var event_for_sale = false;
						}

						var medias = getSubXMLFromTag(response, 'media');
						var count_media = medias.length;
						var jtarget_element = $('#share_medialist');
						if (jtarget_element.hasClass('mCustomScrollbar'))
							jtarget_element = $('#share_medialist .mCSB_container');
						jtarget_element.empty();
						for (var json_key = 0; json_key < count_media; json_key++) {
							var media = medias[json_key];
							var _media_type = getValueFromXMLTag(media, 'type');
							var _media_url = getMediaThumbnail(media,
									'/memreas/img/small-pic-3.jpg');
							var _media_id = getValueFromXMLTag(media,
									'media_id');
							if (_media_type == 'video') {

								var metadata = getValueFromXMLTag(media,
										'metadata').replace("<!--[CDATA[", "")
										.replace("]]-->", "");
								metadata = JSON.parse(metadata);
								var transcode_progress = metadata.S3_files.transcode_progress;

								//Checking for sale event with media copyright
								if (event_for_sale && sellmedia_price_select > 0) {
									if (typeof (metadata.S3_files.copyright) == 'undefined') {
										continue; //Skip non-copyright media available for listing at select media for sale
									}
									else {
										if (metadata.S3_files.copyright == null) {
											continue; //Same purpose as if condition above
										}
									}
								}

								return;

								// Check if web transcode is completed or not
								var web_transcoded = false;

								if (typeof (transcode_progress) != 'undefined') {
									for (var i = 0; i < transcode_progress.length; i++) {
										if (transcode_progress[i] == 'transcode_web_completed') {
											web_transcoded = true;
											break;
										}
									}
								}

								if (web_transcoded) {
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
							} else

								var metadata = getValueFromXMLTag(media,
									'metadata').replace("<!--[CDATA[", "")
									.replace("]]-->", "");

								if (typeof(metadata) != 'undefined') {
									metadata = JSON.parse(metadata);
									//Checking for sale event with media copyright
									if (event_for_sale && sellmedia_price_select > 0) {
										if (typeof (metadata.S3_files.copyright) == 'undefined') {
											continue; //Skip non-copyright media available for listing at select media for sale
										}
										else {
											if (metadata.S3_files.copyright == null) {
												continue; //Same purpose as if condition above
											}
										}
									}
								}

								jtarget_element
									.append('<li id="share-'
										+ _media_id
										+ '-parent"><a href="javascript:;" id="share-'
										+ _media_id
										+ '" class="image-sync" onclick="return imageChoosed(this.id);"><img src="'
										+ _media_url
										+ '" alt=""></a></li>');
						}

						ajaxScrollbarElement('#share_medialist');
					} else
						jerror("There is no media");
				});
	}
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
		el += '<figure class="pro-pics2" id="'
				+ info[i].div_id
				+ '" onclick="javascript:share_clickFriends(this.id);"><img src="/memreas/img/profile-pic.jpg" class="new-memreas" alt="" '
				+ (info[i].selected ? 'class="setchoosed"' : '') + '></figure>';
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
                if(info[i].photo){
                    $(imgList[i]).prop('src', info[i].photo);
                }else{
                   $(imgList[i]).prop('src', '/memreas/img/profile-pic.jpg');  
                }
		//$(imgList[i]).prop('src', info[i].photo);
               
	}
	$('#share_friendslist').mCustomScrollbar('update');
}

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
}

// make the group with selected friends and e-mail list.
share_makeGroup = function() {
	if (event_id == '') {
		jerror('Please complete event detail at step 1');
		return false;
	}

	var emailList = splitByDelimeters(getElementValue('txt_emaillist'), [ ',',
			';' ]);
	var emailTags = [];
	if (emailList.length > 0) {
		var counter = 0;
		for (i = 0; i < emailList.length; i++) {
			emailTags[counter++] = {
				tag : 'email',
				value : emailList[i]
			};
		}
	}
	var groupName = getElementValue('txt_groupname');
	var selFriends = [];
	var i = 0, count = 0;

	if (mr_friendsInfo) {
		for (i = 0; i < mr_friendsInfo.length; i++) {
			if (mr_friendsInfo[i].selected) {
				selFriends[count++] = {
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
	}

	if (groupName != '') {
		// send the request.
		ajaxRequest('creategroup', [ {
			tag : 'group_name',
			value : groupName
		}, {
			tag : 'user_id',
			value : user_id
		}, {
			tag : 'friends',
			value : selFriends
		} ], function(ret_xml) {
			// parse the returned xml.
			var status = getValueFromXMLTag(ret_xml, 'status');
			var message = getValueFromXMLTag(ret_xml, 'message');
			if (status.toLowerCase() == 'success'){
                            jsuccess('group was created successfully.');
                            share_gotoPage(SHAREPAGE_TAB_MEMREAS);
                        }
				
			//else
				//jerror(message);
		});
	}

	if (emailTags.length == 0 && selFriends.length == 0) {
		share_clearMemreas(true);
		$("a.memreas").click();
		return;
	}

	// Add friend to event
	// send the request.
	ajaxRequest('addfriendtoevent', [ {
		tag : 'user_id',
		value : user_id
	}, {
		tag : 'emails',
		value : emailTags
	}, {
		tag : 'event_id',
		value : event_id
	}, {
		tag : 'friends',
		value : selFriends
	} ], function(ret_xml) {
		// parse the returned xml.
		var status = getValueFromXMLTag(ret_xml, 'status');
		var message = getValueFromXMLTag(ret_xml, 'message');
		if (status.toLowerCase() == 'success') {
			jsuccess('your friends added successfully.');
			setTimeout(function() {
				var text_ids = [ 'txt_name', 'txt_location', 'dtp_date',
						'dtp_from', 'dtp_to', 'dtp_selfdestruct' ];
				var checkbox_ids = [ 'ckb_canpost', 'ckb_canadd', 'ckb_public',
						'ckb_viewable', 'ckb_selfdestruct' ];
				clearTextField(text_ids);
				clearCheckBox(checkbox_ids);
				$("a.memreas").click(); // Send user to memreas page
			}, 2000);
		} else
			jerror(message);
	});
}

// clear all fields on Friends page when click "cancel" button.
share_clearFriends = function() {
	clearTextField([ 'txt_emaillist', 'txt_groupname' ]);
	clearCheckBox('ckb_makegroup');
}

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
	$("#dtp_to").change(
			function() {
				var cdate = new Date();
				var current_date = ("0" + (cdate.getMonth() + 1)).slice(-2)
						+ '/' + ("0" + cdate.getDate()).slice(-2) + '/'
						+ cdate.getFullYear();
				current_date = new Date(current_date);
				var date_to = new Date($(this).val());
				if (date_to < current_date) {
					jerror('Date to can not less than today.');
					$("#dtp_to").val('').focus();
				} else
					checkValidDateFromTo();
			});
});
function checkValidDateFromTo(isSubmit) {
	var date_viewable_from = $("#dtp_from").val();
	var date_viewable_to = $("#dtp_to").val();
	if (date_viewable_from != 'from' && date_viewable_to != 'to') {
		var date_from = new Date(date_viewable_from);
		var date_to = new Date(date_viewable_to);
		var cdate = new Date();
		var current_date = ("0" + (cdate.getMonth() + 1)).slice(-2) + '/'
				+ ("0" + cdate.getDate()).slice(-2) + '/' + cdate.getFullYear();
		current_date = new Date(current_date);
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