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
    $("a.memreas").click (function(){ fetchMyMemreas(); });
    $("#tabs-memreas li:eq(1) a").click (function(){ fetchFriendsMemreas('private'); });
    $("#tabs-memreas li:eq(2) a").click (function(){ fetchFriendsMemreas('public'); });
});
function fetchMyMemreas(){
    ajaxScrollbarElement('.myMemreas');
    var user_id = $("input[name=user_id]").val();
    $(".myMemreas .mCSB_container").empty();
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
                events = getSubXMLFromTag(response, 'event');
                if ($(".myMemreas").hasClass("mCustomScrollbar"))
                    var target_object = ".myMemreas .mCSB_container";
                else var target_object = ".myMemreas";
                var event_count = events.length;
                for (var i = 0;i < event_count;i++){
                    var event = events[i].innerHTML;
                    var like_count = $(event).filter ('like_count').html();
                    var comment_count = $(event).filter ('comment_count').html();
                    var eventId = $(event).filter ('event_id').html();
                    var event_name = $(event).filter ('event_name').html();
                    var element = '<div class="event_section">' +
                    '<aside class="event_name" onclick="showEventDetail(\'' + eventId + '\', \'' + user_id + '\');" style="cursor: pointer;">' + event_name + '</aside>' +
                    '<div class="event_like"><span>' + like_count + '</span></div>' +
                    '<div class="event_comment"><span>' + comment_count + '</span></div>' +
                    '<div id="event-people-' + eventId + '">' +

                    '</div>' +
                    '<div class="clear"></div>' +
                    '<div id="viewport" onselectstart="return false;">' +
                      '<div id="myEvent-' + eventId + '" class="swipeclass">' +
                      '</div>' +
                    '</div>' +
                    '<div id="viewport" onselectstart="return false;">' +
                      '<div class="swipeclass" id="swipebox-comment-' + eventId + '">' +
                      '</div>' +
                    '</div>' +
                   '</div>';
                    $(target_object).append (element);

                    var event_comments = $(event).filter('comments').html();
                    if (event_comments != ''){
                        var event_comments = getSubXMLFromTag(event_comments, 'comment');
                        for (j = 0;j < comment_count;j++){
                            event_comment = $(event_comments.prevObject[j]).html();
                            if (typeof (event_comment) == 'undefined') continue;
                            var comment_owner_pic = $(event_comment).filter('profile_pic').html();
                            comment_owner_pic = comment_owner_pic.replace("<!--[CDATA[", "").replace("]]-->", "");
                            if (comment_owner_pic == '')
                                comment_owner_pic = '/memreas/img/profile-pic.jpg';
                            var comment_text = $(event_comment).filter('comment_text').html();
                            $("#swipebox-comment-" + eventId).append ('<div class="swipebox_comment">' +
                                          '<div class="event_pro"><img src="' + comment_owner_pic + '"></div>' +
                                          '<textarea class="event_textarea" name="your sign or comments here" cols="" rows=""' +
                                          'onfocus="if(this.value==this.defaultValue)this.value=\'\';"' +
                                          'onblur="if(this.value=="")this.value=this.defaultValue;" readonly="readonly">' + comment_text + '</textarea>' +
                                        '</div>');
                        }
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
                            if (getValueFromXMLTag(response, 'status') == "Success") {
                                var target_element = $("#myEvent-" + $('input[name=temp_event]').val());
                                var medias = getSubXMLFromTag(response, 'media');
                                var eventId = getValueFromXMLTag(response, 'event_id');
                                if (typeof (eventId != 'undefined')){
                                    var media_count = medias.length;
                                    for (var i=0;i < media_count;i++) {
                                        var media = medias[i].innerHTML;
                                        var media_type = $(media).filter('type').html();
                                        var _media_url = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                                        $("#myEvent-" + eventId).append ('<div class="event_img"><img src="' + _media_url + '"/></div>');
                                    }
                                }
                            }
                        }
                    );

                    //Get event people
                    ajaxRequest(
                        'geteventpeople',
                        [{tag: 'event_id', value: eventId}],
                        function(xml_response){
                            if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
                                var response_event_id = getValueFromXMLTag(xml_response, 'event_id');
                                var jEvent_people = $("#event-people-" + response_event_id);
                                var friends = getSubXMLFromTag(xml_response, 'friend');
                                var count_people = friends.length;
                                for (i = 0;i < count_people;i++){
                                    friend = friends[i];
                                    if (getValueFromXMLTag(friend, 'photo') != '' || getValueFromXMLTag(friend, 'photo') != 'null')
                                        friend_photo = '/memreas/img/profile-pic.jpg';
                                    else friend_photo = getValueFromXMLTag(friend, 'photo');
                                    html_str = '<div class="event_gallery_pro"><img src="' + friend_photo + '"></div>';
                                    jEvent_people.append(html_str);
                                }
                            }
                        }
                    );

                 $("#myEvent-" + eventId).swipe({ TYPE:'mouseSwipe', HORIZ: true });
                 $("#swipebox-comment-" + eventId).swipe({ TYPE:'mouseSwipe', HORIZ: true });
                }
            }
        }
    );
    $(".myMemreas").mCustomScrollbar('update');
}
function fetchFriendsMemreas(friendMemreasType){
    var user_id = $("input[name=user_id]").val();
    if (friendMemreasType == 'private')
        showPublic = '0';
    else showPublic = '1';
    ajaxRequest(
        'viewevents',
        [
            {tag: 'user_id', value: user_id},
            {tag: 'is_my_event', value : '0'},
            {tag: 'is_friend_event', value: '1'},
            {tag: 'is_public_event', value: showPublic},
            {tag: 'page', value: '1'},
            {tag: 'limit', value: '20'}
        ], function(response){
            $('#loadingpopup').show();
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
            var friends = $.xml2json(response, true);
            if (getValueFromXMLTag(response, 'status') == "Success"){
                if (typeof (friends.viewevents[0].friends[1]) != "undefined"){
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
                            profile_img = $(friend).filter('profile_pic').html();
                            profile_img = profile_img.replace("<!--[CDATA[", "").replace("]]-->", "");
                        }
                        else profile_img = '/memreas/img/profile-pic.jpg';
                        if (profile_img == '') profile_img = '/memreas/img/profile-pic.jpg';
                        var event_creator = $(friend).filter ('event_creator').html();
                        $(target_object).append ('<section class="row-fluid clearfix">' +
                                  '<figure class="pro-pics2"><img class="public-profile-img" src="' + profile_img + '" alt=""></figure>' +
                                  '<aside class="pro-names2">' + event_creator + '</aside>' +
                                '</section><div id="viewport" class="mouse_swip" onselectstart="return false;">' +
                                                    '<div id="' + friend_row + '" class="swipeclass"></div></div>');

                        var friend_resources = $(friend).filter ('events').html();
                        friend_resources = $(friend_resources).filter ('event');
                        var friend_resources_count = friend_resources.length;
                        for (var key=0;key < friend_resources_count;key++){
                            var friend_resource = friend_resources[key].innerHTML;
                            var eventId = $(friend_resource).filter('event_id').html();
                            var resource_media = $(friend_resource).filter('event_media_98x78').html();
                            resource_media = resource_media.replace("<!--[CDATA[", "").replace("]]-->", "");
                            if (resource_media == '') resource_media = '/memreas/img/small/1.jpg';
                            var event_name = $(friend_resource).filter ('event_name').html();
                            $("#" + friend_row).append ('<div class="event_img"><img src="' + resource_media + '" alt=""><span class="event_name_box"><a style="color:#FFF;" href="javascript:showEventDetail(\'' + eventId + '\', \'' + creator_id + '\');">' + event_name + '</a></span></div>');
                        }
                        $("#" + friend_row).swipe({
                            TYPE:'mouseSwipe',
                            HORIZ: true
                         });
                    }
                    $(".event_images_public").mCustomScrollbar('update');
                }
            }
        }
    );
    $('#loadingpopup').hide();
}
function addMemreas(){
    $("a.share").click();
    share_clearMemreas(true);
}