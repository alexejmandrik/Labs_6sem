const readline = require("readline");

// --- Проверка простоты числа ---
function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

// --- Поиск простых чисел на интервале ---
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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu() {
    console.log("\nВыберите операцию:");
    console.log("1 - Найти простые числа в интервале");
    console.log("2 - Найти НОД двух чисел");
    console.log("3 - Найти НОД трех чисел");
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