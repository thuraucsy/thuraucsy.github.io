$(function(){
    // Initialize global variable
    var myPeerAPIKey = "3389c3c2-0859-4f15-b69d-3f4e7a6a1867",
        peer,
        dataConnection,
        chat = $('.chat'),
        arrayToStoreChunks = [];
    
    // Get the room name for chat
    let room = getRoomName();

    // Room owner connection get
    peer.on('connection', function(dataConnection) {

		chat.append(convertHtml("Connected Now", 'other'));
		
		setTimeout(function(){
			dataConnection.send("Connected Now!");
		}, 500);

		dataConnection = dataConnectionEvent(dataConnection);
		
	});

    // Global Functions
    function getRoomName() {
		let url = document.location.href;
		let args = url.split('?');
		if (args.length > 1) {
			let room = args[1];
			if (room != '') {
				if (window.history.state === 'owner') {
					console.log('owner refreshing');
                    // create peer as room owner
					peer = new Peer(room, {key: myPeerAPIKey});
				} else {
					console.log('joiner refreshing');
					// create peer as room joiner
					peer = new Peer({key: myPeerAPIKey});
					// call to room owner
					dataConnection = peer.connect(room);
                    // room joiner connection get
					dataConnection = dataConnectionEvent(dataConnection);
				}
				
				return room;
			}
		}

		// generate random room, and replace URL
		let room = 'room_' + getUniqueStr();
		// create peer as room owner
		peer = new Peer(room, {key: myPeerAPIKey});
		window.history.pushState('owner', null, 'index.html?' + room);
		return room;
	}

    function getUniqueStr(myStrong){
		var strong = 1000;
		if (myStrong) strong = myStrong;
		return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16);
	}

	function saveToDisk(fileUrl, fileName) {
		console.log("save to disk is running");
		var save = document.createElement('a');
		save.href = fileUrl;
		save.target = '_blank';
		save.download = fileName || fileUrl;

		var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

		save.dispatchEvent(evt);

		(window.URL || window.webkitURL).revokeObjectURL(save.href);
		console.log("save to disk finished");
	}

    function convertHtml(msg, where) {
        var img = 'DY6gND0.png'; // default is other
        if (where == 'self') {
            img = 'HYcn9xO.png';
        }
        return '<li class='+ where +'>' +
            '<div class="avatar"><img src="img/'+ img +'" draggable="false"/></div>' +
                '<div class="msg myanmar3">' +
                '<p>'+ msg +'</p>' +
                '<time>20:17</time>' +
            '</div>' +
        '</li>';
    }

    function convertToUni(msg) {
        console.log(knayi.fontDetect(msg));
        return knayi.fontConvert(msg, 'unicode');
    }

    function dataConnectionEvent(dataConnection) {
		dataConnection.on('data', function(data) {
			console.log('Received data is', data);
            // data.message is for file sharing
		    if (data.message) {
		    	console.log('Receiving file in chuncks...', data.message);
				arrayToStoreChunks.push(data.message); // pushing chunks in array

				if (data.last) {
					saveToDisk(arrayToStoreChunks.join(''), 'filename');
					arrayToStoreChunks = []; // resetting array
				}
				data = 'file is receiving ...';
			} 
			chat.append(convertHtml(data, 'other'));
		});

		// input file
		// document.querySelector('input[type=file]').onchange = function() {
		// 	var file = this.files[0];
		// 	var reader = new window.FileReader();
		// 	reader.readAsDataURL(file);
		// 	reader.onload = onReadAsDataURL;
			
		// 	var chunkLength = 1000000;

		// 	function onReadAsDataURL(event, text) {
		// 	    var data = {}; // data object to transmit over data channel
		// 	    if (event) text = event.target.result; // on first invocation
		// 	    if (text.length > chunkLength) {
		// 			data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
		// 		} else {
		// 			data.message = text;
		// 			data.last = true;
		// 		}
		// 		    dataConnection.send(data); // use JSON.stringify for chrome!
		// 		    var remainingDataURL = text.slice(data.message.length);
		// 		    if (remainingDataURL.length) setTimeout(function () {
		// 			onReadAsDataURL(null, remainingDataURL); // continue transmitting
		// 		}, 1000)
		// 	}
		// };

        $("input.textarea").on("keypress", function(e) {
            if (e.which == 13) {
                console.log('enter');
                var textVal = $(this).val();
                if (textVal) {
                    // convert to uni if zawgyi
                    textVal = convertToUni(textVal);
                    console.log('converted msg', textVal);

                    if (!dataConnection) {
                        alert('You must first connect to chat');
                        return;
                    }
                    dataConnection.send(textVal);
                    chat.append(convertHtml(textVal, 'self'));
                    $(this).val("");
                }
            }
        });
		

		return dataConnection;
	}

});