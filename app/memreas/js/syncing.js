/**
* Upload - Sync - Download function
*/
jQuery = $.noConfict();
jQuery.addfile = function(){
    var _source_action = "/index/s3upload";
    var _source_element = ".sync-content .upload";
    var _new_element = jQuery.randomElement();
    jQuery(_source_element).append ('<p class="row-choose-file" id="' + _new_element + '"></p>');
    jQuery("#" + _new_element).load(_source_action);
}

//Generate random id element
jQuery.randomElement = function(){
    var random_number = Math.floor((Math.random()*10000)+1);
    var _element = "row-file-" + random_number;
    if (jQuery("#" + _element).length > 0)
        _final_element = jQuery.randomElement();
    _final_element = _element;
    return _final_element;
}