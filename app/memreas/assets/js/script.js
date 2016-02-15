
var uploadFilesInstance = []; //Used for store all file name for uploading
var currentUploadFileCount = 0; //Count for all current files selected for upload
$(document).ready( function() {

    //Check if IOS only allow 1 file per upload
    if (userBrowser[0].ios){
        $(".direct-upload").find("input[type=file]").removeAttr('multiple');
    }

    var ellipsisCount = 1;
    var name = '';
    var hashName = '';

    $(".upload-dropzone").click (function(){
        $(".direct-upload").find ("input[type=file]").trigger('click');
    });

    $('.direct-upload').each( function() {

        var form = $(this);

        $(this).fileupload({
            dropZone: $('.upload-dropzone, .upload-from-event'),
            url: form.attr('action'),
            dataType: 'xml',
            crossDomain: true,
            multiple: true,
            type: 'POST',
            autoUpload: true,
            add: function (event, data) {
                currentUploadFileCount = uploadFilesInstance.length;
                if (currentUploadFileCount > 10){
                    jerror("Only allow to upload limited 10 files per session.");
                    return false;
                }
                //Check if current file with the same name is currently uploading
                for (i = 0;i < currentUploadFileCount;i++){
                    if (uploadFilesInstance[i] == data.files[0].name){
                        jerror ('not allowed to upload same files at same time');
                        return false;
                    }
                }
                uploadFilesInstance[currentUploadFileCount] = data.files[0].name;

                //Debugging
                console.log('filename'+data.files[0].name);
                //End Debugging
                
                //Get signed credentials
                $.ajax({
                  url: "/index/s3signed",
                  type: 'GET',
                  dataType: 'json',
                  data: {title: data.files[0].name}, // send the file name to the server so it can generate the key param
                  async: false,
                  success: function(data) {
                    /**
                     * -
                     *  Now that we have our data, we update the form so it contains all
                     *  the needed data to sign the request
                     */
                    form.find('input[name=policy]').val(data.policy)
                    form.find('input[name=signature]').val(data.signature)
                  }
                })

                var filetype = data.files[0].type;
                var filename = data.files[0].name;
                var key_value = '${filename}';
                

                /**
                 * -
                 * Check if valid type is image or video are allowed
                 */
                
                if  (!(filetype.indexOf('image') >= 0 || filetype.indexOf('video') >= 0)){
                    jerror('file type is not allowed');
                    return false;
                }

                if (filetype.indexOf ('image') >= 0)
                    var target = 'image';
                else target = 'media';
                $('input[name=ContentType]').val(filetype);
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

                // Message on unLoad.
                window.onbeforeunload = function() {
                    return 'You have unsaved changes.';
                };
                //For upload
                var tpl2 = $('<li class="working-upload">' +
                                '<div class="upload_progress" id="table">' +
                                    '<div class="upload_progress_img">' +
                                        '<img src="/memreas/img/pic-1.jpg">' +
                                    '</div>' +
                                    '<div class="upload_progress_bar">' +
                                        '<span></span><div class="progress"></div>' +
                                    '</div><div class="progress-text"></div>' +
                                    '<div class="close_progress"><a href="#" class="cancel-upload"><img src="/memreas/img/close.png" alt=""></a></div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                              '</li>');

                data.context = tpl2;

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
                // Submit
                var _image_handle = data.context.find(".upload_progress_img img");

                //Check if media exist or not
                var params = [
                    {tag: 'user_id', value: $("input[name=user_id]").val()},
                    {tag: 'filename', value: data.files[0].name}
                ];

                var jqXHR = '';
                data.context.find('.progress-text').html('Checking file exist');
                ajaxRequest('checkexistmedia', params, function(xml_response){
                    if (getValueFromXMLTag(xml_response, 'status') == 'Failure'){
                        data.context.find('.progress-text').html('This file has already existed. Uploading will abort!');
                        removeItem(uploadFilesInstance, data.files[0].name);
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
                                    removeItem(uploadFilesInstance, data.files[0].name);
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
                /**
                 * -
                 *  This is what makes everything really cool, thanks to that callback
                 *  you can now update the progress bar based on the upload progress
                 */
                var percent = Math.round((data.loaded / data.total) * 100);
                data.context.find(".upload_progress_bar .progress").css ("width", percent + "%");
                data.context.find(".upload_progress_bar span").html (percent + "%");
                if (percent == 100){
                    data.context.find('.progress-text').html('Please wait while adding media to your account.');
                }
            },
            fail: function(e, data) {
                window.onbeforeunload = null;
            },
            success: function(data, status, jqXHR) {
                //$("#loadingpopup").show();
                _media_url = getValueFromXMLTag(jqXHR.responseText, 'Location');
                var _media_extension = _media_url.split(".");
                _media_extension = _media_extension[_media_extension.length - 1];
                if (_media_url.indexOf('image') >= 0)
                    media_type = 'image/' + _media_extension;
                else media_type = 'video/' + _media_extension;
                var userid = $("input[name=user_id]").val();
                if ($("a.share").hasClass ("active"))
                    var addEvent = event_id;
                else addEvent = '';
                var s3_filename = getValueFromXMLTag(jqXHR.responseText, 'Key');
                var s3_filename_split = s3_filename.split("/");
                var filename = s3_filename_split[s3_filename_split.length - 1];
                var s3_path_split = s3_filename.split(filename);
                var s3_path = s3_path_split[0];
                var S3URL = "";
                $.getScript('/memreas/js/constants.js', function()
                		{
                    /**
                     * -
                     * script is now loaded and executed.
                     * put your dependent JS here.
                     */
                    		S3URL = "https://" + S3BUCKET + ".s3.amazonaws.com/";
                		});
                var server_url = _media_url.replace(S3URL, '');
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
                        //$("#loadingpopup").hide();
                        jsuccess('Medias uploaded successfully');
                    }
                    //progressUpload();
                }, 'undefined', true);
            },
            done: function (event, data) {

            },
        });
    });
});
function XML2JS(xmlDoc, containerTag) {
    var output = new Array();
    var rawData = xmlDoc.getElementsByTagName(containerTag)[0];
    var i, j, oneRecord, oneObject;
    for (i = 0; i < rawData.childNodes.length; i++) {
        if (rawData.childNodes[i].nodeType == 1) {
            oneRecord = rawData.childNodes[i];
            oneObject = output[output.length] = new Object();
            for (j = 0; j < oneRecord.childNodes.length; j++) {
                if (oneRecord.childNodes[j].nodeType == 1) {
                    oneObject[oneRecord.childNodes[j].tagName] =
                        oneRecord.childNodes[j].firstChild.nodeValue;
                }
            }
        }
    }
    return output;
}

/** Testing environment for upload handle - Not stable yet*/

var objectHandleUpload = []; //Used for put object upload handle to stack
var currentUploadIndex = 0;
var isUploading = false; //Check if now uploading or not
var nextelement = 0;
function putObjectUploadToQueue(objectElement){
    objectHandleUpload[currentUploadIndex++] = objectElement;
    if ((currentUploadIndex) == 1);
       progressUpload();
}

function progressUpload(){
    var indexHandle = nextelement++;
    if (indexHandle <= currentUploadIndex){
        objectHandleUpload[indexHandle].context.find('.progress-text').html('Ok! Uploading...');
        objectHandleUpload[indexHandle].submit();
        removeItem(objectHandleUpload, objectHandleUpload[indexHandle]);
        currentUploadIndex--;
    }
}