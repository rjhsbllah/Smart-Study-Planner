import hasilSpkCollection from "../models/hasilspk.js";
import Rekomendasi from "../models/rekomendasi.js";
import connectDB from "../config/db.js";

import {
  prediksiAI,
  getDecisionPath,
  getFeatureImportance,
} from "../ai/predict.js";

/* =========================
   MAP FITUR
========================= */
const fiturMap = {
  0: "Konsentrasi",
  1: "Konsistensi",
  2: "Durasi",
  3: "Kelelahan",
  4: "Lingkungan",
  5: "Gangguan",
};

/* =========================
   FORMAT JAM
========================= */
function formatTime(time) {
  const jam = Math.floor(time);
  const menit = Math.round((time - jam) * 60);
  return `${jam}.${menit.toString().padStart(2, "0")}`;
}

/* =========================
   MULTI SESSION OTOMATIS
========================= */
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

/* =========================
   WAKTU DARI SESSION
========================= */
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

/* =========================
   PLANNER HARIAN
========================= */
function generatePlanner(start, sessionData) {
  let current = start;
  const jadwal = [];

  const includeLastBreak = true;

  for (let i = 1; i <= sessionData.sesi; i++) {
    let endBelajar = current + sessionData.belajar / 60;

    jadwal.push({
      type: "Belajar",
      sesi: i,
      waktu: `${formatTime(current)} - ${formatTime(endBelajar)}`,
    });

    current = endBelajar;

    if (i !== sessionData.sesi || includeLastBreak) {
      let endIstirahat = current + sessionData.istirahat / 60;

      jadwal.push({
        type: "Istirahat",
        sesi: i,
        waktu: `${formatTime(current)} - ${formatTime(endIstirahat)}`,
      });

      current = endIstirahat;
    }
  }

  return jadwal;
}

/* =========================
   🔥 GENERATE ALASAN (BARU)
========================= */
function generateAlasan(user, faktor) {
  const alasan = [];

  if (faktor.includes("Konsentrasi")) {
    alasan.push(
      user.konsentrasi <= 2
        ? "Konsentrasi rendah mempengaruhi efektivitas belajar"
        : "Konsentrasi cukup baik untuk mendukung belajar",
    );
  }

  if (faktor.includes("Konsistensi")) {
    alasan.push(
      user.konsistensi <= 2
        ? "Konsistensi belajar masih kurang stabil"
        : "Konsistensi belajar sudah cukup baik",
    );
  }

  if (faktor.includes("Durasi")) {
    alasan.push("Durasi belajar mempengaruhi hasil pemahaman");
  }

  if (faktor.includes("Kelelahan") && user.kelelahan >= 4) {
    alasan.push("Kelelahan tinggi membuat belajar kurang optimal");
  }

  if (faktor.includes("Lingkungan")) {
    alasan.push("Lingkungan belajar mempengaruhi fokus");
  }

  if (faktor.includes("Gangguan")) {
    alasan.push("Gangguan dapat menurunkan konsentrasi belajar");
  }

  return alasan;
}

/* =========================
   DASHBOARD
========================= */
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

/* =========================
   POST HITUNG
========================= */
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

    /* =========================
       SKOR
    ========================= */
    const skor =
      (userData.konsentrasi +
        userData.konsistensi +
        userData.durasi +
        userData.kelelahan +
        userData.lingkungan +
        userData.gangguan) /
      6;

    const skorPersen = Math.round((skor / 5) * 100);

    /* =========================
       AI
    ========================= */
    let kodeTerpilih = 12;
    try {
      kodeTerpilih = prediksiAI(userData);
    } catch {}

    /* =========================
       XAI PATH
    ========================= */
    let rawPath = getDecisionPath(Object.values(userData));

    const decisionPath = rawPath
      .filter((s) => s && !s.includes("undefined") && !s.includes("⚠️"))
      .map((s) => s.replace(/Fitur\[(\d)\]/g, (_, n) => fiturMap[n]));

    /* =========================
       FEATURE IMPORTANCE
    ========================= */
    let rawImportance = getFeatureImportance();

    let importanceObj =
      rawImportance instanceof Map
        ? Object.fromEntries(rawImportance)
        : rawImportance;

    Object.keys(importanceObj).forEach((k) => {
      if (k.includes("$") || k === "undefined") delete importanceObj[k];
    });

    const featureImportance = Object.entries(importanceObj).reduce(
      (acc, [k, v]) => {
        acc[fiturMap[k]] = v;
        return acc;
      },
      {},
    );

    const faktorDominan = Object.entries(featureImportance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => k);

    /* =========================
       REKOMENDASI
    ========================= */
    const rekomendasiData = await Rekomendasi.findOne({
      kode: kodeTerpilih,
    });

    if (!rekomendasiData) {
      return res.send("Rekomendasi tidak ditemukan");
    }

    /* =========================
       SESSION + PLANNER
    ========================= */
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

    /* =========================
       🔥 ALASAN (BARU)
    ========================= */
    const alasan = generateAlasan(userData, faktorDominan);

    /* =========================
       DESKRIPSI
    ========================= */
    const deskripsiAI = `Rekomendasi ini disesuaikan dengan kondisi kamu, terutama pada ${faktorDominan.join(
      " dan ",
    )}.`;

    /* =========================
       SIMPAN
    ========================= */
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

        deskripsi: deskripsiAI,
        tips: rekomendasiData.tips_base || [],
        alasan: alasan, // 🔥 FIX DI SINI
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

/* =========================
   RIWAYAT
========================= */
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
