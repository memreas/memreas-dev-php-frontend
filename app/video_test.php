<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Video Transcoder Testing</title>
        <script src="/memreas/js/jquery-1.8.3.js"></script>
        <script type="text/javascript" src="/memreas/js/jwplayer/jwplayer.js"></script>
        <script type="text/javascript" src="/memreas/js/jwplayer/jwplayer.html5.js"></script>
        <script type="text/javascript">
            $(function(){

                $("form[name=file_input]").find("input[name=file_path]").val('');

                //Handle form submit
                $("form[name=file_input]").submit(function(){
                    var filePath = $(this).find("input[name=file_path]").val();

                    var html5_option = false;
                    //Check if HTML 5 is selected
                    if ($(this).find("input[name=html5_option]").is(":checked"))
                        html5_option = true;

                    var jwplayer_option = false;
                    //Check if Jwplayer is selected
                    if ($(this).find("input[name=jwplayer_option]").is(":checked"))
                        jwplayer_option = true;

                    var passValidation = true;

                    //Doing nothing when file path is empty
                    if (filePath == ''){
                        alert('Please input file path');
                        $(this).find("input[name=file_path]").focus();
                        passValidation = false;
                    }

                    //There is no option for displaying
                    if (!html5_option && !jwplayer_option){
                        alert("Please choose one option");
                        passValidation = false;
                    }

                    //All passed
                    if (passValidation){
                        $("#preview-file span").html(filePath);
                        $("#html5-player, #jwplayer").hide();

                        if (html5_option){
                            var temp = filePath.split('.');
                            var fileType = 'video/' + temp[temp.length - 1];
                            var content_html5 = '<video controls width="480" height="270">' +
                                                    '<source src="' + filePath + '" type="' + fileType + '">' +
                                                '</video>';
                            $("#display-html5-content").html(content_html5);
                            $("#html5-player").show();
                        }

                        if (jwplayer_option){
                            var content_jwplayer = '<div id="player_1"></div>' +
                                                   '<script type="text/javascript">' +
                                                        'jwplayer("player_1").setup({' +
                                                            'file: "' + filePath + '",' +
                                                            'width: "480",' +
                                                            'height: "270"' +
                                                        '});' +
                                                    '<\/script>';
                            $("#display-jw-content").html(content_jwplayer);
                            $("#jwplayer").show();
                        }
                    }

                    return false;
                });
            });
        </script>
    </head>
    <body>
        <form name="file_input" id="file-input" action="" method="post">
            <p>
                <label>Input your file path</label>
                <input name="file_path" type="text" size="35">
            </p>
            <p>
                <label>Display option</label>
                <input type="checkbox" name="html5_option" value="1"> HTML5
                &nbsp;&nbsp;&nbsp;
                <input type="checkbox" name="jwplayer_option" value="1"> JW Player
            </p>
            <p><button type="submit">Test now</button></p>
        </form>
        <div><b>Playable sample file : </b>http://d1ckv7o9k6o3x9.cloudfront.net/18382cb7-c9d3-47f0-b5e7-a00f479f39ee/media/small-2.mp4</div>
        <div id="preview-file"><b>Your file: </b><span>None</span></div>
        <div id="html5-player" style="display: none; text-align: center;">
            <h3>HTML 5 Player</h3>
            <!-- HTML 5 PLAYER -->
            <div id="display-html5-content">
                <video controls width="480" height="270">
                    <source src="http://d1ckv7o9k6o3x9.cloudfront.net/be03b404-9a61-40df-879f-1a12fe726d62/media/hls/MVI_6485.m3u8">
                </video>
            </div>
            <!-- END HTML 5 PLAYER -->
        </div>
        <div id="jwplayer" style="display: none; text-align: center;">
            <h3>JW PLAYER</h3>
            <!-- JW PLAYER -->
            <div id="display-jw-content" style="width: 500px; margin: 0 auto;">
                <div id='player_1'></div>
                <script type='text/javascript'>
                    jwplayer('player_1').setup({
                        file: "rtmp://s1iq2cbtodqqky.cloudfront.net/cfx/st/mp4:932fae65-56b4-44c2-b01e-692b45fe6e78/media/web/MVI_4036.mp4",
                        width: "480",
                        height: "270"
                    });
                </script>
            </div>
            <!-- END JW PLAYER -->
        </div>
    </body>
</html>

