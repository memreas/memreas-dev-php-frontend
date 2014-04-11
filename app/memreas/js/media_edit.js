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