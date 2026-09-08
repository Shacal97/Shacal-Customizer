// ==UserScript==
// @name         Shacal — Panel dodatków
// @namespace    shacal.margonem
// @version      6.11.4
// @description  Instalator panelu Shacal i dodatków pobieranych z repozytorium.
// @match        https://solphyr.margonem.pl/*
// @run-at       document-end
// @downloadURL  https://shacal97.github.io/Shacal-Customizer/install.user.js
// @updateURL    https://shacal97.github.io/Shacal-Customizer/install.user.js
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @sandbox      raw
// @connect      www.margonem.pl
// @connect      shacal97.github.io
// @connect      fonts.googleapis.com
// @connect      fonts.gstatic.com
// @require      https://shacal97.github.io/Shacal-Customizer/bootstrap.js?v=6.11.4
// ==/UserScript==
(function () {
 'use strict';
 const page=typeof unsafeWindow!=='undefined'?unsafeWindow:window;
 if(page.top!==page.self||page.location.hostname!=='solphyr.margonem.pl'||page.ShacalRuntime)return;
 if(typeof shacalBootstrap!=='function'){console.error('[Shacal] Brak pliku startowego. Zainstaluj ponownie aktualny instalator.');return;}
 shacalBootstrap(page,options=>GM_xmlhttpRequest(options));
})();
