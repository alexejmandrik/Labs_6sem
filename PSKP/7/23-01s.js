const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const sessions = {};

function createDH() {
    const dh = crypto.createDiffieHellman(2048);
    dh.generateKeys();

    return {
        p: dh.getPrime('hex'),
        g: dh.getGenerator('hex'),
        A: dh.getPublicKey('hex'),
        dh
    };
}

app.get('/', (req, res) => {
    const { p, g, A, dh } = createDH();
    const sessionId = crypto.randomUUID();

    sessions[sessionId] = { dh };

    res.json({ p, g, A, sessionId });
});

app.post('/key', (req, res) => {
    const { sessionId, B } = req.body;

    if (!sessions[sessionId]) {
        return res.status(409).send("Protocol error");
    }

    try {
        const dh = sessions[sessionId].dh;
        const key = dh.computeSecret(B, 'hex');

        sessions[sessionId].key = key;

        res.sendStatus(200);
    } catch {
        res.status(409).send("DH error");
    }
});

function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        crypto.createHash('sha256').update(key).digest(),
        iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return { iv: iv.toString('hex'), data: encrypted };
}

app.get('/resource', (req, res) => {
    const sessionId = req.query.sessionId;

    if (!sessions[sessionId] || !sessions[sessionId].key) {
        return res.status(409).send("No key");
    }

    const key = sessions[sessionId].key;

    const text = "Mandrik Aliaksei Ivanovich";

    const encrypted = encrypt(text, key);

    res.json(encrypted);
});

app.listen(3000, () => console.log("Server running on 3000"));