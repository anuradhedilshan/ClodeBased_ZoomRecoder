const logger = require('./logger');
const sqlite3 = require('sqlite3').verbose();
const {join} = require('path');


let db = new sqlite3.Database(join(__dirname,"database/lite.db"), (err) => {
    if (err) {
        console.log(err,"CONNECT ERROR");
        return false;
    } else {
        return true;
    }

});


function createTable() {
    if (db) {
        const sql = `
    CREATE TABLE IF NOT EXISTS request(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL ,
      meetingid VARCHAR(50) NOT NULL,
      passcode VARCHAR(10) NOT NULL,
      email VARCHAR(50) ,
      targetid VARCHARR(19) NOT NULL,
      rtp VARCHAR(100),
      timestamp datetime)`
        db.run(sql, (err) => {
            console.log(err,"ERROR");
        });
    }



}



function addItem(u, m, p, e, tid, r) {
   
    try {
        createTable();
        var sql = `INSERT INTO request 
    (username,meetingid,passcode,email,targetid,rtp,timestamp)
    VALUES(?,?,?,?,?,?,?)`;
        db.run(sql, [u, m, p, e, tid, r,new Date().toString()], function (err) {
            if (err) {
                console.log(err , 'VALUE ADD ERROR');
                return false;
            } else {
                return true;
            }

        });

    } catch (e) {
        console.error("Database Error" + e)
    }
}


module.exports.addItem = addItem;