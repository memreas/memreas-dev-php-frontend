/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
/**
 * Upload - Sync - Download function
 */
jQuery.addfile = function() {
	var _source_action = "/index/s3upload";
	var _source_element = ".sync-content .upload";
	var _new_element = jQuery.randomElement();
	jQuery(_source_element).append(
			'<div class="row-choose-file" id="' + _new_element + '"></div>');
	jQuery("#" + _new_element).append(
			'<iframe src="' + _source_action
					+ '" width="550" height="120"></iframe>');
	jQuery("#" + _new_element)
			.append(
					'<div class="addmore" style="position: absolute; right: 100px; top: 10px;"><a href="javascript:addfile();" class="btn-addmore-file"><img src="/memreas/img/cloudadd.png" width="30" border="none"/></a> <a href="javascript:removeRow(\''
							+ _new_element
							+ '\');"><img src="/memreas/img/cloudremove.png" width="30" border="none"/></a></div>');
	return false;
}

// Generate random id element
jQuery.randomElement = function() {
	var random_number = Math.floor((Math.random() * 10000) + 1);
	var _element = "row-file-" + random_number;
	if (jQuery("#" + _element).length > 0)
		_final_element = jQuery.randomElement();
	_final_element = _element;
	return _final_element;
}
function addfile() {
	jQuery.addfile();
}
function removeRow(element_id) {
	jQuery("#" + element_id).remove();
}
function success_addmedia(response) {
	response = $.xml2json(response, true);
	response = response.addmediaeventresponse[0].status[0].text;
	if (response == "Success") {
		jSuccess('Media successfully added!', {
			autoHide : true, // added in v2.0
			clickOverlay : false, // added in v2.0
			MinWidth : 250,
			TimeShown : 3000,
			ShowTimeEffect : 200,
			HideTimeEffect : 200,
			LongTrip : 20,
			HorizontalPosition : 'center',
			VerticalPosition : 'top',
			ShowOverlay : true,
			ColorOverlay : '#FFF',
			OpacityOverlay : 0.3,
			onClosed : function() { // added in v2.0

			},
			onCompleted : function() { // added in v2.0

			}
		});
		$.fetch_server_media($("input[name=user_id]").val());
	} else {
	    console.log("error while adding media");
	}
}
function error_addmedia() {
}

var deleteMediasChecked = 0;
function deleteFiles(confirmed) {
	if (!($(".edit-area").find(".setchoosed").length > 0)) {
		jerror('There is no media selected');
		return false;
	}
	if (!confirmed) {
		// Confirm to delete
		jNotify(
				'<div class="notify-box"><p>Are you sure want to delete them?</p><a href="javascript:;" class="btn" onclick="deleteFiles(true);">OK</a>&nbsp;<a href="javascript:;" class="btn" onclick="$.jNotify._close();">Close</a></div>',
				{
					autoHide : false, // added in v2.0
					clickOverlay : true, // added in v2.0
					MinWidth : 250,
					TimeShown : 3000,
					ShowTimeEffect : 200,
					HideTimeEffect : 0,
					LongTrip : 20,
					HorizontalPosition : 'center',
					VerticalPosition : 'top',
					ShowOverlay : true,
					ColorOverlay : '#FFF',
					OpacityOverlay : 0.3,
					onClosed : function() { // added in v2.0

					},
					onCompleted : function() { // added in v2.0

					}
				});
	}
	if (confirmed) {
		$.jNotify._close();
		disableButtons('.edit-area');
		// Store data to javascript
		$(".edit-area a").each(function() {
			if ($(this).parent('li').hasClass("setchoosed")) {
				var media_id = $(this).attr("id");
				var xml_data = new Array();
				xml_data[0] = new Array();
				xml_data[0]['tag'] = 'mediaid';
				xml_data[0]['value'] = media_id.trim();

				// Put to management object
				++deleteMediasChecked;
			}
		});

		// Delete medias
		$(".edit-area a")
				.each(
						function() {
							if ($(this).parent('li').hasClass("setchoosed")) {
								var media_id = $(this).attr("id");
								var xml_data = new Array();
								xml_data[0] = new Array();
								xml_data[0]['tag'] = 'mediaid';
								xml_data[0]['value'] = media_id.trim();
								$(this)
										.parent('li')
										.find('a')
										.append(
												'<img src="/memreas/img/loading-line.gif" class="loading-small loading" />');

								ajaxRequest('deletephoto', xml_data,
										success_deletephoto, error_deletephoto,
										true);
							}
						});
	}
	return false;
}
function success_deletephoto(xml_response) {

	// If there is no more medias to be deleted, reload resources
	var media_id = getValueFromXMLTag(xml_response, 'media_id');
	$("#" + media_id).parents('li').remove();
	--deleteMediasChecked;
	if (deleteMediasChecked == 0) {
		pushReloadItem('listallmedia');
		jsuccess('Media deleted');
		ajaxScrollbarElement('.edit-areamedia-scroll');
		enableButtons('.edit-area');
	}
}
function error_deletephoto() {
	jerror("error delete photo");
}