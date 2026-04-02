import mongoose from "../config/db.js";

const rekomendasiSchema = new mongoose.Schema({
  kode: Number,
  judul: String,
  waktu: String,
  pola: String,
  deskripsi: String,
  tips: [String],
});

const Rekomendasi = mongoose.model(
  "Rekomendasi",
  rekomendasiSchema,
  "rekomendasilist",
);

export default Rekomendasi;
