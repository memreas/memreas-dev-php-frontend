function switch_mode(){
    //Check if aviary is inner div or not
    if ($("#avpw_holder").parent('#aviary').length > 0){ //Currently inner
        $("#avpw_holder").removeClass('avpw_is_embed').addClass('avpw_is_fullscreen').appendTo('body').prepend('<div style="" id="avpw_fullscreen_bg"></div>');
        $(".exit-aviary-fullscreen").show();
    }
    else{
        $("#avpw_holder").removeClass('avpw_is_fullscreen').addClass('avpw_is_embed').appendTo('#aviary');
        $('#avpw_fullscreen_bg').remove();
        $(".exit-aviary-fullscreen").hide();
    }
    setTimeout(function(){
    	if( $(".exit-aviary-fullscreen").length){
    		$(".exit-aviary-fullscreen").html('Exit full screen');
    	}
    }, 500);
}

var featherEditor = new Aviary.Feather({
    apiKey: '057e9da017baf0f8',
    apiVersion: 3,
    theme: 'dark', // Check out our new 'light' and 'dark' themes!
    tools: 'enhance,effects,frames,stickers,orientation,focus,resize,crop,warmth,brightness,contrast,saturation,sharpness,colorsplash,draw,text,redeye,whiten,blemish',
    appendTo: 'aviary',
    onSave: function(imageID, newURL) {
        //Edit completed and save by user
        var s3_source_file = $("#" + imageID).attr('src');
        var remote_file = newURL;
        var from_user = $("input[name=user_id]").val();

        var img = document.getElementById(imageID);
        img.src = newURL;

        $("#loadingpopup").show();
        $.post('/index/editmedia', {file_source:s3_source_file, file_url:remote_file, user_id:from_user}, function(response){
            jsuccess(response);
            switch_mode();
            fetch_selected_media();
            $("#loadingpopup").hide();
        });
    },
    onError: function(errorObj) {
        alert(errorObj.message);
    }
});
function launchEditor(id, src) {
    featherEditor.launch({
        image: id,
        url: src
    });
    return false;
}
function openEditMedia(id, src){
    $("#aviary").empty();
    launchEditor(id, src);
}