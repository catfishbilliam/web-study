/* ======================
   CONFIG
====================== */
const ENDPOINT = "https://script.google.com/macros/s/AKfycbzOZ08y8CpH1AvgvURXIP5sHFmkauS4-GNcCXE9fAmFnvdDRaEmmXLc7kRnlHHy79gDkA/exec"; 
const NEXT_URL = "task.html"; 
const TOKEN = (() => {
  const qs = new URLSearchParams(location.search);
  const t = qs.get("token") || sessionStorage.getItem("link_token") || Math.random().toString(36).slice(2,10).toUpperCase();
  sessionStorage.setItem("link_token", t);
  return t;
})();

document.getElementById("tokenBadge").textContent = `Link code: ${TOKEN}`;

/* ======================
   ITEMS (background + HSNS + ETMC + GCB)
====================== */
const BG = [
  {
    type:"intro",
    title:"General Background",
    desc:"In this section, you’ll answer a few general background questions. These help us understand how responses might vary among different people."
  },
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

// HSNS
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

// ETMC
const ETMC_DESC = {
  title:"Views on Communication and Information",
  desc:"People vary in how much they trust or question information from various sources. Please indicate your agreement with each statement. 1 = Strongly disagree … 7 = Strongly agree."
};
const ETMC_ITEMS = [
  "I usually ask people for advice when I have a personal problem.",
  "I find information easier to trust and absorb when it comes from someone who knows me well.",
  "I’d prefer to find things out for myself on the internet rather than asking people for information.",
  "I often feel that people do not understand what I want and need.",
  "I am often considered naïve because I believe almost anything that people tell me.",
  "When I speak to different people, I find myself easily persuaded by what they say even if this is different from what I believed before.",
  "Sometimes, having a conversation with people who have known me for a long time helps me develop new perspectives about myself.",
  "I find it very useful to learn from what people tell me about their experiences.",
  "If you put too much faith in what people tell you, you are likely to get hurt.",
  "When someone tells me something, my immediate reaction is to wonder why they are telling me this.",
  "I have too often taken advice from the wrong people.",
  "People have told me that I am too easily influenced by others.",
  "If I don’t know what to do, my first instinct is to ask someone whose opinion I value.",
  "I don’t usually act on advice that I get from others even when I think it’s probably sound.",
  "In the past, I have misjudged who to believe and been taken advantage of."
];

// GCB
const GCB_DESC = {
  title: "General Opinions About Information and Events",
  desc: "Please read the following statements and answer about whether or not you think they are true. Use the scale where 1 = Definitely false and 5 = Definitely true."
};

// ====== Base arrays ======
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

const GCB_ITEMS = shuffle([...ORIGINAL_GCB, ...PROFESSOR_ITEMS]);

console.log(GCB_ITEMS);

/* ======================
   Wizard model: sections → items
====================== */
const sections = [
  { key:"bg",   type:"background", intro:{ title: BG[0].title, desc: BG[0].desc }, items: BG.slice(1) },
  { key:"hsns", type:"likert",     intro: HSNS_DESC, items: HSNS_ITEMS.map((t,i)=>({text:t, name:`HSNS_${i+1}`, min:1,max:5})) },
  { key:"etmc", type:"likert",     intro: ETMC_DESC, items: ETMC_ITEMS.map((t,i)=>({text:t, name:`ETMC_${i+1}`, min:1,max:7})) },
  { key:"gcb",  type:"likert",     intro: GCB_DESC,  items: GCB_ITEMS.map((t,i)=>({text:t, name:`GCB_${i+1}`, min:1,max:5})) }
];

/* ======================
   State
====================== */
let sIndex = 0;      // current section index
let qIndex = -1;     // -1 = show section intro
const answers = { background:{}, hsns:[], gcb:[], etmc:[] };

const card = document.getElementById("card");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

/* ======================
   Helpers
====================== */
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
  if (secKey === "etmc") {
    const labels = [
      "Strongly disagree",
      "Disagree",
      "Somewhat disagree",
      "Neither agree nor disagree",
      "Somewhat agree",
      "Agree",
      "Strongly agree"
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

/* ======================
   Rendering
====================== */
function render() {
  const totalSteps = sections.reduce((sum,sec)=>sum + 1 + sec.items.length, 0); // intro + items
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
}

function restoreValue(sec, idx){
  if (sec.type === "background"){
    const item = sec.items[idx];
    if (item.type === "number" && answers.background[item.name] != null) {
      document.getElementById(item.name).value = answers.background[item.name];
    }
    if (item.type === "radio" && answers.background[item.name]){
      const val = answers.background[item.name];
      const el = [...document.querySelectorAll(`input[name="${item.name}"]`)].find(r=>r.value===val || val.startsWith("Other:"));
      if (el) { el.checked = true; }
      if (val.startsWith("Other:") && item.otherName) {
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
      return true;
    } else if (item.type === "radio"){
      const picked = document.querySelector(`input[name="${item.name}"]:checked`);
      if (item.required && !picked) return false;
      if (!picked) { answers.background[item.name] = null; return true; }
      if (picked.value === "Other" && item.otherName){
        const other = (document.getElementById(item.otherName)?.value || "").trim();
        if (!other) return false;
        answers.background[item.name] = `Other: ${other}`;
      } else {
        answers.background[item.name] = picked.value;
      }
      return true;
    }
  } else {
    const item = sec.items[qIndex];
    const picked = document.querySelector(`input[name="${item.name}"]:checked`);
    if (!picked) return false;
    answers[sec.key][qIndex] = Number(picked.value);
    return true;
  }
}

/* ======================
   Navigation
====================== */
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
  render();
}

function back() {
  if (qIndex >= 0) {
    qIndex--;
  } else if (sIndex > 0) {
    sIndex--; qIndex = sections[sIndex].items.length - 1;
  }
  render();
}

function pulse(btn){
  btn.disabled = true;
  setTimeout(()=>{ btn.disabled = false; }, 300);
}

/* ======================
   Submit → Apps Script → redirect to task.html?token=X
====================== */
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
      etmc: answers.etmc,
      scores: {
        hsns_mean: mean(answers.hsns),
        hsns_sum:  sum(answers.hsns),
        gcb_mean:  mean(answers.gcb),
        gcb_sum:   sum(answers.gcb),
        etmc_mean: mean(answers.etmc),
        etmc_sum:  sum(answers.etmc)
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

  const url = new URL(NEXT_URL, location.href);
  url.searchParams.set("token", TOKEN);
  location.href = url.toString();
}

/* ======================
   Wire up
====================== */
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