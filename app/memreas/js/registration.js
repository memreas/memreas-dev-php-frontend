/////////////////////////////////
// Author: John Meah
// Copyright memreas llc 2013
/////////////////////////////////

//var base_url = 'http://memreasdev.elasticbeanstalk.com/eventapp_zend2.1/webservices/index.php?';
//var base_url = 'http://192.168.1.9/eventapp_zend2.1/webservices/index_json.php';
var base_url = '/index/sampleAjax/';
var isUserNameValid = false;
var user_id = '';
var uploadHandle = '';
onEmailFocusOut = function () {
    if (!isValidEmail($('#inEmail').val())) {
        jerror("Please check your email address");
    }
}

function isValidEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  if( !emailReg.test( $email ) ) {
    return false;
  } else {
    return true;
  }
}

jQuery.checkUserName = function () {
	var url_check_username = base_url + "action=checkusername";
	var xml_check_username;
	var json_check_username;
	var data;
	var xml_register;

    var params = [
                    {tag: 'username', value: $('#inUserName').val()},
                ];
    ajaxRequest('checkusername', params, function(response){
        var response_status = getValueFromXMLTag(response, 'Status');
        if (response_status == 'Success'){
            var message_response = getValueFromXMLTag(response, 'message');
            jerror(message_response);
            $('#inUserName').val('').focus();
        }
    });
	return false;
}


jQuery.logout = function () {
error_log("Inside jQuery.logout script");
	var logout_url = '/index/logout';
	var url_check_username = base_url + "action=checkusername";
	var xml_check_username;
	var json_check_username;
	var data;
	var xml_register;

	$.ajax( {
	  type:'post',
	  url: logout_url,
	  //dataType: 'jsonp',
	  //data: 'json=' + data,
	  success: function(result){
  		jerror ("Finished Logout...");
  		return true;
	  },
	  error: function (jqXHR, textStatus, errorThrown) {
       	alert(jqXHR.responseText);
       	alert(jqXHR.status);
    	alert(textStatus);
       	alert(errorThrown);
	  }
	});
	return false;
}

function validateRegstration(){
    var input_email = $("#register input[name=email]").val();
    var input_uname = $("#register input[name=username]").val();
    var input_upass = $("#register input[name=password]").val();
    var input_rpass = $("#register input[name=verifypassword]").val();
    var legal_agree = $("#register input[name=legal_agree]");
    if (input_email == '' || input_email == 'Your Email'){
        jerror ('Please fill email');
        $("#register input[name=email]").focus();
        return false;
    }
    if (input_uname == '' || input_uname == 'User Name'){
        jerror ('Please fill your username');
        $("#register input[name=input_upass]").focus();
        return false;
    }
    if (input_upass == '' || input_upass == 'Password'){
        jerror ('Please choose your password');
        $("#register input[name=password]").focus();
        return false;
    }
    if (input_upass != input_rpass){
        jerror ('Password confirm no match');
        $("#register input[name=verifypassword]").focus();
        return false;
    }
    if (!legal_agree.is (":checked")){
        jerror ('You must agree with legal disclaimer');
        return false;
    }

    var params = [
                    {tag: 'email', value: input_email},
                    {tag: 'username', value: input_uname},
                    {tag: 'password', value: input_upass},
                    {tag: 'device_token', value: ''},
                    {tag: 'device_type', value: ''},
                    {tag: 'invited_by', value: ''}
                ];
    ajaxRequest('registration', params, function(response){
        if (getValueFromXMLTag(response, 'status') == 'Success'){
            jsuccess(getValueFromXMLTag(response, 'message'));
            if ($("input[name=profile_image]").val() == 1){
                user_id = getValueFromXMLTag(response, 'userid');
                var current_key = $("#frm-profile-pic").find('input[name=key]').val();
                current_key = user_id + '/' + current_key;
                $("#frm-profile-pic").find('input[name=key]').val(current_key);
                var jqXHR = uploadHandle.submit();
            }
        }
        else jerror(response_message);
        document.register.reset();
    });
    return false;
}

$(function(){
    $("#inUserName").change(function(){ $.checkUserName(); });
    /*
    *Forgot password submit
    */
    $( "#forgot" ).submit(function( event ) {
       var user_email = $("input[name=forgot_email]").val();
       var params = [{tag: 'email', value: user_email}];
       ajaxRequest('forgotpassword', params, function(response){
           if (getValueFromXMLTag(response, 'status') == 'success')
                jsuccess(getValueFromXMLTag(response, 'message'));
           else jerror(getValueFromXMLTag(response, 'message'));
       });
       return false;
    });

    //Ajax upload profile image
    $(".file_upload").click(function(){ $("#frm-profile-pic").find("input[name=file]").click(); });
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

                //Get signed credentials
                $.ajax({
                  url: "/index/s3signed",
                  type: 'GET',
                  dataType: 'json',
                  data: {title: data.files[0].name}, // send the file name to the server so it can generate the key param
                  async: false,
                  success: function(data) {
                    // Now that we have our data, we update the form so it contains all
                    // the needed data to sign the request
                    form.find('input[name=AWSAccessKeyId]').val(data.accessKey);
                    form.find('input[name=policy]').val(data.policy)
                    form.find('input[name=signature]').val(data.signature)
                  }
                })

                var filetype = data.files[0].type;
                var filename = data.files[0].name;
                var key_value = '${filename}';

                //Check if valid type is image or video are allowed
                if  (!(filetype.indexOf('image') >= 0 || filetype.indexOf('video') >= 0)){
                    jerror('file type is not allowed');
                    $("input[name=profile_image]").val(0);
                    return false;
                }
                $("input[name=profile_image]").val(1);
                if (filetype.indexOf ('image') >= 0)
                    var target = 'image';
                else target = 'media';
                key_value = target + '/' + key_value;
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
                uploadHandle = data;
            },
            send: function(e, data) {

            },
            progress: function(e, data){
                $("#loadingpopup").show();
            },
            fail: function(e, data) {
                window.onbeforeunload = null;
            },
            success: function(data, status, jqXHR) {
                _media_url = getValueFromXMLTag(jqXHR.responseText, 'Location');
                var _media_extension = _media_url.split(".");
                _media_extension = _media_extension[_media_extension.length - 1];
                if (_media_url.indexOf('image') >= 0)
                    media_type = 'image/' + _media_extension;
                else media_type = 'video/' + _media_extension;
                //var filename = _media_url.split("/");
                var s3_filename = getValueFromXMLTag(jqXHR.responseText, 'Key');
                var s3_filename_split = s3_filename.split("/");
                var filename = s3_filename_split[s3_filename_split.length - 1];
                var s3_path_split = s3_filename.split(filename);
                var s3_path = s3_path_split[0];
                var params = [
                                {tag: 's3url', value: filename},
                                {tag: 'is_server_image', value: '0'},
                                {tag: 'content_type', value : media_type},
                                {tag: 's3path', value: s3_path},
                                {tag: 's3file_name', value: filename},
                                {tag: 'device_id', value: ''},
                                {tag: 'event_id', value: ''},
                                {tag: 'media_id', value: ''},
                                {tag: 'user_id', value: user_id},
                                {tag: 'is_profile_pic', value: '1'},
                                {tag: 'location', value: ''}
                                ];
                ajaxRequest('addmediaevent', params, function(){
                    jsuccess('Your profile picture updated');
                });
            },
            done: function (event, data) {

            },
        });
    });
});

