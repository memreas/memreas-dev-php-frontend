<?php
// ///////////////////////////////
// Author: John Meah
// Copyright memreas llc 2013
// ///////////////////////////////
namespace Application\Model;

class MemreasConstants {
	
	const MEMREAS_FE = "https://fe2.memreas.com";
	const MEMREAS_WS = "https://memreasdev-wsg.memreas.com";
	const MEMREAS_PAY = "https://memreasdev-pay.memreas.com";
	const MEMREAS_ADS = true;
    const CLOUDFRONT_DOWNLOAD_HOST = 'https://d3sisat5gdssl6.cloudfront.net/';
    const S3_APPKEY = 'AKIAJMXGGG4BNFS42LZA';
    const S3_APPSEC = 'xQfYNvfT0Ar+Wm/Gc4m6aacPwdT5Ors9YHE/d38H';
	const S3BUCKET = "memreasdevsec";
	const LISTNOTIFICATIONSPOLLTIME = 15000; //15s
	
	const FREE_ACCOUNT_FILE_LIMIT = 300; // 300MB limited upload for free user
	const PAID_ACCOUNT_FILE_LIMIT = 5000; // 5GB limited upload for free user
	
    //Enable / Disable payment tabs at more page
    const PAYMENT_TAB_SUBSCRIPTION = true;
    const PAYMENT_TAB_BUY_CREDIT = true;
    const PAYMENT_TAB_SELL_MEDIA = true;

}