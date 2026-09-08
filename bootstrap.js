function shacalBootstrap(window, privilegedRequest) {
    const document=window.document;
    'use strict';
    if (window.top !== window.self || location.hostname !== 'solphyr.margonem.pl' || window.ShacalRuntime) return;
    const base = new URL('https://shacal97.github.io/Shacal-Customizer/');
    const parts = new Map();
    const ctx = Object.create(null);
    const runtime = window.ShacalRuntime = {
        version: '6.11.1', state: 'loading', context: ctx,
        request: privilegedRequest || window.__shacalRequest,
        registerPart(id, part) {
            if (this.state !== 'loading') throw Error('Rejestracja po uruchomieniu: ' + id);
            if (parts.has(id)) throw Error('Powtórzony moduł: ' + id);
            parts.set(id, part);
        }
    };
    delete window.__shacalRequest;
    runtime.showUpdateNotice = function (version) {
        if (document.getElementById('shacal-update-notice') || runtime.updateNoticeShown === version) return;
        runtime.updateNoticeShown = version;
        const previousFocus = document.activeElement;
        const dialog = document.createElement('dialog');
        dialog.id = 'shacal-update-notice';
        dialog.setAttribute('aria-labelledby', 'shacal-update-title');
        dialog.style.cssText = 'position:fixed;inset:0;margin:auto;width:360px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:26px;border:2px solid #3ce7d3;border-radius:14px;background:linear-gradient(145deg,#141a23,#100d19);color:#ecf6fa;box-shadow:0 0 26px #31dfcd30,0 14px 60px #0009;font:14px/1.5 Arial,sans-serif;text-align:center;';
        const brand = document.createElement('div');
        brand.textContent = 'SHACAL CUSTOMIZER';
        brand.style.cssText = 'font-size:11px;letter-spacing:2px;color:#56ead9;margin-bottom:16px';
        const title = document.createElement('h2');
        title.id = 'shacal-update-title';
        title.textContent = 'Dostępna aktualizacja';
        title.style.cssText = 'font:bold 21px/1.3 Arial,sans-serif;margin:0 0 12px;color:#fff';
        const description = document.createElement('p');
        description.textContent = 'Wersja ' + version + ' jest gotowa do instalacji.';
        description.style.cssText = 'margin:0 0 22px;color:#bcc9d5';
        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:10px;justify-content:center';
        const update = document.createElement('a');
        update.textContent = 'Aktualizuj';
        update.href = 'https://shacal97.github.io/Shacal-Customizer/install.user.js';
        update.target = '_blank';update.rel = 'noopener noreferrer';
        const buttonStyle = 'display:block;flex:1;padding:11px 12px;border-radius:7px;border:1px solid #78538d;background:linear-gradient(#32233e,#201928);color:#f5eeff;font:bold 13px/18px Arial,sans-serif;text-decoration:none;cursor:pointer;';
        update.style.cssText = buttonStyle + 'border-color:#39d5c3;background:linear-gradient(#215951,#153a37);color:#b7fff1';
        actions.append(update);dialog.append(brand,title,description,actions);
        dialog.addEventListener('close',()=>{dialog.remove();if(previousFocus?.isConnected)previousFocus.focus();},{once:true});
        document.body.append(dialog);dialog.showModal();update.focus();
    };
    function loadScript(file, version) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.charset = 'utf-8';
            const url = new URL(file, base);url.searchParams.set('v', version);
            script.src = url.href;
            const timeout = setTimeout(() => {script.remove();reject(Error('Przekroczony czas: ' + file));}, 20000);
            script.onload = () => {clearTimeout(timeout);resolve();};
            script.onerror = () => {clearTimeout(timeout);script.remove();reject(Error('Nie pobrano: ' + file));};
            document.head.append(script);
        });
    }
    (async () => {
        let manifest;
        try {
            const response=await fetch(new URL('manifest.json',base),{cache:'no-cache',signal:AbortSignal.timeout(20000)});
            if(!response.ok)throw Error('Manifest: HTTP '+response.status);
            manifest=await response.json();
        } catch(error) {
            if(typeof runtime.request!=='function')throw error;
            manifest=await new Promise((resolve,reject)=>runtime.request({method:'GET',url:new URL('manifest.json?v='+runtime.version,base).href,timeout:20000,onload:r=>{try{if(r.status!==200)throw Error('Manifest: HTTP '+r.status);resolve(JSON.parse(r.responseText));}catch(e){reject(e);}},onerror:()=>reject(Error('Nie udało się pobrać manifestu.')),ontimeout:()=>reject(Error('Przekroczono czas pobierania manifestu.'))}));
        }
        if (!Array.isArray(manifest.scripts) || !Array.isArray(manifest.parts)) throw Error('Nieprawidłowy manifest.');
        if (manifest.version !== runtime.version) {
            if (/^\d+\.\d+\.\d+$/.test(manifest.version)) runtime.showUpdateNotice(manifest.version);
            throw Error('Niezgodna wersja panelu. Zaktualizuj instalator.');
        }
        if (manifest.scripts.some(file => !/^(panel\.js|addons\/[a-z-]+\.js)$/.test(file))) throw Error('Nieprawidłowa lista dodatków.');
        // Scripts register executable factories. No concatenation or eval is used.
        for (const file of manifest.scripts) await loadScript(file, manifest.version);
        if (parts.size !== manifest.parts.length || manifest.parts.some(id => !parts.has(id))) throw Error('Niekompletny zestaw dodatków.');
        for (const id of manifest.parts) parts.get(id).declare(ctx);
        runtime.state = 'starting';
        for (const id of manifest.parts) parts.get(id).init(ctx);
        runtime.state = 'ready';window.__shacalLoading=false;
    })().catch(error => {
        runtime.state = 'error';window.__shacalLoading=false;runtime.error=String(error.message||error);
        console.error('[Shacal]', error);
    });
}
// Compatibility with already installed loaders that insert bootstrap.js as a script.
if(typeof document!=='undefined'&&document.currentScript?.src?.startsWith('https://shacal97.github.io/Shacal-Customizer/bootstrap.js'))shacalBootstrap(window,window.__shacalRequest);
