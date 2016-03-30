<?php

/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2012 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */
namespace Application;

use Zend\Mvc\ModuleRouteListener;
use Zend\Mvc\MvcEvent;
use Zend\ModuleManager\Feature\AutoloaderProviderInterface;
use Application\Model;

class Module {
	public function onBootstrap(MvcEvent $e) {
		$e->getApplication ()->getServiceManager ()->get ( 'translator' );
		$eventManager = $e->getApplication ()->getEventManager ();
		$serviceManager = $e->getApplication ()->getServiceManager ();
		$moduleRouteListener = new ModuleRouteListener ();
		$moduleRouteListener->attach ( $eventManager );
		//$this->bootstrapSession ( $e );
		register_shutdown_function(function ()
		{
			if ($e = error_get_last()) {
				error_log('LAST ERROR---->'. $e['message'] . " in " . $e['file'] . ' line ' . $e['line']);
			}
		});
	}
	public function bootstrapSession($e) {
		//session_start ();
		// $session = $e->getApplication ()->getServiceManager ()->get ( 'Zend\Session\SessionManager' );
		// $container = new Container ( 'user' );
		// if (! isset ( $container->init )) {
		// $session->regenerateId ( true );
		// $container->init = 1;
		// }
	}
	public function getConfig() {
		return include __DIR__ . '/config/module.config.php';
	}
	public function getAutoloaderConfig() {
		return array (
				'Zend\Loader\StandardAutoloader' => array (
						'namespaces' => array (
								__NAMESPACE__ => __DIR__ . '/src/' . __NAMESPACE__ 
						) 
				) 
		);
	}
	public function getServiceConfig() {
		return array (
				'factories' => array (
						// // ZF2 Session Setup...
// 						'Zend\Session\SessionManager' => function ($sm) {
// 							$config = $sm->get ( 'config' );
// 							if (isset ( $config ['session'] )) {
// 								$session = $config ['session'];
								
// 								$sessionConfig = null;
// 								if (isset ( $session ['config'] )) {
// 									$class = isset ( $session ['config'] ['class'] ) ? $session ['config'] ['class'] : 'Zend\Session\Config\SessionConfig';
// 									$options = isset ( $session ['config'] ['options'] ) ? $session ['config'] ['options'] : array ();
									
// 									// setting this for AWS permissions error
// 									// Note: must specify full path
// 									$options ['save_path'] = getcwd () . "/data/session/";
// 									$sessionConfig = new $class ();
// 									$sessionConfig->setOptions ( $options );
// 								}
								
// 								$sessionStorage = null;
// 								if (isset ( $session ['storage'] )) {
// 									$class = $session ['storage'];
// 									$sessionStorage = new $class ();
// 								}
								
// 								$sessionSaveHandler = null;
// 								if (isset ( $session ['save_handler'] )) {
// 									// class should be fetched from service manager since it will require constructor arguments
// 									$sessionSaveHandler = $sm->get ( $session ['save_handler'] );
// 								}
								
// 								$sessionManager = new SessionManager ( $sessionConfig, $sessionStorage, $sessionSaveHandler );
								
// 								if (isset ( $session ['validator'] )) {
// 									$chain = $sessionManager->getValidatorChain ();
// 									foreach ( $session ['validator'] as $validator ) {
// 										$validator = new $validator ();
// 										$chain->attach ( 'session.validate', array (
// 												$validator,
// 												'isValid' 
// 										) );
// 									}
// 								}
// 							} else {
// 								$sessionManager = new SessionManager ();
// 							}
// 							Container::setDefaultManager ( $sessionManager );
// 							return $sessionManager;
// 						},
						
// 						'Application\Model\MyAuthStorage' => function ($sm) {
// 							return new \Application\Model\MyAuthStorage ( 'memreas' );
// 						},
// 						'AuthService' => function ($sm) {
// 							// My assumption, you've alredy set dbAdapter
// 							// and has users table with columns : user_name and pass_word
// 							// that password hashed with md5
// 							// $dbAdapter = $sm->get('Zend\Db\Adapter\Adapter');
// 							// $dbTableAuthAdapter = new DbTableAuthAdapter($dbAdapter,
// 							// 'user', 'username', 'password', 'MD5(?)');
// 							$AuthAdapter = new \Application\Model\MyAuthAdapter ();
// 							$authService = new AuthenticationService ();
// 							$authService->setAdapter ( $AuthAdapter );
// 							$authService->setStorage ( $sm->get ( 'Application\Model\MyAuthStorage' ) );
							
// 							return $authService;
// 						},
						
// 						// Tables
// // 						'Application\Model\UserTable' => function ($sm) {
// // 							$tableGateway = $sm->get ( 'UserTableGateway' );
// // 							$table = new UserTable ( $tableGateway );
// // 							return $table;
// // 						},
// // 						'UserTableGateway' => function ($sm) {
// // 							$dbAdapter = $sm->get ( 'Zend\Db\Adapter\Adapter' );
// // 							$resultSetPrototype = new \Zend\Db\ResultSet\ResultSet ();
// // 							$resultSetPrototype->setArrayObjectPrototype ( new User () );
// // 							return new TableGateway ( 'user', $dbAdapter, null, $resultSetPrototype );
// // 						} 
 				) 
		)
		
		;
	}
}
