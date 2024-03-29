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
	const MEMREAS_PAY = "https://memreasdev.memreas.com:9002/index?action=";

	const MEMREAS_ADS = false;
	const MEMREAS_SELL_MEDIA = 1; // Enable or Disable selling media
	const S3_APPKEY = 'AKIAJZE2O2WDMXLGR27A';
	const S3_APPSEC = 'FI09T7vRXcWx+QBE/n5ysEtZxx/DOAxkks/o2rzG';
	const S3_ENCRYPTION = 'AES256';
	const S3BUCKET = "memreasdevsec";
	const CLOUDFRONT_DOWNLOAD_HOST = 'https://d3sisat5gdssl6.cloudfront.net/';
	const CLOUDFRONT_HLS_DOWNLOAD_HOST = 'https://d2b3944zpv2o6x.cloudfront.net/';
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
	const VERSION = '28-AUG-2016';
	const COPYRIGHT = '&copy; memreas llc';
	
	//Android url for download
	const ANDROID_DOWNLOAD_URL = "https://play.google.com/apps/testing/com.memreas";
	
	//Meta
	const MEMREAS_DESCRIPTION = "memreas is a social media network that allows users to access their content on the web or our Android and iOS apps.  memreas members have the ability to upload or access images or video with 4k support.";
	const MEMREAS_KEYWORDS = "social networking media streaming 4k HDR";
	
	// HLS mime types
	//document.createElement('video').canPlayType('application/vnd.apple.mpegURL')
	//document.createElement('video').canPlayType('application/x-mpegURL')
	const HLS_MIME_TYPEX = 'application/x-mpegURL';
	const HLS_MIME_TYPEV = 'application/vnd.apple.mpegURL';
	
}