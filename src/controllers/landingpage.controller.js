import hasilSpkCollection from "../models/hasilspk.js";
import Rekomendasi from "../models/rekomendasi.js";

const getAllHasilSpk = async (req, res) => {
  const total = await hasilSpkCollection.countDocuments();

  function formatNumber(num) {
    if (num >= 1000000) return Math.floor(num / 1000000) + "M+";
    if (num >= 1000) return Math.floor(num / 1000) + "K+";
    return num.toString();
  }

  res.render("landingpage/index", {
    layout: "layouts/main",
    totalResponden: formatNumber(total),
  });
};

function getRekomendasi(data) {
  const { skor, aktivitas, kelelahan, konsentrasi, gangguan, lingkungan } =
    data;

  const act = aktivitas.toLowerCase();

  if (skor >= 0.85) {
    if (kelelahan <= 2) return 8;
    return 18;
  }

  if (skor >= 0.7) {
    if (act === "tinggi") return 1;
    if (gangguan >= 4) return 19;
    return 9;
  }

  if (skor >= 0.55) {
    if (konsentrasi >= 4) return 2;
    if (lingkungan <= 2) return 14;
    return 3;
  }

  if (skor >= 0.4) {
    if (kelelahan >= 4) return 7;
    if (gangguan >= 4) return 15;
    return 5;
  }

  if (skor >= 0.25) {
    if (konsentrasi <= 2) return 6;
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
    });

    const rekomendasiData = await Rekomendasi.findOne({
      kode: kodeTerpilih,
    });

    let kategori = "";

    if (skor >= 0.75) kategori = "Optimal";
    else if (skor >= 0.5) kategori = "Cukup";
    else kategori = "Perlu Perbaikan";

    if (!rekomendasiData) {
      return res.send("Rekomendasi tidak ditemukan");
    }

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

      skor: Number(skor.toFixed(3)),

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
      skor: skor.toFixed(3),
      rekomendasi: data.rekomendasi || {},
      kategori,
    });
  } catch (err) {
    console.error(err);
    res.send("Terjadi kesalahan");
  }
};

export { getAllHasilSpk, postHitung };
