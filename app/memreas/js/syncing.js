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
function addfile(){ jQuery.addfile(); }
function removeRow(element_id){ jQuery("#" + element_id).remove(); }
function success_addmedia(response){
    response = $.xml2json(response, true);
    response = response.addmediaeventresponse[0].status[0].text;
    if (response == "Success")
        {
            jSuccess(
            'Media successfully added!',
            {
              autoHide : true, // added in v2.0
              clickOverlay : false, // added in v2.0
              MinWidth : 250,
              TimeShown : 3000,
              ShowTimeEffect : 200,
              HideTimeEffect : 200,
              LongTrip :20,
              HorizontalPosition : 'center',
              VerticalPosition : 'top',
              ShowOverlay : true,
                 ColorOverlay : '#FFF',
              OpacityOverlay : 0.3,
              onClosed : function(){ // added in v2.0

              },
              onCompleted : function(){ // added in v2.0

              }
            });
            $.fetch_server_media($("input[name=user_id]").val());
        }
    else alert ("error while adding media");
}
function error_addmedia(){}

/*function for sync tab image */
function imageChoosed(media_id){
    if (jQuery("a#" + media_id).parent('li').hasClass ('setchoosed')){
        jQuery("a#" + media_id).parent('li').removeClass ('setchoosed');
        jQuery("a#" + media_id).parent('li').find("img.selected-gallery").remove();
    }
    else {
        jQuery("a#" + media_id).parent('li').addClass ('setchoosed');
        jQuery("a#" + media_id).parent('li').append ('<img class="selected-gallery" src="/memreas/img/gallery-select.png">');
    }
    return false;
}

function deleteFiles(){
    var confirm_box = confirm ("Are you sure want to delete them?");
    if (confirm_box){
        $("#loadingpopup").show();
        $(".edit-area a").each(function(){
           if ($(this).parent('li').hasClass("setchoosed")){
               var media_id = $(this).attr ("id");
               var xml_data = new Array();
               xml_data[0] = new Array();
               xml_data[0]['tag'] = 'mediaid';
               xml_data[0]['value'] = media_id.trim();
               ajaxRequest ('deletephoto', xml_data, success_deletephoto, error_deletephoto);
           }
        });
        $("#loadingpopup").hide();
    }
}
function success_deletephoto(ret_xml){
    jSuccess(
    'Media deleted',
    {
      autoHide : true, // added in v2.0
      clickOverlay : false, // added in v2.0
      MinWidth : 250,
      TimeShown : 3000,
      ShowTimeEffect : 200,
      HideTimeEffect : 200,
      LongTrip :20,
      HorizontalPosition : 'center',
      VerticalPosition : 'top',
      ShowOverlay : true,
      ColorOverlay : '#FFF',
      OpacityOverlay : 0.3,
      onClosed : function(){ // added in v2.0

      },
      onCompleted : function(){ // added in v2.0

      }
    });
    $.fetch_server_media($("input[name=user_id]").val());
}
function error_deletephoto(){ alert ("error delete photo"); }