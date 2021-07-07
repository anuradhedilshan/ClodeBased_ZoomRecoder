const spawn = require('child_process').spawn;
const logger = require('./logger');
const { exec} = require('child-process-async');
const fs = require('fs')




class FFmpeg {
  ffmpeg = null;
  restart = false;
  restartParams = null;
  callback = null;
  PageID = null;
  constructor(cb, PageID) {
    this.callback = cb;
    this.PageID = PageID;
  }
  closeAll() {
    this.callback('Closing all');
    if (this.restart) {
      this.callback("event",
        'We are starting ffmpeg here right after we are closing because we need to this.restart.'
      );
      this.restart = false;
      this.ffmpeg = start(this.restartParams);
      this.restartParams.callback(this.ffmpeg);
    }
  }

  // This is a eager this.restart, we will this.restart first an then kill the previous one
  // so we do not loose stream on the media server, this.ffmpeg gotta be amazing
  async restart(params) {
    // we will only restart once after 5 seconds
    if (this.ffmpeg == null) {
      return this.ffmpeg;
    }
    this.callback("event",
      'We are restarting this.ffmpeg, we are noticing a lot of fluctuation on the framerate...', this.PageID
    );
    this.restart = true;
    this.restartParams = params;
    try {
      this.ffmpeg.stdout.pause();
      this.ffmpeg.stdin.pause();
      await exec('kill -9 ' + this.ffmpeg.pid);
    } catch (error) {
      this.callback("error", '[ERROR] Failed to close this.ffmpeg..' + error, this.PageID);
      process.exit(1);
    }
    this.ffmpeg = null;
    return this.ffmpeg;
  };

  // Start this.ffmpeg via spawn
  async start(params, local) {
    this.callback("event", 'Initializing FFMPEG....', this.PageID);
    this.callback("event", 'Initializing FFMPEG with FPS: ' + params.fps, this.PageID);



    const ops = local ? this.ffmpegOptsLocal(params) : this.ffmpegOpts(params);
    try {
      this.ffmpeg = await spawn('ffmpeg', ops, { detached: true });
    }
    catch (e) {
      console.log("ERROR AT ffmpeg spawn", e);
    }

    this.callback("open", 'Initializing FFMPEG....Initializing..........', this.PageID);
    this.ffmpeg.on('error', function (e) {
      t
      this.callback("error", 'child process error' + e);

    });

    this.ffmpeg.on('close', (code, signal) => {

      this.callback("error", `child process terminated due to receipt of signal ${signal},${code}`, this.PageID);
      if (code < 255 || code == null) {
        if (fs.existsSync(params.rtmpUrl)) {
          try {
            fs.unlinkSync(params.rtmpUrl)
            logger.error("FILE REMOVED", this.PageID)
            //file removed
          } catch (err) {
            this.callback("error", err, this.PageID)
            console.error(err)
          }

        }
        console.log("CLOSING CODE IS", code);
        this.callback("close", `Closed in ${code} As signal-${signal}`, this.PageID);
      } else {
        this.callback("ok", params.rtmpUrl, this.PageID);
        console.log("OK OK OKOK O K O K O K O K O K O K O K ");
      }
      setTimeout(() => {
        this.callback("exit", 'NOW CAN EXIT', this.PageID);
      }, 3000)

    });


    this.ffmpeg.stderr.setEncoding("utf8")

    this.ffmpeg.stderr.on('data', (d) => {
      this.callback("event",d,this.PageID);

    })
    process.on('uncaughtException', error => {
      // Prints "unhandledRejection woops!"
      this.callback('error', 'unhandledRejection In EventLOOP' + error, this.PageID);
    });

    this.callback("event", 'child process started on this port: ' + this.ffmpeg.pid, this.PageID);
    return this.ffmpeg;
  }





  // f: force format
  // r: frame rate
  // i: input files assuming your files are filename001.jpg, filename002.jpg, ...
  // vcodec: video codec
  // crf: constant rate factor (0-51). 17-18 is (nearly) visually lossless. See Encode/H.264
  // pix_fmt: pixel format



  ffmpegOptsLocal(params) {

    console.log("PARAMS TO LOCAL RECODE" + params.outputName + '.monitor');
    const ops = [
      '-y',
      '-use_wallclock_as_timestamps','1', 
      // '-itsoffset',
      // params.audioOffset,
      '-f','pulse',
      '-i',params.outputName + '.monitor',
      '-framerate', '4', //14
      '-i','pipe:',
      '-f','image2pipe',
      '-c:v', 'libx264',
      '-b:v', '1600k',
      '-b:a', '128k',
      '-pix_fmt', 'yuvj420p',
      '-crf', '17',
      '-threads','0',
      // Output
      '-maxrate', '2M',
      '-bufsize', '6M',
      '-async', '1', 
      params.format,
      params.rtmpUrl,
    ]
    return ops;
  }


  ffmpegOpts(params) {
    console.log("PARAMS TO Cloud RECODE");
    const ops = [
      //'-loglevel' ,'debug',
      //'-thread_queue_size','1024',
      //'-itsoffset',
      //params.audioOffset,
      '-use_wallclock_as_timestamps','1', 
      '-f', 'pulse',
      '-i', params.outputName + '.monitor',
      '-acodec', 'copy',
      '-framerate', '4', //14//9
      '-i', 'pipe:',
      '-f', 'image2pipe',
      // '-thread_queue_size','1024',
      '-c:v', 'libx264',
      '-b:v', '1600k',
      '-b:a', '128k',
      '-pix_fmt', 'yuvj420p',

      //ideo optimizations'
      '-g', '50',
      '-preset', 'ultrafast',
      '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      // '-vf','scale=720x576, pad=880:576:80:0',
      '-async', '1', '-vsync', '1',
      '-threads','0',
      '-c:a', 'aac',
      '-strict', '-2',
      '-auto-alt-ref', '0',
      '-crf', '17',
      '-maxrate', '1M',
      '-bufsize', '6M',
      //'-framerate',params.fps,
      '-f', params.format,
      '-flvflags', 'no_duration_filesize',
      params.rtmpUrl
    ]
    return ops;

  }
}

module.exports = FFmpeg;
