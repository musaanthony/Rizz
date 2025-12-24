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

    card.innerHTML = `
      <strong>${p.name}</strong><br>
      <span class="sub">${p.status}</span>
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

  if (!name) return;

  const focus = Math.max(0, Math.min(100, Number(form.focus.value) || 0));

people.push({ name, status, notes, focus });
  save();
  render();

  form.reset();
});

// Initial render
render();
