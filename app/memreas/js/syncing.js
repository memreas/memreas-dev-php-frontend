/**
* Upload - Sync - Download function
*/
jQuery.addfile = function(){
    var _source_action = "/index/s3upload";
    var _source_element = ".sync-content .upload";
    var _new_element = jQuery.randomElement();
    jQuery(_source_element).append ('<div class="row-choose-file" id="' + _new_element + '"></div>');
    jQuery("#" + _new_element).append('<iframe src="' + _source_action + '" width="550" height="120"></iframe>');
    jQuery("#" + _new_element).append('<div class="addmore" style="position: absolute; right: 100px; top: 10px;"><a href="javascript:addfile();" class="btn-addmore-file"><img src="/memreas/img/cloudadd.png" width="30" border="none"/></a> <a href="javascript:removeRow(\'' + _new_element + '\');"><img src="/memreas/img/cloudremove.png" width="30" border="none"/></a></div>');
    return false;
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
function addfile(){
    //Add more file clicked
    jQuery.addfile();
}
function removeRow(element_id){
    jQuery("#" + element_id).remove();
}