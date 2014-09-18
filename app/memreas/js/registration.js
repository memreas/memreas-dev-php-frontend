/////////////////////////////////
// Author: John Meah
// Copyright memreas llc 2013
/////////////////////////////////

var base_url = '/index/sampleAjax/';
var isUserNameValid = false;
var user_id = '';
var assigned_event = 0;
var uploadHandle = '';

$(function(){
    var event_id = getURLParameter('event_id');
    if (event_id != ''){
        ajaxRequest('checkevent', [{tag: 'event_id', value: event_id}], function(response){
            if (getValueFromXMLTag(response, 'status') == 'success'){
                $(".event-name").html("!" + getValueFromXMLTag(response, 'event_name')).css('display', 'inline-block');
                assigned_event = getValueFromXMLTag(response, 'event_id');
            }
            else {
                jerror(getValueFromXMLTag(response, 'message'));
                setTimeout(function(){ document.location.href = "/index"; }, 3000);
            }
        }, 'undefined', true);
    }
});

function getURLParameter(sParam){
    var sPageURL = window.location.href;
    sPageURL = sPageURL.split('?')[1];
    if (typeof (sPageURL) != 'undefined'){
        var sURLVariables = sPageURL.split('&');

        for (var i = 0;i < sURLVariables.length;i++){
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
                return sParameterName[1];
        }
    }
    return '';
}

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
    if (!isValid($('#inUserName').val())){
        jerror ('Username is not allowed special characters');
        $("#register input[name=username]").val('');
        $("#register input[name=username]").focus();
        return false;
    }
    var url_check_username = base_url + "action=checkusername";
	var xml_check_username;
	var json_check_username;
	var data;
	var xml_register;

    var params = [
                    {tag: 'username', value: $('#inUserName').val()}
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
        $("#register input[name=username]").focus();
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

    if (!validateRegisterForm(input_uname, input_upass)) return false;

    var params = [
                    {tag: 'email', value: input_email},
                    {tag: 'username', value: input_uname},
                    {tag: 'password', value: input_upass},
                    {tag: 'device_token', value: ''},
                    {tag: 'device_type', value: ''},
                    {tag: 'invited_by', value: ''},
                    {tag: 'event_id', value: assigned_event}
                ];
    ajaxRequest('registration', params, function(response){
        if (getValueFromXMLTag(response, 'status') == 'Success'){
            jsuccess(getValueFromXMLTag(response, 'message'));
            user_id = getValueFromXMLTag(response, 'userid');
            if ($("input[name=profile_image]").val() == 1){
                var current_key = $("#frm-profile-pic").find('input[name=key]').val();
                current_key = user_id + '/' + current_key;
                $("#frm-profile-pic").find('input[name=key]').val(current_key);
                $("#form-user-login").find('input[name=username]').val(input_uname);
                $("#form-user-login").find('input[name=password]').val(input_upass);


                //Submit form for getting sid
                var loginname = $("#form-user-login").find('input[name=username]').val();
                var loginpass = $("#form-user-login").find('input[name=password]').val();

                var params = [
                    {tag: 'username', value: loginname},
                    {tag: 'password', value: loginpass},
                    {tag: 'devicetype', value: 1}
                ];

                var jqXHR;
                ajaxRequest('login', params, function(xml_response){
                    if (getValueFromXMLTag(xml_response, 'status') == 'success'){

                        var sid = getValueFromXMLTag(xml_response, 'sid');
                        $.post('/index/setToken', {sid:sid}, function(){
                            jqXHR = uploadHandle.submit();
                        });

                    }
                    else jerror(getValueFromXMLTag(xml_response, 'message'));
                });

            }
            else {
                setTimeout(function(){
                    $("#form-user-login").find('input[name=username]').val(input_uname);
                    $("#form-user-login").find('input[name=password]').val(input_upass);
                    $("#form-user-login").trigger('submit');
                }, 1500);
            }
        }
        else jerror(getValueFromXMLTag(response, 'message'));
    });
    return false;
}
function autoLogin(handle_username, handle_user_id){
    $("#form-user-login").find('input[name=username]').val(handle_username);
    $("#form-user-login").find('input[name=password]').val(Math.random());
    $("#form-user-login").find('input[name=status_user_id]').val(handle_user_id);

    //Reset profile picture
    $("input[name=profile_image]").val(0);
    $(".profile_picture #list").html('');

    $("span.password-level").hide();
    document.register.reset();
    document.user_login_frm.submit();
}
function validateRegisterForm(input_uname, input_upass){
    if (input_uname.length < 4){
        jerror ('Username must greater than 4 charaters');
        $("#register input[name=username]").focus();
        return false;
    }
    if (input_uname.length > 32){
        jerror ('Username is not allowed more than 32 characters');
        $("#register input[name=username]").focus();
        return false;
    }
    if (input_upass.length < 6){
        jerror ('Password length minium 6 charaters');
        $("#register input[name=password]").focus();
        return false;
    }
    if (input_upass.length > 32){
        jerror ('Password length maxinum 32 charaters');
        $("#register input[name=password]").focus();
        return false;
    }
    return true;
}

$(function(){
    $("form#register input[name=password]").keyup(function(){
        var password_val = $(this).val();
        var jDisplayLevel = $("span.password-level");
        if (password_val == '') jDisplayLevel.html('');
        else{
            jDisplayLevel.html(checkStrength(password_val));
        }
    });
    $("#inUserName").change(function(){ $.checkUserName(); });
    /*
    *Forgot password submit
    */
    $( "#forgot" ).submit(function( event ) {
       var user_email = $("input[name=forgot_email]").val();
       var params = [{tag: 'email', value: user_email}];
       ajaxRequest('forgotpassword', params, function(response){
           if (getValueFromXMLTag(response, 'status') == 'success'){
                jsuccess(getValueFromXMLTag(response, 'message'));
                $("input[name=forgot_email]").val('');
           }
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

                form.find('input[name=Content-Type]').val(filetype);

                //Check if valid type is image or video are allowed
                if  (!(filetype.indexOf('image') >= 0)){
                    jerror('Only image type is allowed');
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
                var _media_url = getValueFromXMLTag(jqXHR.responseText, 'Location');
                var _media_extension = _media_url.split(".");
                _media_extension = _media_extension[_media_extension.length - 1];

                var media_type = '';
                if (_media_url.indexOf('image') >= 0)
                    media_type = 'image/' + _media_extension;
                else media_type = 'video/' + _media_extension;

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
                    setTimeout(function(){
                        $("#form-user-login").trigger('submit');
                    }, 1500);
                });
            },
            done: function (event, data) {

            }
        });
    });

    //Login form submit
    $("#form-user-login").submit(function(){
        var loginname = $(this).find('input[name=username]').val();
        var loginpass = $(this).find('input[name=password]').val();
        if (loginname == '' || loginname == 'username' || loginpass == '' || loginpass == 'password')
            jerror ('Please complete all fields');
        else{
            var params = [
                            {tag: 'username', value: loginname},
                            {tag: 'password', value: loginpass},
                            {tag: 'devicetype', value: 1},
                            {tag: 'devicetoken', value: ''}
                            ];
            ajaxRequest('login', params, function(xml_response){
            	if (getValueFromXMLTag(xml_response, 'status') == 'success'){

                    $("#form-user-login").find('input[name=status_user_id]').val(getValueFromXMLTag(xml_response, 'userid'));
                    $("#form-user-login").find('input[name=sid]').val(getValueFromXMLTag(xml_response, 'sid'));

                    document.user_login_frm.submit();
                }
                else jerror(getValueFromXMLTag(xml_response, 'message'));
            });
        }
        return false;
    });

    //Change password form
    $("#frmChangepass").submit(function(){
        var new_password = $(this).find('input[name=new]').val();

        if (new_password.length < 6){
            jerror('Password length at least 6 characters');
            return false;
        }
        if (new_password.length > 32){
            jerror('Password length can not take more than 32 characters');
            return false;
        }

        var retype_password = $(this).find('input[name=retype]').val();
        var token_code = $(this).find('input[name=token]').val();
        if (new_password == '' || retype_password == '' || token_code == ''){
            jerror('Please complete all fields');
            return false;
        }
        if (new_password != retype_password){
            jerror('Password confirm did not match');
            return false;
        }

        var params = [
                        {tag: 'token', value: token_code},
                        {tag: 'new', value: new_password},
                        {tag: 'retype', value: retype_password},
                        {tag: 'username', value: ''},
                        {tag: 'password', value: ''}
                    ];
        ajaxRequest('changepassword', params, function(xml_response){
            if (getValueFromXMLTag(xml_response, 'status') == 'failure')
                jerror (getValueFromXMLTag(xml_response, 'message'));
            else {
                jsuccess (getValueFromXMLTag(xml_response, 'message'));
                document.reset_pwd_frm.reset();
                disablePopup('changePass');
            }
        }, 'undefined', false);
        return false;
    });
});

function popupResetPassword(){
    disablePopup('forgot');
    popup('changePass');
}

function checkStrength(password)
{
    //initial strength
    var strength = 0

    //if the password length is less than 6, return message.
    if (password.length < 6) {
        return '<b style="color: white;"><img src="/memreas/img/lock.png" width="20" /> Too short</b>';
    }

    //length is ok, lets continue.

    //if length is 8 characters or more, increase strength value
    if (password.length > 7) strength += 1

    //if password contains both lower and uppercase characters, increase strength value
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))  strength += 1

    //if it has numbers and characters, increase strength value
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))  strength += 1

    //if it has one special character, increase strength value
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))  strength += 1

    //if it has two special characters, increase strength value
    if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1

    //now we have calculated strength value, we can return messages

    //if value is less than 2
    if (strength < 2 )
    {
        return '<b style="color: white;"><img src="/memreas/img/lock.png" width="20" /> Weak</b>';
    }
    else if (strength == 2 )
    {
        return '<b style="color: white;"><img src="/memreas/img/lock.png" width="20" /> Medium</b>';
    }
    else
    {
        return '<b style="color: white;"><img src="/memreas/img/lock.png" width="20" /> Strong</b>';
    }
}
function isValid(str) {
    var iChars = "~`!#$%^&*+=-[]\\\';,/{}|\":<>?";

    for (var i = 0; i < str.length; i++) {
       if (iChars.indexOf(str.charAt(i)) != -1) {
           return false;
       }
    }
    return true;
}