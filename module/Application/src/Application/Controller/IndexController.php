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

use Zend\Db\Adapter\Adapter;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\ViewModel\JsonModel;
use Zend\Session\Container;
use Application\Model;
use Application\Model\UserTable;
use Application\Form;
use Zend\Mail\Message;
use Zend\Mail\Transport\Sendmail as SendmailTransport;
use Guzzle\Http\Client;
use Application\View\Helper\S3Service;
use Application\View\Helper\S3;
use Application\TwitterOAuth\TwitterOAuth;
use \Exception;
use Application\Model\MemreasConstants;


class IndexController extends AbstractActionController
{
	//Updated....
    protected $url = MemreasConstants::MEMREAS_WS; //Local development
    //protected $url = 'http://memreas-dev-ws.localhost'; //Local development
    protected $stripe_url = MemreasConstants::MEMREAS_PAY;
    //protected $stripe_url = "http://memreas-dev-stripe.localhost";
    protected $user_id;
    protected $storage;
    protected $authservice;
    protected $userTable;
    protected $eventTable;
    protected $mediaTable;
    protected $friendmediaTable;
    protected $session;


    public function fetchXML($action, $xml) {
        $session = $this->getAuthService()->getIdentity();
	    $guzzle = new Client();
//error_log("Inside fetch XML request url ---> " . $this->url . PHP_EOL);
//error_log("Inside fetch XML request action ---> " . $action . PHP_EOL);
//error_log("Inside fetch XML request XML ---> " . $xml . PHP_EOL);
        $request = $guzzle->post(
		    $this->url,
		    null,
		    array(
		    'action' => $action,
		    //'cache_me' => true,
    	    'xml' => $xml,
            'sid' => $this->getToken(),
            'user_id' => empty($_SESSION['user']['user_id'])?'':$_SESSION['user']['user_id']
	        )
	    );
	    $response = $request->send();
//error_log("Inside fetch XML response ---> " . $response->getBody(true) . PHP_EOL);
//error_log("Exit fetchXML".PHP_EOL);
		return $data = $response->getBody(true);
	}

    public function indexAction() {
error_log("Enter FE indexAction".PHP_EOL);

        $path = $this->security("application/index/index.phtml");
        $data['bucket'] = MemreasConstants::S3BUCKET;
        $view = new ViewModel(array('data' => $data));
		$view->setTemplate($path); // path to phtml file under view folder

		return $view;
    }

    /*
    * Prepare cache for video viewing on main Gallery Page
    * @Return: file with video has been cached
    */
    public function buildvideocacheAction(){
        if (isset ($_POST['video_url'])){
            $cache_dir = $_SERVER['DOCUMENT_ROOT'] . '/memreas/js/jwplayer/jwplayer_cache/';
            $hls_media = $_POST['hls_media'];
            $video_name = explode ("/", $_POST['video_url']);
            $video_name = $video_name[count ($video_name) - 1];
            if ($hls_media) $video_name .= $hls_media;
            $cache_file = $this->generateVideoCacheFile ($cache_dir, $video_name);
            $file_handle = fopen ($cache_dir . $cache_file, 'w');
            if ($hls_media){
                $thumbnail = explode(",", $_POST['thumbnail']);
                $thumbnail = $thumbnail[0];
                $flashPlayerContent = 'flashplayer: "../jwplayer.flash.swf",
                                        "controlbar":"bottom",
                                        "playlist":[
                                            {image:"' . $thumbnail . '",
                                                sources:[
                                                    {label: "480p", file:"' . $_POST['video_url'] . '", default:true},
                                                    {label: "720p", file:"' . $_POST['video_url'] . '"},
                                                    {label: "1080p", file:"' . $_POST['mp4_media'] . '"},
                                                ]
                                            }],
                                        "width": 500, "height": 300, "aspectratio": "16:9", "primary":"flash",
                                         "skin": "/memreas/js/jwplayer/bekle.xml", allowfullscreen: true, autostart: true';
            }
            else{
                $flashPlayerContent = 'flashplayer: "../jwplayer.flash.swf", file: "' . $_POST['video_url'] . '",
                                    "autostart": "true", "controlbar.position":"bottom", "controlbar.idlehide":"false",
                                    "width": 500, "height": 300, aspectratio: "16:9",
                                    "skin": "/memreas/js/jwplayer/bekle.xml"';
            }
            $content = $this->renderJWPlayerCache($flashPlayerContent);
            fwrite ($file_handle, $content, 5000);
            fclose ($file_handle);
            $response = array ('video_link' => $cache_file, 'thumbnail' => isset ($_POST['thumbnail']) ? $thumbnail : '/memreas/img/large-pic-1.jpg', 'media_id' => $_POST['media_id']);
            echo json_encode ($response);
        }
        exit();
    }

    private function renderJWPlayerCache($initContent){
        $jwPlayerTemplate = $_SERVER['DOCUMENT_ROOT'] . '/memreas/js/jwplayer/template.phtml';
        $fileHandle = fopen($jwPlayerTemplate, 'r');
        $content = fread($fileHandle, filesize($jwPlayerTemplate));
        $content = str_replace('{CONTENT_FLASH}', $initContent, $content);
        return $content;
    }

    /*
    * Support sub function for buildvideocache function
    */
    private function generateVideoCacheFile($cache_dir, $video_name){
        $cache_file = uniqid('jwcache_') . substr (md5($video_name), 0, 10) . '.html';
        if (!file_exists ($cache_file)) return $cache_file;
        else $this->generateVideoCacheFile ($cache_dir, $video_name);
    }

    public function execAjaxAction() {
		if (isset($_REQUEST['callback'])) {

			//Fetch parms
			$callback = $_REQUEST['callback'];
			$json = $_REQUEST['json'];
			$message_data = json_decode($json, true);

			//Setup the URL and action
			$ws_action = $message_data['ws_action'];
			$type = $message_data['type'];
			$xml = $message_data['json'];

			//Guzzle the LoginWeb Service
			$result = $this->fetchXML($ws_action, $xml);
			$json = json_encode($result);

			//Return the ajax call...
			$callback_json = $callback . "(" . $json . ")";
			$output = ob_get_clean();
			header("Content-type: plain/text");
			echo $callback_json;
error_log("callback_json----->".$callback_json.PHP_EOL);

            //Need to exit here to avoid ZF2 framework view.
			exit;
		} else {
            $path = $this->security("application/index/sample-ajax.phtml");
			$view = new ViewModel();
			$view->setTemplate($path); // path to phtml file under view folder
		}

		return $view;
    }

    private function getS3Key(){
        $action = 'memreas_tvm';
        $xml = '<xml><memreas_tvm></memreas_tvm></xml>';
        $s3Authenticate = $this->fetchXML($action, $xml);
        return json_decode($s3Authenticate);
    }

    /*
    * Generate S3 signatures and credentials
    * @ Tran Tuan
    * @ Return: json Object
    */
    public function s3signedAction(){
        $data['bucket'] = MemreasConstants::S3BUCKET;

        $data['accesskey'] = MemreasConstants::S3_APPKEY;
        $data['secret'] = MemreasConstants::S3_APPSEC;

        /*$s3Authenticate = json_decode($this->getS3Key());
        $data['accessKey'] = $s3Authenticate['AccessKeyId'];
        $data['secret'] = $s3Authenticate['SecretAccessKey'];*/

        $policy = $this->getS3Policy();
        $hmac = $this->hmacsha1($data['secret'], $policy);
        $json_object = array(
                                'accessKey' => $data['accesskey'],
                                'policy' => $policy,
                                'signature' => $this->hex2b64($hmac)
                            );
        header ('ContentType: application/json');
        echo json_encode($json_object); die();
    }

    /*
    * Main page for frontend
    * @ Tran Tuan
    */
    public function memreasAction(){
        $action = 'getsession';
        $xml = '<xml><getsession><sid>1</sid></getsession></xml>';
        //Configure Ads on page
        $enableAdvertising = MemreasConstants::MEMREAS_ADS;
        $payment_tabs = array(
            'Subscription' => MemreasConstants::PAYMENT_TAB_SUBSCRIPTION,
            'BuyCredit' => MemreasConstants::PAYMENT_TAB_BUY_CREDIT,
            'SellMedia' => MemreasConstants::PAYMENT_TAB_SELL_MEDIA
        );

        //Guzzle the LoginWeb Service
        $user = simplexml_load_string($this->fetchXML($action, $xml));
        $session = new Container('user');
        $user_id = $session->user_id;

        //if (!$user) return $this->redirect()->toRoute('index', array('action' => "index"));
        $data['userid'] = $user_id;
        $data['sid'] = $session->sid;


        $data['bucket'] = MemreasConstants::S3BUCKET;
        $data['accesskey'] = MemreasConstants::S3_APPKEY;
        $data['secret'] = MemreasConstants::S3_APPSEC;

        $data['base64Policy'] = $this->getS3Policy();
        $data['signature'] = $this->hex2b64($this->hmacsha1($data['secret'], $data['base64Policy']));

        $path = "application/index/memreas.phtml";
        $view = new ViewModel(array(
            'data' => $data,
            'enableAdvertising' => $enableAdvertising,
            'stripeUrl' => $this->stripe_url,
            'PaymentTabs' => $payment_tabs
        ));
        $view->setTemplate($path); // path to phtml file under view folder
        return $view;
    }

   /*
   * Twitter authentication and fetching friends
   * @Return: friend list after user has been authenticated
   */
    public function twitterAction() {
        $server_url = $this->getRequest()->getServer('HTTP_HOST');
        $callback_url = (strpos ($server_url, 'localhost')) ? 'http://memreas-dev-php-frontend.localhost/index/twitter' : 'http://memreasdev-frontend.elasticbeanstalk.com/index/twitter';
        $config = new \Application\OAuth\Config();
        /*
        *OLD API
        * APP ID: 1bqpAfSWfZFuEeY3rbsKrw
        * SECRET: wM0gGBCzZKl5dLRB8TQydRDfTD5ocf2hGRKSQwag
        *
        * NEW API For Online App
        *  APP ID : vKv8HUdQ4OP2mClSuOqtjA
        *  SECRET : 0pc7NHkFsCVYn86xLLZAhzU87yY184vhMZFnjKwzwXo
        */
        if (strpos ($server_url, 'localhost')){
            //Localhost development
            $appKey = '1bqpAfSWfZFuEeY3rbsKrw';
            $appSecret = 'wM0gGBCzZKl5dLRB8TQydRDfTD5ocf2hGRKSQwag';
        }
        else{
            //Live development
            $appKey = '9jwg1vX4MgH7rfBzxqkcjI90f';
            $appSecret = 'bDqOeHkJ7OIQ4QPNnT1PA9oz55gf51YW0REBo12aazGA0CBrbY';
        }
        $config->setConsumerKey($appKey)
            ->setConsumerSecret($appSecret)
            ->setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
            ->setAuthorizeUrl('https://api.twitter.com/oauth/authenticate')
            ->setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
            ->setCallbackUrl($callback_url);

        if(!empty($_GET['oauth_token'])){
            $authorizeToken = new \Application\OAuth\Token\Authorize($_GET);
            if (!$authorizeToken->isValid()) {
                throw new Exception('Authorization failed');
            }

            // fetch previously stored request token
            $requestToken = unserialize($_SESSION['twitter_request_token']);
            if (!$requestToken instanceof \Application\OAuth\Token\Request) {
                throw new Exception('Request token not found');
                error_log('Twitter action : Request token not found');
            }

            // a possible CSRF attack
            if ($requestToken->getToken() !== $authorizeToken->getToken()) {
                throw new Exception('Tokens do not match');
                error_log('Twitter action : Tokens do not match');
            }

            $accessToken = new \Application\OAuth\Token\Access($config, $authorizeToken, true);
            if (!$accessToken->isValid()) {
                throw new Exception('Could not fetch access token');
                error_log('Twitter action : Could not fetch access token');
            }

            unset($_SESSION['twitter_request_token']);

            // at this point authentication is successful and you will have the following
            // two properties available on the access token object if you authenticated on Twitter:
            $userId = $accessToken['user_id'];
            $screenName = $accessToken['screen_name'];
            $config = array();
             if (strpos ($server_url, 'localhost')){
                //Localhost development
                $config['consumer_key'] = '1bqpAfSWfZFuEeY3rbsKrw';
                $config['consumer_secret'] = 'wM0gGBCzZKl5dLRB8TQydRDfTD5ocf2hGRKSQwag';
            }
            else{
                $config['consumer_key'] = '9jwg1vX4MgH7rfBzxqkcjI90f';
                $config['consumer_secret'] = 'bDqOeHkJ7OIQ4QPNnT1PA9oz55gf51YW0REBo12aazGA0CBrbY';
            }
            $config['oauth_token'] = $accessToken['oauth_token'];
            $config['oauth_token_secret'] = $accessToken['oauth_token_secret'];
            $config['output_format'] = 'object';
            $tw = new TwitterOAuth($config);

            $params = array(
                'cursor'=> -1,
                'skip_status' => true,
                'include_user_entities' => false
            );

            $response =  $tw->get('friends/list', $params);
            $view = new ViewModel(array('data' => $response));
            $path = $this->security("application/index/twitter.phtml");
            $view->setTemplate($path);
            return $view;

        }else{
            $requestToken = new \Application\OAuth\Token\Request($config, true);
            $_SESSION['twitter_request_token'] = serialize($requestToken);

            // redirect to Twitter for authentication
            $targetUrl = $config->getAuthorizeUrl($requestToken['oauth_token']);
            $targetUrl ;
            header('Location:' . $targetUrl);exit;
        }
    }

    /*
    * Login Action
    */
    public function loginAction() {
error_log("Inside loginAction".PHP_EOL);
    	//Fetch the post data
		$request = $this->getRequest();
		$postData = $request->getPost()->toArray();
 		$username = $postData ['username'];
		//$password = $postData ['password'];
		$userid = $postData ['status_user_id'];
error_log("userid---->".$userid.PHP_EOL);
        if (empty ($userid)){
           return $this->redirect()->toRoute('index', array('action' => "index"));
        }
        else{
            $session = new Container('user');
            $session->offsetSet('user_id', $userid);
            $session->offsetSet('username', $username);
            $session->offsetSet('sid',  $postData ['sid']);
            return $this->redirect()->toRoute('index', array('action' => 'memreas'));
        }
        /* OLD
        $this->getAuthService()->getAdapter()->setUsername($username);
        $this->getAuthService()->getAdapter()->setPassword($password);
        $token = empty($this->session->token)?'':$this->session->token;
        $this->getAuthService()->getAdapter()->setToken($token);
        $result = $this->getAuthService()->authenticate();
 		//Setup the URL and action
		$action = 'login';
		$xml = "<xml><login><username>$username</username><password>$password</password></login></xml>";


		//Guzzle the LoginWeb Service
		$result = $this->fetchXML($action, $xml);

		$data = simplexml_load_string($result);
        if ($data->loginresponse->status == 'success'){
            $this->setSession($username);
            return $this->redirect()->toRoute('index', array('action' => $redirect));
        }
        else return $this->redirect()->toRoute('index', array('action' => "index"));
        //setcookie(session_name(),$data->loginresponse->sid,0,'/');

 		//ZF2 Authenticate
         $redirect = 'memreas';
		if ($result->getIdentity()) {
            error_log("Inside loginresponse success...");
            //	$this->setSession($username);
            //Redirect here
            error_log("Inside loginresponse success redirect ---> " . $redirect);
            $this->setSession($username);
			return $this->redirect()->toRoute('index', array('action' => $redirect));
		} else {
            error_log("Inside loginresponse else...");
			return $this->redirect()->toRoute('index', array('action' => "index"));
		}
        */
    }

    public function logoutAction() {
		$this->getSessionStorage()->forgetMe();
        $this->getAuthService()->clearIdentity();
        $session = new Container('user');
        $session->getManager()->destroy();

        return $this->redirect()->toRoute('index', array('action' => "index"));
    }

    public function setSession($username) {
		//Fetch the user's data and store it in the session...
        error_log("Inside setSession ...");
   	    $user = $this->getUserTable()->findOneBy(array('username' => $username));

        //$user->password='';
       	//$user->disable_account='';
   	    //$user->create_date='';
        //$user->update_time='';
		$session = new Container('user');
        error_log("Inside setSession got new Container...");
		$session->offsetSet('user_id', $user->user_id);
		$session->offsetSet('username', $username);
        $session->offsetSet('user', json_encode($user));
        error_log("Inside setSession set user data...");
    }

    /*
    * Support for Zend Table Gateway instance model
    */
    public function getUserTable() {
        if (!$this->userTable) {
            $sm = $this->getServiceLocator();
            $this->dbAdapter = $sm->get('doctrine.entitymanager.orm_default');
            $this->userTable =  $this->dbAdapter->getRepository('Application\Entity\User');
         }
        return $this->userTable;
    }

	public function changepasswordAction() {
        $request = $this->getRequest();
		$postData = $request->getPost()->toArray();

 		$new = isset($postData ['new'])?$postData ['new']:'';
		$retype = isset($postData ['reytpe'])?$postData ['reytpe']:'';
		$token = isset($postData ['token'])?$postData ['token']:'';

	 	//Setup the URL and action
		$action = 'forgotpassword';
		$xml = "<xml><changepassword><new>$new</new><retype>$retype</retype><token>$token</token></changepassword></xml>";
		//$redirect = 'gallery';

		//Guzzle the LoginWeb Service
		$result = $this->fetchXML($action, $xml);

        $data = simplexml_load_string($result);
        echo json_encode($data);
        return '';
    }

    public function getAuthService() {
        if (!$this->authservice) {
            $this->authservice = $this->getServiceLocator()
                    ->get('AuthService');
        }
        return $this->authservice;
    }

    public function getSessionStorage() {
        if (!$this->storage) {
            $this->storage = $this->getServiceLocator()
                    ->get('application\Model\MyAuthStorage');
        }
        return $this->storage;
    }

    public function security($path) {
    	//if already login do nothing
		//$session = new Container("user");
	    //if(!$session->offsetExists('user_id')){
		//	error_log("Not there so logout");
	    //	$this->logoutAction();
    	//  return "application/index/index.phtml";
	    //}
		return $path;
        //return $this->redirect()->toRoute('index', array('action' => 'login'));
    }

    /*For S3*/
    private function getS3Policy()
    {
        $now = strtotime(date("Y-m-d\TG:i:s"));
        $expire = date('Y-m-d\TG:i:s\Z', strtotime('+30 minutes', $now));
        $policy='{
                    "expiration": "' . $expire . '",
                    "conditions": [
                        {
                            "bucket": "' . MemreasConstants::S3BUCKET . '"
    					},
                        {
                            "acl": "public-read"
                        },
                        [
                            "starts-with",
                            "$key",
                            ""
                        ],
                        {
                            "success_action_status": "201"
                        },
                        ["starts-with", "$Content-Type", ""],
                        ["content-length-range", 0, 4004857600]
                    ]
                }'; //4GB file supported
        return base64_encode($policy);
    }

    /*
     * Calculate HMAC-SHA1 according to RFC2104
     * See http://www.faqs.org/rfcs/rfc2104.html
     */
    private function hmacsha1($key,$data) {
        $blocksize=64;
        $hashfunc='sha1';
        if (strlen($key)>$blocksize)
            $key=pack('H*', $hashfunc($key));
        $key=str_pad($key,$blocksize,chr(0x00));
        $ipad=str_repeat(chr(0x36),$blocksize);
        $opad=str_repeat(chr(0x5c),$blocksize);
        $hmac = pack(
                    'H*',$hashfunc(
                        ($key^$opad).pack(
                            'H*',$hashfunc(
                                ($key^$ipad).$data

                            )
                        )
                    )
                );
        return bin2hex($hmac);
    }

    /*
     * Used to encode a field for Amazon Auth
     * (taken from the Amazon S3 PHP example library)
     */
    private function hex2b64($str){
        $raw = '';
        for ($i=0; $i < strlen($str); $i+=2)
        {
            $raw .= chr(hexdec(substr($str, $i, 2)));
        }
        return base64_encode($raw);
    }

    public function getToken()
    {
        $session = new Container('user');
        error_log('fe-session -> '.print_r($session['sid'],true));
         return  empty($session['sid'])?'':$session['sid'];
    }

    public function editmediaAction(){
        $target_dir = getcwd() . '/app/memreas/temps_media_edit/';
        $s3Object = new S3(MemreasConstants::S3_APPKEY, MemreasConstants::S3_APPSEC);
        $file_source = $_POST['file_source'];
        $file_remote = $_POST['file_url'];

        $remote_filename = explode('/', $file_remote);
        $remote_filename = $remote_filename[count($remote_filename) - 1];

        $file_content = file_get_contents($file_remote);
        file_put_contents($target_dir . $remote_filename, $file_content);

        $server_source_file = $target_dir . $remote_filename;

        //$target_file = $_POST['user_id'] . '/image/' . $source_filename;
        $target_file = $_POST['user_id'] . '/image/' . $remote_filename;

        $s3Object->putBucket(MemreasConstants::S3BUCKET, $s3Object::ACL_PUBLIC_READ_WRITE);

        $result = $s3Object->putObjectFile($server_source_file, MemreasConstants::S3BUCKET, $target_file, $s3Object::ACL_PUBLIC_READ_WRITE, array(), 'image/jpeg');

        //Add this edited media as a new media
        $action = 'addmediaevent';
        $xml = "<xml>";
        $xml .= "<addmediaevent>";
        $xml .= "<s3url>" . $remote_filename . "</s3url>";
        $xml .= "<is_server_image>0</is_server_image>";
        $xml .= "<content_type>image/jpeg</content_type>";
        $xml .= "<s3path>" . $_POST['user_id'] . "image/</s3path>";
        $xml .= "<s3file_name>" .$remote_filename . "</s3file_name>";
        $xml .= "<device_id></device_id>";
        $xml .= "<event_id></event_id>";
        $xml .= "<media_id></media_id>";
        $xml .= "<user_id>" . $_POST['user_id'] . "</user_id>";
        $xml .= "<is_profile_pic>0</is_profile_pic>";
        $xml .= "<location></location>";
        $xml .= "</addmediaevent>";
        $xml .= "</xml>";
        $result = $this->fetchXML($action, $xml);

        $data = simplexml_load_string($result);
        if ($data->addmediaeventresponse->status == 'Success')
            echo 'Media updated';
        else echo 'Error while saving your media please try again';
        die(); // For ajax calling only
    }


    //Process user add comment
    public function audiocommentAction(){
        if( isset($_POST['file_data']))
        {
            $user_id = $_POST['user_id'];
            $event_id = $_POST['comment_event_id'];
            $target_dir = getcwd() . '/app/memreas/user_comment_files/' . $user_id . '/';
            $media_id = isset($_POST['media_id']) ? $_POST['media_id'] : '';
            $cad = $_POST['file_data'];

            //Check if user directory has created or not
            if (!file_exists($target_dir)){
                mkdir($target_dir, 0777);
            }

            //generate file name
            $filename = $this->createAudioFilename($user_id);
            $server_source_file = $target_dir . $filename;

            $stringas = explode(":",$cad);
            $type = explode(";", $stringas[1]);
            $base = explode(",", $type[1]);
            $base64 = $base[1];

            $fh = fopen($server_source_file, 'w');
            fwrite($fh, base64_decode($base64));

            //begin upload to S3
            $s3Object = new S3(MemreasConstants::S3_APPKEY, MemreasConstants::S3_APPSEC);
            $target_file = $user_id . '/media/audio/' . $filename;

            $s3Object->putBucket(MemreasConstants::S3BUCKET, $s3Object::ACL_PUBLIC_READ_WRITE);

            $result = $s3Object->putObjectFile($server_source_file, MemreasConstants::S3BUCKET, $target_file, $s3Object::ACL_PUBLIC_READ_WRITE, array(), 'audio/wav');

            //Add this edited media as a new media
            $action = 'addmediaevent';
            $xml = "<xml>";
            $xml .= "<addmediaevent>";
            $xml .= "<s3url>" . $filename . "</s3url>";
            $xml .= "<is_server_image>0</is_server_image>";
            $xml .= "<content_type>audio/wav</content_type>";
            $xml .= "<s3path>" . $user_id . "/media/audio/</s3path>";
            $xml .= "<s3file_name>" .$filename . "</s3file_name>";
            $xml .= "<device_id></device_id>";
            $xml .= "<event_id>" . $event_id . "</event_id>";
            $xml .= "<media_id>{$media_id}</media_id>";
            $xml .= "<user_id>" . $user_id . "</user_id>";
            $xml .= "<is_profile_pic>0</is_profile_pic>";
            $xml .= "<location></location>";
            $xml .= "</addmediaevent>";
            $xml .= "</xml>";
            $result = $this->fetchXML($action, $xml);

            $data = simplexml_load_string($result);
            if ($data->addmediaeventresponse->status == 'Success')
                echo 'Comment added successfully';
            else echo 'Error while saving your media please try again';
            die(); // For ajax calling only
        }
        die();
    }

    private function createAudioFilename($user_id){
        $unique = uniqid();
        $today = date('m-d-Y');
        $filename = $user_id . '-' . $unique . '-comment-' . $today . '.wav';
        if (file_exists($filename)) $this->createAudioFilename($user_id);
        else return $filename;
    }

    public function error500Action(){
        $path = "application/index/500.phtml";
        $view = new ViewModel();
        $view->setTemplate($path); // path to phtml file under view folder
        return $view;
    }

    //This is used for add profile pic at registration page when user still login
    public function setTokenAction(){
        $session = new Container('user');
        $session->offsetSet('sid',  $_POST ['sid']);
        die();
    }

} // end class IndexController
