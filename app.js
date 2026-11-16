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


// ===== DayDeck v2.0: Monthly Tracker, Tomorrow Planner & MCQ Quiz =====
function dayKey(date){return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");}
function parseDay(key){const [y,m,d]=key.split("-").map(Number);return new Date(y,m-1,d);}
function taskDay(task){return task.date || dayKey(now);}
let calendarMonth=new Date(now.getFullYear(),now.getMonth(),1);
let selectedDay=dayKey(now);

const originalRenderTasks=renderTasks;
renderTasks=function(){originalRenderTasks();renderCalendar();renderSelectedDay();};

function renderCalendar(){
  const label=$("#monthLabel"),grid=$("#calendarDays");
  if(!label||!grid)return;
  label.textContent=calendarMonth.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  const first=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1);
  const start=first.getDay();
  const count=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,0).getDate();
  const cells=[];
  for(let i=0;i<start;i++)cells.push('<button class="day-cell" disabled aria-hidden="true"></button>');
  for(let d=1;d<=count;d++){
    const key=dayKey(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),d));
    const dayTasks=tasks.filter(t=>taskDay(t)===key),done=dayTasks.filter(t=>t.done).length;
    const cls=[key===selectedDay?"selected":"",dayTasks.length&&done===dayTasks.length?"has-all":"",done>0&&done<dayTasks.length?"has-some":""].filter(Boolean).join(" ");
    cells.push('<button class="day-cell '+cls+'" data-day="'+key+'" aria-label="'+key+'">'+d+'</button>');
  }
  grid.innerHTML=cells.join("");
  grid.querySelectorAll("[data-day]").forEach(b=>b.addEventListener("click",()=>{selectedDay=b.dataset.day;renderCalendar();renderSelectedDay();}));
  const monthTasks=tasks.filter(t=>taskDay(t).startsWith(calendarMonth.getFullYear()+"-"+String(calendarMonth.getMonth()+1).padStart(2,"0")));
  $("#monthDoneCount").textContent=monthTasks.filter(t=>t.done).length;
  $("#monthTaskCount").textContent=monthTasks.length;
}
function renderSelectedDay(){
  const host=$("#selectedDayTasks");if(!host)return;
  const dayTasks=tasks.filter(t=>taskDay(t)===selectedDay);
  const completed=dayTasks.filter(t=>t.done).length;
  $("#selectedDateTitle").textContent=parseDay(selectedDay).toLocaleDateString("si-LK",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  $("#selectedDayCount").textContent=completed+"/"+dayTasks.length;
  $("#selectedDateProgress").textContent=(dayTasks.length?Math.round(completed/dayTasks.length*100):0)+"% complete";
  host.innerHTML=dayTasks.length?dayTasks.map(t=>'<div class="task-row '+(t.done?"done":"")+'"><input type="checkbox" data-track-check="'+t.id+'" '+(t.done?"checked":"")+' aria-label="Complete task"><span class="task-text"></span><button class="delete-btn" data-track-delete="'+t.id+'" aria-label="Delete task">×</button></div>').join(""):'<div class="empty-state">මෙම දවසට tasks නැහැ.</div>';
  host.querySelectorAll(".task-row").forEach((row,i)=>{row.querySelector(".task-text").textContent=dayTasks[i].text;});
  host.querySelectorAll("[data-track-check]").forEach(el=>el.addEventListener("change",()=>{const t=tasks.find(x=>String(x.id)===el.dataset.trackCheck);if(t){t.done=el.checked;store.set("tasks",tasks);renderTasks();}}));
  host.querySelectorAll("[data-track-delete]").forEach(el=>el.addEventListener("click",()=>{tasks=tasks.filter(x=>String(x.id)!==el.dataset.trackDelete);store.set("tasks",tasks);renderTasks();}));
}
$("#monthPrev").addEventListener("click",()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);selectedDay=dayKey(calendarMonth);renderCalendar();renderSelectedDay();});
$("#monthNext").addEventListener("click",()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);selectedDay=dayKey(calendarMonth);renderCalendar();renderSelectedDay();});

// Tag newly added tasks with today's date without changing existing task data.
$("#taskForm").addEventListener("submit",()=>{const latest=tasks[0];if(latest&&!latest.date){latest.date=dayKey(new Date());store.set("tasks",tasks);renderTasks();}});

let tomorrowTasks=store.get("tomorrow_tasks",[]);
function renderTomorrow(){
  const host=$("#tomorrowList");if(!host)return;
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  $("#tomorrowDateLabel").textContent=tomorrow.toLocaleDateString("si-LK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})+" සඳහා කලින් සැලසුම් කරගන්න.";
  $("#tomorrowSummary").textContent=tomorrowTasks.length+" tasks";
  host.innerHTML=tomorrowTasks.length?tomorrowTasks.map(t=>'<div class="task-row '+(t.done?"done":"")+'"><input class="tomorrow-check" type="checkbox" data-tomorrow-check="'+t.id+'" '+(t.done?"checked":"")+' aria-label="Complete planned task"><span class="task-text"></span><button class="important-toggle '+(t.important?"active":"")+'" data-important="'+t.id+'">'+(t.important?"★ Important":"☆ Mark important")+'</button><button class="delete-btn" data-tomorrow-delete="'+t.id+'" aria-label="Delete planned task">×</button></div>').join(""):'<div class="empty-state">හෙටට plans තවම නැහැ.</div>';
  host.querySelectorAll(".task-row").forEach((row,i)=>row.querySelector(".task-text").textContent=tomorrowTasks[i].text);
  host.querySelectorAll("[data-tomorrow-check]").forEach(el=>el.addEventListener("change",()=>{const t=tomorrowTasks.find(x=>String(x.id)===el.dataset.tomorrowCheck);if(t)t.done=el.checked;store.set("tomorrow_tasks",tomorrowTasks);renderTomorrow();}));
  host.querySelectorAll("[data-important]").forEach(el=>el.addEventListener("click",()=>{const t=tomorrowTasks.find(x=>String(x.id)===el.dataset.important);if(t)t.important=!t.important;tomorrowTasks.sort((a,b)=>Number(b.important)-Number(a.important));store.set("tomorrow_tasks",tomorrowTasks);renderTomorrow();}));
  host.querySelectorAll("[data-tomorrow-delete]").forEach(el=>el.addEventListener("click",()=>{tomorrowTasks=tomorrowTasks.filter(x=>String(x.id)!==el.dataset.tomorrowDelete);store.set("tomorrow_tasks",tomorrowTasks);renderTomorrow();}));
}
$("#tomorrowForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#tomorrowInput"),textValue=input.value.trim();if(!textValue)return;tomorrowTasks.push({id:Date.now(),text:textValue,done:false,important:false});input.value="";store.set("tomorrow_tasks",tomorrowTasks);renderTomorrow();});

const sftQuestions=[
 {topic:"වර්ගඵලය හා පරිමාව",q:"දිග 8 cm සහ පළල 5 cm වන සෘජුකෝණාස්‍රයක වර්ගඵලය කීයද?",o:["13 cm²","26 cm²","40 cm²","40 cm"],a:2,e:"වර්ගඵලය = දිග × පළල = 8 × 5 = 40 cm²."},
 {topic:"වර්ගඵලය හා පරිමාව",q:"පැත්තක දිග 3 cm වන ඝනකයක පරිමාව කීයද?",o:["9 cm³","18 cm³","27 cm³","36 cm³"],a:2,e:"ඝනකයේ පරිමාව = පැත්ත³ = 3 × 3 × 3 = 27 cm³."},
 {topic:"මිනුම් උපකරණ",q:"කුඩා දිගක් වඩාත් නිවැරදිව මැනීමට පහත උපකරණවලින් සුදුසුම එක කුමක්ද?",o:["මීටර් රූල","වර්නියර් කැලිපරය","මිනුම් පටිය","තරාදිය"],a:1,e:"වර්නියර් කැලිපරය කුඩා දිග සහ විෂ්කම්භ මැනීමට භාවිතා කරයි."},
 {topic:"පයිතගරස් සම්බන්ධතාව",q:"සෘජුකෝණී ත්‍රිකෝණයක ලම්බ පාද දෙක 3 cm හා 4 cm නම් කර්ණයේ දිග කීයද?",o:["5 cm","6 cm","7 cm","12 cm"],a:0,e:"කර්ණය² = 3² + 4² = 25. එබැවින් කර්ණය = 5 cm."},
 {topic:"පයිතගරස් සම්බන්ධතාව",q:"පයිතගරස් සම්බන්ධතාවය නිවැරදිව දක්වන්නේ කුමක්ද?",o:["a+b=c","a²+b²=c²","a²-b²=c²","2a+2b=c"],a:1,e:"සෘජුකෝණී ත්‍රිකෝණයක ලම්බ පාද දෙක a,b සහ කර්ණය c නම් a²+b²=c²."}
];
let quizItems=[],quizIndex=0,quizScore=0,quizAnswered=false;
function renderQuizStart(){
 const subject=$("#quizSubject").value,area=$("#quizArea");
 if(subject!=="SFT"){area.innerHTML='<p class="muted">මෙම විෂයට නිවැරදි syllabus එකට ගැළපෙන ප්‍රශ්න එක් කිරීමට ET සහ ICT පාඩම් මාතෘකා අවශ්‍යයි. දැනට SFT පුහුණු ප්‍රශ්න භාවිතා කළ හැකියි.</p>';return;}
 area.innerHTML='<p class="muted">වර්ගඵලය හා පරිමාව, මිනුම් උපකරණ සහ පයිතගරස් සම්බන්ධතාවය ඇතුළත් ප්‍රශ්න 5ක්.</p><button class="primary-btn" id="startQuiz">Start SFT Quiz</button>';
 $("#startQuiz").addEventListener("click",startQuiz);
}
function startQuiz(){quizItems=[...sftQuestions];quizIndex=0;quizScore=0;renderQuestion();}
function renderQuestion(){
 const area=$("#quizArea"),q=quizItems[quizIndex];quizAnswered=false;
 area.innerHTML='<p class="quiz-progress">ප්‍රශ්නය '+(quizIndex+1)+' / '+quizItems.length+' · ලකුණු '+quizScore+'</p><p class="eyebrow">'+q.topic+'</p><h3 class="quiz-question"></h3><div class="quiz-options"></div><div id="quizFeedback"></div>';
 area.querySelector(".quiz-question").textContent=q.q;
 const options=area.querySelector(".quiz-options");
 q.o.forEach((choice,i)=>{const b=document.createElement("button");b.className="quiz-option";b.textContent=String.fromCharCode(65+i)+". "+choice;b.addEventListener("click",()=>answerQuestion(i,b));options.appendChild(b);});
}
function answerQuestion(choice,button){
 if(quizAnswered)return;quizAnswered=true;const q=quizItems[quizIndex];const buttons=$$("#quizArea .quiz-option");
 buttons.forEach((b,i)=>{b.disabled=true;if(i===q.a)b.classList.add("correct");});
 if(choice===q.a)quizScore++;else button.classList.add("wrong");
 $("#quizFeedback").innerHTML='<div class="quiz-feedback">'+(choice===q.a?"හරි පිළිතුර! ":"මේ පිළිතුර නිවැරදි නැහැ. ")+'<b>'+q.o[q.a]+'</b><br>'+q.e+'</div><div class="quiz-actions"><button class="primary-btn" id="quizNext">'+(quizIndex===quizItems.length-1?"See result":"Next question")+'</button></div>';
 $("#quizNext").addEventListener("click",()=>{quizIndex++;if(quizIndex<quizItems.length)renderQuestion();else renderQuizResult();});
}
function renderQuizResult(){
 $("#quizArea").innerHTML='<p class="eyebrow mint">QUIZ COMPLETE</p><h3 class="quiz-question">ඔයාගේ ලකුණු: '+quizScore+' / '+quizItems.length+'</h3><p class="muted">'+(quizScore===quizItems.length?"නියමයි! සියලුම ප්‍රශ්න නිවැරදියි.":"හොඳ උත්සාහයක්. වැරදුණු ප්‍රශ්නවල පැහැදිලි කිරීම් නැවත බලන්න.")+'</p><button class="primary-btn" id="retryQuiz">Try again</button>';
 $("#retryQuiz").addEventListener("click",startQuiz);
}
$("#quizSubject").addEventListener("change",renderQuizStart);
$("#startQuiz").addEventListener("click",startQuiz);
renderQuizStart();
renderCalendar();
renderSelectedDay();
renderTomorrow();
