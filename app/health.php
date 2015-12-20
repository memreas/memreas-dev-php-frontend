<?php 
	$callback = $_REQUEST ['callback'];
	$json = $_REQUEST ['json'];
	http_response_code(200);
	header ( "Content-type: application/json" );
	$response = array();
	$response['data'] = 'healthy';
	$json = json_encode ( $response );
			
	// Return the ajax call...
	$callback_json = $callback . "(" . $json . ")";
	echo $callback_json;