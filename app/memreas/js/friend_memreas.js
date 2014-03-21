var mr_friendsInfo = null;
memreas_getFriendList = function(){
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
            share_addFriends(mr_friendsInfo);
        }
    });
}