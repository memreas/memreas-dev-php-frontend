/*
* More page manage friend handle here
* */
function listFriends(){
    var jFriendList = $(".manage-friends");
    jFriendList.empty();

    var params = [{tag: 'user_id', value: $("input[name=user_id]").val()}]
    ajaxRequest('getfriends', params, function(response){
        if (getValueFromXMLTag(response, 'status') == 'Success'){
            var friends = getSubXMLFromTag(response, 'friend');
            var count_people = friends.length;
            for (var i = 0;i < count_people;i++){
                var friend = friends[i];
                var friend_photo = '';
                if (getValueFromXMLTag(friend, 'photo') == '' || getValueFromXMLTag(friend, 'photo') == 'null')
                   friend_photo= '/memreas/img/profile-pic.jpg';
                else friend_photo = getValueFromXMLTag(friend, 'photo');
                var friend_id = getValueFromXMLTag(friend, 'friend_id');
                var friend_name = getValueFromXMLTag(friend, 'friend_name');
                var html_str = '<li>';
                html_str += '<figure class="pro-pics2" id="manageF-' + friend_id + '" onclick="javascript:manageF_clickFriends(this.id);"><img class="morepage-friend-thumb" src="' + friend_photo + '" alt="" ></figure>';
                html_str += '<aside class="pro-pic_names2" name="' + friend_name + '" id="a' + friend_id + '" onclick="javascript:manageF_clickFriends(this.id.substr(1));">' + friend_name + '</aside>';
                html_str += '</li>';
                jFriendList.append(html_str);
            }
            ajaxScrollbarElement(".manage-friends");
        }
        else jerror(getValueFromXMLTag(response, 'message'));
    });
}
function manageF_clickFriends(friendElementId){
    var jFriendElementImg = $("#" + friendElementId + ' img');
    var jFriendElementAside = $("#" + friendElementId).next('aside');
    if (jFriendElementImg.hasClass('setchoosed')){
        jFriendElementImg.removeClass('setchoosed');
        jFriendElementAside.css('border', '3px solid #FFF');
    }
    else{
        jFriendElementImg.addClass('setchoosed');
        jFriendElementAside.css('border', '3px solid red');
    }
}

function manageF_removeFriends(userConfirm){
    if (!userConfirm){
        jconfirm('Remove these friends?', 'manageF_removeFriends(true)');
        return false;
    }
    $.jNotify._close();
    var jMorepageFriendsElement = $(".manage-friends li");
    var self_chooseFriends = [];
    var counter_friend = 0;
    jMorepageFriendsElement.each(function(){
        var jFriendImage = $(this).find('img.morepage-friend-thumb');
        if (jFriendImage.hasClass('setchoosed')){
            var morepage_friendId = ($(this).find('figure').attr('id').replace('manageF-', ''));
            self_chooseFriends[counter_friend++] = {tag: 'friend_id', value: morepage_friendId};
        }
    });

    if (self_chooseFriends.length == 0){
        jerror('Please choose friend to remove');
        return false;
    }

    var params = [
        {tag: 'user_id', value: $("input[name=user_id]").val()},
        {tag: 'friend_ids', value: self_chooseFriends}
    ];
    ajaxRequest('removefriends', params, function(response){
        if (getValueFromXMLTag(response, 'status') == 'Success'){
            jsuccess(getValueFromXMLTag(response, 'message'));
            setTimeout(function(){
                listFriends();
            }, 2000);
        }
        else jerror(getValueFromXMLTag(response, 'message'));
    });
}

function manageF_resetChooseFriends(){
    var jMorepageFriendsElement = $(".manage-friends li");
    jMorepageFriendsElement.each(function(){
        $(this).find('img.morepage-friend-thumb').removeClass('setchoosed');
        $(this).find('aside').css('border', '3px solid #FFF');
    });
}