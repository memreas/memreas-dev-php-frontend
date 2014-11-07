/*
* Sell media handle
* */

function sellMediaStep2(){
    if (checkSellerBasicInformation('sell_media_form', false))
        activeAkordeon("sell-media-payout-tab");
}

function checkSellerBasicInformation(element, focus_element){
    var formPass = true;
    var jSellMediaForm = $("." + element);
    jSellMediaForm.find("input[type=text]").not("#sell-media-address2").each(function(){
        if ($(this).val() == '' || $(this).val() == $(this).attr('default')){
            jerror("Please complete all required fields.");
            if (focus_element) $(this).focus();
            formPass = false;
            return formPass;
        }
    });
    return formPass;
}

function register_sell_media(){
    var jSellMediaMessage = $(".add-seller-message");
    jSellMediaMessage.empty().hide();

    //Recheck previous tab
    if (!checkSellerBasicInformation("sell_media_form", false))
        return false;

    var formPass = true;
    formPass = checkSellerBasicInformation("sell_media_bank", true);

    if (formPass){

        //Check order confirm checkbox
        if (!($("#register-seller-agree").is(":checked"))){
            jerror("You must agree with our terms of service");
            return false;
        }

        var address_line_2 = ($("#sell-media-address2").val() == ''
                                || $("#sell-media-address2").val() == $("#sell-media-address2").attr('default'))
                                ? '' : $("#sell-media-address2").val();
        var params = {
                        user_name: $("#sell-media-username").val(),
                        first_name: $("#sell-media-fname").val(),
                        last_name: $("#sell-media-lname").val(),
                        address_line_1: $("#sell-media-address1").val(),
                        address_line_2: address_line_2,
                        city: $("#sell-media-city").val(),
                        state: $("#sell-media-state").val(),
                        zip_code: $("#sell-media-zip").val(),
                        stripe_email_address: $("#sell-media-email").val(),
                        sell_media_bank: $("#sell-media-bank").val(),
                        bank_routing: $("#sell-media-bank-routing").val(),
                        account_number: $("#sell-media-account-number").val()
                    }

        var data_params = JSON.stringify(params, null, '\t');

        var data = '{"action": "addSeller", ' +
            '"type":"jsonp", ' +
            '"json": ' + data_params  +
            '}';

        var stripeActionUrl = $("input[name=stripe_url]").val() + '/stripe/addSeller';
        $('.stripe-payment').fadeIn(1000);
        $.ajax({
            url: stripeActionUrl,
            type: 'POST',
            dataType: 'jsonp',
            data: 'json=' + data,
            success: function(response){
                if (response.status == 'Success')
                    jsuccess('your account has been registered successfully');
                else jerror(response.message);
                $('.stripe-payment').fadeOut(500);
            }
        });
    }
}