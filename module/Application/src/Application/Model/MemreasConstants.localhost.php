<?php
// ///////////////////////////////
// Author: John Meah
// Copyright memreas llc 2013
// ///////////////////////////////
namespace Application\Model;

class MemreasConstants {
	
// 	const MEMREAS_FE = "https://fe.memreas.com";
// 	const MEMREAS_WS = "https://memreasdev-wsu.memreas.com";
// 	const MEMREAS_PAY = "https://memreasdev-pay.memreas.com";
	const MEMREAS_FE = "http://memreas-dev-php-frontend.localhost/";
	const MEMREAS_WS = "http://memreas-dev-php-ws.localhost/";
	const MEMREAS_PAY = "http://memreas-dev-php-stripe.localhost/";
	const MEMREAS_ADS = true;
    const MEMREAS_SELL_MEDIA = true; //Enable or Disable selling media

    const CLOUDFRONT_DOWNLOAD_HOST = 'https://d3sisat5gdssl6.cloudfront.net/';
    const S3_APPKEY = 'AKIAJMXGGG4BNFS42LZA';
    const S3_APPSEC = 'xQfYNvfT0Ar+Wm/Gc4m6aacPwdT5Ors9YHE/d38H';
	const S3BUCKET = "memreasdevsec";
    const LISTNOTIFICATIONSPOLLTIME = 15000; //15s

    //For file limit upload
    const FREE_ACCOUNT_FILE_LIMIT = 100; // 100MB limited upload for free user
    const PAID_ACCOUNT_FILE_LIMIT = 5000; // 5GB limited upload for paid user

    //Enable / Disable payment tabs at more page
    const PAYMENT_TAB_SUBSCRIPTION = true;
    const PAYMENT_TAB_BUY_CREDIT = true;
    const PAYMENT_TAB_SELL_MEDIA = true;

    const VERSION = '0.987';

}