$(document).ready( function() {

    var ellipsisCount = 1;
    var name = '';
    var hashName = '';

    $(".upload-dropzone").click (function(){
        $(".direct-upload").find ("input[type=file]").click();
    });

    $('.direct-upload').each( function() {

        var form = $(this);

        $(this).fileupload({
            dropZone: $('.upload-dropzone, .upload-from-event'),
            url: form.attr('action'),
            dataType: 'xml',
            crossDomain: true,
            type: 'POST',
            autoUpload: true,
            add: function (event, data) {
                var checkOneInstance = $("input[name=once_instance]").val();
                /*
                if (checkOneInstance == 1 || 0){
                    jError(
                    'Sorry! Just one intance per upload, please wait for upload complete.',
                    {
                      autoHide : true, // added in v2.0
                      clickOverlay : false, // added in v2.0
                      MinWidth : 250,
                      TimeShown : 3000,
                      ShowTimeEffect : 200,
                      HideTimeEffect : 200,
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
                    return false;
                }
                */
                $("input[name=once_instance]").val(1);
                var filetype = data.files[0].type;
                var filename = data.files[0].name;
                var key_value = '${filename}';
                if (filetype.indexOf ('image') >= 0)
                    var target = 'images';
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
                /*
                var isChrome = !!window.chrome;
                if (isChrome) {
                    using_iframe_transport = true;
                    $(this).fileupload('option', {forceIframeTransport:true})
                }
                */
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
                                    '</div>' +
                                    '<div class="close_progress"><a href="#" class="cancel-upload"><img src="/memreas/img/close.png" alt=""></a></div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                              '</li>');

                //data.context = tpl2.appendTo(".image_upload_box");
                data.context = tpl2;

                //Active on share tab
                if ($("a.share").hasClass ("active")){
                    $(".event-upload-image .mCSB_container").append(tpl2);
                    $(".event-upload-image").mCustomScrollbar("update");
                    $(".event-upload-image").mCustomScrollbar("scrollTo","last");
                }
                else{
                    $(".image_upload_box .mCSB_container").append(tpl2);
                    $(".image_upload_box").mCustomScrollbar("update");
                    $(".image_upload_box").mCustomScrollbar("scrollTo","last");
                }
                // Submit
                var _image_handle = data.context.find(".upload_progress_img img");
                var jqXHR = data.submit();
                tpl2.find("a.cancel-upload").click (function(){
                    if(tpl2.hasClass('working-upload')){
                        jqXHR.abort();
                    }

                    tpl2.fadeOut(function(){
                        tpl2.remove();
                    });
                });


            },
            send: function(e, data) {

            },
            progress: function(e, data){
                // This is what makes everything really cool, thanks to that callback
                // you can now update the progress bar based on the upload progress
                /*var percent = Math.round((data.loaded / data.total) * 100);
                $('.bar').css('width', percent + '%');*/
                var percent = Math.round((data.loaded / data.total) * 100);
                data.context.find(".upload_progress_bar .progress").css ("width", percent + "%");
                data.context.find(".upload_progress_bar span").html (percent + "%");
            },
            fail: function(e, data) {
                window.onbeforeunload = null;
            },
            success: function(data, status, jqXHR) {
                // Here we get the file url on s3 in an xml doc
                var _media_url = $('input[name=ContentName]').val();
                $('#real_file_url').val("https://memreasdev.s3.amazonaws.com/" + _media_url); // Update the real input in the other form
                var userid = $("input[name=user_id]").val();
                if ($("a.share").hasClass ("active"))
                    var addEvent = event_id;
                else addEvent = '';

                var filename = _media_url.split("/");
                filename = filename[filename.length - 1];
                var params = [
                                {tag: 's3url', value: _media_url},
                                {tag: 'is_serveer_image', value: '0'},
                                {tag: 'content_type', value : $('input[name=ContentType]').val()},
                                {tag: 's3file_name', value: filename},
                                {tag: 'device_id', value: ''},
                                {tag: 'event_id', value: addEvent},
                                {tag: 'media_id', value: ''},
                                {tag: 'user_id', value: userid},
                                {tag: 'is_profile_pic', value: '0'},
                                {tag: 'location', value: ''}
                            ];

                if ($(".completed-upload").hasClass ('mCSB_container'))
                    $(".completed-upload .mCSB_container").append ('<li><img src="https://' + s3_bucket + '.s3.amazonaws.com/' + _media_url + '"/></li>');
                else $(".completed-upload .first-element").append ('<li><img src="https://' + s3_bucket + '.s3.amazonaws.com/' + _media_url + '"/></li>');

                ajaxRequest('addmediaevent', params, success_addmedia, error_addmedia);
                $("input[name=once_instance]").val(0);
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
