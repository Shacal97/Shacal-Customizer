(function () {
    'use strict';
    if (window.top !== window.self || location.hostname !== 'solphyr.margonem.pl' || window.ShacalRuntime) return;
    const base = new URL('.', document.currentScript.src);
    const parts = new Map();
    const ctx = Object.create(null);
    const runtime = window.ShacalRuntime = {
        version: '6.3.5', state: 'loading', context: ctx,
        request: window.__shacalRequest,
        registerPart(id, part) {
            if (this.state !== 'loading') throw Error('Rejestracja po uruchomieniu: ' + id);
            if (parts.has(id)) throw Error('Powtórzony moduł: ' + id);
            parts.set(id, part);
        }
    };
    delete window.__shacalRequest;
    const status = document.createElement('div');
    status.style.cssText = 'position:fixed;top:10px;left:10px;z-index:2000001;padding:12px;background:#10151e;color:#fff;border:1px solid #35ead0;border-radius:6px';
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
        const response = await fetch(new URL('manifest.json', base), {cache:'no-cache', signal:AbortSignal.timeout(20000)});
        if (!response.ok) throw Error('Manifest: HTTP ' + response.status);
        const manifest = await response.json();
        if (manifest.version !== runtime.version || !Array.isArray(manifest.scripts) || !Array.isArray(manifest.parts)) throw Error('Niezgodna wersja panelu. Zaktualizuj instalator.');
        if (manifest.scripts.some(file => !/^(panel\.js|addons\/[a-z-]+\.js)$/.test(file))) throw Error('Nieprawidłowa lista dodatków.');
        // Scripts register executable factories. No concatenation or eval is used.
        await Promise.all(manifest.scripts.map(file => loadScript(file, manifest.version)));
        if (parts.size !== manifest.parts.length || manifest.parts.some(id => !parts.has(id))) throw Error('Niekompletny zestaw dodatków.');
        for (const id of manifest.parts) parts.get(id).declare(ctx);
        runtime.state = 'starting';
        for (const id of manifest.parts) parts.get(id).init(ctx);
        runtime.state = 'ready';status.remove();
    })().catch(error => {
        runtime.state = 'error';
        status.textContent = 'Shacal: ' + error.message + ' Odśwież grę, aby spróbować ponownie.';
        document.body.append(status);
        console.error('[Shacal]', error);
    });
})();
