/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */

var GLOBAL_ENV = 'development'; // development or live
var CURRENT_URL = document.URL;
if (CURRENT_URL.indexOf('localhost') < 0 && GLOBAL_ENV == 'development') {
    GLOBAL_ENV = 'live'; // Force set if URL is not localhost
}

var userBrowser = detectBrowser();
var stackAjaxInstance = []; // This variable is used for stacking ajax
// request(s) on site

/*
 * Summary for this variable, remove then if needed Set this variable for
 * reloading ajax when clicking or not It's used for when user makes changes on
 * uploading new media, creating new event,... Store which request will be
 * reloaded @listallmedia: Reload main gallery page @view_my_event: memreas page
 * for my event @view_friend_event: memreas page for friend event
 * @view_public_event: memreas page for public event
 */
var reloadItems = [ 'view_my_events', 'view_friend_events',
	'view_public_events', 'share_listmedia', 'reload_account_cards',
	'reload_subscription_cards', 'reload_buy_credit_cards' ];
function checkUserresourcesHasid() {
    var countitems = $("div.user-resources").find("div.fotorama__wrap").find(
	    "div.fotorama__nav-wrap").find("div.fotorama__nav").find(
	    "div.fotorama__nav__shaft").find("div.fotorama__nav__frame").find(
	    "div.fotorama__thumb").length;
    var c = 1;
    $("div.user-resources").find("div.fotorama__wrap").find(
	    "div.fotorama__nav-wrap").find("div.fotorama__nav").find(
	    "div.fotorama__nav__shaft").find("div.fotorama__nav__frame").find(
	    "div.fotorama__thumb").each(function() {
	$(this).find("img.fotorama__img").each(function() {
	    if ($(this).attr("id")) {
		c++;
	    }
	});
    });
    if (c < countitems) {
	return false;
    } else {
	return true;
    }
}
function checkUserresourcesId(medias) {
    var c = 0;
    $("div.user-resources").find("div.fotorama__wrap").find(
	    "div.fotorama__nav-wrap").find("div.fotorama__nav").find(
	    "div.fotorama__nav__shaft").find("div.fotorama__nav__frame").find(
	    "div.fotorama__thumb").each(function() {
	$(this).find("img.fotorama__img").each(function() {
	    var media = medias[c];
	    var mediaId = getValueFromXMLTag(media, 'media_id');
	    $(this).attr("id", mediaId);
	});
	c++;
    });
    if (!checkUserresourcesHasid()) {
	setTimeout(function() {
	    checkUserresourcesId(medias);
	}, 1000);
    }
}

/* function for sync tab image */
function imageChoosed(media_id) {
    if ($("a[id='" + media_id + "']").closest('li').hasClass('setchoosed')) {
	$("a[id='" + media_id + "']").closest('li').removeClass('setchoosed');
	$("a[id='" + media_id + "']").closest('li')
		.find("img.selected-gallery").remove();
    } else {
	$("a[id='" + media_id + "']").closest('li').addClass('setchoosed');
	$("a[id='" + media_id + "']")
		.closest('li')
		.append(
			'<img class="selected-gallery" src="/memreas/img/gallery-select.png">');
    }
    return false;
}

function checkReloadItem(itemName) {
    if (reloadItems.length > 0) {
	for (var i = 0; i < reloadItems.length; i++) {
	    if (itemName == reloadItems[i]) {
		removeItem(reloadItems, itemName);
		return true;
	    }
	}
	return false;
    } else
	return false;
}
function pushReloadItem(itemName) {
    reloadItems[reloadItems.length] = itemName;
}

function pushStackAjax(stackAjaxName) {
    var current_stack_length = stackAjaxInstance.length;
    stackAjaxInstance[current_stack_length] = stackAjaxName;
}
/*
 * @ Function Scrollbar Secure @ Surely scrollbar element loaded and scroll
 * loaded also
 */
function ajaxScrollbarElement(element_object) {
    var jElement_object = $(element_object);
    jElement_object.mCustomScrollbar('update');
    if (!jElement_object.hasClass('mCustomScrollbar'))
	jElement_object.mCustomScrollbar({
	    scrollButtons : {
		enable : true
	    }
	});
    if (!jElement_object.find('.mCSB_scrollTools').is(':visible')) {
	jElement_object.mCustomScrollbar('update');
	setTimeout(function() {
	    ajaxScrollbarElement(element_object);
	}, 1000);
    }
}

function getMediaUrl(element_object, mediatype) {
    var photo_tags = [ 'main_media_url', 'media_url_448x306' ];
    // var photo_tags = ['media_url_1280x720', 'media_url_448x306' ];
    var video_tags = [ 'media_url_hls', 'media_url_web' ];

    switch (mediatype) {
    case 'image':
	var search_element = photo_tags;
	break;
    case 'video':
	var search_element = video_tags;
	break;
    default:
	var search_element = photo_tags;
    }

    var found_link = '';

    var total_media_response = search_element.length;
    var found_link = '';
    for (var i = 0; i < total_media_response; i++) {
	if ((element_object.innerHTML).indexOf(search_element[i]) >= 0) {
	    found_link = getValueFromXMLTag(element_object, search_element[i]);
	    found_link = removeCdataCorrectLink(found_link);
	}

	if (found_link != '')
	    break;
    }

    if (found_link == '')
	return '/memreas/img/small/1.jpg';
    else
	return found_link;
}

function removeCdata(media_link) {
    if (media_link != null) {
	media_link = media_link.replace("<!--[CDATA[", "").replace("]]-->", "");
    }
    return media_link;
}

function removeCdataCorrectLink(media_link) {

    // if (typeof media_link === "undefined") {
    // return "";
    // }
    if (media_link != null) {
	media_link = media_link.replace('<!--[CDATA[["', "").replace('"]]]-->',
		"").replace("<!--[CDATA[", "").replace("]]-->", "").replace(
		'["', "").replace('"]', "");
	if (media_link.indexOf("\\/") >= 0) {
	    media_link = media_link.split("\\/").join('/');
	}
    }

    return media_link;
}

function getMediaThumbnail(element_object, default_value) {
    var media_tags = [ 'media_url_98x78', 'media_url_79x80',
	    'media_url_448x306', 'media_url_1280x720' ];
    var total_media_response = media_tags.length;
    var found_link = '';
    for (var i = 0; i < total_media_response; i++) {

	if ((element_object.innerHTML).indexOf(media_tags[i]) >= 0) {
	    found_link = getValueFromXMLTag(element_object, media_tags[i]);
	    found_link = removeCdataCorrectLink(found_link);
	    found_link = found_link.split(',');
	    found_link = found_link[0];
	    found_link = found_link.replace('"', '');
	}

	if (found_link != '')
	    break;
    }

    if (found_link == '')
	found_link = default_value;
    return found_link;
}

// Check if image already exist
function image_exist(image_url, default_value) {

}

// Notify functions
function jsuccess(str_msg) {
    jSuccess(str_msg, {
	autoHide : true, // added in v2.0
	clickOverlay : false, // added in v2.0
	MinWidth : 250,
	TimeShown : 3000,
	ShowTimeEffect : 200,
	HideTimeEffect : 200,
	LongTrip : 20,
	HorizontalPosition : 'center',
	VerticalPosition : 'top',
	ShowOverlay : true,
	ColorOverlay : '#FFF',
	OpacityOverlay : 0.3,
	onClosed : function() {
	},
	onCompleted : function() {
	}
    });
}
function jerror(str_msg) {
    jError(str_msg, {
	autoHide : true, // added in v2.0
	clickOverlay : false, // added in v2.0
	MinWidth : 250,
	TimeShown : 5000,
	ShowTimeEffect : 200,
	HideTimeEffect : 200,
	LongTrip : 20,
	HorizontalPosition : 'center',
	VerticalPosition : 'top',
	ShowOverlay : true,
	ColorOverlay : '#FFF',
	OpacityOverlay : 0.3,
	onClosed : function() {
	},
	onCompleted : function() {
	}
    });
}
function jconfirm(str_msg, confirm_func) {
    jNotify(
	    '<div class="notify-box"><p>'
		    + str_msg
		    + '</p><a href="javascript:;" class="btn" onclick="'
		    + confirm_func
		    + ';">OK</a>&nbsp;<a href="javascript:;" class="btn" onclick="$.jNotify._close();">Close</a></div>',
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
		onClosed : function() {
		},
		onCompleted : function() {
		}
	    });
}
function logout() {
    var user_logged = $("input[name=user_id]").val();
    var params = [ {
	tag : 'user_id',
	value : user_logged
    } ];
    ajaxRequest('logout', params, function(response) {
	window.location.href = "/";
    });
}

// Remove item from an array
function removeItem(array, item) {
    for ( var i in array) {
	if (array[i] == item) {
	    array.splice(i, 1);
	    break;
	}
    }
}
function detectBrowser() {
    if (navigator.vendor != null
	    && navigator.vendor.match(/Apple Computer, Inc./)
	    && navigator.userAgent.match(/iPhone/i)
	    || (navigator.userAgent.match(/iPod/i))) {
	return [ {
	    'ios' : 1
	}, {
	    'browser' : 'Ipod or Iphone'
	} ];
    } else if (navigator.vendor != null
	    && navigator.vendor.match(/Apple Computer, Inc./)
	    && navigator.userAgent.match(/iPad/i)) {
	return [ {
	    'ios' : 1
	}, {
	    'browser' : 'Ipad'
	} ];
    } else if (navigator.vendor != null
	    && navigator.vendor.match(/Apple Computer, Inc./)
	    && navigator.userAgent.indexOf('Safari') != -1) {
	return [ {
	    'ios' : 1
	}, {
	    'browser' : 'Safari'
	} ];
    }

    else if (navigator.vendor == null || navigator.vendor != null) {
	var isOpera = !!window.opera
		|| navigator.userAgent.indexOf('Opera') >= 0;
	var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
	var isSafari = Object.prototype.toString.call(window.HTMLElement)
		.indexOf('Constructor') > 0;
	var isChrome = !!window.chrome; // Chrome 1+
	var isIE = /* @cc_on!@ */false; // At least IE6

	if (isFirefox)
	    return [ {
		'ios' : 0
	    }, {
		'browser' : 'Firefox'
	    } ];
	if (isChrome)
	    return [ {
		'ios' : 0
	    }, {
		'browser' : 'Chrome'
	    } ];
	if (isSafari)
	    return [ {
		'ios' : 0
	    }, {
		'browser' : 'Safari'
	    } ];
	if (isSafari)
	    return [ {
		'ios' : 0
	    }, {
		'browser' : 'Opera'
	    } ];
	if (isIE) {
	    return [ {
		'ios' : 0
	    }, {
		'browser' : 'IE'
	    } ]
	}
	;
    }
}

function detectHandheldIOSDevice() {
    if (userBrowser[0].ios == 1
	    && (userBrowser[1].browser == 'Ipod or Iphone' || userBrowser[1].browser == 'Ipad'))
	return true;
    else
	return false;
}

function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)
	    || userAgent.match(/iPod/i)) {
	return 'iOS';

    } else if (userAgent.match(/Android/i)) {

	return 'Android';
    } else {
	return 'unknown';
    }
}

/*
 * Enable / Disable input field (for ajax calling and prevent user typing)
 */
function disableInput(element) {
    $(element).attr('readonly', true);
}
function enableInput(element) {
    $(element).removeAttr('readonly');
}

/*
 * Akordeon control
 */
function activeAkordeon(elementClass, callback_func) {
    var jActiveTab = $("." + elementClass);
    var jParentAkordeon = jActiveTab.parents('.parent-global-akordeon');

    // reset collapsed items
    jParentAkordeon.find(".akordeon-item").each(function() {
	if ($(this).hasClass('expanded'))
	    $(this).removeClass('expanded');
	if (!$(this).hasClass('collapsed'))
	    $(this).addClass('collapsed');
	$(this).find('.akordeon-icon').children('span').html("+");
    });
    var currentItemBodyHeight = jActiveTab.find('.akordeon-item-body').find(
	    ".akordeon-item-content").height();
    jParentAkordeon.find(".akordeon-item-body").css('height', 0);
    jActiveTab.find('.akordeon-icon').children('span').html("&ndash;");
    jActiveTab.removeClass('collapsed').addClass('expanded');
    jActiveTab.find(".akordeon-item-body").css('height', currentItemBodyHeight);
    updateAkordeonContent(jActiveTab);

    if (callback_func)
	callback_func();
}
function updateAkordeonContent(jActiveTab) {
    var currentItemBodyHeight = jActiveTab.find('.akordeon-item-body').find(
	    ".akordeon-item-content").height() + 100;
    jActiveTab.find(".akordeon-item-body").css('height', currentItemBodyHeight);
}

/* Main tab navigation */
function goHomeTab() {
    $("a[title=gallery]").trigger('click');
}
function goMoreTab() {
    $("a[title=more]").trigger('click');
}

/* cookie */
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
	var c = ca[i];
	while (c.charAt(0) == ' ')
	    c = c.substring(1);
	if (c.indexOf(name) == 0)
	    return c.substring(name.length, c.length);
    }
    return "";
}

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";";
}

function isJson(str) {
    try {
	JSON.parse(str);
    } catch (e) {
	return false;
    }
    return true;
}

function setX_MEMREAS_CHAMELEON(x_memreas_chameleon) {
    document.cookie = 'x_memreas_chameleon=' + x_memreas_chameleon + ";";
}

/* Other */
addLoading = function(element, typeLoading, additionClass) {
    var jElement = $(element);
    if (additionClass != '')
	additionClass = ' ' + additionClass;
    jElement
	    .append('<div class="overlay-bg'
		    + additionClass
		    + '"><div class="bg"></div><img src="/memreas/img/loading-line.gif" class="loading-small overlay-small-loading" /></div>');
    if (typeLoading == 'input') {
	var input_width = jElement.find('input').width();
	var input_height = jElement.find('input').height() + 5;
	var input_left_pos = (jElement.find('input').offset().left - jElement
		.offset().left);
	var input_top_pos = (jElement.find('input').offset().top - jElement
		.offset().top);

	jElement.find('.overlay-bg').css({
	    'width' : input_width,
	    'height' : input_height,
	    'left' : input_left_pos,
	    'top' : input_top_pos
	}).fadeIn(500);
	jElement.find('input').attr('readonly', true);
    } else
	jElement.find('.overlay-bg').fadeIn(500);
}
removeLoading = function(element) {
    var jElement = $(element);
    jElement.find('.overlay-bg').remove();
    jElement.find('input').removeAttr('readonly');
}

var buttonHandler = [];
disableButtons = function(elementBox) {
    buttonHandler = [];
    var counter = 0;
    var jElement = $(elementBox);
    jElement.find('a.black_btn_skin').each(function() {
	buttonHandler[counter++] = $(this).attr('href');
	$(this).removeAttr('href').addClass('button-disabled');
    });
}

enableButtons = function(elementBox) {
    var counter = 0;
    var jElement = $(elementBox);
    jElement.find('a.black_btn_skin').each(
	    function() {
		$(this).attr('href', buttonHandler[counter++]).removeClass(
			'button-disabled');
	    });
}

function correctDateNumber(date_number) {
    if (parseInt(date_number) < 10)
	return '0' + date_number.toString();
    else
	return date_number;
}

// convert date string from MMDDYYY to DDMMYYYY.
formatDateToDMY = function(date) {
    if (date == "")
	return "";

    return date.substr(3, 2) + "/" + date.substr(0, 2) + date.substr(5);
}

// return the text value within the specified xml tag.
getValueFromXMLTag = function(xml, tag) {
    var element = $(xml).find(tag)[0];
    if (typeof (element) != 'undefined')
	return element.innerHTML;
    else
	return '';
}

// return the sub xml array from tag.
getSubXMLFromTag = function(xml, tag) {
    return $(xml).find(tag);
}

// clear the value of the text fields.
clearTextField = function(elements) {
    var i = 0, id = "";
    if (typeof elements == "string") {
	id = '#' + elements;
	$(id).val($(id)[0].defaultValue);
    } else if (typeof elements.length != "undefined") {
	for (i = 0; i < elements.length; i++) {
	    id = '#' + elements[i];
	    $(id).val($(id)[0].defaultValue);
	}
    }
}

// clear the value of the check box.
clearCheckBox = function(elements) {
    var i = 0, id = "";
    if (typeof elements == "string") {
	id = '#' + elements;
	$(id)[0].checked = true;
    } else if (typeof elements.length != "undefined") {
	for (i = 0; i < elements.length; i++) {
	    id = '#' + elements[i];
	    alert('checkbox id is-->' + id); 
	    $(id)[0].checked = true;
	}
    }
}

// check if the html5 element is empty.
isElementEmpty = function(id) {
    var element = $('#' + id);
    if (typeof element == "undefined" || typeof element.length == "undefined")
	return true;
    var value = element.val();
    if (value == "" || value == element[0].defaultValue)
	return true;
    return false;
}
// return the value of html5 element such as text field or date-time picker.
getElementValue = function(id) {
    var element = $('#' + id);
    if (typeof element == "undefined" || typeof element.length == "undefined")
	return "";
    var value = element.val();
    if (value == element[0].defaultValue)
	value = "";
    return value;
}

// return the checkbox value.
getCheckBoxValue = function(id) {
    return ($('#' + id).is(":checked")) ? 1 : 0;
}

// set the value of checkbox.
setCheckBoxValue = function(id, value) {
    $('#' + id)[0].checked = !value;
}

// set the defailt value to the html5 element.
setDefaultValue = function(id) {
    var element = $('#' + id);
    if (typeof element == "undefined" || typeof element.length == "undefined")
	return "";
    element.val(element[0].defaultValue);
}

// split the string by delimeters.
splitByDelimeters = function(val, delims) {
    var ret = [];
    var i, j, count = 0, idx = 0;
    for (i = 0; i < val.length; i++) {
	for (j = 0; j < delims.length; j++) {
	    if (val[i] == delims[j])
		break;
	}
	if (j < delims.length) {
	    if (i == idx + 1)
		idx++;
	    else {
		ret[count++] = val.substr(idx, i - idx);
		idx = i + 1;
	    }
	}
    }
    if (idx < val.length - 1) {
	ret[count++] = val.substr(idx, i - idx);
    }
    return ret;
}
function randomShowAds() {
    var rightadarr = new Array();
    var bottomadarr = new Array();
    rightadarr[0] = {
	link : "#",
	img : "/memreas/img/ads/DepartmentStoreSale banner ads 1.png"
    };
    rightadarr[1] = {
	link : "#",
	img : "/memreas/img/ads/ElectronicsStoreSale banner ads 1.png"
    };
    rightadarr[2] = {
	link : "#",
	img : "/memreas/img/ads/Hotel banner ads 1.png"
    };
    rightadarr[3] = {
	link : "#",
	img : "/memreas/img/ads/Hotel banner ads 2.png"
    };
    rightadarr[4] = {
	link : "#",
	img : "/memreas/img/ads/restaurant banner ads 1.png"
    };
    rightadarr[5] = {
	link : "#",
	img : "/memreas/img/ads/restaurant banner ads 2.png"
    };

    /* bottomad */
    bottomadarr[0] = {
	link : "#",
	img : "/memreas/img/ads/amen+.png"
    };
    bottomadarr[1] = {
	link : "#",
	img : "/memreas/img/ads/ElectronicsStoreSale banner ads.png"
    };
    bottomadarr[2] = {
	link : "#",
	img : "/memreas/img/ads/Hotel banner ads.png"
    };
    bottomadarr[3] = {
	link : "#",
	img : "/memreas/img/ads/memreas login admin.png"
    };
    bottomadarr[4] = {
	link : "#",
	img : "/memreas/img/ads/restaurant banner ads.png"
    };
    if ($(".right-ads-section").length) {
	$(".right-ads-section").each(
		function() {
		    var rad1 = rightadarr[Math.floor(Math.random()
			    * rightadarr.length)];
		    var rad2 = rightadarr[Math.floor(Math.random()
			    * rightadarr.length)];
		    var radhtml = '<div class="adbox"><a href="' + rad1.link
			    + '"><img src="' + rad1.img + '"/></a></div>';
		    radhtml += '<div class="adbox"><a href="' + rad2.link
			    + '"><img src="' + rad2.img + '"/></a></div>';
		    $(this).fadeOut();
		    $(this).empty().append(radhtml);
		    $(this).fadeIn();
		});

    }
    if ($(".bottom-ads-secion").length) {
	$(".bottom-ads-secion").each(
		function() {
		    var bad1 = bottomadarr[Math.floor(Math.random()
			    * bottomadarr.length)];
		    var badhtml = '<div class="adbox"><a href="' + bad1.link
			    + '"><img src="' + bad1.img + '"/></a></div>';
		    $(this).empty().append(badhtml);
		    $(this).fadeIn();
		});
    }
    setTimeout(function() {
	randomShowAds();
    }, 9000);
}
function autoResizeSlideshow() {
    if ($("#tab-content").length) {
	var wheight = $("#tab-content").height();
	if ($(".fotorama__stage").length) {
	    var nheight = $(".fotorama__stage").height();
	    var rheight = parseInt(wheight) - 68;
	    if (nheight < rheight) {
		$(".fotorama__stage").height(rheight);
	    }

	}
    }
    setTimeout(function() {
	autoResizeSlideshow();
    }, 3000);
}

$(document).ready(function() {
    if (document.layers) {
	// Capture the MouseDown event.
	document.captureEvents(Event.MOUSEDOWN);

	// Disable the OnMouseDown event handler.
	$(document).mousedown(function() {
	    return false;
	});
    } else {
	// Disable the OnMouseUp event handler.
	$(document).mouseup(function(e) {
	    if (e != null && e.type == "mouseup") {
		// Check the Mouse Button which is clicked.
		if (e.which == 2 || e.which == 3) {
		    // If the Button is middle or right then disable.
		    return false;
		}
	    }
	});
    }

    // Disable the Context Menu event.
    $(document).contextmenu(function() {
	return false;
    });
});

$(document)
	.ready(
		function() {
		    randomShowAds();
		    autoResizeSlideshow();
		    if (($.browser.mozilla == true && $.browser.version <= "11.0")
			    || ($.browser.msie && $.browser.version <= 6)
			    || ($.browser.msie && $.browser.version > 6)) {
			$("#form-user-login").find("input").each(function() {
			    $(this).prop("disabled", true);
			});
			$("#register").find("input").each(function() {
			    $(this).prop("disabled", true);
			});
			$("#frm-profile-pic").find("input").each(function() {
			    $(this).prop("disabled", true);
			});
			$("a.forgot-password").remove();
			jerror("Memreas is optimized for the latest versions of Chrome, Safari, and Firefox");
		    }

		    if ($('#avpw_controlpanel_textwithfont').length) {
			$('#avpw_controlpanel_textwithfont')
				.find("div.avpw_inset_color_widget")
				.each(
					function() {
					    $(this)
						    .append(
							    "<div class='avpw_inset_color_widget_label'>Color picker</div>");
					});
		    }

		});

var md5 = (function() {
    function e(e, t) {
	var o = e[0], u = e[1], a = e[2], f = e[3];
	o = n(o, u, a, f, t[0], 7, -680876936);
	f = n(f, o, u, a, t[1], 12, -389564586);
	a = n(a, f, o, u, t[2], 17, 606105819);
	u = n(u, a, f, o, t[3], 22, -1044525330);
	o = n(o, u, a, f, t[4], 7, -176418897);
	f = n(f, o, u, a, t[5], 12, 1200080426);
	a = n(a, f, o, u, t[6], 17, -1473231341);
	u = n(u, a, f, o, t[7], 22, -45705983);
	o = n(o, u, a, f, t[8], 7, 1770035416);
	f = n(f, o, u, a, t[9], 12, -1958414417);
	a = n(a, f, o, u, t[10], 17, -42063);
	u = n(u, a, f, o, t[11], 22, -1990404162);
	o = n(o, u, a, f, t[12], 7, 1804603682);
	f = n(f, o, u, a, t[13], 12, -40341101);
	a = n(a, f, o, u, t[14], 17, -1502002290);
	u = n(u, a, f, o, t[15], 22, 1236535329);
	o = r(o, u, a, f, t[1], 5, -165796510);
	f = r(f, o, u, a, t[6], 9, -1069501632);
	a = r(a, f, o, u, t[11], 14, 643717713);
	u = r(u, a, f, o, t[0], 20, -373897302);
	o = r(o, u, a, f, t[5], 5, -701558691);
	f = r(f, o, u, a, t[10], 9, 38016083);
	a = r(a, f, o, u, t[15], 14, -660478335);
	u = r(u, a, f, o, t[4], 20, -405537848);
	o = r(o, u, a, f, t[9], 5, 568446438);
	f = r(f, o, u, a, t[14], 9, -1019803690);
	a = r(a, f, o, u, t[3], 14, -187363961);
	u = r(u, a, f, o, t[8], 20, 1163531501);
	o = r(o, u, a, f, t[13], 5, -1444681467);
	f = r(f, o, u, a, t[2], 9, -51403784);
	a = r(a, f, o, u, t[7], 14, 1735328473);
	u = r(u, a, f, o, t[12], 20, -1926607734);
	o = i(o, u, a, f, t[5], 4, -378558);
	f = i(f, o, u, a, t[8], 11, -2022574463);
	a = i(a, f, o, u, t[11], 16, 1839030562);
	u = i(u, a, f, o, t[14], 23, -35309556);
	o = i(o, u, a, f, t[1], 4, -1530992060);
	f = i(f, o, u, a, t[4], 11, 1272893353);
	a = i(a, f, o, u, t[7], 16, -155497632);
	u = i(u, a, f, o, t[10], 23, -1094730640);
	o = i(o, u, a, f, t[13], 4, 681279174);
	f = i(f, o, u, a, t[0], 11, -358537222);
	a = i(a, f, o, u, t[3], 16, -722521979);
	u = i(u, a, f, o, t[6], 23, 76029189);
	o = i(o, u, a, f, t[9], 4, -640364487);
	f = i(f, o, u, a, t[12], 11, -421815835);
	a = i(a, f, o, u, t[15], 16, 530742520);
	u = i(u, a, f, o, t[2], 23, -995338651);
	o = s(o, u, a, f, t[0], 6, -198630844);
	f = s(f, o, u, a, t[7], 10, 1126891415);
	a = s(a, f, o, u, t[14], 15, -1416354905);
	u = s(u, a, f, o, t[5], 21, -57434055);
	o = s(o, u, a, f, t[12], 6, 1700485571);
	f = s(f, o, u, a, t[3], 10, -1894986606);
	a = s(a, f, o, u, t[10], 15, -1051523);
	u = s(u, a, f, o, t[1], 21, -2054922799);
	o = s(o, u, a, f, t[8], 6, 1873313359);
	f = s(f, o, u, a, t[15], 10, -30611744);
	a = s(a, f, o, u, t[6], 15, -1560198380);
	u = s(u, a, f, o, t[13], 21, 1309151649);
	o = s(o, u, a, f, t[4], 6, -145523070);
	f = s(f, o, u, a, t[11], 10, -1120210379);
	a = s(a, f, o, u, t[2], 15, 718787259);
	u = s(u, a, f, o, t[9], 21, -343485551);
	e[0] = m(o, e[0]);
	e[1] = m(u, e[1]);
	e[2] = m(a, e[2]);
	e[3] = m(f, e[3])
    }
    function t(e, t, n, r, i, s) {
	t = m(m(t, e), m(r, s));
	return m(t << i | t >>> 32 - i, n)
    }
    function n(e, n, r, i, s, o, u) {
	return t(n & r | ~n & i, e, n, s, o, u)
    }
    function r(e, n, r, i, s, o, u) {
	return t(n & i | r & ~i, e, n, s, o, u)
    }
    function i(e, n, r, i, s, o, u) {
	return t(n ^ r ^ i, e, n, s, o, u)
    }
    function s(e, n, r, i, s, o, u) {
	return t(r ^ (n | ~i), e, n, s, o, u)
    }
    function o(t) {
	var n = t.length, r = [ 1732584193, -271733879, -1732584194, 271733878 ], i;
	for (i = 64; i <= t.length; i += 64) {
	    e(r, u(t.substring(i - 64, i)))
	}
	t = t.substring(i - 64);
	var s = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	for (i = 0; i < t.length; i++)
	    s[i >> 2] |= t.charCodeAt(i) << (i % 4 << 3);
	s[i >> 2] |= 128 << (i % 4 << 3);
	if (i > 55) {
	    e(r, s);
	    for (i = 0; i < 16; i++)
		s[i] = 0
	}
	s[14] = n * 8;
	e(r, s);
	return r
    }
    function u(e) {
	var t = [], n;
	for (n = 0; n < 64; n += 4) {
	    t[n >> 2] = e.charCodeAt(n) + (e.charCodeAt(n + 1) << 8)
		    + (e.charCodeAt(n + 2) << 16) + (e.charCodeAt(n + 3) << 24)
	}
	return t
    }
    function c(e) {
	var t = "", n = 0;
	for (; n < 4; n++)
	    t += a[e >> n * 8 + 4 & 15] + a[e >> n * 8 & 15];
	return t
    }
    function h(e) {
	for (var t = 0; t < e.length; t++)
	    e[t] = c(e[t]);
	return e.join("")
    }
    function d(e) {
	return h(o(unescape(encodeURIComponent(e))))
    }
    function m(e, t) {
	return e + t & 4294967295
    }
    var a = "0123456789abcdef".split("");
    return d
})();

function resizeWindowBluepanel() {
    var queueHeight = $(window).height();
    if (queueHeight > 205) {
	queueHeight = queueHeight - 205
    }

    $(
	    "#tab-content, #tab-content-queue, #tab-content-share, #tab-content-memreas, #tab-content-memreas-detail, #tab-content-more")
	    .attr(
		    'style',
		    'height: auto !important; min-height: ' + queueHeight
			    + 'px !important');
    //console.log(queueHeight);
}

function resizeBlueIMpGallerypanel() {
    var queueHeight = $(window).height();
    if (queueHeight > 205) {
	queueHeight = queueHeight - 205
    }

    $(
	    ".linksDatacnt")
	    .attr(
		    'style',
		    'height: '+queueHeight+'px; min-height: ' + queueHeight
			    + 'px !important');
    //console.log(queueHeight);
}





 $("a[title=share]").hover (function(){
        $('footer').attr('style','z-index:2');
    });
$("a[title=more]").hover (function(){
        $('footer').attr('style','z-index:2');
    });

$("a[title=queue]").hover (function(){
        $('footer').attr('style','z-index:2');
    });
 $("a[title=memreas]").hover (function(){
        $('footer').attr('style','z-index:2');
    });   
  

