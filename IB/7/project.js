const forge = require('node-forge');

const BLOCK_SIZE = 8;
const KEY_TEXT = "МАНДРИКА";
const INPUT_TEXT = "МАНДРИКАЛЕКСЕЙИВАНОВИЧ";

function splitIntoBlocks(data, blockSize) {
    const buffer = Buffer.from(data, 'utf-8');
    const blocks = [];

    for (let i = 0; i < buffer.length; i += blockSize) {
        let block = buffer.slice(i, i + blockSize);

        if (block.length < blockSize) {
            const padding = Buffer.alloc(blockSize - block.length, 0);
            block = Buffer.concat([block, padding]);
        }

        blocks.push(block);
    }

    return blocks;
}

function prepareEDE2Key(textKey) {
    const buf = Buffer.from(textKey, 'utf-8');

    const k1 = Buffer.alloc(8, 0);
    const k2 = Buffer.alloc(8, 0x55);

    buf.copy(k1, 0, 0, Math.min(buf.length, 8));

    const finalKey = Buffer.concat([k1, k2, k1]);
    return finalKey.toString('binary');
}

function processDES(block, key, encrypt = true) {
    const cipher = encrypt
        ? forge.cipher.createCipher('3DES-ECB', key)
        : forge.cipher.createDecipher('3DES-ECB', key);

    cipher.start();
    cipher.update(forge.util.createBuffer(block.toString('binary')));
    cipher.finish();

    return Buffer.from(cipher.output.getBytes(), 'binary');
}

function countDiffBits(buf1, buf2) {
    let diff = 0;

    for (let i = 0; i < buf1.length; i++) {
        let xor = buf1[i] ^ buf2[i];

        while (xor > 0) {
            diff += xor & 1;
            xor >>= 1;
        }
    }

    return diff;
}

function countDiffChars(str1, str2) {
    let diff = 0;

    for (let i = 0; i < str1.length; i++) {
        if (str1[i] !== str2[i]) diff++;
    }

    return diff;
}

// --- ОСНОВНАЯ ЛОГИКА ---

console.log("Исходный текст:", INPUT_TEXT);

const blocks = splitIntoBlocks(INPUT_TEXT, BLOCK_SIZE);
const key = prepareEDE2Key(KEY_TEXT);

// --- ШИФРОВАНИЕ ---
console.time("Шифрование");
const encrypted = blocks.map(b => processDES(b, key, true));
console.timeEnd("Шифрование");

// --- РАСШИФРОВАНИЕ ---
console.time("Расшифрование");
const decrypted = encrypted.map(b => processDES(b, key, false));
console.timeEnd("Расшифрование");

const decryptedText = Buffer.concat(decrypted)
    .toString('utf-8')
    .replace(/\0/g, '');

console.log("Расшифрованный текст:", decryptedText);

// --- ЛАВИННЫЙ ЭФФЕКТ ---
console.log("\n--- ЛАВИННЫЙ ЭФФЕКТ ---");

const originalBlock = blocks[0];
const originalEncrypted = encrypted[0];

for (let bit = 0; bit < 64; bit++) {
    let modifiedBlock = Buffer.from(originalBlock);

    const byteIndex = Math.floor(bit / 8);
    const bitIndex = bit % 8;

    modifiedBlock[byteIndex] ^= (1 << bitIndex);

    const modifiedEncrypted = processDES(modifiedBlock, key, true);

    const diffBits = countDiffBits(originalEncrypted, modifiedEncrypted);

    // ❗ переводим в строку для сравнения символов
    const originalStr = originalEncrypted.toString('hex');
    const modifiedStr = modifiedEncrypted.toString('hex');

    const diffChars = countDiffChars(originalStr, modifiedStr);

    if (bit % 8 === 0) {
        console.log(
            `Бит ${bit}: изменено бит = ${diffBits}, символов = ${diffChars}`
        );
    }
}

// --- СЛАБЫЕ КЛЮЧИ ---
console.log("\n--- СЛАБЫЕ КЛЮЧИ ---");

const weakKeys = [
    "0101010101010101",
    "1F1F1F1F1F1F1F1F"
];

weakKeys.forEach(wk => {
    const keyBuf = Buffer.from(wk + wk + wk, 'hex').toString('binary');

    const block = blocks[0];

    const enc1 = processDES(block, keyBuf, true);
    const enc2 = processDES(enc1, keyBuf, true);

    const isWeak = block.equals(enc2);

    console.log(`Ключ ${wk}: ${isWeak ? "СЛАБЫЙ" : "НЕ слабый"}`);

    // лавинный эффект
    const diff = countDiffBits(block, enc1);
    console.log(`Лавинный эффект (бит): ${diff}`);
});

// --- ПОЛУСЛАБЫЕ КЛЮЧИ ---
console.log("\n--- ПОЛУСЛАБЫЕ КЛЮЧИ ---");

const k1 = "01FE01FE01FE01FE";
const k2 = "FE01FE01FE01FE01";

const key1 = Buffer.from(k1 + k1 + k1, 'hex').toString('binary');
const key2 = Buffer.from(k2 + k2 + k2, 'hex').toString('binary');

const block = blocks[0];

const step1 = processDES(block, key1, true);
const step2 = processDES(step1, key2, true);

console.log(
    `Пара ключей: ${block.equals(step2) ? "ПОЛУСЛАБЫЕ" : "НЕ полуслабые"}`
);

// лавинный эффект
const diffSemi = countDiffBits(block, step1);
console.log(`Лавинный эффект (бит): ${diffSemi}`);

// --- ВЫВОД ШИФРА ---
console.log("\n--- ЗАШИФРОВАННЫЕ ДАННЫЕ ---");

encrypted.forEach((b, i) => {
    console.log(`Блок ${i}: ${b.toString('hex')}`);
});

console.log(
    "Общий HEX:",
    Buffer.concat(encrypted).toString('hex')
);