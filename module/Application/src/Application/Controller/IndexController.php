<?php
/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2012 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

use Zend\Db\Adapter\Adapter;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
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

class IndexController extends AbstractActionController
{
	//Updated....
	protected $url = "http://memreasdev-ws.elasticbeanstalk.com/";
    //protected $url = "http://mem2/index.php/";
	protected $test = "Hope this works!";
    protected $user_id;
    protected $storage;
    protected $authservice;
    protected $userTable;
    protected $eventTable;
    protected $mediaTable;
    protected $friendmediaTable;

    public function fetchXML($action, $xml) {
	    $guzzle = new Client();
        error_log("Inside fetch XML request url ---> " . $this->url . PHP_EOL);
        error_log("Inside fetch XML request action ---> " . $action . PHP_EOL);
        error_log("Inside fetch XML request XML ---> " . $xml . PHP_EOL);
        $request = $guzzle->post(
		    $this->url,
		    null,
		    array(
		    'action' => $action,
		    //'cache_me' => true,
    	    'xml' => $xml,
            'PHPSESSID' => empty($_COOKIE[session_name()])?'':$_COOKIE[session_name()],
	        )
	    );
	    $response = $request->send();
        error_log("Inside fetch XML response ---> " . $response->getBody(true) . PHP_EOL);
        error_log("Exit fetchXML".PHP_EOL);
		return $data = $response->getBody(true);
	}

    public function indexAction() {
        error_log("Enter indexAction".PHP_EOL);
 	    $path = $this->security("application/index/index.phtml");
		$view = new ViewModel();
		$view->setTemplate($path); // path to phtml file under view folder
        error_log("Exit indexAction".PHP_EOL);
		return $view;
    }

    public function ApiServerSideAction(){
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
            //Need to exit here to avoid ZF2 framework view.
       }
       exit;
    }
    public function buildvideocacheAction(){
        if (isset ($_POST['video_url'])){
            $cache_dir = $_SERVER['DOCUMENT_ROOT'] . '/memreas/js/jwplayer/jwplayer_cache/';
            $video_name = explode ("/", $_POST['video_url']);
            $video_name = $video_name[count ($video_name) - 1];
            $cache_file = $this->generateVideoCacheFile ($cache_dir, $video_name);
            $file_handle = fopen ($cache_dir . $cache_file, 'w');
            $content = '<!doctype html>
                            <html>
                            <head>
                            <meta charset="utf-8">
                            <title>Untitled Document</title>
                            <script type="text/javascript" src="../jwplayer.js"></script>
                            <script type="text/javascript" src="../jwplayer.html5.js"></script>
                            <style>
                            #myElement_wrapper{
                                margin:0 auto !important;
                                width: 100% !important;
                                min-height: 310px !important;
                            }
                            </style>
                            </head>
                            <body>
                            <center><div id="myElement">Loading the player...</div></center>
                            <script type="text/javascript">
                                jwplayer("myElement").setup({
                                    flashplayer: "../jwplayer.flash.swf",
                                    file: "' . $_POST['video_url'] . '",
                                    "autostart": "true",
                                    "width": 500,
                                    "height": 300,
                                });
                            </script>
                            </body>
                            </html>';
            fwrite ($file_handle, $content, 5000);
            fclose ($file_handle);
            $response = array ('video_link' => $cache_file, 'thumbnail' => isset ($_POST['thumbnail']) ? $_POST['thumbnail'] : '/memreas/img/large-pic-1.jpg', 'media_id' => $_POST['media_id']);
            echo json_encode ($response);
        }
        exit();
    }

    private function generateVideoCacheFile($cache_dir, $video_name){
        $cache_file = uniqid('jwcache_') . substr (md5($video_name), 0, 10) . '.html';
        if (!file_exists ($cache_file)) return $cache_file;
        else $this->generateVideoCacheFile ($cache_dir, $video_name);
    }

    public function sampleAjaxAction() {
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

            //Need to exit here to avoid ZF2 framework view.
			exit;
		} else {
            $path = $this->security("application/index/sample-ajax.phtml");
			$view = new ViewModel();
			$view->setTemplate($path); // path to phtml file under view folder
		}

		return $view;
    }

    public function memreasAction(){
        $action = 'getsession';
        $xml = "<xml><getsession><sid>1</sid></getsession></xml>";

        //Guzzle the LoginWeb Service
        $user = simplexml_load_string($this->fetchXML($action, $xml));
        $data['userid'] = $user->getsessionresponse->userid;

        $data['bucket'] = "memreasdev";
        $data['accesskey'] = "AKIAJMXGGG4BNFS42LZA";
        $data['secret'] = "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";

        $data['base64Policy'] = base64_encode($this->getS3Policy($data['bucket']));
        $data['signature'] = $this->hex2b64($this->hmacsha1($data['secret'], $data['base64Policy']));

        $path = $this->security("application/index/memreas.phtml");
        $view = new ViewModel(array('data' => $data));
        $view->setTemplate($path); // path to phtml file under view folder
        return $view;
    }

     public function testAction() {
        $action = 'getsession';
        $xml = "<xml><getsession><sid>1</sid></getsession></xml>";

        //Guzzle the LoginWeb Service
        $user = simplexml_load_string($this->fetchXML($action, $xml));
        $data['userid'] = $user->getsessionresponse->userid;
        $data['bucket'] = "memreasdev";
        $data['accesskey'] = "AKIAJMXGGG4BNFS42LZA";
        $data['secret'] = "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";

        $data['base64Policy'] = base64_encode($this->getS3Policy($data['bucket']));
        $data['signature'] = $this->hex2b64($this->hmacsha1($data['secret'], $data['base64Policy']));

        $path = $this->security("application/index/gallery1.phtml");

        $action = 'listallmedia';
        $session = new Container('user');

        $xml = "<xml><listallmedia><event_id></event_id><user_id>" . $session->offsetGet('user_id') . "</user_id><device_id></device_id><limit>10</limit><page>1</page></listallmedia></xml>";
        $result = $this->fetchXML($action, $xml);

        $view = new ViewModel(array('xml'=>$result, 'data' => $data));
        $view->setTemplate($path); // path to phtml file under view folder
        return $view;
    }

    public function eventAction() {
	    $path = $this->security("application/index/event.phtml");

		$action = 'listallmedia';
		$session = new Container('user');
		$xml = "<xml><listallmedia><event_id></event_id><user_id>" . $session->offsetGet('user_id') . "</user_id><device_id></device_id><limit>10</limit><page>1</page></listallmedia></xml>";
		$result = $this->fetchXML($action, $xml);

		$view = new ViewModel(array('xml'=>$result));
		$view->setTemplate($path); // path to phtml file under view folder
		return $view;
    }

    public function twitterAction() {
        $server_url = $this->getRequest()->getServer('HTTP_HOST');
        $callback_url = (strpos ($server_url, 'localhost')) ? 'http://memreas-dev-php-frontend.localhost/index/twitter' : 'http://memreasdev-frontend.elasticbeanstalk.com/index/twitter';
        $config = new \Application\OAuth\Config();
        /*
        *OLD API
        * APP ID: 1bqpAfSWfZFuEeY3rbsKrw
        * SECRET: wM0gGBCzZKl5dLRB8TQydRDfTD5ocf2hGRKSQwag
        */
        $config->setConsumerKey('maf3MxgUTmBhkXj4xdyujw')
            ->setConsumerSecret('lGLw3UHoEbgmLF9mwiT3jrBkcDs39vP0fvgpiJXuOA')
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
            session_start();
            $requestToken = unserialize($_SESSION['twitter_request_token']);
            if (!$requestToken instanceof \Application\OAuth\Token\Request) {
                throw new Exception('Request token not found');
            }

            // a possible CSRF attack
            if ($requestToken->getToken() !== $authorizeToken->getToken()) {
                throw new Exception('Tokens do not match');
            }

            $accessToken = new \Application\OAuth\Token\Access($config, $authorizeToken, true);
            if (!$accessToken->isValid()) {
                throw new Exception('Could not fetch access token');
            }

            unset($_SESSION['twitter_request_token']);

            // at this point authentication is successful and you will have the following
            // two properties available on the access token object if you authenticated on Twitter:
            $userId = $accessToken['user_id'];
            $screenName = $accessToken['screen_name'];
            $config = array();
            $config['consumer_key'] = '1bqpAfSWfZFuEeY3rbsKrw';
            $config['consumer_secret'] = 'wM0gGBCzZKl5dLRB8TQydRDfTD5ocf2hGRKSQwag';
            $config['oauth_token'] = $accessToken['oauth_token'];
            $config['oauth_token_secret'] = $accessToken['oauth_token_secret'];
            $config['output_format'] = 'object';
            $tw = new TwitterOAuth($config);

            $params = array(
                //'screen_name' => 'kamleshpawar',
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
            session_start();
            $_SESSION['twitter_request_token'] = serialize($requestToken);

            // redirect to Twitter for authentication
            $targetUrl = $config->getAuthorizeUrl($requestToken['oauth_token']);
            $targetUrl ;
            header('Location:' . $targetUrl);exit;
        }
    }

    public function shareAction() {
	    $path = $this->security("application/index/share.phtml");
		$view = new ViewModel();
		$view->setTemplate($path); // path to phtml file under view folder
		return $view;
    }

    public function queueAction() {
	    $path = $this->security("application/index/queue.phtml");
		$view = new ViewModel();
		$view->setTemplate($path); // path to phtml file under view folder
		return $view;
    }

    public function eventGalleryAction() {
	    $path = $this->security("application/index/event-gallery.phtml");
		$view = new ViewModel();
		$view->setTemplate($path); // path to phtml file under view folder
		return $view;
    }

    public function memreasMeFriendsAction() {
	    $path = $this->security("application/index/memreas-me-friends.phtml");
		$view = new ViewModel();
		$view->setTemplate($path); // path to phtml file under view folder
		return $view;
    }

    public function loginAction() {
		//Fetch the post data
		$request = $this->getRequest();
		$postData = $request->getPost()->toArray();
		$username = $postData ['username'];
		$password = $postData ['password'];

		//Setup the URL and action
		$action = 'login';
		$xml = "<xml><login><username>$username</username><password>$password</password></login></xml>";
		$redirect = 'memreas';

		//Guzzle the LoginWeb Service
		$result = $this->fetchXML($action, $xml);

		$data = simplexml_load_string($result);
        setcookie(session_name(),$data->loginresponse->sid,0,'/');
 		//ZF2 Authenticate
		if ($data->loginresponse->status == 'success') {
            error_log("Inside loginresponse success...");
            //	$this->setSession($username);
            //Redirect here
            error_log("Inside loginresponse success redirect ---> " . $redirect);
			return $this->redirect()->toRoute('index', array('action' => $redirect));
		} else {
            error_log("Inside loginresponse else...");
			return $this->redirect()->toRoute('index', array('action' => "index"));
		}
    }

    public function logoutAction() {
		$this->getSessionStorage()->forgetMe();
        $this->getAuthService()->clearIdentity();
        $session = new Container('user');
        $session->getManager()->destroy();

        $view = new ViewModel();
		$view->setTemplate('application/index/index.phtml'); // path to phtml file under view folder
		return $view;
    }

    public function setSession($username) {
		//Fetch the user's data and store it in the session...
        error_log("Inside setSession ...");
   	    $user = $this->getUserTable()->findOneBy(array('username' => $username));

        $user->password='';
       	$user->disable_account='';
   	    $user->create_date='';
        $user->update_time='';
		$session = new Container('user');
        error_log("Inside setSession got new Container...");
		$session->offsetSet('user_id', $user->user_id);
		$session->offsetSet('username', $username);
        $session->offsetSet('user', json_encode($user));
        error_log("Inside setSession set user data...");
    }

    public function registrationAction()
    {
		//Fetch the post data
		$postData = $this->getRequest()->getPost()->toArray();
		$email = $postData ['email'];
		$username = $postData ['username'];
		$password = $postData ['password'];
        $invited_by = $postData ['invited_by'];

		//Setup the URL and action
		$action = 'registration';
		$xml = "<xml><registration><email>$email</email><username>$username</username><password>$password</password><invited_by>$invited_by</invited_by></registration></xml>";
		$redirect = 'event';

		//Guzzle the Registration Web Service
		$result = $this->fetchXML($action, $xml);
		$data = simplexml_load_string($result);

		//ZF2 Authenticate
		if ($data->registrationresponse->status == 'success') {
			$this->setSession($username);

			//If there's a profile pic upload it...
			if (isset($_FILES['file'])) {
    	 		$file = $_FILES['file'];
		     	$fileName = $file['name'];
    	 		$filetype = $file['type'];
    		 	$filetmp_name = $file['tmp_name'];
	     		$filesize = $file['size'];

                $url=  $this->url;
				$guzzle = new Client();
				$session = new Container('user');
				$request = $guzzle->post($url)
								->addPostFields(
									array(
                                        'action' => 'addmediaevent',
										'user_id' => $session->offsetGet('user_id'),
										'filename' => $fileName,
										'event_id' => "",
										'device_id' => "",
										'is_profile_pic' => 1,
										'is_server_image' => 0,
									)
								)
								->addPostFiles(
									array(
										'f' => $filetmp_name,
									)
								);
			}
			$response = $request->send();
			$data = $response->getBody(true);
			$xml = simplexml_load_string($result);
			if ($xml->addmediaeventresponse->status == 'success') {
				//Do nothing even if it fails...
			}

            //Redirect here
			return $this->redirect()->toRoute('index', array('action' => $redirect));
		} else {
			return $this->redirect()->toRoute('index', array('action' => "index"));
		}
    }
    public function getUserTable() {
        if (!$this->userTable) {
            $sm = $this->getServiceLocator();
            $this->dbAdapter = $sm->get('doctrine.entitymanager.orm_default');
            $this->userTable =  $this->dbAdapter->getRepository('Application\Entity\User');
         }
        return $this->userTable;
    }

    public function forgotpasswordAction() {
        $request = $this->getRequest();
	    $postData = $request->getPost()->toArray();
 	    $email = isset($postData ['email']) ? $postData ['email'] : '';

	    //Setup the URL and action
	    $action = 'forgotpassword';
	    $xml = "<xml><forgotpassword><email>$email</email></forgotpassword></xml>";
	    //$redirect = 'gallery';

	    //Guzzle the LoginWeb Service
	    $result = $this->fetchXML($action, $xml);
        $data = simplexml_load_string($result);
        echo json_encode($data);
        return '';
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
                            "bucket": "memreasdev"
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
                        }
                    ]
                }';
        return $policy;
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
} // end class IndexController
