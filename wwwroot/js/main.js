function openTab(tabId) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    document.querySelectorAll("nav button").forEach(btn => btn.classList.remove("active"));
    event.target && event.target.classList.add("active");
}

// Make openTab available globally for inline onclick
window.openTab = openTab;


function sendMessage() {
    const input = document.getElementById("chatInput");
    const chatbox = document.getElementById("chatbox");

    if (input.value.trim() !== "") {
        chatbox.innerHTML += `<p><b>You:</b> ${input.value}</p>`;
        chatbox.innerHTML += `<p><b>Bot:</b> (AI trả lời ở đây)</p>`;
        input.value = "";
        chatbox.scrollTop = chatbox.scrollHeight;
    }
}


function showAuth(type) {
    document.getElementById("authModal").style.display = "block";
    document.getElementById("loginForm").style.display = type === "login" ? "block" : "none";
    document.getElementById("registerForm").style.display = type === "register" ? "block" : "none";
}

function closeAuth() {
    document.getElementById("authModal").style.display = "none";
}

async function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    if (!user || !pass) {
        alert("⚠️ Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
        return;
    }

    try {
        const body = {
            TenDangNhap: user,
            MatKhau: pass
        };

        const response = await fetch("/Auth/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (!response.ok) {
            alert("❌ " + (result.message || "Đăng nhập thất bại!"));
            return;
        }

        alert("✅ đc r " + result.message + "\nXin chào " + result.user.TenDangNhap);

        document.getElementById("userNameDisplay").textContent = result.user.TenDangNhap;

        sessionStorage.setItem("userName", result.user.TenDangNhap);
        sessionStorage.setItem("userId", result.user.MaNguoiDung);

        closeAuth();
    } catch (err) {
        console.error("Lỗi khi đăng nhập:", err);
        alert("⚠️ Đã xảy ra lỗi kết nối tới server!");
    }
}


async function register() {
    console.log("✅ Hàm register() đã được gọi!");
    const username = document.getElementById("regUser").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPass").value.trim();

    if (!username || !email || !password) {
        alert("⚠️ Vui lòng nhập đầy đủ Tên đăng nhập, Email và Mật khẩu zô zô.");
        return;
    }

    try {
        const res = await fetch("https://localhost:7290/Auth/Register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                TenDangNhap: username,
                Email: email,
                MatKhau: password
            })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                alert("🎉 " + data.message + "\nChào mừng " + data.user.tenDangNhap + "!");
                closeAuth();
            } else {
                alert("⚠️ " + data.message);
            }
        } else {
            const err = await res.json();
            alert("❌ Lỗi khi đăng ký: " + (err.message || "Không xác định"));
        }


    } catch (error) {
        console.error("Lỗi fetch:", error);
        alert("❌ Không thể kết nối tới server!");
    }
}



/// Phát âm
async function playAudio(word) {
    const res = await fetch(`http://localhost:5000/api/vocab/pronounce?word=${word}`);
    if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        new Audio(url).play();
    } else {
        alert("Không phát được âm thanh!");
    }
}

// Lưu từ vựng
async function saveWord(word) {
    const res = await fetch("http://localhost:5000/api/vocab/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word })
    });
    if (res.ok) {
        alert("Đã lưu từ: " + word);
    } else {
        alert("Không thể lưu từ!");
    }
}

// Ghi âm phát âm
document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startRecordingBtn");
    const stopBtn = document.getElementById("stopRecordingBtn");
    const audioPlayer = document.getElementById("audioPlayer");
    const statusDiv = document.getElementById("speechStatus");
    const resultDiv = document.getElementById("speechResult");

    let mediaRecorder;
    let audioChunks = [];

    // 🎤 Bắt đầu ghi âm
    startBtn.addEventListener("click", async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            audioChunks = [];

            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

            // Khi dừng ghi -> xử lý file và gửi đi
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                audioPlayer.src = URL.createObjectURL(audioBlob);
                audioPlayer.style.display = "block";

                statusDiv.textContent = "⏳ Đang gửi file lên server...";
                resultDiv.innerHTML = "";

                try {
                    // 🔹 Gửi file cùng từ chuẩn hiện tại
                    await sendAudioToServer(audioBlob);
                    statusDiv.textContent = "✅ Đã chấm điểm xong!";
                } catch (err) {
                    console.error("Upload failed:", err);
                    statusDiv.textContent = "❌ Gửi thất bại!";
                }

                stopBtn.disabled = true;
                startBtn.disabled = false;
            };

            mediaRecorder.start();
            startBtn.disabled = true;
            stopBtn.disabled = false;
            statusDiv.textContent = "🎙️ Đang ghi âm...";
            resultDiv.innerHTML = "";
        } catch (err) {
            console.error("Mic error:", err);
            statusDiv.textContent = "❌ Không truy cập được micro!";
        }
    });

    // ⏹️ Dừng ghi âm
    stopBtn.addEventListener("click", () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            statusDiv.textContent = "⏹️ Đã dừng ghi âm, đang xử lý...";
        } else {
            statusDiv.textContent = "⚠️ Không có ghi âm nào đang chạy!";
        }
    });
});


// --- HIỂN THỊ & LẤY TỪ RANDOM TỪ BACKEND ---
async function loadRandomWord() {
    const randomWordDiv = document.getElementById("randomWord");
    randomWordDiv.textContent = "⏳ Đang tải...";
    try {
        const res = await fetch("/Speech/Index", {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!res.ok) throw new Error("Không tải được từ.");
        const data = await res.json();

        randomWordDiv.textContent = data.randomWord;
        window.currentWord = data.randomWord; // 🔹 Lưu để chấm phát âm
    } catch (err) {
        randomWordDiv.textContent = "❌ Lỗi tải từ";
        console.error(err);
    }
}

document.getElementById("newWordBtn")?.addEventListener("click", loadRandomWord);
loadRandomWord();


// --- GỬI FILE ÂM THANH + TỪ CHUẨN LÊN SERVER ---
async function sendAudioToServer(blob) {
    const formData = new FormData();
    formData.append("audio", blob, "recorded.webm");
    formData.append("referenceText", window.currentWord || ""); // 🔹 Từ hiện tại

    const res = await fetch("/Speech/Check", {
        method: "POST",
        body: formData
    });

    const resultDiv = document.getElementById("speechResult");
    if (res.ok) {
        const html = await res.text();
        resultDiv.innerHTML = html;
    } else {
        resultDiv.textContent = "❌ Lỗi khi chấm điểm.";
    }
}


// Kiểm tra ngữ pháp
async function checkGrammar() {
    const text = document.querySelector("#writing textarea").value;
    if (!text.trim()) return alert("Nhập văn bản trước!");

    const res = await fetch("http://localhost:5000/api/writing/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });

    if (res.ok) {
        const data = await res.json();
        alert("Kết quả: " + data.corrections);
    } else {
        alert("Không kiểm tra được ngữ pháp!");
    }
}

// Sinh câu hỏi trắc nghiệm
async function generateQuestions() {
    const res = await fetch("http://localhost:5000/api/reading/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Lorem ipsum..." })
    });

    if (res.ok) {
        const data = await res.json();
        alert("Sinh câu hỏi: " + JSON.stringify(data));
    } else {
        alert("Không tạo được câu hỏi!");
    }
}

// Gửi đáp án (per-question API; preserved for compatibility)
async function submitAnswer(answer) {
    const res = await fetch("http://localhost:5000/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 1, answer })
    });

    if (res.ok) {
        const data = await res.json();
        alert("Kết quả: " + (data.correct ? "Đúng" : "Sai"));
    } else {
        alert("Không gửi được đáp án!");
    }
}


async function loadProgress() {
    const res = await fetch("http://localhost:5000/api/progress");
    if (res.ok) {
        const data = await res.json();
        document.querySelector("#progress progress:nth-of-type(1)").value = data.vocab;
        document.querySelector("#progress progress:nth-of-type(2)").value = data.listening;
        document.querySelector("#progress progress:nth-of-type(3)").value = data.writing;
    }
}

window.addEventListener("DOMContentLoaded", function () {
    const userName = sessionStorage.getItem("userName");
    if (userName) {
        const el = document.getElementById("userNameDisplay");
        if (el) el.textContent = userName;
    }
});
async function uploadAndRecognize() {
    const fileInput = document.getElementById("ocrFile");
    const preview = document.getElementById("previewImage");
    const resultEl = document.getElementById("ocrResult");
    const status = document.getElementById("ocrStatus");

    const file = fileInput.files[0];
    if (!file) {
        alert("Vui lòng chọn ảnh để nhận diện.");
        return;
    }

    // 🔹 Hiển thị ảnh preview
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = "block";

    // 🔹 Reset kết quả
    resultEl.textContent = "";
    status.textContent = "⏳ Đang gửi ảnh lên và chờ AI đánh giá...";

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/Ocr/RecognizeAndEvaluate", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText);
        }

        const data = await response.json();

        // ✅ Chỉ hiển thị phần evaluation (bỏ recognized_text)
        if (data.evaluation) {
            resultEl.textContent = data.evaluation;
            status.textContent = "✅ Hoàn tất!";
            status.style.color = "green";
        } else {
            status.textContent = "⚠️ Không nhận được đánh giá.";
            resultEl.textContent = JSON.stringify(data, null, 2);
        }

    } catch (err) {
        console.error(err);
        status.textContent = "❌ Lỗi khi đánh giá: " + err.message;
        status.style.color = "red";
    } finally {
        URL.revokeObjectURL(url);
    }
}
document.getElementById("btnOcr")?.addEventListener("click", uploadAndRecognize);

// --- QUIZ / EXAM FLOW IMPLEMENTATION ---

// Quiz state
//let quizQuestions = []; // each { id, question, choices: {A,B,C,D}, correct: 'A' }
//let currentIndex = 0;
//let totalQuestions = 10;
//let correctCount = 0;
//let answered = false;
//let autoAdvanceTimeout = 800; // ms

// Expose functions globally for inline handlers
window.startQuiz = startQuiz;
window.selectAnswer = selectAnswer;
window.nextQuestion = nextQuestion;

async function startQuiz() {
    currentIndex = 0;
    correctCount = 0;
    answered = false;
    document.getElementById("quizResult").style.display = "none";
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("startQuizBtn").style.display = "none";
    document.getElementById("progressInfo").textContent = "";

    try {
        // ✅ Gọi API backend để lấy câu hỏi
        const res = await fetch(`https://localhost:7290/api/Exam/GetQuestions?count=${totalQuestions}`);
        if (!res.ok) throw new Error("Không thể tải câu hỏi từ server");

        const data = await res.json();

        // ✅ Chuẩn hóa dữ liệu cho frontend
        quizQuestions = data.map(q => ({
            id: q.ma_cau,
            question: q.noi_dung,
            choices: q.luaChon.reduce((acc, lc, idx) => {
                const letter = String.fromCharCode(65 + idx); // A,B,C,D...
                acc[letter] = lc.noi_dung;
                if (lc.la_dap_an) acc.correct = letter;
                return acc;
            }, {})
        }));

        // Cắt giới hạn 10 câu
        quizQuestions = quizQuestions.slice(0, totalQuestions);

    } catch (err) {
        console.error("❌ Lỗi khi tải câu hỏi:", err);
        alert("Không thể tải câu hỏi từ server, vui lòng thử lại sau.");
        return;
    }

    document.getElementById("totalQuestions").textContent = totalQuestions;

    document.querySelectorAll(".answer-btn").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("correct", "incorrect", "selected");
    });

    loadQuestion();
}

function loadQuestion() {
    answered = false;
    const q = quizQuestions[currentIndex];
    if (!q) return finishQuiz();

    document.getElementById("questionNumber").textContent = currentIndex + 1;
    document.getElementById("examQuestion").textContent = q.question;

    const buttons = document.querySelectorAll(".answer-btn");
    buttons.forEach(btn => {
        const choice = btn.getAttribute("data-choice");
        btn.textContent = `${choice}. ${q.choices[choice] || ''}`;
        btn.disabled = false;
        btn.classList.remove("correct", "incorrect", "selected");
    });

    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("progressInfo").textContent = `Đã đúng ${correctCount} / ${currentIndex} câu`;
}

function selectAnswer(choice) {
    if (answered) return;
    answered = true;

    const q = quizQuestions[currentIndex];
    const correct = q.choices.correct;

    document.querySelectorAll(".answer-btn").forEach(btn => {
        const c = btn.getAttribute("data-choice");
        btn.disabled = true;
        if (c === correct) btn.classList.add("correct");
        if (c === choice && c !== correct) btn.classList.add("incorrect");
    });

    if (choice === correct) correctCount++;

    document.getElementById("progressInfo").textContent = `Đã đúng ${correctCount} / ${currentIndex + 1} câu`;

    if (currentIndex < totalQuestions - 1) {
        setTimeout(() => {
            currentIndex++;
            loadQuestion();
        }, autoAdvanceTimeout);
    } else {
        setTimeout(() => finishQuiz(), autoAdvanceTimeout);
    }
}

function nextQuestion() {
    if (currentIndex < totalQuestions - 1) {
        currentIndex++;
        loadQuestion();
    } else {
        finishQuiz();
    }
}

async function finishQuiz() {
    document.querySelectorAll(".answer-btn").forEach(btn => btn.disabled = true);
    document.getElementById("quizResult").style.display = "block";
    document.getElementById("resultText").textContent = `Bạn đúng ${correctCount} trên ${totalQuestions} câu.`;

    // ✅ Gửi kết quả về backend
    try {
        const userId = sessionStorage.getItem("userId") || null;
        await fetch("https://localhost:7290/api/Exam/SubmitQuiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                total: totalQuestions,
                correct: correctCount,
                details: quizQuestions.map(q => ({
                    id: q.id,
                    question: q.question
                }))
            })
        });
    } catch (e) {
        console.warn("Gửi kết quả thất bại:", e);
    }

    document.getElementById("startQuizBtn").style.display = "inline-block";
    document.getElementById("nextBtn").style.display = "none";
}


// --- End quiz flow implementation ---





// ======================
// FLASHCARDS FUNCTIONALITY WITH PAGINATION
// ======================

//let flashcards = [];
//let currentPage = 1;
//let pageSize = 10; // Number of flashcards per page
//let totalPages = 1;
//let totalCount = 0;
//let practiceSession = null;
//let currentPracticeWord = null;
//let selectedChoice = null;
//let maxAttempts = 2; // Number of attempts allowed per exercise
//let incorrectAnswers = []; // Track incorrect answers for retry


// Load user's flashcards with pagination
async function loadFlashcards(page = 1) {
    try {
        currentPage = page;
        const response = await fetch(`/api/FlashcardsAPI?page=${page}&pageSize=${pageSize}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Không thể tải flashcards');

        const result = await response.json();
        console.log('Raw API response:', result);

        if (result.success && result.data) {
            flashcards = result.data.items || [];
            totalCount = result.data.totalCount || 0;
            totalPages = result.data.totalPages || 1;
            currentPage = result.data.page || 1;
            pageSize = result.data.pageSize || pageSize;

            displayFlashcards();
            renderPagination();
        } else {
            throw new Error(result.message || 'Dữ liệu không hợp lệ');
        }
    } catch (error) {
        console.error('Error loading flashcards:', error);
        alert('Lỗi khi tải flashcards: ' + error.message);
    }
}

// Display flashcards for current page
function displayFlashcards() {
    const grid = document.getElementById('flashcardsGrid');
    const emptyState = document.getElementById('emptyFlashcards');

    console.log('Displaying flashcards:', flashcards);

    if (!flashcards || flashcards.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    try {
        grid.innerHTML = flashcards.map((card, index) => {
            console.log(`Card ${index}:`, card);

            // Use camelCase properties (what the API actually returns)
            const word = card.tu || 'Không có từ';
            const meaning = card.nghia || 'Không có nghĩa';
            const image = card.hinhAnh || '';
            const example = card.viDu || '';
            const id = card.maTu || index;

            return `
                <div class="flashcard-item">
                    <div class="flashcard-content">
                        <h3>${word}</h3>
                        <p class="meaning">${meaning}</p>
                        ${image ? `<img src="${image}" alt="${word}" class="flashcard-image" />` : ''}
                        ${example ? `<p class="example"><small>VD: ${example}</small></p>` : ''}
                    </div>
                    <div class="flashcard-actions">
                        <button class="action" onclick="removeFlashcard(${id})">🗑️ Xóa</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error rendering flashcards:', error);
        grid.innerHTML = '<div class="error">Lỗi hiển thị flashcards</div>';
    }
}

// Render pagination controls
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        // Create pagination container if it doesn't exist
        const grid = document.getElementById('flashcardsGrid');
        const paginationHTML = `
            <div id="paginationContainer" class="pagination-container">
                <div class="pagination-info">
                    Hiển thị ${flashcards.length} trên tổng số ${totalCount} flashcards
                </div>
                <div class="pagination-controls">
                    ${createPaginationHTML()}
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('afterend', paginationHTML);
    } else {
        // Update existing pagination
        paginationContainer.innerHTML = `
            <div class="pagination-info">
                Hiển thị ${flashcards.length} trên tổng số ${totalCount} flashcards
            </div>
            <div class="pagination-controls">
                ${createPaginationHTML()}
            </div>
        `;
    }
}

// Create pagination HTML
function createPaginationHTML() {
    if (totalPages <= 1) return '';

    let paginationHTML = '';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="loadFlashcards(${currentPage - 1})">‹ Trước</button>`;
    } else {
        paginationHTML += `<button class="pagination-btn disabled" disabled>‹ Trước</button>`;
    }

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="loadFlashcards(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="pagination-btn" onclick="loadFlashcards(${i})">${i}</button>`;
        }
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="loadFlashcards(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="loadFlashcards(${currentPage + 1})">Tiếp ›</button>`;
    } else {
        paginationHTML += `<button class="pagination-btn disabled" disabled>Tiếp ›</button>`;
    }

    return paginationHTML;
}

// Change page size
function changePageSize(newSize) {
    pageSize = parseInt(newSize);
    currentPage = 1; // Reset to first page when changing page size
    loadFlashcards(currentPage);
}

// Remove flashcard
async function removeFlashcard(tuVungId) {
    if (!confirm('Bạn có chắc chắc muốn xóa flashcard này?')) return;

    try {
        const response = await fetch(`/api/FlashcardsAPI/${tuVungId}`, {
            method: 'DELETE',
            credentials: 'include' // Include credentials here too
        });

        if (response.ok) {
            await loadFlashcards(currentPage); // Reload the list
        } else {
            throw new Error('Xóa thất bại');
        }
    } catch (error) {
        console.error('Error removing flashcard:', error);
        alert('Lỗi khi xóa flashcard: ' + error.message);
    }
}

// Start practice session
async function startPractice() {
    try {
        // Always fetch ALL flashcards for practice, not just current page
        const response = await fetch('/api/FlashcardsAPI/all', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Không thể tải flashcards');

        const result = await response.json();
        let allFlashcards = [];

        if (result.success) {
            allFlashcards = result.data;
        } else {
            throw new Error(result.message);
        }

        if (allFlashcards.length === 0) {
            alert('Bạn cần có ít nhất một flashcard để bắt đầu luyện tập!');
            return;
        }

        practiceSession = {
            allFlashcards: allFlashcards,
            remainingWords: [],
            completedWords: [],
            currentPhase: 'InitialReview',
            totalWords: Math.min(10, allFlashcards.length)
        };

        // Select random words from ALL flashcards
        const randomWords = [...allFlashcards]
            .sort(() => Math.random() - 0.5)
            .slice(0, practiceSession.totalWords);

        practiceSession.remainingWords = randomWords.map(word => ({
            word: word,
            difficulty: null
        }));

        // Hide flashcards grid and show practice section
        document.getElementById('practiceSection').style.display = 'block';
        document.getElementById('flashcardsGrid').style.display = 'none';
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }

        showNextPracticeWord();

    } catch (error) {
        console.error('Error starting practice:', error);
        alert('Lỗi khi bắt đầu luyện tập: ' + error.message);
    }
}

// Show next practice word
function showNextPracticeWord() {
    if (practiceSession.remainingWords.length === 0) {
        if (practiceSession.currentPhase === 'InitialReview') {
            setupExercises();
        } else {
            finishPractice();
        }
        return;
    }

    currentPracticeWord = practiceSession.remainingWords[0];

    let progress, progressText;

    if (practiceSession.currentPhase === 'InitialReview') {
        const completedInPhase = practiceSession.completedWords.length;
        progress = (completedInPhase * 100) / practiceSession.totalWords;
        progressText = `${completedInPhase} / ${practiceSession.totalWords}`;
    } else {
        // In Exercises phase, calculate progress based on exercise words
        const totalExercises = practiceSession.remainingWords.length + practiceSession.completedWords.filter(w => w.exerciseType).length;
        const completedExercises = practiceSession.completedWords.filter(w => w.exerciseType).length;
        progress = (completedExercises * 100) / totalExercises;
        progressText = `${completedExercises} / ${totalExercises}`;
    }

    // Ensure progress doesn't exceed 100%
    progress = Math.min(progress, 100);

    document.getElementById('practiceProgress').style.width = progress + '%';
    document.getElementById('progressText').textContent = progressText;

    if (practiceSession.currentPhase === 'InitialReview') {
        showFlashcardReview();
    } else {
        showExercise();
    }
}

// Show flashcard for review
function showFlashcardReview() {
    console.log('showFlashcardReview called');
    console.log('currentPracticeWord:', currentPracticeWord);
    console.log('word properties:', {
        tu: currentPracticeWord?.word?.tu,
        nghia: currentPracticeWord?.word?.nghia,
        hinhAnh: currentPracticeWord?.word?.hinhAnh,
        viDu: currentPracticeWord?.word?.viDu
    });

    document.getElementById('flashcardReview').style.display = 'block';
    document.getElementById('exerciseSection').style.display = 'none';
    document.getElementById('practiceComplete').style.display = 'none'; // Hide completion

    // Use camelCase properties
    document.getElementById('practiceWord').textContent = currentPracticeWord.word.tu || 'No word';
    document.getElementById('practiceMeaning').textContent = currentPracticeWord.word.nghia || 'No meaning';
    document.getElementById('practiceMeaning').style.display = 'none';

    const imageEl = document.getElementById('practiceImage');
    if (currentPracticeWord.word.hinhAnh) {
        imageEl.src = currentPracticeWord.word.hinhAnh;
        imageEl.style.display = 'block';
    } else {
        imageEl.style.display = 'none';
    }
}

// Submit difficulty rating
function submitDifficulty(difficulty) {
    currentPracticeWord.difficulty = difficulty;
    practiceSession.completedWords.push(currentPracticeWord);
    practiceSession.remainingWords.shift();

    showNextPracticeWord();
}

// Setup exercises after initial review
function setupExercises() {
    practiceSession.currentPhase = 'Exercises';
    const mediumHardWords = practiceSession.completedWords
        .filter(w => w.difficulty === 'Medium' || w.difficulty === 'Hard')
        .map(w => w.word);

    if (mediumHardWords.length === 0) {
        mediumHardWords.push(...practiceSession.completedWords
            .slice(0, Math.min(3, practiceSession.completedWords.length))
            .map(w => w.word));
    }

    practiceSession.remainingWords = mediumHardWords.map(word => ({
        word: word,
        exerciseType: word.viDu ? (Math.random() > 0.5 ? 'MultipleChoice' : 'FillInBlank') : 'MultipleChoice',
        choices: generateMultipleChoiceOptions(word, mediumHardWords),
        userAnswer: null,
        attempts: 0,
        correct: false
    }));

    // Reset incorrect answers for new exercise session
    incorrectAnswers = [];

    showNextPracticeWord();
}

// Generate multiple choice options
function generateMultipleChoiceOptions(correctWord, allWords) {
    const options = [correctWord.nghia]; // camelCase
    const otherWords = allWords.filter(w => w.maTu !== correctWord.maTu); // camelCase
    const usedMeanings = new Set([correctWord.nghia]); // camelCase

    while (options.length < 4 && otherWords.length > 0) {
        const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
        if (!usedMeanings.has(randomWord.nghia)) { // camelCase
            options.push(randomWord.nghia); // camelCase
            usedMeanings.add(randomWord.nghia); // camelCase
        }
    }

    // Add generic options if needed
    const genericOptions = ['không biết', 'cần tra cứu', 'chưa học'];
    while (options.length < 4) {
        const genericOption = genericOptions[options.length - 1];
        if (!usedMeanings.has(genericOption)) {
            options.push(genericOption);
            usedMeanings.add(genericOption);
        }
    }

    return options.sort(() => Math.random() - 0.5);
}

// Show exercise
function showExercise() {
    document.getElementById('flashcardReview').style.display = 'none';
    document.getElementById('exerciseSection').style.display = 'block';
    document.getElementById('practiceComplete').style.display = 'none'; // Hide completion

    selectedChoice = null;

    if (currentPracticeWord.exerciseType === 'MultipleChoice') {
        showMultipleChoiceExercise();
    } else {
        showFillInBlankExercise();
    }
}

// Show multiple choice exercise
function showMultipleChoiceExercise() {
    document.getElementById('multipleChoiceExercise').style.display = 'block';
    document.getElementById('fillBlankExercise').style.display = 'none';

    document.getElementById('mcWord').textContent = currentPracticeWord.word.tu; // camelCase

    const choicesContainer = document.getElementById('choicesContainer');
    choicesContainer.innerHTML = currentPracticeWord.choices.map((choice, index) => `
        <div class="choice-item" onclick="selectChoice(this, '${choice}')">
            ${String.fromCharCode(65 + index)}. ${choice}
        </div>
    `).join('');
}

// Show fill in blank exercise
function showFillInBlankExercise() {
    document.getElementById('multipleChoiceExercise').style.display = 'none';
    document.getElementById('fillBlankExercise').style.display = 'block';

    document.getElementById('fillMeaning').textContent = currentPracticeWord.word.nghia; // camelCase

    const example = currentPracticeWord.word.viDu || ''; // camelCase
    const word = currentPracticeWord.word.tu; // camelCase
    const blankExample = example.replace(new RegExp(word, 'gi'), '__________');
    document.getElementById('fillExample').textContent = blankExample;

    document.getElementById('fillAnswer').value = '';
}

// Select choice in multiple choice
function selectChoice(element, choice) {
    document.querySelectorAll('.choice-item').forEach(item => {
        item.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedChoice = choice;
}

// Submit exercise answer
function submitExerciseAnswer() {
    if (!selectedChoice) {
        alert('Vui lòng chọn một đáp án!');
        return;
    }

    const correctAnswer = currentPracticeWord.word.nghia;
    const isCorrect = selectedChoice === correctAnswer;

    currentPracticeWord.userAnswer = selectedChoice;
    currentPracticeWord.attempts++;
    currentPracticeWord.correct = isCorrect;

    showExerciseFeedback(isCorrect, correctAnswer);
}

// Submit fill in blank answer
function submitFillAnswer() {
    const answer = document.getElementById('fillAnswer').value.trim();
    if (!answer) {
        alert('Vui lòng điền từ vào chỗ trống!');
        return;
    }

    const correctAnswer = currentPracticeWord.word.tu;
    const isCorrect = answer.toLowerCase() === correctAnswer.toLowerCase();

    currentPracticeWord.userAnswer = answer;
    currentPracticeWord.attempts++;
    currentPracticeWord.correct = isCorrect;

    showExerciseFeedback(isCorrect, correctAnswer);
}

// Show exercise feedback
function showExerciseFeedback(isCorrect, correctAnswer) {
    const feedbackEl = document.getElementById('exerciseFeedback');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const nextBtn = document.getElementById('nextExerciseBtn');
    const retryBtn = document.getElementById('retryExerciseBtn');

    feedbackEl.style.display = 'block';

    if (isCorrect) {
        feedbackEl.style.backgroundColor = '#d4edda';
        feedbackEl.style.border = '1px solid #c3e6cb';
        feedbackMessage.innerHTML = `
            <div style="color: #155724;">
                <strong>✅ Chính xác!</strong><br>
                "${currentPracticeWord.word.tu}" có nghĩa là "${correctAnswer}"
            </div>
        `;
        nextBtn.style.display = 'inline-block';
        retryBtn.style.display = 'none';
    } else {
        feedbackEl.style.backgroundColor = '#f8d7da';
        feedbackEl.style.border = '1px solid #f5c6cb';
        feedbackMessage.innerHTML = `
            <div style="color: #721c24;">
                <strong>❌ Chưa chính xác!</strong><br>
                Đáp án đúng: "${correctAnswer}"<br>
                Bạn đã trả lời: "${currentPracticeWord.userAnswer}"
            </div>
        `;

        if (currentPracticeWord.attempts < maxAttempts) {
            retryBtn.style.display = 'inline-block';
            nextBtn.style.display = 'none';
        } else {
            // Max attempts reached
            feedbackMessage.innerHTML += `<br><em>Bạn đã hết lượt thử cho từ này.</em>`;
            nextBtn.style.display = 'inline-block';
            retryBtn.style.display = 'none';

            // Add to incorrect answers for retry later
            incorrectAnswers.push(currentPracticeWord);
        }
    }
}

// Retry current exercise
function retryExercise() {
    const feedbackEl = document.getElementById('exerciseFeedback');
    feedbackEl.style.display = 'none';

    // Reset the exercise UI based on type
    if (currentPracticeWord.exerciseType === 'MultipleChoice') {
        // Clear selected choice
        document.querySelectorAll('.choice-item').forEach(item => {
            item.classList.remove('selected');
        });
        selectedChoice = null;
    } else {
        // Clear fill blank input
        document.getElementById('fillAnswer').value = '';
        document.getElementById('fillAnswer').focus();
    }
}

// Move to next exercise after feedback
function nextAfterFeedback() {
    const feedbackEl = document.getElementById('exerciseFeedback');
    feedbackEl.style.display = 'none';

    practiceSession.completedWords.push(currentPracticeWord);
    practiceSession.remainingWords.shift();

    showNextPracticeWord();
}

// Show retry section at the end
function showRetrySection() {
    if (incorrectAnswers.length > 0) {
        const retrySection = document.getElementById('retrySection');
        const retryWordsList = document.getElementById('retryWordsList');

        retryWordsList.innerHTML = `
            <p>Có <strong>${incorrectAnswers.length}</strong> từ bạn cần ôn tập lại:</p>
            <ul>
                ${incorrectAnswers.map(word => `<li><strong>${word.word.tu}</strong> - ${word.word.nghia}</li>`).join('')}
            </ul>
        `;

        retrySection.style.display = 'block';
    } else {
        finishPractice();
    }
}

// Start retry session
function startRetrySession() {
    practiceSession.remainingWords = incorrectAnswers.map(incorrectWord => ({
        ...incorrectWord,
        attempts: 0,
        userAnswer: null,
        correct: false
    }));

    incorrectAnswers = []; // Reset for the retry session

    document.getElementById('retrySection').style.display = 'none';
    document.getElementById('exerciseSection').style.display = 'block';
    document.getElementById('practiceComplete').style.display = 'none';

    showNextPracticeWord();
}

// Finish practice
function finishPractice() {
    document.getElementById('flashcardReview').style.display = 'none';
    document.getElementById('exerciseSection').style.display = 'none';
    document.getElementById('practiceComplete').style.display = 'block';

    const easyCount = practiceSession.completedWords.filter(w => w.difficulty === 'Easy').length;
    const mediumCount = practiceSession.completedWords.filter(w => w.difficulty === 'Medium').length;
    const hardCount = practiceSession.completedWords.filter(w => w.difficulty === 'Hard').length;

    // Calculate exercise accuracy
    const exerciseWords = practiceSession.completedWords.filter(w => w.exerciseType);
    const correctExercises = exerciseWords.filter(w => w.correct).length;
    const totalExercises = exerciseWords.length;
    const accuracy = totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0;

    document.getElementById('practiceSummary').innerHTML = `
        <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0; flex-wrap: wrap;">
            <div class="stat">
                <span class="stat-number">${easyCount}</span>
                <span class="stat-label">Dễ</span>
            </div>
            <div class="stat">
                <span class="stat-number">${mediumCount}</span>
                <span class="stat-label">Trung bình</span>
            </div>
            <div class="stat">
                <span class="stat-number">${hardCount}</span>
                <span class="stat-label">Khó</span>
            </div>
            <div class="stat">
                <span class="stat-number">${accuracy}%</span>
                <span class="stat-label">Độ chính xác</span>
            </div>
        </div>
        <p>Tổng số từ đã ôn tập: ${practiceSession.completedWords.length}</p>
        ${totalExercises > 0 ? `<p>Bài tập: ${correctExercises}/${totalExercises} đúng</p>` : ''}
    `;

    // Show retry section if there are incorrect answers
    if (incorrectAnswers.length > 0) {
        showRetrySection();
    }
}

// Reset practice
function resetPractice() {
    document.getElementById('practiceSection').style.display = 'none';
    document.getElementById('retrySection').style.display = 'none';

    // Show the flashcards grid and pagination
    document.getElementById('flashcardsGrid').style.display = 'grid';
    const paginationContainer = document.getElementById('paginationContainer');
    if (paginationContainer) {
        paginationContainer.style.display = 'block';
    }

    // Reset practice state
    practiceSession = null;
    currentPracticeWord = null;
    incorrectAnswers = [];
}

// ======================
// CHATBOT FUNCTIONALITY
// ======================

let chatSessions = {
    currentChatId: null,
    chats: {},
    username: '',
    gender: 'Other'
};

// Initialize Multi-Chat System
function initializeMultiChat() {
    loadAllChatSessions();
    renderChatList();
    switchToCurrentChat();
}

// Load all chat sessions from localStorage
function loadAllChatSessions() {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
        chatSessions = JSON.parse(savedSessions);
    }

    // Initialize if empty
    if (!chatSessions.chats) {
        chatSessions.chats = {};
    }

    // Create default chat if no chats exist
    if (Object.keys(chatSessions.chats).length === 0) {
        createNewChat();
    }
}

// Save all chat sessions to localStorage
function saveAllChatSessions() {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
}

// Create a new chat
function createNewChat() {
    const chatId = 'chat_' + Date.now();
    const newChat = {
        id: chatId,
        title: 'Cuộc trò chuyện mới',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0
    };

    chatSessions.chats[chatId] = newChat;
    chatSessions.currentChatId = chatId;

    saveAllChatSessions();
    renderChatList();
    switchToCurrentChat();

    return chatId;
}

// Switch to a specific chat
function switchToChat(chatId) {
    if (!chatSessions.chats[chatId]) return;

    chatSessions.currentChatId = chatId;
    saveAllChatSessions();
    switchToCurrentChat();
}

// Switch to current chat
function switchToCurrentChat() {
    const currentChat = getCurrentChat();

    if (currentChat) {
        document.getElementById('currentChatTitle').textContent = currentChat.title;
        displayChatMessages(currentChat.messages);
        updateChatInfo(currentChat);
        updateMessageCount();

        // Update username if available
        if (chatSessions.username) {
            document.getElementById('username').value = chatSessions.username;
        }
    } else {
        // No chat selected
        document.getElementById('chatMessages').innerHTML = `
            <div class="empty-chat" style="text-align: center; color: #666; padding: 40px 20px;">
                <div style="font-size: 48px;">💬</div>
                <h4>Chưa có cuộc trò chuyện nào</h4>
                <p>Nhấn "Cuộc trò chuyện mới" để bắt đầu!</p>
            </div>
        `;
        document.getElementById('messageCount').textContent = '💬 0 tin nhắn';
        document.getElementById('chatInfo').textContent = '';
    }
}

// Get current chat object
function getCurrentChat() {
    return chatSessions.chats[chatSessions.currentChatId];
}

// Render chat list in sidebar
function renderChatList() {
    const chatList = document.getElementById('chatList');
    const chats = Object.values(chatSessions.chats);

    // Sort by updated time (newest first)
    chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    if (chats.length === 0) {
        chatList.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">Chưa có cuộc trò chuyện nào</div>';
        return;
    }

    chatList.innerHTML = chats.map(chat => `
        <div class="chat-item ${chat.id === chatSessions.currentChatId ? 'active' : ''}" 
             onclick="switchToChat('${chat.id}')"
             style="padding: 10px; margin: 5px 0; border-radius: 6px; cursor: pointer; 
                    background: ${chat.id === chatSessions.currentChatId ? '#007bff' : 'transparent'};
                    color: ${chat.id === chatSessions.currentChatId ? 'white' : 'inherit'};
                    border: 1px solid ${chat.id === chatSessions.currentChatId ? '#007bff' : '#ddd'};">
            <div style="font-weight: 500; margin-bottom: 4px;">${chat.title}</div>
            <div style="font-size: 0.8em; opacity: 0.7;">
                ${chat.messageCount} tin nhắn • ${formatDate(chat.updatedAt)}
            </div>
            <div class="chat-item-actions" style="margin-top: 5px; display: flex; gap: 5px;">
                <button class="btn-small" onclick="event.stopPropagation(); renameChat('${chat.id}')" 
                        style="padding: 2px 6px; font-size: 0.7em;">✏️</button>
                <button class="btn-small btn-danger" onclick="event.stopPropagation(); deleteChat('${chat.id}')" 
                        style="padding: 2px 6px; font-size: 0.7em;">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
}

// Update user info
function updateUserInfo() {
    const username = document.getElementById('username').value.trim();
    const gender = document.getElementById('gender').value;

    if (!username) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    chatSessions.username = username;
    chatSessions.gender = "Other";
    saveAllChatSessions();
    alert('Thông tin đã được cập nhật!');
}

// Send chat message
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) {
        alert('Vui lòng nhập tin nhắn!');
        return;
    }
    // Ensure we have a current chat
    if (!chatSessions.currentChatId || !getCurrentChat()) {
        createNewChat();
    }

    const currentChat = getCurrentChat();

    // Auto-set username if empty
    if (!chatSessions.username) {
        const username = document.getElementById('username').value.trim();
        if (!username) {
            alert('Vui lòng cập nhật tên của bạn trước!');
            return;
        }
        chatSessions.username = username;
        chatSessions.gender = "Other"; // Auto-set gender
    }

    // Add user message
    addMessageToChat('user', chatSessions.username, message);
    input.value = '';

    // Update chat title if first message
    if (currentChat.messages.length === 1) {
        const newTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
        currentChat.title = newTitle;
        document.getElementById('currentChatTitle').textContent = newTitle;
    }

    // Show typing indicator
    const typingIndicator = addMessageToChat('bot', 'English Assistant', 'Đang trả lời...');

    try {
        const formData = new URLSearchParams({
            userQuestion: message,
            username: chatSessions.username,
            gender: "Other"
        });

        const response = await fetch('/Chatbot/Index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const responseText = await response.text();

        // Remove typing indicator
        typingIndicator.remove();

        // Check if we got a valid response or an error page
        let botResponse;
        if (responseText.includes('Xin lỗi') || responseText.includes('lỗi') || responseText.includes('error')) {
            botResponse = getFallbackResponse(message);
        } else {
            const parser = new DOMParser();
            const doc = parser.parseFromString(responseText, 'text/html');
            botResponse = extractBotMessage(doc) || getFallbackResponse(message);
        }

        addMessageToChat('bot', 'English Assistant', botResponse);

        // Update chat metadata
        currentChat.updatedAt = new Date().toISOString();
        currentChat.messageCount = currentChat.messages.length;
        saveAllChatSessions();
        renderChatList();

    } catch (error) {
        console.error('Chat error:', error);
        typingIndicator.remove();

        // Use fallback response
        const fallbackResponse = getFallbackResponse(message);
        addMessageToChat('bot', 'English Assistant', fallbackResponse);
    }
}

// Extract bot message from HTML response
function extractBotMessage(doc) {
    // Try to find the bot message in the rendered HTML
    const botMessages = doc.querySelectorAll('.bot-message .message-text');
    if (botMessages.length > 0) {
        return botMessages[botMessages.length - 1].textContent;
    }
    return null;
}

// Fallback responses for common questions
function getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hiện tại đơn') || lowerMessage.includes('present simple')) {
        return `Thì hiện tại đơn (Present Simple) được dùng để:<br><br>
        • Diễn tả thói quen: <em>"I drink coffee every morning."</em><br>
        • Diễn tả sự thật hiển nhiên: <em>"The sun rises in the east."</em><br>
        • Diễn tả lịch trình: <em>"The train leaves at 8 PM."</em><br><br>
        Công thức: S + V(s/es) + O<br>
        Ví dụ: <em>"She works in an office."</em>`;
    }
    else if (lowerMessage.includes('phát âm') || lowerMessage.includes('pronunciation')) {
        return `Để cải thiện phát âm, bạn có thể:<br><br>
        • Nghe và bắt chước người bản xứ<br>
        • Ghi âm và so sánh với bản gốc<br>
        • Học phiên âm quốc tế (IPA)<br>
        • Luyện tập với tongue twisters<br>
        • Sử dụng app hỗ trợ phát âm`;
    }
    else if (lowerMessage.includes('make') && lowerMessage.includes('do')) {
        return `Phân biệt "make" và "do":<br><br>
        <strong>DO</strong> - dùng cho:<br>
        • Công việc, nhiệm vụ: do homework, do work<br>
        • Hoạt động chung: do exercise, do business<br><br>
        <strong>MAKE</strong> - dùng cho:<br>
        • Tạo ra thứ gì đó: make a cake, make noise<br>
        • Quyết định: make a decision, make plans`;
    }
    else if (lowerMessage.includes('giao tiếp') || lowerMessage.includes('conversation')) {
        return `Để luyện tập giao tiếp:<br><br>
        • Tìm partner để nói chuyện hàng ngày<br>
        • Xem phim với phụ đề tiếng Anh<br>
        • Nghe podcast và nhại lại<br>
        • Tham gia câu lạc bộ tiếng Anh<br>
        • Đừng sợ mắc lỗi - cứ nói thoải mái!`;
    }
    else {
        return `Xin lỗi, hiện tại tôi đang gặp sự cố kỹ thuật. Tuy nhiên, tôi có thể giúp bạn với:<br><br>
        • Ngữ pháp tiếng Anh<br>
        • Từ vựng và phát âm<br>
        • Mẹo học tiếng Anh hiệu quả<br>
        • Luyện tập giao tiếp<br><br>
        Hãy thử hỏi cụ thể hơn!`;
    }
}


// Add message to chat display
function addMessageToChat(messageType, sender, message) {
    const currentChat = getCurrentChat();
    if (!currentChat) return null;

    const chatMessages = document.getElementById('chatMessages');

    // Remove empty state if it exists
    const emptyChat = chatMessages.querySelector('.empty-chat');
    if (emptyChat) {
        emptyChat.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = `message ${messageType === 'user' ? 'user-message' : 'bot-message'}`;
    messageElement.innerHTML = `
            <div class="message-avatar">
                ${messageType === 'user' ? '👤' : '🤖'}
            </div>
            <div class="message-content">
                <div class="message-sender">${sender}</div>
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add to current chat's messages array
    currentChat.messages.push({
        Sender: sender,
        Message: message,
        Timestamp: new Date().toISOString(),
        MessageType: messageType
    });

    // Update chat metadata
    currentChat.updatedAt = new Date().toISOString();

    // Save and update UI
    saveAllChatSessions();
    renderChatList();
    updateMessageCount();

    return messageElement;
}

// Display chat messages
function displayChatMessages(messages) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';

    if (!messages || messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="empty-chat" style="text-align: center; color: #666; padding: 40px 20px;">
                <div style="font-size: 48px;">💬</div>
                <h4>Chưa có tin nhắn nào</h4>
                <p>Gửi tin nhắn để bắt đầu trò chuyện!</p>
            </div>
        `;
        return;
    }

    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.MessageType === 'user' ? 'user-message' : 'bot-message'}`;

        messageElement.innerHTML = `
            <div class="message-avatar">
                ${message.MessageType === 'user' ? '👤' : '🤖'}
            </div>
            <div class="message-content">
                <div class="message-sender">${message.Sender}</div>
                <div class="message-text">${message.Message}</div>
                <div class="message-time">${new Date(message.Timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;

        chatMessages.appendChild(messageElement);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update message count
function updateMessageCount() {
    const currentChat = getCurrentChat();
    const count = currentChat ? currentChat.messages.length : 0;
    document.getElementById('messageCount').textContent = `💬 ${count} tin nhắn`;
}

// Update chat info
function updateChatInfo(chat) {
    const chatInfo = document.getElementById('chatInfo');
    if (chat) {
        chatInfo.textContent = `Tạo: ${formatDate(chat.createdAt)} • Cập nhật: ${formatDate(chat.updatedAt)}`;
    } else {
        chatInfo.textContent = '';
    }
}
// Chat management functions
function renameCurrentChat() {
    const currentChat = getCurrentChat();
    if (!currentChat) return;

    const newTitle = prompt('Nhập tên mới cho cuộc trò chuyện:', currentChat.title);
    if (newTitle && newTitle.trim()) {
        currentChat.title = newTitle.trim();
        document.getElementById('currentChatTitle').textContent = newTitle.trim();
        currentChat.updatedAt = new Date().toISOString();
        saveAllChatSessions();
        renderChatList();
    }
}

function renameChat(chatId) {
    const chat = chatSessions.chats[chatId];
    if (!chat) return;

    const newTitle = prompt('Nhập tên mới cho cuộc trò chuyện:', chat.title);
    if (newTitle && newTitle.trim()) {
        chat.title = newTitle.trim();
        chat.updatedAt = new Date().toISOString();
        saveAllChatSessions();
        renderChatList();

        // Update current chat title if this is the current chat
        if (chatId === chatSessions.currentChatId) {
            document.getElementById('currentChatTitle').textContent = newTitle.trim();
        }
    }
}

function deleteCurrentChat() {
    const currentChat = getCurrentChat();
    if (!currentChat) return;

    if (confirm(`Bạn có chắc chắn muốn xóa cuộc trò chuyện "${currentChat.title}"?`)) {
        deleteChat(chatSessions.currentChatId);
    }
}

function deleteChat(chatId) {
    if (!chatSessions.chats[chatId]) return;

    delete chatSessions.chats[chatId];

    // If we deleted the current chat, switch to another one or create new
    if (chatSessions.currentChatId === chatId) {
        const remainingChats = Object.keys(chatSessions.chats);
        if (remainingChats.length > 0) {
            chatSessions.currentChatId = remainingChats[0];
        } else {
            chatSessions.currentChatId = null;
        }
    }

    saveAllChatSessions();
    renderChatList();
    switchToCurrentChat();
}

function deleteAllChats() {
    if (Object.keys(chatSessions.chats).length === 0) return;

    if (confirm('Bạn có chắc chắn muốn xóa TẤT CẢ cuộc trò chuyện? Hành động này không thể hoàn tác.')) {
        chatSessions.chats = {};
        chatSessions.currentChatId = null;
        saveAllChatSessions();
        renderChatList();
        switchToCurrentChat();
    }
}

// Export functions
function exportCurrentChat() {
    const currentChat = getCurrentChat();
    if (!currentChat || currentChat.messages.length === 0) {
        alert('Không có tin nhắn để xuất!');
        return;
    }
    exportChat(currentChat);
}

function exportAllChats() {
    const chats = Object.values(chatSessions.chats);
    if (chats.length === 0) {
        alert('Không có cuộc trò chuyện nào để xuất!');
        return;
    }

    let exportContent = `English Assistant - Tất cả cuộc trò chuyện\n`;
    exportContent += `============================================\n`;
    exportContent += `Export Date: ${new Date().toLocaleString('vi-VN')}\n`;
    exportContent += `Total Conversations: ${chats.length}\n\n`;

    chats.forEach((chat, index) => {
        exportContent += `Conversation ${index + 1}: ${chat.title}\n`;
        exportContent += `Created: ${new Date(chat.createdAt).toLocaleString('vi-VN')}\n`;
        exportContent += `Messages: ${chat.messageCount}\n`;
        exportContent += `-------------------\n`;

        chat.messages.forEach(message => {
            const senderLabel = message.MessageType === 'user' ? 'User' : 'Assistant';
            const time = new Date(message.Timestamp).toLocaleTimeString('vi-VN');
            exportContent += `[${senderLabel} - ${time}]\n`;
            exportContent += `${message.Message}\n\n`;
        });

        exportContent += '\n'.repeat(3);
    });

    downloadTextFile(exportContent, `English_All_Chats_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`);
}

// Export chat
function exportChat(chat) {
    let exportContent = `English Assistant Chat Export\n`;
    exportContent += `=============================\n`;
    exportContent += `Title: ${chat.title}\n`;
    exportContent += `Export Date: ${new Date().toLocaleString('vi-VN')}\n`;
    exportContent += `Created: ${new Date(chat.createdAt).toLocaleString('vi-VN')}\n`;
    exportContent += `Last Updated: ${new Date(chat.updatedAt).toLocaleString('vi-VN')}\n`;
    exportContent += `Total Messages: ${chat.messageCount}\n\n`;
    exportContent += `Conversation:\n`;
    exportContent += `-------------\n\n`;

    chat.messages.forEach(message => {
        const senderLabel = message.MessageType === 'user' ? 'User' : 'Assistant';
        const time = new Date(message.Timestamp).toLocaleTimeString('vi-VN');
        exportContent += `[${senderLabel} - ${time}]\n`;
        exportContent += `${message.Message}\n\n`;
    });

    downloadTextFile(exportContent, `English_Chat_${chat.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`);


}

function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Use suggestion
function useSuggestion(question) {
    document.getElementById('chatInput').value = question;
    document.getElementById('chatInput').focus();
}

// Thêm đoạn này vào cuối file JS chứa code Chatbot
window.deleteCurrentChat = deleteCurrentChat;
window.renameCurrentChat = renameCurrentChat;
window.exportCurrentChat = exportCurrentChat;
window.createNewChat = createNewChat;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    initializeMultiChat();

    // Load first page of flashcards when vocab tab is opened
    document.querySelector('nav button[onclick*="vocab"]')?.addEventListener('click', function () {
        setTimeout(() => loadFlashcards(1), 100);
    });

    // Set default page size
    document.getElementById('pageSize').value = pageSize.toString();

    // Add Enter key support for chat input
    document.getElementById('chatInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
});