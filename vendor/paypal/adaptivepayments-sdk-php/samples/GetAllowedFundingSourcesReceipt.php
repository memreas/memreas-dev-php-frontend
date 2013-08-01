<?php
require_once('PPBootStrap.php');


// create request
$requestEnvelope = new RequestEnvelope("en_US");
$getAllowedFundingSourcesReq = new GetAllowedFundingSourcesRequest($requestEnvelope, $_POST['key']);

$service = new AdaptivePaymentsService();
try {
	$response = $service->GetAllowedFundingSources($getAllowedFundingSourcesReq);
} catch(Exception $ex) {
	require_once 'Common/Error.php';
	exit;
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>PayPal Adaptive Payments - Get Allowed Funding Sources</title>
<link href="Common/sdk.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="Common/sdk_functions.js"></script>
</head>

<body>
	<div id="wrapper">
		<div id="response_form">
			<h3>Get Allowed Funding Sources</h3>
<?php 

$ack = strtoupper($response->responseEnvelope->ack);
if($ack != "SUCCESS"){
	echo "<b>Error </b>";
	echo "<pre>";
	print_r($response);
	echo "</pre>";
} else {
	echo "<pre>";
	print_r($response);
	echo "</pre>";
}
require_once 'Common/Response.php';	
?>
		</div>
	</div>
</body>
</html>