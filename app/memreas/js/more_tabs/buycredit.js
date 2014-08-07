/*
* Account buy credit handle here
*/
var buycredit_account_cards = new Object();
var account_user = new Object();

$(function(){
    $(".buycredit-order").click(function(){ fill_account_detail(); });
});

function buycredit_cardChange(choose_card_id){
    choose_card_id = choose_card_id.replace('buycredit-card-', '');
    buycredit_resetCardChoose();
    for (var i in buycredit_account_cards){
        if (choose_card_id == buycredit_account_cards[i].card_id){
            buycredit_account_cards[i].selected = 1;
        }
    }
}
function buycredit_resetCardChoose(){
    for (var i in buycredit_account_cards){
        buycredit_account_cards[i].selected = 0;
    }
}
function buycredit_addCardPopup(){
    //Reset form;
    var jAddCard = $(".creditAddCardForm");
    jAddCard.find('input[type=text]').each(function(){
        $(this).val($(this).attr('default'));
    });
    jAddCard.find('select').val('');
    popup('popupcreditaddcard');
}
function buycreditAddCard(){
    var jAddCard = $(".creditAddCardForm");
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
        obj.first_name = $("#credit_addcard_fname").val();
        obj.last_name = $("#credit_addcard_lname").val();
        obj.credit_card_type = $("#credit_addcard_cctype").val();
        obj.credit_card_number = $("#credit_addcard_ccnum").val();
        obj.expiration_month = $("#credit_addcard_expmonth").val();
        obj.expiration_year = $("#credit_addcard_expyear").val();
        obj.cvc = $("#credit_addcard_ccv").val();
        obj.address_line_1 = $("#credit_addcard_address1").val();
        obj.address_line_2 = $("#credit_addcard_address2").val();
        obj.city = $("#credit_addcard_city").val();
        obj.state = $("#credit_addcard_state").val();
        obj.zip_code = $("#credit_addcard_zip").val();

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
                    disablePopup('popupcreditaddcard');
                    $(".buycredit-payment").addClass('preload-null');
                    buycredit_listCard();
                    pushReloadItem('reload_account_cards');
                    pushReloadItem('reload_subscription_cards');
                }
                else jerror(response.message);
                $('#loadingpopup').hide();
            },
            error:function(){
                jerror('Card adding failure. Please check card\'s information.');
                $('.stripe-payment').fadeOut(500);
            }
        });
    }
}
function buycredit_listCard(){
    $(".buycredit-card-functions").hide();

    var jMemberCard = $(".buycredit-payment");

    if (!jMemberCard.hasClass('preload-null')) return false;
    jMemberCard.removeClass('preload-null');

    if (jMemberCard.hasClass('mCustomScrollbar'))
        jMemberCard = $(".buycredit-payment .mCSB_container");

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
    if ($.isEmptyObject(account_stripe)) fetch_customer();
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
                        buycredit_account_cards[i] = new Object();
                        var params = {card_id:cards[i].stripe_card_reference_id, data:cards[i], selected:0};
                        var row_card_id = cards[i].stripe_card_reference_id;
                        var row_card_type = cards[i].card_type;
                        var row_card_obfuscated = cards[i].obfuscated_card_number;
                        buycredit_account_cards[i]= params;
                        var html_element = '<li>' +
                        '<label class="label_text2"><input type="radio" id="buycredit-card-' + row_card_id + '" name="radio_cards" class="regular-radio" onchange="buycredit_cardChange(this.id);"';
                        //Set default card checked if available
                        if (default_card == row_card_id){
                            html_element += ' checked="checked"';
                            buycredit_cardChange(default_card);
                        }
                        html_element += ' />' +
                        '<label for="buycredit-card-' + row_card_id + '"></label>' + row_card_type + ' | ' + row_card_obfuscated + '</label>' +
                        '</li>';
                        jMemberCard.append(html_element);
                    }
                    ajaxScrollbarElement('.buycredit-payment');
                    $(".buycredit-card-functions").show();
                }
                else jMemberCard.append('<li>You have no card at this time. Try to add one first</li>');
                removeItem(reloadItems, 'reload_buy_credit_cards');
            }
            else {
                jMemberCard.append('<li>You have no card at this time. Try to add one first</li>');
                jerror(response.message);
            }
            $('#loadingpopup').hide();
        }
    });
}
function buycredit_removeCard(){
    var confirmBox = confirm("Are you sure want to remove this card?");

    if (!confirmBox) return false;

    //Fetch the card
    var selectedCard = '';
    for (i in buycredit_account_cards){
        if (buycredit_account_cards[i].selected == 1){
            selectedCard = buycredit_account_cards[i].data.stripe_card_reference_id;
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
                    $(".buycredit-payment").addClass('preload-null');
                    $('#loadingpopup').hide();
                    jsuccess(response.message);
                    buycredit_listCard();
                    pushReloadItem('reload_account_cards');
                    pushReloadItem('reload_subscription_cards');
                }
                else {
                    jerror(response.message);
                    $('#loadingpopup').hide();
                }
            }
        });
    }
}

function fetch_customer(){
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
                account_user = response.account;
            }
        }
    });
}

function fill_account_detail(){
    var jBuyerName = $("#credit-account-name");
    var jBuyerBalance = $("#credit-account-balance");

    jBuyerName.html('Not Specify');
    jBuyerBalance.html('Not Specify');
    var checkCardChoose = false;
    var orderCard = new Object();
    for (var i in buycredit_account_cards){
        if (buycredit_account_cards[i].selected == 1){
            orderCard = buycredit_account_cards[i].data;
            checkCardChoose = true;
            break;
        }
    }

    if (!checkCardChoose){
        jerror('Please choose a payment method');
        return false;
    }
    $('#loadingpopup').show();
    jBuyerName.html(orderCard.first_name + ' ' + orderCard.last_name);
    jBuyerBalance.html('$' + account_user.balance);
    $('#loadingpopup').hide();
}

function buycredit_confirmAmount(){
    var jBuycreditMessage = $(".credit-message-order");
    jBuycreditMessage.empty().hide();
    var checkCardChoose = false;
    //Fetch the card
    var orderCard = new Object();
    for (var i in buycredit_account_cards){
        if (buycredit_account_cards[i].selected == 1){
            orderCard = buycredit_account_cards[i].data;
            checkCardChoose = true;
            break;
        }
    }

    if (!checkCardChoose){
        jerror('Please choose a payment method');
        return false;
    }

    var params = new Object;
    params.userid = $("input[name=user_id]").val();
    params.stripe_card_reference_id = orderCard.stripe_card_reference_id;
    params.amount = $("select#credit-amount").val();
    var params_json = JSON.stringify(params, null, '\t');
    var data = '{"action": "subscription", ' +
    '"type":"jsonp", ' +
    '"json": ' + params_json  +
    '}';

    var stripeActionUrl = $("input[name=stripe_url]").val() + '/stripe/addValue';

    $('.stripe-payment').fadeIn(1000);
    $.ajax({
        url: stripeActionUrl,
        type: 'POST',
        dataType: 'jsonp',
        data: 'json=' + data,
        success: function(response){
            if (response.status == 'Success'){
                jsuccess(response.message);
                account_user.balance = parseFloat(account_user.balance) + parseFloat(params.amount);
                jBuycreditMessage.html(response.message).show();
                fill_account_detail();
            }
            else jerror(response.message);
            $('.stripe-payment').fadeOut(500);
        }
    });
}