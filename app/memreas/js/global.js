/*
*@Define global function here
*@ Tran Tuan
*/

/*
*@ Function Scrollbar Secure
*@ Surely scrollbar element loaded and scroll loaded also
*/
function ajaxScrollbarElement(element_object){
    var jelement_object = $(element_object);
    if (!jelement_object.hasClass ('mCustomScrollbar'))
        jelement_object.mCustomScrollbar({ scrollButtons:{ enable:true }});
    if (!jelement_object.find ('.mCSB_scrollTools').is(':visible')){
        jelement_object.mCustomScrollbar('update');
        setTimeout (function(){ ajaxScrollbarElement(element_object); }, 1000);
    }
}