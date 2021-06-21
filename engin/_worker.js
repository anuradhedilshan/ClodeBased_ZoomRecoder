const { parentPort, workerData, Worker, isMainThread } = require('worker_threads');
const puppeteer = require('puppeteer');
const Pulse = require("./pulceaudio");
const FFmpeg = require("./ffmpeg");
const logger = require('./logger');
var browser = null;
var client = null;
var ffmpeg = null;
var run = true;
var pagid = null;


parentPort.on('message', d => {
  console.log("WORKER MESSAGE ON *****************", d.cmd)
  pagid = d.data.PageID;
  switch (d.cmd) {
    case "start":
      _start(d.data.EndPoint, d.data.TargetID, d.data.SinkID, d.data.PageID, d.data.rtp, d.data.format);
      break;
    case "stop": _stop(d.data.PageID);
      break;
    case "startL":
      _start(d.data.EndPoint, d.data.TargetID, d.data.SinkID, d.data.PageID, d.data.rtp, d.data.format, true);
      break;
    default :
       process.exit();




  }



})




async function _start(end_P, target_id, sinkID, PageID, rtp, format, local = false) {
  console.log("_START", PageID);
  parentPort.postMessage(`${target_id} is Staring in sinkID:${sinkID}`)
  browser = await puppeteer.connect({ browserWSEndpoint: end_P, defaultViewport: null, });
  var pages = await browser.pages();
  var page = await find_page(target_id, pages);
  client = await page.target().createCDPSession();
  var FFmpegLauncher = new FFmpeg(callback, PageID);

  var params = ffmpegProcessParams(
    '27',
    '00:00:03',
    sinkID,
    rtp,
    format,
    null

  );

  client.send("Page.startScreencast", { format: 'jpeg', everyNthFrame: 1, });
  ffmpeg = await FFmpegLauncher.start(params, local);
  client.on("Page.screencastFrame", (d) => {
   
    if (ffmpeg && ffmpeg.stdin && run) {
      //console.log('WITE');
      let buff = Buffer.from(d.data, 'base64');
      ffmpeg.stdin.write(buff);
      client.send("Page.screencastFrameAck", { sessionId: d.sessionId });
    }


  }
  );


}









function callback(type, msg, PageID) {
  parentPort.postMessage([type, msg, PageID]);
}


async function _stop(PageID) {
  console.log("CALLING STOP");
  setTimeout(async () => {
    run = false;
    client = null;
    ffmpeg.stdin.end();
     ffmpeg.kill(2);
    console.log("Closing")
  }, 5000)

}



function ffmpegProcessParams(f, af, on, ru, fm, cb) {
  const params = {
    fps: f,
    audioOffset: af,
    outputName: on,
    rtmpUrl: ru,
    format: fm,
    callback: cb
  };
  return params;
}


function find_page(target_id, arr) {

  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i].target()._targetId, target_id);
    if (arr[i].target()._targetId == target_id) {
      return arr[i];
      break;
    }

  }


}
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
