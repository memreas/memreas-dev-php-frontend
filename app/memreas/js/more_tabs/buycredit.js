/*
* Account buy credit handle here
*/
var buycredit_account_cards = new Object();
var account_user = new Object();

$(function(){
	if( $("#credit-amount").length){
		
		// $(".akordeon-item .akordeon-item-body").css({overflow:"visible"});
		// $("#credit-amount").closest("div.akordeon-item-body").css({height:"357px"});
		$("#credit-amount").chosen({width:"95%"});
	}
    $(".buycredit-order").click(function(){ fill_account_detail(); });

    //Buy credit tab add new card
    $("#btn-buycredit-add-card").click(function(){
        new Account.addCard('.creditAddCardForm', ".buycredit-payment", 'buycredit-card', 'buycredit_cardChange', '$(".buycredit-card-functions").show()');
    });
    fetch_customer();
});

function buycredit_cardChange(choose_card_id){
    choose_card_id = choose_card_id.replace('buycredit-card-', '');
    buycredit_resetCardChoose();
    for (var i in Account.buyCreditTab_cards){
        if (choose_card_id == Account.buyCreditTab_cards[i].card_id){
            Account.buyCreditTab_cards[i].selected = 1;
        }
    }
}
function buycredit_resetCardChoose(){
    for (var i in Account.buyCreditTab_cards){
        Account.buyCreditTab_cards[i].selected = 0;
    }
}
function buycredit_addCardPopup(){
    // Reset form;
    var jAddCard = $(".accountAddCardForm");
    jAddCard.find('input[type=text]').each(function(){
        $(this).val($(this).attr('default'));
    });
    jAddCard.find('select').val('');
    popup('popup-addcard-buycredit-payment');
}

function buycredit_removeCard(){
    var confirmBox = confirm("Are you sure want to remove this card?");

    if (!confirmBox) return false;

    // Fetch the card
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
        var stripeActionUrl =  $("input[name=stripe_url]").val() + 'stripe_deleteCards';
        var cardSelected = new Array();
        cardSelected.push(selectedCard);

        var obj = new Object();
        obj.memreascookie = getCookie("memreascookie");
	obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
        obj.cardSelected = cardSelected;
        
        var data_object = JSON.stringify(obj, null, '\t');

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
            timeout: 10000,
            success: function(response){
			  	response = jQuery.parseJSON( response.data );
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
}

function fetch_customer(){
    // Get customer info based on this account
    var obj = new Object();
    obj.userid = $("input[name=user_id]").val();
    obj.memreascookie = getCookie("memreascookie");
    obj.x_memreas_chameleon = getCookie("x_memreas_chameleon");
    var data_obj = JSON.stringify(obj, null, '\t');
    var data = '{"action": "getCustomerInfo", ' +
    '"type":"jsonp", ' +
    '"json": ' + data_obj  +
    '}';
    var stripeCustomerUrl = $("input[name=stripe_url]").val() + 'stripe_getCustomerInfo';
    $.ajax({
        url: stripeCustomerUrl,
        type: 'POST',
        dataType: 'jsonp',
        data: 'json=' + data,
        timeout: 10000,
        success: function(response){
		  	response = jQuery.parseJSON( response.data );
            if (response.status == 'Success'){
                account_stripe = response.customer;
                account_user = response.account;
            }
        },
		error : function(response, textStatus, errorThrown) {
			if(textStatus === 'timeout')
		    {     
				jerror('request timeout - please try again later');
		    }
		}
    });
}

function fill_account_detail(){
    var jBuyerName = $("#credit-account-name");

    jBuyerName.html('Not Specify');
    var checkCardChoose = false;
    var orderCard = new Object();
    for (var i in Account.buyCreditTab_cards){
        if (Account.buyCreditTab_cards[i].selected == 1){
            orderCard = Account.buyCreditTab_cards[i].data;
            checkCardChoose = true;
            break;
        }
    }

    if (!checkCardChoose){
        jerror('Please choose a payment method');
        return false;
    }

    var stripe_card = orderCard;
    var card_name = stripe_card.first_name + ' ' + stripe_card.last_name;
    jBuyerName.html(card_name);

    Account.reloadAccountCredit("#credit-account-balance");
}

function buycredit_confirmAmount(){
    var jBuycreditMessage = $(".credit-message-order");
    jBuycreditMessage.empty().hide();
    var checkCardChoose = false;
    // Fetch the card
    var orderCard = new Object();
    for (var i in Account.buyCreditTab_cards){
        if (Account.buyCreditTab_cards[i].selected == 1){
            orderCard = Account.buyCreditTab_cards[i].data;
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
    params.memreascookie = getCookie("memreascookie");
    params.x_memreas_chameleon = getCookie("x_memreas_chameleon");
    params.stripe_card_reference_id = orderCard.stripe_card_reference_id;
    params.amount = $("select#credit-amount").val();
    var params_json = JSON.stringify(params, null, '\t');
    var data = '{"action": "subscription", ' +
    '"type":"jsonp", ' +
    '"json": ' + params_json  +
    '}';

    var stripeActionUrl = $("input[name=stripe_url]").val() + 'stripe_addValue';

    $('.stripe-payment').fadeIn(1000);
    $.ajax({
        url: stripeActionUrl,
        type: 'POST',
        dataType: 'jsonp',
        data: 'json=' + data,
        timeout: 10000,
        success: function(response){
		  	response = jQuery.parseJSON( response.data );
            if (response.status == 'Success'){
                jsuccess(response.message);
                account_user.balance = parseFloat(account_user.balance) + parseFloat(params.amount);
                jBuycreditMessage.html(response.message).show();
                fill_account_detail();
            }
            else jerror(response.message);
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