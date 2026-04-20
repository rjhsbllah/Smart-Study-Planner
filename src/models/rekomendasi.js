import connectDB from "../config/db.js";

const rekomendasiSchema = new connectDB.Schema({
  kode: Number,
  judul: String,

  waktu_default: String,
  pola_default: String,

  deskripsi_base: String,
  tips_base: [String],
});

const Rekomendasi = connectDB.model(
  "Rekomendasi",
  rekomendasiSchema,
  "rekomendasilist",
);

export default Rekomendasi;
