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