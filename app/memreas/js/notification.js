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
                if (getValueFromXMLTag(ret_xml, 'status') == 'Success'){
                    var notifications = getSubXMLFromTag(ret_xml, 'notification');
                    if ($(".notificationresults").hasClass ("mCustomScrollbar"))
                        $(".notificationresults .mCSB_container").empty();
                    var notification_count = notifications.length;
                    for (i = 0;i < notification_count;i++){
                        var notification = $(notifications[i]).html();
                        if ($(".notificationresults").hasClass ("mCustomScrollbar"))
                            $(".notificationresults .mCSB_container").append('<li class="notification accept"><div class="notification_pro"><img src="/memreas/img/profile-pic.jpg"></div>' + $(notification).filter('meta').html() + '</li>');
                        else $(".notificationresults").append('<li class="notification accept"><div class="notification_pro"><img src="/memreas/img/profile-pic.jpg"></div>' + $(notification).filter('meta').html() + '</li>');
                    }
                }
                else jerror('There is no notification');
            }
        );
       if (!($(".notificationresults").hasClass("mCustomScrollbar")))
            $(".notificationresults").mCustomScrollbar({scrollButtons:{ enable:true }});
       $('#loadingpopup').hide();
       $(".tabcontent-detail").hide();
       $(".notification-area").show();
       $(".notificationresults").mCustomScrollbar("update");
       $(".notificationresults").mCustomScrollbar("scrollTo","first");
       if ($(".notificationresults").find ('.mcs_no_scrollbar').length > 0)
            $(".notificationresults").mCustomScrollbar("update");
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