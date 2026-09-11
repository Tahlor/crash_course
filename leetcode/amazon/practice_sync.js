(()=>{
  function loadState(){
    if(window.CrashState)return Promise.resolve(window.CrashState);
    return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='state.js';s.onload=()=>resolve(window.CrashState);s.onerror=reject;document.head.appendChild(s)});
  }
  function currentChoice(){
    if(!locked)return -1;
    const buttons=[...document.querySelectorAll('#choices .choice')];
    const wrong=buttons.findIndex(b=>b.classList.contains('wrong'));
    if(wrong>=0)return wrong;
    return buttons.findIndex(b=>b.classList.contains('correct'));
  }
  function phase(){
    if(document.querySelector('#trainer .endCard'))return 'end';
    if(document.querySelector('#trainer .revealBox'))return 'explanation';
    return 'question';
  }
  function snapshot(){
    return {
      mode,
      sessionIds:session.map(q=>q.id),
      qi,si,sessionCorrect,sessionAnswered,locked,
      phase:phase(),
      choiceIndex:currentChoice(),
      hints:document.querySelectorAll('#hintBox .hint').length
    };
  }
  function applyAnswered(choiceIndex,hints=0){
    const q=session[qi],st=q&&q.steps[si];if(!st)return;
    const buttons=[...document.querySelectorAll('#choices .choice')];
    if(choiceIndex<0||!buttons[choiceIndex])return;
    const choice=st.c[choiceIndex],ok=choice[1]===1;
    locked=true;
    buttons.forEach((b,j)=>{b.disabled=true;if(st.c[j][1]===1)b.classList.add('correct')});
    buttons[choiceIndex].classList.add(ok?'correct':'wrong');
    const feedback=$('stageFeedback');if(feedback)feedback.innerHTML=`<b>${ok?'Yes.':'Not quite.'}</b> ${esc(choice[2])}`;
    const tag=$('patternTag');if(tag)tag.classList.remove('hiddenAnswer');
    const cont=$('continueBtn');if(cont)cont.hidden=false;
    for(let n=0;n<hints;n++)showHint();
    updateScore();
  }
  function restore(saved){
    if(!saved||saved.cleared||!Array.isArray(saved.sessionIds)||!saved.sessionIds.length)return false;
    const restored=saved.sessionIds.map(id=>Q.find(q=>q.id===id)).filter(Boolean);
    if(!restored.length)return false;
    mode=['sprint','weak','all'].includes(saved.mode)?saved.mode:'sprint';
    setMode(mode);
    session=restored;
    qi=Math.max(0,Math.min(+saved.qi||0,session.length));
    si=Math.max(0,+saved.si||0);
    sessionCorrect=Math.max(0,+saved.sessionCorrect||0);
    sessionAnswered=Math.max(0,+saved.sessionAnswered||0);
    locked=false;
    if(saved.phase==='end'||qi>=session.length){qi=session.length;renderEnd();updateScore();return true}
    const q=session[qi];si=Math.min(si,Math.max(0,q.steps.length-1));
    if(saved.phase==='explanation'){showExplanation(q);updateScore();return true}
    renderQuestion();
    if(saved.locked)applyAnswered(+saved.choiceIndex,Math.max(0,+saved.hints||0));
    else for(let n=0;n<Math.max(0,+saved.hints||0);n++)showHint();
    updateScore();return true;
  }
  loadState().then(cs=>cs.ready).then(()=>{
    stats=JSON.parse(localStorage.getItem('amazon-skill-stats')||'{}');renderMastery();renderWeak();
    restore(window.CrashState.getSession('mixed'));
    let timer;
    const save=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(session.length)window.CrashState.setSession('mixed',snapshot())},80)};
    document.addEventListener('click',()=>setTimeout(save,0));
    window.addEventListener('beforeunload',()=>{if(session.length)window.CrashState.setSession('mixed',snapshot())});
  }).catch(err=>console.warn('Mixed-practice sync unavailable',err));
})();
