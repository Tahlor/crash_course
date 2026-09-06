const lessons=[...document.querySelectorAll('.lesson')];
let track=localStorage.getItem('amazon-track')||'150';
const done=new Set(JSON.parse(localStorage.getItem('amazon-done')||'[]'));

function visibleLessons(){return lessons.filter(l=>l.dataset['t'+track]==='1')}
function applyTrack(){
  document.querySelectorAll('[data-track]').forEach(b=>b.classList.toggle('active',b.dataset.track===track));
  lessons.forEach(l=>l.classList.toggle('hiddenTrack',l.dataset['t'+track]!=='1'));
  const route=document.getElementById('route'); route.innerHTML='';
  visibleLessons().forEach((l,i)=>{
    const r=document.createElement('div'); r.className='routeItem';
    r.innerHTML=`<div class="routeNum">${i+1}</div><div><b>${l.dataset.title}</b><div class="mins">${l.dataset.goal||''}</div></div><span class="mins">${l.dataset.min}m</span>`;
    r.onclick=()=>l.scrollIntoView({behavior:'smooth'}); route.appendChild(r);
  });
  updateProgress();
}
function updateProgress(){
  const v=visibleLessons(), c=v.filter(l=>done.has(l.dataset.id)).length;
  document.getElementById('progress').textContent=`${c}/${v.length}`;
  lessons.forEach(l=>{const b=l.querySelector('.done');if(!b)return;const on=done.has(l.dataset.id);b.textContent=on?'✓ Learned':'Mark learned';b.classList.toggle('on',on)});
}
function toggleDone(id){done.has(id)?done.delete(id):done.add(id);localStorage.setItem('amazon-done',JSON.stringify([...done]));updateProgress()}
function choose(btn){
  const step=btn.closest('.step');
  step.querySelectorAll('.choice').forEach(b=>b.classList.remove('selected','correct','wrong'));
  btn.classList.add('selected');
  const correct=btn.dataset.correct==='1';
  btn.classList.add(correct?'correct':'wrong');
  if(!correct){const right=step.querySelector('.choice[data-correct="1"]'); if(right) right.classList.add('correct')}
  const f=step.querySelector('.feedback'); if(f){f.classList.add('show');f.innerHTML=correct?`<b>Yes.</b> ${btn.dataset.why||''}`:`<b>Not quite.</b> ${btn.dataset.why||''}`}
}
function nextHint(btn){
  const drill=btn.closest('.drill'), hints=[...drill.querySelectorAll('.hint')];
  const next=hints.find(h=>!h.classList.contains('show'));
  if(next) next.classList.add('show');
  if(!hints.find(h=>!h.classList.contains('show'))) btn.disabled=true;
}
function revealModel(btn){btn.closest('.drill').querySelector('.model').classList.toggle('show')}
function gradeEdges(btn){
  const step=btn.closest('.step'); let good=true;
  step.querySelectorAll('input[type=checkbox]').forEach(c=>{const expected=c.dataset.correct==='1'; const row=c.closest('.edge'); row.style.outline=(c.checked===expected)?'1px solid #61d7a1':'1px solid #ff8585'; if(c.checked!==expected)good=false});
  const f=step.querySelector('.feedback'); f.classList.add('show'); f.innerHTML=good?'<b>Good.</b> Those are the edge cases worth naming before you code.':'Recheck the red items. Pick cases that can actually break the algorithm or interpretation.';
}
document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{track=b.dataset.track;localStorage.setItem('amazon-track',track);applyTrack()});
applyTrack();
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});