/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

var FACEBOOK_APPID 			= '642983449085789';
var FACEBOOK_SECRETCODE 	= '47bfc45d191ef7dda0e2ebbf43b70a64';
var FACEBOOK_FRIENDSLIMIT 	= 99;


sortMethod = function(a, b) {
	var x = a.name.toLowerCase();
	var y = b.name.toLowerCase();
	return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

facebook_getFriendList = function() {
	window.fbAsyncInit = function() {
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
					console.log(response.name);
					//userInfo.innerHTML = '<img src="https://graph.facebook.com/' + response.id + '/picture">' + response.name;
					//button.innerHTML = 'Logout';
				});

				// get friends
				FB.api('/me/friends?limit=' + FACEBOOK_FRIENDSLIMIT, function(response) {
					//var result_holder = document.getElementById('result_friends');
					var friend_data = response.data.sort(sortMethod);

					var results = '';
					for (var i = 0; i < friend_data.length; i++) {
						//results += '<div><img src="https://graph.facebook.com/' + friend_data[i].id + '/picture">' + friend_data[i].name + '</div>';
						console.log(friend_data[i].name);
					}

					// and display them at our holder element
					//result_holder.innerHTML = '<h2>Result list of your friends:</h2>' + results;
				});
			}
		}
		
		// run once with current status and whenever the status changes
		FB.getLoginStatus(getFacebookInfo);
		FB.Event.subscribe('auth.statusChange', getFacebookInfo);   
		
		FB.login(function(response) {
			if (response.authResponse) {
				//window.location.reload();
			}
		}, {scope:'email'});
		
	};
}