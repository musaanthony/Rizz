const STORAGE_KEY = "rizz_v1_fixed";
const FOCUS_LIMIT = 2;

let people = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const $ = id => document.getElementById(id);

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}

function setStatus(msg){
  $("status").textContent = msg || "Ready";
}

function updateButtons(){
  const disabled = people.length === 0;
  ["minus","plus","focusToggle","deleteFocused"]
    .forEach(id => $(id).disabled = disabled);
}

function render(){
  const list = $("list");
  list.innerHTML = "";

  if(people.length === 0){
    list.innerHTML = `<div class="muted">No entries yet — add a name above</div>`;
    $("phase").textContent = "0%";
    $("phaseBar").style.width = "0%";
    updateButtons();
    save();
    return;
  }

  const avg = Math.round(
    people.reduce((s,p)=>s+p.score,0) / people.length
  );

  $("phase").textContent = avg+"%";
  $("phaseBar").style.width = avg+"%";

  people.forEach(p=>{
    const row = document.createElement("div");
    row.className = "person"+(p.active?"":" paused");

    row.innerHTML = `
      <strong>${p.name}</strong> ${p.score}%
      <div class="right">
        <button onclick="change('${p.id}',10)">+10</button>
        <button onclick="change('${p.id}',-10)">−10</button>
        <button onclick="toggleFocus('${p.id}')">${p.focused?"Unfocus":"Focus"}</button>
        <button onclick="toggleActive('${p.id}')">${p.active?"Pause":"Activate"}</button>
        <button onclick="removeOne('${p.id}')">Delete</button>
      </div>
    `;
    list.appendChild(row);
  });

  updateButtons();
  save();
}

function add(){
  const n = $("nameInput").value.trim();
  if(!n){ setStatus("Type a name first"); return; }

  let p = people.find(x=>x.name.toLowerCase()===n.toLowerCase());
  if(p){
    p.score = Math.min(100,p.score+10);
  }else{
    people.push({id:Date.now()+Math.random(),name:n,score:30,focused:false,active:true});
  }

  $("nameInput").value="";
  setStatus("Saved");
  render();
}

function change(id,val){
  const p = people.find(x=>x.id==id);
  if(!p||!p.active) return;
  p.score = Math.max(0,Math.min(100,p.score+val));
  render();
}

function toggleFocus(id){
  const p = people.find(x=>x.id==id);
  if(!p||!p.active) return;

  if(!p.focused){
    const focused = people.filter(x=>x.focused);
    if(focused.length>=FOCUS_LIMIT) focused[0].focused=false;
    p.focused=true;
  }else p.focused=false;

  render();
}

function toggleActive(id){
  const p = people.find(x=>x.id==id);
  p.active=!p.active;
  if(!p.active) p.focused=false;
  render();
}

function removeOne(id){
  people = people.filter(p=>p.id!=id);
  setStatus("Entry deleted");
  render();
}

$("addBtn").onclick = add;
$("nameInput").addEventListener("keydown",e=>e.key==="Enter"&&add());
$("pauseAll").onclick = ()=>{people.forEach(p=>{p.active=false;p.focused=false});render();}
$("resumeAll").onclick = ()=>{people.forEach(p=>p.active=true);render();}
$("minus").onclick = ()=>{people.forEach(p=>p.focused&&p.active&&(p.score=Math.max(0,p.score-10)));render();}
$("plus").onclick = ()=>{people.forEach(p=>p.focused&&p.active&&(p.score=Math.min(100,p.score+10)));render();}
$("focusToggle").onclick = ()=>{
  const any = people.some(p=>p.focused);
  if(!any) return setStatus("No focused entries");
  people.forEach(p=>p.focused=false);
  render();
}
$("deleteFocused").onclick = ()=>{
  const count = people.filter(p=>p.focused).length;
  if(!count) return setStatus("No focused entries");
  people = people.filter(p=>!p.focused);
  setStatus("Deleted focused entries");
  render();
}

render();
