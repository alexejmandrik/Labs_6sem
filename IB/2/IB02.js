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

function readFilesAndPrintPairs(polishFile, bulgarianFile, alphabetPolish, alphabetBulgarian, fullName) {
    fs.readFile(polishFile, 'utf8', (err1, polishData) => {
        if (err1) { console.error(err1); return; }

        fs.readFile(bulgarianFile, 'utf8', (err2, bulgarianData) => {
            if (err2) { console.error(err2); return; }

            const polishAlpha = calculateEntropy(polishData, alphabetPolish);
            const bulgarianAlpha = calculateEntropy(bulgarianData, alphabetBulgarian);

            console.log(`\n   === Количество встречаемости символов ===`);
            console.log(`\n   Польский:`);
            for (const char of alphabetPolish) {
                console.log(`'   ${char}': ${polishAlpha.frequencies[char]}`);
            }

            console.log(`\n   Болгарский:`);
            for (const char of alphabetBulgarian) {
                console.log(`'   ${char}': ${bulgarianAlpha.frequencies[char]}`);
            }

            console.log(`\n   === Вероятности встречаемости символов ===`);
            console.log(`\n   Польский:`);
            for (const char of alphabetPolish) {
                console.log(`'   ${char}': p = ${polishAlpha.probabilities[char].toFixed(4)}`);
            }

            console.log(`\n   Болгарский:`);
            for (const char of alphabetBulgarian) {
                console.log(`   '${char}': p = ${bulgarianAlpha.probabilities[char].toFixed(4)}`);
            }

            console.log(`\n   === Польский (алфавит) ===`);
            console.log(`   Энтропия H = ${polishAlpha.entropy.toFixed(4)} бит/символ`);
            console.log(`   === Болгарский (алфавит) ===`);
            console.log(`   Энтропия H = ${bulgarianAlpha.entropy.toFixed(4)} бит/символ`);

            const polishBin = calculateBinaryEntropyFromText(polishData);
            const bulgarianBin = calculateBinaryEntropyFromText(bulgarianData);

            console.log(`\n   === Польский (бинарный код ASCII) ===`);
            console.log(`   Энтропия H = ${polishBin.H.toFixed(4)} бит/бит`);
            console.log(`   Вероятности: p0 = ${polishBin.p0.toFixed(4)} , p1 = ${polishBin.p1.toFixed(4)}`);
            console.log(`   Частоты: 0 = ${polishBin.count0} , 1 = ${polishBin.count1}`);

            console.log(`\n   === Болгарский (бинарный код ASCII) ===`);
            console.log(`   Энтропия H = ${bulgarianBin.H.toFixed(4)} бит/бит`);
            console.log(`   Вероятности: p0 = ${bulgarianBin.p0.toFixed(4)} , p1 = ${bulgarianBin.p1.toFixed(4)}`);
            console.log(`   Частоты: 0 = ${bulgarianBin.count0} , 1 = ${bulgarianBin.count1}`);

            const infoPolishAlpha = calculateInformation(polishAlpha.entropy, fullName.length);
            const infoBulgarianAlpha = calculateInformation(bulgarianAlpha.entropy, fullName.length);

            const infoPolishBin = calculateInformation(polishBin.H, fullName.length * 8);
            const infoBulgarianBin = calculateInformation(bulgarianBin.H, fullName.length * 8);

            console.log(`\n   Количество информации в сообщении "${fullName}":`);
            console.log(`   - Польский по алфавиту: I = ${infoPolishAlpha.toFixed(4)} бит`);
            console.log(`   - Болгарский по алфавиту: I = ${infoBulgarianAlpha.toFixed(4)} бит`);
            console.log(`   - Польский в бинарном коде: I = ${infoPolishBin.toFixed(4)} бит`);
            console.log(`   - Болгарский в бинарном коде: I = ${infoBulgarianBin.toFixed(4)} бит`);

            const errors = [0.1, 0.5, 1.0];
            console.log(`\n   Количество информации с ошибками передачи бита:`);
            errors.forEach(p => {
                const H_polish_err = polishBin.H * (1 - entropyWithBitError(p));
                const H_bulgarian_err = bulgarianBin.H * (1 - entropyWithBitError(p));
                console.log(`   p = ${p}: Польский I = ${(H_polish_err * fullName.length * 8).toFixed(4)} бит, Болгарский I = ${(H_bulgarian_err * fullName.length * 8).toFixed(4)} бит`);
            });
        });
    });
}

readFilesAndPrintPairs('polish.txt', 'bulgarian.txt', polishAlphabet, bulgarianAlphabet, 'Mandrik Aliaksei Ivanovich');