const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();

const options = {
  key: fs.readFileSync('C:\\Users\\alexe\\caMAI.key'),
  cert: fs.readFileSync('C:\\Users\\alexe\\resourceMAI1.crt'),
  ca: fs.readFileSync('C:\\Users\\alexe\\resourceHPO.crt')
};

app.get('/', (req, res) => {
  res.send('Server MAI, Darova!');
});

https.createServer(options, app).listen(4433, () => {
  console.log('HTTPS server running on https://localhost:4433');
});
