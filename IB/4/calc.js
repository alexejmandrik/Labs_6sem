const fs = require('fs');
const readline = require('readline');

// Польский алфавит
const alphabet = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ";
const N = alphabet.length;

// ======================
// ШИФР ЦЕЗАРЯ (k = 28)
// ======================
const k = 28;

function caesarEncrypt(text) {
    return text.split('').map(char => {
        const index = alphabet.indexOf(char);
        if (index === -1) return char;
        const y = (index + k) % N;
        return alphabet[y];
    }).join('');
}

function caesarDecrypt(text) {
    return text.split('').map(char => {
        const index = alphabet.indexOf(char);
        if (index === -1) return char;
        const x = (index - k + N) % N;
        return alphabet[x];
    }).join('');
}

// ======================
// ШИФР ПОРТЫ
// ======================
function portaEncrypt(text) {
    let result = [];
    if (text.length % 2 !== 0) text += 'A';

    for (let i = 0; i < text.length; i += 2) {
        const a = alphabet.indexOf(text[i]);
        const b = alphabet.indexOf(text[i + 1]);

        if (a === -1 || b === -1) {
            result.push(text[i] + text[i + 1]);
            continue;
        }

        const value = a * N + b + 1;
        result.push(value.toString().padStart(4, '0'));
    }
    return result.join(' ');
}

function portaDecrypt(text) {
    return text.split(' ').map(code => {
        const value = parseInt(code) - 1;
        const a = Math.floor(value / N);
        const b = value % N;
        return alphabet[a] + alphabet[b];
    }).join('');
}

// ======================
// ВЕРОЯТНОСТИ
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
    console.log("\n=== Вероятности ===");
    for (let char in prob) {
        console.log(`${char}: ${prob[char].toFixed(5)}`);
    }
}

// ======================
// ВРЕМЯ
// ======================
function measureTime(fn, text) {
    const start = Date.now();
    const result = fn(text);
    const end = Date.now();
    return {
        result,
        time: end - start
    };
}

// ======================
// МЕНЮ
// ======================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n===== МЕНЮ =====");
console.log("1 - Зашифровать input.txt");
console.log("2 - Расшифровать caesar_encrypted.txt");
console.log("3 - Расшифровать porta_encrypted.txt");
console.log("0 - Выход");

rl.question("Выберите действие: ", (choice) => {

    switch (choice) {

        case "1": {
            const inputText = fs.readFileSync('input.txt', 'utf-8').toUpperCase();

            const caesarEnc = measureTime(caesarEncrypt, inputText);
            const portaEnc = measureTime(portaEncrypt, inputText);

            fs.writeFileSync('caesar_encrypted.txt', caesarEnc.result);
            fs.writeFileSync('porta_encrypted.txt', portaEnc.result);

            console.log("\n=== ГОТОВО ===");
            console.log("Цезарь (время):", caesarEnc.time, "мс");
            console.log("Порта (время):", portaEnc.time, "мс");

            const probOriginal = frequencyAnalysis(inputText);
            const probCaesar = frequencyAnalysis(caesarEnc.result);

            console.log("\n--- Вероятности исходного текста ---");
            printProbabilities(probOriginal);

            console.log("\n--- Вероятности текста после Цезаря ---");
            printProbabilities(probCaesar);

            break;
        }

        case "2": {
            const text = fs.readFileSync('caesar_encrypted.txt', 'utf-8');
            const result = measureTime(caesarDecrypt, text);
            fs.writeFileSync('caesar_decrypted.txt', result.result);
            console.log("\n=== ДЕШИФРОВАНО ===");
            console.log("Время:", result.time, "мс");
            break;
        }

        case "3": {
            const text = fs.readFileSync('porta_encrypted.txt', 'utf-8');
            const result = measureTime(portaDecrypt, text);
            fs.writeFileSync('porta_decrypted.txt', result.result);
            console.log("\n=== ДЕШИФРОВАНО ===");
            console.log("Время:", result.time, "мс");
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