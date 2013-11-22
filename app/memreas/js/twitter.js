/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////
/*
var TWITTER_USER 		= 'nationbreaking';
var TWITTER_KEY 		= 'yitls5wGmy5fLD4nJakhvA';
var TWITTER_SECRETCODE 	= '7gKsovGBPEdTcmjVXLaxrBzlJDVSiNYVwtFcmijALQ';
*/
var TWITTER_USER 		= 'nationbreaking';
var TWITTER_KEY 		= 'qIPCqlYRHip1chaY1tt0w';
var TWITTER_SECRETCODE 	= 'ofDFMhBUS12Di6HlB0Cb7rkiKc7X4zpv85m3tXaZ1wY';

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
			//setInterval(twitter_getFriendList, 5 * 60 * 1000); //update once in 5 minutes
			twitter_getFriendList(); //update now
		},
		fail: function(data) {
			console.log(data);
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
			//data: { "q": 'from:' + TWITTER_USER, 'count': 3, 'result_type': 'recent'},
			//url: 'https://api.twitter.com/1.1/search/tweets.json',
			url: 'https://api.twitter.com/1.1/friends/ids.json?cursor=-1&screen_name=twitterapi&count=5000',
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
