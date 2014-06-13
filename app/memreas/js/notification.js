/* Notification */
$(function(){
    $("a.notification_icon").click(function(){
        var user_id = $("input[name=user_id]").val();
        $("#search-result").hide();
        $(".notification-area").show();
        ajaxScrollbarElement(".notificationresults");
        if ($(".notificationresults").hasClass ("mCustomScrollbar"))
            $(".notificationresults .mCSB_container").empty();
        else $(".notificationresults").empty();
        //Send request to server
        $("#loadingpopup").show();
        ajaxRequest(
            'listnotification',
            [
                { tag: 'user_id', value: user_id },
            ],
            function(ret_xml) {
                if (getValueFromXMLTag(ret_xml, 'status') == 'success'){
                    var notifications = getSubXMLFromTag(ret_xml, 'notification');
                    var notification_count = notifications.length;
                    for (i = 0;i < notification_count;i++){
                        var notification = notifications[i].innerHTML;
                        var notification_id = getValueFromXMLTag(notifications[i], 'notification_id');
                        var notification_type = getValueFromXMLTag(notifications[i], 'notification_type');
                        var meta_text = $(notifications[i]).wrap('meta')
                                        .html().split('<meta>')[1]
                                        .split('<notification_type>')[0];
                        meta_text = '<span>' + meta_text + '</span>';
                        var user_profile_pic = getValueFromXMLTag(notifications[i], 'profile_pic')
                                                .replace("<!--[CDATA[", "")
                                                .replace("]]-->", "");
                        var notification_status = getValueFromXMLTag(notifications[i], 'notification_status');
                        if (user_profile_pic == '') user_profile_pic = '/memreas/img/profile-pic.jpg';
                        if (notification_status == '0')
                            var link_action = '<a class="black_btn_skin" href="javascript:;" onclick="updateNotification(\'' + notification_id + '\', \'accept\');">Ok</a> <a class="black_btn_skin" href="javascript:;" onclick="updateNotification(\'' + notification_id + '\', \'ignore\');">Ignore</a>'
                        else var link_action = '';
                        if ($(".notificationresults").hasClass ("mCustomScrollbar"))
                            $(".notificationresults .mCSB_container").append('<li class="notification ' + notification_status_to_class(notification_status) + '"><div class="notification_pro"><img src="' + user_profile_pic + '"></div>' + meta_text + ' ' + link_action + '</li>');
                        else $(".notificationresults").append('<li class="notification accept"><div class="notification_pro"><img src="' + user_profile_pic + '"></div>' + meta_text + ' ' + link_action + '</li>');
                    }
                    $("#loadingpopup").hide();
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
        case '0': class_return = 'add'; break;
        case '1': class_return = 'accept'; break;
        case '2': class_return = 'decline'; break;
        default:
            class_return = '';
    }
    return class_return;
}

function updateNotification(notification_id, update_status){
    switch (update_status){
        case 'accept':
            var params = [
                            {tag: 'notification', value:
                                [
                                    {tag: 'notification_id', value: notification_id},
                                    {tag: 'status', value: '1'}
                                ]
                            }
                        ];
            ajaxRequest('updatenotification', params, function(response){
                if (getValueFromXMLTag(response, 'status') == 'success'){
                    jsuccess(getValueFromXMLTag(response, 'message'));
                    setTimeout(function(){
                        //Reload notification
                        $("a.notification_icon").click();
                    }, 1000);
                }
                else jerror(getValueFromXMLTag(response, 'message'));
            });
            break;
        case 'ignore':
             var params = [
                            {tag: 'notification', value:
                                [
                                    {tag: 'notification_id', value: notification_id},
                                    {tag: 'status', value: '2'}
                                ]
                            }
                        ];
            ajaxRequest('updatenotification', params, function(response){
                if (getValueFromXMLTag(response, 'status') == 'success'){
                    jsuccess(getValueFromXMLTag(response, 'message'));
                    setTimeout(function(){
                        //Reload notification
                        $("a.notification_icon").click();
                    }, 1000);
                }
                else jerror(getValueFromXMLTag(response, 'message'));
            });
            break;
        default: jerror('No action performed');
    }
}