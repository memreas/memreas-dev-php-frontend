//Handle all account functions into an object orient
var Account = function() {

	//Store current logged user Id
	this.id = $("input[name=user_id]").val();

	//Card objects for some separate tabs
	this.accountTab_cards = new Object();
	this.buyCreditTab_cards = new Object();
	this.subscriptionTab_cards = new Object();

	this.eventPurchases = new Object();
	/*
	* Load account cards and fill in available target element
	* @param element full class name of target element
	* @param rowCardId instance name of each row card id
	* @param callBackCardChangeFunction trigger when account card changed
	* @param extraFunction an optional extra function when function is executed
	* */
	this.loadCards = function(element, rowCardId, callBackCardChangeFunction, extraFunction) {
		$("." + rowCardId + "-functions").hide();
		var jMemberCard = $(element);

		if (!jMemberCard.hasClass('preload-null')) {
			return false;
		}
		jMemberCard.removeClass('preload-null');

		if (jMemberCard.hasClass('mCustomScrollbar'))
			jMemberCard = $(element + " .mCSB_container");

		jMemberCard.empty();

		var stripeActionUrl = STRIPE_SERVER_URL + 'stripe_listCards';

		ConsoleLog.setLog('stripeUserId' + self.id);

		var obj = new Object();
		obj.userid = self.id;
		obj.memreascookie = getCookie("memreascookie");
		obj.sid = getCookie("memreascookie");
		obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
		var json_listCard = JSON.stringify(obj, null, '\t');

		var data = '{"action": "listcards", ' + '"memreascookie": "'
			+ getCookie("memreascookie") + '",' + '"type":"jsonp", '
			+ '"json": ' + json_listCard + '}';

		AppSystem.removePageLoading();
		AppSystem.putStripeLoading();

		$.ajax({url : stripeActionUrl, type : 'POST', dataType : 'jsonp', data : 'json=' + data, timeout : 10000,
			error : function(response, textStatus, errorThrown) {
				if (textStatus === 'timeout') {
					AppSystem.removeStripeLoading(); // do something. Try again perhaps?

					ConsoleLog.setLog("response.message--->" + response.message);

					jMemberCard.append('<li>request timeout - try again later...</li>');
					jerror(textStatus);
				}

			},
			success : function(response) {
				response = jQuery.parseJSON(response.data);
				if (response.status == 'Success') {

					ConsoleLog.setLog("Inside success - listcards");

					var cards = response.payment_methods;
					var number_of_cards = response.NumRows;

					ConsoleLog.setLog("Inside success - number_of_cards" + number_of_cards);

					if (number_of_cards > 0) {

						for (var i = 0; i < number_of_cards; i++) {
							var params = {
								card_id : cards[i].stripe_card_reference_id,
								data : cards[i],
								selected : 0
							};
							var row_card_id = cards[i].stripe_card_reference_id;
							var row_card_type = cards[i].card_type;
							var row_card_obfuscated = cards[i].obfuscated_card_number;

							//Delivery card objects into the right tab
							switch (element) {
								case '.account-payment':
									Account.accountTab_cards[i] = new Object();
									Account.accountTab_cards[i] = params;

									break;
								case '.buycredit-payment':
									Account.buyCreditTab_cards[i] = new Object();
									Account.buyCreditTab_cards[i] = params;
									break;
								case '.subscription-payment':
									Account.subscriptionTab_cards[i] = new Object();
									Account.subscriptionTab_cards[i] = params;
									break;
							}

							var html_element = '<li id=' + rowCardId + '"-'
								+ row_card_id + '">'
								+ '<label class="label_text2"><input';

							// Set first card is default checked
							if (i == 0) {
								html_element += ' checked="checked"';
								var change_card_func = callBackCardChangeFunction + "('" + rowCardId + "-" + row_card_id + "')";
								eval(change_card_func);
							}

							html_element += ' type="radio" id="' + rowCardId + '-'
								+ row_card_id
								+ '" name="radio_cards" class="regular-radio" onchange="' + callBackCardChangeFunction + '(this.id);" />'
								+ '<label for="account-card-'
								+ row_card_id
								+ '"></label>'
								+ row_card_type
								+ ' | '
								+ row_card_obfuscated
								+ '</label>'
								+ '</li>';
							jMemberCard.append(html_element);
						}

						ajaxScrollbarElement(element);
						if (extraFunction != '') {
							eval(extraFunction);
						}
					} else {
						jMemberCard.append('<li>Please add a card.</li>');
					}

					removeItem(reloadItems, 'reload_account_cards');
				} else {
					jMemberCard.append('<li>Please add a card.</li>');
					jerror(response.message);
				}
				AppSystem.removeStripeLoading();
			}
		});
	}

	/*
	* Delete member credit card
	* @param userConfirm boolean true or false
	* @param element full class name of target element (that area will reload cards list)
	* @param rowCardId class name of current row card id
	* */
	this.removeCard = function (userConfirm, element, rowCardId, callBackCardChangeFunction, extraFunction) {
		if (!userConfirm) {

			// Fetch the card
			var selectedCard = '';
			for (var i in Account.accountTab_cards) {
				if (Account.accountTab_cards[i].selected == 1) {
					selectedCard = Account.accountTab_cards[i].data.stripe_card_reference_id;
					break;
				}
			}

			if (selectedCard == '') {
				jerror('Please select a card');
			}
			else {
				accountViewCard('delete');
			}
		}// check whether userConfirm is set or true

		else { // The card will be deleted now
			var stripeActionUrl = STRIPE_SERVER_URL + 'stripe_deleteCards';

			// Fetch the card
			var selectedCard = '';
			for (var i in Account.accountTab_cards) {
				if (accountTab_cards[i].selected == 1) {
					selectedCard = self.accountTab_cards[i].data.stripe_card_reference_id;
					break;
				}
			}
			var cardSelected = new Array();
			cardSelected.push(selectedCard);

			var obj = new Object();
			obj.memreascookie = getCookie("memreascookie");
			obj.sid = getCookie("memreascookie");
			obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
			obj.selectedCard = cardSelected;

			var data_object = JSON.stringify(obj, null, '\t');

			var data = '{"action": "deleteCards", ' + '"type":"jsonp", '
				+ '"json": ' + data_object + '}';

			AppSystem.putPageLoading();

			$.ajax({ type : 'post', url : stripeActionUrl, dataType : 'jsonp', data : 'json=' + data,
				success : function(response) {
					response = jQuery.parseJSON(response.data);
					AppSystem.removePageLoading();
					if (response.status = 'Success') {
						disablePopup('popupaccountviewcard_delete');
						jsuccess(response.message);
						$("#-" + rowCardId + selectedCard).remove();

						pushReloadItem('reload_subscription_cards');
						pushReloadItem('reload_buy_credit_cards');

						$(element).addClass("preload-null");
						Account.loadCards(element, rowCardId, callBackCardChangeFunction, extraFunction);
					} else {
						jerror(response.message);
					}
				}
			});
		}
	}

	/*
	* Add new user card
	* @param element target form element will be looking for card information
	* */
	this.addCard = function(element, reloadElement, rowCardId, callBackCardChangeFunction, extraFunction) {
		var jAddCard = $(element);
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
			var stripeActionUrl = STRIPE_SERVER_URL + 'stripe_storeCard';

			ConsoleLog.setLog(self.id);

			var obj = new Object();
			obj.user_id = $('input[name=user_id]').val();
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

			var data = '{"action": "addCard", ' + '"type":"jsonp", ' + '"json": '
				+ json_storeCard + '}';

			AppSystem.putStripeLoading();
			$.ajax({ type : 'post', url : stripeActionUrl, dataType : 'jsonp', data : 'json=' + data, timeout : 10000,
				error : function(response, textStatus, errorThrown) {
					if (textStatus === 'timeout') {
						jerror('Card adding failure. Please check card\'s information.');
						AppSystem.removeStripeLoading();
					}
				},
				success : function(response) {
					response = jQuery.parseJSON(response.data);
					if (response.status == 'Success') {
						jsuccess("Your card added successfully");
						disablePopup('popup-addcard-' + reloadElement.replace('.', ''));

						$(reloadElement).addClass('preload-null');
						new Account.loadCards(reloadElement, rowCardId, callBackCardChangeFunction, extraFunction);

						pushReloadItem('reload_subscription_cards');
						pushReloadItem('reload_buy_credit_cards');
					} else {
						jerror(response.message);
					}
					AppSystem.removeStripeLoading();
				}
			});
		}
	}

	/*
	* Checking user event owning
	* @param eventId Target event id for checking
	* */
	this.checkOwnEvent = function(eventId) {
		if (this.eventPurchases.length > 0) {
			for (var i = 0;i < this.eventPurchases.length;i++) {
				if (this.eventPurchases[i] == eventId) {
					return true;
				}
			}
		}

		return false;
	}

	/*
	* Reload Account Buyer Credit
	* */
	this.reloadAccountCredit = function(targetElement) {
		var jTargetElement = $(targetElement);
		jTargetElement.html("...");

		var params = new Object;
		params.user_id = this.id;
		params.memreascookie = getCookie("memreascookie");
		params.sid = getCookie("memreascookie");
		params.x_memreas_chameleon = getCookie("x_memreas_chameleon");
		var params_json = JSON.stringify(params, null, '\t');
		var data = '{"action": "getuserbalance", ' + '"type":"jsonp", ' + '"json": '
			+ params_json + '}';

		var stripeActionUrl = $("input[name=stripe_url]").val()
			+ 'stripe_getUserBalance';

		AppSystem.putStripeLoading();

		$.ajax({
			url : stripeActionUrl,
			type : 'POST',
			dataType : 'jsonp',
			data : 'json=' + data,
			success : function(response) {
				setX_MEMREAS_CHAMELEON(response.x_memreas_chameleon);
				response = JSON.parse(response.data);
				if (response.status == 'Success') {
					userObject.buyer_balance = response.buyer_balance;
					jTargetElement.html("$" + response.buyer_balance);
				} else {
					jerror(response.message);
					jTargetElement.html("$" + userObject.buyer_balance);
				}
				AppSystem.removeStripeLoading();
			}
		});
	}
}
var Account = new Account();

$(function() {

    $("#account_dob").datepicker();

    $(".member-trasnsaction-head").one("click", function() {
		getAccountOrderHistory();
    });

	//Load account cards
    $(".account-card-section").click(function() {
		var jMemberCard = $(".account-payment");
		if (checkReloadItem('reload_account_cards')
			|| jMemberCard.html() == '') {
		    if (!jMemberCard.hasClass('preload-null'))
			jMemberCard.addClass('preload-null')
		}
		Account.loadCards(".account-payment", 'account-card', 'accountCardChange', '$(".account-card-functions").show()');
	});

	//Payment method tab remove card button click
	$("#btn-account-remove-card").click(function() {
		Account.removeCard(false, '.account-payment', 'account-card', 'accountCardChange', '$(".account-card-functions").show()');
	});

	//Payment method tab add card button click
	$("#btn-popup-add-card").click(function() {
		Account.addCard('.accountAddCardForm', '.account-payment', 'account-card', 'accountCardChange', '$(".account-card-functions").show()');
	});

    $("#tabs-more").mouseover(function() {
	$(".tab-slide-nav").fadeIn(500);
    });
    $(".tab-slide-nav").mouseleave(function() {
	$(this).fadeOut(500);
    });

    var tabBaseMargin = parseInt($("#tabs-more li:eq(0)").css("margin-left"));
    // Tab navigator
    $(".tab-slide-nav .slide-left").click(function() {
	var jFirstTab = $("#tabs-more li:eq(0)");
	var firstTabMargin = parseInt(jFirstTab.css("margin-left"));
	if (tabBaseMargin - firstTabMargin < 10)
	    return false;
	var firstTabWidth = jFirstTab.width();
	var marginPos = firstTabMargin + firstTabWidth;
	jFirstTab.attr("style", "margin-left: " + marginPos + "px !important");
    });

    $(".tab-slide-nav .slide-right")
	    .click(
		    function() {

			var lastElementX = parseInt($(
				"#tabs-more li:last-child").position().left);
			if (lastElementX > parseInt($('body').width() / 2)) {
			    var jFirstTab = $("#tabs-more li:eq(0)");
			    var firstTabWidth = jFirstTab.width();
			    var firstTabMargin = parseInt(jFirstTab
				    .css("margin-left"));
			    var marginPos = firstTabMargin - firstTabWidth;
			    jFirstTab.attr("style", "margin-left: " + marginPos
				    + "px !important");
			}
		    });

    $(".account-billing-tab").one('click', function() {
	$('.account-billing').mCustomScrollbar({
	    scrollButtons : {
		enable : true
	    }
	});
    });
});

/*
 * Card process section
 */
var accountTab_cards = new Object();

function accountCardChange(choose_card_id) {
    choose_card_id = choose_card_id.replace('account-card-', '');
    accountResetCardChoose();
    for ( var i in Account.accountTab_cards) {
		if (choose_card_id == Account.accountTab_cards[i].card_id) {
			Account.accountTab_cards[i].selected = 1;
		}
    }
}

function accountResetCardChoose() {
    for (var i in Account.accountTab_cards) {
		Account.accountTab_cards[i].selected = 0;
    }
}

function accountAddCardPopup() {
    // Reset form;
    var jAddCard = $(".accountAddCardForm");
    jAddCard.find('input[type=text]').each(function() {
	$(this).val($(this).attr('default'));
    });
    jAddCard.find('select').val('');
    popup('popup-addcard-account-payment');
}

function accountViewCard() {
    var deleteBoolean = false;
    for ( var key in arguments) {
	if (arguments[key] === "delete") {
	    deleteBoolean = true;
	    // return false;
	}
    }// Check whether function is called from accountRemoveCard
    // function

    // Reset form;
    var jViewCard = $(".accountEditCardForm");
    jViewCard.find('input[type=text]').each(function() {
	$(this).val($(this).attr('default'));
    });
    jViewCard.find('select').val('');

    var selectedCard = '';
    for ( var i in Account.accountTab_cards) {
		if (Account.accountTab_cards[i].selected == 1) {
			selectedCard = Account.accountTab_cards[i].data.stripe_card_reference_id;
			break;
		}
    }

    if (selectedCard == '' && !deleteBoolean) {
		jerror('Please select a card');
    } else {
	var stripeActionUrl = $("input[name=stripe_url]").val()
		+ 'stripe_viewCard';
	var params = new Object();
	params.user_id = Account.id;
	params.memreascookie = getCookie("memreascookie");
	params.sid = getCookie("memreascookie");
	//params.x_memreas_chameleon = getCookie("x_memreas_chameleon");
	params.card_id = selectedCard;

	var data_object = JSON.stringify(params, null, '\t');

	var data = '{"action": "listCard", ' + '"type":"jsonp", ' + '"json": '
		+ data_object + '}';

	$('#loadingpopup').fadeIn(1000);
	//alert("action=listCard memreascookie="+params.memreascookie+" user_id="+params.user_id);
	if (deleteBoolean) {
	    $
		    .ajax({
			type : 'post',
			url : stripeActionUrl,
			dataType : 'jsonp',
			data : 'json=' + data,
			success : function(response) {
			    response = jQuery.parseJSON(response.data);
			    if (response.status == 'Success') {
				var card_info = response.card;
				var first_name = card_info.name.split(' ')[0];
				var last_name = card_info.name.split(' ')[1];
				jViewCard.find("#card_id").val(card_info.id)
					.attr('readonly', true);
				jViewCard.find("#addcard_fname")
					.val(first_name).attr('readonly', true);
				jViewCard.find("#addcard_lname").val(last_name)
					.attr('readonly', true);
				jViewCard.find("#addcard_cctype").val(
					card_info.type).attr('readonly', true);
				jViewCard.find("#addcard_ccnum").val(
					'***' + card_info.last4).attr(
					'readonly', true);
				jViewCard.find("#addcard_expmonth").val(
					card_info.exp_month).attr('readonly',
					true);
				jViewCard.find("#addcard_expyear").val(
					card_info.exp_year).attr('readonly',
					true);
				jViewCard.find("#addcard_ccv").val('***').attr(
					'readonly', true);
				jViewCard.find("#addcard_address1").val(
					card_info.address_line1).attr(
					'readonly', true);
				jViewCard.find("#addcard_address2").val(
					card_info.address_line2).attr(
					'readonly', true);
				jViewCard.find("#addcard_city").val(
					card_info.address_city).attr(
					'readonly', true);
				jViewCard.find("#addcard_state").val(
					card_info.address_state).attr(
					'readonly', true);
				jViewCard.find("#addcard_zip").val(
					card_info.address_zip).attr('readonly',
					true);
				$('#loadingpopup').fadeOut(500);
				popup('popupaccountviewcard_delete');
			    } else {
				$('#loadingpopup').fadeOut(500);
				jerror(response.message);
			    }
			}
		    });
	} else {
	    $
		    .ajax({
			type : 'post',
			url : stripeActionUrl,
			dataType : 'jsonp',
			data : 'json=' + data,
			success : function(response) {
			    response = jQuery.parseJSON(response.data);
			    if (response.status == 'Success') {
				var card_info = response.card;
				var first_name = card_info.name.split(' ')[0];
				var last_name = card_info.name.split(' ')[1];
				jViewCard.find("#card_id").val(card_info.id);
				jViewCard.find("#addcard_fname")
					.val(first_name);
				jViewCard.find("#addcard_lname").val(last_name);
				jViewCard.find("#addcard_cctype").val(
					card_info.type).attr('readonly', true);
				jViewCard.find("#addcard_ccnum").val(
					'***' + card_info.last4).attr(
					'readonly', true);
				jViewCard.find("#addcard_expmonth").val(
					card_info.exp_month).attr('readonly',
					true);
				jViewCard.find("#addcard_expyear").val(
					card_info.exp_year).attr('readonly',
					true);
				jViewCard.find("#addcard_ccv").val('***').attr(
					'readonly', true);
				jViewCard.find("#addcard_address1").val(
					card_info.address_line1);
				jViewCard.find("#addcard_address2").val(
					card_info.address_line2);
				jViewCard.find("#addcard_city").val(
					card_info.address_city);
				jViewCard.find("#addcard_state").val(
					card_info.address_state);
				jViewCard.find("#addcard_zip").val(
					card_info.address_zip);
				$('#loadingpopup').fadeOut(500);
				popup('popupaccountviewcard');
			    } else {
				$('#loadingpopup').fadeOut(500);
				jerror(response.message);
			    }
			}
		    });
	}
    }
}

function accountUpdateCard() {
    var jEditCard = $(".accountEditCardForm");
    var formPass = true;

    // Check all input passed
    jEditCard.find('input[type=text]').not("#addcard_address2").each(
	    function() {
		if ($(this).val() == ''
			|| $(this).val() == $(this).attr('default')) {
		    $(this).focus();
		    formPass = false;
		    return false;
		}
	    });
    jEditCard.find('select').each(function() {
	if ($(this).val() == '') {
	    formPass = false;
	    return;
	}
    });

    if (!formPass) {
	jerror('Please complete all require fields');
    } else {
	var stripeActionUrl = $("input[name=stripe_url]").val()
		+ 'stripe_updateCard';
	var obj = new Object();
	obj.user_id = $("input[name=user_id]").val();
	obj.memreascookie = getCookie("memreascookie");
	obj.sid = getCookie("memreascookie");
	obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
	obj.id = jEditCard.find("#card_id").val();
	obj.name = jEditCard.find("#addcard_fname").val() + ' '
		+ jEditCard.find("#addcard_lname").val();
	obj.exp_month = jEditCard.find("#addcard_expmonth").val();
	obj.exp_year = jEditCard.find("#addcard_expyear").val();
	obj.address_line1 = jEditCard.find("#addcard_address1").val();
	obj.address_line2 = jEditCard.find("#addcard_address2").val();
	obj.address_city = jEditCard.find("#addcard_city").val();
	obj.address_state = jEditCard.find("#addcard_state").val();
	obj.address_zip = jEditCard.find("#addcard_zip").val();

	var json_storeCard = JSON.stringify(obj);

	var data = '{"action": "updateCard", ' + '"type":"jsonp", '
		+ '"json": ' + json_storeCard + '}';

	$('#loadingpopup').fadeIn(1000);
	$
		.ajax({
		    type : 'post',
		    url : stripeActionUrl,
		    dataType : 'jsonp',
		    data : 'json=' + data,
		    timeout : 10000,
		    error : function(response, textStatus, errorThrown) {
			if (textStatus === 'timeout') {
			    jerror('Card update failure. Please check card\'s information.');
			    $('#loadingpopup').fadeOut(500);
			}

		    },
		    success : function(response) {
			response = jQuery.parseJSON(response.data);
			$('#loadingpopup').fadeOut(500);
			if (response.status == 'Success')
			    jsuccess('Card information updated');
			else
			    jerror(response.message);
		    }
		});
    }
}

/*
 * Account plan section
 */
$(function() {
    $(".account-plans-tab").click(function() {
	getAccountPlans();
    });
});
function getAccountPlans() {
    var jAccountPlans = $(".account-plans");
    jAccountPlans.empty();

    // Get customer info based on this account
    var obj = new Object();
    obj.userid = $("input[name=user_id]").val();
    obj.memreascookie = getCookie("memreascookie");
    obj.sid = getCookie("memreascookie");
    obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
    data_obj = JSON.stringify(obj, null, '\t');
    data = '{"action": "getCustomerInfo", ' + '"type":"jsonp", ' + '"json": '
	    + data_obj + '}';

    var stripeCustomerUrl = $("input[name=stripe_url]").val()
	    + 'stripe_getCustomerInfo';

    $('#loadingpopup').fadeIn(1000);
    $
	    .ajax({
		url : stripeCustomerUrl,
		type : 'POST',
		dataType : 'jsonp',
		data : 'json=' + data,
		success : function(response) {
		    response = jQuery.parseJSON(response.data);
		    if (response.status == 'Success') {
				var account_stripe = response.account.customer;
				if (account_stripe.exist) {
					var total_subscriptions = account_stripe.info.subscriptions.total_count;
					if (total_subscriptions > 0) {
					jAccountPlans
						.append('<li><label class="label_text2"><label for="account-plan-1"></label>Your current active plans:</label></li>');
					var active_subscriptions = account_stripe.info.subscriptions.data;
					for (var i = 0; i < total_subscriptions; i++) {
						var plan = active_subscriptions[i].plan;
						var html_element = '<li><label class="label_text2"><label for="account-plan-1"></label>'
							+ plan.name + '</label></li>';
						jAccountPlans.append(html_element);
					}
					} else
					jAccountPlans
						.html('You are using our free plan. Use the subscriptions tab to upgrade.');
				} else
					jAccountPlans
						.html("You are using our free plan. Use the subscriptions tab to upgrade.");
				} else
				jAccountPlans
					.html("You are using our free plan. Use the subscriptions tab to upgrade.");
				$('#loadingpopup').fadeOut(500);
			}
	    });
}

/*
 * Get account order histories from stripe
 */
function getAccountOrderHistory() {
    var params = [ {
	tag : 'user_id',
	value : LOGGED_USER_ID
    }, {
	tag : 'page',
	value : '1'
    }, {
	tag : 'limit',
	value : '100'
    } ];
    var jElement = $(".transaction-details");
    jElement.empty();
    ajaxRequest(
	    'getorderhistory',
	    params,
	    function(response) {
		if (getValueFromXMLTag(response, 'status') == 'Success') {
		    var transactions = getSubXMLFromTag(response, 'order');
		    console.log(transactions);
		    for (var i = 0; i < transactions.length; i++) {
			var transaction = transactions[i];
			var amount = getValueFromXMLTag(transaction, 'amount');
			var transaction_type = getValueFromXMLTag(transaction,
				'transaction_type');
			transaction_type = transaction_type.split("_")
				.join(" ");
			var transaction_sent = getValueFromXMLTag(transaction,
				'transaction_sent');
			var html = '<tr class="transaction-row">'
				+ '<td class="transaction-no">' + (i + 1)
				+ '</td>' + '<td class="transaction-type">'
				+ transaction_type + '</td>'
				+ '<td class="transaction-detail">'
				+ getValueFromXMLTag(transaction, '') + '</td>';

			html += '<td class="transaction-begin-status">Success</td>'
				+ '<td class="transaction-amount">'
				+ ((amount) ? amount : '..') + '</td>';

			html += '<td class="transaction-ending-currency">USD</td>'
				+ '<td class="transaction-date">'
				+ transaction_sent + '</td>' + '</tr>';
			jElement.append(html);
		    }
		    $(".member-transaction").mCustomScrollbar({
			scrollButtons : {
			    enable : true
			}
		    });
		} else
		    jElement
			    .append('<tr class="transaction-row"><td colspan="8">no record</td></tr>');
	    })
}