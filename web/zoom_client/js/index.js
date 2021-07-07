ZoomMtg.setZoomJSLib('https://dmogdx0jrul3u.cloudfront.net/1.9.1/lib', '/av');
ZoomMtg.setZoomJSLib('https://source.zoom.us/1.9.1/lib', '/av');

console.log(location.search);
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();


const zoomMeeting = document.getElementById("zmmtg-root")
function get(name) {
	if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
		console.log(decodeURIComponent(name[1]));
	return decodeURIComponent(name[1]);
}
var named;
var meetID;
var passcode;
var email;
try {
	named = get('name');
	meetID = get('id');
	passcode = get('passcode');
	email = get('email');
} catch (error) {

}


const meetConfig = {
	apiKey: 'i-Ig5xMAQLyWdVU6dVzblw',
	apiSecret: '5YI78ErX4nU7WtzKRy8KvCyvBYmAu9ifAVHL',
	meetingNumber: meetID,
	leaveUrl: location.search,
	userName: named,
	userEmail: email,
	passWord: passcode, // if required
	role: 0 // 1 for host; 0 for attendee
};

var signature = ZoomMtg.generateSignature({
	meetingNumber: meetConfig.meetingNumber,
	apiKey: meetConfig.apiKey,
	apiSecret: meetConfig.apiSecret,
	role: meetConfig.role,
	success: function (res) {
		console.log(res.result);
	}
});

ZoomMtg.init({
	leaveUrl: meetConfig.leaveUrl,
	isSupportAV: true,
	success: function () {
		ZoomMtg.join({
			signature: signature,
			apiKey: meetConfig.apiKey,
			meetingNumber: meetConfig.meetingNumber,
			userName: meetConfig.userName,
			// password optional; set by Host
			passWord: meetConfig.passWord,
			error(res) {
				window.top.postMessage('error', res.result);
			}, success(res) {
				console.log("SUCESSSshdjkshdshdhsdhshdsjhskhdskjhdsjkhdsjkhdsjkhdsjkhdsjk");
				window.top.postMessage('ok', res.result);
			}
		})
	}
})




