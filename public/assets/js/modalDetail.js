document.addEventListener("DOMContentLoaded", function () {
  const modalEl = document.getElementById("detailModal");

  document.querySelectorAll(".btn-detail").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      const data = this.dataset;

      setText("modalNama", data.nama);
      setText("modalSkor", data.skor + "%");
      setText("modalJudul", data.judul);
      setText("modalWaktu", data.waktu);
      setText("modalPola", data.pola);

      renderJadwal("modalJadwal", parseJSON(data.jadwal));

      renderFaktor("modalFaktor", parseJSON(data.faktor));

      renderTips("modalTips", parseJSON(data.tips));

      const narasi = buildNarasi(
        parseJSON(data.ai_path),
        parseJSON(data.faktor),
      );

      document.getElementById("modalNarasi").innerText = narasi;

      openModal(modalEl);
    });
  });

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

  function renderJadwal(id, jadwal) {
    const el = document.getElementById(id);
    if (!el) return;

    if (!jadwal.length) {
      el.innerHTML = "<p class='text-muted'>Jadwal belum tersedia</p>";
      return;
    }

    el.innerHTML = jadwal
      .map((j) => {
        const warna = j.type === "Belajar" ? "#e8f5e9" : "#fff3e0";

        return `
          <div style="display:flex; justify-content:space-between; padding:6px; margin-bottom:6px; background:${warna}; border-radius:6px;">
            <span>
              ${j.type === "Belajar" ? "Sesi " + j.sesi : "Istirahat"}
            </span>
            <strong>${j.waktu}</strong>
          </div>
        `;
      })
      .join("");
  }

  function renderFaktor(id, items) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = items.length
      ? `<div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${items
            .map((f) => `<span class="badge bg-warning text-dark">${f}</span>`)
            .join("")}
         </div>`
      : "<span class='text-muted'>-</span>";
  }

  function renderTips(id, items) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = items.length
      ? items.map((i) => `<li>- ${i}</li>`).join("")
      : "<li class='text-muted'>-</li>";
  }

  function buildNarasi(aiPath, faktor) {
    const hasil = [];

    (aiPath || []).forEach((step) => {
      if (step.includes("Konsentrasi"))
        hasil.push("konsentrasi kamu masih belum optimal");
      if (step.includes("Konsistensi"))
        hasil.push("konsistensi belajar kamu masih belum stabil");
      if (step.includes("Durasi"))
        hasil.push("durasi belajar kamu masih terbatas");
      if (step.includes("Kelelahan"))
        hasil.push("kamu mudah merasa lelah saat belajar");
      if (step.includes("Lingkungan"))
        hasil.push("lingkungan belajar kurang kondusif");
      if (step.includes("Gangguan"))
        hasil.push("terdapat banyak gangguan saat belajar");
    });

    const unique = [...new Set(hasil)];

    return `
Berdasarkan analisis sistem, ditemukan bahwa ${unique.join(", ")}. 
Kondisi ini menyebabkan proses belajar menjadi kurang optimal.

Oleh karena itu, sistem merekomendasikan metode belajar yang lebih sesuai,
terutama dengan mempertimbangkan faktor ${faktor.join(" dan ")}.
    `;
  }

  function openModal(modalEl) {
    modalEl.classList.add("show");
    modalEl.style.display = "block";
    document.body.classList.add("modal-open");

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop show";
    document.body.appendChild(backdrop);
  }

  document.querySelectorAll('[data-bs-dismiss="modal"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      modalEl.classList.remove("show");
      modalEl.style.display = "none";
      document.body.classList.remove("modal-open");

      document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());
    });
  });
});
