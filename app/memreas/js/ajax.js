/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

//var base_url = 'http://memreasdev.elasticbeanstalk.com/eventapp_zend2.1/webservices/index.php?';
var wsurl = 'http://memreas-dev-php-frontend.localhost/index/sampleAjax';

//////////////////////////////////
// Input xml and fetch output xml
//////////////////////////////////
ajaxRequest = function (action, params, success_func, error_func) {
    var data = "";
    var result = "";
	var xml_input = getXMLStringFromParamArray(action, params);
    
    var data = new Object();
    data.ws_action = action;
    data.type = "jsonp";
    data.json = xml_input;
    
    var json_data = JSON.stringify(data);
   	
   	$('#loadingpopup').show();
	$.ajax( {
	  	type:'post', 
	  	url: wsurl,
	  	dataType: 'jsonp',
	  	data: 'json=' + json_data,
	  	success: function(ret_xml) {
			if (typeof success_func != "undefined")
				success_func(ret_xml);
		   	$('#loadingpopup').hide();
	  	},
	  	error: function (jqXHR, textStatus, errorThrown) {
       		alert(jqXHR.responseText);
       		alert(jqXHR.status);
			if (typeof error_func != "undefined")
				error_func();
		   	$('#loadingpopup').hide();
	  	}
	});
	
	return false;
}

getXMLStringFromParamArray = function(action, params) {
	var idx = 0;
	var xml_str = "<xml>";

	switch (action) {
		case "checkusername":
			xml_str += "<checkusername>";
			
				xml_str += "<username>" + params[idx++] + "</username>";
			
			xml_str += "</checkusername>";
			break;
			
		case "addevent":
			xml_str += "<addevent>";
			
				xml_str += "<user_id>" + params[idx++] + "</user_id>";
				xml_str += "<event_name>" + params[idx++] + "</event_name>";
				xml_str += "<event_date>" + params[idx++] + "</event_date>";
				xml_str += "<event_location>" + params[idx++] + "</event_location>";
				xml_str += "<event_from>" + params[idx++] + "</event_from>";
				xml_str += "<event_to>" + params[idx++] + "</event_to>";
				xml_str += "<is_friend_can_add_friend>" + params[idx++] + "</is_friend_can_add_friend>";
				xml_str += "<is_friend_can_post_media>" + params[idx++] + "</is_friend_can_post_media>";
				xml_str += "<event_self_destruct>" + params[idx++] + "</event_self_destruct>";
				xml_str += "<is_public>" + params[idx++] + "</is_public>";
			
			xml_str += "</addevent>";
			break;
	}
	
	xml_str += "</xml>";
	//console.log(xml_str);
	
	return xml_str
}


