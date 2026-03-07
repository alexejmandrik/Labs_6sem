const fs = require('fs');

const polishAlphabet = "aąbcćdeęfghijklłmnńoóprsśtuwyzźż";
const bulgarianAlphabet = "абвгдежзийклмнопрстуфхцчшщъьюя";

function calculateEntropy(text, alphabet) {
    const freq = {};
    const lowerText = text.toLowerCase();

    for (const char of alphabet) {
        freq[char] = 0;
    }

    let total = 0;
    for (const char of lowerText) {
        if (alphabet.includes(char)) {
            freq[char]++;
            total++;
        }
    }

    const probs = {};
    for (const char of alphabet) {
        probs[char] = freq[char] / total;
    }

    let H = 0;
    for (const char of alphabet) {
        if (probs[char] > 0) {
            H -= probs[char] * Math.log2(probs[char]);
        }
    }

    return { entropy: H, frequencies: freq, probabilities: probs };
}

function calculateBinaryEntropyFromText(text) {
    let binaryString = '';
    for (const char of text) {
        const code = char.charCodeAt(0);
        binaryString += code.toString(2).padStart(8, '0'); 
    }


    let count0 = 0, count1 = 0;
    for (const bit of binaryString) {
        if (bit === '0') count0++;
        else count1++;
    }

    const total = count0 + count1;
    const p0 = count0 / total;
    const p1 = count1 / total;

    const H = -(p0 * Math.log2(p0 || 1) + p1 * Math.log2(p1 || 1));

    return { H, p0, p1, count0, count1 };
}

function calculateInformation(entropy, messageLength) {
    return entropy * messageLength;
}

function entropyWithBitError(pError) {
    if (pError === 0 || pError === 1) return 0;
    return -( (1 - pError) * Math.log2(1 - pError) + pError * Math.log2(pError) );
}

function readFileAndCalculate(filename, alphabet, lang, fullName) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            console.error(`Ошибка при чтении файла ${filename}:`, err);
            return;
        }

        const resultAlphabet = calculateEntropy(data, alphabet);
        console.log(`\n  === ${lang} (алфавит) ===`);
        console.log('  Энтропия H =', resultAlphabet.entropy.toFixed(4), 'бит/символ');
        console.log('  Частоты символов:', resultAlphabet.frequencies);
        console.log('  Вероятности символов:', resultAlphabet.probabilities);

        const resultBinary = calculateBinaryEntropyFromText(data);
        console.log(`\n  === ${lang} (бинарный код ASCII) ===`);
        console.log('  Энтропия H =', resultBinary.H.toFixed(4), 'бит/бит');
        console.log('  Вероятности: p0 =', resultBinary.p0.toFixed(4), ', p1 =', resultBinary.p1.toFixed(4));
        console.log('  Частоты: 0 =', resultBinary.count0, ', 1 =', resultBinary.count1);

        const messageLength = fullName.length;
        const infoAlphabet = calculateInformation(resultAlphabet.entropy, messageLength);
        const infoBinary = calculateInformation(resultBinary.H, messageLength * 8); // 8 бит на символ ASCII
        console.log(`\n   Количество информации в сообщении "${fullName}":`);
        console.log(`   - по алфавиту: I = ${infoAlphabet.toFixed(4)} бит`);
        console.log(`   - в бинарном коде ASCII: I = ${infoBinary.toFixed(4)} бит`);

        const errors = [0.1, 0.5, 1.0];
        console.log(`\n   Количество информации с ошибками передачи бита:`);
        errors.forEach(p => {
            const H_error = resultBinary.H * (1 - entropyWithBitError(p));
            console.log(`    p = ${p}: I = ${(H_error * messageLength * 8).toFixed(4)} бит`);
        });
    });
}

const polishFile = 'polish.txt';
const bulgarianFile = 'bulgarian.txt';
const myFullName = 'Mandrik Aliaksei Ivanovich';

readFileAndCalculate(polishFile, polishAlphabet, 'Польский', myFullName);
readFileAndCalculate(bulgarianFile, bulgarianAlphabet, 'Болгарский', myFullName);