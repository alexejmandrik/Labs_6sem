const crypto = require("crypto");
const fs = require("fs");

// ---------- генерация случайного n (1024 / 2048 бит) ----------
function generateModulus(bits = 1024) {
    return BigInt("0x" + crypto.randomBytes(bits / 8).toString("hex"));
}

// ---------- возведение в степень по модулю ----------
function modExp(base, exp, mod) {
    base = BigInt(base);
    exp = BigInt(exp);
    mod = BigInt(mod);

    let result = 1n;
    base = base % mod;

    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        exp = exp / 2n;
        base = (base * base) % mod;
    }

    return result;
}

// ---------- измерение времени ----------
function measure(a, x, n) {
    const start = process.hrtime.bigint();
    const y = modExp(a, x, n);
    const end = process.hrtime.bigint();

    const timeMs = Number(end - start) / 1e6;

    return { y, timeMs };
}

// ---------- параметры ----------
const aValues = [5, 17]; // можно 1–2 числа
const xValues = [
    103n,
    1009n,
    10007n,
    100003n,
    1000003n,
    10000019n
];

// 1024 и 2048 бит
const moduli = [
    { bits: 1024, n: generateModulus(1024) },
    { bits: 2048, n: generateModulus(2048) }
];

// ---------- запуск эксперимента ----------
let results = [];

for (let { bits, n } of moduli) {
    for (let a of aValues) {
        for (let x of xValues) {
            const { timeMs } = measure(a, x, n);

            results.push({
                bits,
                a,
                x: x.toString(),
                timeMs: timeMs.toFixed(3)
            });

            console.log(`n=${bits} | a=${a} | x=${x} => ${timeMs.toFixed(3)} ms`);
        }
    }
}

// ---------- вывод таблицы ----------
const table = results.map(r =>
    `${r.bits}\t${r.a}\t${r.x}\t${r.timeMs}`
).join("\n");

fs.writeFileSync("results.txt",
    "bits\ta\tx\ttime(ms)\n" + table
);

console.log("\nРезультаты сохранены в results.txt");