/*Memreas Scripts - Tran Tuan*/

(function($){
    $(window).load(function(){
        $("#tab-content-memreas div.hideCls").hide(); // Initially hide all content
        $("#tabs-memreas li:first").attr("id","current"); // Activate first tab
        $("#tab-content-memreas div:first").fadeIn(); // Show first tab content*/

        $('#tabs-memreas a').click(function(e) {

            e.preventDefault();
            $("#tab-content-memreas div.hideCls").hide(); //Hide all content
            $("#tabs-memreas li").attr("id",""); //Reset id's
            $(this).parent().attr("id","current"); // Activate this
            $('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
            $('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
            if (!($('#' + $(this).attr('title') + " .scroll-area").hasClass('mCustomScrollbar'))){
                $('#' + $(this).attr('title') + " .scroll-area").mCustomScrollbar({
                    scrollButtons:{
                        enable:true
                    }
                });
            }
            $('#' + $(this).attr('title') + " .scroll-area").mCustomScrollbar("update");
        });

    });
})(jQuery);

$(function(){
    $("a.memreas").click (function(){
        ajaxScrollbarElement('.myMemreas');
        if (checkReloadItem('view_my_events')){
            fetchMyMemreas();
        }
    });
    $("#tabs-memreas li:eq(1) a").click (function(){
        if (checkReloadItem('view_friend_events')){
            fetchFriendsMemreas('private');
        }
    });
    $("#tabs-memreas li:eq(2) a").click (function(){
        if (checkReloadItem('view_public_events')){
            fetchFriendsMemreas('public');
        }
    });
});
function fetchMyMemreas(){
    ajaxScrollbarElement('.myMemreas');
    var user_id = $("input[name=user_id]").val();
    if ($(".myMemreas").hasClass("mCustomScrollbar"))
        var jTarget_object = $(".myMemreas .mCSB_container");
    else var jTarget_object = $(".myMemreas");
    jTarget_object.empty();

    ajaxRequest(
        'viewevents',
        [
            {tag: 'user_id', value: user_id},
            {tag: 'is_my_event', value : '1'},
            {tag: 'is_friend_event', value: '0'},
            {tag: 'is_public_event', value: '0'},
            {tag: 'page', value: '1'},
            {tag: 'limit', value: '20'}
        ],function (response){
            if (getValueFromXMLTag(response, 'status') == "Success"){
                var events = getSubXMLFromTag(response, 'event');

                var event_count = events.length;
                for (var i = 0;i < event_count;i++){
                    var event = events[i].innerHTML;
                    var like_count = $(event).filter ('like_count').html();
                    var comment_count = $(event).filter ('comment_count').html();
                    var eventId = $(event).filter ('event_id').html();
                    var event_name = $(event).filter ('event_name').html();
                    var element = '<div class="event_section">' +
                    '<aside class="event_name" onclick="showEventDetail(\'' + eventId + '\', \'' + user_id + '\');" style="cursor: pointer;">!' + event_name + '</aside>' +
                    '<div class="event_like"><span>' + like_count + '</span></div>' +
                    '<div class="event_comment"><span>' + comment_count + '</span></div>' +
                    '<div id="event-people-' + eventId + '"><img src="/memreas/img/loading-line.gif" class="loading-small" />' +

                    '</div>' +
                    '<div class="clear"></div>' +
                    '<div id="viewport" onselectstart="return false;">' +
                      '<div id="myEvent-' + eventId + '" class="swipeclass"><img src="/memreas/img/loading-line.gif" class="loading-small" />' +
                      '</div>' +
                    '</div>' +
                    '<div id="viewport" onselectstart="return false;">' +
                      '<div class="swipeclass" id="swipebox-comment-' + eventId + '">' +
                      '</div>' +
                    '</div>' +
                   '</div>';
                    jTarget_object.append(element);

                    var event_comments = $(event).filter('comments').html();
                    if (event_comments != ''){
                        var event_comments = getSubXMLFromTag(event_comments, 'comment');
                        var jCommentElement = $("#swipebox-comment-" + eventId);
                        var html_comment = '';
                        for (var j = 0;j < comment_count;j++){
                            var event_comment = $(event_comments.prevObject[j]).html();
                            if (typeof (event_comment) == 'undefined') continue;
                            var comment_owner_pic = $(event_comment).filter('profile_pic').html();
                            comment_owner_pic = removeCdataCorrectLink(comment_owner_pic);
                            if (comment_owner_pic == '')
                                comment_owner_pic = '/memreas/img/profile-pic.jpg';
                            var comment_text = $(event_comment).filter('comment_text').html();
                            var comment_type = $(event_comment).filter('type').html();

                            if (comment_type == 'text') {
                                html_comment += '<div class="swipebox_comment">' +
                                '<div class="event_pro"><img src="' + comment_owner_pic + '"></div>' +
                                '<textarea class="event_textarea" readonly="readonly">' + comment_text + '</textarea>' +
                                '</div>';
                            }
                        }
                        jCommentElement.empty().html(html_comment);
                    }

                    //get event medias
                    ajaxRequest(
                        'listallmedia',
                        [
                            { tag: 'event_id',                 value: eventId },
                            { tag: 'user_id',                 value: user_id },
                            { tag: 'device_id',             value: device_id },
                            { tag: 'limit',                 value: media_limit_count },
                            { tag: 'page',                     value: media_page_index }
                        ], function (response){
                            var eventId = getValueFromXMLTag(response, 'event_id');
                            var jMediaElement = $("#myEvent-" + eventId);
                            if (getValueFromXMLTag(response, 'status') == "Success") {
                                var medias = getSubXMLFromTag(response, 'media');
                                var html_media = '';
                                if (typeof (eventId != 'undefined')){
                                    var media_count = medias.length;
                                    for (var i=0;i < media_count;i++) {
                                        var media = medias[i];
                                        var media_type = $(media).filter('type').html();
                                        var _media_url = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                                        if (media_type == 'video')
                                            html_media += '<div class="event_img video-media"><img src="' + _media_url + '"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></div>';
                                        else html_media += '<div class="event_img"><img src="' + _media_url + '"/></div>';
                                    }
                                    if (html_media != ''){
                                        jMediaElement.empty().html(html_media);
                                    }
                                    else jMediaElement.empty().html('<div class="event_img video-media">There is no media on this event</div>');
                                }
                            }
                            else {
                                jMediaElement.empty().html('<i style="color: #FFFFFF;">There is no media on this event</i>');
                            }
                        }
                    , 'undefined', true);

                    //Get event people
                    ajaxRequest(
                        'geteventpeople',
                        [{tag: 'event_id', value: eventId}],
                        function(xml_response){
                            var html_people = '';
                            var response_event_id = getValueFromXMLTag(xml_response, 'event_id');
                            var jEvent_people = $("#event-people-" + response_event_id);
                            var friends = getSubXMLFromTag(xml_response, 'friend');
                            if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
                                var count_people = friends.length;
                                for (i = 0;i < count_people;i++){
                                    var friend = friends[i];
                                    var friend_photo = '';
                                    if (getValueFromXMLTag(friend, 'photo') == '' || getValueFromXMLTag(friend, 'photo') == 'null')
                                        friend_photo = '/memreas/img/profile-pic.jpg';
                                    else friend_photo = getValueFromXMLTag(friend, 'photo');
                                    friend_photo = removeCdataCorrectLink(friend_photo);
                                    var friend_name = getValueFromXMLTag(friend, 'friend_name');
                                    html_people += '<div class="event_gallery_pro"><img src="' + friend_photo + '" alt="' + friend_name + '" title="' + friend_name + '" /></div>';
                                }
                                jEvent_people.html(html_people);
                            }
                            else jEvent_people.html('');
                        }
                    , 'undefined', true);
                 $("#myEvent-" + eventId).swipe({ TYPE:'mouseSwipe', HORIZ: true });
                 $("#swipebox-comment-" + eventId).swipe({ TYPE:'mouseSwipe', HORIZ: true });
                }
            }
            else jerror('You have no event at this time. Try add some event at share tab');
        });
    $(".myMemreas").mCustomScrollbar('update');
}
function fetchFriendsMemreas(friendMemreasType){
    var user_id = $("input[name=user_id]").val();
    if (friendMemreasType == 'private'){
            var showPublic = '0';
            var showAccepted = '1';
            var sell_class = 'private-';
        }else{
            var showPublic = '1';
            var showAccepted = '1';
            var sell_class = 'public-';
        } 
    ajaxRequest(
        'viewevents',
        [
            {tag: 'user_id', value: user_id},
            {tag: 'is_my_event', value : '0'},
            {tag: 'is_friend_event', value: showAccepted},
            {tag: 'is_public_event', value: showPublic},
            {tag: 'page', value: '1'},
            {tag: 'limit', value: '20'}
        ], function(response){
            if (friendMemreasType == 'private'){
                if ($(".event_images").hasClass("mCustomScrollbar"))
                    var target_object = ".event_images .mCSB_container";
                else var target_object = ".event_images";
                ajaxScrollbarElement('.event_images');
                $(".event_images .mCSB_container").empty();
            }
            else{
                if ($(".event_images_public").hasClass("mCustomScrollbar"))
                    var target_object = ".event_images_public .mCSB_container";
                else var target_object = ".event_images_public";
                ajaxScrollbarElement('.event_images_public');
                $(".event_images_public .mCSB_container").empty();
            }
            var friendsId = new Array();
            var friends = getSubXMLFromTag(response,  'friend');
            if (getValueFromXMLTag(response, 'status') == "Success"){
                if (friends.length > 0){
                    friends = getSubXMLFromTag(response, 'friend');
                    var friend_count = friends.length;
                    for (var i = 0;i <  friend_count;i++){
                        var friend = friends[i].innerHTML;
                        var creator_id = $(friend).filter('event_creator_user_id').html();
                        if (friendMemreasType == 'private'){
                            var friend_row = 'friendPrivate-' + creator_id;
                        }
                        else var friend_row = 'friendPublic-' + creator_id;
                        if (typeof ($(friend).filter('profile_pic')) != 'undefined'){
                            var profile_img = $(friend).filter('profile_pic').html();
                            profile_img = removeCdataCorrectLink(profile_img);
                        }
                        else profile_img = '/memreas/img/profile-pic.jpg';
                        if (profile_img == '') profile_img = '/memreas/img/profile-pic.jpg';
                        var event_creator = $(friend).filter ('event_creator').html();
                        $(target_object).append ('<div class="event_section"><section class="row-fluid clearfix">' +
                                  '<figure class="pro-pics2"><img class="public-profile-img" src="' + profile_img + '" alt=""></figure>' +
                                  '<aside class="pro-names2">@' + event_creator + '</aside>' +
                                '</section><div id="viewport" class="mouse_swip" onselectstart="return false;">' +
                                                    '<div id="' + friend_row + '" class="swipeclass"></div></div></div>');

                        var global_width = $("#tab-content-memreas").width();
                        var base_event_row_width = 120;

                        var friend_resources = $(friend).filter ('events').html();
                        friend_resources = $(friend_resources).filter ('event');
                        var friend_resources_count = friend_resources.length;

                        var total_event_row_width = 120 * friend_resources_count;

                        if (friend_resources_count > 0){
                            for (var key=0;key < friend_resources_count;key++){
                                var friend_resource = friend_resources[key].innerHTML;
                                var eventId = $(friend_resource).filter('event_id').html();
                                var resource_media = $(friend_resource).filter('event_media_98x78').html();
                                resource_media = removeCdataCorrectLink(resource_media);
                                if (resource_media == '') resource_media = '/memreas/img/small/1.jpg';
                                var event_name = $(friend_resource).filter ('event_name').html();
                                var event_metadata = $(friend_resource).filter ('event_metadata').html();

                                //Check if event is selling or not
                                var sell_price = 0;
                                if (event_metadata != '' && typeof (event_metadata) != 'undefined'){
                                    event_metadata = JSON.parse(event_metadata);
                                    if (typeof (event_metadata.price) != 'undefined'){
                                        if (event_metadata.price != 0)
                                        sell_price = event_metadata.price;
                                    }
                                }
                                if (sell_price ==0)
                                    $("#" + friend_row).append ('<div class="event_img"><img src="' + resource_media + '" alt=""><span class="event_name_box"><a style="color:#FFF;" href="javascript:showEventDetail(\'' + eventId + '\', \'' + creator_id + '\');">!' + event_name + '</a></span></div>');
                                else {
                                    $("#" + friend_row).append ('<div class="event_img" id="' + sell_class + 'selling-' + eventId + '" data-owner="' + creator_id + '" data-click="popupBuyMedia(\'' + eventId + '\', \'' + sell_price + '\', \'' + event_name  + '\');"><div class="sell-event-overlay"></div><span class="sell-event-buyme"><i>checking...</i></span><img src="' + resource_media + '" alt=""><span class="event_name_box"><a style="color:#FFF;" href="javascript:;">!' + event_name + '</a></span></div>');

                                    //Start requesting to pay server for checking event is bought or not
                                    var params = new Object;
                                    params.user_id = LOGGED_USER_ID;
                                    params.event_id = eventId;
                                    var params_json = JSON.stringify(params, null, '\t');
                                    var data = '{"action": "check_own_event", ' +
                                        '"type":"jsonp", ' +
                                        '"json": ' + params_json  +
                                        '}';

                                    var stripeActionUrl = STRIPE_SERVER_URL + '/stripe/checkOwnEvent';
                                    $.ajax({
                                        url: stripeActionUrl,
                                        type: 'POST',
                                        dataType: 'jsonp',
                                        data: 'json=' + data,
                                        success: function(response){
                                            var current_event = response.event_id;
                                            var jElement = $("#" + sell_class + "selling-" + current_event);
                                            if (response.status == 'Success') {
                                                jElement.removeAttr("data-owner").removeAttr("data-click")
                                                    .find("a").attr("href", "javascript:showEventDetail('" + eventId + "', '" + creator_id + "');");
                                                jElement.find(".sell-event-overlay").remove();
                                                jElement.find(".sell-event-buyme").remove();
                                            }
                                            else {
                                                jElement.attr("onclick", jElement.attr("data-click"))
                                                    .removeAttr("data-click").removeAttr("data-owner");
                                                jElement.find(".sell-event-buyme").html("buy me");
                                            }

                                        }
                                    });
                                }
                            }

                            if (total_event_row_width > global_width){
                                $("#" + friend_row).swipe({
                                    TYPE:'mouseSwipe',
                                    HORIZ: true
                                 });
                            }
                        }
                        else{
                            $("#" + friend_row).append ('There is no event shared');
                            $("#" + friend_row).css({'color':'#FFF', 'font-style':'italic', 'margin-bottom':'20px'})
                                .parent("#viewport").removeAttr('id').removeAttr('class');
                        }
                    }
                    $(".event_images_public").mCustomScrollbar('update');
                }
            }
        }
    );
}
function addMemreas(){
    $("a.share").click();
    share_clearMemreas(true);
}