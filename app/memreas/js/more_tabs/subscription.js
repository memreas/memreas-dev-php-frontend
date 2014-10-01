/**
 *@ Stripe account functions
 */
//handle header steps clicking
var account_stripe = new Object();
var plans_payment = new Object();
var account_cards = new Object();
var check_user_subscription = 0;
$(function(){

    //Step 1

    //Step 2
    $(".subscription-payment-method").click(function(){
        subscription_step2();
    });

    //Step 3
    $(".subscription-order-summary").click(function(){
        subscription_step3();
    });

    //Step 4
    $(".subscription-order-receipt").click(function(){
        confirmOrder();
    });
});

function planChange(choose_plan_id){
    var real_plan_id = choose_plan_id.replace('plan-', '');
    resetPlanChoose();
    for (i in plans_payment){
        if (real_plan_id == plans_payment[i].plan_id){
            plans_payment[i].selected = 1;
        }
    }
}
function resetPlanChoose(){
    for (var i in plans_payment){
        plans_payment[i].selected = 0;
    }
}

function cardChange(choose_card_id){
    choose_card_id = choose_card_id.replace('subscription-card-', '');
    resetCardChoose();
    for (var i in account_cards){
        if (choose_card_id == account_cards[i].card_id){
            account_cards[i].selected = 1;
        }
    }
}
function resetCardChoose(){
    for (var i in account_cards){
        account_cards[i].selected = 0;
    }
}

function loadSubscriptionPlans(){
    var jSubscriptionPlans = $(".subscription-plans");
    if (jSubscriptionPlans.hasClass('preload-null'))
        getPlans();
}

//Subscription steps
function subscription_step2(){
    var jSubscriptionPlans = $(".subscription-plans");
    var checkPlanChoose = false;
    jSubscriptionPlans.find('input[type=radio]').each(function(){
        if ($(this).is(":checked")){
            checkPlanChoose = true;
            return;
        }
    });
    if (!checkPlanChoose){
        jerror('<span>Please choose a subscription plan to continue</span>');
        activeAkordeon('subscription-payment-plans-tab', false);
        return false;
    }

    var jMemberCard = $(".subscription-payment");
    if (checkReloadItem('reload_subscription_cards') || jMemberCard.html() == ''){
        if (!jMemberCard.hasClass('preload-null'))
            jMemberCard.addClass('preload-null');
    }
    listStripeCard();
}

function subscription_step3(){
    var html_content = '';
    var jOrderSummary = $(".order-summary");
    var jOrderSummaryActions = jOrderSummary.next('.bottom-actions');
    jOrderSummaryActions.hide();
    jOrderSummary.empty();
    var jSubscriptionPlans = $(".subscription-plans");
    var jMemberCard = $(".subscription-payment");
    var checkPlanChoose = false;
    var checkCardChoose = false;
    jSubscriptionPlans.find('input[type=radio]').each(function(){
        if ($(this).is(":checked")){
            checkPlanChoose = true;
            return;
        }
    });
    if (!checkPlanChoose)
        html_content = '<li><span class="error-description">Previous steps error! Please choose a plan first.</span></li>';
    else{
        jMemberCard.find('input[type=radio]').each(function(){
            if ($(this).is(":checked")){
                checkCardChoose = true;
                return;
            }
        });
        if (!checkCardChoose)
            html_content = '<li><span class="error-description">Previous steps error! Please choose a payment method.</span></li>';
        else html_content = $(".order-summary-preview ul").html();
    }

    jOrderSummary.html(html_content);
    if (!checkPlanChoose || !checkCardChoose) return false;

    //Fetch the order plan
    var orderPlan = new Object();
    for (i in plans_payment){
        if (plans_payment[i].selected == 1){
            orderPlan = plans_payment[i].data;
            break;
        }
    }

    //Fetch the card
    var orderCard = new Object();
    for (i in account_cards){
        if (account_cards[i].selected == 1){
            orderCard = account_cards[i].data;
            break;
        }
    }

    var card_data = orderCard.stripe_card_response;

    jOrderSummary.find('#order-summary-name').val(orderCard.first_name + ' ' + orderCard.last_name);
    jOrderSummary.find('#order-summary-address1').val(orderCard.address_line_1);
    jOrderSummary.find('#order-summary-address2').val(orderCard.address_line_2);
    jOrderSummary.find('#order-card-type').html(orderCard.card_type);
    jOrderSummary.find('#order-summary-ccnum').val(orderCard.obfuscated_card_number);
    jOrderSummary.find('#order-summary-expdate').val(card_data.exp_month);
    jOrderSummary.find('#order-summary-expyear').val(card_data.exp_year);
    jOrderSummary.find('#order-summary-city').val(card_data.address_city);
    jOrderSummary.find('#order-summary-state').val(card_data.address_state);
    jOrderSummary.find('#order-summary-zip').val(orderCard.zip_code);

    jOrderSummary.find('#choose-plan-name').html(orderPlan.name);
    jOrderSummary.find('#choose-plan-cost').html((orderPlan.amount / 100) + ' ' + orderPlan.currency);
    updateAkordeonContent($('.subscription-order-summary-tab'));
}

function subscription_step4(){
    var html_content = '';
    var jOrderRecept = $(".order-recept");
    jOrderRecept.show();

    var jSubscriptionPlans = $(".subscription-plans");
    var jMemberCard = $(".subscription-payment");
    var checkPlanChoose = false;
    var checkCardChoose = false;
    jSubscriptionPlans.find('input[type=radio]').each(function(){
        if ($(this).is(":checked")){
            checkPlanChoose = true;
            return;
        }
    });
    if (!checkPlanChoose)
        html_content = '<li><span class="error-description">Previous steps error! Please choose a plan first.</span></li>';
    else{
        jMemberCard.find('input[type=radio]').each(function(){
            if ($(this).is(":checked")){
                checkCardChoose = true;
                return;
            }
        });
        if (!checkCardChoose)
            html_content = '<li><span class="error-description">Previous steps error! Please choose a payment method.</span></li>';
    }

    jOrderRecept.html(html_content);
    if (!checkPlanChoose || !checkCardChoose) return false;

    //Fetch the order plan
    var orderPlan = new Object();
    for (var i in plans_payment){
        if (plans_payment[i].selected == 1){
            orderPlan = plans_payment[i].data;
            break;
        }
    }

    //Fetch the card
    var orderCard = new Object();
    for (var i in account_cards){
        if (account_cards[i].selected == 1){
            orderCard = account_cards[i].data;
            break;
        }
    }
    var stripeActionUrl = $("input[name=stripe_url]").val() + '/stripe/subscribe';
    var order_summary = new Object();
    order_summary.userid = $("input[name=user_id]").val();
    order_summary.card_id = orderCard.stripe_card_reference_id;
    order_summary.plan = orderPlan.id;
    order_summary.amount = orderPlan.amount / 100;

    order_summary = JSON.stringify(order_summary, null, '\t');
    var data = '{"action": "subscription", ' +
        '"type":"jsonp", ' +
        '"json": ' + order_summary  +
        '}';
    $('.stripe-payment').fadeIn(1000);
    $.ajax({
        url: stripeActionUrl,
        type: 'POST',
        dataType: 'jsonp',
        data: 'json=' + data,
        success: function(response){
            if (response.status == 'Success'){
                jOrderRecept.html($(".order-summary-recept ul").html());

                //Set order recept
                var card_data = orderCard.stripe_card_response;
                jOrderRecept.find('#order-recept-name').html(orderCard.first_name + ' ' + orderCard.last_name);
                jOrderRecept.find('#order-recept-address1').html(orderCard.address_line_1);
                jOrderRecept.find('#order-recept-address2').html(orderCard.address_line_2);
                jOrderRecept.find('#order-recept-cardtype').html(orderCard.card_type);
                jOrderRecept.find('#order-recept-ccnum').html(orderCard.obfuscated_card_number);
                jOrderRecept.find('#order-recept-expdate').html(card_data.exp_month);
                jOrderRecept.find('#order-recept-expyear').html(card_data.exp_year);
                jOrderRecept.find('#order-recept-city').html(card_data.address_city);
                jOrderRecept.find('#order-recept-state').html(card_data.address_state);
                jOrderRecept.find('#order-recept-zip').html(orderCard.zip_code);

                jOrderRecept.find('#choose-planrecept-name').html(orderPlan.name);
                jOrderRecept.find('#choose-planrecept-cost').html((orderPlan.amount / 100) + ' ' + orderPlan.currency);

                updateAkordeonContent($('.subscription-order-receipt-tab'));
                check_user_subscription = 1;
            }
            else{
                jerror(response.message);
                html_content = '<li><span class="error-description">' + response.message + '</span></li>';
                jOrderRecept.html(html_content);
            }
            $('.stripe-payment').fadeOut(500);
        }
    });
}


function getPlans(){
    var jAccountPlans = $(".list-plans");
    jAccountPlans.empty();
    var jSubscriptionPlans = $(".subscription-plans");
    jSubscriptionPlans.removeClass('.preload-null').empty();
    var stripeActionUrl = $("input[name=stripe_url]").val() + '/stripe/listPlan';
    var obj = new Object();
    obj.txt = "";
    var data_obj = JSON.stringify(obj, null, '\t');
    var data = '{"action": "list", ' +
        '"type":"jsonp", ' +
        '"json": ' + data_obj  +
        '}';
    $('#loadingpopup').show();
    $.ajax({
        url: stripeActionUrl,
        type: 'POST',
        dataType: 'jsonp',
        data: 'json=' + data,
        success: function(response){
            var plan_count = response.length;
            if (plan_count > 0){
                var plans = response;
                for (var i in plans){
                    plans_payment[i] = new Object();
                    var params = {plan_id:plans[i].id, selected:0, data:plans[i]};
                    plans_payment[i] = params;
                    var html_element = '<li><label class="label_text2"><input type="radio" id="plan-' + plans[i].id + '" name="radio_plans" class="regular-radio" onchange="planChange(this.id);" /><label for="plan-' + plans[i].id + '"></label>' + plans[i].name + ' - ' + (plans[i].amount / 100) + ' ' + plans[i].currency + '</label></li>';
                    jSubscriptionPlans.append(html_element);
                }
                //Get customer info based on this account
                var obj = new Object();
                obj.userid = $("input[name=user_id]").val();
                var data_obj = JSON.stringify(obj, null, '\t');
                var data = '{"action": "getCustomerInfo", ' +
                    '"type":"jsonp", ' +
                    '"json": ' + data_obj  +
                    '}';
                var stripeCustomerUrl = $("input[name=stripe_url]").val() + '/stripe/getCustomerInfo';
                $.ajax({
                    url: stripeCustomerUrl,
                    type: 'POST',
                    dataType: 'jsonp',
                    data: 'json=' + data,
                    success: function(response){
                        if (response.status == 'Success'){
                            account_stripe = response.customer;
                            if (account_stripe.exist == 1){
                                var total_subscriptions = account_stripe.info.subscriptions.total_count;
                                if (total_subscriptions > 0){
                                    var active_subscriptions = account_stripe.info.subscriptions.data;
                                    for (i = 0;i < total_subscriptions;i++){
                                        var plan = active_subscriptions[i].plan;
                                        var html_element = '<p>'  + plan.name + '</p>';
                                        jAccountPlans.append(html_element);
                                    }
                                    check_user_subscription = 1;
                                }
                                else jAccountPlans.html('You have no any actived plan');
                            }
                            else jAccountPlans.html('Your account has not existed or deleted before on Stripe');
                        }
                        else jAccountPlans.html('You have no any actived plan');
                        updateAkordeonContent($('.subscription-payment-plans-tab'));
                        $('#loadingpopup').hide();
                    }
                });
            }
            else {
                jerror('There is no plan at this time! Please come back and purchase later');
                $('#loadingpopup').hide();
            }
        }
    });
}
function listStripeCard(){

    var jMemberCard = $(".subscription-payment");
    if (!jMemberCard.hasClass('preload-null')) return false;
    jMemberCard.removeClass('preload-null');
    jMemberCard.empty();
    var stripeUserId = $("input[name=user_id]").val();
    var stripeActionUrl = $("input[name=stripe_url]").val() + '/stripe/listCards';
    var obj = new Object();
    obj = {userid:stripeUserId};
    var json_listCard = JSON.stringify(obj, null, '\t');
    var data = '{"action": "listcard", ' +
        '"type":"jsonp", ' +
        '"json": ' + json_listCard  +
        '}';
    $('#loadingpopup').show();
    $.ajax({
        url: stripeActionUrl,
        type: 'POST',
        dataType: 'jsonp',
        data: 'json=' + data,
        success: function(response){
            if (response.status == 'Success'){
                var cards = response.payment_methods;
                var number_of_cards = response.NumRows;

                if (number_of_cards > 0){

                    var default_card = '';
                    if (account_stripe.exist == 1){
                        default_card = account_stripe.info.default_card;
                    }

                    for (var i = 0;i < number_of_cards;i++){
                        account_cards[i] = new Object();
                        var params = {card_id:cards[i].stripe_card_reference_id, data:cards[i], selected:0};
                        var row_card_id = cards[i].stripe_card_reference_id;
                        var row_card_type = cards[i].card_type;
                        var row_card_obfuscated = cards[i].obfuscated_card_number;
                        account_cards[i]= params;
                        var html_element = '<li>' +
                            '<label class="label_text2"><input';

                        //Set first card is default checked
                        if (i == 0)
                            html_element += ' checked="checked"';

                        html_element += ' type="radio" id="subscription-card-' + row_card_id + '" name="radio_cards" class="regular-radio" onchange="cardChange(this.id);"';
                        //Set default card checked if available
                        if (default_card == row_card_id){
                            html_element += ' checked="checked"';
                            cardChange(default_card);
                        }
                        html_element += ' />' +
                            '<label for="subscription-card-' + row_card_id + '"></label>' + row_card_type + ' | ' + row_card_obfuscated + '</label>' +
                            '</li>';
                        jMemberCard.append(html_element);
                    }
                }
                else jMemberCard.append('<li>You have no card at this time. Try to add one first</li>');
                removeItem(reloadItems, 'reload_subscription_cards');
            }
            else {
                jMemberCard.append('<li>You have no card at this time. Try to add one first</li>');
                updateAkordeonContent($('.subscription-payment-method-tab'));
                jerror(response.message);
            }
            updateAkordeonContent($('.subscription-payment-method-tab'));
            $('#loadingpopup').hide();
        }
    });
}
function addCardPopup(){
    //Reset form;
    var jAddCard = $(".addCardForm");
    jAddCard.find('input[type=text]').each(function(){
        $(this).val($(this).attr('default'));
    });
    jAddCard.find('select').val('');
    popup('popupaddcard');
}

function stripeAddCard(){
    var jAddCard = $(".addCardForm");
    var formPass = true;

    //Check all input passed
    jAddCard.find('input[type=text]').not("#addcard_address2").each(function(){
        if ($(this).val() == '' || $(this).val() == $(this).attr('default')){
            $(this).focus();
            formPass = false;
            return false;
        }
    });
    jAddCard.find('select').each(function(){
        if ($(this).val() == ''){
            formPass = false;
            return;
        }
    });

    if (!formPass){
        jerror('Please complete all require fields');
    }
    else{
        var stripeActionUrl = $("input[name=stripe_url]").val() + '/stripe/storeCard';
        var obj = new Object();
        obj.user_id = $('input[name=user_id]').val();
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

        var data = '{"action": "storeCard", ' +
            '"type":"jsonp", ' +
            '"json": ' + json_storeCard  +
            '}';

        $('.stripe-payment').fadeIn(1000);
        $.ajax({
            type:'post',
            url: stripeActionUrl,
            dataType: 'jsonp',
            data: 'json=' + data,
            success: function(response){
                if (response.status == 'Success'){
                    jsuccess("Your card added successfully");
                    disablePopup('popupaddcard');
                    $(".subscription-payment").addClass('preload-null');
                    listStripeCard();
                    pushReloadItem('reload_account_cards');
                    pushReloadItem('reload_buy_credit_cards');
                }
                else jerror(response.message);
                $('.stripe-payment').fadeOut(500);
            },
            error:function(){
                jerror('Card adding failure. Please check card\'s information.');
                $('.stripe-payment').fadeOut(500);
            }
        });
    }
}

function removeCard(){

    var confirmBox = confirm("Are you sure want to remove this card?");

    if (!confirmBox) return false;

    //Fetch the card
    var selectedCard = '';
    for (var i in account_cards){
        if (account_cards[i].selected == 1){
            selectedCard = account_cards[i].data.stripe_card_reference_id;
            break;
        }
    }

    if (selectedCard == '')
        jerror('Please select a card');
    else{
        var stripeActionUrl =  $("input[name=stripe_url]").val() + '/stripe/deleteCards';
        var cardSelected = new Array();
        cardSelected.push(selectedCard);

        var data_object = JSON.stringify(cardSelected, null, '\t');

        var data = '{"action": "deleteCards", ' +
            '"type":"jsonp", ' +
            '"json": ' + data_object  +
            '}';
        $('#loadingpopup').show();
        $.ajax({
            type:'post',
            url: stripeActionUrl,
            dataType: 'jsonp',
            data: 'json=' + data,
            success: function(response){
                if (response.status = 'Success'){
                    $(".subscription-payment").addClass('preload-null');
                    $('#loadingpopup').hide();
                    jsuccess(response.message);
                    listStripeCard();
                    pushReloadItem('reload_account_cards');
                    pushReloadItem('reload_buy_credit_cards');
                }
                else {
                    jerror(response.message);
                    $('#loadingpopup').hide();
                }
            }
        });
    }
}

function confirmOrder(checkSubscription){
    //Check order confirm checkbox
    if (!($("#subscription-order-agree").is(":checked"))){
        jerror("You must agree with our terms of service");
        $(".order-recept").hide();
        return false;
    }

    if (checkSubscription && check_user_subscription){
        jconfirm("You have an active plan, are you sure want to upgrade?", "confirmOrder(false)");
        return false;
    }

    activeAkordeon('subscription-order-receipt-tab', subscription_step4);
}
function showTermsAndService(){
    popup('popupTermsAndService');
}

function popupPolicy(){
    disablePopup('popupTermsAndService');
    popup('popupPolicy');
}