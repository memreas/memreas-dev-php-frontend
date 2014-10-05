
var uploadFilesInstance = []; //Used for store all file name for uploading
var currentUploadFileCount = 0; //Count for all current files selected for upload
var filename = '';
$(document).ready( function() {

    //Check if IOS only allow 1 file per upload
    if (userBrowser[0].ios){
        $(".media-upload").find("input[type=file]").removeAttr('multiple');
    }

    var ellipsisCount = 1;
    var name = '';
    var hashName = '';

    $(".upload-dropzone").click (function(){
        $(".media-upload").find ("input[type=file]").trigger('click');
    });

    $('.media-upload').each( function() {

        var form = $(".media-upload");

        $('.media-upload').fileupload({
            dropZone: $('.upload-from-event'),
            url: form.attr('action'),
            dataType: 'xml',
            crossDomain: true,
            multiple: true,
            type: 'POST',
            autoUpload: true,
            maxFileSize: 5000000,
            add: function (event, data){
                filename = data.files[0].name;
                filename = correctUploadFilename(filename);
                currentUploadFileCount = uploadFilesInstance.length;
                if (currentUploadFileCount > 10){
                    jerror("Only allow to upload limited 10 files per session.");
                    return false;
                }

                //Check if current file with the same name is currently uploading
                for (var i = 0;i < currentUploadFileCount;i++){
                    if (uploadFilesInstance[i] == filename){
                        jerror ('not allowed to upload same files at same time');
                        return false;
                    }
                }
                uploadFilesInstance[currentUploadFileCount] = filename;

                //Get signed credentials
                $.ajax({
                    url: "/index/s3signed",
                    type: 'GET',
                    dataType: 'json',
                    data: {title: filename}, // send the file name to the server so it can generate the key param
                    async: false,
                    success: function(data) {
                    // Now that we have our data, we update the form so it contains all
                    // the needed data to sign the request
                    form.find('input[name=policy]').val(data.policy)
                    form.find('input[name=signature]').val(data.signature)
                    }
                });

                var filetype = data.files[0].type;
                var key_value = filename;

                /*
                 * 28-SEP-2014 JM: Modified for allowed file types
                 */
                //Check here is file is valid - matches checking on server
                var extension = filename.substr( (filename.lastIndexOf('.') +1) );
                var is_valid = false;
                switch(extension.toLowerCase()) {
                	//image types allowed
                	case 'jpeg':
                		filetype='image'; 
                		is_valid = true;
						break;
                    case 'jpg':
                    	filetype='image';
                		is_valid = true;
						break;
                    case 'png':
                    	filetype='image';
                		is_valid = true;
						break;
                    case 'gif':
                    	filetype='image';
                		is_valid = true;
						break;

                    //video types allowed
					case 'mpeg' :
						filetype='video';
                		is_valid = true;
						break;
					case 'mp4' :
						filetype='video';
                		is_valid = true;
						break;
					case 'avi' :
						filetype='video';
                		is_valid = true;
						break;
					case 'mov' :
						filetype='video';
                		is_valid = true;
						break;
					case '3gp' :
						filetype='video';
                		is_valid = true;
						break;
					case '3gpp' :
						filetype='video';
                		is_valid = true;
						break;
					case 'mkv' :
						filetype='video';
                		is_valid = true;
						break;

					//audio types allowed
					case 'mp3' :
						filetype='audio';
                		is_valid = true;
						break;
					case 'wav' :
						filetype='audio';
                		is_valid = true;
						break;
					case 'caf' :
						filetype='audio';
                		is_valid = true;
						break;
                    default:
                        jerror('file type is not allowed');
                }
                //Check if valid type is image or video are allowed
                //if  (!(filetype.indexOf('image') >= 0 || filetype.indexOf('video') >= 0 || filetype.indexOf('audio') >= 0)){
                if  (!is_valid) {
                    jerror('file type is not allowed');
                    return false;
                }

                if (filetype.indexOf ('image') >= 0)
                    var target = 'image';
                else target = 'media';

                form.find('input[name=Content-Type]').val(filetype);
                var userid = $("input[name=user_id]").val();
                key_value = userid + '/' + target + '/' + key_value;
                $('input[name=ContentName]').val(userid + '/' + target + '/' + filename);
                $(this).find('input[name=key]').val(key_value);
                // Use XHR, fallback to iframe
                options = $(this).fileupload('option');
                use_xhr = !options.forceIframeTransport &&
                            ((!options.multipart && $.support.xhrFileUpload) ||
                            $.support.xhrFormDataFileUpload);

                if (!use_xhr) {
                    using_iframe_transport = true;
                }

                //For upload

                var tpl2 = $('<li class="working-upload">' +
                                '<div class="upload_progress" id="table">' +
                                    '<div class="upload_progress_img">' +
                                        '<img src="/memreas/img/loading-line.gif" class="loading-small">' +
                                    '</div>' +
                                    '<div class="upload_progress_bar">' +
                                        '<span></span><div class="progress"></div>' +
                                    '</div><div class="progress-text"></div>' +
                                    '<div class="close_progress"><a href="javascript:;" class="cancel-upload"><img src="/memreas/img/close.png" alt=""></a></div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                              '</li>');

                data.context = tpl2;

                //Set preview if browser is supported file reader
                if (window.FileReader && filetype.indexOf ('image') >= 0) {
                    var file = data.files[0]; //Files[0] = 1st file
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (function(event){
                        var preview_thumbnail = event.target.result;
                        data.context.find('.upload_progress_img')
                            .find('img')
                            .attr('src', preview_thumbnail)
                            .removeClass('loading-small');
                    });
                }
                else {
                    data.context.find('.upload_progress_img')
                        .find('img')
                        .attr('src', '/memreas/img/pic-1.jpg')
                        .removeClass('loading-small');
                }

                //Active on share tab
                if ($("a.share").hasClass ("active")){
                    $(".event-upload-image .mCSB_container").append(tpl2);
                    $(".event-upload-image").mCustomScrollbar("update");
                    $(".event-upload-image").mCustomScrollbar("scrollTo","last");
                }
                else{
                    if ($(".image_upload_box").hasClass("mCustomScrollbar"))
                        $(".image_upload_box .mCSB_container").append(tpl2);
                    else $(".image_upload_box").append(tpl2);
                    if ($(".image_upload_box").hasClass("mCustomScrollbar"))
                        $(".image_upload_box").mCustomScrollbar("update");
                    else $(".image_upload_box").mCustomScrollbar({scrollButtons:{enable:true }});
                    $(".image_upload_box").mCustomScrollbar("scrollTo","last");
                }

                //Check if media exist or not
                var params = [
                    {tag: 'user_id', value: $("input[name=user_id]").val()},
                    {tag: 'filename', value: filename}
                ];

                var jqXHR = '';
                data.context.find('.progress-text').html('Checking file exist');

                ajaxRequest('checkexistmedia', params, function(xml_response){
                    if (getValueFromXMLTag(xml_response, 'status') == 'Failure'){
                        data.context.find('.progress-text').html('This file has already existed. Uploading will abort!');
                        removeItem(uploadFilesInstance, filename);
                        setTimeout(function(){ tpl2.remove(); }, 2000);
                        return false;
                    }
                    else {
                         jqXHR = data.submit();
                         data.context.find('.progress-text').html('Ok! Uploading...');
                         data.context.find("a.cancel-upload").click (function(){
                            if(data.context.hasClass('working-upload')){
                                var currentPercent = data.context.find(".upload_progress_bar .progress").width() / data.context.find(".upload_progress_bar .progress").parent().width() * 100;
                                if (currentPercent < 100){
                                    jqXHR.abort();
                                    stopUpload = true;
                                    removeItem(uploadFilesInstance, filename);
                                }
                                else {
                                    jerror('Upload is completed. Please wait until add media to your account done');
                                    stopUpload = false;
                                }
                            }
                            if (stopUpload){
                                data.context.fadeOut(function(){
                                    data.context.remove();
                                });
                            }
                        });
                    }
                }, 'undefined', true);
            },
            send: function(e, data) {

            },
            progress: function(e, data){
                var percent = Math.round((data.loaded / data.total) * 100);
                data.context.find(".upload_progress_bar .progress").css ("width", percent + "%");
                data.context.find(".upload_progress_bar span").html (percent + "%");
                if (percent == 100){
                    data.context.find('.progress-text').html('<img src="/memreas/img/loading-line.gif" class="loading-small"> Please wait while adding media to your account.');
                    data.context.find('.close_progress').html('<span><img src="/memreas/img/arrow-gray.png" /></span>');
                }
            },
            fail: function(e, data) {
                window.onbeforeunload = null;
            },
            success: function(data, status, jqXHR) {
                var _media_url = getValueFromXMLTag(jqXHR.responseText, 'Location');
                var media_type = get_type_url(_media_url);

                var userid = $("input[name=user_id]").val();
                if ($("a.share").hasClass ("active"))
                    var addEvent = event_id;
                else addEvent = '';
                var s3_filename = getValueFromXMLTag(jqXHR.responseText, 'Key');
                var s3_filename_split = s3_filename.split("/");
                var filename = s3_filename_split[s3_filename_split.length - 1];
                var s3_path_split = s3_filename.split(filename);
                var s3_path = s3_path_split[0];
                /*
                 * 6-SEP-2014 - need to get these into one single constants file
                 * 2-OCT-2014 - udpated to allow for constants file for environments 
                 */
                var S3URL = "";
                $.getScript('/memreas/js/constants.js', function()
                		{
                		    // script is now loaded and executed.
                		    // put your dependent JS here.
                			//alert ( S3BUCKET );
                    		S3URL = "https://" + S3BUCKET + ".s3.amazonaws.com/";
                		});
                var server_url = _media_url.replace(S3URL, '');
//alert("server url -->" + server_url);                
                
                //var S3URL = "https://" + S3BUCKET + ".s3.amazonaws.com/";
                //var server_url = _media_url.replace(S3URL, '');

				var params = [
                                {tag: 's3url', value: filename},
                                {tag: 'is_server_image', value: '0'},
                                {tag: 'content_type', value : media_type},
                                {tag: 's3path', value: s3_path},
                                {tag: 's3file_name', value: filename},
                                {tag: 'device_id', value: ''},
                                {tag: 'event_id', value: addEvent},
                                {tag: 'media_id', value: ''},
                                {tag: 'user_id', value: userid},
                                {tag: 'is_profile_pic', value: '0'},
                                {tag: 'location', value: ''}
                            ];

                if (media_type.indexOf('image') >= 0){
                    if ($(".completed-upload").hasClass ('mCSB_container'))
                        $(".completed-upload .mCSB_container").append ('<li><img src="' + _media_url + '"/></li>');
                    else $(".completed-upload .first-element").append ('<li><img src="' + _media_url + '"/></li>');
                }
                else{
                    if ($(".completed-upload").hasClass ('mCSB_container'))
                        $(".completed-upload .mCSB_container").append ('<li class="video-media"><img src="/memreas/img/small/1.jpg"/><img src="/memreas/img/video-overlay.png" class="overlay-videoimg"></li>');
                    else $(".completed-upload .first-element").append ('<li class="video-media"><img src="/memreas/img/small/1.jpg"/><img src="/memreas/img/video-overlay.png" class="overlay-videoimg"></li>');
                }

                ajaxRequest('addmediaevent', params, function(xml_response){
                    removeItem(uploadFilesInstance, filename);
                    currentUploadFileCount = uploadFilesInstance.length;
                    if (currentUploadFileCount == 0){
                        $(".image_upload_box .mCSB_container").empty();
                        $(".image_upload_box").mCustomScrollbar("update");
                        pushReloadItem('listallmedia');
                        jsuccess('Medias uploaded successfully');
                    }
                }, 'undefined', true);
            },
            done: function (event, data) {}
        });
    });
});

function correctUploadFilename(filename){
    var invalidChars = [' ', '+', '*', "'", '"', '(', ')', '!'];
    for (var i = 0;i < invalidChars.length;i++)
        filename = filename.replace(invalidChars[i], '-');

    return filename;
}
//Define custom other type, the rest will take default
var image_types = [
    {ext:   'jpg'  , type: 'jpeg'}
];
var video_types = [];

function get_type_url(_media_url){
    //Determine S3 url type is image or video
    var _media_extension = _media_url.split(".");
    var file_ext = _media_extension[_media_extension.length - 1];
    if (_media_url.indexOf('image') >= 0)
        var type_upload = 'image';
    else var type_upload = 'video';

    //If type of file is image
    if (type_upload == 'image'){
        for (var i = 0;i < image_types.length;i++){
            if (file_ext == image_types[i].ext)
                return type_upload + '/' + image_types[i].type;
        }
        return type_upload + '/' + file_ext;
    }

    //If type of file is video
    for (var i = 0;i < video_types.length;i++){
        if (file_ext == video_types[i].ext)
            return type_upload + '/' + video_types[i].type;
    }
    return type_upload + '/' + file_ext;
}