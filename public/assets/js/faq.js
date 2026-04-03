// list faq
const faqData = [
  {
    question: "Apa itu Smart Study Planner?",
    answer:
      "Smart Study Planner adalah aplikasi yang membantu kamu menemukan cara belajar yang paling cocok dan nyaman sesuai dengan kebiasaanmu.",
  },
  {
    question: "Kenapa saya perlu mengisi form ini?",
    answer:
      "Dengan mengisi form ini, kamu bisa mendapatkan saran belajar yang lebih personal dan sesuai dengan kondisi kamu sehari-hari.",
  },
  {
    question: "Apakah saya harus menjawab semua pertanyaan?",
    answer:
      "Iya, supaya hasil rekomendasinya lebih akurat dan benar-benar sesuai dengan gaya belajarmu.",
  },
  {
    question: "Berapa lama waktu untuk mengisi pertanyaan-pertanyaan ini?",
    answer: "Tidak lama kok, hanya sekitar 1–2 menit saja.",
  },
  {
    question: "Apakah jawaban saya akan mempengaruhi hasil?",
    answer:
      "Tentu saja. Jawaban kamu akan digunakan untuk menentukan rekomendasi belajar yang paling cocok buat kamu.",
  },
  {
    question: "Apa yang akan saya dapatkan setelah mengisi?",
    answer:
      "Kamu akan mendapatkan rekomendasi waktu belajar, durasi belajar, dan cara belajar yang lebih efektif.",
  },
  {
    question: "Apakah hasilnya pasti cocok untuk saya?",
    answer:
      "Hasilnya adalah saran terbaik berdasarkan jawabanmu, tapi kamu tetap bisa menyesuaikannya sesuai kebutuhanmu.",
  },
  {
    question: "Bolehkah saya mengisi ulang pertanyaan?",
    answer:
      "Boleh banget! Kamu bisa mengisi ulang kapan saja kalau kebiasaan belajarmu berubah.",
  },
  {
    question: "Kalau saya sering malas belajar, apakah fitur ini membantu?",
    answer:
      "Bisa! Kamu akan mendapatkan saran belajar yang lebih ringan dan bertahap supaya tidak terasa berat.",
  },
  {
    question: "Apakah cocok untuk pelajar dan mahasiswa?",
    answer:
      "Ya, fitur ini cocok untuk pelajar, mahasiswa, maupun siapa saja yang ingin belajar lebih teratur.",
  },
  {
    question: "Apakah saya bisa mengikuti rekomendasi secara fleksibel?",
    answer:
      "Tentu. Rekomendasi ini tidak mengikat, kamu bebas menyesuaikannya dengan aktivitas harianmu.",
  },
  {
    question: "Bagaimana kalau saya mudah terdistraksi saat belajar?",
    answer:
      "Tenang, sistem akan menyesuaikan saran belajar agar kamu bisa tetap fokus meskipun sering terdistraksi.",
  },
  {
    question: "Apakah saya bisa meningkatkan hasil belajar dengan ini?",
    answer:
      "Dengan jadwal dan cara belajar yang lebih teratur, peluang kamu untuk belajar lebih efektif tentu akan meningkat.",
  },
  {
    question: "Apakah saya bisa menggunakan ini setiap hari?",
    answer:
      "Bisa. Kamu bahkan disarankan untuk menggunakannya secara rutin agar hasilnya lebih maksimal.",
  },
  {
    question: "Apa manfaat utama menggunakan Smart Study Planner?",
    answer:
      "Membantu kamu belajar lebih terarah, menghemat waktu, dan membuat proses belajar jadi lebih nyaman dan tidak membingungkan.",
  },
];

const accordionContainer = document.getElementById("accordion");

// create function to generated faqData from arry faqData
function generatedAccordionItems(faqData) {
  faqData.forEach((item) => {
    const accordionItem = document.createElement("div");

    accordionItem.classList.add("accordion-item");

    // Create elemet to header
    const header = document.createElement("button");
    header.classList.add("accordion-header");
    header.textContent = item.question;

    // Create element for content
    const content = document.createElement("div");
    content.classList.add("accordion-content");

    const contentText = document.createElement("p");
    contentText.textContent = item.answer;

    // insert element to html
    content.appendChild(contentText);
    accordionItem.appendChild(header);
    accordionItem.appendChild(content);

    // add accordion item to accordion-container
    accordionContainer.appendChild(accordionItem);
  });
}

//call dunction generated faq
generatedAccordionItems(faqData);

// get element accordion header
const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach((header) => {
  header.addEventListener("click", () => {
    header.classList.toggle("active");
    const accordionContent = header.nextElementSibling;

    if (header.classList.contains("active")) {
      accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
    } else {
      accordionContent.style.maxHeight = 0;
    }

    accordionHeaders.forEach((otherHeader) => {
      if (otherHeader !== header && otherHeader.classList.contains("active")) {
        otherHeader.classList.remove("active");
        otherHeader.nextElementSibling.style.maxHeight = 0;
      }
    });
  });
});
