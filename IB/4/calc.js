const fs = require('fs');
const readline = require('readline');

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
    text = text.toUpperCase();

    const tokens = text.split(/(\s+|[.,!?;:–-])/);
    let result = [];

    for (let token of tokens) {

        // если это не слово — оставить как есть
        if (!/^[A-ZĄĆĘŁŃÓŚŹŻ]+$/.test(token)) {
            result.push(token);
            continue;
        }

        let word = token;

        if (word.length % 2 !== 0) {
            word += 'A';
        }

        let encodedWord = '';

        for (let i = 0; i < word.length; i += 2) {
            const a = alphabet.indexOf(word[i]);
            const b = alphabet.indexOf(word[i + 1]);

            const value = a * N + b + 1;

            // БЕЗ пробелов
            encodedWord += value.toString().padStart(4, '0');
        }

        result.push(encodedWord);
    }

    return result.join('');
}

function portaDecrypt(text) {
    let result = '';

    const tokens = text.split(/(\s+|[.,!?;:–-])/);

    for (let token of tokens) {

        // если это не цифры — оставляем как есть
        if (!/^\d+$/.test(token)) {
            result += token;
            continue;
        }

        // разбиваем по 4 цифры
        for (let i = 0; i < token.length; i += 4) {
            const code = token.substring(i, i + 4);

            if (code.length < 4) continue;

            const value = parseInt(code) - 1;

            const a = Math.floor(value / N);
            const b = value % N;

            result += alphabet[a] + alphabet[b];
        }
    }

    return result;
}

//Вероятность
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

function digitFrequencyAnalysis(text) {
    const freq = {};
    let total = 0;

    // цифры от 0 до 9
    for (let i = 0; i <= 9; i++) {
        freq[i] = 0;
    }

    for (let char of text) {
        if (/[0-9]/.test(char)) {
            freq[char]++;
            total++;
        }
    }

    const probabilities = {};
    for (let digit in freq) {
        probabilities[digit] = total > 0 ? freq[digit] / total : 0;
    }

    return probabilities;
}

function printProbabilities(prob) {
    console.log("\n=== Вероятности ===");
    for (let char in prob) {
        console.log(`${char}: ${prob[char].toFixed(5)}`);
    }
}

// ВРЕМЯ
function measureTime(fn, text) {
    const start = Date.now();
    const result = fn(text);
    const end = Date.now();
    return {
        result,
        time: end - start
    };
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n===== МЕНЮ =====");
console.log("1 - Зашифровать input.txt");
console.log("2 - Расшифровать все файлы");
console.log("0 - Выход");

rl.question("Выберите действие: ", (choice) => {

    switch (choice) {

        case "1": {
            const inputText = fs.readFileSync('input.txt', 'utf-8').toUpperCase();

            const caesarEnc = measureTime(caesarEncrypt, inputText);
            const portaEnc = measureTime(portaEncrypt, inputText);

            fs.writeFileSync('caesar_encrypted.txt', caesarEnc.result);
            fs.writeFileSync('porta_encrypted.txt', portaEnc.result);

            console.log("\n    === ГОТОВО ===");
            console.log("    Цезарь (время):", caesarEnc.time, "мс");
            console.log("    Порта (время):", portaEnc.time, "мс");

            const probOriginal = frequencyAnalysis(inputText);
            const probCaesar = frequencyAnalysis(caesarEnc.result);

            console.log("\n    --- Вероятности исходного текста ---");
            printProbabilities(probOriginal);

            console.log("\n    --- Вероятности текста после Цезаря ---");
            printProbabilities(probCaesar);


            const probPortaDigits = digitFrequencyAnalysis(portaEnc.result);

            console.log("\n    --- Вероятности цифр (Порта) ---");
            printProbabilities(probPortaDigits);

            break;
        }

        case "2": {
            // Читаем оба файла
            const caesarText = fs.readFileSync('caesar_encrypted.txt', 'utf-8');
            const portaText = fs.readFileSync('porta_encrypted.txt', 'utf-8');

            // Дешифрование с измерением времени
            const caesarDec = measureTime(caesarDecrypt, caesarText);
            const portaDec = measureTime(portaDecrypt, portaText);

            // Запись результатов
            fs.writeFileSync('caesar_decrypted.txt', caesarDec.result);
            fs.writeFileSync('porta_decrypted.txt', portaDec.result);

            console.log("\n    === ДЕШИФРОВАНО ===");
            console.log("    Цезарь (время):", caesarDec.time, "мс");
            console.log("    Порта (время):", portaDec.time, "мс");

            break;
        }

        case "0":
            console.log("    Выход...");
            break;

        default:
            console.log("    Неверный выбор");
    }

    rl.close();
});