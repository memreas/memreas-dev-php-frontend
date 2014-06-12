/*
* Server side
*/
//Check if user not logged
$(function(){
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
            }
            else jerror (getValueFromXMLTag(xml_response, 'messsage'));
        });
    }

    $("a[title=gallery]").click(function(){ $("#gallery #tabs a[title=tab1]").click(); });

    $(".aviary-tab").click(function(){
        if (detectHandheldIOSDevice())
            aviarySpace('get');
        if (!($(".aviary-thumbs").parent(".elastislide-carousel").length > 0))
            $('.aviary-thumbs').elastislide();
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
/*Preload for server media*/
jQuery.fetch_server_media = function (){
    $(".user-resources").remove();
    $("#tab-content #tab1").append('<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/325" data-max-width="100%"  data-allow-full-screen="true"  data-nav="thumbs"></div>');
    $(".edit-area-scroll, .aviary-thumbs, .galleries-location").empty();
    $(".user-resources, .scrollClass .mCSB_container, .sync .mCSB_container").html('');
    $("#loadingpopup").show();
    ajaxRequest('listallmedia',
        [
            {tag: 'event_id', value: ''},
            {tag: 'user_id', value: user_id},
            {tag: 'device_id', value : ''},
            //Added jmeah - checking jwplayer rtmp - 2-APR-2014
            {tag: 'rtmp', value : 'true'},
            {tag: 'limit', value: '200'},
            {tag: 'page', value: '1'}
        ], function (response){
            if (getValueFromXMLTag(response, 'status') == "Success") {
                medias = getSubXMLFromTag(response, 'media');
                $(".user-resources, .scrollClass .mCSB_container, .sync-content .scrollClass").html('');
                var count_media = medias.length;
                for (var json_key = 0;json_key < count_media;json_key++){
                    var media = medias[json_key].innerHTML;
                    var _media_type = $(media).filter ('type').html();
                    var _media_url = $(media).filter ('main_media_url').html();
                    _media_url = _media_url.replace("<!--[CDATA[", "").replace("]]-->", "");
                    var mediaId = $(media).filter ('media_id').html();
                    //Build video thumbnail
                    if (_media_type == 'video'){
                        userBrowser = detectBrowser();
                        //Check if ios device
                        if (userBrowser[0].ios == 1){
                            _media_url = $(media).filter('media_url_hls').html();
                            _hls_media = 1;
                            if (typeof (_media_url) != 'undefined'){
                                _mp4_media = $(media).filter('media_url_1080p').html();
                                _mp4_media = _mp4_media.replace("<!--[CDATA[", "").replace("]]-->", "");
                            }
                        }
                        else {
                            _media_url = $(media).filter('media_url_1080p').html();
                            _mp4_media = '';
                            _hls_media = 0;
                        }

                        //Ignore if has no enough info or media is corrupted
                        if (typeof (_media_url) != 'undefined'){
                            _media_url = _media_url.replace("<!--[CDATA[", "").replace("]]-->", "");
                            var temp_url = _media_url.split ('media');
                            var mediaThumbnail = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                            $.post('/index/buildvideocache', {video_url:_media_url, thumbnail:mediaThumbnail, media_id:mediaId, hls_media:_hls_media, mp4_media:_mp4_media}, function(response_data){
                                response_data = JSON.parse (response_data);
                                $(".user-resources").append('<a data-video="true" href="/memreas/js/jwplayer/jwplayer_cache/' + response_data.video_link + '"><img src="' + response_data.thumbnail + '"/></a>');
                                $(".edit-area-scroll").append ('<li class="video-media"><a class="video-resource image-sync" id="' + response_data.media_id + '" onclick="return imageChoosed(this.id);" href="' + response_data.thumbnail + '"><img src="' + response_data.thumbnail + '"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a><img src="/memreas/img/gallery-select.png"></li>');
                            });
                        }
                        else $(".edit-area-scroll").append ('<li class="video-media"><a class="video-resource image-sync" id="' + mediaId + '" onclick="return imageChoosed(this.id);" href="/memreas/img/large-pic-1.jpg"><img src="/memreas/img/large-pic-1.jpg"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a><img src="/memreas/img/gallery-select.png"></li>');
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

                    //If there is no media hide edit & delete tabs
                    $("a[title=tab2], a[title=tab3]").hide();
                    $("#gallery #tabs").find("li").removeClass('current');
                    $("#gallery #tabs").find("li:eq(0)").addClass('current');

                    $("#gallery #tab-content").find(".hideCls").hide();
                    $("#gallery #tab-content").find(".hideCls:eq(0)").show();

                }
                $("#loadingpopup").hide();
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