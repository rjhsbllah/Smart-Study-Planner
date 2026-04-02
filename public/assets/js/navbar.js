document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      const target = this.getAttribute("href");

      if (target.startsWith("#")) {
        // Jika elemen ada di halaman saat ini → scroll smooth
        if (document.querySelector(target)) {
          e.preventDefault();
          document.querySelector(target).scrollIntoView({ behavior: "smooth" });
        } else {
          // Jika tidak ada → redirect ke landing page + scroll
          window.location.href = "/" + target;
        }
      }
    });
  });
});
