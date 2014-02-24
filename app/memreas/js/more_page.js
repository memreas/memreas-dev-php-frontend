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
});