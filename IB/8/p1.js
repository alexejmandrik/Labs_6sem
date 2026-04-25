function gcd(a, b) {
    while (b !== 0) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

const p = 23;
const q = 15;
const n = p * q;

// начальное значение (взаимно простое с n)
let x = 4;
if (gcd(x, n) !== 1) {
    throw new Error("x должно быть взаимно простым с n");
}

// x0
let x0 = (x * x) % n;

function generateBBS(bitsCount) {
    let result = [];
    let xt = x0;

    for (let i = 0; i < bitsCount; i++) {
        xt = (xt * xt) % n;
        let bit = xt % 2; // младший бит
        result.push(bit);
    }

    return result;
}

// тест
console.log("BBS sequence:", generateBBS(20).join(""));