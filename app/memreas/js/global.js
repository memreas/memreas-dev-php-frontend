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

/*
*@ Function Scrollbar Secure
*@ Surely scrollbar element loaded and scroll loaded also
*/
function ajaxScrollbarElement(element_object){
    var jelement_object = $(element_object);
    jelement_object.mCustomScrollbar('update');
    if (!jelement_object.hasClass ('mCustomScrollbar'))
        jelement_object.mCustomScrollbar({ scrollButtons:{ enable:true }});
    if (!jelement_object.find ('.mCSB_scrollTools').is(':visible')){
        jelement_object.mCustomScrollbar('update');
        setTimeout (function(){ ajaxScrollbarElement(element_object); }, 1000);
    }
}
function getMediaThumbnail(element_object, default_value){
    jelement_object = $(element_object);
    var media_response = new Array('media_url_98x78', 'media_url_79x80', 'media_url_448x306', 'event_media_video_thum', 'main_media_url');
    var total_media_response = media_response.length;
    var found_link = '';
    for (i = 0;i < total_media_response;i++){
        found_link = jelement_object.filter (media_response[i]).html();
        found_link = found_link.replace("<!--[CDATA[", "").replace("]]-->", "");
        if (found_link != '') break;
    }
    media_type = jelement_object.filter('type').html();
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
            onClosed : function(){ // added in v2.0

            },
            onCompleted : function(){ // added in v2.0

            }
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
    $(window).bind('orientationchange resize', function(event){
       //Update lock orientation script here
    });
     /*
    //Label click unclick
    $(".css-label").click(function(){
        var checkedLabel = $(this).css('background');
        var jCheckbox = $(this).prev('input[type=checkbox]:eq(0)');
        if (jCheckbox.length > 0){
            var jElementid = $("#" + jCheckbox.attr('id'));
            if (checkedLabel.indexOf('check-box.png') >= 0){
                alert(1);
                jElementid.attr('checked', 'checked');
                $(this).css('background', 'url(/memreas/img/check.png) no-repeat')
            }
            else {
                alert(2);
                jElementid.removeAtt('checked');
                $(this).css('background', 'url(/memreas/img/check-box.png) no-repeat');
            }
        }
    });
    */
});

/*
* Akordeon control
* */
function activeAkordeon(elementClass, callback_func){
    var jActiveTab = $("." + elementClass);
    var jAkordeonSubscription = $("#buttons7-moretab");
    //reset collapsed items
    jAkordeonSubscription.find(".akordeon-item").each(function(){
        if ($(this).hasClass('expanded'))
            $(this).removeClass('expanded');
        if (!$(this).hasClass('collapsed'))
            $(this).addClass('collapsed');
        $(this).find('.akordeon-icon').children('span').html('+');
    });
    var currentItemBodyHeight = jActiveTab.find('.akordeon-item-body').find(".akordeon-item-content").height();
    jAkordeonSubscription.find(".akordeon-item-body").css('height', 0);
    jActiveTab.find('.akordeon-icon').children('span').html('–');
    jActiveTab.removeClass('collapsed').addClass('expanded');
    jActiveTab.find(".akordeon-item-body").css('height', currentItemBodyHeight);
    updateAkordeonContent("." + elementClass);

    if (callback_func)
        callback_func();
}
function updateAkordeonContent(elementClass){
    var jActiveTab = $(elementClass);
    var currentItemBodyHeight = jActiveTab.find('.akordeon-item-body').find(".akordeon-item-content").height();
    jActiveTab.find(".akordeon-item-body").css('height', currentItemBodyHeight);
}