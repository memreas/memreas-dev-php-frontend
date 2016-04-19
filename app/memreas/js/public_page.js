/**
 * Copyright (C) 2016 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
var objArr;
$(document).ready(function() {
    $.fetchPublic();
});

// Display page loading screen
this.putPageLoading = function() {
    $('#loadingpopup').fadeIn(200);
}

// Remove page loading screen
this.removePageLoading = function() {
    $('#loadingpopup').fadeOut(200);
}

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
		if (getValueFromXMLTag(response, 'status') == "Success") {
		    var events = getSubXMLFromTag(response, 'event');
		    if (events.length > 0) {

			/**
			 * Fetch events array
			 */
			var eventObj = {};
			objArr = [];
			var linksContainer = [];
			var event_count = events.length;
			for (var i = 0; i < event_count; i++) {
			    var event = events[i].innerHTML;
			    // console.log("event--->" + event);
			    var event_media;
			    // console.log('Event Tag Iterate -->' + friend);
			    eventObj.event_creator = $(event).filter(
				    'event_creator').html();
			    eventObj.event_id = $(event).filter('event_id')
				    .html();

			    console.log("eventObj.event_id--->"
				    + eventObj.event_id);
			    eventObj.event_name = $(event).filter('event_name')
				    .text();
			    eventObj.event_like_total = $(event).filter(
				    'event_like_total').html();
			    eventObj.event_comment_total = $(event).filter(
				    'event_comment_total').html();
			    eventObj.profile_img = $(event).filter(
				    'profile_pic_79x80').html();
			    eventObj.profile_img = removeCdataCorrectLink(eventObj.profile_img);
			    // eventObj.friend_row = 'friendPublic-' +
			    // eventObj.creator_id;
			    eventObj.event_creator = $(event).filter(
				    'event_creator').html();
			    eventObj.event_name = $(event).filter('event_name')
				    .html();

			    // HTML for profile section
			    // start adding to html
			    var listItem = '';
			    var links = '#links' + i;
			    listItem += '<li>';
			    listItem += '	<div class="event_section">';
			    listItem += '		<section class="row-fluid clearfix">';
			    listItem += '			<figure class="pro-pics2">';
			    listItem += '				<img class="public-profile-img" src="'
				    + eventObj.profile_img + '" alt="">';
			    listItem += '			</figure>';
			    listItem += '			<aside class="pro-names2" style="margin-top: 0px;">@'
				    + eventObj.event_creator
				    + ' : !'
				    + eventObj.event_name + '</aside>';
			    listItem += '			<a href="javascript:;" title="Like media" class="memreas-detail-likecount" style="margin-left: 10px;">';
			    listItem += '				<img src="/memreas/img/like.png" alt="">';
			    listItem += '			</a>';
			    listItem += '			<span style="position: relative; top: -10px; left: -17px; color: #fff;">'
				    + eventObj.event_like_total + '</span>';
			    listItem += '			<a href="javascript:;" title="Comment" style="position: relative; top: 5px;">';
			    listItem += '				<img src="/memreas/img/comment.png" alt="">';
			    listItem += '			</a>';
			    listItem += '			<span style="position: relative; top: -8px; left: -19px; color: #fff;">'
				    + eventObj.event_comment_total + '</span>';
			    listItem += '			<div style="clear: both;"></div>';
			    // for loop here for images
			    listItem += '			<div id="links' + i
				    + '" class="links' + i + '"></div>';
			    listItem += '			<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls" data-start-slideshow="false">';
			    listItem += '				<div class="slides"></div>';
			    listItem += '				<h3 class="title"></h3>';
			    listItem += '				<a class="prev">‹</a> <a class="next">›</a> <a class="close">×</a>';
			    listItem += '			</div>';
			    // end for loop here for images
			    listItem += '			<div style="clear: both;"></div>';
			    listItem += '		</section>';
			    listItem += '		<div id="viewport" class="mouse_swip" onselectstart="return false;">';
			    listItem += '			<div id="friendPublic-' + i
				    + '" class="swipeclass"></div>';
			    listItem += '		</div>';
			    listItem += '	</div>';
			    listItem += '</li>';

			    $("#public_list").append(listItem);
			    $('#blueimp-gallery').hide();

			    // Now populate with media
			    // media for loop
			    var event_metadata = $(event).filter(
				    'event_metadata').html();
			    var event_price = 0;
			    if (typeof (event_metadata) != 'undefined') {
				try {
				    console.log("event_metadata --> "
					    + event_metadata);
				    event_metadata = JSON.parse(event_metadata);
				} catch (e) {
				    console.log("metadata parse error--->" + e);
				}
				event_price = event_metadata.price;
				console.log("PRICE IS > 0 :: price --> "
					+ event_price);
			    } else {
				event_price = 0;
			    }

			    var event_media_array = [];
			    var event_medias = getSubXMLFromTag(events[i],
				    'event_media');
			    var event_media_count = event_medias.length;
			    console.log("event_media_count ---> "
				    + event_media_count);
			    console.log("event_medias ---> "
				    + JSON.stringify(event_medias));

			    var linksContainerData = '';
			    for (var j = 0; j < event_media_count; j++) {
				var event_media_entry = {};
				var event_media = event_medias[j];

				// console.log("event_media ---> " +
				// JSON.stringify(event_media));
				event_media_entry.event_media_name = getValueFromXMLTag(
					event_media, 'event_name');

				event_media_entry.event_media_id = getValueFromXMLTag(
					event_media, 'event_media_id');
				event_media_entry.event_media_image = removeCdataCorrectLink(getValueFromXMLTag(
					event_media, 'event_media_448x306'));

				console
					.log('event_media_entry.event_media_image-->'
						+ event_media_entry.event_media_image);

				event_media_entry._event_media_type_ = getValueFromXMLTag(
					event_media, 'event_media_type');
				event_media_entry.event_media_url = removeCdataCorrectLink(getValueFromXMLTag(
					event_media, 'event_media_url'));
				event_media_entry.event_media_image = removeCdataCorrectLink(event_media_entry.event_media_image);
				event_media_entry.event_media_url_hls = removeCdataCorrectLink(getValueFromXMLTag(
					event_media, 'event_media_url_hls'));
				event_media_entry.event_media_url_web = removeCdataCorrectLink(getValueFromXMLTag(
					event_media, 'event_media_url_web'));
				event_media_array[j] = event_media_entry;

				//
				// Setup blueimp
				//
				var item = new Object();
				console
					.log("event_media_entry._event_media_type_--->"
						+ event_media_entry._event_media_type_);
				if (event_media_entry._event_media_type_ == 'video') {
				    item['title'] = event_media_entry.event_media_id;
				    item['type'] = "video/*";
				    item['poster'] = event_media_entry.event_media_image;
				    item['sources'] = [
					    {
						href : event_media_entry.event_media_url_hls,
						type : "application/x-mpegurl"
					    },
					    {
						href : event_media_entry.event_media_url_web,
						type : "video/mp4"
					    } ];

				    linksContainerData += '<a href="'
					    + event_media_entry.event_media_url_web
					    + '"';
				    linksContainerData += ' title="'
					    + event_media_entry.event_media_id
					    + '"';
				    linksContainerData += ' type="video/mp4" data-gallery="'
					    + event_media_entry.event_media_id
					    + '" class="blueimp-gallery-thumb-anchor "';
				    if (event_price > 0) {
					linksContainerData += ' style="background:url('
						+ event_media_entry.event_media_image
						+ ')"><span class="sell-event-buyme">buy</span></a>';
				    } else {
					linksContainerData += ' style="background:url('
						+ event_media_entry.event_media_image
						+ ')"><span class="video-content-play-icon"></span></a>';
				    }

				} else {
				    item['title'] = event_media_entry.event_media_id;
				    item['type'] = "image/jpeg";
				    item['href'] = event_media_entry.event_media_url;
				    item['poster'] = event_media_entry._media_thumbnail_large;

				    linksContainerData += '<a href="'
					    + event_media_entry.event_media_url
					    + '" title="'
					    + event_media_entry.event_media_id
					    + '" data-gallery="'
					    + event_media_entry.event_media_id
					    + '" class="blueimp-gallery-thumb-anchor"';
				    if (event_price > 0) {
					linksContainerData += ' style="background:url('
						+ event_media_entry.event_media_image
						+ ')"><span class="sell-event-buyme">buy</span></a>';
				    } else {
					linksContainerData += ' style="background:url('
						+ event_media_entry.event_media_image
						+ ')"><span></span></a>';
				    }

				}
				console.log("item" + JSON.stringify(item));
				objArr.push(item);
			    }// end event for loop
			    //
			    // Set blueimp array
			    //
			    // linksContainer[i] = linksCo;
			    console.log("linksContainerData--->"
				    + JSON.stringify(linksContainerData));
			    $(links).append(linksContainerData);
			    // console.log("html " + links + "--->" +
			    // $(links).innerHTML);

			    var event_friends = getSubXMLFromTag(events[i],
				    'event_friends');
			    var event_friend = getSubXMLFromTag(event,
				    'event_friend');
			    var event_friend_count = event_friend.length;
			    var event_friend_count = event_friend.length;
			    var event_friend_string = "";
			    var event_friend_array = [];
			    // events loop
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
				event_friend_entry.event_friend_url_image = removeCdataCorrectLink(event_friend_entry.event_friend_url_image);
				event_friend_array[k] = event_friend_entry;
			    } // end for friends
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
    // console.log("objArr.length-->"+objArr.length);
    for (i = 0; i < objArr.length; i++) {
	obj = objArr[i];
	if (selected_media_id == obj['title']) {
	    break;
	}
    }
    return blueimp.Gallery([ obj ], {
	container : '#blueimp-gallery',
	carousel : true
    });
});
