// Rizz Web — Version 1 Core Engine (STABLE + focus-buttons)

// ===== DOM =====
const form = document.getElementById("addForm");
const list = document.getElementById("peopleList");

// ===== LOAD STORAGE SAFELY =====
let people = JSON.parse(localStorage.getItem("rizz_people")) || [];
if (!Array.isArray(people)) people = [];

// ===== HELPERS =====
function personKey(p) {
  return `${(p.name || "").toLowerCase()}|${(p.status || "").toLowerCase()}|${(p.notes || "").toLowerCase()}|${(p.reminder || "").toLowerCase()}`;
}

// Remove duplicates ON LOAD (permanent fix)
(function dedupeOnLoad() {
  const seen = new Set();
  const clean = [];

  for (const p of people) {
    const key = personKey(p);
    if (!seen.has(key)) {
      seen.add(key);
      clean.push(p);
    }
  }

  people = clean;
  localStorage.setItem("rizz_people", JSON.stringify(people));
})();

// ===== STORAGE =====
function save() {
  localStorage.setItem("rizz_people", JSON.stringify(people));
}

// ===== ADVICE ENGINE =====
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

// ===== URGENCY CHECK =====
function isUrgent(reminder) {
  if (!reminder) return false;
  const text = reminder.toLowerCase();
  return (
    text.includes("today") ||
    text.includes("tonight") ||
    text.includes("now")
  );
}

// ===== DASHBOARD =====
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
      "Maintain balance. Don’t force anything.";
  }
}

// ===== RENDER =====
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

// ===== REMOVE =====
function removePerson(index) {
  people.splice(index, 1);
  save();
  render();
}

// ===== FOCUS BUTTONS WIRING =====
// This will attach listeners to the focus buttons and set the hidden input value.
function wireFocusButtons() {
  const focusBtns = document.querySelectorAll(".focus-button");
  if (!focusBtns || focusBtns.length === 0) return;

  focusBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.getAttribute("data-focus") || "0";
      // set hidden input
      const hidden = form.querySelector('[name="focus"]');
      if (hidden) hidden.value = v;

      // toggle selected class
      focusBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}

// ===== ADD =====
form.addEventListener("submit", e => {
  e.preventDefault();

  const name = form.name.value.trim();
  const status = form.status.value;
  const notes = form.notes.value.trim();
  const reminder = form.reminder.value.trim();
  const focus = Math.max(0, Math.min(100, Number(form.focus.value) || 0));

  if (!name) return;

  // Duplicate protection
  const newKey = personKey({ name, status, notes, reminder });
  if (people.some(p => personKey(p) === newKey)) {
    alert("This person already exists.");
    return;
  }

  people.push({ name, status, notes, focus, reminder });
  save();
  render();

  // reset the form and focus buttons
  form.reset();
  const hidden = form.querySelector('[name="focus"]');
  if (hidden) hidden.value = "0";

  // clear selected state from focus buttons
  const focusBtns = document.querySelectorAll(".focus-button");
  focusBtns.forEach(b => b.classList.remove("selected"));
});

// ===== START =====
wireFocusButtons();
render();