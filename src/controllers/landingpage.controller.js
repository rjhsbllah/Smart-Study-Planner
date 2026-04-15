import hasilSpkCollection from "../models/hasilspk.js";
import Rekomendasi from "../models/rekomendasi.js";

const getAllHasilSpk = async (req, res) => {
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

  if (skor >= 0.1) {
    return 12;
  }

  return 10;
}

const postHitung = async (req, res) => {
  try {
    const {
      nama,
      gender,
      usia,
      status,
      aktivitas,
      konsentrasi,
      konsistensi,
      durasi,
      kelelahan,
      lingkungan,
      gangguan,
    } = req.body;

    const bobot = {
      konsentrasi: 0.2,
      konsistensi: 0.2,
      durasi: 0.15,
      kelelahan: 0.15,
      lingkungan: 0.15,
      gangguan: 0.15,
    };

    const normalisasi = {
      konsentrasi: Number(konsentrasi) / 5,
      konsistensi: Number(konsistensi) / 5,
      durasi: Number(durasi) / 5,
      kelelahan: Number(kelelahan) / 5,
      lingkungan: Number(lingkungan) / 5,
      gangguan: Number(gangguan) / 5,
    };

    const skor =
      normalisasi.konsentrasi * bobot.konsentrasi +
      normalisasi.konsistensi * bobot.konsistensi +
      normalisasi.durasi * bobot.durasi +
      normalisasi.kelelahan * bobot.kelelahan +
      normalisasi.lingkungan * bobot.lingkungan +
      normalisasi.gangguan * bobot.gangguan;

    const kodeTerpilih = getRekomendasi({
      skor,
      aktivitas,
      kelelahan: Number(kelelahan),
      konsentrasi: Number(konsentrasi),
      gangguan: Number(gangguan),
      lingkungan: Number(lingkungan),
      durasi: Number(durasi),
      konsistensi: Number(konsistensi),
    });

    const rekomendasiData = await Rekomendasi.findOne({
      kode: kodeTerpilih,
    });

    if (!rekomendasiData) {
      return res.send("Rekomendasi tidak ditemukan");
    }

    const skorPersen = Math.round(skor * 100);
    const data = await hasilSpkCollection.create({
      nama,
      gender,
      usia: Number(usia),
      status,
      aktivitas,

      konsentrasi: Number(konsentrasi),
      konsistensi: Number(konsistensi),
      durasi: Number(durasi),
      kelelahan: Number(kelelahan),
      lingkungan: Number(lingkungan),
      gangguan: Number(gangguan),

      skor: skorPersen,

      rekomendasi: {
        kode: rekomendasiData.kode,
        judul: rekomendasiData.judul,
        waktu: rekomendasiData.waktu,
        pola: rekomendasiData.pola,
        deskripsi: rekomendasiData.deskripsi,
        tips: rekomendasiData.tips,
      },
    });

    res.render("hasil/index", {
      layout: "layouts/main",
      data,
      skor: skorPersen,
      rekomendasi: data.rekomendasi || {},
    });
  } catch (err) {
    console.error(err);
    res.send("Terjadi kesalahan");
  }
};

const getRiwayat = async (req, res) => {
  try {
    const riwayat = await hasilSpkCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.render("riwayat/index", {
      layout: "layouts/main",
      riwayat,
      title: "Riwayat Rekomendasi",
    });
  } catch (error) {
    console.error("Error getRiwayat:", error);

    res.status(500).render("error", {
      layout: "layouts/main",
      message: "Gagal mengambil data riwayat",
    });
  }
};

export { getAllHasilSpk, postHitung, getRiwayat };
