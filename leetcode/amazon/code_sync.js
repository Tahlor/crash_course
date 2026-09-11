(()=>{
  function loadState(){
    if(window.CrashState)return Promise.resolve(window.CrashState);
    return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='state.js';s.onload=()=>resolve(window.CrashState);s.onerror=reject;document.head.appendChild(s)});
  }
  const keyFor=q=>`${q.skill}|${q.title}`;
  function currentChoice(){
    if(!locked)return -1;
    const buttons=[...document.querySelectorAll('#choices .choice')];
    const wrong=buttons.findIndex(b=>b.classList.contains('wrong'));
    if(wrong>=0)return wrong;
    return buttons.findIndex(b=>b.classList.contains('correct'));
  }
  function phase(){return document.querySelector('#trainer .endCard')?'end':'question'}
  function snapshot(){
    return {
      weakFirst,
      orderKeys:order.map(keyFor),
      i,correct,answered,locked,
      phase:phase(),
      choiceIndex:currentChoice()
    };
  }
  function restoreAnswered(choiceIndex){
    if(i>=order.length)return;
    const q=order[i],choice=q.choices[choiceIndex];
    if(!choice)return;
    locked=true;
    const ok=choice[1]===1;
    const buttons=[...document.querySelectorAll('#choices .choice')];
    buttons.forEach((b,j)=>{b.disabled=true;if(q.choices[j][1]===1)b.classList.add('correct')});
    if(buttons[choiceIndex])buttons[choiceIndex].classList.add(ok?'correct':'wrong');
    $('feedback').innerHTML=`<b>${ok?'Yes.':'Not quite.'}</b> ${esc(choice[2])}`;
    $('after').innerHTML=`<div class="whyBox"><b>Reflex to keep:</b> ${esc(q.takeaway)}<div class="actions"><a class="btn small" href="index.html?review=${q.lesson}">Review lesson</a><a class="btn small" target="_blank" href="${q.lc[1]}">${esc(q.lc[0])}</a><button class="btn primary" id="next">Next</button></div></div>`;
    $('next').onclick=()=>{i++;render()};
    update();
  }
  function restore(saved){
    if(!saved||saved.cleared||!Array.isArray(saved.orderKeys)||!saved.orderKeys.length)return false;
    const byKey=new Map(ITEMS.map(q=>[keyFor(q),q]));
    const restored=saved.orderKeys.map(k=>byKey.get(k)).filter(Boolean);
    if(!restored.length)return false;
    weakFirst=!!saved.weakFirst;
    order=restored;
    i=Math.max(0,Math.min(+saved.i||0,order.length));
    correct=Math.max(0,+saved.correct||0);
    answered=Math.max(0,+saved.answered||0);
    locked=false;
    if(saved.phase==='end'||i>=order.length){i=order.length;render();return true}
    render();
    if(saved.locked)restoreAnswered(+saved.choiceIndex);
    return true;
  }
  loadState().then(cs=>cs.ready).then(()=>{
    stats=JSON.parse(localStorage.getItem('amazon-skill-stats')||'{}');
    restore(window.CrashState.getSession('code'));
    let timer;
    const save=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(order.length)window.CrashState.setSession('code',snapshot())},80)};
    document.addEventListener('click',()=>setTimeout(save,0));
    window.addEventListener('beforeunload',()=>{if(order.length)window.CrashState.setSession('code',snapshot())});
  }).catch(err=>console.warn('Code-reflex sync unavailable',err));
})();
