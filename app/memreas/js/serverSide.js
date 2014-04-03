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
                var username = getValueFromXMLTag(xml_response, 'username');
                var userprofile = getValueFromXMLTag(xml_response, 'profile');
                var username_length = username.length;
                if (username_length > 10){
                    username = username.substring(0, 10) + '...';
                }
                $("header").find(".pro-name").html(username);
                $("#setting-username").html(username);
                if (userprofile != '')
                    $("header").find("#profile_picture").attr('src', userprofile);
                    $("#setting-userprofile img").attr('src', userprofile);
            }
            else jerror (getValueFromXMLTag(xml_response, 'messsage'));
        });
    }
});

/*Preload for server media*/
jQuery.fetch_server_media = function (){
    $(".user-resources, .edit-area").remove();
    $("#tab-content #tab1").append ('<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/325" data-max-width="100%"  data-allow-full-screen="true"  data-nav="thumbs"></div>');
    $("#tab-content #tab2").append('<div class="edit-area"><ul id="content_1" class="pics edit-area-scroll scroll-area"><div class="first-element"></div></ul><div style="clear: both;"></div><a class="black_btn_skin" href="javascript:;" onclick="deleteFiles();">Delete</a>&nbsp;<a class="black_btn_skin" href="javascript:;" id="btn-upload" onclick="$(\'a[title=queue]\').click();">Upload</a></div>');
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
                        var temp_url = _media_url.split ('media');
                        _media_url = temp_url[0] + 'media/web' + temp_url[1];
                        var mediaThumbnail = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                        $.post('/index/buildvideocache', {video_url:_media_url, thumbnail:mediaThumbnail, media_id:mediaId}, function(response_data){
                            response_data = JSON.parse (response_data);
                            $(".user-resources").append('<a data-video="true" href="/memreas/js/jwplayer/jwplayer_cache/' + response_data.video_link + '"><img src="' + response_data.thumbnail + '"/></a>');
                            $(".edit-area-scroll .first-element").append ('<li class="video-media"><a class="video-resource image-sync" id="' + response_data.media_id + '" onclick="return imageChoosed(this.id);" href="' + response_data.thumbnail + '"><img src="' + response_data.thumbnail + '"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a><img src="/memreas/img/gallery-select.png"></li>');
                        });
                    }
                    else {
                        $(".user-resources").append('<img src="' + _media_url + '"/>');
                        $(".edit-area-scroll .first-element").append ('<li><a class="image-sync" id="' + mediaId + '" onclick="return imageChoosed(this.id);" href="' + _media_url + '"><img src="' + _media_url + '"/></a></li>');
                    }
                  }
                  setTimeout(function(){
                      $(".user-resources").fotorama({width: '800', height: '350', 'max-width': '100%'});
                      if (!$(".edit-area-scroll").hasClass ('mCustomScrollbar'))
                          $(".edit-area-scroll").mCustomScrollbar({ scrollButtons:{ enable:true }});
                      $(".edit-area-scroll").mCustomScrollbar ('update');
                  }, 1000);
                  $(".swipebox").swipebox();
                }
                else
                    jerror ('There is no media on your account! Please use upload tab on leftside you can add some resources!');
                $("#loadingpopup").hide();
                return true;
            }
    );
}