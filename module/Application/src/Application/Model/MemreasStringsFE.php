<?php

/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
namespace Application\Model;

class MemreasStringsFE {
	
	//en section
	const MYSTRING_EN = 'my string en';

    static function getString($string, $locale = "_EN") {
        return constant('self::'. $string . $locale);
    }
}