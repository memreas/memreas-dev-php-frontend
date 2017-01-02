/**
 * index includes
 */

var script = '<script src="/bower_components/jquery-ui/jquery-ui.min.js"></script>'
script += '<script src="/memreas/js/responsiveslides.min.js"></script>';
script += '<script src="/memreas/js/jquery-register.js"></script>';
script += '<script src="/memreas/js/jquery.mCustomScrollbar.concat.min.js"></script>';
script += '<script src="/memreas/js/jquery.oauthpopup.js"></script>';
script += '<script src="/memreas/js/jquery.iframe-transport.js"></script>'; 
$('head').append(script);

/*
[ '/bower_components/jquery-ui/jquery-ui.min.js',
		'/memreas/js/responsiveslides.js',
		'/memreas/js/responsiveslides.min.js',
		'/memreas/assets/js/jquery.fileupload.js',
		'/memreas/js/jquery-register.js',
		'/memreas/js/jquery.mCustomScrollbar.concat.min.js',
		'/memreas/js/jquery.oauthpopup.js',
		'/memreas/assets/js/jquery.iframe-transport.js', '/memreas/js/ajax.js',
		'/memreas/js/global.js', 
		'/memreas/js/jNotify.jquery.min.js',
		'/memreas/js/modalPopLite.min.js', 
		'/memreas/js/popup.js',
		'/memreas/js/s3upload.js',
		'/memreas/js/registration.js',
		'/memreas/jsblue/jquery.blueimp-gallery.js',
		'/memreas/jsblue/blueimp-gallery.js',
		'/memreas/jsblue/blueimp-gallery-fullscreen.js',
		'/memreas/jsblue/blueimp-gallery-indicator.js',
		'/memreas/jsblue/blueimp-gallery-video.js',
		'/memreas/jsblue/blueimp-helper.js',
		'/memreas/assets/js/jquery.fileupload.js', 
].forEach(function(src) {
	var script = document.createElement('script');
	script.src = src;
	script.async = false;
	document.head.appendChild(script);
});

/*
 * function require(script) { $.ajax({ url: script, dataType: "script", async:
 * false, // <-- This is the key success: function () { // all good... }, error:
 * function () { throw new Error("Could not load script " + script); } }); }
 * require("/bower_components/jquery-ui/jquery-ui.min.js");
 * require("/memreas/js/responsiveslides.js");
 * require("/memreas/js/responsiveslides.min.js");
 * require("/memreas/assets/js/jquery.fileupload.js");
 * require("/memreas/js/jquery-register.js");
 * require("/memreas/js/jquery.mCustomScrollbar.concat.min.js");
 * require("/memreas/js/jquery.oauthpopup.js");
 * require("/memreas/assets/js/jquery.iframe-transport.js");
 * require("/memreas/js/ajax.js"); require("/memreas/js/global.js");
 * require("/memreas/js/jNotify.jquery.min.js");
 * require("/memreas/js/modalPopLite.min.js"); require("/memreas/js/popup.js");
 * require("/memreas/js/registration.js");
 * require("/memreas/jsblue/jquery.blueimp-gallery.js");
 * require("/memreas/jsblue/blueimp-gallery.js");
 * require("/memreas/jsblue/blueimp-gallery-fullscreen.js");
 * require("/memreas/jsblue/blueimp-gallery-indicator.js");
 * require("/memreas/jsblue/blueimp-gallery-video.js");
 * require("/memreas/jsblue/blueimp-helper.js");
 * require("/memreas/assets/js/jquery.fileupload.js");
 */
