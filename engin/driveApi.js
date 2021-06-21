const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { clear } = require('winston');



const client_id = "773823563078-g6qkqdd05ir2bfbpc1381e12lfoult8c.apps.googleusercontent.com";
const client_secret = 'jwfHymfvEiqRoyw1tLAfkJyZ';
const redirect_uri = 'https://developers.google.com/oauthplayground';
const token = "1//04mYHgtn1HwkzCgYIARAAGAQSNwF-L9IrTkp4QR7oy6W1QOFY3OxNr-mQF1GzPKUdo1Tvg4Ec9rflIvmt-X5Rxm4RVvgMR--VCbA"
const oAuth2Client = new google.auth.OAuth2(
  client_id, client_secret, redirect_uri);
oAuth2Client.setCredentials({ refresh_token: token });

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

function list_file() {
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}


module.exports.createFile = async function createFile(path,name) {
  var file_metadata = {
    'name': name,
    //'parents': ['0AKrijdxDJ9bWUk9PVA']
  };
  var media = {
    body: fs.createReadStream(path)
  };
  console.log("CREATE FILE",path);

  return new Promise((resolve, reject) => {
    drive.files.create({
      resource: file_metadata,
      media: media,
      supportsAllDrives: true,
      fields: 'id',

    }, function (err, file) {
      if (err) {
        // Handle error
        reject(err);
        console.error(err);
      } else {
        resolve(file.data.id);
        console.log('File Id: ', file.data.id , path);
      }

    });
  });
}


module.exports.genaratepulicurl = async function genaratepulicurl(id) {
  await drive.permissions.create({
    fileId: id,
    supportsAllDrives: true,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  });
  const link = await drive.files.get({
    fileId: id,
    supportsAllDrives: true,
    fields: 'webViewLink,webContentLink'
  })
  console.log(link.data);
  return link.data;
}


