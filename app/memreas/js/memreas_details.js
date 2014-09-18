var eventdetail_id = '';
var eventdetail_user = '';
var event_owner_name = 'User Name';
var eventdetail_user_pic = '/memreas/img/profile-pic-2.jpg';
var eventdetail_media_id = '';
var current_friendnw_selected = '';
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
        updateMemreasMediaDetailsScript();
        //prevent this tab active if there is no media on this event
        var target_element = $(".memreas-detail-gallery");
        if (target_element.hasClass ('mCustomScrollbar'))
            target_element = $(".memreas-detail-gallery .mCSB_container");
        var checkEmpty = target_element.html();
        if (checkEmpty.trim() == ''){
            jerror('There is no media on this event. Please try adding some first.');
            $("a[title=memreas-detail-tab1]").click();
            return false;
        }

        // example how to integrate with a previewer
        ajaxScrollbarElement(".memreas-detail-comments");
        checkMemreasDetailCarousel();
    });
});

function getMediaComment(){

    var jComment_element = $('.memreas-detail-comments');
    if (jComment_element.hasClass('mCustomScrollbar'))
        jComment_element = $('.memreas-detail-comments .mCSB_container');
    jComment_element.empty();
    jComment_element.html('<li class="clearfix event-owner">' +
                            '<figure class="pro-pics"><img src="' + eventdetail_user_pic + '" alt=""></figure>' +
                            '<div class="pro-names">' + event_owner_name + '</div>' +
                            '<p class="loading" style="clear: both;"><img src="/memreas/img/loading-line.gif" class="loading-small" /></p>' +
                        '</li>');

    //Show event comments
    ajaxRequest('listcomments',
        [
            {tag: 'event_id', value: eventdetail_id},
            {tag: 'media_id', value: eventdetail_media_id},
            {tag: 'limit', value: '100'},
            {tag: 'page', value: '1'}
        ], function(ret_xml){
            var jComment_element = $('.memreas-detail-comments');
            if (jComment_element.hasClass('mCustomScrollbar'))
                jComment_element = $('.memreas-detail-comments .mCSB_container');

            var jComment_popup = $(".commentpopup");
            if (jComment_popup.hasClass('mCustomScrollbar'))
                jComment_popup = $(".commentpopup .mCSB_container");
            jComment_popup.empty();
            jComment_popup.append('<li><p class="loading" style="clear: both;"><img src="/memreas/img/loading-line.gif" class="loading-small" /></p></li>');

            var event_comments = getSubXMLFromTag(ret_xml, 'comment');
            var comment_count = event_comments.length;
            $(".memreas-detail-commentcount span").html(comment_count);
            if (comment_count > 0){
                for (var i = 0;i < comment_count;i++){
                    var event_comment = event_comments[i].innerHTML;
                    var comment_owner_pic = $(event_comment).filter('profile_pic').html();
                    comment_owner_pic = removeCdataCorrectLink(comment_owner_pic);
                    if (comment_owner_pic == '')
                        comment_owner_pic = '/memreas/img/profile-pic.jpg';
                    var comment_text = $(event_comment).filter('comment_text').html();
                    var html_str = '<li>' +
                        '<figure class="pro-pics"><img src="' + comment_owner_pic + '" alt=""></figure>' +
                        '<textarea readonly="readonly">' + comment_text + '</textarea>' +
                        '</li>';
                    var html_popup_str = '<li>' +
                        '<div class="event_pro"><img src="' + comment_owner_pic + '"></div>' +
                        '<textarea name="memreas_popup_comment" cols="" rows=""' +
                        ' readonly="readonly">' +  comment_text + '</textarea>' +
                        '</li>';
                    jComment_element.append(html_str);
                    jComment_popup.append(html_popup_str);
                }
                jComment_element.find('.loading').remove();
                jComment_popup.find('.loading').remove();
                ajaxScrollbarElement('.memreas-detail-comments');
            }
            else{
                jComment_element.append('<li style="color: #FFF;">No comment yet!</li>');
                jComment_popup.append('<li style="color: #FFF;">No comment yet!</li>');
                jComment_element.find('.loading').remove();
                jComment_popup.find('.loading').remove();
            }
        }, 'undefined', true);
}

function updateMemreasMediaDetailsScript(){
    if (!$("#carousel").parent (".elastislide-carousel").length > 0){
        var current = 0;
        $preview = $( '#preview' );
        $carouselEl = $( '#carousel' );
        $carouselItems = $carouselEl.children();
        carousel = $carouselEl.elastislide( {
            current : current,
            minItems : 1,
            onClick : function( el, pos, evt ) {
                $preview.attr( 'src', el.data( 'preview' ) );
                $preview.attr( 'data-preview', el.data( 'preview' ) );
                $carouselItems.removeClass( 'current-img' );
                eventdetail_media_id = el.attr("media-id");
                el.addClass( 'current-img' );
                carousel.setCurrent( pos );
                evt.preventDefault();
                $(".image-preview .swipebox").swipebox();

                //Set download button
                var download_url = el.find('img').attr('src');
                $(".memreas-detail-download").attr("href", download_url);
                $(".memreas-detail-download").attr("download", download_url);

                updateMediaLike();
                getMediaComment();
            },
            onReady : function() {
                el = $carouselItems.eq( current );
                eventdetail_media_id = el.attr("media-id");
                pos = current;
                $preview.attr( 'src', el.data( 'preview' ) )
                $preview.attr( 'data-preview', el.data( 'preview' ) );
                $carouselItems.removeClass( 'current-img' );
                el.addClass( 'current-img' );
                $(".image-preview .swipebox").swipebox();

                //Set download button
                var download_url = el.find('img').attr('src');
                $(".memreas-detail-download").attr("href", download_url);
                $(".memreas-detail-download").attr("download", download_url);
                //$(".memreas-detail-download").swipebox();

                updateMediaLike();
                getMediaComment();
            }
        } );
    }
}

/*
*@ Memreas detail page
*/

//Return to main memreas
$(function(){
    $("a.memreas").click(function(){
        $(".memreas-detail").hide();
        $(".memreas-main").fadeIn(500);
    });

    $(".memreas-detail-download").click(function(){
        var download_url = $(this).attr('download');
        $.post('/index/downloadMedia', {file:download_url}, function(data){

        });
    });
});

function showEventDetail(eventId, userId){
    eventdetail_id = eventId;
    eventdetail_user = userId;

    //Show gallery details
    var target_element = $(".memreas-detail-gallery");
    if (target_element.hasClass ('mCustomScrollbar'))
        target_element = $(".memreas-detail-gallery .mCSB_container");
    target_element.empty();
    $("#tabs-memreas-detail li:eq(0) a").click();

    /* Update details_tab also */
    $(".carousel-memrease-area").empty();
    $(".carousel-memrease-area").append ('<ul id="carousel" class="elastislide-list"></ul>');
    var jcarousel_element = $("ul#carousel");
    jcarousel_element.empty();

    ajaxRequest(
        'listallmedia',
        [
            { tag: 'event_id', value: eventId },
            { tag: 'user_id', value: userId },
            { tag: 'device_id', value: device_id },
            { tag: 'limit',value: media_limit_count },
            { tag: 'page', value: media_page_index }
        ], function (response){
            console.log(response);
            var eventId = getValueFromXMLTag(response, 'event_id');
            if (getValueFromXMLTag(response, 'status') == "Success") {
                var medias = getSubXMLFromTag(response, 'media');
                if (typeof (eventId != 'undefined')){
                    event_owner_name = getValueFromXMLTag(response, 'username');
                    eventdetail_user_pic = getValueFromXMLTag(response, 'profile_pic');
                    eventdetail_user_pic = removeCdataCorrectLink(eventdetail_user_pic);

                    $(".memreas-detail-comments .event-owner .pro-pics img").attr ('src', $("header").find("#profile_picture").attr('src'));
                    $(".memreas-detail-comments .pro-names").html(event_owner_name);

                    var media_count = medias.length;
                    for (var i=0;i < media_count;i++) {
                        var media = medias[i].innerHTML;
                        var _main_media = $(media).filter ('main_media_url').html();
                        _main_media = removeCdataCorrectLink(_main_media);
                        if (_main_media.indexOf ('undefined') >= 0) _main_media = '/memreas/img/large/1.jpg';
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
        }
    );
    $("#popupAddMedia a.accept-btn").attr ("href", "javascript:addMemreasPopupGallery('" + eventId + "')");

    $(".memreas-main").hide();
    $(".memreas-detail").fadeIn(500);
}
function popupVideoPlayer(video_id){
    var media_video_url = $("#" + video_id).attr ('media-url');
    $("#popupplayerMemreas").html('');
    $("#popupplayerMemreas").html('<a id="popupplayerMemreasClose" onClick="disablePopup(\'popupplayerMemreas\')" class=\'popupClose\'>x</a>' +
            '<div id="myElementMemreas">Loading the player...</div>' +
            '<script type="text/javascript" src="/memreas/js/jwplayer/jwplayer.js"></script>' +
            '<script type="text/javascript" src="/memreas/js/jwplayer/jwplayer.html5.js"></script>' +
            '<script type="text/javascript" id="script-init">' +
                'jwplayer("myElementMemreas").setup({' +
                    'file: "' + media_video_url + '",' +
                    'image: "/memreas/img/large-pic-1.jpg"' +
                '});' +
            '</script>');
    popup('popupplayerMemreas');
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
                var medias = getSubXMLFromTag(response, 'media');
                var count_media = medias.length;
                var jtarget_element = $('.popupAddMediaContent');

                if (jtarget_element.hasClass('mCustomScrollbar'))
                    jtarget_element = $('.popupAddMediaContent .mCSB_container');
                jtarget_element.empty();

                for (var json_key = 0;json_key < count_media;json_key++){
                    var media = medias[json_key].innerHTML;
                    var _media_type = $(media).filter ('type').html();
                    var _media_url = getMediaThumbnail(media, '/memreas/img/small-pic-3.jpg');
                    var _media_id = $(media).filter('media_id').html();
                    if (_media_type == 'video'){
                        var _main_video_media = $(media).filter ('main_media_url').html();
                        _main_video_media = removeCdataCorrectLink(_main_video_media);
                        jtarget_element.append('<li class="video-media" media-url="' + _main_video_media + '"><a href="javascript:;" id="memreas-addgallery-' + _media_id + '" onclick="return imageChoosed(this.id);"><img src="' + _media_url + '" alt=""><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a></li>');
                    }
                    else jtarget_element.append('<li><a href="javascript:;" id="memreas-addgallery-' + _media_id + '" onclick="return imageChoosed(this.id);"><img src="' + _media_url + '" alt=""></a></li>');
                }
            }
            else jerror("This is no media");
        }
    );
    popup('popupAddMedia');
    ajaxScrollbarElement(".popupAddMediaContent");
}

function addMemreasPopupGallery(eventId){
    var medias_selected = new Array();
    var user_id = $("input[name=user_id]").val();

    var i = 0;
    $(".popupAddMediaContent li.setchoosed").each(function(){
        medias_selected[++i] = $(this).find ('a').attr ('id');
    });
    var media_id_params = [];
    var increase = 0;
    for (var key = 1;key <= i;key++){
        var media_id = medias_selected[key].replace('memreas-addgallery-', '');
        media_id_params[increase++] = {tag: 'media_id', value: media_id};
    }
    var params = [
                    {tag: 'event_id', value: eventId},
                    {tag: 'media_ids', value: media_id_params}
                ];

    ajaxRequest('addexistmediatoevent', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
            $('#loadingpopup').show();
            setTimeout(function(){ showEventDetail(eventId, $('input[name=user_id]').val()); $('#loadingpopup').hide(); disablePopup('popupAddMedia'); jsuccess('Media added successfully'); }, 2000);
        }
        else jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}
function success_addmemreas_media(){}


$(function(){ $("#memreas-dropfriend").change(function(){ popupMemreasAddfriends(); }); });
function popupMemreasAddfriends(){

    var friend_list = $("#memreas-dropfriend").val();
    //Reset friend element
    friendList = null;
    switch (friend_list){
        case 'fb': getPopupFacebookFriends(); break;
        case 'tw': getPopupTwitterFriends(); break;
        case 'mr': getPopupMemreasFriends(); break;
    }
    if (!$("#popupFriends").is (":visible")) popup('popupFriends');
    ajaxScrollbarElement(".popupContact");
}

function getPopupMemreasFriends(){
    $('#loadingpopup').show();
    var params = [{tag: 'user_id', value: user_id}];
    ajaxRequest('listmemreasfriends', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
            var friends = getSubXMLFromTag(xml_response, 'friend');
            var friendCount = friends.length;
            mr_friendsInfo = [];
            for (var i = 0;i < friendCount;i++){
                var friend = friends[i];
                var friend_photo = '';
                if (getValueFromXMLTag(friend, 'photo') == '' || getValueFromXMLTag(friend, 'photo') == 'null')
                    friend_photo = '/memreas/img/profile-pic.jpg';
                else friend_photo = getValueFromXMLTag(friend, 'photo');
                mr_friendsInfo[i] = {
                                        'id': getValueFromXMLTag(friend, 'friend_id'),
                                        'div_id': 'mrmemreas_' + i,
                                        'name': getValueFromXMLTag(friend, 'friend_name'),
                                        'photo': friend_photo,
                                        'selected': false
                                    };
            }
            memreas_fillFriends(mr_friendsInfo);
            current_friendnw_selected = 'mr';
        }
        //There is no friend
        else {
            jerror("You have no friend on this network.");
            $("#memreas-dropfriend option[value=mr]").attr('selected', true);
        }
    });
}

memreas_clickFriends = function(id) {
    var type = id.substr(0, 2);
    var idx = parseInt(id.substr(3));
    if (isNaN(idx))
        idx = (id.substr(10));

    if (type == "fb") {
        fb_friendsInfo[idx].selected = !fb_friendsInfo[idx].selected;
        if (fb_friendsInfo[idx].selected) {
            $('#' + id + ' img').addClass('setchoosed');
            $('#' + id).next ('aside').css('border', '3px solid green');
        }
        else {
            $('#' + id + ' img').removeClass('setchoosed');
            $('#' + id).next ('aside').css('border', '3px solid #FFF');
        }
    }
    else if (type == "tw") {
        tw_friendsInfo[idx].selected = !tw_friendsInfo[idx].selected;
        if (tw_friendsInfo[idx].selected) {
            $('#' + id + ' img').addClass('setchoosed');
            $('#' + id).next ('aside').css('border', '3px solid green');
        }
        else {
            $('#' + id + ' img').removeClass('setchoosed');
            $('#' + id).next ('aside').css('border', '3px solid #FFF');
        }
    }
    else if(type == "mr"){
        mr_friendsInfo[idx].selected = !mr_friendsInfo[idx].selected;
        if (mr_friendsInfo[idx].selected) {
            $('#' + id + ' img').addClass('setchoosed');
            $('#' + id).next ('aside').css('border', '3px solid green');
        }
        else {
            $('#' + id + ' img').removeClass('setchoosed');
            $('#' + id).next ('aside').css('border', '3px solid #FFF');
        }
    }
    /*
     var jElement = $("#" + id);
     var jImg_profile = jElement.find ('img');
     if (jImg_profile.hasClass ('setchoosed'))
     jImg_profile.removeClass ('setchoosed');
     else jImg_profile.addClass ('setchoosed');
     */
}

function getPopupFacebookFriends(){
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
                current_friendnw_selected = 'fb';
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
                current_friendnw_selected = 'fb';
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
        el += '<figure class="pro-pics2" id="' + info[i].div_id + '" onclick="javascript:memreas_clickFriends(this.id);"><img src="/memreas/img/profile-pic.jpg" alt="" ' + (info[i].selected ? 'class="setchoosed"' : '') + '></figure>';
        el += '<aside class="pro-pic_names2" name="' + info[i].name + '" id="' + info[i].div_id + '" onclick="javascript:memreas_clickFriends(this.id);">' + info[i].name + '</aside>';
        el += '</li>';

        friendList.append(el);
    }

    var imgList = $('.popupContact .mCSB_container li img');

    for (i = 0; i < imgList.length; i++) {
        if (typeof(info[i]) != 'undefined')
            $(imgList[i]).prop('src', info[i].photo);
    }
    $('#popupContact').mCustomScrollbar('update');
}

function getPopupTwitterFriends(){

    $.removeCookie ('twitter_friends');

    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    if (isSafari) {
        jNotify(
        '<div class="notify-box"><p>Click to begin Twitter Authentication </p><br/><a href="javascript:;" class="btn btnPopupTw" onclick="return popupAuthTw(\'memreas_detail\');">Authorize</a>&nbsp;<a href="javascript:;" class="btn" onclick="cancelTwitterFriend();">Close</a></div>',
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
    else{
        $.oauthpopup({
            path: 'twitter',
            callback: function(){
                memreas_TwFriends();
            }
        });
    }
}

function cancelTwitterFriend(){
    $.jNotify._close();
    $("#memreas-dropfriend").val(current_friendnw_selected);
}

function memreas_TwFriends(){
    var friend_list = $.cookie ('twitter_friends');
    if (typeof (friend_list) == 'undefined'){
        $('#loadingpopup').hide();
        jerror ('authentication failed! please try again');
        $("#memreas-dropfriend").val(current_friendnw_selected);
        return false;
    }
    friend_list = JSON.parse (friend_list);
    var friend_count = friend_list.length;
    for (var i = 0;i < friend_count;i++){
        var temp_id = friend_list[i]['div_id'];
        temp_id = temp_id.split ('_');
        friend_list[i]['div_id'] = 'twmemreas_' + temp_id[1];
    }
    tw_friendsInfo = friend_list;
    memreas_fillFriends (friend_list);
    current_friendnw_selected = 'tw';
    $('#loadingpopup').hide();
}

function addFriendToEvent(eventId){
    var groupName    = $('input[name=memreas_groupname]').val();
    var user_id = $("input[name=user_id]").val();
    var selFriends  = [];
    var i = 0, count = 0;

    var emailList 	= splitByDelimeters(getElementValue('memreas_detail_emails'), [',', ';']);
    var emailTags = [];
    if (emailList.length > 0){
        var counter = 0;
        for (i = 0;i < emailList.length;i++){
            emailTags[counter++] = {
                tag: 'email',
                value: emailList[i]
            };
        }
    }

    // get all information of selected friends (facebook and twitter).
    if (fb_friendsInfo) {
        for (i = 0; i < fb_friendsInfo.length; i++) {
            if (fb_friendsInfo[i].selected) {
                selFriends[count++] = {
                    tag: 'friend',
                    value: [
                                { tag: 'friend_name',         value: fb_friendsInfo[i].name },
                                { tag: 'friend_id',         value: fb_friendsInfo[i].id },
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
                                { tag: 'friend_id',         value: tw_friendsInfo[i].id.toString() },
                                { tag: 'network_name',         value: 'twitter' },
                                { tag: 'profile_pic_url',     value: tw_friendsInfo[i].photo }
                            ]
                };
            }
        }
    }

    if (mr_friendsInfo) {
        for (i = 0; i < mr_friendsInfo.length; i++) {
            if (mr_friendsInfo[i].selected) {
                selFriends[count++] = {
                    tag: 'friend',
                    value: [
                                { tag: 'friend_name',         value: mr_friendsInfo[i].name },
                                { tag: 'friend_id',         value: mr_friendsInfo[i].id },
                                { tag: 'network_name',         value: 'memreas' },
                                { tag: 'profile_pic_url',     value: mr_friendsInfo[i].photo }
                            ]
                };
            }
        }
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
            { tag: 'user_id',   value: user_id },
            { tag: 'emails',    value: emailTags},
            { tag: 'event_id',  value: eventId },
            { tag: 'friends',   value: selFriends }
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
function memreasAddComment(){
    var current_user = $("input[name=user_id]").val();
    var comment_txt = $("input[name=comment_txtfield]").val();
    if (comment_txt == '' || comment_txt == 'your comment here'){
        jerror("Please fill your comment");
        return;
    }
    var params = [
                    {tag: "event_id", value: eventdetail_id},
                    {tag: "media_id", value: eventdetail_media_id},
                    {tag: "user_id", value: current_user},
                    {tag: "comments", value: comment_txt},
                    {tag: "audio_media_id", value: ""}
                 ];
    addLoading('.popup-addcomment-text', 'input', '');
    disableButtons("#popupcomment");
    ajaxRequest('addcomments', params, function(ret_xml){

        var jComment_popup = $(".commentpopup");
        if (jComment_popup.hasClass('mCustomScrollbar'))
            jComment_popup = $(".commentpopup .mCSB_container");

        var user_profile = $('#profile_picture').attr('src');
        jComment_popup.prepend('<li>' +
            '<div class="event_pro"><img src="' + user_profile + '"></div>' +
            '<textarea name="memreas_popup_comment" cols="" rows=""' +
            ' readonly="readonly">' + comment_txt + '</textarea>' +
        '</li>');

        $(".commentpopup").mCustomScrollbar("update");
        $(".commentpopup").mCustomScrollbar("scrollTo","top");

        //Add main comment area
        var jComment_element = $('.event-owner');

        jComment_element.after('<li>' +
            '<figure class="pro-pics"><img src="' + user_profile + '" alt=""></figure>' +
            '<textarea readonly="readonly">' + comment_txt + '</textarea>' +
        '</li>');

        $(".memreas-detail-comments").mCustomScrollbar("update");
        $(".memreas-detail-comments").mCustomScrollbar("scrollTo","top");

        $("input[name=comment_txtfield]").val('');
        removeLoading('.popup-addcomment-text');
        enableButtons("#popupcomment");
        jsuccess("your comment added");

        //Update event detail bar
        ajaxRequest(
            'geteventcount',
            [
                {tag: 'event_id', value: eventdetail_id}
            ],function (response){
                var jTargetCommentCount = $(".memreas-detail-commentcount span");
                if (getValueFromXMLTag(response, 'status') == "Success"){
                    var comment_count = getValueFromXMLTag(response, 'comment_count');
                }
                else{
                    var comment_count = 0;
                }
                jTargetCommentCount.html(comment_count);
            }, 'undefined', true);

    }, 'undefined', true);
}
function likeMemreasMedia(){
    var current_user = $("input[name=user_id]").val();
    ajaxRequest('likemedia',
    [
        {tag: "media_id", value: eventdetail_media_id},
        {tag: "user_id", value: current_user},
        {tag: "is_like", value: "1"}
    ]
    , function(ret_xml){
        jsuccess(getValueFromXMLTag(ret_xml, 'message'));
        updateMediaLike();
    });
}
function showPopupComment(){
    $(".comment_txtfield").val('');
    popup('popupcomment');
    ajaxScrollbarElement('.commentpopup');
}

function updateMediaLike(){
    //Update media like total
    var params = [{tag: 'media_id', value: eventdetail_media_id}];
    ajaxRequest('getmedialike', params, function(xml_response){
        $(".memreas-detail-likecount span").html(getValueFromXMLTag(xml_response, 'likes'));
    }, 'undefined', true);
}

function reportMedia(userConfirm){
    if (!userConfirm)
        jconfirm('report this media?', 'reportMedia(true)');
    else{
        ajaxRequest('mediainappropriate',
            [{tag: 'media_id', value: eventdetail_media_id.toString()},{tag: 'is_appropriate', value: '1'}]
        , function(response){

            if (getValueFromXMLTag(response,  'status') == 'Success')
                jsuccess(getValueFromXMLTag(response, 'message'));
            else jerror(getValueFromXMLTag(response, 'message'));
        });
    }
}

/*Additions fixing*/

//Prevent clicking on carousel on detail tab if not enough media with full width
function checkMemreasDetailCarousel(){
    var jDetailMediaScroll = $(".carousel-memrease-area");
    var numberOfChild = jDetailMediaScroll.find("ul#carousel li").length;

    if (numberOfChild < 5){
        $("body").append('<style type="text/css">.carousel-memrease-area navs{ display: none; }</style>');
    }

}

