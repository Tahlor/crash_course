(()=>{
  const API='/projects/crash_course/api/state';
  const USER_ID='default';
  const COURSE_ID='leetcode/amazon';
  const LOCAL_KEY=`crash-course:${USER_ID}:${COURSE_ID}:state:v1`;
  const LEGACY={track:'amazon-track',done:'amazon-done',stats:'amazon-skill-stats'};
  const nativeSet=Storage.prototype.setItem;
  let revision=0;
  let flushTimer=null;
  let flushing=false;
  let pendingFlush=false;

  const blank=()=>({
    schemaVersion:1,
    userId:USER_ID,
    courseId:COURSE_ID,
    preferences:{track:'150',updatedAt:0},
    done:[],
    skillStats:{},
    sessions:{guided:null,mixed:null,code:null},
    updatedAt:0
  });

  function parse(raw,fallback){try{return raw?JSON.parse(raw):fallback}catch{return fallback}}
  function clone(x){return x==null?x:JSON.parse(JSON.stringify(x))}
  function readStored(){return parse(localStorage.getItem(LOCAL_KEY),null)}
  function mergeStats(a={},b={}){
    const out={};
    for(const k of new Set([...Object.keys(a),...Object.keys(b)])){
      const x=a[k]||{},y=b[k]||{};
      let attempts=Math.max(+x.attempts||0,+y.attempts||0);
      const correct=Math.max(+x.correct||0,+y.correct||0);
      attempts=Math.max(attempts,correct);
      out[k]={attempts,correct};
    }
    return out;
  }
  function newer(a,b){
    if(!a)return b||null;if(!b)return a;
    return (+a.updatedAt||0)>=(+b.updatedAt||0)?a:b;
  }
  function normalize(input){
    const out=Object.assign(blank(),input||{});
    out.preferences=Object.assign({track:'150',updatedAt:0},out.preferences||{});
    out.done=[...new Set(Array.isArray(out.done)?out.done:[])];
    out.skillStats=out.skillStats||{};
    out.sessions=Object.assign({guided:null,mixed:null,code:null},out.sessions||{});
    out.userId=USER_ID;out.courseId=COURSE_ID;out.schemaVersion=1;
    return out;
  }
  function merge(a,b){
    a=normalize(a);b=normalize(b);
    const out=blank();
    out.preferences=clone(newer(a.preferences,b.preferences))||out.preferences;
    out.done=[...new Set([...a.done,...b.done])];
    out.skillStats=mergeStats(a.skillStats,b.skillStats);
    out.sessions={
      guided:clone(newer(a.sessions.guided,b.sessions.guided)),
      mixed:clone(newer(a.sessions.mixed,b.sessions.mixed)),
      code:clone(newer(a.sessions.code,b.sessions.code))
    };
    out.updatedAt=Math.max(+a.updatedAt||0,+b.updatedAt||0);
    return normalize(out);
  }

  let state=normalize(readStored());
  const hadStored=!!readStored();
  const legacyTrack=localStorage.getItem(LEGACY.track);
  const legacyDone=parse(localStorage.getItem(LEGACY.done),[]);
  const legacyStats=parse(localStorage.getItem(LEGACY.stats),{});
  if(!hadStored){
    if(legacyTrack){state.preferences={track:legacyTrack,updatedAt:Date.now()}}
    if(Array.isArray(legacyDone)&&legacyDone.length)state.done=[...new Set(legacyDone)];
    state.skillStats=mergeStats(state.skillStats,legacyStats);
    if(legacyTrack||(legacyDone&&legacyDone.length)||Object.keys(legacyStats||{}).length)state.updatedAt=Date.now();
  }

  function persistLocal(){
    nativeSet.call(localStorage,LOCAL_KEY,JSON.stringify(state));
    nativeSet.call(localStorage,LEGACY.track,state.preferences.track||'150');
    nativeSet.call(localStorage,LEGACY.done,JSON.stringify(state.done||[]));
    nativeSet.call(localStorage,LEGACY.stats,JSON.stringify(state.skillStats||{}));
  }
  persistLocal();

  function ingestLegacy(key,value){
    const now=Date.now();
    if(key===LEGACY.track){state.preferences={track:value||'150',updatedAt:now}}
    if(key===LEGACY.done){state.done=[...new Set(parse(value,[]))]}
    if(key===LEGACY.stats){state.skillStats=mergeStats(state.skillStats,parse(value,{}))}
    state.updatedAt=now;
    nativeSet.call(localStorage,LOCAL_KEY,JSON.stringify(state));
    scheduleFlush();
  }

  Storage.prototype.setItem=function(key,value){
    nativeSet.call(this,key,value);
    if(this===localStorage&&(key===LEGACY.track||key===LEGACY.done||key===LEGACY.stats))ingestLegacy(key,String(value));
  };

  function scheduleFlush(delay=350){
    clearTimeout(flushTimer);
    flushTimer=setTimeout(()=>flush(),delay);
  }

  async function pushOnce(){
    const response=await fetch(API,{method:'PUT',headers:{'Content-Type':'application/json'},cache:'no-store',keepalive:true,body:JSON.stringify({baseRevision:revision,state})});
    const payload=await response.json();
    if(response.status===409){
      revision=payload.revision||0;
      state=merge(payload.state,state);
      persistLocal();
      return false;
    }
    if(!response.ok)throw new Error(`state PUT ${response.status}`);
    revision=payload.revision||revision;
    if(payload.state)state=merge(state,payload.state);
    persistLocal();
    return true;
  }

  async function flush(){
    if(flushing){pendingFlush=true;return}
    flushing=true;
    try{
      let ok=await pushOnce();
      if(!ok)await pushOnce();
      window.dispatchEvent(new CustomEvent('crashstate:status',{detail:{status:'synced',revision}}));
    }catch(err){
      console.warn('Course state sync failed; continuing from local cache.',err);
      window.dispatchEvent(new CustomEvent('crashstate:status',{detail:{status:'offline'}}));
    }finally{
      flushing=false;
      if(pendingFlush){pendingFlush=false;scheduleFlush(50)}
    }
  }

  async function pull(){
    try{
      const response=await fetch(API,{cache:'no-store'});
      if(!response.ok)throw new Error(`state GET ${response.status}`);
      const payload=await response.json();
      revision=payload.revision||0;
      const remote=payload.state?normalize(payload.state):null;
      state=merge(payload.state,state);
      persistLocal();
      if(!remote||JSON.stringify(state)!==JSON.stringify(remote))scheduleFlush(50);
      window.dispatchEvent(new CustomEvent('crashstate:ready',{detail:{revision,state:clone(state)}}));
      return state;
    }catch(err){
      console.warn('Course state server unavailable; using local cache.',err);
      window.dispatchEvent(new CustomEvent('crashstate:ready',{detail:{revision,state:clone(state),offline:true}}));
      return state;
    }
  }

  function getSession(kind){return clone((state.sessions||{})[kind]||null)}
  function setSession(kind,value){
    const now=Date.now();
    state.sessions=state.sessions||{};
    state.sessions[kind]=Object.assign({},clone(value)||{},{updatedAt:now});
    state.updatedAt=now;
    persistLocal();
    scheduleFlush();
  }
  function clearSession(kind){setSession(kind,{cleared:true})}
  function getState(){return clone(state)}

  const ready=pull();
  window.CrashState={USER_ID,COURSE_ID,LOCAL_KEY,ready,getState,getSession,setSession,clearSession,syncNow:flush};
  window.addEventListener('beforeunload',()=>{if(flushTimer)flush()});
})();
