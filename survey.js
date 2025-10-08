const ENDPOINT = "https://script.google.com/macros/s/AKfycbyI-OeUgLbyZjc51xcl3A23VcQnd61NjZmpOSTXrtbvsQ_9AW3S7lO5t-o-4iuWkyOzIg/exec";
const NEXT_URL = "task.html";
const TOKEN = (() => {
  const qs = new URLSearchParams(location.search);
  const t = qs.get("token") || sessionStorage.getItem("link_token") || Math.random().toString(36).slice(2,10).toUpperCase();
  sessionStorage.setItem("link_token", t);
  return t;
})();
document.getElementById("tokenBadge").textContent = `Link code: ${TOKEN}`;

const STORAGE_KEY = `survey_progress_${TOKEN}`;
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}
function saveProgress(patch = {}) {
  const prev = loadProgress() || {};
  const next = { ...prev, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
function clearProgress() { localStorage.removeItem(STORAGE_KEY); }

const BG = [
  {
    type:"intro",
    title:"General Background",
    desc:"In this section, you’ll answer a few general background questions. These help us understand how responses might vary among different people."
  },
  { type:"text", name:"prolific_id", label:"Please enter your Prolific ID:", required:true, placeholder:"e.g., 5f1234567890abcd12345678" },
  { type:"number", name:"age", label:"What is your age?", required:true, min:18, max:100 },
  { type:"radio", name:"gender", label:"What is your gender?", required:true,
    options:["Male","Female","Trans male","Trans female","Non-binary","Prefer not to say","Other"], otherName:"gender_other"
  },
  { type:"radio", name:"education", label:"Highest level of education completed?", required:true,
    options:[
      "Some high school","High school diploma or equivalent","Some college or associate's degree",
      "Bachelor's degree","Master's degree","Doctoral or professional degree"
    ]
  },
  { type:"radio", name:"politics_interest", label:"How interested in politics are you?", required:true,
    options:["Not at all interested","Slightly interested","Moderately interested","Very interested","Extremely interested"]
  },
  { type:"radio", name:"political_orientation", label:"In general, how would you describe your political orientation?", required:true,
    options:["Very liberal","Somewhat liberal","Moderate","Somewhat conservative","Very conservative","Prefer not to say"]
  },
  { type:"radio", name:"vote_2024", label:"Who did you vote for in the 2024 U.S. Presidential Election?", required:false,
    options:[
      "Joe Biden (Democratic Party)",
      "Donald Trump (Republican Party)",
      "Robert F. Kennedy Jr. (Independent)",
      "Cornel West (Independent)",
      "Jill Stein (Green Party)",
      "Did not vote / not eligible",
      "Prefer not to say",
      "Other"
    ],
    otherName:"vote_2024_other"
  },
  { type:"radio", name:"eval_confidence", label:"How confident are you in evaluating whether information is true or false?", required:true,
    options:["Not at all confident","Slightly confident","Moderately confident","Very confident","Extremely confident"]
  }
];

const HSNS_DESC = {
  title: "General Attitudes and Self-Perception",
  desc: "Please rate how characteristic each statement is of you. 1 = Very uncharacteristic/strongly disagree … 5 = Very characteristic/strongly agree."
};
const HSNS_ITEMS = [
  "I can become entirely absorbed in thinking about my personal affairs, my health, my cares, or my relations to others.",
  "My feelings are easily hurt by ridicule or the slighting remarks of others.",
  "When I enter a room, I often become self-conscious and feel that the eyes of others are upon me.",
  "I dislike sharing the credit of an achievement with others.",
  "I feel that I have enough on my hands without worrying about other people’s troubles.",
  "I feel that I am temperamentally different from most people.",
  "I often interpret the remarks of others in a personal way.",
  "I easily become wrapped up in my own interests and forget the existence of others.",
  "I dislike being with a group unless I know that I am appreciated by at least one of those present.",
  "I am secretly upset or annoyed when other people come to me with their troubles, asking me for my time and sympathy."
];

const GCB_DESC = {
  title: "General Opinions About Information and Events",
  desc: "Please read the following statements and answer about whether or not you think they are true. Use the scale where 1 = Definitely false and 5 = Definitely true."
};

const ORIGINAL_GCB = [
  "The government is involved in the murder of innocent citizens and/or well-known public figures and keeps this a secret.",
  "The power held by heads of state is second to that of small unknown groups who really control world politics.",
  "Secret organizations communicate with extraterrestrials but keep this fact from the public.",
  "The spread of certain viruses and/or diseases is the result of deliberate, concealed efforts of some organization.",
  "Groups of scientists manipulate, fabricate, or suppress evidence in order to deceive the public.",
  "The government permits or perpetrates acts of terrorism on its own soil, disguising its involvement.",
  "A small, secret group of people is responsible for making all major world decisions, such as going to war.",
  "Evidence of alien contact is being concealed from the public.",
  "Technology with mind-control capacities is used on people without their knowledge.",
  "New and advanced technology which would harm current industry is being suppressed.",
  "The government uses people as patsies to hide its involvement in criminal activity.",
  "Certain significant events have been the result of the activity of a small group who secretly manipulate world events.",
  "Some UFO sightings and rumors are planned or staged in order to distract the public from real alien contact.",
  "Experiments involving new drugs or technologies are routinely carried out on the public without their knowledge or consent.",
  "A lot of important information is deliberately concealed from the public out of self-interest."
];

const PROFESSOR_ITEMS = [
  "There was widespread voter fraud that stole the 2020 election from Donald Trump.",
  "A global network tortures and sexually abuses children in Satanic rituals.",
  "Vaccinations with tracking chips will later be activated by 5G cellular networks.",
  "Trump was secretly preparing to conduct a mass arrest of government officials and celebrities.",
  "Mueller was actually investigating a child sex-trafficking network.",
  "The coronavirus is a hoax.",
  "The government is trying to cover up the link between vaccines and autism."
];

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ];
  }
  return array;
}

const savedInit = loadProgress();
let GCB_ITEMS = savedInit?.gcb_items && Array.isArray(savedInit.gcb_items) && savedInit.gcb_items.length === (ORIGINAL_GCB.length + PROFESSOR_ITEMS.length)
  ? savedInit.gcb_items
  : shuffle([...ORIGINAL_GCB, ...PROFESSOR_ITEMS]);
if (!savedInit?.gcb_items) saveProgress({ gcb_items: GCB_ITEMS });

console.log(GCB_ITEMS);

const sections = [
  { key:"bg",   type:"background", intro:{ title: BG[0].title, desc: BG[0].desc }, items: BG.slice(1) },
  { key:"hsns", type:"likert",     intro: HSNS_DESC, items: HSNS_ITEMS.map((t,i)=>({text:t, name:`HSNS_${i+1}`, min:1,max:5})) },
  { key:"gcb",  type:"likert",     intro: GCB_DESC,  items: GCB_ITEMS.map((t,i)=>({text:t, name:`GCB_${i+1}`, min:1,max:5})) }
];

let sIndex = 0;
let qIndex = -1;
const answers = savedInit?.answers || { background:{}, hsns:[], gcb:[], specific_claims:[] };
if (savedInit) {
  sIndex = typeof savedInit.sIndex === "number" ? savedInit.sIndex : 0;
  qIndex = typeof savedInit.qIndex === "number" ? savedInit.qIndex : -1;
}

const card = document.getElementById("card");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

function scaleLegend(secKey) {
  if (secKey === "hsns") {
    const labels = [
      "Very uncharacteristic / strongly disagree",
      "Uncharacteristic",
      "Neutral",
      "Characteristic",
      "Very characteristic / strongly agree"
    ];
    return legendList(labels);
  }

  if (secKey === "gcb") {
    const labels = [
      "Definitely not true",
      "Probably not true",
      "Not sure / cannot decide",
      "Probably true",
      "Definitely true"
    ];
    return legendList(labels);
  }
  return "";
}

function legendList(labels) {
  const items = labels.map((txt, i) => `<li><strong>${i+1}</strong> = ${txt}</li>`).join("");
  return `
    <div class="scale-legend">
      <div class="legend-title small muted">Scale:</div>
      <ul class="legend-list">${items}</ul>
    </div>
  `;
}

function scrollTopSmooth() {
  try {
    document.querySelector(".wizard-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch(_) { window.scrollTo(0,0); }
}

function render() {
  const totalSteps = sections.reduce((sum,sec)=>sum + 1 + sec.items.length, 0);
  const currentStep = sections.slice(0,sIndex).reduce((sum,sec)=>sum + 1 + sec.items.length, 0) + (qIndex+1);
  const pct = Math.max(0, Math.min(100, Math.round((currentStep / totalSteps)*100)));
  document.querySelector("#progressBar span").style.width = pct + "%";
  document.getElementById("progressText").textContent = `${pct}% complete`;

  const sec = sections[sIndex];
  card.innerHTML = "";

  if (qIndex < 0) {
    const h = `
      <h2>${sec.intro.title}</h2>
      <p class="section-desc">${sec.intro.desc}</p>
    `;
    card.insertAdjacentHTML("beforeend", h);
    backBtn.disabled = sIndex === 0 && qIndex === -1;
    nextBtn.textContent = "Start section";
    nextBtn.disabled = false;
    scrollTopSmooth();
    saveProgress({ sIndex, qIndex, answers });
    return;
  }

  const n = qIndex + 1;
  let html = `<div class="q-num">Question ${n} of ${sec.items.length}</div>`;

  if (sec.type === "background") {
    const item = sec.items[qIndex];
    if (item.type === "number") {
      html += `
        <p class="q-text">${item.label}${item.required?" *":""}</p>
        <div class="group">
          <input id="${item.name}" type="number" min="${item.min}" max="${item.max}" placeholder="Enter a number" />
        </div>
      `;
    } else if (item.type === "text") {
      html += `
        <p class="q-text">${item.label}${item.required?" *":""}</p>
        <div class="group">
          <input id="${item.name}" type="text" placeholder="${item.placeholder || ""}" />
        </div>
      `;
    } else if (item.type === "radio") {
      html += `<p class="q-text">${item.label}${item.required?" *":""}</p>
               <div class="group opts">`;
      item.options.forEach((opt,i)=>{
        const id = `${item.name}_${i}`;
        const needsOther = opt === "Other" && item.otherName;
        html += `
          <label class="opt" for="${id}">
            <input id="${id}" name="${item.name}" type="radio" value="${opt}">
            ${opt}
            ${needsOther ? `<span class="inline"><input id="${item.otherName}" type="text" placeholder="Please specify"></span>`:""}
          </label>
        `;
      });
      html += `</div>`;
    }
  } else if (sec.type === "likert") {
    const item = sec.items[qIndex];
    html += `
      <p class="q-text">${item.text}</p>
      ${scaleLegend(sec.key)}
      <div class="likert-row">
    `;
    for (let v=item.min; v<=item.max; v++){
      const id = `${item.name}_${v}`;
      html += `
        <label class="opt opt-chip" for="${id}">
          <input id="${id}" type="radio" name="${item.name}" value="${v}">
          <span class="opt-num">${v}</span>
        </label>
      `;
    }
    html += `</div>`;
  }

  card.insertAdjacentHTML("beforeend", html);

  restoreValue(sec, qIndex);

  if (sec.type === "background") {
    const item = sec.items[qIndex];
    if (item.type === "radio") {
      nextBtn.disabled = !document.querySelector(`input[name="${item.name}"]:checked`);
      card.querySelectorAll(`input[name="${item.name}"]`).forEach(r => {
        r.addEventListener("change", () => { nextBtn.disabled = false; });
      });
    } else {
      nextBtn.disabled = false;
    }
  } else {
    const item = sec.items[qIndex];
    nextBtn.disabled = !document.querySelector(`input[name="${item.name}"]:checked`);
    card.querySelectorAll(`input[name="${item.name}"]`).forEach(r => {
      r.addEventListener("change", () => { nextBtn.disabled = false; });
    });
  }

  backBtn.disabled = sIndex === 0 && qIndex === -1;
  nextBtn.textContent = (sIndex === sections.length-1 && qIndex === sec.items.length-1) ? "Submit survey" : "Next";
  scrollTopSmooth();
  saveProgress({ sIndex, qIndex, answers });
}

function restoreValue(sec, idx){
  if (sec.type === "background"){
    const item = sec.items[idx];
    if (item.type === "number" && answers.background[item.name] != null) {
      document.getElementById(item.name).value = answers.background[item.name];
    }
    if (item.type === "text" && answers.background[item.name]) {
      document.getElementById(item.name).value = answers.background[item.name];
    }
    if (item.type === "radio" && answers.background[item.name]){
      const val = answers.background[item.name];
      const el = [...document.querySelectorAll(`input[name="${item.name}"]`)].find(r=>r.value===val || (typeof val === "string" && val.startsWith("Other:")));
      if (el) { el.checked = true; }
      if (typeof val === "string" && val.startsWith("Other:") && item.otherName) {
        const otherEl = document.getElementById(item.otherName);
        if (otherEl) otherEl.value = val.replace(/^Other:\s*/,"");
      }
    }
  } else {
    const item = sec.items[idx];
    const store = answers[sec.key];
    const saved = store[idx];
    if (typeof saved === "number") {
      const el = document.getElementById(`${item.name}_${saved}`);
      if (el) el.checked = true;
    }
  }
}

function readCurrentAnswer() {
  const sec = sections[sIndex];
  if (qIndex < 0) return true;

  if (sec.type === "background"){
    const item = sec.items[qIndex];
    if (item.type === "number"){
      const v = Number(document.getElementById(item.name).value);
      if (item.required && (!v || v < item.min || v > item.max)) return false;
      answers.background[item.name] = v || null;
      saveProgress({ answers });
      return true;
    } else if (item.type === "text"){
      const v = (document.getElementById(item.name).value || "").trim();
      if (item.required && !v) return false;
      answers.background[item.name] = v;
      saveProgress({ answers });
      return true;
    } else if (item.type === "radio"){
      const picked = document.querySelector(`input[name="${item.name}"]:checked`);
      if (item.required && !picked) return false;
      if (!picked) { answers.background[item.name] = null; saveProgress({ answers }); return true; }
      if (picked.value === "Other" && item.otherName){
        const other = (document.getElementById(item.otherName)?.value || "").trim();
        if (!other) return false;
        answers.background[item.name] = `Other: ${other}`;
      } else {
        answers.background[item.name] = picked.value;
      }
      saveProgress({ answers });
      return true;
    }
  } else {
    const item = sec.items[qIndex];
    const picked = document.querySelector(`input[name="${item.name}"]:checked`);
    if (!picked) return false;
    answers[sec.key][qIndex] = Number(picked.value);
    saveProgress({ answers });
    return true;
  }
}

function next() {
  if (!readCurrentAnswer()) {
    pulse(nextBtn);
    return;
  }
  const sec = sections[sIndex];
  if (qIndex < sec.items.length - 1) {
    qIndex++;
  } else {
    if (sIndex < sections.length - 1) {
      sIndex++; qIndex = -1;
    } else {
      submitSurvey();
      return;
    }
  }
  saveProgress({ sIndex, qIndex, answers });
  render();
}

function back() {
  if (qIndex >= 0) {
    qIndex--;
  } else if (sIndex > 0) {
    sIndex--; qIndex = sections[sIndex].items.length - 1;
  }
  saveProgress({ sIndex, qIndex, answers });
  render();
}

function pulse(btn){
  btn.disabled = true;
  setTimeout(()=>{ btn.disabled = false; }, 300);
}

function mean(arr){ 
  const nums = arr.filter(v => typeof v === "number");
  return nums.length ? nums.reduce((a,b)=>a+b,0) / nums.length : null;
}
function sum(arr){
  const nums = arr.filter(v => typeof v === "number");
  return nums.length ? nums.reduce((a,b)=>a+b,0) : null;
}

async function submitSurvey(){
  nextBtn.disabled = true; backBtn.disabled = true;

  const payload = {
    participantId: TOKEN,
    action: "",
    accuracy: "",
    shareIntent: "",
    meta: { phase:"survey", userAgent:navigator.userAgent, submittedAt:Date.now() },
    survey: {
      background: answers.background,
      hsns: answers.hsns,
      gcb:  answers.gcb,
      specific_claims: answers.specific_claims,
      scores: {
        hsns_mean: mean(answers.hsns),
        hsns_sum:  sum(answers.hsns),
        gcb_mean:  mean(answers.gcb),
        gcb_sum:   sum(answers.gcb),
        claims_mean: mean(answers.specific_claims),
        claims_sum:  sum(answers.specific_claims)
      }
    }
  };

  const body = new URLSearchParams({ payload: JSON.stringify(payload) }).toString();
  const blob = new Blob([body], { type: "application/x-www-form-urlencoded" });

  const sent = navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob);
  if (!sent) {
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });
    } catch (_) {}
  }

  clearProgress();

  const url = new URL(NEXT_URL, location.href);
  url.searchParams.set("token", TOKEN);
  location.href = url.toString();
}

nextBtn.addEventListener("click", next);
backBtn.addEventListener("click", back);
document.addEventListener("keydown", (e)=>{
  if (e.key === "Enter") {
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "SELECT")) return;
    next();
  }
});

render();