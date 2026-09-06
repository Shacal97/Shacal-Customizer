/* Shacal czat 6.3.3 */
(function(runtime){'use strict';const unsafeWindow=window;const GM_xmlhttpRequest=runtime.request;
runtime.registerPart("modules/chat.js", {declare(ctx){ctx.buildChatEmoticonCatalogHtml = function buildChatEmoticonCatalogHtml() {
        return Object.entries(ctx.CHAT_EMOTICONS) .map(([name, config]) => {
                const token =
                    `:${name}:`;
                return `
                    <button
                        class="shacal-emote-catalog-item"
                        type="button"
                        data-shacal-emote-token="${ctx.escapeHtml(token)}"
                        title="Kliknij, aby skopiować ${ctx.escapeHtml(token)}"
                    >
                        <span class="shacal-emote-catalog-image-wrap">
                            <img
                                class="shacal-emote-catalog-image"
                                src="${ctx.escapeHtml(config.src)}"
                                alt="${ctx.escapeHtml(token)}"
                                loading="lazy"
                            >
                        </span>
                        <span class="shacal-emote-catalog-code">${ctx.escapeHtml(token)}</span>
                    </button>
                `;
            }) .join('');
    };
ctx.isChatEmoticonContext = function isChatEmoticonContext(node) {
        const element = node instanceof Element
                ? node
                : node?.parentElement;
        if (!element || !element.isConnected) return false;
        if ( element.closest( '#shacal-glow-panel, script, style, textarea, input, select, option, [contenteditable="true"]' ) ) {
            return false;
        }
        return !!element.closest( '[class*="chat"], [class*="Chat"], [id*="chat"], [id*="Chat"]' );
    };
ctx.createChatEmoticonElement = function createChatEmoticonElement(name, token) {
        const config = ctx.CHAT_EMOTICONS[String(name || '').toLowerCase()];
        if (!config) return null;
        const image = document.createElement('img');
        image.className = 'shacal-chat-emote';
        image.src = config.src;
        image.alt = config.alt || token;
        image.title = config.title || name;
        image.dataset.shacalEmoteToken = token;
        image.dataset.shacalEmoteName = String(name || '').toLowerCase();
        image.setAttribute( 'aria-label', token );
        return image;
    };
ctx.renderChatEmoticonsInTextNode = function renderChatEmoticonsInTextNode(textNode) {
        if ( !ctx.addonFeatureEnabled('chatEmoticonsEnabled') || !textNode || textNode.nodeType !== Node.TEXT_NODE || !textNode.parentElement || !ctx.isChatEmoticonContext(textNode) ) {
            return;
        }
        const source = String(textNode.nodeValue || '');
        if (!source.includes(':')) {
            return;
        }
        ctx.CHAT_EMOTICON_TOKEN_RE.lastIndex = 0;
        let match;
        let lastIndex = 0;
        let changed = false;
        const fragment = document.createDocumentFragment();
        while ( (match = ctx.CHAT_EMOTICON_TOKEN_RE.exec(source)) ) {
            const token = match[0];
            const name = match[1].toLowerCase();
            const config = ctx.CHAT_EMOTICONS[name];
            if (!config) {
                continue;
            }
            if (match.index > lastIndex) {
                fragment.appendChild( document.createTextNode( source.slice(lastIndex, match.index) ) );
            }
            const image = ctx.createChatEmoticonElement( name, token );
            if (image) {
                fragment.appendChild(image);
                changed = true;
            } else {
                fragment.appendChild( document.createTextNode(token) );
            }
            lastIndex = match.index + token.length;
        }
        if (!changed) {
            return;
        }
        if (lastIndex < source.length) {
            fragment.appendChild( document.createTextNode( source.slice(lastIndex) ) );
        }
        textNode.replaceWith(fragment);
    };
ctx.renderChatEmoticonsInRoot = function renderChatEmoticonsInRoot(root) {
        if ( !ctx.addonFeatureEnabled('chatEmoticonsEnabled') || !root ) {
            return;
        }
        if (root.nodeType === Node.TEXT_NODE) {
            ctx.renderChatEmoticonsInTextNode(root);
            return;
        }
        if (!(root instanceof Element) && root !== document.body) {
            return;
        }
        if ( root instanceof Element && root.matches( '#shacal-glow-panel, script, style, textarea, input, select, option, [contenteditable="true"], .shacal-chat-emote' ) ) {
            return;
        }
        const walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT, {
                    acceptNode(node) {
                        const value = String(node.nodeValue || '');
                        if ( !value.includes(':') || !ctx.isChatEmoticonContext(node) ) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                } );
        const nodes = [];
        let current;
        while ((current = walker.nextNode())) {
            nodes.push(current);
        }
        nodes.forEach( ctx.renderChatEmoticonsInTextNode );
    };
ctx.restoreChatEmoticonTokens = function restoreChatEmoticonTokens() {
        document .querySelectorAll( '.shacal-chat-emote[data-shacal-emote-token]' ) .forEach(image => {
                image.replaceWith( document.createTextNode( image.dataset.shacalEmoteToken || image.alt || '' ) );
            });
    };
ctx.refreshChatEmoticons = function refreshChatEmoticons() {
        if (!ctx.addonFeatureEnabled('chatEmoticonsEnabled')) {
            ctx.restoreChatEmoticonTokens();
            return;
        }
        const roots = document.querySelectorAll( '[class*="chat"], [class*="Chat"], [id*="chat"], [id*="Chat"]' );
        roots.forEach(root => {
            if (!root.closest('#shacal-glow-panel')) {
                ctx.renderChatEmoticonsInRoot(root);
            }
        });
    };
ctx.readSafely = function readSafely(read, fallback = null) {
        try { return read() ?? fallback; } catch { return fallback; }
    };
ctx.getItemIdFromElement = function getItemIdFromElement(element, item = null) {
        const id = item?.id ?? element?.getAttribute?.('data-item-id');
        if (id !== undefined && id !== null && String(id)) return String(id);
        return String(element?.className || '').match(/(?:^|\s)item-id-(\d+)(?:\s|$)/)?.[1] || null;
    };
ctx.getShacalGameWindow = function getShacalGameWindow() {
        return typeof unsafeWindow !== 'undefined' && unsafeWindow ? unsafeWindow : window;
    };
ctx.getShacalGameEngine = function getShacalGameEngine() {
        const page = ctx.getShacalGameWindow();
        return ctx.readSafely(() => page.Engine) || ctx.readSafely(() => page.getEngine?.()) || ctx.readSafely(() => window.Engine);
    };
ctx.normalizeItemLink = function normalizeItemLink(value) {
        if (typeof value !== 'string' && typeof value !== 'number') return null;
        const text = String(value).trim().replace(/^ITEM#/, '');
        // Preserve the optional world suffix supported by the native chat parser.
        // Do not substitute item.id for hid: they need not identify the same link.
        return /^[a-zA-Z0-9_-]{1,160}(?:\.[a-zA-Z][a-zA-Z0-9_-]{0,39})?$/.test(text) ? text : null;
    };
ctx.getItemObjectFromElement = function getItemObjectFromElement(element) {
        if (!element) return null;
        const jq = ctx.readSafely(() => ctx.getShacalGameWindow().jQuery) || window.jQuery;
        const attached = ctx.readSafely(() => jq?.data?.(element)?.item) ||
            (typeof jq === 'function' ? ctx.readSafely(() => jq(element).data('item')) : null);
        const id = ctx.getItemIdFromElement(element, attached);
        const model = id ? ctx.readSafely(() => ctx.getShacalGameEngine()?.items?.getItemById?.(id)) : null;
        // A partial DOM cache must not hide a complete model in Engine.items.
        if (model && attached && model !== attached) {
            const native = ctx.normalizeChatItem(model, element, id);
            const cached = ctx.normalizeChatItem(attached, element, id);
            return {id: native.id, hid: native.hid || cached.hid,
                name: native.name !== 'Przedmiot legendarny' ? native.name : cached.name,
                rarity: native.legendary || cached.legendary ? 'legendary' : '',
                loc: model.loc, _shacalHasModel: true};
        }
        return model || attached;
    };
ctx.normalizeChatItem = function normalizeChatItem(raw, element = null, fallbackId = null) {
        if (!raw && !element) return null;
        const item = raw?.item && typeof raw.item === 'object' ? raw.item : raw || {};
        const data = item.d && typeof item.d === 'object' ? item.d : item.data && typeof item.data === 'object' ? item.data : item;
        const id = ctx.getItemIdFromElement(element, {id: item.id ?? data.id ?? fallbackId});
        const stat = item.stat ?? data.stat;
        const parsed = item._cachedStats || data._cachedStats || item.parsedStats || data.parsedStats || (typeof stat === 'object' ? stat : {});
        const statRarity = typeof stat === 'string' ? stat.match(/(?:^|;)rarity=([^;]+)/)?.[1] : null;
        const rarity = String(item.rarity ?? data.rarity ?? parsed.rarity ?? statRarity ?? '').toLowerCase();
        const legendary = rarity === 'legendary' || rarity === 't-leg' ||
            item.itemType === 't-leg' || data.itemType === 't-leg' ||
            element?.getAttribute?.('data-item-type') === 't-leg' ||
            element?.getAttribute?.('data-frame-mania-rarity') === 'legendary';
        const hidValue = item.hid ?? data.hid ?? parsed.hid ?? ctx.readSafely(() => item.getHid?.());
        const usableHid = ctx.normalizeItemLink(hidValue);
        return {
            id, hid: usableHid, legendary,
            name: String(ctx.readSafely(() => item.getName?.()) ?? item.name ?? data.name ?? 'Przedmiot legendarny'),
            key: id ? `id:${id}` : usableHid ? `hid:${usableHid}` : null,
            element, raw: item, hasModel: Boolean(raw), hasRawHid: hidValue !== undefined && hidValue !== null, rawHidType: hidValue == null ? 'missing' : typeof hidValue
        };
    };
ctx.collectionEntries = function collectionEntries(collection) {
        if (collection instanceof Map) return [...collection.entries()];
        if (Array.isArray(collection)) return collection.map(item => [null, item]);
        return collection && typeof collection === 'object' ? Object.entries(collection) : [];
    };
ctx.collectInventoryItems = function collectInventoryItems() {
        const found = new Map();
        const diagnostics = {dom: 0, engine: 0, sources: [], ready: false};
        const add = (raw, element, id) => {
            const item = ctx.normalizeChatItem(raw, element, id);
            if (!item?.key) return;
            const previous = found.get(item.key);
            found.set(item.key, previous ? {
                ...previous, ...item, hid: item.hid || previous.hid,
                legendary: previous.legendary || item.legendary,
                element: item.element || previous.element
            } : item);
        };
        // First in DOM order: the visible bag/equipment order is predictable for TEST.
        document.querySelectorAll(ctx.INVENTORY_ITEM_SELECTOR).forEach(element => {
            if (element.closest('.loot-wnd, .one-build, .shacal-test-loot-window, #shacal-glow-panel')) return;
            diagnostics.dom++;
            add(ctx.getItemObjectFromElement(element), element);
        });
        const engineItems = ctx.getShacalGameEngine()?.items;
        if (typeof engineItems?.fetchLocationItems === 'function') {
            const items = ctx.readSafely(() => engineItems.fetchLocationItems('g'));
            if (items && typeof items === 'object') {
                diagnostics.ready = true;
                diagnostics.sources.push('Engine: ekwipunek');
                for (const [id, item] of ctx.collectionEntries(items)) { diagnostics.engine++; add(item, null, id); }
            }
        }
        if (typeof engineItems?.getViews === 'function' && typeof engineItems?.getItemById === 'function') {
            const views = ctx.readSafely(() => engineItems.getViews());
            if (views && typeof views === 'object') {
                diagnostics.sources.push('Engine: modele własne');
                for (const [id] of ctx.collectionEntries(views)) {
                    const item = ctx.readSafely(() => engineItems.getItemById(id));
                    // Native ItemLocation: g is inventory/equipment; l is loot, d is bank.
                    if (item?.loc === 'g') { diagnostics.engine++; add(item, null, id); }
                }
            }
        }
        diagnostics.ready ||= diagnostics.dom > 0 || Boolean(document.querySelector('.inventory-grid, .inventory_wrapper, .inventory'));
        diagnostics.sources.push(`DOM: ${diagnostics.dom}`);
        const items = [...found.values()];
        return {items, diagnostics, legends: items.filter(item => item.legendary)};
    };
ctx.findLegendaryInventoryItemForChatTest = function findLegendaryInventoryItemForChatTest() {
        return ctx.collectInventoryItems().legends.find(item => item.hid) || null;
    };
ctx.describeLegendaryInventory = function describeLegendaryInventory() {
        const result = ctx.collectInventoryItems();
        const first = result.legends.find(item => item.hid);
        const models = result.legends.filter(item => item.hasModel).length;
        const summary = `Przedmioty: ${result.items.length}. Legendy: ${result.legends.length}. Modele legend: ${models}. Linki: ${result.legends.filter(item => item.hid).length}. `;
        if (first) return `${summary}Do testu: ${first.name}.`;
        if (result.legends.length) {
            if (!ctx.getShacalGameEngine()) return `${summary}Brak dostępu do Engine gry. Sprawdź, czy wgrano cały skrypt razem z nagłówkiem i odśwież grę.`;
            const invalid=result.legends.filter(item=>item.hasRawHid&&!item.hid).length;
            return `${summary}${invalid ? 'Link istnieje, ale ma nierozpoznany format.' : models ? 'Modele odczytane, brak pola HID.' : 'Widoczne ikony, brak modeli przedmiotów.'} Otwórz torbę i spróbuj ponownie.`;
        }
        return `${summary}Otwórz torbę z legendą. Źródła odczytu: ${result.diagnostics.sources.join(', ')}.`;
    };
ctx.buildLegendaryChatMessage = function buildLegendaryChatMessage(item, template = ctx.settings.chatMessageTemplate) {
        const token = `ITEM#${item.hid}`;
        const text = String(template ?? ctx.defaultSettings.chatMessageTemplate)
            .replace(/\u00a0/g, ' ').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
        return text.includes('{ITEM}') ? text.replace(/\{ITEM\}/g, token) : `${text}${text ? ' ' : ''}${token}`;
    };
ctx.chatWait = function chatWait(delay, signal) {
        return new Promise(resolve => {
            if (signal?.aborted) return resolve(false);
            const finish = ok => { clearTimeout(timer); signal?.removeEventListener('abort', abort); resolve(ok); };
            const abort = () => finish(false);
            const timer = setTimeout(() => finish(true), delay);
            signal?.addEventListener('abort', abort, {once: true});
        });
    };
ctx.awaitChatResult = async function awaitChatResult(result, signal) {
        if (!result || typeof result.then !== 'function') return {value: result};
        // A timed-out request has uncertain delivery: never blindly resend it.
        let timer;
        let abort;
        try {
            return await Promise.race([
                Promise.resolve(result).then(value => ({value}), error => ({uncertain: true, error})),
                new Promise(resolve => {
                    timer = setTimeout(() => resolve({uncertain: true}), 4000);
                    abort = () => resolve({uncertain: true, cancelled: true});
                    signal?.addEventListener('abort', abort, {once: true});
                    if (signal?.aborted) abort();
                })
            ]);
        } finally {
            clearTimeout(timer);
            if (abort) signal?.removeEventListener('abort', abort);
        }
    };
ctx.sendLegendaryGlobalAnnouncement = async function sendLegendaryGlobalAnnouncement(item, options = {}) {
        const {signal, template = ctx.settings.chatMessageTemplate} = options;
        const targetChannel=options.channel==='CLAN'?'CLAN':'GLOBAL';
        let chat, previousChannel, previousReceiver, previousStyle;
        let changedChannel = false;
        let dispatched = false;
        try {
            if (signal?.aborted || (options.scope && options.scope !== ctx.getLegendaryChatScope())) return {status: 'cancelled'};
            chat = ctx.getShacalGameEngine()?.chatController?.getChatInputWrapper?.();
            if (!chat || (!item?.hid && typeof options.message !== 'string') || typeof chat.getDataAndSendRequest !== 'function' ||
                typeof chat.getChannelName !== 'function' || typeof chat.setChannel !== 'function') {
                return {status: 'not-ready', retryable: true};
            }
            previousChannel = chat.getChannelName();
            previousReceiver = chat.getPrivateReceiver?.();
            previousStyle = chat.getStyleMessage?.();
            if (previousChannel !== targetChannel) {
                changedChannel = true;
                chat.setChannel({name: targetChannel});
                for (let i = 0; i < 20 && chat.getChannelName() !== targetChannel; i++) {
                    // Let the pending channel switch settle before restoring it on cancellation.
                    await ctx.chatWait(50);
                }
            }
            if (signal?.aborted || (options.scope && options.scope !== ctx.getLegendaryChatScope())) return {status: 'cancelled'};
            if (chat.getChannelName() !== targetChannel) return {status: 'not-ready', retryable: true};
            // No yield between checking channel/cancellation and dispatching the request.
            dispatched = true;
            const reply = await ctx.awaitChatResult(chat.getDataAndSendRequest(typeof options.message === 'string' ? options.message : ctx.buildLegendaryChatMessage(item, template)), signal);
            if (reply.uncertain) return {status: 'uncertain'};
            if (reply.value === false || reply.value?.ok === false || reply.value?.success === false) {
                return {status: 'rejected', retryable: true};
            }
            return {status: 'submitted'};
        } catch (error) {
            console.warn('[Shacal] Czat:', error);
            return dispatched ? {status: 'uncertain'} : {status: 'not-ready', retryable: true};
        } finally {
            // Respect a channel selected by the player while a promise was pending.
            if (changedChannel && previousChannel && ctx.readSafely(() => chat.getChannelName()) === targetChannel) {
                ctx.readSafely(() => chat.setChannel({name: previousChannel}, previousReceiver, previousStyle));
            }
        }
    };
ctx.setLegendaryChatStatus = function setLegendaryChatStatus(text) {
        ctx.legendaryChatLastStatus = text;
        const status = document.getElementById('sg-chat-test-status');
        if (status) status.textContent = text;
    };
ctx.getLegendaryChatScope = function getLegendaryChatScope() {
        const heroId = ctx.readSafely(() => ctx.getShacalGameEngine()?.hero?.d?.id) ?? 'session';
        return `${location.hostname}:${heroId}`;
    };
ctx.persistLegendaryChatAnnouncedIds = function persistLegendaryChatAnnouncedIds() {
        while (ctx.legendaryChatAnnouncedIds.size > 500) ctx.legendaryChatAnnouncedIds.delete(ctx.legendaryChatAnnouncedIds.values().next().value);
        ctx.readSafely(() => sessionStorage.setItem(`${ctx.CHAT_SESSION_KEY}:${ctx.legendaryChatScope}`, JSON.stringify([...ctx.legendaryChatAnnouncedIds])));
    };
ctx.processLegendaryChatQueue = async function processLegendaryChatQueue() {
        if (ctx.legendaryChatQueueBusy) return;
        ctx.legendaryChatQueueBusy = true;
        try {
            while (ctx.legendaryChatQueue.length) {
                const job = ctx.legendaryChatQueue.shift();
                ctx.legendaryChatActiveJob = job;
                let result = {status: 'cancelled'};
                try {
                    for (let attempt = 1; attempt <= ctx.CHAT_RETRY_LIMIT; attempt++) {
                        if(job.controller.signal.aborted || (job.kind==='hero' ? (!ctx.addonFeatureEnabled('heroNoticesEnabled')||!ctx.settings['notice'+job.noticeType]) : (!job.manual && (!ctx.addonFeatureEnabled('chatAnnouncementsEnabled') || job.generation!==ctx.legendaryChatGeneration))))break;
                        result = await ctx.sendLegendaryGlobalAnnouncement(job.item, {
                            signal: job.controller.signal, template: job.template, message: job.message, channel: job.channel, scope: job.scope
                        });
                        if (!result.retryable || attempt === ctx.CHAT_RETRY_LIMIT) break;
                        if (!await ctx.chatWait(350 * attempt, job.controller.signal)) break;
                    }
                    if (!job.manual && job.kind !== 'hero' && job.generation === ctx.legendaryChatGeneration && ['submitted', 'uncertain'].includes(result.status)) {
                        ctx.legendaryChatAnnouncedIds.add(job.key);
                        ctx.persistLegendaryChatAnnouncedIds();
                    }
                    const text = result.status === 'submitted'
                        ? `Przekazano do czatu ${job.channel === 'CLAN' ? 'klanowego' : 'GLOBAL'}: ${job.item.name}. Sprawdź wiadomość na czacie.`
                        : result.status === 'uncertain'
                            ? 'Brak potwierdzenia wyniku żądania. Sprawdź czat przed kolejnym testem.'
                            : result.status === 'cancelled'
                                ? 'Ogłoszenie anulowane.'
                                : 'Czat nie przyjął wiadomości. Spróbuj ponownie, gdy klient gry będzie gotowy.';
                    if(job.kind==='hero')ctx.setHeroNoticeStatus(text);
                    else if (job.manual || job.generation === ctx.legendaryChatGeneration) ctx.setLegendaryChatStatus(text);
                    job.resolve?.({...result, ok: result.status === 'submitted', message: text});
                } finally {
                    if (!job.manual && job.kind !== 'hero' && job.generation === ctx.legendaryChatGeneration) ctx.legendaryChatQueuedIds.delete(job.key);
                    if (ctx.legendaryChatActiveJob === job) ctx.legendaryChatActiveJob = null;
                }
                if (ctx.legendaryChatQueue.length) await ctx.chatWait(1700);
            }
        } finally {
            ctx.legendaryChatQueueBusy = false;
        }
    };
ctx.enqueueLegendaryGlobalAnnouncement = function enqueueLegendaryGlobalAnnouncement(key, item, options = {}) {
        if (!item?.hid || (!options.manual && (!key || ctx.legendaryChatAnnouncedIds.has(key) || ctx.legendaryChatQueuedIds.has(key)))) return null;
        if (!options.manual) {
            ctx.legendaryChatQueuedIds.add(key);
            ctx.legendaryChatAttemptedIds.add(key);
        }
        const promise = new Promise(resolve => ctx.legendaryChatQueue.push({
            key, item, template: options.template ?? ctx.settings.chatMessageTemplate,
            manual: Boolean(options.manual), generation: ctx.legendaryChatGeneration, scope: ctx.getLegendaryChatScope(),
            controller: new AbortController(), resolve
        }));
        void ctx.processLegendaryChatQueue();
        return promise;
    };
ctx.testLegendaryChatAnnouncement = async function testLegendaryChatAnnouncement(template = ctx.settings.chatMessageTemplate) {
        // Full models may appear later than DOM slots. Re-read, do not keep a stale model.
        for (let attempt = 0; attempt < 9; attempt++) {
            const item = ctx.findLegendaryInventoryItemForChatTest();
            if (item) return await ctx.enqueueLegendaryGlobalAnnouncement(null, item, {manual: true, template});
            if (attempt < 8) await ctx.chatWait(250);
        }
        return {ok: false, status: 'no-item', message: ctx.describeLegendaryInventory()};
    };
ctx.readLegendaryLootCandidates = function readLegendaryLootCandidates(now) {
        document.querySelectorAll(ctx.LOOT_ITEM_SELECTOR).forEach(element => {
            if (!ctx.isElementVisible(element.closest('.loot-wnd'))) return;
            const item = ctx.normalizeChatItem(ctx.getItemObjectFromElement(element), element);
            if (!item?.key || !item.legendary) return;
            if (ctx.legendaryChatPrimedLoot.get(element) === item.key || ctx.legendaryChatAnnouncedIds.has(item.key) || ctx.legendaryChatAttemptedIds.has(item.key)) return;
            if (!ctx.legendaryChatCandidates.has(item.key)) ctx.legendaryChatCandidates.set(item.key, {item, createdAt: now});
            ctx.legendaryChatPrimedLoot.set(element, item.key);
        });
    };
ctx.scanLegendaryChatTracker = function scanLegendaryChatTracker() {
        if (!ctx.addonFeatureEnabled('chatAnnouncementsEnabled') || !ctx.legendaryChatTrackerArmed) return;
        if (ctx.getLegendaryChatScope() !== ctx.legendaryChatScope) { ctx.primeLegendaryChatTracker(); return; }
        const now = Date.now();
        ctx.readLegendaryLootCandidates(now);
        for (const [key, candidate] of ctx.legendaryChatCandidates) {
            if (now - candidate.createdAt > ctx.CHAT_CANDIDATE_TTL) { ctx.legendaryChatCandidates.delete(key); continue; }
            // The loot window is the trigger, regardless of which party member receives it.
            // Re-read delayed metadata even if the loot window has already closed.
            const current = ctx.normalizeChatItem(ctx.getItemObjectFromElement(candidate.item.element), candidate.item.element);
            const resolved = current?.key === key ? {...candidate.item, ...current, hid: current.hid || candidate.item.hid} : candidate.item;
            if (!resolved.hid) continue;
            ctx.enqueueLegendaryGlobalAnnouncement(key, {...resolved, legendary: true});
            ctx.legendaryChatCandidates.delete(key);
        }
    };
ctx.scheduleLegendaryChatScan = function scheduleLegendaryChatScan() {
        clearTimeout(ctx.legendaryChatTimer);
        if (!ctx.addonFeatureEnabled('chatAnnouncementsEnabled') || !ctx.legendaryChatTrackerArmed) return;
        ctx.legendaryChatTimer = setTimeout(() => {
            try { ctx.scanLegendaryChatTracker(); } finally { ctx.scheduleLegendaryChatScan(); }
        }, ctx.legendaryChatCandidates.size ? 250 : 750);
    };
ctx.resetLegendaryChatTracker = function resetLegendaryChatTracker() {
        ctx.legendaryChatGeneration++;
        ctx.legendaryChatTrackerArmed = false;
        clearTimeout(ctx.legendaryChatTimer);
        ctx.legendaryChatTimer = null;
        ctx.legendaryChatCandidates.clear();
        ctx.legendaryChatAttemptedIds.clear();
        ctx.legendaryChatPrimedLoot = new WeakMap();
        if (ctx.legendaryChatActiveJob && ctx.legendaryChatActiveJob.kind !== 'hero' && !ctx.legendaryChatActiveJob.manual) ctx.legendaryChatActiveJob.controller.abort();
        for (let i = ctx.legendaryChatQueue.length - 1; i >= 0; i--) {
            const job = ctx.legendaryChatQueue[i];
            if (job.manual || job.kind==='hero') continue;
            job.controller.abort();
            job.resolve?.({ok: false, status: 'cancelled', message: 'Ogłoszenie anulowane.'});
            ctx.legendaryChatQueue.splice(i, 1);
        }
        ctx.legendaryChatQueuedIds.clear();
    };
ctx.primeLegendaryChatTracker = function primeLegendaryChatTracker() {
        ctx.resetLegendaryChatTracker();
        ctx.legendaryChatScope = ctx.getLegendaryChatScope();
        ctx.legendaryChatAnnouncedIds.clear();
        const saved = ctx.readSafely(() => JSON.parse(sessionStorage.getItem(`${ctx.CHAT_SESSION_KEY}:${ctx.legendaryChatScope}`)), []);
        if (Array.isArray(saved)) saved.slice(-500).forEach(id => ctx.legendaryChatAnnouncedIds.add(String(id)));
        ctx.legendaryChatTrackerArmed = true;
        ctx.scanLegendaryChatTracker();
        ctx.scheduleLegendaryChatScan();
    };
ctx.getLegendaryChatDiagnostics = function getLegendaryChatDiagnostics() {
        const inventory=ctx.collectInventoryItems();
        return JSON.stringify({version:ctx.SHACAL_SCRIPT_VERSION, engine:Boolean(ctx.getShacalGameEngine()),
            pageBridge:typeof unsafeWindow!=='undefined', sources:inventory.diagnostics.sources,
            items:inventory.items.length, legends:inventory.legends.map(item=>({id:item.id,name:item.name,model:item.hasModel,
                hidType:item.rawHidType,hidPresent:item.hasRawHid,linkValid:Boolean(item.hid),
                hidPreview:String(ctx.readSafely(()=>item.raw.hid)||'').slice(0,90),
                fields:Object.keys(item.raw).filter(key=>['id','hid','loc','stat','_cachedStats','d','data','item'].includes(key))}))},null,2);
    };},init(ctx){ctx.CHAT_EMOTICON_TOKEN_RE = /:([a-z0-9_+-]{2,32}):/gi;
ctx.INVENTORY_ITEM_SELECTOR = [
        '.inventory-item', '.inventory-grid .item', '.inventory_wrapper .item',
        '.inventory .item', '.equipment-wrapper .item'
    ].join(', ');
ctx.LOOT_ITEM_SELECTOR = '.loot-wnd:not(.shacal-test-loot-window) .item';
ctx.CHAT_RETRY_LIMIT = 4;
ctx.CHAT_CANDIDATE_TTL = 30000;
ctx.CHAT_SESSION_KEY = 'shacalAnnouncedLootV511';
ctx.legendaryChatCandidates = new Map();
ctx.legendaryChatQueuedIds = new Set();
ctx.legendaryChatAnnouncedIds = new Set();
ctx.legendaryChatAttemptedIds = new Set();
ctx.legendaryChatQueue = [];
ctx.legendaryChatQueueBusy = false;
ctx.legendaryChatTrackerArmed = false;
ctx.legendaryChatGeneration = 0;
ctx.legendaryChatActiveJob = null;
ctx.legendaryChatTimer = null;
ctx.legendaryChatScope = '';
ctx.legendaryChatLastStatus = 'Gotowy do sprawdzenia ekwipunku.';
ctx.legendaryChatPrimedLoot = new WeakMap();}});
})(window.ShacalRuntime);
