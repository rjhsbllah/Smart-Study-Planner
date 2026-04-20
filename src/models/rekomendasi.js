import mongoose from "../config/db.js";

const rekomendasiSchema = new mongoose.Schema({
  kode: Number,
  judul: String,

  waktu_default: String,
  pola_default: String,

  deskripsi_base: String,
  tips_base: [String],
});

const Rekomendasi = mongoose.model(
  "Rekomendasi",
  rekomendasiSchema,
  "rekomendasilist",
);

export default Rekomendasi;
