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
  if (resourceButton) showResourcePlaceholder(resourceButton.dataset.resource);
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