const readline = require("readline");

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

function findPrimes(start, end) {
    const primes = [];
    for (let i = start; i <= end; i++) {
        if (isPrime(i)) primes.push(i);
    }
    return primes;
}

// --- НОД двух чисел (алгоритм Евклида) ---
function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return Math.abs(a);
}

// --- НОД трёх чисел ---
function gcdThree(a, b, c) {
    return gcd(gcd(a, b), c);
}

// --- Разложение на простые множители (каноническая форма) ---
function primeFactorization(n) {
    const factors = {};
    let divisor = 2;

    while (n >= 2) {
        if (n % divisor === 0) {
            factors[divisor] = (factors[divisor] || 0) + 1;
            n = n / divisor;
        } else {
            divisor++;
        }
    }

    return factors;
}

// --- Красивый вывод канонической формы ---
function formatFactors(factors) {
    return Object.entries(factors)
        .map(([prime, power]) => power > 1 ? `${prime}^${power}` : prime)
        .join(" * ");
}

// --- Конкатенация чисел ---
function concatNumbers(m, n) {
    return Number(String(m) + String(n));
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu() {
    console.log("\nВыберите операцию:");
    console.log("1 - Найти простые числа в интервале");
    console.log("2 - Найти НОД двух чисел");
    console.log("3 - Найти НОД трех чисел");
    console.log("4 - Разложить m и n на простые множители и проверить m||n");
    console.log("0 - Выход");

    rl.question("Ваш выбор: ", (choice) => {
        switch (choice) {
            case "1":
                rl.question("Введите начало интервала: ", (a) => {
                    rl.question("Введите конец интервала: ", (b) => {
                        const primes = findPrimes(Number(a), Number(b));
                        console.log("Простые числа:", primes.join(", "));
                        console.log("Количество:", primes.length);
                        menu();
                    });
                });
                break;

            case "2":
                rl.question("Введите первое число: ", (a) => {
                    rl.question("Введите второе число: ", (b) => {
                        console.log("НОД =", gcd(Number(a), Number(b)));
                        menu();
                    });
                });
                break;

            case "3":
                rl.question("Введите первое число: ", (a) => {
                    rl.question("Введите второе число: ", (b) => {
                        rl.question("Введите третье число: ", (c) => {
                            console.log("НОД =", gcdThree(Number(a), Number(b), Number(c)));
                            menu();
                        });
                    });
                });
                break;

            case "4":
                rl.question("Введите m: ", (m) => {
                    rl.question("Введите n: ", (n) => {

                        m = Number(m);
                        n = Number(n);

                        const mFactors = primeFactorization(m);
                        const nFactors = primeFactorization(n);

                        console.log(`m = ${m} = ${formatFactors(mFactors)}`);
                        console.log(`n = ${n} = ${formatFactors(nFactors)}`);

                        const concat = concatNumbers(m, n);
                        console.log(`m||n = ${concat}`);

                        if (isPrime(concat)) {
                            console.log("Число m||n является простым.");
                        } else {
                            console.log("Число m||n не является простым.");
                        }

                        menu();
                    });
                });
                break;

            case "0":
                rl.close();
                break;

            default:
                console.log("Неверный выбор.");
                menu();
        }
    });
}

menu();