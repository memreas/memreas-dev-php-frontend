<?php
/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2012 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

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

class IndexController extends AbstractActionController
{

	//Updated....
	protected $url = "http://memreasint.elasticbeanstalk.com/";
	protected $test = "Hope this works!";
    //protected $url = "http://localhost/memreas-dev-php-ws/app/";
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
    		'xml' => $xml
	    	)
		);
		$response = $request->send();
error_log("Inside fetch XML response ---> " . $response->getBody(true) . PHP_EOL);
error_log("Exit fetchXML".PHP_EOL);
		return $data = $response->getBody(true);
	}

    public function indexAction() {
error_log("Enter indexAction".PHP_EOL);
 	    $path = $this->security("application/index/event.phtml");
		$view = new ViewModel();
		$view->setTemplate($path); // path to phtml file under view folder
		return $view;
error_log("Exit indexAction".PHP_EOL);
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
                            <div id="myElement">Loading the player...</div>
                            <script type="text/javascript">
                                jwplayer("myElement").setup({
                                    flashplayer: "../jwplayer.flash.swf",
                                    file: "' . $_POST['video_url'] . '",
                                    "autostart": "true",
                                    "width": "100%",
                                });
                            </script>
                            </body>
                            </html>';
            fwrite ($file_handle, $content, 5000);
            fclose ($file_handle);
            $response = array ('video_link' => $cache_file, 'thumbnail' => $_POST['thumbnail']);
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

	    $path = $this->security("application/index/sample-ajax.phtml");

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
			$view = new ViewModel();
			$view->setTemplate($path); // path to phtml file under view folder
		}

		return $view;
    }

    public function galleryAction() {
	    $path = $this->security("application/index/gallery.phtml");

		$action = 'listallmedia';
		$session = new Container('user');
		$xml = "<xml><listallmedia><event_id></event_id><user_id>" . $session->offsetGet('user_id') . "</user_id><device_id></device_id><limit>10</limit><page>1</page></listallmedia></xml>";
		$result = $this->fetchXML($action, $xml);

		$view = new ViewModel(array('xml'=>$result));
		$view->setTemplate($path); // path to phtml file under view folder
		return $view;
        //return new ViewModel();
    }

    public function s3uploadAction(){
        $S3Service = new S3Service();
        $session = new Container('user');
        $data['bucket'] = 'memreasdev';
        $data['folder'] = $session->offsetGet('user_id') . '/image/';
        $data['ACCESS_KEY'] = $S3Service::getAccessKey();
        list($data['policy'], $data['signature']) = $S3Service::get_policy_and_signature(array(
            'bucket'         => $data['bucket'],
            'folder'        => $data['folder'],
        ));
        $view = new ViewModel(array('data' => $data));
        $path = $this->security("application/index/s3upload.phtml");
        $view->setTemplate($path);
        return $view;
    }

    public function addmediaAction(){
         $action = 'addmediaevent';
         $session = new Container('user');
         $xml = "<xml><addmediaevent><s3url>" . $_POST['imageurl'] . "</s3url><is_server_image>0</is_server_image><content_type>" . $_POST['filetype'] . "</content_type><s3file_name>" . $_POST['filename'] . "</s3file_name><device_id></device_id><event_id></event_id><media_id></media_id><user_id>" . $session->offsetGet('user_id') . "</user_id><is_profile_pic>0</is_profile_pic></addmediaevent></xml>";
         $result = $this->fetchXML($action, $xml);
         $data = simplexml_load_string($result);
         echo $data->addmediaeventresponse->status;
         die();
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
        //return new ViewModel();
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
		$redirect = 'gallery';

		//Guzzle the LoginWeb Service
		$result = $this->fetchXML($action, $xml);

		$data = simplexml_load_string($result);

		//ZF2 Authenticate
		if ($data->loginresponse->status == 'success') {
error_log("Inside loginresponse success...");
			$this->setSession($username);
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

		//Setup the URL and action
		$action = 'registration';
		$xml = "<xml><registration><email>$email</email><username>$username</username><password>$password</password></registration></xml>";
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
		$session = new Container("user");
	    if(!$session->offsetExists('user_id')){
			error_log("Not there so logout");
	    	$this->logoutAction();
    	  return "application/index/index.phtml";
	    }
		return $path;
        //return $this->redirect()->toRoute('index', array('action' => 'login'));
    }
} // end class IndexController
