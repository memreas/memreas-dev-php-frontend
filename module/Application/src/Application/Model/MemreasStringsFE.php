<?php

/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
namespace Application\Model;

class MemreasStringsFE {
	
	//en section
	const MOBILE_ANDROID_INVITE_EN = 'You will receive an email to verify your email address. You can download our APK for Android via this link ';

    static function getString($string, $locale = "_EN") {
        return constant('self::'. $string . $locale);
    }
}