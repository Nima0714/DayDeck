const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem("daydeck_" + key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { localStorage.setItem("daydeck_" + key, JSON.stringify(value)); }
};
let tasks = store.get("tasks", []);
let subjects = store.get("subjects", []);
let notes = store.get("notes", []);

function showView(name) {
  $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  const titles = {home:"Good day",tasks:"Your tasks",study:"Study Planner",focus:"Focus Timer",notes:"Quick Notes"};
  $("#pageTitle").innerHTML = `${titles[name] || "DayDeck"} <span>✦</span>`;
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".nav-btn").forEach(b => b.addEventListener("click", () => showView(b.dataset.view)));
$$("[data-go]").forEach(b => b.addEventListener("click", () => showView(b.dataset.go)));

function renderTasks() {
  const list = $("#taskList"), home = $("#homeTasks");
  const pending = tasks.filter(t => !t.done);
  const row = t => `<div class="task-row ${t.done ? "done" : ""}"><input type="checkbox" data-task="${t.id}" ${t.done ? "checked" : ""} aria-label="Complete task"><span class="task-text"></span><button class="delete-btn" data-delete-task="${t.id}" aria-label="Delete task">×</button></div>`;
  list.innerHTML = tasks.length ? tasks.map(row).join("") : '<div class="empty-state">ඔයාගේ පළමු task එක එකතු කරන්න.</div>';
  home.innerHTML = pending.length ? pending.slice(0,4).map(row).join("") : '<div class="empty-state">අදට ඉතිරි tasks නැහැ. හොඳ වැඩක්! ✦</div>';
  [list,home].forEach(el => {
    el.querySelectorAll(".task-row").forEach((r,i) => {
      const id = r.querySelector("[data-task]")?.dataset.task || r.querySelector("[data-delete-task]")?.dataset.deleteTask;
      const task = tasks.find(t => String(t.id) === String(id));
      if (task) r.querySelector(".task-text").textContent = task.text;
    });
  });
  $("#doneCount").textContent = tasks.filter(t=>t.done).length;
  $("#leftCount").textContent = pending.length;
  $("#taskSummary").textContent = `${tasks.length} task${tasks.length===1?"":"s"}`;
  $("#taskList").querySelectorAll("[data-task], [data-delete-task]").forEach(el => {
    el.addEventListener("change", () => { const t=tasks.find(x=>String(x.id)===el.dataset.task); if(t){t.done=el.checked;saveTasks();} });
    el.addEventListener("click", () => { if(el.dataset.deleteTask){tasks=tasks.filter(x=>String(x.id)!==el.dataset.deleteTask);saveTasks();} });
  });
  $("#homeTasks").querySelectorAll("[data-task], [data-delete-task]").forEach(el => {
    el.addEventListener("change", () => { const t=tasks.find(x=>String(x.id)===el.dataset.task); if(t){t.done=el.checked;saveTasks();} });
    el.addEventListener("click", () => { if(el.dataset.deleteTask){tasks=tasks.filter(x=>String(x.id)!==el.dataset.deleteTask);saveTasks();} });
  });
}
function saveTasks(){store.set("tasks",tasks);renderTasks();}
$("#taskForm").addEventListener("submit",e=>{e.preventDefault();const text=$("#taskInput").value.trim();if(!text)return;tasks.unshift({id:Date.now(),text,done:false});$("#taskInput").value="";saveTasks();});

function renderSubjects(){
  $("#subjectCount").textContent=subjects.length;
  $("#subjectList").innerHTML=subjects.length?subjects.map(s=>`<article class="subject-card"><div><b class="subject-name"></b><br><small>Study subject</small></div><button data-remove-subject="${s.id}" aria-label="Remove subject">Remove</button></article>`).join(""):'<div class="empty-state wide">තවම විෂයන් එකතු කරලා නැහැ.</div>';
  $("#subjectList").querySelectorAll(".subject-card").forEach((el,i)=>el.querySelector(".subject-name").textContent=subjects[i].name);
  $$("[data-remove-subject]").forEach(b=>b.addEventListener("click",()=>{subjects=subjects.filter(s=>String(s.id)!==b.dataset.removeSubject);store.set("subjects",subjects);renderSubjects();}));
}
$("#subjectForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#subjectInput").value.trim();if(!name)return;if(subjects.some(s=>s.name.toLowerCase()===name.toLowerCase())){alert("මේ විෂය දැනටමත් තියෙනවා.");return;}subjects.push({id:Date.now(),name});$("#subjectInput").value="";store.set("subjects",subjects);renderSubjects();});

function renderNotes(){
  $("#noteList").innerHTML=notes.length?notes.map(n=>`<article class="note-card"><h3 class="note-title"></h3><p class="note-body"></p><div class="note-foot"><small>${new Date(n.id).toLocaleDateString()}</small><button data-delete-note="${n.id}">Delete</button></div></article>`).join(""):'<div class="empty-state wide">තවම notes නැහැ.</div>';
  $("#noteList").querySelectorAll(".note-card").forEach((el,i)=>{el.querySelector(".note-title").textContent=notes[i].title;el.querySelector(".note-body").textContent=notes[i].body;});
  $$("[data-delete-note]").forEach(b=>b.addEventListener("click",()=>{notes=notes.filter(n=>String(n.id)!==b.dataset.deleteNote);store.set("notes",notes);renderNotes();}));
}
$("#noteForm").addEventListener("submit",e=>{e.preventDefault();const title=$("#noteTitle").value.trim(),body=$("#noteBody").value.trim();if(!title||!body)return;notes.unshift({id:Date.now(),title,body});store.set("notes",notes);$("#noteTitle").value="";$("#noteBody").value="";renderNotes();});

let duration=25*60,remaining=duration,interval=null;
function updateTimer(){$("#timerDisplay").textContent=`${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`;}
function stopTimer(){if(interval){clearInterval(interval);interval=null;}}
$$(".preset").forEach(b=>b.addEventListener("click",()=>{stopTimer();$$(".preset").forEach(x=>x.classList.remove("active"));b.classList.add("active");duration=Number(b.dataset.minutes)*60;remaining=duration;$("#timerMode").textContent=Number(b.dataset.minutes)===5?"SHORT BREAK":"FOCUS SESSION";$("#timerCaption").textContent=Number(b.dataset.minutes)===5?"Minutes to recharge":"Minutes of focus";$("#timerStart").textContent="Start";$("#timerMessage").textContent="Ready when you are.";updateTimer();}));
$("#timerStart").addEventListener("click",()=>{if(interval){stopTimer();$("#timerStart").textContent="Resume";return;}if(remaining<=0)remaining=duration;$("#timerStart").textContent="Pause";$("#timerMessage").textContent="Stay focused. You've got this.";interval=setInterval(()=>{remaining--;updateTimer();if(remaining<=0){stopTimer();$("#timerStart").textContent="Start again";$("#timerMessage").textContent="Session complete. Take a short break!";if("vibrate" in navigator)navigator.vibrate(180);}},1000);});
$("#timerReset").addEventListener("click",()=>{stopTimer();remaining=duration;$("#timerStart").textContent="Start";$("#timerMessage").textContent="Timer reset.";updateTimer();});

const now=new Date();$("#todayLabel").textContent=now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
renderTasks();renderSubjects();renderNotes();updateTimer();

let installPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("#installBtn").hidden=false;});
$("#installBtn").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("#installBtn").hidden=true;});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
