/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
var mLocale = '_en';
var strings = {};
strings.dmca_missing_name_en = "Please enter your name"; 
strings.dmca_missing_address_en = "Please enter your address"; 
strings.dmca_missing_email_en = "Please enter your email address"; 
strings.dmca_missing_media_id_en = "Please enter the media id"; 
strings.dmca_missing_terms_en = "Please review and check terms to submit"; 
strings.dmca_success_en = "We've received your report and started processing"; 
strings.dmca_failure_en = "We were unable to process your report.  Please try again later."; 

function getString(string) {
    var stringMlocale = strings[string + mLocale];
    if (stringMlocale != null) {
	return stringMlocale;
    } else {
	return '***';
    }
    
}