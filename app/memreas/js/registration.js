/////////////////////////////////
// Author: John Meah
// Copyright memreas llc 2013
/////////////////////////////////

//var base_url = 'http://memreasdev.elasticbeanstalk.com/eventapp_zend2.1/webservices/index.php?';
//var base_url = 'http://192.168.1.9/eventapp_zend2.1/webservices/index_json.php';
var base_url = '/index/sampleAjax/';
var isUserNameValid = false;

onEmailFocusOut = function () {
    if (!isValidEmail($('#inEmail').val())) {
        jerror("Please check your email address");
    }
}
onUserNameFocusOut = function () {
    jQuery.checkUserName();
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
        if (getValueFromXMLTag(response, 'status') == 'Success')
            jsuccess(getValueFromXMLTag(response, 'message'));
        else {
            jerror(response_message);
            document.register.reset();
        }
    });
    return false;
}

$(function(){
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
});

