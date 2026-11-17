// DayDeck V5.1 — O/L and A/L learning sections
const todayLabel = document.querySelector("#todayLabel");
const pageTitle = document.querySelector("#pageTitle");
const sidePage = document.querySelector("#sidePage");
const appView = document.querySelector("#appView");

if (todayLabel) {
  todayLabel.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  }).toUpperCase();
}

const subjects = {
  ol: { title: "O/L", name: "සාමාන්‍ය පෙළ", items: ["ගණිතය", "විද්‍යාව", "සිංහල"] },
  al: { title: "A/L", name: "උසස් පෙළ", items: ["ICT"] }
};

let currentLevel = null;
let currentSubject = null;

function setHeader(title, side = title) {
  if (pageTitle) pageTitle.textContent = title;
  if (sidePage) sidePage.textContent = side;
}

function showOverview() {
  currentLevel = null;
  currentSubject = null;
  setHeader("Good day ✦", "Overview");
  appView.innerHTML = `
    <section class="welcome-card">
      <div><p class="eyebrow mint">A FRESH START</p><h2>MAKE EVERY<br>DAY COUNT.</h2>
      <p class="muted">අද දවස අලුත් ආරම්භයක්. ඔයාගේ ගමන සන්සුන්ව, ඔයාගේම වේගයෙන් ඉදිරියට ගෙනියන්න.</p></div>
      <div class="welcome-orb">✦</div>
    </section>
    <section class="selection-section">
      <div class="section-heading"><p class="eyebrow">CHOOSE YOUR PATH</p><h2>ඔයා ඉගෙන ගන්නේ කුමන විෂය ධාරාවද?</h2></div>
      <div class="choice-grid">
        <button class="choice-card ol-card" data-level="ol"><span class="choice-icon">O/L</span><span class="choice-copy"><strong>සාමාන්‍ය පෙළ</strong><small>O/L SECTION</small></span><span class="choice-arrow">→</span></button>
        <button class="choice-card al-card" data-level="al"><span class="choice-icon">A/L</span><span class="choice-copy"><strong>උසස් පෙළ</strong><small>A/L SECTION</small></span><span class="choice-arrow">→</span></button>
      </div>
    </section>`;
}

function showSubjects(level) {
  currentLevel = level;
  currentSubject = null;
  const group = subjects[level];
  setHeader(group.name, group.title);
  appView.innerHTML = `
    <button class="back-button" data-back="home">← Overview වෙත</button>
    <section class="section-heading page-heading"><p class="eyebrow">${group.title} SECTION</p><h2>විෂය තෝරන්න</h2><p class="muted">ඔයාට අවශ්‍ය විෂය තෝරලා ඉදිරියට යන්න.</p></section>
    <div class="subject-grid">${group.items.map((subject, index) => `
      <button class="subject-card" data-subject="${index}">
        <span class="subject-number">0${index + 1}</span><strong>${subject}</strong><span class="subject-arrow">→</span>
      </button>`).join("")}</div>`;
}

function showResources(subject) {
  currentSubject = subject;
  setHeader(subject, currentLevel.toUpperCase() + " / " + subject);
  appView.innerHTML = `
    <button class="back-button" data-back="subjects">← විෂය තේරීමට</button>
    <section class="section-heading page-heading"><p class="eyebrow">${currentLevel.toUpperCase()} • ${subject}</p><h2>${subject}</h2><p class="muted">ඔයාට අවශ්‍ය ඉගෙනුම් කොටස තෝරන්න.</p></section>
    <div class="resource-grid">
      <button class="resource-card" data-resource="Notes"><span class="resource-icon">▤</span><strong>Notes</strong><small>පාඩම් සටහන්</small><span class="resource-arrow">→</span></button>
      <button class="resource-card" data-resource="Quiz"><span class="resource-icon">✎</span><strong>Quiz</strong><small>දැනුම පරීක්ෂා කරගන්න</small><span class="resource-arrow">→</span></button>
      <button class="resource-card" data-resource="Past Papers"><span class="resource-icon">▧</span><strong>Past Papers</strong><small>පසුගිය විභාග ප්‍රශ්න පත්‍ර</small><span class="resource-arrow">→</span></button>
    </div>`;
}

function showMathPastPapers() {
  const paperUrl = "./2026_OL_Maths_Anumana_Prashna_Pathraya.pdf";
  setHeader("Past Papers", "O/L / ගණිතය");
  appView.innerHTML = `
    <button class="back-button" data-back="resources">← ගණිතය වෙත</button>
    <section class="section-heading page-heading">
      <p class="eyebrow">O/L • ගණිතය</p>
      <h2>Past Papers</h2>
      <p class="muted">ප්‍රශ්න පත්‍ර තෝරන්න.</p>
    </section>
    <div class="resource-grid">
      <article class="resource-card">
        <span class="resource-icon">▧</span>
        <strong>2026 අනුමාන ප්‍රශ්න පත්‍රය</strong>
        <small>පිටු 6 • PDF</small>
        <a class="primary-button" href="${paperUrl}" target="_blank" rel="noopener">Open Paper →</a>
        <a class="back-button" href="${paperUrl}" download="2026-OL-Maths-Anumana.pdf">Download PDF ↓</a>
      </article>
    </div>`;
}

function showResourcePlaceholder(resource) {
  setHeader(resource, currentSubject);
  appView.innerHTML = `
    <button class="back-button" data-back="resources">← ${currentSubject} වෙත</button>
    <section class="placeholder-card">
      <span class="placeholder-icon">✦</span>
      <p class="eyebrow">${currentLevel.toUpperCase()} • ${currentSubject}</p>
      <h2>${resource}</h2>
      <p class="muted">මෙම කොටස ඉදිරියේදී එකතු කරනු ලැබේ.</p>
    </section>`;
}

let activeQuiz = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function showQuizSetup() {
  const bank = window.DAYDECK_QUIZ_BANKS?.[currentLevel]?.[currentSubject] || [];
  setHeader("Quiz", currentSubject);
  appView.innerHTML = `
    <button class="back-button" data-back="resources">← ${currentSubject} වෙත</button>
    <section class="quiz-intro">
      <p class="eyebrow">${currentLevel.toUpperCase()} • ${currentSubject} QUIZ</p>
      <h2>${currentSubject} ප්‍රශ්නාවලිය</h2>
      <p class="muted">ප්‍රශ්න බැංකුවේ ප්‍රශ්න ${bank.length}ක් ඇත. අහඹු ප්‍රශ්න 10ක් තෝරාගෙන පිළිතුරු සපයන්න.</p>
      <button class="primary-button" data-start-quiz ${bank.length < 10 ? "disabled" : ""}>Start ${currentSubject} Quiz →</button>
      ${bank.length < 10 ? '<p class="quiz-error">මෙම විෂයට ප්‍රමාණවත් ප්‍රශ්න තවම ඇතුළත් කර නැහැ.</p>' : ""}
    </section>`;
}

function startQuiz() {
  const bank = window.DAYDECK_QUIZ_BANKS?.[currentLevel]?.[currentSubject] || [];
  if (bank.length < 10) {
    showQuizSetup();
    return;
  }
  activeQuiz = [...bank].sort(() => Math.random() - 0.5).slice(0, 10);
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const item = activeQuiz[quizIndex];
  if (!item) return showQuizResult();
  quizAnswered = false;
  setHeader("Quiz", currentSubject);
  appView.innerHTML = `
    <button class="back-button" data-back="resources">← ${currentSubject} වෙත</button>
    <div class="quiz-meta"><span>QUESTION ${quizIndex + 1} / 10</span><span>ලකුණු: ${quizScore}</span></div>
    <div class="quiz-progress"><span style="width:${(quizIndex / 10) * 100}%"></span></div>
    <section class="quiz-question-card">
      <p class="eyebrow">ප්‍රශ්නය ${String(item.id).padStart(2, "0")}</p>
      <h2>${item.question}</h2>
      <div class="quiz-options">
        ${Object.entries(item.options).map(([key, value]) => `
          <button class="quiz-option" data-answer="${key}">
            <span class="option-letter">${key}</span><span>${value}</span>
          </button>`).join("")}
      </div>
      <div id="answerFeedback" aria-live="polite"></div>
    </section>`;
}

function chooseQuizAnswer(answer) {
  if (quizAnswered) return;
  const item = activeQuiz[quizIndex];
  if (!item) return;
  quizAnswered = true;
  const correct = answer === item.answer;
  if (correct) quizScore++;
  document.querySelectorAll(".quiz-option").forEach(button => {
    button.disabled = true;
    const key = button.dataset.answer;
    if (key === item.answer) button.classList.add("correct");
    else if (key === answer) button.classList.add("incorrect");
  });
  const feedback = document.querySelector("#answerFeedback");
  if (feedback) feedback.innerHTML = `
    <div class="answer-feedback ${correct ? "is-correct" : "is-incorrect"}">
      <strong>${correct ? "නිවැරදියි! ✓" : "වැරදියි. නිවැරදි පිළිතුර: " + item.answer}</strong>
      <p>${item.explanation}</p>
    </div>
    <button class="primary-button next-question" data-next-question>${quizIndex === 9 ? "ප්‍රතිඵල බලන්න" : "ඊළඟ ප්‍රශ්නය"} →</button>`;
}

function showQuizResult() {
  setHeader("Quiz Result", currentSubject);
  const percent = quizScore * 10;
  appView.innerHTML = `
    <section class="quiz-result">
      <p class="eyebrow">QUIZ COMPLETED</p>
      <h2>ඔයාගේ ප්‍රතිඵලය</h2>
      <div class="score-circle"><strong>${quizScore}/10</strong><span>${percent}%</span></div>
      <p class="muted">${quizScore >= 8 ? "ඉතා හොඳයි! මේ විදිහටම ඉදිරියට යන්න." : quizScore >= 5 ? "හොඳ උත්සාහයක්! තව ටිකක් පුහුණු වෙමු." : "නැවත Notes කියවා උත්සාහ කරමු."}</p>
      <button class="primary-button" data-retry-quiz>නැවත Quiz එකක් කරන්න ↻</button>
      <button class="back-button result-back" data-back="resources">විෂයට ආපසු</button>
    </section>`;
}

appView.addEventListener("click", (event) => {
  const levelButton = event.target.closest("[data-level]");
  const subjectButton = event.target.closest("[data-subject]");
  const resourceButton = event.target.closest("[data-resource]");
  const backButton = event.target.closest("[data-back]");

  if (levelButton) showSubjects(levelButton.dataset.level);
  if (subjectButton && currentLevel) {
    const subject = subjects[currentLevel].items[Number(subjectButton.dataset.subject)];
    if (subject) showResources(subject);
  }
  if (resourceButton) {
    if (resourceButton.dataset.resource === "Quiz" && currentLevel === "al" && currentSubject === "ICT") showQuizSetup();
    else if (resourceButton.dataset.resource === "Past Papers" && currentLevel === "ol" && currentSubject === "ගණිතය") showMathPastPapers();
    else showResourcePlaceholder(resourceButton.dataset.resource);
  }
  const startButton = event.target.closest("[data-start-quiz]");
  const answerButton = event.target.closest("[data-answer]");
  const nextButton = event.target.closest("[data-next-question]");
  const retryButton = event.target.closest("[data-retry-quiz]");
  if (startButton) startQuiz();
  if (answerButton) chooseQuizAnswer(answerButton.dataset.answer);
  if (nextButton) { quizIndex++; renderQuizQuestion(); }
  if (retryButton) startQuiz();
  if (backButton) {
    if (backButton.dataset.back === "home") showOverview();
    if (backButton.dataset.back === "subjects" && currentLevel) showSubjects(currentLevel);
    if (backButton.dataset.back === "resources" && currentSubject) showResources(currentSubject);
  }
});

document.querySelector("[data-home]")?.addEventListener("click", (event) => {
  event.preventDefault();
  showOverview();
});

let installPrompt = null;
const installButton = document.querySelector("#installBtn");
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  if (installButton) installButton.hidden = false;
});
if (installButton) {
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
}

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}