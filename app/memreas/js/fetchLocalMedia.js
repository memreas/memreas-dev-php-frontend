  function readFilesAndDisplayPreview(files) {
//alert('readFilesAndDisplayPreview fired...');
    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {
      // Only process image files.
      if (!f.type.match('image.*')) {
        continue;
      }
      var reader = new FileReader();
      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          // Render thumbnail.
          //var link = "<a href='#'><img src='" + e.target.result + "' alt='" + e.target.result + "' /></a>";
          var link = '<img src="' + e.target.result + '"/>';
		  //$("#content_1 .mCSB_container").append(link);
          $(".user-resources").append (link);
          $(".scrollClass .mCSB_container").append ('<li><a class="class="swipebox" href="' + e.target.result + '">' + link + '</a></li>');
        };

      })(f);
      // Read in the image file as a data URL.
      files_read = reader.readAsDataURL(f);
    }
  }

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    readFilesAndDisplayPreview(files);
  }

  $(function(){
    //document.getElementById('dir').addEventListener('change', handleFileSelect, false);
    $("#dir").change (function(e){
        $("#tab-content style, .fotorama--hidden").remove();
        $(".user-resources").attr ('class', 'user-resources');
        $(".user-resources, .scrollClass .mCSB_container").html('');
        handleFileSelect(e);
        setTimeout(function(){ $(".user-resources").fotorama(); $(".browse-file").hide(); }, 1000);
    });
  });
