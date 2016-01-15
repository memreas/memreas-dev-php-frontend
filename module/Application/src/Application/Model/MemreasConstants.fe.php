<?php
/**
 * Copyright (C) 2015 memreas llc. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
namespace Application\Model;

class MemreasConstants {
	const MEMREAS_FE = "https://fe.memreas.com";
	const MEMREAS_WS = "https://memreasdev-wsj.memreas.com";
	const MEMREAS_PAY = "https://memreasdev-wsj.memreas.com";
	//const MEMREAS_PAY = "https://memreasdev-pay.memreas.com";
	const MEMREAS_ADS = false;
	const MEMREAS_SELL_MEDIA = 1; // Enable or Disable selling media
	const CLOUDFRONT_DOWNLOAD_HOST = 'https://d3sisat5gdssl6.cloudfront.net/';
	const CLOUDFRONT_HLS_DOWNLOAD_HOST = 'https://d2b3944zpv2o6x.cloudfront.net/';
	const S3_APPKEY = 'AKIAJMXGGG4BNFS42LZA';
	const S3_APPSEC = 'xQfYNvfT0Ar+Wm/Gc4m6aacPwdT5Ors9YHE/d38H';
	const S3BUCKET = "memreasdevsec";
	const LISTNOTIFICATIONSPOLLTIME = 240000; // 5 minutes
	const GALLERYDELAYTIME = 500; // 500 ms
	                              
	// For file limit upload
	const FREE_ACCOUNT_FILE_LIMIT = 100; // 100MB limited upload for free user
	const PAID_ACCOUNT_FILE_LIMIT = 5000; // 5GB limited upload for paid user
	                                      
	// Enable / Disable payment tabs at more page
	const PAYMENT_TAB_SUBSCRIPTION = true;
	const PAYMENT_TAB_BUY_CREDIT = true;
	const PAYMENT_TAB_SELL_MEDIA = true;
	const VERSION = '0.987';
	const COPYRIGHT = '&copy;2015 memreas, llc. all rights reserved.';
}