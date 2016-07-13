/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */

/*
 * System functionally All common system functions will be managed here
 */
var AppSystem = function() {

    // Display page loading screen
    this.putPageLoading = function() {
	$('#loadingpopup').fadeIn(200);
    }

    // Remove page loading screen
    this.removePageLoading = function() {
	$('#loadingpopup').fadeOut(200);
    }

    // Put stripe processing loading state
    this.putStripeLoading = function() {
	$('.stripe-payment').fadeIn(1000);
    }

    // Remove stripe processing loading state
    this.removeStripeLoading = function() {
	$('.stripe-payment').fadeOut(1000);
    }

    // Put preload functions
    this.putPreloadApplicationItems = function() {
	this.getUserDetail();
    }

    /*
     * Get user detail
     * 
     * Fetch current logged user detail and fill into site section
     */
    this.getUserDetail = function() {
	var params = [ {
	    tag : 'user_id',
	    value : $("input[name=user_id]").val(),
	} ];

	// Fill in site account information
	ajaxRequest(
		'getuserdetails',
		params,
		function(xml_response) {
		    if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
			var useremail = getValueFromXMLTag(xml_response,
				'email');
			var username = getValueFromXMLTag(xml_response,
				'username');

			var userprofile = getValueFromXMLTag(xml_response,
				'profile');
			userprofile = removeCdataCorrectLink(userprofile);

			var alternate_email = getValueFromXMLTag(xml_response,
				'alternate_email');
			var gender = getValueFromXMLTag(xml_response, 'gender');
			var dob = getValueFromXMLTag(xml_response, 'dob');
			var username_length = username.length;

			if (username_length > 10) {
			    username = username.substring(0, 7) + '...';
			}

			$("header").find(".pro-name").html(username);
			$("#setting-username").html(
				getValueFromXMLTag(xml_response, 'username'));

			if (userprofile != '') {
			    $("header").find("#profile_picture").attr('src',
				    userprofile);
			    $("#setting-userprofile img").attr('src',
				    userprofile);
			}

			$("input[name=account_email]").val(useremail);
			$("input[name=account_alternate_email]").val(
				alternate_email);
			$("input[name=account_dob]").val(dob);

			if (gender == 'male') {
			    $("#gender-male").attr("checked", "checked");
			} else {
			    if (gender == 'female') {
				$("#gender-female").attr("checked", "checked");
			    }
			}

			var account_type = getValueFromXMLTag(xml_response,
				'account_type');
			$(".share-account-type").html(account_type);

			$("input[name=account_email]").val(useremail);

			//
			// Buyer / Seller section
			//
			var accounts = getSubXMLFromTag(xml_response, 'account');
			var account;
			var account_types;
			var seller_balance;
			var buyer_balance;
			for (var key = 0; key < accounts.length; key++) {
			    var account = accounts[key];
			    var account_type = getValueFromXMLTag(account,
				    'account_type');
			    var account_balance = getValueFromXMLTag(account,
				    'account_balance');
			    if (account_types != null) {
				account_types += ", " + account_type;
			    } else {
				account_types = account_type;
			    }
			    if (account_type == 'seller') {
				seller_balance = account_balance;
			    } else {
				buyer_balance = account_balance;
			    }
			}
			$(".morepage-account-type").text(account_types);
			$(".morepage-account-buyerbalance").text(
				"$" + buyer_balance);
			$(".morepage-account-sellerbalance").text(
				"$" + seller_balance);
			// remove seller section if they're not a seller
			if (seller_balance == null) {
			    $("#account-sellerbalance-div").remove();
			}
		    }
		}, 'undefined', true);

	// Checking for share page, account sale event
	var obj = new Object();
	obj.user_id = $("input[name=user_id]").val();
	obj.memreascookie = getCookie("memreascookie");
	obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
	var data_obj = JSON.stringify(obj, null, '\t');
	var data = '{"action": "getCustomerInfo", ' + '"memreascookie":"'
		+ getCookie("memreascookie") + '", ' + '"type":"jsonp", '
		+ '"json": ' + data_obj + '}';
	var stripeCustomerUrl = $("input[name=stripe_url]").val()
		+ 'stripe_getCustomerInfo';
	$
		.ajax({
		    url : stripeCustomerUrl,
		    type : 'POST',
		    dataType : 'jsonp',
		    data : 'json=' + data,
		    timeout : 30000,
		    success : function(response) {
			response = JSON.parse(response.data);
			if (response.status == 'Success') {
			    var account = response.buyer_account;
			    if (typeof account != 'undefined') {
				var subscription = account.subscription;
				if (typeof subscription != 'undefined') {
				    var plan_id = subscription.plan;
				    if (plan_id == 'PLAN_A_2GB_MONTHLY') {
					$(".sell-media-section").hide();
					// Disable some features if user has
					// free plan
					$("form[name=sell_media_frm]").find(
						"ul").hide();
					$(".sell_media_bank").hide();
					$("form[name=sell_media_frm]").next(
						".btn").remove();
					$(".sell_media_bank").next(".btn")
						.remove();
					$("form[name=sell_media_frm] ul")
						.before(
							"<label>Please upgrade your subscription plan to register as seller</label>");
					$(".sell_media_bank")
						.before(
							"<label>Please upgrade your subscription plan to register as seller</label>");
				    } else {
					$(".share-account-plan").html(
						subscription.plan_description);
				    }
				} else {
				    // Disable some features if user has free
				    // plan
				    $("form[name=sell_media_frm]").find("ul")
					    .hide();
				    $(".sell_media_bank").hide();
				    $("form[name=sell_media_frm]").next(".btn")
					    .remove();
				    $(".sell_media_bank").next(".btn").remove();
				    $("form[name=sell_media_frm] ul")
					    .before(
						    "<label>Please upgrade your subscription plan to register as seller</label>");
				    $(".sell_media_bank")
					    .before(
						    "<label>Please upgrade your subscription plan to register as seller</label>");
				}
			    } else {
				$("form[name=sell_media_frm]").find("ul")
					.hide();
				$(".sell_media_bank").hide();
				$("form[name=sell_media_frm]").next(".btn")
					.remove();
				$(".sell_media_bank").next(".btn").remove();
				$("form[name=sell_media_frm] ul")
					.before(
						"<label>Please upgrade your subscription plan to register as seller</label>");
				$(".sell_media_bank")
					.before(
						"<label>Please upgrade your subscription plan to register as seller</label>");
			    }
			} else {
			    $("form[name=sell_media_frm]").find("ul").hide();
			    $(".sell_media_bank").hide();
			    $("form[name=sell_media_frm]").next(".btn")
				    .remove();
			    $(".sell_media_bank").next(".btn").remove();
			    $("form[name=sell_media_frm] ul")
				    .before(
					    "<label>Please upgrade your subscription plan to register as seller</label>");
			    $(".sell_media_bank")
				    .before(
					    "<label>Please upgrade your subscription plan to register as seller</label>");
			}
		    },
		    error : function(response, textStatus, errorThrown) {
			if (textStatus === 'timeout') {
			    jerror('request timeout - please try again later');
			    $('#loadingpopup').hide();
			}
		    }
		});
    }
}
var AppSystem = new AppSystem();
AppSystem.putPreloadApplicationItems();

/*
 * Handle system log
 */
var ConsoleLog = function() {
    this.enableSystemLog = true; // Set this to false to remove log all
    // places

    // Set log into window console panel
    this.setLog = function(variable) {
	if (self.enableSystemLog) {
	    console.log("self.enableSystemLog variable ==>" + variable);
	}
    }
}
var ConsoleLog = new ConsoleLog();

(function($) {
    $(window).load(
	    function() {
		$("#tab-content-memreas div.hideCls").hide(); // Initially
		// hide all
		// content
		$("#tabs-memreas li:first").attr("id", "current"); // Activate
		// first tab
		$("#tab-content-memreas div:first").fadeIn(); // Show first
		// tab content*/

		$('#tabs-memreas a')
			.click(
				function(e) {

				    e.preventDefault();
				    // Hide all content
				    $("#tab-content-memreas div.hideCls")
					    .hide();
				    // Reset id's
				    $("#tabs-memreas li").attr("id", "");
				    // Activate this
				    $(this).parent().attr("id", "current");
				    $('#' + $(this).attr('title')).fadeIn();
				    // Show content for current tab
				    $('#' + $(this).attr('title')).fadeIn();
				    if (!($('#' + $(this).attr('title')
					    + " .scroll-area")
					    .hasClass('mCustomScrollbar'))) {
					$(
						'#' + $(this).attr('title')
							+ " .scroll-area")
						.mCustomScrollbar({
						    scrollButtons : {
							enable : true
						    }
						});
				    }
				    $(
					    '#' + $(this).attr('title')
						    + " .scroll-area")
					    .mCustomScrollbar("update");
				});

	    });
})(jQuery);

$(function() {
    $("a.memreas").click(function() {
	ajaxScrollbarElement('.myMemreas');
	if (checkReloadItem('view_my_events')) {
	 fetchMyMemreas();
	}
    });
    $("#tabs-memreas li:eq(1) a").click(function() {
	if (checkReloadItem('view_friend_events')) {
	 fetchFriendsMemreas('private');
	}
    });
    $("#tabs-memreas li:eq(2) a").click(function() {
	if (checkReloadItem('view_public_events')) {
	 fetchpubsMemreas();
	}
    });
});
function fetchMyMemreas() {
    ajaxScrollbarElement('.myMemreas');
    var user_id = $("input[name=user_id]").val();
    if ($(".myMemreas").hasClass("mCustomScrollbar"))
	var jTarget_object = $(".myMemreas .mCSB_container");
    else
	var jTarget_object = $(".myMemreas");
    jTarget_object.empty();

    $('#loadingpopup').fadeIn(200);
    ajaxRequest(
	    'viewevents',
	    [ {
		tag : 'user_id',
		value : user_id
	    }, {
		tag : 'is_my_event',
		value : '1'
	    }, {
		tag : 'is_friend_event',
		value : '0'
	    }, {
		tag : 'is_public_event',
		value : '0'
	    }, {
		tag : 'page',
		value : '1'
	    }, {
		tag : 'limit',
		value : '20'
	    } ],
	    function(response) {
		$('#loadingpopup').fadeOut(200);
		if (getValueFromXMLTag(response, 'status') == "Success") {
		    // console.log("response " + response);
		    //alert("memreas me response " + response);
		    var events = getSubXMLFromTag(response, 'event');

		    var event_count = events.length;
		    var scrollbarwidth = $('#memreas').width();
		    scrollbarwidth = scrollbarwidth - 40;
		    for (var i = 0; i < event_count; i++) {
			var event_media = getSubXMLFromTag(events[i],
				'event_media');
			var event_media_count = event_media.length;
			var event = events[i].innerHTML;

			var StrMedia = '<div class="documentscls"><ul class="event-pics event-listing-memreas" style="width:'
				+ scrollbarwidth + 'px;">';
			var eventId = $(event).filter('event_id').html();
			for (var j = 0; j < event_media_count; j++) {
			    var event_medi = event_media[j];
			    var event_media_image = getValueFromXMLTag(
				    event_medi, 'event_media_448x306');
			    var _event_media_type_ = getValueFromXMLTag(
				    event_medi, 'event_media_type');
			    if (_event_media_type_ == 'image') {
				StrMedia += '<li class="image " style="float:none; display:inline-block;"><a href="javascript:;" onclick="showEventDetail(\''
					+ eventId
					+ '\', \''
					+ user_id
					+ '\');" style="cursor: pointer;"><img src="'
					+ removeCdataCorrectLink(event_media_image)
					+ '"  style=""/></a></li>';
			    } else if (_event_media_type_ == 'video') {
				StrMedia += '<li class="video" style="float:none; display:inline-block;"><a href="javascript:;" onclick="showEventDetail(\''
					+ eventId
					+ '\', \''
					+ user_id
					+ '\');" style="cursor: pointer;"><img src="'
					+ removeCdataCorrectLink(event_media_image)
					+ '"  style=""/></a><span class="video-content-play-icon-2"></span></li>';
			    }
			}
			StrMedia += '</ul></div><div style="clear:both;"></div>';
			var like_count = $(event).filter('like_count').html();
			var comment_count = $(event).filter('comment_count')
				.html();
			var event_name = $(event).filter('event_name').html();
			var element = '<div class="event_section ">'
				+ '<aside class="event_name" onclick="showEventDetail(\''
				+ eventId
				+ '\', \''
				+ user_id
				+ '\');" style="cursor: pointer;">!'
				+ event_name
				+ '</aside>'
				+ '<div class="event_like"><span>'
				+ like_count
				+ '</span></div>'
				+ '<div class="event_comment"><span>'
				+ comment_count
				+ '</span></div>'
				+ '<div id="event-people-'
				+ eventId
				+ '"><img src="/memreas/img/loading-line.gif" class="loading-small" />'
				+ '</div>'
				+ '<div class="clear"></div>'
				+ '<div id="viewport" onselectstart="return false;">'
				+ '<div id="myEvent-'
				+ eventId
				+ '" class="swipeclass">'
				+ StrMedia
				+ '</div>'
				+ '</div>'
				+ '<div id="viewport" onselectstart="return false;">'
				+ '<div class="swipeclass" id="swipebox-comment-'
				+ eventId
				+ '">'
				+ '</div>'
				+ '</div>'
				+ '</div>';
			// element +=StrMedia;
			jTarget_object.append(element);

		    }
		} else
		    jerror('no memreas found - use the share tab to create');
	    });
    $(".myMemreas").mCustomScrollbar('update');
}
function popupDetailMedia(eventdetail_media_id, html_str, comment_count) {
    var pophtml = '<div id="pop-' + eventdetail_media_id
	    + '" class="modal fade in" style="display: none;">';
    pophtml += '<div class="modal-dialog">';
    pophtml += '<div class="modal-content">';
    pophtml += '<form class="form-horizontal" role="form">';
    pophtml += '<div class="modal-header">';
    pophtml += '<button class="close" data-dismiss="modal" type="button"><span aria-hidden="true">×</span></button>';
    pophtml += '<h4 id="myModalLabel" class="modal-title">Have '
	    + comment_count + ' comments</h4>';
    pophtml += '</div>';
    pophtml += '<div class="modal-body">';
    pophtml += '<div class="row-fluid">';
    pophtml += '<div class="form-group">';
    pophtml += html_str;
    pophtml += '</div>';
    pophtml += '</div>';
    pophtml += '</div>';

    pophtml += '</div>';
    $("body").append(pophtml);
    $(".modal-backdrop").html('');
    $("#pop-" + eventdetail_media_id).fadeIn();

    $(".close").click(function() {
	closeModals(eventdetail_media_id);
    });
}
function fetchFriendsMemreas(friendMemreasType) {

    var params = new Object;
    params.user_id = Account.id;
    params.memreascookie = getCookie("memreascookie");
    params.x_memreas_chameleon = getCookie("x_memreas_chameleon");
    var params_json = JSON.stringify(params, null, '\t');
    var data = '{"action": "check_own_event", ' + '"type":"jsonp", '

    + '"json": ' + params_json + '}';

    $('#loadingpopup').fadeIn(200);
    var stripeActionUrl = $("input[name=stripe_url]").val()
	    + 'stripe_checkOwnEvent';
    $
	    .ajax({
		url : stripeActionUrl,
		type : 'POST',
		dataType : 'jsonp',
		data : 'json=' + data,
		success : function(response) {
		    $('#loadingpopup').fadeOut(200);
		    response = JSON.parse(response.data);
		    if (response.status == 'Success') {
			Account.eventPurchases = response.events;
		    }

		    var user_id = $("input[name=user_id]").val();
		    if (friendMemreasType == 'private') {
			var showPublic = '0';
			var showAccepted = '1';
			var sell_class = 'private-';
		    } else {
			var showPublic = '1';
			var showAccepted = '0';
			var sell_class = 'public-';
		    }
		    ajaxRequest(
			    'viewevents',
			    [ {
				tag : 'user_id',
				value : user_id
			    }, {
				tag : 'is_my_event',
				value : '0'
			    }, {
				tag : 'is_friend_event',
				value : showAccepted
			    }, {
				tag : 'is_public_event',
				value : showPublic
			    }, {
				tag : 'page',
				value : '1'
			    }, {
				tag : 'limit',
				value : '20'
			    } ],
			    function(response) {
				if (friendMemreasType == 'private') {
				    var target_object = ".event_images";
				    ajaxScrollbarElement('.event_images');
				    $(".event_images").empty();
				} else {
				    var target_object = ".event_images_public";
				    ajaxScrollbarElement('.event_images_public');
				    $(".event_images_public").empty();
				}
				// var friendsId = new Array();
				var friends = getSubXMLFromTag(response,
					'friend');
				if (getValueFromXMLTag(response, 'status') == "Success") {
				    if (friends.length > 0) {
					/**
					 * Fetch Friends array
					 */
					friends = getSubXMLFromTag(response,
						'friend');
					var friend_count = friends.length;
					for (var i = 0; i < friend_count; i++) {
					    var friend = friends[i].innerHTML;
					    var creator_id = $(friend).filter(
						    'event_creator_user_id')
						    .html();
					    if (friendMemreasType == 'private') {
						var friend_row = 'friendPrivate-'
							+ creator_id;
					    } else
						var friend_row = 'friendPublic-'
							+ creator_id;
					    if (typeof ($(friend)
						    .filter('profile_pic_79x80')) != 'undefined') {
						var profile_img = $(friend)
							.filter(
								'profile_pic_79x80')
							.html();
						profile_img = removeCdataCorrectLink(profile_img);
					    } else
						profile_img = '/memreas/img/profile-pic.jpg';
					    if (profile_img == '')
						profile_img = '/memreas/img/profile-pic.jpg';
					    var event_creator = $(friend)
						    .filter('event_creator')
						    .html();
					    $(target_object)
						    .append(
							    '<div class="event_section"><section class="row-fluid clearfix">'
								    + '<figure class="pro-pics2"><img class="public-profile-img" src="'
								    + profile_img
								    + '" alt=""></figure>'
								    + '<aside class="pro-names2">@'
								    + event_creator
								    + '</aside>'
								    + '</section><div id="viewport" class="mouse_swip" onselectstart="return false;">'
								    + '<div id="'
								    + friend_row
								    + '" class="swipeclass scrollbarhorizontal"></div></div></div>');

					    var global_width = $(
						    "#tab-content-memreas")
						    .width();
					    var base_event_row_width = 120;

					    /**
					     * Fetch events by friend
					     */
					    var events_resources = $(friend)
						    .filter('events').html();
					    var event_resources = $(
						    events_resources).filter(
						    'event');
					    var event_resources_count = event_resources.length;
					    var total_event_row_width = 120 * event_resources_count;

					    console
						    .log('event_resources_count-->'
							    + event_resources_count);

					    if (event_resources_count > 0) {
						for (var key = 0; key < event_resources_count; key++) {
						    var event_resource = event_resources[key].innerHTML;
						    console
							    .log('event_resource-->'
								    + event_resource);
						    var eventId = $(
							    event_resource)
							    .filter('event_id')
							    .html();
						    var eventName = $(
							    event_resource)
							    .filter(
								    'event_name')
							    .html();
						    // fetch event media
						    var event_media_resource = $(
							    event_resource)
							    .filter(
								    'event_media')
							    .html();
						    var event_media_98x78 = $(
							    event_media_resource)
							    .filter(
								    'event_media_98x78')
							    .html();
						    if (event_media_98x78 == null) {
							event_media_98x78 = '/memreas/img/small/1.jpg';
						    } else {
							event_media_98x78 = removeCdataCorrectLink(event_media_98x78);
						    }
						    var event_name = $(
							    event_resource)
							    .filter(
								    'event_name')
							    .html();
						    var event_metadata = $(
							    event_resource)
							    .filter(
								    'event_metadata')
							    .html();
						    // Check if event is selling
						    // or not
						    var sell_price = '';
						    if (event_metadata != ''
							    && typeof (event_metadata) != 'undefined') {
							event_metadata = JSON
								.parse(event_metadata);
							if (typeof (event_metadata.price) != 'undefined') {
							    if (event_metadata.price != '')
								sell_price = event_metadata.price;
							}
						    }
						    console
							    .log("account.checkownevent-->"
								    + Account
									    .checkOwnEvent(eventId));
						    if (sell_price == ''
							    || Account
								    .checkOwnEvent(eventId)) {
							console
								.log('sell_price-->'
									+ sell_price);
							$("#" + friend_row)
								.append(
									'<div class="event_img"><a href="javascript:showEventDetail(\''
										+ eventId
										+ '\', \''
										+ creator_id
										+ '\');">'
										+ '<img src="'
										+ event_media_98x78
										+ '" alt="">'
										+ '</a>'
										+ '<span class="event_name_box"><a style="color:#FFF;" href="javascript:showEventDetail(\''
										+ eventId
										+ '\', \''
										+ creator_id
										+ '\');">!'
										+ event_name
										+ '</a></span></div>');
						    } else {
							console
								.log('sell eventId-->'
									+ eventId);
							console
								.log('sell creator_id-->'
									+ creator_id);
							console
								.log('sell sell_price-->'
									+ sell_price);
							console
								.log('sell event_name-->'
									+ event_name);
							var link = '';
							link += '<div class="event_img" ';
							link += ' id="'
								+ sell_class
								+ 'selling-'
								+ eventId + '"';
							link += ' data-owner="'
								+ creator_id
								+ '">';
							link += '<a href="javascript:;" ';
							link += 'onclick="popupBuyMedia( ';
							link += "'" + eventId
								+ "', '"
								+ sell_price
								+ "', '"
								+ eventName
								+ "' );" + '"';
							link += ' style="cursor: pointer;">';
							link += ' <div class="sell-event-overlay">';
							link += ' <span class="sell-event-buyme"><i>buy</i></span>';
							link += ' <img src="'
								+ event_media_98x78
								+ '" alt="">';
							link += ' <span class="event_name_box"><a style="color:#FFF;" >!'
								+ event_name
								+ '</a></span>';
							link += ' </a></div></div>';
							$("#" + friend_row)
								.append(link);
						    }
						} // end for loop for (var
						if (total_event_row_width > global_width) {
						    $("#" + friend_row).swipe({
							TYPE : 'mouseSwipe',
							HORIZ : true
						    });
						}
					    } else {
						$("#" + friend_row)
							.append(
								'There is no event shared');
						$("#" + friend_row).css({
						    'color' : '#FFF',
						    'font-style' : 'italic',
						    'margin-bottom' : '20px'
						}).parent("#viewport")
							.removeAttr('id')
							.removeAttr('class');
					    }
					}
					$(".event_images_public")
						.mCustomScrollbar('update');
				    }
				}
			    });
		}
	    });
}
function addMemreas() {
    $("a.share").click();
    share_clearMemreas(true);
}

// Public Event

function fetchpubsMemreas() {

    var params = new Object;
    params.user_id = Account.id;
    params.memreascookie = getCookie("memreascookie");
    params.x_memreas_chameleon = getCookie("x_memreas_chameleon");
    params.sid = getCookie("memreascookie");
    var params_json = JSON.stringify(params, null, '\t');
    var data = '{"action": "check_own_event", ' + '"type":"jsonp", '
	    + '"json": ' + params_json + '}';

    var stripeActionUrl = $("input[name=stripe_url]").val()
	    + 'stripe_checkOwnEvent';
    $('#loadingpopup').fadeIn(200);
    $
	    .ajax({
		url : stripeActionUrl,
		type : 'POST',
		dataType : 'jsonp',
		data : 'json=' + data,
		success : function(response) {
		    $('#loadingpopup').fadeOut(200);
		    response = JSON.parse(response.data);
		    if (response.status == 'Success') {
			Account.eventPurchases = response.events;
		    }

		    var user_id = Account.id;
		    var showPublic = '1';
		    var showAccepted = '0';
		    var sell_class = 'public-';
		    ajaxRequest(
			    'viewevents',
			    [ {
				tag : 'user_id',
				value : user_id
			    }, {
				tag : 'is_my_event',
				value : '0'
			    }, {
				tag : 'is_friend_event',
				value : showAccepted
			    }, {
				tag : 'is_public_event',
				value : showPublic
			    }, {
				tag : 'page',
				value : '1'
			    }, {
				tag : 'limit',
				value : '20'
			    } ],
			    function(response) {
				if ($(".event_images_public").hasClass(
					"mCustomScrollbar"))
				    var target_object = ".event_images_public .mCSB_container";
				else
				    var target_object = ".event_images_public";

				ajaxScrollbarElement('.event_images_public');
				// $(".event_images_public").empty();
				var friends = getSubXMLFromTag(response,
					'event');
				if (getValueFromXMLTag(response, 'status') == "Success") {
				    if (friends.length > 0) {
					/**
					 * Fetch Friends array
					 */
					// friends = getSubXMLFromTag(response,
					// 'event');
					var friend_count = friends.length;
					for (var i = 0; i < friend_count; i++) {
					    var friend = friends[i].innerHTML;
					    var creator_id = $(friend).filter(
						    'event_creator_user_id')
						    .html();
					    var event_id = $(friend).filter(
						    'event_id').html();
					    var event_name = $(friend).filter(
						    'event_name').html();
					    var event_like_total = $(friend)
						    .filter('event_like_total')
						    .html();
					    var event_comment_total = $(friend)
						    .filter(
							    'event_comment_total')
						    .html();
					    var profile_img = $(friend).filter(
						    'profile_pic_79x80').html();
					    profile_img = removeCdataCorrectLink(profile_img);

					    var friend_row = 'friendPublic-'
						    + creator_id;
					    var event_creator = $(friend)
						    .filter('event_creator')
						    .html();

					    var event_media = getSubXMLFromTag(
						    friends[i], 'event_media');
					    var event_media_count = event_media.length;
					    var StrMedia = '<div style="clear:both;"></div><div class="documentscls"><ul class="event-pics event-listing-public-memreas">';
					    var overlaydiv = '';

					    var event_metadata = getValueFromXMLTag(
						    friends[i],
						    'event_metadata');

					    if (typeof (event_metadata) != 'undefined') {
						event_metadata = JSON
							.parse(event_metadata);
						var event_price = event_metadata.price;
					    } else {
						var event_price = 0;
					    }

					    var event_name = $(friend).filter(
						    'event_name').html();
					    for (var j = 0; j < event_media_count; j++) {
						var event_medi = event_media[j];
						var event_media_image = getValueFromXMLTag(
							event_medi,
							'event_media_448x306');
						var _event_media_type_ = getValueFromXMLTag(
							event_medi,
							'event_media_type');

						if (event_price == 0
							|| Account
								.checkOwnEvent(event_id)) {
						    if (_event_media_type_ == 'image') {
							StrMedia += '<li class="image" style="float:none; display:inline-block;"><a href="javascript:;" onclick="showEventDetail(\''
								+ event_id
								+ '\', \''
								+ user_id
								+ '\');" style="cursor: pointer;"><img src="'
								+ removeCdataCorrectLink(event_media_image)
								+ '"  style=""/></a></li>';
						    } else if (_event_media_type_ == 'video') {
							StrMedia += '<li class="video" float:none; display:inline-block;><a href="javascript:;" onclick="showEventDetail(\''
								+ event_id
								+ '\', \''
								+ user_id
								+ '\');" style="cursor: pointer;"><img src="'
								+ removeCdataCorrectLink(event_media_image)
								+ '"  style=""/></a><span class="video-content-play-icon-2"></span></li>';
						    }
						} else {
						    if (_event_media_type_ == 'image') {
							StrMedia += '<li class="image DocumentItem"><a href="javascript:;" onclick="popupBuyMedia(\''
								+ event_id
								+ '\', \''
								+ event_price
								+ '\', \''
								+ event_name
								+ '\');" style="cursor: pointer;"><div class="sell-event-overlay"></div><span class="sell-event-buyme"><i>Buy</i></span><img src="'
								+ removeCdataCorrectLink(event_media_image)
								+ '"  style=""/></a></li>';
						    } else if (_event_media_type_ == 'video') {
							StrMedia += '<li class="video DocumentItem" ><a href="javascript:;" onclick="popupBuyMedia(\''
								+ event_id
								+ '\', \''
								+ event_price
								+ '\', \''
								+ event_name
								+ '\');" style="cursor: pointer;"><div class="sell-event-overlay"></div><span class="sell-event-buyme"><i>Buy</i></span><img src="'
								+ removeCdataCorrectLink(event_media_image)
								+ '"  style=""/></a><span class="video-content-play-icon-2"></span></li>';
						    }
						    overlaydiv = '<div class="overlaypopUp2" onclick="popupBuyMedia(\''
							    + event_id
							    + '\', \''
							    + event_price
							    + '\', \''
							    + event_name
							    + '\');"><a href="#" class="btnpublicbuynow">purchase access $'
							    + event_price
							    + '</a></div>';
						}
					    }

					    StrMedia += '</ul></div><div style="clear:both;"></div>';

					    var event_friends = getSubXMLFromTag(
						    friends[i], 'event_friends');
					    var event_friend = getSubXMLFromTag(
						    event_friends,
						    'event_friend');
					    var event_friend_count = event_friend.length;
					    var event_friend_string = "";
					    for (var k = 1; k <= event_friend_count; k++) {
						var event_friend_list = event_friend[k];
						var event_friend_id = getValueFromXMLTag(
							event_friend_list,
							'event_friend_id');
						var event_friend_social_username = getValueFromXMLTag(
							event_friend_list,
							'event_friend_social_username');
						var event_friend_url_image = getValueFromXMLTag(
							event_friend_list,
							'event_friend_url_image');
						event_friend_url_image = removeCdataCorrectLink(event_friend_url_image);

						event_friend_string += '<figure class="pro-pics2"><img class="public-profile-img" src="'
							+ event_friend_url_image
							+ '" alt=""></figure>'
							+ '<aside class="pro-names2" style="margin-top:0px;">@ '
							+ event_friend_social_username
							+ '</aside>';
					    }
					    $(target_object)
						    .append(
							    '<div class="event_section addstyling">'
								    + overlaydiv
								    + '<section class="row-fluid clearfix">'
								    + '<figure class="pro-pics2"><img class="public-profile-img" src="'
								    + profile_img
								    + '" alt=""></figure>'
								    + '<aside class="pro-names2" style="margin-top:0px;">@'
								    + event_creator
								    + ' : !'
								    + event_name
								    + '</aside>'
								    + '<a href="javascript:;" title="Like media" class="memreas-detail-likecount" style="margin-left:10px;"><img src="/memreas/img/like.png" alt=""></a><span style="position: relative;top: -10px;left: -17px;color: #fff;">'
								    + event_like_total
								    + '</span>'
								    + '<a href="javascript:;" title="Comment" style="position: relative;top:5px;"><img src="/memreas/img/comment.png" alt=""></a><span style="position: relative;top: -8px;left: -19px;color: #fff;">'
								    + event_comment_total
								    + '</span>'
								    + event_friend_string
								    + StrMedia
								    + '</section><div id="viewport" class="mouse_swip" onselectstart="return false;">'
								    + '<div id="'
								    + friend_row
								    + '" class="swipeclass"></div></div></div>');
					    // $(target_object).append(StrMedia);

					    var global_width = $(
						    "#tab-content-memreas")
						    .width();
					    var base_event_row_width = 120;

					    /**
					     * Fetch events by friend
					     */

					}
					$(".event_images_public")
						.mCustomScrollbar('update');
				    }
				}
			    });
		}
	    });
}
