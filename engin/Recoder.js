const Chrome = require("./chrome");
const Pulce = require("./pulceaudio");
const Event = require("./Event_");
const logger = require('./logger');
const webcontroller = require('./web_controller');
const drive = null //require('./driveApi')
const fs = require('fs')

const {
    Worker, isMainThread, parentPort, workerData
} = require('worker_threads');
const chrome = require("./chrome");

var workers = {};

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
class Recoder extends Event {
    chrome = null;
    pulce = null;
    now = 0;
    sinks = {};
    EndPoint = null;
    onFileUpload = null;

    static jobs = 0;
    constructor(onFile = () => { console.log("FILE UPLOADING"); }) {
        super();
        this.chrome = new Chrome();
        this.onFileUpload = onFile;
        this.pulce = Pulce;
    }

    setup() {
        //page.target()._targetId

        const forLoop = async _ => {
            this.EndPoint = await this.chrome.launchChrome();
            for (let index = 0; index < this.max; index++) {
                var sinkId = await this.pulce.createSink("Sink_Name-" + index);

                this.sinks[sinkId] = {
                    is: true,
                    name: "Sink_Name-" + index
                };//Set IS  free
            }
            this.whoisfree()
            return true;
        }

        return forLoop();

    }

    async configure_new_page(sinkId, url) {
        console.log(url);
        this.setsinkbusy(sinkId)
        var id = await this.chrome.new_page(url);
        var page = Chrome.get_page(id);
        await this.timeout(5000);
        var inputs = await this.pulce.getInputId(Chrome.processId);
        var inId = this.find_Large(inputs);
        page.TargetID = page.target()._targetId;
        page.inId = inId;
        page.SinkID = this.sinks[sinkId]['name'];
        page.SinkIDint = parseInt(sinkId);
        logger.log("This Page sink Id is" + sinkId, id);
        await this.pulce.moveInput(inId, sinkId)
        console.log(this.sinks);
        return id;


    }

    // start zoom Instance and Start Streaming

    async start_localRecode(weburl) {

        var sinkId = this.whoisfree();
        logger.log(`START Local Recode:  ${weburl} VIA sink id :  ${sinkId}`)
        if (Recoder.jobs < this.max && sinkId != null) {
            var id = await this.configure_new_page(sinkId, weburl);
            var page = chrome.get_page(id);
            await this.timeout(5000);
            var a = await webcontroller.setupAudio(page);
            //var a  = true;
            console.log("A IS ", a);
            if (a) {
                var worker = new Worker('./engin/_worker.js');
                workers[id] = worker;
                worker.postMessage({
                    "cmd": "startL",
                    "data": {
                        "EndPoint": this.EndPoint,
                        "TargetID": page.TargetID,
                        "SinkID": page.SinkID,
                        'PageID': id,
                        "rtp": `/home/anuradhe/Desktop/${new Date()}_ZOOM_${id}.mp4`,
                        "format": 'mp4'
                    }
                });

                setTimeout(async () => {
                    console.log("TIME OUT");
                    this.stop_stream(id)
                }, 8300000);

                worker.on('message', (e) => {
                    //e[0]=type,e[1]=massage,e[2]=pageid
                    //logger.log(e);
                    switch (e[0]) {
                        case "close": Recoder.jobs--; this.stop_stream(e[2]); break;
                        case "open": Recoder.jobs++; break;
                        case "error": logger.error(e[1], e[2]); break;
                        case "event": logger.log(e[1], e[2]); break;
                        case "ok": //Recoder.jobs--; this.sucsess(e[1], e[2]); break;
                        case "exit": workers[e[2]].terminate(); delete workers[e[2]];
                            break;

                    }
                });

                worker.once('exit', (e) => {
                    logger.error("WORKER THREAD EXITED exit code :  " + e)
                });

                return id;
            } else {
                await chrome.close_page(id);
                logger.error("Your Are In Waiting Room For Long Time We Cannot REcive Video Data", id);
                return null;
            }
        } else {
            this.url_luancherror("MAX PAges Reached OR ALL Sinks Are busy Cannot Run Your request");
            return null;
        }





    }

    // async start_Stream(weburl, rtp) {
    //     logger.log(`START Stream URL:  ${weburl} RTP : ${rtp} VIA sink id :  ${sinkId}`)
    //     var sinkId = this.whoisfree();
    //     if (Recoder.jobs < this.max && sinkId != null) {
    //         var id = await this.configure_new_page(sinkId, weburl);
    //         var page = chrome.get_page(id);
    //         var a = await webcontroller.setupAudio(page);
    //         var a = true;

    //         if (a) {
    //             var worker = new Worker('./engin/_worker.js');
    //             workers[id] = worker;
    //             worker.postMessage({
    //                 "cmd": "start",
    //                 "data": {
    //                     "EndPoint": this.EndPoint,
    //                     "TargetID": page.TargetID,
    //                     "SinkID": page.SinkID,
    //                     'PageID': id,
    //                     "rtp": rtp,
    //                     "format": 'flv'
    //                 }
    //             })

    //             setTimeout(async () => {
    //                 console.log("TIME OUT");
    //                 this.stop_stream(id)
    //             }, 20000);
    //             //8230000

    //             worker.on('message', (e) => {
    //                 console.log("ON MESAAGE");
    //                 switch (e[0]) {
    //                     case "close": Recoder.jobs--; this.stop_stream(e[2]); break;
    //                     case "open": Recoder.jobs++; break;
    //                     case "error": logger.error(e[1], e[2]); this.stop_stream(e[2]); break;
    //                     case "event": logger.log(e[1], e[2]); break;
    //                     case "ok": this.sucsess(e[1], e[2]); break;

    //                 }
    //             })


    //             worker.once('exit', (e) => {
    //                 logger.error("WORKER THREAD EXITED exit code :  " + e + " Page  :" + id, id)
    //             });


    //             return id;
    //         } else {
    //             await chrome.close_page(id);
    //             this.setsinkfree(sinkId);
    //             logger.error("Your Are In Waiting Room LOng Time We Cannot REcive Video Data");
    //         }
    //         console.log(workers)


    //     } else {
    //         this.url_luancherror("MAX PAges Reached OR ALL Sinks Are busy");
    //         return null;
    //     }





    // }




    static getJobCount() {
        logger.log(`${Recoder.jobs} Jobs Are Runing`)
        return Recoder.jobs;
    }

    sucsess(file, id) {

        console.log("FILE CRAEED SUCESSSS FILEIS", file, id);
        logger.log('FIle Created wait for Uploading Progress', id)
        drive.createFile(file, `${new Date()}_ZOOM_${id}.mp4`).then(async (a) => {
            logger.log("FIEL Uploaded", id);
            this.onFileUpload("wait", "", id);
            var link = await drive.genaratepulicurl(a);
            setTimeout(() => {
                this.onFileUpload("ok", link, id);
                if (fs.existsSync(file)) {
                    try {
                        fs.unlinkSync(file)
                        logger.error("FILE REMOVED", id)
                        //file removed
                    } catch (err) {
                        logger.error("error", err, this.PageID)
                        console.error(err);
                    }
                }
            }, 3000);

        }).catch((e) => {
            logger.error(e, id)
            this.onFileUpload("error", e, id);
            logger.error("SOMETHING WENT WROMG. IF YOU NEED RECODING FILE CONTACT Developer +94784369961", id)
        })
    }

    async stop_stream(pageId) {
        try {
            this.onFileUpload("exit", "Existing....." + pageId, pageId)
            console.log("Page Closing ID IS", pageId);
            //console.log(workers)
            if (workers[pageId]) {
                console.log("WORKER HASSS");
                workers[pageId].postMessage({
                    "cmd": "stop",
                    "data": {
                        'PageID': pageId
                    }
                });
            }
            // workers[pageId].terminate();
            this.setsinkfree(chrome.get_page(pageId).SinkIDint);
            await chrome.close_page(pageId);
            //console.log("PAGES AFTER STOP", chrome.get_pages())
            logger.log(`PAGE CLOSED SUCSESS - ${pageId}`, pageId)
            // console.log("WORKERS AFTER CLOSE", workers);
        } catch (e) {
            logger.error("ALDERDY STOPTED", pageId, e);
            console.error("ALDERDY STOPTED", pageId, e);
        }

    }



    setsinkfree(sink_id) {
        logger.log(`Sink ID (${sink_id}) Set As free`)
        this.sinks[sink_id]['is'] = true;
    }
    setsinkbusy(sink_id) {
        logger.log(`Sink ID (${sink_id}) Set As Busy`)
        this.sinks[sink_id]['is'] = false;
    }


    whoisfree() {
        for (let i = 0; i < Object.keys(this.sinks).length; i++) {

            if (this.sinks[Object.keys(this.sinks)[i]]['is']) {
                logger.log("SINK ID ", Object.keys(this.sinks)[i], "IS FREE");
                return Object.keys(this.sinks)[i];

            }
        }
        console.log(this.sinks);
        logger.log("NULL VALUE RETURN to sinks All Sinks Are Busy:" + JSON.stringify(this.sinks));
        return null;
    }
    isrun(id) {
        if (workers[id]) {
            workers[id]
        }
    }

}


module.exports = Recoder;
