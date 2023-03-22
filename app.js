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
    
      socket.on('Modul1', function (data) {

        var sql = "";

        if (data.status == "0") {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul1', 'OFF', '${timee}', '${datee}')`;
        }
        else {
          sql = `INSERT INTO Status (moduls, status, time, date) VALUES ('Modul1', 'ON', '${timee}', '${datee}')`;
        }
        db.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });

        console.log(data);
        serialPort.write(data.status);
      });
  
      socket.on('Modul2', function (data) {
        console.log(data);
        serialPort.write(data.status);
      });
  
      socket.on('Modul3', function (data) {
        console.log(data);
        serialPort.write(data.status);
      });
  
      socket.on('Modul4', function (data) {
        console.log(data);
        serialPort.write(data.status);
      });
  
      socket.on('Modul5', function (data) {
        console.log(data);
        serialPort.write(data.status);
      });
    });
  });
});