// Rizz Web — Version 1.1 (status buttons + focus controls)

// get DOM refs
const form = document.getElementById("addForm");
const list = document.getElementById("peopleList");

// status buttons + hidden fields
const statusBtns = document.querySelectorAll(".status-btn");
const statusHidden = document.getElementById("statusHidden");

// focus controls + hidden field
const minusBtn = document.getElementById("minusBtn");
const plusBtn = document.getElementById("plusBtn");
const focusDisplay = document.getElementById("focusDisplay");
const focusHidden = document.getElementById("focusHidden");

// initial focus value (0-100)
let focus = 0;

// load people from localStorage
let people = JSON.parse(localStorage.getItem("rizz_people")) || [];

// Save to localStorage
function save() {
  localStorage.setItem("rizz_people", JSON.stringify(people));
}

// helper: clamp and update focus UI
function updateFocusDisplay() {
  if (focus < 0) focus = 0;
  if (focus > 100) focus = 100;
  focusDisplay.textContent = `${focus}%`;
  if (focusHidden) focusHidden.value = String(focus);
}

// plus/minus handlers (step 10)
if (minusBtn) {
  minusBtn.addEventListener("click", () => {
    focus = Math.max(0, focus - 10);
    updateFocusDisplay();
  });
}
if (plusBtn) {
  plusBtn.addEventListener("click", () => {
    focus = Math.min(100, focus + 10);
    updateFocusDisplay();
  });
}

// ===== STATUS BUTTONS =====
function clearStatusSelection() {
  statusBtns.forEach(b => {
    b.classList.remove("selected");
    b.setAttribute("aria-pressed", "false");
  });
  if (statusHidden) statusHidden.value = "";
}

statusBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // toggle behavior: selecting this unselects the others
    statusBtns.forEach(b => {
      b.classList.remove("selected");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("selected");
    btn.setAttribute("aria-pressed", "true");

    if (statusHidden) statusHidden.value = btn.dataset.status;
  });
});

// ===== Advice / dashboard logic (preserved) =====
function getAdvice(p) {
  if (p.reminder) {
    return "You have something scheduled — handle this first.";
  }

  if (p.focus >= 70 && p.status === "dating") {
    return "High priority. Call or see them soon.";
  }

  if (p.focus >= 70 && p.status === "crush") {
    return "Build momentum. Light flirting or check-in works.";
  }

  if (p.focus < 40) {
    return "Low priority. Do not over-invest.";
  }

  if (p.status === "pause") {
    return "Give space. Let them come to you.";
  }

  return "Keep it steady. No pressure.";
}

function isUrgent(reminder) {
  if (!reminder) return false;
  const text = reminder.toLowerCase();
  return text.includes("today") || text.includes("tonight") || text.includes("now");
}

function updateDashboard() {
  if (people.length === 0) {
    document.getElementById("dashFocus").textContent = "—";
    document.getElementById("dashPause").textContent = "—";
    document.getElementById("dashAction").textContent = "Add someone to begin.";
    return;
  }

  const sorted = [...people].sort((a, b) => b.focus - a.focus);

  const focusPerson = sorted.find(p => p.focus >= 70);
  const pausePerson = sorted.find(p => p.focus < 40);

  document.getElementById("dashFocus").textContent =
    focusPerson ? focusPerson.name : "No high focus";

  document.getElementById("dashPause").textContent =
    pausePerson ? pausePerson.name : "No one to pause";

  if (focusPerson) {
    document.getElementById("dashAction").textContent =
      isUrgent(focusPerson.reminder)
        ? "Urgent today. Do this now."
        : focusPerson.reminder
          ? "Handle the reminder first."
          : "Reach out or plan a meet.";
  } else {
    document.getElementById("dashAction").textContent =
      "Maintain balance. Don't force anything.";
  }
}

// ===== Render list =====
function render() {
  list.innerHTML = "";

  if (people.length === 0) {
    list.innerHTML = `<div class="card sub">No entries yet</div>`;
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

// ===== Remove person =====
function removePerson(index) {
  people.splice(index, 1);
  save();
  render();
}

// ===== Utility: duplicate key (to protect duplicates) =====
function personKey(p) {
  return `${(p.name||"").trim().toLowerCase()}|${(p.status||"").trim().toLowerCase()}`;
}

// ===== Form submit handler =====
form.addEventListener("submit", e => {
  e.preventDefault();

  const name = form.name.value.trim();
  const statusValue = (form.status && form.status.value) ? form.status.value.trim() : "";
  const notes = (form.notes && form.notes.value) ? form.notes.value.trim() : "";
  const reminder = (form.reminder && form.reminder.value) ? form.reminder.value.trim() : "";
  const focusVal = Number((form.focus && form.focus.value) ? form.focus.value : focus);

  if (!name) return;

  const focusFinal = Math.max(0, Math.min(100, Number(isNaN(focusVal) ? 0 : focusVal)));

  // duplicate protection
  const newKey = personKey({ name, status: statusValue });
  if (people.some(p => personKey(p) === newKey)) {
    alert("This person already exists.");
    return;
  }

  people.push({ name, status: statusValue, notes, focus: focusFinal, reminder });
  save();
  render();

  // reset the form and focus buttons
  form.reset();
  clearStatusSelection();

  // reset focus variable and UI
  focus = 0;
  updateFocusDisplay();
});

// Initial UI setup
updateFocusDisplay();
render();