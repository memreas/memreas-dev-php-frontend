var popupStatus=0;function loadPopup(id){if(popupStatus===0){$("#bg"+id).css({"opacity":"0.7"});$("#bg"+id).fadeIn("slow");$("body,html").animate({scrollTop:$('body').offset().top},700);$("#"+id).fadeIn("slow");popupStatus=1;}}
function disablePopup(id){if(popupStatus==1){$("#bg"+id).fadeOut("slow");$("#"+id).fadeOut("slow");popupStatus=0;}}
function centerPopup(id){$(".popups").fadeOut("slow");$(".backgroundPopup").fadeOut("slow");var windowWidth=window.innerWidth;var windowHeight=window.innerHeight;var popupHeight=$("#"+id).outerHeight();var popupWidth=$("#"+id).outerWidth();$("#"+id).css({"position":"absolute","top":(windowHeight-popupHeight)/2,"left":"37%"});if(window.innerWidth<991){$("#"+id).css({"left":"23%"});}
$("#bg"+id).css({"height":windowHeight});}
function popup(id){centerPopup(id);loadPopup(id);$("ul.scrollpopup").mCustomScrollbar("destroy");$("ul.scrollpopup").mCustomScrollbar({scrollButtons:{enable:true}});}
$(document).ready(function(){});