/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
/*
 * Server side
 */
var userObject = [];
var notificationHeaderObject = new Object(); // This variable stored header
// notification and compare with
// a new for checking
function getUserDetail() {
    if ($("input[name=user_id]").val() == "")
        document.location.href = "/index";
    else {
        var params = [{
                tag: 'user_id',
                value: $("input[name=user_id]").val()
            }];
        ajaxRequest(
                'getuserdetails',
                params,
                function (xml_response) {
                    if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
                        var useremail = getValueFromXMLTag(xml_response,
                                'email');
                        var username = getValueFromXMLTag(xml_response,
                                'username');
                        $("input[name=username]").val(username);
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

                        if (gender == 'male')
                            $("#gender-male").attr("checked", "checked");
                        else {
                            if (gender == 'female')
                                $("#gender-female").attr("checked", "checked");
                        }

                        $("input[name=account_email]").val(useremail);
                        var plan = getValueFromXMLTag(xml_response, 'plan');

                        // Assign user detail into local object
                        userObject.email = useremail;
                        userObject.username = username;
                        userObject.userprofile = userprofile;
                        userObject.alternate_email = alternate_email;
                        userObject.gender = gender;
                        userObject.dob = dob;
                        userObject.plan = plan;
                        userObject.plan_name = getValueFromXMLTag(xml_response,
                                'plan_name');
                        userObject.type = getValueFromXMLTag(xml_response,
                                'account_type');

                        $(".share-account-type").html(userObject.type);
                        $(".share-account-plan").html(userObject.plan);

                        if (userObject.plan != 'FREE')
                            $(".share-register-plan").remove();

                        if ((userObject.type).indexOf('seller') >= 0
                                || (userObject.type).indexOf('buyer') >= 0) {
                            userObject.buyer_balance = getValueFromXMLTag(
                                    xml_response, 'buyer_balance');
                            userObject.seller_balance = getValueFromXMLTag(
                                    xml_response, 'seller_balance');
                        } else {
                            userObject.buyer_balance = 0;
                            userObject.seller_balance = 0;
                        }

                        // Update user detail on share page
                        $(".morepage-account-type").html(userObject.type);
                        $(".morepage-account-buyerbalance").html(
                                "$" + userObject.buyer_balance);
                        $(".morepage-account-sellerbalance").html(
                                "$" + userObject.seller_balance);

                        if (ENABLE_SELL_MEDIA) {
                            // Seller able to sell media
                            if (userObject.type != 'Free user'
                                    && ((userObject.type).indexOf('seller') >= 0)) {
                                $(".share-register-seller").remove();
                            }
                            var checkSellMedia = shareCheckSellMedia();
                            if (checkSellMedia) {
                                $(".share-media-price .italic-description")
                                        .html(
                                                'Check this option if you want to sell this event');
                                $("#lbl-sellmedia").show();
                            } else
                                $("#lbl-sellmedia").remove();
                        }
                    } else
                        jerror(getValueFromXMLTag(xml_response, 'messsage'));
                }, 'undefined', true);
    }
}

$(function () {

    $("a[title=gallery]").click(function () {
        $("#gallery #tabs a[title=tab1]").click();
    });

    $("#gallery #tabs a[title=tab1]").click(function () {
        if (checkReloadItem('listallmedia')) {
            $.fetch_server_media();
        }
    });

    $(".location-tab")
            .click(
                    function () {
                        if (!($(".galleries-location").parent(
                                ".elastislide-carousel").length > 0))
                            $('.galleries-location').elastislide();
                        gallery_showGoogleMap("gallery-location");
                        // $('.galleries-location').find('li:eq(0)
                        // img').trigger("click");
                    });

});

var checkHasImage = false;
/* Load server media */
jQuery.fetch_server_media = function () {
    var verticalHeight = window.innerHeight;
    var HorizontalWidth=window.innerWidth;
    
    $(".user-resources").remove();
    // $(".preload-files .pics").empty().show();
   
      //if (!document.documentElement.classList.contains('noads')) {
        if (verticalHeight <= 690) {
            $("#tab-content #tab1")
                    .append(
                            '<div class="user-resources" data-click="false" data-swipe="true"  data-max-width="100%" data-allow-full-screen="true"  data-height="100%" data-nav="thumbs"></div>');
        } else if (verticalHeight >= 691 || verticalHeight <= 750) {
            $("#tab-content #tab1")
                    .append(
                            '<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/725" data-max-width="100%" data-height="100%" data-allow-full-screen="true"  data-nav="thumbs"></div>');
        } else if (window.innerWidth > 1359 && verticalHeight > 800) {
            $("#tab-content #tab1")
                    .append(
                            '<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/725" data-max-width="100%" data-height="100%" data-allow-full-screen="true"  data-nav="thumbs"></div>');
        } else {
            $("#tab-content #tab1")
                    .append(
                            '<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/725" data-max-width="100%" data-height="100%" data-allow-full-screen="true"  data-nav="thumbs"></div>');
        }
    //} 
    
//    else {
//        $("#tab-content #tab1")
//                .append(
//                        '<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/725" data-width="100%" data-height="80%" data-allow-full-screen="true"  data-nav="thumbs"></div>');
//    }
    $(".preload-files").hide();
    $(".user-resources fotorama").hide();

    $(".edit-area-scroll, .aviary-thumbs, .galleries-location").empty();
    $(".user-resources, .scrollClass .mCSB_container, .sync .mCSB_container")
            .html('');
    $(".user-resources").hide();
    ajaxRequest(
            'listallmedia',
            [{
                    tag: 'event_id',
                    value: ''
                }, {
                    tag: 'user_id',
                    value: user_id
                }, {
                    tag: 'device_id',
                    value: ''
                }, {
                    tag: 'rtmp',
                    value: 'true'
                }, {
                    tag: 'limit',
                    value: '200'
                }, {
                    tag: 'page',
                    value: '1'
                }, {
                    tag: 'metadata',
                    value: '1'
                }],
            function (response) {
                if (getValueFromXMLTag(response, 'status') == "Success") {

                    var medias = getSubXMLFromTag(response, 'media');
                   
                    $(
                            ".user-resources, .scrollClass .mCSB_container, .sync-content .scrollClass")
                            .html('');
                    var count_media = medias.length;

                    for (var json_key = 0; json_key < count_media; json_key++) {
                        var media = medias[json_key];
                        var _media_type = getValueFromXMLTag(media, 'type');

                        var _media_url = '';
                        var _media_url_1080p = '';
                        var _media_url_web = '';
                        var _media_thumbnail = ''
                        // var main_media_url='';
                        if (_media_type == 'image') {
                            _media_url = getMediaUrl(media, _media_type);
                            // main_media_url=getMediaUrl(media,main_media_url);
                        } else if (_media_type == 'video') {
                            _media_url_hls = getValueFromXMLTag(media,
                                    'media_url_hls');
                            _media_url_hls = removeCdataCorrectLink(_media_url_hls);
                            _media_url_1080p = getValueFromXMLTag(media,
                                    'media_url_1080p');
                            _media_url_1080p = removeCdataCorrectLink(_media_url_1080p);
                            _media_url_web = getValueFromXMLTag(media,
                                    'media_url_web');
                            _media_url_web = removeCdataCorrectLink(_media_url_web);
                            _media_thumbnail = getValueFromXMLTag(media,
                                    'media_url_98x78');
                            _media_thumbnail = JSON
                                    .parse(removeCdata(_media_thumbnail));
                            _media_thumbnail = _media_thumbnail[0];
                        }

                        var mediaId = getValueFromXMLTag(media, 'media_id');
                        // Build video thumbnail
                        if (_media_type == 'video') {
                            //
                            // Video section
                            //

                            // var metadata =
                            // getValueFromXMLTag(medias[json_key],
                            // 'metadata');

                            var media_transcode_status = getValueFromXMLTag(
                                    media, 'media_transcode_status');
                            // if (typeof (metadata) != 'undefined') {
                            if (media_transcode_status == 'success') {

                                if (media_transcode_status == 'success') {
                                    // Get screen area display height
                                    var width = parseInt($("#tab-content")
                                            .width());
                                    var height = parseInt($("#tab-content")
                                            .height()) - 100;

                                    /**
                                     * build video tag
                                     */
                                    var source = '';
                                    var edit_source = '';
                                    var preload_source = '';
                                    // .user-resources
                                    //
                                    // video tag control
                                    //
                                    /*
                                     * source += '<video controls="" poster="' +
                                     * _media_thumbnail + '" width="' + width + '"
                                     * height="' + height + ' preload="none"
                                     * autoplay="">';
                                     */
                                    // source += '<video controls="" poster="'
                                    // + _media_thumbnail + '" width="600"
                                    // height="' + height
                                    // + ' preload="auto" autoplay="">';
                                    // if ((userBrowser[0].ios)
                                    // || (userBrowser[1].browser == "Safari"))
                                    // {
                                    // source += '<source src="'
                                    // + _media_url_hls
                                    // + '" type="video/webm">';
                                    // console.log("_media_url_hls-> " +
                                    // _media_url_hls);
                                    // } else {
                                    // source += '<source src="'
                                    // + _media_url_web
                                    // + '" type="video/mp4">';
                                    // }
                                    // source += '</video>';
                                    if ((userBrowser[0].ios)
                                            || (userBrowser[1].browser == "Safari")) {
                                        // source += '<source src="'
                                        // + _media_url_hls
                                        // + '" type="video/webm">';
                                        // console.log("_media_url_hls-> " +
                                        // _media_url_hls);
                                        
                                        source += '<video controls="" poster="'
                                         + _media_thumbnail + '"  style="width:100%; height:400px;" preload="none" autoplay="">';
                                     source += '<source src="'
                                         + _media_url_hls
                                         + '" type="application/x-mpegURL">';
                                        									
                                         source += '</video>';
                                        
                                        
                                        
                                        /*source += ' <a href="'
                                                + _media_url_web
                                                + '" data-img="'
                                                + _media_thumbnail
                                                + '"  data-video="true" ><img src="'
                                                + _media_thumbnail + '"></a>';*/
                                    } else {

                                        source += ' <a href="'
                                                + _media_url_web
                                                + '" data-img="'
                                                + _media_thumbnail
                                                + '"  data-video="true" ><img src="'
                                                + _media_thumbnail + '"></a>';

                                      /*   source += '<video controls="" poster="'
                                         + _media_thumbnail + '" width="'
                                         + width + '" height="' + height
                                         + '" preload="auto" autoplay="">';
                                        									
                                         source += '<source src="'
                                         + _media_url_web
                                         + '" type="video/mp4">';*/
                                        									
                                         source += '</video>';
                                    }

                                    $(".user-resources").append(source);
                                    // edit-area-scroll
                                    edit_source += '<li class="video-media">';
                                    edit_source += '<a class="video-resource image-sync" id="'
                                            + mediaId
                                            + '" onclick="return imageChoosed(this.id);" href="'
                                            + _media_thumbnail
                                            + '">'
                                            + '<img src="'
                                            + _media_thumbnail
                                            + '"/>'
                                            + '<img class="overlay-videoimg" src="/memreas/img/video-overlay.png" />'
                                            + '</a><img src="/memreas/img/gallery-select.png"></li>';
                                    $(".edit-area-scroll").append(edit_source);
                                    // .preload-files.pics
                                    preload_source += '<li class="video-media"><img src="'
                                            + _media_thumbnail + '"/></li>';
                                    $(".preload-files.pics").append(
                                            preload_source);
                                } else {
                                    $(".user-resources")
                                            .append(
                                                    '<img src="/memreas/img/TrascodingIcon.gif" />');
                                    $(".preload-files .pics")
                                            .append(
                                                    '<li class="video-media"><img src="/memreas/img/transcode-icon.png"/></li>');
                                    $(".edit-area-scroll")
                                            .append(
                                                    '<li class="video-media"><a class="video-resource image-sync" id="'
                                                    + mediaId
                                                    + '" onclick="return imageChoosed(this.id);" href="/memreas/img/transcode-icon.png"><img src="/memreas/img/transcode-icon.png"/></a><img src="/memreas/img/gallery-select.png"></li>');
                                }
                            }
                        } else {
                            //
                            // Image section
                            // alert(_media_url);
                            console.log('Media URL:: ' + _media_url);
//                            $('.fotorama__stage__frame fotorama__loaded fotorama__loaded--img').find('img').removeAttr('style');
//                            $('.fotorama__stage__frame fotorama__loaded fotorama__loaded--img').find('img').attr('style','width:100% !important');
                            $(".user-resources")
                                    .append(
                                            '<img src="'
                                            + _media_url
                                            + '" />');
                            $(".edit-area-scroll")
                                    .append(
                                            '<li><a class="image-sync" id="'
                                            + mediaId
                                            + '" onclick="return imageChoosed(this.id);" href="'
                                            + _media_url
                                            + '"><img src="'
                                            + _media_url
                                            + '"/></a></li>');
                            $(".preload-files .pics").append(
                                    '<li><img src="' + _media_url + '"/></li>');
                            $(".aviary-thumbs")
                                    .append(
                                            '<li><img id="edit'
                                            + mediaId
                                            + '" src="'
                                            + _media_url
                                            + '" onclick="openEditMedia(this.id, \''
                                            + _media_url
                                            + '\');"/></li>');
                            $(".galleries-location").append(
                                    '<li><img id="location' + mediaId
                                    + '" class="img-gallery" src="'
                                    + _media_url + '" /></li>');
                            checkHasImage = true;
                        }
                    }

                    setTimeout(function () {
                        $(".preload-files").hide();
                        $(".user-resources").fotorama({
                            width: '800',
                            height: '350',
                            'max-width': '100%'

                        }).fadeIn(500);

                        if (!$(".edit-area-scroll")
                                .hasClass('mCustomScrollbar'))
                            $(".edit-area-scroll").mCustomScrollbar({
                                scrollButtons: {
                                    enable: true
                                }
                            });
                        $(".edit-area-scroll").mCustomScrollbar('update');

                        if (!$(".edit-areamedia-scroll").hasClass(
                                'mCustomScrollbar'))
                            $(".edit-areamedia-scroll").mCustomScrollbar({
                                scrollButtons: {
                                    enable: true
                                }
                            });
                        $(".edit-areamedia-scroll").mCustomScrollbar('update');

                        // Fetch user's notification header
                        getUserDetail();
                        getUserNotificationsHeader();
                    }, GALLERYDELAYTIME);
                    setTimeout(function () {
                        checkUserresourcesId(medias);
                    }, GALLERYDELAYTIME);
                    $(".swipebox").swipebox();

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
                    getUserDetail();
                    getUserNotificationsHeader();
                }
                return true;
            });
}

function getUserNotificationsHeader() {
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
            [{
                    tag: 'receiver_uid',
                    value: user_id
                }],
            function (ret_xml) {
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
                                if (['ADD_MEDIA', 'ADD_COMMENT',
                                    'ADD_FRIEND_TO_EVENT_RESPONSE']
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
                                scrollButtons: {
                                    enable: true
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

                setTimeout(function () {
                    getUserNotificationsHeader()
                }, LISTNOTIFICATIONSPOLLTIME);
            }, 'undefined', true);
    // }// end if hasFocus
}

function updateNotificationHeader(notification_id, update_status) {
    switch (update_status) {
        case 'accept':
            var message_feedback = $(".notification-popup-message").val();
            var params = [{
                    tag: 'notification',
                    value: [{
                            tag: 'notification_id',
                            value: notification_id
                        }, {
                            tag: 'status',
                            value: '1'
                        }, {
                            tag: 'message',
                            value: message_feedback
                        }]
                }];
            disablePopup("popupGiveMessage");
            ajaxRequest('updatenotification', params, function (response) {
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
            var params = [{
                    tag: 'notification',
                    value: [{
                            tag: 'notification_id',
                            value: notification_id
                        }, {
                            tag: 'status',
                            value: '2'
                        }]
                }];

            addLoading("#notification-header-" + notification_id
                    + " .notifications-all", 'div', 'notification-header-loading');
            ajaxRequest('updatenotification', params, function (response) {
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
    $("#accept-notification").attr(
            'onclick',
            'updateNotificationHeader(\'' + notification_id
            + '\', \'accept\');')
    popup("popupGiveMessage");
}

function gotoEventDetail(eventId, notification_id) {

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
            [{
                    tag: 'event_id',
                    value: eventId
                }, {
                    tag: 'user_id',
                    value: userId
                }, {
                    tag: 'device_id',
                    value: device_id
                }, {
                    tag: 'limit',
                    value: media_limit_count
                }, {
                    tag: 'page',
                    value: media_page_index
                }],
            function (response) {

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

                var checkCommentLoaded = setInterval(function () {

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
    ajaxRequest('geteventcount', [{
            tag: 'event_id',
            value: eventdetail_id
        }], function (response) {
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
    if (!($(".edit-area").find(".setchoosed").length > 0)) {
        jerror('There is no media selected');
        return false;
    }
    if (!confirmed) {
        // Confirm to delete
        jNotify(
                '<div class="notify-box"><p>Are you sure want to delete them?</p><a href="javascript:;" class="btn" onclick="deleteFiles(true);">OK</a>&nbsp;<a href="javascript:;" class="btn" onclick="$.jNotify._close();">Close</a></div>',
                {
                    autoHide: false, // added in v2.0
                    clickOverlay: true, // added in v2.0
                    MinWidth: 250,
                    TimeShown: 3000,
                    ShowTimeEffect: 200,
                    HideTimeEffect: 0,
                    LongTrip: 20,
                    HorizontalPosition: 'center',
                    VerticalPosition: 'top',
                    ShowOverlay: true,
                    ColorOverlay: '#FFF',
                    OpacityOverlay: 0.3,
                    onClosed: function () { // added in v2.0

                    },
                    onCompleted: function () { // added in v2.0

                    }
                });
    }
    if (confirmed) {
        $.jNotify._close();
        disableButtons('.edit-area');
        // Store data to javascript
        $(".edit-area a").each(function () {
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
                        function () {
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
