// Домашняя работа №2

// npm install iconv-lite
const iconv = require('iconv-lite');

// Задание 2
// Посчитать энтропию в сообщениях 

// Кириллица и латиница

let Xk1 = "Мандрик Алексей Иванович";
let Xk2 = "Mandryk Aliaksei Ivanovich";

// длина бинарного сообщения
let k1 = Xk1.length; // 28
let k2 = Xk2.length; // 30

// алфавит сообщения
let A1 = [...new Set(Xk1)];
let A2 = [...new Set(Xk2)];

// мощность алфавита
let NA1 = A1.length; // 19
let NA2 = A2.length; // 19

// количество вхождений
let Nai1 = {};
let Nai2 = {};

for (const char of Xk1) { Nai1[char] = (Nai1[char] || 0) + 1; }
for (const char of Xk2) { Nai2[char] = (Nai2[char] || 0) + 1; }

// вероятность символа
let Pai1 = {};
let Pai2 = {};

for (const char in Nai1) { Pai1[char] = +(Nai1[char] / k1); } // и еще округляем
for (const char in Nai2) { Pai2[char] = +(Nai2[char] / k2); }

// энтропия сообщения
let HA1 = 0;
let HA2 = 0;

for (let char in Pai1) { HA1 -= Pai1[char] * Math.log2(Pai1[char]); }
for (let char in Pai2) { HA2 -= Pai2[char] * Math.log2(Pai2[char]); }

console.log(HA1.toFixed(5));
console.log(HA2.toFixed(5));



// Бинарные кириллица и латиница 

// кодировка в Windows-1251 (1 байт = символ); строка не разделена пробелами, просто 101010000101010101010...
//let Xk3 = Array.from(iconv.encode(Xk1, 'win1251')).map(byte => byte.toString(2).padStart(8, '0')).join('');
//let Xk4 = Array.from(iconv.encode(Xk2, 'win1251')).map(byte => byte.toString(2).padStart(8, '0')).join('');
let Xk3 = "11111111111111111111111111111111111111111111111111111111111111111111111111111111111111110";
let Xk4 = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000001";

// длина бинарного сообщения
let k3 = Xk3.length;
let k4 = Xk4.length;

// алфавит бинарного сообщения
let A3 = [...new Set(Xk3)];
let A4 = [...new Set(Xk4)];

// мощность бинарного алфавита
let NA3 = A3.length;
let NA4 = A4.length;

// количество вхождений
let Nai3 = {};
let Nai4 = {};

for (const bit of Xk3) { Nai3[bit] = (Nai3[bit] || 0) + 1; }
for (const bit of Xk4) { Nai4[bit] = (Nai4[bit] || 0) + 1; }

// вероятность бита
let Pai3 = {};
let Pai4 = {};

for (const bit in Nai3) { Pai3[bit] = Nai3[bit] / k3; }
for (const bit in Nai4) { Pai4[bit] = Nai4[bit] / k4; }

// энтропия бинарного сообщения
let HA3 = 0;
let HA4 = 0;

for (let bit in Pai3) { HA3 -= Pai3[bit] * Math.log2(Pai3[bit]); }
for (let bit in Pai4) { HA4 -= Pai4[bit] * Math.log2(Pai4[bit]); }

console.log("Бинарная кириллица:", HA3.toFixed(5));
console.log("Бинарная латиница:", HA4.toFixed(5));