networkfriendsInfo = [];
$(function(){
    $("#tab-content-more div.hideCls").hide(); // Initially hide all content
        $("#tabs-more li:first").attr("id","current"); // Activate first tab
        $("#tab-content-more div:first").fadeIn(); // Show first tab content*/

        $('#tabs-more a').click(function(e) {

            e.preventDefault();
            $("#tab-content-more div.hideCls").hide(); //Hide all content
            $("#tabs-more li").attr("id",""); //Reset id's
            $(this).parent().attr("id","current"); // Activate this
            $('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
        });

    $("a[title=more]").one ('click', function(){
         $('#buttons-moretab').akordeon();
         $('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
    });

    //Group tab
    $("#tabs-more li a:eq(1)").one ('click', function(){
        getUserGroups();
        $('#buttons2-moretab').akordeon();
    });

    $("#tabs-more li a:eq(2)").one ('click', function(){
        $('#buttons3-moretab').akordeon();
    });

    $("#tabs-more li a:eq(3)").one ('click', function(){ $('#buttons4-moretab').akordeon(); });
    $("#tabs-more li a:eq(4)").one ('click', function(){ $('#buttons5-moretab').akordeon(); });

    /*Action tabs click*/
    //$("a[title=more]").click(function(){ fillUserDetail( $("input[name=user_id]").val()); });
    $("a[title=tab1-more]").click(function(){ $("a[title=more]").click(); });

    /* Change profile picture*/
    var form = $("#frm-profile-pic");

    $(".change-profile-btn").click(function(){ form.find('input[type=file]').click(); });

    $("#frm-profile-pic").fileupload({
        url: form.attr('action'),
        dataType: 'xml',
        crossDomain: true,
        multiple: true,
        type: 'POST',
        autoUpload: true,
        add: function (event, data) {

            //Get signed credentials
            $.ajax({
              url: "/index/s3signed",
              type: 'GET',
              dataType: 'json',
              data: {title: data.files[0].name}, // send the file name to the server so it can generate the key param
              async: false,
              success: function(data) {
                // Now that we have our data, we update the form so it contains all
                // the needed data to sign the request
                form.find('input[name=AWSAccessKeyId]').val(data.accessKey);
                form.find('input[name=policy]').val(data.policy)
                form.find('input[name=signature]').val(data.signature)
              }
            })

            var filetype = data.files[0].type;
            var filename = data.files[0].name;
            var key_value = '${filename}';

            //Check if valid type is image or video are allowed
            if  (!(filetype.indexOf('image') >= 0)){
                jerror('Only image type is allowed.');
                $("input[name=profile_image]").val(0);
                return false;
            }
            $("input[name=profile_image]").val(1);
            if (filetype.indexOf ('image') >= 0)
                var target = 'image';
            else target = 'media';
            key_value = user_id + '/' + target + '/' + key_value;
            $(this).find('input[name=key]').val(key_value);
            // Use XHR, fallback to iframe
            options = $(this).fileupload('option');
            use_xhr = !options.forceIframeTransport &&
                        ((!options.multipart && $.support.xhrFileUpload) ||
                        $.support.xhrFormDataFileUpload);

            if (!use_xhr) {
                using_iframe_transport = true;
            }

            // Message on unLoad.
            window.onbeforeunload = function() {
                return 'You have unsaved changes.';
            };
            $("#loadingpopup").show();
            var jqXHR = data.submit();
        },
        send: function(e, data) {

        },
        progress: function(e, data){

        },
        fail: function(e, data) {
            window.onbeforeunload = null;
        },
        success: function(data, status, jqXHR) {
            _media_url = getValueFromXMLTag(jqXHR.responseText, 'Location');
            var _media_extension = _media_url.split(".");
            _media_extension = _media_extension[_media_extension.length - 1];
            if (_media_url.indexOf('image') >= 0)
                media_type = 'image/' + _media_extension;
            else media_type = 'video/' + _media_extension;
            //var filename = _media_url.split("/");
            var s3_filename = getValueFromXMLTag(jqXHR.responseText, 'Key');
            var s3_filename_split = s3_filename.split("/");
            var filename = s3_filename_split[s3_filename_split.length - 1];
            var s3_path_split = s3_filename.split(filename);
            var s3_path = s3_path_split[0];
            var params = [
                            {tag: 's3url', value: filename},
                            {tag: 'is_server_image', value: '0'},
                            {tag: 'content_type', value : media_type},
                            {tag: 's3path', value: s3_path},
                            {tag: 's3file_name', value: filename},
                            {tag: 'device_id', value: ''},
                            {tag: 'event_id', value: ''},
                            {tag: 'media_id', value: ''},
                            {tag: 'user_id', value: user_id},
                            {tag: 'is_profile_pic', value: '1'},
                            {tag: 'location', value: ''}
                            ];
            ajaxRequest('addmediaevent', params, function(){
                jsuccess('Your profile picture updated');
                $("#setting-userprofile img, img#profile_picture").attr ('src', _media_url);
            });
        },
        done: function (event, data) {

        },
    });
});

/*Fill in current logged user detail*/
function fillUserDetail(currentUserId){
    var params = [{tag: 'user_id', value: currentUserId}];
    ajaxRequest('getuserdetails', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
            var username = getValueFromXMLTag(xml_response, 'username');
            var useremail = getValueFromXMLTag(xml_response, 'email');
            var userprofile = getValueFromXMLTag(xml_response, 'profile');
            $("#setting-username").html(username);
            if (userprofile != '')
                $("#setting-userprofile img").attr('src', userprofile);
            $("input[name=account_email]").val(useremail);
        }
        else jerror (getValueFromXMLTag(xml_response, 'messsage'));
    });
}

/*Function Save user detail*/
function saveUserDetail(){
    var userId = $("input[name=user_id]").val();
    var params = [
                    {tag: 'user_id', value: userId},
                    {tag: 'email', value: $("input[name=account_email]").val()}
                ];
    ajaxRequest('saveuserdetails', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == "Success"){
            jsuccess(getValueFromXMLTag(xml_response, 'message'));
            fillUserDetail($("input[name=user_id]").val());
        }
        else jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}

/*
* Group Tab
* Action on second more tab - account group tab
*/
function getUserGroups(){
    var loggedUserId = $("input[name=user_id]").val();
    var params = [{tag: 'user_id', value: loggedUserId}];
    ajaxRequest('getusergroups', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
            var groups = getSubXMLFromTag(xml_response, 'group');
            var total_record = groups.length;
            for (i = 0;i < total_record;i++){
                $("select.account-groups").append('<option value="' + getValueFromXMLTag(groups[i], 'group_id') + '">' + getValueFromXMLTag(groups[i], 'group_name') + '</option>');
            }
        }
        else jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}

$(function(){
    //Network heading click
    $(".network-heading").click(function(){
        //Check if now friend list is empty
        if ($('.network-friends').html() == '' || $(".network-friends .mCSB_container").html() == '')
            $("select[name=friend_network]").trigger('change');
    });

    //Friend network selection changed
    $("select[name=friend_network]").change(function(){
        var network_selected = $(this).val();
        networkFriendsChanged(network_selected);
    });
});

function networkFriendsChanged(friend_network){
    //Reset friend element
    friendList = null;
    switch (friend_network){
        case 'memreas': getGroupFriends('memreas'); break;
        case 'facebook': getGroupFriends('facebook'); break;
        case 'twitter': getGroupFriends('twitter'); break;
    }
}
//Get friend based on group list
function getGroupFriends(friend_network){
    var group_id = $("select[name=account_groups]").val();
    if (group_id == ''){
        jerror('Please select your group name first.');
        return false;
    }
    var params = [
                    {tag: 'group_id', value: $("select[name=account_groups]").val()},
                    {tag: 'network', value: friend_network}
                ];
    ajaxRequest('getgroupfriends', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
            var friend_list = getSubXMLFromTag(xml_response, 'friend');
            var count_friend = friend_list.length;
            networkfriendsInfo = [];
            for (i = 0;i < count_friend;i++){
                if (getValueFromXMLTag(friend_list[i], 'friend_photo') == '' || getValueFromXMLTag(friend_list[i], 'friend_photo') == 'null')
                    friend_photo = '/memreas/img/profile-pic.jpg';
                else friend_photo = getValueFromXMLTag(friend_list[i], 'friend_photo');
                networkfriendsInfo[i] = {
                        'id':         getValueFromXMLTag(friend_list[i], 'friend_id'),
                        'div_id':    getValueFromXMLTag(friend_list[i], 'friend_id'),
                        'name':     getValueFromXMLTag(friend_list[i], 'friend_name'),
                        'photo':     friend_photo,
                        'selected':    false
                    };
            }
            network_fillFriends(networkfriendsInfo);
        }
        else {
            jerror(getValueFromXMLTag(xml_response, 'message'));
            $('.network-friends').empty();
        }
    });
}

//Popup friend network changed
$(function(){
    $("select#network-dropfriend").change(function(){
        var network_dropdown_selected = $(this).val();
        friendList = null;
        switch (network_dropdown_selected){
            case 'facebook': networkPopupFacebookFriends(); break;
            case 'twitter': networkPopupTwitterFriends(); break;
            case 'memreas': networkPopupMemreasFriends(); break;
            default: jerror('Please choose friend network');
        }
        if (!$("#popupNetworkFriends").is (":visible")) popup('popupNetworkFriends');
        ajaxScrollbarElement(".popupNetworkFriends_list");
    });
});

function networkPopupMemreasFriends(){
    var params = [{tag: 'user_id', value: ''}];
    ajaxRequest('listmemreasfriends', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status')){
            var friends = getSubXMLFromTag(xml_response, 'friend');
            var friendCount = friends.length;
            mr_friendsInfo = [];
            for (i = 0;i < friendCount;i++){
                var friend = friends[i];
                if (getValueFromXMLTag(friend, 'photo') == '' || getValueFromXMLTag(friend, 'photo') == 'null')
                    friend_photo = '/memreas/img/profile-pic.jpg';
                else friend_photo = getValueFromXMLTag(friend, 'photo');
                mr_friendsInfo[i] = {
                                        'id': getValueFromXMLTag(friend, 'friend_id'),
                                        'div_id': 'mr_' + i,
                                        'name': getValueFromXMLTag(friend, 'friend_name'),
                                        'photo': friend_photo,
                                        'selected': false,
                                    };
            }
            network_fillPopupFriends(mr_friendsInfo);
        }
    });
}

function networkPopupFacebookFriends(){
    $('#loadingpopup').show();
    FB.init({ appId: FACEBOOK_APPID,
        status: true,
        cookie: true,
        xfbml: true,
        oauth: true
    });
    function getFacebookInfo(response) {
        var button = document.getElementById('fb-auth');
        if (response.authResponse) { // in case if we are logged in
            var userInfo = document.getElementById('user-info');
            FB.api('/me', function(response) {
                fb_accountInfo = {
                    'id':         response.id,
                    'name':     response.name,
                    'photo':     'https://graph.facebook.com/' + response.id + '/picture'
                };
            });

            // get friends
            FB.api('/me/friends?limit=' + FACEBOOK_FRIENDSLIMIT, function(response) {
                var i = 0, info = response.data.sort(sortMethod);
                fb_friendsInfo = [];
                for (i = 0; i < info.length; i++) {
                    fb_friendsInfo[i] = {
                        'id':         info[i].id,
                        'div_id':    'fbmemreas_' + i,
                        'name':     info[i].name,
                        'photo':     'https://graph.facebook.com/' + info[i].id + '/picture',
                        'selected':    false
                    }
                }
                network_fillPopupFriends(fb_friendsInfo);
                $('#loadingpopup').hide();
            });
        }
        else $('#loadingpopup').hide();
    }

    // run once with current status and whenever the status changes
    FB.getLoginStatus(getFacebookInfo);
    FB.login(function(response) {
        if (response.authResponse) {
        // get friends
            FB.api('/me/friends?limit=' + FACEBOOK_FRIENDSLIMIT, function(response) {
                var i = 0, info = response.data.sort(sortMethod);
                fb_friendsInfo = [];

                for (i = 0; i < info.length; i++) {
                    fb_friendsInfo[i] = {
                        'id':         info[i].id,
                        'div_id':    'fbmemreas_' + i,
                        'name':     info[i].name,
                        'photo':     'https://graph.facebook.com/' + info[i].id + '/picture',
                        'selected':    false
                    }
                }
                network_fillPopupFriends(fb_friendsInfo);
                $('#loadingpopup').hide();
            });
        }
        else $('#loadingpopup').hide();
    }, {scope:'email'});
}

function networkPopupTwitterFriends(){
    $.removeCookie ('twitter_friends');
    $.oauthpopup({
        path: 'twitter',
        callback: function(){
            networkAuthTwFriends();
        }
    });
}

function networkAuthTwFriends(){
    var friend_list = $.cookie ('twitter_friends');
    if (typeof (friend_list) == 'undefined'){
        $('#loadingpopup').hide();
        jerror ('authentication failed! please try again');
        $("#network-dropfriend").val('fb');
        return false;
    }
    friend_list = JSON.parse (friend_list);
    var friend_count = friend_list.length;
    for (i = 0;i < friend_count;i++){
        temp_id = friend_list[i]['div_id'];
        temp_id = temp_id.split ('_');
        friend_list[i]['div_id'] = 'twnetwork_' + temp_id[1];
    }
    tw_friendsInfo = friend_list;
    network_fillPopupFriends (friend_list);
    $('#loadingpopup').hide();
}

function network_fillPopupFriends(info){
    if (friendList == null)
        friendList = $('.popupNetworkFriends_list');

    friendList.empty();

    var i = 0, el;

    for (i = 0; i < info.length; i++) {
        el = '';
        el += '<li>';
        el += '<figure class="pro-pics2" id="' + info[i].div_id + '" onclick="javascript:share_clickFriends(this.id);"><img src="' + info[i].photo + '" alt="" ' + (info[i].selected ? 'class="setchoosed"' : '') + '></figure>';
        el += '<aside class="pro-pic_names2" name="' + info[i].name + '" id="a' + info[i].div_id + '" onclick="javascript:share_clickFriends(this.id.substr(1));">' + info[i].name + '</aside>';
        el += '</li>';

        friendList.append(el);
    }

    var imgList = $('.popupNetworkFriends_list .mCSB_container li img');

    for (i = 0; i < imgList.length; i++) {
        $(imgList[i]).prop('src', info[i].photo);
    }
    $(".popupNetworkFriends_list").mCustomScrollbar({scrollButtons:{enable:true }});
}

function network_fillFriends(info){
    if (friendList == null)
        friendList = $('.network-friends');

    friendList.empty();

    var i = 0, el;

    for (i = 0; i < info.length; i++) {
        el = '';
        el += '<li>';
        el += '<figure class="pro-pics2" id="' + info[i].div_id + '" onclick="javascript:network_clickFriends(this.id);"><img src="' + info[i].photo + '" alt="" ' + (info[i].selected ? 'class="setchoosed"' : '') + '></figure>';
        el += '<aside class="pro-pic_names2" name="' + info[i].name + '" id="network-' + info[i].div_id + '">' + info[i].name + '</aside>';
        el += '</li>';

        friendList.append(el);
    }

    var imgList = $('.network-friends .mCSB_container li img');

    for (i = 0; i < imgList.length; i++) {
        $(imgList[i]).prop('src', info[i].photo);
    }
    $(".network-friends").mCustomScrollbar({scrollButtons:{enable:true }});
}

//Add friend to network groups
function addFriendNetwork(){
    var group_id = $("select[name=account_groups]").val();
    if (group_id == ''){
        jerror('Please choose your network group first to add more friends');
        return false;
    }
    //Assign current group name
    $("#network-groupname span").html($("select[name=account_groups] option[value='" + group_id + "']").html());

    //Set friend social network
    $("select#network-dropfriend").trigger('change');
}

//Add friend button popup clicked
function acceptAddFriendNetwork(){
    var friend_network = $("select#network-dropfriend").val();
    var selected_friend = [];
    var increase = 0;
    switch(friend_network){
        case 'facebook':
            var count_friend = fb_friendsInfo.length;
            var network_name = 'facebook';
            for (i = 0;i < count_friend;i++){
                if (fb_friendsInfo[i].selected){
                    selected_friend[increase++] = {
                        tag: 'friend',
                        value :[
                                    { tag: 'friend_name',         value: fb_friendsInfo[i].name },
                                    { tag: 'profile_pic_url',     value: fb_friendsInfo[i].photo }
                                ]
                    };
                }
            }
            break;
        case 'twitter':
            var count_friend = tw_friendsInfo.length;
            var network_name = 'twitter';
            for (i = 0;i < count_friend;i++){
                if (tw_friendsInfo[i].selected){
                    selected_friend[increase++] = {
                        tag: 'friend',
                        value: [
                                    { tag: 'friend_name',         value: tw_friendsInfo[i].name },
                                    { tag: 'profile_pic_url',     value: tw_friendsInfo[i].photo }
                                ]
                    };
                }
            }
            break;
        case 'memreas':
            var count_friend = mr_friendsInfo.length;
            var network_name = 'memreas';
            for (i = 0;i < count_friend;i++){
                if (mr_friendsInfo[i].selected){
                    if (mr_friendsInfo[i].photo == 'null')
                        friend_photo = '/memreas/img/profile-pic.jpg';
                    else friend_photo = mr_friendsInfo[i].photo;
                    selected_friend[increase++] = {
                        tag: 'friend',
                        value: [
                                    { tag: 'friend_name',         value: mr_friendsInfo[i].name },
                                    { tag: 'profile_pic_url',     value: mr_friendsInfo[i].photo }
                                ]
                    };
                }
            }
            break;
        default:
            jerror('Your social network invalid');
            return false;
    }
    var params = [
                    {tag: 'group_id', value: $("select[name=account_groups]").val()},
                    {tag: 'network', value: network_name},
                    {tag: 'friends', value : selected_friend},
                ];
    ajaxRequest('addfriendtogroup', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
            jsuccess(getValueFromXMLTag(xml_response, 'message'));

            //Reload friend panel
            $("select[name=friend_network]").val($("select#network-dropfriend").val());
            disablePopup('popupNetworkFriends');
            setTimeout(function(){
                $("select[name=friend_network]").trigger('change');
            }, 2000);
        }
        else jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}

//Click network friends
function network_clickFriends(selected_friend_id){
    var jElement = $("#" + selected_friend_id);
    var jSubElement = $("#network-" + selected_friend_id);
    if (jElement.hasClass('nw-friend-selected')){
        jElement.removeClass('nw-friend-selected');
        jSubElement.removeClass('nw-friend-selected');
    }
    else {
        jElement.addClass('nw-friend-selected');
        jSubElement.addClass('nw-friend-selected');
    }
}

//Update network friends
function updateNetworkFriends(){
    var network_friend_count = networkfriendsInfo.length;

    networkFriendsSelected = [];
    increase = 0;
    for (i = 0;i < network_friend_count;i++){
        if ($("#" + networkfriendsInfo[i].id).hasClass('nw-friend-selected'))
            networkFriendsSelected[increase++] = { tag: 'friend', value:[{tag: 'friend_id', value: networkfriendsInfo[i].id}]  };

    }
    var friendSelected = networkFriendsSelected.length;
    if (friendSelected == 0){
        jerror('Please select friend(s) to remove.');
        return;
    }

    var params = [
                    {tag: 'group_id', value: $("select[name=account_groups]").val()},
                    {tag: 'friends', value: networkFriendsSelected}
                  ];
    ajaxRequest('removefriendgroup', params, function(xml_response){
        jsuccess(getValueFromXMLTag(xml_response, 'message'));
        setTimeout(function(){
                $("select[name=friend_network]").trigger('change');
            }, 2000);
    });
}