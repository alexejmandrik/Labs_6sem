openssl genrsa -out caMAI.key 2048

openssl req -x509 -new -nodes -key caMAI.key -sha256 -days 365 -out resourceMAI.crt -subj "/CN=CA-LAB22-MAI"


extMAI.cnf

subjectAltName = @alt_names
[alt_names]
DNS.1 = CA-LAB22-MAI
DNS.2 = MAI
IP.1 = 172.20.10.3


openssl x509 -req -in resourceHPO.csr -CA resourceMAI.crt -CAkey caMAI.key -CAcreateserial -out resourceHPO.crt -days 365 -sha256 -extfile extMAI.cnf









#2
openssl req -new -key caMAI.key -out resourceMAI.csr -subj "/CN=Resource-MAI"
Создаем файл extfile.cnf:
subjectAltName = DNS:CA-LAB22-HPO
iP.1 = 172.20.10.3



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
  res.send('Hello from 22-01 via HTTPS!');
});

https.createServer(options, app).listen(4433, () => {
  console.log('HTTPS server running on https://localhost:4433');
});





