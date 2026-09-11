(()=>{
  function loadState(){
    if(window.CrashState)return Promise.resolve(window.CrashState);
    return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='state.js';s.onload=()=>resolve(window.CrashState);s.onerror=reject;document.head.appendChild(s)});
  }
  function refreshCore(){
    try{
      track=localStorage.getItem('amazon-track')||'150';
      done.clear();for(const id of JSON.parse(localStorage.getItem('amazon-done')||'[]'))done.add(id);
      skillStats=JSON.parse(localStorage.getItem('amazon-skill-stats')||'{}');
      const reviewId=new URLSearchParams(location.search).get('review');
      const reviewTarget=reviewId?lessons.find(l=>l.dataset.id===reviewId):null;
      if(reviewTarget&&reviewTarget.dataset['t'+track]!=='1'){
        track='240';localStorage.setItem('amazon-track',track);
      }
      applyTrack();
      if(reviewTarget)setTimeout(()=>reviewTarget.scrollIntoView({behavior:'smooth',block:'start'}),60);
    }catch(err){console.warn('Could not refresh synced guided state',err)}
  }
  function snapshot(){
    const steps=[...document.querySelectorAll('.step')].map((step,i)=>({
      i,
      graded:step.dataset.graded==='1',
      selected:[...step.querySelectorAll('.choice')].findIndex(b=>b.classList.contains('selected')),
      checks:[...step.querySelectorAll('input[type=checkbox]')].map(c=>!!c.checked)
    })).filter(x=>x.graded||x.selected>=0||x.checks.some(Boolean));
    const drills=[...document.querySelectorAll('.drill')].map((drill,i)=>({
      i,
      hints:[...drill.querySelectorAll('.hint')].filter(h=>h.classList.contains('show')).length,
      model:!!drill.querySelector('.model.show')
    })).filter(x=>x.hints||x.model);
    return {steps,drills,scrollY:Math.round(window.scrollY||0)};
  }
  function restore(saved){
    if(!saved||saved.cleared)return;
    const allSteps=[...document.querySelectorAll('.step')];
    for(const x of saved.steps||[]){
      const step=allSteps[x.i];if(!step)continue;
      const choices=[...step.querySelectorAll('.choice')];
      if(x.selected>=0&&choices[x.selected]){
        const btn=choices[x.selected],correct=btn.dataset.correct==='1';
        choices.forEach(b=>b.classList.remove('selected','correct','wrong'));
        btn.classList.add('selected',correct?'correct':'wrong');
        if(!correct){const right=step.querySelector('.choice[data-correct="1"]');if(right)right.classList.add('correct')}
        const f=step.querySelector('.feedback');
        if(f){f.classList.add('show');f.innerHTML=correct?`<b>Yes.</b> ${btn.dataset.why||''}`:`<b>Not quite.</b> ${btn.dataset.why||''}`}
      }
      const checks=[...step.querySelectorAll('input[type=checkbox]')];
      (x.checks||[]).forEach((v,j)=>{if(checks[j])checks[j].checked=!!v});
      if(x.graded){
        step.dataset.graded='1';
        if(checks.length){
          let good=true;checks.forEach(c=>{const expected=c.dataset.correct==='1';const row=c.closest('.edge');const ok=c.checked===expected;if(row)row.style.outline=ok?'1px solid #61d7a1':'1px solid #ff8585';if(!ok)good=false});
          const f=step.querySelector('.feedback');if(f){f.classList.add('show');f.innerHTML=good?'<b>Good.</b> Those are the edge cases worth naming before you code.':'Recheck the red items.'}
        }
      }
    }
    const allDrills=[...document.querySelectorAll('.drill')];
    for(const x of saved.drills||[]){
      const drill=allDrills[x.i];if(!drill)continue;
      [...drill.querySelectorAll('.hint')].forEach((h,j)=>h.classList.toggle('show',j<(x.hints||0)));
      const model=drill.querySelector('.model');if(model)model.classList.toggle('show',!!x.model);
    }
    if(Number.isFinite(saved.scrollY))setTimeout(()=>window.scrollTo(0,saved.scrollY),40);
  }
  function updateFooter(){
    const f=document.querySelector('.footer');
    if(f)f.innerHTML=f.innerHTML.replace('Progress is saved locally in this browser.','Progress syncs automatically across your sessions; this browser also keeps an offline copy.');
  }
  loadState().then(cs=>cs.ready).then(()=>{
    refreshCore();restore(window.CrashState.getSession('guided'));updateFooter();
    let timer;
    const save=()=>{clearTimeout(timer);timer=setTimeout(()=>window.CrashState.setSession('guided',snapshot()),120)};
    document.addEventListener('click',()=>setTimeout(save,0));
    document.addEventListener('change',()=>setTimeout(save,0));
    window.addEventListener('scroll',save,{passive:true});
    window.addEventListener('pagehide',()=>{window.CrashState.setSession('guided',snapshot());window.CrashState.syncNow()});
  }).catch(err=>console.warn('Guided sync unavailable',err));
})();
