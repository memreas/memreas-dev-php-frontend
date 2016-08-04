/**
 * @ Stripe account functions
 */
// handle header steps clicking
var account_stripe = new Object();
var plans_payment = new Object();
var account_cards = new Object();
var check_user_subscription = 0;
var default_plan = 'PLAN_A_2GB_MONTHLY';
$(function() {

	// Step 1
	if (userObject.plan != 'FREE') {
		$(".step1-next")
				.removeClass("button-disabled")
				.attr("href", 'javascript:;')
				.attr('onclick',
						"activeAkordeon('subscription-payment-method-tab', subscription_step2);");
	}

	// Step 2
	$(".subscription-payment-method").click(function() {
		subscription_step2();
	});

	// Step 3
	$(".subscription-order-summary").click(function() {
		subscription_step3();
	});

	// Step 4
	$(".subscription-order-receipt").click(function() {
		confirmOrder();
	});
});

function planChange(choose_plan_id) {
	console.log('planChange(choose_plan_id)');
	var real_plan_id = choose_plan_id.replace('plan-', '');
	resetPlanChoose();
	for ( var i in plans_payment) {
		if (real_plan_id == plans_payment[i].plan_id) {
			plans_payment[i].selected = 1;
		}
	}

	if (userObject.plan == 'FREE') {
		if (real_plan_id == default_plan) {
			if (!$(".step1-next").hasClass('button-disabled'))
				$(".step1-next").addClass("button-disabled");
			$(".step1-next").removeAttr("href").removeAttr("onclick");
		} else
			$(".step1-next")
					.removeClass("button-disabled")
					.attr("href", 'javascript:;')
					.attr('onclick',
							"activeAkordeon('subscription-payment-method-tab', subscription_step2);");
	}

}
function resetPlanChoose() {
	console.log('resetPlanChoose()');
	for ( var i in plans_payment) {
		plans_payment[i].selected = 0;
	}
}

function subscriptionCardChange(choose_card_id) {
	console.log('cardChange(choose_card_id)');
	choose_card_id = choose_card_id.replace('subscription-card-', '');
	resetCardChoose();
	for (var i in Account.subscriptionTab_cards) {
		if (choose_card_id == Account.subscriptionTab_cards[i].card_id) {
			Account.subscriptionTab_cards[i].selected = 1;
		}
	}
}
function resetCardChoose() {
	for (var i in Account.subscriptionTab_cards) {
		Account.subscriptionTab_cards[i].selected = 0;
	}
}

function loadSubscriptionPlans() {
	console.log('loadSubscriptionPlans()');
	var jSubscriptionPlans = $(".subscription-plans");
	if (jSubscriptionPlans.hasClass('preload-null'))
		getPlans();
}

// Subscription steps
function subscription_step2() {
	console.log('subscription_step2()');
	var jSubscriptionPlans = $(".subscription-plans");
	var checkPlanChoose = false;
	jSubscriptionPlans.find('input[type=radio]').each(function() {
		if ($(this).is(":checked")) {
			checkPlanChoose = true;
			return;
		}
	});
	if (!checkPlanChoose) {
		jerror('<span>Please choose a subscription plan to continue</span>');
		activeAkordeon('subscription-payment-plans-tab', false);
		return false;
	}

	var jMemberCard = $(".subscription-payment");
	if (checkReloadItem('reload_subscription_cards')
			|| jMemberCard.html() == '') {
		if (!jMemberCard.hasClass('preload-null'))
			jMemberCard.addClass('preload-null');
	}
	Account.loadCards(".subscription-payment", 'subscription-card', 'subscriptionCardChange', '');
}

function subscription_step3() {
	var html_content = '';
	var jOrderSummary = $(".order-summary");
	var jOrderSummaryActions = jOrderSummary.next('.bottom-actions');
	jOrderSummaryActions.hide();
	jOrderSummary.empty();
	var jSubscriptionPlans = $(".subscription-plans");
	var jMemberCard = $(".subscription-payment");
	var checkPlanChoose = false;
	var checkCardChoose = false;
	jSubscriptionPlans.find('input[type=radio]').each(function() {
		if ($(this).is(":checked")) {
			checkPlanChoose = true;
			return;
		}
	});
	if (!checkPlanChoose)
		html_content = '<li><span class="error-description">Previous step error! Please choose a plan first.</span></li>';
	else {
		jMemberCard.find('input[type=radio]').each(function() {
			if ($(this).is(":checked")) {
				checkCardChoose = true;
				return;
			}
		});
		if (!checkCardChoose)
			html_content = '<li><span class="error-description">Previous step error! Please choose a payment method.</span></li>';
		else
			html_content = $(".order-summary-preview ul").html();
	}

	jOrderSummary.html(html_content);
	if (!checkPlanChoose || !checkCardChoose)
		return false;

	// Fetch the order plan
	var orderPlan = new Object();
	for (i in plans_payment) {
		if (plans_payment[i].selected == 1) {
			orderPlan = plans_payment[i].data;
			break;
		}
	}

	// Fetch the card
	var orderCard = new Object();
	for (var i in Account.subscriptionTab_cards) {
		if (Account.subscriptionTab_cards[i].selected == 1) {
			orderCard = Account.subscriptionTab_cards[i].data;
			break;
		}
	}

	var card_name = orderCard.first_name + ' ' + orderCard.last_name;
	jOrderSummary.find('#order-summary-name').val(card_name);
	jOrderSummary.find('#order-summary-address1').val(orderCard.address_line_1);
	jOrderSummary.find('#order-summary-address2').val(orderCard.address_line_2);
	jOrderSummary.find('#order-card-type').html(orderCard.card_type);
	jOrderSummary.find('#order-summary-ccnum').val(
			orderCard.obfuscated_card_number);
	jOrderSummary.find('#order-summary-expdate').val(orderCard.exp_month);
	jOrderSummary.find('#order-summary-expyear').val(orderCard.valid_until);
	jOrderSummary.find('#order-summary-city').val(orderCard.city);
	jOrderSummary.find('#order-summary-state').val(orderCard.state);
	jOrderSummary.find('#order-summary-zip').val(orderCard.zip_code);

	jOrderSummary.find('#choose-plan-name').html(orderPlan.name);
	jOrderSummary.find('#choose-plan-cost')
			.html('$' + (orderPlan.amount / 100));
	updateAkordeonContent($('.subscription-order-summary-tab'));
}

function subscription_step4() {
	var html_content = '';
	var jOrderRecept = $(".order-recept");
	jOrderRecept.show();

	var jSubscriptionPlans = $(".subscription-plans");
	var jMemberCard = $(".subscription-payment");
	var checkPlanChoose = false;
	var checkCardChoose = false;
	jSubscriptionPlans.find('input[type=radio]').each(function() {
		if ($(this).is(":checked")) {
			checkPlanChoose = true;
			return;
		}
	});
	if (!checkPlanChoose){
		html_content = '<li><span class="error-description">Previous step error! Please choose a plan first.</span></li>';
	} else {
		jMemberCard.find('input[type=radio]').each(function() {
			if ($(this).is(":checked")) {
				checkCardChoose = true;
				return;
			}
		});
		if (!checkCardChoose) {
			html_content = '<li><span class="error-description">Previous step error! Please choose a payment method.</span></li>';
		}
	}

	jOrderRecept.html(html_content);
	if (!checkPlanChoose || !checkCardChoose) {
		return false;
	}

	// Fetch the order plan
	var orderPlan = new Object();
	for ( var i in plans_payment) {
		if (plans_payment[i].selected == 1) {
			orderPlan = plans_payment[i].data;
			break;
		}
	}

	// Fetch the card
	var orderCard = new Object();
	for ( var i in Account.subscriptionTab_cards) {
		if (Account.subscriptionTab_cards[i].selected == 1) {
			orderCard = Account.subscriptionTab_cards[i].data;
			break;
		}
	}
	var stripeActionUrl = $("input[name=stripe_url]").val()
			+ 'stripe_subscribe';
	var order_summary = new Object();
	order_summary.memreascookie = getCookie("memreascookie");
	order_summary.x_memreas_chameleon = getCookie("x_memreas_chameleon");
	order_summary.sid = getCookie("x_memreas_chameleon");
	order_summary.userid = $("input[name=user_id]").val();
	order_summary.card_id = orderCard.stripe_card_reference_id;
	order_summary.plan = orderPlan.id;
	order_summary.amount = orderPlan.amount / 100;

	order_summary = JSON.stringify(order_summary, null, '\t');
	var data = '{"action": "subscription", ' + '"type":"jsonp", ' + '"json": '
			+ order_summary + '}';
	$('.stripe-payment').fadeIn(1000);
	$
			.ajax({
				url : stripeActionUrl,
				type : 'POST',
				dataType : 'jsonp',
				data : 'json=' + data,
				timeout: 10000,
				success : function(response) {
				    	console.log('Subscription' +response);
				  	response = jQuery.parseJSON( response.data );
					if (response.status == 'Success') {
						jOrderRecept.html("<li classs='my-customer-active-format subscription-message' >Your plan is "+order_summary.plan+" activated successfully</li>");

						updateAkordeonContent($('.subscription-order-receipt-tab'));
						check_user_subscription = 1;

						// Reload user subscription
						var jAccountPlans = $(".list-plans");
						jAccountPlans.empty();
						var obj = new Object();
						obj.userid = $("input[name=user_id]").val();
						obj.memreascookie = getCookie("memreascookie");
						obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
						var data_obj = JSON.stringify(obj, null, '\t');
						var data = '{"action": "getCustomerInfo", '
								+ '"memreascookie":"' + getCookie("memreascookie") + '", ' + 
								'"type":"jsonp", ' + '"json": ' + data_obj
								+ '}';
						var stripeCustomerUrl = $("input[name=stripe_url]")
								.val()
								+ 'stripe_getCustomerInfo';
						$
								.ajax({
									url : stripeCustomerUrl,
									type : 'POST',
									dataType : 'jsonp',
									data : 'json=' + data,
									timeout: 10000,
									success : function(response) {
										response = JSON.parse(response.data);
										if (response.status == 'Success') {
											var account = response.buyer_account;
											if (typeof account != 'undefined') {
												var subscription = account.subscription;
												if (typeof subscription != 'undefined') {
													var plan_id = subscription.plan;
													var plan_name = subscription.plan_description;
													var html_element = '<p>'
														+ plan_name
														+ '</p>';
													jAccountPlans
														.append(html_element);
													$("input#plan-" + plan_id).attr("checked", "checked");
													planChange(plan_id);
													check_user_subscription = 1;
												} else {
													setUserDefaultPlan();
													$("input#plan-PLAN_A_2GB_MONTHLY").attr("checked", "checked");
													planChange('PLAN_A_2GB_MONTHLY');
												}
											} else
												jAccountPlans
														.html('Your account has not existed or deleted before on Stripe');
										} else
											setUserDefaultPlan();
										$('#loadingpopup').hide();
									}
								});
					} else {
						jerror(response.message);
						html_content = '<li><span class="error-description">'
								+ response.message + '</span></li>';
						jOrderRecept.html(html_content);
					}
					$('.stripe-payment').fadeOut(500);
				}
			});
}

function getPlans() {
	var jAccountPlans = $(".list-plans");
	jAccountPlans.empty();
	var jSubscriptionPlans = $(".subscription-plans");
	jSubscriptionPlans.removeClass('.preload-null').empty();
	var stripeActionUrl = $("input[name=stripe_url]").val() + 'stripe_listPlan';
	var obj = new Object();
	obj.user_id = $("input[name=user_id]").val();
	obj.memreascookie = getCookie("memreascookie");
	obj.sid = getCookie("memreascookie");
	obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
	var data_obj = JSON.stringify(obj, null, '\t');
	var data = '{"action": "listPlan", ' + '"type":"jsonp", ' + '"json": '
			+ data_obj + '}';

	$('#loadingpopup').show();
	$
			.ajax({
				url : stripeActionUrl,
				type : 'POST',
				dataType : 'jsonp',
				data : 'json=' + data,
				timeout: 30000,
				success : function(response) {
					var plans = JSON.parse(response.data);
					var plans = plans.plans;
					console.log(plans);
					var plan_count = plans.length;
					console.log("plans ---> " + plans);
					console.log("plan_count ---> " + plan_count);
					if (plan_count > 0) {
						for (var i = 0;i < plan_count;i++) {
							plans_payment[i] = new Object();
							var params = {
								plan_id : plans[i].id,
								selected : 0,
								data : plans[i]
							};
							plans_payment[i] = params;
							var html_element = '<li><label class="label_text2"><input type="radio" id="plan-'
									+ plans[i].id
									+ '" name="radio_plans" class="regular-radio" onchange="planChange(this.id);" /><label for="plan-'
									+ plans[i].id
									+ '"></label>'
									+ plans[i].name
									+ ' - $'
									+ (plans[i].amount / 100) + '</label></li>';
							jSubscriptionPlans.append(html_element);
						}
						// Get customer info based on this account
						var obj = new Object();
						obj.user_id = Account.id;
						obj.memreascookie = getCookie("memreascookie");
						obj.sid = getCookie("memreascookie");
						obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
						var data_obj = JSON.stringify(obj, null, '\t');
						var data = '{"action": "getCustomerInfo", '
								+ '"memreascookie":"' + getCookie("memreascookie") + '", ' +
								'"type":"jsonp", ' + '"json": ' + data_obj
								+ '}';
						var stripeCustomerUrl = $("input[name=stripe_url]")
								.val()
								+ 'stripe_getCustomerInfo';
						$
								.ajax({
									url : stripeCustomerUrl,
									type : 'POST',
									dataType : 'jsonp',
									data : 'json=' + data,
									timeout: 30000,
									success : function(response) {
										response = JSON.parse(response.data);
										if (response.status == 'Success') {
											var account = response.buyer_account;
											if (typeof account != 'undefined') {
												var subscription = account.subscription;
												if (typeof subscription != 'undefined') {
													var plan_id = subscription.plan;
													var plan_name = subscription.plan_description;
													var html_element = '<p>'
															+ plan_name
															+ '</p>';
													jAccountPlans
															.append(html_element);
													$("input#plan-" + plan_id).attr("checked", "checked");
													planChange(plan_id);
													check_user_subscription = 1;
												} else {
													setUserDefaultPlan();
													$("input#plan-PLAN_A_2GB_MONTHLY").attr("checked", "checked");
													planChange('PLAN_A_2GB_MONTHLY');
												}
											} else
												jAccountPlans
														.html('Your account has not existed or deleted before on Stripe');
										} else {
											setUserDefaultPlan();
											$("input#plan-PLAN_A_2GB_MONTHLY").attr("checked", "checked");
											planChange('PLAN_A_2GB_MONTHLY');
										}
										updateAkordeonContent($('.subscription-payment-plans-tab'));
										$('#loadingpopup').hide();
									},
									error : function(response, textStatus, errorThrown) {
										if(textStatus === 'timeout')
									    {     
											jerror('request timeout - please try again later');
											$('#loadingpopup').hide();
									    }
										
									}
								});
					} else {
						jerror('There is no plan at this time! Please come back and purchase later');
						$('#loadingpopup').hide();
					}
				},
				error : function(response, textStatus, errorThrown) {
					if(textStatus === 'timeout')
				    {     
						jerror('request timeout - please try again later');
						$('#loadingpopup').hide();
				    }
					
				}
			});
}

function setUserDefaultPlan() {
	var jAccountPlans = $(".list-plans");
	jAccountPlans.empty();
	jAccountPlans.html('free 2gb monthly');
}

function addCardPopup() {
	console.log('addCardPopup()');
	// Reset form;
	var jAddCard = $(".subscriptionAddCardForm");
	jAddCard.find('input[type=text]').each(function() {
		$(this).val($(this).attr('default'));
	});
	jAddCard.find('select').val('');
	popup('popup-addcard-subscription-payment');
}

function stripeAddCard() {
	console.log('stripeAddCard()');
	Account.addCard('.subscriptionAddCardForm', ".subscription-payment", 'subscription-card', 'subscriptionCardChange', '');
}

function confirmOrder(checkSubscription) {
	// Check order confirm checkbox
	if (!($("#subscription-order-agree").is(":checked"))) {
		jerror("You must agree with our terms of service");
		$(".order-recept").hide();
		return false;
	}

	if (checkSubscription && check_user_subscription) {
		jconfirm(
				"You have an activated plan, are you sure want to upgrade/downgrade? <br/>(Downgrade will not be charged.)",
				"confirmOrder(false)");
		return false;
	}

	activeAkordeon('subscription-order-receipt-tab', subscription_step4);
}
function showTermsAndService() {
	popup('popupTermsAndService');
}

function popupPolicy() {
	disablePopup('popupTermsAndService');
	popup('popupPolicy');
}