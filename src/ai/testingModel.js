import fs from "fs";
import tree from "./model.js"; // ✅ pakai model yang sama

const raw = fs.readFileSync("src/ai/dataset.json");
const data = JSON.parse(raw);

// ======================
// TESTING AKURASI
// ======================

let benar = 0;

data.forEach((d) => {
  const pred = tree.predict([d.fitur])[0];
  if (pred === d.label) benar++;
});

const akurasi = (benar / data.length) * 100;

// ======================
// TEST USER
// ======================

const inputUser = {
  konsentrasi: 4,
  konsistensi: 4,
  durasi: 5,
  kelelahan: 3,
  lingkungan: 4,
  gangguan: 4,
  aktivitas: "kuliah",
};

// SAW
const skor =
  (inputUser.konsentrasi / 5) * 0.2 +
  (inputUser.konsistensi / 5) * 0.2 +
  (inputUser.durasi / 5) * 0.15 +
  (inputUser.kelelahan / 5) * 0.15 +
  (inputUser.lingkungan / 5) * 0.15 +
  (inputUser.gangguan / 5) * 0.15;

// 8 fitur (WAJIB SAMA)
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

// ======================
// OUTPUT
// ======================

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
