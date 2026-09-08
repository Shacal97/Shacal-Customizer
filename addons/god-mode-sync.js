(() => {
 'use strict';
 window.ShacalGodModeSync?.dispose();
 const base='https://kfhggnkhntdragqqgtpi.supabase.co',publicKey='sb_publishable_w73r_jXPWs14P-tWxzNeMw_A_r2_X95';
 const world=location.hostname.split('.')[0],api=()=>window.ShacalAuraTest;
 let stopped=false,socket=null,joined=false,heartbeat=null,reconnect=null,joinTimeout=null,ref=0,pong=null;
 let nextCapture=0,sent='',pending=null,pushing=false,pushController=null,readController=null,reading=false,readAgain=false;
 let epoch=0,enabled=false,revision=0,visible='',lastRead=0,retryAt=0,readFailures=0,pushRetryAt=0,pushFailures=0,connectFailures=0;
 let cacheTimer=null;const cacheKey='shacalGodModeFeedV1:'+world;
 const looks=new Map(),stats={reads:0,writes:0,notifications:0,connections:0};
 const status=text=>{const n=document.querySelector('[data-sync-status]');if(n&&n.textContent!==text)n.textContent=text;};
 const explain=error=>{
 const code=String(error?.message||'UNKNOWN');
 const messages={INSTALLER_UPDATE_REQUIRED:'Zaktualizuj instalator Tampermonkey.',PROFILE_MODULE_LOADING:'Moduł sprawdzania profilu nie został załadowany.',PROFILE_RATE_LIMIT:'Margonem ograniczył odczyt profilu. Poczekam przed ponowieniem.',PROFILE_TIMEOUT:'Przekroczono czas odczytu profilu Margonem.',PROFILE_UNAVAILABLE:'Nie udało się pobrać profilu. Sprawdź uprawnienie Tampermonkey do www.margonem.pl.',PROFILE_FORMAT_CHANGED:'Pobrana strona nie zawiera oczekiwanej listy postaci.',PROFILE_REDIRECT:'Odczyt profilu przekierował na inną stronę.',CHARACTER_NOT_ON_PROFILE:'Nie znaleziono tej postaci na odczytanym profilu.',IDENTITY_UNAVAILABLE:'Nie udało się odczytać ID konta lub postaci.'};
 return 'Zapis lokalny działa. '+(messages[code]||'Błąd synchronizacji: '+code.slice(0,160));
 };

 function persistCache(){clearTimeout(cacheTimer);cacheTimer=setTimeout(()=>{try{sessionStorage.setItem(cacheKey,JSON.stringify({revision,rows:[...looks.values()]}));}catch{}},1000);}
 function allowed(){return !stopped&&!document.hidden&&api()?.otherEffectsAllowed();}
 function apply(){
  if(!allowed()||!enabled){api()?.clearRemote();return;}
  api()?.setRemoteLooks(api().visibleOtherIds().map(id=>looks.get(String(id))).filter(Boolean));
 }
 function accept(row){
  if(!row||!(/^[1-9][0-9]{0,19}$/).test(String(row.character_id))||!Number.isSafeInteger(row.revision)||row.revision<1)return;
  const appearance=window.ShacalSyncCore.validateAppearance(row.appearance),id=String(row.character_id);
  if((looks.get(id)?.revision||0)>=row.revision)return;
  if(looks.size>=1000&&!looks.has(id))return;
  looks.set(id,{character_id:id,appearance,revision:row.revision});persistCache();
 }
 try{const cached=JSON.parse(sessionStorage.getItem(cacheKey)||'null');if(cached&&Number.isSafeInteger(cached.revision)&&cached.revision>=0&&Array.isArray(cached.rows)&&cached.rows.length<=1000){for(const row of cached.rows)accept(row);revision=cached.revision;}}catch{looks.clear();revision=0;}
 async function http(path,body,controller,publicRead=false){
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(publicRead?{apikey:publicKey}:{})},body:JSON.stringify(body),signal:controller.signal});
   const result=await response.json();if(!response.ok)throw Error('HTTP '+response.status+(result?.error?' / '+result.error:''));return result;
  }finally{clearTimeout(timeout);}
 }
 async function read(){
  if(!allowed()||Date.now()<retryAt)return;
  if(reading){readAgain=true;return;}
  reading=true;readController=new AbortController();const cursor=revision,generation=epoch;
  try{stats.reads++;const result=await http('/rest/v1/rpc/god_mode_snapshot',{p_world:world,p_revision:cursor},readController,true);
   if(!allowed()||generation!==epoch)return;
   lastRead=Date.now();readFailures=0;retryAt=0;
   if(result.enabled!==true){enabled=false;looks.clear();revision=0;persistCache();apply();return;}
   for(const row of result.looks||[])accept(row);
   // Advance only from snapshots, never individual realtime events: missed events must remain recoverable.
   revision=Math.max(cursor,...(result.looks||[]).map(r=>r.revision));enabled=true;persistCache();lastRead=Date.now();readFailures=0;retryAt=0;apply();
   if(result.looks?.length===1000)readAgain=true;
  }catch(e){if(!stopped&&!document.hidden){retryAt=Date.now()+Math.min(900000,30000*2**Math.min(5,readFailures++));if(!joined){enabled=false;apply();}}}
  finally{reading=false;readController=null;if(readAgain){readAgain=false;queueMicrotask(read);}}
 }
 function closeSocket(){
  clearInterval(heartbeat);clearTimeout(joinTimeout);heartbeat=null;joinTimeout=null;pong=null;joined=false;
  const old=socket;socket=null;if(old){old.onopen=old.onmessage=old.onerror=old.onclose=null;old.close();}
 }
 function connect(){
  if(!allowed()||socket)return;
  reconnect=null;
  const topic='realtime:god-mode:'+world,joinRef=String(++ref);
  let ws;try{ws=new WebSocket(base.replace('https:','wss:')+'/realtime/v1/websocket?apikey='+publicKey+'&vsn=1.0.0');}catch{scheduleReconnect();return;}
  socket=ws;stats.connections++;
  const send=(event,payload={},topicName=topic,messageRef=String(++ref))=>ws.send(JSON.stringify({topic:topicName,event,payload,ref:messageRef,join_ref:topicName==='phoenix'?null:joinRef}));
  function failed(){if(socket!==ws)return;closeSocket();scheduleReconnect();}
  ws.onopen=()=>{send('phx_join',{config:{broadcast:{ack:false,self:false},presence:{enabled:false},postgres_changes:[{event:'*',schema:'public',table:'god_mode_feed',filter:'world=eq.'+world},{event:'UPDATE',schema:'public',table:'god_mode_sync_control'}],private:false}},topic,joinRef);joinTimeout=setTimeout(failed,15000);};
  ws.onmessage=event=>{if(socket!==ws)return;try{const m=JSON.parse(event.data);
   if(m.event==='phx_reply'&&m.ref===pong){pong=null;return;}
   if(m.event==='phx_reply'&&m.ref===joinRef){if(m.payload?.status!=='ok'){failed();return;}joined=true;connectFailures=0;clearTimeout(joinTimeout);read();heartbeat=setInterval(()=>{if(pong){failed();return;}pong=String(++ref);send('heartbeat',{},'phoenix',pong);},25000);return;}
   if(m.event==='phx_error'||m.event==='phx_close'){failed();return;}
   if(m.event==='system'){if(m.payload?.status==='error'){failed();return;}if(m.payload?.status==='ok')read();}
   if(m.event!=='postgres_changes')return;
   const data=m.payload?.data,row=data?.record;stats.notifications++;
   if(data?.table==='god_mode_sync_control'){epoch++;enabled=row?.enabled===true;if(!enabled){looks.clear();revision=0;persistCache();}apply();if(enabled)read();return;}
   if(data?.table==='god_mode_feed'&&row?.world===world){accept(row);apply();}
  }catch{read();}};
  ws.onerror=failed;ws.onclose=failed;
 }
 function scheduleReconnect(){if(!allowed())return;clearTimeout(reconnect);reconnect=setTimeout(connect,Math.min(300000,5000*2**Math.min(6,connectFailures++))+Math.random()*1000);}
 function capture(){const snapshot=api()?.savedSyncSnapshot?.();if(!snapshot)return;
  try{snapshot.appearance=window.ShacalSyncCore.validateAppearance(snapshot.appearance);}catch(e){status(explain(e));return;}
  const signature=JSON.stringify(snapshot);pending=signature!==sent?{snapshot,signature}:null;
 }
 async function push(){
  if(stopped||document.hidden||pushing||!pending||Date.now()<pushRetryAt)return;
  const job=pending;pushing=true;pushController=new AbortController();
  try{await window.ShacalProfileCheck.check(job.snapshot,pushController.signal);stats.writes++;
   const result=await http('/functions/v1/god-mode-sync',{action:'publish',...job.snapshot,profile_checked:true},pushController);
   if(stopped)return;if(result.enabled===false){enabled=false;looks.clear();revision=0;apply();pushRetryAt=Date.now()+900000;status('Synchronizacja wyłączona przez administratora.');return;}
   if(!result.saved)throw Error('NOT_SAVED');sent=job.signature;if(pending?.signature===job.signature)pending=null;pushFailures=0;pushRetryAt=Date.now()+3000;status('Wygląd udostępniony innym graczom.');
  }catch(e){if(!stopped&&!document.hidden){pushRetryAt=Date.now()+Math.min(900000,30000*2**Math.min(5,pushFailures++));status(explain(e));}}
  finally{pushing=false;pushController=null;}
 }
 function tick(){
  if(stopped||document.hidden)return;if(Date.now()>=nextCapture){nextCapture=Date.now()+10000;capture();}push();
  if(!allowed())return;
  const ids=api().visibleOtherIds().slice().sort().join(',');if(ids!==visible){visible=ids;apply();}
  if(!socket&&!reconnect)connect();
  // Recovery snapshot every 15 minutes; no periodic Edge Function reads.
  if(Date.now()-lastRead>=900000&&!reading)read();
 }
 function visibility(){if(!allowed()){closeSocket();clearTimeout(reconnect);reconnect=null;readController?.abort();api()?.clearRemote();if(document.hidden)pushController?.abort();}else{retryAt=0;connect();read();apply();}}
 function saved(){capture();push();}
 function online(){retryAt=0;pushRetryAt=0;visibility();saved();}
 addEventListener('shacal-godmode-saved',saved);addEventListener('shacal-godmode-viewer-change',visibility);addEventListener('visibilitychange',visibility);addEventListener('online',online);
 const timer=setInterval(tick,500);const start=setTimeout(tick,1500);
 window.ShacalGodModeSync={diagnostics:()=>({...stats,joined,cached:looks.size,revision,enabled}),dispose(){stopped=true;clearInterval(timer);clearTimeout(cacheTimer);clearTimeout(start);clearTimeout(reconnect);closeSocket();readController?.abort();pushController?.abort();api()?.clearRemote();removeEventListener('shacal-godmode-saved',saved);removeEventListener('shacal-godmode-viewer-change',visibility);removeEventListener('visibilitychange',visibility);removeEventListener('online',online);}};
})();
