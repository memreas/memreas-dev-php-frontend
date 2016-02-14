/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */

var uploadFilesInstance = []; // Used for store all file name for uploading
var currentUploadFileCount = 0; // Count for all current files selected for
// upload
var contentTypeOfFile = "";
var mimeTypeOfFile = "";
var media_id;
$(document)
		.ready(
				function() {

					// Check if IOS only allow 1 file per upload
					if (userBrowser[0].ios) {
						$(".media-upload").find("input[type=file]").removeAttr(
								'multiple');
					}

					var ellipsisCount = 1;
					var name = '';
					var hashName = '';

					$(".upload-dropzone").click(
							function() {
								$(".media-upload").find("input[type=file]")
										.trigger('click');
							});

					$('.media-upload')
							.each(
									function() {

										var form = $(".media-upload");

										$('.media-upload')
												.fileupload(
														{
															dropZone : $('.upload-from-event'),
															url : form
																	.attr('action'),
															dataType : 'xml',
															crossDomain : true,
															multiple : true,
															type : 'POST',
															autoUpload : true,
															maxFileSize : 5000000,
															add : function(
																	event, data) {
																var filename = data.files[0].name;
																filename = correctUploadFilename(filename);
																var filetype = data.files[0].type;
																// Get file size
																var file_size = data.files[0].size; // In
																// bytes

																if (userObject.plan == 'FREE') {
																	var limited_file_size = FREE_ACCOUNT_FILE_LIMIT * 1000000; // Convert
																	// to
																	// bytes
																	var limited_size_message = "Free account has been limited to "
																			+ FREE_ACCOUNT_FILE_LIMIT
																			+ " MB per upload";
																} else {
																	var limited_file_size = PAID_ACCOUNT_FILE_LIMIT * 1000000; // Convert
																	// to
																	// bytes
																	var limited_size_message = "File size has been limited to "
																			+ PAID_ACCOUNT_FILE_LIMIT
																			+ " MB per upload";
																}

																if (file_size > limited_file_size) {
																	jconfirm(
																			limited_size_message,
																			"$.jNotify._close();");
																	return false;
																}

																currentUploadFileCount = uploadFilesInstance.length;
																if (currentUploadFileCount > 10) {
																	jerror("Only allow to upload limited 10 files per session.");
																	return false;
																}

																/*-
																 * Check if current file with the same
																 * name is currently uploading
																 */
																for (var i = 0; i < currentUploadFileCount; i++) {
																	if (uploadFilesInstance[i] == filename) {
																		jerror('not allowed to upload same files at same time');
																		return false;
																	}
																}
																uploadFilesInstance[currentUploadFileCount] = filename;
alert("S3Upload calling tvm ...");
																$
																		.ajax({
																			url : "/index/fetchMemreasTVM",
																			type : 'GET',
																			dataType : 'json',
																			data : {
																				title : filename
																			},
																			/*-
																			 * send the file name to the server so it
																			 * can generate the key param
																			 */

																			async : false,
																			error : function(
																					jqXHR,
																					status,
																					thrownError) {
																				alert(jqXHR.status);
																				alert(jqXHR.responseText);
																				alert(status);
																				alert(thrownError);
																			},
																			success : function(
																					data) {
																				/*-
																				 * Now that we have our data, we update the form
																				 * so it contains all the needed data
																				 * to sign the request  
																				 */
																				media_id = data.media_id;
																				form
																						.find(
																								'input[name=key]')
																						.val(
																								data.media_id
																										+ '/'
																										+ filename);
																				form
																						.find(
																								'input[name=acl]')
																						.val(
																								data.acl);
																				form
																						.find(
																								'input[name=success_action_status]')
																						.val(
																								data.successStatus);
																				form
																						.find(
																								'input[name=policy]')
																						.val(
																								data.base64Policy);
																				form
																						.find(
																								'input[name=x-amz-algorithm]')
																						.val(
																								data.algorithm)
																				form
																						.find(
																								'input[name=x-amz-credential]')
																						.val(
																								data.credentials)
																				form
																						.find(
																								'input[name=x-amz-date]')
																						.val(
																								data.date)
																				form
																						.find(
																								'input[name=x-amz-expires]')
																						.val(
																								data.expires)
																				form
																						.find(
																								'input[name=x-amz-signature]')
																						.val(
																								data.signature)
																			}
																		});

																/*-
																 * Check here isfile is valid
																 * - matches checking on server
																 */
																var key_value = filename;
																var extension = filename
																		.substr((filename
																				.lastIndexOf('.') + 1));
																var is_valid = false;
																// Debugging
																// alert
																// ('extension::'+extension);
																console
																		.log('extension::'
																				+ extension);
																// End Debugging
																switch (extension
																		.toLowerCase()) {
																// image types
																// allowed
																case 'jpeg':
																	filetype = 'image';
																	is_valid = true;
																	break;
																case 'jpg':
																	filetype = 'image';
																	is_valid = true;
																	break;
																case 'png':
																	filetype = 'image';
																	is_valid = true;
																	break;
																case 'gif':
																	filetype = 'image';
																	is_valid = true;
																	break;

																// video types
																// allowed
																case 'mpeg':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'mp4':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'avi':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'mov':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case '3gp':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case '3gpp':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'mkv':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'mpg':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'avi':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'flv':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'wmv':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'divx':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'ogv':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'ogm':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'nut':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'vob':
																	filetype = 'video';
																	is_valid = true;
																	break;
																case 'vro':
																	filetype = 'video';
																	is_valid = true;
																	break;

																// audio types
																// allowed
																case 'mp3':
																	filetype = 'audio';
																	is_valid = true;
																	break;
																case 'wav':
																	filetype = 'audio';
																	is_valid = true;
																	break;
																case 'caf':
																	filetype = 'audio';
																	is_valid = true;
																	break;
																default:
																	jerror('file type is not allowed');
																}
																contentTypeOfFile = filetype;
																mimeTypeOfFile = filetype
																		+ '/'
																		+ extension
																				.toLowerCase()
																if (!is_valid) {
																	jerror('file type is not allowed');
																	return false;
																}

																if (filetype
																		.indexOf('image') >= 0)
																	var target = 'image';
																else
																	target = 'media';

																form
																		.find(
																				'input[name=Content-Type]')
																		.val(
																				filetype);
																var userid = $(
																		"input[name=user_id]")
																		.val();
																key_value = userid
																		+ '/'
																		+ media_id
																		+ '/'
																		+ correctUploadFilename('${filename}');
																$(this)
																		.find(
																				'input[name=key]')
																		.val(
																				key_value);
																// Use XHR,
																// fallback to
																// iframe
																options = $(
																		this)
																		.fileupload(
																				'option');
																use_xhr = !options.forceIframeTransport
																		&& ((!options.multipart && $.support.xhrFileUpload) || $.support.xhrFormDataFileUpload);

																if (!use_xhr) {
																	using_iframe_transport = true;
																}

																// For upload
																var class_upload = filename
																		.split('.');
																var tpl2 = $('<li class="working-upload upload-'
																		+ class_upload[0]
																		+ '">'
																		+ '<div class="upload_progress" id="table">'
																		+ '<div class="upload_progress_img">'
																		+ '<img src="/memreas/img/loading-line.gif" class="loading-small">'
																		+ '</div>'
																		+ '<div class="upload_progress_bar">'
																		+ '<span></span><div class="progress"></div>'
																		+ '</div><div class="progress-text"></div>'
																		+ '<div class="close_progress"><a href="javascript:;" class="cancel-upload"><img src="/memreas/img/close.png" alt=""></a></div>'
																		+ '<div class="clear"></div>'
																		+ '</div>'
																		+ '</li>');

																data.context = tpl2;

																// Set preview
																// if browser is
																// supported
																// file reader
																if (window.FileReader
																		&& filetype
																				.indexOf('image') >= 0) {
																	var file = data.files[0]; // Files[0]
																	// =
																	// 1st
																	// file
																	var reader = new FileReader();
																	reader
																			.readAsDataURL(file);
																	reader.onload = (function(
																			event) {
																		var preview_thumbnail = event.target.result;
																		data.context
																				.find(
																						'.upload_progress_img')
																				.find(
																						'img')
																				.attr(
																						'src',
																						preview_thumbnail)
																				.removeClass(
																						'loading-small');
																	});
																} else {
																	data.context
																			.find(
																					'.upload_progress_img')
																			.find(
																					'img')
																			.attr(
																					'src',
																					'/memreas/img/pic-1.jpg')
																			.removeClass(
																					'loading-small');
																}

																// Active on
																// share tab
																if ($("a.share")
																		.hasClass(
																				"active")) {
																	$(
																			".event-upload-image .mCSB_container")
																			.append(
																					tpl2);
																	$(
																			".event-upload-image")
																			.mCustomScrollbar(
																					"update");
																	$(
																			".event-upload-image")
																			.mCustomScrollbar(
																					"scrollTo",
																					"last");
																} else {
																	if ($(
																			".image_upload_box")
																			.hasClass(
																					"mCustomScrollbar"))
																		$(
																				".image_upload_box .mCSB_container")
																				.append(
																						tpl2);
																	else
																		$(
																				".image_upload_box")
																				.append(
																						tpl2);
																	if ($(
																			".image_upload_box")
																			.hasClass(
																					"mCustomScrollbar"))
																		$(
																				".image_upload_box")
																				.mCustomScrollbar(
																						"update");
																	else
																		$(
																				".image_upload_box")
																				.mCustomScrollbar(
																						{
																							scrollButtons : {
																								enable : true
																							}
																						});
																	$(
																			".image_upload_box")
																			.mCustomScrollbar(
																					"scrollTo",
																					"last");
																}

																/*-
																 * Check if media exist or not
																 */
																var params = [
																		{
																			tag : 'user_id',
																			value : $(
																					"input[name=user_id]")
																					.val()
																		},
																		{
																			tag : 'filename',
																			value : filename
																		} ];

																data.context
																		.find(
																				'.progress-text')
																		.html(
																				'Checking file exist');

																ajaxRequest(
																		'checkexistmedia',
																		params,
																		function(
																				xml_response) {
																			var filename = data.files[0].name;
																			filename = correctUploadFilename(filename);
																			if (getValueFromXMLTag(
																					xml_response,
																					'status') == 'Failure') {
																				data.context
																						.find(
																								'.progress-text')
																						.html(
																								'This file has already existed. Uploading will abort!');
																				removeItem(
																						uploadFilesInstance,
																						filename);
																				setTimeout(
																						function() {
																							tpl2
																									.remove();
																						},
																						2000);
																				return false;
																			} else {
																				/*-
																				 * Checking if file name has space
																				 */
																				if (filename
																						.indexOf(" ") >= 0) {
																					data.context
																							.find(
																									'.progress-text')
																							.html(
																									'Please remove space in file name. Uploading will abort!');
																					removeItem(
																							uploadFilesInstance,
																							filename);
																					setTimeout(
																							function() {
																								tpl2
																										.remove();
																							},
																							4000);
																					return false;
																				}

																				var jqXHR = data
																						.submit();
																				data.context
																						.find(
																								'.progress-text')
																						.html(
																								'Ok! Uploading...');
																				data.context
																						.find(
																								"a.cancel-upload")
																						.click(
																								function() {
																									var filename = data.files[0].name;
																									filename = correctUploadFilename(filename);
																									if (data.context
																											.hasClass('working-upload')) {
																										var currentPercent = data.context
																												.find(
																														".upload_progress_bar .progress")
																												.width()
																												/ data.context
																														.find(
																																".upload_progress_bar .progress")
																														.parent()
																														.width()
																												* 100;
																										if (currentPercent < 100) {
																											jqXHR
																													.abort();
																											stopUpload = true;
																											removeItem(
																													uploadFilesInstance,
																													filename);
																										} else {
																											jerror('Upload is completed. Please wait until add media to your account done');
																											stopUpload = false;
																										}
																									}
																									if (stopUpload) {
																										data.context
																												.fadeOut(function() {
																													data.context
																															.remove();
																												});
																									}
																								});
																			}
																		},
																		'undefined',
																		true);
															},
															progress : function(
																	e, data) {
																var percent = Math
																		.round((data.loaded / data.total) * 100);
																data.context
																		.find(
																				".upload_progress_bar .progress")
																		.css(
																				"width",
																				percent
																						+ "%");
																data.context
																		.find(
																				".upload_progress_bar span")
																		.html(
																				percent
																						+ "%");
																if (percent == 100) {
																	console
																			.log('Inside Progress function percent == 100');
																	data.context
																			.find(
																					'.progress-text')
																			.html(
																					'<img src="/memreas/img/loading-line.gif" class="loading-small"> Please wait while adding media to your account.');
																	data.context
																			.find(
																					'.close_progress')
																			.html(
																					'<span><img src="/memreas/img/arrow-gray.png" /></span>');
																}
															},
															error : function(
																	jqXHR,
																	status,
																	thrownError) {
																alert(jqXHR.status);
																alert(jqXHR.responseText);
																alert(status);
																alert(thrownError);
															},
															fail : function(e,
																	data) {
																window.onbeforeunload = null;
															},
															success : function(
																	data,
																	status,
																	jqXHR) {
																console
																		.log('Inside Success function');
																var _media_url = getValueFromXMLTag(
																		jqXHR.responseText,
																		'Location');
																var media_type = contentTypeOfFile;

																var userid = $(
																		"input[name=user_id]")
																		.val();
																if ($("a.share")
																		.hasClass(
																				"active"))
																	var addEvent = event_id;
																else
																	addEvent = '';
																var s3_filename = getValueFromXMLTag(
																		jqXHR.responseText,
																		'Key');
																var s3_filename_split = s3_filename
																		.split("/");
																var base_filename = s3_filename_split[s3_filename_split.length - 1];
																var s3_path_split = s3_filename
																		.split(base_filename);
																var s3_path = s3_path_split[0];

																var S3URL = "https://"
																		+ S3BUCKET
																		+ ".s3.amazonaws.com/";
																var server_url = _media_url
																		.replace(
																				S3URL,
																				'');

																var params = [
																		{
																			tag : 's3url',
																			value : ''
																		},
																		{
																			tag : 'is_server_image',
																			value : '0'
																		},
																		{
																			tag : 'content_type',
																			value : mimeTypeOfFile
																		},
																		// {tag:
																		// 'content_type',
																		// value
																		// :
																		// contentTypeOfFile},
																		{
																			tag : 's3path',
																			value : s3_path
																		},
																		{
																			tag : 's3file_name',
																			value : base_filename
																		},
																		{
																			tag : 'device_id',
																			value : ''
																		},
																		{
																			tag : 'device_type',
																			value : 'web'
																		},
																		{
																			tag : 'event_id',
																			value : addEvent
																		},
																		{
																			tag : 'media_id',
																			value : media_id
																		},
																		{
																			tag : 'user_id',
																			value : userid
																		},
																		{
																			tag : 'is_profile_pic',
																			value : '0'
																		},
																		{
																			tag : 'location',
																			value : ''
																		} ];

																if (media_type
																		.indexOf('image') >= 0) {
																	if ($(
																			".completed-upload")
																			.hasClass(
																					'mCSB_container'))
																		$(
																				".completed-upload .mCSB_container")
																				.append(
																						'<li><img src="'
																								+ _media_url
																								+ '"/></li>');
																	else
																		$(
																				".completed-upload .first-element")
																				.append(
																						'<li><img src="'
																								+ _media_url
																								+ '"/></li>');
																} else {
																	if ($(
																			".completed-upload")
																			.hasClass(
																					'mCSB_container'))
																		$(
																				".completed-upload .mCSB_container")
																				.append(
																						'<li class="video-media"><img src="/memreas/img/small/1.jpg"/><img src="/memreas/img/video-overlay.png" class="overlay-videoimg"></li>');
																	else
																		$(
																				".completed-upload .first-element")
																				.append(
																						'<li class="video-media"><img src="/memreas/img/small/1.jpg"/><img src="/memreas/img/video-overlay.png" class="overlay-videoimg"></li>');
																}

																ajaxRequest(
																		'addmediaevent',
																		params,
																		function(
																				xml_response) {
																			removeItem(
																					uploadFilesInstance,
																					base_filename);
																			currentUploadFileCount = uploadFilesInstance.length;
																			var class_upload = correctUploadFilename(
																					base_filename)
																					.split(
																							'.');
																			class_upload = ".upload-"
																					+ class_upload[0];
																			$(
																					class_upload)
																					.find(
																							".progress-text")
																					.html(
																							'completed');
																			setTimeout(
																					function() {
																						$(
																								class_upload)
																								.fadeOut(
																										1000)
																								.remove();
																					},
																					3000);
																			pushReloadItem('listallmedia');
																			if (currentUploadFileCount == 0) {
																				$(
																						".image_upload_box")
																						.mCustomScrollbar(
																								"update");
																			}
																			// alert(xml_response);
																		},
																		'undefined',
																		true);
															},
															done : function(
																	event, data) {
															}
														});
									});
				});

function correctUploadFilename(filename) {
	var invalidChars = [ ' ', '+', '*', "'", '"', '(', ')', '!' ];
	for (var i = 0; i < invalidChars.length; i++)
		filename = filename.replace(invalidChars[i], '-');

	return filename;
}
// Define custom other type, the rest will take default
var image_types = [ {
	ext : 'jpg',
	type : 'jpeg'
} ];
var video_types = [];
