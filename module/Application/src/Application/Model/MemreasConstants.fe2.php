<?php
// ///////////////////////////////
// Author: John Meah
// Copyright memreas llc 2013
// ///////////////////////////////
namespace Application\Model;

class MemreasEnvConstants {
	
	const MEMREAS_FE = "https://fe2.memreas.com";
	const MEMREAS_WS = "https://memreasdev-wsg.memreas.com";
	const MEMREAS_PAY = "https://memreasdev-pay.memreas.com";
	const MEMREAS_ADS = false;
    const S3_APPKEY = 'AKIAJMXGGG4BNFS42LZA';
    const S3_APPSEC = 'xQfYNvfT0Ar+Wm/Gc4m6aacPwdT5Ors9YHE/d38H';
	const S3BUCKET = "memreasdevsec";
	const LISTNOTIFICATIONSPOLLTIME = 15000; //15s
	
    //Enable / Disable payment tabs at more page
    const PAYMENT_TAB_SUBSCRIPTION = true;
    const PAYMENT_TAB_BUY_CREDIT = true;
    const PAYMENT_TAB_SELL_MEDIA = true;

}