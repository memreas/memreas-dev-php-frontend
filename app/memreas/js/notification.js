
/* Notification */
$(function(){
    $("a.notification_icon").click(function(){
        var user_id = $("input[name=user_id]").val();
        ajaxScrollbarElement(".notificationresults");
        //Send request to server
        ajaxRequest(
            'listnotification',
            [
                { tag: 'user_id', value: user_id },
            ],
            function(ret_xml) {
                // parse the returned xml.
                var json_parse =  $.xml2json(ret_xml, true);
                var notifications = json_parse.listnotificationresponse[0].notifications[0].notification;
                if ($(".notificationresults").hasClass ("mCustomScrollbar"))
                    $(".notificationresults .mCSB_container").empty();
                for (json_key in notifications){
                    if ($(".notificationresults").hasClass ("mCustomScrollbar")){
                        $(".notificationresults .mCSB_container").append('<li class="notification accept"><div class="notification_pro"><img src="/memreas/img/profile-pic.jpg"></div>' + notifications[json_key].meta[0].text + '</li>');
                    }
                    else {
                        $(".notificationresults").append('<li class="notification accept"><div class="notification_pro"><img src="/memreas/img/profile-pic.jpg"></div>' + notifications[json_key].meta[0].text + '</li>');
                    }
                }
            }
        );
       if (!($(".notificationresults").hasClass("mCustomScrollbar"))){
           $(".notificationresults").mCustomScrollbar({scrollButtons:{enable:true }});
       }
       $('#loadingpopup').hide();
       $(".tabcontent-detail").hide();
       $(".notification-area").show();
       $(".notificationresults").mCustomScrollbar("update");
       $(".notificationresults").mCustomScrollbar("scrollTo","first");
       if ($(".notificationresults").find ('.mcs_no_scrollbar').length > 0)
            $(".notificationresults").mCustomScrollbar("update");
      // if (!($(".notificationresults").find ('.mCSB_scrollTools').is (":visible"))) $("a.notification_icon").click();
    });
});

function notification_status_to_class(status_code){
    switch (status_code){
        case 0: return 'request';
        case 1: return 'accepted';
        case 2: return 'ignored';
        default: return '';
    }
}