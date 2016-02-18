/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */

/*
* System functionally
* All common system functions will be managed here
* */
var AppSystem = function() {

    //Display page loading screen
    this.putPageLoading = function() {
        $('#loadingpopup').fadeIn(1000);
    }

    //Remove page loading screen
    this.removePageLoading = function() {
        $('#loadingpopup').fadeOut(500);
    }

    //Put stripe processing loading state
    this.putStripeLoading = function() {
        $('.stripe-payment').fadeIn(1000);
    }

    //Remove stripe processing loading state
    this.removeStripeLoading = function() {
        $('.stripe-payment').fadeOut(1000);
    }
}
var AppSystem = new AppSystem();

/*
* Handle system log
* */
var ConsoleLog = function() {
    this.enableSystemLog = true; //Set this to false to remove log all places

    //Set log into window console panel
    this.setLog = function (variable) {
        if (self.enableSystemLog) {
            console.log(variable);
        }
    }
}
var ConsoleLog = new ConsoleLog();

(function ($) {
    $(window).load(
            function () {
                $("#tab-content-memreas div.hideCls").hide(); // Initially
                // hide all
                // content
                $("#tabs-memreas li:first").attr("id", "current"); // Activate
                // first tab
                $("#tab-content-memreas div:first").fadeIn(); // Show first
                // tab content*/

                $('#tabs-memreas a')
                        .click(
                                function (e) {

                                    e.preventDefault();
                                    $("#tab-content-memreas div.hideCls")
                                            .hide(); // Hide all content
                                    $("#tabs-memreas li").attr("id", ""); // Reset
                                    // id's
                                    $(this).parent().attr("id", "current"); // Activate
                                    // this
                                    $('#' + $(this).attr('title')).fadeIn(); // Show
                                    // content
                                    // for
                                    // current
                                    // tab
                                    $('#' + $(this).attr('title')).fadeIn(); // Show
                                    // content
                                    // for
                                    // current
                                    // tab
                                    if (!($('#' + $(this).attr('title')
                                            + " .scroll-area")
                                            .hasClass('mCustomScrollbar'))) {
                                        $(
                                                '#' + $(this).attr('title')
                                                + " .scroll-area")
                                                .mCustomScrollbar({
                                                    scrollButtons: {
                                                        enable: true
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

$(function () {
    $("a.memreas").click(function () {
        ajaxScrollbarElement('.myMemreas');
        if (checkReloadItem('view_my_events')) {
            fetchMyMemreas();
        }
    });
    $("#tabs-memreas li:eq(1) a").click(function () {
        if (checkReloadItem('view_friend_events')) {
            fetchFriendsMemreas('private');
        }
    });
    $("#tabs-memreas li:eq(2) a").click(function () {
        if (checkReloadItem('view_public_events')) {
            //console.log('Public Event');
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

    ajaxRequest(
            'viewevents',
            [{
                    tag: 'user_id',
                    value: user_id
                }, {
                    tag: 'is_my_event',
                    value: '1'
                }, {
                    tag: 'is_friend_event',
                    value: '0'
                }, {
                    tag: 'is_public_event',
                    value: '0'
                }, {
                    tag: 'page',
                    value: '1'
                }, {
                    tag: 'limit',
                    value: '20'
                }],
            function (response) {
                if (getValueFromXMLTag(response, 'status') == "Success") {
                    console.log("response SSHYAM" + response);
                    var events = getSubXMLFromTag(response, 'event');
                   

                    var event_count = events.length;
                    
                    
                    for (var i = 0; i < event_count; i++) {
                         var event_media=getSubXMLFromTag(events[i], 'event_media');
                         var event_media_count=event_media.length;
                        console.log('Media Event Length: '+event_media_count);
                        var event = events[i].innerHTML;
                       
                        var StrMedia='<ul class="event-pics">';
                        for( var j=0; j < event_media_count; j++){
                             var event_medi=event_media[j];
                             var event_media_image=getValueFromXMLTag(event_medi,'event_media_448x306');
                             var _event_media_type_=getValueFromXMLTag(event_medi,'event_media_type');
                              var eventId = $(event).filter('event_id').html();
                             if(_event_media_type_ =='image'){
                                 StrMedia +='<li class="image"><a href="javascript:;" onclick="showEventDetail(\''
                                + eventId
                                + '\', \''
                                + user_id
                                + '\');" style="cursor: pointer;"><img src="'+removeCdataCorrectLink(event_media_image)+'"  style=""/></a></li>';
                             }else if(_event_media_type_ =='video'){
                                 StrMedia +='<li class="video"><a href="javascript:;" onclick="showEventDetail(\''
                                + eventId
                                + '\', \''
                                + user_id
                                + '\');" style="cursor: pointer;"><img src="'+removeCdataCorrectLink(event_media_image)+'"  style=""/></a></li>';
                             }
                             console.log('Each Event:'+removeCdataCorrectLink(event_media_image));
                             //StrMedia +='<li><img src="'+removeCdataCorrectLink(event_media_image)+'"  style="width:100%"/></li>';
                            
                        }
                        StrMedia +='</ul><div style="clear:both;"></div>';
                         console.log('STR MEDIA'+StrMedia);
                        var like_count = $(event).filter('like_count').html();
                        var comment_count = $(event).filter('comment_count')
                                .html();
                       
                        
                        //var event_media_image=$(event_medi).filter('event_media_448x306').html();
                        var event_name = $(event).filter('event_name').html();
                        //var evetn_im=$(event).filter('event_media_448x306').html();
                        console.log(i + ":event name:" + event_media_image);
                        var element = '<div class="event_section">'
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
                                +
                                '</div>'
                                + '<div class="clear"></div>'
                                + '<div id="viewport" onselectstart="return false;">'
                                + '<div id="myEvent-'
                                + eventId
                                + '" class="swipeclass">'
                                +StrMedia
                                + '</div>'
                                + '</div>'
                                + '<div id="viewport" onselectstart="return false;">'
                                + '<div class="swipeclass" id="swipebox-comment-'
                                + eventId
                                + '">'
                                + '</div>'
                                + '</div>'
                                + '</div>';
                        //element +=StrMedia;
                        jTarget_object.append(element);


                        /*
                         * This section isn't necessary ... view events passes back all this data media, friends, comments.
                         */
                        /*
                         // get event medias
                         ajaxRequest(
                         'listallmedia',
                         [ {
                         tag : 'event_id',
                         value : eventId
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
                         } ],
                         function(response) {
                         var eventId = getValueFromXMLTag(response,
                         'event_id');
                         var jMediaElement = $("#myEvent-" + eventId);
                         if (getValueFromXMLTag(response, 'status') == "Success") {
                         var medias = getSubXMLFromTag(response,
                         'media');
                         var html_media = '';
                         if (typeof (eventId != 'undefined')) {
                         var media_count = medias.length;
                         for (var i = 0; i < media_count; i++) {
                         var media = medias[i];
                         var mediaid = $(media).find(
                         'media_id')[0].innerHTML;
                         var media_type = $(media)
                         .filter('type').html();
                         var _media_url = getMediaThumbnail(
                         media,
                         '/memreas/img/small/1.jpg');
                         if (media_type == 'video')
                         html_media += '<div id="emedia-'
                         + mediaid
                         + '" class="event_img video-media"><a href="javascript:;"  eventid="'
                         + eventId
                         + '"  data="'
                         + mediaid
                         + '"><img src="'
                         + _media_url
                         + '"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a></div>';
                         else
                         html_media += '<div id="emedia-'
                         + mediaid
                         + '" class="event_img"><a href="javascript:;"  eventid="'
                         + eventId
                         + '"  data="'
                         + mediaid
                         + '"><img  src="'
                         + _media_url
                         + '"/></a></div>';
                         }
                         if (html_media != '') {
                         jMediaElement.empty().html(
                         html_media);
                         if ($("#viewport .event_img").length) {
                         $("#viewport .event_img a")
                         .each(
                         function() {
                         $(this)
                         .click(
                         function() {
                         $(
                         ".modal-backdrop")
                         .removeClass(
                         "out")
                         .addClass(
                         "in");
                         $(
                         ".modal-backdrop")
                         .fadeIn();
                         $(
                         ".modal-backdrop")
                         .html(
                         '<p class="loading" style="clear: both;width:100%;text-align:center;padding-top:20%"><img src="/memreas/img/loading_animate.gif" style="width:55px;"/></p>');
                         var eventdetail_media_id = $(
                         this)
                         .attr(
                         "data");
                         var eventdetail_id = $(
                         this)
                         .attr(
                         "eventid");
                         // get
                         // media
                         // comments
                         ajaxRequest(
                         'listcomments',
                         [
                         {
                         tag : 'event_id',
                         value : eventdetail_id
                         },
                         {
                         tag : 'media_id',
                         value : eventdetail_media_id
                         },
                         {
                         tag : 'limit',
                         value : '100'
                         },
                         {
                         tag : 'page',
                         value : '1'
                         } ],
                         function(
                         ret_xml) {
                         
                         var event_comments = getSubXMLFromTag(
                         ret_xml,
                         'comment');
                         var comment_count = event_comments.length;
                         if (comment_count > 0) {
                         var html_str = '<ul class="commitems">';
                         for (var i = 0; i < comment_count; i++) {
                         var event_comment = event_comments[i];
                         var comment_owner_pic = getValueFromXMLTag(
                         event_comment,
                         'profile_pic');
                         comment_owner_pic = removeCdataCorrectLink(comment_owner_pic);
                         if (comment_owner_pic == '')
                         comment_owner_pic = '/memreas/img/profile-pic.jpg';
                         var comment_text = getValueFromXMLTag(
                         event_comment,
                         'comment_text');
                         var comment_type = getValueFromXMLTag(
                         event_comment,
                         'type');
                         html_str += '<li>'
                         + '<figure class="pro-pics"><img src="'
                         + comment_owner_pic
                         + '" alt=""></figure>';
                         
                         // Comment
                         // is
                         // text
                         // or
                         // audio
                         if (comment_type == 'text')
                         html_str += '<textarea readonly="readonly">'
                         + comment_text
                         + '</textarea>';
                         else {
                         var audio_media_url = getValueFromXMLTag(
                         event_comment,
                         'audio_media_url');
                         audio_media_url = removeCdataCorrectLink(audio_media_url);
                         html_str += '<audio controls class="memreas-detail-audio">'
                         + '<source src="'
                         + audio_media_url
                         + '" type="audio/wav" />'
                         + 'Your browser does not support the audio element'
                         + '</audio>';
                         }
                         html_str += '</li>';
                         
                         }
                         html_str += '</ul><div style="clear:both"></div>';
                         
                         popupDetailMedia(
                         eventdetail_media_id,
                         html_str,
                         comment_count);
                         
                         //
                         // if(
                         // $("#myEvent-"+eventdetail_id).find("ul.commitems").length){
                         // $("#myEvent-"+eventdetail_id).find("ul.commitems").each(function(){$(this).remove();}); }
                         // $("#myEvent-"+eventdetail_id).append(html_str);
                         //
                         } else {
                         var html_str = '<p style="color: #FFF;" class="no-comment">No comment yet!</p>';
                         popupDetailMedia(
                         eventdetail_media_id,
                         html_str,
                         0);
                         }
                         },
                         'undefined',
                         true);
                         });
                         });
                         }
                         } else
                         jMediaElement
                         .empty()
                         .html(
                         '<div class="event_img video-media">There is no media on this event</div>');
                         }
                         } else {
                         jMediaElement
                         .empty()
                         .html(
                         '<i style="color: #FFFFFF;">There is no media on this event</i>');
                         }
                         }, 'undefined', true);
                         
                         // Get event people
                         ajaxRequest(
                         'geteventpeople',
                         [ {
                         tag : 'event_id',
                         value : eventId
                         } ],
                         function(xml_response) {
                         var html_people = '';
                         var response_event_id = getValueFromXMLTag(
                         xml_response, 'event_id');
                         var jEvent_people = $("#event-people-"
                         + response_event_id);
                         var friends = getSubXMLFromTag(
                         xml_response, 'friend');
                         if (getValueFromXMLTag(xml_response,
                         'status') == 'Success') {
                         var count_people = friends.length;
                         for (i = 0; i < count_people; i++) {
                         var friend = friends[i];
                         var friend_photo = '';
                         if (getValueFromXMLTag(friend,
                         'photo') == ''
                         || getValueFromXMLTag(
                         friend, 'photo') == 'null')
                         friend_photo = '/memreas/img/profile-pic.jpg';
                         else
                         friend_photo = getValueFromXMLTag(
                         friend, 'photo');
                         friend_photo = removeCdataCorrectLink(friend_photo);
                         var friend_name = getValueFromXMLTag(
                         friend, 'friend_name');
                         html_people += '<div class="event_gallery_pro"><img src="'
                         + friend_photo
                         + '" alt="'
                         + friend_name
                         + '" title="'
                         + friend_name
                         + '" /></div>';
                         }
                         jEvent_people.html(html_people);
                         } else
                         jEvent_people.html('');
                         }, 'undefined', true);
                         $("#myEvent-" + eventId).swipe({
                         TYPE : 'mouseSwipe',
                         HORIZ : true
                         });
                         $("#swipebox-comment-" + eventId).swipe({
                         TYPE : 'mouseSwipe',
                         HORIZ : true
                         });
                         */
                    }
                } else
                    jerror('You have no event at this time. Try add some event at share tab');
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

    $(".close").click(function () {
        closeModals(eventdetail_media_id);
    });
}
function fetchFriendsMemreas(friendMemreasType) {
   
    var user_id = $("input[name=user_id]").val();
    if (friendMemreasType == 'private') {
        var showPublic = '0';
        var showAccepted = '1';
        var sell_class = 'private-';
    } else {
        var showPublic = '1';
        var showAccepted = '1';
        var sell_class = 'public-';
    }
    ajaxRequest(
            'viewevents',
            [{
                    tag: 'user_id',
                    value: user_id
                }, {
                    tag: 'is_my_event',
                    value: '0'
                }, {
                    tag: 'is_friend_event',
                    value: showAccepted
                }, {
                    tag: 'is_public_event',
                    value: showPublic
                }, {
                    tag: 'page',
                    value: '1'
                }, {
                    tag: 'limit',
                    value: '20'
                }],
            function (response) {
                
                if (friendMemreasType == 'private') {
                    console.log('friendMemreasType-->' + friendMemreasType);
//                    if ($(".event_images").hasClass("mCustomScrollbar"))
//                        var target_object = ".event_images .mCSB_container";
//                    else
//                        var target_object = ".event_images";
                    var target_object = ".event_images";
                    ajaxScrollbarElement('.event_images');
                    $(".event_images").empty();
                } else {
                    //debugger;
                     console.log('friendMemreasType public-->' + friendMemreasType);
//                    if ($(".event_images_public").hasClass("mCustomScrollbar"))
//                        var target_object = ".event_images_public .mCSB_container";
//                    else
//                        var target_object = ".event_images_public";
                     var target_object = ".event_images_public";
                    ajaxScrollbarElement('.event_images_public');
                    $(".event_images_public").empty();
                }
                //var friendsId = new Array();
                var friends = getSubXMLFromTag(response, 'friend');
                if (getValueFromXMLTag(response, 'status') == "Success") {
                    if (friends.length > 0) {
                        /**
                         * Fetch Friends array
                         */
                        friends = getSubXMLFromTag(response, 'friend');
                        var friend_count = friends.length;
                        for (var i = 0; i < friend_count; i++) {
                            var friend = friends[i].innerHTML;
                            var creator_id = $(friend).filter(
                                    'event_creator_user_id').html();
                            // console.log('event_creator_user_id-->' +
                            // JSON.stringify(friends, null, '\t'));
                            console
                                    .log('event_creator_user_id-->'
                                            + creator_id);
                            if (friendMemreasType == 'private') {
                                var friend_row = 'friendPrivate-' + creator_id;
                            } else
                                var friend_row = 'friendPublic-' + creator_id;
                            if (typeof ($(friend).filter('profile_pic_79x80')) != 'undefined') {
                                var profile_img = $(friend).filter(
                                        'profile_pic_79x80').html();
                                profile_img = removeCdataCorrectLink(profile_img);
                            } else
                                profile_img = '/memreas/img/profile-pic.jpg';
                            if (profile_img == '')
                                profile_img = '/memreas/img/profile-pic.jpg';
                            console.log('profile_pic-->' + profile_img);
                            console
                                    .log('$(friend).filter("profile_pic_79x80").html()-->'
                                            + removeCdataCorrectLink($(friend)
                                                    .filter('profile_pic_79x80')
                                                    .html()));
                            console
                                    .log('$(friend).filter("profile_pic_448x306").html()-->'
                                            + removeCdataCorrectLink($(friend)
                                                    .filter(
                                                            'profile_pic_448x306')
                                                    .html()));
                            console
                                    .log('$(friend).filter("profile_pic_98x78").html()-->'
                                            + removeCdataCorrectLink($(friend)
                                                    .filter('profile_pic_98x78')
                                                    .html()));
                            var event_creator = $(friend).filter(
                                    'event_creator').html();
                            console.log('Tr Object'+target_object);
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
                                            + '" class="swipeclass"></div></div></div>');

                            var global_width = $("#tab-content-memreas")
                                    .width();
                            var base_event_row_width = 120;

                            /**
                             * Fetch events by friend
                             */
                            var events_resources = $(friend).filter('events')
                                    .html();
                            var event_resources = $(events_resources).filter(
                                    'event');
                            var event_resources_count = event_resources.length;
                            var total_event_row_width = 120 * event_resources_count;

                            console.log('event_resources_count-->'
                                    + event_resources_count);

                            if (event_resources_count > 0) {
                                for (var key = 0; key < event_resources_count; key++) {
                                    var event_resource = event_resources[key].innerHTML;
                                    console.log('event_resource-->'
                                            + event_resource);
                                    var eventId = $(event_resource).filter(
                                            'event_id').html();
                                    console.log('eventId-->' + eventId);
                                    // fetch event media
                                    var event_media_resource = $(event_resource)
                                            .filter('event_media').html();

                                    var event_media_98x78 = $(
                                            event_media_resource).filter(
                                            'event_media_98x78').html();
                                    console.log('event_media_98x78-->'
                                            + event_media_98x78);
                                    event_media_98x78 = removeCdataCorrectLink(event_media_98x78);
                                    console.log('event_media_98x78 after-->'
                                            + event_media_98x78);
                                    if (event_media_98x78 == '')
                                        event_media_98x78 = '/memreas/img/small/1.jpg';
                                    var event_name = $(event_resource).filter(
                                            'event_name').html();
                                    var event_metadata = $(event_resource)
                                            .filter('event_metadata').html();
                                    console.log('event_name-->' + event_name);
                                    console.log('event_metadata-->'
                                            + event_metadata);

                                    // Check if event is selling or not
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
                                    if (sell_price == '') {
                                        console.log('sell_price-->'
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
                                        console.log('selling event???--');
                                        $("#" + friend_row)
                                                .append(
                                                        '<div class="event_img" id="'
                                                        + sell_class
                                                        + 'selling-'
                                                        + eventId
                                                        + '" data-owner="'
                                                        + creator_id
                                                        + '" data-click="popupBuyMedia(\''
                                                        + eventId
                                                        + '\', \''
                                                        + sell_price
                                                        + '\', \''
                                                        + event_name
                                                        + '\');"><div class="sell-event-overlay"></div><span class="sell-event-buyme"><i>checking...</i></span><img src="'
                                                        + event_media_98x78
                                                        + '" alt=""><span class="event_name_box"><a style="color:#FFF;" href="javascript:;">!'
                                                        + event_name
                                                        + '</a></span></div>');

                                        // Start requesting to pay server for
                                        // checking event is bought or not
                                        var params = new Object;
                                        params.user_id = LOGGED_USER_ID;
                                        params.event_id = eventId;
                                        var params_json = JSON.stringify(
                                                params, null, '\t');
                                        var data = '{"action": "check_own_event", '
                                                + '"type":"jsonp", '
                                                + '"json": '
                                                + params_json
                                                + '}';

                                        var stripeActionUrl = STRIPE_SERVER_URL
                                                + '/stripe/checkOwnEvent';
                                        $
                                                .ajax({
                                                    url: stripeActionUrl,
                                                    type: 'POST',
                                                    dataType: 'jsonp',
                                                    data: 'json=' + data,
                                                    success: function (response) {
                                                        var current_event = response.event_id;
                                                        var jElement = $("#"
                                                                + sell_class
                                                                + "selling-"
                                                                + current_event);
                                                        if (response.status == 'Success') {
                                                            jElement
                                                                    .removeAttr(
                                                                            "data-owner")
                                                                    .removeAttr(
                                                                            "data-click")
                                                                    .find("a")
                                                                    .attr(
                                                                            "href",
                                                                            "javascript:showEventDetail('"
                                                                            + eventId
                                                                            + "', '"
                                                                            + creator_id
                                                                            + "');");
                                                            jElement
                                                                    .find(
                                                                            ".sell-event-overlay")
                                                                    .remove();
                                                            jElement
                                                                    .find(
                                                                            ".sell-event-buyme")
                                                                    .remove();
                                                        } else {
                                                            jElement
                                                                    .attr(
                                                                            "onclick",
                                                                            jElement
                                                                            .attr("data-click"))
                                                                    .removeAttr(
                                                                            "data-click");
                                                            jElement
                                                                    .find(
                                                                            ".sell-event-buyme")
                                                                    .html(
                                                                            "buy me");
                                                        }

                                                    }
                                                });
                                    }
                                } // end for loop for (var key=0;key <
                                // friend_resources_count;key++)

                                if (total_event_row_width > global_width) {
                                    $("#" + friend_row).swipe({
                                        TYPE: 'mouseSwipe',
                                        HORIZ: true
                                    });
                                }
                            } else {
                                $("#" + friend_row).append(
                                        'There is no event shared');
                                $("#" + friend_row).css({
                                    'color': '#FFF',
                                    'font-style': 'italic',
                                    'margin-bottom': '20px'
                                }).parent("#viewport").removeAttr('id')
                                        .removeAttr('class');
                            }
                        }
                        $(".event_images_public").mCustomScrollbar('update');
                    }
                }
            });
}
function addMemreas() {
    $("a.share").click();
    share_clearMemreas(true);
}

// Public Event



function fetchpubsMemreas() {
   
    var user_id = $("input[name=user_id]").val();
    var showPublic = '1';
    var showAccepted = '0';
     var sell_class = 'public-';
    ajaxRequest(
            'viewevents',
            [{
                    tag: 'user_id',
                    value: user_id
                }, {
                    tag: 'is_my_event',
                    value: '0'
                }, {
                    tag: 'is_friend_event',
                    value: showAccepted
                }, {
                    tag: 'is_public_event',
                    value: showPublic
                }, {
                    tag: 'page',
                    value: '1'
                }, {
                    tag: 'limit',
                    value: '20'
                }],
            function (response) {
                
    console.log('PUb RES' +response);
                   
                    if ($(".event_images_public").hasClass("mCustomScrollbar"))
                        var target_object = ".event_images_public .mCSB_container";
                    else
                        var target_object = ".event_images_public";
                    ajaxScrollbarElement('.event_images_public');
                    //$(".event_images_public").empty();
                    
                
                
                //
                
                 
                        
                    
                    
                
                var friends = getSubXMLFromTag(response, 'event');
                if (getValueFromXMLTag(response, 'status') == "Success") {
                    if (friends.length > 0) {
                        /**
                         * Fetch Friends array
                         */
                        friends = getSubXMLFromTag(response, 'event');
                        var friend_count = friends.length;
                        for (var i = 0; i < friend_count; i++) {
                            var friend = friends[i].innerHTML;
                            console.log('Event Tag Iterate -->'+friend);
                            var creator_id = $(friend).filter(
                                    'event_creator_user_id').html();
                            var event_id=$(friend).filter(
                                    'event_id').html();
                            var event_like_total=$(friend).filter(
                                    'event_like_total').html();
                            var event_comment_total=$(friend).filter(
                                    'event_comment_total').html();
//                             var profile_img = $(friend).filter(
//                                        'profile_pic').html();
//                             profile_img = removeCdataCorrectLink(profile_img);

//                            if (typeof ($(friend).filter('profile_pic_79x80')) != 'undefined') {
//                                var profile_img = $(friend).filter(
//                                        'profile_pic_79x80').html();
//                                profile_img = removeCdataCorrectLink(profile_img);
//                            } else
//                                profile_img = '/memreas/img/profile-pic.jpg';
                            
                            var profile_img = '/memreas/img/profile-pic.jpg';
                             var friend_row = 'friendPublic-' + creator_id;
                              var event_creator = $(friend).filter(
                                    'event_creator').html();
                         
                         var event_media=getSubXMLFromTag(friends[i], 'event_media');
                         var event_media_count=event_media.length;
                        var StrMedia='<div style="clear:both;"></div><ul class="event-pics">';
                        for( var j=0; j < event_media_count; j++){
                             var event_medi=event_media[j];
                             var event_media_image=getValueFromXMLTag(event_medi,'event_media_448x306');
                             var _event_media_type_=getValueFromXMLTag(event_medi,'event_media_type');
                              var eventId = $(event).filter('event_id').html();
                             if(_event_media_type_ =='image'){
                                 StrMedia +='<li class="image"><a href="javascript:;" onclick="showEventDetail(\''
                                + event_id
                                + '\', \''
                                + user_id
                                + '\');" style="cursor: pointer;"><img src="'+removeCdataCorrectLink(event_media_image)+'"  style=""/></a></li>';
                             }else if(_event_media_type_ =='video'){
                                 StrMedia +='<li class="video"><a href="javascript:;" onclick="showEventDetail(\''
                                + event_id
                                + '\', \''
                                + user_id
                                + '\');" style="cursor: pointer;"><img src="'+removeCdataCorrectLink(event_media_image)+'"  style=""/></a></li>';
                             }
                             console.log('Each Event:'+removeCdataCorrectLink(event_media_image));
                             //StrMedia +='<li><img src="'+removeCdataCorrectLink(event_media_image)+'"  style="width:100%"/></li>';
                            
                        }     
                           
                           StrMedia +='</ul><div style="clear:both;"></div>'; 
                         
                            var event_friends=getSubXMLFromTag(friends[i], 'event_friends');
                            var event_friend= getSubXMLFromTag(event_friends, 'event_friend');
                          var event_friend_count = event_friend.length; 
                          var event_friend_string="";
                          for(var k=1; k <= event_friend_count; k++){
                               var event_friend_list=event_friend[k];
                               var event_friend_id=getValueFromXMLTag(event_friend_list,'event_friend_id');
                               var event_friend_social_username=getValueFromXMLTag(event_friend_list,'event_friend_social_username');
                               var event_friend_url_image=getValueFromXMLTag(event_friend_list,'event_friend_url_image');
                               event_friend_url_image =removeCdataCorrectLink(event_friend_url_image);
                                
                               event_friend_string +='<figure class="pro-pics2"><img class="public-profile-img" src="'+event_friend_url_image+'" alt=""></figure>'
                                                    +'<aside class="pro-names2" style="margin-top:0px;">@ '+event_friend_social_username+'</aside>'; 
                                
                                console.log('Friend ID -->'+event_friend_id);
                                console.log('Friend userName -->'+event_friend_social_username);
                                console.log('Friend URL -->'+event_friend_url_image);
                          }
                         
                            console.log('Friend Length -->'+event_friend_count);
                            
                            // console.log('event_creator_user_id-->' +
                            // JSON.stringify(friends, null, '\t'));
                            console
                                    .log('event_creator_user_id-->'
                                            + creator_id +'Event Id--> '+ event_id);
                            
//                            var friend_row = 'friendPublic-' + creator_id;
//                            if (typeof ($(friend).filter('profile_pic_79x80')) != 'undefined') {
//                                var profile_img = $(friend).filter(
//                                        'profile_pic_79x80').html();
//                                profile_img = removeCdataCorrectLink(profile_img);
//                            } else
//                                profile_img = '/memreas/img/profile-pic.jpg';
//                            if (profile_img == '')
//                                profile_img = '/memreas/img/profile-pic.jpg';
//                            console.log('profile_pic-->' + profile_img);
//                            console
//                                    .log('$(friend).filter("profile_pic_79x80").html()-->'
//                                            + removeCdataCorrectLink($(friend)
//                                                    .filter('profile_pic_79x80')
//                                                    .html()));
//                            console
//                                    .log('$(friend).filter("profile_pic_448x306").html()-->'
//                                            + removeCdataCorrectLink($(friend)
//                                                    .filter(
//                                                            'profile_pic_448x306')
//                                                    .html()));
//                            console
//                                    .log('$(friend).filter("profile_pic_98x78").html()-->'
//                                            + removeCdataCorrectLink($(friend)
//                                                    .filter('profile_pic_98x78')
//                                                    .html()));
//                           
                            console.log('Tr Object'+target_object);
                            
                            
                            
                            
                            $(target_object)
                                    .append(
                                            '<div class="event_section"><section class="row-fluid clearfix">'
                                            + '<figure class="pro-pics2"><img class="public-profile-img" src="'
                                            + profile_img
                                            + '" alt=""></figure>'
                                            + '<aside class="pro-names2" style="margin-top:0px;">@'
                                            + event_creator
                                            + '</aside>'
                                            + '<a href="javascript:;" title="Like media" class="memreas-detail-likecount" style="margin-left:10px;"><img src="/memreas/img/like.png" alt=""></a><span style="position: relative;top: -10px;left: -17px;color: #fff;">'+event_like_total+'</span>'
                                            + '<a href="javascript:;" title="Comment" style="position: relative;top:5px;"><img src="/memreas/img/comment.png" alt=""></a><span style="position: relative;top: -8px;left: -19px;color: #fff;">'+event_comment_total+'</span>'
                                            + event_friend_string
                                            + StrMedia +'</section><div id="viewport" class="mouse_swip" onselectstart="return false;">'
                                            + '<div id="'
                                            + friend_row
                                            + '" class="swipeclass"></div></div></div>');
                               //$(target_object).append(StrMedia);     

                            var global_width = $("#tab-content-memreas")
                                    .width();
                            var base_event_row_width = 120;

                            /**
                             * Fetch events by friend
                             */
//                            var events_resources = $(friend).filter('event_friends')
//                                    .html();
//                            var event_resources = $(events_resources).filter(
//                                    'event_friend');
//                            var event_resources_count = event_resources.length;
//                            var total_event_row_width = 120 * event_resources_count;
//
//                            console.log('event_resources_count-->'
//                                    + event_resources_count);
//
//                            if (event_resources_count > 0) {
//                                for (var key = 0; key < event_resources_count; key++) {
//                                    var event_resource = event_resources[key].innerHTML;
//                                    console.log('event_resource-->'
//                                            + event_resource);
//                                    var event_friend_id = $(event_resource).filter(
//                                            'event_friend_id').html();
//                                    var event_friend_social_username = $(event_resource).filter(
//                                            'event_friend_social_username').html();
//                                    var event_friend_url_image = $(event_resource).filter(
//                                            'event_friend_url_image').html(); 
//                                    event_friend_url_image=removeCdataCorrectLink(event_friend_url_image);
//                                   
//                                    // fetch event media
//                                   
//                                           
//                                    if (event_friend_url_image == '')
//                                        event_friend_url_image = '/memreas/img/small/1.jpg';
//                                    var event_name = $(friend).filter(
//                                            'event_name').html();
//                                    var event_metadata = $(friend)
//                                            .filter('event_metadata').html();
//                                    console.log('event_name-->' + event_name);
//                                    console.log('event_metadata-->'
//                                            + event_metadata);
//
//                                    // Check if event is selling or not
//                                    var sell_price = '';
//                                    if (event_metadata != ''
//                                            && typeof (event_metadata) != 'undefined') {
//                                        event_metadata = JSON
//                                                .parse(event_metadata);
//                                        if (typeof (event_metadata.price) != 'undefined') {
//                                            if (event_metadata.price != '')
//                                                sell_price = event_metadata.price;
//                                        }
//                                    }
//                                    if (sell_price == '') {
//                                        console.log('sell_price-->'
//                                                + sell_price);
//                                        $("#" + friend_row)
//                                                .append(
//                                                        '<div class="event_img"><a href="javascript:showEventDetail(\''
//                                                        + eventId
//                                                        + '\', \''
//                                                        + user_id
//                                                        + '\');">'
//                                                        + '<img src="'
//                                                        + event_friend_url_image
//                                                        + '" alt="">'
//                                                        + '</a>'
//                                                        + '<span class="event_name_box"><a style="color:#FFF;" href="javascript:showEventDetail(\''
//                                                        + eventId
//                                                        + '\', \''
//                                                        + user_id
//                                                        + '\');">!'
//                                                        + event_name
//                                                        + '</a></span></div>');
//                                    } else {
//                                        console.log('selling event???--');
//                                        $("#" + friend_row)
//                                                .append(
//                                                        '<div class="event_img" id="'
//                                                        + sell_class
//                                                        + 'selling-'
//                                                        + eventId
//                                                        + '" data-owner="'
//                                                        + creator_id
//                                                        + '" data-click="popupBuyMedia(\''
//                                                        + eventId
//                                                        + '\', \''
//                                                        + sell_price
//                                                        + '\', \''
//                                                        + event_name
//                                                        + '\');"><div class="sell-event-overlay"></div><span class="sell-event-buyme"><i>checking...</i></span><img src="'
//                                                        + event_friend_url_image
//                                                        + '" alt=""><span class="event_name_box"><a style="color:#FFF;" href="javascript:;">!'
//                                                        + event_name
//                                                        + '</a></span></div>');
//
//                                        // Start requesting to pay server for
//                                        // checking event is bought or not
//                                        var params = new Object;
//                                        params.user_id = LOGGED_USER_ID;
//                                        params.event_id = eventId;
//                                        var params_json = JSON.stringify(
//                                                params, null, '\t');
//                                        var data = '{"action": "check_own_event", '
//                                                + '"type":"jsonp", '
//                                                + '"json": '
//                                                + params_json
//                                                + '}';
//
//                                        var stripeActionUrl = STRIPE_SERVER_URL
//                                                + '/stripe/checkOwnEvent';
//                                        $
//                                                .ajax({
//                                                    url: stripeActionUrl,
//                                                    type: 'POST',
//                                                    dataType: 'jsonp',
//                                                    data: 'json=' + data,
//                                                    success: function (response) {
//                                                        var current_event = response.event_id;
//                                                        var jElement = $("#"
//                                                                + sell_class
//                                                                + "selling-"
//                                                                + current_event);
//                                                        if (response.status == 'Success') {
//                                                            jElement
//                                                                    .removeAttr(
//                                                                            "data-owner")
//                                                                    .removeAttr(
//                                                                            "data-click")
//                                                                    .find("a")
//                                                                    .attr(
//                                                                            "href",
//                                                                            "javascript:showEventDetail('"
//                                                                            + eventId
//                                                                            + "', '"
//                                                                            + creator_id
//                                                                            + "');");
//                                                            jElement
//                                                                    .find(
//                                                                            ".sell-event-overlay")
//                                                                    .remove();
//                                                            jElement
//                                                                    .find(
//                                                                            ".sell-event-buyme")
//                                                                    .remove();
//                                                        } else {
//                                                            jElement
//                                                                    .attr(
//                                                                            "onclick",
//                                                                            jElement
//                                                                            .attr("data-click"))
//                                                                    .removeAttr(
//                                                                            "data-click");
//                                                            jElement
//                                                                    .find(
//                                                                            ".sell-event-buyme")
//                                                                    .html(
//                                                                            "buy me");
//                                                        }
//
//                                                    }
//                                                });
//                                    }
//                                } // end for loop for (var key=0;key <
//                                // friend_resources_count;key++)
//
//                                if (total_event_row_width > global_width) {
//                                    $("#" + friend_row).swipe({
//                                        TYPE: 'mouseSwipe',
//                                        HORIZ: true
//                                    });
//                                }
//                            } 
//                            else {
//                                $("#" + friend_row).append(
//                                        'There is no event shared');
//                                $("#" + friend_row).css({
//                                    'color': '#FFF',
//                                    'font-style': 'italic',
//                                    'margin-bottom': '20px'
//                                }).parent("#viewport").removeAttr('id')
//                                        .removeAttr('class');
//                            }
                        }
                        $(".event_images_public").mCustomScrollbar('update');
                    }
                }
            });
}




