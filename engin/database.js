const logger = require('./logger');
const sqlite3 = require('sqlite3').verbose();
const { join } = require('path');
const fs = require('fs')

var db;

if (!fs.existsSync(join(__dirname, "lite.db"))) {
    fs.writeFile(join(__dirname, "lite.db"), '', function (err) {
        if (err) {
            console.error("Can Not Crate lite.db")
        } else {
            console.log('File is created successfully.');
        }
    });
}


db = new sqlite3.Database(join(__dirname, "lite.db"), (err) => {
    if (err) {
        console.log(err, "CONNECT ERROR");
        return false;
    } else {

        return true;
    }
});

createTable()

function createTable() {
    if (db) {
        const sql = `
    CREATE TABLE IF NOT EXISTS user(
        id VARCHAR(15) PRIMARY KEY ,
        uname VARCHAR(30) NOT NULL,
        email VARCHAR(30) NOT NULL UNIQUE,
        pwd VARCHAR(30) NOT NULL,
        dat DATETIME 
    );`;
        const sql1 = `CREATE TABLE IF NOT EXISTS request(
        targetid VARCHARR(19) PRIMARY KEY,
        uid VARCHAR(50),
        username VARCHAR(50) NOT NULL ,
        meetingid VARCHAR(50) NOT NULL,
        passcode VARCHAR(10) NOT NULL,
        email VARCHAR(50),
        timestamp datetime,
        state BOOLEAN DEFAULT 1,
        down VARCHAR(500),
        view VARCHAR(500),
        FOREIGN KEY(uid) REFERENCES user(id)
    );`;
        db.run(sql, (err) => {
            if (err) {
                console.log(err);
            }
        });
        db.run(sql1, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }



}


function setLinks(id,down,view,callback){
    try {
        var sql = `UPDATE request SET down=? AND view=? WHERE targetid=?`
        db.run(sql, [down,view,id], callback);

    } catch (e) {
        console.error("Database Error" + e)
    }
}

function getRows(uid, callback) {
    var sql = `SELECT * FROM request WHERE uid=?`;
    db.all(sql, [uid], callback)
}

function setUpdate(action, id, callback) {
    try {
        var sql = `UPDATE request SET state = ? WHERE targetid=?`
        db.run(sql, [action, id], callback);

    } catch (e) {
        console.error("Database Error" + e)
    }
}

async function addUser(uid, uname, email, pwd, callback) {
    try {
        var sql = `INSERT INTO user 
    (id,uname,email,pwd,dat)
    VALUES(?,?,?,?,?)`;
        return db.run(sql, [uid, uname, email, pwd, new Date().toString()], callback);

    } catch (e) {
        console.error("Database Error" + e)
    }
}


function addRequest(tid, uid, uname, mid, p, e, callback) {
    try {
        var sql = `INSERT INTO request 
    (targetid,uid,username,meetingid,passcode,email,timestamp)
    VALUES(?,?,?,?,?,?,?)`;
        db.run(sql, [tid, uid, uname, mid, p, e, new Date().toString()], callback);

    } catch (e) {
        console.error("Database Error" + e)
    }
}

async function checkLogin(email, pwd, callback) {
    var sql = `SELECT id FROM user WHERE email=? AND pwd=?`;
    var a = db.get(sql, [email, pwd], callback);
}




module.exports.addRequest = addRequest;
module.exports.addUser = addUser;
module.exports.setUpdate = setUpdate;
module.exports.checkLogin = checkLogin;
module.exports.getRows = getRows;
module.exports.setLinks = setLinks;