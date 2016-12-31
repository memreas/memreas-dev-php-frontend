<?php
/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
namespace Application\Model;

class MemreasConstants {
	//Server URLs
	const MEMREAS_FE = "http://127.0.0.1:55151";
	const MEMREAS_WS = "http://127.0.0.1:55152";
	const MEMREAS_WS_PUBLIC = "http://127.0.0.1:55152/public";
	const MEMREAS_PAY = "http://127.0.0.1:55153/index?action=";

	const MEMREAS_ADS = true;
	const MEMREAS_SELL_MEDIA = 1; // Enable or Disable selling media
	const S3_APPKEY = 'AKIAISDIQFVJMWFYXCIA';
	const S3_APPSEC = 'eM5HG4MbYhkW1Jz1RWIdMapo2s+DbB+KnkhzTt91';
	const S3_ENCRYPTION = 'AES256';
	const S3BUCKET = "memreasprodsec";
	const CLOUDFRONT_DOWNLOAD_HOST = 'https://d321rfaqc9owi4.cloudfront.net/';
	const CLOUDFRONT_HLS_DOWNLOAD_HOST = 'https://d1fhgtf97i7jlq.cloudfront.net/';
	const MAINTENANCE = false; //Enable / Disable Maintenance mode
	
		
	const LISTNOTIFICATIONSPOLLTIME = 240000; // 5 minutes
	const GALLERYDELAYTIME = 500; // 500 ms
	                              
	// For file limit upload
	const FREE_ACCOUNT_FILE_LIMIT = 100; // 100MB limited upload for free user
	const PAID_ACCOUNT_FILE_LIMIT = 5000; // 5GB limited upload for paid user
	                                      
	// Enable / Disable payment tabs at more page
	const PAYMENT_TAB_SUBSCRIPTION = true;
	const PAYMENT_TAB_BUY_CREDIT = true;
	const PAYMENT_TAB_SELL_MEDIA = true;
	const VERSION = '30-DEC-2016';
	const COPYRIGHT = '&copy; memreas llc';
	
	//Meta
	const MEMREAS_DESCRIPTION = "memreas is a social media network that allows users to access their content on the web or our Android and iOS apps.  memreas members have the ability to upload or access images or video with 4k support.";
	const MEMREAS_KEYWORDS = "social networking media streaming 4k HDR";

	// HLS mime types
	//document.createElement('video').canPlayType('application/vnd.apple.mpegURL')
	//document.createElement('video').canPlayType('application/x-mpegURL')
	const HLS_MIME_TYPEX = 'application/x-mpegURL';
	const HLS_MIME_TYPEV = 'application/vnd.apple.mpegURL';
	


}