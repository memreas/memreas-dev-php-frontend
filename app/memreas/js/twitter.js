/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

var TWITTER_USER 		= 'nationbreaking';
var TWITTER_KEY 		= 'yitls5wGmy5fLD4nJakhvA';
var TWITTER_SECRETCODE 	= '7gKsovGBPEdTcmjVXLaxrBzlJDVSiNYVwtFcmijALQ';

var twitterToken = null;

twitter_init = function() {
	var tKBase64 =  btoa(TWITTER_KEY + ":" + TWITTER_SECRETCODE);
		
	send = $.ajax({
		beforeSend: function (xhr, settings) {
			xhr.withCredentials = true;
			xhr.setRequestHeader('Authorization', 'Basic ' + tKBase64);
		},
		type: "POST",
		data: { "grant_type" : "client_credentials"},
		url: 'https://api.twitter.com/oauth2/token',
		success: function(data) {
			twitterToken = data.access_token;
			//start twitter update
			setInterval(twitterUpdate, 5 * 60 * 1000); //update once in 5 minutes
			twitterUpdate(); //update now
		}
	});
}
		
twitter_getFriendList = function() {
	if (twitterToken != null)
	{
		$.ajax({
			beforeSend: function (xhr, settings) {
				xhr.withCredentials = true;
				xhr.setRequestHeader('Authorization', 'Bearer ' + twitterToken);
			},
			type: "GET",
			data: { "q": 'from:' + TWITTER_USER, 'count': 3, 'result_type': 'recent'},
			//url: 'https://api.twitter.com/1.1/search/tweets.json',
			url: 'https://api.twitter.com/1.1/followers/ids.json?cursor=-1&user_id=nationbreaking&count=5000',
			success: function(data) {
				//console.log(data);
				var stses = data.statuses;
				var text = "";
				for(var i = 0; i < stses.length; i++) {
					var sts = stses[i];
					text = text + "    <" + sts.text + ">";
				}
				
				console.log(text);
			}
		});
	}
}
