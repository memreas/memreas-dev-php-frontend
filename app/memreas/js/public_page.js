/**
 * Copyright (C) 2016 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */

$(document).ready(function() {
    $.fetchPublic();
});

jQuery.fetchPublic = function() {
    console.log("Inside jQuery.fetchPublic");
    var verticalHeight = window.innerHeight;
    var HorizontalWidth = window.innerWidth;

    ajaxRequest(
	    'viewevents',
	    [ {
		tag : 'public',
		value : 'public'
	    }, {
		tag : 'is_my_event',
		value : '0'
	    }, {
		tag : 'is_friend_event',
		value : '0'
	    }, {
		tag : 'is_public_event',
		value : '1'
	    }, {
		tag : 'public_page',
		value : '1'
	    }, {
		tag : 'page',
		value : '1'
	    }, {
		tag : 'limit',
		value : '100'
	    } ],
	    function(response) {

		console.log("viewevents response-->" + response);

		if (getValueFromXMLTag(response, 'status') == "Success") {
		    var friends = getSubXMLFromTag(response, 'event');
		    if (friends.length > 0) {
			
			/**
			 * Fetch Friends array
			 */
			var event = {};
			var objArr = [];
			var linksContainer = [];
			var friend_count = friends.length;
			for (var i = 0; i < friend_count; i++) {
			    var friend = friends[i].innerHTML;
			    var event_media = [];
			    console.log('Event Tag Iterate -->' + friend);
			    event.creator_id = $(friend).filter(
				    'event_creator_user_id').html();
			    event.event_id = $(friend).filter('event_id')
				    .html();
			    event.event_name = $(friend).filter('event_name')
				    .html();
			    event.event_like_total = $(friend).filter(
				    'event_like_total').html();
			    event.event_comment_total = $(friend).filter(
				    'event_comment_total').html();
			    event.profile_img = $(friend).filter(
				    'profile_pic_79x80').html();
			    event.profile_img = removeCdataCorrectLink(event.profile_img);
			    event.friend_row = 'friendPublic-' + event.creator_id;
			    event.event_creator = $(friend).filter(
				    'event_creator').html();
			    event.event_name = $(friend).filter('event_name')
				    .html();

			    var event_media = getSubXMLFromTag(friends[i],
				    'event_media');
			    var event_media_count = event_media.length;
			    // var StrMedia = '<div
			    // style="clear:both;"></div><ul
			    // class="event-pics">';
			    var event_metadata = getValueFromXMLTag(friends[i],
				    'event_metadata');
			    if (typeof (event_metadata) != 'undefined') {
				event_metadata = JSON.parse(event_metadata);
				var event_price = event_metadata.price;
			    } else {
				var event_price = 0;
			    }

			    //HTML for profile section
			    //start adding to html
			    var listItem = '';
			    var links = '#links' + i;
			    listItem += '<li>';
			    listItem += '	<div class="event_section">';
			    listItem += '		<section class="row-fluid clearfix">';
			    listItem += '			<figure class="pro-pics2">';
			    listItem += '				<img class="public-profile-img" src="' + event.profile_img + '" alt="">';
			    listItem += '			</figure>';
			    listItem += '			<aside class="pro-names2" style="margin-top: 0px;">@' + event.event_creator + ' : !' + event.event_name + '</aside>';
			    listItem += '			<a href="javascript:;" title="Like media" class="memreas-detail-likecount" style="margin-left: 10px;">';
			    listItem += '				<img src="/memreas/img/like.png" alt="">';
			    listItem += '			</a>';
			    listItem += '			<span style="position: relative; top: -10px; left: -17px; color: #fff;">' + event.event_like_total + '</span>';
			    listItem += '			<a href="javascript:;" title="Comment" style="position: relative; top: 5px;">';
			    listItem += '				<img src="/memreas/img/comment.png" alt="">';
			    listItem += '			</a>';
			    listItem += '			<span style="position: relative; top: -8px; left: -19px; color: #fff;">' + event.event_comment_total + '</span>';
			    listItem += '			<div style="clear: both;"></div>';
			    // for loop here for images
			    listItem += '			<div id="links" class="links' + i + '"></div>';
			    listItem += '				<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls" data-start-slideshow="false">';
			    listItem += '				<div class="slides"></div>';
			    listItem += '				<h3 class="title"></h3>';
			    listItem += '				<a class="prev">‹</a> <a class="next">›</a> <a class="close">×</a>';
			    listItem += '			</div>';
			    // end for loop here for images
			    listItem += '			<div style="clear: both;"></div>';
			    listItem += '		</section>';
			    listItem += '		<div id="viewport" class="mouse_swip" onselectstart="return false;">';
			    listItem += '			<div id="friendPublic-d94e8835-5379-4c55-bbc4-3c3028c433bc" class="swipeclass"></div>';
			    listItem += '		</div>';
			    listItem += '	</div>';
			    listItem += '</li>';
			    
			    linksContainer[i] = $(links);
			    $("#public_list").append(listItem);
			    
			    //Now populate with media
			    // media for loop
			    var event_media_array = [];
			    var event_friends = getSubXMLFromTag(friends[i],
				    'event_friends');
			    var event_friend = getSubXMLFromTag(event_friends,
				    'event_friend');
			    var linksContainerData = [];
			    for (var j = 0; j < event_media_count; j++) {
				var event_media_entry = {};
				var event_media = event_media[j];
				event_media_entry.event_media_id = getValueFromXMLTag(
					event_media, 'event_media_id');
				event_media_entry.event_media_image = getValueFromXMLTag(
					event_media, 'event_media_448x306');
				event_media_entry.event_media_url = getValueFromXMLTag(
					event_media, 'event_media_url');
				event_media_entry.event_media_image = removeCdataCorrectLink(event_media_entry.event_media_image);
				event_media_entry._event_media_type_ = getValueFromXMLTag(
					event_media, 'event_media_type');
				event_media_entry.event_media_url_hls = getValueFromXMLTag(
					event_media, 'event_media_url_hls');
				event_media_entry.event_media_url_web = getValueFromXMLTag(
					event_media, 'event_media_url_web');
				event_media_array[j] = event_media_entry;

				//
				// Setup blueimp
				//
				var item = new Object();
				if (event_media_entry._event_media_type_ == 'video') {
				    item['title'] = event_media_entry.event_media_id;
				    item['type'] = "video/*";
				    item['poster'] = event_media_entry.event_media_image;
				    item['sources'] = [ {
					href : event_media_entry.event_media_url_hls,
					type : "application/x-mpegurl"
				    }, {
					href : event_media_entry.event_media_url_web,
					type : "video/mp4"
				    } ];

				    linksContainerData[i] += '<a href="'
					    + event_media_entry.event_media_url_web + '"';
				    linksContainerData[i] += ' title="' + event_media_entry.event_media_id
					    + '"';
				    linksContainerData[i] += ' type="video/mp4" data-gallery="'
					    + event_media_entry.event_media_id
					    + '" class="blueimp-gallery-thumb-anchor "';
				    linksContainerData[i] += ' style="background:url('
					    + event_media_entry.event_media_image
					    + ')"><span class="video-content-play-icon"></span></a>';

				} else {
				    item['title'] = event_media_entry.event_media_id;
				    item['type'] = "image/jpeg";
				    item['href'] = event_media_entry.event_media_url;
				    item['poster'] = event_media_entry.event_media_url;

				    linksContainerData[i] += '<a href="'
					    + event_media_entry.event_media_url
					    + '" title="'
					    + event_media_entry.event_media_id
					    + '" data-gallery="'
					    + event_media_entry.event_media_id
					    + '" class="blueimp-gallery-thumb-anchor"';
				    linksContainerData[i] += ' style="background:url('
					    + event_media_entry.event_media_image
					    + ')"><span></span></a>';

				}
				// console.log("item" + JSON.stringify(item));
				objArr.push(item);

			    }
			    //
			    // Set blueimp array
			    //
			    $(linksContainer).append(linksContainerData[i]);
			    $('#blueimp-gallery').hide();


			    var event_friend_count = event_friend.length;
			    var event_friend_string = "";
			    var event_friend_array = [];
			    // friends loop
			    for (var k = 1; k <= event_friend_count; k++) {
				var event_friend_entry = {};
				var event_friend_list = event_friend[k];
				event_friend_entry.event_friend_id = getValueFromXMLTag(
					event_friend_list, 'event_friend_id');
				event_friend_entry.event_friend_social_username = getValueFromXMLTag(
					event_friend_list,
					'event_friend_social_username');
				event_friend_entry.event_friend_url_image = getValueFromXMLTag(
					event_friend_list,
					'event_friend_url_image');
				event_friend_entry.event_friend_url_image = removeCdataCorrectLink(event_friend_url_image);
				event_friend_array[k] = event_friend_entry;

			    }

			}// end for events.length
		    }
		} // end if

		return true;
	    });
    // add list items here for now...
    // console.log('addListItem() ---> ' + addListItem());
    
} // end fetchPublic

$(document).on('click', '[data-gallery]', function(event) {
    var id = $(this).data('gallery');
    var widget = $(id);
    var selected_media_id;
    var media_id;
    var obj;
    selected_media_id = widget.selector;
    console.log("objArr.length-->"+objArr.length);
    for (i=0; i<objArr.length; i++) {
	obj = objArr[i];
	if (selected_media_id == obj['title']) {
	    break;
	}
    }
    return blueimp.Gallery([obj], { container : '#blueimp-gallery', carousel : true});
});




