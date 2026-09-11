const lessons=[...document.querySelectorAll('.lesson')];
let track=localStorage.getItem('amazon-track')||'150';
const done=new Set(JSON.parse(localStorage.getItem('amazon-done')||'[]'));
const STATS_KEY='amazon-skill-stats';
let skillStats=JSON.parse(localStorage.getItem(STATS_KEY)||'{}');

lessons.forEach(l=>l.id=`lesson-${l.dataset.id}`);
const hero=document.querySelector('.hero');
if(hero&&!document.querySelector('.practiceCta'))hero.insertAdjacentHTML('afterend','<div class="note practiceCta"><b>Training path:</b> learn a pattern here → <a class="btn small primary" href="practice.html">mixed recognition</a> with the labels hidden → <a class="btn small" href="code.html">code reflexes</a> for the dangerous implementation lines → then use the linked LeetCode problem for full coding. <a class="btn small" href="cheatsheet.html">Cram sheet</a> is the fast review page.</div>');

function recordSkill(skill,correct){
  if(!skill)return;
  const s=skillStats[skill]||(skillStats[skill]={attempts:0,correct:0});
  s.attempts++; if(correct)s.correct++;
  localStorage.setItem(STATS_KEY,JSON.stringify(skillStats));
}
function visibleLessons(){return lessons.filter(l=>l.dataset['t'+track]==='1')}
function applyTrack(){
  document.querySelectorAll('[data-track]').forEach(b=>b.classList.toggle('active',b.dataset.track===track));
  lessons.forEach(l=>l.classList.toggle('hiddenTrack',l.dataset['t'+track]!=='1'));
  const route=document.getElementById('route'); route.innerHTML='';
  visibleLessons().forEach((l,i)=>{
    const r=document.createElement('div'); r.className='routeItem';
    const s=skillStats[l.dataset.id], acc=s&&s.attempts?Math.round(100*s.correct/s.attempts):null;
    const mastery=acc===null?'':` · ${acc}% drill accuracy`;
    r.innerHTML=`<div class="routeNum">${i+1}</div><div><b>${l.dataset.title}</b><div class="mins">${l.dataset.goal||''}${mastery}</div></div><span class="mins">${l.dataset.min}m</span>`;
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
  if(!step.dataset.graded){step.dataset.graded='1';recordSkill(btn.closest('.lesson')?.dataset.id,correct);applyTrack()}
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
  if(!step.dataset.graded){step.dataset.graded='1';recordSkill(btn.closest('.lesson')?.dataset.id,good);applyTrack()}
  const f=step.querySelector('.feedback'); f.classList.add('show'); f.innerHTML=good?'<b>Good.</b> Those are the edge cases worth naming before you code.':'Recheck the red items. Pick cases that can actually break the algorithm or interpretation.';
}
document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{track=b.dataset.track;localStorage.setItem('amazon-track',track);applyTrack()});
applyTrack();
const review=new URLSearchParams(location.search).get('review');
if(review){const target=lessons.find(l=>l.dataset.id===review);if(target){if(target.dataset['t'+track]!=='1'){track='240';localStorage.setItem('amazon-track',track);applyTrack()}setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'start'}),50)}}
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
{const sync=document.createElement('script');sync.src='guided_sync.js';document.body.appendChild(sync)}
