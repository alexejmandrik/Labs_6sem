const n = 6;
const N = Math.pow(2, n); // 64

const key = [15, 14, 13, 12, 11, 10];
const text = "МАНДРИКАЛЕКСЕЙИВАНОВИЧ";

// преобразование строки в массив кодов
function stringToCodes(str) {
    return Array.from(str).map(c => c.charCodeAt(0));
}

// обратно
function codesToString(arr) {
    return arr.map(c => String.fromCharCode(c)).join("");
}

// KSA
function initS() {
    let S = [];
    let K = [];

    for (let i = 0; i < N; i++) {
        S[i] = i;
        K[i] = key[i % key.length];
    }

    let j = 0;

    for (let i = 0; i < N; i++) {
        j = (j + S[i] + K[i]) % N;
        [S[i], S[j]] = [S[j], S[i]];
    }

    return S;
}

// PRGA
function generateGamma(S, length) {
    let i = 0, j = 0;
    let gamma = [];

    for (let k = 0; k < length; k++) {
        i = (i + 1) % N;
        j = (j + S[i]) % N;

        [S[i], S[j]] = [S[j], S[i]];

        let t = (S[i] + S[j]) % N;
        gamma.push(S[t]);
    }

    return gamma;
}

// XOR
function xor(data, gamma) {
    return data.map((val, i) => val ^ gamma[i]);
}

// Шифрование
function rc4Encrypt() {
    let S = initS();

    let data = stringToCodes(text);

    console.time("Генерация гаммы");
    let gamma = generateGamma(S, data.length);
    console.timeEnd("Генерация гаммы");

    console.time("Шифрование");
    let encrypted = xor(data, gamma);
    console.timeEnd("Шифрование");

    console.log("Гамма:", gamma);
    console.log("Шифртекст:", encrypted);

    return encrypted;
}

// Расшифрование
function rc4Decrypt(cipher) {
    let S = initS();

    let gamma = generateGamma(S, cipher.length);
    let decrypted = xor(cipher, gamma);

    console.log("Расшифрованный текст:", codesToString(decrypted));
}

// запуск
let cipher = rc4Encrypt();
rc4Decrypt(cipher);