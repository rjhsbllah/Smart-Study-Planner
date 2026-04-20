document.addEventListener("DOMContentLoaded", function () {
  const modalEl = document.getElementById("detailModal");

  document.querySelectorAll(".btn-detail").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      const data = this.dataset;

      setText("modalNama", data.nama);
      setText("modalSkor", data.skor);
      setText("modalJudul", data.judul);
      setText("modalWaktu", data.waktu);
      setText("modalPola", data.pola);
      setText("modalDeskripsi", data.deskripsi);

      setText("modalGender", data.gender);
      setText("modalUsia", data.usia);
      setText("modalStatus", data.status);
      setText("modalAktivitas", data.aktivitas);

      setText("modalWaktuLuang", data.waktu_luang);
      setText("modalKonsentrasi", labelSkala(data.konsentrasi));
      setText("modalKonsistensi", labelSkala(data.konsistensi));
      setText("modalDurasi", labelSkala(data.durasi));
      setText("modalKelelahan", labelSkala(data.kelelahan));
      setText("modalLingkungan", labelSkala(data.lingkungan));
      setText("modalGangguan", labelSkala(data.gangguan));

      renderList("modalTips", parseJSON(data.tips));
      renderList("modalAlasan", parseJSON(data.alasan));

      renderFaktor("modalFaktor", parseJSON(data.faktor));

      openModal(modalEl);
    });
  });

  document.querySelectorAll('[data-bs-dismiss="modal"]').forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  function closeModal() {
    modalEl.classList.remove("show");
    modalEl.style.display = "none";
    document.body.classList.remove("modal-open");

    const backdrop = document.getElementById("custom-backdrop");
    if (backdrop) backdrop.remove();
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "-";
  }

  function parseJSON(data) {
    try {
      return JSON.parse(data || "[]");
    } catch {
      return [];
    }
  }

  function renderList(id, items) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = items.length
      ? items.map((i) => `<li>• ${i}</li>`).join("")
      : "<li class='text-muted'>-</li>";
  }

  function renderFaktor(id, items) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = items.length
      ? `<div class="faktor-wrapper">
          ${items
            .map((f) => `<span class="faktor-badge">${formatFaktor(f)}</span>`)
            .join("")}
         </div>`
      : "<span class='text-muted'>-</span>";
  }

  function formatFaktor(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function labelSkala(val) {
    const map = {
      1: "Rendah",
      2: "Sedang",
      3: "Tinggi",
    };
    return map[val] || val || "-";
  }

  function openModal(modalEl) {
    modalEl.classList.add("show");
    modalEl.style.display = "block";
    document.body.classList.add("modal-open");

    const oldBackdrop = document.getElementById("custom-backdrop");
    if (oldBackdrop) oldBackdrop.remove();

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop show";
    backdrop.id = "custom-backdrop";
    document.body.appendChild(backdrop);
  }
});
