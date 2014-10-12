if (!userBrowser[0].ios) {
    var audioContext = new AudioContext();
}
var comment_start = false;
var interval_timer;
var audioInput = null, realAudioInput = null, inputPoint = null, audioRecorder = null;
var recIndex = 0;
function ar_saveAudio() {
    audioRecorder.exportWAV(ar_doneEncoding);

}
function ar_doneEncoding(blob) {
    Recorder.forceDownload(blob, "myRecording" + ((recIndex < 10) ? "0" : "") + recIndex + ".wav");
    recIndex++;
}
function ar_stop() {
    if (!audioRecorder) {
        jerror('your browser is not supported or you must allow to access your microphone');
        return;
    }
    audioRecorder.stop();
}
function ar_start() {
    if (!audioRecorder) {
        jerror('your browser is not supported or you must allow to access your microphone');
        return;
    }
    if (!comment_start) {
        audioRecorder.clear();
        comment_start = true;
    }
    audioRecorder.record();
}
function ar_convertToMono(input) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);
    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
}
function ar_changeAudioFormat() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = ar_convertToMono(realAudioInput);
    }
    audioInput.connect(inputPoint);
}
function ar_gotStream(stream) {
    inputPoint = audioContext.createGain();
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect(analyserNode);
    audioRecorder = new Recorder(inputPoint);
    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect(zeroGain);
    zeroGain.connect(audioContext.destination);
}
function ar_initAudio() {
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
    navigator.getUserMedia({audio: true}, ar_gotStream, function (e) {
        console.log(e);
    });
}
function voiceComment() {
    if (!audioRecorder) {
        jerror('your browser is not supported or you must allow to accesss your microphone');
        return;
    }
    if (event_id == '' && $("a.share").hasClass('active')){
        jerror("Please complete event detail page");
        return false;
    }
    $("a.button-start-stop").attr("href", "javascript:voiceCommentStart();");
    $("a.button-start-stop").html('<img src="/memreas/img/audio-start.png" border="0" />');
    audioRecorder.clear();

    //Audio comment on share tab
    if ($("a.share").hasClass('active'))
        popup("popupAudioComment");
    else {
        disablePopup("popupcomment");
        popup("popupAudioComment");
    }
}
function voiceCommentStart() {
    ar_start();
    interval_timer = setInterval(function(){ updateRecordingTimer() }, 1000);
    $("a.button-start-stop").attr("href", "javascript:voiceCommentStop();");
    $("a.button-start-stop").html('<img src="/memreas/img/audio-stop.png" border="0" />');
}
function updateRecordingTimer(){
    var current_time = $(".recording-timer").html();
    current_time = current_time.split(":");
    var ms = parseInt(current_time[1]);
    var min = parseInt(current_time[0]);

    ms += 1;
    if (ms == 60){
        min = min + 1;
        ms = 0;
    }
    min = correctDigitNumber(min);
    ms = correctDigitNumber(ms);
    var new_timer = min + ":" + ms;
    $(".recording-timer").html(new_timer);
}
function correctDigitNumber(number){
    if (number < 10)
        return "0" + number;
    else return number;
}
function voiceCommentStop() {
    $("a.button-start-stop").attr("href", "javascript:voiceCommentStart();");
    $("a.button-start-stop").html('<img src="/memreas/img/audio-start.png" border="0" />');
    clearInterval(interval_timer);
}
function voiceCommentCancel() {
    if (audioRecorder) {
        audioRecorder.stop();
        audioRecorder.clear();
        comment_start = false;
        $(".recording-timer").html("0:00");
    }
    disablePopup("popupAudioComment");
}

function completeComment(){
    if (!comment_start){
        jerror("There is nothing to record");
        return false;
    }
    voiceCommentStop();
    ar_stop();
    ar_saveAudio();
    $(".recording-timer").html("0:00");
}

function uploadAudio(blobObject, tabActive) {
    voiceCommentCancel();
    $('#loadingpopup').show();
    var file2 = new FileReader();
    file2.readAsDataURL(blobObject);
    if (tabActive == 'share'){
        if (event_id == ''){
            audioRecorder.stop();
            audioRecorder.clear();
            disablePopup("popupAudioComment");
            jerror("Please complete event detail page");
            $("#loadingpopup").hide();
            return false;
        }
        var data = {
            file_data: file2.result,
            user_id: $('input[name=user_id]').val(),
            media_id:'',
            comment_event_id: event_id
        };
        file2.onloadend = function (e) {
            $.ajax({
                url: "/index/audiocomment",
                type: "POST", data: data ,
                dataType: "html",
                success: function (response) {
                    $('#loadingpopup').hide();
                    jsuccess(response);
                }
            });
        };
    }
    else{
        var data = {
            file_data: file2.result,
            user_id: $('input[name=user_id]').val(),
            comment_event_id: eventdetail_id,
            media_id:eventdetail_media_id
        };
        file2.onloadend = function (e) {
            $.ajax({
                url: "/index/audiocomment",
                type: "POST",
                data: data,
                dataType: "html",
                success: function (response) {
                    $('#loadingpopup').hide();
                    jsuccess(response);
                }
            });
        };
    }
}