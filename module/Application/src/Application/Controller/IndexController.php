<?php

/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
namespace Application\Controller;

use \Exception;
use Application\memreas\Mlog;
use Application\Model\MemreasConstants;
use Application\memreas\CheckGitPull;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class IndexController extends AbstractActionController {
	protected $user_id;
	protected $storage;
	protected $authservice;
	protected $session;
	protected $sid;
	protected $ipAddress;
	protected $checkGitPull;
	public function is_json($string, $return_data = false) {
		$data = json_decode ( $string );
		$result = (json_last_error () == JSON_ERROR_NONE) ? ($return_data ? $data : TRUE) : FALSE;
		if ($result) {
		//	MLog::addone ( __CLASS__ . __METHOD__ . __LINE . 'isJSON result', 'true' );
		} else {
		//	MLog::addone ( __CLASS__ . __METHOD__ . __LINE . 'isJSON result', 'false' );
		}
		return $result;
	}
	public function array2xml($array, $xml = false) {
		if ($xml === false) {
			$xml = new \SimpleXMLElement ( '<?xml version=\'1.0\' encoding=\'utf-8\'?><' . key ( $array ) . '/>' );
			$array = $array [key ( $array )];
		}
		foreach ( $array as $key => $value ) {
			if (is_array ( $value )) {
				array2xml ( $value, $xml->addChild ( $key ) );
			} else {
				$xml->addChild ( $key, $value );
			}
		}
		return $xml->asXML ();
	}
	public function fetchXML($action, $xml, $wsurl = MemreasConstants::MEMREAS_WS) {
		$this->memreas_session ();
		/**
		 * Handle session and fetch sid
		 */
		
		/*
		 * If memreascookie is available and missing inject it...
		 */
		$data = simplexml_load_string ( $xml );
		//MLog::addone ( __CLASS__ . __METHOD__ . '::$data', $data );
		if (empty ( $data->memreascookie )) {
			$data->memreascookie = $_COOKIE ['memreascookie'];
			// x_memreas_chameleon is pass through ...
			if (isset ( $_COOKIE ['x_memreas_chameleon'] )) {
				$data->x_memreas_chameleon = $_COOKIE ['x_memreas_chameleon'];
			}
			$xml = $data->asXML ();
		}

		//add ip for login...
		if($action='login') {
			$data->addChild ( 'clientIPAddress', $this->fetchUserIPAddress () );
			$xml = $data->asXML ();
		}
		
		MLog::addone ( __CLASS__ . __METHOD__ . '::clientIPAddress', $this->fetchUserIPAddress () );
		MLog::addone ( __CLASS__ . __METHOD__ . '::$xml', $xml );
		
		
		/*
		 * Fetch guzzle and post...
		 */
		// $guzzle = new \GuzzleHttp\Client (['verify' => false]);
		$guzzle = new \GuzzleHttp\Client ();
		// MLog::addone ( __CLASS__ . __METHOD__ . 'guzzle url', $wsurl );
		// MLog::addone ( __CLASS__ . __METHOD__ . 'guzzle $action', $action );
		// MLog::addone ( __CLASS__ . __METHOD__ . 'guzzle $xml', $xml );
		try {
			$response = $guzzle->post ( $wsurl, [ 
					'form_params' => [ 
							'action' => $action,
							'xml' => $xml 
					] 
			] );
		} catch ( \Exception $exc ) {
			Mlog::addone ( __CLASS__ . __METHOD__ . 'guzzle exception::', $exc->getMessage () );
		}
		
		// MLog::addone ( __CLASS__ . __METHOD__ . 'about to guzzle url+action+xml', MemreasConstants::MEMREAS_WS . $action . $xml );
		// MLog::addone ( __CLASS__ . __METHOD__ . 'guzzle response -->', $response->getBody () );
		if (empty ( $response )) {
			// something is wrong - logout
			Mlog::addone ( __CLASS__ . __METHOD__ . 'EMPTY RESPONSE occurred for guzzle url+action+xml', MemreasConstants::MEMREAS_WS . $action . $xml );
			// return $this->logoutAction ();
		}
		
		return $response->getBody ();
		//return $response->getBody()->getContents();
	}
	public function indexAction() {
		Mlog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		// Start buffering so cookies are set
		//
		// Check Headers sent
		//
		// error_log ( __CLASS__ . __METHOD__ . __LINE__ . "headers_list()" . print_r ( headers_list (), true ) . PHP_EOL );
		ob_start ();
		$actionname = isset ( $_REQUEST ["action"] ) ? $_REQUEST ["action"] : '';
		Mlog::addone ( __CLASS__ . __METHOD__ . 'enter indexAction', $actionname );
		if ($actionname == "gitpull") {
			$this->checkGitPull = new CheckGitPull ();
			Mlog::addone ( __CLASS__ . __METHOD__, '::entered gitpull processing' );
			echo $this->checkGitPull->exec ( true );
			exit ();
		} else if ($actionname == "clearlog") {
			/*
			 * Cache Approach: N/a
			 */
			//`cat /dev/null > getcwd () . '/php_errors.log'`
			unlink ( getcwd () . '/php_errors.log' );
			error_log ( "Log has been cleared!" );
			echo '<pre>' . file_get_contents ( getcwd () . '/php_errors.log' );
			// End buffering and flush
			ob_end_clean ();
			exit ();
		} else if ($actionname == "showlog") {
			/*
			 * Cache
			 * Approach:
			 * N/a
			 */
			// Mlog::addone ( __CLASS__ . __METHOD . __LINE . "showlog-->", "called..." );
			$result = '<pre>' . file_get_contents ( getcwd () . '/php_errors.log' );
			echo $result;
			// End buffering and flush
			ob_end_flush ();
			exit ();
		} else {
			
			$path = $this->security ( "application/index/index.phtml" );
			$data ['bucket'] = MemreasConstants::S3BUCKET;
			$data ['maintenance'] = MemreasConstants::MAINTENANCE;
			$view = new ViewModel ( array (
					'data' => $data 
			) );
			$view->setTemplate ( $path ); // path to phtml file under view
			                              // folder
			                              
			// End buffering and flush
			ob_end_clean ();
			
			return $view;
		}
	}
	public function execAjaxAction() {
		$cm = __CLASS__ . __METHOD__;
		// MLog::addone ( $cm . __LINE__ . '::$_REQUEST--->', $_REQUEST );
		$this->memreas_session ();
		if (isset ( $_REQUEST ['callback'] )) {
			
			// $headers = apache_request_headers ();
			// foreach ( $headers as $header => $value ) {
			// error_log ( "callback header: $header :: value: $value" . PHP_EOL
			// );
			// }
			
			// Fetch parms
			$callback = $_REQUEST ['callback'];
			$json = $_REQUEST ['json'];
			$message_data = json_decode ( $json, true );
			
			// MLog::addone ( $cm . __LINE__ . '::$message_data--->', $message_data );
			$wsurl = MemreasConstants::MEMREAS_WS;
			if (isset ( $message_data ['json'] )) {
				$data = simplexml_load_string ( $message_data ['json'] );
				// use public controller if public_page
				if (isset ( $data->viewevent ) && isset ( $data->viewevent->public_page )) {
					$wsurl = MemreasConstants::MEMREAS_WS_PUBLIC;
				}
			}
			
			// MLog::addone ( $cm . __LINE__ . '::web service url--->', $wsurl );
			// Setup the URL and action
			$ws_action = $message_data ['ws_action'];
			$type = $message_data ['type'];
			$xml = $message_data ['json'];
			
			// Guzzle the Web Service
			$result = $this->fetchXML ( $ws_action, $xml, $wsurl );
			//Mlog::addone ( $cm . __LINE__. '::$result--->', $result->getBody() );
			$json = json_encode ( $result );
			
			// Handle session
			$this->handleWSSession ( $ws_action, $result );
			$json = json_encode ( trim ( $result ) );
			
			// Return the ajax call...
			$callback_json = $callback . "(" . $json . ")";
			$output = ob_get_clean ();
			header ( "Content-type: plain/text" );
			//Mlog::addone ( '$callback_json--->', $callback_json);
			
			echo $callback_json;
			
			exit ();
		} else {
			// return 500
			$path = "application/index/500.phtml";
			$view = new ViewModel ( array () );
			$view->setTemplate ( $path ); // path to phtml file under view folder
			return $view;
		}
		
		return $view;
	}
	private function handleWSSession($action, $result) {
		$cm = __CLASS__ . __METHOD__;
		
		//
		// Check return result
		//
		libxml_use_internal_errors ( true );
		$data = simplexml_load_string ( $result );
		// Process XML structure here
		if ($action == 'login') {
			/**
			 * Handle login
			 */
			$this->writeJsConstants ();
			$this->memreas_session ();
			$_SESSION ['user_id'] = ( string ) $data->loginresponse->user_id;
			$_SESSION ['username'] = ( string ) $data->loginresponse->username;
			$_SESSION ['email'] = ( string ) $data->loginresponse->email;
			
			// set secure cookies to retrieve this info and avoid
		} else if (($action == 'logout') || (!empty($data->loginresponse))) {
			// $this->memreas_session ();
			/**
			 * Handle logout
			 */
			$this->logoutAction ();
		}
		
	}
	private function setSignedCookie($name, $val, $domain) {
		// MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		// using our own implementation because
		// using php setcookie means the values are URL encoded and then AWS CF fails
		header ( "Set-Cookie: $name=$val; path=/; domain=$domain; secure; httpOnly", false );
	}
	private function getS3Key() {
		$this->memreas_session ();
		
		MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::About to fetch S3Key' );
		$action = 'memreas_tvm';
		$user_id = (isset ( $_REQUEST ['user_id'] )) ? $_REQUEST ['user_id'] : $_SESSION ['user_id'];
		// Mlog::addone ( __CLASS__ . __METHOD__ . __LINE__, 'About to fetch S3Key for $user_id->' . $user_id );
		if (! empty ( $user_id )) {
			// Fetch parms
			if (! empty ( $_COOKIE ['memreascookie'] )) {
				$memreascookie = '<memreascookie>' . $_COOKIE ['memreascookie'] . '</memreascookie>';
			}
			$xml = '<xml>' . $memreascookie . '<user_id>' . $user_id . '</user_id><memreas_tvm>0</memreas_tvm><memreas_pre_signed_url>1</memreas_pre_signed_url></xml>';
		}
		
		$action = 'memreas_tvm';
		// $xml = '<xml><username>' . $_SESSION ['username'] . '</username><memreas_tvm>1</memreas_tvm></xml>';
		$s3Authenticate = $this->fetchXML ( $action, $xml );
		//Mlog::addone ( __CLASS__ . __METHOD__ . __LINE__.'$s3Authenticate--->', $s3Authenticate);

		//
		// Check for dead session
		//
		$checkXML = substr($s3Authenticate, 0, 1);
		if ($checkXML == '<') {
			$data = simplexml_load_string ( $s3Authenticate );
			//. __LINE__.'$data--->', $data);
			//Mlog::addone ( __CLASS__ . __METHOD__ . __LINE__.'$data->loginresponse->logout--->', $data->loginresponse->logout);
			if ($data->logoutresponse) {
				return $this->logoutAction ();
			}
		}
		
		//
		// s3authenticate passed
		//
		return $s3Authenticate;
	}
	public function fetchMemreasTVMAction() {
		header ( 'ContentType: application/json' );
		echo $this->getS3Key ();
		exit ();
	}
	private function fetchMemreasTVMPreSignedURLAction() {
		$this->memreas_session ();
		if (isset ( $_REQUEST ['json'] )) {
			// Fetch parms
			$json = $_REQUEST ['json'];
			$jsonArr = json_decode ( $json, true );
			$actionname = $jsonArr ['action'];
			$type = $jsonArr ['type'];
			$message_data = $jsonArr ['json'];
			$_POST ['xml'] = $message_data ['xml'];
			// MLog::addone ( __CLASS__ . __METHOD__ . '$_POST[xml]', $_POST ['xml'] );
		} else {
			$actionname = isset ( $_REQUEST ["action"] ) ? $_REQUEST ["action"] : '';
			$message_data ['xml'] = '';
		}
		
		// Mlog::addone ( __CLASS__ . __METHOD__ . 'REGISTRATION RELATED ---->$_POST[xml]', $_POST ['xml'] );
		$data = simplexml_load_string ( $_POST ['xml'] );
		if (isset ( $data->memreas_tvm->user_id )) {
			$xml = '<xml><user_id>' . $data->memreas_tvm->user_id . '</user_id><memreas_tvm>0</memreas_tvm><memreas_pre_signed_url>1</memreas_pre_signed_url></xml>';
			// MLog::addone ( __CLASS__ . __METHOD__ . 'REGISTRATION RELATED data->memreas_tvm->user_id ---->$_POST[xml]', $_POST ['xml'] );
		} else {
			$xml = '<xml><username>' . $_SESSION ['username'] . '</username><memreas_tvm>0</memreas_tvm><memreas_pre_signed_url>1</memreas_pre_signed_url></xml>';
			Mlog::addone ( __CLASS__ . __METHOD__ . 'REGISTRATION RELATED missing data->memreas_tvm->user_id ---->$_POST[xml]', $_POST ['xml'] );
		}
		
		$action = 'memreas_tvm';
		$s3Authenticate = $this->fetchXML ( $action, $xml );
		return $s3Authenticate;
	}
	private function generateMediaIdAction() {
		$this->memreas_session ();
		$action = 'generatemediaid';
		// <xml><username>jmeah7</username><generatemediaid></generatemediaid></xml>
		$xml = '<xml><username>' . $_SESSION ['username'] . '</username><generatemediaid></generatemediaid></xml>';
		$s3Authenticate = $this->fetchXML ( $action, $xml );
		return $s3Authenticate;
	}
	
	/*
	 * Main page for frontend
	 * @ Tran Tuan
	 */
	public function memreasAction() {
		//
		// Check session
		//
		// MLog::addone ( __CLASS__.__METHOD__.__LINE__, 'enter memreasAction()' );
		$this->memreas_session ();
		// MLog::addone ( __CLASS__.__METHOD__.__LINE__.'$_SESSION-->', $_SESSION );
		if (empty ( $_SESSION )) {
			MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, 'empty($_SESSION)' );
			$this->logoutAction ();
			return;
		}
		
		// MLog::addone ( __CLASS__.__METHOD__.__LINE__, '$this->memreas_session ()' );
		// error_log ( 'Inside memreasAction...' . PHP_EOL );
		// Configure Ads on page
		$enableAdvertising = MemreasConstants::MEMREAS_ADS;
		$payment_tabs = array (
				'Subscription' => MemreasConstants::PAYMENT_TAB_SUBSCRIPTION,
				'BuyCredit' => MemreasConstants::PAYMENT_TAB_BUY_CREDIT,
				'SellMedia' => MemreasConstants::PAYMENT_TAB_SELL_MEDIA 
		);
		
		//
		// if $_SESSION ['user_id'] is not set logout
		// - something must be wrong...
		//
		if (empty ( $_SESSION ['user_id'] )) {
			// $this->logoutAction ();
			// reset session from cookie
			$this->memreas_session ();
		}
		
		//
		// else route to memreas one page
		//
		$user_id = $_SESSION ['user_id'];
		$data ['userid'] = $user_id;
		$data ['bucket'] = MemreasConstants::S3BUCKET;
		$data ['maintenance'] = MemreasConstants::MAINTENANCE;
		$s3Token = $this->getS3Key ();
		
		// Pass constant global variables to js global constant
		$this->writeJsConstants ();
		$path = "application/index/memreas_one_page.phtml";
		error_log ( 'routing to $path--->' . $path );
		
		$view = new ViewModel ( array (
				'data' => $s3Token,
				'enableAdvertising' => $enableAdvertising,
				'enableSellMedia' => MemreasConstants::MEMREAS_SELL_MEDIA,
				'stripeUrl' => MemreasConstants::MEMREAS_PAY,
				'PaymentTabs' => $payment_tabs,
				'app_version' => MemreasConstants::VERSION 
		) );
		// error_log ( 'Inside memreasAction path---->' . $path . PHP_EOL );
		
		$view->setTemplate ( $path ); // path to phtml file under view folder
		return $view;
	}
	
	/*
	 * Write constant to javascript
	 */
	public function writeJsConstants() {
		$this->memreas_session ();
		if (! file_exists ( $_SERVER ['DOCUMENT_ROOT'] . '/memreas/js/constants.js' )) {
			// Mlog::addone("writeJsConstants() - $ _ SERVER [DOCUMENT_ROOT]", $_SERVER ['DOCUMENT_ROOT']);
			// Mlog::addone("writeJsConstants()", "about to write constants.js file...");
			// Put constant variables here
			$JsConstantVariables = array (
					'REMOVE_THIS' => 1 
			);
			$content = '';
			foreach ( $JsConstantVariables as $variable => $value ) {
				if (is_numeric ( $value ))
					$content .= "var {$variable} = {$value};\n";
				else
					$content .= "var {$variable} = '{$value}';\n";
			}
			$fileHandle = fopen ( $_SERVER ['DOCUMENT_ROOT'] . '/memreas/js/constants.js', 'w' );
			fwrite ( $fileHandle, $content, strlen ( $content ) );
			fclose ( $fileHandle );
		} else {
			// MLog::addone ( "writeJsConstants() - $ _ SERVER [DOCUMENT_ROOT]", $_SERVER ['DOCUMENT_ROOT'] );
			// MLog::addone ( "writeJsConstants()", "constants.js file exists..." );
		}
	}
	
	/*
	 * Login Action
	 */
	public function loginAction() {
		MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		MLog::addone ( __CLASS__ . __METHOD__ . __LINE__ . '::$_REQUEST--->', $_REQUEST );
		
		// Fetch the post data
		$request = $this->getRequest ();
		$postData = $request->getPost ()->toArray ();
		
		$password = $postData ['password'];
		if (empty ( $postData ['status_user_id'] )) {
			MLog::addone ( 'Returning view::', 'this->redirect ()->toRoute ( index, array (action => index) )' );
			return $this->redirect ()->toRoute ( 'index', array (
					'action' => "index" 
			) );
		} else {
			MLog::addone ( 'Returning view::', 'this->redirect ()->toRoute ( index, array (action => memreas) )' );
			$this->memreas_session ();
			$_SESSION ['username'] = $username = $_POST ['username'];
			$_SESSION ['user_id'] = $userid = $postData ['status_user_id'];
			MLog::addone ( 'login success user_id --->', $_SESSION ['user_id'] );
			return $this->redirect ()->toRoute ( 'index', array (
					'action' => 'memreas' 
			) );
		}
	}
	public function logoutAction() {
		MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		//$this->memreas_session ();
		/**
		 * Logout FE Server
		 */
		session_destroy ();
		
		return $this->redirect ()->toRoute ( 'index', array (
				'action' => "index" 
		) );
	}
	public function changepasswordAction() {
		// MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		$this->memreas_session ();
		$request = $this->getRequest ();
		$postData = $request->getPost ()->toArray ();
		
		$new = isset ( $postData ['new'] ) ? $postData ['new'] : '';
		$retype = isset ( $postData ['reytpe'] ) ? $postData ['reytpe'] : '';
		$token = isset ( $postData ['token'] ) ? $postData ['token'] : '';
		
		// Setup the URL and action
		$action = 'forgotpassword';
		$xml = "<xml><changepassword><new>$new</new><retype>$retype</retype><token>$token</token></changepassword></xml>";
		
		// Guzzle the LoginWeb Service
		$result = $this->fetchXML ( $action, $xml );
		
		$data = simplexml_load_string ( $result );
		echo json_encode ( $data );
		return '';
	}
	public function security($path) {
		$this->memreas_session ();
		return $path;
	}
	public function editmediaAction() {
		// MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		$this->memreas_session ();
		$target_dir = getcwd () . '/app/memreas/temps_media_edit/';
		$s3Object = new S3 ( MemreasConstants::S3_APPKEY, MemreasConstants::S3_APPSEC );
		$file_source = $_POST ['file_source'];
		$file_remote = $_POST ['file_url'];
		
		$remote_filename = explode ( '/', $file_remote );
		$remote_filename = $remote_filename [count ( $remote_filename ) - 1];
		
		$file_content = file_get_contents ( $file_remote );
		file_put_contents ( $target_dir . $remote_filename, $file_content );
		
		$server_source_file = $target_dir . $remote_filename;
		$target_file = $_POST ['user_id'] . '/image/' . $remote_filename;
		
		$s3Object->putBucket ( MemreasConstants::S3BUCKET, $s3Object::ACL_PUBLIC_READ_WRITE );
		
		$s3Object->putObjectFile ( $server_source_file, MemreasConstants::S3BUCKET, $target_file, $s3Object::ACL_PUBLIC_READ_WRITE, array (), 'image/jpeg' );
		
		// Add this edited media as a new media
		$action = 'addmediaevent';
		$xml = "<xml>";
		$xml .= "<addmediaevent>";
		$xml .= "<s3url>" . $remote_filename . "</s3url>";
		$xml .= "<is_server_image>0</is_server_image>";
		$xml .= "<content_type>image/jpeg</content_type>";
		$xml .= "<s3path>" . $_POST ['user_id'] . "image/</s3path>";
		$xml .= "<s3file_name>" . $remote_filename . "</s3file_name>";
		$xml .= "<device_id></device_id>";
		$xml .= "<event_id></event_id>";
		$xml .= "<media_id></media_id>";
		$xml .= "<user_id>" . $_POST ['user_id'] . "</user_id>";
		$xml .= "<is_profile_pic>0</is_profile_pic>";
		$xml .= "<location></location>";
		$xml .= "</addmediaevent>";
		$xml .= "</xml>";
		$result = $this->fetchXML ( $action, $xml );
		
		$data = simplexml_load_string ( $result );
		if ($data->addmediaeventresponse->status == 'Success')
			echo 'Media updated';
		else
			echo 'Error while saving your media please try again';
		die (); // For ajax calling only
	}
	
	// Process user add comment
	public function audiocommentAction() {
		// MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		$this->memreas_session ();
		if (isset ( $_POST ['file_data'] )) {
			$user_id = $_POST ['user_id'];
			$event_id = $_POST ['comment_event_id'];
			$target_dir = getcwd () . '/app/memreas/user_comment_files/' . $user_id . '/';
			$media_id = isset ( $_POST ['media_id'] ) ? $_POST ['media_id'] : '';
			$cad = $_POST ['file_data'];
			
			// Check if user directory has created or not
			if (! file_exists ( $target_dir )) {
				mkdir ( $target_dir, 0777 );
			}
			
			// generate file name
			$filename = $this->createAudioFilename ( $user_id );
			$server_source_file = $target_dir . $filename;
			
			$stringas = explode ( ":", $cad );
			$type = explode ( ";", $stringas [1] );
			$base = explode ( ",", $type [1] );
			$base64 = $base [1];
			
			$fh = fopen ( $server_source_file, 'w' );
			fwrite ( $fh, base64_decode ( $base64 ) );
			
			// begin upload to S3
			$s3Object = new S3 ( MemreasConstants::S3_APPKEY, MemreasConstants::S3_APPSEC );
			$target_file = $user_id . '/media/' . $filename;
			
			$s3Object->putBucket ( MemreasConstants::S3BUCKET, $s3Object::ACL_PUBLIC_READ_WRITE );
			
			$result = $s3Object->putObjectFile ( $server_source_file, MemreasConstants::S3BUCKET, $target_file, $s3Object::ACL_PUBLIC_READ_WRITE, array (), 'audio/wav' );
			
			// Add this edited media as a new media
			$action = 'addmediaevent';
			$xml = "<xml>";
			$xml .= "<addmediaevent>";
			$xml .= "<s3url>" . $filename . "</s3url>";
			$xml .= "<is_server_image>0</is_server_image>";
			$xml .= "<content_type>audio/wav</content_type>";
			$xml .= "<s3path>" . $user_id . "/media/audio/</s3path>";
			$xml .= "<s3file_name>" . $filename . "</s3file_name>";
			$xml .= "<device_id></device_id>";
			$xml .= "<event_id>" . $event_id . "</event_id>";
			$xml .= "<media_id>{$media_id}</media_id>";
			$xml .= "<user_id>" . $user_id . "</user_id>";
			$xml .= "<is_profile_pic>0</is_profile_pic>";
			$xml .= "<location></location>";
			$xml .= "</addmediaevent>";
			$xml .= "</xml>";
			$result = $this->fetchXML ( $action, $xml );
			
			$data = simplexml_load_string ( $result );
			if ($data->addmediaeventresponse->status == 'Success') {
				$audio_comment_id = $data->addmediaeventresponse->media_id;
				$xml_add_comment = '<xml>';
				$xml_add_comment .= '<addcomment>';
				$xml_add_comment .= '<event_id>' . $event_id . '</event_id>';
				$xml_add_comment .= '<media_id>' . $media_id . '</media_id>';
				$xml_add_comment .= '<user_id>' . $user_id . '</user_id>';
				$xml_add_comment .= '<comments>audio comment</comments>';
				$xml_add_comment .= '<audio_media_id>' . $audio_comment_id . '</audio_media_id >';
				$xml_add_comment .= '</addcomment>';
				$xml_add_comment .= '</xml>';
				
				$result = $this->fetchXML ( 'addcomments', $xml_add_comment );
				$data = simplexml_load_string ( $result );
				
				$message = "Comment added";
			} else
				$message = $data->addmediaeventresponse->message;
			header ( "Content-type: text/plain" );
			echo $message;
			die (); // For ajax calling only
		}
		die ();
	}
	private function createAudioFilename($user_id) {
		// MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		$this->memreas_session ();
		$unique = uniqid ();
		$today = date ( 'm-d-Y' );
		$filename = $user_id . '-' . $unique . '-comment-' . $today . '.wav';
		if (file_exists ( $filename ))
			$this->createAudioFilename ( $user_id );
		else
			return $filename;
	}
	public function error500Action() {
		// MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		$this->memreas_session ();
		$path = "application/index/500.phtml";
		$view = new ViewModel ();
		$view->setTemplate ( $path ); // path to phtml file under view folder
		return $view;
	}
	
	// This is used for add profile pic at registration page when user still
	// login
	public function setTokenAction() {
		// MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		$this->memreas_session ();
		$_SESSION [".$_POST ['sid']."];
		die ();
	}
	
	/*
	 * For image downloading
	 */
	public function downloadMediaAction() {
		// MLog::addone ( __CLASS__ . __METHOD__ . __LINE__, '::enter' );
		$this->memreas_session ();
		$requestUrl = $_SERVER ['SERVER_NAME'] . $_SERVER ['REQUEST_URI'];
		$requestUrl = explode ( "?", $requestUrl );
		$requestUrl = str_replace ( "file=", "", $requestUrl [1] ) . '?' . $requestUrl [2];
		$image_size = strlen ( file_get_contents ( $requestUrl ) );
		$filename = explode ( "?", $_GET ['file'] );
		$filename = explode ( "/", $filename [0] );
		$filename = $filename [count ( $filename ) - 1];
		header ( "Content-Description: File Transfer" );
		header ( "Content-Type: application/force-download" );
		header ( "Content-Disposition: attachment;filename=" . $filename );
		header ( "Content-Transfer-Encoding: binary" );
		header ( "Expires: 0" );
		header ( "Cache-Control: must-revalidate" );
		header ( "Pragma: public" );
		header ( "Content-Length:" . $image_size );
		echo file_get_contents ( $requestUrl );
		die ();
	}
	public function fetchUserIPAddress() {
		/*
		 * Fetch the user's ip address
		 */
		// MLog::addone ( '$_SERVER [REMOTE_ADDR]', $_SERVER ['REMOTE_ADDR'] );
		// MLog::addone ( '$_SERVER [HTTP_X_FORWARDED_FOR]', $_SERVER ['HTTP_X_FORWARDED_FOR'] );
		if (! empty ( $_SERVER ['HTTP_X_FORWARDED_FOR'] )) {
			$ipAddress = $_SERVER ['HTTP_X_FORWARDED_FOR'];
		} else {
			$ipAddress = $_SERVER ['REMOTE_ADDR'];
		}
		
		return $ipAddress;
	}
	public function memreas_session() {
		$cm = __CLASS__ . __METHOD__;
		// Mlog::addone ( $cm . __LINE__ . '::', 'enter' );
		if (session_status () !== PHP_SESSION_ACTIVE) {
			// Mlog::addone ( $cm . __LINE__ . '::', '...' );
			if (! empty ( $_COOKIE ['memreascookie'] )) {
				session_id ( $_COOKIE ['memreascookie'] );
				session_start ();
			} else {
				// must be login so startup session
				session_start ();
			}
		} else {
			// session is active so set session id
			session_id ( $_COOKIE ['memreascookie'] );
			// Mlog::addone ( $cm . __LINE__ . '::$_SESSION-->', $_SESSION );
		}
		
		// Mlog::addone ( $cm . __LINE__ . '::$_COOKIE', $_COOKIE );
		// Mlog::addone ( $cm . __LINE__ . '::$_SESSION', $_SESSION );
		if (! empty ( $_SESSION )) {
			// Mlog::addone ( $cm . __LINE__ . '::', '...' );
			if (isset ( $_SESSION ['LAST_ACTIVITY'] ) && (time () - $_SESSION ['LAST_ACTIVITY'] > 1800)) {
				// last request was more than 30 minutes ago
				session_unset (); // unset $_SESSION variable for the run-time
				session_destroy (); // destroy session data in storage
			}
			$_SESSION ['LAST_ACTIVITY'] = time ();
			// update last activity time stamp
			// Mlog::addone ( $cm . __LINE__ . '::$_SESSION[LAST_ACTIVITY]', gmdate ( "Y-m-d\TH:i:s\Z", $_SESSION ['LAST_ACTIVITY'] ) );
		}
	}
	
	/**
	 * Action to return Public Page
	 */
	public function publicAction() {
		$type = ! empty ( $_REQUEST ["type"] ) ? $_REQUEST ["type"] : '';
		
		if (! empty ( $type ) && ($type [0] == '@')) {
			//
			// url ex. http://127.0.0.1:55151/index/public?type=@jmeah1
			//
			$name = substr ( $type, 1 );
			$tag = $type [0];
			$path = "application/index/public_person_page.phtml";
			$enableAdvertising = MemreasConstants::MEMREAS_ADS;
			$view = new ViewModel ( array (
					'enableAdvertising' => $enableAdvertising,
					'type' => $type,
					'tag' => $tag,
					'name' => $name 
			) );
			$view->setTemplate ( $path ); // path to phtml file under view folder
		} else if (! empty ( $type ) && ($type [0] == '!')) {
			//
			// url ex. https://fe.memreas.com/index/public?type=!test video public
			// note on enter spaces change to %20 for encoding
			//
			$name = substr ( $type, 1 );
			$tag = $type [0];
			$path = "application/index/public_memreas_page.phtml";
			$enableAdvertising = MemreasConstants::MEMREAS_ADS;
			$view = new ViewModel ( array (
					'enableAdvertising' => $enableAdvertising,
					'type' => $type,
					'tag' => $tag,
					'name' => $name 
			) );
			$view->setTemplate ( $path ); // path to phtml file under view folder
		} else {
			$path = "application/index/public_page.phtml";
			$enableAdvertising = MemreasConstants::MEMREAS_ADS;
			$view = new ViewModel ( array (
					'enableAdvertising' => $enableAdvertising,
					'public_url' => MemreasConstants::MEMREAS_WS 
			) );
			$view->setTemplate ( $path ); // path to phtml file under view folder
		}
		
		return $view;
	}
	
	/**
	 * Action to return Mobile Registration Page
	 */
	public function mobileAction() {
		$path = $this->security ( "application/index/mobile-registration.phtml" );
		$view = new ViewModel ( array (
				'data' => $data 
		) );
		$view->setTemplate ( $path ); // path to phtml file under view
		                              // folder
		return $view;
	}
	
	/**
	 * Action to return Public Person Page
	 */
	public function publicMemreasAction() {
		$path = "application/index/memreas_page.phtml";
		$enableAdvertising = MemreasConstants::MEMREAS_ADS;
		$view = new ViewModel ( array (
				'enableAdvertising' => $enableAdvertising 
		) );
		$view->setTemplate ( $path ); // path to phtml file under view folder
		return $view;
	}
} // end class IndexController

