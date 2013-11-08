/*
* Server side
*/
/*Preload for server media*/
jQuery.fetch_server_media = function (user_id){
    $(".user-resources").remove();
    $("#tab-content #tab1").append ('<div class="user-resources" data-click="false" data-swipe="true" data-ratio="800/325" data-max-width="100%"  data-allow-full-screen="true"  data-nav="thumbs"></div>');
    $(".user-resources, .scrollClass .mCSB_container").html('');
    $(".preload-server").show();
    var _request_url = 'http://memreas-dev-php-frontend.localhost/index/ApiServerSide';
    var _request_content = '<xml>' +
                                '<listallmedia>' +
                                    '<event_id></event_id>' +
                                    '<user_id>' + user_id + '</user_id>' +
                                    '<device_id></device_id>' +
                                    '<limit>200</limit>' +
                                    '<page>1</page>' +
                                    '</listallmedia>' +
                                    '</xml>';
    var _action = 'listallmedia';
    var data = new Object();
    data.ws_action = _action;
    data.type = "jsonp";
    data.json = _request_content;
    var json_data = JSON.stringify(data);

    $.ajax( {
      type:'post',
      url: _request_url,
      dataType: 'jsonp',
      data: 'json=' + json_data,
      success: function(json){
          json = $.xml2json(json, true);
          if (json.listallmediaresponse[0].medias[0].status[0].text == "Success") {
              var data = json.listallmediaresponse[0].medias[0].media;
              //console.log(data);  return;
              var _html = '';
              for (var json_key in data){
                _html += '<img src="' + data[json_key].main_media_url[0].text + '"/>';
                $(".scrollClass .mCSB_container").append ('<li><a class="class="swipebox" href="' + data[json_key].main_media_url[0].text + '">' + _html + '</a></li>');
              }
              $(".user-resources").html (_html);
              setTimeout(function(){ $(".user-resources").fotorama(); $(".preload-server").hide(); }, 1000);
          }
          return true;
      },
      error: function (jqXHR, textStatus, errorThrown) {
           alert(jqXHR.responseText);
           alert(jqXHR.status);
        //alert(textStatus);
           //alert(errorThrown);
      }
    });
    return false;
}