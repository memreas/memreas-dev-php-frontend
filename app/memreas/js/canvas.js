/*
* Script for canvas page
* */
$(function(){
    $(".user-resources").hide();
    $(".preload-files .pics").empty().show();
    //Fetch the resources
    ajaxRequest('listallmedia',
        [
            {tag: 'event_id', value: global_event_id},
            {tag: 'user_id', value: ''},
            {tag: 'device_id', value : ''},
            {tag: 'rtmp', value : 'true'},
            {tag: 'limit', value: '200'},
            {tag: 'page', value: '1'},
            {tag: 'metadata', value: '1'}
        ], function (response){
            if (getValueFromXMLTag(response, 'status') == "Success") {

                var medias = getSubXMLFromTag(response, 'media');
                var count_media = medias.length;

                for (var json_key = 0;json_key < count_media;json_key++){
                    var media = medias[json_key];
                    var _media_type = getValueFromXMLTag(media, 'type');
                    var _media_url = getMediaUrl(media, _media_type);

                    var mediaId = getValueFromXMLTag(media, 'media_id');

                    //Build video thumbnail
                    if (_media_type == 'video'){

                        var metadata = getValueFromXMLTag(medias[json_key], 'metadata');

                        if (typeof (metadata) != 'undefined'){

                            metadata = removeCdataCorrectLink(metadata);

                            //Check if transcode progress has provided
                            if (metadata.indexOf('transcode_progress') >= 0){
                                var transcode_progress = metadata.split('transcode_progress');
                                transcode_progress = transcode_progress[1];
                                transcode_progress = transcode_progress.split(",");
                            }
                            else var transcode_progress = false;

                            //Check if web transcode is completed or not
                            var web_transcoded = false;
                            if (transcode_progress != false){
                                for (var i = 0;i < transcode_progress.length;i++){
                                    if (transcode_progress[i].indexOf('transcode_web_completed') >= 0){
                                        web_transcoded = true;
                                        break;
                                    }
                                }
                            }

                            if (web_transcoded){
                                //Get screen area display height
                                var active_video_size = {
                                    width: parseInt($("#tab-content").width()),
                                    height: parseInt($("#tab-content").height()) - 100
                                };
                                //Ignore if has no enough info or media is corrupted
                                if (typeof (_media_url) != 'undefined'){
                                    var mediaThumbnail = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                                    var data = {
                                        video_url:_media_url,
                                        thumbnail:mediaThumbnail,
                                        media_id:mediaId,
                                        hls_media:_media_url,
                                        mp4_media:_media_url,
                                        video_size: active_video_size
                                    };
                                    $.post('/index/buildvideocache', data, function(response_data){
                                        response_data = JSON.parse (response_data);
                                        $(".user-resources").append('<a data-video="true" href="/memreas/js/jwplayer/jwplayer_cache/' + response_data.video_link + '"><img src="' + response_data.thumbnail + '"/></a>');
                                        $(".preload-files .pics").append('<li class="video-media"><img src="' + response_data.thumbnail + '"/></li>');
                                    });
                                }
                                else $(".edit-area-scroll").append ('<li class="video-media"><a class="video-resource image-sync" id="' + mediaId + '" onclick="return imageChoosed(this.id);" href="/memreas/img/large-pic-1.jpg"><img src="/memreas/img/large-pic-1.jpg"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></a><img src="/memreas/img/gallery-select.png"></li>');
                            }
                            else{
                                $(".user-resources").append('<img src="/memreas/img/TrascodingIcon.gif" />');
                                $(".preload-files .pics").append('<li class="video-media"><img src="/memreas/img/transcode-icon.png"/></li>');
                            }
                        }
                    }
                    else {
                        $(".user-resources").append('<img src="' + _media_url + '"/>');
                        $(".preload-files .pics").append ('<li><img src="' + _media_url + '"/></li>');
                        checkHasImage = true;
                    }
                }
                $(".preload-files").hide();
                $(".user-resources").fotorama({
                    'width': parseInt($("body").width()),
                    'height': parseInt($("body").height() - 100),
                    'click': false,
                    'max-width': '100%',
                    'swipe': true,
                    'ratio': '800/325',
                    'allow-full-screen': true,
                    'nav': 'thumbs'
                }).fadeIn(500);
            }
            return true;
        }
    );
});