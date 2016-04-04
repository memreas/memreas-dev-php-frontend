$(function(){
    $(".member-guidelines-head").one('click', function(){
        $(".member-guidelines").mCustomScrollbar({scrollButtons:{enable:true }});
    });

    $(".privacy-policy-head").one("click", function(){
        $(".privacy-policy").mCustomScrollbar({scrollButtons:{enable:true }});
    });

    $(".terms-service-head").one("click", function(){
        $(".terms-service").mCustomScrollbar({scrollButtons:{enable:true }});
    });

    $(".dmca-policy-head").one("click", function(){
        $(".dmca-policy").mCustomScrollbar({scrollButtons:{enable:true }});
    });

     $(".marketplace-agree-head").one("click", function(){
        $(".marketplace-agree").mCustomScrollbar({scrollButtons:{enable:true }});
    });
});