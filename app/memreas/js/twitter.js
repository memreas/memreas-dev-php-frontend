/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

var TWITTER_USER 		= 'FranzPolar';

if (GLOBAL_ENV == 'development'){
    var TWITTER_KEY 		= '1bqpAfSWfZFuEeY3rbsKrw';
    var TWITTER_SECRETCODE 	= 'wM0gGBCzZKl5dLRB8TQydRDfTD5ocf2hGRKSQwag';
}else{
    var TWITTER_KEY         = 'vKv8HUdQ4OP2mClSuOqtjA';
    var TWITTER_SECRETCODE  = '0pc7NHkFsCVYn86xLLZAhzU87yY184vhMZFnjKwzwXo';
}

var twitterToken = null;
var tw_friendsInfo = null;
var tw_friendCount = 0;
var tw_friendIndex = 0;


twitter_getFriendList = function() {
	$('#loadingpopup').show();
	twitter_authorization();
}

twitter_authorization = function() {
    $.removeCookie ('twitter_friends');
	$.oauthpopup({
		path: 'twitter',
		callback: function(){
            twitter_getAllFriends();
		}
	});
	return;

	var tKBase64 =  btoa(TWITTER_KEY + ":" + TWITTER_SECRETCODE);

	try {
		send = $.ajax({
			beforeSend: function (xhr, settings) {
				xhr.withCredentials = true;
				xhr.setRequestHeader('Authorization', 'Basic ' + tKBase64);
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
			},
			type: "POST",
            forceIframeTransport: true,
			data: { "grant_type" : "client_credentials"},
			url: 'https://api.twitter.com/oauth2/token',
			//url: 'https://api.twitter.com/oauth/request_token',
			success: function(data) {
				twitterToken = data.access_token;
				twitter_getAllFriends();
                $('#loadingpopup').hide();
			},
			fail: function(data) {
				console.log(data);
				$('#loadingpopup').hide();
			}
		});
	} catch (e) {
		$('#loadingpopup').hide();
	}
}

twitter_getAllFriends = function() {
    var friend_list = $.cookie ('twitter_friends');
    if (typeof (friend_list) == 'undefined'){
        $('#loadingpopup').hide();
        jerror ('authentication failed! please try again');
        return false;
    }
    friend_list = JSON.parse (friend_list);
    tw_friendsInfo = friend_list;
    share_addFriends (friend_list);
    $('#loadingpopup').hide();
    return;
	if (twitterToken != null)
	{
		$.ajax({
			beforeSend: function (xhr, settings) {
				xhr.withCredentials = true;
				xhr.setRequestHeader('Authorization', 'Bearer ' + twitterToken);
			},
			type: "GET",
			url: 'https://api.twitter.com/1.1/friends/ids.json?cursor=-1&screen_name=' + TWITTER_USER + '&count=5000',
			success: function(data) {
				tw_friendsInfo = [];
				tw_friendIndex = 0;
				tw_friendCount = data.ids.length;
				for(var i = 0; i < data.ids.length; i++) {
					var appourl = 'https://api.twitter.com/1.1/users/lookup.json?user_id=' + data.ids[i] + '&include_entities=true';
					$.ajax({
						beforeSend: function (xhr, settings) {
							xhr.withCredentials = true;
							xhr.setRequestHeader('Authorization', 'Bearer ' + twitterToken);
						},
						type: "GET",
						//data: { "q": 'from:' + TWITTER_USER, 'count': 3, 'result_type': 'recent'},
						//url: 'https://api.twitter.com/1.1/search/tweets.json',
						url: appourl,
						success: function(friend_data) {
							tw_friendsInfo[tw_friendIndex] = {
								'id': 		friend_data[0].id,
								'div_id':	'tw_' + tw_friendIndex,
								'name': 	friend_data[0].name,
								'photo': 	friend_data[0].profile_image_url_https,
								'selected':	false
							}
							tw_friendIndex++;
							if (tw_friendIndex >= tw_friendCount) {
								share_addFriends(tw_friendsInfo);
								$('#loadingpopup').hide();
							}
						}
					});
				}
			},
			fail: function(data) {
				console.log(data);
				$('#loadingpopup').hide();
			}
		});
	}
	else $('#loadingpopup').hide();
}