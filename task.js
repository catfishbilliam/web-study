// ====== CONFIG ======
const ENDPOINT = "https://script.google.com/macros/s/AKfycbyI-OeUgLbyZjc51xcl3A23VcQnd61NjZmpOSTXrtbvsQ_9AW3S7lO5t-o-4iuWkyOzIg/exec";
const PROLIFIC_CODE = "CIXRDKFP";
const DEV_SHOW_REDIRECT = false;

// ====== TOKEN (URL or session) ======
const qs = new URLSearchParams(location.search);
let TOKEN = qs.get("token") || sessionStorage.getItem("link_token") || "";
if (!TOKEN) {
  TOKEN = Math.random().toString(36).slice(2, 10).toUpperCase();
}
sessionStorage.setItem("link_token", TOKEN);
const tokenBadgeEl = document.getElementById("tokenBadge");
if (tokenBadgeEl) tokenBadgeEl.textContent = `Link code: ${TOKEN}`;

// ====== Utils ======
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// ---- Persisted order & progress ----
const STORAGE_KEY = `task_progress_${TOKEN}`;

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
  catch { return null; }
}
function saveProgress(patch = {}) {
  const prev = loadProgress() || {};
  const next = { ...prev, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

// Base list (your POSTS content moves here unchanged)
const BASE_POSTS = [
  // ---- False Conspiratorial ----
  {
    id: "fb-1",
    platform: "facebook",
    condition: "false_conspiratorial",
    headline: "Alien whistleblower",
    src: "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fthepeoplesvoicetv%2Fposts%2Fpfbid0b537JYCwGfzNqYyPaBHF4sMbZHq657ALUefTAwjFvj9JM3ck4sHtB2BdyfoGmmZcl&show_text=true&width=500"
  },
  {
    id: "ig-5",
    platform: "instagram",
    condition: "false_conspiratorial",
    headline: "Docs reveal China discussed weaponizing COVID 5 years prior",
    permalink: "https://www.instagram.com/p/COs9HATMNGN/"
  },

  // ---- False Non-Conspiratorial Sensational ----
  {
    id: "fb-2",
    platform: "facebook",
    condition: "false_sensational",
    headline: "War with Iran → draft reinstated",
    src: "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FEmpireNewsNet%2Fposts%2Fpfbid06RJ9yyoK3NoeAXjnPiBo2rrotRh9cpU58HvTaMyz88huC1JzRuMvRqVjzZH67U8El&show_text=true&width=500"
  },
  {
    id: "fb-3",
    platform: "facebook",
    condition: "false_sensational",
    headline: "Travis Kelce cold feet",
    src: "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FTheOnion%2Fposts%2Fpfbid039GfuLZTgAWgG6YTdBGZncdf2ZAJJ6PKo5ZuMsRzBQsxkZbtnXaLURxMzV3F5uqFl&show_text=true&width=500"
  },

  // ---- True Neutral Informational ----
  {
    id: "ig-4",
    platform: "instagram",
    condition: "true_neutral",
    headline: "Earth is spinning faster",
    permalink: "https://www.instagram.com/p/DMZjzVBIPP3/"
  },
  {
    id: "ig-6",
    platform: "instagram",
    condition: "true_neutral",
    headline: "Earth is potentially in a cosmic void",
    permalink: "https://www.instagram.com/p/DMEhSqKpH7N/"
  },

  // ---- True Attention-Grabbing Factual ----
  {
    id: "ig-1",
    platform: "instagram",
    condition: "true_attention",
    headline: "NASA → asteroid",
    permalink: "https://www.instagram.com/reel/DPCI77UlWpA/"
  },
  {
    id: "ig-3",
    platform: "instagram",
    condition: "true_attention",
    headline: "One mice, two dads",
    permalink: "https://www.instagram.com/p/BozSeF9FS6s/"
  }
];

// Build the session's order once, then reuse it
const saved = loadProgress();
let POSTS;
if (saved?.orderIds?.length) {
  POSTS = saved.orderIds
    .map(id => BASE_POSTS.find(p => p.id === id))
    .filter(Boolean);
} else {
  POSTS = shuffle([...BASE_POSTS]);
  saveProgress({ orderIds: POSTS.map(p => p.id), currentIndex: 0 });
}

// Start from saved index if available
let currentIndex = Math.max(0, Math.min(saved?.currentIndex ?? 0, POSTS.length - 1));


const embedWrap     = document.getElementById("embedWrap");
const ratingsCard   = document.getElementById("ratingsCard");
const accuracyEl    = document.getElementById("accuracy");
const confidenceEl  = document.getElementById("accuracyConfidence");
const shareSel      = document.getElementById("shareIntent");
const submitBtn     = document.getElementById("submitTask");
const progressText  = document.getElementById("progressText");
const progressBar   = document.querySelector("#progressBar > span");
const mainCard      = document.querySelector("main.wizard-card");
const thanksCard    = document.getElementById("thanks");
const actionBtns = document.querySelectorAll(".feed-actions .btn");

const state = {
  token: TOKEN,
  action: null,
  accuracy: 3,
  confidence: 3,
  shareIntent: "",
  startTime: null
};

const TASK_STORAGE_KEY = `task_progress_${TOKEN}`;
const TASK_VERSION = 1;

function loadTaskProgress() {
  try {
    const raw = localStorage.getItem(TASK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.v !== TASK_VERSION) return null;
    return parsed;
  } catch { return null; }
}
function saveTaskProgress() {
  try {
    const payload = {
      v: TASK_VERSION,
      when: Date.now(),
      currentIndex,
      state: {
        action: state.action,
        accuracy: state.accuracy,
        confidence: state.confidence,
        shareIntent: state.shareIntent,
        startTime: state.startTime
      }
    };
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}
function clearTaskProgress() {
  try { localStorage.removeItem(TASK_STORAGE_KEY); } catch {}
}

(function ensureIGScript() {
  if (!window.instgrm) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "//www.instagram.com/embed.js";
    document.head.appendChild(s);
  }
})();

const taskSaved = loadTaskProgress();
if (taskSaved && typeof taskSaved.currentIndex === "number") {
  currentIndex = Math.min(Math.max(taskSaved.currentIndex, 0), POSTS.length - 1);
  if (taskSaved.state && typeof taskSaved.state === "object") {
    Object.assign(state, taskSaved.state);
  }
}

function mountSpinner(container) {
  if (!container) return;
  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }
  let overlay = container.querySelector(".spinner-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "spinner-overlay";
    overlay.innerHTML = `
      <div class="spinner" role="status" aria-live="polite" aria-label="Loading post"></div>
      <div class="spinner-text small">Loading post…</div>
    `;
    container.appendChild(overlay);
  }
  overlay.style.display = "grid";
  container.classList.remove("loaded");
}
function unmountSpinner(container) {
  if (!container) return;
  container.classList.add("loaded");
  const overlay = container.querySelector(".spinner-overlay");
  if (overlay) overlay.style.display = "none";
}

function renderPost(index) {
  const total = POSTS.length;
  const n = Math.min(Math.max(index + 1, 1), total);
  if (progressText) progressText.textContent = `Post ${n} of ${total}`;
  if (progressBar)  progressBar.style.width = `${Math.round((n / total) * 100)}%`;

  saveProgress({ currentIndex: index });

  actionBtns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
  ratingsCard.classList.add("hidden");
  accuracyEl.value = "3";
  confidenceEl.value = "3";
  shareSel.value = "";

  if (state.action) {
    actionBtns.forEach(b => {
      b.disabled = true;
      b.classList.toggle("primary", b.dataset.action === state.action);
    });
    ratingsCard.classList.remove("hidden");
    accuracyEl.value   = String(state.accuracy ?? 3);
    confidenceEl.value = String(state.confidence ?? 3);
    shareSel.value     = String(state.shareIntent ?? "");
  }

  state.action      = state.action && POSTS[index] ? state.action : null;
  state.accuracy    = Number.isFinite(state.accuracy) ? state.accuracy : 3;
  state.confidence  = Number.isFinite(state.confidence) ? state.confidence : 3;
  state.shareIntent = state.shareIntent || "";

  state.startTime = performance.now();

  embedWrap.innerHTML = `
    <div class="spinner-overlay" aria-live="polite" aria-label="Loading post…">
      <div class="spinner"></div>
      <div class="spinner-text small">Loading post…</div>
    </div>
  `;
  mountSpinner(embedWrap);

  saveTaskProgress();

  const post = POSTS[index];
  let settled = false;
  const settle = () => { if (settled) return; settled = true; unmountSpinner(embedWrap); };

  if (post.platform === "facebook") {
    const fbSrcWithWidth = (src, w) => {
      try {
        const u = new URL(src);
        u.searchParams.set("width", String(w));
        u.searchParams.set("show_text", "true");
        u.searchParams.set("adapt_container_width", "true");
        return u.toString();
      } catch {
        return src;
      }
    };
    const wrapW = Math.max(350, Math.min(750, Math.floor(embedWrap.clientWidth || 700)));
    const iframe = document.createElement("iframe");
    iframe.className = "fb-post-embed";
    iframe.src = fbSrcWithWidth(post.src, wrapW);
    iframe.setAttribute("width", "100%");
    iframe.style.width = "100%";
    iframe.style.maxWidth = "750px";
    iframe.setAttribute("height", String(Math.round(wrapW * 1.1)));
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.scrolling = "no";
    iframe.allowFullscreen = true;
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
    embedWrap.appendChild(iframe);
    iframe.addEventListener("load", settle, { once: true });
    setTimeout(settle, 12000);
  } else if (post.platform === "instagram") {
    const block = document.createElement("blockquote");
    block.className = "instagram-media ig-embed";
    block.setAttribute("data-instgrm-captioned", "");
    block.setAttribute("data-instgrm-permalink", post.permalink);
    block.setAttribute("data-instgrm-version", "14");
    Object.assign(block.style, {
      background:"#fff", border:"0", borderRadius:"14px", boxShadow:"0 1px 3px rgba(0,0,0,.12)",
      margin:"0 auto", maxWidth:"540px", minWidth:"300px", padding:"0", width:"100%"
    });
    embedWrap.appendChild(block);
    if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
    const obs = new MutationObserver(() => {
      const igFrame = embedWrap.querySelector("iframe");
      if (igFrame) {
        igFrame.addEventListener("load", settle, { once: true });
        obs.disconnect();
      }
    });
    obs.observe(embedWrap, { childList: true, subtree: true });
    setTimeout(settle, 12000);
  } else if (post.platform === "twitter") {
    const extractId = (u) => {
      const m = String(u || "").match(/status\/(\d+)/);
      return m ? m[1] : null;
    };
    const tweetId = post.tweetId || extractId(post.src);
    const tryCreate = () => {
      if (!window.twttr?.widgets || !tweetId) return false;
      window.twttr.widgets
        .createTweet(tweetId, embedWrap, { align: "center", dnt: true, theme: "light" })
        .then(() => settle())
        .catch(() => settle());
      return true;
    };
    if (!tryCreate() && window.twttr?.ready) {
      window.twttr.ready(() => { tryCreate(); });
    }
    setTimeout(settle, 12000);
  }
}

actionBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    state.action = btn.dataset.action;
    actionBtns.forEach(b => { b.disabled = true; b.classList.remove("primary"); });
    btn.classList.add("primary");
    if (ratingsCard.classList.contains("hidden")) {
      ratingsCard.classList.remove("hidden");
      ratingsCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    saveTaskProgress();
  });
});

accuracyEl.addEventListener("input", () => {
  const v = Number(accuracyEl.value);
  state.accuracy = Number.isFinite(v) ? v : 3;
  saveTaskProgress();
});
confidenceEl.addEventListener("input", () => {
  const v = Number(confidenceEl.value);
  state.confidence = Number.isFinite(v) ? v : 3;
  saveTaskProgress();
});
shareSel.addEventListener("input", () => {
  state.shareIntent = shareSel.value || "";
  saveTaskProgress();
});

submitBtn.addEventListener("click", async () => {
  if (!state.action) {
    alert("Please choose an interaction (Like, Comment, Report, or Skip) before submitting.");
    return;
  }
  if (!state.accuracy || Number.isNaN(state.accuracy)) {
    alert("Please set a perceived accuracy rating.");
    return;
  }
  state.shareIntent = shareSel.value || "";

  const post = POSTS[currentIndex];
  const dwellMs = performance.now() - (state.startTime || performance.now());

  const payload = {
    participantId: TOKEN,
    trialIndex: currentIndex,
    confidence: state.confidence,
    action: state.action,
    accuracy: state.accuracy,
    shareIntent: state.shareIntent,
    dwellMs,
    post: {
      id: post.id,
      platform: post.platform,
      condition: post.condition,
      headline: post.headline,
      permalink: post.permalink || "",
      src: post.src || "",
      url: post.permalink || post.src || ""
    },
    meta: {
      phase: "task",
      userAgent: navigator.userAgent,
      submittedAt: Date.now(),
      trialIndex: currentIndex,
      post: {
        id: post.id,
        platform: post.platform,
        condition: post.condition,
        headline: post.headline,
        url: post.permalink || post.src || ""
      }
    }
  };

  const body = new URLSearchParams({ payload: JSON.stringify(payload) }).toString();

  try {
    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
  } catch {}

  saveTaskProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
  state.startTime = performance.now();

  if (currentIndex < POSTS.length - 1) {
    currentIndex += 1;
    saveTaskProgress();
    renderPost(currentIndex);
  } else {
    clearTaskProgress();
    document.querySelector("main.wizard-card")?.classList.add("hidden");
    document.getElementById("ratingsCard")?.classList.add("hidden");
    document.getElementById("thanks")?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    const codeEl = document.getElementById("code");
    if (codeEl) codeEl.textContent = PROLIFIC_CODE;
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => renderPost(currentIndex));
} else {
  renderPost(currentIndex);
}

window.addEventListener('resize', () => {
  const post = POSTS[currentIndex];
  if (post?.platform === 'facebook') renderPost(currentIndex);
});

window.addEventListener("beforeunload", saveTaskProgress);