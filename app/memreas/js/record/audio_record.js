/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
if (!userBrowser[0].ios){
    var audioContext = new AudioContext();
}
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var recIndex = 0;

/* TODO:

- offer mono option
- "Monitor input" switch
*/

function ar_saveAudio() {
    audioRecorder.exportWAV( ar_doneEncoding );
    // could get mono instead by saying
    // audioRecorder.exportMonoWAV( ar_doneEncoding );
}

function ar_doneEncoding( blob ) {
    Recorder.forceDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    recIndex++;
}

function ar_stop() {
    if (!audioRecorder){
        jerror('your browser is not supported or you must allow to accesss your microphone');
		return;
    }
	audioRecorder.stop();
    //ar_saveAudio();
}

function ar_start() {
    if (!audioRecorder){
        jerror('your browser is not supported or you must allow to accesss your microphone');
		return;
    }
	audioRecorder.clear();
	audioRecorder.record();
}

function ar_convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );

    return merger;
}

function ar_changeAudioFormat() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = ar_convertToMono( realAudioInput );
    }

    audioInput.connect(inputPoint);
}

function ar_gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = ar_convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
}

function ar_initAudio() {
	if (!navigator.getUserMedia)
		navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	if (!navigator.cancelAnimationFrame)
		navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
	if (!navigator.requestAnimationFrame)
		navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia({audio:true}, ar_gotStream, function(e) {
		alert('Error getting audio');
		console.log(e);
	});
}

function voiceComment(){
    if (!audioRecorder){
        jerror('your browser is not supported or you must allow to accesss your microphone');
        return;
    }
    $("a.process-voice").attr("href", "javascript:voiceCommentStart();");
    $("a.process-voice").html('Start');
    audioRecorder.clear();
    $(".voice-comment-load").show();
}
function voiceCommentStart(){
    ar_start();
    $("a.process-voice").attr("href", "javascript:voiceCommentStop();");
    $("a.process-voice").html('Stop');
}
function voiceCommentStop(){
    $("a.process-voice").attr("href", "javascript:voiceCommentStart();");
    $("a.process-voice").html('Start');
    ar_stop();
    ar_saveAudio();
}
function voiceCommentCancel(){
    if (audioRecorder){
        audioRecorder.stop();
        audioRecorder.clear();
    }
    $(".voice-comment-load").fadeOut(500);
}

function uploadAudio(blobObject){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/index/audiocomment', true);
    xhr.onload = function(e){
        var result = e.target.result;
    }
    xhr.send(blobObject);
}