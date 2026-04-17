document.addEventListener("DOMContentLoaded", function () {
  const modalEl = document.getElementById("detailModal");

  if (!modalEl) {
    console.error("Modal tidak ditemukan");
    return;
  }

  document.querySelectorAll(".btn-detail").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      console.log("klik tombol detail");

      document.getElementById("modalNama").innerText = this.dataset.nama || "-";
      document.getElementById("modalSkor").innerText = this.dataset.skor || "-";
      document.getElementById("modalJudul").innerText =
        this.dataset.judul || "-";
      document.getElementById("modalWaktu").innerText =
        this.dataset.waktu || "-";
      document.getElementById("modalPola").innerText = this.dataset.pola || "-";
      document.getElementById("modalDeskripsi").innerText =
        this.dataset.deskripsi || "-";

      let tips = [];
      try {
        tips = JSON.parse(this.dataset.tips || "[]");
      } catch (err) {
        console.error("Error parsing tips:", err);
      }

      const tipsContainer = document.getElementById("modalTips");

      tipsContainer.innerHTML = tips
        .map(
          (t) => `
          <li class="d-flex align-items-start gap-2 mb-2 p-2 rounded-2 bg-light border">
            <span class="text-success fw-bold">✔</span>
            <span>${t}</span>
          </li>
        `,
        )
        .join("");

      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());

      modalEl.classList.add("show");
      modalEl.style.display = "block";
      modalEl.removeAttribute("aria-hidden");
      modalEl.setAttribute("aria-modal", "true");

      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop fade show";
      backdrop.id = "custom-backdrop";
      backdrop.style.pointerEvents = "none";
      document.body.appendChild(backdrop);

      document.body.classList.add("modal-open");
    });
  });

  document.querySelectorAll('[data-bs-dismiss="modal"]').forEach((btn) => {
    btn.addEventListener("click", function () {
      closeModal();
    });
  });

  function closeModal() {
    modalEl.classList.remove("show");
    modalEl.style.display = "none";
    modalEl.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      e.preventDefault();
    }
  });

  modalEl.addEventListener("click", function (e) {
    if (e.target === modalEl) {
      e.stopPropagation();
    }
  });
});
