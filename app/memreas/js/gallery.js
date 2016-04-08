/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
/*
 * Server side
 */

// console.log("Inside gallery.js");
var userObject = [];
var notificationHeaderObject = new Object(); // This variable stored header
// notification and compare with
// a new for checking
var blueIMPGallery = new Array();
var blueIMPGalleryData = '';
var gallery;

$(document).ready(
	function() {

	    console.log("Inside gallery tabs click functions");
	    $("a[title=gallery]").click(function() {
		$("#gallery #tabs a[title=tab1]").click();
	    });

	    $("#gallery #tabs a[title=tab1]").click(function() {
		if (checkReloadItem('listallmedia')) {
		    console.log("gallery.js $.fetch_server_media() fired...");
		    $.fetch_server_media();
		}
	    });

	    $(".location-tab").click(
		    function() {
			if (!($(".galleries-location").parent(
				".elastislide-carousel").length > 0))
			    $('.galleries-location').elastislide();
			gallery_showGoogleMap("gallery-location");
			// $('.galleries-location').find('li:eq(0)
			// img').trigger("click");
		    });

	});

var checkHasImage = false;
var objArr = new Array();
/* Load server media */
jQuery.fetch_server_media = function() {
    console.log("Inside jQuery.fetch_server_media");
    var verticalHeight = window.innerHeight;
    var HorizontalWidth = window.innerWidth;

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
		value : ''
	    }, {
		tag : 'rtmp',
		value : 'true'
	    }, {
		tag : 'limit',
		value : '200'
	    }, {
		tag : 'page',
		value : '1'
	    }, {
		tag : 'metadata',
		value : '1'
	    } ],
	    function(response) {
		// console.log("listallmedia response-->" + response);
		if (getValueFromXMLTag(response, 'status') == "Success") {

		    var medias = getSubXMLFromTag(response, 'media');

		    // $(
		    // ".user-resources, .scrollClass .mCSB_container,
		    // .sync-content .scrollClass")
		    // .html('');
		    var count_media = medias.length;

		    var items_for_gallery = "[";

		    var linksContainer = $('#links');

			//Reset area to prevent from duplicating items
			linksContainer.html('');
			$(".edit-area-scroll").html('');
			objArr = new Array();

		    var linksContainerData = '';

		    /** Initialize empty gallery and add within loop */
		    for (var json_key = 0; json_key < count_media; json_key++) {
			if (json_key > 0) {
			    items_for_gallery += ",\n";
			}
			var media = medias[json_key];
			var media_id = getValueFromXMLTag(media, 'media_id');
			var content_type;
			var _media_type = getValueFromXMLTag(media, 'type');
			var _media_url = '';
			var _media_url_hls = '';
			var _media_url_web = '';
			var _media_thumbnail = ''
			var _media_thumbnail_large = "";
			var main_media_url = '';
			var main_media_url_m3u8 = '';
			var source = "";
			var media_thummb_448 = "";
			if (_media_type == 'image') {
			    _media_url = getMediaUrl(media, _media_type);
			    content_type = 'image/jpeg';

			    main_media_url = getValueFromXMLTag(media,
				    'main_media_url');
			    // main_media_url=getValueFromXMLTag(media,'media_url_448x306');
			    _media_thumbnail_large = main_media_url = removeCdataCorrectLink(main_media_url);
			    media_thummb_448 = getValueFromXMLTag(media,
				    'media_url_448x306');
			    media_thummb_448 = removeCdataCorrectLink(media_thummb_448);
			} else if (_media_type == 'video') {
			    _media_url_hls = getValueFromXMLTag(media,
				    'media_url_hls');
			    _media_url_hls = removeCdataCorrectLink(_media_url_hls);
			    _media_url_web = getValueFromXMLTag(media,
				    'media_url_web');
			    _media_url_web = removeCdataCorrectLink(_media_url_web);
			    _media_thumbnail_large = getValueFromXMLTag(media,
				    'media_url_448x306');
			    _media_thumbnail_large = JSON
				    .parse(removeCdata(_media_thumbnail_large));
			    _media_thumbnail_large = _media_thumbnail_large[0];

			    _media_thumbnail = getValueFromXMLTag(media,
				    'media_url_98x78');
			    _media_thumbnail = JSON
				    .parse(removeCdata(_media_thumbnail));
			    _media_thumbnail = _media_thumbnail[0];

			}

			var item = new Object();
			if (_media_type == 'video') {
			    item['title'] = media_id;
			    item['type'] = "video/*";
			    item['poster'] = _media_thumbnail_large;
			    item['sources'] = [ {
				href : _media_url_hls,
				type : "application/x-mpegurl"
			    }, {
				href : _media_url_web,
				type : "video/mp4"
			    } ];

			    linksContainerData += '<a href="' + _media_url_web
				    + '"';
			    linksContainerData += ' title="' + media_id + '"';
			    linksContainerData += ' type="video/mp4" data-gallery="'
				    + media_id
				    + '" class="blueimp-gallery-thumb-anchor "';
			    linksContainerData += ' style="background:url('
				    + _media_thumbnail_large
				    + ')"><span class="video-content-play-icon"></span></a>';

			} else {
			    item['title'] = media_id;
			    item['type'] = "image/jpeg";
			    item['href'] = main_media_url;
			    item['poster'] = main_media_url;

			    linksContainerData += '<a href="' + main_media_url
				    + '" title="' + media_id
				    + '" data-gallery="' + media_id
				    + '" class="blueimp-gallery-thumb-anchor"';
			    linksContainerData += ' style="background:url('
				    + media_thummb_448 + ')"><span></span></a>';

			}
			// console.log("item" + JSON.stringify(item));
			objArr.push(item);

			// Delete Tab Data
			if (_media_type == 'video') {
				$(".edit-area-scroll")
					.append(
						'<li><a class="image-sync" id="'
						+ media_id
						+ '" onclick="return imageChoosed(this.id);" href="'
						+ _media_thumbnail_large
						+ '"><img src="'
						+ _media_thumbnail_large
						+ '"/><span class="video-content-play-icon" style="position: absolute; left: 10%; top: -5%;"></span></a></li>');
			}
			else {
				$(".edit-area-scroll")
					.append(
						'<li><a class="image-sync" id="'
						+ media_id
						+ '" onclick="return imageChoosed(this.id);" href="'
						+ _media_thumbnail_large
						+ '"><img src="'
						+ _media_thumbnail_large
						+ '"/></a></li>');
			}

			$(".preload-files .pics").append(
				'<li><img src="' + _media_url + '"/></li>');
			$(".aviary-thumbs")
				.append(
					'<li><img id="edit'
						+ media_id
						+ '" src="'
						+ _media_thumbnail_large
						+ '" onclick="openEditMedia(this.id, \''
						+ _media_thumbnail_large
						+ '\');"/></li>');
			$(".galleries-location").append(
				'<li><img id="location' + media_id
					+ '" class="img-gallery" src="'
					+ _media_thumbnail + '" /></li>');
			checkHasImage = true;

			// End Delete Tab

		    } // end for

		    $(linksContainer).append(linksContainerData);
		    $('#blueimp-gallery').hide();

		    setTimeout(function() {
			// Fetch user's notification header
			getUserNotificationsHeader();
		    }, GALLERYDELAYTIME);
		    setTimeout(function() {
			checkUserresourcesId(medias);
		    }, GALLERYDELAYTIME);
		    // $(".swipebox").swipebox();

		    // Show edit and delete tabs

		    $("a[title=tab2], a[title=tab3]").show();

		} else {
		    jerror('There is no media on your account! Please use upload tab on leftside you can add some resources!');

		    // Go to queue page
		    $("a.queue").trigger('click');

		    // If there is no media hide edit & delete tabs
		    $("a[title=tab2], a[title=tab3]").hide();
		    $("#gallery #tabs").find("li").removeClass('current');
		    $("#gallery #tabs").find("li:eq(0)").addClass('current');

		    $("#gallery #tab-content").find(".hideCls").hide();
		    $("#gallery #tab-content").find(".hideCls:eq(0)").show();
		    // Fetch user's notification header
		    getUserNotificationsHeader();
		}
		return true;
	    });
}

$(document).on('click', '[data-gallery]', function(event) {
    var id = $(this).data('gallery');
    var widget = $(id);
    var selected_media_id;
    var media_id;
    var obj;
    selected_media_id = widget.selector;
    console.log("objArr.length-->"+objArr.length);
    for (i=0; i<objArr.length; i++) {
	obj = objArr[i];
	if (selected_media_id == obj['title']) {
	    break;
	}
    }
    return blueimp.Gallery([obj], { container : '#blueimp-gallery', carousel : true});
});

function getUserNotificationsHeader() {
    // console.log("Inside gallery.js - getUserNotificationsHeader");
    var user_id = $("input[name=user_id]").val();
    var jTargetElement = $(".notification-head ul");
    if (jTargetElement.hasClass("mCustomScrollbar"))
	jTargetElement = $(".notification-head ul .mCSB_container");

    // Check if user has new notification
    // if (document.hasFocus()) {
    // var item = new Date();
    // alert("has focus @" + item.toTimeString());

    ajaxRequest(
	    'listnotification',
	    [ {
		tag : 'receiver_uid',
		value : user_id
	    } ],
	    function(ret_xml) {
		if (getValueFromXMLTag(ret_xml, 'status') == 'success') {
		    var notifications = getSubXMLFromTag(ret_xml,
			    'notification');

		    if (notificationHeaderObject.length != notifications.length) {
			notificationHeaderObject = notifications;
			var notification_count = notifications.length;
			$(".notification-count").html(notification_count);
			if (notification_count > 0) {
			    var html_content = '';
			    for (var i = 0; i < notification_count; i++) {
				var notification = notifications[i].innerHTML;

				var notification_id = getValueFromXMLTag(
					notifications[i], 'notification_id');
				var notification_type = getValueFromXMLTag(
					notifications[i], 'notification_type');
				var meta_text = getValueFromXMLTag(
					notifications[i], 'message');
				meta_text = '<span>' + meta_text + '</span>';
				// meta_text =
				// removeCdataCorrectLink(meta_text);
				meta_text = $('<div/>').html(meta_text).text();

				var user_profile_pic = removeCdataCorrectLink(getValueFromXMLTag(
					notifications[i], 'profile_pic'));
				var notification_status = getValueFromXMLTag(
					notifications[i], 'notification_status');
				if (user_profile_pic == '')
				    user_profile_pic = '/memreas/img/profile-pic.jpg';

				var notification_type = getValueFromXMLTag(
					notifications[i], 'notification_type');
				if ([ 'ADD_MEDIA', 'ADD_COMMENT',
					'ADD_FRIEND_TO_EVENT_RESPONSE' ]
					.indexOf(notification_type) >= 0) {
				    var comment_id = getValueFromXMLTag(
					    notifications[i], 'comment_id');
				    var comment_text = getValueFromXMLTag(
					    notifications[i], 'comment');
				    var event_id = getValueFromXMLTag(
					    notifications[i], 'event_id');
				    comment_text = removeCdataCorrectLink(comment_text);

				    var comment_time = new Date(
					    (getValueFromXMLTag(ret_xml,
						    'comment_time')) * 1000);

				    html_content += '<li id="notification-header-'
					    + notification_id
					    + '"><div class="notifications-all clearfix">'
					    + '<div class="notification-pic"><img src="'
					    + user_profile_pic
					    + '" /></div>'
					    + '<div class="notification-right">'
					    + '<div class="noti-title">'
					    + meta_text
					    + '</div>'
					    + '<div class="noti-content">'
					    + '<p>'
					    + comment_text
					    + '</p>'
					    + '</div>'
					    + '<span class="notification-time">'
					    + comment_time.getHours()
					    + ':'
					    + correctDateNumber(comment_time
						    .getMinutes())
					    + '<br/>'
					    + correctDateNumber(comment_time
						    .getDate())
					    + '/'
					    + correctDateNumber(comment_time
						    .getMonth())
					    + '/'
					    + comment_time.getFullYear()
					    + '</span>'
					    + '<a href="javascript:;" onclick="updateNotificationHeader(\''
					    + notification_id
					    + '\', \'ignore\');" class="close">x</a>'
					    + '<a href="javascript:;" onclick="gotoEventDetail(\''
					    + event_id
					    + '\', \''
					    + notification_id
					    + '\');" class="reply">reply</a>'
					    + '</div>' + '</div></li>';

				} else {
				    var notification_updated = new Date(
					    (getValueFromXMLTag(ret_xml,
						    'notification_updated')) * 1000);
				    if (notification_status == '0')
					var link_action = '<a href="javascript:;" class="reply" onclick="updateNotificationHeader(\''
						+ notification_id
						+ '\', \'ignore\');">ignore</a> <a href="javascript:;" class="reply" onclick="showUpdateNotification(\''
						+ notification_id
						+ '\', \'accept\');">ok</a>';
				    else
					var link_action = '';
				    html_content += '<li id="notification-header-'
					    + notification_id
					    + '"><div class="notifications-all clearfix">'
					    + '<div class="notification-pic"><img src="'
					    + user_profile_pic
					    + '" /></div>'
					    + '<div class="noti-content">'
					    + '<div class="noti-content">'
					    + '<p>'
					    + meta_text
					    + '</p><div class="clear"></div>'
					    + '</div>'
					    + '<span class="notification-time">'
					    + notification_updated.getHours()
					    + ':'
					    + correctDateNumber(notification_updated
						    .getMinutes())
					    + '<br/>'
					    + correctDateNumber(notification_updated
						    .getDate())
					    + '/'
					    + correctDateNumber(notification_updated
						    .getMonth())
					    + '/'
					    + notification_updated
						    .getFullYear()
					    + '</span>'
					    + '</div>'
					    + link_action
					    + '</div></li>';
				}
			    }
			    jTargetElement.empty().html(html_content);
			    jTargetElement.mCustomScrollbar({
				scrollButtons : {
				    enable : true
				}
			    });
			} else {
			    jTargetElement
				    .html('<div class="notifications-all clearfix">'
					    + '<div class="noti-content">'
					    + '<p>You have no notification.</p>'
					    + '</div>' + '</div>');
			}
		    }
		} else {
		    $(".notification-count").html(0);
		    jTargetElement
			    .html('<div class="notifications-all clearfix">'
				    + '<div class="noti-content">'
				    + '<p>You have no notification.</p>'
				    + '</div>' + '</div>');
		}

		setTimeout(function() {
		    getUserNotificationsHeader()
		}, LISTNOTIFICATIONSPOLLTIME);
	    }, 'undefined', true);
    // }// end if hasFocus
}

function updateNotificationHeader(notification_id, update_status) {
    console.log("Inside gallery.js - updateNotificationHeader");
    switch (update_status) {
    case 'accept':
	var message_feedback = $(".notification-popup-message").val();
	var params = [ {
	    tag : 'notification',
	    value : [ {
		tag : 'notification_id',
		value : notification_id
	    }, {
		tag : 'status',
		value : '1'
	    }, {
		tag : 'message',
		value : message_feedback
	    } ]
	} ];
	disablePopup("popupGiveMessage");
	ajaxRequest('updatenotification', params, function(response) {
	    if (getValueFromXMLTag(response, 'status') == 'success') {
		jsuccess(getValueFromXMLTag(response, 'message'));
		$("#notification-header-" + notification_id).fadeOut(500)
			.delay(500).remove();
	    } else
		jerror(getValueFromXMLTag(response, 'message'));
	    removeLoading("#notification-header-" + notification_id
		    + " .notifications-all");
	});
	break;
    case 'ignore':
	var params = [ {
	    tag : 'notification',
	    value : [ {
		tag : 'notification_id',
		value : notification_id
	    }, {
		tag : 'status',
		value : '2'
	    } ]
	} ];

	addLoading("#notification-header-" + notification_id
		+ " .notifications-all", 'div', 'notification-header-loading');
	ajaxRequest('updatenotification', params, function(response) {
	    if (getValueFromXMLTag(response, 'status') == 'success') {
		jsuccess(getValueFromXMLTag(response, 'message'));
		$("#notification-header-" + notification_id).fadeOut(500)
			.delay(500).remove();
	    } else
		jerror(getValueFromXMLTag(response, 'message'));
	    removeLoading("#notification-header-" + notification_id
		    + " .notifications-all");
	}, 'undefined', true);
	break;
    default:
	jerror('No action performed');
    }
}

function showUpdateNotification(notification_id) {
    console.log("Inside gallery.js - showUpdateNotification");
    $("#accept-notification").attr(
	    'onclick',
	    'updateNotificationHeader(\'' + notification_id
		    + '\', \'accept\');')
    popup("popupGiveMessage");
}

function gotoEventDetail(eventId, notification_id) {
    console.log("Inside gallery.js - gotoEventDetail");

    updateNotificationHeader(notification_id, 'accept');

    eventdetail_id = eventId;
    eventdetail_user = $('input[name=user_id]').val();
    userId = eventdetail_user;

    // Show gallery details
    var target_element = $(".memreas-detail-gallery");
    if (target_element.hasClass('mCustomScrollbar'))
	target_element = $(".memreas-detail-gallery .mCSB_container");
    target_element.empty();

    /* Update details_tab also */
    $(".carousel-memrease-area").empty();
    $(".carousel-memrease-area").append(
	    '<ul id="carousel" class="elastislide-list"></ul>');
    var jcarousel_element = $("ul#carousel");
    jcarousel_element.empty();

    removeItem(reloadItems, 'view_my_events');
    $("a.memreas").trigger('click');
    $(".memreas-main").hide();
    $(".memreas-detail").fadeIn(500);
    pushReloadItem('view_my_events');

    ajaxRequest(
	    'listallmedia',
	    [ {
		tag : 'event_id',
		value : eventId
	    }, {
		tag : 'user_id',
		value : userId
	    }, {
		tag : 'device_id',
		value : device_id
	    }, {
		tag : 'limit',
		value : media_limit_count
	    }, {
		tag : 'page',
		value : media_page_index
	    } ],
	    function(response) {

		var eventId = getValueFromXMLTag(response, 'event_id');
		if (getValueFromXMLTag(response, 'status') == "Success") {
		    var medias = getSubXMLFromTag(response, 'media');
		    if (typeof (eventId != 'undefined')) {
			event_owner_name = getValueFromXMLTag(response,
				'username');
			eventdetail_user_pic = getValueFromXMLTag(response,
				'profile_pic');
			eventdetail_user_pic = removeCdataCorrectLink(eventdetail_user_pic);

			$(".memreas-detail-comments .event-owner .pro-pics img")
				.attr(
					'src',
					$("header").find("#profile_picture")
						.attr('src'));
			$(".memreas-detail-comments .pro-names").html(
				event_owner_name);

			var media_count = medias.length;
			for (var i = 0; i < media_count; i++) {
			    var media = medias[i];
			    var _main_media = getMediaUrl(media);

			    var _media_url = getMediaThumbnail(media,
				    '/memreas/img/small/1.jpg');

			    var _media_type = getValueFromXMLTag(media, 'type');

			    var mediaId = getValueFromXMLTag(media, 'media_id');
			    if (_media_type == 'video') {
				target_element
					.append('<li class="video-media" id="memreasvideo-'
						+ mediaId
						+ '" media-url="'
						+ _main_media
						+ '"><a href=\'javascript:popupVideoPlayer("memreasvideo-'
						+ mediaId
						+ '");\' id="button"><img src="'
						+ _media_url
						+ '" alt=""><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a></li>');
				jcarousel_element.append('<li data-preview="'
					+ _media_url + '"  media-id="'
					+ mediaId + '"><a href="#"><img src="'
					+ _media_url
					+ '" alt="image01" /></a></li>');
			    } else {
				target_element
					.append('<li  media-id="'
						+ mediaId
						+ '"><a href="'
						+ _media_url
						+ '" class="swipebox" title="photo-2"><img src="'
						+ _media_url
						+ '" alt=""></a></li>');
				jcarousel_element.append('<li data-preview="'
					+ _main_media + '"  media-id="'
					+ mediaId + '"><a href="#"><img src="'
					+ _media_url
					+ '" alt="image01" /></a></li>');
			    }
			}
		    }
		} else
		    jerror(getValueFromXMLTag(response, 'message'));
		$(".memreas-addfriend-btn").attr('href',
			"javascript:addFriendToEvent('" + eventId + "');");
		$(".memreas-detail-gallery .swipebox").swipebox();
		ajaxScrollbarElement('.memreas-detail-gallery');
		$("a[title=memreas-detail-tab3]").trigger('click');

		var checkCommentLoaded = setInterval(function() {

		    // Make sure comment is loaded
		    if (!($('.memreas-detail-comments').find('.loading') > 0)) {
			showPopupComment();
			clearInterval(checkCommentLoaded);
		    }
		}, 3000);
	    });
    $("#popupAddMedia a.accept-btn").attr("href",
	    "javascript:addMemreasPopupGallery('" + eventId + "')");

    // Show comment count/event count
    ajaxRequest('geteventcount', [ {
	tag : 'event_id',
	value : eventdetail_id
    } ], function(response) {
	var jTargetLikeCount = $(".memreas-detail-likecount span");
	var jTargetCommentCount = $(".memreas-detail-commentcount span");
	if (getValueFromXMLTag(response, 'status') == "Success") {
	    var comment_count = getValueFromXMLTag(response, 'comment_count');
	    var like_count = getValueFromXMLTag(response, 'like_count');
	} else {
	    var comment_count = 0;
	    var like_count = 0;
	}
	jTargetLikeCount.html(like_count)
	jTargetCommentCount.html(comment_count);
    }, 'undefined', true);
}

var deleteMediasChecked = 0;

function deleteFiles(confirmed) {
    console.log("Inside gallery.js - deleteFiles");
    if (!($(".edit-area").find(".setchoosed").length > 0)) {
	jerror('There is no media selected');
	return false;
    }
    if (!confirmed) {
	// Confirm to delete
	jNotify(
		'<div class="notify-box"><p>Are you sure want to delete them?</p><a href="javascript:;" class="btn" onclick="deleteFiles(true);">OK</a>&nbsp;<a href="javascript:;" class="btn" onclick="$.jNotify._close();">Close</a></div>',
		{
		    autoHide : false, // added in v2.0
		    clickOverlay : true, // added in v2.0
		    MinWidth : 250,
		    TimeShown : 3000,
		    ShowTimeEffect : 200,
		    HideTimeEffect : 0,
		    LongTrip : 20,
		    HorizontalPosition : 'center',
		    VerticalPosition : 'top',
		    ShowOverlay : true,
		    ColorOverlay : '#FFF',
		    OpacityOverlay : 0.3,
		    onClosed : function() { // added in v2.0

		    },
		    onCompleted : function() { // added in v2.0

		    }
		});
    }
    if (confirmed) {
	$.jNotify._close();
	disableButtons('.edit-area');
	// Store data to javascript
	$(".edit-area a").each(function() {
	    if ($(this).parent('li').hasClass("setchoosed")) {
		var media_id = $(this).attr("id");
		var xml_data = new Array();
		xml_data[0] = new Array();
		xml_data[0]['tag'] = 'mediaid';
		xml_data[0]['value'] = media_id.trim();

		// Put to management object
		++deleteMediasChecked;
	    }
	});

	// Delete medias
	$(".edit-area a")
		.each(
			function() {
			    if ($(this).parent('li').hasClass("setchoosed")) {
				var media_id = $(this).attr("id");
				var xml_data = new Array();
				xml_data[0] = new Array();
				xml_data[0]['tag'] = 'mediaid';
				xml_data[0]['value'] = media_id.trim();
				$(this)
					.parent('li')
					.find('a')
					.append(
						'<img src="/memreas/img/loading-line.gif" class="loading-small loading" />');

				ajaxRequest('deletephoto', xml_data,
					success_deletephoto, error_deletephoto,
					true);
			    }
			});
    }
    return false;
}

function success_deletephoto(xml_response) {

    // If there is no more medias to be deleted, reload resources
    if (getValueFromXMLTag(xml_response, 'status') == 'success') {
	var media_id = getValueFromXMLTag(xml_response, 'media_id');
	$("#" + media_id).parents('li').remove();
	--deleteMediasChecked;
	if (deleteMediasChecked == 0) {
	    pushReloadItem('listallmedia');
	    jsuccess('Media deleted');
	    ajaxScrollbarElement('.edit-areamedia-scroll');
	    enableButtons('.edit-area');
	}
    } else {
	--deleteMediasChecked;
	jerror(getValueFromXMLTag(xml_response, 'message'));
	$("a#" + getValueFromXMLTag(xml_response, 'media_id')).find(
		".loading-small").hide();
	enableButtons('.edit-area');
    }
}

function error_deletephoto() {
    jerror("error delete photo");
}

function popupGalleryVideoPlayer(media_video_url, thumbnail) {
    $("#popupgalleryplayer").html('');
    $("#popupgalleryplayer")
	    .html(
		    '<a id="popupplayerMemreasClose" onClick="disablePopup(\'popupgalleryplayer\')" class=\'popupClose\'>x</a>'
			    + '<video width="500" height="300" controls>'
			    + '<source src="'
			    + media_video_url
			    + '" type="video/mp4">'
			    + 'Your browser does not support the video tag.'
			    + '</video>');
    popup('popupgalleryplayer');
}