/////////////////////////////////
// Author: David Kang
// Copyright memreas llc 2013
/////////////////////////////////

jQuery.initAkordeon = function() {
     $('#buttons').akordeon();
       $('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
	 $('#buttons2').akordeon();
       $('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
	 $('#buttons3').akordeon();
       $('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
	 $('#buttons4').akordeon();
       $('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
	 $('#buttons5').akordeon();
       $('#button-less').akordeon({ buttons: false, toggle: true, itemsOrder: [2, 0, 1] });
}

jQuery.customScrollbar = function () {
	$("ul.scrollClass").mCustomScrollbar({
		scrollButtons:{
			enable:true
		}
	});
		
	$("#tab-content div.hideCls").hide(); // Initially hide all content
	$("#tabs li:first").attr("id","current"); // Activate first tab
	$("#tab-content div:first").fadeIn(); // Show first tab content*/
	
	$('#tabs a').click(function(e) {
		
		e.preventDefault();        
		$("#tab-content div.hideCls").hide(); //Hide all content
		$("#tabs li").attr("id",""); //Reset id's
		$(this).parent().attr("id","current"); // Activate this
		$('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
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
}