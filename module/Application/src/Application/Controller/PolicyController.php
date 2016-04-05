<?php

/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class PolicyController extends AbstractActionController {
	public function indexAction() {
		return $this->tosAction();
	}
	public function privacyAction() {
		$view = new ViewModel ();
		$view->setTemplate ( 'application/index/onepage/more_tabs/help/privacy-policy.phtml' );
		return $view;
	}
	public function memberAction() {
		$path = "application/index/onepage/more_tabs/help/member-guideline.phtml";
		$view = new ViewModel ();
		$view->setTemplate ( $path );
		return $view;
	}
	public function dmcaAction() {
		$path = "application/index/onepage/more_tabs/help/dmca-policy.phtml";
		$view = new ViewModel ();
		$view->setTemplate ( $path );
		return $view;
	}
	public function tosAction() {
		$path = "application/index/onepage/more_tabs/help/terms-service.phtml";
		$view = new ViewModel ();
		$view->setTemplate ( $path );
		return $view;
	}
}
