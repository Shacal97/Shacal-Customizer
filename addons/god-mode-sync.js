(() => {
 'use strict';
 window.ShacalGodModeSync?.dispose();
 const endpoint='https://kfhggnkhntdragqqgtpi.supabase.co/functions/v1/god-mode-sync';
 let stopped=false,timer=null,pullController=null,pushController=null,pulling=false,pushing=false,ticking=false;
 let sent='',pending=null,lastWorld='',failures=0,lastSuccess=0;
 const api=()=>window.ShacalAuraTest;
 const status=text=>{const node=document.querySelector('[data-sync-status]');if(node&&node.textContent!==text)node.textContent=text;};
 async function request(body,controller){
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
   if(!response.ok)throw Error('HTTP '+response.status);
   return await response.json();
  }finally{clearTimeout(timeout);}
 }
 function capture(){
  const snapshot=api()?.savedSyncSnapshot?.();
  if(!snapshot)return;
  try{snapshot.appearance=window.ShacalSyncCore.validateAppearance(snapshot.appearance);}catch{return;}
  const signature=JSON.stringify(snapshot);
  if(signature!==sent)pending={snapshot,signature};
 }
 async function push(){
  if(pushing||!pending||stopped||document.hidden)return;
  pushing=true;const job=pending;pushController=new AbortController();
  try{
   if(!window.ShacalProfileCheck)throw Error('PROFILE_MODULE_LOADING');
   await window.ShacalProfileCheck.check(job.snapshot,pushController.signal);
   const result=await request({action:'publish',...job.snapshot,profile_checked:true},pushController);
   if(stopped)return;
   if(result.enabled===false){api()?.clearRemote();status('Synchronizacja wyłączona przez administratora.');return;}
   if(result.saved!==true)throw Error('NOT_SAVED');
   sent=job.signature;if(pending===job)pending=null;
   status('Wygląd udostępniony innym graczom.');
  }catch(error){if(!stopped&&error.name!=='AbortError')status('Zapis lokalny działa. Ponowię synchronizację.');}
  finally{pushing=false;pushController=null;}
 }
 async function pull(){
  if(pulling||stopped||document.hidden||!api()?.otherEffectsAllowed())return;
  pulling=true;pullController=new AbortController();
  const world=location.hostname.split('.')[0];
  const ids=api().visibleOtherIds();
  if(lastWorld!==world){api().clearRemote();lastWorld=world;}
  try{const result=await request({action:'pull',world,ids},pullController);
   if(stopped||document.hidden||!api()?.otherEffectsAllowed())return;
   if(result.enabled!==true){api().clearRemote();status('Synchronizacja wyłączona przez administratora.');}
   else api().setRemoteLooks(result.looks);
   failures=0;lastSuccess=Date.now();
  }catch(error){if(error.name!=='AbortError'){failures=Math.min(3,failures+1);if(Date.now()-lastSuccess>30000)api()?.clearRemote();}}
  finally{pulling=false;pullController=null;}
 }
 async function tick(){
  if(stopped||ticking)return;
  ticking=true;
  try{if(!document.hidden){capture();await Promise.allSettled([push(),pull()]);}}
  finally{ticking=false;if(!stopped){clearTimeout(timer);timer=setTimeout(tick,Math.min(60000,10000*2**failures));}}
 }
 function viewerChanged(event){
  if(!event.detail?.enabled){pullController?.abort();api()?.clearRemote();}
  else pull();
 }
 function visibility(){if(document.hidden){pullController?.abort();pushController?.abort();api()?.clearRemote();}else{clearTimeout(timer);timer=setTimeout(tick,250);}}
 function saved(){capture();push();}
 addEventListener('shacal-godmode-saved',saved);
 addEventListener('shacal-godmode-viewer-change',viewerChanged);
 addEventListener('visibilitychange',visibility);
 addEventListener('online',saved);
 window.ShacalGodModeSync={dispose(){stopped=true;clearTimeout(timer);pullController?.abort();pushController?.abort();api()?.clearRemote();removeEventListener('shacal-godmode-saved',saved);removeEventListener('shacal-godmode-viewer-change',viewerChanged);removeEventListener('visibilitychange',visibility);removeEventListener('online',saved);}};
 timer=setTimeout(tick,1500);
})();
