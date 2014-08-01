/***************************/
//@website: www.ZwebbieZ.com
//@license: Feel free to use it, but keep this credits please!
/***************************/

//SETTING UP OUR POPUP
//0 means disabled; 1 means enabled;
var popupStatus = 0;

//loading popup with jQuery magic!
function loadPopup(id){
	//loads popup only if it is disabled
	if(popupStatus===0){
		$("#bg"+id).css({
			"opacity": "0.7"
		});
		$("#bg"+id).fadeIn("slow");

		// This will 
		$("body,html").animate({
			scrollTop:$('body').offset().top
		},700);
		$("#"+id).fadeIn("slow");
		popupStatus = 1;
	}
}

function disablePopup(id){
	//disables popup only if it is enabled
	if(popupStatus==1){
		$("#bg"+id).fadeOut("slow");
		$("#"+id).fadeOut("slow");
		popupStatus = 0;
	}
}

//centering popup
function centerPopup(id){
	$(".popups").fadeOut("slow");
		$(".backgroundPopup").fadeOut("slow");
	//request data for centering
	// var windowWidth = document.documentElement.clientWidth;
	// var windowHeight = document.documentElement.clientHeight;
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;
	var popupHeight = $("#"+id).outerHeight();
	var popupWidth = $("#"+id).outerWidth();
	//centering
	$("#"+id).css({
		"position": "absolute",
		// "top": windowHeight/2-popupHeight/2,
		// "left": windowWidth/2-popupWidth/2
		"top": (windowHeight-popupHeight)/2,
		// "left": (windowWidth-popupWidth)/2
		"left": "37%"

	});
	if(window.innerWidth < 991){
		$("#"+id).css({
			"left":"23%"
		});	
	}
	//only need force for IE6

	$("#bg"+id).css({
		"height": windowHeight
	});

}


//CONTROLLING EVENTS IN jQuery

function popup(id){
//alert(id);


centerPopup(id);
loadPopup(id);
$("ul.scrollpopup").mCustomScrollbar("destroy");
	$("ul.scrollpopup").mCustomScrollbar({
					scrollButtons:{
						enable:true
					}
				});
}



$(document).ready(function(){






	//LOADING POPUP
	//Click the button event!
	/*$("#button").click(function(){
		//centering with css
		centerPopup();
		//load popup
		loadPopup();
	});*/

	//CLOSING POPUP
	//Click the x event!
	/*$("#popupContactClose").click(function(){
		disablePopup();
	});*/
	//Click out event!
	/*$("#backgroundPopup").click(function(){
		disablePopup();
	});*/
	//Press Escape event!
	/*$(document).keypress(function(e){
		if(e.keyCode==27 && popupStatus==1){
			disablePopup();
		}
	});*/

});