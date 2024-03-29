/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved Unauthorized copying of
 * this file, via any medium is strictly prohibited Proprietary and confidential
 */
var popupStatus = 0;
function loadPopup(id) {
    if (popupStatus === 0) {
	$('footer.rel').css({
	    'z-index' : '1'
	});
	$('.bottom-ads-secion').css({
	    'z-index' : '1'
	});
    }
    {
	$("#bg" + id).css({
	    "opacity" : "0.7"
	});
	$("#bg" + id).fadeIn("slow");
	$("body,html").animate({
	    scrollTop : $('body').offset().top
	}, 700);
	$("#" + id).fadeIn("slow");
	popupStatus = 1;
    }
}
function disablePopup(id) {
    $("#bg" + id).fadeOut("slow", function() {
	$('footer.rel').css({
	    'z-index' : '2'
	});
	$('.bottom-ads-secion').css({
	    'z-index' : '2'
	});
    });
    $("#" + id).fadeOut("slow");
    popupStatus = 0;
}
function centerPopup(id) {
    $(".popups").fadeOut("slow");
    $(".backgroundPopup").fadeOut("slow");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var popupHeight = $("#" + id).outerHeight();
    var popupWidth = $("#" + id).outerWidth();
    $("#" + id).css({
	"position" : "absolute",
	"top" : (windowHeight - popupHeight) / 2,
	"left" : "37%"
    });
    if (window.innerWidth <= 1024) {
	if (window.innerWidth <= 768) {
	    $("#" + id).css({
		"left" : "10%",
		"top" : "23px"
	    });
	} else {
	    $("#" + id).css({
		"left" : "23%",
		"top" : "-113px"
	    });
	}
    }
    $("#bg" + id).css({
	"height" : windowHeight
    });
}
function popup(id) {
    centerPopup(id);
    loadPopup(id);
    $("ul.scrollpopup").mCustomScrollbar("destroy");
    $("ul.scrollpopup").mCustomScrollbar({
	scrollButtons : {
	    enable : true
	}
    });
}
$(document).ready(function() {
});
