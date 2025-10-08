// ====== CONFIG ======
const ENDPOINT = "https://script.google.com/macros/s/AKfycbyFF64b8m-06gFnDltUGf5wd_1PKIrXQUnAhcjKYBnb2WeEeoNme0MCLnWmPkAGm-ZsTg/exec"; 
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

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]
    ];
  }

  return array;
}

// ====== POSTS SEQUENCE (one at a time) ======
const POSTS = [
  { id: "ig-1", platform: "instagram", permalink: "https://www.instagram.com/reel/DPCI77UlWpA/?utm_source=ig_embed&utm_campaign=loading" },
  { id: "fb-1", platform: "facebook",  src: "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fthepeoplesvoicetv%2Fposts%2Fpfbid0b537JYCwGfzNqYyPaBHF4sMbZHq657ALUefTAwjFvj9JM3ck4sHtB2BdyfoGmmZcl&show_text=true&width=500" },
  { id: "ig-2", platform: "instagram", permalink: "https://www.instagram.com/p/DPVFqLCjAOS/?utm_source=ig_embed&utm_campaign=loading" },
  { id: "tw-1", platform: "twitter",   tweetId: "1974091628240306230" },
  { id: "ig-3", platform: "instagram", permalink: "https://www.instagram.com/p/BozSeF9FS6s/?utm_source=ig_embed&utm_campaign=loading" },
  { id: "fb-2", platform: "facebook",  src: "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fcnninternational%2Fposts%2Fpfbid029aDqGzSYniqn7zFeUERb5aPBU92aHfvDDrpC3GjuahvZY4f5D8JtNNSVXcRDhkYtl&show_text=true&width=500" },
  { id: "fb-3", platform: "facebook",  src: "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FEmpireNewsNet%2Fposts%2Fpfbid02AStsTnzsiJjDpfvHd4XmdvexeNAijtFZYRDtRKpWmZP3ofb4M6yGQ1aD3icpwu5al&show_text=true&width=500" },
  { id: "fb-4", platform: "facebook",  src: "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FEmpireNewsNet%2Fposts%2Fpfbid02KycDGjMN2nqcMJHF26YMgFZTG8jTrtFNfmXJHaHums45Tj1j3fy1U3ofGuTdp1Dhl&show_text=true&width=500" },
  { id: "tw-2", platform: "twitter",   tweetId: "1975274977206194409" },
  { id: "ig-4", platform: "instagram", permalink: "https://www.instagram.com/p/DMEhSqKpH7N/?utm_source=ig_embed&utm_campaign=loading" },
  { id: "fb-5", platform: "facebook",  src: "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FRedWhiteandTrueNews%2Fposts%2Fpfbid02Gek3EpVNXb2NFNvLr1pDnejqaC2x78BH5TP7L5VN5NGE2wYWMY6R2QGdbzMq6royl&show_text=true&width=500" },
  { id: "ig-5", platform: "instagram", permalink: "https://www.instagram.com/p/COs9HATMNGN/?utm_source=ig_embed&utm_campaign=loading" }
];

shuffle(POSTS);

let currentIndex = 0;

// ====== Elements ======
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
  shareIntent: ""
};

(function ensureIGScript() {
  if (!window.instgrm) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "//www.instagram.com/embed.js";
    document.head.appendChild(s);
  }
})();

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

  state.action = null;
  state.accuracy = 3;
  state.confidence = 3;
  state.shareIntent = "";

  actionBtns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
  ratingsCard.classList.add("hidden");
  accuracyEl.value = "3";
  confidenceEl.value = "3";
  shareSel.value = "";

  embedWrap.innerHTML = `
    <div class="spinner-overlay" aria-live="polite" aria-label="Loading post…">
      <div class="spinner"></div>
      <div class="spinner-text small">Loading post…</div>
    </div>
  `;
  mountSpinner(embedWrap);

  const post = POSTS[index];
  let settled = false;
  const settle = () => { if (settled) return; settled = true; unmountSpinner(embedWrap); };

  if (post.platform === "facebook") {
    const iframe = document.createElement("iframe");
    iframe.src = post.src;
    iframe.width = "500";
    iframe.height = "520";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.maxWidth = "100%";
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
  
    // Safety timeout
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
  });
});

accuracyEl.addEventListener("input", () => {
  const v = Number(accuracyEl.value);
  state.accuracy = Number.isFinite(v) ? v : 3;
});
confidenceEl.addEventListener("input", () => {
  const v = Number(confidenceEl.value);
  state.confidence = Number.isFinite(v) ? v : 3;
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

  const payload = {
    token: state.token,
    action: state.action,
    accuracy: state.accuracy,
    shareIntent: state.shareIntent,
    confidence: state.confidence,
    meta: {
      phase: "task",
      userAgent: navigator.userAgent,
      submittedAt: Date.now(),
      postIndex: currentIndex,
      postId: post.id,
      platform: post.platform,
      postUrl: post.permalink || post.src,
      uuid: (crypto && crypto.randomUUID) ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now())
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
    console.log("[task] POST sent", payload.meta.uuid);
  } catch (err) {
    console.error("[task] POST failed", err);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (currentIndex < POSTS.length - 1) {
    currentIndex += 1;
    renderPost(currentIndex);
  } else {
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