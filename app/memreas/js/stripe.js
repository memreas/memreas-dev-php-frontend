/**
*@ Stripe account functions
*/
//handle header steps clicking
$(function(){
    //Step2 tab click
    $(".subscription-payment-method").click(function(){
        listStripeCard();
    });
});

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
        jerror('Please choose a subscription plan to continue');
        return false;
    }
    listStripeCard();
}


function getPlans(){
    var jSubscriptionPlans = $(".subscription-plans");
    jSubscriptionPlans.removeClass('.preload-null').empty();
    var stripeActionUrl = $("input[name=stripe_url]").val() + '/stripe/listPlan';
    var obj = new Object();
    obj.txt = "";
    data_obj = JSON.stringify(obj, null, '\t');
    data = '{"action": "list", ' +
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
                for (i in plans){
                    var html_element = '<li><label class="label_text2"><input type="radio" id="plan-' + plans[i].id + '" name="radio-4-set" class="regular-radio" /><label for="plan-' + plans[i].id + '"></label>' + plans[i].name + ' - ' + (plans[i].amount / 100) + ' ' + plans[i].currency + '</label></li>';
                    jSubscriptionPlans.append(html_element);
                }
            }
            else jerror('There is no plan at this time! Please come back and purchase later');
            $('#loadingpopup').hide();
        },
    });
}
function listStripeCard(){
    $(".subscription-payment-method").trigger('click');
    var jMemberCard = $(".subscription-payment");
    jMemberCard.empty();
    var stripeUserId = $("input[name=user_id]").val();
    var stripeActionUrl = $("input[name=stripe_url]").val() + '/stripe/listCards';
    var obj = new Object();
    obj = {userid:stripeUserId};
    var json_listCard = JSON.stringify(obj, null, '\t');
    data = '{"action": "delete", ' +
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
                for (i = 0;i < number_of_cards;i++){
                    var html_element = '<li>' +
                                            '<label class="label_text2"><input type="radio" id="' + cards[i].stripe_card_reference_id + '" name="radio-4-set" class="regular-radio" />' +
                                            '<label for="' + cards[i].stripe_card_reference_id + '"></label>' + cards[i].card_type + ' | ' + cards[i].obfuscated_card_number + '</label>' +
                                        '</li>';
                    jMemberCard.append(html_element);
                }
            }
            else {
                jMemberCard.append('<li>You have no card at this time. Try to add one first</li>');
                jerror(response.message);
            }
            $('#loadingpopup').hide();
        },
    });
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
        obj.first_name = $("#addcard_fname").val();
        obj.last_name = $("#addcard_lname").val();
        obj.credit_card_type = $("#addcard_cctype").val();
        obj.credit_card_number = $("#addcard_ccnum").val();
        obj.expiration_month = $("#addcard_expmonth").val();
        obj.expiration_year = $("#addcard_expyear").val();
        obj.cvc = $("#addcard_ccv").val();
        obj.address_line_1 = $("#addcard_address1").val();
        obj.address_line_2 = $("#addcard_address2").val();
        obj.city = $("#addcard_city").val();
        obj.state = $("#addcard_state").val();
        obj.zip_code = $("#addcard_zip").val();

        var json_storeCard = JSON.stringify(obj);

        var data = '{"action": "storeCard", ' +
        '"type":"jsonp", ' +
        '"json": ' + json_storeCard  +
        '}';

        $('#loadingpopup').show();
        $.ajax({
            type:'post',
              url: stripeActionUrl,
              dataType: 'jsonp',
              data: 'json=' + data,
              success: function(response){
                if (response.status == 'Success'){
                    jsuccess("Your card added successfully");
                    disablePopup('popupaddcard');
                    listStripeCard();
                }
                else jerror(response.message);
                $('#loadingpopup').hide();
              },
        });
    }
}