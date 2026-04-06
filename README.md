# SPK (Sistem Pendukung Keputusan)

Project ini adalah aplikasi berbasis **Node.js** menggunakan **Express.js** dengan template engine **EJS**. Aplikasi ini digunakan untuk membangun sistem pendukung keputusan (SPK).

---

## Fitur Utama

- Backend menggunakan **Express.js**
- Template engine **EJS**
- Database menggunakan **MongoDB** dengan **Mongoose**
- Upload file dengan **Multer**
- Session & authentication support
- Flash message
- Styling dengan **SASS**

---

## Dependencies

Project ini menggunakan beberapa library utama:

- express
- ejs
- mongoose
- dotenv
- multer
- express-session
- express-flash
- body-parser
- cookie-parser
- sass

(Semua dependency dapat dilihat di file package.json)

---

## Requirements

Pastikan kamu sudah menginstall:

- Node.js (>= 18 disarankan)
- npm (>= 9)
- MongoDB (local atau cloud seperti MongoDB Atlas)

---

## Installation

1. Clone repository:

```bash
git clone <url-repository>
cd spk
```

2. Install dependencies:

```bash
npm install
```

---

## Environment Variables

Buat file `.env` di root project, lalu isi contoh berikut:

```env
MONGO_URI=your_mongodb_connection
```

---

## Running Project

Jalankan mode development:

```bash
npm run dev
```

Script ini menggunakan **nodemon** untuk auto-restart server saat ada perubahan file.

---

## Struktur Folder (umum)

```
src/
 ├── config/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── views/
public/
```

---

## Scripts

- `npm run dev` → menjalankan server dengan nodemon
- `npm test` → default (belum digunakan)

---

## File yang Tidak Di-push

Pastikan file berikut tidak di-upload ke GitHub:

```
node_modules/
.env
rekomendasi.json
```

---

## Author

- Nama: R Hasbullah
- Project: Skripsi Sistem Pendukung Keputusan Penentuan Pola dan Waktu Belajar Berbasis Web Menggunakan Metode Simple Additive Weighting (SAW)

---

## License

ISC
