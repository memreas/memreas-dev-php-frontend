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

class IndexController extends AbstractActionController
{
	protected $url = "http://memreasdev.elasticbeanstalk.com/eventapp_zend2.1/webservices/index.php";
	//protected $url = "http://192.168.1.9/eventapp_zend2.1/webservices/index_json.php";
    protected $user_id;
    protected $storage;
    protected $authservice;
    protected $userTable;
    protected $eventTable;
    protected $mediaTable;
    protected $eventmediaTable;
    protected $friendmediaTable;

	public function fetchXML($action, $xml) {
		$guzzle = new Client();

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
		return $data = $response->getBody(true);
	}

    public function indexAction() {
	    $path = $this->security("application/index/event.phtml");
		$view = new ViewModel();
		$view->setTemplate($path); // path to phtml file under view folder
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
error_log("INSIDE LOGIN ACTION");
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
			$this->setSession($username);
            //Redirect here
			return $this->redirect()->toRoute('index', array('action' => $redirect));
		} else {
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
   	    $user = $this->getUserTable()->getUserByUsername($username);
        unset($user->password);
       	unset($user->disable_account);
   	    unset($user->create_date);
        unset($user->update_time);
		$session = new Container('user');        
		$session->offsetSet('user_id', $user->user_id);
		$session->offsetSet('username', $username);
        $session->offsetSet('user', json_encode($user));    
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
     	
//	    	 	echo "filename ----> $fileName<BR>";	 
//		     	echo "filetype ----> $filetype<BR>";	 
//     			echo "filetmp_name ----> $filetmp_name<BR>";	 
//    	 		echo "filesize ----> $filesize<BR>";	
    	 		
				$url = "http://192.168.1.9/eventapp_zend2.1/webservices/addmediaevent.php";
				$guzzle = new Client();
				$session = new Container('user');        
				$request = $guzzle->post($url)
								->addPostFields(
									array(
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

			//ZF2 Authenticate
			error_log("addmediaevent result -----> " . $data);
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
            $this->userTable = $sm->get('Application\Model\UserTable');
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
