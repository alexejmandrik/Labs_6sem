const fs = require('fs');
const readline = require('readline');

const alphabet = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ";

// ======================
// МАРШРУТНАЯ ПЕРЕСТАНОВКА
// ======================
function routeEncrypt(text, rows, cols) {
    // Дополняем текст пробелами, чтобы заполнить таблицу
    while (text.length < rows * cols) text += ' ';
    let table = [];
    // Заполняем таблицу по столбцам
    for (let r = 0; r < rows; r++) {
        table[r] = [];
        for (let c = 0; c < cols; c++) {
            table[r][c] = text[c * rows + r];
        }
    }
    // Читаем таблицу по строкам
    let result = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            result += table[r][c];
        }
    }
    return result;
}

function routeDecrypt(text, rows, cols) {
    let table = [];
    let index = 0;
    // Заполняем таблицу по строкам
    for (let r = 0; r < rows; r++) {
        table[r] = [];
        for (let c = 0; c < cols; c++) {
            table[r][c] = text[index++];
        }
    }
    // Читаем по столбцам
    let result = '';
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            result += table[r][c];
        }
    }
    return result.trim();
}

// ======================
// МНОЖЕСТВЕННАЯ ПЕРЕСТАНОВКА
// ======================
function getOrder(key) {
    return key
        .split('')
        .map((char, index) => ({ char, index }))
        .sort((a, b) => a.char.localeCompare(b.char))
        .map((item, i) => ({ ...item, order: i }))
        .sort((a, b) => a.index - b.index)
        .map(item => item.order);
}

function singlePermutation(text, key) {
    const cols = key.length;
    const rows = Math.ceil(text.length / cols);

    while (text.length < rows * cols) text += ' ';

    let table = [];
    let index = 0;

    for (let r = 0; r < rows; r++) {
        table[r] = [];
        for (let c = 0; c < cols; c++) {
            table[r][c] = text[index++];
        }
    }

    const order = getOrder(key);

    let result = '';
    for (let i = 0; i < cols; i++) {
        const colIndex = order.indexOf(i);
        for (let r = 0; r < rows; r++) {
            result += table[r][colIndex];
        }
    }

    return result;
}

function multiplePermutationEncrypt(text, key1, key2) {
    const first = singlePermutation(text, key1);
    return singlePermutation(first, key2);
}
function singlePermutationDecrypt(text, key) {
    const cols = key.length;
    const rows = Math.ceil(text.length / cols);

    let table = Array.from({ length: rows }, () => Array(cols).fill(''));

    const order = getOrder(key);

    let index = 0;

    // Заполняем столбцы в порядке ключа
    for (let i = 0; i < cols; i++) {
        const colIndex = order.indexOf(i);
        for (let r = 0; r < rows; r++) {
            table[r][colIndex] = text[index++];
        }
    }

    // Читаем по строкам
    let result = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            result += table[r][c];
        }
    }

    return result.trim();
}

function multiplePermutationDecrypt(text, key1, key2) {
    const first = singlePermutationDecrypt(text, key2);
    return singlePermutationDecrypt(first, key1);
}

// ======================
// ЧАСТОТА СИМВОЛОВ
// ======================
function frequencyAnalysis(text) {
    const freq = {};
    let total = 0;

    for (let char of alphabet) freq[char] = 0;

    for (let char of text) {
        if (freq.hasOwnProperty(char)) {
            freq[char]++;
            total++;
        }
    }

    const probabilities = {};
    for (let char in freq) {
        probabilities[char] = total > 0 ? freq[char] / total : 0;
    }

    return probabilities;
}

function printProbabilities(prob) {
    console.log("\n   === Частота символов ===");
    for (let char in prob) {
        console.log(`${char}: ${prob[char].toFixed(5)}`);
    }
}

// ======================
// ИЗМЕРЕНИЕ ВРЕМЕНИ
// ======================
function measureTime(fn, ...args) {
    const start = Date.now();
    const result = fn(...args);
    const end = Date.now();
    return { result, time: end - start };
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n   ===== МЕНЮ =====");
console.log("   1 - Зашифровать input.txt");
console.log("   2 - Расшифровать файлы");
console.log("   0 - Выход");

rl.question("   Выберите действие: ", (choice) => {

    switch (choice) {
        case "1": {
            const inputText = fs.readFileSync('input.txt', 'utf-8').toUpperCase();

            const routeEnc = measureTime(routeEncrypt, inputText, 10, Math.ceil(inputText.length / 10));
            const multiEnc = measureTime(multiplePermutationEncrypt, inputText, 'ALIAKSEI', 'MANDRIK');

            fs.writeFileSync('route_encrypted.txt', routeEnc.result);
            fs.writeFileSync('multi_encrypted.txt', multiEnc.result);

            console.log("\n   === ГОТОВО ===");
            console.log("   Маршрутная перестановка (время):", routeEnc.time, "мс");
            console.log("   Множественная перестановка (время):", multiEnc.time, "мс");

            printProbabilities(frequencyAnalysis(inputText));
            printProbabilities(frequencyAnalysis(routeEnc.result));
            printProbabilities(frequencyAnalysis(multiEnc.result));
            break;
        }

        case "2": {
            const routeText = fs.readFileSync('route_encrypted.txt', 'utf-8');
            const multiText = fs.readFileSync('multi_encrypted.txt', 'utf-8');

            const routeDec = measureTime(routeDecrypt, routeText, 10, Math.ceil(routeText.length / 10));
            const multiDec = measureTime(multiplePermutationDecrypt, multiText, 'ALIAKSEI', 'MANDRIK');

            fs.writeFileSync('route_decrypted.txt', routeDec.result);
            fs.writeFileSync('multi_decrypted.txt', multiDec.result);

            console.log("\n    === ДЕШИФРОВАНО ===");
            console.log("    Маршрутная перестановка (время):", routeDec.time, "мс");
            console.log("    Множественная перестановка (время):", multiDec.time, "мс");
            break;
        }

        case "0":
            console.log("Выход...");
            break;

        default:
            console.log("Неверный выбор");
    }

    rl.close();
});