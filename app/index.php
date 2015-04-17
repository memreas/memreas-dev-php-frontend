<?php
/**
 * This makes our life easier when dealing with paths. Everything is relative
 * to the application root now.
 */
chdir(dirname(__DIR__));

ini_set('session.save_path', getcwd().'/data/session');
ini_set('session.use_only_cookies', "Off");

// Setup autoloading
require 'init_autoloader.php';


// Run the application!
Zend\Mvc\Application::init(require 'config/application.config.php')->run();