/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
var networkfriendsInfo = [];
var group_mode = 'update';
$(function() {
    $("#morepage_eventDate").datepicker();
    $("#moredate_eventDateFrom").datepicker();
    $("#moredate_eventDateTo").datepicker();
    $("#morepage_eventSelfDestruct").datepicker();

    $("#tab-content-more div.hideCls").hide(); // Initially hide all content
    $("#tabs-more li:first").attr("id", "current"); // Activate first tab
    $("#tab-content-more div:first").fadeIn(); // Show first tab content*/

    $('#tabs-more a').click(function(e) {

	e.preventDefault();
	$("#tab-content-more div.hideCls").hide(); // Hide all content
	$("#tabs-more li").attr("id", ""); // Reset id's
	$(this).parent().attr("id", "current"); // Activate this
	$('#' + $(this).attr('title')).fadeIn(); // Show content for current
	// tab
    });

    $("a[title=more]").one('click', function() {
	// $("#tabs-more").elastislide({minItems: 7});
	$("a[title=tab1-more]").trigger("click");
	$('#buttons-moretab').akordeon();
	$('#button-less').akordeon({
	    buttons : false,
	    toggle : true,
	    itemsOrder : [ 2, 0, 1 ]
	});
    });

    // Group tab
    $("a.group-tab").one('click', function() {
	getUserGroups();
	$('#buttons2-moretab').akordeon();
    });

    $("a.network-tab").one('click', function() {
	$('#buttons3-moretab').akordeon();
    });
    $("a.notification-tab").one('click', function() {
	$('#buttons4-moretab').akordeon();
    });
    $("a.help-tab").one('click', function() {
	$('#buttons5-moretab').akordeon();
    });

    $("a.friends-tab").one('click', function() {
	listFriends();
    });

    $("a.event-tab").one('click', function() {
	$('#buttons6-moretab').akordeon();
	getAccountMemreas();
    });

    var subscriptionTabAkordeon = false;
    $("a.subscription-tab")
	    .click(
		    function() {

			if (!subscriptionTabAkordeon) {
			    $('#buttons7-moretab').akordeon();
			    loadSubscriptionPlans();
			    subscriptionTabAkordeon = true;
			}

			if ($(".subscription-payment-method-tab").hasClass(
				'expanded')) {
			    var jMemberCard = $(".subscription-payment");
			    if (checkReloadItem('reload_subscription_cards')
				    || jMemberCard.html() == '') {
				if (!jMemberCard.hasClass('preload-null'))
				    jMemberCard.addClass('preload-null');
			    }
			    listStripeCard();
			}
		    });

    var buyCreditTabAkordeon = false;
    $("a.buy-credit-tab").click(
	    function() {
		if (!buyCreditTabAkordeon) {
		    $('#buttons8-moretab').akordeon();
		    buyCreditTabAkordeon = true;
		}

		var jMemberCard = $(".buycredit-payment");
		if (checkReloadItem('reload_buy_credit_cards')
			|| jMemberCard.html() == '') {
		    if (jMemberCard.hasClass('preload-null'))
			jMemberCard.addClass('preload-null');
		}
		Account.loadCards(".buycredit-payment", 'buycredit-card',
			'buycredit_cardChange',
			'$(".buycredit-card-functions").show()');
	    });

    // Sell mediatab
    $("a.sell-media-tab").one("click", function() {
	$('#buttons9-moretab').akordeon();
    }).bind("click", function() {
	$("#sell-media-username").val(userObject.username);
	$("#sell-media-email").val(userObject.email);
    });

    /* Action tabs click */
    var accountTabAkordenon = false;
    $("a[title=tab1-more]").click(
	    function() {
		if (!accountTabAkordenon) {
		    activeAkordeon('account-profile-tab', false);
		    accountTabAkordenon = true;
		}
		if ($(".account-card-tab").hasClass('expanded')) {
		    var jMemberCard = $(".account-payment");
		    if (checkReloadItem('reload_account_cards')
			    || jMemberCard.html() == '') {
			if (!jMemberCard.hasClass('preload-null'))
			    jMemberCard.addClass('preload-null')
		    }
		    loadAccountCard();
		    $(".account-card-functions").show();
		}

	    });

    /* Change profile picture */
    var userId = $("input[name=user_id]").val();
    $(".change-profile-btn").click(function() {
	$("#frm-profile-pic").find('input[type=file]').click();
    });
    var profile_filename = '';
    var s3path = '';
    var s3file = '';
    var media_id = '';
    $("#frm-profile-pic")
	    .fileupload(
		    {
			url : $(this).attr('action'),
			dataType : 'xml',
			crossDomain : true,
			multiple : true,
			type : 'POST',
			autoUpload : true,
			add : function(event, data) {
			    profile_filename = data.files[0].name;
			    profile_filename = correctUploadFilename(profile_filename);
			    if (!$("a[title=more]").hasClass('active'))
				return false;
			    var filetype = data.files[0].type;
			    var key_value = profile_filename;
			    if (!(filetype.indexOf('image') >= 0)) {
				jerror('Only image type is allowed.');
				$("input[name=profile_image]").val(0);
				return false;
			    }
			    $("input[name=profile_image]").val(1);
			    if (filetype.indexOf('image') >= 0)
				var target = 'image';
			    else
				target = 'media';

			    if (profile_filename.indexOf(" ") >= 0) {
				alert("Please remove spaces from filename.");
				return;
			    }

			    var form = $(this);
			    alert("more_page calling tvm ...");

			    // Get signed credentials
			    $
				    .ajax({
					url : "/index/fetchMemreasTVM",
					type : 'GET',
					dataType : 'json',
					data : {
					    title : profile_filename
					},
					/*-
					 * send the file name to the server so it
					 * can generate the key param
					 */

					async : false,
					error : function(jqXHR, status,
						thrownError) {
					    alert(jqXHR.status);
					    alert(jqXHR.responseText);
					    alert(status);
					    alert(thrownError);
					},
					success : function(data, status,
						response) {
					    // var xmlstr = data.xml ? data.xml
					    // : (new
					    // XMLSerializer()).serializeToString(data);
					    console
						    .log("response.responseText--->"
							    + response.responseText);
					    /*-
					     * Now that we have our data, we update the form
					     * so it contains all the needed data
					     * to sign the request  
					     */
					    media_id = data.media_id;
					    s3path = userId + '/' + media_id
						    + '/';
					    s3file = profile_filename;
					    form.find('input[name=key]').val(
						    s3path + s3file);
					    form.find('input[name=acl]').val(
						    data.acl);
					    form
						    .find(
							    'input[name=success_action_status]')
						    .val(data.successStatus);
					    form.find('input[name=policy]')
						    .val(data.base64Policy);
					    form
						    .find(
							    'input[name=x-amz-algorithm]')
						    .val(data.algorithm)
					    form
						    .find(
							    'input[name=x-amz-credential]')
						    .val(data.credentials)
					    form.find('input[name=x-amz-date]')
						    .val(data.date)
					    form
						    .find(
							    'input[name=x-amz-expires]')
						    .val(data.expires)
					    form
						    .find(
							    'input[name=x-amz-signature]')
						    .val(data.signature)
					    form.find(
						    "input[name=Content-Type]")
						    .val(filetype);
					}
				    });

			    // Use XHR, fallback to iframe
			    options = $(this).fileupload('option');
			    use_xhr = !options.forceIframeTransport
				    && ((!options.multipart && $.support.xhrFileUpload) || $.support.xhrFormDataFileUpload);

			    if (!use_xhr) {
				using_iframe_transport = true;
			    }

			    $("#loadingpopup").show();
			    var jqXHR = data.submit();
			},
			send : function(e, data) {
			    console.log("send function called...");
			},
			progress : function(e, data) {
			    console.log("progress function called...");
			},
			fail : function(e, data) {
			    window.onbeforeunload = null;
			},
			success : function(data, status, jqXHR) {
			    console.log("data.submit success...");
			    console.log("jqXHR.responseText--->"
				    + jqXHR.responseText);

			    var _media_url = getValueFromXMLTag(
				    jqXHR.responseText, 'Key');
			    var _media_extension = _media_url.split(".");
			    _media_extension = _media_extension[_media_extension.length - 1];
			    var media_type = 'image/'
				    + _media_extension.toLowerCase(); // only
			    // image
			    // allowed
			    // for
			    // profile
			    // pic...
			    console.log('media_type::' + media_type);
			    var s3url = s3path + s3file;
			    var params = [ {
				tag : 's3url',
				value : s3url
			    }, {
				tag : 'is_server_image',
				value : '0'
			    }, {
				tag : 'content_type',
				value : media_type
			    }, {
				tag : 's3path',
				value : s3path
			    }, {
				tag : 's3file_name',
				value : s3file
			    }, {
				tag : 'device_type',
				value : 'web'
			    }, {
				tag : 'device_id',
				value : ''
			    }, {
				tag : 'event_id',
				value : ''
			    }, {
				tag : 'media_id',
				value : media_id
			    }, {
				tag : 'user_id',
				value : user_id
			    }, {
				tag : 'is_profile_pic',
				value : '1'
			    }, {
				tag : 'location',
				value : ''
			    } ];
			    ajaxRequest(
				    'addmediaevent',
				    params,
				    function(ret_xml) {
					jsuccess('Your profile picture updated');
					setTimeout(
						function() {
						    var params = [ {
							tag : 'user_id',
							value : $(
								"input[name=user_id]")
								.val()
						    } ];
						    ajaxRequest(
							    'getuserdetails',
							    params,
							    function(
								    xml_response) {
								//
								console
									.log(xml_response);
								//
								if (getValueFromXMLTag(
									xml_response,
									'status') == 'Success') {
								    var useremail = getValueFromXMLTag(
									    xml_response,
									    'email');
								    var username = getValueFromXMLTag(
									    xml_response,
									    'username');
								    $(
									    "input[name=username]")
									    .val(
										    username);
								    var userprofile = getValueFromXMLTag(
									    xml_response,
									    'profile');
								    userprofile = removeCdataCorrectLink(userprofile);
								    // update
								    // image
								    $(
									    "#setting-userprofile img, img#profile_picture")
									    .attr(
										    'src',
										    userprofile);
								    var alternate_email = getValueFromXMLTag(
									    xml_response,
									    'alternate_email');
								    var gender = getValueFromXMLTag(
									    xml_response,
									    'gender');

								    var dob = getValueFromXMLTag(
									    xml_response,
									    'dob');
								    var username_length = username.length;
								    if (username_length > 10) {
									username = username
										.substring(
											0,
											7)
										+ '...';
								    }
								    $("header")
									    .find(
										    ".pro-name")
									    .html(
										    username);
								    $(
									    "#setting-username")
									    .html(
										    getValueFromXMLTag(
											    xml_response,
											    'username'));
								    if (userprofile != '') {
									$(
										"header")
										.find(
											"#profile_picture")
										.attr(
											'src',
											userprofile);
									$(
										"#setting-userprofile img")
										.attr(
											'src',
											userprofile);
								    }
								    $(
									    "input[name=account_email]")
									    .val(
										    useremail);
								    $(
									    "input[name=account_alternate_email]")
									    .val(
										    alternate_email);
								    $(
									    "input[name=account_dob]")
									    .val(
										    dob);

								    if (gender == 'male')
									$(
										"#gender-male")
										.attr(
											"checked",
											"checked");
								    else {
									if (gender == 'female')
									    $(
										    "#gender-female")
										    .attr(
											    "checked",
											    "checked");
								    }

								    $(
									    "input[name=account_email]")
									    .val(
										    useremail);
								} else
								    jerror(getValueFromXMLTag(
									    xml_response,
									    'messsage'));
							    });
						}, 2000);
				    });
			},
			done : function(event, data) {

			}
		    });
});

/* Fill in current logged user detail */
function fillUserDetail(currentUserId) {
    var params = [ {
	tag : 'user_id',
	value : currentUserId
    } ];
    ajaxRequest('getuserdetails', params, function(xml_response) {
	if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
	    var username = getValueFromXMLTag(xml_response, 'username');
	    var useremail = getValueFromXMLTag(xml_response, 'email');
	    var userprofile = getValueFromXMLTag(xml_response, 'profile');
	    var alternate_email = getValueFromXMLTag(xml_response,
		    'alternate_email');
	    var gender = getValueFromXMLTag(xml_response, 'gender');
	    var dob = getValueFromXMLTag(xml_response, 'dob');
	    $("#setting-username").html(username);
	    console.log('userprofile' + userprofile);

	    if (userprofile != '') {
		$("#setting-userprofile img").attr('src', userprofile);
	    }
	    $("input[name=account_email]").val(useremail);
	    $("input[name=account_alternate_email]").val(alternate_email);
	    $("input[name=account_dob]").val(dob);

	    if (gender == 'male')
		$("#gender-male").attr("checked", "checked");
	    else {
		if (gender == 'female')
		    $("#gender-female").attr("checked", "checked");
	    }
	} else
	    jerror(getValueFromXMLTag(xml_response, 'messsage'));
    });
}

/* Function Save user detail */
function saveUserDetail() {
    var account_gender = 'male';
    /*
     * if ($("#gender-male").is(":checked")) var account_gender = 'male'; else{
     * if ($("#gender-female").is(":checked")) var account_gender = 'male'; else
     * var account_gender = ''; }
     */
    if ($("#gender-female").is(":checked")) {
	account_gender = 'female';
    } else {
	account_gender = 'male';
    }

    var account_dob = $("input[name=account_dob]").val();

    var cdate = new Date();
    var current_date = ("0" + (cdate.getMonth() + 1)).slice(-2) + '/'
	    + ("0" + cdate.getDate()).slice(-2) + '/' + cdate.getFullYear();
    if (account_dob > current_date) {
	jerror('Date of birth cannot be in future.');
	$("#account_dob").val('').focus();
	return false;
    }

    if ($("input[name=account_email]").length) {
	var orginal_email = $("input[name=account_email]").val();
	var alternate_email = $("input[name=account_alternate_email]").val();
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (!regex.test(alternate_email)) {
	    jerror('your email address does not correct format.');
	    return false;
	} else {
	    if ($.trim(orginal_email) == $.trim(alternate_email)) {
		jerror('alternate email should not be the same as orginal email.');
		return false;
	    }
	}
    }
    var userId = $("input[name=user_id]").val();
    var params = [ {
	tag : 'user_id',
	value : userId
    }, {
	tag : 'email',
	value : $("input[name=account_alternate_email]").val()
    }, {
	tag : 'gender',
	value : account_gender
    }, {
	tag : 'dob',
	value : account_dob
    }, {
	tag : 'profile_picture',
	value : ''
    } ];
    ajaxRequest('saveuserdetails', params, function(xml_response) {
	if (getValueFromXMLTag(xml_response, 'status') == "Success") {
	    jsuccess(getValueFromXMLTag(xml_response, 'message'));
	    fillUserDetail($("input[name=user_id]").val());
	} else
	    jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}

/* Function Save user detail */
function saveChangePassword() {
    var account_old_password = $("input[name=account_old_password]").val();
    var account_password = $("input[name=account_password]").val();

    if (account_old_password == '') {
	jerror('please enter old password');
	return false;
    }

    if (account_password != 'password' && account_password != '') {
	var retype_account_password = $("input[name=account_repassword]").val();
	if (account_password != retype_account_password) {
	    jerror('password is not matched');
	    return false;
	}
    } else {
	if (account_password == 'password') {
	    jerror("please input your new password");
	    account_password = '';
	    return false;
	}
    }

    var userId = $("input[name=user_id]").val();
    var params = [ {
	tag : 'user_id',
	value : userId
    }, {
	tag : 'old',
	value : account_old_password
    }, {
	tag : 'new',
	value : account_password
    }, {
	tag : 'retype',
	value : retype_account_password
    } ];
    ajaxRequest('updatepassword', params, function(xml_response) {
	if (getValueFromXMLTag(xml_response, 'status') == "success") {
	    jsuccess(getValueFromXMLTag(xml_response, 'message'));
	    fillUserDetail($("input[name=user_id]").val());
	} else
	    jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}
function switchoffothertabs() {
    var te = 0;
    var te2 = 0;
    $("#buttons2-moretab").find("div.manage-group-friend").find(
	    "div.akordeon-icon").each(function() {
	if (te == 0) {
	    $(this).html("<span>+</span>");
	}
	te++;
    });
    $("#buttons2-moretab").find("div.manage-group-friend").find(
	    "div.akordeon-item-body").each(function() {
	if (te2 == 0) {
	    $(this).css({
		"height" : "0px"
	    });
	}
	te2++;
    });
}
/*
 * Group Tab Action on second more tab - account group tab
 */
function getUserGroups() {
    var loggedUserId = $("input[name=user_id]").val();
    var params = [ {
	tag : 'user_id',
	value : loggedUserId
    } ];
    $("select.account-groups").html('<option value="">-Choose-</option>');
    ajaxRequest('getusergroups', params, function(xml_response) {
	if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
	    var groups = getSubXMLFromTag(xml_response, 'group');
	    var total_record = groups.length;
	    for (var i = 0; i < total_record; i++) {
		$("select.account-groups").append(
			'<option value="'
				+ getValueFromXMLTag(groups[i], 'group_id')
				+ '">'
				+ getValueFromXMLTag(groups[i], 'group_name')
				+ '</option>');
	    }
	} else
	    jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}

$(function() {
    // Network heading click
    $(".network-heading").click(
	    function() {
		$("select[name=friend_network]").trigger('change');
		setTimeout(function() {
		    var te = 0;
		    var te2 = 0;
		    $("#buttons2-moretab").find("div.akordeon-icon").each(
			    function() {
				if (te == 0) {
				    $(this).html("<span>–</span>");
				}
				te++;
			    });
		    $("#buttons2-moretab").find("div.akordeon-item-body").each(
			    function() {
				if (te2 == 0) {
				    $(this).css({
					"height" : "70px"
				    });
				}
				te2++;
			    });
		}, 2000);
	    });

    // Friend network selection changed
    $("select[name=friend_network]").change(function() {
	var network_selected = $(this).val();
	networkFriendsChanged(network_selected);
    });
});

function networkFriendsChanged(friend_network) {
    // Reset friend element
    friendList = null;
    switch (friend_network) {
    case 'memreas':
	getGroupFriends('memreas');
	break;
    }
}
// Get friend based on group list
function getGroupFriends(friend_network) {

    if (group_mode == 'update') {
	var group_id = $("select[name=account_groups]").val();
	if (group_id == '') {
	    jerror('Please select your group name first.');
	    return false;
	}
    } else
	group_id = '';

    var params = [ {
	tag : 'group_id',
	value : group_id
    }, {
	tag : 'network',
	value : friend_network
    } ];
    ajaxRequest(
	    'getgroupfriends',
	    params,
	    function(xml_response) {
		if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
		    var friend_list = getSubXMLFromTag(xml_response, 'friend');
		    var count_friend = friend_list.length;
		    networkfriendsInfo = [];
		    for (var i = 0; i < count_friend; i++) {
			if (getValueFromXMLTag(friend_list[i], 'friend_photo') == ''
				|| getValueFromXMLTag(friend_list[i],
					'friend_photo') == 'null')
			    var friend_photo = '/memreas/img/profile-pic.jpg';
			else
			    var friend_photo = getValueFromXMLTag(
				    friend_list[i], 'friend_photo');
			friend_photo = removeCdataCorrectLink(friend_photo);
			friend_photo = friend_photo.split("&amp;").join("&");
			networkfriendsInfo[i] = {
			    'id' : getValueFromXMLTag(friend_list[i],
				    'friend_id'),
			    'div_id' : getValueFromXMLTag(friend_list[i],
				    'friend_id'),
			    'name' : getValueFromXMLTag(friend_list[i],
				    'friend_name'),
			    'photo' : friend_photo,
			    'selected' : false
			};
		    }
		    network_fillFriends(networkfriendsInfo);
		} else {
		    jerror(getValueFromXMLTag(xml_response, 'message'));

		    if ($('.network-friends').hasClass('mCustomScrollbar'))
			friendList = $(".network-friends .mCSB_container");
		    else
			friendList = $('.network-friends');
		    friendList
			    .empty()
			    .append(
				    '<li>You have no friend on this network at this time</li>');
		}
	    });

    var te = 0;
    var te2 = 0;
    $("#buttons2-moretab").find("div.manage-group-friend").find(
	    "div.akordeon-icon").each(function() {
	if (te == 0) {
	    $(this).html("<span>–</span>");
	}
	te++;
    });
    $("#buttons2-moretab").find("div.manage-group-friend").find(
	    "div.akordeon-item-body").each(function() {
	if (te2 == 0) {
	    $(this).css({
		"height" : "180px"
	    });
	}
	te2++;
    });
}

// Popup friend network changed
$(function() {
    $("select#network-dropfriend").change(function() {
	var network_dropdown_selected = $(this).val();
	friendList = null;
	switch (network_dropdown_selected) {
	case 'memreas':
	    networkPopupMemreasFriends();
	    break;
	default:
	    jerror('select friends');
	}
	if (!$("#popupNetworkFriends").is(":visible")) {
	    popup('popupNetworkFriends');
	    $("select#network-dropfriend").chosen({
		width : "95%"
	    });
	}
	ajaxScrollbarElement(".popupNetworkFriends_list");
    });
});

function networkPopupMemreasFriends() {
    var params = [ {
	tag : 'user_id',
	value : LOGGED_USER_ID
    } ];
    ajaxRequest('listmemreasfriends', params, function(xml_response) {
	if (getValueFromXMLTag(xml_response, 'status')) {
	    var friends = getSubXMLFromTag(xml_response, 'friend');
	    var friendCount = friends.length;
	    mr_friendsInfo = [];
	    for (var i = 0; i < friendCount; i++) {
		var friend = friends[i];
		if (getValueFromXMLTag(friend, 'photo') == ''
			|| getValueFromXMLTag(friend, 'photo') == 'null')
		    var friend_photo = '/memreas/img/profile-pic.jpg';
		else
		    var friend_photo = getValueFromXMLTag(friend, 'photo');
		friend_photo = removeCdataCorrectLink(friend_photo);
		mr_friendsInfo[i] = {
		    'id' : getValueFromXMLTag(friend, 'friend_id'),
		    'div_id' : 'mr_' + i,
		    'name' : getValueFromXMLTag(friend, 'friend_name'),
		    'photo' : friend_photo,
		    'selected' : false
		};
	    }
	    network_fillPopupFriends(mr_friendsInfo);
	}
    });
}

function network_fillPopupFriends(info) {
    if (friendList == null)
	friendList = $('.popupNetworkFriends_list');

    friendList.empty();

    var i = 0, el;

    for (i = 0; i < info.length; i++) {
	el = '';
	el += '<li>';
	el += '<figure class="pro-pics2" id="'
		+ info[i].div_id
		+ '" onclick="javascript:share_clickFriends(this.id);"><img src="'
		+ info[i].photo + '" alt="" '
		+ (info[i].selected ? 'class="setchoosed"' : '') + '></figure>';
	el += '<aside class="pro-pic_names2" name="'
		+ info[i].name
		+ '" id="a'
		+ info[i].div_id
		+ '" onclick="javascript:share_clickFriends(this.id.substr(1));">'
		+ info[i].name + '</aside>';
	el += '</li>';

	friendList.append(el);
    }

    var imgList = $('.popupNetworkFriends_list .mCSB_container li img');

    for (i = 0; i < imgList.length; i++) {
	$(imgList[i]).prop('src', info[i].photo);
    }
    $(".popupNetworkFriends_list").mCustomScrollbar({
	scrollButtons : {
	    enable : true
	}
    });
}

function network_fillFriends(info) {
    if ($('.network-friends').hasClass('mCustomScrollbar'))
	friendList = $(".network-friends .mCSB_container");
    else
	friendList = $('.network-friends');

    friendList.empty();

    var i = 0, el;

    for (i = 0; i < info.length; i++) {
	el = '';
	el += '<li>';
	el += '<figure class="pro-pics2" id="'
		+ info[i].div_id
		+ '" onclick="javascript:network_clickFriends(this.id);"><img src="'
		+ info[i].photo + '" alt="" '
		+ (info[i].selected ? 'class="setchoosed"' : '') + '></figure>';
	el += '<aside class="pro-pic_names2" name="' + info[i].name
		+ '" id="network-' + info[i].div_id
		+ '" onclick="$(this).prev(\'figure\').click();">'
		+ info[i].name + '</aside>';
	el += '</li>';

	friendList.append(el);
    }

    var imgList = $('.network-friends .mCSB_container li img');

    for (i = 0; i < imgList.length; i++) {
	$(imgList[i]).prop('src', info[i].photo);
    }
    ajaxScrollbarElement(".network-friends");
}

// Add friend to network groups
function addFriendNetwork() {
    var group_id = $("select[name=account_groups]").val();
    if (group_id == '') {
	jerror('Please choose your network group first to add more friends');
	return false;
    }
    // Assign current group name
    $("#network-groupname span").html(
	    $("select[name=account_groups] option[value='" + group_id + "']")
		    .html());

    // Set friend social network
    $("select#network-dropfriend").trigger('change');
}

// Add friend button popup clicked
function acceptAddFriendNetwork() {
    var friend_network = $("select#network-dropfriend").val();
    var selected_friend = [];
    var increase = 0;
    switch (friend_network) {
    case 'memreas':
	var count_friend = mr_friendsInfo.length;
	var network_name = 'memreas';
	for (var i = 0; i < count_friend; i++) {
	    if (mr_friendsInfo[i].selected) {
		if (mr_friendsInfo[i].photo == 'null')
		    var friend_photo = '/memreas/img/profile-pic.jpg';
		else
		    var friend_photo = mr_friendsInfo[i].photo;
		selected_friend[increase++] = {
		    tag : 'friend',
		    value : [ {
			tag : 'friend_name',
			value : mr_friendsInfo[i].name
		    }, {
			tag : 'profile_pic_url',
			value : ''
		    } ]
		};
	    }
	}
	break;
    default:
	jerror('Your social network invalid');
	return false;
    }
    var params = [ {
	tag : 'group_id',
	value : $("select[name=account_groups]").val()
    }, {
	tag : 'network',
	value : network_name
    }, {
	tag : 'friends',
	value : selected_friend
    } ];
    ajaxRequest('addfriendtogroup', params, function(xml_response) {
	if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
	    jsuccess(getValueFromXMLTag(xml_response, 'message'));

	    // Reload friend panel
	    $("select[name=friend_network]").val(
		    $("select#network-dropfriend").val());
	    disablePopup('popupNetworkFriends');
	    setTimeout(function() {
		$("select[name=friend_network]").trigger('change');
	    }, 2000);
	} else
	    jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}

// Click network friends
function network_clickFriends(selected_friend_id) {
    var jElement = $("#" + selected_friend_id);
    var jSubElement = $("#network-" + selected_friend_id);
    if (jElement.hasClass('nw-friend-selected')) {
	jElement.removeClass('nw-friend-selected');
	jSubElement.removeClass('nw-friend-selected');
    } else {
	jElement.addClass('nw-friend-selected');
	jSubElement.addClass('nw-friend-selected');
    }
}

// Update network friends
function updateNetworkFriends(confirmStatus) {

    var network_friend_count = networkfriendsInfo.length;

    networkFriendsSelected = [];
    increase = 0;
    for (i = 0; i < network_friend_count; i++) {
	if ($("#" + networkfriendsInfo[i].id).hasClass('nw-friend-selected'))
	    networkFriendsSelected[increase++] = {
		tag : 'friend',
		value : [ {
		    tag : 'friend_id',
		    value : networkfriendsInfo[i].id
		} ]
	    };

    }
    var friendSelected = networkFriendsSelected.length;
    if (friendSelected == 0) {
	jerror('Please select friend(s) to remove.');
	return;
    }

    if (!confirmStatus) {
	jconfirm("Update these changes?", "updateNetworkFriends(true)");
	return false;
    }

    var params = [ {
	tag : 'group_id',
	value : $("select[name=account_groups]").val()
    }, {
	tag : 'friends',
	value : networkFriendsSelected
    } ];
    ajaxRequest('removefriendgroup', params, function(xml_response) {
	jsuccess(getValueFromXMLTag(xml_response, 'message'));
	setTimeout(function() {
	    $("select[name=friend_network]").trigger('change');
	}, 2000);
    });
}

function removeGroup(confimStatus) {
    var group_id = $("select[name=account_groups]").val();
    if (group_id == '') {
	jerror('Please select your group name first.');
	return false;
    }

    if (!confimStatus)
	jconfirm('Are you sure want to remove this group?', 'removeGroup(true)');
    else {
	var params = [ {
	    tag : 'group_id',
	    value : group_id
	} ];
	ajaxRequest('removegroup', params, function(response) {
	    if (getValueFromXMLTag(response, 'status') == 'Success') {
		jsuccess(getValueFromXMLTag(response, 'message'));
		getUserGroups();
	    } else
		jerror(getValueFromXMLTag(response, 'messsage'));
	});
    }
}

/*
 * Morepage memreas management
 */
var currentMorepageEventId = '';
$(function() {
    $(".memreas-media-header").click(function() {
	getMemreasEventMedia();
    });
    $(".memreas-friend-header").click(function() {
	getMorepageEventFriends();
    });

    $("#cmd_MorepageEvents").change(function() {
	fillmorepage_eventDetail($(this).val());
    });
});
function getAccountMemreas() {
    $("#morepage_event_sellmedia").hide();
    var jSelectEventName = $("#cmd_MorepageEvents");

    if (jSelectEventName.html() == '') {
	ajaxRequest('viewevents', [ {
	    tag : 'user_id',
	    value : user_id
	}, {
	    tag : 'is_my_event',
	    value : '1'
	}, {
	    tag : 'is_friend_event',
	    value : '0'
	}, {
	    tag : 'is_public_event',
	    value : '0'
	}, {
	    tag : 'page',
	    value : '1'
	}, {
	    tag : 'limit',
	    value : '20'
	} ], function(response) {
	    if (getValueFromXMLTag(response, 'status') == "Success") {
		var events = getSubXMLFromTag(response, 'event');
		var event_count = events.length;
		var html_str = '';
		for (var i = 0; i < event_count; i++) {
		    var event = events[i].innerHTML;
		    var eventId = $(event).filter('event_id').html();
		    var event_name = $(event).filter('event_name').html();
		    html_str += '<option value="' + eventId + '">' + event_name
			    + '</option>';
		}
		jSelectEventName.html(html_str);
		$("#cmd_MorepageEvents").change();
		setTimeout(function() {
		    $("#cmd_MorepageEvents").chosen({
			disable_search_threshold : 10,
			no_results_text : "Oops, nothing found!",
			width : "100%"
		    });
		}, 500);

	    } else
		jerror('You have no event at this time');
	});

    }
}

function fillmorepage_eventDetail(morepage_event_id) {
    var jMorepageEventDate = $("#morepage_eventDate");
    var jMorepageEventLocation = $("#morepage_eventLocation");
    var jMorepageEventFriendsCanPost = $("#morepage_eventFriendsCanPost");
    var jMorepageEventFreindsCanAdd = $("#morepage_friendsCanAdd");
    // var jMorepage_EventPublic = $("#morepage_public");
    var jMorepage_isviewable = $("#morepage_isviewable");
    var jMoredate_eventDateFrom = $("#moredate_eventDateFrom");
    var jMoredate_eventDateTo = $("#moredate_eventDateTo");
    var jMorepage_IsSelfDestruct = $("#morepage_isselfdestruct");
    var jmorepage_eventSelfDestruct = $("#morepage_eventSelfDestruct");

    $("#morepage_event_sellmedia").hide();
    $("input#morepage_ckb_sellmedia").removeAttr("checked");

    ajaxRequest('geteventdetails', [ {
	tag : 'event_id',
	value : morepage_event_id
    } ], function(response) {
	if (getValueFromXMLTag(response, 'status') == "Success") {

	    if (getValueFromXMLTag(response, 'date') != '') {
		var event_date = getValueFromXMLTag(response, 'date');

		// Convert date format to mm/dd/yyyy
		event_date = event_date.split("/");
		event_date = event_date[1] + "/" + event_date[0] + "/"
			+ event_date[2];
		jMorepageEventDate.val(event_date);
	    } else
		jMorepageEventDate.val('from');

	    if (getValueFromXMLTag(response, 'location') != '')
		jMorepageEventLocation.val(getValueFromXMLTag(response,
			'location'));

	    var friendsCanPost = getValueFromXMLTag(response,
		    'friends_can_post');
	    if (friendsCanPost == 1)
		jMorepageEventFriendsCanPost.attr('checked', true);
	    else
		jMorepageEventFriendsCanPost.removeAttr('checked', false);

	    var friendsCanAdd = getValueFromXMLTag(response,
		    'friends_can_share');
	    if (friendsCanAdd == 1)
		jMorepageEventFreindsCanAdd.attr('checked', true);
	    else
		jMorepageEventFreindsCanAdd.removeAttr('checked');

	    if (getValueFromXMLTag(response, 'viewable_from') != '') {
		var viewable_from = getValueFromXMLTag(response,
			'viewable_from');

		// Convert date format to mm/dd/yyyy
		viewable_from = viewable_from.split("/");
		viewable_from = viewable_from[1] + "/" + viewable_from[0] + "/"
			+ viewable_from[2];
		jMoredate_eventDateFrom.val(viewable_from);
		jMorepage_isviewable.attr('checked', true)
	    } else {
		jMoredate_eventDateFrom.val('from');
		jMorepage_isviewable.removeAttr('checked');
	    }

	    /*
	     * if (getValueFromXMLTag(response, 'public') != '0'){
	     * jMorepage_EventPublic.val(getValueFromXMLTag(response,
	     * 'self_destruct')); jMorepage_EventPublic.attr('checked', true); }
	     * else{ jMorepage_EventPublic.val(0);
	     * jMorepage_IsSelfDestruct.removeAttr('checked'); }
	     */

	    if (getValueFromXMLTag(response, 'viewable_to') != '') {
		var viewable_to = getValueFromXMLTag(response, 'viewable_to');

		// Convert date format to mm/dd/yyyy
		viewable_to = viewable_to.split("/");
		viewable_to = viewable_to[1] + "/" + viewable_to[0] + "/"
			+ viewable_to[2];
		jMoredate_eventDateTo.val(viewable_to);
	    } else
		jMoredate_eventDateTo.val('to');

	    if (getValueFromXMLTag(response, 'self_destruct') != '') {
		jmorepage_eventSelfDestruct.val(getValueFromXMLTag(response,
			'self_destruct'));
		jMorepage_IsSelfDestruct.attr('checked', true);
	    } else {
		jmorepage_eventSelfDestruct.val('');
		jMorepage_IsSelfDestruct.removeAttr('checked');
	    }

	    var metadata = getValueFromXMLTag(response, 'event_metadata');
	    metadata = JSON.parse(metadata);
	    var price = metadata.price;

	    if (price > 0) {
		$("input#morepage_ckb_sellmedia").attr("checked", true);
		$("#morepage_event_sellmedia").show();
	    }

	} else
	    jerror(getValueFromXMLTag(response, 'message'));
    });
}

function getMemreasEventMedia() {
    var jMemreasEventMedia = $(".memreasEventMedia");

    if (jMemreasEventMedia.hasClass("mCustomScrollbar"))
	jMemreasEventMedia = $(".memreasEventMedia .mCSB_container");

    var memreasEventId = $("#cmd_MorepageEvents").val();
    if (memreasEventId == '') {
	jerror('Please select your memreas event above');
	return false;
    }

    if (memreasEventId == currentMorepageEventId
	    && jMemreasEventMedia.html() != '')
	return false;

    currentMorepageEventId = memreasEventId;
    ajaxRequest(
	    'listallmedia',
	    [ {
		tag : 'event_id',
		value : memreasEventId
	    }, {
		tag : 'user_id',
		value : user_id
	    }, {
		tag : 'device_id',
		value : ''
	    }, {
		tag : 'limit',
		value : '100'
	    }, {
		tag : 'page',
		value : '1'
	    } ],
	    function(response) {
		jMemreasEventMedia.empty();
		if (getValueFromXMLTag(response, 'status') == "Success") {
		    var medias = getSubXMLFromTag(response, 'media');
		    var media_count = medias.length;
		    for (var i = 0; i < media_count; i++) {
			var media = medias[i];
			var media_type = getValueFromXMLTag(media, 'type');
			var media_id = getValueFromXMLTag(media, 'media_id');
			var _media_url = getMediaThumbnail(media,
				'/memreas/img/small/1.jpg');
			if (media_type == 'video')
			    jMemreasEventMedia
				    .append('<li class="event_img video-media" id="moremedia-'
					    + media_id
					    + '" onclick="more_clickMedia(this.id);"><img src="'
					    + _media_url
					    + '"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></li>');
			jMemreasEventMedia
				.append('<li class="event_img" id="moremedia-'
					+ media_id
					+ '" onclick="more_clickMedia(this.id);"><img src="'
					+ _media_url + '"/></li>');
		    }
		    ajaxScrollbarElement("#memreasEventMedia");
		    updateAkordeonContent($(".memreas-media"));
		} else
		    jerror('You have no media on this event');
	    });
}

function morepage_saveEvent(confirmed) {
    var viewable_from = (($("#moredate_eventDateFrom").val() != '' && $(
	    "#moredate_eventDateFrom").val() != 'from') ? $(
	    "#moredate_eventDateFrom").val() : '');
    if (viewable_from != '') {
	var split_date = viewable_from.split('/');
	viewable_from = split_date[1] + '-' + split_date[0] + '-'
		+ split_date[2]; // Correct date format to d-m-Y
    }

    var viewable_to = (($("#moredate_eventDateTo").val() != '' && $(
	    "#moredate_eventDateTo").val() != 'to') ? $("#moredate_eventDateTo")
	    .val()
	    : '');

    if (viewable_to != '') {
	var split_date = viewable_to.split('/');
	viewable_to = split_date[1] + '-' + split_date[0] + '-' + split_date[2]; // Correct
	// date
	// format
	// to
	// d-m-Y
    }

    var self_destruct = (($("#morepage_eventSelfDestruct").val() != '') ? $(
	    "#morepage_eventSelfDestruct").val() : '');
    if (self_destruct != '') {
	var split_date = self_destruct.split('/');
	self_destruct = split_date[1] + '-' + split_date[0] + '-'
		+ split_date[2]; // Correct date format to d-m-Y
    }
    var friend_can_post = 0;
    if ($("#morepage_eventFriendsCanPost").is(":checked"))
	friend_can_post = 1;
    else
	friend_can_post = 0;
    if ($("#morepage_friendsCanAdd").is(":checked"))
	var friend_can_add = 1;
    else
	var friend_can_add = 0;

    // Check if event has selling event and check box, confirm
    if ($("#morepage_event_sellmedia").is(":visible")) {
	if (!$("input#morepage_ckb_sellmedia").is(":checked") && !confirmed) {
	    jconfirm("Your event will become free. Are you sure?",
		    "morepage_saveEvent(true)");
	    return false;
	}

	if ($("input#morepage_ckb_sellmedia").is(":checked"))
	    var sell_media = 1;
	else
	    var sell_media = 0;
    } else
	var sell_media = 0;

    var params = [
	    {
		tag : 'event_id',
		value : $("#cmd_MorepageEvents").val()
	    },
	    {
		tag : 'event_name',
		value : $(
			"#cmd_MorepageEvents option[value='"
				+ $("#cmd_MorepageEvents").val() + "']").html()
	    },
	    {
		tag : 'event_location',
		value : (($("#morepage_eventLocation").val() != '' && $(
			"#morepage_eventLocation").val() != 'address or current location') ? $(
			"#morepage_eventLocation").val()
			: '')
	    },
	    {
		tag : 'event_date',
		value : (($("#morepage_eventDate").val() != '' && $(
			"#morepage_eventDate").val() != 'from') ? $(
			"#morepage_eventDate").val() : '')
	    },
	    // {tag: 'viewable'}
	    {
		tag : 'event_from',
		value : viewable_from
	    }, {
		tag : 'event_to',
		value : viewable_to
	    }, {
		tag : 'is_friend_can_post_media',
		value : friend_can_post.toString()
	    }, {
		tag : 'is_friend_can_add_friend',
		value : friend_can_add.toString()
	    }, {
		tag : 'event_self_destruct',
		value : self_destruct
	    }, {
		tag : 'sell_media',
		value : sell_media.toString()
	    } ];
    ajaxRequest('editevent', params, function(response) {
	if (getValueFromXMLTag(response, 'status')) {
	    var ssMsg = getValueFromXMLTag(response, 'message');

	    if ($.trim(ssMsg).toLowerCase() == 'record not updated') {
		ssMsg = "No record to update";
	    }
	    jsuccess(ssMsg);
	    if (ssMsg.toLowerCase() == "no record to update") {
		$("#jSuccess").css("background-image", "none");
		$("#jSuccess").css("padding-left", "10px");
	    }
	}

	else
	    jerror(getValueFromXMLTag(response, 'message'));
    });
}

function getMorepageEventFriends() {
    var jMemreasEventFriend = $(".memreasMorepageFriends");

    if (jMemreasEventFriend.hasClass("mCustomScrollbar"))
	jMemreasEventFriend = $(".memreasMorepageFriends .mCSB_container");

    var memreasEventId = $("#cmd_MorepageEvents").val();

    if (memreasEventId == '') {
	jerror('Please select your memreas event above');
	return false;
    }

    if (memreasEventId == currentMorepageEventId
	    && jMemreasEventFriend.html() != '')
	return false;

    currentMorepageEventId = memreasEventId;

    ajaxRequest(
	    'geteventpeople',
	    [ {
		tag : 'event_id',
		value : memreasEventId
	    } ],
	    function(xml_response) {
		jMemreasEventFriend.empty();
		if (getValueFromXMLTag(xml_response, 'status') == 'Success') {
		    var friends = getSubXMLFromTag(xml_response, 'friend');
		    var count_people = friends.length;
		    for (var i = 0; i < count_people; i++) {
			var friend = friends[i];
			if (getValueFromXMLTag(friend, 'photo') == ''
				|| getValueFromXMLTag(friend, 'photo') == 'null')
			    var friend_photo = '/memreas/img/profile-pic.jpg';
			else
			    var friend_photo = getValueFromXMLTag(friend,
				    'photo');
			friend_photo = removeCdataCorrectLink(friend_photo);
			var friend_id = getValueFromXMLTag(friend, 'friend_id');
			var friend_name = getValueFromXMLTag(friend,
				'friend_name');
			var html_str = '<li>';
			html_str += '<figure class="pro-pics2" id="morefriend-'
				+ friend_id
				+ '" onclick="javascript:morepage_clickFriends(this.id);"><img class="morepage-friend-thumb" src="'
				+ friend_photo + '" alt="" ></figure>';
			html_str += '<aside class="pro-pic_names2" name="'
				+ friend_name
				+ '" id="a'
				+ friend_id
				+ '" onclick="javascript:share_clickFriends(this.id.substr(1));">'
				+ friend_name + '</aside>';
			html_str += '</li>';
			jMemreasEventFriend.append(html_str);
		    }
		    ajaxScrollbarElement(".memreasMorepageFriends");
		    updateAkordeonContent($(".memreas-friends"));
		} else
		    jerror('You have no friend on this event');
	    });
}
function morepage_clickFriends(friendElementId) {
    var jFriendElementImg = $("#" + friendElementId + ' img');
    var jFriendElementAside = $("#" + friendElementId).next('aside');
    if (jFriendElementImg.hasClass('setchoosed')) {
	jFriendElementImg.removeClass('setchoosed');
	jFriendElementAside.css('border', '3px solid #FFF');
    } else {
	jFriendElementImg.addClass('setchoosed');
	jFriendElementAside.css('border', '3px solid green');
    }
}

function more_clickMedia(mediaElementId) {
    var jMediaElement = $("#" + mediaElementId);
    if (jMediaElement.hasClass('setchoosed'))
	jMediaElement.removeClass('setchoosed');
    else
	jMediaElement.addClass('setchoosed');
}

more_showGoogleMap = function(div_id) {
    popup('more_dlg_locationmap');
    more_initGoogleMap(div_id);
}

// close the popup window with google map.
// save_address: variable indicating if the address is saved or not.
more_closeGoogleMap = function(save_address) {
    if (save_address == true) {
	var addr = $('#more_txt_locationmap_address').val();
	if (addr != "")
	    $('#morepage_eventLocation').val(addr);
	else
	    setDefaultValue('morepage_eventLocation');
    }

    disablePopup('more_dlg_locationmap');
}

// initialize the google map.
more_initGoogleMap = function(div_id) {
    if (location_map == null || typeof location_map == "undefined") {
	var lat = 44.88623409320778, lng = -87.86480712897173, latlng = new google.maps.LatLng(
		lat, lng), image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';

	// create the google map object.
	var mapOptions = {
	    center : new google.maps.LatLng(lat, lng),
	    zoom : 13,
	    mapTypeId : google.maps.MapTypeId.ROADMAP,
	    panControl : true,
	    panControlOptions : {
		position : google.maps.ControlPosition.TOP_RIGHT
	    },
	    zoomControl : true,
	    zoomControlOptions : {
		style : google.maps.ZoomControlStyle.LARGE,
		position : google.maps.ControlPosition.TOP_left
	    }
	}, location_map = new google.maps.Map(document.getElementById(div_id),
		mapOptions), marker = new google.maps.Marker({
	    position : latlng,
	    map : location_map,
	    icon : image
	});

	// set the search text field as auto-complete.
	var input = document.getElementById('more_txt_locationmap_address');
	var autocomplete = new google.maps.places.Autocomplete(input, {
	    types : [ "geocode" ]
	});

	autocomplete.bindTo('bounds', location_map);
	var infowindow = new google.maps.InfoWindow();

	google.maps.event.addListener(autocomplete, 'place_changed', function(
		event) {
	    infowindow.close();

	    var place = autocomplete.getPlace();
	    if (typeof place.geometry == "undefined")
		return;

	    if (place.geometry.viewport) {
		location_map.fitBounds(place.geometry.viewport);
	    } else {
		location_map.setCenter(place.geometry.location);
		location_map.setZoom(17);
	    }

	    moveMarker(place.name, place.geometry.location);
	});

	function moveMarker(placeName, latlng) {
	    marker.setIcon(image);
	    marker.setPosition(latlng);
	    infowindow.setContent(placeName);
	}
    }

    if (isElementEmpty('morepage_eventLocation')) {
	// get the current location.
	var err_msg = "Error while getting location. Device GPS/location may be disabled."
	var geoPositionOptions = $.extend({
	    enableHighAccuracy : true,
	    timeout : 10000,
	    maximumAge : 10000
	}, {
	    timeout : 10000
	});

	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
		var latlng = new google.maps.LatLng(position.coords.latitude,
			position.coords.longitude);
		if (geocoder == null)
		    geocoder = new google.maps.Geocoder();
		geocoder.geocode({
		    'latLng' : latlng
		}, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
			if (results[1]) {
			    $('#more_txt_locationmap_address').val(
				    results[1].formatted_address);
			}
		    } else {
		    }
		});
		if (location_map)
		    location_map
			    .setCenter(new google.maps.LatLng(
				    position.coords.latitude,
				    position.coords.longitude));
	    }, function(error) {
		jerror(err_msg);
	    }, geoPositionOptions);
	} else {
	    jerror(err_msg);
	}
    }
}

function morepage_removeMedias() {
    var jMorepageMediaElement = $(".memreasEventMedia li");
    var self_chooseMedia = [];
    var counter_media = 0;
    jMorepageMediaElement.each(function() {
	if ($(this).hasClass('setchoosed')) {
	    var media_id = $(this).attr('id').replace('moremedia-', '');
	    self_chooseMedia[counter_media++] = {
		tag : 'media_id',
		value : media_id
	    };
	}
    });

    if (self_chooseMedia.length == 0) {
	jerror('Please choose media to remove');
	return false;
    }

    var params = [ {
	tag : 'event_id',
	value : currentMorepageEventId
    }, {
	tag : 'media_ids',
	value : self_chooseMedia
    } ];

    ajaxRequest(
	    'removeeventmedia',
	    params,
	    function(response) {
		if (getValueFromXMLTag(response, 'status') == 'Success') {
		    jsuccess(getValueFromXMLTag(response, 'message'));
		    setTimeout(
			    function() {
				var jMemreasEventMedia = $(".memreasEventMedia");

				if (jMemreasEventMedia
					.hasClass("mCustomScrollbar"))
				    jMemreasEventMedia = $(".memreasEventMedia .mCSB_container");
				ajaxRequest(
					'listallmedia',
					[ {
					    tag : 'event_id',
					    value : currentMorepageEventId
					}, {
					    tag : 'user_id',
					    value : user_id
					}, {
					    tag : 'device_id',
					    value : ''
					}, {
					    tag : 'limit',
					    value : '100'
					}, {
					    tag : 'page',
					    value : '1'
					} ],
					function(response) {
					    jMemreasEventMedia.empty();
					    if (getValueFromXMLTag(response,
						    'status') == "Success") {
						var medias = getSubXMLFromTag(
							response, 'media');
						var media_count = medias.length;
						for (var i = 0; i < media_count; i++) {
						    var media = medias[i];
						    var media_type = getValueFromXMLTag(
							    media, 'type');
						    var media_id = getValueFromXMLTag(
							    media, 'media_id');
						    var _media_url = getMediaThumbnail(
							    media,
							    '/memreas/img/small/1.jpg');
						    if (media_type == 'video')
							jMemreasEventMedia
								.append('<li class="event_img video-media" id="moremedia-'
									+ media_id
									+ '" onclick="more_clickMedia(this.id);"><img src="'
									+ _media_url
									+ '"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></li>');
						    jMemreasEventMedia
							    .append('<li class="event_img" id="moremedia-'
								    + media_id
								    + '" onclick="more_clickMedia(this.id);"><img src="'
								    + _media_url
								    + '"/></li>');
						}
						ajaxScrollbarElement("#memreasEventMedia");
					    } else
						jerror('You have no media on this event');
					});
			    }, 2000);
		} else
		    jerror(getValueFromXMLTag(response, 'message'));
	    });
}

function morepage_removeFriends() {
    var jMorepageFriendsElement = $(".memreasMorepageFriends li");
    var self_chooseFriends = [];
    var counter_friend = 0;
    jMorepageFriendsElement.each(function() {
	var jFriendImage = $(this).find('img.morepage-friend-thumb');
	if (jFriendImage.hasClass('setchoosed')) {
	    var morepage_friendId = ($(this).find('figure').attr('id').replace(
		    'morefriend-', ''));
	    self_chooseFriends[counter_friend++] = {
		tag : 'friend_id',
		value : morepage_friendId
	    };
	}
    });

    if (self_chooseFriends.length == 0) {
	jerror('Please choose friend to remove');
	return false;
    }

    var params = [ {
	tag : 'event_id',
	value : currentMorepageEventId
    }, {
	tag : 'friend_ids',
	value : self_chooseFriends
    } ];
    ajaxRequest(
	    'removeeventfriend',
	    params,
	    function(response) {
		if (getValueFromXMLTag(response, 'status') == 'Success') {
		    jsuccess(getValueFromXMLTag(response, 'message'));
		    setTimeout(
			    function() {
				var jMemreasEventFriend = $(".memreasMorepageFriends");

				if (jMemreasEventFriend
					.hasClass("mCustomScrollbar"))
				    jMemreasEventFriend = $(".memreasMorepageFriends .mCSB_container");
				ajaxRequest(
					'geteventpeople',
					[ {
					    tag : 'event_id',
					    value : currentMorepageEventId
					} ],
					function(xml_response) {
					    jMemreasEventFriend.empty();
					    if (getValueFromXMLTag(
						    xml_response, 'status') == 'Success') {
						var friends = getSubXMLFromTag(
							xml_response, 'friend');
						var count_people = friends.length;
						for (var i = 0; i < count_people; i++) {
						    var friend = friends[i];
						    if (getValueFromXMLTag(
							    friend, 'photo') == ''
							    || getValueFromXMLTag(
								    friend,
								    'photo') == 'null')
							var friend_photo = '/memreas/img/profile-pic.jpg';
						    else
							var friend_photo = getValueFromXMLTag(
								friend, 'photo');
						    var friend_id = getValueFromXMLTag(
							    friend, 'friend_id');
						    var friend_name = getValueFromXMLTag(
							    friend,
							    'friend_name');
						    var html_str = '<li>';
						    html_str += '<figure class="pro-pics2" id="morefriend-'
							    + friend_id
							    + '" onclick="javascript:morepage_clickFriends(this.id);"><img class="morepage-friend-thumb" src="'
							    + friend_photo
							    + '" alt="" ></figure>';
						    html_str += '<aside class="pro-pic_names2" name="'
							    + friend_name
							    + '" id="a'
							    + friend_id
							    + '" onclick="javascript:morepage_clickFriends(this.id.substr(1));">'
							    + friend_name
							    + '</aside>';
						    html_str += '</li>';
						    jMemreasEventFriend
							    .append(html_str);
						}
						ajaxScrollbarElement(".memreasMorepageFriends");
					    } else
						jerror('You have no friend on this event');
					});
			    }, 2000);
		}
	    });
}

function AddGroup() {
    $(".group-select, .group-default-actions").hide();
    $(".input_group_name, .group-add-actions").show();
    group_mode = 'add_new';
}

function saveAddGroup() {
    var group_name = $(".input_group_name").val();
    if (group_name == '' || group_name == 'group name') {
	jerror('Please input group name');
	return false;
    }

    var network_friend_count = networkfriendsInfo.length;

    networkFriendsSelected = [];
    increase = 0;
    for (var i = 0; i < network_friend_count; i++) {
	if ($("#" + networkfriendsInfo[i].id).hasClass('nw-friend-selected'))
	    networkFriendsSelected[increase++] = {
		tag : 'friend',
		value : [ {
		    tag : 'friend_id',
		    value : networkfriendsInfo[i].id
		}, {
		    tag : 'friend_name',
		    value : networkfriendsInfo[i].name
		}, {
		    tag : 'network_name',
		    value : $("select[name=friend_network]").val()
		} ]
	    };

    }
    var friendSelected = networkFriendsSelected.length;
    if (friendSelected == 0) {
	jerror('Please select friend(s) to add.');
	return;
    }

    ajaxRequest('creategroup', [ {
	tag : 'group_name',
	value : group_name
    }, {
	tag : 'user_id',
	value : user_id
    }, {
	tag : 'friends',
	value : networkFriendsSelected
    } ], function(ret_xml) {
	// parse the returned xml.
	var status = getValueFromXMLTag(ret_xml, 'status');
	var message = getValueFromXMLTag(ret_xml, 'message');
	if (status.toLowerCase() == 'success') {
	    jsuccess('group was created successfully.');

	    // Empty friend list
	    if (friendList == null) {
		if ($('.network-friends').hasClass('mCustomScrollbar'))
		    friendList = $(".network-friends .mCSB_container");
		else
		    friendList = $('.network-friends');
	    }
	    friendList.empty();
	    activeAkordeon("manage-group-select");

	    cancelAddGroup();
	    getUserGroups();
	} else
	    jerror(message);
    });

}
function cancelAddGroup() {
    $(".input_group_name, .group-add-actions").hide();
    $(".group-select, .group-default-actions").show();
    group_mode = 'update';
}

$(function() {
    $('.dmca-tab')
	    .click(
		    function() {

			var userId = $("input[name=user_id]").val();
                        
			/**
			 * wrong - need to call dmca list web service...
			 */
                        
			ajaxRequest(
				'dcmalist',
				[ {
				    tag : 'user_id',
				    value : userId
				}
                            ],
				function(response) {
				    console.log("DCMA-->" + response);
				    var status = getValueFromXMLTag(response,
					    'status');
				    var medias = getSubXMLFromTag(response,
					    'media');

				    console.log('Media-->' + medias);
				    var medias_count = medias.length;
				    var report_v_row = '';
				    if (status == 'Success') {
					// var
					// media_count=getSubXMLFromTag(medias,'media');

					for (var i = 0; i < medias_count; i++) {
					    var media_detail = medias[i].innerHTML;

					    // console.log('media_detail
					    // '+i+'-->'+media_detail);
					    var media_id = $(media_detail)
						    .filter('media_id').html();
                                            var violation_id = $(media_detail)
						    .filter('violation_id').html();

					    // console.log('media_id-->'+media_id);
					    var dmca_violation_report_date = $(media_detail)
						    .filter('dmca_violation_report_date')
						    .html();
                                            
                                            var counter_status = $(media_detail)
						    .filter('status')
						    .html();
					  
					    var media_url = $(media_detail)
						    .filter('media_url')
						    .html();
					    media_url = removeCdataCorrectLink(media_url);
					    var row_class = '';
					    if (i % 2 == 0)
						row_class = 'oddrow';
					    else
						row_class = 'evenrow';
					    report_v_row += '<tr class="'
						    + row_class
						    + '">'
						    + '<td>'
						    + violation_id
						    + '</td>'
						    + '<td>'
						    + media_id
						    + '</td>'
						    +

						    ' <td><img src="'
						    + media_url
						    + '" width="80" /></td>'
						    + '<td> <a href="javascript:;" onclick="reportCounterclaim(this);" class="counter-claim-btn reportCounterclaim" id="'
						    + media_id
						    + '" rel="'+violation_id+'">report counter claim</a>'
						    + '</td>' + '<td>'
						    + dmca_violation_report_date + '</td>'
						    + '<td>'+counter_status+'</td>'
						    + '</tr>';

					}
					var media_count2 = getValueFromXMLTag(
						medias, 'media');
					$('.dmca-table-data > tbody').append(
						report_v_row);
					console.log('DMCMA COUNt -->'
						+ report_v_row);
					console.log('DMCMA COUNt2 -->'
						+ media_count2.length);

				    }
				}

			);
		    });

    // DMCA

    // $(document).on('click','.reportCounterclaim',function(){
    // var rel=$(this).attr(rel);
    // popup('dmca-form-box');
    // })
    //        
    // $('.info-dcma').click(function(){
    // popup('dmca-check-box');
    // });

});

/**
 * POST TO S3
 */
var dmcaUploadHandle = '';
var dmcaCounterClaimReport;
var dmcaFiletype = '';
var dmcaS3url = '';
var dmcaS3path = '';
var dmcaS3file = '';
var dmcaFilename = '';
var dmcaMediaId = '';
var dmcaMediaType = '';
function fetchS3PreSignedURLDMCACounterClaim() {

    $.ajax({
	url : "/index/fetchMemreasTVM",
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
	    alert("fetchS3PreSignedURLDMCACounterClaim calling tvm ...");
	    console.log("fetchMemreasTVM success function...");
	    /*-
	     * Now that we have our data, we update the form so it
	     * contains all the needed data to sign the request
	     */
	    form = $("#dmcaFileUploadForm");
	    //data.files[0];
	    uploadHandle = data;
	    dmcaMediaId = data.media_id;
	    console.log("fetchMemreasTVM success function dmcaMediaId--->"
		    + dmcaMediaId);
	    form.find('input[name=acl]').val(data.acl);
	    form.find('input[name=success_action_status]').val(
		    data.successStatus);
	    form.find('input[name=policy]').val(data.base64Policy);
	    form.find('input[name=x-amz-algorithm]').val(data.algorithm);
	    form.find('input[name=x-amz-credential]').val(data.credentials);
	    form.find('input[name=x-amz-date]').val(data.date);
	    form.find('input[name=x-amz-expires]').val(data.expires);
	    form.find('input[name=x-amz-signature]').val(data.signature);
	    form.find('input[name=file]').val($("#dmcaReportCounterClaimForm").find('input[name=file]').val());

	    //
	    // Set Key since user is registered
	    //
	    var _media_extension = filename.split(".");
	    _media_extension = _media_extension[_media_extension.length - 1];
	    media_type = media_type = 'application/pdf';
	    s3path = user_id + '/' + media_id + '/dmca/';
	    s3file = filename;
	    s3url = s3path + s3file;
	    form.find('input[name=Content-Type]').val(media_type);
	    form.find('input[name=key]').val(s3path + s3file);
	    console.log("media_type-->" + media_type);
	    console.log("s3path-->" + s3path);
	    console.log("s3file-->" + s3file);
	    console.log("key-->" + form.find('input[name=key]').val());
	    console.log("Calling uploadHandle.submit()");

	    
	    var jqXHR = uploadHandle.submit();
	},
	error : function(jqXHR, textStatus, errorThrown) {
	    console.log(jqXHR.responseText);
	    console.log(jqXHR.status);
	}
    });

}

function reportCounterclaim(elm) {
   //alert($(elm).attr('id'));
   $('#media_id').val($(elm).attr('id'));
   $('#violation_id').val($(elm).attr('rel'));
   $('#copyright_owner_email_address').val(userObject.email);
   popup('dmca-form-box');
    
   
}

function reportCounterClaimForm() {

    var copy_right_owner = $('#copyright_owner_name').val();
    var copyright_owner_address = $('#copyright_owner_address').val();
    var copyright_owner_email_address = $('#copyright_owner_email_address')
	    .val();
    var mediaId_report = $('#media_id').val();
    var counter_claim_phone_number = $('#counter_claim_phone_number').val();
    var terms_condition = $('#term_condition').val();

    if (copy_right_owner == '') {
	jerror("Please fill your name");
	return;
    }
    if (copyright_owner_address == '') {
	jerror("Please fill your Address");
	return;
    }

    if (counter_claim_phone_number == '') {
	jerror("Please fill your Phone No");
	return;
    }
    if (mediaId_report == '') {
	jerror("Please fill your Media Id");
	return;
    }

    if (terms_condition == '') {
	jerror("Please checkbox");
	return;
    }

    var params = [ {
	tag : "memreascookie",
	value : getCookie("memreas")
    }, {
	tag : "media_id",
	value : mediaId_report
    },  {
	tag : "copyright_owner_name",
	value : copy_right_owner
    }, {
	tag : "copyright_owner_address",
	value : copyright_owner_address
    }, {
	tag : "copyright_owner_email_address",
	value : copyright_owner_email_address
    }, {
	tag : "copyright_owner_agreed_to_terms",
	value : "1"
    }, {
	tag : "counter_claim_phone_number",
	value : counter_claim_phone_number
    }, ];

    ajaxRequest('dcmareportviolation', params, function(ret_xml) {

	var message = getValueFromXMLTag(ret_xml, 'message');
	var status = getValueFromXMLTag(ret_xml, 'status');

	console.log('message-->' + message + 'Status-->' + status);
	console.log(ret_xml);

	if (status == 'success') {
	    jsuccess("we've received your counter claim");
	    disablePopup('popupReportMedia');
	} else {
	    jerror("your counter claim failed to upload");
	    disablePopup('popupReportMedia');
	}
    }, 'undefined', true);

}