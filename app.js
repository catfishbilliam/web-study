// ====== CONFIG ======
const ENDPOINT = "https://script.google.com/macros/s/AKfycbyiaShvyv8Hhfp_n-qiGevmC50jFM3BGey_wtsbGGw242Ikc8POWkBNS4_VdVfVPapdTg/exec";
const PROLIFIC_CODE = "CIXRDKFP"; // <-- set your actual completion code
const PROLIFIC_COMPLETION_URL = `https://app.prolific.com/submissions/complete?cc=${encodeURIComponent(PROLIFIC_CODE)}`;
const DEV_SHOW_REDIRECT = false; // set true to open Prolific in dev

// ====== Read Prolific params ======
const qs = new URLSearchParams(location.search);
const PID = qs.get("PROLIFIC_PID") || `DEV_${Date.now()}`;
const STUDY_ID = qs.get("STUDY_ID") || "";
const SESSION_ID = qs.get("SESSION_ID") || "";

// ====== Minimal state ======
const state = {
  participantId: PID,
  action: null,
  accuracy: null,
  shareIntent: null
};

// Capture action
document.querySelectorAll(".feed-actions .btn").forEach(btn => {
  btn.addEventListener("click", () => {
    state.action = btn.dataset.action; // like | share | report | skip
    // UI feedback
    document.querySelectorAll(".feed-actions .btn").forEach(b => { b.disabled = true; b.classList.remove("primary"); });
    btn.classList.add("primary");
  });
});

// Submit handler
document.getElementById("submitTask").addEventListener("click", () => {
  state.accuracy = Number(document.getElementById("accuracy").value);
  state.shareIntent = document.getElementById("shareIntent").value || "";

  const payload = {
    participantId: state.participantId,
    action: state.action,
    accuracy: state.accuracy,
    shareIntent: state.shareIntent,
    meta: {
      userAgent: navigator.userAgent,
      submittedAt: Date.now(),
      studyId: STUDY_ID,
      sessionId: SESSION_ID
    }
  };

  // Send to Apps Script (form-encoded, beacon first)
  const body = new URLSearchParams({ payload: JSON.stringify(payload) }).toString();
  const blob = new Blob([body], { type: "application/x-www-form-urlencoded" });
  const ok = navigator.sendBeacon(ENDPOINT, blob);
  if (!ok) {
    fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    }).catch(console.error);
  }

  // Show debrief + completion code
  document.getElementById("thanks").classList.remove("hidden");
  document.getElementById("code").textContent = PROLIFIC_CODE;
  document.getElementById("finishLink").href = PROLIFIC_COMPLETION_URL;
  document.getElementById("dump").textContent = JSON.stringify(payload, null, 2);

  // Optionally auto-open Prolific in dev
  if (DEV_SHOW_REDIRECT && !PID.startsWith("DEV_")) {
    window.open(PROLIFIC_COMPLETION_URL, "_blank", "noopener");
  }
});