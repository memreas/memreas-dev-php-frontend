/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

//var base_url = 'http://memreasdev.elasticbeanstalk.com/eventapp_zend2.1/webservices/index.php?';
//var wsurl = '/index/sampleAjax';
var wsurl = '/index.php/index/sampleAjax';
var xml_str = "";

//////////////////////////////////
// Input xml and fetch output xml
//////////////////////////////////
ajaxRequest = function (action, params, success_func, error_func, disableLoadingScreen) {
    var data = "";
    var result = "";
	var xml_input = getXMLStringFromParamArray(action, params);
    var data = new Object();
    data.ws_action = action;
    data.type = "jsonp";
    data.json = xml_input;
    data.callback = '';

    var json_data = JSON.stringify(data);
    if (!disableLoadingScreen)
        $('#loadingpopup').show();
	$.ajax( {
	  	type:'post',
	  	url: wsurl,
	  	dataType: 'jsonp',
	  	data: 'json=' + json_data,
	  	success: function(ret_xml) {
			if (typeof success_func != "undefined")
				success_func(ret_xml);
            if (!disableLoadingScreen)
                $('#loadingpopup').hide();
	  	},
	  	error: function (jqXHR, textStatus, errorThrown) {
       		alert(jqXHR.responseText);
       		alert(jqXHR.status);
			if (typeof error_func != "undefined")
				error_func();
            if (!disableLoadingScreen)
                $('#loadingpopup').hide();
	  	}
	});
	return false;
}

getXMLStringFromParamArray = function(action, params) {
	var i = 0;
	var action_tag = "";
	xml_str = "<xml>";
	switch (action) {
        case "login":               action_tag = "login"; break;
        case "checkusername":       action_tag = "checkusername"; break;
        case "addevent":            action_tag = "addevent"; break;
        case "addcomments":         action_tag = "addcomment"; break;
        case "creategroup":         action_tag = "creategroup"; break;
        case "addmediaevent":       action_tag = "addmediaevent"; break;
        case "deletephoto":         action_tag = "deletephoto"; break;
        case "listallmedia":        action_tag = "listallmedia"; break;
        case "listnotification":    action_tag = "listnotification"; break;
        case "viewallfriends":      action_tag = "viewallfriends"; break;
        case "addfriendtoevent":    action_tag = "addfriendtoevent"; break;
        case "viewevents":          action_tag = "viewevent"; break;
        case "likemedia":           action_tag = "likemedia"; break;
        case "listcomments":        action_tag = "listcomments"; break;
        case "forgotpassword":      action_tag = "forgotpassword"; break;
        case "registration":        action_tag = "registration"; break;
        case "logout":              action_tag = "logout"; break;
        case "geteventcount":       action_tag = "geteventcount"; break;
        case "getuserdetails":      action_tag = "getuserdetails"; break;
        case "saveuserdetails":     action_tag = "saveuserdetails"; break;
        case "getusergroups":       action_tag = "getusergroups"; break;
        case "getgroupfriends":     action_tag = "getgroupfriends"; break;
        case "addfriendtogroup":    action_tag = "addfriendtogroup"; break;
        case "removefriendgroup":   action_tag = "removefriendgroup"; break;
        case "geteventpeople":      action_tag = "geteventpeople"; break;
        case "addexistmediatoevent":action_tag = "addexistmediatoevent"; break;
        case "getmedialike":        action_tag = "getmedialike"; break;
        case "findtag":             action_tag = "findtag"; break;
        case "listmemreasfriends":  action_tag = "listmemreasfriends"; break;

        case "checkexistmedia":     action_tag = "checkexistmedia"; break;
		default: break;
	}
	xml_str += "<" + action_tag + ">";
	getSubXMLStringFromParamArray(params);
	xml_str += "</" + action_tag + ">";
	xml_str += "</xml>";
	return xml_str;
}

getSubXMLStringFromParamArray = function(params) {
	if (typeof params.length == "undefined")
		return;
	for (var i = 0; i < params.length; i++) {
		xml_str += "<" + params[i]['tag'] + ">";
		var val = params[i]['value'];
		if (typeof val != "string" && typeof val != "undefined")
            getSubXMLStringFromParamArray(val);
		else xml_str += val;
		xml_str += "</" + params[i]['tag'] + ">";
	}
}

$(function(){
    $("#main-tab ul a").click(function(){
        $(".notification-area").hide();
        $("#search-result").hide();
        $("#main-tab ul a").removeClass ("active");
        $(this).addClass ("active");
        var _active_tab = $(this).attr ("title");
        $(".tabcontent-detail").hide();
        $("#" + _active_tab).fadeIn();
        if (!($("#tab-content-" + _active_tab).find (".scroll-area:first").hasClass('mCustomScrollbar')))
            $("#tab-content-" + _active_tab).find (".scroll-area:first").mCustomScrollbar({ scrollButtons:{ enable:true }});
        $("#tab-content-" + _active_tab).find (".scroll-area:first").mCustomScrollbar("update");
    });
    $(".clear-upload").click (function(){
        $("ul.image_upload_box").html("");
        $("ul.image_upload_box").html('<li class="first-upload"></li>');
    });
});

/*
* Event function
*/
function showUploadEvent(){
    $("#share_medialist, .comment, .add-comment-buttons").hide();
    $(".event-upload-area, .upload-event-buttons").fadeIn(500);
}
function hideUploadEvent(){
    $(".event-upload-area, .upload-event-buttons").hide();
    $('#tabs-share li:nth-child(2) a').click();
    $("#share_medialist, .comment, .add-comment-buttons").fadeIn(500);
}

function backToMedia(){
    $('#tabs-share li:nth-child(2) a').click();
}