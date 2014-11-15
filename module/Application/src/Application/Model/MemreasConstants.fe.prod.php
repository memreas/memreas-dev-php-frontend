<?php
// ///////////////////////////////
// Author: John Meah
// Copyright memreas llc 2013
// ///////////////////////////////
namespace Application\Model;

class MemreasConstants {
	
	const MEMREAS_FE = "https://memreasprod-fe.memreas.com";
	const MEMREAS_WS = "https://memreasprod-wsr.memreas.com";
	const MEMREAS_PAY = "https://memreasprod-pay.memreas.com";
	const MEMREAS_ADS = false;
    const S3_APPKEY = 'AKIAJMXGGG4BNFS42LZA';
    const S3_APPSEC = 'xQfYNvfT0Ar+Wm/Gc4m6aacPwdT5Ors9YHE/d38H';
	const S3BUCKET = "memreasprdsec";
	const LISTNOTIFICATIONSPOLLTIME = 180000; //3minutes
	
	const FREE_ACCOUNT_FILE_LIMIT = 100; // 100MB limited upload for free user
	const PAID_ACCOUNT_FILE_LIMIT = 5000; // 5GB limited upload for free user
	
    //Enable / Disable payment tabs at more page
    const PAYMENT_TAB_SUBSCRIPTION = true;
    const PAYMENT_TAB_BUY_CREDIT = true;
    const PAYMENT_TAB_SELL_MEDIA = true;

    const VERSION = '0.987';

}