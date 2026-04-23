import fs from "fs";
import tree from "./model.js";

const raw = fs.readFileSync("src/ai/dataset.json");
const data = JSON.parse(raw);

let benar = 0;

data.forEach((d) => {
  const pred = tree.predict([d.fitur])[0];
  if (pred === d.label) benar++;
});

const akurasi = (benar / data.length) * 100;

const inputUser = {
  konsentrasi: 3,
  konsistensi: 3,
  durasi: 4,
  kelelahan: 3,
  lingkungan: 3,
  gangguan: 2,
  aktivitas: "bekerja",
};

const skor =
  (inputUser.konsentrasi / 5) * 0.2 +
  (inputUser.konsistensi / 5) * 0.2 +
  (inputUser.durasi / 5) * 0.15 +
  (inputUser.kelelahan / 5) * 0.15 +
  (inputUser.lingkungan / 5) * 0.15 +
  (inputUser.gangguan / 5) * 0.15;

const fiturUser = [
  inputUser.konsentrasi,
  inputUser.konsistensi,
  inputUser.durasi,
  inputUser.kelelahan,
  inputUser.lingkungan,
  inputUser.gangguan,
  ["sekolah", "kuliah", "bekerja"].indexOf(inputUser.aktivitas),
  skor,
];

const hasil = tree.predict([fiturUser])[0];

console.log("=================================");
console.log("HASIL PENGUJIAN MODEL");
console.log("=================================");
console.log("Akurasi:", akurasi.toFixed(2) + "%");

console.log("\n=================================");
console.log("HASIL PREDIKSI USER");
console.log("=================================");
console.log("Input:", inputUser);
console.log("Skor:", skor.toFixed(2));
console.log("Kode Rekomendasi:", hasil);
