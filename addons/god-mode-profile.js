(() => {
 'use strict';
 const cache=new Map();let blockedUntil=0;
 const validId=v=>typeof v==='string'&&/^[1-9][0-9]{0,19}$/.test(v);
 function read(aid,signal){
  const url='https://www.margonem.pl/profile/view,'+aid;
  return new Promise((resolve,reject)=>{
   const request=window.ShacalRuntime?.request;
   if(typeof request!=='function'){reject(Error('INSTALLER_UPDATE_REQUIRED'));return;}
   if(signal?.aborted){reject(new DOMException('Aborted','AbortError'));return;}
   let handle,finished=false;
   const done=(error,value)=>{if(finished)return;finished=true;signal?.removeEventListener('abort',abort);error?reject(error):resolve(value);};
   const abort=()=>{handle?.abort?.();done(new DOMException('Aborted','AbortError'));};
   signal?.addEventListener('abort',abort,{once:true});
   try{handle=request({method:'GET',url,anonymous:true,timeout:8000,
    onload:r=>{
     if(r.status===429){const value=String(r.responseHeaders||'').match(/^retry-after:\s*(.+)$/im)?.[1]?.trim();const delay=value&&/^\d+$/.test(value)?Number(value)*1000:Math.max(0,Date.parse(value)-Date.now());blockedUntil=Date.now()+Math.max(60000,Number.isFinite(delay)?delay:0);done(Error('PROFILE_RATE_LIMIT'));return;}
     if(r.status!==200){done(Error('PROFILE_UNAVAILABLE'));return;}
     try{const final=new URL(r.finalUrl||url);if(final.hostname!=='www.margonem.pl'||final.pathname!=='/profile/view,'+aid)throw Error('PROFILE_REDIRECT');
      if(typeof r.responseText!=='string'||r.responseText.length>1048576)throw Error('PROFILE_TOO_LARGE');
      const doc=new DOMParser().parseFromString(r.responseText,'text/html');
      const profile=doc.querySelector('.profile-container');if(!profile||!doc.querySelector('.profile-header__name'))throw Error('PROFILE_FORMAT_CHANGED');
      const keys=new Set();for(const row of profile.querySelectorAll('li.char-row[data-id][data-world]')){
       const id=row.getAttribute('data-id'),world=row.getAttribute('data-world').replace(/^#/,'').toLowerCase();
       if(!validId(id)||!(/^[a-z0-9-]{1,40}$/).test(world))throw Error('PROFILE_FORMAT_CHANGED');
       keys.add(world+':'+id);
      }
      if(!keys.size||keys.size>200)throw Error('PROFILE_FORMAT_CHANGED');done(null,keys);
     }catch(e){done(e);}
    },onerror:()=>done(Error('PROFILE_UNAVAILABLE')),ontimeout:()=>done(Error('PROFILE_TIMEOUT')),onabort:()=>done(new DOMException('Aborted','AbortError'))});
   }catch(e){done(e);}
  });
 }
 window.ShacalProfileCheck={async check(identity,signal){
  const {account_id,character_id,world}=identity||{};
  if(!validId(account_id)||!validId(character_id)||typeof world!=='string'||!(/^[a-z0-9-]{1,40}$/).test(world))throw Error('IDENTITY_UNAVAILABLE');
  if(signal?.aborted)throw new DOMException('Aborted','AbortError');
  let record=cache.get(account_id);
  if(!record||record.until<=Date.now()){
   if(Date.now()<blockedUntil)throw Error('PROFILE_RATE_LIMIT');
   record={keys:await read(account_id,signal),until:Date.now()+300000};
   if(cache.size>=16)cache.delete(cache.keys().next().value);cache.set(account_id,record);
  }
  if(!record.keys.has(world+':'+character_id))throw Error('CHARACTER_NOT_ON_PROFILE');
  return true;
 }};
})();
