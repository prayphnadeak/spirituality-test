let questions = [];
let answerStatus = [];
let pathsMap = {};
let currentQuestion = 0;

/* ----------  TAMBAHAN BARU  ---------- */
// Apakah seluruh pertanyaan telah dijawab?
function isAllAnswered() {
  return answerStatus.every(status => status === 'answered');
}
/* ------------------------------------- */

// Load data pertanyaan dan jalur spiritual
function loadQuestions() {
  const data = {
    paths: {
      Ritual: [0, 1],
      Intelektual: [2, 3],
      Sosial: [4, 5],
      Devosi: [6, 7],
      Mistik: [8, 9],
      Kontemplasi: [10, 11]
    },
    questions: [
      { text: "Hal Yang Terpenting Dari Sebuah Agama Itu Adalah Kegiatan Peribadahannya", path: "Ritual" },
      { text: "Simbol-Simbol Dalam Beribadah Berfungsi Untuk Menolong Saya Merasakan Hadirat Tuhan Allah", path: "Ritual" },
      { text: "Hal yang terpenting dalam beragama adalah dapat memahami Alkitab secara kritis dan analitis", path: "Intelektual" },
      { text: "Saya dapat menjelaskan secara logis atas perubahan spiritual yang saya rasakan", path: "Intelektual" },
      { text: "Jika terjadi penindasan atau ketidakadilan terhadap  suatu kelompok masyarakat, sebagai orang yang religius maka saya perlu menegakkan keadilan dan melakukan perubahan pada masyarakat", path: "Sosial" },
      { text: "Memberikan bantuan dan aksi sosial, merupakan sebuah cara saya merasakan berkat dan hadirat Tuhan", path: "Sosial" },
      { text: "Saat saya melakukan saat teduh secara pribadi, saya merasa bahwa diri saya sedang berhubungan langsung dengan Tuhan", path: "Devosi" },
      { text: "Saya lebih suka membuka relasi kepada Tuhan / Yang Maha Mulia secara personal", path: "Devosi" },
      { text: "Saya percaya bahwasanya dalam dunia ini, terdapat kekuatan roh yang memiliki jenis yang berbeda-beda dan fungsi berbeda dalam membantu menyelesaikan masalah saya.", path: "Mistik" },
      { text: "Menurut saya seni pengobatan tradisional leluhur, perlu dilestarikan.", path: "Mistik" },
      { text: "Saya merasa dalam usaha menghayati iman saya kepada Tuhan, saya harus menjauhkan diri saya dari urusan keduniaan terlebih dahulu.", path: "Kontemplasi" },
      { text: "Pertobatan rohani adalah suatu hal penting yang harus saya lakukan terus menerus.", path: "Kontemplasi" }
    ]
  };

  questions = data.questions.map(q => ({
    ...q,
    choices: ["Sangat Tidak Setuju", "Tidak Setuju", "Setuju", "Sangat Setuju"]
  }));
  pathsMap = data.paths;
  answerStatus = Array(questions.length).fill(null);
  injectQuestionsToHTML();
  loadQuestion();
}

// Inject semua pertanyaan ke HTML
function injectQuestionsToHTML() {
  const questionnaireForm = document.getElementById("questionnaireForm");
  questionnaireForm.innerHTML = ""; // Kosongkan dulu
  questions.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question-box";
    questionDiv.innerHTML = `
      <p>${q.text}</p>
      <div class="choices">
        ${q.choices.map((choice, i) => `
          <label>
            <input type="radio" name="q${index + 1}" value="${i + 1}">
            ${choice}
          </label>
        `).join("")}
      </div>
    `;
    questionnaireForm.appendChild(questionDiv);
  });

  // Event listener untuk radio button
  const allRadios = document.querySelectorAll('input[type="radio"]');
  allRadios.forEach(radio => {
    radio.addEventListener("change", selectAnswer);
  });
}

// Load pertanyaan aktif
function loadQuestion() {
  const allQuestions = document.querySelectorAll(".question-box");
  allQuestions.forEach((q, i) => {
    q.style.display = i === currentQuestion ? "block" : "none";
  });

  renderPagination();
  updateButtonState(); // Ganti updateNavButtonsVisibility()
}

// Perlihatkan/sembunyikan tombol navigasi
function updateNavButtonsVisibility() {
  document.getElementById("prevBtn").style.display = currentQuestion === 0 ? "none" : "inline-block";
  document.getElementById("nextBtn").style.display = currentQuestion === questions.length - 1 ? "none" : "inline-block";
}

// Tampilkan tombol submit hanya jika 12 pertanyaan terjawab & berada di pertanyaan terakhir
function showSubmitIfLastQuestion(index, total) {
  const submitSection = document.getElementById("submitSection");
  const nextBtn       = document.getElementById("nextBtn");

  if (index === total - 1 && isAllAnswered()) {
    submitSection.style.display = "block";
    nextBtn.style.display       = "none";   // tidak perlu 'Selanjutnya' lagi
  } else {
    submitSection.style.display = "none";
    // Sesuaikan kembali visibilitas nextBtn melalui helper
    updateNavButtonsVisibility();
  }
}


// Cek jawaban
function selectAnswer(event) {
  const group = document.querySelectorAll(`.question-box:nth-child(${currentQuestion + 1}) input[type="radio"]`);
  let selected = false;
  group.forEach(r => {
    if (r.checked) selected = true;
  });
  answerStatus[currentQuestion] = selected ? 'answered' : null;

  renderPagination();
  updateButtonState(); // Ganti showSubmitIfLastQuestion()
}


// Render pagination
function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 0; i < questions.length; i++) {
    const btn = document.createElement("button");
    btn.innerText = i + 1;
    btn.className = "page-btn";
    if (i === currentQuestion) btn.classList.add("active");
    if (answerStatus[i]) btn.classList.add("correct-page");
    btn.onclick = () => {
      currentQuestion = i;
      loadQuestion();
    };
    pagination.appendChild(btn);
  }
}

// Hitung hasil …  (TIDAK BERUBAH)
function calculateResult() {
  const scoreMapping = {
    1: 12.5,   // Sangat Tidak Setuju
    2: 25,   // Tidak Setuju
    3: 37.5,   // Setuju
    4: 50   // Sangat Setuju
  };

  const scores = {
    Ritual: 0,
    Intelektual: 0,
    Sosial: 0,
    Devosi: 0,
    Mistik: 0,
    Kontemplasi: 0
  };

  questions.forEach((q, index) => {
    const answerElement = document.querySelector(`.question-box:nth-child(${index + 1}) input[type="radio"]:checked`);
    const answerValue = answerElement ? parseInt(answerElement.value) : null;

    if (answerValue && scoreMapping[answerValue]) {
      const path = q.path;
      scores[path] += scoreMapping[answerValue];
    }
  });

  // Simpan ke localStorage
  localStorage.setItem("spiritualScores", JSON.stringify(scores));
}

// Tampilkan hasil dan arahkan ke halaman detail
function showResultPage() {
  calculateResult();
  window.location.href = "result.html";
}

// Navigasi
function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
}

function nextQuestion() {
  const group = document.querySelectorAll(`.question-box:nth-child(${currentQuestion + 1}) input[type="radio"]`);
  let anyChecked = false;
  group.forEach(r => {
    if (r.checked) anyChecked = true;
  });

  if (!anyChecked) {
    alert("Silakan pilih salah satu jawaban.");
    return;
  }

  answerStatus[currentQuestion] = 'answered';
  renderPagination();

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    showResultPage();
  }
}

// Submit form langsung tampilkan hasil
document.getElementById("questionnaireForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  showResultPage(); // Tampilkan hasil langsung
});

// Load pertama kali
window.onload = () => {
  // Bagian 1: Load pertanyaan dan update tombol
  loadQuestions();
  updateButtonState();

  // Bagian 2: Ambil skor dari localStorage jika tersedia
  const storedScores = localStorage.getItem("spiritualScores");

  if (storedScores) {
    const spiritualScores = JSON.parse(storedScores);
    const labels = ["Ritual", "Intelektual", "Sosial", "Devosi", "Mistik", "Kontemplasi"];
    const data = labels.map(label => parseFloat(spiritualScores[label] || 0));

    // Render radar chart di sini (kode tidak disediakan)
    
    // Hitung jalur terbaik
    let highestAvg = 0;
    let bestPath = "";
    for (const path in spiritualScores) {
      const avg = spiritualScores[path];
      if (avg > highestAvg) {
        highestAvg = avg;
        bestPath = path;
      }
    }

    // Tampilkan hasil jalur terbaik dan deskripsi
    document.getElementById("highestPath").textContent = bestPath;
    document.getElementById("highestScore").textContent = highestAvg.toFixed(2);

    const descriptions = {
      Ritual: "Fokus pada ritual liturgis, simbol-simbol, arsitektur sakral, sakramen, dan elemen estetis dalam ibadah.",
      Intelektual: "Mencari pemahaman mendalam melalui studi kitab suci dan refleksi kritis.",
      Sosial: "Menghayati iman melalui aksi sosial dan perjuangan keadilan.",
      Devosi: "Berhubungan langsung secara personal dengan Tuhan dalam doa dan saat teduh.",
      Mistik: "Mencari pengalaman transendental melalui roh, alam gaib, atau praktik tradisional.",
      Kontemplasi: "Menjauhkan diri dari dunia untuk mendekatkan diri kepada Tuhan."
    };

    document.getElementById("description").innerHTML = `<em>${descriptions[bestPath]}</em>`;
  } else {
    // Jika belum ada data, tampilkan pesan
    detailContent.innerHTML = "<p>Data belum tersedia. Silakan isi kuesioner terlebih dahulu.</p>";
  }
};

// Fungsi untuk update status tombol
function updateButtonState() {
  const submitBtn = document.getElementById("submitBtn");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  prevBtn.style.display = currentQuestion === 0 ? "none" : "inline-block";
  nextBtn.style.display = "inline-block";

  if (isAllAnswered()) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
  } else {
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.6";
    submitBtn.style.cursor = "not-allowed";
  }
}

// Navigasi ke halaman penjelasan
document.getElementById("viewExplanationBtn").addEventListener("click", function () {
  window.location.href = "details.html";
});