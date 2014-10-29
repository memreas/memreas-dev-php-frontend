var mr_friendsInfo = null;
memreas_getFriendList = function(){
    var params = [{tag: 'user_id', value: $("input[name=user_id]").val()}];
    ajaxRequest('listmemreasfriends', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
            var friends = getSubXMLFromTag(xml_response, 'friend');
            var friendCount = friends.length;
            mr_friendsInfo = [];
            for (i = 0;i < friendCount;i++){
                var friend = friends[i];
                if (getValueFromXMLTag(friend, 'photo') == '' || getValueFromXMLTag(friend, 'photo') == 'null')
                    var friend_photo = '/memreas/img/profile-pic.jpg';
                else var friend_photo = getValueFromXMLTag(friend, 'photo');
                friend_photo = removeCdataCorrectLink(friend_photo);
                mr_friendsInfo[i] = {
                                        'id': getValueFromXMLTag(friend, 'friend_id'),
                                        'div_id': 'mr_' + i,
                                        'name': getValueFromXMLTag(friend, 'friend_name'),
                                        'photo': friend_photo,
                                        'selected': false,
                                    };
            }
            share_addFriends(mr_friendsInfo);
            current_sharefriendnw_selected = 'memreas';
        }
        else {
            jerror('You have no friend on this network');
            $("#cmb_socialtype").val(current_sharefriendnw_selected);
        }
    });
}