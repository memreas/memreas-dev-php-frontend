/*
 * Handle for buying media from memreas tab
 * */

/*
 * Popup buying media form
 * */
function popupBuyMedia(event_id, event_price, event_name) {
    clearBuyMediaPopup();
    $(".popup-event-name").html(event_name);
    $(".popup-buymedia-price").html("$" + event_price);
    $("#accept-buymedia").attr("onclick", "buyMedia('" + event_id + "');");
    Account.reloadAccountCredit('.popup-buymedia-credit');
	ajaxRequest(
		'geteventdetails',
		[ {
			tag : 'event_id',
			value : event_id
		} ],
		function(response) {
			if (getValueFromXMLTag(response, 'status') == 'Success') {
				var metadata = getValueFromXMLTag(response,
					'event_metadata');
				metadata = JSON.parse(metadata);

				if (typeof (metadata.duration_from) != 'undefined')
					var duration_from = metadata.duration_from;
				else
					var duration_from = '';

				if (typeof (metadata.duration_to) != 'undefined')
					var duration_to = metadata.duration_to;
				else
					var duration_to = '';

				console.log('duration from' + duration_from);
				console.log('duration to' + duration_to);
			} else {
				jerror(getValueFromXMLTag(response, 'message'));
			}
			popup("popupBuyMedia");
		});
}

/*
 * Reset buying media popup form
 */
function clearBuyMediaPopup() {
    $(".popup-event-name, .popup-buymedia-credit, .popup-buymedia-price")
	    .empty();
    $("#ckb_buymedia_agree").removeAttr("checked");
    $("#accept-buymedia").removeAttr('onclick');
}

function buyMedia(event_id) {

    var buymedia_password_confirm = $("#buymedia_confirm_password").val();
    if (buymedia_password_confirm == '') {
	jerror("Please confirm password");
	return false;
    }

    ajaxRequest(
	    'geteventdetails',
	    [ {
		tag : 'event_id',
		value : event_id
	    } ],
	    function(response) {
		if (getValueFromXMLTag(response, 'status') == 'Success') {
		    var metadata = getValueFromXMLTag(response,
			    'event_metadata');
		    metadata = JSON.parse(metadata);

		    if (typeof (metadata.duration_from) != 'undefined')
			var duration_from = metadata.duration_from;
		    else
			var duration_from = '';

		    if (typeof (metadata.duration_to) != 'undefined')
			var duration_to = metadata.duration_to;
		    else
			var duration_to = '';

		    var price = metadata.price;
		    $('#loadingpopup').hide();
		    if (parseFloat(userObject.buyer_balance) < price) {
			jerror("Please add credit to your account");
			return false;
		    }

		    /*-
		     * Validate password
		     */

		    var event_owner = getValueFromXMLTag(response,
			    'event_owner');
		    var event_id = getValueFromXMLTag(response, 'event_id');
		    var event_name = getValueFromXMLTag(response, 'name');

		    var params = new Object;
		    params.user_id = Account.id;
		    params.password = buymedia_password_confirm;
		    params.amount = price.toString();
		    params.seller_id = event_owner;
		    params.event_id = event_id;
		    params.event_name = event_name;
		    params.memreascookie = getCookie("memreascookie");
		    params.sid = getCookie("memreascookie");
		    params.x_memreas_chameleon = getCookie("x_memreas_chameleon");
		    params.duration_from = duration_from;
		    params.duration_to = duration_to;

		    var params_json = JSON.stringify(params, null, '\t');
		    var data = '{"action": "buyMedia", ' + '"memreascookie": "'
			    + getCookie("memreascookie") + '", "type":"jsonp", '
			    + '"json": ' + params_json + '}';

		    var stripeActionUrl = $("input[name=stripe_url]").val()
			    + 'stripe_buyMedia';
		    $('.stripe-payment').fadeIn(1000);
		    $
			    .ajax({
				url : stripeActionUrl,
				type : 'POST',
				dataType : 'jsonp',
				data : 'json=' + data,
				success : function(response) {
				    response = JSON.parse(response.data);
				    if (response.status == 'Success') {
					// alert("setX_MEMREAS_CHAMELEON(response.x_memreas_chameleon)-->"
					// + response.x_memreas_chameleon);
					setX_MEMREAS_CHAMELEON(response.x_memreas_chameleon);
					jsuccess(response.message);
					var transaction_id = response.transaction_id;
					$("#buymedia-confirmation-trans-id")
						.html(transaction_id);
					disablePopup("popupBuyMedia");
					popup("popupBuyMediaConfirmation");
					var current_event = response.event_id;

					// Checking for handling public tab or
					// friend
					// tab is activated
					var sell_class = '';
					if ($("a[title=memreas-tab3]").parent(
						'li').attr("id") == "current")
					    sell_class = "public-";
					else
					    sell_class = "private-";

					var jElement = $("#" + sell_class
						+ "selling-" + current_event);
					var creator_id = jElement
						.attr("data-owner");
					var divaTagClick = "showEventDetail('"
						+ current_event + "', '"
						+ creator_id + "');";
					var aTagClick = "javascript:showEventDetail('"
						+ current_event
						+ "', '"
						+ creator_id + "');";
					jElement.removeAttr("data-owner")
						.removeAttr("data-click").find(
							"a").attr("href",
							aTagClick);
					jElement.attr('onclick', divaTagClick);
					jElement.find(".sell-event-overlay")
						.remove();
					jElement.find(".sell-event-buyme")
						.remove();
					fetchpubsMemreas();
				    } else
					jerror(response.message);
				    $('.stripe-payment').fadeOut(500);
				}
			    });

		} else
		    jerror(getValueFromXMLTag(response, 'message'));
	    });
}

/*
 * Popup add credit form
 */
function popupBuyCredit() {
    $("select[name=popup_buycredit_card], select[name=popup_buycredit_amount]")
	    .val('');
    popup("popupBuyCredit");

    var jCardSelectElement = $("select[name=popup_buycredit_card]");
    jCardSelectElement.html('<option value="">-Choose-</option>');

    var stripeActionUrl = $("input[name=stripe_url]").val()
	    + 'stripe_listCards';
    var obj = new Object();
    obj.userid = Account.id;
    obj.memreascookie = getCookie("memreascookie");
    obj.sid = getCookie("memreascookie");
    obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
    var json_listCard = JSON.stringify(obj, null, '\t');
    var data = '{"action": "listcards",' + '"memreascookie": "'
	    + getCookie("memreascookie") + '", ' + '"type":"jsonp", '
	    + '"json": ' + json_listCard + '}';
    $('.stripe-payment').fadeIn(1000);
    $
	    .ajax({
		url : stripeActionUrl,
		type : 'POST',
		dataType : 'jsonp',
		data : 'json=' + data,
		success : function(response) {
		    response = JSON.parse(response.data);
		    if (response.status == 'Success') {
			// alert("setX_MEMREAS_CHAMELEON(response.x_memreas_chameleon)-->"
			// + response.x_memreas_chameleon);
			setX_MEMREAS_CHAMELEON(response.x_memreas_chameleon);

			var cards = response.payment_methods;
			var number_of_cards = response.NumRows;
			if (number_of_cards > 0) {
			    for (var i = 0; i < number_of_cards; i++) {
				var row_card_id = cards[i].stripe_card_reference_id;
				var row_card_type = cards[i].card_type;
				var row_card_obfuscated = cards[i].obfuscated_card_number;
				var html_element = '<option value="'
					+ row_card_id + '">';
				html_element += row_card_type + ' | '
					+ row_card_obfuscated + '</option>';
				jCardSelectElement.append(html_element);
			    }
			    removeItem(reloadItems, 'reload_account_cards');
			} else {
			    jerror("You have no card at this time. Please add some cards under account tab!");
			    /*
			     * setTimeout(function() { jconfirm('Add card to
			     * your account?', 'popup(\'popupCreditAddCard\')') },
			     * 3000);
			     */
			}
		    } else {
			jerror("You have no card at this time. Please add some cards under account tab!");
			/*
			 * setTimeout(function() { jconfirm('Add card to your
			 * account?', 'popup(\'popupCreditAddCard\')') }, 3000);
			 */
		    }
		    $('.stripe-payment').fadeOut(500);
		}
	    });
}

function popupCreditAddCard() {
    var jAddCard = $(".memreasAddCardForm");
    var formPass = true;

    // Check all input passed
    jAddCard.find('input[type=text]').not("#addcard_address2").each(function() {
	if ($(this).val() == '' || $(this).val() == $(this).attr('default')) {
	    $(this).focus();
	    formPass = false;
	    return false;
	}
    });
    jAddCard.find('select').each(function() {
	if ($(this).val() == '') {
	    formPass = false;
	    return;
	}
    });

    if (!formPass) {
	jerror('Please complete all require fields');
    } else {
	var stripeActionUrl = $("input[name=stripe_url]").val()
		+ 'stripe_storeCard';
	var obj = new Object();

	obj.user_id = Account.id;
	obj.memreascookie = getCookie("memreascookie");
	obj.sid = getCookie("memreascookie");
	obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
	obj.first_name = jAddCard.find("#addcard_fname").val();
	obj.last_name = jAddCard.find("#addcard_lname").val();
	obj.credit_card_type = jAddCard.find("#addcard_cctype").val();
	obj.credit_card_number = jAddCard.find("#addcard_ccnum").val();
	obj.expiration_month = jAddCard.find("#addcard_expmonth").val();
	obj.expiration_year = jAddCard.find("#addcard_expyear").val();
	obj.cvc = jAddCard.find("#addcard_ccv").val();
	obj.address_line_1 = jAddCard.find("#addcard_address1").val();
	obj.address_line_2 = jAddCard.find("#addcard_address2").val();
	obj.city = jAddCard.find("#addcard_city").val();
	obj.state = jAddCard.find("#addcard_state").val();
	obj.zip_code = jAddCard.find("#addcard_zip").val();

	var json_storeCard = JSON.stringify(obj);

	var data = '{"action": "addCard", ' + '"memreascookie": "'
		+ getCookie("memreascookie") + '"type":"jsonp", ' + '"json": '
		+ json_storeCard + '}';

	$('.stripe-payment').fadeIn(1000);
	$
		.ajax({
		    type : 'post',
		    url : stripeActionUrl,
		    dataType : 'jsonp',
		    data : 'json=' + data,
		    success : function(response) {
			// alert("setX_MEMREAS_CHAMELEON(response.x_memreas_chameleon)-->"
			// + response.x_memreas_chameleon);
			// setX_MEMREAS_CHAMELEON(response.x_memreas_chameleon);

			if (response.status == 'Success') {
			    jsuccess("Your card added successfully");
			    disablePopup('popupCreditAddCard');
			    pushReloadItem('reload_subscription_cards');
			    pushReloadItem('reload_buy_credit_cards');
			    pushReloadItem('reload_account_cards');
			    popupBuyCredit();
			} else
			    jerror(response.message);
			$('.stripe-payment').fadeOut(500);
		    },
		    error : function() {
			jerror('Card adding failure. Please check card\'s information.');
			$('.stripe-payment').fadeOut(500);
		    }
		});
    }
}

function acceptBuyCredit() {
    var buycredit_card = $("select[name=popup_buycredit_card]").val();
    var buycredit_amount = $("select[name=popup_buycredit_amount]").val();
    var buycredit_agreement = ($("#ckb_buycredit_agree").is(":checked") ? 1 : 0);
    if (buycredit_card == '') {
	jerror('please select your card');
	return false;
    }

    if (!buycredit_agreement) {
	jerror("you must agree with our terms and conditions");
	return false;
    }

    var password_confirm = $("#buycredit_confirm_password").val();
    if (password_confirm == '') {
	jerror("Please enter your password to confirm payment");
	return false;
    }

    // Perform password confirmation
    var params = [ {
	tag : 'username',
	value : $("input[name=username]").val()
    }, {
	tag : 'password',
	value : password_confirm
    }, {
	tag : 'device_type',
	value : "web"
    }, {
	tag : 'device_id',
	value : ''
    } ];
    ajaxRequest('login', params, function(xml_response) {
	if (getValueFromXMLTag(xml_response, 'status') == 'success') {
	    var params = new Object;
	    params.userid = $("input[name=user_id]").val();
	    params.memreascookie = getCookie("memreascookie");
	    params.sid = getCookie("memreascookie");
	    params.x_memreas_chameleon = getCookie("x_memreas_chameleon");
	    params.stripe_card_reference_id = buycredit_card;
	    params.amount = buycredit_amount;
	    var params_json = JSON.stringify(params, null, '\t');
	    var data = '{"action": "buycredit", ' + '"type":"jsonp", '
		    + '"json": ' + params_json + '}';

	    var stripeActionUrl = $("input[name=stripe_url]").val()
		    + 'stripe_addValue';

	    $('.stripe-payment').fadeIn(1000);
	    $.ajax({
		url : stripeActionUrl,
		type : 'POST',
		dataType : 'jsonp',
		data : 'json=' + data,
		timeout : 10000,
		success : function(response) {
		    response = jQuery.parseJSON(response.data);
		    if (response.status == 'Success') {
			jsuccess(response.message);
			popup("popupBuyMedia");
		    } else
			jerror(response.message);
		    $('.stripe-payment').fadeOut(500);
		},
		error : function(response, textStatus, errorThrown) {
		    if (textStatus === 'timeout') {
			jerror('request timeout - please try again later');
			$('.stripe-payment').fadeOut(500);
		    }

		}
	    });
	} else
	    jerror("Password confirmation is not matched!");
    });
}