<?php

/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2012 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 *
 */
namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\ViewModel\JsonModel;
use Application\memreas\Mlog;
use Application\Model;
use Application\Model\UserTable;
use Application\Form;
use Zend\Mail\Message;
use Application\TwitterOAuth\TwitterOAuth;
use \Exception;
use Application\Model\MemreasConstants;

class IndexController extends AbstractActionController {
	protected $url = MemreasConstants::MEMREAS_WS;
	protected $stripe_url = MemreasConstants::MEMREAS_PAY;
	protected $user_id;
	protected $storage;
	protected $authservice;
	protected $session;
	protected $sid;
	protected $ipAddress;
	public function fetchXML($action, $xml) {
		$this->memreas_session ();
		/**
		 * Handle session and fetch sid
		 */
		
		/*
		 * If sid is available and missing inject it...
		 */
		$data = simplexml_load_string ( $xml );
		if (empty ( $data->memreascookie )) {
			$data->memreascookie = $_COOKIE ['memreascookie'];
			$data->addChild ( 'clientIPAddress', $this->fetchUserIPAddress () );
			$xml = $data->asXML ();
			error_log ( '$xml-->' . $xml );
		}
		
		/*
		 * Fetch guzzle and post...
		 */
		$guzzle = new \GuzzleHttp\Client ();
		Mlog::addone ( __CLASS__ . __METHOD__ . 'about to guzzle url+action+xml', $this->url . $action . $xml );
		try {
			$response = $guzzle->post ( $this->url, [ 
					'form_params' => [ 
							'action' => $action,
							'xml' => $xml 
					] 
			] );
		} catch ( \Exception $exc ) {
			Mlog::addone ( __CLASS__ . __METHOD__ . 'guzzle exception::', $exc->getMessage () );
		}
		
		Mlog::addone ( __CLASS__ . __METHOD__ . 'about to guzzle url+action+xml', $this->url . $action . $xml );
		
		error_log ( '$response->getBody ()---->' . $response->getBody () );
		
		return $response->getBody ();
	}
	public function indexAction() {
		Mlog::addone ( __CLASS__ . __METHOD__ . 'enter', 'indexAction' );
		// Start buffering so cookies are set
		//
		// Check Headers sent
		//
		error_log ( __CLASS__ . __METHOD__ . __LINE__ . "headers_list()" . print_r ( headers_list (), true ) . PHP_EOL );
		
		ob_start ();
		$actionname = isset ( $_REQUEST ["action"] ) ? $_REQUEST ["action"] : '';
		if ($actionname == "clearlog") {
			/*
			 * Cache Approach: N/a
			 */
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
			Mlog::addone ( __CLASS__ . __METHOD . __LINE . "showlog-->", "called..." );
			$result = '<pre>' . file_get_contents ( getcwd () . '/php_errors.log' );
			echo $result;
			// End buffering and flush
			ob_end_flush ();
			exit ();
		} else {
			
			$this->memreas_session ();
			error_log ( "Enter FE indexAction" . PHP_EOL );
			// Checking headers for cookie info
			$headers = apache_request_headers ();
			foreach ( $headers as $header => $value ) {
				error_log ( "FE header: $header :: value: $value" . PHP_EOL );
			}
			// End Checking headers for cookie info
			
			$path = $this->security ( "application/index/index.phtml" );
			$data ['bucket'] = MemreasConstants::S3BUCKET;
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
			// error_log('$callback--->'.$callback.PHP_EOL);
			// error_log('$json--->'.$json.PHP_EOL);
			
			// Setup the URL and action
			$ws_action = $message_data ['ws_action'];
			$type = $message_data ['type'];
			$xml = $message_data ['json'];
			
			// Guzzle the Web Service
			Mlog::addone ( '$this->fetchXML ( $ws_action, $xml )', "this->fetchXML ( $ws_action, $xml )" );
			$result = $this->fetchXML ( $ws_action, $xml );
			Mlog::addone ( '$result--->', $result );
			$json = json_encode ( $result );
			
			// Handle session
			$this->handleWSSession ( $ws_action, $result );
			$json = json_encode ( trim ( $result ) );
			
			// Return the ajax call...
			$callback_json = $callback . "(" . $json . ")";
			$output = ob_get_clean ();
			header ( "Content-type: plain/text" );
			echo $callback_json;
			
			// Mlog::addone ( __CLASS__ . __METHOD__ . __LINE__ .
			// '$callback_json', $callback_json );
			
			Mlog::addone ( __CLASS__ . __METHOD__ . __LINE__, 'exit' );
			// Need to exit here to avoid ZF2 framework view.
			exit ();
		} else {
			// $path = $this->security ( "application/index/sample-ajax.phtml"
			// );
			// $view = new ViewModel ();
			// ->setTemplate ( $path ); // path to phtml file under view folder
		}
		
		return $view;
	}
	private function handleWSSession($action, $result) {
		if ($action == 'login') {
			/**
			 * Handle login
			 */
			$data = simplexml_load_string ( trim ( $result ) );
			$_SESSION ['user_id'] = ( string ) $data->loginresponse->user_id;
			$_SESSION ['username'] = ( string ) $data->loginresponse->username;
			$this->memreas_session ();
		} else if ($action == 'logout') {
			$this->memreas_session ();
			/**
			 * Handle logout
			 */
			$data = simplexml_load_string ( trim ( $result ) );
			session_destroy ();
		}
	}
	private function setSignedCookie($name, $val, $domain) {
		// using our own implementation because
		// using php setcookie means the values are URL encoded and then AWS CF fails
		header ( "Set-Cookie: $name=$val; path=/; domain=$domain; secure; httpOnly", false );
	}
	private function getS3Key() {
		$this->memreas_session ();
		$action = 'memreas_tvm';
		$xml = '<xml><username>' . $_SESSION ['username'] . '</username><memreas_tvm>1</memreas_tvm></xml>';
		$s3Authenticate = $this->fetchXML ( $action, $xml );
		return $s3Authenticate;
	}
	public function fetchMemreasTVMAction() {
		header ( 'ContentType: application/json' );
		echo $this->getS3Key ();
		die ();
	}
	private function fetchMemreasTVMPreSignedURLAction() {
		$this->memreas_session ();
		$action = 'memreas_tvm';
		$xml = '<xml><username>' . $_SESSION ['username'] . '</username><memreas_tvm>0</memreas_tvm><memreas_pre_signed_url>1</memreas_pre_signed_url></xml>';
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
		$this->memreas_session ();
		// error_log ( 'Inside memreasAction...' . PHP_EOL );
		// Configure Ads on page
		$enableAdvertising = MemreasConstants::MEMREAS_ADS;
		$payment_tabs = array (
				'Subscription' => MemreasConstants::PAYMENT_TAB_SUBSCRIPTION,
				'BuyCredit' => MemreasConstants::PAYMENT_TAB_BUY_CREDIT,
				'SellMedia' => MemreasConstants::PAYMENT_TAB_SELL_MEDIA 
		);
		
		// Guzzle the LoginWeb Service
		$user_id = $_SESSION ['user_id'];
		$data ['userid'] = $user_id;
		$data ['bucket'] = MemreasConstants::S3BUCKET;
		$s3Token = $this->getS3Key ();
		
		// Pass constant global variables to js global constant
		$this->writeJsConstants ();
		
		$path = "application/index/memreas_one_page.phtml";
		error_log ( 'routing to $path--->' . $path );
		
		$view = new ViewModel ( array (
				'data' => $s3Token,
				'enableAdvertising' => $enableAdvertising,
				'enableSellMedia' => MemreasConstants::MEMREAS_SELL_MEDIA,
				'stripeUrl' => $this->stripe_url,
				'PaymentTabs' => $payment_tabs,
				'app_version' => MemreasConstants::VERSION 
		) );
		// error_log ( 'Inside memreasAction path---->' . $path . PHP_EOL );
		
		$view->setTemplate ( $path ); // path to phtml file under view folder
		return $view;
	}
	
	/*
	 * Canvas page
	 */
	public function canvasAction() {
		$this->memreas_session ();
		$event_id = $_GET ['event'];
		if (empty ( $event_id ))
			$path = $this->security ( "application/index/fb_default.phtml" );
		else
			$path = $this->security ( "application/index/canvas.phtml" );
		$view = new ViewModel ( array (
				"event_id" => $event_id 
		) );
		$view->setTemplate ( $path );
		return $view;
	}
	
	/*
	 * Write constant to javascript
	 */
	public function writeJsConstants() {
		$this->memreas_session ();
		// Put constant variables here
		$JsConstantVariables = array (
				'S3BUCKET' => MemreasConstants::S3BUCKET,
				'LOGGED_USER_ID' => $_SESSION ['user_id'],
				'LISTNOTIFICATIONSPOLLTIME' => MemreasConstants::LISTNOTIFICATIONSPOLLTIME,
				'GALLERYDELAYTIME' => MemreasConstants::GALLERYDELAYTIME,
				'FREE_ACCOUNT_FILE_LIMIT' => MemreasConstants::FREE_ACCOUNT_FILE_LIMIT,
				'PAID_ACCOUNT_FILE_LIMIT' => MemreasConstants::PAID_ACCOUNT_FILE_LIMIT,
				'CLOUDFRONT_DOWNLOAD_HOST' => MemreasConstants::CLOUDFRONT_DOWNLOAD_HOST,
				'STRIPE_SERVER_URL' => MemreasConstants::MEMREAS_PAY,
				'ENABLE_SELL_MEDIA' => MemreasConstants::MEMREAS_SELL_MEDIA 
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
	}
	
	/*
	 * Login Action
	 */
	public function loginAction() {
		Mlog::addone ( 'Enter::', 'loginAction()' );
		$this->memreas_session ();
		// error_log ( "Inside loginAction" . PHP_EOL );
		
		// Fetch the post data
		$request = $this->getRequest ();
		$postData = $request->getPost ()->toArray ();
		
		$username = $postData ['username'];
		// $password = $postData ['password'];
		$userid = $postData ['status_user_id'];
		if (empty ( $userid )) {
			Mlog::addone ( 'Returning view::', 'this->redirect ()->toRoute ( index, array (action => index) )' );
			return $this->redirect ()->toRoute ( 'index', array (
					'action' => "index" 
			) );
		} else {
			Mlog::addone ( 'Returning view::', 'this->redirect ()->toRoute ( index, array (action => memreas) )' );
			return $this->redirect ()->toRoute ( 'index', array (
					'action' => 'memreas' 
			) );
		}
	}
	public function logoutAction() {
		$this->memreas_session ();
		/**
		 * Logout FE Server
		 */
		// $this->getSessionStorage ()->forgetMe ();
		// $this->getAuthService ()->clearIdentity ();
		// $session = new Container ( 'user' );
		session_destroy ();
		
		return $this->redirect ()->toRoute ( 'index', array (
				'action' => "index" 
		) );
	}
	public function changepasswordAction() {
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
		$this->memreas_session ();
		$path = "application/index/500.phtml";
		$view = new ViewModel ();
		$view->setTemplate ( $path ); // path to phtml file under view folder
		return $view;
	}
	
	// This is used for add profile pic at registration page when user still
	// login
	public function setTokenAction() {
		$this->memreas_session ();
		$_SESSION [".$_POST ['sid']."];
		die ();
	}
	
	/*
	 * For image downloading
	 */
	public function downloadMediaAction() {
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
		$this->memreas_session ();
		/*
		 * Fetch the user's ip address
		 */
		$this->ipAddress = $this->getServiceLocator ()->get ( 'Request' )->getServer ( 'REMOTE_ADDR' );
		if (! empty ( $_SERVER ['HTTP_CLIENT_IP'] )) {
			$this->ipAddress = $_SERVER ['HTTP_CLIENT_IP'];
		} else if (! empty ( $_SERVER ['HTTP_X_FORWARDED_FOR'] )) {
			$this->ipAddress = $_SERVER ['HTTP_X_FORWARDED_FOR'];
		} else {
			$this->ipAddress = $_SERVER ['REMOTE_ADDR'];
		}
		error_log ( 'ip is ' . $this->ipAddress );
		
		return $this->ipAddress;
	}
	public function memreas_session() {
		if (session_status () !== PHP_SESSION_ACTIVE) {
			session_start ();
			// error_log('$_COOKIE---->'.print_r($_COOKIE, true));
			// error_log('$_SESSION---->'.print_r($_SESSION, true));
		}
	}
} // end class IndexController

// /* For S3 */
// 	public function s3signedAction() {
// 		$this->memreas_session ();
// 		$data ['bucket'] = MemreasConstants::S3BUCKET;
		
// 		$data ['accesskey'] = MemreasConstants::S3_APPKEY;
// 		$data ['secret'] = MemreasConstants::S3_APPSEC;
		
// 		$policy = $this->getS3Policy ();
// 		$hmac = $this->hmacsha1 ( $data ['secret'], $policy );
// 		$json_object = array (
// 				'accessKey' => $data ['accesskey'],
// 				'policy' => $policy,
// 				'signature' => $this->hex2b64 ( $hmac ) 
// 		);
// 		header ( 'ContentType: application/json' );
// 		echo json_encode ( $json_object );
// 		die ();
// 	}
// private function getS3Policy() {
// 	$this->memreas_session ();
// 	$now = strtotime ( date ( "Y-m-d\TG:i:s" ) );
// 	$expire = date ( 'Y-m-d\TG:i:s\Z', strtotime ( '+30 minutes', $now ) );
// 	$policy = '{
//                     "expiration": "' . $expire . '",
//                     "conditions": [
//                         {
//                             "bucket": "' . MemreasConstants::S3BUCKET . '"
//     					},
//                         {
//                             "acl": "public-read"
//                         },
//                         [
//                             "starts-with",
//                             "$key",
//                             ""
//                         ],
//                         {
//                             "success_action_status": "201"
//                         },
//                         ["starts-with", "$Content-Type", ""],
//                         ["content-length-range", 0, 5000000000]
//                     ]
//                 }';
// 	/*
// 	 * Changed support 5GB
// 	 */
// 	// 4GB file supported
// 	return base64_encode ( $policy );
// }

// /*
//  * Calculate HMAC-SHA1 according to RFC2104
//  * See http://www.faqs.org/rfcs/rfc2104.html
//  */
// private function hmacsha1($key, $data) {
// 	$this->memreas_session ();
// 	$blocksize = 64;
// 	$hashfunc = 'sha1';
// 	if (strlen ( $key ) > $blocksize)
// 		$key = pack ( 'H*', $hashfunc ( $key ) );
// 	$key = str_pad ( $key, $blocksize, chr ( 0x00 ) );
// 	$ipad = str_repeat ( chr ( 0x36 ), $blocksize );
// 	$opad = str_repeat ( chr ( 0x5c ), $blocksize );
// 	$hmac = pack ( 'H*', $hashfunc ( ($key ^ $opad) . pack ( 'H*', $hashfunc ( ($key ^ $ipad) . $data ) ) ) );

// 	return bin2hex ( $hmac );
// }

// /*
//  * Used to encode a field for Amazon Auth
//  * (taken from the Amazon S3 PHP example library)
//  */
// private function hex2b64($str) {
// 	$this->memreas_session ();
// 	$raw = '';
// 	for($i = 0; $i < strlen ( $str ); $i += 2) {
// 		$raw .= chr ( hexdec ( substr ( $str, $i, 2 ) ) );
// 	}
// 	return base64_encode ( $raw );
// }