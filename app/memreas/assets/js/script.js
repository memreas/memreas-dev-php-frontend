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
            dropZone: $('.upload-dropzone'),            
            url: form.attr('action'),   
            dataType: 'xml',  
            crossDomain: true,
            type: 'POST',
            autoUpload: true,
            /*xhrFields: {
                withCredentials: true
            },*/                        
            add: function (event, data) {                
                // Use XHR, fallback to iframe
                options = $(this).fileupload('option');
                use_xhr = !options.forceIframeTransport &&
                            ((!options.multipart && $.support.xhrFileUpload) ||
                            $.support.xhrFormDataFileUpload);

                if (!use_xhr) {
                    using_iframe_transport = true;
                }  
                
                var isChrome = !!window.chrome;
                if (isChrome) {
                    using_iframe_transport = true;                
                    $(this).fileupload('option', {forceIframeTransport:true})
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
                                    '</div>' +
                                    '<div class="close_progress"><a href="#" class="cancel-upload"><img src="/memreas/img/close.png" alt=""></a></div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                              '</li>');
                data.context = tpl2.appendTo("li.first-upload");
                // Submit
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
            success: function(data) {              
                // Here we get the file url on s3 in an xml doc
                var url = $(data).find('Location').text()
                $('#real_file_url').val(url) // Update the real input in the other form
                var userid = $("input[name=user_id]").val();
                
                
                var _media_url = url.replace('http://memreasdev.s3.amazonaws.com', '');
                var addmedia = new Array();
                addmedia[0] = new Array();
                addmedia[0]['tag'] = "s3url";                
                addmedia[0]['value'] = _media_url;
                addmedia[1] = new Array();
                addmedia[1]['tag'] = "is_server_image";                
                addmedia[1]['value'] = 0;
                addmedia[2] = new Array();
                var filename = url.split("%2F");                
                filename = filename[filename.length - 1];
                addmedia[2]['tag'] = "content_type";                
                addmedia[2]['value'] = "image/jpeg";
                addmedia[3] = new Array();
                addmedia[3]['tag'] = "s3file_name";                
                addmedia[3]['value'] = filename;
                addmedia[4] = new Array();
                addmedia[4]['tag'] = "device_id";                
                addmedia[4]['value'] = "";
                addmedia[5] = new Array();
                addmedia[5]['tag'] = "event_id";                
                addmedia[5]['value'] = "";
                addmedia[6] = new Array();
                addmedia[6]['tag'] = "media_id";                
                addmedia[6]['value'] = "";
                addmedia[7] = new Array();
                addmedia[7]['tag'] = "user_id";                
                addmedia[7]['value'] = userid;
                addmedia[8] = new Array();
                addmedia[8]['tag'] = "is_profile_pic";                
                addmedia[8]['value'] = 0; 
                addmedia[9] = new Array();
                addmedia[9]['tag'] = "location";                
                addmedia[9]['value'] = "";
                
                $(".completed-upload").append ('<li><img src="' + url + '"/></li>');
                
                ajaxRequest('addmediaevent', addmedia, success_addmedia, error_addmedia);  
              
            },
            done: function (event, data) {

            },
        });
    });
});
/*$(function(){

    var ul = $('#upload ul');

    $('#drop a').click(function(){
        // Simulate a click on the file input button
        // to show the file browser dialog
        $(this).parent().find('input').click();
    });    
    $(".upload-dropzone").click (function(){
        $("#upload").find ("input[type=file]").click();
    });
    // Initialize the jQuery File Upload plugin
    $('#upload').fileupload({

        // This element will accept file drag/drop uploading
        dropZone: $('#drop, .upload-dropzone'),

        // This function is called when a file is added to the queue;
        // either via the browse button, or via drag/drop: 
        url: $("#upload").attr('action'),
        type: 'POST',
        autoUpload: true,
        add: function (e, data) {            
            
            //For preview 
            var tpl = $('<li class="working"><input type="text" value="0" data-width="48" data-height="48"'+
                ' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>');
            
            // Append the file name and file size
            tpl.find('p').text(data.files[0].name)
                         .append('<i>' + formatFileSize(data.files[0].size) + '</i>');

            // Add the HTML to the UL element
            data.context = tpl.appendTo(ul);                    
            
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
            data.context2 = tpl2.appendTo("li.first-upload");
            
            // Initialize the knob plugin
            tpl.find('input').knob();

            // Listen for clicks on the cancel icon
            tpl.find('span').click(function(){

                if(tpl.hasClass('working')){
                    jqXHR.abort();
                }

                tpl.fadeOut(function(){
                    tpl.remove();
                });

            });
            
            tpl2.find("a.cancel-upload").click (function(){
                if(tpl2.hasClass('working-upload')){
                    jqXHR.abort();
                }

                tpl2.fadeOut(function(){
                    tpl2.remove();
                });
            });
            
            // Automatically upload the file once it is added to the queue
           var jqXHR = data.submit();           
           $(".start-upload").on ('click', function(){
               $("a[title=queue]").trigger ("click");
                var jqXHR = data.submit();
            });
        },        
        progress: function(e, data){

            // Calculate the completion percentage of the upload
            var progress = parseInt(data.loaded / data.total * 100, 10);            

            // Update the hidden input field and trigger a change
            // so that the jQuery knob plugin knows to update the dial
            data.context.find('input').val(progress).change();
            data.context.find(".progress-bar").css ("width", progress + "%");
            data.context.find(".count-progress").html (progress + "%");             
            data.context2.find(".upload_progress_bar .progress").css ("width", progress + "%");
            data.context2.find(".upload_progress_bar span").html (progress + "%");
            

            if(progress == 100){
                data.context.remove('.working');
                data.context2.removeClass('.working-upload');
                data.context.remove('count-progress');                  
            }
        },
        done: function (e, data) {
            console.log (data);          
          },
        fail:function(e, data){
            // Something has gone wrong!
            data.context.addClass('error');
        }

    });


    // Prevent the default action when a file is dropped on the window
    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });

    // Helper function that formats the file sizes
    function formatFileSize(bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }

        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }

        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }

        return (bytes / 1000).toFixed(2) + ' KB';
    }

});
*/
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