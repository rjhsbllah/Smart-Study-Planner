document.addEventListener("DOMContentLoaded", function () {
  const modalEl = document.getElementById("detailModal");

  if (!modalEl) {
    console.error("Modal tidak ditemukan");
    return;
  }

  const modal = new bootstrap.Modal(modalEl);

  document.querySelectorAll(".btn-detail").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      console.log("klik tombol detail"); // 🔥 debug

      document.getElementById("modalNama").innerText = this.dataset.nama;
      document.getElementById("modalSkor").innerText = this.dataset.skor;
      document.getElementById("modalJudul").innerText = this.dataset.judul;
      document.getElementById("modalWaktu").innerText = this.dataset.waktu;
      document.getElementById("modalPola").innerText = this.dataset.pola;
      document.getElementById("modalDeskripsi").innerText =
        this.dataset.deskripsi;

      const tips = JSON.parse(this.dataset.tips || "[]");

      const tipsContainer = document.getElementById("modalTips");
      tipsContainer.innerHTML = tips.map((t) => `<li>${t}</li>`).join("");

      modal.show();
    });
  });
});
