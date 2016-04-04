/*
 * Sell media handle
 */


function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * isValidDate(str)
 * 
 * @param string
 *                str value yyyy-mm-dd
 * @return boolean true or false IF date is valid return true
 */
function isValidDate(str){
	// STRING FORMAT yyyy-mm-dd
	if(str=="" || str==null){return false;}								
	
	// m[1] is year 'YYYY' * m[2] is month 'MM' * m[3] is day 'DD'
	var m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
	
	// STR IS NOT FIT m IS NOT OBJECT
	if( m === null || typeof m !== 'object'){return false;}				
	
	// CHECK m TYPE
	if (typeof m !== 'object' && m !== null && m.size!==3){return false;}
				
	var ret = true; // RETURN VALUE
	var thisYear = new Date().getFullYear(); // YEAR NOW
	var minYear = 1999; // MIN YEAR
	
	// YEAR CHECK
	if( (m[1].length < 4) || m[1] < minYear || m[1] > thisYear){ret = false;}
	// MONTH CHECK
	if( (m[2].length < 2) || m[2] < 1 || m[2] > 12){ret = false;}
	// DAY CHECK
	if( (m[3].length < 2) || m[3] < 1 || m[3] > 31){ret = false;}
	
	return ret;			
}

function sellMediaStep2() {
	if (checkSellerBasicInformation('sell_media_form', false))
		activeAkordeon("sell-media-payout-tab");
}

function checkSellerBasicInformation(element, focus_element) {
	var formPass = true;
	var jSellMediaForm = $("." + element);
	jSellMediaForm.find("input[type=text]").not("#sell-media-address2").each(
			function() {
				if ($(this).val() == ''
						|| $(this).val() == $(this).attr('default')) {
					jerror("Please complete all required fields.");
					if (focus_element) {
					    $(this).focus();
					}
					formPass = false;
					return formPass;
				}
			});
	
	// check dob format
	if (isValidDate($("#sell-media-dob").val())) {
	    alert("dob is valid--> " + $("#sell-media-dob").val());
	    // check if user is over 18
	    var age = getAge($("#sell-media-dob").val());
	    alert ("age-->" + age);
	} else {
	    alert("dob is NOT valid--> " + $("#sell-media-dob").val());
		jerror("date of birth format is invalid");
		formPass = false;
		return formPass;
	} 
	
    	// alert($('[name="sell-media-username"]').val());
	return formPass;
}

function register_sell_media() {
	var jSellMediaMessage = $(".add-seller-message");
	jSellMediaMessage.empty().hide();

	// Recheck previous tab
	if (!checkSellerBasicInformation("sell_media_form", false))
		return false;

	var formPass = true;
	formPass = checkSellerBasicInformation("sell_media_bank", true);

	if (formPass) {

		// Check order confirm checkbox
		if (!($("#register-seller-agree").is(":checked"))) {
			jerror("You must agree with our terms of service");
			return false;
		}
		
		

		var address_line_2 = ($("#sell-media-address2").val() == '' || $(
				"#sell-media-address2").val() == $("#sell-media-address2")
				.attr('default')) ? '' : $("#sell-media-address2").val();
		var params = {
			memreascookie : getCookie("memreascookie"),
			x_memreas_chameleon : getCookie("x_memreas_chameleon"),
			sid : getCookie("memreascookie"),
			user_id : user_id,
			user_name : $('[name="sell-media-username"]').val(),
			first_name : $("#sell-media-fname").val(),
			last_name : $("#sell-media-lname").val(),
			address_line_1 : $("#sell-media-address1").val(),
			address_line_2 : address_line_2,
			city : $("#sell-media-city").val(),
			state : $("#sell-media-state").val(),
			zip_code : $("#sell-media-zip").val(),
			stripe_email_address : $("#sell-media-email").val(),
			sell_media_bank : $("#sell-media-bank").val(),
			tax_ssn_ein : $("#sell-media-tax-ssn-ein").val(),
			routing_number : $("#sell-media-bank-routing").val(),
			account_number : $("#sell-media-account-number").val()
		}

		var data_params = JSON.stringify(params, null, '\t');
		console.log("data_params-->"+data_params);

		var data = '{"action": "addSeller", ' + '"type":"jsonp", ' + '"json": '
				+ data_params + '}';

		var stripeActionUrl = $("input[name=stripe_url]").val()
				+ 'stripe_addSeller';
		$('.stripe-payment').fadeIn(1000);
		$.ajax({
			url : stripeActionUrl,
			type : 'POST',
			dataType : 'jsonp',
			data : 'json=' + data,
			// timeout: 10000,
			success : function(response) {
			  	response = jQuery.parseJSON( response.data );
				if (response.status == 'Success') {
					jsuccess('your account has been registered successfully');
				} else {
					jerror(response.message);
				}
				$('.stripe-payment').fadeOut(500);
			},
			error : function(response, textStatus, errorThrown) {
				if(textStatus === 'timeout')
			    {     
					jerror('request timeout - please try again later');
					$('.stripe-payment').fadeOut(500);
			    }
				
			}
		});
	}
}

function resetSellMedia() {
	var text_ids = [ 'sell-media-fname', 'sell-media-lname',
			'sell-media-address1', 'sell-media-address2', 'sell-media-city',
			'sell-media-state', 'sell-media-zip', 'sell-media-tax_ssn_ein', 'sell-media-bank',
			'sell-media-bank-routing', 'sell-media-account-number' ];
	clearTextField(text_ids);
}