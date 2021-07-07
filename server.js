var express = require('express');
const Recoder = require('./engin/Recoder');
var { join } = require('path');
const http = require('http');
const logger = require('./engin/logger');
const db = require('./engin/database');
const cookie = require('cookie');
var cookieParser = require('cookie-parser');
const uniqid = require('uniqid');



var clientsOBJ = {}
var completed = {}
var app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
app.use(cookieParser());




// const R = new Recoder(onfileUpload);
// var state = false;
//    (async () => {
//       await R.setup();
//       state = true;
//    })()



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(join(__dirname, './web/controller')))
app.use(express.static(join(__dirname, './web/zoom_client')))

// This responds with "Hello World" on the homepage
var a = "Instalizing .......";
var clients = 0;
var jobs = 0;
var clientURL = join(__dirname, 'web/controller/index.html');

console.log("PATH", clientURL)
logger.set_brodcast(on_massage);

io.sockets.on('ack', () => {
   console.log("acknowladge Work in Outside");
})


io.on('connection', function (socket) {
   console.log('***************', socket.id)

   if (socket.handshake.headers.cookie && cookie.parse(socket.handshake.headers.cookie)['id']) {
      console.log(socket.handshake.headers.cookie);
      var id = cookie.parse(socket.handshake.headers.cookie)['id'];
      clientsOBJ[id] = socket.id;
      if (completed[id]) {
         io.sockets.to(socket.id).emit('uploadEvent', completed[id]);
      }
   }

   socket.on("ack", (id) => {
      logger.log("Got acknowladge from : " + id, id);
      delete completed[id];
   });

   clients++;
   isjobsChanged();
   io.sockets.emit('client_changed', clients);
   logger.log("Client Connected =>" + clients + " <= useres  live In there");

   socket.on('disconnect', function () {
      if (socket.handshake.headers.cookie && cookie.parse(socket.handshake.headers.cookie)['id']) {
         var id = cookie.parse(socket.handshake.headers.cookie)['id'];
         delete clientsOBJ[id];
      }
      clients--;
      logger.log("Client Disonnected =>" + clients + " <= useres  live In there");
      io.sockets.emit('client_changed', clients);
      isjobsChanged();
   });

});



app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage ->", req.body);
   res.sendFile(join(__dirname, './web/controller/index.html'))
   isjobsChanged();
})

app.get('/client', (req, res) => {
   res.sendFile(join(__dirname, './web/zoom_client/index.html'))
})




app.post('/start', (req, res) => {
   try {
      if (req.cookies.uid) {
         var mC = req.body;
         logger.log("AFTRER CALLING STARTSESSION")
         logger.log(mC);
         (async () => {
            var id = await R.start_localRecode(`${clientURL}?name=${mC.userName}&id=${mC.meetingId}&passcode=${mC.passcode}&email${mC.email}`);
            clientsOBJ[id] = mC.socketId;
            db.addRequest(id, req.cookies.uid, mC.userName, mC.meetingId, mC.passcode, mC.email, (err) => {
               if (err) {
                  logger.error("DATABASE FAIL", id)
               }
            })
            io.sockets.to(mC.socketId).emit('start', id);
            isjobsChanged();
         })()
         res.sendStatus(200);
      }

   } catch (error) {
      logger.error("Error At Start" + error)
      io.sockets.to(mC.socketId).emit('error', [id, error]);
      res.sendStatus(500);
   }

});




app.post('/stop', async (req, res) => {

   try {
      var id = req.body.id;
      clientsOBJ[id] = req.body.socketId;
      R.stop_stream(id);
      logger.log("Stoping Id" + id);
      if (req.cookies.uid) {
         db.setUpdate(false, id, () => {
         })
      }
      setTimeout(() => {
         res.cookie('id', "", { maxAge: 900000 });
         res.sendStatus(200);
      }, 2000);

   } catch (error) {
      logger.error("Invalid id : " + id)
      res.sendStatus(500);
   }
})



app.post('/register', (req, res) => {
   var form = req.body;
   var id = uniqid(form.fname);
   db.addUser(id, form.fname + form.lname, form.email, form.password, (err) => {
      if (err) {
         console.error("Cant REgister", err);
         res.send(`
         <h1 class="bg-danger">Registation fail </h1>
         <h2 style='color:red'> ${err} </h2> <br>
         <a href="http://www.zoder.tech" class="link-success">Redirect To Home Page</a>
         `);

      } else {
         logger.log("Register Sucecssfully");
         res.cookie('uid', id, { maxAge: 9000000 });
         var requestedUrl = req.protocol + '://' + req.get('host');
         res.redirect(requestedUrl + "?reg=ok");
      }
   })

})

app.post('/login', (req, res) => {
   var form = req.body;
   db.checkLogin(form.email, form.password, (err, row) => {
      if (err) {
         res.sendStatus(502);
      } else {
         if (row) {
            logger.log("Login Sucesss")
            res.cookie('uid', row.id, { maxAge: 9000000 });
            res.send({ result: 1 })
         } else {
            res.send({ result: 502 })
         }

      }
   })
})

app.get('/getrows', (req, res) => {
   if (req.cookies.uid) {
      db.getRows(req.cookies.uid, (err, rows) => {
         if (err) {
            console.error(err);
            res.sendStatus(502);
         }
         res.send(rows)
      })
   }

});



server.listen(8080, () => {
   console.log(`Example app listening at http://localhost:8080`)
})



function onfileUpload(type, file, id) {
   refresh()
   completed[id] = [type, file, id];
   console.log(`++++++++ File Upload +++++++ type ; ${type} file : ${file} id : ${id}`);
   logger.log(`++++++++ File Upload +++++++ type ; ${type} file : ${file} id : ${id}`, id);
   try {
      io.sockets.to(clientsOBJ[id]).emit('uploadEvent', [type, file, id]);
      db.setUpdate(false, id, () => {
      })
      if (type == "ok") {
         db.setLinks(id, file.webContentLink, file.webViewLink, (err) => {
            logger.error("SETLINKS DB errro", id)
         })
      }
   } catch (error) {
      setTimeout(() => {
         delete clientsOBJ[id];
      }, 2000)
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

