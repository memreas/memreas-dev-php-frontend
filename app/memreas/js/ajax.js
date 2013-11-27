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
            alert (ret_xml);
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
	var i = 0;
	var action_tag = "";
	var xml_str = "<xml>";

	switch (action) {
		case "checkusername":
			action_tag = "checkusername";
			break;
			
		case "addevent":
			action_tag = "addevent";
			break;
			
		case "addcomments":
			action_tag = "addcomment";
			break;
        /* Action coded by Tran Tuan - For develop only DELETE THIS COMMENT WHEN GO LIVE */                
        case "addmediaevent":
            action_tag = "addmediaevent";
            break;
		case "deletephoto":	
            action_tag = "deletephoto";
            break;
		default:
			break;
	}
	
	xml_str += "<" + action_tag + ">";
	
	for (i = 0; i < params.length; i++) {
		xml_str += "<" + params[i]['tag'] + ">";
		xml_str += params[i]['value'];
		xml_str += "</" + params[i]['tag'] + ">";
	}
	
	xml_str += "</" + action_tag + ">";
	
	xml_str += "</xml>";
	//console.log(xml_str);
	
	return xml_str;
}


