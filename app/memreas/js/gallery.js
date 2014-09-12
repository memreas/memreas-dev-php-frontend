/*
* Server side
*/
var notificationHeaderObject = new Object(); //This variable stored header notification and compare with a new for checking

function getUserDetail(){
    if ($("input[name=user_id]").val() == "")
        document.location.href = "/index";
    else{
        var params = [{tag: 'user_id', value: $("input[name=user_id]").val()}];
        ajaxRequest('getuserdetails', params, function(xml_response){
            if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
                var useremail = getValueFromXMLTag(xml_response, 'email');
                var username = getValueFromXMLTag(xml_response, 'username');
                $("input[name=username]").val(username);
                var userprofile = getValueFromXMLTag(xml_response, 'profile');
                var alternate_email = getValueFromXMLTag(xml_response, 'alternate_email');
                var gender = getValueFromXMLTag(xml_response, 'gender');
                var dob = getValueFromXMLTag(xml_response, 'dob');
                var username_length = username.length;
                if (username_length > 10){
                    username = username.substring(0, 7) + '...';
                }
                $("header").find(".pro-name").html(username);
                $("#setting-username").html(getValueFromXMLTag(xml_response, 'username'));
                if (userprofile != ''){
                    $("header").find("#profile_picture").attr('src', userprofile);
                    $("#setting-userprofile img").attr('src', userprofile);
                }
                $("input[name=account_email]").val(useremail);
                $("input[name=account_alternate_email]").val(alternate_email);
                $("input[name=dob]").val(dob);

                if (gender == 'male')
                    $("#gender-male").attr("checked", "checked");
                else{
                    if (gender == 'female') $("#gender-female").attr("checked", "checked");
                }

                $("input[name=account_email]").val(useremail);
            }
            else jerror (getValueFromXMLTag(xml_response, 'messsage'));
        }, 'undefined', true);
    }
}

$(function(){

    $("a[title=gallery]").click(function(){ $("#gallery #tabs a[title=tab1]").click(); });

    $("#gallery #tabs a[title=tab1]").click (function(){
        if (checkReloadItem('listallmedia')){
            $.fetch_server_media();
        }
    });

    $(".aviary-tab").click(function(){
        if (detectHandheldIOSDevice())
            aviarySpace('get');
        if (!($(".aviary-thumbs").parent(".elastislide-carousel").length > 0))
            $('.aviary-thumbs').elastislide({orientation : 'vertical', minItems: 3});
        $('.aviary-thumbs').find('li:eq(0) img').trigger("click");
    });

    $(".location-tab").click(function(){
        if (!($(".galleries-location").parent(".elastislide-carousel").length > 0))
            $('.galleries-location').elastislide();
        gallery_showGoogleMap("gallery-location");
        //$('.galleries-location').find('li:eq(0) img').trigger("click");
    });

    //Return space for ads area
    if (detectHandheldIOSDevice()){
        $("#gallery").find("#tabs").find("a").not(".aviary-tab").click(function(){ aviarySpace('return'); });
        $("#main-tab").find("a").click(function(){ aviarySpace('return'); });
    }

});

var checkHasImage = false;
/*Load server media*/
jQuery.fetch_server_media = function (){
    var verticalHeight = window.innerHeight;
    $(".user-resources").remove();
    // Khan Changes
    if(verticalHeight <= 690){
        $("#tab-content #tab1").append('<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/725" data-max-width="100%" data-height="50%" data-allow-full-screen="true"  data-nav="thumbs"></div>');
    }
    else if(verticalHeight >= 691 || verticalHeight  <= 750){
        $("#tab-content #tab1").append('<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/725" data-max-width="100%" data-height="53%" data-allow-full-screen="true"  data-nav="thumbs"></div>');
    }
    else if(window.innerWidth > 1359 && verticalHeight > 800){
        $("#tab-content #tab1").append('<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/725" data-max-width="100%" data-height="55%" data-allow-full-screen="true"  data-nav="thumbs"></div>');
    } else {
        $("#tab-content #tab1").append('<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/725" data-max-width="100%" data-allow-full-screen="true"  data-nav="thumbs"></div>');
    }
    $(".edit-area-scroll, .aviary-thumbs, .galleries-location").empty();
    $(".user-resources, .scrollClass .mCSB_container, .sync .mCSB_container").html('');

    ajaxRequest('listallmedia',
        [
            {tag: 'event_id', value: ''},
            {tag: 'user_id', value: user_id},
            {tag: 'device_id', value : ''},
            {tag: 'rtmp', value : 'true'},
            {tag: 'limit', value: '200'},
            {tag: 'page', value: '1'},
            {tag: 'metadata', value: '1'}
        ], function (response){
            if (getValueFromXMLTag(response, 'status') == "Success") {

                var medias = getSubXMLFromTag(response, 'media');
                $(".user-resources, .scrollClass .mCSB_container, .sync-content .scrollClass").html('');
                var count_media = medias.length;

                for (var json_key = 0;json_key < count_media;json_key++){
                    var media = medias[json_key];
                    var _media_type = getValueFromXMLTag(media, 'type');
                    var _media_url = getMediaUrl(media, _media_type);

                    var mediaId = $(media).filter ('media_id').html();

                    //Build video thumbnail
                    if (_media_type == 'video'){

                        var metadata = getValueFromXMLTag(medias[json_key], 'metadata');

                        if (typeof (metadata) != 'undefined'){

                            metadata = removeCdataCorrectLink(metadata);

                            metadata = JSON.parse(metadata);
                            var transcode_progress = metadata.S3_files.transcode_progress;

                            //Check if web transcode is completed or not
                            var web_transcoded = false;
                            if (typeof (transcode_progress) != 'undefined'){
                                for (var i = 0;i < transcode_progress.length;i++){
                                    if (transcode_progress[i] == 'transcode_web_completed'){
                                        web_transcoded = true;
                                        break;
                                    }
                                }
                            }

                            if (web_transcoded){

                                //Ignore if has no enough info or media is corrupted
                                if (typeof (_media_url) != 'undefined'){
                                    var mediaThumbnail = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                                    $.post('/index/buildvideocache', {video_url:_media_url, thumbnail:mediaThumbnail, media_id:mediaId, hls_media:_media_url, mp4_media:_media_url}, function(response_data){
                                        response_data = JSON.parse (response_data);
                                        $(".user-resources").append('<a data-video="true" href="/memreas/js/jwplayer/jwplayer_cache/' + response_data.video_link + '"><img src="' + response_data.thumbnail + '"/></a>');
                                        $(".edit-area-scroll").append ('<li class="video-media"><a class="video-resource image-sync" id="' + response_data.media_id + '" onclick="return imageChoosed(this.id);" href="' + response_data.thumbnail + '"><img src="' + response_data.thumbnail + '"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a><img src="/memreas/img/gallery-select.png"></li>');
                                    });
                                }
                                else $(".edit-area-scroll").append ('<li class="video-media"><a class="video-resource image-sync" id="' + mediaId + '" onclick="return imageChoosed(this.id);" href="/memreas/img/large-pic-1.jpg"><img src="/memreas/img/large-pic-1.jpg"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a><img src="/memreas/img/gallery-select.png"></li>');
                            }
                            else{
                                $(".edit-area-scroll").append ('<li class="video-media"><a class="video-resource image-sync" id="' + mediaId + '" onclick="return imageChoosed(this.id);" href="/memreas/img/transcode-icon.png"><img src="/memreas/img/transcode-icon.png"/></a><img src="/memreas/img/gallery-select.png"></li>');
                            }
                        }
                    }
                    else {
                        $(".user-resources").append('<img src="' + _media_url + '"/>');
                        $(".edit-area-scroll").append ('<li><a class="image-sync" id="' + mediaId + '" onclick="return imageChoosed(this.id);" href="' + _media_url + '"><img src="' + _media_url + '"/></a></li>');
                        $(".aviary-thumbs").append('<li><img id="edit' + mediaId + '" src="' + _media_url + '" onclick="openEditMedia(this.id, \'' + _media_url + '\');"/></li>');
                        $(".galleries-location").append('<li><img id="location' + mediaId + '" class="img-gallery" src="' + _media_url + '" /></li>');
                        checkHasImage = true;
                    }
                  }

                  setTimeout(function(){
                      $(".user-resources").fotorama({width: '800', height: '350', 'max-width': '100%'});
                      
                      if (!$(".edit-area-scroll").hasClass ('mCustomScrollbar'))
                          $(".edit-area-scroll").mCustomScrollbar({ scrollButtons:{ enable:true }});
                      $(".edit-area-scroll").mCustomScrollbar ('update');

                      if (!$(".edit-areamedia-scroll").hasClass ('mCustomScrollbar'))
                          $(".edit-areamedia-scroll").mCustomScrollbar({ scrollButtons:{ enable:true }});
                      $(".edit-areamedia-scroll").mCustomScrollbar ('update');

                      //Fetch user's notification header
                      getUserDetail();
                      getUserNotificationsHeader();
                  }, 1000);
                  $(".swipebox").swipebox();

                  //Show edit and delete tabs
                  $("a[title=tab2], a[title=tab3]").show();

                  //If there is no image media => disable edit tab
                  if (!checkHasImage)
                    $("a[title=tab3]").hide();
                }
                else{
                    jerror ('There is no media on your account! Please use upload tab on leftside you can add some resources!');

                    //Go to queue page
                    $("a.queue").trigger('click');

                    //If there is no media hide edit & delete tabs
                    $("a[title=tab2], a[title=tab3]").hide();
                    $("#gallery #tabs").find("li").removeClass('current');
                    $("#gallery #tabs").find("li:eq(0)").addClass('current');

                    $("#gallery #tab-content").find(".hideCls").hide();
                    $("#gallery #tab-content").find(".hideCls:eq(0)").show();
                    //Fetch user's notification header
                    getUserDetail();
                    getUserNotificationsHeader();
                }
                return true;
            }
    );
}


//Funtion for aviary edit tab space
function aviarySpace(updateMode){   //updateMode is get or return
    if ($(".right-ads").length > 0){ //Run only advertising enabled
        if (updateMode == 'get'){
            $("#gallery div:eq(0)").removeClass("span9").addClass("span11");
            $(".right-ads").hide();
        }
        else{
            if (updateMode == "return"){
                $("#gallery div:eq(0)").removeClass("span11").addClass("span9");
                $(".right-ads").show();
            }
        }
    }
}

function ajaxRequestHeaderNotification(){
    getUserNotificationsHeader();
}

function getUserNotificationsHeader(){
    var user_id = $("input[name=user_id]").val();
    var jTargetElement = $(".notification-head ul");
    if (jTargetElement.hasClass ("mCustomScrollbar"))
        jTargetElement = $(".notification-head ul .mCSB_container");

    ajaxRequest(
        'listnotification',
        [
            { tag: 'user_id', value: user_id }
        ],
        function(ret_xml) {
            if (getValueFromXMLTag(ret_xml, 'status') == 'success'){
                var notifications = getSubXMLFromTag(ret_xml, 'notification');

                //Check if user has new notification
                if (notificationHeaderObject.length != notifications.length){
                    notificationHeaderObject = notifications;
                    var notification_count = notifications.length;
                    $(".notification-count").html(notification_count);
                    if (notification_count > 0){
                        var html_content = '';
                        for (var i = 0;i < notification_count;i++){
                            var notification = notifications[i].innerHTML;

                            var notification_id = getValueFromXMLTag(notifications[i], 'notification_id');
                            var notification_type = getValueFromXMLTag(notifications[i], 'notification_type');
                            var meta_text = $(notifications[i]).wrap('meta')
                                .html().split('<meta>')[1]
                                .split('<notification_type>')[0];
                            meta_text = '<span>' + meta_text + '</span>';
                            meta_text = removeCdataCorrectLink(meta_text);
                            meta_text = $('<div/>').html(meta_text).text();

                            var user_profile_pic = removeCdataCorrectLink(getValueFromXMLTag(notifications[i], 'profile_pic'));
                            var notification_status = getValueFromXMLTag(notifications[i], 'notification_status');
                            if (user_profile_pic == '') user_profile_pic = '/memreas/img/profile-pic.jpg';

                            //Check if notification is comment or not

                            if (notification.indexOf('comment_id') >= 0){
                                var comment_id = getValueFromXMLTag(notifications[i], 'comment_id');
                                var comment_text = getValueFromXMLTag(notifications[i], 'comment');
                                var event_id = getValueFromXMLTag(notifications[i], 'event_id');
                                comment_text = removeCdataCorrectLink(comment_text);

                                var comment_time = new Date((getValueFromXMLTag(ret_xml, 'comment_time')) * 1000);

                                html_content += '<li id="notification-header-' + notification_id + '"><div class="notifications-all clearfix">' +
                                                    '<div class="notification-pic"><img src="' + user_profile_pic +'" /></div>' +
                                                    '<div class="notification-right">' +
                                                        '<div class="noti-title">' + meta_text +'</div>' +
                                                        '<div class="noti-content">' +
                                                            '<p>' + comment_text + '</p>' +
                                                        '</div>' +
                                                        '<span class="notification-time">' + comment_time.getHours() + ':' + correctDateNumber(comment_time.getMinutes()) + ' am <br/>' +
                                                        correctDateNumber(comment_time.getDate()) + '/' + correctDateNumber(comment_time.getMonth()) + '/' + comment_time.getFullYear() + '</span>' +
                                                        '<a href="javascript:;" onclick="updateNotificationHeader(\'' + notification_id + '\', \'ignore\');" class="close">x</a>' +
                                                        '<a href="javascript:;" onclick="gotoEventDetail(\'' + event_id + '\', \'' + notification_id + '\');" class="reply">reply</a>' +
                                                    '</div>' +
                                                '</div></li>';

                            }
                            else{

                                if (notification_status == '0')
                                    var link_action = '<a href="javascript:;" class="reply" onclick="updateNotificationHeader(\'' + notification_id + '\', \'ignore\');">Ignore</a> <a href="javascript:;" class="reply" onclick="updateNotificationHeader(\'' + notification_id + '\', \'accept\');">ok</a>';
                                else var link_action = '';
                                html_content += '<li id="notification-header-' + notification_id + '"><div class="notifications-all clearfix">' +
                                                        '<div class="noti-content">' +
                                                            '<p>' + meta_text + '</p>' +
                                                        '</div>' +
                                                        link_action +
                                                    '</div></li>';
                                }
                            }
                        jTargetElement.empty().html(html_content);
                        jTargetElement.mCustomScrollbar({scrollButtons:{ enable:true }});
                    }
                    else{
                        jTargetElement.html('<div class="notifications-all clearfix">' +
                                                '<div class="noti-content">' +
                                                    '<p>You have no notification.</p>' +
                                                '</div>' +
                                            '</div>');
                    }
                }
            }
            else {
                $(".notification-count").html(0);
                jTargetElement.html('<div class="notifications-all clearfix">' +
                                        '<div class="noti-content">' +
                                        '<p>You have no notification.</p>' +
                                        '</div>' +
                                    '</div>');
            }

            setTimeout(function(){ getUserNotificationsHeader() }, 240000); //3 minutes
        }, 'undefined', true
    );
}

function updateNotificationHeader(notification_id, update_status){
    switch (update_status){
        case 'accept':
            var params = [
                {tag: 'notification', value:
                    [
                        {tag: 'notification_id', value: notification_id},
                        {tag: 'status', value: '1'}
                    ]
                }
            ];
            addLoading("#notification-header-" + notification_id + " .notifications-all", 'div', 'notification-header-loading');
            ajaxRequest('updatenotification', params, function(response){
                if (getValueFromXMLTag(response, 'status') == 'success'){
                    jsuccess(getValueFromXMLTag(response, 'message'));
                    $("#notification-header-" + notification_id).fadeOut(500).delay(500).remove();
                }
                else jerror(getValueFromXMLTag(response, 'message'));
                removeLoading("#notification-header-" + notification_id + " .notifications-all");
            }, 'undefined', true);
            break;
        case 'ignore':
            var params = [
                {tag: 'notification', value:
                    [
                        {tag: 'notification_id', value: notification_id},
                        {tag: 'status', value: '2'}
                    ]
                }
            ];

            addLoading("#notification-header-" + notification_id + " .notifications-all", 'div', 'notification-header-loading');
            ajaxRequest('updatenotification', params, function(response){
                if (getValueFromXMLTag(response, 'status') == 'success'){
                    jsuccess(getValueFromXMLTag(response, 'message'));
                    $("#notification-header-" + notification_id).fadeOut(500).delay(500).remove();
                }
                else jerror(getValueFromXMLTag(response, 'message'));
                removeLoading("#notification-header-" + notification_id + " .notifications-all");
            }, 'undefined', true);
            break;
        default: jerror('No action performed');
    }
}

function gotoEventDetail(eventId, notification_id){

    updateNotificationHeader(notification_id, 'accept');

    eventdetail_id = eventId;
    eventdetail_user = $('input[name=user_id]').val();
    userId = eventdetail_user;

    //Show gallery details
    var target_element = $(".memreas-detail-gallery");
    if (target_element.hasClass ('mCustomScrollbar'))
        target_element = $(".memreas-detail-gallery .mCSB_container");
    target_element.empty();

    /* Update details_tab also */
    $(".carousel-memrease-area").empty();
    $(".carousel-memrease-area").append ('<ul id="carousel" class="elastislide-list"></ul>');
    var jcarousel_element = $("ul#carousel");
    jcarousel_element.empty();

    removeItem(reloadItems, 'view_my_events');
    $("a.memreas").trigger('click');
    $(".memreas-main").hide();
    $(".memreas-detail").fadeIn(500);
    pushReloadItem('view_my_events');

    ajaxRequest(
        'listallmedia',
        [
            { tag: 'event_id', value: eventId },
            { tag: 'user_id', value: userId },
            { tag: 'device_id', value: device_id },
            { tag: 'limit',value: media_limit_count },
            { tag: 'page', value: media_page_index }
        ], function (response){

            var eventId = getValueFromXMLTag(response, 'event_id');
            if (getValueFromXMLTag(response, 'status') == "Success") {
                var medias = getSubXMLFromTag(response, 'media');
                if (typeof (eventId != 'undefined')){
                    event_owner_name = getValueFromXMLTag(response, 'username');
                    eventdetail_user_pic = getValueFromXMLTag(response, 'profile_pic');
                    eventdetail_user_pic = eventdetail_user_pic.replace("<!--[CDATA[", "").replace("]]-->", "");

                    $(".memreas-detail-comments .event-owner .pro-pics img").attr ('src', $("header").find("#profile_picture").attr('src'));
                    $(".memreas-detail-comments .pro-names").html(event_owner_name);

                    var media_count = medias.length;
                    for (var i = 0;i < media_count;i++) {
                        var media = medias[i].innerHTML;
                        var _main_media = getMediaUrl(media);

                        var _media_url = getMediaThumbnail(media, '/memreas/img/small/1.jpg');

                        var _media_type = $(media).filter ('type').html();

                        var mediaId = $(media).filter ('media_id').html();
                        if (_media_type == 'video'){
                            target_element.append ('<li class="video-media" id="memreasvideo-' + mediaId + '" media-url="' + _main_media + '"><a href=\'javascript:popupVideoPlayer("memreasvideo-' + mediaId + '");\' id="button"><img src="' + _media_url + '" alt=""><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a></li>');
                            jcarousel_element.append ('<li data-preview="' + _media_url + '"  media-id="' + mediaId + '"><a href="#"><img src="' + _media_url + '" alt="image01" /></a></li>');
                        }
                        else {
                            target_element.append ('<li  media-id="' + mediaId + '"><a href="' + _media_url + '" class="swipebox" title="photo-2"><img src="' + _media_url + '" alt=""></a></li>');
                            jcarousel_element.append ('<li data-preview="' + _main_media + '"  media-id="' + mediaId + '"><a href="#"><img src="' + _media_url + '" alt="image01" /></a></li>');
                        }
                    }
                }
            }
            else jerror(getValueFromXMLTag(response, 'message'));
            $(".memreas-addfriend-btn").attr ('href', "javascript:addFriendToEvent('" + eventId + "');");
            $(".memreas-detail-gallery .swipebox").swipebox();
            ajaxScrollbarElement('.memreas-detail-gallery');
            $("a[title=memreas-detail-tab3]").trigger('click');

            var checkCommentLoaded = setInterval(function(){

                //Make sure comment is loaded
                if (!($('.memreas-detail-comments').find('.loading') > 0)){
                    showPopupComment();
                    clearInterval(checkCommentLoaded);
                }
            }, 3000);
        }
    );
    $("#popupAddMedia a.accept-btn").attr ("href", "javascript:addMemreasPopupGallery('" + eventId + "')");

    //Show comment count/event count
    ajaxRequest(
        'geteventcount',
        [
            {tag: 'event_id', value: eventdetail_id}
        ],function (response){
            var jTargetLikeCount = $(".memreas-detail-likecount span");
            var jTargetCommentCount = $(".memreas-detail-commentcount span");
            if (getValueFromXMLTag(response, 'status') == "Success"){
                var comment_count = getValueFromXMLTag(response, 'comment_count');
                var like_count = getValueFromXMLTag(response, 'like_count');
            }
            else{
                var comment_count = 0;
                var like_count = 0;
            }
            jTargetLikeCount.html(like_count)
            jTargetCommentCount.html(comment_count);
        }, 'undefined', true);
}

function toggleBottomAviary(){
    var jToolInner = $(".aviary-edit-tools .tool-inner");
    var jToolToggle = $(".aviary-edit-tools .tool-navigate a");
    var currentToolMargin = parseInt(jToolInner.css('margin-left'));

    //Is hidden
    if (currentToolMargin < 0){
        jToolInner.animate({
            'margin-left': '0px'
        }, 300);
        jToolToggle.html("&laquo; tools");
    }
    else{
        jToolInner.animate({
            'margin-left': '-65px'
        }, 300);
        jToolToggle.html("&raquo; tools");
    }
}
function toogleEditThumb(){
    $(".aviary-thumbs").parents('.carousel-area').slideToggle(500);
}