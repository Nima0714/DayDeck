const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem("daydeck_" + key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { localStorage.setItem("daydeck_" + key, JSON.stringify(value)); }
};
let tasks = store.get("tasks", []);

function showView(name) {
  $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  const titles = {home:"Good day",tasks:"Your tasks",monthly:"Monthly Tracker",tomorrow:"Tomorrow Planner",quiz:"MCQ Quiz",focus:"Focus Timer"};
  $("#pageTitle").innerHTML = `${titles[name] || "DayDeck"} <span>✦</span>`;
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-btn").forEach(b => b.addEventListener("click", () => showView(b.dataset.view)));
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

let duration=25*60,remaining=duration,interval=null;
function updateTimer(){$("#timerDisplay").textContent=`${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`;}
function stopTimer(){if(interval){clearInterval(interval);interval=null;}}
$$(".preset").forEach(b=>b.addEventListener("click",()=>{stopTimer();$$(".preset").forEach(x=>x.classList.remove("active"));b.classList.add("active");duration=Number(b.dataset.minutes)*60;remaining=duration;$("#timerMode").textContent=Number(b.dataset.minutes)===5?"SHORT BREAK":"FOCUS SESSION";$("#timerCaption").textContent=Number(b.dataset.minutes)===5?"Minutes to recharge":"Minutes of focus";$("#timerStart").textContent="Start";$("#timerMessage").textContent="Ready when you are.";updateTimer();}));
$("#timerStart").addEventListener("click",()=>{if(interval){stopTimer();$("#timerStart").textContent="Resume";return;}if(remaining<=0)remaining=duration;$("#timerStart").textContent="Pause";$("#timerMessage").textContent="Stay focused. You've got this.";interval=setInterval(()=>{remaining--;updateTimer();if(remaining<=0){stopTimer();$("#timerStart").textContent="Start again";$("#timerMessage").textContent="Session complete. Take a short break!";if("vibrate" in navigator)navigator.vibrate(180);}},1000);});
$("#timerReset").addEventListener("click",()=>{stopTimer();remaining=duration;$("#timerStart").textContent="Start";$("#timerMessage").textContent="Timer reset.";updateTimer();});

const now=new Date();$("#todayLabel").textContent=now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
renderTasks();updateTimer();

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

const mcqBanks = window.daydeckMcqData || {};
let quizItems=[],quizIndex=0,quizScore=0,quizAnswered=false,activeQuizSubject="SFT";
function renderQuizStart(){
 const subject=$("#quizSubject").value,area=$("#quizArea");
 const count=(mcqBanks[subject]||[]).length;
 area.innerHTML='<p class="muted">'+count+' ප්‍රශ්න අතරින් අහඹු ප්‍රශ්න 10ක් තෝරාගනු ලැබේ.</p><button class="primary-btn" id="startQuiz" '+(count<10?'disabled':'')+'>Start '+subject+' Quiz</button>';
 if(count<10){area.insertAdjacentHTML("beforeend",'<p class="muted">මෙම විෂයට ප්‍රශ්න බැංකුව තවම සම්පූර්ණ කර නැහැ.</p>');return;}
 $("#startQuiz").addEventListener("click",startQuiz);
}
function startQuiz(){
 activeQuizSubject=$("#quizSubject").value;
 const bank=[...(mcqBanks[activeQuizSubject]||[])];
 for(let i=bank.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bank[i],bank[j]]=[bank[j],bank[i]];}
 quizItems=bank.slice(0,10);quizIndex=0;quizScore=0;renderQuestion();
}
function renderQuestion(){
 const area=$("#quizArea"),q=quizItems[quizIndex];quizAnswered=false;
 area.innerHTML='<p class="quiz-progress">ප්‍රශ්නය '+(quizIndex+1)+' / '+quizItems.length+' · ලකුණු '+quizScore+'</p><p class="eyebrow"></p><h3 class="quiz-question"></h3><div class="quiz-options"></div><div id="quizFeedback"></div>';
 area.querySelector(".eyebrow").textContent=q.topic||activeQuizSubject;
 area.querySelector(".quiz-question").textContent=q.q;
 const options=area.querySelector(".quiz-options");
 q.o.forEach((choice,i)=>{const b=document.createElement("button");b.className="quiz-option";b.textContent=String.fromCharCode(65+i)+". "+choice;b.addEventListener("click",()=>answerQuestion(i,b));options.appendChild(b);});
}
function answerQuestion(choice,button){
 if(quizAnswered)return;quizAnswered=true;const q=quizItems[quizIndex];const buttons=$$("#quizArea .quiz-option");
 buttons.forEach((b,i)=>{b.disabled=true;if(i===q.a)b.classList.add("correct");});
 if(choice===q.a)quizScore++;else button.classList.add("wrong");
 const feedback=$("#quizFeedback");feedback.innerHTML='<div class="quiz-feedback"></div><div class="quiz-actions"><button class="primary-btn" id="quizNext">'+(quizIndex===quizItems.length-1?"See result":"Next question")+'</button></div>';
 feedback.querySelector(".quiz-feedback").textContent=(choice===q.a?"නිවැරදි පිළිතුර! ":"නිවැරදි පිළිතුර: ")+q.o[q.a]+" — "+q.e;
 $("#quizNext").addEventListener("click",()=>{quizIndex++;if(quizIndex<quizItems.length)renderQuestion();else renderQuizResult();});
}
function renderQuizResult(){
 $("#quizArea").innerHTML='<p class="eyebrow mint">QUIZ COMPLETE</p><h3 class="quiz-question">ඔයාගේ ලකුණු: '+quizScore+' / '+quizItems.length+'</h3><p class="muted">'+(quizScore===quizItems.length?"නියමයි! සියලුම ප්‍රශ්න නිවැරදියි.":"හොඳ උත්සාහයක්. වැරදුණු ප්‍රශ්නවල පැහැදිලි කිරීම් නැවත බලන්න.")+'</p><button class="primary-btn" id="retryQuiz">Try again</button>';
 $("#retryQuiz").addEventListener("click",startQuiz);
}
$("#quizSubject").addEventListener("change",renderQuizStart);
renderQuizStart();
renderCalendar();
renderSelectedDay();
renderTomorrow();
