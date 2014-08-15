if(!userBrowser[0].ios){var audioContext=new AudioContext();}
var audioInput=null,realAudioInput=null,inputPoint=null,audioRecorder=null;var recIndex=0;function ar_saveAudio(){audioRecorder.exportWAV(ar_doneEncoding);}
function ar_doneEncoding(blob){Recorder.forceDownload(blob,"myRecording"+((recIndex<10)?"0":"")+recIndex+".wav");recIndex++;}
function ar_stop(){if(!audioRecorder){jerror('your browser is not supported or you must allow to access your microphone');return;}
audioRecorder.stop();}
function ar_start(){if(!audioRecorder){jerror('your browser is not supported or you must allow to access your microphone');return;}
audioRecorder.clear();audioRecorder.record();}
function ar_convertToMono(input){var splitter=audioContext.createChannelSplitter(2);var merger=audioContext.createChannelMerger(2);input.connect(splitter);splitter.connect(merger,0,0);splitter.connect(merger,0,1);return merger;}
function ar_changeAudioFormat(){if(audioInput!=realAudioInput){audioInput.disconnect();realAudioInput.disconnect();audioInput=realAudioInput;}else{realAudioInput.disconnect();audioInput=ar_convertToMono(realAudioInput);}
audioInput.connect(inputPoint);}
function ar_gotStream(stream){inputPoint=audioContext.createGain();realAudioInput=audioContext.createMediaStreamSource(stream);audioInput=realAudioInput;audioInput.connect(inputPoint);analyserNode=audioContext.createAnalyser();analyserNode.fftSize=2048;inputPoint.connect(analyserNode);audioRecorder=new Recorder(inputPoint);zeroGain=audioContext.createGain();zeroGain.gain.value=0.0;inputPoint.connect(zeroGain);zeroGain.connect(audioContext.destination);}
function ar_initAudio(){if(!navigator.getUserMedia)
navigator.getUserMedia=navigator.webkitGetUserMedia||navigator.mozGetUserMedia;if(!navigator.cancelAnimationFrame)
navigator.cancelAnimationFrame=navigator.webkitCancelAnimationFrame||navigator.mozCancelAnimationFrame;if(!navigator.requestAnimationFrame)
navigator.requestAnimationFrame=navigator.webkitRequestAnimationFrame||navigator.mozRequestAnimationFrame;navigator.getUserMedia({audio:true},ar_gotStream,function(e){console.log(e);});}
function voiceComment(){if(!audioRecorder){jerror('your browser is not supported or you must allow to accesss your microphone');return;}
$("a.process-voice").attr("href","javascript:voiceCommentStart();");$("a.process-voice").html('Start');audioRecorder.clear();$(".voice-comment-load").show();}
function voiceCommentStart(){ar_start();$("a.process-voice").attr("href","javascript:voiceCommentStop();");$("a.process-voice").html('Stop');}
function voiceCommentStop(){$("a.process-voice").attr("href","javascript:voiceCommentStart();");$("a.process-voice").html('Start');ar_stop();ar_saveAudio();}
function voiceCommentCancel(){if(audioRecorder){audioRecorder.stop();audioRecorder.clear();}
$(".voice-comment-load").fadeOut(500);}
function uploadAudio(blobObject){voiceCommentCancel();$('#loadingpopup').show();var file2=new FileReader();file2.readAsDataURL(blobObject);file2.onloadend=function(e){$.ajax({url:"/index/audiocomment",type:"POST",data:{file_data:file2.result,user_id:$('input[name=user_id]').val(),comment_event_id:event_id},dataType:"html",success:function(response){$('#loadingpopup').hide();jsuccess(response);}});};}