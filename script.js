// Rizz Web — Version 1 Core Engine

const form = document.getElementById("addForm");
const list = document.getElementById("peopleList");

let people = JSON.parse(localStorage.getItem("rizz_people")) || [];

// Save to localStorage
function save() {
  localStorage.setItem("rizz_people", JSON.stringify(people));
}

// Render people list
function render() {
  list.innerHTML = "";

  if (people.length === 0) {
    list.innerHTML = `<div class="card sub">No entries yet</div>`;
    return;
  }

  people.forEach((p, i) => {
    const card = document.createElement("div");
card.className = "card";

if (p.focus < 40) {
  card.classList.add("low-focus");
}

if (p.focus >= 70) {
  card.classList.add("high-focus");
}

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
  

  <p>${p.notes}</p>
  <button onclick="removePerson(${i})">Remove</button>
`;

    list.appendChild(card);
  });
}

// Remove person
function removePerson(index) {
  people.splice(index, 1);
  save();
  render();
}

// Add person
form.addEventListener("submit", e => {
  e.preventDefault();

  const name = form.name.value.trim();
  const status = form.status.value;
  const notes = form.notes.value.trim();
  const reminder = form.reminder.value.trim();

  if (!name) return;

  const focus = Math.max(0, Math.min(100, Number(form.focus.value) || 0));

people.push({ name, status, notes, focus, reminder });
  save();
  render();

  form.reset();
});

// Initial render
render();
