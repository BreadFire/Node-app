const http = require('http');
const express = require('express');
const app = express();
const port = 1111;
const server = http.createServer(app);
const mysql = require('mysql');

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ""
});

var SerialPort = require('serialport');
const { time } = require('console');

const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
  delimiter: '\r\n'
});

var serialPort = new SerialPort('COM5', {
  baudRate: 115200,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});

serialPort.pipe(parser);

app.use(express.static('public'));

app.get('/', (req, res) => { 
  res.sendFile(__dirname + '/index.html');
  app.use('/resourses', express.static(__dirname + '/resourses'));
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  db.query("CREATE DATABASE Arduino_Moduls", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
  db.changeUser({database : "Arduino_Moduls"});
  var sql = "CREATE TABLE Status (moduls VARCHAR(255), status VARCHAR(255), time VARCHAR(255), date VARCHAR(255))";
  db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });

  var timee = "";
  var datee = "";

  function refreshTime() {
    const d = new Date();
    var month = d.getMonth() + 1;
    var minutes = d.getMinutes();
    if (month < 10) {month = "0" + month};
    if (minutes < 10) {minutes = "0" + minutes};
    timee = d.getHours() + ":" + minutes + ":" + d.getSeconds();
    datee = d.getDate() + "/" + month + "/" + d.getFullYear();
  }setInterval(refreshTime, 1000);

  server.listen (port, () => {

    console.log(`Server listening on port ${port}`);
    
    var io = require('socket.io').listen(server);
    
    io.on('connection', function (socket) {
    
      socket.on('Modul', function (data) {

        var sql = "";

        if (data.status == "0") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul1', 'OFF', '${timee}', '${datee}')`;
        }
        else if (data.status == "1") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul1', 'ON', '${timee}', '${datee}')`;
        }
        else if (data.status == "2") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul2', 'OFF', '${timee}', '${datee}')`;
        }
        else if (data.status == "3") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul2', 'ON', '${timee}', '${datee}')`;
        }
        else if (data.status == "4") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul3', 'OFF', '${timee}', '${datee}')`;
        }
        else if (data.status == "5") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul3', 'ON', '${timee}', '${datee}')`;
        }
        else if (data.status == "6") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul4', 'OFF', '${timee}', '${datee}')`;
        }
        else if (data.status == "7") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul4', 'ON', '${timee}', '${datee}')`;
        }
        else if (data.status == "8") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul5', 'OFF', '${timee}', '${datee}')`;
        }
        else if (data.status == "9") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul5', 'ON', '${timee}', '${datee}')`;
        }
        db.query(sql, function (err, result) {
          if (err) throw err;
          var modul = "";
          if(data.status == "0" || data.status == "1") {modul = "1"}
          else if(data.status == "2" || data.status == "3") {modul = "2"}
          else if(data.status == "4" || data.status == "5") {modul = "3"}
          else if(data.status == "6" || data.status == "7") {modul = "4"}
          else if(data.status == "8" || data.status == "9") {modul = "5"}
          console.log(`Modul: ${modul} status inserted`);
        });
        
        console.log(data);
        serialPort.write(data.status);
      });
    });
  });
});