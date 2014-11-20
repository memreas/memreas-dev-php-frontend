/*
*@Define global function here
*@ Tran Tuan
*/
var GLOBAL_ENV = 'development'; //development or live
var CURRENT_URL = document.URL;
if (CURRENT_URL.indexOf('localhost') < 0 && GLOBAL_ENV == 'development')
    GLOBAL_ENV = 'live'; //Force set if URL is not localhost

var s3_bucket = 'memreasdev';
var userBrowser = detectBrowser();
var stackAjaxInstance = []; //This variable is used for stacking ajax request(s) on site

/*
* Summary for this variable, remove then if needed
* Set this variable for reloading ajax when clicking or not
    It's used for when user makes changes on uploading new media, creating new event,...
    Store which request will be reloaded
* @listallmedia: Reload main gallery page
* @view_my_event: memreas page for my event
* @view_friend_event: memreas page for friend event
* @view_public_event: memreas page for public event
* */
var reloadItems = ['view_my_events', 'view_friend_events', 'view_public_events', 'share_listmedia',
                    'reload_account_cards', 'reload_subscription_cards', 'reload_buy_credit_cards'];
function checkUserresourcesHasid(){
	var countitems = $("div.user-resources").find("div.fotorama__wrap").find("div.fotorama__nav-wrap").find("div.fotorama__nav").find("div.fotorama__nav__shaft").find("div.fotorama__nav__frame").find("div.fotorama__thumb").length;
	var c = 1;
	$("div.user-resources").find("div.fotorama__wrap").find("div.fotorama__nav-wrap").find("div.fotorama__nav").find("div.fotorama__nav__shaft").find("div.fotorama__nav__frame").find("div.fotorama__thumb").each(function(){
		 $(this).find("img.fotorama__img").each(function(){
             if($(this).attr("id")){
            	 c++;
             }
   	  	});
	 });
	if(c <countitems){
		return false;
	}else{
		return true;
	}
}
function checkUserresourcesId(medias){
	var c = 0;
 	$("div.user-resources").find("div.fotorama__wrap").find("div.fotorama__nav-wrap").find("div.fotorama__nav").find("div.fotorama__nav__shaft").find("div.fotorama__nav__frame").find("div.fotorama__thumb").each(function(){
 		 $(this).find("img.fotorama__img").each(function(){
    		  var media = medias[c];
              var mediaId = getValueFromXMLTag(media, 'media_id');
              $(this).attr("id",mediaId);
    	  });
 		c++;
 	 });
 	if(!checkUserresourcesHasid()){
 		setTimeout(function(){
 			checkUserresourcesId(medias);
 	    }, 1000);
 	}
}

/*function for sync tab image */
function imageChoosed(media_id){

    if (jQuery("a#" + media_id).parent('li').hasClass ('setchoosed')){
        jQuery("a#" + media_id).parent('li').removeClass ('setchoosed');
        jQuery("a#" + media_id).parent('li').find("img.selected-gallery").remove();
    }
    else {
        jQuery("a#" + media_id).parent('li').addClass ('setchoosed');
        jQuery("a#" + media_id).parent('li').append ('<img class="selected-gallery" src="/memreas/img/gallery-select.png">');
    }
    return false;
}

function checkReloadItem(itemName){
    if (reloadItems.length > 0){
        for (var i = 0;i < reloadItems.length;i++){
            if (itemName == reloadItems[i]){
                removeItem(reloadItems, itemName);
                return true;
            }
        }
        return false;
    }
    else return false;
}
function pushReloadItem(itemName){
    reloadItems[reloadItems.length] = itemName;
}

function pushStackAjax(stackAjaxName){
    var current_stack_length = stackAjaxInstance.length;
    stackAjaxInstance[current_stack_length] = stackAjaxName;
}
/*
*@ Function Scrollbar Secure
*@ Surely scrollbar element loaded and scroll loaded also
*/
function ajaxScrollbarElement(element_object){
    var jElement_object = $(element_object);
    jElement_object.mCustomScrollbar('update');
    if (!jElement_object.hasClass ('mCustomScrollbar'))
        jElement_object.mCustomScrollbar({ scrollButtons:{ enable:true }});
    if (!jElement_object.find ('.mCSB_scrollTools').is(':visible')){
        jElement_object.mCustomScrollbar('update');
        setTimeout (function(){ ajaxScrollbarElement(element_object); }, 1000);
    }
}

function getMediaUrl(element_object, mediatype){
    var photo_tags = ['media_url_web', 'main_media_url'];
    var video_tags = ['media_url_web', 'media_url_1080p', 'main_media_url'];

    switch (mediatype){
        case 'image':
            var search_element = photo_tags;
            break;
        case 'video':
            var search_element = video_tags;
            break;
        default : var search_element = photo_tags;
    }

    var found_link = '';

    var total_media_response = search_element.length;
    var found_link = '';
    for (var i = 0;i < total_media_response;i++){
        if ((element_object.innerHTML).indexOf(search_element[i]) >= 0){
            found_link = getValueFromXMLTag(element_object, search_element[i]);
            found_link = removeCdataCorrectLink(found_link);
        }

        if (found_link != '') break;
    }

    if (found_link == '')
        return '/memreas/img/small/1.jpg';
    else return found_link;
}

function removeCdataCorrectLink(media_link){
    media_link = media_link.replace('<!--[CDATA[["', "").replace('"]]]-->', "")
        .replace("<!--[CDATA[", "").replace("]]-->", "")
        .replace('["', "").replace('"]', "");
    if (media_link.indexOf("\\/") >= 0)
        media_link = media_link.split("\\/").join('/');

    return media_link;
}

function getMediaThumbnail(element_object, default_value){
    var media_tags = ['media_url_98x78', 'media_url_79x80', 'media_url_448x306', 'event_media_video_thum', 'media_url_web','main_media_url'];
    var total_media_response = media_tags.length;
    var found_link = '';
    for (var i = 0;i < total_media_response;i++){

        if ((element_object.innerHTML).indexOf(media_tags[i]) >= 0){
            found_link = getValueFromXMLTag(element_object, media_tags[i]);
            found_link = removeCdataCorrectLink(found_link);
            found_link = found_link.split(',');
            found_link = found_link[0];
            found_link = found_link.replace('"', '');
        }

        if (found_link != '') break;
    }

    if (found_link == '') found_link = default_value;
    return found_link;
}

//Check if image already exist
function image_exist(image_url, default_value){

}

//Notify functions
function jsuccess (str_msg){
    jSuccess(
        str_msg,
        {
            autoHide : true, // added in v2.0
            clickOverlay : false, // added in v2.0
            MinWidth : 250,
            TimeShown : 3000,
            ShowTimeEffect : 200,
            HideTimeEffect : 200,
            LongTrip :20,
            HorizontalPosition : 'center',
            VerticalPosition : 'top',
            ShowOverlay : true,
            ColorOverlay : '#FFF',
            OpacityOverlay : 0.3,
            onClosed : function(){},
            onCompleted : function(){}
    });
}
function jerror (str_msg){
    jError(
        str_msg,
        {
            autoHide : true, // added in v2.0
            clickOverlay : false, // added in v2.0
            MinWidth : 250,
            TimeShown : 5000,
            ShowTimeEffect : 200,
            HideTimeEffect : 200,
            LongTrip :20,
            HorizontalPosition : 'center',
            VerticalPosition : 'top',
            ShowOverlay : true,
            ColorOverlay : '#FFF',
            OpacityOverlay : 0.3,
            onClosed : function(){},
            onCompleted : function(){}
    });
}
function jconfirm(str_msg, confirm_func){
    jNotify(
        '<div class="notify-box"><p>' + str_msg + '</p><a href="javascript:;" class="btn" onclick="' + confirm_func + ';">OK</a>&nbsp;<a href="javascript:;" class="btn" onclick="$.jNotify._close();">Close</a></div>',
        {
            autoHide : false, // added in v2.0
            clickOverlay : true, // added in v2.0
            MinWidth : 250,
            TimeShown : 3000,
            ShowTimeEffect : 200,
            HideTimeEffect : 0,
            LongTrip :20,
            HorizontalPosition : 'center',
            VerticalPosition : 'top',
            ShowOverlay : true,
            ColorOverlay : '#FFF',
            OpacityOverlay : 0.3,
            onClosed : function(){},
            onCompleted : function(){}
        });
}
function logout(){
    var user_logged = $("input[name=user_id]").val();
    var params = [{tag: 'user_id', value: user_logged}];
    ajaxRequest('logout', params, function(response){
        window.location.href = "/";
    });
}

//Remove item from an array
function removeItem(array, item){
    for(var i in array){
        if(array[i]==item){
            array.splice(i,1);
            break;
        }
    }
}
function detectBrowser(){
    if(navigator.vendor != null && navigator.vendor.match(/Apple Computer, Inc./) && navigator.userAgent.match(/iPhone/i) || (navigator.userAgent.match(/iPod/i)))
    {
        return [{'ios':1},{'browser':'Ipod or Iphone'}];
    }
    else if (navigator.vendor != null && navigator.vendor.match(/Apple Computer, Inc./) && navigator.userAgent.match(/iPad/i))
    {
        return [{'ios':1},{'browser':'Ipad'}];
    }
    else if (navigator.vendor != null && navigator.vendor.match(/Apple Computer, Inc./) && navigator.userAgent.indexOf('Safari') != -1)
    {
        return [{'ios':1},{'browser':'Safari'}];
    }

    else if (navigator.vendor == null || navigator.vendor != null)
    {
        var isOpera = !!window.opera || navigator.userAgent.indexOf('Opera') >= 0;
        var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        var isChrome = !!window.chrome;                          // Chrome 1+
        var isIE = /*@cc_on!@*/false;                            // At least IE6

        if (isFirefox) return [{'ios':0},{'browser':'Firefox'}];
        if (isChrome) return [{'ios':0},{'browser':'Chrome'}];
        if (isSafari) return [{'ios':0},{'browser':'Safari'}];
        if (isSafari) return [{'ios':0},{'browser':'Opera'}];
        if (isIE) {return [{'ios':0},{'browser':'IE'}]};
    }
}

function detectHandheldIOSDevice(){
    if (userBrowser[0].ios == 1 && (userBrowser[1].browser == 'Ipod or Iphone' || userBrowser[1].browser == 'Ipad'))
        return true;
    else return false;
}

$(function(){

});

/*
* Enable / Disable input field (for ajax calling and prevent user typing)
* */
function disableInput(element){ $(element).attr('readonly', true); }
function enableInput(element){ $(element).removeAttr('readonly'); }

/*
* Akordeon control
* */
function activeAkordeon(elementClass, callback_func){
    var jActiveTab = $("." + elementClass);
    var jParentAkordeon = jActiveTab.parents('.parent-global-akordeon');

    //reset collapsed items
    jParentAkordeon.find(".akordeon-item").each(function(){
        if ($(this).hasClass('expanded'))
            $(this).removeClass('expanded');
        if (!$(this).hasClass('collapsed'))
            $(this).addClass('collapsed');
        $(this).find('.akordeon-icon').children('span').html("+");
    });
    var currentItemBodyHeight = jActiveTab.find('.akordeon-item-body').find(".akordeon-item-content").height();
    jParentAkordeon.find(".akordeon-item-body").css('height', 0);
    jActiveTab.find('.akordeon-icon').children('span').html("&ndash;");
    jActiveTab.removeClass('collapsed').addClass('expanded');
    jActiveTab.find(".akordeon-item-body").css('height', currentItemBodyHeight);
    updateAkordeonContent(jActiveTab);

    if (callback_func)
        callback_func();
}
function updateAkordeonContent(jActiveTab){
    var currentItemBodyHeight = jActiveTab.find('.akordeon-item-body').find(".akordeon-item-content").height() + 100;
    jActiveTab.find(".akordeon-item-body").css('height', currentItemBodyHeight);
}

/*Main tab navigation*/
function goHomeTab(){
    $("a[title=gallery]").trigger('click');
}
function goMoreTab(){
    $("a[title=more]").trigger('click');
}

/*Other*/
addLoading = function(element, typeLoading, additionClass){
    var jElement = $(element);
    if (additionClass != '') additionClass = ' ' + additionClass;
    jElement.append('<div class="overlay-bg' + additionClass + '"><div class="bg"></div><img src="/memreas/img/loading-line.gif" class="loading-small overlay-small-loading" /></div>');
    if (typeLoading == 'input'){
        var input_width = jElement.find('input').width();
        var input_height = jElement.find('input').height() + 5;
        var input_left_pos = (jElement.find('input').offset().left - jElement.offset().left);
        var input_top_pos = (jElement.find('input').offset().top - jElement.offset().top);

        jElement.find('.overlay-bg').css({'width':input_width, 'height':input_height, 'left':input_left_pos, 'top':input_top_pos}).fadeIn(500);
        jElement.find('input').attr('readonly', true);
    }
    else jElement.find('.overlay-bg').fadeIn(500);
}
removeLoading = function(element){
    var jElement = $(element);
    jElement.find('.overlay-bg').remove();
    jElement.find('input').removeAttr('readonly');
}

var buttonHandler = [];
disableButtons = function(elementBox){
    buttonHandler = [];
    var counter = 0;
    var jElement = $(elementBox);
    jElement.find('a.black_btn_skin').each(function(){
        buttonHandler[counter++] = $(this).attr('href');
        $(this).removeAttr('href').addClass('button-disabled');
    });
}

enableButtons = function(elementBox){
    var counter = 0;
    var jElement = $(elementBox);
    jElement.find('a.black_btn_skin').each(function(){
        $(this).attr('href', buttonHandler[counter++]).removeClass('button-disabled');
    });
}

function correctDateNumber(date_number){
    if (parseInt(date_number) < 10)
        return '0' + date_number.toString();
    else return date_number;
}

/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

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
    else return '';
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
    }
    else if (typeof elements.length != "undefined") {
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
    }
    else if (typeof elements.length != "undefined") {
        for (i = 0; i < elements.length; i++) {
            id = '#' + elements[i];
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
    return ($('#' + id)[0].checked ? 1 : 0)
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
function randomShowAds(){
	var rightadarr = new Array();var bottomadarr = new Array();
	rightadarr[0] = {link:"#", img:"/memreas/img/ads/DepartmentStoreSale banner ads 1.png"};
	rightadarr[1] = {link:"#", img:"/memreas/img/ads/ElectronicsStoreSale banner ads 1.png"};
	rightadarr[2] = {link:"#", img:"/memreas/img/ads/Hotel banner ads 1.png"};
	rightadarr[3] = {link:"#", img:"/memreas/img/ads/Hotel banner ads 2.png"};
	rightadarr[4] = {link:"#", img:"/memreas/img/ads/restaurant banner ads 1.png"};
	rightadarr[5] =  {link:"#", img:"/memreas/img/ads/restaurant banner ads 2.png"};
	
	/*bottomad*/
	bottomadarr[0] = {link:"#", img:"/memreas/img/ads/amen+.png"};
	bottomadarr[1] = {link:"#", img:"/memreas/img/ads/ElectronicsStoreSale banner ads.png"};
	bottomadarr[2] = {link:"#", img:"/memreas/img/ads/Hotel banner ads.png"};
	bottomadarr[3] = {link:"#", img:"/memreas/img/ads/memreas login admin.png"};
	bottomadarr[4] = {link:"#", img:"/memreas/img/ads/restaurant banner ads.png"};
	if($(".right-ads-section").length){
		$(".right-ads-section").each(function(){
			var rad1 = rightadarr[Math.floor(Math.random() * rightadarr.length)];
			var rad2 = rightadarr[Math.floor(Math.random() * rightadarr.length)];
			var radhtml = '<div class="adbox"><a href="'+rad1.link+'"><img src="'+rad1.img+'"/></a></div>';
			radhtml+='<div class="adbox"><a href="'+rad2.link+'"><img src="'+rad2.img+'"/></a></div>';
			$(this).fadeOut();
			$(this).empty().append(radhtml);
			$(this).fadeIn();
		});
		
	}
	if($(".bottom-ads-secion").length){
		$(".bottom-ads-secion").each(function(){
			var bad1 = bottomadarr[Math.floor(Math.random() * bottomadarr.length)];
			var badhtml = '<div class="adbox"><a href="'+bad1.link+'"><img src="'+bad1.img+'"/></a></div>';
			$(this).fadeOut();
			$(this).empty().append(badhtml);
			$(this).fadeIn();
		});
	}
	setTimeout (function(){ randomShowAds(); }, 9000);
}
function autoResizeSlideshow(){
	if($("#tab-content").length){
		var wheight = $("#tab-content").height();
		if($(".fotorama__stage").length){
			var nheight = $(".fotorama__stage").height();
			var rheight = parseInt(wheight) - 68;
			if(nheight < rheight){
				$(".fotorama__stage").height(rheight);
			}
			
		}
	}
	setTimeout (function(){ autoResizeSlideshow(); }, 3000);
}
/*Pham */
$(document).ready(function () {
	randomShowAds();
	autoResizeSlideshow();
	if (($.browser.mozilla==true && $.browser.version <= "11.0") || ($.browser.msie && $.browser.version <= 6) || ($.browser.msie && $.browser.version > 6)){
		$( "#form-user-login" ).find("input").each(function(){
			$(this).prop( "disabled", true );
		});
		$( "#register" ).find("input").each(function(){
			$(this).prop( "disabled", true );
		});
		$( "#frm-profile-pic" ).find("input").each(function(){
			$(this).prop( "disabled", true );
		});
		$("a.forgot-password").remove();
		jerror("Memreas is optimized for the latest versions of Chrome, Safari, and Firefox");
	}
        
	if($('#avpw_controlpanel_textwithfont').length){
		$('#avpw_controlpanel_textwithfont').find("div.avpw_inset_color_widget").each(function(){
			$(this).append("<div class='avpw_inset_color_widget_label'>Color picker</div>");
		});
	}
	if( $('#main-tab').length){
		var length = $('#main-tab').offset().top;
	    var length2 = $('.right-ads').offset().top;
	    $(window).scroll(function () {
	    	var wWidth = $(window).width();
	    	if(wWidth > 768){
	    		var height = $('#main-tab').height() + 'px';
		        var scroll = $(this).scrollTop();
		        if(scroll >= length){
		        	$('#main-tab').css({
		                'position': 'fixed',
		                'top': '0',
		                'left': '0',
		                'height': height
		            });
		        } else{
		        	
		        	$('#main-tab').css({
		                'position': 'relative',
		                'top': '0',
		                'height': height
		            });
		        }
		        var rightadw = parseInt($(window).width())*0.9/5;
		        if(scroll >= 80){
		        	$('.right-ads').css({
		                'position': 'fixed',
		                'top': '0',
		                'bottom': '0',
		                'right':'3%',
		                'height': height,
		                'width' : rightadw
		            });
		        }else{
		        	$('.right-ads').css({
		                'position': 'relative',
		                'top': '29px',
		                'right':'0',
		                'height': height,
		                'width' : '20%'
		            });
		        }
	    	}
	    });
	}
    

});


