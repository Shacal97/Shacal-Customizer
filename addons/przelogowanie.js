/* Shacal przelogowanie 6.3.7 */
(function(runtime){'use strict';const unsafeWindow=window;const GM_xmlhttpRequest=runtime.request;
runtime.registerPart("modules/relogger.js", {declare(ctx){ctx.selectFirstE2PerCharacter = function selectFirstE2PerCharacter(timers,scope){
        if(!ctx.firstE2Memory){
            ctx.firstE2Memory={};
            try{
                const saved=JSON.parse(localStorage.getItem('shacalFirstE2V1')||'{}');
                if(saved && typeof saved==='object' && !Array.isArray(saved)){
                    for(const [key,value] of Object.entries(saved)){
                        if(!/^\d+:solphyr$/.test(key) || !value?.chars || typeof value.chars!=='object')continue;
                        const chars={};
                        for(const [id,entry] of Object.entries(value.chars)){
                            if(!/^\d+$/.test(id) || !entry || !Array.isArray(entry.seen))continue;
                            const seen=entry.seen.filter(t=>t && typeof t.key==='string' && Number.isFinite(t.until) && t.until>=ctx.e2Now());
                            const chosen=typeof entry.chosen==='string' && Number.isFinite(entry.until) && entry.until>=ctx.e2Now()?entry.chosen:null;
                            if(seen.length || chosen)chars[id]={seen,chosen,until:chosen?entry.until:0};
                        }
                        if(Object.keys(chars).length)ctx.firstE2Memory[key]={chars};
                    }
                }
            }catch{}
        }
        const previous=JSON.stringify(ctx.firstE2Memory);
        const now=ctx.e2Now();
        // Expired history must not grow indefinitely across characters and accounts.
        for(const [key,value] of Object.entries(ctx.firstE2Memory)){
            for(const [id,entry] of Object.entries(value.chars)){
                entry.seen=entry.seen.filter(t=>t.until>=now);
                if(entry.until<now){entry.chosen=null;entry.until=0;}
                if(!entry.chosen && !entry.seen.length)delete value.chars[id];
            }
            if(!Object.keys(value.chars).length)delete ctx.firstE2Memory[key];
        }
        let state=ctx.firstE2Memory[scope];
        if(!state || typeof state!=='object' || !state.chars)state=ctx.firstE2Memory[scope]={chars:{}};
        const groups=new Map();
        for(const t of timers){if(now>t.max+60)continue;const group=groups.get(t.charId)||[];group.push(t);groups.set(t.charId,group);}
        const result=[];
        for(const [charId,group] of groups){
            const signature=t=>[t.timerId,t.min,t.max].join(':');
            let entry=state.chars[charId];
            if(!entry || !Array.isArray(entry.seen)){
                // A lone existing timer is unambiguous. Several existing timers have no kill-order data.
                entry=state.chars[charId]={seen:group.map(t=>({key:signature(t),until:t.max+60})),chosen:group.length===1?signature(group[0]):null,until:group.length===1?group[0].max+60:0};
            }else{
                entry.seen=entry.seen.filter(t=>t.until>=now);
                if(entry.until<now){entry.chosen=null;entry.until=0;}
                const old=new Set(entry.seen.map(t=>t.key));
                const fresh=group.filter(t=>!old.has(signature(t)));
                // Multiple additions in one scan cannot be reliably ordered either.
                if(!entry.chosen && fresh.length===1){entry.chosen=signature(fresh[0]);entry.until=fresh[0].max+60;}
                for(const t of fresh)entry.seen.push({key:signature(t),until:t.max+60});
            }
            // Native timer corrections change deadlines, not the selected monster.
            // Match its saved ID before treating its corrected times as an unrelated timer.
            if(entry.chosen && !group.some(t=>signature(t)===entry.chosen)){
                const previousId=entry.chosen.split(':').slice(0,-2).join(':');
                const candidates=group.filter(t=>String(t.timerId)===previousId);
                if(candidates.length===1){
                    const current=candidates[0];
                    entry.chosen=signature(current);entry.until=current.max+60;
                }
            }
            state.chars[charId]=entry;
            const chosen=group.find(t=>signature(t)===entry.chosen);
            if(chosen)result.push(chosen);
        }
        if(JSON.stringify(ctx.firstE2Memory)!==previous){try{localStorage.setItem('shacalFirstE2V1',JSON.stringify(ctx.firstE2Memory));}catch{}}
        return result;
    };
ctx.readE2Timers = function readE2Timers() {
        const engine = ctx.getShacalGameEngine();
        const key = engine?.windowsData?.name?.addon_17;
        const stored = key ? ctx.readSafely(() => engine.serverStorage.get(key)?.data) : null;
        const jq = ctx.getShacalGameWindow().jQuery;
        const rows=[...document.querySelectorAll('.elite-timer-wnd .npc-list .row')];
        const domData=rows.map(node => ctx.readSafely(() => jq?.data(node)?.obj)).filter(Boolean);
        let raw=Array.isArray(stored)?stored:domData;
        const account = engine?.hero?.d?.account;
        const world = location.hostname.split('.')[0];
        if(!account)return [];
        const scope=String(account)+':'+world;
        if(Array.isArray(stored) || domData.length){
            ctx.e2LastNativeRead={scope,raw,time:performance.now()};
        }else if(ctx.e2LastNativeRead?.scope===scope && performance.now()-ctx.e2LastNativeRead.time<15000){
            // Bridge a short native-storage outage; a real empty array still clears timers.
            raw=ctx.e2LastNativeRead.raw;
        }
        const found = new Map();
        for (const item of raw) {
            if (!item || Number(item.type) !== 2 || item.user != null) continue;
            const hero = item.heroData;
            if (!account || !hero || String(hero.accountId) !== String(account) || hero.world !== world) continue;
            if (ctx.settings.e2SelectedOnly && !ctx.settings.e2Characters.includes(String(hero.id))) continue;
            const max = Number(item.presp), min = Number(item.minResp);
            if (!hero.id || !Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) continue;
            found.set(String(hero.id) + ':' + item.id, {timerId:String(item.id), charId:String(hero.id), name:String(item.name), map:String(item.map || ''), min, max});
        }
        const timers=[...found.values()];
        const chosen=ctx.selectFirstE2PerCharacter(timers,String(account)+':'+world);
        return timers.map(t=>({...t,controlsGlow:chosen.includes(t)}));
    };
ctx.e2Now = function e2Now() {
        const value = ctx.readSafely(() => ctx.getShacalGameWindow().unix_time());
        return typeof value === 'number' && Number.isFinite(value) ? value : Date.now()/1000;
    };
ctx.e2Time = function e2Time(seconds) {
        const s = Math.max(0, Math.ceil(seconds));
        return [Math.floor(s/3600), Math.floor(s/60)%60, s%60].map(v=>String(v).padStart(2,'0')).join(':');
    };
ctx.hideE2Tooltip = function hideE2Tooltip() {
        ctx.e2Hovered = null;
        document.body.classList.remove('sg-e2-hovering');
        document.getElementById('sg-e2-tooltip')?.remove();
    };
ctx.updateE2Tooltip = function updateE2Tooltip(now) {
        const entries = ctx.e2Hovered && ctx.e2AvatarTimers.get(ctx.e2Hovered);
        if (!ctx.settings.e2TooltipsEnabled || !entries?.length || !ctx.isElementVisible(ctx.e2Hovered)) { ctx.hideE2Tooltip(); return; }
        document.body.classList.add('sg-e2-hovering');
        let tip = document.getElementById('sg-e2-tooltip');
        if (!tip) { tip=document.createElement('div'); tip.id='sg-e2-tooltip'; tip.setAttribute('role','tooltip'); document.body.append(tip); }
        const rows=entries.map(t=>({name:(t.controlsGlow?'● ':'')+t.name,map:t.map,time:'Mini: '+ctx.e2Time(t.min-now)+'   Max: '+ctx.e2Time(t.max-now),selected:t.controlsGlow}));
        const signature=JSON.stringify(rows);
        if(tip.dataset.rows!==signature){
            tip.dataset.rows=signature;tip.replaceChildren();
            for(const row of rows){
                const item=document.createElement('div');item.className='sg-e2-tip-row';
                const name=document.createElement('strong');name.textContent=row.name;
                if(row.selected){name.style.color=ctx.settings.e2MiniColor;name.setAttribute('aria-label',row.name+' — steruje poświatą');}
                const map=document.createElement('small');map.textContent=row.map;
                const time=document.createElement('span');time.textContent=row.time;
                item.append(name,map,time);tip.append(item);
            }
        }
        const r=ctx.e2Hovered.getBoundingClientRect();
        tip.style.left=Math.max(4,Math.min(r.right+10,innerWidth-tip.offsetWidth-4))+'px';
        tip.style.top=Math.max(4,Math.min(r.bottom+8,innerHeight-tip.offsetHeight-4))+'px';
        tip.style.opacity=document.getElementById('shacal-glow-panel')?.style.opacity||String(1-ctx.settings.panelTransparency/100);
    };
ctx.syncE2Relogger = function syncE2Relogger() {
        const avatars=[...document.querySelectorAll('.relogger__one-character')];
        ctx.e2AvatarTimers=new WeakMap();
        const desired=new Map();
        for(const [key,value] of [['--sg-e2-mini',ctx.settings.e2MiniColor],['--sg-e2-max',ctx.settings.e2MaxColor]]){
            if(document.documentElement.style.getPropertyValue(key)!==value)document.documentElement.style.setProperty(key,value);
        }
        const applyClasses=()=>avatars.forEach(a=>{for(const name of ['sg-e2-ready','sg-e2-max']){const wanted=desired.get(a)===name;if(a.classList.contains(name)!==wanted)a.classList.toggle(name,wanted);}});
        if (!ctx.addonFeatureEnabled('e2ReloggerEnabled')) { applyClasses();ctx.hideE2Tooltip();const status=document.getElementById('sg-e2-status');if(status && status.textContent!=='Podświetlanie jest wyłączone.')status.textContent='Podświetlanie jest wyłączone.';return; }
        const engine=ctx.getShacalGameEngine(), now=ctx.e2Now();
        const timers=ctx.readE2Timers().filter(t=>now<=t.max+60);
        // The native renderer uses this exact ordering. Work on a copy; never sort the game's list.
        const list=engine?.changePlayer?.charlist?.list;
        let matched=0;
        if (Array.isArray(list)) {
            const characters=[...list].sort((a,b)=>Number(a.lvl)-Number(b.lvl)||String(a.nick).localeCompare(String(b.nick)));
            document.querySelectorAll('.relogger__char-group').forEach(group=>{
                const world=group.getAttribute('data-world');
                const models=characters.filter(c=>c.world===world);
                const nodes=[...group.querySelectorAll('.relogger__one-character')];
                if (world!==location.hostname.split('.')[0] || nodes.length!==models.length) return;
                // Refuse ambiguous reordered/replaced avatars instead of highlighting the wrong character.
                nodes.forEach((node,i)=>{
                    const background=node.querySelector('.img-avatar-correct')?.style.backgroundImage||'';
                    // An avatar still loading must not disable all other characters.
                    if(typeof models[i].icon!=='string' || !models[i].icon || !background.includes(models[i].icon))return;
                    const entries=timers.filter(t=>t.charId===String(models[i].id)).sort((a,b)=>Number(b.controlsGlow)-Number(a.controlsGlow)||a.min-b.min);
                    if (!entries.length) return;
                    matched++; ctx.e2AvatarTimers.set(node,entries);
                    if (entries.some(t=>t.controlsGlow && now>=t.max)) desired.set(node,'sg-e2-max');
                    else if (entries.some(t=>t.controlsGlow && now>=t.min)) desired.set(node,'sg-e2-ready');

                });
            });
        }
        applyClasses();
        const status=document.getElementById('sg-e2-status');
        const message=timers.length+' liczników E2. Powiązane postacie: '+matched+'.'+(!Array.isArray(list)?' Czekam na listę postaci.':'');
        if(status && status.textContent!==message)status.textContent=message;
        if (ctx.e2Hovered) ctx.updateE2Tooltip(now);
    };
ctx.startE2Relogger = function startE2Relogger() {
        const css=document.createElement('style');
        const controls=document.createElement('style');controls.textContent='#sg-e2-refresh{background:linear-gradient(#263c49,#14232d);color:#cce9f5;border:1px solid #426174;border-radius:5px;padding:10px 14px;cursor:pointer}#sg-e2-refresh:active{transform:translateY(1px)}#sg-e2-characters{display:grid;grid-template-rows:repeat(5,auto);grid-auto-flow:column;grid-template-columns:repeat(2,max-content);column-gap:24px;row-gap:2px;width:max-content;max-width:100%;margin-bottom:16px}#sg-e2-status{color:#7cd8cb;margin-top:16px}';document.head.append(controls);
        css.textContent='body.sg-e2-hovering .tip-wrapper.normal-tip{visibility:hidden!important}.relogger__one-character.sg-e2-ready{--sg-e2-color:var(--sg-e2-mini)}.relogger__one-character.sg-e2-max{--sg-e2-color:var(--sg-e2-max)}.relogger__one-character.sg-e2-ready,.relogger__one-character.sg-e2-max{filter:brightness(1.25) saturate(1.35) drop-shadow(0 0 3px var(--sg-e2-color)) drop-shadow(0 0 3px var(--sg-e2-color))!important;clip-path:inset(-16px -16px 0 -16px)}.relogger-window .relogger__characters{padding-top:12px!important;padding-bottom:0!important;margin-bottom:0!important}.relogger-window .relogger__char-group{padding-bottom:0!important;margin-bottom:0!important}.relogger-window .relogger__one-character{vertical-align:bottom}#sg-e2-tooltip{position:fixed;z-index:2000200;width:224px;max-width:calc(100vw - 8px);max-height:calc(100vh - 8px);overflow:auto;white-space:normal;pointer-events:none;background:#080c14;color:#e4f5ff;border:1px solid #32e4ce;border-radius:6px;padding:7px 9px;font:11px/1.3 sans-serif;box-sizing:border-box;box-shadow:0 8px 26px #0009}#sg-e2-tooltip .sg-e2-tip-row+ .sg-e2-tip-row{border-top:1px solid #ffffff18;margin-top:5px;padding-top:5px}#sg-e2-tooltip strong,#sg-e2-tooltip small,#sg-e2-tooltip span{display:block}#sg-e2-tooltip strong{font-size:11px;overflow-wrap:anywhere}#sg-e2-tooltip small{font-size:10px;color:#96aab3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#sg-e2-tooltip span{font-size:10.5px;font-variant-numeric:tabular-nums;white-space:nowrap}';
        document.head.append(css);
        document.addEventListener('pointerover',event=>{const node=event.target.closest?.('.relogger__one-character');if(node && ctx.e2AvatarTimers.has(node)){ctx.e2Hovered=node;ctx.updateE2Tooltip(ctx.e2Now());}});
        document.addEventListener('pointerout',event=>{if(ctx.e2Hovered?.contains(event.target)&&!ctx.e2Hovered.contains(event.relatedTarget))ctx.hideE2Tooltip();});
        window.addEventListener('blur',ctx.hideE2Tooltip);
        const refresh=()=>{
            try{ctx.syncE2Relogger();}
            catch{ctx.hideE2Tooltip();const status=document.getElementById('sg-e2-status');if(status)status.textContent='Nie udało się odczytać minutnika. Ponawiam odczyt.';}
        };
        setInterval(refresh,1000);
        window.addEventListener('focus',refresh);
        window.addEventListener('pageshow',refresh);
        document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
        refresh();
    };
ctx.refreshE2Characters = function refreshE2Characters(panel) {
        const host=panel.querySelector('#sg-e2-characters');
        host.replaceChildren();
        const list=ctx.getShacalGameEngine()?.changePlayer?.charlist?.list;
        const chars=Array.isArray(list)?list.filter(c=>c.world===location.hostname.split('.')[0]).sort((a,b)=>Number(a.lvl)-Number(b.lvl)||String(a.nick).localeCompare(String(b.nick),'pl')):[];
        if(!chars.length){host.textContent='Lista pojawi się po wczytaniu okna przelogowania.';return;}
        for(const c of chars){
            const label=document.createElement('label');label.style.cssText='display:flex;gap:10px;align-items:center;padding:6px 0';
            const input=document.createElement('input');input.type='checkbox';input.checked=ctx.panelDraftSettings.e2Characters.includes(String(c.id));
            input.addEventListener('change',()=>{const ids=new Set(ctx.panelDraftSettings.e2Characters);if(input.checked)ids.add(String(c.id));else ids.delete(String(c.id));ctx.panelDraftSettings.e2Characters=[...ids];ctx.markPanelDraftDirty(panel);});
            label.append(input,document.createTextNode(c.nick+' ('+c.lvl+')'));host.append(label);
        }
    };},init(ctx){ctx.e2Hovered = null;
ctx.e2AvatarTimers = new WeakMap();
ctx.firstE2Memory = null;
ctx.e2LastNativeRead = null;}});
})(window.ShacalRuntime);
