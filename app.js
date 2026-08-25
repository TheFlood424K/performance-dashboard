// Stack Manager — PK/drug index + dose log
const DRUG_KEY='stack-mgr.drugs.v1';
const LOG_KEY='stack-mgr.log.v1';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

let drugs=load(DRUG_KEY);
let log=load(LOG_KEY);

function load(k){try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function save(){localStorage.setItem(DRUG_KEY,JSON.stringify(drugs));localStorage.setItem(LOG_KEY,JSON.stringify(log))}
function uid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function msg(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(msg._t);msg._t=setTimeout(()=>el.classList.remove('show'),3500)}
function nowLocal(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)}

// Theme
(function(){
  const r=document.documentElement;
  let d=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  r.setAttribute('data-theme',d);
  const btn=$('[data-theme-toggle]');
  if(btn)btn.addEventListener('click',()=>{
    d=d==='dark'?'light':'dark';
    r.setAttribute('data-theme',d);
  });
})();

// Nav
const viewTitles={index:'Drug Index',log:'Dose Log',schedule:'Active Window',data:'Data & Export'};
$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.nav-item').forEach(b=>b.classList.remove('active'));
  $$('.view').forEach(v=>v.classList.remove('active'));
  btn.classList.add('active');
  const v=btn.dataset.view;
  $(`#view-${v}`).classList.add('active');
  $('#page-title').textContent=viewTitles[v]||v;
  if(v==='log')renderLog();
  if(v==='schedule')renderActive();
}));

$('#sidebar-collapse').addEventListener('click',()=>$('#sidebar').classList.toggle('collapsed'));
$('#hamburger').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
document.addEventListener('click',e=>{
  const sb=$('#sidebar');
  if(!sb.contains(e.target)&&!e.target.closest('#hamburger'))sb.classList.remove('open');
});

// Drug Index
function renderIndex(filter=''){
  const grid=$('#drug-grid');const empty=$('#drug-empty');
  const q=filter.toLowerCase();
  const visible=drugs.filter(d=>
    d.name.toLowerCase().includes(q)||
    (d.category||'').toLowerCase().includes(q)||
    (d.metabolites||'').toLowerCase().includes(q)||
    (d.mechanism||'').toLowerCase().includes(q)
  );
  empty.hidden=!!visible.length;
  grid.innerHTML=visible.map(d=>`
    <article class="drug-card" role="listitem" tabindex="0" data-id="${esc(d.id)}">
      <div class="drug-card-header">
        <div>
          <div class="drug-name">${esc(d.name)}</div>
          ${d.category?`<span class="drug-category">${esc(d.category)}</span>`:''}
        </div>
        <div class="drug-card-actions">
          <button class="icon-btn sm edit-drug" data-id="${esc(d.id)}" aria-label="Edit ${esc(d.name)}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn sm delete-drug" data-id="${esc(d.id)}" aria-label="Delete ${esc(d.name)}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
      <div class="drug-pk">
        ${pkRow('Onset',d.onsetMin,'min')}
        ${pkRow('Peak',d.peakMin,'min')}
        ${pkRow('Duration',d.durationH,'h')}
        ${pkRow('Half-life',d.halfLifeH,'h')}
        ${pkRow('Bioavail.',d.bioavailability,'%')}
        ${pkRow('Metabolism',d.metabolism,'')}
      </div>
      ${d.mechanism?`<div class="drug-metabolites"><strong>Mechanism</strong>${esc(d.mechanism)}</div>`:''}
      ${d.metabolites?`<div class="drug-metabolites"><strong>Metabolites</strong>${esc(d.metabolites)}</div>`:''}
      ${d.doseRange?`<div class="drug-metabolites"><strong>Dose range</strong>${esc(d.doseRange)}</div>`:''}
    </article>
  `).join('');
  grid.querySelectorAll('.edit-drug').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();openDrugModal(b.dataset.id)}));
  grid.querySelectorAll('.delete-drug').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    if(confirm(`Delete ${drugs.find(x=>x.id===b.dataset.id)?.name}?`)){
      drugs=drugs.filter(x=>x.id!==b.dataset.id);save();renderIndex(filter);populateDrugSelect();msg('Drug deleted.');
    }
  }));
}
function pkRow(label,val,unit){
  if(!val)return`<div class="pk-item"><span class="pk-label">${label}</span><span class="pk-value" style="color:var(--color-text-faint)">—</span></div>`;
  return`<div class="pk-item"><span class="pk-label">${label}</span><span class="pk-value">${esc(val)}${unit?` <span style="color:var(--color-text-muted);font-weight:400">${unit}</span>`:''}</span></div>`;
}

$('#drug-search').addEventListener('input',e=>renderIndex(e.target.value));
$('#add-drug-btn').addEventListener('click',()=>openDrugModal(null));

// Drug modal
function openDrugModal(id){
  const modal=$('#drug-modal');
  const form=$('#drug-form');
  const title=$('#drug-modal-title');
  form.reset();
  if(id){
    const d=drugs.find(x=>x.id===id);
    if(!d)return;
    title.textContent='Edit Drug';
    Object.keys(d).forEach(k=>{const el=form.elements[k];if(el)el.value=d[k]??'';});
  } else {
    title.textContent='Add Drug';
    form.elements.id.value='';
  }
  modal.hidden=false;
  modal.querySelector('input[name=name]').focus();
}
function closeDrugModal(){$('#drug-modal').hidden=true}
$('#drug-modal-close').addEventListener('click',closeDrugModal);
$('#drug-modal-cancel').addEventListener('click',closeDrugModal);
$('#drug-modal').addEventListener('click',e=>{if(e.target===$('#drug-modal'))closeDrugModal()});
$('#drug-form').addEventListener('submit',e=>{
  e.preventDefault();
  const fd=Object.fromEntries(new FormData(e.currentTarget).entries());
  if(!fd.name.trim()){msg('Drug name is required.');return;}
  if(fd.id){
    const i=drugs.findIndex(x=>x.id===fd.id);
    if(i>-1)drugs[i]={...drugs[i],...fd};
  } else {
    fd.id=uid();
    drugs.push(fd);
  }
  save();renderIndex($('#drug-search').value);populateDrugSelect();closeDrugModal();
  msg(fd.id?'Drug updated.':'Drug added.');
});

// Dose Log
function populateDrugSelect(){
  const sel=$('#dose-drug-select');
  const cur=sel.value;
  sel.innerHTML='<option value="">— select —</option>'+drugs.map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  sel.value=cur||'';
}
function renderLog(){
  const list=$('#log-list');const empty=$('#log-empty');
  const sorted=[...log].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  empty.hidden=!!sorted.length;
  list.innerHTML=sorted.map(e=>{
    const drug=drugs.find(d=>d.id===e.drugId);
    return`<div class="log-entry">
      <div>
        <div class="log-drug-name">${esc(drug?.name||'Unknown')}</div>
        <div class="log-meta">${esc(e.dose||'—')} ${esc(e.unit||'')} · ${esc(e.route||'—')} · ${new Date(e.timestamp).toLocaleString([],{dateStyle:'medium',timeStyle:'short'})}</div>
        ${e.notes?`<div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-1)">${esc(e.notes)}</div>`:''}
      </div>
      <div class="log-entry-actions">
        <button class="icon-btn sm delete-log" data-id="${esc(e.id)}" aria-label="Delete entry">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
  list.querySelectorAll('.delete-log').forEach(b=>b.addEventListener('click',()=>{
    log=log.filter(x=>x.id!==b.dataset.id);save();renderLog();msg('Entry deleted.');
  }));
}

$('#dose-timestamp').value=nowLocal();
$('#dose-form').addEventListener('submit',e=>{
  e.preventDefault();
  const fd=Object.fromEntries(new FormData(e.currentTarget).entries());
  if(!fd.drugId){msg('Select a drug first.');return;}
  log.push({id:uid(),...fd});
  save();renderLog();populateDrugSelect();
  e.currentTarget.reset();
  $('#dose-timestamp').value=nowLocal();
  msg('Dose logged.');
});

// Active Window
function parseH(str){if(!str)return null;const m=str.match(/([\d.]+)/);return m?parseFloat(m[1]):null;}
function renderActive(){
  const container=$('#active-cards');const empty=$('#active-empty');
  const byDrug={};
  log.forEach(e=>{if(!byDrug[e.drugId]||new Date(e.timestamp)>new Date(byDrug[e.drugId].timestamp))byDrug[e.drugId]=e;});
  const entries=Object.values(byDrug).filter(e=>{
    const drug=drugs.find(d=>d.id===e.drugId);
    return drug&&(drug.durationH||drug.halfLifeH);
  }).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  empty.hidden=!!entries.length;
  const now=Date.now();
  container.innerHTML=entries.map(e=>{
    const drug=drugs.find(d=>d.id===e.drugId);
    const dosed=new Date(e.timestamp).getTime();
    const elapsedMin=(now-dosed)/60000;
    const onset=parseH(drug.onsetMin)||(parseH(drug.durationH)?parseH(drug.durationH)*60*.08:30);
    const peak=parseH(drug.peakMin)||(parseH(drug.durationH)?parseH(drug.durationH)*60*.3:120);
    const durationMin=(parseH(drug.durationH)||0)*60;
    const halfLifeMin=(parseH(drug.halfLifeH)||0)*60;
    const phases=[
      {label:'Onset',start:0,end:onset},
      {label:'Peak',start:onset,end:peak},
      {label:'Active',start:peak,end:durationMin||peak+halfLifeMin*2},
      {label:'Clearing',start:durationMin||peak+halfLifeMin*2,end:(durationMin||peak+halfLifeMin*2)+halfLifeMin*2},
    ];
    function phaseTime(mins){if(!mins)return'—';const h=Math.floor(mins/60);const m=Math.round(mins%60);return h?`${h}h ${m}m`:`${m}m`;}
    function abs(startMin){const t=new Date(dosed+startMin*60000);return t.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
    return`<div class="active-card">
      <div class="active-card-header">
        <div>
          <div class="active-drug-name">${esc(drug.name)}</div>
          <div class="active-time">Dosed: ${new Date(e.timestamp).toLocaleString([],{dateStyle:'short',timeStyle:'short'})} · ${esc(e.dose||'?')} ${esc(e.unit||'')} ${esc(e.route||'')}</div>
        </div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);font-family:var(--font-mono)">+${phaseTime(elapsedMin)} elapsed</div>
      </div>
      <div class="phases">
        ${phases.map(p=>{
          const isCurrent=elapsedMin>=p.start&&elapsedMin<p.end;
          const isPast=elapsedMin>=p.end;
          return`<div class="phase${isCurrent?' current':''}${isPast?' past':''}">
            <span class="phase-label">${p.label}</span>
            <span class="phase-time">${abs(p.start)}</span>
            <span class="phase-status">${isCurrent?'● Now':isPast?'Done':`in ${phaseTime(p.start-elapsedMin)}`}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

// Data
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('#export-json').addEventListener('click',()=>{
  dl(`stack-manager-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({schemaVersion:2,exportedAt:new Date().toISOString(),drugs,log},null,2),'application/json');
  msg('JSON backup downloaded. Keep it private.');
});
const CSV_FIELDS=['id','timestamp','drugId','drugName','dose','unit','route','notes'];
$('#export-csv').addEventListener('click',()=>{
  const c=v=>`"${String(v??'').replaceAll('"','""')}"`;
  const rows=log.map(e=>{
    const drug=drugs.find(d=>d.id===e.drugId);
    return CSV_FIELDS.map(k=>k==='drugName'?c(drug?.name||''):c(e[k])).join(',');
  });
  dl(`stack-log-${new Date().toISOString().slice(0,10)}.csv`,[CSV_FIELDS.join(','),...rows].join('\n'),'text/csv;charset=utf-8');
  msg('CSV downloaded.');
});
$('#import-file').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const p=JSON.parse(await f.text());
    if(p.drugs&&Array.isArray(p.drugs)){
      const existing=new Set(drugs.map(x=>x.id));
      const added=p.drugs.filter(x=>!existing.has(x.id));
      drugs.push(...added);
    }
    if(p.log&&Array.isArray(p.log)){
      const existing=new Set(log.map(x=>x.id));
      const added=p.log.filter(x=>!existing.has(x.id));
      log.push(...added);
    }
    save();renderIndex($('#drug-search').value);renderLog();populateDrugSelect();
    msg('Import complete.');
  }catch{msg('Import failed — invalid backup file.');}
  finally{e.target.value=''}
});
$('#clear-data').addEventListener('click',()=>{
  if((drugs.length||log.length)&&confirm('Delete all local data? Export a JSON backup first.')){
    drugs=[];log=[];save();renderIndex();renderLog();populateDrugSelect();msg('All data cleared.');
  }
});

// Init
renderIndex();
populateDrugSelect();
