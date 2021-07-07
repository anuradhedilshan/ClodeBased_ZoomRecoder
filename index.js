const { parentPort, workerData, Worker, isMainThread } = require('worker_threads');
const Recoder = require('./engin/Recoder');


//const db = require('./engin/database');
var R = new Recoder();

var meetingConfig = {
    userName:'zoom.us',
    meetingId:'9136762438',
    passcode:'2022',
    email:'',
}

async function h() {
    await R.setup();
    var id = await R.start_localRecode(`file:///home/anuradhe/Desktop/zoomRecoder/web/zoom_client/index.html?name=${meetingConfig.userName}&id=${meetingConfig.meetingId}&passcode=${meetingConfig.passcode}&email${meetingConfig.email}`);

}

h();






