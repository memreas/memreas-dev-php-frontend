var networkfriendsInfo = [];
var group_mode = 'update';
$(function(){
    $("#morepage_eventDate").datepicker();
    $("#moredate_eventDateFrom").datepicker();
    $("#moredate_eventDateTo").datepicker();
    $("#morepage_eventSelfDestruct").datepicker();

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
        //$("#tabs-more").elastislide({minItems: 7});
        $("a[title=tab1-more]").trigger("click");
        $('#buttons-moretab').akordeon();
        $('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
    });

    //Group tab
    $("a.group-tab").one ('click', function(){
        getUserGroups();
        $('#buttons2-moretab').akordeon();
    });

    $("a.network-tab").one ('click', function(){ $('#buttons3-moretab').akordeon(); });
    $("a.notification-tab").one ('click', function(){ $('#buttons4-moretab').akordeon(); });
    $("a.help-tab").one ('click', function(){ $('#buttons5-moretab').akordeon(); });

    $("a.friends-tab").one ('click', function(){
        listFriends();
    });

    $("a.event-tab").one ('click', function(){
        $('#buttons6-moretab').akordeon();
        getAccountMemreas();
    });

    var subscriptionTabAkordeon = false;
    $("a.subscription-tab").click (function(){

        if (!subscriptionTabAkordeon){
            $('#buttons7-moretab').akordeon();
            loadSubscriptionPlans();
            subscriptionTabAkordeon = true;
        }

        if ($(".subscription-payment-method-tab").hasClass('expanded')){
            var jMemberCard = $(".subscription-payment");
            if (checkReloadItem('reload_subscription_cards') || jMemberCard.html() == ''){
                if (!jMemberCard.hasClass('preload-null'))
                    jMemberCard.addClass('preload-null');
            }
            listStripeCard();
        }
    });

    var buyCreditTabAkordeon = false;
    $("a.buy-credit-tab").click (function(){

        if (!buyCreditTabAkordeon){
            $('#buttons8-moretab').akordeon();
            buyCreditTabAkordeon = true;
        }

        var jMemberCard = $(".buycredit-payment");
        if (checkReloadItem('reload_buy_credit_cards') || jMemberCard.html() == ''){
            if (jMemberCard.hasClass('preload-null'))
                jMemberCard.addClass('preload-null');
        }
        buycredit_listCard();
    });

    //Sell mediatab
    $("a.sell-media-tab").one("click", function(){
        $('#buttons9-moretab').akordeon();
    });

    /*Action tabs click*/
    var accountTabAkordenon = false;
    $("a[title=tab1-more]").click(function(){
        if (!accountTabAkordenon){
            activeAkordeon('account-profile-tab', false);
            accountTabAkordenon = true;
        }
        if ($(".account-card-tab").hasClass('expanded')){
            var jMemberCard = $(".account-payment");
            if (checkReloadItem('reload_account_cards') || jMemberCard.html() == ''){
                if (!jMemberCard.hasClass('preload-null'))
                    jMemberCard.addClass('preload-null')
            }
            loadAccountCard();
            $(".account-card-functions").show();
        }

    });

    /* Change profile picture*/

    $(".change-profile-btn").click(function(){ $("#frm-profile-pic").find('input[type=file]').click(); });
    var profile_filename = '';
    $("#frm-profile-pic").fileupload({
        url: $(this).attr('action'),
        dataType: 'xml',
        crossDomain: true,
        multiple: true,
        type: 'POST',
        autoUpload: true,
        add: function (event, data) {
            profile_filename = data.files[0].name;
            profile_filename = correctUploadFilename(profile_filename);
            if (!$("a[title=more]").hasClass('active')) return false;
            var form = $(this);
            //Get signed credentials
            $.ajax({
                url: "/index/s3signed",
                type: 'GET',
                dataType: 'json',
                data: {title: profile_filename}, // send the file name to the server so it can generate the key param
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
            var key_value = profile_filename;
            $(this).find("input[name=Content-Type]").val(filetype);

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
            var _media_url = getValueFromXMLTag(jqXHR.responseText, 'Location');
            var _media_extension = _media_url.split(".");
            _media_extension = _media_extension[_media_extension.length - 1];
            var media_type = '';
            if (_media_url.indexOf('image') >= 0)
                media_type = 'image/' + _media_extension;
            else media_type = 'video/' + _media_extension;
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
                $("#setting-userprofile img, img#profile_picture").attr ('src', _media_url);
                jsuccess('Your profile picture updated');
                setTimeout(function(){
                    var params = [{tag: 'user_id', value: $("input[name=user_id]").val()}];
                    ajaxRequest('getuserdetails', params, function(xml_response){
                        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
                            var useremail = getValueFromXMLTag(xml_response, 'email');
                            var username = getValueFromXMLTag(xml_response, 'username');
                            $("input[name=username]").val(username);
                            var userprofile = getValueFromXMLTag(xml_response, 'profile');
                            userprofile = removeCdataCorrectLink(userprofile);
                            var alternate_email = getValueFromXMLTag(xml_response, 'alternate_email');
                            var gender = getValueFromXMLTag(xml_response, 'gender');
                            var dob = getValueFromXMLTag(xml_response, 'dob');
                            var username_length = username.length;
                            if (username_length > 10){
                                username = username.substring(0, 7) + '...';
                            }
                            $("header").find(".pro-name").html(username);
                            $("#setting-username").html(getValueFromXMLTag(xml_response, 'username'));
                            if (userprofile != ''){
                                $("header").find("#profile_picture").attr('src', userprofile);
                                $("#setting-userprofile img").attr('src', userprofile);
                            }
                            $("input[name=account_email]").val(useremail);
                            $("input[name=account_alternate_email]").val(alternate_email);
                            $("input[name=dob]").val(dob);

                            if (gender == 'male')
                                $("#gender-male").attr("checked", "checked");
                            else{
                                if (gender == 'female') $("#gender-female").attr("checked", "checked");
                            }

                            $("input[name=account_email]").val(useremail);
                        }
                        else jerror (getValueFromXMLTag(xml_response, 'messsage'));
                    });
                }, 2000);
            });
        },
        done: function (event, data) {

        }
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
            var alternate_email = getValueFromXMLTag(xml_response, 'alternate_email');
            var gender = getValueFromXMLTag(xml_response, 'gender');
            var dob = getValueFromXMLTag(xml_response, 'dob');
            $("#setting-username").html(username);
            if (userprofile != '')
                $("#setting-userprofile img").attr('src', userprofile);
            $("input[name=account_email]").val(useremail);
            $("input[name=account_alternate_email]").val(alternate_email);
            $("input[name=dob]").val(dob);

            if (gender == 'male')
                $("#gender-male").attr("checked", "checked");
            else{
                if (gender == 'female') $("#gender-female").attr("checked", "checked");
            }
        }
        else jerror (getValueFromXMLTag(xml_response, 'messsage'));
    });
}

/*Function Save user detail*/
function saveUserDetail(){
    if ($("input[name=account_alternate_email]").val() == '' || $("input[name=account_alternate_email]").val() == 'alternate email'){
        jerror('Please sepecify alternate email');
        return false;
    }

    if ($("#gender-male").is(":checked"))
        var account_gender = 'male';
    else{
        if ($("#gender-female").is(":checked"))
            var account_gender = 'male';
        else var account_gender = '';
    }
    var account_dob = $("input[name=account_dob]").val();

    var userId = $("input[name=user_id]").val();
    var params = [
        {tag: 'user_id', value: userId},
        {tag: 'email', value: $("input[name=account_alternate_email]").val()},
        {tag: 'gender', value: account_gender},
        {tag: 'dob', value: account_dob},
        {tag: 'profile_picture', value: ''}
    ];
    ajaxRequest('saveuserdetails', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == "Success"){
            jsuccess(getValueFromXMLTag(xml_response, 'message'));
            fillUserDetail($("input[name=user_id]").val());
        }
        else jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}

/*Function Save user detail*/
function saveChangePassword(){
    var account_old_password = $("input[name=account_password]").val();
    var account_password = $("input[name=account_password]").val();

    if (account_password != 'password' && account_password != ''){
        var retype_account_password = $("input[name=account_repassword]").val();
        if (account_password != retype_account_password){
            jerror('password is not matched');
            return false;
        }
    }
    else {
        if (account_password == 'password')
            account_password = '';
    }

    var userId = $("input[name=user_id]").val();
    var params = [
        {tag: 'user_id', value: userId},
        {tag: 'old', value: account_old_password},
        {tag: 'new', value: account_password},
        {tag: 'retype', value: retype_account_password}
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
    $("select.account-groups").html('<option value="">-Choose-</option>');
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

    if (group_mode == 'update'){
        var group_id = $("select[name=account_groups]").val();
        if (group_id == ''){
            jerror('Please select your group name first.');
            return false;
        }
    }
    else group_id = '';

    var params = [
        {tag: 'group_id', value: group_id},
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
                    'selected': false
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
    if (friendList == null){
        if ($('.network-friends').hasClass('mCustomScrollbar'))
            friendList = $(".network-friends .mCSB_container");
        else friendList = $('.network-friends');
    }
    friendList.empty();

    friendList.empty();

    var i = 0, el;

    for (i = 0; i < info.length; i++) {
        el = '';
        el += '<li>';
        el += '<figure class="pro-pics2" id="' + info[i].div_id + '" onclick="javascript:network_clickFriends(this.id);"><img src="' + info[i].photo + '" alt="" ' + (info[i].selected ? 'class="setchoosed"' : '') + '></figure>';
        el += '<aside class="pro-pic_names2" name="' + info[i].name + '" id="network-' + info[i].div_id + '" onclick="$(this).prev(\'figure\').click();">' + info[i].name + '</aside>';
        el += '</li>';

        friendList.append(el);
    }

    var imgList = $('.network-friends .mCSB_container li img');

    for (i = 0; i < imgList.length; i++) {
        $(imgList[i]).prop('src', info[i].photo);
    }
    ajaxScrollbarElement(".network-friends");
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
            for (var i = 0;i < count_friend;i++){
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
            for (var i = 0;i < count_friend;i++){
                if (mr_friendsInfo[i].selected){
                    if (mr_friendsInfo[i].photo == 'null')
                        var friend_photo = '/memreas/img/profile-pic.jpg';
                    else var friend_photo = mr_friendsInfo[i].photo;
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
        {tag: 'friends', value : selected_friend}
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
function updateNetworkFriends(confirmStatus){

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

    if (!confirmStatus){
        jconfirm("Update these changes?", "updateNetworkFriends(true)");
        return false;
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

function removeGroup(confimStatus){
    var group_id = $("select[name=account_groups]").val();
    if (group_id == ''){
        jerror('Please select your group name first.');
        return false;
    }

    if (!confimStatus)
        jconfirm('Are you sure want to remove this group?', 'removeGroup(true)');
    else{
        var params = [{tag: 'group_id', value: group_id}];
        ajaxRequest('removegroup', params, function(response){
            if (getValueFromXMLTag(response, 'status') == 'Success'){
                jsuccess(getValueFromXMLTag(response, 'message'));
                getUserGroups();
            }
            else jerror(getValueFromXMLTag(response, 'messsage'));
        });
    }
}

/*
* Morepage memreas management
*/
var currentMorepageEventId = '';
$(function(){
    $(".memreas-media-header").click(function(){
        getMemreasEventMedia();
    });
    $(".memreas-friend-header").click(function(){
        getMorepageEventFriends();
    });

    $("#cmd_MorepageEvents").change(function(){
        fillmorepage_eventDetail($(this).val());
    });
});
function getAccountMemreas(){
    var jSelectEventName = $("#cmd_MorepageEvents");

    if (jSelectEventName.html() == ''){
        ajaxRequest(
            'viewevents',
            [
                {tag: 'user_id', value: user_id},
                {tag: 'is_my_event', value : '1'},
                {tag: 'is_friend_event', value: '0'},
                {tag: 'is_public_event', value: '0'},
                {tag: 'page', value: '1'},
                {tag: 'limit', value: '20'}
            ],function (response){
                if (getValueFromXMLTag(response, 'status') == "Success"){
                    var events = getSubXMLFromTag(response, 'event');
                    var event_count = events.length;
                    var html_str = '';
                    for (var i = 0;i < event_count;i++){
                        var event = events[i].innerHTML;
                        var eventId = $(event).filter ('event_id').html();
                        var event_name = $(event).filter ('event_name').html();
                        html_str += '<option value="' + eventId + '">' + event_name + '</option>';
                    }
                    jSelectEventName.html(html_str);
                    $("#cmd_MorepageEvents").change();
                }
                else jerror('You have no event at this time');
        });
    }
}

function fillmorepage_eventDetail(morepage_event_id){
    var jMorepageEventDate = $("#morepage_eventDate");
    var jMorepageEventLocation = $("#morepage_eventLocation");
    var jMorepageEventFriendsCanPost = $("#morepage_eventFriendsCanPost");
    var jMorepageEventFreindsCanAdd = $("#morepage_friendsCanAdd");
    var jMorepage_EventPublic = $("#morepage_public");
    var jMorepage_isviewable = $("#morepage_isviewable");
    var jMoredate_eventDateFrom = $("#moredate_eventDateFrom");
    var jMoredate_eventDateTo = $("#moredate_eventDateTo");
    var jMorepage_IsSelfDestruct = $("#morepage_isselfdestruct");
    var jmorepage_eventSelfDestruct = $("#morepage_eventSelfDestruct");

    ajaxRequest('geteventdetails',
        [{tag: 'event_id', value: morepage_event_id}],
        function(response){
        if (getValueFromXMLTag(response, 'status') == "Success") {

            if (getValueFromXMLTag(response, 'date') != '')
                jMorepageEventDate.val(getValueFromXMLTag(response, 'date'));
            else jMorepageEventDate.val('from');

            if (getValueFromXMLTag(response, 'location') != '')
                jMorepageEventLocation.val(getValueFromXMLTag(response, 'location'));

            var friendsCanPost = getValueFromXMLTag(response, 'friends_can_post');
            if (friendsCanPost == 1)
                jMorepageEventFriendsCanPost.attr('checked', true);
            else jMorepageEventFriendsCanPost.removeAttr('checked', false);

            var friendsCanAdd = getValueFromXMLTag(response, 'friends_can_share');
            if (friendsCanAdd == 1)
                jMorepageEventFreindsCanAdd.attr('checked', true);
            else jMorepageEventFreindsCanAdd.removeAttr('checked');

            //jMorepage_isviewable.val(getValueFromXMLTag(response, ))
            if (getValueFromXMLTag(response, 'viewable_from') != ''){
                jMoredate_eventDateFrom.val(getValueFromXMLTag(response, 'viewable_from'));
                jMorepage_isviewable.attr('checked', true)
            }
            else {
                jMoredate_eventDateFrom.val('from');
                jMorepage_isviewable.removeAttr('checked');
            }

            if (getValueFromXMLTag(response, 'viewable_to') != '')
                jMoredate_eventDateTo.val(getValueFromXMLTag(response, 'viewable_to'));
            else jMoredate_eventDateTo.val('to');

            if (getValueFromXMLTag(response, 'self_destruct') != ''){
                jmorepage_eventSelfDestruct.val(getValueFromXMLTag(response, 'self_destruct'));
                jMorepage_IsSelfDestruct.attr('checked', true);
            }
            else{
                jmorepage_eventSelfDestruct.val('');
                jMorepage_IsSelfDestruct.removeAttr('checked');
            }

        }
        else jerror(getValueFromXMLTag(response, 'message'));
    });
}

function getMemreasEventMedia(){
    var jMemreasEventMedia = $(".memreasEventMedia");

    if (jMemreasEventMedia.hasClass("mCustomScrollbar"))
        jMemreasEventMedia = $(".memreasEventMedia .mCSB_container");

    var memreasEventId = $("#cmd_MorepageEvents").val();
    if (memreasEventId == ''){
        jerror('Please select your memreas event above');
        return false;
    }

    if (memreasEventId == currentMorepageEventId && jMemreasEventMedia.html() != '') return false;

    currentMorepageEventId = memreasEventId;
    ajaxRequest(
        'listallmedia',
        [
            { tag: 'event_id',  value: memreasEventId },
            { tag: 'user_id',   value: user_id },
            { tag: 'device_id', value: '' },
            { tag: 'limit',     value: '100' },
            { tag: 'page',      value: '1' }
        ], function (response){
            jMemreasEventMedia.empty();
            if (getValueFromXMLTag(response, 'status') == "Success") {
                var medias = getSubXMLFromTag(response, 'media');
                var media_count = medias.length;
                for (var i=0;i < media_count;i++) {
                    var media = medias[i];
                    var media_type = getValueFromXMLTag(media,  'type');
                    var media_id = getValueFromXMLTag(media,  'media_id');
                    var _media_url = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                    if (media_type == 'video')
                        jMemreasEventMedia.append ('<li class="event_img video-media" id="moremedia-' + media_id + '" onclick="more_clickMedia(this.id);"><img src="' + _media_url + '"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></li>');
                    jMemreasEventMedia.append ('<li class="event_img" id="moremedia-' + media_id + '" onclick="more_clickMedia(this.id);"><img src="' + _media_url + '"/></li>');
                }
                ajaxScrollbarElement("#memreasEventMedia");
                updateAkordeonContent($(".memreas-media"));
            }
            else jerror('You have no media on this event');
    });
}

function morepage_saveEvent(){
    var viewable_from = (($("#moredate_eventDateFrom").val() != ''
                                                && $("#moredate_eventDateFrom").val() != 'from')
                                                ? $("#moredate_eventDateFrom").val() : '');
    if (viewable_from != ''){
        var split_date = viewable_from.split('/');
        viewable_from = split_date[1] + '-' + split_date[0] + '-' + split_date[2]; //Correct date format to d-m-Y
    }

    var viewable_to = (($("#moredate_eventDateTo").val() != ''
                                                && $("#moredate_eventDateTo").val() != 'to')
                                                ? $("#moredate_eventDateTo").val() : '');

    if (viewable_to != ''){
        var split_date = viewable_to.split('/');
        viewable_to = split_date[1] + '-' + split_date[0] + '-' + split_date[2]; //Correct date format to d-m-Y
    }

    var self_destruct = (($("#morepage_eventSelfDestruct").val() != '') ? $("#morepage_eventSelfDestruct").val() : '');
    if (self_destruct != ''){
        var split_date = self_destruct.split('/');
        self_destruct = split_date[1] + '-' + split_date[0] + '-' + split_date[2]; //Correct date format to d-m-Y
    }

    if ($("#morepage_eventFriendsCanPost").is(":checked"))
        var friend_can_post = 1;
    else friend_can_post = 0;

    if ($("#morepage_friendsCanAdd").is(":checked"))
        var friend_can_add = 1;
    else var friend_can_add = 0;

    var params = [
                    {tag: 'event_id', value: $("#cmd_MorepageEvents").val()},
                    {tag: 'event_name', value: $("#cmd_MorepageEvents option[value='" + $("#cmd_MorepageEvents").val() +"']").html()},
                    {tag: 'event_location', value: (($("#morepage_eventLocation").val() != ''
                                                        && $("#morepage_eventLocation").val() != 'address or current location')
                                                        ? $("#morepage_eventLocation").val() : '')},
                    {tag: 'event_date', value: (($("#morepage_eventDate").val() != ''
                                                && $("#morepage_eventDate").val() != 'from')
                                                ? $("#morepage_eventDate").val() : '')},
                    //{tag: 'viewable'}
                    {tag: 'event_from', value: viewable_from},
                    {tag: 'event_to', value: viewable_to},
                    {tag: 'is_friend_can_post_media', value: friend_can_post.toString()},
                    {tag: 'is_friend_can_add_friend', value: friend_can_add.toString()},
                    {tag: 'event_self_destruct', value: self_destruct}
                ];
    ajaxRequest('editevent', params, function(response){
        if (getValueFromXMLTag(response, 'status'))
            jsuccess(getValueFromXMLTag(response, 'message'));
        else jerror(getValueFromXMLTag(response, 'message'));
    });
}

function getMorepageEventFriends(){
    var jMemreasEventFriend = $(".memreasMorepageFriends");

    if (jMemreasEventFriend.hasClass("mCustomScrollbar"))
        jMemreasEventFriend = $(".memreasMorepageFriends .mCSB_container");

    var memreasEventId = $("#cmd_MorepageEvents").val();

    if (memreasEventId == ''){
        jerror('Please select your memreas event above');
        return false;
    }

    if (memreasEventId == currentMorepageEventId && jMemreasEventFriend.html() != '') return false;

    currentMorepageEventId = memreasEventId;

    ajaxRequest('geteventpeople', [{tag: 'event_id', value: memreasEventId}],
        function(xml_response){
            jMemreasEventFriend.empty();
            if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
                var friends = getSubXMLFromTag(xml_response, 'friend');
                var count_people = friends.length;
                for (var i = 0;i < count_people;i++){
                    var friend = friends[i];
                    if (getValueFromXMLTag(friend, 'photo') == '' || getValueFromXMLTag(friend, 'photo') == 'null')
                        var friend_photo = '/memreas/img/profile-pic.jpg';
                    else var friend_photo = getValueFromXMLTag(friend, 'photo');
                    friend_photo = removeCdataCorrectLink(friend_photo);
                    var friend_id = getValueFromXMLTag(friend, 'friend_id');
                    var friend_name = getValueFromXMLTag(friend, 'friend_name');
                    var html_str = '<li>';
                    html_str += '<figure class="pro-pics2" id="morefriend-' + friend_id + '" onclick="javascript:morepage_clickFriends(this.id);"><img class="morepage-friend-thumb" src="' + friend_photo + '" alt="" ></figure>';
                    html_str += '<aside class="pro-pic_names2" name="' + friend_name + '" id="a' + friend_id + '" onclick="javascript:share_clickFriends(this.id.substr(1));">' + friend_name + '</aside>';
                    html_str += '</li>';
                    jMemreasEventFriend.append(html_str);
                }
                ajaxScrollbarElement(".memreasMorepageFriends");
                updateAkordeonContent($(".memreas-friends"));
            }
            else jerror('You have no friend on this event');
        }
    );
}
function morepage_clickFriends(friendElementId){
    var jFriendElementImg = $("#" + friendElementId + ' img');
    var jFriendElementAside = $("#" + friendElementId).next('aside');
    if (jFriendElementImg.hasClass('setchoosed')){
        jFriendElementImg.removeClass('setchoosed');
        jFriendElementAside.css('border', '3px solid #FFF');
    }
    else{
        jFriendElementImg.addClass('setchoosed');
        jFriendElementAside.css('border', '3px solid green');
    }
}

function more_clickMedia(mediaElementId){
    var jMediaElement = $("#" + mediaElementId);
    if (jMediaElement.hasClass('setchoosed'))
        jMediaElement.removeClass('setchoosed');
    else jMediaElement.addClass('setchoosed');
}

more_showGoogleMap = function(div_id) {
    popup('more_dlg_locationmap');
    more_initGoogleMap(div_id);
}

// close the popup window with google map.
// save_address: variable indicating if the address is saved or not.
more_closeGoogleMap = function(save_address) {
    if (save_address == true) {
        var addr = $('#more_txt_locationmap_address').val();
        if (addr != "")
            $('#morepage_eventLocation').val(addr);
        else
            setDefaultValue('morepage_eventLocation');
    }

    disablePopup('more_dlg_locationmap');
}

// initialize the google map.
more_initGoogleMap = function(div_id) {
    if (location_map == null || typeof location_map == "undefined") {
         var lat = 44.88623409320778,
             lng = -87.86480712897173,
             latlng = new google.maps.LatLng(lat, lng),
             image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';

         // create the google map object.
         var mapOptions = {
             center: new google.maps.LatLng(lat, lng),
             zoom: 13,
             mapTypeId: google.maps.MapTypeId.ROADMAP,
             panControl: true,
             panControlOptions: {
                 position: google.maps.ControlPosition.TOP_RIGHT
             },
             zoomControl: true,
             zoomControlOptions: {
                 style: google.maps.ZoomControlStyle.LARGE,
                 position: google.maps.ControlPosition.TOP_left
             }
         },
         location_map = new google.maps.Map(document.getElementById(div_id), mapOptions),
         marker = new google.maps.Marker({
             position: latlng,
             map: location_map,
             icon: image
         });

         // set the search text field as auto-complete.
         var input = document.getElementById('more_txt_locationmap_address');
         var autocomplete = new google.maps.places.Autocomplete(input, {
             types: ["geocode"]
         });

         autocomplete.bindTo('bounds', location_map);
         var infowindow = new google.maps.InfoWindow();

         google.maps.event.addListener(autocomplete, 'place_changed', function (event) {
             infowindow.close();

             var place = autocomplete.getPlace();
             if (typeof place.geometry == "undefined")
                 return;

             if (place.geometry.viewport) {
                 location_map.fitBounds(place.geometry.viewport);
             } else {
                 location_map.setCenter(place.geometry.location);
                 location_map.setZoom(17);
             }

             moveMarker(place.name, place.geometry.location);
         });

         function moveMarker(placeName, latlng) {
             marker.setIcon(image);
             marker.setPosition(latlng);
             infowindow.setContent(placeName);
         }
    }

    if (isElementEmpty('morepage_eventLocation')) {
        // get the current location.
        var err_msg = "Error while getting location. Device GPS/location may be disabled."
        var geoPositionOptions = $.extend({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 10000
        }, { timeout: 10000 } );

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition (
                function(position) {
                    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    if (geocoder == null)
                        geocoder = new google.maps.Geocoder();
                    geocoder.geocode({'latLng': latlng}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                $('#more_txt_locationmap_address').val(results[1].formatted_address);
                            }
                        } else {
                        }
                    });
                    if (location_map)
                        location_map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                },
                function(error) {
                    jerror(err_msg);
                },
                geoPositionOptions
            );
        } else {
            jerror(err_msg);
        }
    }
}

function morepage_removeMedias(){
    var jMorepageMediaElement = $(".memreasEventMedia li");
    var self_chooseMedia = [];
    var counter_media = 0;
    jMorepageMediaElement.each(function(){
        if ($(this).hasClass('setchoosed')){
            var media_id = $(this).attr('id').replace('moremedia-', '');
            self_chooseMedia[counter_media++] = {tag: 'media_id', value: media_id};
        }
    });

    if (self_chooseMedia.length == 0){
        jerror('Please choose media to remove');
        return false;
    }

    var params = [
                    {tag: 'event_id', value: currentMorepageEventId},
                    {tag: 'media_ids', value: self_chooseMedia}
                ];

    ajaxRequest('removeeventmedia', params, function(response){
        if (getValueFromXMLTag(response, 'status') == 'Success'){
            jsuccess(getValueFromXMLTag(response, 'message'));
            setTimeout(function(){
                var jMemreasEventMedia = $(".memreasEventMedia");

                if (jMemreasEventMedia.hasClass("mCustomScrollbar"))
                    jMemreasEventMedia = $(".memreasEventMedia .mCSB_container");
                ajaxRequest(
                    'listallmedia',
                    [
                        { tag: 'event_id',  value: memreasEventId },
                        { tag: 'user_id',   value: user_id },
                        { tag: 'device_id', value: '' },
                        { tag: 'limit',     value: '100' },
                        { tag: 'page',      value: '1' }
                    ], function (response){
                        jMemreasEventMedia.empty();
                        if (getValueFromXMLTag(response, 'status') == "Success") {
                            var medias = getSubXMLFromTag(response, 'media');
                            var media_count = medias.length;
                            for (var i=0;i < media_count;i++) {
                                var media = medias[i].innerHTML;
                                var media_type = $(media).filter('type').html();
                                var media_id = $(media).filter('media_id').html();
                                var _media_url = getMediaThumbnail(media, '/memreas/img/small/1.jpg');
                                if (media_type == 'video')
                                    jMemreasEventMedia.append ('<li class="event_img video-media" id="moremedia-' + media_id + '" onclick="more_clickMedia(this.id);"><img src="' + _media_url + '"/><img class="overlay-videoimg" src="/memreas/img/video-overlay.png" /></li>');
                                jMemreasEventMedia.append ('<li class="event_img" id="moremedia-' + media_id + '" onclick="more_clickMedia(this.id);"><img src="' + _media_url + '"/></li>');
                            }
                            ajaxScrollbarElement("#memreasEventMedia");
                        }
                        else jerror('You have no media on this event');
                });
            }, 2000);
        }
        else jerror(getValueFromXMLTag(response, 'message'));
    });
}

function morepage_removeFriends(){
    var jMorepageFriendsElement = $(".memreasMorepageFriends li");
    var self_chooseFriends = [];
    var counter_friend = 0;
    jMorepageFriendsElement.each(function(){
        var jFriendImage = $(this).find('img.morepage-friend-thumb');
        if (jFriendImage.hasClass('setchoosed')){
            var morepage_friendId = ($(this).find('figure').attr('id').replace('morefriend-', ''));
            self_chooseFriends[counter_friend++] = {tag: 'friend_id', value: morepage_friendId};
        }
    });

    if (self_chooseFriends.length == 0){
        jerror('Please choose friend to remove');
        return false;
    }

    var params = [
                    {tag: 'event_id', value: currentMorepageEventId},
                    {tag: 'friend_ids', value: self_chooseFriends}
                ];
    ajaxRequest('removeeventfriend', params, function(response){
        if (getValueFromXMLTag(response, 'status') == 'Success'){
            jsuccess(getValueFromXMLTag(response, 'message'));
            setTimeout(function(){
                var jMemreasEventFriend = $(".memreasMorepageFriends");

                if (jMemreasEventFriend.hasClass("mCustomScrollbar"))
                    jMemreasEventFriend = $(".memreasMorepageFriends .mCSB_container");
                ajaxRequest('geteventpeople', [{tag: 'event_id', value: currentMorepageEventId}],
                    function(xml_response){
                        jMemreasEventFriend.empty();
                        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
                            var friends = getSubXMLFromTag(xml_response, 'friend');
                            var count_people = friends.length;
                            for (i = 0;i < count_people;i++){
                                friend = friends[i];
                                if (getValueFromXMLTag(friend, 'photo') == '' || getValueFromXMLTag(friend, 'photo') == 'null')
                                    friend_photo = '/memreas/img/profile-pic.jpg';
                                else friend_photo = getValueFromXMLTag(friend, 'photo');
                                friend_id = getValueFromXMLTag(friend, 'friend_id');
                                friend_name = getValueFromXMLTag(friend, 'friend_name');
                                html_str = '<li>';
                                html_str += '<figure class="pro-pics2" id="morefriend-' + friend_id + '" onclick="javascript:morepage_clickFriends(this.id);"><img class="morepage-friend-thumb" src="' + friend_photo + '" alt="" ></figure>';
                                html_str += '<aside class="pro-pic_names2" name="' + friend_name + '" id="a' + friend_id + '" onclick="javascript:morepage_clickFriends(this.id.substr(1));">' + friend_name + '</aside>';
                                html_str += '</li>';
                                jMemreasEventFriend.append(html_str);
                            }
                            ajaxScrollbarElement(".memreasMorepageFriends");
                        }
                        else jerror('You have no friend on this event');
                    }
                );
            }, 2000);
        }
    });
}

function AddGroup(){
    $(".group-select, .group-default-actions").hide();
    $(".input_group_name, .group-add-actions").show();
    group_mode = 'add_new';
}

function saveAddGroup(){
    var group_name = $(".input_group_name").val();
    if (group_name == '' || group_name == 'group name'){
        jerror('Please input group name');
        return false;
    }

    var network_friend_count = networkfriendsInfo.length;

    networkFriendsSelected = [];
    increase = 0;
    for (i = 0;i < network_friend_count;i++){
        if ($("#" + networkfriendsInfo[i].id).hasClass('nw-friend-selected'))
            networkFriendsSelected[increase++] = { tag: 'friend', value:[{tag: 'friend_id', value: networkfriendsInfo[i].id}]  };

    }
    var friendSelected = networkFriendsSelected.length;
    if (friendSelected == 0){
        jerror('Please select friend(s) to add.');
        return;
    }

    ajaxRequest(
        'creategroup',
        [
            { tag: 'group_name', 	value: group_name },
            { tag: 'user_id', 		value: user_id },
            { tag: 'friends', 		value: networkFriendsSelected }
        ],
        function(ret_xml) {
            // parse the returned xml.
            var status   = getValueFromXMLTag(ret_xml, 'status');
            var message  = getValueFromXMLTag(ret_xml, 'message');
            if (status.toLowerCase() == 'success'){
                jsuccess('group was created successfully.');
                cancelAddGroup();
                getUserGroups();
            }
            else jerror(message);
        }
    );

}
function cancelAddGroup(){
    $(".input_group_name, .group-add-actions").hide();
    $(".group-select, .group-default-actions").show();
    group_mode = 'update';
}