// =======================
// НОД
// =======================
function gcd(a, b) {
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

// =======================
// Обратный элемент по модулю
// =======================
function modInverse(a, m) {
    let m0 = m;
    let x0 = 0n, x1 = 1n;

    if (m === 1n) return 0n;

    while (a > 1n) {
        let q = a / m;
        [a, m] = [m, a % m];
        [x0, x1] = [x1 - q * x0, x0];
    }

    return x1 < 0n ? x1 + m0 : x1;
}

// =======================
// СВЕРХВОЗРАСТАЮЩАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ
// =======================
function generateSuperIncreasingSequence(n) {
    const seq = [];
    let sum = 1n;

    for (let i = 0; i < n; i++) {
        let next = sum + BigInt(Math.floor(Math.random() * 5) + 1);
        seq.push(next);
        sum += next;
    }

    return seq;
}

// =======================
// ГЕНЕРАЦИЯ КЛЮЧЕЙ
// =======================
function generateKeys(n) {
    const w = generateSuperIncreasingSequence(n);

    const sumW = w.reduce((a, b) => a + b, 0n);
    const q = sumW + 1n;

    let r = 2n;
    while (gcd(r, q) !== 1n) {
        r++;
    }

    const beta = w.map(wi => (wi * r) % q);

    return { w, q, r, beta };
}

// =======================
// ТЕКСТ -> БИТЫ
// =======================
function stringToBits(message, mode) {
    let bits = [];

    if (mode === "ASCII") {
        for (let ch of message) {
            bits.push(
                ...ch.charCodeAt(0)
                    .toString(2)
                    .padStart(8, "0")
                    .split("")
                    .map(Number)
            );
        }
    }

    if (mode === "Base64") {
        const b64 = Buffer.from(message, "utf8").toString("base64");

        for (let ch of b64) {
            bits.push(
                ...ch.charCodeAt(0)
                    .toString(2)
                    .padStart(8, "0")
                    .split("")
                    .map(Number)
            );
        }
    }

    return bits;
}

// =======================
// БИТЫ -> ТЕКСТ
// =======================
function bitsToString(bits, mode) {
    if (mode === "ASCII") {
        let res = "";
        for (let i = 0; i < bits.length; i += 8) {
            let byte = bits.slice(i, i + 8).join("");
            res += String.fromCharCode(parseInt(byte, 2));
        }
        return res;
    }

    if (mode === "Base64") {
        let chars = [];

        for (let i = 0; i < bits.length; i += 8) {
            let byte = bits.slice(i, i + 8).join("");
            chars.push(String.fromCharCode(parseInt(byte, 2)));
        }

        return Buffer.from(chars.join(""), "base64").toString("utf8");
    }
}

// =======================
// ШИФРОВАНИЕ
// =======================
function encrypt(bits, beta) {
    const n = beta.length;
    let result = [];

    for (let i = 0; i < bits.length; i += n) {
        let block = bits.slice(i, i + n);

        while (block.length < n) block.push(0);

        let sum = 0n;
        for (let j = 0; j < n; j++) {
            sum += BigInt(block[j]) * beta[j];
        }

        result.push(sum);
    }

    return result;
}

// =======================
// ДЕШИФРОВАНИЕ
// =======================
function decrypt(cipher, w, q, r, bitLength) {
    const rInv = modInverse(r, q);
    let bits = [];

    for (let c of cipher) {
        let s = (c * rInv) % q;

        let block = new Array(w.length).fill(0);

        for (let i = w.length - 1; i >= 0; i--) {
            if (w[i] <= s) {
                block[i] = 1;
                s -= w[i];
            }
        }

        bits.push(...block);
    }

    return bits.slice(0, bitLength);
}

// =======================
// ТЕСТ
// =======================
function test(message, n, mode) {
    console.log("\n========================");
    console.log(`Режим: ${mode}, n=${n}`);
    console.log("========================");

    console.time("KeyGen");
    const { w, q, r, beta } = generateKeys(n);
    console.timeEnd("KeyGen");

    // 🔐 ВЫВОД КЛЮЧЕЙ
    console.log("\n--- КЛЮЧИ ---");

    console.log("Сверхвозрастающая последовательность (w):");
    console.log(w.map(x => x.toString()).join(", "));

    console.log("\nОткрытый ключ (beta):");
    console.log(beta.map(x => x.toString()).join(", "));

    console.log("\nПараметры:");
    console.log("q =", q.toString());
    console.log("r =", r.toString());

    const bits = stringToBits(message, mode);
    const bitLength = bits.length;

    console.time("Encrypt");
    const cipher = encrypt(bits, beta);
    console.timeEnd("Encrypt");

    console.log("\nЗашифрованное сообщение:");
    console.log(cipher.map(x => x.toString()).join(" | "));

    console.time("Decrypt");
    const decodedBits = decrypt(cipher, w, q, r, bitLength);
    console.timeEnd("Decrypt");

    const decoded = bitsToString(decodedBits, mode);

    console.log("\nИсходное:", message);
    console.log("Расшифрованное:", decoded);
}

// =======================
// ЗАПУСК
// =======================
const message = "MANDRIKALEXEJIVANOVICH";

test(message, 8, "ASCII");
test(message, 16, "ASCII");
test(message, 24, "ASCII");

test(message, 6, "Base64");
test(message, 12, "Base64");
test(message, 18, "Base64");