/* Shacal core 6.2.0 */
(function(runtime){'use strict';const unsafeWindow=window;const GM_xmlhttpRequest=runtime.request;
runtime.registerPart("core/start.js", {declare(ctx){},init(ctx){ctx.VALID_FRAME_SETS = Object.freeze([1, 2, 3, 7, 8, 9, 11, 12, 13, 14, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);
ctx.VALID_TIP_FONTS = Object.freeze(['default', 'cinzel', 'cormorant', 'vollkorn', 'spectral', 'bree', 'alegreya', 'playfair', 'grenze', 'lora', 'merriweather']);
ctx.STORAGE_KEY = 'shacalLegendaryGlowSettings';
ctx.SHACAL_SCRIPT_VERSION = '6.2.0';
ctx.SHACAL_UPDATE_URL = 'https://shacal97.github.io/Shacal-Customizer/install.user.js';
ctx.defaultSettings = {
        e2TooltipsEnabled:true, e2MiniColor:'#29efce', e2MaxColor:'#b05cff', e2ReloggerEnabled:false, e2SelectedOnly:false, e2Characters:[],
        noticeHeros: true, noticeKolos: false, noticeTytan: false, heroCallMode: 'auto', heroNoticeChannel: 'GLOBAL', heroNoticesEnabled: false, heroNoticeTemplate: 'Znaleziono: {POTWOR}, {MAPA} ({KOORDY})',
        lootSoundEnabled: true,
        panelTransparency: 0,
        enabled: true, color1: '#63f59a', color2: '#d8b800', color3: '#e12b77', glow1: 3, glow2: 3, glow3: 2, opacity1: 4, opacity2: 4, opacity3: 3, width1: 2, width2: 3,
        width3: 4, pulse: 3, effect: 1, glowStyle: 1, sound: 1, volume: 3, dropMode: 'normal', itemFramesEnabled: false, overrideGameItemFrames: true, itemFrameSet: 1,
        frameCommon: true, frameUnique: true, frameHeroic: true, frameUpgraded: true, frameLegendary: true, upgradeBadgeEnabled: false, upgradeBadgeStyle: 1,
        upgradeBadgeSyncRarityColor: true, itemTipsEnabled: false, itemTipSet: 0, // 0 = synchronizuj z wybranym zestawem ramek
        itemTipTextColors: true, itemTipOuterGlow: true, itemTipFont: 'default', tipUnique: true, tipHeroic: true, tipUpgraded: true, tipLegendary: true,
        chatAnnouncementsEnabled: false, chatMessageTemplate: 'O jejku patrzcie {ITEM} ale super!', chatEmoticonsEnabled: false, iconX: null, iconY: null
    };
ctx.DROP_MODE_NORMAL = 'normal';
ctx.DROP_MODE_LEGENDARY = 'legendary';
ctx.STYLE_CLASSIC = 1;
ctx.STYLE_NEON_80S = 2;
ctx.STYLE_INNER_AURA = 3;
ctx.INNER_AURA_MAP_WIDTH_MAX = 15;
ctx.EFFECT_NONE = 0;
ctx.EFFECT_PULSE = 1;
ctx.EFFECT_MAGIC_FLICKER = 2;
ctx.EFFECT_MOVING_COLORS = 3;
ctx.SHACAL_UI_PANEL_Z = 2000000;
ctx.SHACAL_UI_LAUNCHER_Z = ctx.SHACAL_UI_PANEL_Z + 1;
ctx.SHACAL_GLOW_Z_CEILING = ctx.SHACAL_UI_PANEL_Z - 1;
ctx.SHACAL_MAP_GLOW_INSET = 8;}});
runtime.registerPart("addon-registry.js", {declare(ctx){ctx.addonFeatureEnabled = function addonFeatureEnabled(feature) {
        return ctx.settings['addon_'+ctx.SHACAL_FEATURE_OWNER[feature]]!==false && ctx.settings[feature];
    };},init(ctx){ctx.SHACAL_ADDONS = [
        {id:'glow',name:'GLOW',description:'Poświata legendarnego łupu, animacje i dźwięki.',features:['enabled','lootSoundEnabled']},
        {id:'frames',name:'RAMKI I DYMKI',description:'Ramki, poziomy ulepszeń i zsynchronizowane opisy przedmiotów.',features:['itemFramesEnabled','itemTipsEnabled','upgradeBadgeEnabled']},
        {id:'chat',name:'CZAT',description:'Ogłoszenia legend i emotikony na czacie.',features:['chatAnnouncementsEnabled','chatEmoticonsEnabled']},
        {id:'detector',name:'WOŁACZ',description:'Wołanie na herosów, kolosy i tytanów.',features:['heroNoticesEnabled']},
        {id:'e2',name:'PRZELOGOWANIE',description:'Liczniki E2 i podświetlenie postaci.',features:['e2ReloggerEnabled']}
    ];
ctx.SHACAL_FEATURE_OWNER = Object.fromEntries(ctx.SHACAL_ADDONS.flatMap(a=>a.features.map(f=>[f,a.id])));}});
runtime.registerPart("core/settings.js", {declare(ctx){ctx.hasSavedLauncherPosition = function hasSavedLauncherPosition() {
        return (
            ctx.settings.iconX !== null &&
            ctx.settings.iconY !== null &&
            Number.isFinite(Number(ctx.settings.iconX)) &&
            Number.isFinite(Number(ctx.settings.iconY))
        );
    };
ctx.normalizeBoolean = function normalizeBoolean(value) {
        if (typeof value === 'string') return !['false', '0', ''].includes(value.toLowerCase().trim());
        return Boolean(value);
    };
ctx.normalizeHexColor = function normalizeHexColor(value, fallback) {
        let hex = String(value ?? '') .trim() .replace(/^#/, '');
        if (/^[0-9a-fA-F]{3}$/.test(hex)) {
            hex = hex .split('') .map(character => character + character) .join('');
        }
        if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
            return fallback;
        }
        return `#${hex.toLowerCase()}`;
    };
ctx.normalizeSettings = function normalizeSettings(rawSettings) {
        const normalized = { ...ctx.defaultSettings, ...rawSettings
        };
        for(const addon of ctx.SHACAL_ADDONS)normalized['addon_'+addon.id]=rawSettings?.['addon_'+addon.id]===undefined?true:ctx.normalizeBoolean(rawSettings['addon_'+addon.id]);
        normalized.panelTransparency = Math.round(Math.min(65, Math.max(0, Number(normalized.panelTransparency) || 0)));
        normalized.e2TooltipsEnabled=ctx.normalizeBoolean(normalized.e2TooltipsEnabled);
        normalized.e2MiniColor=ctx.normalizeHexColor(normalized.e2MiniColor,ctx.defaultSettings.e2MiniColor);
        normalized.e2MaxColor=ctx.normalizeHexColor(normalized.e2MaxColor,ctx.defaultSettings.e2MaxColor);
        normalized.e2ReloggerEnabled=ctx.normalizeBoolean(normalized.e2ReloggerEnabled);
        normalized.e2SelectedOnly=ctx.normalizeBoolean(normalized.e2SelectedOnly);
        normalized.e2Characters=Array.isArray(normalized.e2Characters)?[...new Set(normalized.e2Characters.map(String).filter(v=>/^\d+$/.test(v)))]:[];
        delete normalized.e2WarningMinutes;
        normalized.lootSoundEnabled = ctx.normalizeBoolean(normalized.lootSoundEnabled);
        for(const key of ['noticeHeros','noticeKolos','noticeTytan'])normalized[key]=ctx.normalizeBoolean(normalized[key]);
        normalized.heroCallMode=normalized.heroCallMode==='confirm'?'confirm':'auto';
        normalized.heroNoticeChannel=normalized.heroNoticeChannel==='CLAN'?'CLAN':'GLOBAL';
        normalized.heroNoticesEnabled=ctx.normalizeBoolean(normalized.heroNoticesEnabled);
        normalized.heroNoticeTemplate=String(normalized.heroNoticeTemplate ?? ctx.defaultSettings.heroNoticeTemplate).slice(0,300);
        if(normalized.heroNoticeTemplate==='Znaleziono: {POTWOR} — {MAPA} ({KOORDY})')normalized.heroNoticeTemplate=ctx.defaultSettings.heroNoticeTemplate;
        normalized.enabled = ctx.normalizeBoolean(normalized.enabled);
        normalized.color1 = ctx.normalizeHexColor( normalized.color1, ctx.defaultSettings.color1 );
        normalized.color2 = ctx.normalizeHexColor( normalized.color2, ctx.defaultSettings.color2 );
        normalized.color3 = ctx.normalizeHexColor( normalized.color3, ctx.defaultSettings.color3 );
        {
            const requestedGlowStyle = Number(normalized.glowStyle);
            normalized.glowStyle = [ ctx.STYLE_CLASSIC, ctx.STYLE_NEON_80S, ctx.STYLE_INNER_AURA ].includes(requestedGlowStyle)
                    ? requestedGlowStyle
                    : ctx.STYLE_CLASSIC;
        }
        normalized.dropMode = normalized.dropMode === ctx.DROP_MODE_LEGENDARY
                ? ctx.DROP_MODE_LEGENDARY
                : ctx.DROP_MODE_NORMAL;
        const effect = Number(normalized.effect);
        normalized.effect = Number.isInteger(effect) && effect >= ctx.EFFECT_NONE && effect <= ctx.EFFECT_MOVING_COLORS
                ? effect
                : ctx.EFFECT_PULSE;
        if ( normalized.glowStyle === ctx.STYLE_INNER_AURA && normalized.effect === ctx.EFFECT_MOVING_COLORS ) {
            normalized.effect = ctx.EFFECT_NONE;
        }
        const scaleKeys = [ 'glow1', 'glow2', 'glow3', 'opacity1', 'opacity2', 'opacity3', 'width1', 'width2', 'width3' ];
        scaleKeys.forEach(key => {
            const value = Number(normalized[key]);
            if (!Number.isFinite(value)) {
                normalized[key] = ctx.defaultSettings[key];
                return;
            }
            const innerAuraMapWidth = key === 'width1' && normalized.glowStyle === ctx.STYLE_INNER_AURA;
            if (innerAuraMapWidth) {
                normalized[key] = Math.max( 0, Math.min( ctx.INNER_AURA_MAP_WIDTH_MAX, Math.round(value) ) );
                return;
            }
            normalized[key] = value > 5
                    ? Math.max( 0, Math.min( 5, Math.round(value / 2) ) )
                    : Math.max( 0, Math.min(5, Math.round(value)) );
        });
        normalized.pulse = Math.max( 0, Math.min( 5, Math.round(Number(normalized.pulse) || 0) ) );
        normalized.sound = Math.max( 0, Math.min( 30, Math.round(Number(normalized.sound) || 0) ) );
        normalized.volume = Math.max( 0, Math.min( 5, Math.round(Number(normalized.volume) || 0) ) );
        {
            const validItemFrameSets = ctx.VALID_FRAME_SETS;
            const requestedItemFrameSet = Number(normalized.itemFrameSet) || 1;
            normalized.itemFrameSet = validItemFrameSets.includes(requestedItemFrameSet)
                    ? requestedItemFrameSet
                    : 1;
            const requestedItemTipSet = Number(normalized.itemTipSet);
            normalized.itemTipSet = requestedItemTipSet === 0 || validItemFrameSets.includes(requestedItemTipSet)
                    ? requestedItemTipSet
                    : 0;
        }
        {
            const validTipFonts = ctx.VALID_TIP_FONTS;
            normalized.itemTipFont = validTipFonts.includes(normalized.itemTipFont)
                    ? normalized.itemTipFont
                    : 'default';
        }
        normalized.upgradeBadgeStyle = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(Number(normalized.upgradeBadgeStyle))
                ? Number(normalized.upgradeBadgeStyle)
                : 1;
        normalized.chatMessageTemplate = typeof normalized.chatMessageTemplate === 'string'
                ? normalized.chatMessageTemplate .replace(/\u00a0/g, ' ') .slice(0, 240)
                : ctx.defaultSettings.chatMessageTemplate;
        [ 'itemFramesEnabled', 'overrideGameItemFrames', 'frameCommon', 'frameUnique', 'frameHeroic', 'frameUpgraded', 'frameLegendary', 'upgradeBadgeEnabled',
            'upgradeBadgeSyncRarityColor', 'itemTipsEnabled', 'itemTipTextColors', 'itemTipOuterGlow', 'tipUnique', 'tipHeroic', 'tipUpgraded', 'tipLegendary',
            'chatAnnouncementsEnabled', 'chatEmoticonsEnabled' ].forEach(key => {
            normalized[key] = ctx.normalizeBoolean(normalized[key]);
        });
        return normalized;
    };
ctx.loadSettings = function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(ctx.STORAGE_KEY));
            return { ...ctx.defaultSettings, ...saved };
        } catch {
            return { ...ctx.defaultSettings };
        }
    };
ctx.getStyleSettingsSignature = function getStyleSettingsSignature() {
        return JSON.stringify({
            itemFramesEnabled: ctx.addonFeatureEnabled('itemFramesEnabled'), overrideGameItemFrames: ctx.settings.overrideGameItemFrames, itemFrameSet: ctx.settings.itemFrameSet,
            frameCommon: ctx.settings.frameCommon, frameUnique: ctx.settings.frameUnique, frameHeroic: ctx.settings.frameHeroic, frameUpgraded: ctx.settings.frameUpgraded,
            frameLegendary: ctx.settings.frameLegendary, itemTipsEnabled: ctx.addonFeatureEnabled('itemTipsEnabled'), itemTipSet: ctx.settings.itemTipSet, itemTipTextColors: ctx.settings.itemTipTextColors,
            itemTipOuterGlow: ctx.settings.itemTipOuterGlow, itemTipFont: ctx.settings.itemTipFont, tipUnique: ctx.settings.tipUnique, tipHeroic: ctx.settings.tipHeroic,
            tipUpgraded: ctx.settings.tipUpgraded, tipLegendary: ctx.settings.tipLegendary
        });
    };
ctx.getBadgeSettingsSignature = function getBadgeSettingsSignature() {
        return JSON.stringify({
            upgradeBadgeEnabled: ctx.addonFeatureEnabled('upgradeBadgeEnabled'), upgradeBadgeStyle: ctx.settings.upgradeBadgeStyle, upgradeBadgeSyncRarityColor: ctx.settings.upgradeBadgeSyncRarityColor,
            itemFrameSet: ctx.settings.itemFrameSet
        });
    };
ctx.getGlowSettingsSignature = function getGlowSettingsSignature() {
        return JSON.stringify({
            enabled: ctx.addonFeatureEnabled('enabled'), dropMode: ctx.settings.dropMode, glowStyle: ctx.settings.glowStyle, color1: ctx.settings.color1, color2: ctx.settings.color2, color3: ctx.settings.color3,
            glow1: ctx.settings.glow1, glow2: ctx.settings.glow2, glow3: ctx.settings.glow3, opacity1: ctx.settings.opacity1, opacity2: ctx.settings.opacity2, opacity3: ctx.settings.opacity3,
            width1: ctx.settings.width1, width2: ctx.settings.width2, width3: ctx.settings.width3, effect: ctx.settings.effect, pulse: ctx.settings.pulse
        });
    };
ctx.getChatEmoteSettingsSignature = function getChatEmoteSettingsSignature() {
        return String(ctx.addonFeatureEnabled('chatEmoticonsEnabled'));
    };
ctx.captureSettingsSignatures = function captureSettingsSignatures() {
        ctx.lastStyleSettingsSignature = ctx.getStyleSettingsSignature();
        ctx.lastBadgeSettingsSignature = ctx.getBadgeSettingsSignature();
        ctx.lastGlowSettingsSignature = ctx.getGlowSettingsSignature();
        ctx.lastChatEmoteSettingsSignature = ctx.getChatEmoteSettingsSignature();
    };
ctx.applyChangedSettings = function applyChangedSettings() {
        ctx.settingsApplyQueued = false;
        const styleSignature = ctx.getStyleSettingsSignature();
        const badgeSignature = ctx.getBadgeSettingsSignature();
        const glowSignature = ctx.getGlowSettingsSignature();
        const chatEmoteSignature = ctx.getChatEmoteSettingsSignature();
        if ( ctx.lastStyleSettingsSignature === null || styleSignature !== ctx.lastStyleSettingsSignature ) {
            ctx.updateDynamicStyles();
            ctx.lastStyleSettingsSignature = styleSignature;
        }
        if ( ctx.lastBadgeSettingsSignature === null || badgeSignature !== ctx.lastBadgeSettingsSignature ) {
            ctx.syncUpgradeBadges();
            ctx.lastBadgeSettingsSignature = badgeSignature;
        }
        if ( ctx.lastGlowSettingsSignature === null || glowSignature !== ctx.lastGlowSettingsSignature ) {
            ctx.updateLootWindows();
            ctx.lastGlowSettingsSignature = glowSignature;
        }
        if ( ctx.lastChatEmoteSettingsSignature === null || chatEmoteSignature !== ctx.lastChatEmoteSettingsSignature ) {
            ctx.refreshChatEmoticons();
            ctx.lastChatEmoteSettingsSignature = chatEmoteSignature;
        }
    };
ctx.saveSettings = function saveSettings() {
        let saved = true;
        try { localStorage.setItem(ctx.STORAGE_KEY, JSON.stringify(ctx.settings)); }
        catch (error) { saved = false; console.warn('[Shacal] Nie udało się zapisać ustawień:', error); }
        if (!ctx.settingsApplyQueued) {
            ctx.settingsApplyQueued = true;
            requestAnimationFrame(ctx.applyChangedSettings);
        }
        return saved;
    };
ctx.clampLevel = function clampLevel(value) {
        return Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
    };
ctx.clampInnerAuraMapWidth = function clampInnerAuraMapWidth(value) {
        return Math.max( 0, Math.min( ctx.INNER_AURA_MAP_WIDTH_MAX, Number(value) || 0 ) );
    };
ctx.internalLevel = function internalLevel(value) {
        return ctx.clampLevel(value) * 2;
    };
ctx.opacityLevel = function opacityLevel(value) {
        const level = ctx.internalLevel(value);
        if (level === 0) return 0;
        const table = [ 0.00, 0.06, 0.10, 0.16, 0.24, 0.34, 0.47, 0.62, 0.77, 0.90, 1.00 ];
        return table[level];
    };
ctx.hexToRgba = function hexToRgba(hex, alpha) {
        let value = String(hex || '').replace('#', '').trim();
        if (value.length === 3) {
            value = value.split('').map(ch => ch + ch).join('');
        }
        if (!/^[0-9a-fA-F]{6}$/.test(value)) {
            return `rgba(255,255,255,${alpha})`;
        }
        const r = parseInt(value.slice(0, 2), 16);
        const g = parseInt(value.slice(2, 4), 16);
        const b = parseInt(value.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    };},init(ctx){ctx.settings = ctx.normalizeSettings(ctx.loadSettings());
ctx.settingsApplyQueued = false;
ctx.lastStyleSettingsSignature = null;
ctx.lastBadgeSettingsSignature = null;
ctx.lastGlowSettingsSignature = null;
ctx.lastChatEmoteSettingsSignature = null;
ctx.style = document.createElement('style');
ctx.style.id = 'shacal-legendary-glow-style';
document.head.appendChild(ctx.style);
ctx.soundedItems = new WeakSet();
ctx.activeLootSounds = new Set();}});
runtime.registerPart("core/styles-and-loot.js", {declare(ctx){ctx.updateDynamicStyles = function updateDynamicStyles() {
        ctx.style.textContent = [
            ctx.buildTipFontImportCss(), ctx.SHACAL_PANEL_CSS, ctx.SHACAL_GAME_CSS, ctx.SHACAL_COMPACT_CSS, ctx.SHACAL_BORDER_CSS, ctx.SHACAL_CONTROLS_CSS, ctx.SHACAL_DRAG_CSS, ctx.SHACAL_HEADER_CSS, ctx.SHACAL_CAT_CSS, ctx.SHACAL_QUESTION_CSS,
            ctx.buildItemRarityFrameCss(), ctx.buildItemTipCss(), ctx.buildItemTipFontCss()
        ].join('\n');
    };
ctx.buildTipFontImportCss = function buildTipFontImportCss() {
        const families = {
            cinzel: 'Cinzel:wght@400;600;700', cormorant: 'Cormorant+Garamond:wght@400;600;700',
            vollkorn: 'Vollkorn:wght@400;600;700', spectral: 'Spectral:wght@400;600;700',
            bree: 'Bree+Serif', alegreya: 'Alegreya:wght@400;600;700', playfair: 'Playfair+Display:wght@400;600;700',
            grenze: 'Grenze+Gotisch:wght@400;600;700', lora: 'Lora:wght@400;600;700', merriweather: 'Merriweather:wght@400;700'
        };
        const family = families[ctx.settings.itemTipFont];
        return family ? '@import url("https://fonts.googleapis.com/css2?family=' + family + '&display=swap");' : '';
    };
ctx.isTargetLootWindow = function isTargetLootWindow(windowElement) {
        if (!windowElement) {
            return false;
        }
        const hasAnyItem = !!windowElement.querySelector( '.loot-window .items-wrapper .item, .item' );
        const hasLegendaryItem = !!windowElement.querySelector( '[data-frame-mania-rarity="legendary"], [data-item-type="t-leg"]' );
        if (ctx.settings.dropMode === ctx.DROP_MODE_LEGENDARY) {
            return hasLegendaryItem;
        }
        return hasAnyItem && !hasLegendaryItem;
    };
ctx.updateLootWindows = function updateLootWindows() {
        document.querySelectorAll('.loot-wnd').forEach(windowElement => {
            ctx.applyGlowToWindow(windowElement);
        });
        ctx.syncMapGlowOverlay();
    };},init(ctx){}});
runtime.registerPart("core/events-and-panel.js", {declare(ctx){ctx.queueUpgradeBadgeSync = function queueUpgradeBadgeSync() {
        if (ctx.upgradeBadgeSyncQueued) return;
        ctx.upgradeBadgeSyncQueued = true;
        requestAnimationFrame(() => {
            ctx.upgradeBadgeSyncQueued = false;
            ctx.syncUpgradeBadges();
        });
    };
ctx.queueLootWindowSync = function queueLootWindowSync() {
        if (ctx.lootWindowSyncQueued) return;
        ctx.lootWindowSyncQueued = true;
        requestAnimationFrame(() => {
            ctx.lootWindowSyncQueued = false;
            ctx.updateLootWindows();
        });
    };
ctx.queueLegendaryChatScan = function queueLegendaryChatScan() {
        if ( ctx.legendaryChatScanQueued || !ctx.addonFeatureEnabled('chatAnnouncementsEnabled') ) {
            return;
        }
        ctx.legendaryChatScanQueued = true;
        requestAnimationFrame(() => {
            ctx.legendaryChatScanQueued = false;
            ctx.scanLegendaryChatTracker();
        });
    };
ctx.nodeTouchesSelector = function nodeTouchesSelector(node, selector) {
        if (!(node instanceof Element)) {
            return false;
        }
        return !!( node.matches?.(selector) || node.querySelector?.(selector) );
    };
ctx.queueUpgradeBadgePositionSync = function queueUpgradeBadgePositionSync() {
        if (ctx.upgradeBadgePositionQueued) return;
        ctx.upgradeBadgePositionQueued = true;
        requestAnimationFrame(() => {
            ctx.upgradeBadgePositionQueued = false;
            for (const [element, badge] of ctx.upgradeBadgeOverlayMap.entries()) {
                if (element.isConnected && badge.isConnected) {
                    ctx.positionUpgradeBadgeOverlay(element, badge);
                }
            }
        });
    };
ctx.boostUpgradeBadgePositionSync = function boostUpgradeBadgePositionSync(duration = 500) {
        ctx.upgradeBadgeFastSyncUntil = Math.max( ctx.upgradeBadgeFastSyncUntil, performance.now() + duration );
    };
ctx.syncUpgradeBadgePositionsFrame = function syncUpgradeBadgePositionsFrame(now = performance.now()) {
        const fast = now < ctx.upgradeBadgeFastSyncUntil;
        const minInterval = fast
                ? 0
                : 120;
        if ( ctx.addonFeatureEnabled('upgradeBadgeEnabled') && ctx.upgradeBadgeOverlayMap.size > 0 && now - ctx.upgradeBadgeLastGeometrySync >= minInterval ) {
            ctx.upgradeBadgeLastGeometrySync = now;
            for (const [element, badge] of ctx.upgradeBadgeOverlayMap.entries()) {
                if ( !element.isConnected || !badge.isConnected ) {
                    badge.remove();
                    ctx.upgradeBadgeOverlayMap.delete(element);
            element.classList.remove('sg-upgrade-host','sg-upgrade-relative');
                    continue;
                }
                ctx.positionUpgradeBadgeOverlay(element, badge);
            }
        }
        requestAnimationFrame(ctx.syncUpgradeBadgePositionsFrame);
    };
ctx.prepareLegendaryItem = function prepareLegendaryItem(testWindow) {
        const item = testWindow.querySelector('.item');
        if (!item) return;
        item.setAttribute( 'data-frame-mania-rarity', 'legendary' );
        item.setAttribute( 'data-item-type', 't-leg' );
        const highlight = item.querySelector('.highlight');
        if (highlight) {
            highlight.classList.remove( 't-uni', 't-her', 't-upg' );
            highlight.classList.add('t-leg');
        }
    };
ctx.createLegendaryTestWindow = function createLegendaryTestWindow() {
        ctx.closeLegendaryTestWindow();
        const holder = document.createElement('div');
        holder.innerHTML = ctx.BUILTIN_LOOT_TEMPLATE.trim();
        const test = holder.firstElementChild;
        if (!test) return null;
        test.classList.add( 'shacal-test-loot-window', 'shacal-custom-glow' );
        test.style.position = 'absolute';
        test.style.display = 'block';
        test.style.zIndex = '999998';
        document.body.appendChild(test);
        const centerTestWindow = () => {
            const rect = test.getBoundingClientRect();
            test.style.left = Math.max( 0, (window.innerWidth - rect.width) / 2 ) + 'px';
            test.style.top = Math.max( 0, (window.innerHeight - rect.height) / 2 ) + 'px';
        };
        ctx.prepareLegendaryItem(test);
        const wantButton = test.querySelector('.button.want');
        const notButton = test.querySelector('.button.not');
        if (wantButton) {
            wantButton.addEventListener( 'click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    const wrapper = test.querySelector( '.loot-item-wrapper' );
                    if (wrapper) {
                        wrapper.dataset.state = 'want';
                    }
                } );
        }
        if (notButton) {
            notButton.addEventListener( 'click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    const wrapper = test.querySelector( '.loot-item-wrapper' );
                    if (wrapper) {
                        wrapper.dataset.state = 'not';
                    }
                } );
        }
        const closeTest = event => {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            ctx.stopLegendTestSound();
            ctx.closeLegendaryTestWindow();
        };
        const acceptButton = test.querySelector('.accept-button');
        const closeButton = test.querySelector('.close-button');
        if (acceptButton) {
            acceptButton.addEventListener( 'click', closeTest );
        }
        if (closeButton) {
            closeButton.addEventListener( 'click', closeTest );
        }
        requestAnimationFrame(() => {
            centerTestWindow();
            ctx.updateLootWindows();
            ctx.syncAllGlowOverlays();
            requestAnimationFrame(() => {
                centerTestWindow();
                ctx.syncAllGlowOverlays();
            });
        });
        return test;
    };
ctx.closeLegendaryTestWindow = function closeLegendaryTestWindow() {
        document .querySelectorAll('.shacal-test-loot-window') .forEach(el => el.remove());
    };
ctx.escapeHtml = function escapeHtml(value) {
        return String(value ?? '') .replace(/&/g, '&amp;') .replace(/</g, '&lt;') .replace(/>/g, '&gt;') .replace(/"/g, '&quot;') .replace(/'/g, '&#039;');
    };
ctx.enablePanelWheelScrolling = function enablePanelWheelScrolling(panel) {
        panel.addEventListener( 'wheel', event => {
                const target = event.target instanceof Element
                        ? event.target
                        : event.target?.parentElement;
                if (!target) {
                    return;
                }
                const emoteCatalog = target.closest('.shacal-emote-catalog');
                const tabBody = target.closest('.body.tab-content.active');
                const scrollTarget = emoteCatalog && panel.contains(emoteCatalog)
                        ? emoteCatalog
                        : tabBody && panel.contains(tabBody)
                            ? tabBody
                            : null;
                if (!scrollTarget) {
                    return;
                }
                const maxScroll = scrollTarget.scrollHeight - scrollTarget.clientHeight;
                if (maxScroll <= 0) {
                    return;
                }
                let delta = event.deltaY;
                if (event.deltaMode === 1) {
                    delta *= 28;
                } else if (event.deltaMode === 2) {
                    delta *= scrollTarget.clientHeight;
                }
                const previousScroll = scrollTarget.scrollTop;
                scrollTarget.scrollTop = Math.max( 0, Math.min( maxScroll, previousScroll + delta ) );
                if (scrollTarget.scrollTop !== previousScroll) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }, {
                passive: false, capture: true
            } );
    };
ctx.compareScriptVersions = function compareScriptVersions(a, b) {
        const left = String(a || '') .split('.') .map(part => Number.parseInt(part, 10) || 0);
        const right = String(b || '') .split('.') .map(part => Number.parseInt(part, 10) || 0);
        const length = Math.max(left.length, right.length);
        for (let i = 0; i < length; i += 1) {
            const l = left[i] || 0;
            const r = right[i] || 0;
            if (l > r) return 1;
            if (l < r) return -1;
        }
        return 0;
    };
ctx.readVersionFromUserscriptSource = function readVersionFromUserscriptSource(source) {
        const match = String(source || '').match( /^\s*\/\/\s*@version\s+([^\s]+)\s*$/m );
        return match?.[1] || null;
    };
ctx.applyShacalUpdateStateToUI = function applyShacalUpdateStateToUI() {
        const launcher = document.getElementById('shacal-lg-launcher');
        launcher?.classList.toggle( 'shacal-update-available', ctx.shacalUpdateState.available );
        const panel = document.getElementById('shacal-glow-panel');
        if (!panel) {
            return;
        }
        const button = panel.querySelector('#sg-update-check');
        const status = panel.querySelector('#sg-update-status');
        const version = panel.querySelector('#sg-current-version');
        if (version) {
            version.textContent = `v${ctx.SHACAL_SCRIPT_VERSION}`;
        }
        if (!button || !status) {
            return;
        }
        button.classList.toggle( 'is-checking', ctx.shacalUpdateState.checking );
        button.classList.toggle( 'is-available', ctx.shacalUpdateState.available );
        button.disabled = ctx.shacalUpdateState.checking;
        status.className = 'header-update-status';
        if (ctx.shacalUpdateState.checking) {
            button.textContent = 'SPRAWDZAM...';
            status.textContent = '';
            return;
        }
        if (ctx.shacalUpdateState.available) {
            button.textContent =
                `ZAINSTALUJ ${ctx.shacalUpdateState.remoteVersion}`;
            status.textContent = 'nowa wersja';
            status.classList.add('is-new');
            return;
        }
        button.textContent = 'SPRAWDŹ AKTUALIZACJE';
        if (ctx.shacalUpdateState.error) {
            status.textContent = 'błąd sprawdzania';
            status.title = ctx.shacalUpdateState.error;
            button.title =
                `Nie udało się sprawdzić aktualizacji: ${ctx.shacalUpdateState.error}`;
            status.classList.add('is-error');
            return;
        }
        status.title = '';
        button.title = 'Sprawdź dostępność nowej wersji Shacal Customizer';
        if (ctx.shacalUpdateState.checked) {
            status.textContent = 'masz najnowszą';
            status.classList.add('is-ok');
            return;
        }
        status.textContent = '';
    };
ctx.checkForShacalUpdate = async function checkForShacalUpdate(options = {}) {
        const {
            silent = false
        } = options;
        if (ctx.shacalUpdateCheckPromise) {
            return ctx.shacalUpdateCheckPromise;
        }
        ctx.shacalUpdateState.checking = true;
        ctx.shacalUpdateState.error = null;
        if (!silent) {
            ctx.applyShacalUpdateStateToUI();
        }
        ctx.shacalUpdateCheckPromise = (async () => {
            try {
                const separator = ctx.SHACAL_UPDATE_URL.includes('?')
                        ? '&'
                        : '?';
                const requestUrl =
                    `${ctx.SHACAL_UPDATE_URL}${separator}shacal_check=${Date.now()}`;
                const response = await new Promise((resolve, reject) => {
                    if (typeof GM_xmlhttpRequest !== 'function') {
                        reject( new Error('Brak GM_xmlhttpRequest') );
                        return;
                    }
                    GM_xmlhttpRequest({
                        method: 'GET', url: requestUrl, nocache: true, timeout: 8000, anonymous: true, onload: resolve, onerror: () => reject(
                                new Error('Błąd połączenia z GitHubem') ), ontimeout: () => reject( new Error('Przekroczono czas połączenia') )
                    });
                });
                if ( !response || response.status < 200 || response.status >= 300 ) {
                    throw new Error(
                        `HTTP ${response?.status || 0}`
                    );
                }
                const source = response.responseText || '';
                const remoteVersion = ctx.readVersionFromUserscriptSource(source);
                if (!remoteVersion) {
                    throw new Error( 'Brak @version w pliku aktualizacji' );
                }
                ctx.shacalUpdateState.remoteVersion = remoteVersion;
                ctx.shacalUpdateState.available = ctx.compareScriptVersions( remoteVersion, ctx.SHACAL_SCRIPT_VERSION ) > 0;
                ctx.shacalUpdateState.checked = true;
                ctx.shacalUpdateState.error = null;
                return {
                    available: ctx.shacalUpdateState.available, currentVersion: ctx.SHACAL_SCRIPT_VERSION, remoteVersion
                };
            } catch (error) {
                ctx.shacalUpdateState.checked = true;
                ctx.shacalUpdateState.available = false;
                ctx.shacalUpdateState.error = error instanceof Error
                        ? error.message
                        : String(error);
                return {
                    available: false, currentVersion: ctx.SHACAL_SCRIPT_VERSION, remoteVersion: null, error: ctx.shacalUpdateState.error
                };
            } finally {
                ctx.shacalUpdateState.checking = false;
                ctx.shacalUpdateCheckPromise = null;
                ctx.applyShacalUpdateStateToUI();
            }
        })();
        return ctx.shacalUpdateCheckPromise;
    };
ctx.openShacalUpdateInstaller = function openShacalUpdateInstaller() {
        // noopener can return null even when the new tab opened successfully.
        const link = document.createElement('a');
        link.href = ctx.SHACAL_UPDATE_URL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };
ctx.resetPanelDraftSettings = function resetPanelDraftSettings() {
        ctx.panelDraftSettings = ctx.normalizeSettings({ ...ctx.settings
            });
        ctx.panelDraftDirty = false;
    };
ctx.updateSaveButtonState = function updateSaveButtonState(panel) {
        const button = panel?.querySelector?.( '#sg-save-settings' );
        const testButton = panel?.querySelector?.( '#sg-test' );
        if (button) {
            button.classList.toggle( 'sg-save-pending', ctx.panelDraftDirty );
            button.textContent = ctx.panelDraftDirty
                    ? 'ZAPISZ ZMIANY'
                    : 'ZAPISZ';
        }
        if (testButton) {
            testButton.disabled = ctx.panelDraftDirty;
            testButton.title = ctx.panelDraftDirty
                    ? 'Najpierw zapisz zmiany'
                    : 'Otwórz podgląd ustawień';
        }
    };
ctx.markPanelDraftDirty = function markPanelDraftDirty(panel) {
        ctx.panelDraftDirty = true;
        ctx.updateSaveButtonState(panel);
    };
ctx.commitPanelDraftSettings = function commitPanelDraftSettings(panel) {
        const previousHeroMode=ctx.settings.heroCallMode;
        const wasHeroEnabled=ctx.addonFeatureEnabled('heroNoticesEnabled');
        const wasChatEnabled = ctx.addonFeatureEnabled('chatAnnouncementsEnabled');
        const position = {iconX: ctx.settings.iconX, iconY: ctx.settings.iconY};
        ctx.settings = ctx.normalizeSettings({...ctx.panelDraftSettings, ...position});
        if (ctx.addonFeatureEnabled('chatAnnouncementsEnabled') !== wasChatEnabled) {
            if (ctx.addonFeatureEnabled('chatAnnouncementsEnabled')) ctx.primeLegendaryChatTracker();
            else ctx.resetLegendaryChatTracker();
        }
        if(!ctx.addonFeatureEnabled('lootSoundEnabled'))ctx.stopAutomaticLootSounds();
        if(previousHeroMode!==ctx.settings.heroCallMode)ctx.cancelHeroNoticeJobs();
        ctx.pruneHeroCallQuestions();
        if(!ctx.addonFeatureEnabled('heroNoticesEnabled')){ctx.cancelHeroNoticeJobs();ctx.heroNoticeNodes.clear();}
        else if(!wasHeroEnabled)ctx.scheduleHeroNoticeScan();
        ctx.setHeroNoticeStatus(ctx.addonFeatureEnabled('heroNoticesEnabled') ? (ctx.settings.noticeHeros||ctx.settings.noticeKolos||ctx.settings.noticeTytan ? 'Wołacz jest włączony. Czeka na powiadomienie z gry.' : 'Wybierz przynajmniej jeden rodzaj potwora i zapisz.') : 'Wołacz jest wyłączony.');
        ctx.syncE2Relogger();
        const saved = ctx.saveSettings();
        ctx.panelDraftSettings = {...ctx.settings};
        ctx.panelDraftDirty = !saved;
        ctx.updateSaveButtonState(panel);
        const hint = panel?.querySelector('.sg-save-hint');
        if (hint) hint.textContent = saved ? 'Ustawienia zapisane. Zmiany są aktywne.' : 'Zmiany działają, ale nie udało się ich zapisać. Kliknij ZAPISZ ponownie.';
        const button = panel?.querySelector('#sg-save-settings');
        if (button && saved) {
            button.textContent = 'ZAPISANO ✓';
            setTimeout(() => { if (button.isConnected && !ctx.panelDraftDirty) button.textContent = 'ZAPISZ'; }, 900);
        }
    };
ctx.createPanel = function createPanel() {
        if (document.getElementById('shacal-glow-panel')) {
            return;
        }
        ctx.resetPanelDraftSettings();
        const panel = document.createElement('div');
        panel.id = 'shacal-glow-panel';
        panel.style.setProperty('--sg-lg-icon', `url("${ctx.LG_ICON_DATA}")`);
        panel.innerHTML = `
            <div class="header">
                <div class="brand-mark" aria-label="Shacal Customizer"></div>

                <div class="brand-copy">
                    <div class="brand-title">Shacal Customizer</div>
                    <div class="brand-subtitle">MARGONEM UI SUITE <span>•</span> by.Shacal</div>

                    <div class="brand-update-row">
                        <span id="sg-current-version" class="brand-version">v${ctx.SHACAL_SCRIPT_VERSION}</span>
                        <button
                            id="sg-update-check"
                            class="header-update-button"
                            type="button"
                            title="Sprawdź dostępność nowej wersji Shacal Customizer"
                        >SPRAWDŹ AKTUALIZACJE</button>
                        <span id="sg-update-status" class="header-update-status"></span>
                    </div>
                </div>

                <button
                    id="sg-panel-close" aria-label="Zamknij okno dodatku"
                    class="close-button"
                    type="button"
                    title="Zamknij"
                    aria-label="Zamknij okno"
                > <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3 13 13M13 3 3 13"/></svg></button>
            </div>

            <div class="panel-tabs">
                <button id="sg-tab-glow" class="panel-tab active" type="button">GLOW</button>
                <button id="sg-tab-frames" class="panel-tab" type="button">RAMKI</button>
                <button id="sg-tab-tips" class="panel-tab" type="button">DYMKI</button>
                <button id="sg-tab-chat" class="panel-tab" type="button">CZAT</button><button id="sg-tab-detector" class="panel-tab" type="button">WOŁACZ</button>
            </div>

            <div id="sg-tab-glow-content" class="body tab-content active">

                <div class="panel-section">
                    <div class="section-title">Podświetlenie</div>

                    <div class="master-row">
                        <div class="master-copy">
                            <span class="master-label">Poświata legendy</span>
                            <span class="hint">Włącza obramowanie łupu i mapy</span>
                        </div>

                        <input
                            id="sg-enabled"
                            type="checkbox"
                            ${ctx.panelDraftSettings.enabled ? 'checked' : ''}
                        >
                    </div>
                </div>

                <div class="panel-section drop-mode-section">
                    <div class="section-title">Tryb działania</div>

                    <div class="drop-mode-grid">
                        <label class="drop-mode-option">
                            <input
                                id="sg-mode-normal"
                                type="checkbox"
                                ${ctx.panelDraftSettings.dropMode === ctx.DROP_MODE_NORMAL ? 'checked' : ''}
                            >
                            <span>ZWYKŁY TEST</span>
                        </label>

                        <label class="drop-mode-option">
                            <input
                                id="sg-mode-legendary"
                                type="checkbox"
                                ${ctx.panelDraftSettings.dropMode === ctx.DROP_MODE_LEGENDARY ? 'checked' : ''}
                            >
                            <span>LEGENDARY</span>
                        </label>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Warstwy koloru</div>

                    <div class="channel-grid">

                        <div class="channel-card">
                            <div class="channel-head">
                                <div class="channel-name">
                                    <span class="channel-number">1</span>
                                    Warstwa główna
                                </div>

                                <input
                                    id="sg-color1"
                                    type="color"
                                    value="${ctx.panelDraftSettings.color1}"
                                    title="Kolor 1"
                                >
                            </div>

                            <div class="row">
                                <span>Siła</span>
                                <input
                                    id="sg-glow1"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.glow1}"
                                >
                                <span class="value" id="sg-glow1-value">${ctx.panelDraftSettings.glow1}</span>
                            </div>

                            <div class="row">
                                <span>Krycie</span>
                                <input
                                    id="sg-opacity1"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.opacity1}"
                                >
                                <span class="value" id="sg-opacity1-value">${ctx.panelDraftSettings.opacity1}</span>
                            </div>

                            <div class="row">
                                <span>Szerokość</span>
                                <input
                                    id="sg-width1"
                                    type="range"
                                    min="0"
                                    max="${Number(ctx.panelDraftSettings.glowStyle) === ctx.STYLE_INNER_AURA ? ctx.INNER_AURA_MAP_WIDTH_MAX : 5}"
                                    step="1"
                                    value="${ctx.panelDraftSettings.width1}"
                                >
                                <span class="value" id="sg-width1-value">${ctx.panelDraftSettings.width1}</span>
                            </div>
                        </div>

                        <div class="channel-card">
                            <div class="channel-head">
                                <div class="channel-name">
                                    <span class="channel-number">2</span>
                                    Warstwa środkowa
                                </div>

                                <input
                                    id="sg-color2"
                                    type="color"
                                    value="${ctx.panelDraftSettings.color2}"
                                    title="Kolor 2"
                                >
                            </div>

                            <div class="row">
                                <span>Siła</span>
                                <input
                                    id="sg-glow2"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.glow2}"
                                >
                                <span class="value" id="sg-glow2-value">${ctx.panelDraftSettings.glow2}</span>
                            </div>

                            <div class="row">
                                <span>Krycie</span>
                                <input
                                    id="sg-opacity2"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.opacity2}"
                                >
                                <span class="value" id="sg-opacity2-value">${ctx.panelDraftSettings.opacity2}</span>
                            </div>

                            <div class="row">
                                <span>Szerokość</span>
                                <input
                                    id="sg-width2"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.width2}"
                                >
                                <span class="value" id="sg-width2-value">${ctx.panelDraftSettings.width2}</span>
                            </div>
                        </div>

                        <div class="channel-card">
                            <div class="channel-head">
                                <div class="channel-name">
                                    <span class="channel-number">3</span>
                                    Warstwa zewnętrzna
                                </div>

                                <input
                                    id="sg-color3"
                                    type="color"
                                    value="${ctx.panelDraftSettings.color3}"
                                    title="Kolor 3"
                                >
                            </div>

                            <div class="row">
                                <span>Siła</span>
                                <input
                                    id="sg-glow3"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.glow3}"
                                >
                                <span class="value" id="sg-glow3-value">${ctx.panelDraftSettings.glow3}</span>
                            </div>

                            <div class="row">
                                <span>Krycie</span>
                                <input
                                    id="sg-opacity3"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.opacity3}"
                                >
                                <span class="value" id="sg-opacity3-value">${ctx.panelDraftSettings.opacity3}</span>
                            </div>

                            <div class="row">
                                <span>Szerokość</span>
                                <input
                                    id="sg-width3"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.width3}"
                                >
                                <span class="value" id="sg-width3-value">${ctx.panelDraftSettings.width3}</span>
                            </div>
                        </div>

                    </div>

                    <button
                        id="sg-random-colors"
                        class="random-colors-button"
                        type="button"
                    >
                        LOSOWE KOLORY
                    </button>
                </div>

                <div class="panel-section">
                    <div class="section-title">Wygląd i animacja</div>

                    <div class="control-grid">
                        <div class="control-card">
                            <span class="control-label">Styl obramowania</span>
                            <select id="sg-glow-style">
                                <option value="1" ${Number(ctx.panelDraftSettings.glowStyle) === 1 ? 'selected' : ''}>Klasyczna</option>
                                <option value="2" ${Number(ctx.panelDraftSettings.glowStyle) === 2 ? 'selected' : ''}>Neon 80s</option>
                                <option value="3" ${Number(ctx.panelDraftSettings.glowStyle) === 3 ? 'selected' : ''}>Inner Aura</option>
                            </select>
                        </div>

                        <div class="control-card">
                            <span class="control-label">Efekt</span>
                            <select id="sg-effect">
                                <option value="0" ${Number(ctx.panelDraftSettings.effect) === 0 ? 'selected' : ''}>Brak</option>
                                <option value="1" ${Number(ctx.panelDraftSettings.effect) === 1 ? 'selected' : ''}>Pulsowanie</option>
                                <option value="2" ${Number(ctx.panelDraftSettings.effect) === 2 ? 'selected' : ''}>Migotanie magii</option>
                                <option value="3" ${Number(ctx.panelDraftSettings.effect) === 3 ? 'selected' : ''}>Wędrujące kolory</option>
                            </select>
                        </div>

                        <div class="control-card wide">
                            <span class="control-label">Szybkość efektu</span>
                            <div class="row">
                                <span>Tempo</span>
                                <input
                                    id="sg-pulse"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.pulse}"
                                >
                                <span class="value" id="sg-pulse-value">${ctx.panelDraftSettings.pulse}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Dźwięk</div>

                    <label class="master-row" style="margin-bottom:14px">
                        <span class="master-copy"><span class="master-label">Własny dźwięk łupu</span><span class="hint">Wyłącz, aby Shacal nie odtwarzał sygnału łupu i korzystać z dźwięków innego dodatku.</span></span>
                        <input id="sg-loot-sound-enabled" type="checkbox" ${ctx.panelDraftSettings.lootSoundEnabled ? 'checked' : ''}>
                    </label>
                    <div class="sound-row">
                        <div class="control-card">
                            <span class="control-label">Dźwięki</span>
                            <select id="sg-sound">
                                <option value="0" ${Number(ctx.panelDraftSettings.sound) === 0 ? 'selected' : ''}>Brak</option>
                                <option value="1" ${Number(ctx.panelDraftSettings.sound) === 1 ? 'selected' : ''}>1 - New Level Unlocked</option>
                                <option value="2" ${Number(ctx.panelDraftSettings.sound) === 2 ? 'selected' : ''}>2 - Holy Spell Cast</option>
                                <option value="3" ${Number(ctx.panelDraftSettings.sound) === 3 ? 'selected' : ''}>3 - Fantasy SFX</option>
                                <option value="4" ${Number(ctx.panelDraftSettings.sound) === 4 ? 'selected' : ''}>4 - Chest + Coin</option>
                                <option value="5" ${Number(ctx.panelDraftSettings.sound) === 5 ? 'selected' : ''}>5 - Magic Level Up</option>
                                <option value="6" ${Number(ctx.panelDraftSettings.sound) === 6 ? 'selected' : ''}>6 - Epic Loot Drop</option>
                                <option value="7" ${Number(ctx.panelDraftSettings.sound) === 7 ? 'selected' : ''}>7 - Ogoliłem jaja</option>
                                <option value="8" ${Number(ctx.panelDraftSettings.sound) === 8 ? 'selected' : ''}>8 - Cześć cwelu</option>
                                <option value="9" ${Number(ctx.panelDraftSettings.sound) === 9 ? 'selected' : ''}>9 - 67 i do pieca</option>
                                <option value="10" ${Number(ctx.panelDraftSettings.sound) === 10 ? 'selected' : ''}>10 - Co to kurwa jest</option>
                                <option value="11" ${Number(ctx.panelDraftSettings.sound) === 11 ? 'selected' : ''}>11 - UwU Hannah</option>
                                <option value="12" ${Number(ctx.panelDraftSettings.sound) === 12 ? 'selected' : ''}>12 - O kurwa</option>
                                <option value="13" ${Number(ctx.panelDraftSettings.sound) === 13 ? 'selected' : ''}>13 - Intro Familiada</option>
                                <option value="14" ${Number(ctx.panelDraftSettings.sound) === 14 ? 'selected' : ''}>14 - Kids Saying Yay</option>
                                <option value="15" ${Number(ctx.panelDraftSettings.sound) === 15 ? 'selected' : ''}>15 - Anime Girl Voice</option>
                                <option value="16" ${Number(ctx.panelDraftSettings.sound) === 16 ? 'selected' : ''}>16 - SPAS-12</option>
                                <option value="17" ${Number(ctx.panelDraftSettings.sound) === 17 ? 'selected' : ''}>17 - Gejowski nurek</option>
                                <option value="18" ${Number(ctx.panelDraftSettings.sound) === 18 ? 'selected' : ''}>18 - Wow Anime Voice</option>
                            </select>
                        </div>

<div class="control-card"><span class="control-label">Kocie Dźwięki</span><select id="sg-cat-sound"><option value="0">Brak</option><option value="19" ${Number(ctx.panelDraftSettings.sound) === 19 ? 'selected' : ''}>What Cat</option><option value="20" ${Number(ctx.panelDraftSettings.sound) === 20 ? 'selected' : ''}>Cats Arguing</option><option value="21" ${Number(ctx.panelDraftSettings.sound) === 21 ? 'selected' : ''}>Club Cat</option><option value="22" ${Number(ctx.panelDraftSettings.sound) === 22 ? 'selected' : ''}>No No No Cat</option><option value="23" ${Number(ctx.panelDraftSettings.sound) === 23 ? 'selected' : ''}>Meow Ride</option><option value="24" ${Number(ctx.panelDraftSettings.sound) === 24 ? 'selected' : ''}>Alien Cat</option><option value="25" ${Number(ctx.panelDraftSettings.sound) === 25 ? 'selected' : ''}>Cat Rap</option><option value="26" ${Number(ctx.panelDraftSettings.sound) === 26 ? 'selected' : ''}>Evil Cat</option><option value="27" ${Number(ctx.panelDraftSettings.sound) === 27 ? 'selected' : ''}>Allo Cat</option><option value="28" ${Number(ctx.panelDraftSettings.sound) === 28 ? 'selected' : ''}>Happy Happy</option><option value="29" ${Number(ctx.panelDraftSettings.sound) === 29 ? 'selected' : ''}>Sad Cat 2</option><option value="30" ${Number(ctx.panelDraftSettings.sound) === 30 ? 'selected' : ''}>Sad Cat</option></select></div>
                        <div class="control-card">
                            <span class="control-label">Głośność</span>
                            <div class="row" style="grid-template-columns:1fr 28px;">
                                <input
                                    id="sg-volume"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value="${ctx.panelDraftSettings.volume}"
                                >
                                <span class="value" id="sg-volume-value">${ctx.panelDraftSettings.volume}</span>
                            </div>
                        </div>
                    </div>
                </div>

<div class="sg-sound-preview"><button id="sg-sound-listen" type="button">▶ ODSŁUCH WYBRANEGO</button><button id="sg-sound-stop" type="button">■ STOP</button><span class="hint">Wybierz jeden sygnał z dowolnej grupy. Zapisz, aby używać go przy łupie.</span></div>
                <div class="panel-section">
                    <div class="test-zone">
                        <div class="test-copy">
                            <span class="test-title">Podgląd ustawień</span>
                            <span class="test-desc">Otwórz przykładowe okno łupu i odtwórz dźwięk.</span>
                        </div>

                        <button id="sg-test" type="button">
                            TEST
                        </button>
                    </div>
                </div>

            </div>

            <div id="sg-tab-frames-content" class="body tab-content">
                <div class="panel-section">
                    <div class="section-title">Ramki przedmiotów</div>
                    <div class="master-row">
                        <div class="master-copy">
                            <span class="master-label">Własne ramki rang</span>
                            <span class="hint">Wybierz styl ramek dla rang przedmiotów</span>
                        </div>
                        <input id="sg-item-frames-enabled" type="checkbox" ${ctx.panelDraftSettings.itemFramesEnabled ? 'checked' : ''}>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Zgodność z ramkami gry</div>
                    <div class="master-switch">
                        <div class="master-copy">
                            <span class="master-label">Nadpisuj ramki gry</span>
                            <span class="hint">Wyłącz, aby zachować natywne ramki Margonem lub ramki z innych dodatków</span>
                        </div>
                        <input id="sg-override-game-item-frames" type="checkbox" ${ctx.panelDraftSettings.overrideGameItemFrames ? 'checked' : ''}>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Styl ramki</div>
                    <div class="control-card wide">
                        <span class="control-label">Preset</span>
                        <select id="sg-item-frame-set">
                            <option value="1" ${Number(ctx.panelDraftSettings.itemFrameSet) === 1 ? 'selected' : ''}>1 - Classic Glow</option>
                                                    <option value="2" ${Number(ctx.panelDraftSettings.itemFrameSet) === 2 ? 'selected' : ''}>2 - Shadowbound</option>
                                                    <option value="3" ${Number(ctx.panelDraftSettings.itemFrameSet) === 3 ? 'selected' : ''}>3 - Crystal Veil</option>
                                                    <option value="7" ${Number(ctx.panelDraftSettings.itemFrameSet) === 7 ? 'selected' : ''}>4 - Royal Crest</option>
                                                    <option value="8" ${Number(ctx.panelDraftSettings.itemFrameSet) === 8 ? 'selected' : ''}>5 - Hexed Edge</option>
                                                    <option value="9" ${Number(ctx.panelDraftSettings.itemFrameSet) === 9 ? 'selected' : ''}>6 - Clean Line</option>
                                                    <option value="11" ${Number(ctx.panelDraftSettings.itemFrameSet) === 11 ? 'selected' : ''}>7 - Emberglass</option>
                                                    <option value="12" ${Number(ctx.panelDraftSettings.itemFrameSet) === 12 ? 'selected' : ''}>8 - Abyssal Forge</option>
                                                    <option value="13" ${Number(ctx.panelDraftSettings.itemFrameSet) === 13 ? 'selected' : ''}>9 - Prismheart</option>
                                                    <option value="14" ${Number(ctx.panelDraftSettings.itemFrameSet) === 14 ? 'selected' : ''}>10 - Sovereign Core</option>
                                                    <option value="17" ${Number(ctx.panelDraftSettings.itemFrameSet) === 17 ? 'selected' : ''}>11 - Nightfall</option>
                                                    <option value="18" ${Number(ctx.panelDraftSettings.itemFrameSet) === 18 ? 'selected' : ''}>12 - Void Ember</option>
                                                    <option value="19" ${Number(ctx.panelDraftSettings.itemFrameSet) === 19 ? 'selected' : ''}>13 - Blackthorn</option>
                                                    <option value="20" ${Number(ctx.panelDraftSettings.itemFrameSet) === 20 ? 'selected' : ''}>14 - Crimson Oath</option>
                                                    <option value="21" ${Number(ctx.panelDraftSettings.itemFrameSet) === 21 ? 'selected' : ''}>15 - Infernal Crown</option>
                                                    <option value="22" ${Number(ctx.panelDraftSettings.itemFrameSet) === 22 ? 'selected' : ''}>16 - Molten Core</option>
                                                    <option value="23" ${Number(ctx.panelDraftSettings.itemFrameSet) === 23 ? 'selected' : ''}>17 - Blood Moon</option>
                                                    <option value="24" ${Number(ctx.panelDraftSettings.itemFrameSet) === 24 ? 'selected' : ''}>18 - Dragonfire</option>
                                                    <option value="25" ${Number(ctx.panelDraftSettings.itemFrameSet) === 25 ? 'selected' : ''}>19 - Toxic Flame</option>
                                                    <option value="26" ${Number(ctx.panelDraftSettings.itemFrameSet) === 26 ? 'selected' : ''}>20 - Royal Ember</option>
                                                    <option value="27" ${Number(ctx.panelDraftSettings.itemFrameSet) === 27 ? 'selected' : ''}>21 - Blood Eclipse</option>
                                                    <option value="28" ${Number(ctx.panelDraftSettings.itemFrameSet) === 28 ? 'selected' : ''}>22 - Arcane Glass</option>
                                                    <option value="29" ${Number(ctx.panelDraftSettings.itemFrameSet) === 29 ? 'selected' : ''}>23 - Arcane Stone</option>
                        </select>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Poziom ulepszenia</div>

                    <div class="master-row">
                        <div class="master-copy">
                            <span class="master-label">Oznaczenie na przedmiocie</span>
                            <span class="hint">Pokazuje poziom ulepszenia w rogu slotu</span>
                        </div>
                        <input id="sg-upgrade-badge-enabled" type="checkbox" ${ctx.panelDraftSettings.upgradeBadgeEnabled ? 'checked' : ''}>
                    </div>

                    <div class="control-card wide" style="margin-top:10px;">
                        <span class="control-label">Wygląd</span>
                        <select id="sg-upgrade-badge-style">
                            <option value="1" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 1 ? 'selected' : ''}>1 - Neon</option>
                            <option value="2" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 2 ? 'selected' : ''}>2 - Runiczny</option>
                            <option value="3" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 3 ? 'selected' : ''}>3 - Minimalny</option>
                            <option value="4" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 4 ? 'selected' : ''}>4 - Narożny</option>
                            <option value="5" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 5 ? 'selected' : ''}>5 - Ember</option>
                            <option value="6" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 6 ? 'selected' : ''}>6 - Toxic</option>
                            <option value="7" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 7 ? 'selected' : ''}>7 - Royal Gold</option>
                            <option value="8" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 8 ? 'selected' : ''}>8 - Crimson</option>
                            <option value="9" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 9 ? 'selected' : ''}>9 - Blood Moon</option>
                            <option value="10" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 10 ? 'selected' : ''}>10 - Frost</option>
                            <option value="11" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 11 ? 'selected' : ''}>11 - Void</option>
                            <option value="12" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 12 ? 'selected' : ''}>12 - Surowy</option>
                            <option value="13" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 13 ? 'selected' : ''}>13 - Cyber</option>
                            <option value="14" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 14 ? 'selected' : ''}>14 - Stalowy</option>
                            <option value="15" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 15 ? 'selected' : ''}>15 - Relikt</option>
                            <option value="16" ${Number(ctx.panelDraftSettings.upgradeBadgeStyle) === 16 ? 'selected' : ''}>16 - Czysty numer</option>
                        </select>
                    </div>

                    <div class="master-row" style="margin-top:10px;">
                        <div class="master-copy">
                            <span class="master-label">Kolor zgodny z rangą</span>
                            <span class="hint">Synchronizuje oznaczenie z kolorem wybranej ramki i rangi przedmiotu</span>
                        </div>
                        <input id="sg-upgrade-badge-sync-rarity" type="checkbox" ${ctx.panelDraftSettings.upgradeBadgeSyncRarityColor ? 'checked' : ''}>
                    </div>

                    <div class="frames-note">
                        Przedmiot bez ulepszenia nie ma oznaczenia. Gdy gra nada mu poziom ulepszenia, pojawia się 0, a kolejne poziomy pokazują odpowiednio 1, 2, 3 itd.
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Obsługiwane rangi</div>
                    <div class="rarity-list">
                        <label class="rarity-row common">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Zwykły - bez ramki</span><span class="rarity-code">common / t-norm</span></span>
                            <input id="sg-frame-common" type="checkbox" ${ctx.panelDraftSettings.frameCommon ? 'checked' : ''} disabled>
                        </label>
                        <label class="rarity-row unique">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Unikatowy</span><span class="rarity-code">unique / t-uniupg</span></span>
                            <input id="sg-frame-unique" type="checkbox" ${ctx.panelDraftSettings.frameUnique ? 'checked' : ''}>
                        </label>
                        <label class="rarity-row heroic">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Heroiczny</span><span class="rarity-code">heroic / t-her</span></span>
                            <input id="sg-frame-heroic" type="checkbox" ${ctx.panelDraftSettings.frameHeroic ? 'checked' : ''}>
                        </label>
                        <label class="rarity-row upgraded">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Ulepszony</span><span class="rarity-code">upgraded / t-upgraded</span></span>
                            <input id="sg-frame-upgraded" type="checkbox" ${ctx.panelDraftSettings.frameUpgraded ? 'checked' : ''}>
                        </label>
                        <label class="rarity-row legendary">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Legendarny</span><span class="rarity-code">legendary / t-leg</span></span>
                            <input id="sg-frame-legendary" type="checkbox" ${ctx.panelDraftSettings.frameLegendary ? 'checked' : ''}>
                        </label>
                        <div class="rarity-row artifact">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Artefakt</span><span class="rarity-code">identyfikator jeszcze nieznany</span></span>
                            <span class="rarity-pending">OCZEKUJE</span>
                        </div>
                    </div>

                </div>
            </div>

            <div id="sg-tab-tips-content" class="body tab-content">
                <div class="panel-section">
                    <div class="section-title">Dymki przedmiotów</div>
                    <div class="master-row">
                        <div class="master-copy">
                            <span class="master-label">Kolorystyczne obwódki dymków</span>
                            <span class="hint">Może działać razem z ramkami przedmiotów</span>
                        </div>
                        <input id="sg-item-tips-enabled" type="checkbox" ${ctx.panelDraftSettings.itemTipsEnabled ? 'checked' : ''}>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="master-row">
                        <div class="master-copy">
                            <span class="master-label">Kolor nazwy i rangi</span>
                            <span class="hint">Podmienia domyślne kolory gry na paletę wybranego dymku</span>
                        </div>
                        <input id="sg-item-tip-text-colors" type="checkbox" ${ctx.panelDraftSettings.itemTipTextColors ? 'checked' : ''}>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="master-row">
                        <div class="master-copy">
                            <span class="master-label">Poświata wokół dymku</span>
                            <span class="hint">Delikatna poświata w kolorze aktualnej ramki dymku</span>
                        </div>
                        <input id="sg-item-tip-outer-glow" type="checkbox" ${ctx.panelDraftSettings.itemTipOuterGlow ? 'checked' : ''}>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Czcionka dymku</div>
                    <div class="control-card wide">
                        <span class="control-label">Font</span>
                        <select id="sg-item-tip-font">
                            <option value="default" ${ctx.panelDraftSettings.itemTipFont === 'default' ? 'selected' : ''}>Domyślna gry</option>
                            <option value="cinzel" ${ctx.panelDraftSettings.itemTipFont === 'cinzel' ? 'selected' : ''}>Cinzel (fantasy / monumentalna)</option>
                            <option value="cormorant" ${ctx.panelDraftSettings.itemTipFont === 'cormorant' ? 'selected' : ''}>Cormorant Garamond (dark fantasy)</option>
                            <option value="vollkorn" ${ctx.panelDraftSettings.itemTipFont === 'vollkorn' ? 'selected' : ''}>Vollkorn (stara księga RPG)</option>
                            <option value="spectral" ${ctx.panelDraftSettings.itemTipFont === 'spectral' ? 'selected' : ''}>Spectral (elegancka / czytelna)</option>
                            <option value="bree" ${ctx.panelDraftSettings.itemTipFont === 'bree' ? 'selected' : ''}>Bree Serif (komiksowa / przygodowa)</option>
                            <option value="alegreya" ${ctx.panelDraftSettings.itemTipFont === 'alegreya' ? 'selected' : ''}>Alegreya (fantasy / opowieść)</option>
                            <option value="playfair" ${ctx.panelDraftSettings.itemTipFont === 'playfair' ? 'selected' : ''}>Playfair Display (królewska / arystokratyczna)</option>
                            <option value="grenze" ${ctx.panelDraftSettings.itemTipFont === 'grenze' ? 'selected' : ''}>Grenze Gotisch (gotycka / mroczna)</option>
                            <option value="lora" ${ctx.panelDraftSettings.itemTipFont === 'lora' ? 'selected' : ''}>Lora (kronika / klasyczne fantasy)</option>
                            <option value="merriweather" ${ctx.panelDraftSettings.itemTipFont === 'merriweather' ? 'selected' : ''}>Merriweather (ciężka / czytelna)</option>
                        </select>
                    </div>
                    <div class="frames-note">
                        Kroje dobrane są z obsługą polskich znaków. Są tu warianty fantasy, komiksowe, królewskie, gotyckie i bardziej klasyczne. Wybór działa na cały dymek, więc nazwa, ranga i statystyki pozostają typograficznie spójne.
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Zestaw dymku</div>
                    <div class="control-card wide">
                        <span class="control-label">Preset</span>
                        <select id="sg-item-tip-set">
                            <option value="0" ${Number(ctx.panelDraftSettings.itemTipSet) === 0 ? 'selected' : ''}>0 - Synchronizuj z ramkami</option>
                            <option value="1" ${Number(ctx.panelDraftSettings.itemTipSet) === 1 ? 'selected' : ''}>1 - Classic Glow</option>
                            <option value="2" ${Number(ctx.panelDraftSettings.itemTipSet) === 2 ? 'selected' : ''}>2 - Shadowbound</option>
                            <option value="3" ${Number(ctx.panelDraftSettings.itemTipSet) === 3 ? 'selected' : ''}>3 - Crystal Veil</option>
                            <option value="7" ${Number(ctx.panelDraftSettings.itemTipSet) === 7 ? 'selected' : ''}>4 - Royal Crest</option>
                            <option value="8" ${Number(ctx.panelDraftSettings.itemTipSet) === 8 ? 'selected' : ''}>5 - Hexed Edge</option>
                            <option value="9" ${Number(ctx.panelDraftSettings.itemTipSet) === 9 ? 'selected' : ''}>6 - Clean Line</option>
                            <option value="11" ${Number(ctx.panelDraftSettings.itemTipSet) === 11 ? 'selected' : ''}>7 - Emberglass</option>
                            <option value="12" ${Number(ctx.panelDraftSettings.itemTipSet) === 12 ? 'selected' : ''}>8 - Abyssal Forge</option>
                            <option value="13" ${Number(ctx.panelDraftSettings.itemTipSet) === 13 ? 'selected' : ''}>9 - Prismheart</option>
                            <option value="14" ${Number(ctx.panelDraftSettings.itemTipSet) === 14 ? 'selected' : ''}>10 - Sovereign Core</option>
                            <option value="17" ${Number(ctx.panelDraftSettings.itemTipSet) === 17 ? 'selected' : ''}>11 - Nightfall</option>
                            <option value="18" ${Number(ctx.panelDraftSettings.itemTipSet) === 18 ? 'selected' : ''}>12 - Void Ember</option>
                            <option value="19" ${Number(ctx.panelDraftSettings.itemTipSet) === 19 ? 'selected' : ''}>13 - Blackthorn</option>
                            <option value="20" ${Number(ctx.panelDraftSettings.itemTipSet) === 20 ? 'selected' : ''}>14 - Crimson Oath</option>
                            <option value="21" ${Number(ctx.panelDraftSettings.itemTipSet) === 21 ? 'selected' : ''}>15 - Infernal Crown</option>
                            <option value="22" ${Number(ctx.panelDraftSettings.itemTipSet) === 22 ? 'selected' : ''}>16 - Molten Core</option>
                            <option value="23" ${Number(ctx.panelDraftSettings.itemTipSet) === 23 ? 'selected' : ''}>17 - Blood Moon</option>
                            <option value="24" ${Number(ctx.panelDraftSettings.itemTipSet) === 24 ? 'selected' : ''}>18 - Dragonfire</option>
                            <option value="25" ${Number(ctx.panelDraftSettings.itemTipSet) === 25 ? 'selected' : ''}>19 - Toxic Flame</option>
                            <option value="26" ${Number(ctx.panelDraftSettings.itemTipSet) === 26 ? 'selected' : ''}>20 - Royal Ember</option>
                            <option value="27" ${Number(ctx.panelDraftSettings.itemTipSet) === 27 ? 'selected' : ''}>21 - Blood Eclipse</option>
                            <option value="28" ${Number(ctx.panelDraftSettings.itemTipSet) === 28 ? 'selected' : ''}>22 - Arcane Glass</option>
                            <option value="29" ${Number(ctx.panelDraftSettings.itemTipSet) === 29 ? 'selected' : ''}>23 - Arcane Stone</option>
                        </select>
                    </div>
                    <div class="frames-note">
                        Opcja „Synchronizuj z ramkami” automatycznie używa aktualnie wybranego zestawu ramek.
                        Możesz też wybrać osobny preset tylko dla dymków. Obwódka, subtelny glow oraz opcjonalnie kolor nazwy i rangi korzystają z tej samej palety. Układ i treść dymku pozostają bez zmian.
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Obsługiwane rangi dymków</div>
                    <div class="rarity-list">
                        <div class="rarity-row common">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Zwykły - bez zmian</span><span class="rarity-code">t-norm</span></span>
                            <span class="rarity-pending">NEUTRALNY</span>
                        </div>
                        <label class="rarity-row unique">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Unikatowy</span><span class="rarity-code">t-uniupg</span></span>
                            <input id="sg-tip-unique" type="checkbox" ${ctx.panelDraftSettings.tipUnique ? 'checked' : ''}>
                        </label>
                        <label class="rarity-row heroic">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Heroiczny</span><span class="rarity-code">t-her</span></span>
                            <input id="sg-tip-heroic" type="checkbox" ${ctx.panelDraftSettings.tipHeroic ? 'checked' : ''}>
                        </label>
                        <label class="rarity-row upgraded">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Ulepszony</span><span class="rarity-code">t-upgraded</span></span>
                            <input id="sg-tip-upgraded" type="checkbox" ${ctx.panelDraftSettings.tipUpgraded ? 'checked' : ''}>
                        </label>
                        <label class="rarity-row legendary">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Legendarny</span><span class="rarity-code">t-leg</span></span>
                            <input id="sg-tip-legendary" type="checkbox" ${ctx.panelDraftSettings.tipLegendary ? 'checked' : ''}>
                        </label>
                        <div class="rarity-row artifact">
                            <span class="rarity-swatch"></span>
                            <span class="rarity-copy"><span class="rarity-name">Artefakt</span><span class="rarity-code">identyfikator jeszcze nieznany</span></span>
                            <span class="rarity-pending">OCZEKUJE</span>
                        </div>
                    </div>
                </div>
            </div>

            <div id="sg-tab-chat-content" class="body tab-content">
                <div class="panel-section">
                    <div class="section-title">Emotikony czatu</div>
                    <div class="master-row">
                        <div class="master-copy">
                            <span class="master-label">Własne emotikony</span>
                            <span class="hint">Zamienia obsługiwane kody :nazwa: na małe emotikony tylko u osób z dodatkiem</span>
                        </div>
                        <input id="sg-chat-emoticons-enabled" type="checkbox" ${ctx.panelDraftSettings.chatEmoticonsEnabled ? 'checked' : ''}>
                    </div>
                    <div class="frames-note">
                        Dostępne emotki. Przewijaj listę kółkiem myszy lub paskiem po prawej stronie. Kliknięcie kafelka kopiuje kod do schowka. Osoba bez Shacal Customizera zobaczy kod tekstowy.
                    </div>

                    <div class="shacal-emote-catalog">
                        ${ctx.buildChatEmoticonCatalogHtml()}
                    </div>

                    <div id="sg-chat-emote-copy-status" class="shacal-emote-copy-status"></div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Ogłaszanie legend</div>
                    <div class="master-row">
                        <div class="master-copy">
                            <span class="master-label">Ogłaszaj legendy z okna łupu</span>
                            <span class="hint">Wysyła na GLOBAL po pojawieniu się legendy w oknie łupu, niezależnie od przydziału w grupie</span>
                        </div>
                        <input id="sg-chat-announcements-enabled" type="checkbox" ${ctx.panelDraftSettings.chatAnnouncementsEnabled ? 'checked' : ''}>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Treść wiadomości</div>
                    <textarea id="sg-chat-message-template" class="chat-template" maxlength="240" spellcheck="false">${ctx.escapeHtml(ctx.panelDraftSettings.chatMessageTemplate)}</textarea>
                    <div class="frames-note">
                        Wstaw <b>{ITEM}</b> tam, gdzie ma pojawić się link do legendy. Nie musisz wpisywać <b>/oo</b>; wiadomość trafi na kanał globalny. Jeśli usuniesz {ITEM}, link zostanie dodany na końcu.
                    </div>
                    <div id="sg-chat-preview" class="chat-preview"></div>
                </div>

                <div class="panel-section">
                    <div class="section-title">Test czatu</div>
                    <div class="test-zone">
                        <div class="test-copy">
                            <span class="test-title">Sprawdź wiadomość na czacie</span>
                            <span class="test-desc">Test użyje pierwszej legendy z ekwipunku i wyśle aktualny tekst na kanał globalny. Nie wpłynie to na późniejsze automatyczne ogłoszenie.</span>
                        </div>
                        <button id="sg-chat-test" type="button">TEST CZAT</button>
                    </div>
                    <button id="sg-chat-inspect" type="button" style="margin-top:12px">SPRAWDŹ EKWIPUNEK</button>
                    <div id="sg-chat-test-status" class="frames-note" style="margin-top:7px" role="status" aria-live="polite">Sprawdź wykrywanie przedmiotów lub wyślij test na GLOBAL.</div>
                </div>

            </div>
            <div id="sg-tab-detector-content" class="body tab-content">                <div class="panel-section">
                    <div class="section-title">Tryb wołania</div>
                    <label class="master-row"><span class="master-copy"><span class="master-label">Włącz wołacz potworów</span><span class="hint">Korzysta z powiadomień wbudowanego wykrywacza gry. Wybierz kanał i rodzaje potworów.</span></span><input id="sg-hero-enabled" type="checkbox" ${ctx.panelDraftSettings.heroNoticesEnabled?'checked':''}></label>
                    <div class="sg-call-mode" role="group" aria-label="Tryb wołania">
<label><input type="radio" name="sg-call-mode" value="auto" ${ctx.panelDraftSettings.heroCallMode==='auto'?'checked':''}><span>Automatyczne Wołanie<small>Wysyła wiadomość bez pytania.</small></span></label>
<label><input type="radio" name="sg-call-mode" value="confirm" ${ctx.panelDraftSettings.heroCallMode==='confirm'?'checked':''}><span>Okno Wołania<small>Pyta o zgodę przed wysłaniem.</small></span></label>
</div><label class="control-label" for="sg-hero-channel" style="margin-top:16px">Kanał ogłoszeń</label><select id="sg-hero-channel"><option value="GLOBAL" ${ctx.panelDraftSettings.heroNoticeChannel==='GLOBAL'?'selected':''}>Globalny /o</option><option value="CLAN" ${ctx.panelDraftSettings.heroNoticeChannel==='CLAN'?'selected':''}>Klanowy /k</option></select><div class="rarity-list" style="margin-top:16px">
<label class="master-row"><span>Herosi</span><input type="checkbox" id="sg-notice-Heros" ${ctx.panelDraftSettings.noticeHeros?'checked':''}></label>
<label class="master-row"><span>Kolosy</span><input type="checkbox" id="sg-notice-Kolos" ${ctx.panelDraftSettings.noticeKolos?'checked':''}></label>
<label class="master-row"><span>Tytani</span><input type="checkbox" id="sg-notice-Tytan" ${ctx.panelDraftSettings.noticeTytan?'checked':''}></label>
</div><label class="control-label" for="sg-hero-template" style="margin-top:14px">Treść ogłoszenia</label>
                    <textarea id="sg-hero-template" class="chat-template" maxlength="300">${ctx.escapeHtml(ctx.panelDraftSettings.heroNoticeTemplate)}</textarea>
                    <div class="frames-note">Wstaw {POTWOR}, aby dodać nazwę potwora, {TYP}, aby podać jego rodzaj, {MAPA}, aby dodać nazwę mapy, a {KOORDY}, aby podać współrzędne. O to samo znalezisko pytamy lub wołamy tylko raz do odświeżenia gry, także po wybraniu NIE.</div>
                    <div id="sg-hero-status" class="frames-note" role="status">Włącz opcję i zapisz ustawienia.</div>
                </div>
</div>
            <div class="sg-save-footer">
                <button
                    id="sg-save-settings"
                    class="sg-save-settings"
                    type="button"
                >ZAPISZ</button>

                <div class="sg-save-hint">
                    Zmiany obowiązują dopiero po zapisaniu.
                </div>
            </div>
        `;
        ctx.assemblePanelWorkspace(panel);
        document.body.appendChild(panel);
        panel .querySelector( '#sg-save-settings' ) .addEventListener( 'click', () => {
                    ctx.commitPanelDraftSettings( panel );
                } );
        ctx.updateSaveButtonState(panel);
        ctx.enablePanelWheelScrolling(panel);
        panel .querySelector('#sg-panel-close') .addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                panel.style.display = 'none';
            });
        panel .querySelector('#sg-update-check') .addEventListener('click', async event => {
                event.preventDefault();
                event.stopPropagation();
                if (ctx.shacalUpdateState.available) {
                    ctx.openShacalUpdateInstaller();
                    return;
                }
                await ctx.checkForShacalUpdate({
                    silent: false
                });
            });
        ctx.applyShacalUpdateStateToUI();
        ctx.bindPanel(panel);
        ctx.makeDraggable(panel);
    };},init(ctx){ctx.upgradeBadgeSyncQueued = false;
ctx.lootWindowSyncQueued = false;
ctx.legendaryChatScanQueued = false;
ctx.observer = new MutationObserver(mutations => {
        let shouldSyncUpgradeBadges = false;
        let shouldSyncLootWindows = false;
        let shouldScanLegendaryChat = false;
        for (const mutation of mutations) {
            if (mutation.type === 'characterData') {
                ctx.renderChatEmoticonsInTextNode(mutation.target);
                continue;
            }
            if (mutation.type === 'attributes') {
                const target = mutation.target instanceof Element
                        ? mutation.target
                        : null;
                if ( ['data-upgrade', 'data-item-type', 'data-frame-mania-rarity'].includes(mutation.attributeName) && target?.matches?.('.item') ) {
                    shouldSyncUpgradeBadges = true;
                }
                if ( target?.closest?.('.loot-wnd') && ( mutation.attributeName === 'data-frame-mania-rarity' || mutation.attributeName === 'data-item-type' ||
                        mutation.attributeName === 'data-frame-mania-upgrade' ) ) {
                    shouldSyncLootWindows = true;
                }
                if ( ctx.addonFeatureEnabled('chatAnnouncementsEnabled') && target?.matches?.('.item') && ( target.closest?.('.loot-wnd') || target.matches?.('.inventory-item') ) && (
                        mutation.attributeName === 'data-frame-mania-rarity' || mutation.attributeName === 'data-item-type' ) ) {
                    shouldScanLegendaryChat = true;
                }
                continue;
            }
            if (mutation.type !== 'childList') {
                continue;
            }
            const target = mutation.target instanceof Element
                    ? mutation.target
                    : mutation.target?.parentElement;
            const changedNodes = [ ...mutation.addedNodes, ...mutation.removedNodes ];
            const tooltipSelector = '.tip-wrapper.normal-tip[data-type="t_item"], ' + '.tip-wrapper.cmp-tip[data-type="t_item"]';
            const mutationInsideItemTooltip = !!target?.closest?.(tooltipSelector);
            const mutationIsOnlyItemTooltipNodes = changedNodes.length > 0 && changedNodes.every(node => {
                    const element = node instanceof Element
                            ? node
                            : node?.parentElement;
                    return !!( element?.matches?.(tooltipSelector) || element?.closest?.(tooltipSelector) );
                });
            if ( mutationInsideItemTooltip || mutationIsOnlyItemTooltipNodes ) {
                continue;
            }
            if ( !shouldSyncUpgradeBadges && changedNodes.some(node => ctx.nodeTouchesSelector( node, '.item[data-upgrade]' ) ) ) {
                shouldSyncUpgradeBadges = true;
            }
            if ( !shouldSyncLootWindows && ( target?.closest?.('.loot-wnd') || changedNodes.some(node => ctx.nodeTouchesSelector(node, '.loot-wnd') ) ) ) {
                shouldSyncLootWindows = true;
            }
            if ( ctx.addonFeatureEnabled('chatAnnouncementsEnabled') && !shouldScanLegendaryChat && ( target?.closest?.('.loot-wnd') || target?.closest?.('.inventory') ||
                    target?.matches?.('.inventory') || changedNodes.some(node => ctx.nodeTouchesSelector( node, '.loot-wnd .item, .inventory-item' ) ) ) ) {
                shouldScanLegendaryChat = true;
            }
            if (ctx.addonFeatureEnabled('chatEmoticonsEnabled')) {
                mutation.addedNodes.forEach(node => {
                    const element = node instanceof Element
                            ? node
                            : node?.parentElement;
                    if ( element?.closest?.( '.tip-wrapper.normal-tip, .tip-wrapper.cmp-tip' ) ) {
                        return;
                    }
                    ctx.renderChatEmoticonsInRoot(node);
                });
            }
        }
        if (shouldSyncUpgradeBadges) {
            ctx.queueUpgradeBadgeSync();
        }
        if (shouldSyncLootWindows) {
            ctx.queueLootWindowSync();
        }
        if (shouldScanLegendaryChat) {
            ctx.queueLegendaryChatScan();
        }
    });
ctx.observer.observe(document.body, {
        childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [ 'data-frame-mania-rarity', 'data-item-type', 'data-frame-mania-upgrade', 'data-upgrade' ]
    });
ctx.upgradeBadgePositionQueued = false;
window.addEventListener('resize', () => {
        ctx.boostUpgradeBadgePositionSync(600);
        ctx.queueUpgradeBadgePositionSync();
    }, {
        passive: true
    });
document.addEventListener('mouseover', event => {
        const target = event.target instanceof Element
                ? event.target.closest('.item')
                : null;
        if (!target) {
            return;
        }
        const previousItem = event.relatedTarget instanceof Element
                ? event.relatedTarget.closest('.item')
                : null;
        if (previousItem === target) {
            return;
        }
    }, {
        passive: true, capture: true
    });
document.addEventListener('mouseout', event => {
        const target = event.target instanceof Element
                ? event.target.closest('.item')
                : null;
        if (!target) {
            return;
        }
        const nextItem = event.relatedTarget instanceof Element
                ? event.relatedTarget.closest('.item')
                : null;
        if (nextItem === target) {
            return;
        }
    }, {
        passive: true, capture: true
    });
window.addEventListener('scroll', () => {
        ctx.boostUpgradeBadgePositionSync(350);
        ctx.queueUpgradeBadgePositionSync();
    }, {
        passive: true, capture: true
    });
ctx.upgradeBadgeFastSyncUntil = 0;
ctx.upgradeBadgeLastGeometrySync = 0;
document.addEventListener('pointerdown', () => {
        ctx.boostUpgradeBadgePositionSync(700);
    }, {
        passive: true, capture: true
    });
document.addEventListener('pointermove', event => {
        if (event.buttons) {
            ctx.boostUpgradeBadgePositionSync(260);
        }
    }, {
        passive: true, capture: true
    });
document.addEventListener('pointerup', () => {
        ctx.boostUpgradeBadgePositionSync(700);
    }, {
        passive: true, capture: true
    });
document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            ctx.boostUpgradeBadgePositionSync(700);
        }
    }, {
        passive: true, capture: true
    });
ctx.shacalUpdateState = {
        checking: false, checked: false, available: false, remoteVersion: null, error: null
    };
ctx.shacalUpdateCheckPromise = null;
ctx.panelDraftSettings = null;
ctx.panelDraftDirty = false;}});
runtime.registerPart("core/panel-settings.js", {declare(ctx){ctx.assemblePanelWorkspace = function assemblePanelWorkspace(panel) {
        const e2=document.createElement('div');e2.id='sg-tab-e2-content';e2.className='body tab-content';
        e2.innerHTML='<label style="display:block;margin:12px 0"><input id="sg-e2-enabled" type="checkbox"> Włącz podświetlanie E2</label><p>Kolor Mini oznacza początek przedziału respawnu. Gdy Max dojdzie do zera, postać przyjmie kolor Max. Dymki z odliczaniem możesz wyłączyć. Poświatą steruje tylko pierwsza wykryta E2, oznaczona w dymku kropką. Dymek pokazuje wszystkie aktywne liczniki postaci. Jeśli przy pierwszym uruchomieniu ma już kilka liczników, dodatek czeka na nowe, pojedyncze zabicie. To czas z minutnika, a nie potwierdzenie pojawienia się potwora.</p><label style="display:block;margin:18px 0"><input id="sg-e2-selected" type="checkbox"> Tylko wybrane postacie</label><div id="sg-e2-characters"></div><label style="display:block;margin:18px 0"><input id="sg-e2-tooltips" type="checkbox"> Pokaż dymki E2 po najechaniu</label><div style="display:flex;gap:24px;margin:18px 0"><label>Kolor Mini <input id="sg-e2-mini-color" type="color"></label><label>Kolor Max <input id="sg-e2-max-color" type="color"></label></div><button id="sg-e2-refresh" type="button">ODŚWIEŻ LISTĘ POSTACI</button><p id="sg-e2-status"></p>';
        panel.append(e2);
        const e2tab=document.createElement('button');e2tab.id='sg-tab-e2';e2tab.className='panel-tab';e2tab.type='button';e2tab.textContent='PRZELOGOWANIE';panel.querySelector('.panel-tabs').append(e2tab);
        for(const [id,key] of [['enabled','e2ReloggerEnabled'],['selected','e2SelectedOnly'],['tooltips','e2TooltipsEnabled']]){const el=e2.querySelector('#sg-e2-'+id);el.checked=ctx.panelDraftSettings[key];el.addEventListener('change',()=>{ctx.panelDraftSettings[key]=el.checked;ctx.markPanelDraftDirty(panel);});}
        for(const [id,key] of [['mini','e2MiniColor'],['max','e2MaxColor']]){const input=e2.querySelector('#sg-e2-'+id+'-color');input.value=ctx.panelDraftSettings[key];input.addEventListener('input',()=>{ctx.panelDraftSettings[key]=input.value;ctx.markPanelDraftDirty(panel);});}
        e2.querySelector('#sg-e2-refresh').addEventListener('click',()=>ctx.refreshE2Characters(panel));ctx.refreshE2Characters(panel);

        const workspace=document.createElement('div');workspace.className='sg-workspace sg-compact-workspace';
        const main = document.createElement('div'); main.className = 'sg-main';
        const tabs = panel.querySelector('.panel-tabs');
        const icons = ['<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>','<rect x="4" y="4" width="16" height="16"/><path d="M8 8h8v8H8z"/>','<path d="M4 5h16v12H9l-5 4Z"/><path d="M8 9h8m-8 4h5"/>','<path d="M3 4h18v13H9l-6 4Z"/><path d="M7 9h10m-10 4h6"/>'];
        tabs.querySelectorAll('button').forEach((button,i)=>{
            const icon=document.createElement('span');icon.className='sg-nav-icon';icon.setAttribute('aria-hidden','true');
            icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(icons[i]||'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>')+'</svg>';
            button.prepend(icon);
        });
        tabs.querySelector('#sg-tab-tips').style.setProperty('display','none','important');
        tabs.querySelector('#sg-tab-frames').lastChild.textContent='RAMKI I DYMKI';
        const homeButton=document.createElement('button');homeButton.id='sg-tab-home';homeButton.className='panel-tab';homeButton.type='button';homeButton.textContent='DODATKI';tabs.prepend(homeButton);
        const home=document.createElement('div');home.id='sg-tab-home-content';home.className='body tab-content';
        const grid=document.createElement('div');grid.className='sg-addon-grid';
        for(const addon of ctx.SHACAL_ADDONS){
            const enabled=ctx.panelDraftSettings['addon_'+addon.id]!==false;
            const card=document.createElement('article');card.className='sg-addon-card'+(enabled?'':' sg-addon-off');
            card.innerHTML='<h3>'+addon.name+'</h3><p>'+addon.description+'</p><div class="sg-addon-actions"><label><input type="checkbox" data-addon-switch="'+addon.id+'" '+(enabled?'checked':'')+'><span class="sg-addon-state">'+(enabled?'Włączony':'Wyłączony')+'</span></label><button type="button" data-addon-open="'+addon.id+'">USTAWIENIA →</button></div>';
            grid.append(card);
        }
        home.append(grid);panel.append(home);
        for(const tab of ['frames','tips']){
            const nav=document.createElement('div');nav.className='sg-addon-subnav';
            nav.innerHTML='<button type="button" data-addon-open="frames">RAMKI I ULEPSZENIA</button><button type="button" data-addon-open="tips">DYMKI I SYNCHRONIZACJA</button>';
            panel.querySelector('#sg-tab-'+tab+'-content').prepend(nav);
        }
        const addonStyle=document.createElement('style');addonStyle.textContent='#shacal-glow-panel .sg-addon-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:4px}#shacal-glow-panel .sg-addon-card{padding:12px;border:1px solid #235c61;border-radius:10px;background:linear-gradient(135deg,#101f25,#100e1b);box-shadow:inset 0 1px #ffffff14}#shacal-glow-panel .sg-addon-card h3{margin:0 0 6px;color:#39f5d3;font-size:15px;letter-spacing:1px}#shacal-glow-panel .sg-addon-card p{min-height:30px;margin:6px 0;color:#b1bdc9;line-height:1.4}#shacal-glow-panel .sg-addon-actions{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px}#shacal-glow-panel .sg-addon-actions label{display:flex;align-items:center;gap:7px}#shacal-glow-panel .sg-addon-actions button,#shacal-glow-panel .sg-addon-subnav button{padding:9px;color:#bfffee;background:#13272e;border:1px solid #337c80;border-radius:5px;cursor:pointer}#shacal-glow-panel .sg-addon-actions button:active{transform:translateY(1px)}#shacal-glow-panel .sg-addon-off{border-color:#424550}#shacal-glow-panel .sg-addon-off h3{color:#a7adb8}#shacal-glow-panel .sg-addon-subnav{display:flex;gap:10px;margin-bottom:18px}#shacal-glow-panel .panel-tabs{grid-template-columns:repeat(6,minmax(0,1fr))}@media(max-width:600px){#shacal-glow-panel .sg-addon-grid{grid-template-columns:1fr}}';document.head.append(addonStyle);
        main.append(tabs);
        const heading=document.createElement('div');heading.className='sg-page-heading';heading.innerHTML='<small>USTAWIENIA EFEKTU</small><h2 id="sg-page-title">Poświata łupu</h2><p id="sg-page-description">Kolory, animacja i dźwięk zdobytego łupu.</p>';main.append(heading);
        panel.querySelectorAll('.body.tab-content').forEach(body=>main.append(body));
        workspace.append(main);panel.insertBefore(workspace,panel.querySelector('.sg-save-footer'));

        const transparency=document.createElement('label');transparency.className='sg-transparency';
        transparency.innerHTML='<span>Przezroczystość okna</span><input id="sg-panelTransparency" type="range" min="0" max="65" step="1"><output id="sg-transparency-value"></output>';
        panel.querySelector('.sg-save-footer').append(transparency);
        const paintRange=range=>{
            const min=Number(range.min)||0,max=Number(range.max)||100;
            const fill=max>min?Math.max(0,Math.min(100,(Number(range.value)-min)/(max-min)*100)):0;
            range.style.setProperty('--sg-range-fill',fill+'%');
        };
        panel.querySelectorAll('input[type=range]').forEach(paintRange);
        panel.addEventListener('input',event=>{if(event.target.matches('input[type=range]'))paintRange(event.target);});
        const slider=transparency.querySelector('input');slider.value=String(ctx.panelDraftSettings.panelTransparency);
        const refresh=()=>{const value=Number(slider.value);panel.style.opacity=String(1-value/100);const question=document.getElementById('sg-call-question');if(question)question.style.opacity=panel.style.opacity;transparency.querySelector('output').textContent=value+'%';};
        slider.addEventListener('input',()=>{ctx.panelDraftSettings.panelTransparency=Number(slider.value);ctx.markPanelDraftDirty(panel);refresh();});
        refresh();
        paintRange(slider);

    };
ctx.generateRandomGlowColors = function generateRandomGlowColors() {
        const baseHue = Math.floor(Math.random() * 360);
        const makeColor = hue => {
            const saturation = 84 + Math.floor(Math.random() * 13);
            const lightness = 48 + Math.floor(Math.random() * 13);
            const h = ((hue % 360) + 360) % 360 / 360;
            const s = saturation / 100;
            const l = lightness / 100;
            const hueToRgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5
                    ? l * (1 + s)
                    : l + s - l * s;
            const p = 2 * l - q;
            const r = hueToRgb(p, q, h + 1 / 3);
            const g = hueToRgb(p, q, h);
            const b = hueToRgb(p, q, h - 1 / 3);
            const toHex = value => Math.round(value * 255) .toString(16) .padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        };
        return [ makeColor(baseHue), makeColor(baseHue + 95 + Math.floor(Math.random() * 35)), makeColor(baseHue + 205 + Math.floor(Math.random() * 35)) ];
    };
ctx.bindPanel = function bindPanel(panel) {
        const glowTab = panel.querySelector('#sg-tab-glow');
        const framesTab = panel.querySelector('#sg-tab-frames');
        const tipsTab = panel.querySelector('#sg-tab-tips');
        const chatTab = panel.querySelector('#sg-tab-chat');
        const glowContent = panel.querySelector('#sg-tab-glow-content');
        const framesContent = panel.querySelector('#sg-tab-frames-content');
        const tipsContent = panel.querySelector('#sg-tab-tips-content');
        const chatContent = panel.querySelector('#sg-tab-chat-content');
        const setPanelTab = tab => {
            panel.querySelector('#sg-tab-home-content').classList.toggle('active',tab==='home');
            panel.querySelector('#sg-tab-home').classList.toggle('active',tab==='home');
            const glowActive = tab === 'glow';
            const framesActive = tab === 'frames';
            const tipsActive = tab === 'tips';
            const chatActive = tab === 'chat';
            glowTab.classList.toggle('active', glowActive);
            framesTab.classList.toggle('active', framesActive || tipsActive);
            tipsTab.classList.toggle('active', tipsActive);
            chatTab.classList.toggle('active', chatActive);
            glowContent.classList.toggle('active', glowActive);
            framesContent.classList.toggle('active', framesActive);
            tipsContent.classList.toggle('active', tipsActive);
            chatContent.classList.toggle('active', chatActive);
            panel.querySelector('#sg-tab-detector').classList.toggle('active',tab==='detector');
            panel.querySelector('#sg-tab-detector-content').classList.toggle('active',tab==='detector');
            panel.querySelector('#sg-tab-e2').classList.toggle('active',tab==='e2');
            panel.querySelector('#sg-tab-e2-content').classList.toggle('active',tab==='e2');
            if(tab==='e2')ctx.refreshE2Characters(panel);
            const labels = {home:['Twoje dodatki','Wybierz dodatek, ustaw jego opcje i zapisz zmiany.'],e2:['Przelogowanie','Respawn i podświetlenie postaci w oknie przelogowania.'],detector:['Wołacz potworów','Ogłoszenia z wbudowanego wykrywacza gry.'],glow: ['Poświata łupu', 'Kolory, animacja i dźwięk zdobytego łupu.'], frames: ['Ramki i dymki', 'Ramki przedmiotów oraz poziomy ulepszeń.'], tips: ['Ramki i dymki', 'Wygląd opisów i synchronizacja z ramkami.'], chat: ['Czat i ogłoszenia', 'Emotikony, wykrywanie legend i test wiadomości.']};
            panel.querySelector('#sg-page-title').textContent = labels[tab][0];
            panel.querySelector('#sg-page-description').textContent = labels[tab][1];
        };
        panel.querySelector('#sg-tab-home').addEventListener('click',()=>setPanelTab('home'));
        panel.querySelectorAll('[data-addon-open]').forEach(button=>button.addEventListener('click',()=>setPanelTab(button.dataset.addonOpen)));
        panel.querySelectorAll('[data-addon-switch]').forEach(input=>input.addEventListener('change',()=>{
            ctx.panelDraftSettings['addon_'+input.dataset.addonSwitch]=input.checked;
            input.closest('.sg-addon-card').classList.toggle('sg-addon-off',!input.checked);
            input.closest('.sg-addon-card').querySelector('.sg-addon-state').textContent=input.checked?'Włączony':'Wyłączony';
            ctx.markPanelDraftDirty(panel);
        }));
        setPanelTab('home');
        panel.querySelector('#sg-tab-e2').addEventListener('click',()=>setPanelTab('e2'));
        glowTab.addEventListener('click', () => setPanelTab('glow'));
        framesTab.addEventListener('click', () => setPanelTab('frames'));
        tipsTab.addEventListener('click', () => setPanelTab('tips'));
        chatTab.addEventListener('click', () => setPanelTab('chat'));
        panel.querySelector('#sg-tab-detector').addEventListener('click',()=>setPanelTab('detector'));
        for(const type of ['Heros','Kolos','Tytan'])panel.querySelector('#sg-notice-'+type).addEventListener('change',event=>{ctx.panelDraftSettings['notice'+type]=event.target.checked;ctx.markPanelDraftDirty(panel);});
        const bindFrameToggle = (selector, property) => {
            panel.querySelector(selector).addEventListener('change', event => {
                ctx.panelDraftSettings[property] = event.target.checked;
                ctx.markPanelDraftDirty(panel);
            });
        };
        bindFrameToggle('#sg-item-frames-enabled', 'itemFramesEnabled');
        bindFrameToggle('#sg-override-game-item-frames', 'overrideGameItemFrames');
        bindFrameToggle('#sg-frame-common', 'frameCommon');
        bindFrameToggle('#sg-frame-unique', 'frameUnique');
        bindFrameToggle('#sg-frame-heroic', 'frameHeroic');
        bindFrameToggle('#sg-frame-upgraded', 'frameUpgraded');
        bindFrameToggle('#sg-frame-legendary', 'frameLegendary');
        bindFrameToggle('#sg-upgrade-badge-enabled', 'upgradeBadgeEnabled');
        bindFrameToggle('#sg-upgrade-badge-sync-rarity', 'upgradeBadgeSyncRarityColor');
        panel .querySelector('#sg-upgrade-badge-style') .addEventListener('change', event => {
                const requestedStyle = Number(event.target.value);
                ctx.panelDraftSettings.upgradeBadgeStyle = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(requestedStyle)
                        ? requestedStyle
                        : 1;
                ctx.markPanelDraftDirty(panel);
            });
        bindFrameToggle('#sg-item-tips-enabled', 'itemTipsEnabled');
        bindFrameToggle('#sg-item-tip-text-colors', 'itemTipTextColors');
        bindFrameToggle('#sg-item-tip-outer-glow', 'itemTipOuterGlow');
        panel .querySelector('#sg-item-tip-font') .addEventListener('change', event => {
                const requestedFont = event.target.value;
                ctx.panelDraftSettings.itemTipFont = ['default', 'cinzel', 'cormorant', 'vollkorn', 'spectral', 'bree', 'alegreya', 'playfair', 'grenze', 'lora', 'merriweather']
                        .includes(requestedFont)
                        ? requestedFont
                        : 'default';
                ctx.markPanelDraftDirty(panel);
            });
        bindFrameToggle('#sg-tip-unique', 'tipUnique');
        bindFrameToggle('#sg-tip-heroic', 'tipHeroic');
        bindFrameToggle('#sg-tip-upgraded', 'tipUpgraded');
        bindFrameToggle('#sg-tip-legendary', 'tipLegendary');
        const chatEmoticonsInput = panel.querySelector('#sg-chat-emoticons-enabled');
        const chatEmoteCatalog = panel.querySelector('.shacal-emote-catalog');
        const chatEmoteCopyStatus = panel.querySelector('#sg-chat-emote-copy-status');
        const chatEnabledInput = panel.querySelector('#sg-chat-announcements-enabled');
        const chatTemplateInput = panel.querySelector('#sg-chat-message-template');
        const chatPreview = panel.querySelector('#sg-chat-preview');
        const chatTestButton = panel.querySelector('#sg-chat-test');
        panel.querySelectorAll('input[name="sg-call-mode"]').forEach(input=>input.addEventListener('change',()=>{if(input.checked){ctx.panelDraftSettings.heroCallMode=input.value;ctx.markPanelDraftDirty(panel);}}));
        panel.querySelector('#sg-hero-channel').addEventListener('change',event=>{ctx.panelDraftSettings.heroNoticeChannel=event.target.value==='CLAN'?'CLAN':'GLOBAL';ctx.markPanelDraftDirty(panel);});
        panel.querySelector('#sg-hero-enabled').addEventListener('change',event=>{ctx.panelDraftSettings.heroNoticesEnabled=event.target.checked;ctx.markPanelDraftDirty(panel);});
        panel.querySelector('#sg-hero-template').addEventListener('input',event=>{ctx.panelDraftSettings.heroNoticeTemplate=event.target.value;ctx.markPanelDraftDirty(panel);});
        if(ctx.addonFeatureEnabled('heroNoticesEnabled'))ctx.setHeroNoticeStatus('Wołacz jest włączony. Czeka na powiadomienie z gry.');
        const chatTestStatus = panel.querySelector('#sg-chat-test-status');
        const refreshChatPreview = () => {
            const raw = String(chatTemplateInput.value || '') .replace(/\u00a0/g, ' ');
            const preview = raw.includes('{ITEM}')
                ? raw.replace(/\{ITEM\}/g, '[LINK DO LEGENDY]')
                : `${raw.trim()}${raw.trim() ? ' ' : ''}[LINK DO LEGENDY]`;
            chatPreview.innerHTML = ctx.escapeHtml(preview) .replace(/\[LINK DO LEGENDY\]/g, '<strong>[LINK DO LEGENDY]</strong>');
        };
        chatEmoticonsInput?.addEventListener('change', event => {
            ctx.panelDraftSettings.chatEmoticonsEnabled = event.target.checked;
            ctx.markPanelDraftDirty(panel);
        });
        chatEmoteCatalog?.addEventListener('click', async event => {
            const item = event.target.closest('.shacal-emote-catalog-item');
            if (!item || !chatEmoteCatalog.contains(item)) {
                return;
            }
            const token = item.dataset.shacalEmoteToken || '';
            if (!token) return;
            let copied = false;
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(token);
                    copied = true;
                }
            } catch {}
            if (!copied) {
                try {
                    const helper = document.createElement('textarea');
                    helper.value = token;
                    helper.style.position = 'fixed';
                    helper.style.left = '-9999px';
                    helper.style.top = '-9999px';
                    document.body.appendChild(helper);
                    helper.focus();
                    helper.select();
                    copied = document.execCommand('copy');
                    helper.remove();
                } catch {}
            }
            if (chatEmoteCopyStatus) {
                chatEmoteCopyStatus.textContent = copied
                        ? `Skopiowano ${token}`
                        : `Kod: ${token}`;
                clearTimeout( chatEmoteCopyStatus._shacalTimer );
                chatEmoteCopyStatus._shacalTimer = setTimeout(() => {
                        if (chatEmoteCopyStatus) {
                            chatEmoteCopyStatus.textContent = '';
                        }
                    }, 1800);
            }
        });
        chatEnabledInput.addEventListener('change', event => {
            ctx.panelDraftSettings.chatAnnouncementsEnabled = event.target.checked;
            ctx.markPanelDraftDirty(panel);

        });
        chatTemplateInput.addEventListener('input', event => {
            ctx.panelDraftSettings.chatMessageTemplate = String(event.target.value || '') .replace(/\u00a0/g, ' ') .slice(0, 240);
            ctx.markPanelDraftDirty(panel);
            refreshChatPreview();
        });
        let chatTestBusy = false;
        panel.querySelector('#sg-chat-inspect')?.addEventListener('click', () => ctx.setLegendaryChatStatus(ctx.describeLegendaryInventory()));
        chatTestButton?.addEventListener('click', async () => {
            if (chatTestBusy) return;
            chatTestBusy = true;
            chatTestButton.disabled = true;
            ctx.setLegendaryChatStatus('Szukam pierwszej legendy i przygotowuję test...');
            try {
                const result = await ctx.testLegendaryChatAnnouncement(chatTemplateInput.value);
                ctx.setLegendaryChatStatus(result.message);
            } catch (error) {
                ctx.setLegendaryChatStatus('Test przerwany. Kliknij Sprawdź ekwipunek i spróbuj ponownie.');
                console.warn('[Shacal] Test czatu:', error);
            } finally {
                chatTestBusy = false;
                chatTestButton.disabled = false;
            }
        });
        refreshChatPreview();
        panel .querySelector('#sg-item-tip-set') .addEventListener('change', event => {
                const requestedTipSet = Number(event.target.value);
                ctx.panelDraftSettings.itemTipSet = requestedTipSet === 0 || ctx.VALID_FRAME_SETS
                        .includes(requestedTipSet)
                        ? requestedTipSet
                        : 0;
                ctx.markPanelDraftDirty(panel);
            });
        panel .querySelector('#sg-item-frame-set') .addEventListener('change', event => {
                const requestedFrameSet = Number(event.target.value) || 1;
                ctx.panelDraftSettings.itemFrameSet = ctx.VALID_FRAME_SETS .includes(requestedFrameSet)
                        ? requestedFrameSet
                        : 1;
                ctx.markPanelDraftDirty(panel);
            });
        const bind = ( selector, property, parser = value => value ) => {
            panel .querySelector(selector) .addEventListener('input', event => {
                    ctx.panelDraftSettings[property] = parser(event.target.value);
                    ctx.markPanelDraftDirty(panel);
                });
        };
        panel .querySelector('#sg-enabled') .addEventListener('change', event => {
                ctx.panelDraftSettings.enabled = event.target.checked;
                ctx.markPanelDraftDirty(panel);
            });
        const normalMode = panel.querySelector('#sg-mode-normal');
        const legendaryMode = panel.querySelector('#sg-mode-legendary');
        const setDropMode = mode => {
            ctx.panelDraftSettings.dropMode = mode;
            normalMode.checked = mode === ctx.DROP_MODE_NORMAL;
            legendaryMode.checked = mode === ctx.DROP_MODE_LEGENDARY;
            ctx.markPanelDraftDirty(panel);
        };
        normalMode.addEventListener('change', () => {
            if (!normalMode.checked) {
                normalMode.checked = ctx.panelDraftSettings.dropMode === ctx.DROP_MODE_NORMAL;
                return;
            }
            setDropMode(ctx.DROP_MODE_NORMAL);
        });
        legendaryMode.addEventListener('change', () => {
            if (!legendaryMode.checked) {
                legendaryMode.checked = ctx.panelDraftSettings.dropMode === ctx.DROP_MODE_LEGENDARY;
                return;
            }
            setDropMode(ctx.DROP_MODE_LEGENDARY);
        });
        bind('#sg-color1', 'color1');
        bind('#sg-color2', 'color2');
        bind('#sg-color3', 'color3');
        panel .querySelector('#sg-random-colors') .addEventListener('click', () => {
                const [ color1, color2, color3 ] = ctx.generateRandomGlowColors();
                ctx.panelDraftSettings.color1 = color1;
                ctx.panelDraftSettings.color2 = color2;
                ctx.panelDraftSettings.color3 = color3;
                panel.querySelector('#sg-color1').value = color1;
                panel.querySelector('#sg-color2').value = color2;
                panel.querySelector('#sg-color3').value = color3;
                ctx.markPanelDraftDirty(panel);
            });
        const bindLevel = ( selector, property, valueSelector, maxResolver = () => 5 ) => {
            const input = panel.querySelector(selector);
            const value = panel.querySelector(valueSelector);
            input.addEventListener('input', event => {
                const max = Math.max( 0, Number(maxResolver()) || 5 );
                ctx.panelDraftSettings[property] = Math.max( 0, Math.min( max, Math.round( Number(event.target.value) || 0 ) ) );
                if (value) {
                    value.textContent = ctx.panelDraftSettings[property];
                }
                ctx.markPanelDraftDirty(panel);
            });
        };
        bindLevel('#sg-glow1', 'glow1', '#sg-glow1-value');
        bindLevel('#sg-glow2', 'glow2', '#sg-glow2-value');
        bindLevel('#sg-glow3', 'glow3', '#sg-glow3-value');
        bindLevel('#sg-opacity1', 'opacity1', '#sg-opacity1-value');
        bindLevel('#sg-opacity2', 'opacity2', '#sg-opacity2-value');
        bindLevel('#sg-opacity3', 'opacity3', '#sg-opacity3-value');
        bindLevel( '#sg-width1', 'width1', '#sg-width1-value', () => Number(ctx.panelDraftSettings.glowStyle) === ctx.STYLE_INNER_AURA
                    ? ctx.INNER_AURA_MAP_WIDTH_MAX
                    : 5 );
        bindLevel('#sg-width2', 'width2', '#sg-width2-value');
        bindLevel('#sg-width3', 'width3', '#sg-width3-value');
        const glowStyleSelect = panel.querySelector('#sg-glow-style');
        function updateGlowStyleUiState() {
            const style = Number( ctx.panelDraftSettings.glowStyle ) || ctx.STYLE_CLASSIC;
            const innerAura = style === ctx.STYLE_INNER_AURA;
            const width1Input = panel.querySelector('#sg-width1');
            const width1Value = panel.querySelector('#sg-width1-value');
            if (width1Input) {
                width1Input.max = String( innerAura
                            ? ctx.INNER_AURA_MAP_WIDTH_MAX
                            : 5 );
                if ( !innerAura && Number(ctx.panelDraftSettings.width1) > 5 ) {
                    ctx.panelDraftSettings.width1 = 5;
                    width1Input.value = '5';
                    if (width1Value) {
                        width1Value.textContent = '5';
                    }
                }
            }
            const channel2 = panel .querySelector('#sg-color2') ?.closest('.channel-card');
            const channel3 = panel .querySelector('#sg-color3') ?.closest('.channel-card');
            if (channel2) {
                channel2.style.display = innerAura ? 'none' : '';
            }
            if (channel3) {
                channel3.style.display = innerAura ? 'none' : '';
            }
            const randomColors = panel.querySelector( '#sg-random-colors' );
            if (randomColors) {
                randomColors.style.display = innerAura ? 'none' : '';
            }
            const movingColorsOption = panel .querySelector('#sg-effect') ?.querySelector( 'option[value="3"]' );
            if (movingColorsOption) {
                movingColorsOption.disabled = innerAura;
            }
            if ( innerAura && Number( ctx.panelDraftSettings.effect ) === ctx.EFFECT_MOVING_COLORS ) {
                ctx.panelDraftSettings.effect = ctx.EFFECT_NONE;
                const effectSelect = panel.querySelector( '#sg-effect' );
                if (effectSelect) {
                    effectSelect.value = String(ctx.EFFECT_NONE);
                }
            }
        }
        glowStyleSelect.addEventListener('change', event => {
            const requestedStyle = Number(event.target.value);
            ctx.panelDraftSettings.glowStyle = [ ctx.STYLE_CLASSIC, ctx.STYLE_NEON_80S, ctx.STYLE_INNER_AURA ].includes(requestedStyle)
                    ? requestedStyle
                    : ctx.STYLE_CLASSIC;
            updateGlowStyleUiState();
            ctx.markPanelDraftDirty(panel);
        });
        const effectSelect = panel.querySelector('#sg-effect');
        effectSelect.addEventListener('change', event => {
            let nextEffect = Math.max( 0, Math.min( ctx.EFFECT_MOVING_COLORS, Number( event.target.value ) || 0 ) );
            if ( Number( ctx.panelDraftSettings.glowStyle ) === ctx.STYLE_INNER_AURA && nextEffect === ctx.EFFECT_MOVING_COLORS ) {
                nextEffect = ctx.EFFECT_NONE;
            }
            ctx.panelDraftSettings.effect = nextEffect;
            effectSelect.value = String(nextEffect);
            ctx.markPanelDraftDirty(panel);
        });
        updateGlowStyleUiState();
        const pulseInput = panel.querySelector('#sg-pulse');
        const pulseValue = panel.querySelector('#sg-pulse-value');
        pulseInput.addEventListener('input', event => {
            ctx.panelDraftSettings.pulse = Math.max( 0, Math.min(5, Number(event.target.value) || 0) );
            if (pulseValue) {
                pulseValue.textContent = ctx.panelDraftSettings.pulse;
            }
            ctx.markPanelDraftDirty(panel);
        });
        panel.querySelector('#sg-loot-sound-enabled').addEventListener('change',event=>{
            ctx.panelDraftSettings.lootSoundEnabled=event.target.checked;ctx.markPanelDraftDirty(panel);
        });
        const catSoundSelect=panel.querySelector('#sg-cat-sound');
        const soundSelect = panel.querySelector('#sg-sound');
        soundSelect.value=String(ctx.panelDraftSettings.sound<=18?ctx.panelDraftSettings.sound:0);
        catSoundSelect.value=String(ctx.panelDraftSettings.sound>=19?ctx.panelDraftSettings.sound:0);
        catSoundSelect.addEventListener('change',event=>{
            ctx.stopLegendTestSound();
            ctx.panelDraftSettings.sound=Math.max(0,Math.min(30,Number(event.target.value)||0));
            soundSelect.value='0';ctx.markPanelDraftDirty(panel);
        });
        panel.querySelector('#sg-sound-listen').addEventListener('click',()=>ctx.playLegendTestSound(ctx.panelDraftSettings.sound,ctx.panelDraftSettings.volume));
        panel.querySelector('#sg-sound-stop').addEventListener('click',ctx.stopLegendTestSound);
        soundSelect.addEventListener('change', event => {
            ctx.stopLegendTestSound();catSoundSelect.value='0';
            ctx.panelDraftSettings.sound = Math.max( 0, Math.min( 18, Number(event.target.value) || 0 ) );
            ctx.markPanelDraftDirty(panel);
        });
        const volumeInput = panel.querySelector('#sg-volume');
        const volumeValue = panel.querySelector('#sg-volume-value');
        volumeInput.addEventListener('input', event => {
            ctx.panelDraftSettings.volume = Math.max( 0, Math.min( 5, Number(event.target.value) || 0 ) );
            if (volumeValue) {
                volumeValue.textContent = ctx.panelDraftSettings.volume;
            }
            ctx.markPanelDraftDirty(panel);
        });
        panel .querySelector('#sg-test') .addEventListener('click', () => {
                ctx.playLegendTestSound();
                ctx.createLegendaryTestWindow();
            });
    };
ctx.keepPanelReachable = function keepPanelReachable(panel, left, top) {
        const rect=panel.getBoundingClientRect();
        const gripWidth=Math.min(96,window.innerWidth,rect.width);
        const gripHeight=Math.min(64,window.innerHeight,rect.height);
        panel.style.left=Math.max(gripWidth-rect.width,Math.min(left,window.innerWidth-gripWidth))+'px';
        panel.style.top=Math.max(gripHeight-rect.height,Math.min(top,window.innerHeight-gripHeight))+'px';
        panel.style.right='auto';
    };
ctx.rememberPanelPosition = function rememberPanelPosition(panel) {
        const rect=panel.getBoundingClientRect();
        panel.dataset.sgPositioned='true';
        try{localStorage.setItem('shacalPanelPosition',JSON.stringify({left:rect.left,top:rect.top}));}catch{}
    };
ctx.makeDraggable = function makeDraggable(panel) {
        const header=panel.querySelector('.header');
        header.style.touchAction='none';
        let drag=null;
        const interactive='button,input,select,textarea,a,label,[contenteditable="true"]';
        const isGrip=event=>{
            if(!(event.target instanceof Element)||event.target.closest(interactive))return false;
            const rect=panel.getBoundingClientRect();
            const x=event.clientX-rect.left,y=event.clientY-rect.top;
            const edge=x>=0&&y>=0&&x<=rect.width&&y<=rect.height&&(x<=8||y<=8||x>=rect.width-8||y>=rect.height-8);
            return edge||header.contains(event.target);
        };
        panel.addEventListener('pointerdown',event=>{
            if(event.button!==0||!isGrip(event))return;
            const rect=panel.getBoundingClientRect();
            drag={id:event.pointerId,dx:event.clientX-rect.left,dy:event.clientY-rect.top,moved:false};
            panel.setPointerCapture(event.pointerId);
            panel.classList.add('sg-dragging');
            event.preventDefault();
        });
        panel.addEventListener('pointermove',event=>{
            if(!drag){panel.classList.toggle('sg-grip-hover',isGrip(event));return;}
            if(event.pointerId!==drag.id)return;
            drag.moved=true;
            ctx.keepPanelReachable(panel,event.clientX-drag.dx,event.clientY-drag.dy);
        });
        panel.addEventListener('pointerleave',()=>panel.classList.remove('sg-grip-hover'));
        const finish=event=>{
            if(!drag||(event?.pointerId!==undefined&&event.pointerId!==drag.id))return;
            const previous=drag;drag=null;
            panel.classList.remove('sg-dragging','sg-grip-hover');
            if(panel.hasPointerCapture(previous.id))panel.releasePointerCapture(previous.id);
            if(previous.moved)ctx.rememberPanelPosition(panel);
        };
        panel.addEventListener('pointerup',finish);
        panel.addEventListener('pointercancel',finish);
        panel.addEventListener('lostpointercapture',finish);
        window.addEventListener('blur',()=>finish());
        window.addEventListener('resize',()=>{
            if(getComputedStyle(panel).display==='none')return;
            const rect=panel.getBoundingClientRect();
            ctx.keepPanelReachable(panel,rect.left,rect.top);
            if(panel.dataset.sgPositioned)ctx.rememberPanelPosition(panel);
        });
    };
ctx.isGameWorldLoaded = function isGameWorldLoaded() {
        const gameSelectors = [ '.interface-layer', '.game-window', '.game-layer', '.map-wrapper', '.map-layer', '.bottom-panel', '.right-column', '#interface' ];
        if (gameSelectors.some(selector => document.querySelector(selector))) {
            return true;
        }
        const hasLargeCanvas = Array.from(document.querySelectorAll('canvas')) .some(canvas => canvas.width >= 300 && canvas.height >= 200);
        const hasGameUI = !!document.querySelector( '[class*="interface-element"], .loot-wnd, .inventory-window, .chat-window' );
        return hasLargeCanvas && hasGameUI;
    };
ctx.centerLegendaryGlowPanel = function centerLegendaryGlowPanel(panel) {
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        const left = Math.max(8, Math.round((window.innerWidth - rect.width) / 2));
        const top = Math.max(8, Math.round((window.innerHeight - rect.height) / 2));
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        panel.style.right = 'auto';
    };
ctx.toggleLegendaryGlowPanel = function toggleLegendaryGlowPanel() {
        const panel = document.getElementById('shacal-glow-panel');
        if (!panel) return;
        const hidden = panel.style.display === 'none' || getComputedStyle(panel).display === 'none';
        if (hidden) {
            panel.style.display = 'block';
            if(!panel.dataset.sgPositioned){
                let position=null;
                try{position=JSON.parse(localStorage.getItem('shacalPanelPosition'));}catch{}
                if(position && Number.isFinite(position.left) && Number.isFinite(position.top)){
                    panel.style.left=position.left+'px';panel.style.top=position.top+'px';panel.style.right='auto';
                }else ctx.centerLegendaryGlowPanel(panel);
                panel.dataset.sgPositioned='true';
            }
            const rect=panel.getBoundingClientRect();
            ctx.keepPanelReachable(panel,rect.left,rect.top);
        } else {
            panel.style.display = 'none';
        }
    };
ctx.createLGLauncher = function createLGLauncher() {
        if (ctx.lgLauncherCreated || !ctx.isGameWorldLoaded()) return;
        ctx.lgLauncherCreated = true;
        const launcher = document.createElement('div');
        launcher.id = 'shacal-lg-launcher';
        launcher.title = 'Shacal Customizer';
        launcher.style.setProperty('--sg-lg-icon', `url("${ctx.LG_ICON_DATA}")`);
        document.body.appendChild(launcher);
        ctx.applyShacalUpdateStateToUI();
        const placeLauncher = () => {
            const edgeAllowance = 18;
            const minX = -edgeAllowance;
            const minY = -edgeAllowance;
            const maxX = Math.max(
                minX,
                window.innerWidth - launcher.offsetWidth + edgeAllowance
            );
            const maxY = Math.max(
                minY,
                window.innerHeight - launcher.offsetHeight + edgeAllowance
            );

            if (ctx.hasSavedLauncherPosition()) {
                const x = Math.max(
                    minX,
                    Math.min(maxX, Number(ctx.settings.iconX))
                );
                const y = Math.max(
                    minY,
                    Math.min(maxY, Number(ctx.settings.iconY))
                );

                launcher.style.left = `${Math.round(x)}px`;
                launcher.style.top = `${Math.round(y)}px`;
                return;
            }

            const centeredX = Math.max(
                minX,
                Math.min(
                    maxX,
                    Math.round(
                        (window.innerWidth - launcher.offsetWidth) / 2
                    )
                )
            );
            const centeredY = Math.max(
                minY,
                Math.min(
                    maxY,
                    Math.round(
                        (window.innerHeight - launcher.offsetHeight) / 2
                    )
                )
            );

            launcher.style.left = `${centeredX}px`;
            launcher.style.top = `${centeredY}px`;
        };
        placeLauncher();
        let dragging = false;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;
        launcher.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            dragging = true;
            moved = false;
            startX = event.clientX;
            startY = event.clientY;
            startLeft = parseFloat(launcher.style.left) || 0;
            startTop = parseFloat(launcher.style.top) || 0;
            launcher.classList.add('dragging');
            try {
                launcher.setPointerCapture(event.pointerId);
            } catch {}
            event.preventDefault();
            event.stopPropagation();
        });
        launcher.addEventListener('pointermove', event => {
            if (!dragging) return;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
            const edgeAllowance = 18;
            const minX = -edgeAllowance;
            const minY = -edgeAllowance;
            const maxX = Math.max( minX, window.innerWidth - launcher.offsetWidth + edgeAllowance );
            const maxY = Math.max( minY, window.innerHeight - launcher.offsetHeight + edgeAllowance );
            const x = Math.max( minX, Math.min(maxX, startLeft + dx) );
            const y = Math.max( minY, Math.min(maxY, startTop + dy) );
            launcher.style.left = `${x}px`;
            launcher.style.top = `${y}px`;
        });
        launcher.addEventListener('pointerup', event => {
            if (!dragging) return;
            dragging = false;
            launcher.classList.remove('dragging');
            try {
                launcher.releasePointerCapture(event.pointerId);
            } catch {}
            ctx.settings.iconX = Math.round(parseFloat(launcher.style.left) || 0);
            ctx.settings.iconY = Math.round(parseFloat(launcher.style.top) || 0);
            ctx.saveSettings();
            if (!moved) {
                ctx.toggleLegendaryGlowPanel();
            }
        });
        window.addEventListener('resize', placeLauncher);
    };},init(ctx){ctx.lgLauncherCreated = false;
ctx.CUSTOM_FRAME_SPRITE_1 = 'https://shacal97.github.io/Shacal-Customizer/assets/fc7e1a9709177a760374.png';
ctx.CUSTOM_FRAME_SPRITE_2 = 'https://shacal97.github.io/Shacal-Customizer/assets/ebcd9800f3e08c41d468.png';}});
runtime.registerPart("core/assets-and-startup.js", {declare(ctx){},init(ctx){ctx.BUILTIN_LOOT_TEMPLATE = '<div class="c-window border-window ui-draggable loot-wnd no-exit-button window-on-peak shacal-custom-glow">\n    <div class="header-label-positioner">\n        <div class="draggable-window-element ui-draggable-handle"></div>\n        <div class="header-label">\n            <div class="left-decor"></div>\n            <div class="right-decor"></div>\n            <div class="text" name="Łupy">Łupy</div>\n        </div>\n    </div>\n    <div class="content">\n        <div class="inner-content"><div class="loot-window">\n    <div class="middle-graphics interface-element-middle-1-background"></div>\n    <div class="scroll-wrapper">\n        <div class="scroll-pane">\n            <div class="items-wrapper"><div class="loot-item-wrapper interface-element-background-color-1 loot-item-wrapper-1" data-state="want" loot-id="1">\n    <div class="slot interface-element-one-item-slot"><div class="item item-id-1 item-tpl-1456" data-frame-mania-rarity="legendary" data-frame-mania-upgrade="-1" data-tip-type="t_item" data-item-type="t-leg">\n    <div class="highlight t-leg"></div>\n    <canvas class="icon canvas-icon" width="32" height="32"></canvas>\n    <canvas class="canvas-notice" width="32" height="32"></canvas>\n</div></div>\n    <div class="text-info interface-element-table-header-1-background">Chcę</div>\n    <div class="button-holder"><div class="button want no-hover green">\n    <div class="background"></div>\n    <div class="label want"></div>\n</div><div class="button not no-hover red">\n    <div class="background"></div>\n    <div class="label not"></div>\n</div></div>\n</div></div>\n            <div class="col button-wrapper"></div>\n        </div>\n    <div class="scrollbar-wrapper">\n    <div class="track">\n        <div class="handle ui-draggable ui-draggable-handle" style="position: relative; top: 0px;"></div>\n    </div>\n</div></div>\n    <div class="bottom-wrapper">\n        <div class="interface-element-bottom-bar-background-stretch"></div>\n        <div class="table-wrapper">\n            <div class="time-left"><span>9 s</span></div>\n            <div class="accept-button"><div class="button small green">\n    <div class="background"></div>\n    <div class="label">Potwierdź</div>\n</div></div>\n            <div class="bag-left"><span>70 m</span></div>\n        </div>\n    </div>\n</div></div>\n        <div class="window-controlls"></div>\n    </div>\n    <div class="c-window__bottom-bar">\n      <div class="interface-element-bottom-bar-background-stretch"></div>\n    </div>\n    <div class="close-button-corner-decor">\n        <button type="button" class="close-button"></button>\n    </div>\n</div>';
ctx.LG_ICON_DATA = 'https://shacal97.github.io/Shacal-Customizer/assets/98357751d53762230314.png';
ctx.LEGEND_SOUND_DATA = [ null,
        'https://shacal97.github.io/Shacal-Customizer/assets/0c8f74dd1f38a187c69e.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/21ba79073c85ba46bdb6.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/9fe5d70f25408f5cfd7a.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/5b3244f56bd5c4d7e60d.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/0f0dd6e25607a18d6c3b.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/f053ee00255333970c59.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/a11904f04a51c6326847.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/a94cf678b7e8da3277c7.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/75aa969f83285d64a547.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/96a55311c41836b42bab.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/d4ad40bdfa8eec6cc06b.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/24231d2595b4a5b03e7b.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/c6abe2f0103441eb2152.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/08cf36ad15952de99035.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/b5c85e5d2764be5b8d45.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/803fd24879aaf5039094.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/033f00faea19f7e59c1d.mp3',
        'https://shacal97.github.io/Shacal-Customizer/assets/280a3e3373af23c597a7.mp3'
    ];
ctx.LEGEND_SOUND_DATA.push("https://shacal97.github.io/Shacal-Customizer/assets/0f3a496da8df8e3b7584.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/ec9bdb8d3f2efbb6465f.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/5e9367b456143f683d1d.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/a911d2b35b54d2eaf618.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/cbf94a3280a7061111c0.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/ddded4bd2eacdd7b7c79.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/895c5b575df20915307a.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/0ae948784fb5b46b40e6.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/43908a824fdc3de74eaf.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/caacd9591c3ef9eef5e2.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/5ace8b2d681c173c1627.mp3",
        "https://shacal97.github.io/Shacal-Customizer/assets/04fd679350ad3412e048.mp3");
ctx.CHAT_EMOTICONS = Object.freeze({
        'sadpepe': {
            src: 'https://cdn.frankerfacez.com/emoticon/230082/2', alt: ':sadpepe:', title: 'sadpepe'
        }, 'pepehands': {
            src: 'https://cdn.frankerfacez.com/emoticon/231552/2', alt: ':pepehands:', title: 'pepehands'
        }, 'pepega': {
            src: 'https://cdn.frankerfacez.com/emoticon/243789/2', alt: ':pepega:', title: 'pepega'
        }, 'omegalul': {
            src: 'https://cdn.frankerfacez.com/emoticon/128054/2', alt: ':omegalul:', title: 'omegalul'
        }, 'pog': {
            src: 'https://cdn.frankerfacez.com/emoticon/210748/2', alt: ':pog:', title: 'pog'
        }, 'lulw': {
            src: 'https://cdn.frankerfacez.com/emoticon/139407/2', alt: ':lulw:', title: 'lulw'
        }, 'kekw': {
            src: 'https://cdn.frankerfacez.com/emoticon/381875/2', alt: ':kekw:', title: 'kekw'
        }, 'monkaw': {
            src: 'https://cdn.frankerfacez.com/emoticon/214681/2', alt: ':monkaw:', title: 'monkaw'
        }, 'monkas': {
            src: 'https://cdn.frankerfacez.com/emoticon/130762/2', alt: ':monkas:', title: 'monkas'
        }, '5head': {
            src: 'https://cdn.frankerfacez.com/emoticon/239504/2', alt: ':5head:', title: '5head'
        }, 'catflower': {
            src: 'data:image/webp;base64,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',
            alt: ':catflower:', title: 'catflower'
        }, 'shacal': {
            src: 'data:image/webp;base64,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',
            alt: ':shacal:', title: 'shacal'
        }, 'evilpika': {
            src: 'data:image/webp;base64,UklGRkAHAABXRUJQVlA4WAoAAAAQAAAAXwAAXwAAQUxQSDMCAAABkHTb1iHJ4iPSqrZt2zZmNke2bdvumW3btl22XYmIfK+ML25ETIBUsPJBlbOlrMzMRJTi+/b88lEVJIzTU7LLuzdphYyh3rv8Yv5bQmuywV6l5aBD0flHmyxa0hVpPmLW9gcBqcQF+KmhZmRb3QXXfkSnKMQFGz/JoAl90YZL3yQQi0gPqotRIg+FRh3+prCo0X3F2FspN8WGnIlUWFx1tyyEerVudvryfb+qLHZUM70InHahXBbboEtRLDrd7WAQgZWdJSVdra0hKovvftRSCHaeH77Wl1iTFNTDKAIrSR7W7JveRhE0rbxoAo7pZQVwrGwoDo6DRxjA0fuW4FjZK4Pj0Pro6FwxcOzbDZ1zvR0c/2mDzjkbHT0xgWNnZ3S8yoDuSjF0/r1lcGkrLODocjlw7NscXcoYdHRFD45TaqDzDkXHew3oPjWRwSUtsICjp3XAsXLcAo7jOqOjI8XAcehAHTjXZgc4elYTHCf0QadMQuddhI6Ww1uCTp2BLrE/uj8twHmvlAfnXGEBFzlcB+59PQmbd6kRXExDCRtdMIPz7SRhcx8sBu5nFx0291idBE29UlzC9ruThC1iggmbd09xCRp9rC5Do7+9pXwHETffAe59PQlc6vU+VmxMoQtq6qAxJ95oK2Njih1bWIbGHLqsODiOXm8Gx+rqYuA4aroNHP3tBY75iR2dc6QeHD8ojy5ykAzOvc4Cjs6XBscvaqD7XA/dz0bo/jVF9xfe9wa5AwBWUDgg5gQAAHAYAJ0BKmAAYAA+bTCTRqQjIaEoE53ogA2JYgDG7AoOL8hyrvcsYR6mOPuFGPlI2928cGsr78CTKDPnZfO92oN4F/J5QDNq9yJaT7ziKZv6sM4nZfn+s7MPWvqJ723qMHhvcQvsa7M9rYhBHEwCvUE3esQCARUeqtPvx9IB8wUJM5Yh9EgYev4UxdHoATW0AY2tIz5NJHkU5mpbMSRiIcvSBoyQKcYKpFjjEJDs0QMYBKM+Fuk5lwW0iXxzozx810LsKlCcVmG+QjjoCAD+VBWuhW17lhtW21XYDBdLgUL4HEoOPN1+PHmE3myOh5L3W25jdfJGgztqid+OP0G0M+VFsWHZv3Im0V8eOxV9YYN8sqcnojCZuauE28WhdjfNGZgNF04ZByKIPxEvaVzfSqxF0QPr53/MHtVpyDu7glR6spabk09abvf04UCLOcElW/lhs82I87qule3Je17rdNPdpNjIyiB7Kxa33DqeZFlUaxIQGV0wVfbGN6Rd7iH0EuOC/Qz6MAPEZjunUt9duhv5CsgM3nyS206FtkkMf+n9//22D/9uQ//9tjd+hUW57knbd6Hp4HD4E6ddmu9w4Du4xaeV4lpHYSFnVEFErLI3Up97bsAig5JujfnZByb0q2Gs2gEUXmI7e6LB4L4piZD2DHaTVa30Mr9OVl9+R3tEpFRfc53uODd6eRxtYE9JtJTJk7zvLKi3OkMUORZWwl0epZDqrziUClVayP6OvvrqxvI9LjooOtAPToH4L5cuqQrjB0G8jlNsQpr7sfUhwL+iMzKYwDbWm5/WU/saVIRdVCGoXh64M5iFy5HdUFBSG/T0XTF38KM+4JNpe46TK3yBNik51pINaVTA1Yco/uttRVQqIXeH/dcNQ1Hc6I8AolfFuuRRN66v58meHskA19LyB2iA/ptGJhAFl+l+ESFSuji92sUpyn3fMbugLn/D/TlHLrn/qO2aqtlvk0htTjzBR6kveErADYsuB4dtpW03WfTRTUJ4HeQQupZMSo6K72lOH971GhS/i52L6Aok0ukmiQvXPtSheW258+Vanxhw2m00RiGsQqrRLHxJG+TrKPIk9btyr+M0z4Mu6SQTdltFDX/3cVjdoO1JKvE491SCkex+pT5SAhkf3xFKvdKUi02olBm13CoLfXZ2Yemwol1NR4ihLN/1vrmCHn/BgSdxD+HsIu3ixb2ni6kmb9CtJYJRYgj3b7e8ZMYDAHRNEg3TeBPWeWlyHFInDud9TiGGpJln7vT/OCEVOqUIOsyVD/TdPOmMCqcV0Y9TRNKz5yudXGU5z1theRZuBiXvCiqPI0BWQLUVwUHKwH4D+cKc+r4cnbM7surmzYvy0yq7wuYMmHGan9FNX4DK8WhgnTLRASZSHH0oz/t12i9sqV6cX7gC35Fiv52U7PIyZtEUrGxtur0UgiGDAIA3c+QNwMsi0+r586T2Ewy07Vi0f7GhrY0cGzNjzEe+w5nn/m8J2Yv3qP7/Pz2fQZd2p5q8Ppg9Lyn/Ckym1VGstEjBCWvHktL7Sn/b7ZqiLvtBtNFA5/xa3jLhmINgrZ8pDTalkguuTTV8o2XjfjBffOtUODtrY6IDSSXoPmv8XkyCGRengNP41jFThv//YEovWuL7kRPnGnSAgh8tNtSp7FzNes5AUcIokPAAAA==',
            alt: ':evilpika:', title: 'evilpika'
        }, 'cringe': {
            src: 'data:image/webp;base64,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',
            alt: ':cringe:', title: 'cringe'
        }, 'staring': {
            src: 'data:image/webp;base64,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',
            alt: ':staring:', title: 'staring'
        }, 'uwucat': {
            src: 'data:image/webp;base64,UklGRlYEAABXRUJQVlA4WAoAAAAQAAAAWAAAWAAAQUxQSBMAAAABD9D/iAgICRL8f98Q0f8AQH8AAFZQOCAcBAAAEBsAnQEqWQBZAD5tKpBFpCKhl4tPXEAGxLKAYv5wX2LRvqLBe+hC5xBtezRY+baUV3wXJyFmGcP3hzUiuRz+StVBQSgfpuXy1x0GHzYkE1JXwvE1L+ZbN8aQi3iwnPz5pi/cklc/SXX65ahP4SruwLOorvIHy9hyGlrmyi0vCHRjtAhDur3H4ql/nJgvx3iUhWxxQYcMrnVLdF9oyBH94sQrp9uNHRna14uCNFayCi7HWfS8ELnuBj7gQgEwgG9hTto2Seq+4yX9Dx91iwBbz21EUBfp8jpBGOaHqO/1RUAAAP2dfO7txHKI22T1SPhACjOZx6x4sfDe22fF/ApFfI6ftL3U/ouEaR9V4mBDdlrRkhVJ5SomuShozUJg+UkdAH/h23gVuXyOQZi48wBvTS42xwY9Za9FoYa1dlo1piVRGXEJWddCg951eu11ONiRh7rGXauaQ8H/EN3CdTLZNqpXAA3vbeo0LqAnW+SvbFo6s6se1vCnpnSHLJMQWuoHsSxhaRxhIgcSoRPkcrtQ9RvfIfMSUoAN54kztyFxFrWprsi868LDX8X1AoMXHKtiaeQn3+nwkK0N8UDxRPu1JTAJQHFdvdScaaasFBvsHk3NPOv9hIVXBXn/WwINhAIemqRjUjEWXo8pILzCmP/NcK50tW2u4I4Sd+fUdCIHk5+qNrG+Qr/RLHjjCSArcG1SfNkUtuRKetTBbnNGS1tR1qy/TUPmni4QYm/oqPPhCwHI/nukZRh4+l8AmqXgT91GYNbWqMN6sqfVeHgbNr16DQLGHWM6XJ2cZTfP6dy3+ucbeG17N0QKDuJwC8WlpBIv6Tw2oPESehECDOPwpf04fEhADtjIy4kPJD8Nvo3qe5pvQ2rK93FfLluTl0wJpTYJRolEVokpdUTV26AX9j3RTLDHVvLJFzBcp5I3EfHCZwtHQFh+7Na/GX36BKvoyL9smkM6RYwwF5DIsM+b8OAub9UjSHsgRvD3XGY5otcGuPVeZl0+OQ/AfJ8Rc+2P+8J5mQGwq8MfTiTL+R0oP0jRTxYvS1E4XEtIkDpetvi2+X0bNegQeZC7YdLHPOZh6AlwAeM8Lh3r8V61S4ytCKalQeXDF901/HC+bYKaWikaTj9o6KDqcwem89qZY5JTr1ZswN5m01fjT8zLWk/O4B1Ppsf51xDQ12j9c0BOQmdCXiUm51nZN6nE0XSJbdrTD1KNx4TVSIcBq8h4GPhDkAaCjqViXREfYkzmvBqQE2i46Wlaiut/g0qilIT6kkci5PlSlHnywGWiP3e7SE9UlaZJdGOBSGHEh/3P2ccCw8GyHlXHRJxk5WQU0HoEualRSDMPAmNV73k71Kzxchg3DCbHZbOyp51+Keyan7GaL/zcmBssvWa+TVO88I8AAAA=',
            alt: ':uwucat:', title: 'uwucat'
        }, 'naaba': {
            src: 'data:image/webp;base64,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',
            alt: ':naaba:', title: 'naaba'
        }, 'ban': {
            src: 'data:image/webp;base64,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',
            alt: ':ban:', title: 'ban'
        }, 'blergh': {
            src: 'data:image/webp;base64,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',
            alt: ':blergh:', title: 'blergh'
        }, 'wtf': {
            src: 'data:image/webp;base64,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',
            alt: ':wtf:', title: 'wtf'
        }, 'kappa': {
            src: 'https://shacal97.github.io/Shacal-Customizer/assets/d09918cf608c4ac547cf.png',
            alt: ':kappa:', title: 'kappa'
        }, 'pepeded': {
            src: 'https://shacal97.github.io/Shacal-Customizer/assets/5c931715a8d06a0dc02a.png',
            alt: ':pepeded:', title: 'pepeded'
        }, 'pepechrist': {
            src: 'https://shacal97.github.io/Shacal-Customizer/assets/7d3e7fae926612c05771.png',
            alt: ':pepechrist:', title: 'pepechrist'
        }, 'pepegolum': {
            src: 'https://shacal97.github.io/Shacal-Customizer/assets/fdeb21d2d0e9232d4917.png',
            alt: ':pepegolum:', title: 'pepegolum'
        }, 'pepecomp': {
            src: 'https://shacal97.github.io/Shacal-Customizer/assets/98dfe151cfe9045a7442.png',
            alt: ':pepecomp:', title: 'pepecomp'
        }, 'pepolove': {
            src: 'https://shacal97.github.io/Shacal-Customizer/assets/f3ad4c5282052b6d1848.png',
            alt: ':pepolove:', title: 'pepolove'
        }, 'ok': {
            src: 'data:image/webp;base64,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',
            alt: ':ok:', title: 'ok'
        }, 'monster': {
            src: 'https://shacal97.github.io/Shacal-Customizer/assets/2e6c4cfcaa32c7255be1.png',
            alt: ':monster:', title: 'monster'
        }
    });
ctx.SHACAL_PANEL_CSS = `/* 08. PANEL: ciemny interfejs desktopowy, akcent turkus/fiolet */
#shacal-glow-panel {
    --sg-cyan: #36d7cb; --sg-purple: #a776dc; --sg-muted: #8c949d;
    position: fixed; width: 820px; height: min(730px, calc(100vh - 32px));
    left: 24px; top: 24px; z-index: 2000002; box-sizing: border-box;
    color: #e2e5e9; font: 12px/1.45 'Segoe UI', Arial, sans-serif;
    background: #1b1e23; border: 1px solid #454b53; border-radius: 9px;
    box-shadow: 0 24px 80px #0009, 0 0 0 1px #08090bb3;
    overflow: hidden; user-select: none;
}
#shacal-glow-panel *, #shacal-glow-panel *::before, #shacal-glow-panel *::after { box-sizing: border-box; }
#shacal-glow-panel .header {
    height: 72px; display: flex; align-items: center; gap: 12px; padding: 12px 54px 12px 18px;
    position: relative; cursor: move; border-bottom: 1px solid #101216;
    background: linear-gradient(#333840, #272c33); box-shadow: inset 0 1px #ffffff0a;
}
#shacal-glow-panel .brand-mark {
    flex: 0 0 40px; width: 40px; height: 40px; background: var(--sg-lg-icon) center/cover no-repeat;
    clip-path: polygon(10% 0,90% 0,100% 10%,100% 90%,90% 100%,10% 100%,0 90%,0 10%);
}
#shacal-glow-panel .brand-copy { flex: 1; min-width: 0; }
#shacal-glow-panel .brand-title { font-size: 18px; font-weight: 700; letter-spacing: -.4px; color: #f3f5f7; }
#shacal-glow-panel .brand-subtitle { color: #969ea8; font-size: 9px; letter-spacing: 1.3px; }
#shacal-glow-panel .brand-subtitle span { color: var(--sg-cyan); }
#shacal-glow-panel .brand-update-row { position: absolute; right: 55px; top: 18px; display: flex; gap: 7px; align-items: center; }
#shacal-glow-panel .brand-version { color: #9aa2ae; font-size: 10px; }
#shacal-glow-panel button { font: inherit; cursor: pointer; }
#shacal-glow-panel button:focus-visible, #shacal-glow-panel input:focus-visible, #shacal-glow-panel select:focus-visible, #shacal-glow-panel textarea:focus-visible { outline: 2px solid var(--sg-cyan); outline-offset: 2px; }
#shacal-glow-panel .close-button { position: absolute; right: 14px; top: 18px; border: 0; background: transparent; color: #aab1bb; width: 28px; height: 28px; font-size: 23px; line-height: 1; }
#shacal-glow-panel .close-button:hover { color: #fff; background: #b34254; border-radius: 4px; }
#shacal-glow-panel .header-update-button { font-size: 9px; color: #aeb8c3; border: 1px solid #515862; background: #242931; padding: 5px 7px; border-radius: 4px; }
#shacal-glow-panel .header-update-button.is-available { color: #dfc4ff; border-color: #8961ac; }
#shacal-glow-panel .header-update-status { position: absolute; right: 0; top: 30px; color: #8d97a2; font-size: 9px; white-space: nowrap; }
#shacal-glow-panel .is-error { color: #f6a7ad; }
#shacal-glow-panel .is-ok { color: #81d0b4; }
#shacal-glow-panel .sg-workspace { display: grid; grid-template-columns: 178px minmax(0,1fr); height: calc(100% - 140px); }
#shacal-glow-panel .sg-side { background: #20242a; border-right: 1px solid #101216; padding: 20px 12px; display: flex; flex-direction: column; gap: 22px; }
#shacal-glow-panel .sg-side-label { color: #767f8a; font-size: 9px; font-weight: 700; letter-spacing: 1.6px; padding: 0 10px; }
#shacal-glow-panel .panel-tabs { display: grid; gap: 5px; }
#shacal-glow-panel .panel-tab { display: flex; align-items: center; gap: 11px; height: 47px; padding: 0 12px; border: 1px solid transparent; border-radius: 5px; color: #9aa4b0; background: transparent; font-size: 10px; letter-spacing: .6px; font-weight: 600; text-align: left; }
#shacal-glow-panel .panel-tab:hover { background: #292f37; color: #e3e9f1; }
#shacal-glow-panel .panel-tab.active { background: linear-gradient(90deg,#29403f,#263336); color: #b1fff6; border-color: #3a6560; box-shadow: inset 3px 0 var(--sg-cyan); }
#shacal-glow-panel .sg-nav-icon { width: 23px; height: 23px; display: inline-flex; color: currentColor; }
#shacal-glow-panel .sg-nav-icon svg { width: 23px; height: 23px; }
#shacal-glow-panel .sg-side-info { margin-top: auto; padding: 13px 10px; border-top: 1px solid #353b44; color: #7d8794; font-size: 10px; }
#shacal-glow-panel .sg-side-info strong { display: block; color: #c0c9d3; font-size: 11px; margin: 7px 0 5px; }
#shacal-glow-panel .sg-status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--sg-cyan); margin-right: 6px; }
#shacal-glow-panel .sg-main { min-width: 0; min-height: 0; display: flex; flex-direction: column; background: #191c21; }
#shacal-glow-panel .sg-page-heading { padding: 21px 24px 17px; border-bottom: 1px solid #30353d; background: #20242a; }
#shacal-glow-panel .sg-page-heading small { color: var(--sg-purple); letter-spacing: 1.8px; font-size: 9px; font-weight: 600; }
#shacal-glow-panel .sg-page-heading h2 { font-size: 22px; line-height: 1.2; font-weight: 600; margin: 5px 0; letter-spacing: -.5px; color: #edf1f5; }
#shacal-glow-panel .sg-page-heading p { margin: 0; color: #85919e; font-size: 11px; }
#shacal-glow-panel .body { padding: 18px 22px; flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: #48505a #191c21; overscroll-behavior: contain; }
#shacal-glow-panel .tab-content { display: none; }
#shacal-glow-panel .tab-content.active { display: block; }
#shacal-glow-panel .panel-section { margin-bottom: 17px; padding-bottom: 17px; border-bottom: 1px solid #30353d; }
#shacal-glow-panel .panel-section:last-child { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
#shacal-glow-panel .section-title { color: #9da8b4; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 12px; }
#shacal-glow-panel .master-row, #shacal-glow-panel .master-switch { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 34px; }
#shacal-glow-panel .master-copy, #shacal-glow-panel .test-copy, #shacal-glow-panel .rarity-copy { display: flex; flex-direction: column; gap: 3px; }
#shacal-glow-panel .master-label, #shacal-glow-panel .test-title, #shacal-glow-panel .rarity-name { font-size: 12px; font-weight: 600; color: #dfe4ea; }
#shacal-glow-panel .hint, #shacal-glow-panel .test-desc { font-size: 10px; color: #8b97a4; }
#shacal-glow-panel input[type=checkbox] { appearance: none; flex: 0 0 32px; width: 32px; height: 17px; margin: 0; border: 1px solid #505864; border-radius: 10px; background: #13161a; position: relative; cursor: pointer; }
#shacal-glow-panel input[type=checkbox]::after { content: ''; position: absolute; width: 11px; height: 11px; left: 2px; top: 2px; border-radius: 50%; background: #7f8a98; transition: left .12s; }
#shacal-glow-panel input[type=checkbox]:checked { border-color: #419c92; background: #285d57; }
#shacal-glow-panel input[type=checkbox]:checked::after { left: 17px; background: #6fe2d4; }
#shacal-glow-panel input:disabled { opacity: .4; cursor: default; }
#shacal-glow-panel .drop-mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
#shacal-glow-panel .drop-mode-option { display: flex; gap: 10px; align-items: center; justify-content: center; padding: 11px 8px; border: 1px solid #3a424c; border-radius: 5px; background: #232831; color: #99a5b3; font-size: 10px; cursor: pointer; }
#shacal-glow-panel .drop-mode-option:has(input:checked) { border-color: #608078; color: #c9f3eb; background: #283b37; }
#shacal-glow-panel .channel-grid { display: grid; gap: 9px; }
#shacal-glow-panel .channel-card { padding: 11px 13px; background: #22272f; border: 1px solid #373f49; border-radius: 5px; }
#shacal-glow-panel .channel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; }
#shacal-glow-panel .channel-name { display: flex; align-items: center; gap: 8px; color: #b9c4cf; font-weight: 600; font-size: 11px; }
#shacal-glow-panel .channel-number { display: inline-flex; width: 20px; height: 20px; justify-content: center; align-items: center; background: #34404c; color: #a7b8c9; border-radius: 4px; font-size: 10px; }
#shacal-glow-panel input[type=color] { width: 44px; height: 23px; padding: 2px; border: 1px solid #58616d; background: #171b20; border-radius: 3px; cursor: pointer; }
#shacal-glow-panel .row { display: grid; grid-template-columns: 65px minmax(0,1fr) 28px; gap: 10px; align-items: center; min-height: 27px; color: #9ba7b5; font-size: 10px; }
#shacal-glow-panel .row.simple { grid-template-columns: 1fr auto; }
#shacal-glow-panel .row.full { display: block; }
#shacal-glow-panel input[type=range] { accent-color: var(--sg-cyan); width: 100%; height: 17px; margin: 0; cursor: pointer; }
#shacal-glow-panel .value { text-align: center; background: #15191e; border: 1px solid #3a434e; border-radius: 3px; color: #c4d3e1; font: 10px/19px Consolas,monospace; }
#shacal-glow-panel select { width: 100%; height: 33px; border: 1px solid #485360; border-radius: 4px; padding: 0 8px; color: #cbd5df; background: #252c35; font: 11px 'Segoe UI',sans-serif; cursor: pointer; }
#shacal-glow-panel select option { background: #252c35; }
#shacal-glow-panel .control-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
#shacal-glow-panel .control-card { min-width: 0; }
#shacal-glow-panel .control-card.wide { grid-column: 1 / -1; }
#shacal-glow-panel .control-label { display: block; color: #8e9baa; margin-bottom: 6px; font-size: 10px; }
#shacal-glow-panel .sound-row { display: grid; grid-template-columns: 1fr 120px; gap: 15px; align-items: end; }
#shacal-glow-panel .test-zone { display: flex; justify-content: space-between; gap: 18px; align-items: center; }
#shacal-glow-panel .random-colors-button, #shacal-glow-panel #sg-test, #shacal-glow-panel #sg-chat-test, #shacal-glow-panel #sg-chat-inspect { border: 1px solid #526472; border-radius: 4px; color: #c2d6e4; background: linear-gradient(#354350,#29333e); font-size: 10px; font-weight: 600; padding: 9px 15px; white-space: nowrap; }
#shacal-glow-panel .random-colors-button { margin-top: 9px; width: 100%; }
#shacal-glow-panel #sg-chat-test { background: linear-gradient(#605071,#443951); border-color: #8d74a4; color: #edddff; }
#shacal-glow-panel button:disabled { opacity: .45; cursor: default; }
#shacal-glow-panel .rarity-list { display: grid; gap: 6px; }
#shacal-glow-panel .rarity-row { display: grid; grid-template-columns: 20px 1fr auto; align-items: center; gap: 11px; background: #222831; border: 1px solid #363f4a; padding: 10px 12px; border-radius: 4px; }
#shacal-glow-panel .rarity-swatch { width: 16px; height: 16px; border: 1px solid currentColor; border-radius: 3px; box-shadow: inset 0 0 6px currentColor; }
#shacal-glow-panel .rarity-row.common { color: #818d9d; } #shacal-glow-panel .rarity-row.unique { color: #c0922c; } #shacal-glow-panel .rarity-row.heroic { color: #3395c2; } #shacal-glow-panel .rarity-row.upgraded { color: #10a447; } #shacal-glow-panel .rarity-row.legendary { color: #e842a2; }
#shacal-glow-panel .rarity-code, #shacal-glow-panel .rarity-pending { font-size: 9px; color: #788695; }
#shacal-glow-panel .rarity-row.artifact { color: #8770a8; opacity: .5; }
#shacal-glow-panel .frames-note { margin-top: 10px; padding: 10px 12px; background: #202932; border-left: 2px solid #536b7c; color: #96a6b6; font-size: 10px; line-height: 1.6; overflow-wrap: anywhere; }
#shacal-glow-panel .chat-template { width: 100%; min-height: 82px; resize: vertical; border: 1px solid #4d5c6b; border-radius: 4px; background: #14191f; color: #d4dce6; padding: 12px; font: 12px/1.5 'Segoe UI',sans-serif; }
#shacal-glow-panel .chat-preview { padding: 12px; background: #2b2435; border: 1px solid #564466; color: #baaccb; font-size: 11px; margin-top: 9px; border-radius: 4px; overflow-wrap: anywhere; }
#shacal-glow-panel .chat-preview strong { color: #deacef; }
#shacal-glow-panel .shacal-emote-catalog { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 6px; max-height: 180px; overflow-y: auto; scrollbar-width: thin; margin-top: 12px; }
#shacal-glow-panel .shacal-emote-catalog-item { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 0; padding: 10px 3px; border: 1px solid #3b4552; background: #262d37; border-radius: 4px; }
#shacal-glow-panel .shacal-emote-catalog-item:hover { border-color: #7e69a0; background: #322c3f; }
#shacal-glow-panel .shacal-emote-catalog-image-wrap { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; }
#shacal-glow-panel .shacal-emote-catalog-image { max-width: 28px; max-height: 28px; }
#shacal-glow-panel .shacal-emote-catalog-code { font-size: 9px; color: #9baabe; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
#shacal-glow-panel .shacal-emote-copy-status { min-height: 16px; color: #7ddaca; font-size: 10px; padding-top: 5px; }
#shacal-glow-panel .sg-save-footer { height: 68px; display: flex; align-items: center; flex-direction: row-reverse; gap: 18px; padding: 14px 22px; background: #272d35; border-top: 1px solid #414953; }
#shacal-glow-panel .sg-save-settings { flex: 0 0 160px; height: 36px; border: 1px solid #63b3a8; border-radius: 5px; background: linear-gradient(#417b70,#32665e); color: #e5fff6; font-size: 10px; letter-spacing: .7px; font-weight: 700; }
#shacal-glow-panel .sg-save-settings.sg-save-pending { border-color: #b999dc; background: linear-gradient(#735a8c,#59436f); color: #f7eaff; }
#shacal-glow-panel .sg-save-hint { flex: 1; color: #91a0af; font-size: 10px; }
@media(max-width:860px) { #shacal-glow-panel { width: calc(100vw - 24px); } #shacal-glow-panel .sg-workspace { grid-template-columns: 150px minmax(0,1fr); } }
@media(max-width:600px) {
    #shacal-glow-panel .sg-workspace { display: flex; flex-direction: column; }
    #shacal-glow-panel .sg-side { display: block; padding: 6px; border-right: 0; border-bottom: 1px solid #111; }
    #shacal-glow-panel .sg-side-label, #shacal-glow-panel .sg-side-info, #shacal-glow-panel .sg-nav-icon { display: none; }
    #shacal-glow-panel .panel-tabs { grid-template-columns: repeat(6,1fr); gap: 3px; }
    #shacal-glow-panel .panel-tab { height: 34px; padding: 0 3px; justify-content: center; font-size: 9px; }
    #shacal-glow-panel .sg-main { flex: 1; }
    #shacal-glow-panel .body { padding: 14px; }
    #shacal-glow-panel .sg-page-heading { padding: 12px 14px; }
    #shacal-glow-panel .sg-page-heading h2 { font-size: 18px; }
    #shacal-glow-panel .brand-update-row { position: static; margin-top: 3px; }
    #shacal-glow-panel .brand-subtitle, #shacal-glow-panel .header-update-status { display: none; }
    #shacal-glow-panel .brand-title { font-size: 16px; }
    #shacal-glow-panel .header { padding-left: 12px; }
    #shacal-glow-panel .brand-mark { flex-basis: 32px; width: 32px; height: 32px; }
    #shacal-glow-panel .control-grid, #shacal-glow-panel .sound-row { grid-template-columns: 1fr; }
    #shacal-glow-panel .test-zone { align-items: stretch; flex-direction: column; gap: 10px; }
    #shacal-glow-panel .sg-save-footer { padding: 12px; gap: 10px; }
    #shacal-glow-panel .sg-save-settings { flex-basis: 125px; }
}

/* Panel ustawień. */
#shacal-glow-panel { width:1100px; height:min(740px,calc(100vh - 24px)); border-radius:5px; border-color:#51545a; background:#202124; box-shadow:0 26px 95px #000b,0 0 0 1px #07080b; }
#shacal-glow-panel .header { height:58px; padding:7px 48px 7px 20px; background:#242528; border-bottom:2px solid #101114; }
#shacal-glow-panel .brand-title {font:900 25px/1 'Segoe UI',sans-serif; letter-spacing:-1px; text-transform:uppercase; text-shadow:none; color:#f1f4f6;}
#shacal-glow-panel .brand-subtitle {font-size:8px; letter-spacing:2.2px; color:#73decf; margin-top:5px;}
#shacal-glow-panel .brand-mark {width:37px;height:37px;flex-basis:37px;}
#shacal-glow-panel .brand-update-row {right:58px;}
#shacal-glow-panel .close-button {top:0;right:0;width:37px;height:26px;border-radius:0;color:#55efda;background:#17181a;}

#shacal-glow-panel .sg-main {min-height:0;min-width:0;display:flex;flex-direction:column;border-left:2px solid #101114;background:#222326;}
#shacal-glow-panel .panel-tabs {display:grid;grid-template-columns:repeat(6,1fr);gap:0;border-bottom:1px solid #111;flex-shrink:0;}
#shacal-glow-panel .panel-tab {height:55px;border:0;border-right:1px solid #151618;border-radius:0;background:#242528;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:3px;font-size:8px;padding:4px;color:#a4a8af;box-shadow:none;}
#shacal-glow-panel .panel-tab.active {color:#031612;background:#39dfc6;box-shadow:inset 0 -3px #bfffee;}
#shacal-glow-panel .sg-nav-icon {display:block;width:23px;height:23px;}
#shacal-glow-panel .sg-nav-icon svg {width:100%;height:100%;}
#shacal-glow-panel .sg-page-heading {padding:15px 17px 13px;border-bottom:1px solid #111;flex-shrink:0;background:#202124;}
#shacal-glow-panel .sg-page-heading small {display:none;}
#shacal-glow-panel .sg-page-heading h2 {font-size:18px;letter-spacing:-.5px;margin:0 0 3px;}
#shacal-glow-panel .sg-page-heading p {font-size:10px;margin:0;color:#959ba4;}
#shacal-glow-panel .body {padding:15px 16px;min-height:0;}
#shacal-glow-panel .section {margin-bottom:18px;padding-bottom:18px;}
#shacal-glow-panel .section-title {color:#b2bbc5;font-size:9px;letter-spacing:1.3px;margin-bottom:11px;}
#shacal-glow-panel .channel-card {background:#1b1c20;border-color:#32363e;border-radius:2px;padding:9px 11px;}
#shacal-glow-panel .channel-head {margin-bottom:5px;}
#shacal-glow-panel select {background:#191a1d;border-color:#35383e;border-radius:2px;}
#shacal-glow-panel .drop-mode-option {padding:8px 5px;background:#191a1d;border-radius:2px;}
#shacal-glow-panel .drop-mode-option:has(input:checked) {background:#23423d;border-color:#43bda9;}
#shacal-glow-panel .control-grid {gap:10px;}
#shacal-glow-panel .sound-row {grid-template-columns:1fr 90px;}

#shacal-glow-panel .sg-save-footer {height:82px;padding:7px 30px 7px 22px;background:#191a1d;border-top:2px solid #101114;}
#shacal-glow-panel .sg-save-settings {height:62px;flex:0 0 62px;border-radius:50%;background:#181d22;color:#8ffbe5;border:2px solid #38e4c3;font-size:8px;letter-spacing:.1px;box-shadow:0 0 15px #21ecc420;}
#shacal-glow-panel .sg-save-settings.sg-save-pending {background:#251c34;border-color:#ae78f3;color:#ecdaff;box-shadow:0 0 18px #8950e53a;}
#shacal-glow-panel .sg-save-hint {font-size:10px;}
@media(max-width:1130px){#shacal-glow-panel{width:calc(100vw - 24px);}}
@media(max-width:760px){#shacal-glow-panel .sg-main{flex:1;border-left:0;}#shacal-glow-panel .panel-tabs{display:grid;}#shacal-glow-panel .panel-tab{height:43px;flex-direction:row;gap:7px;}#shacal-glow-panel .sg-nav-icon{width:17px;height:17px;}#shacal-glow-panel .header{padding-left:12px;}#shacal-glow-panel .brand-title{font-size:19px;}#shacal-glow-panel .brand-subtitle{display:none;}#shacal-glow-panel .sg-save-footer{padding:8px 16px;}#shacal-glow-panel .sound-row{grid-template-columns:1fr 90px;}}
@media(prefers-reduced-motion:reduce){#shacal-glow-panel *{transition:none!important;}}


`;
ctx.SHACAL_COMPACT_CSS = `#shacal-glow-panel {width:760px;background:#030406;border-color:#34454a;box-shadow:0 24px 80px #000d,0 0 24px #00ebca15;}
#shacal-glow-panel .header {background:#07090c;border-bottom:1px solid #00e7c540;}
#shacal-glow-panel .brand-title {color:#fff;}
#shacal-glow-panel .sg-compact-workspace {display:block;height:calc(100% - 150px);}
#shacal-glow-panel .sg-main {height:100%;border:0;background:#06080b;}
#shacal-glow-panel .panel-tab {background:#090c10;color:#98a6b6;}
#shacal-glow-panel .panel-tab.active {background:#00f1ce;color:#001914;box-shadow:inset 0 -3px #a9fff4,0 0 20px #00efcc25;}
#shacal-glow-panel .sg-page-heading {background:#030507;border-color:#1d2732;}
#shacal-glow-panel .channel-card,#shacal-glow-panel .rarity-row {background:#0a0d13;border-color:#28313e;}
#shacal-glow-panel .channel-grid {grid-template-columns:repeat(3,minmax(0,1fr));}
#shacal-glow-panel .channel-card .row {grid-template-columns:52px minmax(0,1fr) 24px;gap:5px;}
#shacal-glow-panel .channel-name {font-size:10px;gap:5px;}
#shacal-glow-panel .channel-number {display:none;}
#shacal-glow-panel input[type=range] {accent-color:#00f1ce;}
#shacal-glow-panel select,#shacal-glow-panel .chat-template {background:#040609;border-color:#334051;color:#e5edf8;}
#shacal-glow-panel input[type=checkbox]:checked {background:#006f61;border-color:#00f1ce;}
#shacal-glow-panel input[type=checkbox]:checked::after {background:#00ffdb;}
#shacal-glow-panel .chat-preview {background:#160922;border-color:#963fff;color:#dfbdff;}
#shacal-glow-panel #sg-chat-test {background:#6823ba;border-color:#b76aff;color:#fff;box-shadow:0 0 12px #a23cff30;}
#shacal-glow-panel .frames-note {background:#0b121c;color:#adbdcf;}
#shacal-glow-panel .sg-save-footer {height:92px;display:grid;grid-template-columns:minmax(0,1fr) 170px 64px;gap:18px;padding:12px 20px;background:#040609;border-color:#22303c;}
#shacal-glow-panel .sg-save-settings {grid-column:3;grid-row:1;}
#shacal-glow-panel .sg-save-hint {grid-column:1;grid-row:1;}
#shacal-glow-panel .sg-transparency {grid-column:2;grid-row:1;display:grid;grid-template-columns:1fr 29px;gap:7px;color:#c8d6e6;font-size:10px;}
#shacal-glow-panel .sg-transparency>span {grid-column:1/-1;}
#shacal-glow-panel .sg-transparency output {color:#00f1ce;font:10px Consolas,monospace;}
@media(max-width:790px){#shacal-glow-panel{width:calc(100vw - 24px);}}
@media(max-width:620px){#shacal-glow-panel .channel-grid{grid-template-columns:1fr;}#shacal-glow-panel .sg-save-footer{grid-template-columns:minmax(0,1fr) 64px;gap:8px;}#shacal-glow-panel .sg-save-settings{grid-column:2;grid-row:1/3;}#shacal-glow-panel .sg-save-hint{grid-column:1;grid-row:2;font-size:8px;}#shacal-glow-panel .sg-transparency{grid-column:1;grid-row:1;max-width:240px;}#shacal-glow-panel .sg-transparency>span{font-size:9px;}}
`;
ctx.SHACAL_BORDER_CSS = `
/* Wyrazista ramka: turkus przechodzi w purpurę na całym obwodzie. */
#shacal-glow-panel {
    border: 3px solid transparent;
    border-radius: 8px;
    background: linear-gradient(#030406, #030406) padding-box,
        linear-gradient(125deg, #00f1ce 0%, #24c8dc 24%, #9b42ff 52%, #d44cff 72%, #00f1ce 100%) border-box;
    box-shadow: 0 24px 80px #000d, -5px 0 22px #00eacb32, 5px 0 22px #b448ff40;
}
`;
ctx.SHACAL_CONTROLS_CSS = `/* Dotykowe kontrolki: światło, głębia i wyraźny stan wciśnięcia. */
#shacal-glow-panel button,
#shacal-glow-panel select,
#shacal-glow-panel .drop-mode-option {
    transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease, transform .1s ease, filter .16s ease;
}
#shacal-glow-panel button:not(.panel-tab):not(.close-button):not(.sg-save-settings) {
    background-image: linear-gradient(180deg,#ffffff12,#ffffff00 48%,#00000035);
    border-top-color:#7c8b9b;
    box-shadow: inset 0 1px 0 #ffffff22, inset 0 -1px 0 #0008, 0 3px 0 #030508, 0 5px 9px #0005;
    border-radius:5px;
}
#shacal-glow-panel button:not(:disabled):hover {
    filter:brightness(1.15);
    border-color:#28dfce;
}
#shacal-glow-panel button:not(.panel-tab):not(.close-button):not(.sg-save-settings):not(:disabled):hover {
    box-shadow:inset 0 1px 0 #ffffff30,0 3px 0 #030508,0 0 13px #27efd52b;
}
#shacal-glow-panel button:not(:disabled):active {
    transform:translateY(2px);
    filter:brightness(.93);
    box-shadow:inset 0 2px 5px #0009,0 1px 0 #ffffff12;
}
#shacal-glow-panel button:focus-visible,
#shacal-glow-panel input:focus-visible,
#shacal-glow-panel select:focus-visible,
#shacal-glow-panel textarea:focus-visible {
    outline:2px solid #ad69ff;outline-offset:3px;
}
#shacal-glow-panel .panel-tab {
    background-image:linear-gradient(180deg,#ffffff0d,transparent 55%,#0004);
    box-shadow:inset 0 1px 0 #ffffff12,inset 0 -2px 0 #0008;
}
#shacal-glow-panel .panel-tab.active {
    background-image:linear-gradient(180deg,#a2ffed66,transparent 45%,#007a672b);
    box-shadow:inset 0 1px 0 #d0fff8,inset 0 -3px 0 #008b78,0 0 16px #00edca25;
}
#shacal-glow-panel select {
    background-image:linear-gradient(180deg,#ffffff0c,transparent 65%);
    box-shadow:inset 0 1px 0 #ffffff10,0 2px 3px #0007;
}
#shacal-glow-panel select:hover {border-color:#548e93;}
#shacal-glow-panel select:active {box-shadow:inset 0 2px 5px #000a;}
#shacal-glow-panel input[type=range] {
    appearance:none;-webkit-appearance:none;
    height:24px;background:transparent;cursor:pointer;--sg-range-fill:0%;
}
#shacal-glow-panel input[type=range]::-webkit-slider-runnable-track {
    height:7px;border-radius:6px;border:1px solid #34414d;
    background:linear-gradient(90deg,#00d8b9 0%,#31ffdf var(--sg-range-fill),#0b1118 var(--sg-range-fill),#0b1118 100%);
    box-shadow:inset 0 2px 3px #0009,0 1px 0 #ffffff15;
}
#shacal-glow-panel input[type=range]::-webkit-slider-thumb {
    appearance:none;-webkit-appearance:none;width:17px;height:17px;margin-top:-6px;
    border-radius:50%;border:1px solid #91ffea;
    background:linear-gradient(150deg,#dbfff5 0%,#66ffe0 27%,#04c8b0 62%,#008b7c 100%);
    box-shadow:inset 0 1px 1px #fff9,0 2px 3px #000b,0 0 7px #00f1c944;
    transition:transform .12s,box-shadow .12s,filter .12s;
}
#shacal-glow-panel input[type=range]:hover::-webkit-slider-thumb {box-shadow:inset 0 1px 1px #fff9,0 2px 3px #000b,0 0 12px #00f1c988;}
#shacal-glow-panel input[type=range]:active::-webkit-slider-thumb {transform:scale(1.16);filter:brightness(1.15);border-color:#dab4ff;box-shadow:0 0 12px #a85bff99;}
#shacal-glow-panel input[type=range]::-moz-range-track {height:6px;border-radius:6px;background:#0b1118;border:1px solid #34414d;box-shadow:inset 0 2px 3px #0009;}
#shacal-glow-panel input[type=range]::-moz-range-progress {height:6px;border-radius:6px;background:linear-gradient(90deg,#00cbaa,#54ffe2);}
#shacal-glow-panel input[type=range]::-moz-range-thumb {width:15px;height:15px;border-radius:50%;border:1px solid #91ffea;background:linear-gradient(150deg,#d0fff3,#03cdb1 65%,#007d70);box-shadow:inset 0 1px 1px #fff9,0 2px 3px #000b,0 0 7px #00f1c944;transition:transform .12s,box-shadow .12s;}
#shacal-glow-panel input[type=range]:active::-moz-range-thumb {transform:scale(1.16);box-shadow:0 0 12px #a85bff99;}
#shacal-glow-panel input[type=checkbox] {box-shadow:inset 0 2px 4px #000b,0 1px 0 #ffffff12;transition:background .16s,border-color .16s,box-shadow .16s;}
#shacal-glow-panel input[type=checkbox]::after {background:linear-gradient(#d1dce5,#74818d);box-shadow:inset 0 1px 0 #fff7,0 1px 3px #000a;transition:left .16s ease,transform .12s,background .16s;}
#shacal-glow-panel input[type=checkbox]:checked {background:linear-gradient(#005f53,#00816e);box-shadow:inset 0 2px 3px #0007,0 0 9px #00efc322;}
#shacal-glow-panel input[type=checkbox]:checked::after {background:linear-gradient(#d9fff4,#56ffdc 45%,#00ba9f);}
#shacal-glow-panel input[type=checkbox]:active::after {transform:scale(.88);}
#shacal-glow-panel .drop-mode-option {background-image:linear-gradient(#ffffff0b,#0002);box-shadow:inset 0 1px 0 #ffffff16,0 2px 3px #0006;}
#shacal-glow-panel .drop-mode-option:active {transform:translateY(1px);box-shadow:inset 0 2px 4px #0007;}
#shacal-glow-panel .sg-save-settings {background:radial-gradient(ellipse at 35% 20%,#325a56,#102c29 53%,#060d11);box-shadow:inset 0 2px 2px #b7fff331,inset 0 -3px 4px #000a,0 4px 0 #010606,0 0 16px #00f1c52b;}
#shacal-glow-panel .sg-save-settings.sg-save-pending {background:radial-gradient(ellipse at 35% 20%,#624185,#281339 58%,#100a18);box-shadow:inset 0 2px 2px #e0bdff33,inset 0 -3px 4px #000a,0 4px 0 #06010c,0 0 16px #aa56ff40;}
#shacal-glow-panel button:disabled,#shacal-glow-panel input:disabled {filter:grayscale(.65);box-shadow:none;}
@media(prefers-reduced-motion:reduce){#shacal-glow-panel *,#shacal-glow-panel *::after{transition:none!important;}}
`;
ctx.SHACAL_DRAG_CSS = `
/* Strefa chwytu na ramce; odsunięcie treści chroni suwaki i pasek przewijania. */
#shacal-glow-panel .sg-workspace {margin:0 6px;width:calc(100% - 12px);}
#shacal-glow-panel .header {margin-top:5px;height:53px;}
#shacal-glow-panel .close-button {right:5px;top:3px;}
#shacal-glow-panel .sg-save-footer {height:87px;margin-bottom:5px;}
#shacal-glow-panel.sg-grip-hover {cursor:grab;}
#shacal-glow-panel.sg-dragging,#shacal-glow-panel.sg-dragging * {cursor:grabbing!important;user-select:none!important;}
#shacal-glow-panel.sg-dragging {box-shadow:0 24px 80px #000d,-5px 0 25px #00eacb55,5px 0 25px #b448ff66;}
`;
ctx.SHACAL_HEADER_CSS = `
/* Status aktualizacji ponad przyciskiem, w obrębie nagłówka. */
#shacal-glow-panel .brand-update-row {position:absolute;right:57px;top:3px;display:grid;grid-template-columns:auto auto;grid-template-rows:17px 24px;gap:3px 7px;align-items:center;margin:0;}
#shacal-glow-panel .brand-version {grid-column:1;grid-row:2;}
#shacal-glow-panel .header-update-button {grid-column:2;grid-row:2;min-height:24px;}
#shacal-glow-panel .header-update-status {display:block;position:static;grid-column:2;grid-row:1;justify-self:center;max-width:180px;box-sizing:border-box;padding:2px 8px;border:1px solid #29cbb35c;border-radius:4px;background:linear-gradient(#10221f,#080e12);box-shadow:inset 0 1px 0 #baffec10;color:#8bffe7;font:9px/11px 'Segoe UI',sans-serif;white-space:nowrap;}
#shacal-glow-panel .header-update-status:empty {visibility:hidden;}
#shacal-glow-panel .close-button {position:absolute;right:7px;top:6px;width:32px;height:32px;min-width:32px;min-height:32px;box-sizing:border-box;padding:0;margin:0;display:grid;place-items:center;border:1px solid #456269;border-radius:5px;background:linear-gradient(#18292d,#091216);color:#76ffe4;font:400 23px/1 Arial,sans-serif;box-shadow:inset 0 1px 0 #c5fff522,0 2px 3px #0009;}
#shacal-glow-panel .close-button:hover {background:linear-gradient(#da4c7c,#9d224b);border-color:#ff8db0;color:#fff;}
#shacal-glow-panel .close-button svg {display:block;width:14px;height:14px;pointer-events:none;}
@media(max-width:600px){#shacal-glow-panel .header{height:77px;}#shacal-glow-panel .sg-compact-workspace{height:calc(100% - 174px);}#shacal-glow-panel .brand-update-row{position:static;margin-top:4px;justify-content:start;}#shacal-glow-panel .brand-title{font-size:17px;}#shacal-glow-panel .header-update-status{display:block;}#shacal-glow-panel .close-button{top:6px;right:6px;}}
`;
ctx.SHACAL_CAT_CSS = `
#shacal-glow-panel .sound-row {grid-template-columns:minmax(0,1fr) minmax(0,1fr) 100px;gap:12px;align-items:end;}
#shacal-glow-panel .sg-sound-preview {display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:12px 0 22px;}
#shacal-glow-panel .sg-sound-preview button {padding:8px 12px;color:#b7ffef;background-color:#12352f;border:1px solid #459d8f;font-size:9px;cursor:pointer;}
#shacal-glow-panel .sg-sound-preview .hint {flex-basis:100%;font-size:10px;color:#9cabbc;}
@media(max-width:600px){#shacal-glow-panel .sound-row{grid-template-columns:1fr;} }
`;
ctx.SHACAL_QUESTION_CSS = `
#shacal-glow-panel .sg-call-mode{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;}
#shacal-glow-panel .sg-call-mode label{display:flex;align-items:center;gap:10px;padding:12px;background:#0a1118;border:1px solid #34424e;border-radius:5px;cursor:pointer;}
#shacal-glow-panel .sg-call-mode label:has(input:checked){border-color:#00dfc3;background:#09241f;box-shadow:inset 0 1px #65ffe322;}
#shacal-glow-panel .sg-call-mode input{accent-color:#00e8c8;}
#shacal-glow-panel .sg-call-mode span{font-size:11px;color:#d9f9ef;}#shacal-glow-panel .sg-call-mode small{display:block;color:#92a4b5;font-size:9px;margin-top:4px;}
#sg-call-question{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2000100;width:min(222px,calc(100vw - 28px));max-height:calc(100vh - 28px);overflow:auto;box-sizing:border-box;padding:12px;touch-action:none;cursor:move;border:2px solid #52dfd0;border-radius:9px;background:linear-gradient(145deg,#0d1d21,#110a20);box-shadow:0 20px 60px #000c,0 0 22px #8844da66;color:#e3eef5;font:12px/1.5 'Segoe UI',sans-serif;}
#sg-call-question h3{margin:0 0 8px;font-size:17px;text-align:center;color:#fff;}#sg-call-question .sg-call-target{text-align:center;color:#8affe5;font-size:11px;overflow-wrap:anywhere;}
#sg-call-question .sg-call-message{background:#03070999;border:1px solid #394251;border-radius:4px;padding:8px;margin:8px 0;text-align:left;color:#bfcbdc;overflow-wrap:anywhere;white-space:pre-wrap;}
#sg-call-question .sg-call-buttons{display:flex;gap:10px;margin-top:12px;}#sg-call-question button{flex:1;padding:8px;border:1px solid #32dbc1;border-radius:5px;background:linear-gradient(#236859,#10362d);color:#defff5;font-weight:700;cursor:pointer;box-shadow:inset 0 1px #fff2,0 2px #000;}
#sg-call-question #sg-call-no{border-color:#a96aeb;background:linear-gradient(#4c306b,#281c39);color:#eddbff;}#sg-call-question button:hover{filter:brightness(1.2);}#sg-call-question button:active{transform:translateY(1px);}#sg-call-question button:focus-visible{outline:2px solid #fff;outline-offset:2px;}
@media(max-width:600px){#shacal-glow-panel .sg-call-mode{grid-template-columns:1fr;}}
`;
ctx.SHACAL_GAME_CSS = `            /*
             * Wyłączamy dokładnie natywny różowy glow Margonem:
             * 1) zewnętrzny .loot-wnd::after
             * 2) wewnętrzny .item::before dla legendy
             */
            .loot-wnd.shacal-custom-glow::after {
                content: none !important;
                box-shadow: none !important;
                opacity: 0 !important;
                background: none !important;
                filter: none !important;
                border: 0 !important;
                outline: 0 !important;
            }

            .loot-wnd.shacal-custom-glow
            .item[data-frame-mania-rarity="legendary"]::before,
            .loot-wnd.shacal-custom-glow
            .item[data-item-type="t-leg"]::before {
                content: none !important;
                box-shadow: none !important;
                opacity: 0 !important;
                background: none !important;
                filter: none !important;
            }

            .loot-wnd.shacal-custom-glow {
                box-shadow: none !important;
                filter: none !important;
            }

            /*
             * Glow okna Łupy nadal jest osobnym fixed overlayem w BODY.
             * Mapowy glow ma osobną klasę poniżej i jest rodzeństwem .game-layer w .interface-layer.
             */
            .shacal-glow-overlay {
                position: fixed;
                pointer-events: none;
                box-sizing: border-box;
                border-radius: 3px;
                transform-origin: center center;
                opacity: 1;
                background: transparent;
                border-image-repeat: stretch;
            }

            .shacal-map-neon-frame {
                position: absolute;
                pointer-events: none;
                box-sizing: border-box;
                border: 0 solid transparent;
                border-radius: 0;
                background: transparent;
                transform-origin: center center;
                z-index: auto;
            }

            /*
             * Neon 80s — biała rurka mapy jest rozbita na 4 linie,
             * aby każdą krawędź dało się wyrównać osobno co do piksela.
             *
             * Korekta zaakceptowana dla obecnego layoutu:
             * góra  -3 px
             * prawa -3 px w osi Y
             * dół   +2 px
             * lewa  -1 px
             */
            .shacal-map-neon-core {
                position: absolute;
                display: none;
                pointer-events: none;
                background: rgba(255,255,255,0.98);
                box-shadow:
                    0 0 2px rgba(255,255,255,.95),
                    0 0 4px rgba(255,255,255,.58);
            }

            .shacal-map-neon-core-top {
                left: 0;
                right: 0;
                top: -3px;
                height: 2px;
            }

            .shacal-map-neon-core-right {
                right: 0;
                top: -3px;
                width: 2px;
                height: 100%;
            }

            .shacal-map-neon-core-bottom {
                left: 0;
                right: 0;
                bottom: -2px;
                height: 2px;
            }

            .shacal-map-neon-core-left {
                left: -1px;
                top: 0;
                bottom: 0;
                width: 2px;
            }

            .shacal-neon-item-frame {
                position: fixed;
                pointer-events: none;
                box-sizing: border-box;
                border: 1px solid rgba(255,255,255,0.98);
                border-radius: 1px;
                background: transparent;
            }

            .shacal-glow-neon {
                outline: none !important;
            }

            .shacal-test-loot-window {
                position: fixed !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: ${ctx.SHACAL_UI_PANEL_Z - 2} !important;
                display: block !important;
            }

            .shacal-test-badge {
                position: absolute;
                right: 8px;
                top: 6px;
                z-index: 20;
                pointer-events: none;
                opacity: .65;
                font-size: 10px;
            }

            #shacal-lg-launcher {
                position: fixed;
                width: 46px;
                height: 46px;
                z-index: ${ctx.SHACAL_UI_LAUNCHER_Z};
                background-image: var(--sg-lg-icon);
                background-size: 46px 46px;
                background-position: center;
                background-repeat: no-repeat;
                /* Odcinamy czarne narożniki kwadratowego PNG bez edycji samej grafiki. */
                clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
                -webkit-clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
                background-color: transparent !important;
                border: 0 !important;
                outline: 0 !important;
                box-shadow: none !important;
                filter: none !important;
                cursor: grab;
                user-select: none;
                -webkit-user-select: none;
                touch-action: none;
                opacity: .70;
                transition: transform .14s ease, filter .14s ease, opacity .14s ease;
            }

            #shacal-lg-launcher:hover {
                transform: scale(1.07);
                opacity: 1;
            }

            #shacal-lg-launcher.dragging {
                cursor: grabbing;
                transform: scale(.97);
            }

            #shacal-lg-launcher.shacal-update-available::after {
                content: "!";
                position: absolute;
                right: 5px;
                top: 5px;
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(255,255,255,.92);
                border-radius: 50%;
                background: #cf334e;
                color: #fff;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 10px;
                font-weight: 900;
                line-height: 1;
                text-shadow: 0 1px 1px rgba(0,0,0,.85);
                box-shadow:
                    0 0 0 1px rgba(0,0,0,.75),
                    0 0 8px rgba(207,51,78,.78);
                pointer-events: none;
            }

            .sg-upgrade-host { isolation: isolate; }
            .sg-upgrade-relative { position: relative !important; }
            .shacal-upgrade-badge {
                position: absolute !important;
                width: 12px;
                height: 12px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none !important;
                user-select: none;
                font-family: Arial, sans-serif;
                font-size: 9px;
                line-height: 1;
                font-weight: 800;
                letter-spacing: -.35px;
                color: #fff;
                text-shadow: 0 1px 2px rgba(0,0,0,.95);
                transform: translate(-1px, 1px);
                /*
                 * Warstwa HUD itemu. Nie podnosimy i nie modyfikujemy
                 * natywnych tooltipów Margonem.
                 */
                z-index: 3 !important;
            }

            .shacal-upgrade-badge[data-style="1"] {
                border-radius: 3px;
                background: rgba(7,16,20,.94);
                border: 1px solid rgba(91,232,224,.92);
                box-shadow:
                    0 0 3px rgba(74,224,216,.48),
                    inset 0 0 3px rgba(116,255,247,.12);
            }

            .shacal-upgrade-badge[data-style="2"] {
                border-radius: 50%;
                background:
                    radial-gradient(circle at 35% 30%, #5a2b74 0, #2a0d3a 68%, #120719 100%);
                border: 1px solid rgba(218,105,255,.95);
                box-shadow: 0 0 4px rgba(192,69,255,.5);
            }

            .shacal-upgrade-badge[data-style="3"] {
                width: 10px;
                height: 10px;
                border-radius: 2px;
                background: rgba(3,5,7,.90);
                border: 1px solid rgba(225,235,240,.70);
                color: #e7f0f2;
                font-size: 8px;
                box-shadow: 0 0 2px rgba(0,0,0,.75);
            }

            .shacal-upgrade-badge[data-style="4"] {
                width: 13px;
                height: 11px;
                border-radius: 0 0 0 5px;
                background:
                    linear-gradient(135deg, rgba(12,12,16,.98), rgba(52,26,68,.96));
                border-left: 1px solid rgba(115,236,232,.86);
                border-bottom: 1px solid rgba(195,94,255,.86);
                box-shadow:
                    -1px 1px 3px rgba(0,0,0,.45),
                    0 0 3px rgba(153,84,255,.24);
            }

            .shacal-upgrade-badge[data-style="5"] {
                width: 11px;
                height: 11px;
                border-radius: 2px;
                background: rgba(20,11,5,.96);
                border: 1px solid rgba(255,174,54,.95);
                color: #ffe2a3;
                box-shadow:
                    0 0 4px rgba(255,111,24,.45),
                    inset 0 0 3px rgba(255,204,91,.18);
            }

            .shacal-upgrade-badge[data-style="6"] {
                width: 11px;
                height: 11px;
                border-radius: 50%;
                background: rgba(4,18,9,.96);
                border: 1px solid rgba(93,227,102,.92);
                color: #c9ffd0;
                box-shadow:
                    0 0 4px rgba(61,211,87,.42),
                    inset 0 0 3px rgba(137,255,152,.14);
            }

            .shacal-upgrade-badge[data-style="7"] {
                width: 12px;
                height: 12px;
                border-radius: 1px;
                background:
                    linear-gradient(135deg, rgba(25,25,29,.98), rgba(5,5,7,.98));
                border: 1px solid rgba(214,176,84,.92);
                color: #f8dc95;
                box-shadow:
                    0 0 3px rgba(214,176,84,.35),
                    inset 0 0 0 1px rgba(0,0,0,.52);
            }

            .shacal-upgrade-badge[data-style="8"] {
                width: 11px;
                height: 11px;
                border-radius: 2px;
                background:
                    linear-gradient(135deg, rgba(16,4,8,.98), rgba(57,7,18,.96));
                border: 1px solid rgba(224,57,78,.95);
                color: #ffd5da;
                box-shadow: 0 0 4px rgba(208,29,54,.48);
            }

            .shacal-upgrade-badge[data-style="9"] {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background:
                    radial-gradient(circle at 36% 30%, rgba(102,20,20,.98), rgba(28,3,5,.98) 72%);
                border: 1px solid rgba(255,96,65,.95);
                color: #ffd7c9;
                box-shadow:
                    0 0 5px rgba(255,62,34,.42),
                    inset 0 0 3px rgba(255,155,116,.14);
            }

            .shacal-upgrade-badge[data-style="10"] {
                width: 11px;
                height: 11px;
                border-radius: 2px;
                background:
                    linear-gradient(135deg, rgba(5,11,28,.98), rgba(10,35,73,.96));
                border: 1px solid rgba(70,156,255,.95);
                color: #d6eaff;
                box-shadow: 0 0 4px rgba(50,133,255,.46);
            }

            .shacal-upgrade-badge[data-style="11"] {
                width: 11px;
                height: 11px;
                border-radius: 2px;
                background:
                    linear-gradient(135deg, rgba(12,4,24,.98), rgba(55,13,81,.96));
                border: 1px solid rgba(175,93,255,.96);
                color: #ead6ff;
                box-shadow:
                    0 0 4px rgba(153,70,255,.48),
                    inset 0 0 3px rgba(225,188,255,.13);
            }

            .shacal-upgrade-badge[data-style="12"] {
                width: 10px;
                height: 10px;
                border-radius: 0;
                background: rgba(1,1,2,.92);
                border: 1px solid rgba(130,130,136,.82);
                color: #e8e8ea;
                font-size: 8px;
                box-shadow: none;
            }

            .shacal-upgrade-badge[data-style="13"] {
                width: 13px;
                height: 10px;
                border-radius: 5px;
                background: rgba(2,11,12,.94);
                border: 1px solid rgba(49,205,198,.88);
                color: #bffbf7;
                box-shadow:
                    0 0 3px rgba(49,205,198,.36),
                    inset 0 0 4px rgba(49,205,198,.10);
            }

            .shacal-upgrade-badge[data-style="14"] {
                width: 12px;
                height: 12px;
                border-radius: 3px;
                background:
                    linear-gradient(135deg, rgba(29,29,31,.96), rgba(7,7,8,.96));
                border-top: 1px solid rgba(244,244,244,.9);
                border-left: 1px solid rgba(184,184,190,.75);
                border-right: 1px solid rgba(58,58,61,.9);
                border-bottom: 1px solid rgba(32,32,34,.95);
                color: #f5f5f6;
                box-shadow:
                    0 1px 2px rgba(0,0,0,.65),
                    inset 0 0 3px rgba(255,255,255,.08);
            }

            .shacal-upgrade-badge[data-style="15"] {
                width: 11px;
                height: 11px;
                border-radius: 2px;
                background:
                    linear-gradient(135deg, rgba(18,13,3,.98), rgba(69,50,5,.96));
                border: 1px solid rgba(235,201,68,.95);
                color: #fff3a8;
                text-shadow:
                    0 1px 1px rgba(0,0,0,.95),
                    0 0 2px rgba(255,221,90,.6);
                box-shadow: 0 0 4px rgba(222,180,42,.4);
            }

            .shacal-upgrade-badge[data-style="16"] {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: rgba(0,0,0,.72);
                border: 0;
                color: #fff;
                font-size: 8px;
                box-shadow:
                    0 0 0 1px rgba(255,255,255,.35),
                    0 0 3px rgba(0,0,0,.8);
            }

            .shacal-upgrade-badge.shacal-upgrade-rarity-sync {
                background:
                    linear-gradient(
                        135deg,
                        var(--sg-upgrade-dark, rgba(4,7,9,.96)),
                        var(--sg-upgrade-color, rgba(19,72,80,.96))
                    ) !important;
                border-color:
                    var(--sg-upgrade-bright, rgba(94,235,228,.92)) !important;
                color:
                    var(--sg-upgrade-text, #fff) !important;
                text-shadow:
                    0 1px 2px rgba(0,0,0,.96),
                    0 0 3px var(--sg-upgrade-glow, rgba(74,224,216,.45)) !important;
                box-shadow:
                    0 0 4px var(--sg-upgrade-glow, rgba(74,224,216,.45)),
                    inset 0 0 3px rgba(255,255,255,.10) !important;
            }

            .shacal-chat-emote {
                display: inline-block !important;
                width: 22px !important;
                height: 22px !important;
                min-width: 22px !important;
                max-width: 22px !important;
                min-height: 22px !important;
                max-height: 22px !important;
                object-fit: contain !important;
                vertical-align: middle !important;
                margin: -3px 2px -3px 2px !important;
                border: 0 !important;
                outline: 0 !important;
                box-shadow: none !important;
                background: transparent !important;
                pointer-events: none !important;
            }

`;
ctx.lootVisibilityObserver = new MutationObserver(mutations => {
        if (mutations.some(m => m.target instanceof Element && m.target.matches('.loot-wnd') && m.oldValue !== m.target.getAttribute(m.attributeName))) ctx.queueLootWindowSync();
    });
ctx.lootVisibilityObserver.observe(document.body, {subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['style', 'class']});
ctx.startHeroNoticeObserver();
ctx.updateDynamicStyles();
ctx.createPanel();
ctx.startE2Relogger();
setTimeout(() => {
        ctx.checkForShacalUpdate({
            silent: true
        });
    }, 2500);
if (ctx.addonFeatureEnabled('chatAnnouncementsEnabled')) {
        ctx.primeLegendaryChatTracker();
    }
ctx.initialGlowPanel = document.getElementById('shacal-glow-panel');
if (ctx.initialGlowPanel) {
        ctx.initialGlowPanel.style.display = 'none';
    }
ctx.syncUpgradeBadges();
[60, 180, 420, 850].forEach(delay => {
        setTimeout(() => {
            if (ctx.addonFeatureEnabled('upgradeBadgeEnabled')) {
                ctx.syncUpgradeBadges();
            }
        }, delay);
    });
ctx.updateLootWindows();
ctx.requestGlowOverlayFrame();
requestAnimationFrame(ctx.syncUpgradeBadgePositionsFrame);
ctx.refreshChatEmoticons();
ctx.captureSettingsSignatures();
ctx.lgWorldObserver = new MutationObserver(() => {
        if (!ctx.lgLauncherCreated && ctx.isGameWorldLoaded()) {
            ctx.createLGLauncher();
            ctx.lgWorldObserver.disconnect();
        }
    });
ctx.lgWorldObserver.observe(document.body, {
        childList: true, subtree: true
    });
if (ctx.isGameWorldLoaded()) {
        ctx.createLGLauncher();
        ctx.lgWorldObserver.disconnect();
    }}});
})(window.ShacalRuntime);
