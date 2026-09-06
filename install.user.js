// ==UserScript==
// @name         Shacal — Panel dodatków
// @namespace    shacal.margonem
// @version      6.3.4
// @description  Instalator panelu Shacal i pięciu dodatków pobieranych z repozytorium.
// @match        https://solphyr.margonem.pl/*
// @run-at       document-end
// @downloadURL  https://shacal97.github.io/Shacal-Customizer/install.user.js
// @updateURL    https://shacal97.github.io/Shacal-Customizer/install.user.js
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @sandbox      raw
// @connect      shacal97.github.io
// @connect      fonts.googleapis.com
// @connect      fonts.gstatic.com
// ==/UserScript==
(function () {
    'use strict';
    if (window.top !== window.self || location.hostname !== 'solphyr.margonem.pl') return;
    const page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    if (page.ShacalRuntime || page.__shacalLoading) return;
    page.__shacalLoading = true;
    page.__shacalRequest = options => GM_xmlhttpRequest(options);
    const script = document.createElement('script');
            script.charset = 'utf-8';
    script.src = 'https://shacal97.github.io/Shacal-Customizer/bootstrap.js?v=6.3.4';
    script.onerror = () => {
        page.__shacalLoading = false;
        const message = document.createElement('div');
        message.textContent = 'Shacal: nie udało się pobrać panelu. Odśwież grę, aby spróbować ponownie.';
        message.style.cssText = 'position:fixed;top:10px;left:10px;z-index:2000001;padding:12px;background:#10151e;color:#fff;border:1px solid #35ead0';
        document.body.append(message);
    };
    document.head.append(script);
})();
