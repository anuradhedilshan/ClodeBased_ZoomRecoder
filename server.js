var express = require('express');
const Recoder = require('./engin/Recoder');
var { join } = require('path');
const http = require('http');
const logger = require('./engin/logger');
const db = require('./engin/database');
const cookie = require('cookie');
var cookieParser = require('cookie-parser');



var clientsOBJ = {}
var completed = {}
var app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
app.use(cookieParser());




const R = new Recoder(onfileUpload);
var state = false;
   (async () => {
      await R.setup();
      state = true;
   })()



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(join(__dirname, './web/controller')))
app.use(express.static(join(__dirname, './web/zoom_client')))

// This responds with "Hello World" on the homepage
var a = "Instalizing .......";
var clients = 0;
var jobs = 0;

logger.set_brodcast(on_massage);

 io.sockets.on('ack',()=>{
   console.log("acknowladge Work in Outside");
 })


io.on('connection', function (socket) {
   console.log('***************',socket.id)
   
   if (socket.handshake.headers.cookie && cookie.parse(socket.handshake.headers.cookie)['id'] ) {
      console.log(socket.handshake.headers.cookie);
      var id = cookie.parse(socket.handshake.headers.cookie)['id'];
      clientsOBJ[id] = socket.id;
      if(completed[id]){
            io.sockets.to(socket.id).emit('uploadEvent',completed[id]);
      }
   }
   
   socket.on("ack", (id) => {
    logger.log("Got acknowladge from : "+id,id);
    delete completed[id];
   });

   clients++;
   isjobsChanged();
   io.sockets.emit('client_changed', clients);
   logger.log("Client Connected =>" + clients + " <= useres  live In there");

   socket.on('disconnect', function () {
      clients--;
      logger.log("Client Disonnected =>" + clients + " <= useres  live In there");
      io.sockets.emit('client_changed', clients);
      isjobsChanged();
   });

});



app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage ->");
   var id = "*((^@#@#";
   res.cookie('id', id);
   if (req.cookies['id']) {

   }
   res.sendFile(join(__dirname, './web/controller/index.html'))
   isjobsChanged();

})

app.get('/client', (req, res) => {
   res.sendFile(join(__dirname, './web/zoom_client/index.html'))
})




app.post('/start',  (req, res) => {
   try {
      var meetingConfig = req.body;
      logger.log("AFTRER CALLING STARTSESSION")
      logger.log(meetingConfig);
(async()=>{
      var id = await R.start_localRecode(`file:///home/anuradhe/zoom_Recoder/web/zoom_client/index.html?name=${meetingConfig.userName}&id=${meetingConfig.meetingId}&passcode=${meetingConfig.passcode}&email${meetingConfig.email}`);
       db.addItem(meetingConfig.userName,meetingConfig.meetingId,meetingConfig.passcode,meetingConfig.email,id,`${new Date()}_ZOOM_${id}.mp4`);
       clientsOBJ[id] = meetingConfig.socketId;
       io.sockets.to(meetingConfig.socketId).emit('start',id);
       isjobsChanged();
})()
       res.sendStatus(200);

   } catch (error) {
      logger.error("Error At Start" + error)
      io.sockets.to(meetingConfig.socketId).emit('error',[id,error]);
      res.sendStatus(500);
   }

});




app.post('/stop', async (req, res) => {

   try {
      var id = req.body.id;
      clientsOBJ[id] = req.body.socketId;
      R.stop_stream(id);
      logger.log("Stoping Id" + id);
      setTimeout(() => {
         res.cookie('id', "", { maxAge: 900000 });
         res.sendStatus(200);
      }, 2000);

   } catch (error) {
      logger.error("Invalid id : " + id)
      res.sendStatus(500);
   }
})







server.listen(8080, () => {
   console.log(`Example app listening at http://localhost:8080`)
})



function onfileUpload(type, file, id) {
   completed[id] = [type,file,id];
   console.log(`++++++++ File Upload +++++++ type ; ${type} file : ${file} id : ${id}`);
   logger.log(`++++++++ File Upload +++++++ type ; ${type} file : ${file} id : ${id}`,id);
   try {
         io.sockets.to(clientsOBJ[id]).emit('uploadEvent', [type,file,id]);
   } catch (error) {
          setTimeout(()=>{
            delete clientsOBJ[id];
         },2000)
      console.error("CAoont send Brodcast masaage io ", error);
   }
}


function isjobsChanged() {
   io.sockets.emit('job', Recoder.getJobCount())
}

function on_massage(msg, id, type) {

   try {
      if (id == null) {
         io.sockets.emit('out', [type, msg]);
      } else {
         io.sockets.to(clientsOBJ[id]).emit('out', [type, msg]);
      }
   } catch (error) {
      console.error("CAoont send Brodcast masaage io ", error);
   }
}

