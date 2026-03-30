const express = require('express');
const crypto = require('crypto');

const app = express();
const sessions = {};

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

app.get('/', (req, res) => {
    const sessionId = crypto.randomUUID();

    sessions[sessionId] = true;

    res.json({
        sessionId,
        publicKey: publicKey.export({ type: 'pkcs1', format: 'pem' })
    });
});

function signData(data) {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();

    return sign.sign(privateKey, 'hex');
}

app.get('/resource', (req, res) => {
    const sessionId = req.query.sessionId;

    if (!sessions[sessionId]) {
        return res.status(409).send("Protocol error");
    }

    const text = "Мандрик Алексей Иванович";

    const signature = signData(text);

    res.json({
        data: text,
        signature
    });
});

app.listen(3000, () => console.log("Server started"));