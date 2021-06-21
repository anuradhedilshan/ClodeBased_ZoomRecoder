const winston = require('winston');
var io = null;

const myFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp}-[${level}] : ${message}`
  if (metadata) {
    msg += JSON.stringify(metadata)
  }
  return msg
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.timestamp(),
    myFormat
  ),
  transports: [
    
   //new winston.transports.Console(),
   new winston.transports.File({ filename: 'combined.log' })

  ]
});

exports.log = function (message,id=null) {
  send_massage(message,id,"info")
  logger.log({
    level: 'info',
    message: "[LocalHost] " + JSON.stringify(message)
  });



}

exports.error = function (message,id=null) {
  send_massage(message,id,"error")
  logger.log({
    level: 'error',
    message: "[Error] " + message
  });

}


function send_massage(msg, id ,type) {
  if (io != null) {
    io(msg, id,type);
  }
}



exports.set_brodcast = function (socket) {
  io = socket;
}



