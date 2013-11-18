<?php
	//System path for our website folder
	define('DOCROOT', realpath(dirname(__FILE__)).DIRECTORY_SEPARATOR);
	//URL for our website
	define('WEBROOT', htmlentities(
		substr($_SERVER['REQUEST_URI'], 0, strcspn($_SERVER['REQUEST_URI'], "\n\r")),
		ENT_QUOTES
	));

	//Which bucket are we placing our files into
	$bucket = 'veriruzo';
	// This will place uploads into the '20100920-234138' folder in the $bucket bucket
	$folder = date('Ymd-His').'/'; //Include trailing /

	//Include required S3 functions
	require_once DOCROOT."includes/s3.php";

	//Generate policy and signature
	list($policy, $signature) = S3::get_policy_and_signature(array(
		'bucket' 		=> $bucket,
		'folder'		=> $folder,
	));
?>
<html>
<head>
<title>test Upload</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" href="files/uploadify/uploadify.css" />
<script type='text/javascript' src="files/jquery.js"></script>
<script type='text/javascript' src="files/uploadify/swfobject.js"></script>
<script type='text/javascript' src="files/uploadify/jquery.uploadify.v2.1.4.min.js"></script>
<script type="text/javascript">
	$(document).ready(function() {
		$("#file_upload").uploadify({
			'uploader'		: '<?= WEBROOT ?>files/uploadify/uploadify.swf',
			'buttonText'	: 'Browse',
			'cancelImg'		: '<?= WEBROOT ?>files/uploadify/cancel.png',
			'script'		: 'http://s3.amazonaws.com/<?= $bucket ?>',
			'scriptAccess'	: 'always',
			'method'		: 'post',
			'scriptData'	: {
				"AWSAccessKeyId"			: "<?= S3::$AWS_ACCESS_KEY ?>",
				"key"						: "${filename}",
				"acl"						: "authenticated-read",
				"policy"					: "<?= $policy ?>",
				"signature"					: "<?= $signature ?>",
				"success_action_status"		: "201",
				"key"						: encodeURIComponent(encodeURIComponent("<?= $folder ?>${filename}")),
				"fileext"					: encodeURIComponent(encodeURIComponent("")),
				"Filename"					: encodeURIComponent(encodeURIComponent(""))
			},
			'fileExt'		: '*.*',
			'fileDataName' 	: 'file',
			'simUploadLimit': 2,
			'multi'			: true,
			'auto'			: true,
			'onError' 		: function(errorObj, q, f, err) { console.log(err); },
			'onComplete'	: function(event, ID, file, response, data) { console.log(file); }
		});
	});
</script>
</head>
<body>

	<div align='center'>
		<input type='file' id='file_upload' name='file_upload' />
	</div>

</body>
</html>
