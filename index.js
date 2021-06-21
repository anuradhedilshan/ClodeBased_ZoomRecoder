const { parentPort, workerData, Worker, isMainThread } = require('worker_threads');
const Recoder = require('./engin/Recoder');
const drive = require('./engin/driveApi');

//const db = require('./engin/database');
var R = new Recoder();










// async function h() {
//     await R.setup();
//     console.log('After Calli');
//     await R.start_Stream("file:///home/anuradhe/Desktop/zoom_Recoder/web/zoom_client/index.html?name=lakshitha&id=89504569754&passcode=610390&email=", 'tcp://127.0.0.1:1234?listen')
// }

async function h() {
    await R.setup();
    await R.start_localRecode("file:///home/anuradhe/Desktop/h.mp4", '/home/anuradhe/Desktop/zoom_Recoder/a.mp4')
}
// async function h() {
//     await R.setup();
//     console.log('After Calli');
//     await R.start_Stream("file:///home/anuradhe/Desktop/h.mp4", 'tcp://127.0.0.1:1234?listen')
// }
h();




