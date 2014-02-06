// example how to integrate with a previewer
var current = 0,
    $preview = $( '#preview' ),
    $carouselEl = $( '#carousel' ),
    $carouselItems = $carouselEl.children(),
    carousel = $carouselEl.elastislide( {
        current : current,
        minItems : 3,
        onClick : function( el, pos, evt ) {

            changeImage( el, pos );
            evt.preventDefault();

        },
        onReady : function() {

            changeImage( $carouselItems.eq( current ), current );

        }
    } );

function changeImage( el, pos ) {

    $preview.attr( 'src', el.data( 'preview' ) );
    $carouselItems.removeClass( 'current-img' );
    el.addClass( 'current-img' );
    carousel.setCurrent( pos );

}
$(function(){
        $("ul.scrollClass").mCustomScrollbar({
                scrollButtons:{
                    enable:true
                }
        });
        $("#tab-content-memreas-detail div.hideCls").hide(); // Initially hide all content
        $("#tabs-memreas-detail li:first").attr("id","current"); // Activate first tab
        $("#tab-content-memreas-detail div:first").fadeIn(); // Show first tab content*/

        $('#tabs-memreas-detail a').click(function(e) {

            e.preventDefault();
            $("#tab-content-memreas-detail div.hideCls").hide(); //Hide all content
            $("#tabs-memreas-detail li").attr("id",""); //Reset id's
            $(this).parent().attr("id","current"); // Activate this
            $('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
        });
        $("a[title=memreas-detail-tab3]").click(function(){
            // example how to integrate with a previewer
            var current = 0,
            $preview = $( '#preview' ),
            $carouselEl = $( '#carousel' ),
            $carouselItems = $carouselEl.children(),
            carousel = $carouselEl.elastislide( {
                current : current,
                minItems : 3,
                onClick : function( el, pos, evt ) {
                    $preview.attr( 'src', el.data( 'preview' ) );
                    $carouselItems.removeClass( 'current-img' );
                    el.addClass( 'current-img' );
                    carousel.setCurrent( pos );
                    evt.preventDefault();

                },
                onReady : function() {
                    el = $carouselItems.eq( current );
                    pos = current;
                    //changeImage( $carouselItems.eq( current ), current );
                    $preview.attr( 'src', el.data( 'preview' ) );
                    $carouselItems.removeClass( 'current-img' );
                    el.addClass( 'current-img' );
                    carousel.setCurrent( pos );
                }
            } );
            $(".memreas-detail-comments").mCustomScrollbar({
                    scrollButtons:{
                        enable:true
                    }
            });
        });
});

/*
*@ Memreas detail page
*/

//Return to main memreas
$(function(){
    $("a.memreas").click(function(){
        $(".memreas-detail").hide();
        $(".memreas-main").fadeIn(500);
    });
});

function showEventDetail(eventId){
    $('#loadingpopup').show();
    user_id = $("input[name=user_id]").val();
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
                var target_element = $(".memreas-detail-gallery");
                if (target_element.hasClass ('mCustomScrollbar'))
                    target_element = $(".memreas-detail-gallery .mCSB_container");
                var medias = getSubXMLFromTag(response, 'media');
                var eventId = getValueFromXMLTag(response, 'event_id');
                if (typeof (eventId != 'undefined')){
                    var media_count = medias.length;
                    for (var i=0;i < media_count;i++) {
                        var media = medias[i].innerHTML;
                        var _media_url = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                        var _media_type = $(media).filter ('type').html();

                        if (_media_type == 'video'){
                            var temp_url = _media_url.split ('media');
                            _media_url = temp_url[0] + 'media/web' + temp_url[1];
                            var mediaThumbnail = $(media).filter ('media_url_448x306').html();
                            mediaThumbnail = mediaThumbnail.replace("<!--[CDATA[", "").replace("]]-->", "");
                            var mediaId = $(media).filter ('media_id').html();
                            $.post('/index/buildvideocache', {video_url:_media_url, thumbnail:mediaThumbnail, media_id:mediaId}, function(response_data){
                                response_data = JSON.parse (response_data);
                                //target_element.append('<li><a data-video="true" href="/memreas/js/jwplayer/jwplayer_cache/' + response_data.video_link + '"><img src="' + response_data.thumbnail + '"/></a></li>');
                                target_element.append('<li>href="#" id="button" onClick="popup(\'popupplayer\');"><img src="' + response_data.thumbnail + '"/></a></li>');
                            });
                        }
                        else target_element.append ('<li><a href="' + _media_url + '" class="swipebox" title="photo-2"><img src="' + _media_url + '" alt=""></a></li>');
                    }
                    $(".memreas-addfriend-btn").attr ('href', "javascript:addFriendToEvent('" + eventId + "');");
                }
            }
            ajaxScrollbarElement(".memreas-detail-gallery");
            $(".memreas-detail-gallery .swipebox").swipebox()
        }
    );
    $("#popupContact a.accept-btn").attr ("href", "javascript:addMemreasPopupGallery('" + eventId + "')");
    $(".memreas-main").hide();
    $('#loadingpopup').hide();
    $(".memreas-detail").fadeIn(500);
}

function popupAddMemreasGallery(){
    ajaxRequest('listallmedia',
        [
            {tag: 'event_id', value: ''},
            {tag: 'user_id', value: user_id},
            {tag: 'device_id', value : ''},
            {tag: 'limit', value: '200'},
            {tag: 'page', value: '1'}
        ], function (response){
            if (getValueFromXMLTag(response, 'status') == "Success") {
                medias = getSubXMLFromTag(response, 'media');
                var count_media = medias.length;
                var jtarget_element = $('.popupContact2');
                if (jtarget_element.hasClass('mCustomScrollbar'))
                    jtarget_element = $('.popupContact2 .mCSB_container');
                jtarget_element.empty();
                for (var json_key = 0;json_key < count_media;json_key++){
                    var media = medias[json_key].innerHTML;
                    var _media_type = $(media).filter ('type').html();
                    var _media_url = getMediaThumbnail(media, '/memreas/img/small-pic-3.jpg');
                    var _media_id = $(media).filter('media_id').html();
                    jtarget_element.append('<li><a href="javascript:;" id="memreas-addgallery-' + _media_id + '" onclick="return imageChoosed(this.id);"><img src="' + _media_url + '" alt=""></a></li>');
                }
            }
        }
    );
    popup('popupContact');
    ajaxScrollbarElement(".popupContact2");
}

function addMemreasPopupGallery(eventId){
    var medias_selected = new Array();
    var user_id = $("input[name=user_id]").val();
    var i = 0;
    $(".popupContact2 li.setchoosed").each(function(){
        medias_selected[++i] = $(this).find ('a').attr ('id');
    });
    for (key = 1;key <= i;key++){
        var media_url = $("#" + medias_selected[key]).find ('img').attr('src');
        var media_name = media_url.split ('/');
        media_name = media_name[(media_name.length) - 1];
        var correct_media_url = media_url.split ('media');
        media_url = user_id + '/media' + correct_media_url[1];
        params = [
            {tag: 's3url', value: media_url},
            {tag: 'is_server_image', value: '0'},
            {tag: 'content_type', value: 'image/png'},
            {tag: 's3file_name', value: media_name},
            {tag: 'device_id', value: ''},
            {tag: 'event_id', value: eventId},
            {tag: 'media_id', value: medias_selected[i]},
            {tag: 'user_id', value: user_id},
            {tag: 'is_profile_pic', value: '0'},
            {tag: 'location', value: ''}
        ];
        ajaxRequest('addmediaevent', params, success_addmemreas_media);
    }
    $('#loadingpopup').show();
    setTimeout(function(){ showEventDetail(eventId); $('#loadingpopup').hide(); disablePopup('popupContact'); jsuccess('Media added successfully'); }, 2000);
}
function success_addmemreas_media(){}


$(function(){ $("#memreas-dropfriend").change(function(){ popupMemreasAddfriends(); }); });
function popupMemreasAddfriends(){
    var friend_list = $("#memreas-dropfriend").val();
    switch (friend_list){
        case 'fb': getPopupFacebookFriends(); break;
        case 'tw': getPopupTwitterFriends(); break;
    }
    if (!$("#popupFriends").is (":visible")) popup('popupFriends');
    ajaxScrollbarElement(".popupContact");
}

function getPopupFacebookFriends(){
    var FACEBOOK_APPID             = '642983449085789';
    var FACEBOOK_SECRETCODE     = '47bfc45d191ef7dda0e2ebbf43b70a64';
    var FACEBOOK_FRIENDSLIMIT     = 500
    $('#loadingpopup').show();
    FB.init({ appId: FACEBOOK_APPID,
        status: true,
        cookie: true,
        xfbml: true,
        oauth: true
    });
    function getFacebookInfo(response) {
        var button = document.getElementById('fb-auth');
        if (response.authResponse) { // in case if we are logged in
            var userInfo = document.getElementById('user-info');
            FB.api('/me', function(response) {
                fb_accountInfo = {
                    'id':         response.id,
                    'name':     response.name,
                    'photo':     'https://graph.facebook.com/' + response.id + '/picture'
                };
            });

            // get friends
            FB.api('/me/friends?limit=' + FACEBOOK_FRIENDSLIMIT, function(response) {
                var i = 0, info = response.data.sort(sortMethod);
                fb_friendsInfo = [];
                for (i = 0; i < info.length; i++) {
                    fb_friendsInfo[i] = {
                        'id':         info[i].id,
                        'div_id':    'fbmemreas_' + i,
                        'name':     info[i].name,
                        'photo':     'https://graph.facebook.com/' + info[i].id + '/picture',
                        'selected':    false
                    }
                }
                memreas_fillFriends(fb_friendsInfo);
                $('#loadingpopup').hide();
            });
        }
        else $('#loadingpopup').hide();
    }

    // run once with current status and whenever the status changes
    FB.getLoginStatus(getFacebookInfo);
    FB.login(function(response) {
        if (response.authResponse) {
        // get friends
            FB.api('/me/friends?limit=' + FACEBOOK_FRIENDSLIMIT, function(response) {
                var i = 0, info = response.data.sort(sortMethod);
                fb_friendsInfo = [];

                for (i = 0; i < info.length; i++) {
                    fb_friendsInfo[i] = {
                        'id':         info[i].id,
                        'div_id':    'fbmemreas_' + i,
                        'name':     info[i].name,
                        'photo':     'https://graph.facebook.com/' + info[i].id + '/picture',
                        'selected':    false
                    }
                }
                memreas_fillFriends(fb_friendsInfo);
                $('#loadingpopup').hide();
            });
        }
        else $('#loadingpopup').hide();
    }, {scope:'email'});
}

function memreas_fillFriends(info){
    if (friendList == null)
        friendList = $('.popupContact .mCSB_container');

    friendList.empty();

    var i = 0, el;

    for (i = 0; i < info.length; i++) {
        el = '';
        el += '<li>';
        el += '<figure class="pro-pics2" id="' + info[i].div_id + '" onclick="javascript:share_clickFriends(this.id);"><img src="/memreas/img/profile-pic.jpg" alt="" ' + (info[i].selected ? 'class="setchoosed"' : '') + '></figure>';
        el += '<aside class="pro-pic_names2" name="' + info[i].name + '" id="a' + info[i].div_id + '" onclick="javascript:share_clickFriends(this.id.substr(1));">' + info[i].name + '</aside>';
        el += '</li>';

        friendList.append(el);
    }

    var imgList = $('.popupContact .mCSB_container li img');

    for (i = 0; i < imgList.length; i++) {
        $(imgList[i]).prop('src', info[i].photo);
    }
    $('#popupContact').mCustomScrollbar('update');
}

function getPopupTwitterFriends(){
    $.removeCookie ('twitter_friends');
    $.oauthpopup({
        path: 'twitter',
        callback: function(){
            memreas_TwFriends();
        }
    });
}

function memreas_TwFriends(){
    var friend_list = $.cookie ('twitter_friends');
    if (typeof (friend_list) == 'undefined'){
        $('#loadingpopup').hide();
        jerror ('authentication failed! please try again');
        return false;
    }
    friend_list = JSON.parse (friend_list);
    var friend_count = friend_list.length;
    for (i = 0;i < friend_count;i++){
        temp_id = friend_list[i]['div_id'];
        temp_id = temp_id.split ('_');
        friend_list[i]['div_id'] = 'twmemreas_' + temp_id[1];
    }
    tw_friendsInfo = friend_list;
    memreas_fillFriends (friend_list);
    $('#loadingpopup').hide();
}

function addFriendToEvent(eventId){
    var groupName    = $('input[name=memreas_groupname]').val();
    var user_id = $("input[name=user_id]").val();
    var selFriends  = [];
    var i = 0, count = 0;

    // get all information of selected friends (facebook and twitter).
    if (fb_friendsInfo) {
        for (i = 0; i < fb_friendsInfo.length; i++) {
            if (fb_friendsInfo[i].selected) {
                selFriends[count++] = {
                    tag: 'friend',
                    value: [
                                { tag: 'friend_name',         value: fb_friendsInfo[i].name },
                                { tag: 'network_name',         value: 'facebook' },
                                { tag: 'profile_pic_url',     value: fb_friendsInfo[i].photo }
                            ]
                };
            }
        }
    }

    if (tw_friendsInfo) {
        for (i = 0; i < tw_friendsInfo.length; i++) {
            if (tw_friendsInfo[i].selected) {
                selFriends[count++] = {
                    tag: 'friend',
                    value: [
                                { tag: 'friend_name',         value: tw_friendsInfo[i].name },
                                { tag: 'network_name',         value: 'twitter' },
                                { tag: 'profile_pic_url',     value: tw_friendsInfo[i].photo }
                            ]
                };
            }
        }
    }
    var friendSelected = selFriends.length;
    if (friendSelected <= 0){
        jerror ("Please select your friend to add");
        return;
    }
    if ($("#memreas_makegroup_check").is (":checked")){
        if (groupName != '' && groupName.toLowerCase() != 'group name here'){
            // send the request.
            ajaxRequest(
                'creategroup',
                [
                    { tag: 'group_name',     value: groupName },
                    { tag: 'user_id',         value: user_id },
                    { tag: 'friends',         value: selFriends }
                ],
                function(ret_xml) {
                    // parse the returned xml.
                    var status   = getValueFromXMLTag(ret_xml, 'status');
                    var message  = getValueFromXMLTag(ret_xml, 'message');
                    if (status.toLowerCase() == 'success')
                        jsuccess('group was created successfully.');
                    else jerror(message);
                }
            );
        }
        else{
            jerror ("Please enter group name");
            return;
        }
    }

    //Add friend to event
    // send the request.
    ajaxRequest(
        'addfriendtoevent',
        [
            { tag: 'user_id',         value: user_id },
            { tag: 'event_id',         value: eventId },
            { tag: 'friends',         value: selFriends }
        ],
        function(ret_xml) {
            // parse the returned xml.
            var status   = getValueFromXMLTag(ret_xml, 'status');
            var message  = getValueFromXMLTag(ret_xml, 'message');
            if (status.toLowerCase() == 'success') {
                jsuccess('your friends added successfully.');
                $(".popupContact li").each (function(){ $(this).removeClass ('setchoosed');});
            }
            else jerror(message);
        }
    );
}