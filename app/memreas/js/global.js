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

    var jElement_object = $(element_object);
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
        found_link = jElement_object.filter (search_element[i]).html();
        console.log(found_link);
        if (found_link != '' || typeof (found_link) != 'undefined' || found_link.indexOf ('undefined') < 0){
            found_link = found_link.replace('<!--[CDATA[["', "").replace('"]]]-->', "")
                .replace("<!--[CDATA[", "").replace("]]-->", "");
            if (found_link.indexOf("\\/") >= 0)
                found_link = found_link.split("\\/").join('/');
            break;
        }
    }

    if (found_link == '' || found_link.indexOf ('undefined') >= 0)
        return '/memreas/img/small/1.jpg';
    else return found_link;
}

function removeCdataCorrectLink(media_link){
    media_link = media_link.replace('<!--[CDATA[["', "").replace('"]]]-->', "")
        .replace("<!--[CDATA[", "").replace("]]-->", "");
    if (media_link.indexOf("\\/") >= 0)
        media_link = media_link.split("\\/").join('/');

    return media_link;
}

function getMediaThumbnail(element_object, default_value){
    var jElement_object = $(element_object);
    var media_response = ['media_url_98x78', 'media_url_79x80', 'media_url_448x306', 'event_media_video_thum', 'media_url_web','main_media_url'];
    var total_media_response = media_response.length;
    var found_link = '';
    for (var i = 0;i < total_media_response;i++){
        found_link = jElement_object.filter (media_response[i]).html();
        found_link = found_link.replace('<!--[CDATA[["', "").replace('"]]]-->', "");
        found_link = found_link.split("\\/").join('/');
        if (found_link != '') break;
    }
    var media_type = jElement_object.filter('type').html();
    if (found_link == '' || found_link.indexOf ('undefined') >= 0 || (media_type == 'video' && (i == total_media_response - 1))) found_link = default_value;
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
        if (isIE) return [{'ios':0},{'browser':'IE'}];
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
        $(this).find('.akordeon-icon').children('span').html('+');
    });
    var currentItemBodyHeight = jActiveTab.find('.akordeon-item-body').find(".akordeon-item-content").height();
    jParentAkordeon.find(".akordeon-item-body").css('height', 0);
    jActiveTab.find('.akordeon-icon').children('span').html('–');
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