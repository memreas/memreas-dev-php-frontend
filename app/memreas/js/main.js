$(document).ready(function(){
    //Prefetch for image location
    $.fetch_server_media();
    $.addfile();
    share_initObjects();
    share_initAkordeon();
    share_customScrollbar();
    $(document).bgStretcher({
            images: ['/memreas/img/bg.jpg'],
            imageWidth: 1366, imageHeight: 700
    });
    $(".change-location a.browse-server").click (function(){ $.fetch_server_media($("input[name=current_user_id]").val()); });
    $(".change-location a.fetch-local").click (function(){ $(".browse-file").fadeIn (500); });
    $(".image_upload_box").mCustomScrollbar(
                {scrollButtons:{enable:true }}
    );
    $(".event-upload-image").mCustomScrollbar(
                {scrollButtons:{enable:true }}
    );
    $(".memreas-detail-gallery").mCustomScrollbar(
                {scrollButtons:{enable:true }}
    );
});

(function($){
    $(window).load(function(){

    $("ul.scrollClass").mCustomScrollbar({
            scrollButtons:{
                enable:true
            }
        });
    $("#tab-content div.hideCls").hide(); // Initially hide all content
    $("#tabs li:first").attr("id","current"); // Activate first tab
    $("#tab-content div:first").fadeIn(); // Show first tab content

    $('#tabs a').click(function(e) {
        e.preventDefault();
        $("#tab-content div.hideCls").hide(); //Hide all content
        $("#tabs li").attr("id",""); //Reset id's
        $(this).parent().attr("id","current"); // Activate this
        $('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
        ajaxScrollbarElement('#' + $(this).attr('title') + " .scroll-area");
    });

        //ajax demo fn
        $("a[rel='load-content']").click(function(e){

            e.preventDefault();
            var $this=$(this),
                url=$this.attr("href");
            $this.addClass("loading");
            $.get(url,function(data){
                $this.removeClass("loading");
                $("ul.scrollClass .mCSB_container").html(data); //load new content inside .mCSB_container
                $("ul.scrollClass").mCustomScrollbar("update"); //update scrollbar according to newly loaded content
                $("ul.scrollClass").mCustomScrollbar("scrollTo","top",{scrollInertia:200}); //scroll to top
            });
        });
        $("a[rel='append-content']").click(function(e){
            e.preventDefault();
            var $this=$(this),
                url=$this.attr("href");
            $this.addClass("loading");
            $.get(url,function(data){
                $this.removeClass("loading");
                $("ul.scrollClass .mCSB_container").append(data); //append new content inside .mCSB_container
                $("ul.scrollClass").mCustomScrollbar("update"); //update scrollbar according to newly appended content
                $("ul.scrollClass").mCustomScrollbar("scrollTo","h2:last",{scrollInertia:2500,scrollEasing:"easeInOutQuad"}); //scroll to appended content
            });
        });
    });
})(jQuery);
jQuery(function($) {
    $(".swipebox").swipebox();
});