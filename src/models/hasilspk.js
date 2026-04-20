import mongoose from "../config/db.js";

const hasilSpk = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
    },
    gender: String,
    usia: Number,
    status: String,

    aktivitas: {
      type: String,
      required: true,
    },

    waktu_luang: {
      type: String,
      enum: ["pagi", "siang", "sore", "malam", "fleksibel"],
      required: true,
    },

    konsentrasi: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    konsistensi: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    durasi: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    kelelahan: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    lingkungan: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    gangguan: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    skor: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    rekomendasi: {
      kode: Number,
      judul: String,
      waktu: String,
      pola: String,
      deskripsi: String,
      tips: [String],
      alasan: [String],
      faktor: [String],
    },
  },
  {
    timestamps: true,
  },
);

const hasilSpkCollection = mongoose.model("HasilSpk", hasilSpk);

export default hasilSpkCollection;
