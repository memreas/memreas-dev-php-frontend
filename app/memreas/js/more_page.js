$(function(){
    $("#tab-content-more div.hideCls").hide(); // Initially hide all content
        $("#tabs-more li:first").attr("id","current"); // Activate first tab
        $("#tab-content-more div:first").fadeIn(); // Show first tab content*/

        $('#tabs-more a').click(function(e) {

            e.preventDefault();
            $("#tab-content-more div.hideCls").hide(); //Hide all content
            $("#tabs-more li").attr("id",""); //Reset id's
            $(this).parent().attr("id","current"); // Activate this
            $('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
        });

    $("a[title=more]").one ('click', function(){
         $('#buttons-moretab').akordeon();
         $('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
    });
    $("#tabs-more li a:eq(1)").one ('click', function(){ $('#buttons2-moretab').akordeon(); });
    $("#tabs-more li a:eq(2)").one ('click', function(){ $('#buttons3-moretab').akordeon(); });
    $("#tabs-more li a:eq(3)").one ('click', function(){ $('#buttons4-moretab').akordeon(); });
    $("#tabs-more li a:eq(4)").one ('click', function(){ $('#buttons5-moretab').akordeon(); });

    /*Action tabs click*/
    $("a[title=more]").click(function(){ fillUserDetail( $("input[name=user_id]").val()); });
    $("a[title=tab1-more]").click(function(){ $("a[title=more]").click(); });
});

/*Fill in current logged user detail*/
function fillUserDetail(currentUserId){
    var params = [{tag: 'user_id', value: currentUserId}];
    ajaxRequest('getuserdetails', params, function(xml_response){
        if (getValueFromXMLTag(xml_response, 'status') == 'Success'){
            var username = getValueFromXMLTag(xml_response, 'username');
            var useremail = getValueFromXMLTag(xml_response, 'email');
            $("input[name=account_email]").val(useremail);
        }
        else jerror (getValueFromXMLTag(xml_response, 'messsage'));
    });
}

/*Function Save user detail*/
function saveUserDetail(){
    var userId = $("input[name=user_id]").val();
    var params = [
                    {tag: 'user_id', value: userId},
                    {tag: 'email', value: $("input[name=account_email]").val()}
                ];
    ajaxRequest('saveuserdetails', params, function(xml_response){
        if (getValueFromXMLTag(xml_response) == "Success"){
            jsuccess(getValueFromXMLTag(xml_response, 'message'));
            fillUserDetail($("input[name=user_id]").val());
        }
        else jerror(getValueFromXMLTag(xml_response, 'message'));
    });
}