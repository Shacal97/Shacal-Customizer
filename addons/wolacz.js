/* Shacal wolacz 6.2.0 */
(function(runtime){'use strict';const unsafeWindow=window;const GM_xmlhttpRequest=runtime.request;
runtime.registerPart("modules/caller.js", {declare(ctx){ctx.readHeroNotice = function readHeroNotice(element) {
        if (!ctx.isElementVisible(element)) return null;
        const image=element.querySelector('img[data-tip-type="t_npc"]');
        let path='';try{path=new URL(image?.getAttribute('src')||'',location.href).pathname;}catch{return null;}
        const type=/\/npc\/her\//i.test(path)?'Heros':/\/npc\/kol\//i.test(path)?'Kolos':/\/npc\/tyt\//i.test(path)?'Tytan':null;
        if(!type)return null;
        const name=element.querySelector('.name-label')?.textContent.replace(/\s+/g,' ').trim();
        const mapNode=element.querySelector('.map-label');
        const text=mapNode?.textContent.replace(/\s+/g,' ').trim();
        const match=text?.match(/^(.*?)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/);
        if(!name||!match||!match[1].trim())return null;
        return {type,name,map:match[1].trim(),coords:match[2]+','+match[3],key:JSON.stringify([type,name,match[1].trim(),Number(match[2]),Number(match[3])])};
    };
ctx.buildHeroNoticeMessage = function buildHeroNoticeMessage(notice, template=ctx.settings.heroNoticeTemplate) {
        const values={TYP:notice.type,POTWOR:notice.name,HEROS:notice.name,MAPA:notice.map,KOORDY:notice.coords};
        return String(template||ctx.defaultSettings.heroNoticeTemplate).replace(/\{(TYP|POTWOR|HEROS|MAPA|KOORDY)\}/g,(_,key)=>values[key]).replace(/\s+/g,' ').trim();
    };
ctx.setHeroNoticeStatus = function setHeroNoticeStatus(text) {
        const status=document.getElementById('sg-hero-status');if(status)status.textContent=text;
    };
ctx.closeHeroCallQuestions = function closeHeroCallQuestions(){ctx.heroCallQuestions.length=0;ctx.activeHeroCallQuestion=null;document.getElementById('sg-call-question')?.remove();};
ctx.enqueueHeroCall = function enqueueHeroCall(notice,channel,message){
        if(!ctx.addonFeatureEnabled('heroNoticesEnabled')||!ctx.settings['notice'+notice.type])return;
        ctx.legendaryChatQueue.push({kind:'hero',channel,noticeType:notice.type,item:{name:notice.name},message,manual:false,scope:ctx.getLegendaryChatScope(),controller:new AbortController()});
        ctx.setHeroNoticeStatus('Wykryto: '+notice.name+'. Ogłoszenie w kolejce.');
        void ctx.processLegendaryChatQueue();
    };
ctx.showNextHeroCallQuestion = function showNextHeroCallQuestion(){
        if(ctx.activeHeroCallQuestion||!ctx.heroCallQuestions.length)return;
        if(!ctx.addonFeatureEnabled('heroNoticesEnabled')||ctx.settings.heroCallMode!=='confirm'){ctx.closeHeroCallQuestions();return;}
        const question=ctx.heroCallQuestions.shift();ctx.activeHeroCallQuestion=question;
        const box=document.createElement('div');box.id='sg-call-question';box.setAttribute('role','dialog');box.setAttribute('aria-labelledby','sg-call-question-title');
        box.innerHTML='<h3 id="sg-call-question-title">Zawołać na czat?</h3><div class="sg-call-target"></div><p class="sg-call-message"></p><div class="sg-call-buttons"><button type="button" id="sg-call-yes">TAK</button><button type="button" id="sg-call-no">NIE</button></div>';
        box.querySelector('.sg-call-target').textContent=question.notice.name+' · '+(question.channel==='CLAN'?'Czat klanowy /k':'Czat globalny /o');
        box.querySelector('.sg-call-message').textContent=question.message;
        const answer=yes=>{
            if(ctx.activeHeroCallQuestion!==question)return;
            ctx.activeHeroCallQuestion=null;box.remove();
            if(yes&&question.scope===ctx.getLegendaryChatScope()&&ctx.settings.heroCallMode==='confirm')ctx.enqueueHeroCall(question.notice,question.channel,question.message);
            else ctx.setHeroNoticeStatus('Pominięto wołanie: '+question.notice.name+'.');
            ctx.showNextHeroCallQuestion();
        };
        box.querySelector('#sg-call-yes').addEventListener('click',()=>answer(true));
        box.querySelector('#sg-call-no').addEventListener('click',()=>answer(false));
        box.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();answer(false);}});
        document.body.append(box);
        box.style.opacity=document.getElementById('shacal-glow-panel')?.style.opacity||String(1-ctx.settings.panelTransparency/100);
        ctx.makeCallQuestionDraggable(box);
    };
ctx.pruneHeroCallQuestions = function pruneHeroCallQuestions(){
        if(ctx.legendaryChatActiveJob?.kind==='hero'&&!ctx.settings['notice'+ctx.legendaryChatActiveJob.noticeType])ctx.legendaryChatActiveJob.controller.abort();
        for(let i=ctx.heroCallQuestions.length-1;i>=0;i--){
            if(!ctx.settings['notice'+ctx.heroCallQuestions[i].notice.type])ctx.heroCallQuestions.splice(i,1);
        }
        if(ctx.activeHeroCallQuestion&&!ctx.settings['notice'+ctx.activeHeroCallQuestion.notice.type]){
            ctx.activeHeroCallQuestion=null;
            document.getElementById('sg-call-question')?.remove();
        }
        ctx.showNextHeroCallQuestion();
    };
ctx.makeCallQuestionDraggable = function makeCallQuestionDraggable(box){
        let saved=null,drag=null;
        try{saved=JSON.parse(localStorage.getItem('shacalCallPosition'));}catch{}
        const initial=box.getBoundingClientRect();
        box.style.transform='none';
        ctx.keepPanelReachable(box,Number.isFinite(saved?.left)?saved.left:initial.left,Number.isFinite(saved?.top)?saved.top:initial.top);
        box.addEventListener('pointerdown',event=>{
            if(event.button!==0||event.target.closest('button'))return;
            const rect=box.getBoundingClientRect();
            drag={id:event.pointerId,dx:event.clientX-rect.left,dy:event.clientY-rect.top};
            box.setPointerCapture(event.pointerId);event.preventDefault();
        });
        box.addEventListener('pointermove',event=>{
            if(!drag||drag.id!==event.pointerId)return;
            ctx.keepPanelReachable(box,event.clientX-drag.dx,event.clientY-drag.dy);
        });
        const finish=event=>{
            if(!drag||event.pointerId!==drag.id)return;
            const id=drag.id;drag=null;
            if(box.hasPointerCapture(id))box.releasePointerCapture(id);
            const rect=box.getBoundingClientRect();
            try{localStorage.setItem('shacalCallPosition',JSON.stringify({left:rect.left,top:rect.top}));}catch{}
        };
        box.addEventListener('pointerup',finish);
        box.addEventListener('pointercancel',finish);
        box.addEventListener('lostpointercapture',finish);
    };
ctx.requestHeroCall = function requestHeroCall(notice){
        const channel=ctx.settings.heroNoticeChannel,message=ctx.buildHeroNoticeMessage(notice);
        if(ctx.settings.heroCallMode==='confirm'){
            ctx.heroCallQuestions.push({notice,channel,message,scope:ctx.getLegendaryChatScope()});
            ctx.setHeroNoticeStatus('Oczekiwanie na decyzję: '+notice.name+'.');ctx.showNextHeroCallQuestion();
        }else ctx.enqueueHeroCall(notice,channel,message);
    };
ctx.cancelHeroNoticeJobs = function cancelHeroNoticeJobs() {
        ctx.closeHeroCallQuestions();
        if(ctx.legendaryChatActiveJob?.kind==='hero')ctx.legendaryChatActiveJob.controller.abort();
        for(let i=ctx.legendaryChatQueue.length-1;i>=0;i--){const job=ctx.legendaryChatQueue[i];if(job.kind!=='hero')continue;job.controller.abort();job.resolve?.({status:'cancelled'});ctx.legendaryChatQueue.splice(i,1);}
    };
ctx.scanHeroNotices = function scanHeroNotices() {
        if(!ctx.addonFeatureEnabled('heroNoticesEnabled'))return;
        const scope=ctx.getLegendaryChatScope();
        if(scope!==ctx.heroNoticeScope){ctx.cancelHeroNoticeJobs();ctx.heroNoticeScope=scope;ctx.heroNoticeNodes.clear();}
        for(const node of ctx.heroNoticeNodes.keys())if(!ctx.isElementVisible(node))ctx.heroNoticeNodes.delete(node);
        document.querySelectorAll('.heros-detector').forEach(element=>{
            const notice=ctx.readHeroNotice(element);if(!notice||!ctx.settings['notice'+notice.type])return;
            const pageKey=JSON.stringify([scope,notice.key]);
            if(ctx.announcedNoticesThisPage.has(pageKey))return;
            if(ctx.heroNoticeNodes.get(element)===notice.key)return;
            ctx.heroNoticeNodes.set(element,notice.key);
            ctx.announcedNoticesThisPage.add(pageKey);
            ctx.requestHeroCall(notice);
        });
    };
ctx.scheduleHeroNoticeScan = function scheduleHeroNoticeScan() {
        if(ctx.heroNoticeTimer!==null)return;
        ctx.heroNoticeTimer=setTimeout(()=>{ctx.heroNoticeTimer=null;ctx.scanHeroNotices();},150);
    };
ctx.startHeroNoticeObserver = function startHeroNoticeObserver() {
        const observer=new MutationObserver(records=>{
            // Usunięte i ponownie dodane okno jest nowym wyświetleniem, także w tej samej klatce.
            for(const record of records)for(const removed of record.removedNodes){
                if(removed.nodeType!==1)continue;
                if(removed.matches('.heros-detector'))ctx.heroNoticeNodes.delete(removed);
                removed.querySelectorAll('.heros-detector').forEach(node=>ctx.heroNoticeNodes.delete(node));
            }
            if(!ctx.addonFeatureEnabled('heroNoticesEnabled'))return;
            const relevant=records.some(record=>{
                const node=record.target.nodeType===1?record.target:record.target.parentElement;
                return node?.closest?.('.heros-detector')||[...record.addedNodes].some(added=>added.nodeType===1&&(added.matches('.heros-detector')||added.querySelector('.heros-detector')));
            });
            if(relevant)ctx.scheduleHeroNoticeScan();
        });
        observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['src','style','class','data-tip-type']});
        setInterval(()=>{if(ctx.addonFeatureEnabled('heroNoticesEnabled'))ctx.scheduleHeroNoticeScan();},1000);
        ctx.scheduleHeroNoticeScan();
    };},init(ctx){ctx.heroNoticeNodes = new Map();
ctx.announcedNoticesThisPage = new Set();
ctx.heroNoticeTimer = null;
ctx.heroNoticeScope = '';
ctx.heroCallQuestions = [];
ctx.activeHeroCallQuestion = null;
window.addEventListener('resize',()=>{
        const box=document.getElementById('sg-call-question');if(!box)return;
        const rect=box.getBoundingClientRect();ctx.keepPanelReachable(box,rect.left,rect.top);
    });}});
})(window.ShacalRuntime);
