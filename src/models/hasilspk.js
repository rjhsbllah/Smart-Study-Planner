import mongoose from "../config/db.js";

const hasilSpk = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  usia: {
    type: Number,
  },
  status: {
    type: String,
  },
  aktivitas: {
    type: String,
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
  },

  rekomendasi: {
    kode: Number,
    judul: String,
    waktu: String,
    pola: String,
    deskripsi: String,
    tips: [String],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const hasilSpkCollection = mongoose.model("HasilSpk", hasilSpk);

export default hasilSpkCollection;
