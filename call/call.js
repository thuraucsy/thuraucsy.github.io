var session;

var endButton = document.getElementById('endCall');
endButton.addEventListener('click', function() {
	session.bye();
	alert('Call Ended');
}, false);

var startButton = document.getElementById('startCall');
startButton.addEventListener('click', function(){
	session = userAgent.invite('sip:2023@203.181.36.238', options);
	alert('Call started');
}, false);

var userAgent = new SIP.UA({
	uri: '2000@203.181.36.238',
	wsServers: ['ws://203.181.36.238:5066'],
	password: 'PASS'
});

var options = {
	media: {
		constraints: {
			audio: true,
			video: true
		},
		render: {
			remote: document.getElementById('remoteVideo'),
			local: document.getElementById('localVideo')
		}
	}
};
