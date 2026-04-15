const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const ROTORS = {
  L: "BDFHJLCPRTXVZNYEIWGAKMUSQO",
  M: "NZJHGRCXMYSWBOUFAIVLPEKQDT",
  R: "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
};

const REFLECTOR = "AEBNCKDQFUGYHWILJOMPXRSZTV";

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

  rotate(steps = 1) {
    this.position = (this.position + steps) % this.size;
  }
}

class Enigma {
  constructor(L, M, R, reflector) {
    this.L = L;
    this.M = M;
    this.R = R;
    this.reflector = reflector; // Строка пар
  }

  reflect(c) {
    const idx = this.reflector.indexOf(c);
    const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    return this.reflector[pairIdx];
  }

  encodeChar(c) {
    if (!ALPHABET.includes(c)) return c;

    let ch = this.R.forward(c);
    ch = this.M.forward(ch);
    ch = this.L.forward(ch);

    ch = this.reflect(ch);

    ch = this.L.backward(ch);
    ch = this.M.backward(ch);
    ch = this.R.backward(ch);

    const oldR = this.R.position;
    this.R.rotate(4);

    if (this.R.position < oldR) {
      const oldM = this.M.position;
      this.M.rotate(1);
      if (this.M.position < oldM) {
        this.L.rotate(1); 
      }
    }
    return ch;
  }

  encodeMessage(msg) {
    return msg
      .toUpperCase()
      .split("")
      .map((c) => this.encodeChar(c))
      .join("");
  }
}

const message = "AA";

const settings = [
  [0, 0, 0],
  [1, 5, 10],
  [3, 12, 7],
  [25, 0, 13],
  [10, 10, 10],
  [2, 3, 5],
  [15, 20, 8],
  [7, 1, 18],
];

console.log("Enigma (с парным рефлектором)\n");

settings.forEach((set, idx) => {
  const rotorL = new Rotor(ROTORS.L, set[0]);
  const rotorM = new Rotor(ROTORS.M, set[1]);
  const rotorR = new Rotor(ROTORS.R, set[2]);

  const enigma = new Enigma(rotorL, rotorM, rotorR, REFLECTOR);

  const cipher = enigma.encodeMessage(message);
  console.log(
    `Setting ${idx + 1}: L=${set[0]} M=${set[1]} R=${set[2]} -> ${cipher}`
  );
});
