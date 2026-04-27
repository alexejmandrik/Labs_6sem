const crypto = require("crypto");

const input = "МАНДРИКАЛЕКСЕЙИВАНОВИЧ";

const start = process.hrtime.bigint();

const hash = crypto
  .createHash("sha256")
  .update(input, "utf8")
  .digest("hex");

const end = process.hrtime.bigint();

const timeMs = Number(end - start) / 1_000_000;

console.log("Входное сообщение:", input);
console.log("SHA-256 хеш:", hash);
console.log("Время выполнения:", timeMs.toFixed(3), "мс");