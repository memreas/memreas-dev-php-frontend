/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */

var base_url = '/index/sampleAjax/';
var isUserNameValid = false;
var assigned_event = 0;
var uploadHandle = '';
var filetype = '';
var s3url = '';
var s3path = '';
var s3file = '';
var filename = '';
var user_id = '';
var media_id = '';
var media_type = '';

$(function() {
	var event_id = getURLParameter('event_id');
	if (event_id != '') {
		ajaxRequest('checkevent', [ {
			tag : 'event_id',
			value : event_id
		} ], function(response) {
			if (getValueFromXMLTag(response, 'status') == 'success') {
				$(".event-name").html(
						"!" + getValueFromXMLTag(response, 'event_name')).css(
						'display', 'inline-block');
				assigned_event = getValueFromXMLTag(response, 'event_id');
			} else {
				jerror(getValueFromXMLTag(response, 'message'));
				setTimeout(function() {
					document.location.href = "/index";
				}, 3000);
			}
		}, 'undefined', true);
	}
});

function getURLParameter(sParam) {
	var sPageURL = window.location.href;
	sPageURL = sPageURL.split('?')[1];
	if (typeof (sPageURL) != 'undefined') {
		var sURLVariables = sPageURL.split('&');

		for (var i = 0; i < sURLVariables.length; i++) {
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam)
				return sParameterName[1];
		}
	}
	return '';
}

onEmailFocusOut = function() {
	if (!isValidEmail($('#inEmail').val())) {
		jerror("Please check your email address");
	}
}

function isValidEmail($email) {
	var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	if (!emailReg.test($email)) {
		return false;
	} else {
		return true;
	}
}

jQuery.checkUserName = function() {
	if (!isValid($('#inUserName').val())) {
		jerror('Username is not allowed special characters');
		$("#register input[name=username]").val('');
		$("#register input[name=username]").focus();
		return false;
	}
	var url_check_username = base_url + "action=checkusername";
	var xml_check_username;
	var json_check_username;
	var data;
	var xml_register;

	var params = [ {
		tag : 'username',
		value : $('#inUserName').val()
	} ];
	ajaxRequest('checkusername', params, function(response) {
		var response_status = getValueFromXMLTag(response, 'Status');
		if (response_status == 'Success') {
			var message_response = getValueFromXMLTag(response, 'message');
			jerror(message_response);
			$('#inUserName').val('').focus();
		}
	});
	return false;
}

jQuery.logout = function() {
	error_log("Inside jQuery.logout script");
	var logout_url = '/index/logout';
	var url_check_username = base_url + "action=checkusername";
	var xml_check_username;
	var json_check_username;
	var data;
	var xml_register;

	$.ajax({
		type : 'post',
		url : logout_url,
		// dataType: 'jsonp',
		// data: 'json=' + data,
		success : function(result) {
			jerror("Finished Logout...");
			return true;
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert(jqXHR.responseText);
			alert(jqXHR.status);
			alert(textStatus);
			alert(errorThrown);
		}
	});
	return false;
}

function fetchSignedURLForUser() {

}

function validateRegstration() {
	console.log("Entered function validateRegstration()");
	var input_email = $("#register input[name=email]").val();
	var input_uname = $("#register input[name=username]").val();
	var input_upass = $("#register input[name=password]").val();
	var input_rpass = $("#register input[name=verifypassword]").val();
	var input_secret = $("#register input[name=secret]").val();
	var legal_agree = $("#register input[name=legal_agree]");
	if (input_email == '' || input_email == 'Your Email') {
		jerror('Please fill email');
		$("#register input[name=email]").focus();
		return false;
	}
	if (input_uname == '' || input_uname == 'User Name') {
		jerror('Please fill your username');
		$("#register input[name=username]").focus();
		return false;
	}
	if (input_upass == '' || input_upass == 'Password') {
		jerror('Please choose your password');
		$("#register input[name=password]").focus();
		return false;
	}
	if (input_upass != input_rpass) {
		jerror('Password confirm no match');
		$("#register input[name=verifypassword]").focus();
		return false;
	}
	if (input_secret == '' || input_secret == 'secret') {
		jerror("We're in beta, please enter the secret to pass");
		$("#register input[name=username]").focus();
		return false;
	}
	if (!legal_agree.is(":checked")) {
		jerror('You must agree with our terms of service');
		return false;
	}

	if (!validateRegisterForm(input_uname, input_upass))
		return false;

	//
	// Set form variable and submit
	//

	// Check profile photo
	var profile_photo = 0;
	if ($("input[name=profile_image]").val() == 1) {
		profile_photo = 1
	}
	var params = [ {
		tag : 'email',
		value : input_email
	}, {
		tag : 'username',
		value : input_uname
	}, {
		tag : 'password',
		value : input_upass
	}, {
		tag : 'device_id',
		value : ''
	}, {
		tag : 'device_type',
		value : 'web'
	}, {
		tag : 'profile_photo',
		value : profile_photo
	}, {
		tag : 'invited_by',
		value : ''
	}, {
		tag : 'secret',
		value : input_secret
	}, {
		tag : 'event_id',
		value : assigned_event
	} ];
	console.log("About to call registration via ajax");
	console.log("secret--->" + input_secret);

	ajaxRequest(
			'registration',
			params,
			function(response) {
				if (getValueFromXMLTag(response, 'status') == 'Success') {
					console.log("passed registration...")
					jsuccess(getValueFromXMLTag(response, 'message'));
					user_id = getValueFromXMLTag(response, 'userid');
					console.log("Registration Success user_id::" + user_id);
					$("input[name=register_user_id]").val(user_id);
					if ($("input[name=profile_image]").val() == 1) {

						// Get signed credentials
						$
								.ajax({
									url : "/index/fetchMemreasTVM",
									// url :
									// "/index/fetchMemreasTVMPreSignedURL",
									type : 'GET',
									dataType : 'json',
									data : {
										"user_id" : user_id
									},
									/*-
									 * send the file name to the
									 * server so it can generate the key param
									 */
									async : true,
									success : function(data) {

										console
												.log("fetchMemreasTVM success function...");

										/*-
										 * Now that we have our data, we update the form so it
										 * contains all the needed data to sign the request
										 */
										form = $("#frm-profile-pic");
										media_id = data.media_id;
										console
												.log("fetchMemreasTVM success function media_id--->"
														+ media_id);
										form.find('input[name=acl]').val(
												data.acl);
										form
												.find(
														'input[name=success_action_status]')
												.val(data.successStatus);
										form.find('input[name=policy]').val(
												data.base64Policy);
										form
												.find(
														'input[name=x-amz-algorithm]')
												.val(data.algorithm);
										form.find(
												'input[name=x-amz-credential]')
												.val(data.credentials);
										form.find('input[name=x-amz-date]')
												.val(data.date);
										form.find('input[name=x-amz-expires]')
												.val(data.expires);
										form
												.find(
														'input[name=x-amz-signature]')
												.val(data.signature);

										//
										// Set Key since user is registered
										//
										var _media_extension = filename
												.split(".");
										_media_extension = _media_extension[_media_extension.length - 1];
										media_type = media_type = 'image/'
												+ _media_extension
														.toLowerCase();
										s3path = user_id + '/' + media_id + '/';
										s3file = filename;
										s3url = s3path + s3file;
										form.find('input[name=Content-Type]')
												.val(media_type);
										form.find('input[name=key]').val(
												s3path + s3file);
										console.log("media_type-->"
												+ media_type);
										console.log("s3path-->" + s3path);
										console.log("s3file-->" + s3file);
										console.log("key-->"
												+ form.find('input[name=key]')
														.val());
										console
												.log("Calling uploadHandle.submit()");

										var jqXHR = uploadHandle.submit();
									},
									error : function(jqXHR, textStatus,
											errorThrown) {
										// alert(jqXHR.responseText);
										// alert(jqXHR.status);
									}
								});
						resetRegisterForm();
					}
				} else {
					jerror(getValueFromXMLTag(response, 'message'));
					console.log("Registration failed");
				}
			});
	return false;
}

function resetRegisterForm() {
	document.register.reset();
	$("#list").html("");
	$(".password-level").html("");
}

function validateRegisterForm(input_uname, input_upass) {
	if (input_uname.length < 4) {
		jerror('Username must greater than 4 charaters');
		$("#register input[name=username]").focus();
		return false;
	}
	if (input_uname.length > 32) {
		jerror('Username is not allowed more than 32 characters');
		$("#register input[name=username]").focus();
		return false;
	}
	if (input_upass.length < 8) {
		jerror('Password length minium 8 charaters');
		$("#register input[name=password]").focus();
		return false;
	}
	if (input_upass.length > 32) {
		jerror('Password length maxinum 32 charaters');
		$("#register input[name=password]").focus();
		return false;
	}
	return true;
}

$(function() {
	$("form#register input[name=password]").keyup(function() {
		var password_val = $(this).val();
		var jDisplayLevel = $("span.password-level");
		if (password_val == '')
			jDisplayLevel.html('');
		else {
			jDisplayLevel.html(checkStrength(password_val));
		}
	});
	$("#inUserName").change(function() {
		$.checkUserName();
	});
	/*
	 * Forgot password submit
	 */
	$("#forgot").submit(function(event) {
		var user_email = $("input[name=forgot_email]").val();
		var params = [ {
			tag : 'email',
			value : user_email
		} ];
		ajaxRequest('forgotpassword', params, function(response) {
			if (getValueFromXMLTag(response, 'status') == 'success') {
				jsuccess(getValueFromXMLTag(response, 'message'));
				$("input[name=forgot_email]").val('');
			} else
				jerror(getValueFromXMLTag(response, 'message'));
		});
		return false;
	});

	// Ajax upload profile image
	$(".file_upload").click(function() {
		$("#frm-profile-pic").find("input[name=file]").click();
	});
	$('.direct-upload')
			.each(
					function() {

						var form = $(this);

						$(this)
								.fileupload(
										{
											dropZone : $('.upload-dropzone, .upload-from-event'),
											url : form.attr('action'),
											dataType : 'xml',
											crossDomain : true,
											multiple : true,
											type : 'POST',
											autoUpload : true,
											add : function(event, data) {
												console
														.log("Inside .direct-upload .fileupload .add");
												filename = data.files[0].name;
												filetype = data.files[0].type;
												// Check if valid type is image
												// or video are allowed
												if (!(filetype.indexOf('image') >= 0)) {
													jerror('Only image type is allowed');
													$(
															"input[name=profile_image]")
															.val(0);
													return false;
												}
												$("input[name=profile_image]")
														.val(1);

												// Use XHR, fallback to iframe
												options = $(this).fileupload(
														'option');
												use_xhr = !options.forceIframeTransport
														&& ((!options.multipart && $.support.xhrFileUpload) || $.support.xhrFormDataFileUpload);

												if (!use_xhr) {
													using_iframe_transport = true;
												}

												uploadHandle = data;
											},
											send : function(e, data) {
												console
														.log("fileupload send function...");
											},
											progress : function(e, data) {
												console
														.log("fileupload progress function...");
												$("#loadingpopup").show();
											},
											fail : function(e, data) {
												console
														.log("fileupload fail function...");
												window.onbeforeunload = null;
											},
											success : function(data, status,
													jqXHR) {
												console
														.log("fileupload success function...");
												var params = [
														{
															tag : 's3url',
															value : s3url
														},
														{
															tag : 'is_server_image',
															value : '0'
														},
														{
															tag : 'content_type',
															value : media_type
														},
														{
															tag : 's3path',
															value : s3path
														},
														{
															tag : 's3file_name',
															value : s3file
														},
														{
															tag : 'device_type',
															value : 'web'
														},
														{
															tag : 'device_id',
															value : ''
														},
														{
															tag : 'event_id',
															value : ''
														},
														{
															tag : 'media_id',
															value : media_id
														},
														{
															tag : 'user_id',
															value : $(
																	"input[name=register_user_id]")
																	.val()
														},
														{
															tag : 'is_profile_pic',
															value : '1'
														}, {
															tag : 'location',
															value : ''
														} ];
												ajaxRequest(
														'addmediaevent',
														params,
														function() {
															jsuccess('Your profile picture updated');
															resetRegisterForm();
														});
											},
											done : function(event, data) {

											}
										});
					});

	// Login form submit
	$("#form-user-login")
			.submit(
					function() {
						var loginname = $(this).find('input[name=username]')
								.val();
						var loginpass = $(this).find('input[name=password]')
								.val();

						if (loginname == '' || loginname == 'username'
								|| loginpass == '' || loginpass == 'password')
							jerror('Please complete all fields');
						else {
							var params = [ {
								tag : 'username',
								value : loginname
							}, {
								tag : 'password',
								value : loginpass
							}, {
								tag : 'device_type',
								value : "web"
							}, {
								tag : 'device_id',
								value : ''
							} ];
							ajaxRequest(
									'login',
									params,
									function(xml_response) {
										if (getValueFromXMLTag(xml_response,
												'status') == 'success') {

											$("#form-user-login")
													.find(
															'input[name=status_user_id]')
													.val(
															getValueFromXMLTag(
																	xml_response,
																	'user_id'));
											$("#form-user-login")
													.find('input[name=sid]')
													.val(
															getValueFromXMLTag(
																	xml_response,
																	'sid'));

											document.user_login_frm.submit();
										} else
											jerror(getValueFromXMLTag(
													xml_response, 'message'));
									});
						}
						return false;
					});

	// Change password form
	$("#frmChangepass").submit(function() {
		var new_password = $(this).find('input[name=new]').val();

		if (new_password.length < 6) {
			jerror('Password length at least 6 characters');
			return false;
		}
		if (new_password.length > 32) {
			jerror('Password length can not take more than 32 characters');
			return false;
		}

		var retype_password = $(this).find('input[name=retype]').val();
		var token_code = $(this).find('input[name=token]').val();
		if (new_password == '' || retype_password == '' || token_code == '') {
			jerror('Please complete all fields');
			return false;
		}
		if (new_password != retype_password) {
			jerror('Password confirm did not match');
			return false;
		}

		var params = [ {
			tag : 'token',
			value : token_code
		}, {
			tag : 'new',
			value : new_password
		}, {
			tag : 'retype',
			value : retype_password
		}, {
			tag : 'username',
			value : ''
		}, {
			tag : 'password',
			value : ''
		} ];
		ajaxRequest('changepassword', params, function(xml_response) {
			if (getValueFromXMLTag(xml_response, 'status') == 'failure')
				jerror(getValueFromXMLTag(xml_response, 'message'));
			else {
				jsuccess(getValueFromXMLTag(xml_response, 'message'));
				document.reset_pwd_frm.reset();
				disablePopup('changePass');
			}
		}, 'undefined', false);
		return false;
	});
});

function popupResetPassword() {
	disablePopup('forgot');
	popup('changePass');
}

function checkStrength(password) {
	// initial strength
	var strength = 0

	// if the password length is less than 6, return message.
	if (password.length < 6) {
		return '<b style="color: white;"><img src="/memreas/img/lock.png" width="20" /> Too short</b>';
	}

	// length is ok, lets continue.

	// if length is 6 characters or more, increase strength value
	if (password.length > 6)
		strength += 1

		// if password contains both lower and uppercase characters, increase
		// strength value
	if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))
		strength += 1

		// if it has numbers and characters, increase strength value
	if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))
		strength += 1

		// if it has one special character, increase strength value
	if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))
		strength += 1

		// if it has two special characters, increase strength value
	if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/))
		strength += 1

		// now we have calculated strength value, we can return messages

		// if value is less than 2
	if (strength < 2) {
		return '<b style="color: white;"><img src="/memreas/img/lock.png" width="20" /> Weak</b>';
	} else if (strength == 2) {
		return '<b style="color: white;"><img src="/memreas/img/lock.png" width="20" /> Medium</b>';
	} else {
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



$('#reportVolForm').click(function(){
   
     //var current_user = $("input[name=user_id]").val();
  
    var copy_right_owner=$('#copyrightowner').val();
    var copyright_owner_address=$('#addressV').val();
    var copyright_owner_email_address=$('#emailvoilcation').val();
    var mediaId_report=$('#mediaId').val();
    var terms_condition=$('#term_condition').val();
    
    
    if (copy_right_owner == '') {
        jerror("Please fill your name");
        return;
    }
    if (copyright_owner_address == '') {
        jerror("Please fill your Address");
        return;
    }
    
    if (copyright_owner_email_address == '') {
        jerror("Please fill your email");
        return;
    }
    
    if (mediaId_report == '') {
        jerror("Please fill your Media Id");
        return;
    }
    
    if(terms_condition ==''){
         jerror("Please checkbox");
         return;
    }
   
    
//    if($(terms_condition).attr('checked') == 'checked'){
//         terms_condition=1;
//         return true;
//    }else{
//        terms_condition =0;
//        return false;
//    }
    
    
		 
	
    console.log('Media ID-->'+mediaId_report + "Owner-->" +copy_right_owner+'address-->'+copyright_owner_address+"Email-->"+copyright_owner_email_address+'terms_condition-->'+terms_condition);
     
			
if(terms_condition =="1"){    
    var params = [{
            tag: "media_id",
            value: mediaId_report
        }, {
            tag: "copyright_owner_name",
            value: copy_right_owner
        }, {
            tag: "copyright_owner_address",
            value: copyright_owner_address
        }, {
            tag: "copyright_owner_email_address",
            value: copyright_owner_email_address
        }, {
            tag: "copyright_owner_agreed_to_terms",
            value: "1"
        },
    ];
   
    
    ajaxRequest('dcmareportviolation', params, function (ret_xml) {
        
        var message=getValueFromXMLTag(ret_xml,'message')
        var status=getValueFromXMLTag(ret_xml,'status');
        
        
        console.log('message-->'+message +'Status-->'+status);
        console.log(ret_xml);
        
        if(status =='success'){
          jsuccess("your Report added");
          disablePopup('popupReportMedia');
          
        }else{
            jerror("your Report is not added");
             disablePopup('popupReportMedia');
        }
        
     


    }, 'undefined', true);

    
    }else 
    jerror("Please check your form");
}) ;

$('#term_condition_label').click(function(){
    $('#term_condition').toggleClass('checked');
    if($('#term_condition').hasClass('checked')){
       $('#term_condition').val(1); 
    }else{
       $('#term_condition').val(''); 
    }
    
});
   