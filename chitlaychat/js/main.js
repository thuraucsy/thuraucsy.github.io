$(function(){
    // Initialize global variable
    var myPeerAPIKey = "3389c3c2-0859-4f15-b69d-3f4e7a6a1867",
        peer,
        dataConnection,
        chat = $('.chat'),
        arrayToStoreChunks = [];
    
    // Get the room name for chat
    let room = getRoomName();

    // firebase api
    let config = {
        apiKey: "AIzaSyC9Kl-69iZWt0Qdr36c3mcCMnVm1kLE8z4",  
        databaseURL: "https://testchat-b9308.firebaseio.com/",
    };
    let databaseRoot = 'myapp/multi/';
    firebase.initializeApp(config);
    let database = firebase.database();
    let roomBroadcastRef;
    let peerConnections = [];

    joinRoom(room);

    function joinRoom(room) {
        let key = database.ref(databaseRoot + room + '/_join_').push({ joined : 'unknown'}).key
        clientId = 'member_' + key;
        console.log('joined to room=' + room + ' as clientId=' + clientId);
        database.ref(databaseRoot + room + '/_join_/' + key).update({ joined : clientId});

        roomBroadcastRef = database.ref(databaseRoot + room + '/_join_/');
        roomBroadcastRef.on('child_added', function(data) {
            console.log('roomBroadcastRef.on(data) data.key=' + data.key + ', data.val():', data.val());
            if (data.key === key) {
                console.log("ignore self and create peer");
                peer = new Peer(data.key, {key: myPeerAPIKey});
                return;
            }

            if (isConnectedWith(data.key)) {
                // already connnected, so skip
                console.log('already connected, so ignore');
            } else {
                makeOffer(data.key);
            }
        });
    }

    function isConnectedWith(id) {
        return peerConnections[id] ? true : false;
    }

    function makeOffer(fromId) {
        peer = new Peer({key: myPeerAPIKey});
        console.log("connect to ", fromId);
        dataConnection = peer.connect(fromId);
        dataConnection = dataConnectionEvent(dataConnection);
        peerConnections[fromId] = dataConnection;
        
    }

    // Room owner connection get
    peer.on('connection', function(dataConnection) {

		chat.append(convertHtml("သင့်တောင်းဆိုမှုကို လက်ခံလိုက်ပါပြီ။ 😊😍", 'other'));
		
		setTimeout(function(){
			dataConnection.send("Ready!");
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
					// peer = new Peer(room, {key: myPeerAPIKey});
				} else {
					console.log('joiner refreshing');
					// create peer as room joiner
					// peer = new Peer({key: myPeerAPIKey});
					// // call to room owner
					// dataConnection = peer.connect(room);
                    // // room joiner connection get
					// dataConnection = dataConnectionEvent(dataConnection);
				}
				
				return room;
			}
		}

		// generate random room, and replace URL
		let room = 'room_' + getUniqueStr();
		// create peer as room owner
		// peer = new Peer(room, {key: myPeerAPIKey});
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
                '<div class="msg">' +
                '<p>'+ msg +'</p>' +
                '<time>'+ getHrMin() +'</time>' +
            '</div>' +
        '</li>';
    }

    function getHrMin() {
        let d = new Date(),
            h = d.getHours();
            m = d.getMinutes();
        return h + ':' + m;
    }

    function convertToUni(msg) {
        console.log(knayi.fontDetect(msg));
        return knayi.fontConvert(msg, 'unicode');
    }
    
    function getCaret(el) { 
        if (el.selectionStart) { 
            return el.selectionStart; 
        } else if (document.selection) { 
            el.focus(); 

            var r = document.selection.createRange(); 
            if (r == null) { 
                return 0; 
            } 

            var re = el.createTextRange(), 
                rc = re.duplicate(); 
            re.moveToBookmark(r.getBookmark()); 
            rc.setEndPoint('EndToStart', re); 

            return rc.text.length; 
        }  
        return 0; 
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
            chat.animate({scrollTop: chat.prop("scrollHeight")}, 500); // scroll to bottom
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

        $(".textarea").off("keypress").on("keypress", function(e) {
            if (e.shiftKey && e.which == 13) {
                console.log('shift + enter');
                var content = this.value;
                var caret = getCaret(this);
                if (caret === content.length) {
                    this.value = content.substring(0,caret);
                } else {
                    this.value = content.substring(0,caret)+"\n"+content.substring(caret,content.length);
                }
            } else if (e.which == 13) {
                console.log('enter');
                var textVal = $(this).val();
                if (textVal) {
                    // convert to uni if zawgyi
                    textVal = convertToUni(textVal);
                    console.log('converted msg', textVal);
                    dataConnection.send(textVal);
                    chat.append(convertHtml(textVal, 'self'));
                    // chat.height($(document).height() * 0.7);
                    chat.animate({scrollTop: chat.prop("scrollHeight")}, 500); // scroll to bottom
                    $(".textarea").val("").focus();
                }
                e.preventDefault();
            }
            
        });
		

		return dataConnection;
	}

    // $(".textarea").on("keypress", function(e) {
    //     if (e.which == 13) {
    //         alert('You must first connect to chat');
    //         e.stopPropagation();
    //     }
    // });


});