const axios = require('axios');
const crypto = require('crypto');

let sessionId;
let publicKey;

async function init() {
    const res = await axios.get('http://localhost:3000/');

    sessionId = res.data.sessionId;
    publicKey = res.data.publicKey;
}

function verifySignature(data, signature, publicKey) {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();

    return verify.verify(publicKey, signature, 'hex');
}

async function getResource() {
    const res = await axios.get('http://localhost:3000/resource', {
        params: { sessionId }
    });

    const { data, signature } = res.data;

    console.log("Получено сообщение:", data);

    const isValid = verifySignature(data, signature, publicKey);

    if (isValid) {
        console.log("Подпись ВЕРНА");
    } else {
        console.log("Подпись НЕВЕРНА");
    }
}

(async () => {
    await init();
    await getResource();
})();