/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
$(function() {
	$("#tab-content-queue div.hideCls").hide(); // Initially hide all content
	$("#tabs-queue li:first").attr("id", "current"); // Activate first tab
	$("#tab-content-queue div:first").fadeIn(); // Show first tab content*/

	$('#tabs-queue a').click(
			function(e) {
				e.preventDefault();
				$("#tab-content-queue div.hideCls").hide(); // Hide all content
				$("#tabs-queue li").attr("id", ""); // Reset id's
				$(this).parent().attr("id", "current"); // Activate this
				$('#' + $(this).attr('title')).fadeIn(); // Show content for
															// current tab
				if (!($('#' + $(this).attr('title') + " .scroll-area")
						.hasClass('mCustomScrollbar'))) {
					$('#' + $(this).attr('title') + " .scroll-area")
							.mCustomScrollbar({
								scrollButtons : {
									enable : true
								}
							});
				}
				$('#' + $(this).attr('title') + " .scroll-area")
						.mCustomScrollbar("update");
			});
});
function clearUploadedMedia() {
	$(".completed-upload .mCSB_container").empty();
	$(".completed-upload").mCustomScrollbar("update");
}