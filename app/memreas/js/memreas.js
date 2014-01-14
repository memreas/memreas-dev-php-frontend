/*Memreas Scripts - Tran Tuan*/
function get_all_friends(user_id){
    //Get all friend list
    var element_id;
    ajaxRequest(
        'viewallfriends',
        [{
            tag : 'user_id', value : user_id
        }], function(response){
            if ($(".event_images").hasClass("mCustomScrollbar"))
                var target_object = ".event_images .mCSB_container";
            else var target_object = ".event_images";
            var friendsId = new Array();
            var friends = $.xml2json(response, true);
            if (friends.friends[0].status[0].text == "Success"){
                friends = friends.friends[0].friend;
                for (var json_key in friends){
                    if (friends[json_key].social_username[0].text != 'trying gh'){
                        $(target_object).append ('<section class="row-fluid clearfix">' +
                              '<figure class="pro-pics2"><img src="/memreas/img/profile-pic-2.jpg" alt=""></figure>' +
                              '<aside class="pro-names2">' + friends[json_key].social_username[0].text + '</aside>' +
                            '</section>');
                        element_id = friends[json_key].social_username[0].text;
                        element_id = element_id.replace (' ', '-');
                        $(target_object).append ('<div id="viewport" class="mouse_swip" onselectstart="return false;">' +
                                                '<div id="mouseSwipe-' + element_id + '" class="swipeclass"></div></div>');
                        listFriendMedia (friends[json_key].friend_id[0].text, element_id);
                    }
                }
            }
        }
    );
}
function listFriendMedia(user_id, element_id){
    ajaxRequest(
            'listallmedia',
            [
                {tag: 'event_id', value : ''},
                {tag: 'user_id', value: user_id},
                {tag: 'device_id', value: ''},
                {tag: 'limit', value: 200},
                {tag: 'page', value: ''}
            ], function (response){
                response = $.xml2json(response, true);
                medias = response.listallmediaresponse[0].medias[0].media;
                for (var media_key in medias){
                    $("#mouseSwipe-" + element_id).append ('<div class="event_img"><a href="' + medias[media_key].main_media_url[0].text + '" class="swipebox" title="photo-1"><img src="' + medias[media_key].main_media_url[0].text + '" alt=""></a></div>');
                }
                $("#mouseSwipe-" + element_id).swipe({
                    TYPE:'mouseSwipe',
                    HORIZ: true
                  });
            }
        );
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