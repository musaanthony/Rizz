// Rizz Web — Version 1 (stable) with correct ± focus sync

// ===== DOM =====
const form = document.getElementById("addForm");
const list = document.getElementById("peopleList");

// ===== load storage safely =====
let people = JSON.parse(localStorage.getItem("rizz_people")) || [];
if (!Array.isArray(people)) people = [];

// ===== dedupe on load (so old deleted duplicates go away) =====
(function dedupeOnLoad() {
  const seen = new Set();
  const clean = [];
  for (const p of people) {
    const key = `${(p.name||"").toLowerCase()}|${(p.status||"").toLowerCase()}|${(p.notes||"").toLowerCase()}|${(p.reminder||"").toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      clean.push(p);
    }
  }
  people = clean;
  localStorage.setItem("rizz_people", JSON.stringify(people));
})();

// ===== storage =====
function save() {
  localStorage.setItem("rizz_people", JSON.stringify(people));
}

// ===== advice engine =====
function getAdvice(p) {
  if (p.reminder) return "You have something scheduled — handle this first.";
  if (p.focus >= 70 && p.status === "dating") return "High priority. Call or see them soon.";
  if (p.focus >= 70 && p.status === "crush") return "Build momentum. Light flirting or check-in works.";
  if (p.focus < 40) return "Low priority. Do not over-invest.";
  if (p.status === "pause") return "Give space. Let them come to you.";
  return "Keep it steady. No pressure.";
}

// ===== urgency check =====
function isUrgent(reminder) {
  if (!reminder) return false;
  const text = reminder.toLowerCase();
  return text.includes("today") || text.includes("tonight") || text.includes("now");
}

// ===== dashboard =====
function updateDashboard() {
  if (people.length === 0) {
    document.getElementById("dashFocus").textContent = "—";
    document.getElementById("dashPause").textContent = "—";
    document.getElementById("dashAction").textContent = "Add someone to begin.";
    return;
  }

  const sorted = [...people].sort((a,b) => b.focus - a.focus);
  const focusPerson = sorted.find(p => p.focus >= 70);
  const pausePerson = sorted.find(p => p.focus < 40);

  document.getElementById("dashFocus").textContent = focusPerson ? focusPerson.name : "No high focus";
  document.getElementById("dashPause").textContent = pausePerson ? pausePerson.name : "No one to pause";

  if (focusPerson) {
    document.getElementById("dashAction").textContent =
      isUrgent(focusPerson.reminder)
        ? "Urgent today. Do this now."
        : focusPerson.reminder
          ? "Handle the reminder first."
          : "Reach out or plan a meet.";
  } else {
    document.getElementById("dashAction").textContent = "Maintain balance. Don’t force anything.";
  }
}

// ===== render =====
function render() {
  list.innerHTML = "";
  if (people.length === 0) {
    list.innerHTML = `<div class="card sub">No entries yet</div>`;
    updateDashboard();
    return;
  }

  people.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";
    if (p.focus < 40) card.classList.add("low-focus");
    if (p.focus >= 70) card.classList.add("high-focus");
    if (p.reminder) card.classList.add("has-reminder");
    if (isUrgent(p.reminder)) card.classList.add("urgent");

    card.innerHTML = `
      <strong>${p.name}</strong><br>
      <span class="sub">${p.status}</span>

      <div class="focus-wrap">
        <div class="focus-bar">
          <div class="focus-fill" style="width:${p.focus}%"></div>
        </div>
        <div class="sub">${p.focus}% focus</div>
      </div>

      ${p.reminder ? `<div class="reminder">⏰ ${p.reminder}</div>` : ""}
      <div class="advice">${getAdvice(p)}</div>

      <p>${p.notes || ""}</p>
      <button onclick="removePerson(${i})">Remove</button>
    `;
    list.appendChild(card);
  });

  updateDashboard();
}

// ===== remove =====
function removePerson(index) {
  people.splice(index, 1);
  save();
  render();
}

// ===== FOCUS ± control: single source of truth =====
let currentFocus = 0;
const focusDisplay = document.getElementById("focusValue");
const focusInput = form.querySelector('[name="focus"]');
const plusBtn = document.getElementById("focusPlus");
const minusBtn = document.getElementById("focusMinus");

function updateFocus(val) {
  currentFocus = Math.max(0, Math.min(100, Number(val) || 0));
  // update UI and hidden input (keeps everything in sync)
  if (focusDisplay) focusDisplay.textContent = `${currentFocus}%`;
  if (focusInput) focusInput.value = String(currentFocus);
}

// attach events safely (in case DOM loaded earlier/later)
if (plusBtn) {
  plusBtn.addEventListener("click", () => updateFocus(currentFocus + 10));
}
if (minusBtn) {
  minusBtn.addEventListener("click", () => updateFocus(currentFocus - 10));
}

// ensure initial values are shown
updateFocus(0);

// ===== add person =====
form.addEventListener("submit", e => {
  e.preventDefault();

  const name = form.name.value.trim();
  const status = form.status.value;
  const notes = form.notes.value.trim();
  const reminder = form.reminder.value.trim();
  // read from hidden input (kept in sync by updateFocus)
  const focus = Math.max(0, Math.min(100, Number(form.focus.value) || 0));

  if (!name) return;

  // duplicate protection based on core fields
  const newKey = `${name.toLowerCase()}|${(status||"").toLowerCase()}|${(notes||"").toLowerCase()}|${(reminder||"").toLowerCase()}`;
  if (people.some(p => `${(p.name||"").toLowerCase()}|${(p.status||"").toLowerCase()}|${(p.notes||"").toLowerCase()}|${(p.reminder||"").toLowerCase()}` === newKey)) {
    alert("This person already exists.");
    return;
  }

  people.push({ name, status, notes, focus, reminder });
  save();
  render();

  // reset the form AND focus state (keeps UI + hidden input in sync)
  form.reset();
  updateFocus(0);
});

// ===== initial render =====
render();