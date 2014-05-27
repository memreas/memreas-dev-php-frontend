var location_media_id = '';
gallery_showGoogleMap = function(div_id) {

    //For default map loading
    gallery_initGoogleMap(div_id, 44.88623409320778, -87.86480712897173);
}

// initialize the google map.
gallery_initGoogleMap = function(div_id, mediaLat, mediaLng) {
    if (location_map == null || typeof location_map == "undefined") {
         var lat = mediaLat,
             lng = mediaLng,
             latlng = new google.maps.LatLng(lat, lng),
             image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';

         // create the google map object.
         var mapOptions = {
             center: new google.maps.LatLng(lat, lng),
             zoom: 13,
             mapTypeId: google.maps.MapTypeId.SATELLITE,
             panControl: true,
             panControlOptions: {
                 position: google.maps.ControlPosition.TOP_RIGHT
             },
             zoomControl: true,
             zoomControlOptions: {
                 style: google.maps.ZoomControlStyle.LARGE,
                 position: google.maps.ControlPosition.TOP_left
             }
         },
         location_map = new google.maps.Map(document.getElementById(div_id), mapOptions),
         marker = new google.maps.Marker({
             position: latlng,
             map: location_map,
             icon: image
         });

         // set the search text field as auto-complete.
         var input = document.getElementById('txt_gallery_address');
         var autocomplete = new google.maps.places.Autocomplete(input, {
             types: ["geocode"]
         });

         autocomplete.bindTo('bounds', location_map);
         var infowindow = new google.maps.InfoWindow();

         google.maps.event.addListener(autocomplete, 'place_changed', function (event) {
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
             newLocation = [
                                {tag: 'lat', value: place.geometry.location.k},
                                {tag: 'lng', value: place.geometry.location.A}
                            ];
             moveMarker(place.name, place.geometry.location);
         });

         $("#btn_gallerymap_ok").bind("click", function(){
             jNotify(
                '<div class="notify-box"><p>Update this location for this media?</p><a href="javascript:;" class="btn" onclick="gallery_updateLocation(\'' + location_media_id + '\', ' + newLocation[0].value + ', ' + newLocation[1].value + ');">OK</a>&nbsp;<a href="javascript:;" class="btn" onclick="$.jNotify._close();">Close</a></div>',
                {
                  autoHide : false, // added in v2.0
                  clickOverlay : true, // added in v2.0
                  MinWidth : 250,
                  TimeShown : 3000,
                  ShowTimeEffect : 200,
                  HideTimeEffect : 0,
                  LongTrip :20,
                  HorizontalPosition : 'center',
                  VerticalPosition : 'top',
                  ShowOverlay : true,
                  ColorOverlay : '#FFF',
                  OpacityOverlay : 0.3,
                  onClosed : function(){ },
                  onCompleted : function(){ }});
         });

         function moveMarker(placeName, latlng) {
             marker.setIcon(image);
             marker.setPosition(latlng);
             infowindow.setContent(placeName);
         }
    }
}

function openMediaLocation(locationGalleryId){
    var selected_id = locationGalleryId.replace('location', '');
    location_media_id = selected_id;

    //Get media detail location data
    var params = [{tag: 'media_id', value: selected_id}];
    ajaxRequest('viewmediadetails', params, function(response){
        var mediaLocation = getValueFromXMLTag(response, 'location');
        var mediaLocationLat = $(mediaLocation).wrap('latitude')[0].innerHTML;
        var mediaLocationLng = $(mediaLocation).wrap('longitude')[0].innerHTML;
        if (mediaLocationLat == '' || mediaLocationLng == '')
            jerror('This media has no location, you can set it by typing it\' address and hit update');
        else gallery_initGoogleMap("gallery-location", mediaLocationLat, mediaLocationLng);
    });
}

function gallery_updateLocation(galleryId, latitude, longtitude){
    var params = [
                    {tag: 'media_id', value: galleryId},
                    {tag: 'location', value: [
                            {tag: 'latitude', value: latitude.toString()},
                            {tag: 'longtitude', value: longtitude.toString()}
                        ]}
                ];
    ajaxRequest('updatemedia', params, function(response){
        if (getValueFromXMLTag(response, 'status') == 'Success')
            jsuccess(getValueFromXMLTag(response, 'message'));
        else jerror(getValueFromXMLTag(response, 'message'));
    });
}