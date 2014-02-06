/*Memreas Scripts - Tran Tuan*/
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
                    var eventId = $(event).filter ('event_id').html();
                    var event_name = $(event).filter ('event_name').html();
                    var element = '<div class="event_section">' +
                    '<aside class="event_name" onclick="showEventDetail(\'' + eventId + '\');" style="cursor: pointer;">' + event_name + '</aside>' +
                    '<div class="event_like"></div>' +
                    '<div class="event_comment"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
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
                                        var _media_url = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                                        $("#myEvent-" + eventId).append ('<div class="event_img"><img src="' + _media_url + '"/></div>');
                                        $("#swipebox-comment-" + eventId).append ('<div class="swipebox_comment">' +
                                          '<div class="event_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                                          '<textarea class="event_textarea" name="your sign or comments here" cols="" rows=""' +
                                          'onfocus="if(this.value==this.defaultValue)this.value=\'\';"' +
                                          'onblur="if(this.value=="")this.value=this.defaultValue;">your sign or comments here</textarea>' +
                                        '</div>');
                                    }
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
                            var friend_row = 'mouseSwipe-' + creator_id;
                        }
                        else var friend_row = 'mouseSwipePublic-' + creator_id;
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
                                '</section><div id="viewport" onselectstart="return false;">' +
                                                    '<div id="' + friend_row + '" class="swipeclass"></div></div>');

                        var friend_resources = $(friend).filter ('events').html();
                        friend_resources = $(friend_resources).filter ('event');
                        var friend_resources_count = friend_resources.length;
                        for (var key =0;key < friend_resources_count;key++){
                            var friend_resource = friend_resources[key].innerHTML;
                            var resource_media = $(friend_resource).filter('event_media_98x78').html();
                            resource_media = resource_media.replace("<!--[CDATA[", "").replace("]]-->", "");
                            if (resource_media == '') resource_media = '/memreas/img/small/1.jpg';
                            var event_name = $(friend_resource).filter ('event_name').html();
                            $("#" + friend_row).append ('<div class="event_img"><img src="' + resource_media + '" alt=""><span class="event_name_box">' + event_name + '</span></div>');
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
$(document).ready(function () {

  $(document).bind("dragstart", function() { return false; });

    $('#mouseSwipeScroll').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll2').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll3').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll4').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
   $('#mouseSwipeScroll5').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
   $('#mouseSwipeScroll6').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll7').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
   $('#mouseSwipeScroll8').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
   $('#mouseSwipeScroll9').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll10').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll11').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll12').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll13').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll14').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll15').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll16').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll17').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll18').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll19').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll20').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll21').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll22').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll23').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll24').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll25').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
  $('#mouseSwipeScroll26').swipe({
    TYPE:'mouseSwipe',
    HORIZ: true
  });
});