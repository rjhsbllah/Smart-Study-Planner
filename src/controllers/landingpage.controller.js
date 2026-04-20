import hasilSpkCollection from "../models/hasilspk.js";
import Rekomendasi from "../models/rekomendasi.js";
import connectDB from "../config/db.js";

const getAllHasilSpk = async (req, res) => {
  await connectDB();
  const total = await hasilSpkCollection.countDocuments();

  const riwayat = await hasilSpkCollection
    .find()
    .sort({ createdAt: -1 })
    .limit(6);

  function formatNumber(num) {
    if (num >= 1000000) return Math.floor(num / 1000000) + "M+";
    if (num >= 1000) return Math.floor(num / 1000) + "K+";
    return num.toString();
  }

  res.render("landingpage/index", {
    layout: "layouts/main",
    totalResponden: formatNumber(total),
    riwayat,
  });
};

function getBobotAdaptif(status, aktivitas) {
  let bobot = {
    konsentrasi: 0.2,
    konsistensi: 0.2,
    durasi: 0.15,
    kelelahan: 0.15,
    lingkungan: 0.15,
    gangguan: 0.15,
  };

  if (status === "pekerja") {
    bobot.durasi += 0.05;
    bobot.konsistensi += 0.05;
    bobot.konsentrasi -= 0.05;
  }

  if (aktivitas.toLowerCase().includes("kuliah")) {
    bobot.konsentrasi += 0.05;
  }

  return bobot;
}

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

function getFaktorDominan(normalisasi, bobot) {
  const kontribusi = Object.keys(normalisasi).map((k) => ({
    nama: k,
    nilai: normalisasi[k] * bobot[k],
  }));

  kontribusi.sort((a, b) => b.nilai - a.nilai);

  return kontribusi.slice(0, 2);
}

function adaptDeskripsi(base, user) {
  let hasil = base;

  if (user.kelelahan >= 4)
    hasil += " Kondisi kelelahan tinggi sehingga durasi belajar dibatasi.";

  if (user.konsentrasi <= 2)
    hasil += " Konsentrasi rendah sehingga digunakan metode bertahap.";

  if (user.gangguan <= 2)
    hasil += " Lingkungan memiliki gangguan sehingga perlu penyesuaian.";

  if (user.konsistensi <= 2)
    hasil += " Konsistensi rendah sehingga disarankan jadwal sederhana.";

  return hasil;
}

function adaptTips(baseTips, user) {
  let tips = [...baseTips];

  if (user.kelelahan >= 4)
    tips.push("Pastikan istirahat cukup sebelum belajar.");

  if (user.konsentrasi <= 2) tips.push("Gunakan teknik pomodoro.");

  if (user.konsistensi <= 2) tips.push("Buat jadwal belajar harian.");

  if (user.gangguan <= 2) tips.push("Cari tempat belajar yang lebih tenang.");

  return tips;
}

function generateWaktuHybrid(kategori, waktu_luang, user, pola) {
  let finalKategori = waktu_luang || kategori;

  let start;
  switch (finalKategori) {
    case "pagi":
      start = 6;
      break;
    case "siang":
      start = 12;
      break;
    case "sore":
      start = 16;
      break;
    case "malam":
      start = 19;
      break;
    default:
      return "Menyesuaikan jadwal";
  }

  let durasi;

  if (user.kelelahan === 5) durasi = 1;
  else if (user.kelelahan === 4) durasi = 1.5;
  else if (user.kelelahan === 3) durasi = 2;
  else durasi = 2.5;

  if (user.kelelahan <= 3) {
    if (user.konsentrasi >= 4) durasi += 0.5;
    if (user.konsentrasi <= 2) durasi -= 0.5;
  }

  if (durasi < 1) durasi = 1;
  if (durasi > 3) durasi = 3;

  let belajar = 50;
  let istirahat = 10;

  const match = pola.match(/(\d+).*?(\d+)/);
  if (match) {
    belajar = Number(match[1]);
    istirahat = Number(match[2]);
  }

  const siklus = belajar + istirahat;
  const totalMenit = durasi * 60;

  let jumlahSiklus = Math.floor(totalMenit / siklus);
  if (jumlahSiklus < 1) jumlahSiklus = 1;

  const totalDipakai = jumlahSiklus * siklus;
  let end = start + totalDipakai / 60;

  function format(j) {
    const h = Math.floor(j);
    const m = (j % 1) * 60;
    return `${String(h).padStart(2, "0")}.${m === 0 ? "00" : "30"}`;
  }

  return `${format(start)} – ${format(end)}`;
}

function generateAlasan(user, waktu_luang, kategori, faktorDominan) {
  const alasan = [];

  faktorDominan.forEach((f) => {
    if (f.nama === "kelelahan")
      alasan.push("Kelelahan mempengaruhi durasi belajar");

    if (f.nama === "konsentrasi")
      alasan.push("Konsentrasi mempengaruhi panjang sesi belajar");

    if (f.nama === "gangguan")
      alasan.push("Lingkungan mempengaruhi fokus belajar");

    if (f.nama === "konsistensi")
      alasan.push("Konsistensi mempengaruhi pola belajar");
  });

  if (waktu_luang && waktu_luang !== kategori) {
    alasan.push(
      `Waktu belajar disesuaikan dengan preferensi pengguna (${waktu_luang})`,
    );
  }

  return alasan;
}

const postHitung = async (req, res) => {
  await connectDB();
  try {
    const {
      nama,
      gender,
      usia,
      status,
      aktivitas,
      waktu_luang,
      konsentrasi,
      konsistensi,
      durasi,
      kelelahan,
      lingkungan,
      gangguan,
    } = req.body;

    const bobot = getBobotAdaptif(status, aktivitas);

    const normalisasi = {
      konsentrasi: konsentrasi / 5,
      konsistensi: konsistensi / 5,
      durasi: durasi / 5,
      kelelahan: kelelahan / 5,
      lingkungan: lingkungan / 5,
      gangguan: gangguan / 5,
    };

    const skor =
      normalisasi.konsentrasi * bobot.konsentrasi +
      normalisasi.konsistensi * bobot.konsistensi +
      normalisasi.durasi * bobot.durasi +
      normalisasi.kelelahan * bobot.kelelahan +
      normalisasi.lingkungan * bobot.lingkungan +
      normalisasi.gangguan * bobot.gangguan;

    const faktorDominan = getFaktorDominan(normalisasi, bobot);

    const kodeTerpilih = getRekomendasi({
      skor,
      aktivitas,
      kelelahan,
      konsentrasi,
      gangguan,
      lingkungan,
      durasi,
      konsistensi,
    });

    const rekomendasiData = await Rekomendasi.findOne({
      kode: kodeTerpilih,
    });

    if (!rekomendasiData) return res.send("Rekomendasi tidak ditemukan");

    const userData = {
      kelelahan,
      konsentrasi,
      gangguan,
      konsistensi,
    };

    const deskripsiFinal = adaptDeskripsi(
      rekomendasiData.deskripsi_base,
      userData,
    );

    const tipsFinal = adaptTips(rekomendasiData.tips_base, userData);

    const waktuFinal = generateWaktuHybrid(
      rekomendasiData.kategori_waktu,
      waktu_luang,
      userData,
      rekomendasiData.pola_default,
    );

    const alasanFinal = generateAlasan(
      userData,
      waktu_luang,
      rekomendasiData.kategori_waktu,
      faktorDominan,
    );

    const skorPersen = Math.round(skor * 100);

    const data = await hasilSpkCollection.create({
      nama,
      gender,
      usia,
      status,
      aktivitas,
      waktu_luang,
      konsentrasi,
      konsistensi,
      durasi,
      kelelahan,
      lingkungan,
      gangguan,
      skor: skorPersen,
      rekomendasi: {
        kode: rekomendasiData.kode,
        judul: rekomendasiData.judul,
        waktu: waktuFinal,
        pola: rekomendasiData.pola_default,
        deskripsi: deskripsiFinal,
        tips: tipsFinal,
        alasan: alasanFinal,
        faktor: faktorDominan.map((f) => f.nama),
      },
    });

    res.render("hasil/index", {
      layout: "layouts/main",
      data,
      skor: skorPersen,
      rekomendasi: data.rekomendasi,
    });
  } catch (err) {
    console.error(err);
    res.send("Terjadi kesalahan");
  }
};

const getRiwayat = async (req, res) => {
  const riwayat = await hasilSpkCollection
    .find()
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  res.render("riwayat/index", {
    layout: "layouts/main",
    riwayat,
  });
};

export { getAllHasilSpk, postHitung, getRiwayat };
