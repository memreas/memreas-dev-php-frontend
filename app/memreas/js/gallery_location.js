/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
var location_media_id = '';
gallery_showGoogleMap = function(div_id) {
	// For default map loading
    	console.log("enter gallery_showGoogleMap...");
	gallery_initGoogleMap(div_id, 0, 0);
}

// initialize the google map.
gallery_initGoogleMap = function(div_id, mediaLng, mediaLat) {
	console.log("enter gallery_initGoogleMap div_id:"+div_id+" mediaLat:"+mediaLat+" mediaLng:"+mediaLng);
	if (location_map == null || typeof location_map == "undefined") {
		var latlng = new google.maps.LatLng(mediaLat, mediaLng);
		var image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';
		var map_zoom = 12;

		
		// set base zoom
		if ((mediaLat == 0) && (mediaLng == 0)) {
		    map_zoom = 4;
		}

		// create the google map object.
		var mapOptions = {
			center : new google.maps.LatLng(mediaLat, mediaLng),
			zoom : map_zoom,
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
		};
		console.log ("latlng--->" + latlng);
		var location_map = new google.maps.Map(document.getElementById(div_id),
				mapOptions);
		var marker = new google.maps.Marker({
			map : location_map,
			position : latlng,
			icon : image,
			draggable : true,
			animation : google.maps.Animation.DROP,
		});


		console.log("enter location_map latlng:"+latlng);
		
		//
		// Auto complete section
		// set the search text field as auto-complete.
		//
		var input = document.getElementById('txt_gallery_address');
		var autocomplete = new google.maps.places.Autocomplete(input, {
			types : [ "geocode" ]
		});
		autocomplete.bindTo('bounds', location_map);
		var infowindow = new google.maps.InfoWindow();
		location_map.setCenter(new google.maps.LatLng(mediaLat, mediaLng));
		location_map.setZoom(map_zoom);

		console.log("enter location_map latlng:"+latlng);
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
				location_map.setZoom(map_zoom);
			}

			var newPlace = place.geometry.location;

			newLocation = [ {
				tag : 'lat',
				value : newPlace.lat()
			}, {
				tag : 'lng',
				value : newPlace.lng()
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
			console.log("enter moveMarker(placeName: " + placeName + " , latlng): "+latlng);

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