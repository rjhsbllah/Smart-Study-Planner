import fs from "fs";

// Rule
function getRekomendasi(data) {
  const {
    skor,
    aktivitas,
    kelelahan,
    konsentrasi,
    konsistensi,
    gangguan,
    lingkungan,
    durasi,
  } = data;
  const act = aktivitas.toLowerCase();

  if (skor >= 0.85) {
    if (kelelahan <= 2) return 8;
    if (act === "bekerja") return 18;
    return 4;
  }
  if (skor >= 0.7) {
    if (act === "sekolah") return 1;
    if (act === "kuliah") return 2;
    if (gangguan <= 2) return 19;
    return 9;
  }
  if (skor >= 0.55) {
    if (konsentrasi >= 4 && durasi >= 4) return 13;
    if (lingkungan <= 2) return 14;
    if (act.includes("bekerja")) return 16;
    return 3;
  }
  if (skor >= 0.4) {
    if (kelelahan >= 4) return 7;
    if (gangguan <= 2) return 15;
    if (konsentrasi <= 2) return 17;
    return 5;
  }
  if (skor >= 0.25) {
    if (konsentrasi <= 2) return 6;
    if (konsistensi <= 2) return 20;
    return 11;
  }
  if (skor >= 0.1) return 12;
  return 10;
}

// Bobot + Skor
function getBobot() {
  return {
    konsentrasi: 0.2,
    konsistensi: 0.2,
    durasi: 0.15,
    kelelahan: 0.15,
    lingkungan: 0.15,
    gangguan: 0.15,
  };
}
function hitungSkor(x) {
  const b = getBobot();
  const n = {
    konsentrasi: x.konsentrasi / 5,
    konsistensi: x.konsistensi / 5,
    durasi: x.durasi / 5,
    kelelahan: x.kelelahan / 5,
    lingkungan: x.lingkungan / 5,
    gangguan: x.gangguan / 5,
  };
  return (
    n.konsentrasi * b.konsentrasi +
    n.konsistensi * b.konsistensi +
    n.durasi * b.durasi +
    n.kelelahan * b.kelelahan +
    n.lingkungan * b.lingkungan +
    n.gangguan * b.gangguan
  );
}

// Generate
const aktivitasList = ["sekolah", "kuliah", "bekerja"];
const rand = () => Math.floor(Math.random() * 5) + 1;

function generateDataset(N = 300) {
  const out = [];
  for (let i = 0; i < N; i++) {
    const d = {
      konsentrasi: rand(),
      konsistensi: rand(),
      durasi: rand(),
      kelelahan: rand(),
      lingkungan: rand(),
      gangguan: rand(),
      aktivitas: aktivitasList[Math.floor(Math.random() * 3)],
    };
    const skor = hitungSkor(d);
    const label = getRekomendasi({ ...d, skor });

    out.push({
      fitur: [
        d.konsentrasi,
        d.konsistensi,
        d.durasi,
        d.kelelahan,
        d.lingkungan,
        d.gangguan,
      ],
      label,
    });
  }
  return out;
}

const data = generateDataset(300);
fs.writeFileSync("src/ai/dataset.json", JSON.stringify(data, null, 2));
console.log("dataset.json dibuat");
