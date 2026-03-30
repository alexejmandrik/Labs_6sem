const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

let sessionId, key;

async function init() {
    const res = await axios.get('http://localhost:3000/');

    const { p, g, A } = res.data;
    sessionId = res.data.sessionId;

    const dh = crypto.createDiffieHellman(
        Buffer.from(p, 'hex'),
        Buffer.from(g, 'hex')
    );

    dh.generateKeys();

    const B = dh.getPublicKey('hex');

    key = dh.computeSecret(A, 'hex');

    await axios.post('http://localhost:3000/key', {
        sessionId,
        B
    });
}

function decrypt(data, iv, key) {
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        crypto.createHash('sha256').update(key).digest(),
        Buffer.from(iv, 'hex')
    );

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

async function getResource() {
    const res = await axios.get('http://localhost:3000/resource', {
        params: { sessionId }
    });

    const { iv, data } = res.data;

    const text = decrypt(data, iv, key);

    fs.writeFileSync('student.txt', text);

    console.log("Файл сохранён:", text);
}

(async () => {
    await init();
    await getResource();
})();