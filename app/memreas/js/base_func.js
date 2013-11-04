/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

formatDateToDMY = function(date) {
	return date.substr(3, 2) + "/" + date.substr(0, 2) + date.substr(5);
}

getValueFromXMLTag = function(xml, tag) {
	return $(xml).find(tag).text();
}