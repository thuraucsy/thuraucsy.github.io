// Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.

// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file in the root of the source
// tree. An additional intellectual property rights grant can be found
// in the file PATENTS.  All contributing project authors may
// be found in the AUTHORS file in the root of the source tree.

'use strict';

var deviceList = [];
var counter = 0;

window.onload = function() {
  getSources_();
};

function getSources_() {
  if (typeof navigator.mediaDevices.enumerateDevices === 'undefined') {
    alert('Your browser does not support navigator.mediaDevices.enumerateDevices, aborting.');
    return;
  }
  navigator.mediaDevices.enumerateDevices().then(function(devices) {
    for (var i = 0; i < devices.length; i++) {
	    
		console.log("devices[i].label", devices[i].label)
	      if (devices[i].kind === 'videoinput' && devices[i].deviceId) {
		deviceList[i] = devices[i];
		      var devId = devices[i].deviceId;
		  	doSetTimeout(deviceList[i].deviceId);
		
	      }
		 
    }  
	  

	  
	  
	  
	function doSetTimeout(dID) {
	    setTimeout(function(){  
		  console.info("requesting devices");
		  requestVideo_(dID);
	  }, 2000);
	}

  });
}

function requestVideo_(id) {
  navigator.mediaDevices.getUserMedia({
	//video: {optional: [{sourceId: id}]},
	video: {optional: [{sourceId: id}]},
	audio: {
	    optional: [
			
		    { 
// 			googEchoCancellation: false,
 			googAutoGainControl: false,
 			googAutoGainControl2: false,
// 			googNoiseSuppression: false,
// 			googHighpassFilter: false,
// 			googTypingNoiseDetection: false,
			googAudioMirroring: false // For some reason setting googAudioMirroring causes a navigator.getUserMedia error:  NavigatorUserMediaError
		    }
		

		    ]
	}
  }
				    			     
				     
	).then(
    function(stream) {
		  getUserMediaOkCallback_(stream);
     },
    getUserMediaFailedCallback_
  );
}


function getUserMediaFailedCallback_(error) {
  alert('User media request denied with error: ' + error.name);
}

function getUserMediaOkCallback_(stream) {	
	
  var videoArea = document.getElementById('videoArea');
  var video = document.createElement('video');
  var div = document.createElement('div');
  div.style.float = 'left';
  video.setAttribute('id', 'view' + counter);
  video.width = 320;
  video.height = 240;
  video.autoplay = true;
  div.appendChild(video);
  videoArea.appendChild(div);
	
  document.getElementById('view' + counter).src = URL.createObjectURL(stream);
	
//   if (typeof stream.getVideoTracks()[0].label !== 'undefined') {
//     var deviceLabel = document.createElement('p');
//     deviceLabel.innerHTML = stream.getVideoTracks()[0].label;
//     div.appendChild(deviceLabel);
//   }
//   stream.getVideoTracks()[0].addEventListener('ended', errorMessage_);
//   document.getElementById('view' + counter).srcObject = stream;
  counter++;
}

var errorMessage_ = function(event) {
  var message = 'getUserMedia successful but ' + event.type + ' event fired ' +
                'from camera. Most likely too many cameras on the same USB ' +
                'bus/hub. Verify this by disconnecting one of the cameras ' +
                'and try again.';
  document.getElementById('messages').innerHTML += event.target.label + ': ' +
                                                   message + '<br><br>';
};
