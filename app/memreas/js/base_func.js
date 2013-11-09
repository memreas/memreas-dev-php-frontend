/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

// convert date string from MMDDYYY to DDMMYYYY.
formatDateToDMY = function(date) {
	if (date == "")
		return "";
		
	return date.substr(3, 2) + "/" + date.substr(0, 2) + date.substr(5);
}

// return the text value within the specified xml tag.
getValueFromXMLTag = function(xml, tag) {
	return $(xml).find(tag).text();
}

// clear the value of the text fields.
clearTextField = function(elements) {
	var i = 0, id = "";

	if (typeof elements == "string") {
		id = '#' + elements;
		$(id).val($(id)[0].defaultValue);
	}
	else if (typeof elements.length != "undefined") {
		for (i = 0; i < elements.length; i++) {
			id = '#' + elements[i];
			$(id).val($(id)[0].defaultValue);
		}
	}
}

// clear the value of the check box.
clearCheckBox = function(elements) {
	var i = 0, id = "";

	if (typeof elements == "string") {
		id = '#' + elements;
		$(id)[0].checked = true;
	}
	else if (typeof elements.length != "undefined") {
		for (i = 0; i < elements.length; i++) {
			id = '#' + elements[i];
			$(id)[0].checked = true;
		}
	}
}

// check if the html5 element is empty.
isElementEmpty = function(id) {
	var element = $('#' + id);
	if (typeof element == "undefined" || typeof element.length == "undefined")
		return true;

	var value = element.val();
	if (value == "" || value == element[0].defaultValue)
		return true;
		
	return false;
}

// return the value of html5 element such as text field or date-time picker.
getElementValue = function(id) {
	var element = $('#' + id);
	if (typeof element == "undefined" || typeof element.length == "undefined")
		return "";

	var value = element.val();
	if (value == element[0].defaultValue)
		value = "";

	return value;	
}

// return the checkbox value.
getCheckBoxValue = function(id) {
	return ($('#' + id)[0].checked ? 0 : 1)
}

// set the value of checkbox.
setCheckBoxValue = function(id, value) {
	$('#' + id)[0].checked = !value;
}

setDefaultValue = function(id) {
	var element = $('#' + id);
	if (typeof element == "undefined" || typeof element.length == "undefined")
		return "";

	element.val(element[0].defaultValue);
}