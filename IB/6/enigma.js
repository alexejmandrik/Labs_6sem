// enigma_cyrillic.js

// --- Алфавит кириллицы ---
const ALPHABET = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

// --- Роторы для кириллицы (упрощённые примеры) ---
const ROTORS = {
  L: "ФИВАПРОЛДЖЭЯЧСМИТЬБЮНКЕГХЩЗЦШЫ",
  M: "ЯШФЛИЮТВЭДГЗЖХЙНРКПСЧМБОЫЩАЦЕ",
  R: "ЦКТЩНШМЗЬЯФЮЭЛВПОДХБРИГЕЙАСЧ",
};

// --- Отражатель ---
const REFLECTOR = "ЯЮЭЬЫЪЩШЧЦХФБОДЛГЖИЕКМНРСТВ";

// --- Класс ротора ---
class Rotor {
  constructor(wiring, position = 0) {
    this.wiring = wiring;
    this.position = position;
    this.size = wiring.length;
  }

  forward(c) {
    const idx = (ALPHABET.indexOf(c) + this.position) % this.size;
    const wiredChar = this.wiring[idx];
    const outIdx = (ALPHABET.indexOf(wiredChar) - this.position + this.size) % this.size;
    return ALPHABET[outIdx];
  }

  backward(c) {
    const idx = (ALPHABET.indexOf(c) + this.position) % this.size;
    const wiredIdx = this.wiring.indexOf(ALPHABET[idx]);
    const outIdx = (wiredIdx - this.position + this.size) % this.size;
    return ALPHABET[outIdx];
  }

  rotate() {
    this.position = (this.position + 1) % this.size;
  }
}

// --- Класс Энигмы ---
class Enigma {
  constructor(L, M, R, reflector) {
    this.L = L;
    this.M = M;
    this.R = R;
    this.reflector = reflector.split("");
    this.size = reflector.length;
  }

  encodeChar(c) {
    if (!ALPHABET.includes(c)) return c;

    // вращение роторов
    this.R.rotate();
    if (this.R.position === 0) this.M.rotate();
    if (this.M.position === 0 && this.R.position === 0) this.L.rotate();

    // вперед через роторы
    let ch = this.R.forward(c);
    ch = this.M.forward(ch);
    ch = this.L.forward(ch);

    // отражатель
    ch = this.reflector[ALPHABET.indexOf(ch)];

    // назад через роторы
    ch = this.L.backward(ch);
    ch = this.M.backward(ch);
    ch = this.R.backward(ch);

    return ch;
  }

  encodeMessage(msg) {
    return msg.toUpperCase().split("").map(c => this.encodeChar(c)).join("");
  }
}

// --- Пример использования ---
const message = "Мандрик Алексей Иванович";

const settings = [
  [0,0,0],
  [1,5,10],
  [3,12,7],
  [25,0,13],
  [10,10,10],
  [2,3,5],
  [15,20,8],
  [7,1,18],
];

console.log("Энигма для кириллицы\n");

settings.forEach((set, idx) => {
  const rotorL = new Rotor(ROTORS.L, set[0]);
  const rotorM = new Rotor(ROTORS.M, set[1]);
  const rotorR = new Rotor(ROTORS.R, set[2]);
  const enigma = new Enigma(rotorL, rotorM, rotorR, REFLECTOR);

  const cipher = enigma.encodeMessage(message);
  console.log(`Настройка ${idx + 1}: L=${set[0]} M=${set[1]} R=${set[2]} -> ${cipher}`);
});