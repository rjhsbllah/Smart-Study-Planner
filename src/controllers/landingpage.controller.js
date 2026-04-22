import hasilSpkCollection from "../models/hasilspk.js";
import Rekomendasi from "../models/rekomendasi.js";
import connectDB from "../config/db.js";

import {
  prediksiAI,
  getDecisionPath,
  getFeatureImportance,
} from "../ai/predict.js";

const fiturMap = {
  0: "Konsentrasi",
  1: "Konsistensi",
  2: "Durasi",
  3: "Kelelahan",
  4: "Lingkungan",
  5: "Gangguan",
  6: "Aktivitas",
  7: "Skor",
};

function formatTime(time) {
  const jam = Math.floor(time);
  const menit = Math.round((time - jam) * 60);
  return `${jam}.${menit.toString().padStart(2, "0")}`;
}

function generateMultiSession(user, pola) {
  let belajar = 30;
  let istirahat = 10;

  const match = pola.match(/(\d+)\s*menit belajar,\s*(\d+)\s*menit istirahat/i);

  if (match) {
    belajar = Number(match[1]);
    istirahat = Number(match[2]);
  }

  let sesi = 2;

  if (user.konsentrasi >= 4) sesi = 3;
  if (user.konsentrasi <= 2) sesi = 2;
  if (user.kelelahan >= 4) sesi = Math.max(1, sesi - 1);

  return {
    belajar,
    istirahat,
    sesi,
    totalMenit: (belajar + istirahat) * sesi,
  };
}

function generateNarasiAI(aiPath) {
  let kondisi = [];

  aiPath.forEach((step) => {
    if (step.includes("Skor >")) {
      kondisi.push("skor belajar kamu tergolong baik");
    }

    if (step.includes("Skor <=")) {
      kondisi.push("skor belajar kamu masih perlu ditingkatkan");
    }

    if (step.includes("Lingkungan >")) {
      kondisi.push("lingkungan belajar cukup kondusif");
    }

    if (step.includes("Lingkungan <=")) {
      kondisi.push("lingkungan belajar kurang mendukung");
    }

    if (step.includes("Aktivitas <=")) {
      kondisi.push("aktivitas kamu mendukung proses belajar");
    }

    if (step.includes("Aktivitas >")) {
      kondisi.push("aktivitas kamu cukup padat");
    }

    if (step.includes("Konsentrasi")) {
      kondisi.push("tingkat konsentrasi berpengaruh dalam belajar");
    }

    if (step.includes("Gangguan")) {
      kondisi.push("gangguan menjadi salah satu faktor penting");
    }
  });

  kondisi = [...new Set(kondisi)];

  if (kondisi.length === 0) {
    return "Sistem menentukan rekomendasi berdasarkan kondisi belajar kamu secara keseluruhan.";
  }

  return `Berdasarkan ${kondisi.join(
    ", ",
  )}, sistem merekomendasikan metode belajar yang paling sesuai untuk kamu.`;
}

function generateWaktuFromSession(waktu_luang, kategori, sessionData) {
  const jamMap = {
    pagi: 6,
    siang: 12,
    sore: 16,
    malam: 19,
  };

  const start = jamMap[waktu_luang || kategori] ?? 6;
  const end = start + sessionData.totalMenit / 60;

  return {
    start,
    text: `${formatTime(start)} – ${formatTime(end)}`,
  };
}

function generatePlanner(start, sessionData) {
  let current = start;
  const jadwal = [];

  for (let i = 1; i <= sessionData.sesi; i++) {
    let endBelajar = current + sessionData.belajar / 60;

    jadwal.push({
      type: "Belajar",
      sesi: i,
      waktu: `${formatTime(current)} - ${formatTime(endBelajar)}`,
    });

    current = endBelajar;

    let endIstirahat = current + sessionData.istirahat / 60;

    jadwal.push({
      type: "Istirahat",
      sesi: i,
      waktu: `${formatTime(current)} - ${formatTime(endIstirahat)}`,
    });

    current = endIstirahat;
  }

  return jadwal;
}

function generateAlasan(user, faktor) {
  const alasan = [];

  faktor.forEach((f) => {
    if (f === "Konsentrasi") {
      alasan.push(
        user.konsentrasi <= 2
          ? "Konsentrasi rendah mempengaruhi efektivitas belajar"
          : "Konsentrasi cukup baik untuk mendukung belajar",
      );
    }

    if (f === "Konsistensi") {
      alasan.push(
        user.konsistensi <= 2
          ? "Konsistensi belajar masih kurang stabil"
          : "Konsistensi belajar sudah cukup baik",
      );
    }

    if (f === "Durasi") {
      alasan.push("Durasi belajar mempengaruhi hasil pemahaman");
    }

    if (f === "Kelelahan" && user.kelelahan >= 4) {
      alasan.push("Kelelahan tinggi membuat belajar kurang optimal");
    }

    if (f === "Lingkungan") {
      alasan.push("Lingkungan belajar mempengaruhi fokus");
    }

    if (f === "Gangguan") {
      alasan.push("Gangguan dapat menurunkan konsentrasi belajar");
    }
  });

  return alasan;
}

const getAllHasilSpk = async (req, res) => {
  await connectDB();

  const total = await hasilSpkCollection.countDocuments();

  const riwayat = await hasilSpkCollection
    .find()
    .sort({ createdAt: -1 })
    .limit(6);

  res.render("landingpage/index", {
    layout: "layouts/main",
    totalResponden: total,
    riwayat,
  });
};

const postHitung = async (req, res) => {
  await connectDB();

  try {
    const { nama, gender, usia, status, aktivitas, waktu_luang } = req.body;

    const userData = {
      konsentrasi: Number(req.body.konsentrasi),
      konsistensi: Number(req.body.konsistensi),
      durasi: Number(req.body.durasi),
      kelelahan: Number(req.body.kelelahan),
      lingkungan: Number(req.body.lingkungan),
      gangguan: Number(req.body.gangguan),
    };

    if (Object.values(userData).some((v) => isNaN(v))) {
      return res.send("Input tidak valid");
    }

    const skor =
      (userData.konsentrasi / 5) * 0.2 +
      (userData.konsistensi / 5) * 0.2 +
      (userData.durasi / 5) * 0.15 +
      (userData.kelelahan / 5) * 0.15 +
      (userData.lingkungan / 5) * 0.15 +
      (userData.gangguan / 5) * 0.15;

    const skorPersen = Math.round(skor * 100);

    let kodeTerpilih = prediksiAI({
      ...userData,
      aktivitas,
    });

    const rawPath = getDecisionPath([
      userData.konsentrasi,
      userData.konsistensi,
      userData.durasi,
      userData.kelelahan,
      userData.lingkungan,
      userData.gangguan,
      ["sekolah", "kuliah", "bekerja"].indexOf(
        String(aktivitas).toLowerCase().trim(),
      ),
      skor,
    ]);

    const decisionPath = rawPath
      .map((s) =>
        s.replace(/Fitur\[(\d)\]/g, (_, n) => fiturMap[n] || `Fitur${n}`),
      )
      .map((s) => s.replace(/(\d+\.\d+)/g, (num) => Number(num).toFixed(2)));

    let rawImportance = getFeatureImportance();

    let importanceObj =
      rawImportance instanceof Map
        ? Object.fromEntries(rawImportance)
        : rawImportance;

    const featureImportance = Object.entries(importanceObj).reduce(
      (acc, [k, v]) => {
        if (fiturMap[k]) acc[fiturMap[k]] = v;
        return acc;
      },
      {},
    );

    let faktorDominan = Object.entries(featureImportance)
      .sort((a, b) => b[1] - a[1])
      .filter(([nama]) => !["Aktivitas", "Skor"].includes(nama))
      .slice(0, 2)
      .map(([nama]) => nama);

    if (faktorDominan.length === 0) {
      faktorDominan = ["Konsentrasi"];
    }

    const alasanManual = generateAlasan(userData, faktorDominan);
    const narasiAI = generateNarasiAI(decisionPath);

    const alasan = [narasiAI, ...alasanManual];

    const rekomendasiData = await Rekomendasi.findOne({
      kode: kodeTerpilih,
    });

    if (!rekomendasiData) {
      return res.send("Rekomendasi tidak ditemukan");
    }

    const sessionData = generateMultiSession(
      userData,
      rekomendasiData.pola_default,
    );

    const waktuData = generateWaktuFromSession(
      waktu_luang,
      rekomendasiData.kategori_waktu,
      sessionData,
    );

    const planner = generatePlanner(waktuData.start, sessionData);

    const data = await hasilSpkCollection.create({
      nama,
      gender,
      usia,
      status,
      aktivitas,
      waktu_luang,
      ...userData,
      skor: skorPersen,

      rekomendasi: {
        kode: rekomendasiData.kode,
        judul: rekomendasiData.judul,

        waktu: waktuData.text,
        pola: `${sessionData.belajar} menit belajar, ${sessionData.istirahat} menit istirahat (${sessionData.sesi} sesi)`,

        deskripsi: `Rekomendasi ini dipengaruhi oleh ${faktorDominan.join(
          " dan ",
        )}.`,

        tips: rekomendasiData.tips_base || [],

        alasan,
        faktor: faktorDominan,

        ai_path: decisionPath,
        feature_importance: featureImportance,

        jadwal: planner,
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
