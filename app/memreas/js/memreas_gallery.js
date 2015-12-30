/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */

$(document).ready(function() {
	getAjaxTab();

	galleryInt();
	dateInit();
	galleryTab();
	galleryScrollbar();
	$(".swipebox").swipebox();

});
getAjaxTab = function() {

	$("#main-tab ul a").click(function() {
		var _active_tab = $(this).attr("title");
		var url = '/index.php/index/' + _active_tab;
		if (!$("#" + _active_tab).html().trim()) {
			alert(url);
			$.get(url, function(data) {
				$("#" + _active_tab).html(data);
			});

		}
	});
}
galleryInt = function() {

	// Prefetch for image location
	// $.fetch_server_media('<?php echo $user_id; ?>');
	// $.addfile();
	// share_initObjects();
	// share_initAkordeon();
	// share_customScrollbar();
	$(document).bgStretcher({
		images : [ '/memreas/img/bg.jpg' ],
		imageWidth : 1366,
		imageHeight : 700
	});
	$(".change-location a.browse-server").click(function() {
		$.fetch_server_media($("input[name=current_user_id]").val());
	});
	$(".change-location a.fetch-local").click(function() {
		$(".browse-file").fadeIn(500);
	});
	$(".image_upload_box").mCustomScrollbar({
		scrollButtons : {
			enable : true
		}
	});
	$(".event-upload-image").mCustomScrollbar({
		scrollButtons : {
			enable : true
		}
	});

}

dateInit = function() {
	$("#dtp_date").datepicker();
	$("#dtp_from").datepicker();
	$("#dtp_to").datepicker();
	$("#dtp_selfdestruct").datepicker();
}
galleryTab = function() {

	$(window).load(
			function() {
				$("#tab-content-memreas div.hideCls").hide(); // Initially
																// hide all
																// content
				$("#tabs-memreas li:first").attr("id", "current"); // Activate
																	// first tab
				$("#tab-content-memreas div:first").fadeIn(); // Show first
																// tab content*/
				$('#tabs-memreas a')
						.click(
								function(e) {
									e.preventDefault();
									$("#tab-content-memreas div.hideCls")
											.hide(); // Hide all content
									$("#tabs-memreas li").attr("id", ""); // Reset
																			// id's
									$(this).parent().attr("id", "current"); // Activate
																			// this
									$('#' + $(this).attr('title')).fadeIn(); // Show
																				// content
																				// for
																				// current
																				// tab
									$('#' + $(this).attr('title')).fadeIn(); // Show
																				// content
																				// for
																				// current
																				// tab
									if (!($('#' + $(this).attr('title')
											+ " .scroll-area")
											.hasClass('mCustomScrollbar'))) {
										$(
												'#' + $(this).attr('title')
														+ " .scroll-area")
												.mCustomScrollbar({
													scrollButtons : {
														enable : true
													}
												});
									}
									$(
											'#' + $(this).attr('title')
													+ " .scroll-area")
											.mCustomScrollbar("update");
								});

			});
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
}

galleryScrollbar = function() {
	$(window).load(
			function() {
				$("ul.scrollClass").mCustomScrollbar({
					scrollButtons : {
						enable : true
					}
				});

				$("#tab-content div.hideCls").hide(); // Initially hide all
														// content
				$("#tabs li:first").attr("id", "current"); // Activate first
															// tab
				$("#tab-content div:first").fadeIn(); // Show first tab
														// content

				$('#tabs a')
						.click(
								function(e) {
									e.preventDefault();
									$("#tab-content div.hideCls").hide(); // Hide
																			// all
																			// content
									$("#tabs li").attr("id", ""); // Reset
																	// id's
									$(this).parent().attr("id", "current"); // Activate
																			// this
									$('#' + $(this).attr('title')).fadeIn(); // Show
																				// content
																				// for
																				// current
																				// tab
									if (!($('#' + $(this).attr('title')
											+ " .scroll-area")
											.hasClass('mCustomScrollbar'))) {
										$(
												'#' + $(this).attr('title')
														+ " .scroll-area")
												.mCustomScrollbar({
													scrollButtons : {
														enable : true
													}
												});
									}
									$(
											'#' + $(this).attr('title')
													+ " .scroll-area")
											.mCustomScrollbar("update");
								});

				// ajax demo fn
				$("a[rel='load-content']").click(
						function(e) {

							e.preventDefault();
							var $this = $(this), url = $this.attr("href");
							$this.addClass("loading");
							$.get(url, function(data) {
								$this.removeClass("loading");
								$("ul.scrollClass .mCSB_container").html(data); // load
																				// new
																				// content
																				// inside
																				// .mCSB_container
								$("ul.scrollClass").mCustomScrollbar("update"); // update
																				// scrollbar
																				// according
																				// to
																				// newly
																				// loaded
																				// content
								$("ul.scrollClass").mCustomScrollbar(
										"scrollTo", "top", {
											scrollInertia : 200
										}); // scroll to top
							});
						});
				$("a[rel='append-content']").click(
						function(e) {
							e.preventDefault();
							var $this = $(this), url = $this.attr("href");
							$this.addClass("loading");
							$.get(url, function(data) {
								$this.removeClass("loading");
								$("ul.scrollClass .mCSB_container")
										.append(data); // append new content
														// inside
														// .mCSB_container
								$("ul.scrollClass").mCustomScrollbar("update"); // update
																				// scrollbar
																				// according
																				// to
																				// newly
																				// appended
																				// content
								$("ul.scrollClass").mCustomScrollbar(
										"scrollTo", "h2:last", {
											scrollInertia : 2500,
											scrollEasing : "easeInOutQuad"
										}); // scroll to appended content
							});
						});
			});

}