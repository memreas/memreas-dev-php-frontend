/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
var location_media_id = '';
gallery_showGoogleMap = function(div_id) {
	// For default map loading
	gallery_initGoogleMap(div_id, 44.88623409320778, -87.86480712897173);
}

// initialize the google map.
gallery_initGoogleMap = function(div_id, mediaLat, mediaLng) {
	if (location_map == null || typeof location_map == "undefined") {
		var lat = mediaLat, lng = mediaLng, latlng = new google.maps.LatLng(
				lat, lng), image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';

		// create the google map object.
		var mapOptions = {
			center : new google.maps.LatLng(lat, lng),
			zoom : 13,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			panControl : true,
			panControlOptions : {
				position : google.maps.ControlPosition.TOP_RIGHT
			},
			zoomControl : true,
			zoomControlOptions : {
				style : google.maps.ZoomControlStyle.LARGE,
				position : google.maps.ControlPosition.TOP_left
			}
		}, location_map = new google.maps.Map(document.getElementById(div_id),
				mapOptions), marker = new google.maps.Marker({
			position : latlng,
			map : location_map,
			icon : image,
			draggable : true,
			animation : google.maps.Animation.DROP,
		});

		// set the search text field as auto-complete.
		var input = document.getElementById('txt_gallery_address');
		var autocomplete = new google.maps.places.Autocomplete(input, {
			types : [ "geocode" ]
		});

		autocomplete.bindTo('bounds', location_map);
		var infowindow = new google.maps.InfoWindow();

		location_map.setCenter(new google.maps.LatLng(lat, lng));
		location_map.setZoom(17);

		var newLocation = [ {
			tag : 'lat',
			value : mediaLat
		}, {
			tag : 'lng',
			value : mediaLng
		} ];

		google.maps.event.addListener(autocomplete, 'place_changed', function(
				event) {
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

			var newPlace = place.geometry.location;
			var LAT = '';
			for (var i = 0; i <= 4; i++) {
				switch (i) {
				case 0:
					LAT = newPlace.A;
					break;
				case 1:
					LAT = newPlace.B;
					break;
				case 2:
					LAT = newPlace.C;
					break;
				case 4:
					LAT = newPlace.D;
					break;
				}
				if (typeof (LAT) != 'undefined')
					break;
			}
			var LNG = newPlace.k;

			newLocation = [ {
				tag : 'lat',
				value : LAT
			}, {
				tag : 'lng',
				value : LNG
			} ];
			console.log(newLocation);

			moveMarker(place.name, place.geometry.location);
		});

		google.maps.event.addListener(marker, 'dragend', function(event) {
			newLocation = [ {
				tag : 'lat',
				value : event.latLng.A
			}, {
				tag : 'lng',
				value : event.latLng.k
			} ];
		});

		$("#btn_gallerymap_ok").bind(
				"click",
				function() {
					jconfirm('Update this location for this media?',
							'gallery_updateLocation(\'' + location_media_id
									+ '\', ' + newLocation[0].value + ', '
									+ newLocation[1].value + ')');
				});

		$(".img-gallery")
				.click(
						function() {
							var selected_id = $(this).attr("id").replace(
									'location', '');
							location_media_id = selected_id;

							// Get media detail location data
							var params = [ {
								tag : 'media_id',
								value : selected_id
							} ];
							ajaxRequest(
									'viewmediadetails',
									params,
									function(response) {
										var mediaLocationLat = getValueFromXMLTag(
												response, 'latitude');
										var mediaLocationLng = getValueFromXMLTag(
												response, 'longitude');
										var address = getValueFromXMLTag(
												response, 'address');
										if (mediaLocationLat == ''
												|| mediaLocationLng == '')
											jerror('This media has no location, you can set it by typing it\'s address and hit update');
										else {
											$("#gallery-location").empty();
											gallery_initGoogleMap(
													"gallery-location",
													Number(mediaLocationLng),
													Number(mediaLocationLat));
											$("#txt_gallery_address").val(
													address);
										}
									});
						});

		function moveMarker(placeName, latlng) {
			marker.setIcon(image);
			marker.setPosition(latlng);
			infowindow.setContent(placeName);
		}
	}
}

function gallery_updateLocation(galleryId, latitude, longitude) {
	if (galleryId == '') {
		$.jNotify._close();
		jerror('Please choose gallery');
		return false;
	}
	var params = [ {
		tag : 'media',
		value : [ {
			tag : 'media_id',
			value : galleryId
		}, {
			tag : 'location',
			value : [ {
				tag : 'latitude',
				value : latitude.toString()
			}, {
				tag : 'longitude',
				value : longitude.toString()
			}, {
				tag : 'address',
				value : $("#txt_gallery_address").val()
			} ]
		} ]
	} ];
	addLoading('.gallery-address-box', 'input', '');
	disableButtons('.gallery-address-box');
	ajaxRequest('updatemedia', params, function(response) {
		if (getValueFromXMLTag(response, 'status') == 'Success') {
			jsuccess(getValueFromXMLTag(response, 'message'));
			removeLoading('.gallery-address-box');
			enableButtons('.gallery-address-box');
		} else
			jerror(getValueFromXMLTag(response, 'message'));
	}, 'undefined', true);
}