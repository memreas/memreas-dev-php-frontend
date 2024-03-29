/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
var eventdetail_object = new Object();
var eventdetail_id = '';
var eventdetail_user = '';
var event_owner_name = 'User Name';
var eventdetail_user_pic = '/memreas/img/profile-pic-2.jpg';
var eventdetail_media_id = '';
var eventdetail_owner_id = '';
var current_friendnw_selected = '';
var reportMediaFormOffensiveSelected = false;
$(function() {
	$("ul.scrollClass").mCustomScrollbar({
		scrollButtons : {
			enable : true
		}
	});
	$("#tab-content-memreas-detail div.hideCls").hide(); // Initially hide
	// all content
	$("#tabs-memreas-detail li:first").attr("id", "current"); // Activate
	// first tab
	$("#tab-content-memreas-detail div:first").fadeIn(); // Show first tab
	// content*/

	// height Adujust
	var mcommentHeight = $(window).height() - 205;
	// $('.memreas-detail-comments').attr('style', 'height: '+mcommentHeight+'px
	// !important');
	$('.memreas-detail-comments').attr('style', 'height: 400px !important');

	$('#tabs-memreas-detail a').click(function(e) {

		e.preventDefault();
		$("#tab-content-memreas-detail div.hideCls").hide(); // Hide all

		// content
		$("#tabs-memreas-detail li").attr("id", ""); // Reset id's
		$(this).parent().attr("id", "current"); // Activate this
		$('#' + $(this).attr('title')).fadeIn(); // Show content for current
		// tab
	});

	$("a[title=memreas-detail-tabDetails]").click(function() {
		BlueIMPGallery();
		updateMemreasMediaDetailsScript();
		// prevent this tab active if there is no media on this
		// event
		// var target_element = $(".memreas-detail-gallery");
		// if (target_element.hasClass('mCustomScrollbar'))
		// target_element = $(".memreas-detail-gallery .mCSB_container");
		// var checkEmpty = target_element.html();
		// if (checkEmpty.trim() == '') {
		// jerror('There is no media on this event. Please try adding some
		// first.');
		// $("a[title=memreas-detail-tabGallery]").click();
		// return false;
		// }

		// example how to integrate with a previewer
		ajaxScrollbarElement(".memreas-detail-comments");
		checkMemreasDetailCarousel();
	});

	// Memreas detail location tab click
	$("a[title=memreas-detail-tabLocation]").click(function() {
		if (eventdetail_media_id == '') {
			// jerror("Please choose a media from detail tab to view it's
			// location");
			// return false;
		}
		$("#memreas-detail-location").empty().removeAttr('style');
		ajaxRequest("viewmediadetails", [ {
			tag : 'event_id',
			value : ''
		}, {
			tag : 'media_id',
			value : eventdetail_media_id
		} ], function(response) {
			var lng = getValueFromXMLTag(response, 'longitude');
			var lat = getValueFromXMLTag(response, 'latitude');
			if (lng == '' || lat == '') {
				jerror('There is no location for this media');
				lat = 0;
				lng = 0;
				// return false;
			}
			gallery_initGoogleMap("memreas-detail-location", lat, lng);
			console.log('Response Memreas-->' + response);

		});
	});
});

function getMediaComment() {

	var jComment_element = $('.memreas-detail-comments');
	if (jComment_element.hasClass('mCustomScrollbar'))
		jComment_element = $('.memreas-detail-comments .mCSB_container');
	jComment_element.empty();
	jComment_element
			.html('<li class="clearfix event-owner">'
					+ '<figure class="pro-pics"><img src="'
					+ eventdetail_user_pic
					+ '" alt=""></figure>'
					+ '<div class="pro-names">'
					+ event_owner_name
					+ '</div>'
					+ '<p class="loading" style="clear: both;"><img src="/memreas/img/loading-line.gif" class="loading-small" /></p>'
					+ '</li>');

	// Show event comments
	ajaxRequest(
			'listcomments',
			[ {
				tag : 'event_id',
				value : eventdetail_id
			}, {
				tag : 'media_id',
				value : event_media_ID_variable
			}, {
				tag : 'limit',
				value : '100'
			}, {
				tag : 'page',
				value : '1'
			} ],
			function(ret_xml) {
				var jComment_element = $('.memreas-detail-comments');
				if (jComment_element.hasClass('mCustomScrollbar'))
					jComment_element = $('.memreas-detail-comments .mCSB_container');

				var jComment_popup = $(".commentpopup");
				if (jComment_popup.hasClass('mCustomScrollbar'))
					jComment_popup = $(".commentpopup .mCSB_container");
				jComment_popup.empty();
				jComment_popup
						.append('<li><p class="loading" style="clear: both;"><img src="/memreas/img/loading-line.gif" class="loading-small" /></p></li>');

				var event_comments = getSubXMLFromTag(ret_xml, 'comment');
				var comment_count = event_comments.length;
				$(".memreas-detail-commentcount span").html(comment_count);
				if (comment_count > 0) {
					for (var i = 0; i < comment_count; i++) {
						var event_comment = event_comments[i];
						var comment_owner_pic = getValueFromXMLTag(
								event_comment, 'profile_pic');
						comment_owner_pic = removeCdataCorrectLink(comment_owner_pic);
						if (comment_owner_pic == '')
							comment_owner_pic = '/memreas/img/profile-pic.jpg';
						var comment_text = getValueFromXMLTag(event_comment,
								'comment_text');
						var comment_type = getValueFromXMLTag(event_comment,
								'type');
						var html_str = '<li>'
								+ '<figure class="pro-pics"><img src="'
								+ comment_owner_pic + '" alt=""></figure>';

						// Comment is text or audio
						if (comment_type == 'text')
							html_str += '<textarea readonly="readonly">'
									+ comment_text + '</textarea>';
						else {
							var audio_media_url = getValueFromXMLTag(
									event_comment, 'audio_media_url');
							audio_media_url = removeCdataCorrectLink(audio_media_url);
							html_str += '<audio controls class="memreas-detail-audio">'
									+ '<source src="'
									+ audio_media_url
									+ '" type="audio/wav" />'
									+ 'Your browser does not support the audio element'
									+ '</audio>';
						}
						html_str += '</li>';

						var html_popup_str = '<li>'
								+ '<div class="event_pro"><img src="'
								+ comment_owner_pic + '"></div>';

						// Comment is text or audio
						if (comment_type == 'text')
							html_popup_str += '<textarea name="memreas_popup_comment" cols="" rows="" readonly="readonly">'
									+ comment_text + '</textarea>';
						else {
							var audio_media_url = getValueFromXMLTag(
									event_comment, 'audio_media_url');
							audio_media_url = removeCdataCorrectLink(audio_media_url);
							html_popup_str += '<audio controls class="memreas-popup-detail-audio">'
									+ '<source src="'
									+ audio_media_url
									+ '" type="audio/wav" />'
									+ 'Your browser does not support the audio element'
									+ '</audio>';
						}
						html_popup_str += '</li>';

						jComment_element.append(html_str);
						jComment_popup.append(html_popup_str);
					}
					jComment_element.find('.loading').remove();
					jComment_popup.find('.loading').remove();
					ajaxScrollbarElement('.memreas-detail-comments');
				} else {
					jComment_element
							.append('<li style="color: #FFF;" class="no-comment">No comment yet!</li>');
					jComment_popup
							.append('<li style="color: #FFF;" class="no-comment">No comment yet!</li>');
					jComment_element.find('.loading').remove();
					jComment_popup.find('.loading').remove();
				}
			}, 'undefined', true);
}

function updateMemreasMediaDetailsScript() {
	if (!$("#carousel").parent(".elastislide-carousel").length > 0) {

		$preview = $('#preview');
		$carouselEl = $('#carousel');
		$carouselItems = $carouselEl.children();
		$("#carousel > li").click(function() {
			if ($(this).attr('class') == 'videoArea') {
				$('image-preview').hide();
				$preview.hide();
				$('.video-preview').show();
				var rel1 = $(this).attr('data-preview');
				var rel2 = $(this).attr('data-source');
				$('.video-preview >video').first().attr('poster', rel1);
				$('.video-preview > video >source').attr('src', rel2);
				// eventdetail_media_id = el.attr("media-id");
			} else {
				$('.video-preview').hide();
				$('image-preview').show();
				$preview.show();
				var dtpr = $(this).attr('data-preview')
				$preview.attr('src', dtpr);
				// $preview.attr('data-preview', el.data('preview'));
				$carouselItems.removeClass('current-img');
				// eventdetail_media_id = el.attr("media-id");
				el.addClass('current-img');
				carousel.setCurrent(pos);
				evt.preventDefault();
				$(".image-preview .swipebox").swipebox();
			}
			var download_url = $(this).attr('data-source');
			;
			download_url = "/index/downloadMedia?file=" + download_url;
			$(".memreas-detail-download").attr("href", download_url);
			updateMediaLike();
			getMediaComment();
		});

		var current = 0;
		$preview = $('#preview');
		$carouselEl = $('#carousel');
		$carouselItems = $carouselEl.children();
		carousel = $carouselEl.elastislide({
			current : current,
			minItems : 1,
			onReady : function() {

				el = $carouselItems.eq(current);
				eventdetail_media_id = el.attr("media-id");
				pos = current;
				$preview.attr('src', el.data('preview'))
				$preview.attr('data-preview', el.data('preview'));
				$carouselItems.removeClass('current-img');
				el.addClass('current-img');
				// $(".image-preview .swipebox").swipebox();

				// Set download button
				var download_url = el.data('preview');
				download_url = "/index/downloadMedia?file=" + download_url;
				$(".memreas-detail-download").attr("href", download_url);
				// $(".memreas-detail-download").swipebox();

				updateMediaLike();
				getMediaComment();
			}
		});
	}
}

/*
 * @ Memreas detail page
 */

// Return to main memreas
$(function() {
	$("a.memreas").click(function() {
		$(".memreas-detail").hide();
		$(".memreas-main").fadeIn(500);
	});
});
var objArrMemreasGallery = new Array();
var objArrMemreasDetail = new Array();
var objDetail = new Array();
var mediaIDArray = new Array();
var media_download_url = '';
var detailGallery = null;
var gallery = null;

var Item_media_Id = '';
var DetailImage = '';

function showEventDetail(eventId, userId) {
	eventdetail_id = eventId;
	eventdetail_user = userId;

	$("#add_buttons").show();
	ajaxRequest('geteventdetails', [ {
		tag : 'event_id',
		value : eventId
	} ], function(response) {
		console.log('geteventdetails response-->' + response);
		eventdetail_object.id = getValueFromXMLTag(response, 'event_id');
		eventdetail_object.event_owner = getValueFromXMLTag(response,
				'event_owner');
		eventdetail_object.name = getValueFromXMLTag(response, 'name');
		eventdetail_object.location = getValueFromXMLTag(response, 'location');
		eventdetail_object.date = getValueFromXMLTag(response, 'date');
		eventdetail_object.friends_can_post = getValueFromXMLTag(response,
				'friends_can_post');
		eventdetail_object.friends_can_share = getValueFromXMLTag(response,
				'friends_can_share');
		eventdetail_object.publik = getValueFromXMLTag(response, 'public');
		eventdetail_owner_id = getValueFromXMLTag(response, 'event_owner');

		//
		// remove add buttons for public events if not owner
		//
		if ((eventdetail_object.publik == 1)
				&& (eventdetail_object.event_owner != LOGGED_USER_ID)) {
			$("#add_buttons").hide();
		}

		var event_metadata = getValueFromXMLTag(response, 'event_metadata');
		var sell_price = 0;
		event_metadata = JSON.parse(event_metadata);
		if (typeof (event_metadata.price) != 'undefined') {
			if (event_metadata.price != 0)
				sell_price = event_metadata.price;
		}

		if (sell_price > 0) {
			$(".memreas-detail-commentcount, .memreas-detail-download").hide();
		}
	}, 'undefined', true);

	// Show gallery details
	var target_element = $(".memreas-detail-gallery");
	if (target_element.hasClass('mCustomScrollbar'))
		target_element = $(".memreas-detail-gallery .mCSB_container");
	target_element.empty();

	$("#tabs-memreas-detail li:eq(0) a").click();

	/* Update details_tab also */
	$(".carousel-memrease-area").empty();
	$(".carousel-memrease-area").append(
			'<ul id="carousel" class="elastislide-list"></ul>');
	var jcarousel_element = $("ul#carousel");
	jcarousel_element.empty();

	console.log('ListALL MEDIA eventId sent -->' + eventId);
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
					if (typeof (eventId != 'undefined')) {
						event_owner_name = getValueFromXMLTag(response,
								'username');
						eventdetail_user_pic = getValueFromXMLTag(response,
								'profile_pic');
						if (eventdetail_user_pic != '') {
							eventdetail_user_pic = removeCdataCorrectLink(eventdetail_user_pic);
						} else {
							eventdetail_user_pic = '/memreas/img/profile-pic.jpg';
						}

						$(".memreas-detail-comments .event-owner .pro-pics img")
								.attr(
										'src',
										$("header").find("#profile_picture")
												.attr('src'));
						$(".memreas-detail-comments .pro-names").html(
								event_owner_name);

						var medias = getSubXMLFromTag(response, 'media');
						var media_count = medias.length;
						var linksContainerMemreasGallery = $('#linksMemreasGallery');
						var linksContainerDataMemreasGallery = '';
						$('#linksMemreasGallery').empty();

						//
						// Reset the arrays
						//
						objArrMemreasGallery = new Array();
						objArrMemreasDetail = new Array();
						objDetail = new Array();
						mediaIDArray = new Array();

						for (var i = 0; i < media_count; i++) {
							var media = medias[i];
							var mediaId = getValueFromXMLTag(media, 'media_id');
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
							var media_thumb = "";

							if (_media_type == 'image') {
								_media_url = getMediaUrl(media, _media_type);
								content_type = 'image/jpeg';
								main_media_url = getValueFromXMLTag(media,
										'main_media_url');
								_media_thumbnail_large = main_media_url = removeCdataCorrectLink(main_media_url);
								media_thumb = getValueFromXMLTag(media,
										'media_url_448x306');
								media_thumb = removeCdataCorrectLink(media_thumb);
								media_download_url = _media_thumbnail_large;

								target_element
										.append('<li  media-id="'
												+ mediaId
												+ '"><a href="'
												+ main_media_url
												+ '" class="swipebox" title="photo-2"><img src="'
												+ _media_url
												+ '" alt=""></a></li>');

							} else if (_media_type == 'video') {
								// hls
								_media_url_hls = getValueFromXMLTag(media,
										'media_url_hls');
								_media_url_hls = removeCdataCorrectLink(_media_url_hls);
								// web
								_media_url_web = getValueFromXMLTag(media,
										'media_url_web');
								_media_url_web = removeCdataCorrectLink(_media_url_web);
								// webm
								_media_url_webm = getValueFromXMLTag(media,
										'media_url_webm');
								_media_url_webm = removeCdataCorrectLink(_media_url_webm);
								// thumbnails
								_media_thumbnail_large = getValueFromXMLTag(
										media, 'media_url_448x306');
								_media_thumbnail_large = JSON
										.parse(removeCdata(_media_thumbnail_large));
								_media_thumbnail_large = _media_thumbnail_large[0];

								_media_thumbnail = getValueFromXMLTag(media,
										'media_url_98x78');
								_media_thumbnail = JSON
										.parse(removeCdata(_media_thumbnail));
								_media_thumbnail = _media_thumbnail[0];

								media_download_url = _media_url_web;

								target_element
										.append('<li class="video-media" id="memreasvideo-'
												+ mediaId
												+ '" media-url="'
												+ main_media_url
												+ '"><a href=\'javascript:popupVideoPlayer("memreasvideo-'
												+ mediaId
												+ '");\' id="button"><img src="'
												+ _media_thumbnail
												+ '" alt=""><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a></li>');
							}
							var item = new Object();
							var Item_media_Id = new Object();
							var DetailImage = new Object();

							if (_media_type == 'video') {

								Item_media_Id['M_id'] = mediaId;
								Item_media_Id['M_url'] = _media_url_web;
								Item_media_Id['M_eventId'] = eventId;

								item['title'] = mediaId;
								item['type'] = "video/*";
								item['poster'] = _media_thumbnail_large;
								item['description'] = media_download_url;
								item['sources'] = [ {
									href : _media_url_hls,
									type : "application/x-mpegurl"
								}, {
									href : _media_url_webm,
									type : "video/webm"
								}, {
									href : _media_url_web,
									type : "video/mp4"
								} ];

								DetailImage['title'] = eventId + "_" + mediaId;
								DetailImage['type'] = "video/*";
								DetailImage['poster'] = _media_thumbnail_large;
								DetailImage['description'] = media_download_url;
								DetailImage['sources'] = [ {
									href : _media_url_hls,
									type : "application/x-mpegurl"
								}, {
									href : _media_url_webm,
									type : "video/webm"
								}, {
									href : _media_url_web,
									type : "video/mp4"
								} ];

								linksContainerDataMemreasGallery += '<a href="'
										+ _media_url_web + '"';
								linksContainerDataMemreasGallery += ' title="'
										+ mediaId + '"';
								linksContainerDataMemreasGallery += ' type="video/mp4" data-gallery="'
										+ mediaId
										+ '" class="blueimp-gallery-thumb-anchor "';
								linksContainerDataMemreasGallery += ' style="background:url('
										+ _media_thumbnail_large
										+ ')"><span class="video-content-play-icon"  style="position: relative;z-index:999; left:24px;"></span><img src="'
										+ _media_thumbnail_large
										+ '" alt="" style="margin-left:-99px;" /></a>';

								$('#carousellocationMemreasDetail')
										.append(
												'<li data-preview="'
														+ _media_thumbnail_large
														+ '" class="DocumentItem"><a href="javascript:;">'
														+ '<img src="'
														+ _media_thumbnail_large
														+ '" class="img-gallery imagescls" id="location'
														+ mediaId
														+ '" alt="image04" /></a></li>');

							} else {
								Item_media_Id['M_id'] = mediaId;
								Item_media_Id['M_url'] = _media_thumbnail_large;
								Item_media_Id['M_eventId'] = eventId;

								item['title'] = mediaId;
								item['type'] = "image/jpeg";
								item['href'] = main_media_url;
								item['poster'] = media_download_url;
								item['description'] = eventId + "_" + mediaId;

								DetailImage['title'] = eventId + "_" + mediaId;
								DetailImage['type'] = "image/jpeg";
								DetailImage['href'] = main_media_url;
								DetailImage['poster'] = media_download_url;
								DetailImage['description'] = eventId + "_"
										+ mediaId;

								linksContainerDataMemreasGallery += '<a href="'
										+ main_media_url
										+ '" title="'
										+ mediaId
										+ '" data-gallery="'
										+ mediaId
										+ '" class="blueimp-gallery-thumb-anchor"';
								linksContainerDataMemreasGallery += ' style="background:url('
										+ media_thumb
										+ ')"><img src="'
										+ media_thumb + '" alt="" /></a>';

								$('#carousellocationMemreasDetail')
										.append(
												'<li data-preview="'
														+ _media_thumbnail_large
														+ '"  class="DocumentItem"><a href="javascript:;">'
														+ '<img src="'
														+ _media_thumbnail_large
														+ '" class="img-gallery" id="location'
														+ mediaId
														+ '" alt="image04" /></a></li>');

							}
							objArrMemreasGallery.push(item);
							objDetail.push(DetailImage);
							mediaIDArray.push(Item_media_Id);
						} // end for loop
						// console.log('*******************************');
						// console.log('objArrMemreasGallery---> '
						// + JSON.stringify(objArrMemreasGallery));
						// console.log('*******************************');

						// $('#blueimp-video-carousel-gallery-memreas').find('slides').empty();
						//
						// Gallery and Detail Details tab
						//
						blueimp
								.Gallery(
										objDetail,
										{
											container : '#blueimp-video-carousel-gallery-detail',
											carousel : 'true',
											preloadRange : 2,
											transitionSpeed : 400
										});

						$(linksContainerMemreasGallery).append(
								linksContainerDataMemreasGallery);
						$('#blueimp-video-carousel-gallery-memreas').hide();
					}
				} else
					jerror(getValueFromXMLTag(response, 'message'));
				$(".memreas-addfriend-btn").attr('href',
						"javascript:addFriendToEvent('" + eventId + "');");
				$(".memreas-detail-gallery .swipebox").swipebox();
				ajaxScrollbarElement('.memreas-detail-gallery');

			});
	$("#popupAddMedia a.accept-btn").attr("onclick",
			"addMemreasPopupGallery('" + eventId + "')");

	$(".memreas-main").hide();
	$(".memreas-detail").fadeIn(500);
}

$(document).on('click', '[data-gallery]', function(event) {
	var selected_media_id = $(this).data('gallery');
	var obj;
	for (i = 0; i < objArrMemreasGallery.length; i++) {
		obj = objArrMemreasGallery[i];
		if (selected_media_id == obj['title']) {
			break;
		}
	}
	//console.log('[data-gallery] obj stringify--->' + JSON.stringify(obj));
	// Deep Copy due to blueimp internal error
	var newObject = jQuery.extend(true, {}, obj);
	return blueimp.Gallery([ newObject ], {
		container : '#blueimp-video-carousel-gallery-memreas',
		carousel : true
	});
});

function popupVideoPlayer(video_id) {
	var media_video_url = $("#" + video_id).attr('media-url');
	$("#popupplayerMemreas").html('');
	$("#popupplayerMemreas")
			.html(
					'<a id="popupplayerMemreasClose" onClick="disablePopup(\'popupplayerMemreas\')" class=\'popupClose\'>x</a>'
							+ '<div id="myElementMemreas">Loading the player...</div>'
							+ '<script type="text/javascript" src="/memreas/js/jwplayer/jwplayer.js"></script>'
							+ '<script type="text/javascript" src="/memreas/js/jwplayer/jwplayer.html5.js"></script>'
							+ '<script type="text/javascript" id="script-init">'
							+ 'jwplayer("myElementMemreas").setup({'
							+ 'file: "'
							+ media_video_url
							+ '",'
							+ 'image: "/memreas/img/large-pic-1.jpg"'
							+ '});'
							+ '</script>');
	popup('popupplayerMemreas');
}
function popupAddMemreasGallery() {
	console.log('INSIDE function popupAddMemreasGallery()');
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
				tag : 'limit',
				value : '200'
			}, {
				tag : 'page',
				value : '1'
			} ],
			function(response) {
				if (getValueFromXMLTag(response, 'status') == "Success") {
					var medias = getSubXMLFromTag(response, 'media');
					var count_media = medias.length;
					var jtarget_element = $('.popupAddMediaContent');

					if (jtarget_element.hasClass('mCustomScrollbar'))
						jtarget_element = $('.popupAddMediaContent .mCSB_container');
					jtarget_element.empty();

					for (var json_key = 0; json_key < count_media; json_key++) {
						var media = medias[json_key];
						var _media_type = getValueFromXMLTag(media, 'type');
						var _media_url = getMediaThumbnail(media,
								'/memreas/img/small-pic-3.jpg');
						var _media_id = getValueFromXMLTag(media, 'media_id');

						if (_media_type == 'video') {
							var _main_video_media = getValueFromXMLTag(media,
									'media_url_1080p');
							_main_video_media = removeCdataCorrectLink(_main_video_media);

							jtarget_element
									.append('<li id="'
											+ _media_id
											+ '-parent" class="video-media" media-url="'
											+ _main_video_media
											+ '"><a href="javascript:;" id="memreas-addgallery-'
											+ _media_id
											+ '" onclick="return imageChoosed(this.id);"><img src="'
											+ _media_url
											+ '" alt=""><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a></li>');
						} else
							jtarget_element
									.append('<li id="'
											+ _media_id
											+ '-parent"><a href="javascript:;" id="memreas-addgallery-'
											+ _media_id
											+ '" onclick="return imageChoosed(this.id);"><img src="'
											+ _media_url + '" alt=""></a></li>');
					}
				} else
					jerror("This is no media");
			});
	popup('popupAddMedia');
	ajaxScrollbarElement(".popupAddMediaContent");
}

function addMemreasPopupGallery(eventId) {
	var medias_selected = new Array();
	var user_id = $("input[name=user_id]").val();

	// If this is friend access to event
	if (user_id != eventdetail_user) {
		if (eventdetail_object.friends_can_post == "0") {
			jerror("This shared event unable to add more media from friend");
			return false;
		}
	}

	var i = 0;
	$(".popupAddMediaContent li.setchoosed").each(function() {
		medias_selected[++i] = $(this).find('a').attr('id');
	});
	var media_id_params = [];
	var increase = 0;
	for (var key = 1; key <= i; key++) {
		var media_id = medias_selected[key].replace('memreas-addgallery-', '');
		media_id_params[increase++] = {
			tag : 'media_id',
			value : media_id
		};
	}
	var params = [ {
		tag : 'event_id',
		value : eventId
	}, {
		tag : 'media_ids',
		value : media_id_params
	} ];

	ajaxRequest('addexistmediatoevent', params, function(xml_response) {
		if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
			$('#loadingpopup').show();
			disablePopup('popupAddMedia');
			setTimeout(function() {
				showEventDetail(eventId, $('input[name=user_id]').val());
				$('#loadingpopup').hide();
				jsuccess('Media added successfully');
			}, 2000);
		} else
			jerror(getValueFromXMLTag(xml_response, 'message'));
	});
}
function success_addmemreas_media() {
}

$(function() {
	$("#memreas-dropfriend").change(function() {
		popupMemreasAddfriends();
	});
});
function popupMemreasAddfriends() {

	if (eventdetail_user != user_id) {
		if (eventdetail_object.friends_can_share == "0") {
			jerror("This shared event unable to add more friend");
			return;
		}
	}
	$("#memreas-dropfriend").chosen({
		width : "95%"
	});
	var friend_list = $("#memreas-dropfriend").val();
	// Reset friend element
	friendList = null;
	switch (friend_list) {
	case 'mr':
		getPopupMemreasFriends();
		break;
	}
	if (!$("#popupFriends").is(":visible"))
		popup('popupFriends');
	ajaxScrollbarElement(".popupContact");
}

function getPopupMemreasFriends() {
	$('#loadingpopup').show();
	var params = [ {
		tag : 'user_id',
		value : user_id
	} ];
	ajaxRequest('listmemreasfriends', params, function(xml_response) {
		if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
			var friends = getSubXMLFromTag(xml_response, 'friend');
			var friendCount = friends.length;
			mr_friendsInfo = [];
			for (var i = 0; i < friendCount; i++) {
				var friend = friends[i];
				var friend_photo = '';
				if (getValueFromXMLTag(friend, 'photo') == ''
						|| getValueFromXMLTag(friend, 'photo') == 'null')
					friend_photo = '/memreas/img/profile-pic.jpg';
				else
					friend_photo = getValueFromXMLTag(friend, 'photo');
				friend_photo = removeCdataCorrectLink(friend_photo);
				mr_friendsInfo[i] = {
					'id' : getValueFromXMLTag(friend, 'friend_id'),
					'div_id' : 'mrmemreas_' + i,
					'name' : getValueFromXMLTag(friend, 'friend_name'),
					'photo' : friend_photo,
					'selected' : false
				};
			}
			memreas_fillFriends(mr_friendsInfo);
			current_friendnw_selected = 'mr';
		}
		// There is no friend
		else {
			jerror("You have no friend on this network.");
			$("#memreas-dropfriend option[value=mr]").attr('selected', true);
		}
	});
}

memreas_clickFriends = function(id) {
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

function memreas_fillFriends(info) {
	if (friendList == null)
		friendList = $('.popupContact .mCSB_container');

	friendList.empty();

	var i = 0, el;

	for (i = 0; i < info.length; i++) {
		el = '';
		el += '<li>';
		el += '<figure class="pro-pics2" id="'
				+ info[i].div_id
				+ '" onclick="javascript:memreas_clickFriends(this.id);"><img src="/memreas/img/profile-pic.jpg" alt="" '
				+ (info[i].selected ? 'class="setchoosed"' : '') + '></figure>';
		el += '<aside class="pro-pic_names2" name="' + info[i].name + '" id="'
				+ info[i].div_id
				+ '" onclick="javascript:memreas_clickFriends(this.id);">'
				+ info[i].name + '</aside>';
		el += '</li>';

		friendList.append(el);
	}

	var imgList = $('.popupContact .mCSB_container li img');

	for (i = 0; i < imgList.length; i++) {
		if (typeof (info[i]) != 'undefined')
			$(imgList[i]).prop('src', info[i].photo);
	}
	$('#popupContact').mCustomScrollbar('update');
}

/*
 * function memreas_TwFriends() { var friend_list = $.cookie('twitter_friends');
 * if (typeof (friend_list) == 'undefined') { $('#loadingpopup').hide(); //
 * jerror ('authentication failed! please try again');
 * $("#memreas-dropfriend").val(current_friendnw_selected); return false; }
 * friend_list = JSON.parse(friend_list); var friend_count = friend_list.length;
 * for (var i = 0; i < friend_count; i++) { var temp_id =
 * friend_list[i]['div_id']; temp_id = temp_id.split('_');
 * friend_list[i]['div_id'] = 'twmemreas_' + temp_id[1]; } tw_friendsInfo =
 * friend_list; memreas_fillFriends(friend_list); current_friendnw_selected =
 * 'tw'; $('#loadingpopup').hide(); }
 */

function addFriendToEvent(eventId) {
	var groupName = $('input[name=memreas_groupname]').val();
	var user_id = $("input[name=user_id]").val();
	var selFriends = [];
	var i = 0, count = 0;

	var emailList = splitByDelimeters(getElementValue('memreas_detail_emails'),
			[ ',', ';' ]);
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

	if ($("#memreas_makegroup_check").is(":checked")) {
		if (groupName != '' && groupName.toLowerCase() != 'group name here') {
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
				if (status.toLowerCase() == 'success')
					jsuccess('group was created successfully.');
				else
					jerror(message);
			});
		} else {
			jerror("Please enter group name");
			return;
		}
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
		value : eventId
	}, {
		tag : 'friends',
		value : selFriends
	} ], function(ret_xml) {
		// parse the returned xml.
		var status = getValueFromXMLTag(ret_xml, 'status');
		var message = getValueFromXMLTag(ret_xml, 'message');
		if (status.toLowerCase() == 'success') {
			jsuccess('your friends added successfully.');
			$(".popupContact li").each(function() {
				$(this).removeClass('setchoosed');
			});
			disablePopup("popupFriends");
		} else
			jerror(message);
	});
}

/* Additions fixing */

// Prevent clicking on carousel on detail tab if not enough media with full
// width
function checkMemreasDetailCarousel() {
	var jDetailMediaScroll = $(".carousel-memrease-area");
	var numberOfChild = jDetailMediaScroll.find("ul#carousel li").length;

	if (numberOfChild < 5) {
		$("body")
				.append(
						'<style type="text/css">.carousel-memrease-area navs{ display: none; }</style>');
	}

}

$('.elastislide-list > li >a').click(function() {
	return false;
});

// $("#tabs-memreas-detail li:first").click(function() {
// blueimp.Gallery(objArrMemreasGallery, {
// onslide : function() {
// },
// container : '#blueimp-video-carousel-gallery',
// carousel : 'true',
// preloadRange : 2,
// transitionSpeed : 400
// });
//
// });
var event_media_ID_variable = '';
var eventdetail_id = '';
function BlueIMPGallery() {
	$('#blueimp-video-carousel-gallery-detail').find('slides').empty();
	var jsonstrong2 = JSON.stringify(mediaIDArray);
	var DetailObj2 = JSON.parse(jsonstrong2);
	blueimp.Gallery(objDetail, {
		onslide : function() {
			// Getting Media ID Per SLider
			var index = this.getIndex();
			eventdetail_media_id = DetailObj2[index].M_id;
			event_media_ID_variable = DetailObj2[index].M_id;
			var down_load_media_URL = DetailObj2[index].M_url;
			var eventdetail_id = DetailObj2[index].M_eventId;

			// var download_url = $(this).attr('data-source');
			var media_download_url_final = "/index/downloadMedia?file="
					+ down_load_media_URL;
			$(".memreas-detail-download")
					.attr("href", media_download_url_final);
			// Getting Event ID Per SLider
			getMediaComment();
			updateMediaLike();
			$('#reportMediaform').attr('rel', event_media_ID_variable);
		},
		container : '#blueimp-video-carousel-gallery-detail',
		carousel : 'true',
		preloadRange : 2,
		transitionSpeed : 600,
		startSlideshow : false
	});

}

function memreasAddComment() {
	var current_user = $("input[name=user_id]").val();
	var comment_txt = $("input[name=comment_txtfield]").val();
	if (comment_txt == '' || comment_txt == 'your comment here') {
		jerror("Please fill your comment");
		return;
	}
	var params = [ {
		tag : "event_id",
		value : eventdetail_id
	}, {
		tag : "media_id",
		value : event_media_ID_variable
	}, {
		tag : "user_id",
		value : current_user
	}, {
		tag : "comments",
		value : comment_txt
	}, {
		tag : "audio_media_id",
		value : ""
	} ];
	addLoading('.popup-addcomment-text', 'input', '');
	disableButtons("#popupcomment");

	ajaxRequest('addcomments', params, function(ret_xml) {

		var jComment_popup = $(".commentpopup");
		if (jComment_popup.hasClass('mCustomScrollbar'))
			jComment_popup = $(".commentpopup .mCSB_container");

		var user_profile = $('#profile_picture').attr('src');
		jComment_popup.prepend('<li>' + '<div class="event_pro"><img src="'
				+ user_profile + '"></div>'
				+ '<textarea name="memreas_popup_comment" cols="" rows=""'
				+ ' readonly="readonly">' + comment_txt + '</textarea>'
				+ '</li>');
		$(".no-comment").remove();
		$(".commentpopup").mCustomScrollbar("update");
		$(".commentpopup").mCustomScrollbar("scrollTo", "top");

		// Add main comment area
		var jComment_element = $('.event-owner');

		jComment_element.after('<li>' + '<figure class="pro-pics"><img src="'
				+ user_profile + '" alt=""></figure>'
				+ '<textarea readonly="readonly">' + comment_txt
				+ '</textarea>' + '</li>');

		$(".memreas-detail-comments").mCustomScrollbar("update");
		$(".memreas-detail-comments").mCustomScrollbar("scrollTo", "top");

		$("input[name=comment_txtfield]").val('');
		removeLoading('.popup-addcomment-text');
		enableButtons("#popupcomment");
		jsuccess("your comment added");

		// Update event detail bar
		ajaxRequest('geteventcount', [ {
			tag : 'event_id',
			value : eventdetail_id
		} ], function(response) {
			var jTargetCommentCount = $(".memreas-detail-commentcount span");
			if (getValueFromXMLTag(response, 'status') == "Success") {
				var comment_count = getValueFromXMLTag(response,
						'comment_count');
			} else {
				var comment_count = 0;
			}
			jTargetCommentCount.html(comment_count);
		}, 'undefined', true);

	}, 'undefined', true);
}
function likeMemreasMedia() {
	var current_user = $("input[name=user_id]").val();
	ajaxRequest('likemedia', [ {
		tag : "event_id",
		value : eventdetail_id
	}, {
		tag : "media_id",
		value : event_media_ID_variable
	}, {
		tag : "user_id",
		value : current_user
	}, {
		tag : "is_like",
		value : "1"
	} ], function(ret_xml) {

		jsuccess(getValueFromXMLTag(ret_xml, 'message'));
		updateMediaLike();
	});
}
function showPopupComment() {
	$(".comment_txtfield").val('');
	popup('popupcomment');
	ajaxScrollbarElement('.commentpopup');
}

function updateMediaLike() {
	// Update media like total
	var params = [ {
		tag : 'media_id',
		value : event_media_ID_variable
	} ];
	ajaxRequest('getmedialike', params, function(xml_response) {
		$(".memreas-detail-likecount span").html(
				getValueFromXMLTag(xml_response, 'likes'));
	}, 'undefined', true);
}

function reportMedia(userConfirm) {

	popup("popupReportMedia");
	var relAttr = $('#reportMediaform').attr('rel');
	$('#mediaIdreport').val(relAttr);
}

$('#offensiveViolation').click(function() {
	$("#offensivereportform").show();
	$("#reportform").hide();
	reportMediaFormOffensiveSelected = true;
});

$('#DMCAViolation').click(function() {
	$("#offensivereportform").hide();
	$("#reportform").show();
	reportMediaFormOffensiveSelected = false;
});

$('#reportVolForm').click(function() {

	if (reportMediaFormOffensiveSelected) {
		submitOffensiveContent();
	} else {
		submitDMCA();
	}

});

$('#term_condition_label').click(function() {
	$('#term_condition').toggleClass('checked');
	if ($('#term_condition').hasClass('checked')) {
		$('#term_condition').val(1);
	} else {
		$('#term_condition').val('');
	}

});

function submitOffensiveContent() {

	var inappropriate = "1";
	var reason_types = "";
	var reason_type_start = "<reason_type>";
	var reason_type_end = "</reason_type>";

	if ($("#esc_content").is(':checked')) {
		reason_types += reason_type_start + $("#lbl_esc_content").text()
				+ reason_type_end;
	}
	if ($("#evc_content").is(':checked')) {
		reason_types += reason_type_start + $("#lbl_evc_content").text()
				+ reason_type_end;
	}
	if ($("#ehs_content").is(':checked')) {
		reason_types += reason_type_start + $("#lbl_ehs_content").text()
				+ reason_type_end;
	}
	if ($("#ioc_content").is(':checked')) {
		reason_types += reason_type_start + $("#lbl_ioc_content").text()
				+ reason_type_end;
	}

	if (reason_types != "") {

		var params = [ {
			tag : "event_id",
			value : eventdetail_id
		}, {
			tag : "reporting_user_id",
			value : LOGGED_USER_ID
		}, {
			tag : "media_id",
			value : event_media_ID_variable
		}, {
			tag : "inappropriate",
			value : inappropriate
		}, {
			tag : "reason_types",
			value : reason_types
		}, ];

		ajaxRequest('mediainappropriate', params, function(ret_xml) {

			var message = getValueFromXMLTag(ret_xml, 'message')
			var status = getValueFromXMLTag(ret_xml, 'status');

			console.log('message-->' + message + 'Status-->' + status);
			console.log(ret_xml);

			if (status.toLowerCase() == "success") {
				jsuccess("your report was received");
				disablePopup('popupReportMedia');
				$("#ocform_reason").val("");
			} else {
				jerror("an error occurred");
				disablePopup('popupReportMedia');
			}

		}, 'undefined', true);
	} else {
		jerror("Please review your entries");
	}

}

function submitDMCA() {
	// var current_user = $("input[name=user_id]").val();

	var copy_right_owner = $('#copyrightowner').val();
	var copyright_owner_address = $('#addressV').val();
	var copyright_owner_email_address = $('#emailvoilcation').val();
	var mediaId_report = $('#mediaId').val(event_media_ID_variable);
	var terms_condition = $('#term_condition').val();
	if (copy_right_owner == '') {
		jerror(getString("dmca_missing_name"));
		return;
	}
	if (copyright_owner_address == '') {
		jerror(getString("dmca_missing_address"));
		return;
	}

	if (copyright_owner_email_address == '') {
		jerror(getString("dmca_missing_email"));
		return;
	}

	if (mediaId_report == '') {
		jerror(getString("dmca_missing_media_id"));
		return;
	}

	if (terms_condition != '1') {
		jerror(getString("dmca_missing_terms"));
		return;
	}

	var legalvalue = '';
	var params = [ {
		tag : "media_id",
		value : event_media_ID_variable
	}, {
		tag : "copyright_owner_name",
		value : copy_right_owner
	}, {
		tag : "copyright_owner_address",
		value : copyright_owner_address
	}, {
		tag : "copyright_owner_email_address",
		value : copyright_owner_email_address
	}, {
		tag : "copyright_owner_agreed_to_terms",
		value : "1"
	}, ];

	ajaxRequest('dcmareportviolation', params, function(ret_xml) {

		var message = getValueFromXMLTag(ret_xml, 'message')
		var status = getValueFromXMLTag(ret_xml, 'status');

		console.log('message-->' + message + 'Status-->' + status);
		console.log(ret_xml);

		if (status.toLowerCase() == 'success') {
			jsuccess(getString("dmca_success"));
			disablePopup('popupReportMedia');

			//
			// reset values
			//
			$('#copyrightowner').val("");
			$('#addressV').val("");
			$('#emailvoilcation').val("");
			$('#term_condition').attr('checked', false);

		} else {
			jerror(getString("dmca_failure"));
			disablePopup('popupReportMedia');
		}

	}, 'undefined', true);

}
