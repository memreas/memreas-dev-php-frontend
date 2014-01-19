/*Memreas Scripts - Tran Tuan*/
$(function(){
    $("a.memreas").click (function(){ fetchMyMemreas(); });
    $("#tabs-memreas li:eq(1) a").click (function(){ fetchFriendsMemreas('private'); });
    $("#tabs-memreas li:eq(2) a").click (function(){ fetchFriendsMemreas('public'); });
});
function fetchMyMemreas(){
    var user_id = $("input[name=user_id]").val();
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
            var events = $.xml2json(response, true);
            if (events.viewevents[0].status[0].text == "Success"){
                if (!($("#memreas-tab1").find ('input[name=temp_event]').length > 0))
                    $("#memreas-tab1").append ('<input type="hidden" name="temp_event" value="0">');
                events = events.viewevents[0].events[0].event;
                if ($(".myMemreas").hasClass("mCustomScrollbar"))
                    var target_object = ".myMemreas .mCSB_container";
                else var target_object = ".myMemreas";
                for (var json_key in events){
                    $('input[name=temp_event]').val (events[json_key].event_id[0].text);
                    var element = '<div class="event_section">' +
                    '<aside class="event_name">' + events[json_key].event_name[0].text + '</aside>' +
                    '<div class="event_like"></div>' +
                    '<div class="event_comment"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                    '<div class="event_gallery_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                    '<div class="clear"></div>' +
                    '<div id="viewport" onselectstart="return false;">' +
                      '<div id="myEvent-' + events[json_key].event_id[0].text + '" class="swipeclass">' +
                      '</div>' +
                    '</div>' +
                    '<div id="viewport" onselectstart="return false;">' +
                      '<div id="mouseSwipeScroll2" class="swipeclass">' +
                        '<div class="swipebox_comment">' +
                          '<div class="event_pro"><img src="/memreas/img/profile-pic.jpg"></div>' +
                          '<textarea class="event_textarea" name="your sign or comments here" cols="" rows=""' +
                          'onfocus="if(this.value==this.defaultValue)this.value=\'\';"' +
                          'onblur="if(this.value=="")this.value=this.defaultValue;">your sign or comments here</textarea>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                   '</div>';
                    $(target_object).append (element);

                    ajaxRequest(
                        'listallmedia',
                        [
                            { tag: 'event_id',                 value: $('input[name=temp_event]').val() },
                            { tag: 'user_id',                 value: user_id },
                            { tag: 'device_id',             value: device_id },
                            { tag: 'limit',                 value: media_limit_count },
                            { tag: 'page',                     value: media_page_index }
                        ], function (response){
                            response = $.xml2json(response, true);
                            if (response.listallmediaresponse[0].medias[0].status[0].text == "Success") {
                                var target_element = $("#myEvent-" + $('input[name=temp_event]').val());
                                var data = response.listallmediaresponse[0].medias[0].media;
                                for (var json_key in data) {
                                    var _media_url = data[json_key].main_media_url[0].text;
                                    $("#myEvent-" + $('input[name=temp_event]').val()).append ('<div class="event_img"><img src="' + _media_url + '"/></div>');
                                }
                            }
                        }
                    );

                 $("#myEvent-" + events[json_key].event_id[0].text).swipe({
                        TYPE:'mouseSwipe',
                        HORIZ: true
                     });
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
            }
            else{
                if ($(".event_images_public").hasClass("mCustomScrollbar"))
                    var target_object = ".event_images_public .mCSB_container";
                else var target_object = ".event_images_public";
            }
            //if ($(target_object).html() != '') return false;
            var friendsId = new Array();
            var friends = $.xml2json(response, true);
            if (friends.viewevents[0].status[0].text == "Success"){
                if (typeof (friends.viewevents[0].friends[1]) != "undefined"){
                    friends = friends.viewevents[0].friends[1].friend;
                    for (var json_key in friends){
                        element_id = friends[json_key].event_creator[0].text;
                        element_id = element_id.replace (' ', '-');
                        if (friendMemreasType == 'private'){
                            var friend_row = 'mouseSwipe-' + element_id;
                        }
                        else var friend_row = 'mouseSwipePublic-' + element_id;
                        $(target_object).append ('<section class="row-fluid clearfix">' +
                                  '<figure class="pro-pics2"><img src="/memreas/img/profile-pic-2.jpg" alt=""></figure>' +
                                  '<aside class="pro-names2">' + friends[json_key].event_creator[0].text + '</aside>' +
                                '</section><div id="viewport" class="mouse_swip" onselectstart="return false;">' +
                                                    '<div id="' + friend_row + '" class="swipeclass"></div></div>');
                        var friend_resources = friends[json_key].events[0].event;
                        for (var key in friend_resources){
                            $("#" + friend_row).append ('<div class="event_img"><img src="' + friend_resources[key].event_media_98x78[0].text + '" alt=""><span class="event_name_box">' + friend_resources[key].event_name[0].text + '</span></div>');
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
   /*if (friendMemreasType == 'private'){
        if (!$(".event_images").hasClass("mCustomScrollbar")){
            $(".event_images").mCustomScrollbar(
                        {scrollButtons:{enable:true }}
            );
        }
        $(".event_images").mCustomScrollbar ('update');
    }
    else{
        if (!$(".event_images_public").hasClass("mCustomScrollbar")){
            $(".event_images_public").mCustomScrollbar(
                        {scrollButtons:{enable:true }});
        }
        $(".event_images_public").mCustomScrollbar('update');
    }*/
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