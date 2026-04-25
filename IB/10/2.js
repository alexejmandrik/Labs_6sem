const crypto = require("crypto");

// =======================
// BASE64 + ASCII
// =======================

function textToBase64(text) {
    return Buffer.from(text, "utf8").toString("base64");
}

function base64ToText(base64) {
    return Buffer.from(base64, "base64").toString("utf8");
}

// =======================
// RSA
// =======================

function generateRSA() {
    return crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "pkcs1",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs1",
            format: "pem"
        }
    });
}

function rsaEncrypt(text, publicKey) {
    const start = process.hrtime.bigint();

    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(text));

    const end = process.hrtime.bigint();

    return {
        data: encrypted.toString("base64"),
        time: Number(end - start) / 1e6
    };
}

function rsaDecrypt(encryptedBase64, privateKey) {
    const start = process.hrtime.bigint();

    const decrypted = crypto.privateDecrypt(
        privateKey,
        Buffer.from(encryptedBase64, "base64")
    );

    const end = process.hrtime.bigint();

    return {
        data: decrypted.toString(),
        time: Number(end - start) / 1e6
    };
}

// =======================
// EL-GAMAL
// =======================

function modExp(base, exp, mod) {
    let result = 1n;
    base = BigInt(base) % BigInt(mod);

    while (exp > 0n) {
        if (exp % 2n === 1n)
            result = (result * base) % BigInt(mod);

        exp = exp / 2n;
        base = (base * base) % BigInt(mod);
    }
    return result;
}

function generateElGamalParams() {
    const p = 30803n;
    const g = 2n;
    const x = 12345n;
    const y = modExp(g, x, p);

    return { p, g, x, y };
}

function elgamalEncrypt(text, params) {
    const start = process.hrtime.bigint();

    const { p, g, y } = params;
    let encrypted = [];

    for (let i = 0; i < text.length; i++) {
        const m = BigInt(text.charCodeAt(i));
        const k = 7n;

        const a = modExp(g, k, p);
        const b = (modExp(y, k, p) * m) % p;

        encrypted.push({ a: a.toString(), b: b.toString() });
    }

    const end = process.hrtime.bigint();

    return {
        data: encrypted,
        time: Number(end - start) / 1e6
    };
}

function elgamalDecrypt(cipher, params) {
    const start = process.hrtime.bigint();

    const { p, x } = params;

    let text = "";

    for (let block of cipher) {
        const a = BigInt(block.a);
        const b = BigInt(block.b);

        const s = modExp(a, x, p);
        const inv = modExp(s, p - 2n, p);

        const m = (b * inv) % p;

        text += String.fromCharCode(Number(m));
    }

    const end = process.hrtime.bigint();

    return {
        data: text,
        time: Number(end - start) / 1e6
    };
}

// =======================
// ОСНОВНОЙ ЗАПУСК
// =======================

const fio = "МАНДРИКАЛЕКСЕЙИВАНОВИЧ";

// Base64
const base64 = textToBase64(fio);

// RSA
const rsa = generateRSA();
const rsaEnc = rsaEncrypt(base64, rsa.publicKey);
const rsaDec = rsaDecrypt(rsaEnc.data, rsa.privateKey);

// ElGamal
const elgamalParams = generateElGamalParams();
const elEnc = elgamalEncrypt(fio, elgamalParams);
const elDec = elgamalDecrypt(elEnc.data, elgamalParams);

// =======================
// ВЫВОД
// =======================

console.log("\n===== ИСХОДНЫЙ ТЕКСТ =====");
console.log(fio);
console.log("Размер исходного текста (байт):", Buffer.from(fio, "utf8").length);

console.log("\n===== BASE64 =====");
console.log(base64);
console.log("Размер Base64 (байт):", Buffer.from(base64, "utf8").length);

// ---------- RSA ----------
const rsaOriginalSize = Buffer.from(base64, "utf8").length;
const rsaEncryptedSize = Buffer.from(rsaEnc.data, "utf8").length;

console.log("\n===== RSA КЛЮЧИ =====");
console.log("Публичный ключ:\n", rsa.publicKey);
console.log("Закрытый ключ:\n", rsa.privateKey);

console.log("\n===== RSA ШИФРОВАНИЕ =====");
console.log("Зашифрованное сообщение:\n", rsaEnc.data);

console.log("\n===== RSA РАСШИФРОВАНИЕ =====");
console.log("Расшифрованное сообщение:\n", base64ToText(rsaDec.data));

console.log("\nВремя шифрования:", rsaEnc.time.toFixed(3), "ms");
console.log("Время расшифрования:", rsaDec.time.toFixed(3), "ms");

console.log("\nРазмеры:");
console.log("Исходный (Base64):", rsaOriginalSize, "байт");
console.log("Зашифрованный:", rsaEncryptedSize, "байт");
console.log(
    "Коэффициент увеличения:",
    (rsaEncryptedSize / rsaOriginalSize).toFixed(2)
);

// ---------- EL-GAMAL ----------
const elOriginalSize = Buffer.from(fio, "utf8").length;
const elEncryptedSize = Buffer.from(JSON.stringify(elEnc.data), "utf8").length;

console.log("\n===== EL-GAMAL ПАРАМЕТРЫ =====");
console.log("p =", elgamalParams.p.toString());
console.log("g =", elgamalParams.g.toString());
console.log("x (секретный) =", elgamalParams.x.toString());
console.log("y (открытый) =", elgamalParams.y.toString());

console.log("\n===== EL-GAMAL ШИФРОВАНИЕ =====");
console.log("Зашифрованное сообщение:");
console.log(elEnc.data);

console.log("\n===== EL-GAMAL РАСШИФРОВАНИЕ =====");
console.log("Расшифрованное сообщение:");
console.log(elDec.data);

console.log("\nВремя шифрования:", elEnc.time.toFixed(3), "ms");
console.log("Время расшифрования:", elDec.time.toFixed(3), "ms");

console.log("\nРазмеры:");
console.log("Исходный:", elOriginalSize, "байт");
console.log("Зашифрованный:", elEncryptedSize, "байт");
console.log(
    "Коэффициент увеличения:",
    (elEncryptedSize / elOriginalSize).toFixed(2)
);

// ---------- СРАВНЕНИЕ ----------
console.log("\n===== СРАВНЕНИЕ =====");
console.log(
    rsaEnc.time < elEnc.time
        ? "RSA работает быстрее"
        : "ElGamal работает быстрее"
);