/* Shacal ramki-dymki 6.3.5 */
(function(runtime){'use strict';const unsafeWindow=window;const GM_xmlhttpRequest=runtime.request;
runtime.registerPart("modules/frames-and-tips.js", {declare(ctx){ctx.buildItemRarityFrameCss = function buildItemRarityFrameCss() {
        if (!ctx.addonFeatureEnabled('itemFramesEnabled')) return '';
        // Torby mają natywną klasę `.bag`; zostawiamy ich wygląd bez zmian.
        const rarityFrames = [ {
                enabled: false, rarity: 'common', fallback: 't-norm', color: 'transparent', glow: 'transparent', bright: 'transparent', dark: 'transparent'
            }, {
                enabled: ctx.addonFeatureEnabled('itemFramesEnabled') && ctx.settings.frameUnique, rarity: 'unique', fallback: 't-uniupg', color: '#927019', glow: 'rgba(146,112,25,.52)',
                bright: '#c0922c', dark: '#261b04'
            }, {
                enabled: ctx.addonFeatureEnabled('itemFramesEnabled') && ctx.settings.frameHeroic, rarity: 'heroic', fallback: 't-her', color: '#1d6f9c', glow: 'rgba(29,111,156,.52)', bright: '#3395c2',
                dark: '#071f2c'
            }, {
                enabled: ctx.addonFeatureEnabled('itemFramesEnabled') && ctx.settings.frameUpgraded, rarity: 'upgraded', fallback: 't-upgraded', color: '#087a32', glow: 'rgba(8,122,50,.54)',
                bright: '#10a447', dark: '#031c0c'
            }, {
                enabled: ctx.addonFeatureEnabled('itemFramesEnabled') && ctx.settings.frameLegendary, rarity: 'legendary', fallback: 't-leg', color: '#e842a2', glow: 'rgba(232,66,162,.76)',
                bright: '#ffb5e3', dark: '#74164d'
            } ];
        const requestedFrameSet = Number(ctx.settings.itemFrameSet) || 1;
        const frameSet = ctx.VALID_FRAME_SETS .includes(requestedFrameSet)
                ? requestedFrameSet
                : 1;
        const transparentFrameCss = () => `
            outline: 0 !important;
            outline-offset: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            filter: none !important;
        `;
        const buildPresetCss = frame => {
            if (frame.rarity === 'common' || !frame.enabled) {
                return ctx.settings.overrideGameItemFrames
                    ? transparentFrameCss()
                    : '';
            }
            const c = frame.color;
            const g = frame.glow;
            const b = frame.bright;
            const d = frame.dark;
            const legendaryPalettes = {
                20: { c:'#d52d2d', b:'#ff6952', d:'#5c0c12', g:'rgba(205,28,38,.62)' }, 21: { c:'#e85b22', b:'#ff9442', d:'#7e1e08', g:'rgba(238,74,18,.54)' },
                22: { c:'#d96b1f', b:'#ffa84a', d:'#9d360d', g:'rgba(220,77,16,.62)' }, 23: { c:'#b72b39', b:'#e04349', d:'#4d0812', g:'rgba(154,22,34,.60)' },
                24: { c:'#e07a25', b:'#f68230', d:'#79190b', g:'rgba(215,60,20,.58)' }, 25: { c:'#8cbf35', b:'#a9d64c', d:'#365814', g:'rgba(104,153,35,.56)' },
                26: { c:'#c8652c', b:'#db6f3b', d:'#6a2448', g:'rgba(165,56,50,.54)' }, 27: { c:'#861526', b:'#b92b3b', d:'#180309', g:'rgba(145,18,37,.58)' }
            };
            const lp = frame.rarity === 'legendary'
                ? legendaryPalettes[frameSet]
                : null;
            const pc = lp ? lp.c : c;
            const pg = lp ? lp.g : g;
            const pb = lp ? lp.b : b;
            const pd = lp ? lp.d : d;
            const customSpriteOffset = {
                unique: -32, heroic: -64, upgraded: -96, legendary: -128
            }[frame.rarity] ?? 0;
            switch (frameSet) {
                case 2: // Shadowbound
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: -1px !important;
                        border-radius: 2px !important;
                        background:
                            linear-gradient(135deg, rgba(0,0,0,.38), transparent 38%),
                            linear-gradient(315deg, rgba(0,0,0,.48), transparent 42%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 0 2px rgba(0,0,0,.82),
                            inset 0 0 8px ${g},
                            0 0 3px rgba(0,0,0,.95),
                            0 0 7px ${g} !important;
                    `;
                case 3: // Crystal Veil
                    return `
                        outline: 1px solid ${b} !important;
                        outline-offset: -1px !important;
                        border-radius: 1px !important;
                        background:
                            linear-gradient(135deg, rgba(255,255,255,.17) 0 10%, transparent 11% 44%, rgba(255,255,255,.09) 45% 52%, transparent 53%),
                            linear-gradient(315deg, ${g}, transparent 35%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 4px rgba(255,255,255,.35),
                            inset 0 0 9px ${g},
                            0 0 3px ${b},
                            0 0 8px ${g} !important;
                    `;
                case 7: // Royal Crest
                    return `
                        outline: 1px solid ${b} !important;
                        outline-offset: -1px !important;
                        border-radius: 2px !important;
                        background:
                            linear-gradient(90deg, transparent 0 12%, rgba(255,255,255,.12) 13% 16%, transparent 17% 83%, rgba(255,255,255,.12) 84% 87%, transparent 88%),
                            linear-gradient(180deg, rgba(255,255,255,.10), transparent 28%, rgba(0,0,0,.22)) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 0 3px rgba(20,14,6,.60),
                            inset 0 0 8px ${g},
                            0 0 4px ${g} !important;
                    `;
                case 8: // Hexed Edge
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: -1px !important;
                        border-radius: 5px 1px 5px 1px !important;
                        background:
                            radial-gradient(circle at 0 0, ${g}, transparent 34%),
                            radial-gradient(circle at 100% 100%, ${g}, transparent 34%),
                            linear-gradient(135deg, rgba(0,0,0,.40), transparent 55%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 10px ${g},
                            0 0 3px ${d},
                            0 0 14px ${g} !important;
                    `;
                case 9: // Clean Line
                    return `
                        outline: 1px solid ${c} !important;
                        outline-offset: -1px !important;
                        border-radius: 1px !important;
                        background: none !important;
                        box-shadow:
                            inset 0 0 0 1px rgba(255,255,255,.10),
                            0 0 2px ${g} !important;
                    `;
                case 11: // Emberglass
                    return `
                        outline: 1px solid ${c} !important;
                        outline-offset: -1px !important;
                        border-radius: 0 !important;
                        background:
                            linear-gradient(180deg, ${c} 0%, ${d} 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px rgba(255,255,255,.18),
                            inset 0 0 7px ${g},
                            0 0 5px ${g} !important;
                    `;
                case 12: // Abyssal Forge
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: -1px !important;
                        border-radius: 2px !important;
                        background:
                            linear-gradient(135deg, rgba(0,0,0,.44), transparent 38%),
                            linear-gradient(315deg, rgba(0,0,0,.54), transparent 42%),
                            linear-gradient(180deg, ${c} 0%, ${d} 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 0 2px rgba(0,0,0,.82),
                            inset 0 0 9px ${g},
                            0 0 3px rgba(0,0,0,.95),
                            0 0 7px ${g} !important;
                    `;
                case 13: // Prismheart
                    return `
                        outline: 1px solid ${b} !important;
                        outline-offset: -1px !important;
                        border-radius: 1px !important;
                        background:
                            linear-gradient(135deg, rgba(255,255,255,.34) 0 10%, transparent 11% 43%, rgba(255,255,255,.17) 44% 53%, transparent 54%),
                            linear-gradient(315deg, rgba(255,255,255,.20), transparent 38%),
                            linear-gradient(145deg, ${b} 0%, ${c} 42%, ${d} 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 5px rgba(255,255,255,.42),
                            inset 0 0 10px ${g},
                            0 0 3px ${b},
                            0 0 8px ${g} !important;
                    `;
                case 14: // Sovereign Core
                    return `
                        outline: 1px solid ${b} !important;
                        outline-offset: -1px !important;
                        border-radius: 2px !important;
                        background:
                            linear-gradient(90deg, transparent 0 12%, rgba(255,255,255,.20) 13% 16%, transparent 17% 83%, rgba(255,255,255,.20) 84% 87%, transparent 88%),
                            linear-gradient(180deg, rgba(255,255,255,.20), transparent 30%, rgba(0,0,0,.28)),
                            linear-gradient(135deg, ${b} 0%, ${c} 38%, ${d} 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 0 3px rgba(20,14,6,.58),
                            inset 0 0 9px ${g},
                            0 0 4px ${g} !important;
                    `;
                case 17: // Nightfall - wariant inspirowany 2F
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: -1px !important;
                        border-radius: 3px !important;
                        background:
                            radial-gradient(circle at 50% 42%, ${g} 0%, transparent 42%),
                            linear-gradient(145deg, rgba(0,0,0,.58) 0 22%, transparent 23% 68%, rgba(0,0,0,.62) 69%),
                            linear-gradient(180deg, ${c} 0%, ${d} 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 0 2px rgba(0,0,0,.78),
                            inset 0 0 17px ${g},
                            0 0 3px rgba(0,0,0,.95),
                            0 0 8px ${g} !important;
                    `;
                case 18: // Void Ember - wariant inspirowany 2F
                    return `
                        outline: 1px solid ${b} !important;
                        outline-offset: -1px !important;
                        border-radius: 2px !important;
                        background:
                            linear-gradient(135deg, rgba(255,255,255,.10) 0 8%, transparent 9% 48%, rgba(0,0,0,.48) 49% 100%),
                            radial-gradient(circle at 50% 52%, ${c} 0%, ${d} 72%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 0 3px rgba(0,0,0,.58),
                            inset 0 0 18px ${g},
                            0 0 2px ${b},
                            0 0 14px ${g} !important;
                    `;
                case 19: // Blackthorn - wariant inspirowany 2F
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: -1px !important;
                        border-radius: 4px 1px 4px 1px !important;
                        background:
                            linear-gradient(45deg, rgba(0,0,0,.54) 0 17%, transparent 18% 82%, rgba(0,0,0,.54) 83%),
                            linear-gradient(135deg, ${b} 0%, ${c} 38%, ${d} 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${c},
                            inset 0 0 0 2px rgba(8,8,8,.72),
                            inset 0 0 10px ${g},
                            0 0 4px ${d},
                            0 0 8px ${g} !important;
                    `;
                case 20: // Crimson Oath
                    return `
                        outline: 1px solid ${pc} !important;
                        outline-offset: -1px !important;
                        border-radius: 2px !important;
                        background:
                            radial-gradient(circle at 50% 42%, ${pc} 0%, ${pd} 52%, rgba(24,5,9,.98) 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${pb},
                            inset 0 0 9px ${pg},
                            0 0 6px ${pg} !important;
                    `;
                case 21: // Infernal Crown
                    return `
                        outline: 1px solid ${pc} !important;
                        outline-offset: -1px !important;
                        border-radius: 3px 3px 1px 1px !important;
                        background:
                            linear-gradient(180deg, ${pc} 0%, ${pd} 44%, rgba(35,8,3,.99) 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${pb},
                            inset 0 0 10px ${pg},
                            0 0 7px ${pg} !important;
                    `;
                case 22: // Molten Core
                    return `
                        outline: 1px solid ${pc} !important;
                        outline-offset: -1px !important;
                        border-radius: 2px !important;
                        background:
                            radial-gradient(circle at 50% 50%, ${pb} 0 18%, ${pc} 19% 52%, ${pd} 78% 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${pb},
                            inset 0 0 11px ${pg},
                            0 0 6px ${pg} !important;
                    `;
                case 23: // Blood Moon
                    return `
                        outline: 1px solid ${pc} !important;
                        outline-offset: -1px !important;
                        border-radius: 5px 1px 5px 1px !important;
                        background:
                            radial-gradient(circle at 68% 30%, ${pc} 0 24%, transparent 25%),
                            linear-gradient(145deg, ${pd} 0%, rgba(28,5,11,.99) 72%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${pb},
                            inset 0 0 10px ${pg},
                            0 0 7px ${pg} !important;
                    `;
                case 24: // Dragonfire
                    return `
                        outline: 1px solid ${pc} !important;
                        outline-offset: -1px !important;
                        border-radius: 1px 4px 1px 4px !important;
                        background:
                            linear-gradient(135deg, ${pb} 0 28%, ${pc} 29% 61%, ${pd} 62% 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${pb},
                            inset 0 0 9px ${pg},
                            0 0 3px ${pd},
                            0 0 7px ${pg} !important;
                    `;
                case 25: // Toxic Flame
                    return `
                        outline: 1px solid ${pc} !important;
                        outline-offset: -1px !important;
                        border-radius: 3px !important;
                        background:
                            radial-gradient(circle at 45% 46%, ${pb} 0%, ${pc} 48%, ${pd} 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${pb},
                            inset 0 0 10px ${pg},
                            0 0 7px ${pg} !important;
                    `;
                case 26: // Royal Ember
                    return `
                        outline: 1px solid ${pc} !important;
                        outline-offset: -1px !important;
                        border-radius: 2px !important;
                        background:
                            linear-gradient(145deg, ${pb} 0%, ${pc} 47%, ${pd} 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${pb},
                            inset 0 0 10px ${pg},
                            0 0 7px ${pg} !important;
                    `;
                case 27: // Blood Eclipse
                    return `
                        outline: 1px solid ${pb} !important;
                        outline-offset: -1px !important;
                        border-radius: 4px 1px 4px 1px !important;
                        background:
                            radial-gradient(circle at 50% 50%,
                                ${pd} 0%,
                                ${pd} 30%,
                                ${pc} 70%,
                                ${pb} 100%) !important;
                        box-shadow:
                            inset 0 0 0 1px ${pc},
                            inset 0 0 8px rgba(0,0,0,.64),
                            inset 0 0 9px ${pg},
                            0 0 2px ${pc},
                            0 0 5px ${pg} !important;
                    `;
                case 28: // Arcane Glass - sprite użytkownika
                    return `
                        outline: 0 !important;
                        outline-offset: 0 !important;
                        border: 0 !important;
                        border-radius: 0 !important;
                        background-color: transparent !important;
                        background-image: url("${ctx.CUSTOM_FRAME_SPRITE_1}") !important;
                        background-repeat: no-repeat !important;
                        background-size: 192px 32px !important;
                        background-position: ${customSpriteOffset}px 0 !important;
                        box-shadow: none !important;
                        filter: none !important;
                    `;
                case 29: // Arcane Stone - sprite użytkownika
                    return `
                        outline: 0 !important;
                        outline-offset: 0 !important;
                        border: 0 !important;
                        border-radius: 0 !important;
                        background-color: transparent !important;
                        background-image: url("${ctx.CUSTOM_FRAME_SPRITE_2}") !important;
                        background-repeat: no-repeat !important;
                        background-size: 192px 32px !important;
                        background-position: ${customSpriteOffset}px 0 !important;
                        box-shadow: none !important;
                        filter: none !important;
                    `;
                case 1: default: // Classic Glow
                    return `
                        outline: 1px solid ${c} !important;
                        outline-offset: -1px !important;
                        border-radius: 0 !important;
                        background: none !important;
                        box-shadow:
                            inset 0 0 0 1px rgba(255,255,255,.16),
                            inset 0 0 5px ${g},
                            0 0 5px ${g} !important;
                    `;
            }
        };
        return rarityFrames .map(frame => {
                const raritySelector =
                    `.item[data-frame-mania-rarity="${frame.rarity}"]:not(.bag)`;
                const fallbackSelector =
                    `.item[data-item-type="${frame.fallback}"]:not(.bag)`;
                const nativeFrameSuppressionCss = ctx.settings.overrideGameItemFrames
                        ? `
                            ${raritySelector} > .highlight,
                            ${fallbackSelector} > .highlight {
                                display: none !important;
                                visibility: hidden !important;
                                opacity: 0 !important;
                                background: none !important;
                                background-image: none !important;
                                border: 0 !important;
                                outline: 0 !important;
                                box-shadow: none !important;
                                filter: none !important;
                            }

                            /*
                             * Nie kasuj ::before na przedmiotach posiadających ulepszenie.
                             * Margonem / warstwa ramek wykorzystuje ten pseudo-element do
                             * sygnalizowania stanu ulepszenia (data-frame-mania-upgrade >= 0).
                             */
                            ${raritySelector}:not([data-frame-mania-upgrade])::before,
                            ${raritySelector}[data-frame-mania-upgrade="-1"]::before,
                            ${fallbackSelector}:not([data-frame-mania-upgrade])::before,
                            ${fallbackSelector}[data-frame-mania-upgrade="-1"]::before {
                                content: none !important;
                                display: none !important;
                                opacity: 0 !important;
                                background: none !important;
                                background-image: none !important;
                                border: 0 !important;
                                outline: 0 !important;
                                box-shadow: none !important;
                                filter: none !important;
                            }
                        `
                        : '';
                return `
                    ${nativeFrameSuppressionCss}

                    ${raritySelector},
                    ${fallbackSelector} {
                        ${buildPresetCss(frame)}
                    }
                `;
            }) .join('\n');
    };
ctx.buildItemTipFontCss = function buildItemTipFontCss() {
        const fontMap = {
            default: '', cinzel: '"Cinzel", Georgia, serif', cormorant: '"Cormorant Garamond", Georgia, serif', vollkorn: '"Vollkorn", Georgia, serif',
            spectral: '"Spectral", Georgia, serif', bree: '"Bree Serif", Georgia, serif', alegreya: '"Alegreya", Georgia, serif', playfair: '"Playfair Display", Georgia, serif',
            grenze: '"Grenze Gotisch", Georgia, serif', lora: '"Lora", Georgia, serif', merriweather: '"Merriweather", Georgia, serif'
        };
        const family = fontMap[ctx.settings.itemTipFont] || '';
        if (!family) {
            return '';
        }
        return `
            .tip-wrapper.normal-tip[data-type="t_item"],
            .tip-wrapper.normal-tip[data-type="t_item"] *,
            .tip-wrapper.cmp-tip[data-type="t_item"],
            .tip-wrapper.cmp-tip[data-type="t_item"] * {
                font-family: ${family} !important;
            }

            .tip-wrapper.normal-tip[data-type="t_item"] .tip-item-stat-item-name,
            .tip-wrapper.normal-tip[data-type="t_item"] .item-name,
            .tip-wrapper.cmp-tip[data-type="t_item"] .tip-item-stat-item-name,
            .tip-wrapper.cmp-tip[data-type="t_item"] .item-name {
                font-weight: 700 !important;
                letter-spacing: .10px;
            }

            .tip-wrapper.normal-tip[data-type="t_item"] .tip-item-stat-rarity,
            .tip-wrapper.normal-tip[data-type="t_item"] .item-rarity,
            .tip-wrapper.cmp-tip[data-type="t_item"] .tip-item-stat-rarity,
            .tip-wrapper.cmp-tip[data-type="t_item"] .item-rarity {
                font-weight: 600 !important;
            }
        `;
    };
ctx.buildItemTipCss = function buildItemTipCss() {
        if (!ctx.addonFeatureEnabled('itemTipsEnabled')) {
            return '';
        }
        const validSets = ctx.VALID_FRAME_SETS;
        const requestedTipSet = Number(ctx.settings.itemTipSet);
        const tipSet = requestedTipSet === 0
                ? Number(ctx.settings.itemFrameSet) || 1
                : ( validSets.includes(requestedTipSet)
                        ? requestedTipSet
                        : 1 );
        const rarities = [ {
                enabled: ctx.settings.tipUnique, rarity: 'unique', fallback: 't-uniupg', c: '#927019', g: 'rgba(146,112,25,.68)', b: '#c0922c', d: '#261b04'
            }, {
                enabled: ctx.settings.tipHeroic, rarity: 'heroic', fallback: 't-her', c: '#1d6f9c', g: 'rgba(29,111,156,.68)', b: '#3395c2', d: '#071f2c'
            }, {
                enabled: ctx.settings.tipUpgraded, rarity: 'upgraded', fallback: 't-upgraded', c: '#087a32', g: 'rgba(8,122,50,.68)', b: '#10a447', d: '#031c0c'
            }, {
                enabled: ctx.settings.tipLegendary, fallback: 't-leg', rarity: 'legendary', c: '#e842a2', g: 'rgba(232,66,162,.68)', b: '#ffb5e3', d: '#74164d'
            } ];
        const legendaryPalettes = {
            20: { c:'#d52d2d', b:'#ff6952', d:'#5c0c12', g:'rgba(205,28,38,.68)' }, 21: { c:'#e85b22', b:'#ff9442', d:'#7e1e08', g:'rgba(238,74,18,.68)' },
            22: { c:'#d96b1f', b:'#ffa84a', d:'#9d360d', g:'rgba(220,77,16,.68)' }, 23: { c:'#b72b39', b:'#e04349', d:'#4d0812', g:'rgba(154,22,34,.68)' },
            24: { c:'#e07a25', b:'#f68230', d:'#79190b', g:'rgba(215,60,20,.68)' }, 25: { c:'#8cbf35', b:'#a9d64c', d:'#365814', g:'rgba(104,153,35,.68)' },
            26: { c:'#c8652c', b:'#db6f3b', d:'#6a2448', g:'rgba(165,56,50,.68)' }, 27: { c:'#861526', b:'#b92b3b', d:'#180309', g:'rgba(145,18,37,.68)' }
        };
        const customTipPalettes = {
            28: {
                unique:    { c:'#655f00', b:'#8b8500', d:'#211f00', g:'rgba(101,98,0,.34)' }, heroic:    { c:'#00595d', b:'#00767c', d:'#001f22', g:'rgba(0,89,93,.34)' },
                upgraded:  { c:'#296500', b:'#3b8700', d:'#102300', g:'rgba(41,101,0,.34)' }, legendary: { c:'#5e001f', b:'#86002f', d:'#1c0009', g:'rgba(94,0,31,.38)' }
            }, 29: {
                unique:    { c:'#464403', b:'#656100', d:'#181700', g:'rgba(70,68,3,.30)' }, heroic:    { c:'#014347', b:'#00636a', d:'#00181a', g:'rgba(1,67,71,.30)' },
                upgraded:  { c:'#1e4603', b:'#2d6805', d:'#0c1a01', g:'rgba(30,70,3,.30)' }, legendary: { c:'#46001c', b:'#68002a', d:'#150008', g:'rgba(70,0,28,.34)' }
            }
        };
        const resolveTipPalette = frame => {
            if (customTipPalettes[tipSet]?.[frame.rarity]) {
                return customTipPalettes[tipSet][frame.rarity];
            }
            if (frame.rarity === 'legendary' && legendaryPalettes[tipSet]) {
                return legendaryPalettes[tipSet];
            }
            return { c: frame.c, g: frame.g, b: frame.b, d: frame.d };
        };
        const styleFor = frame => {
            let { c, g, b, d } = resolveTipPalette(frame);
            switch (tipSet) {
                case 2: // Shadowbound
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 0 1px ${c},
                            0 0 4px ${b},
                            0 0 7px ${g},
                            0 0 27px ${g},
                            inset 0 0 0 1px rgba(0,0,0,.72) !important;
                    `;
                case 3: // Crystal Veil
                    return `
                        outline: 1px solid ${b} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 3px ${b},
                            0 0 9px ${g},
                            0 0 29px ${g},
                            inset 0 0 0 1px ${c} !important;
                    `;
                case 7: // Royal Crest
                    return `
                        outline: 1px solid ${b} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 0 1px ${d},
                            0 0 7px ${g},
                            0 0 27px ${g},
                            inset 0 0 0 1px ${c} !important;
                    `;
                case 8: // Hexed Edge
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 0 1px ${c},
                            0 0 4px ${b},
                            0 0 10px ${g},
                            0 0 30px ${g} !important;
                    `;
                case 9: // Clean Line
                    return `
                        outline: 1px solid ${c} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 2px ${g},
                            0 0 28px ${g} !important;
                    `;
                case 11: // Emberglass
                    return `
                        outline: 1px solid ${c} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 5px ${g},
                            0 0 25px ${g},
                            inset 0 0 0 1px ${d} !important;
                    `;
                case 12: // Abyssal Forge
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 0 1px ${c},
                            0 0 4px ${b},
                            0 0 6px ${g},
                            0 0 26px ${g},
                            inset 0 0 6px rgba(0,0,0,.38) !important;
                    `;
                case 13: // Prismheart
                    return `
                        outline: 1px solid ${b} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 4px ${b},
                            0 0 8px ${g},
                            0 0 28px ${g} !important;
                    `;
                case 14: // Sovereign Core
                    return `
                        outline: 1px solid ${c} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 0 1px ${b},
                            0 0 4px ${b},
                            0 0 7px ${g},
                            0 0 27px ${g} !important;
                    `;
                case 17: // Nightfall
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 0 1px ${c},
                            0 0 4px ${b},
                            0 0 5px ${g},
                            0 0 25px ${g} !important;
                    `;
                case 18: // Void Ember
                    return `
                        outline: 1px solid ${c} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 2px ${b},
                            0 0 8px ${g},
                            0 0 28px ${g},
                            inset 0 0 0 1px ${d} !important;
                    `;
                case 19: // Blackthorn
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 0 1px ${c},
                            0 0 4px ${b},
                            0 0 4px ${g},
                            0 0 24px ${g} !important;
                    `;
                case 28: // Arcane Glass
                    return `
                        outline: 1px solid ${c} !important;
                        outline-offset: 0 !important;
                        border-radius: 1px !important;
                        background-image:
                            linear-gradient(135deg, rgba(255,255,255,.025), transparent 24%, transparent 78%, rgba(255,255,255,.015)) !important;
                        box-shadow:
                            0 0 0 1px ${d},
                            0 0 3px ${g},
                            0 0 12px ${g},
                            inset 0 0 5px ${g} !important;
                    `;
                case 29: // Arcane Stone
                    return `
                        outline: 1px solid ${d} !important;
                        outline-offset: 0 !important;
                        border-radius: 2px !important;
                        background-image:
                            radial-gradient(circle at 50% 45%, ${g}, transparent 68%),
                            linear-gradient(145deg, rgba(255,255,255,.012), rgba(0,0,0,.14)) !important;
                        box-shadow:
                            0 0 0 1px ${c},
                            0 0 3px ${g},
                            0 0 11px ${g},
                            inset 0 0 0 1px rgba(0,0,0,.64),
                            inset 0 0 6px ${g} !important;
                    `;
                case 20: // Crimson Oath
                case 21: // Infernal Crown
                case 22: // Molten Core
                case 23: // Blood Moon
                case 24: // Dragonfire
                case 25: // Toxic Flame
                case 26: // Royal Ember
                case 27: // Blood Eclipse
                    return `
                        outline: 1px solid ${b} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 0 1px ${c},
                            0 0 4px ${b},
                            0 0 6px ${g},
                            0 0 26px ${g},
                            inset 0 0 0 1px ${d} !important;
                    `;
                case 1: default: // Classic Glow
                    return `
                        outline: 1px solid ${c} !important;
                        outline-offset: 0 !important;
                        box-shadow:
                            0 0 6px ${g},
                            0 0 26px ${g},
                            inset 0 0 0 1px ${d} !important;
                    `;
            }
        };
        const textStyleFor = frame => {
            if (!ctx.settings.itemTipTextColors) {
                return '';
            }
            let { c, g, b, d } = resolveTipPalette(frame);
            if (tipSet === 28 || tipSet === 29) {
                return `
                    color: ${b} !important;
                    text-shadow:
                        0 0 1px ${d},
                        0 0 3px ${g} !important;
                `;
            }
            return `
                color: ${b} !important;
                text-shadow:
                    0 0 2px ${d},
                    0 0 5px ${g} !important;
            `;
        };
        const outerGlowOffCss = frame => {
            if (ctx.settings.itemTipOuterGlow) {
                return '';
            }
            let { c, g, b, d } = resolveTipPalette(frame);
            return `
                box-shadow:
                    0 0 0 1px ${c},
                            0 0 4px ${b},
                    inset 0 0 0 1px ${d} !important;
            `;
        };
        return rarities .filter(frame => frame.enabled) .map(frame => {
                const normalRoot =
                    `.tip-wrapper.normal-tip[data-item-type="${frame.fallback}"]`;
                const comparisonRoot =
                    `.tip-wrapper.cmp-tip[data-item-type="${frame.fallback}"]`;
                return `
                    ${normalRoot},
                    ${comparisonRoot} {
                        ${styleFor(frame)}
                        ${outerGlowOffCss(frame)}
                    }

                    ${normalRoot} .tip-item-stat-item-name,
                    ${normalRoot} .item-name,
                    ${normalRoot} .tip-item-stat-rarity,
                    ${normalRoot} .item-rarity,
                    ${comparisonRoot} .tip-item-stat-item-name,
                    ${comparisonRoot} .item-name,
                    ${comparisonRoot} .tip-item-stat-rarity,
                    ${comparisonRoot} .item-rarity {
                        ${textStyleFor(frame)}
                    }
                `;
            }) .join('\n');
    };},init(ctx){}});
runtime.registerPart("modules/upgrade-badges.js", {declare(ctx){ctx.getItemUpgradeLevel = function getItemUpgradeLevel(element) {
        if (!(element instanceof Element)) return null;
        const raw = element.getAttribute('data-upgrade');
        if (raw === null || raw === '') {
            return null;
        }
        const level = Number(raw);
        if (!Number.isFinite(level) || level < 0) {
            return null;
        }
        return Math.floor(level);
    };
ctx.removeUpgradeBadgeOverlay = function removeUpgradeBadgeOverlay(element) {
        const badge = ctx.upgradeBadgeOverlayMap.get(element);
        if (badge) {
            badge.remove();
            ctx.upgradeBadgeOverlayMap.delete(element);
            element.classList.remove('sg-upgrade-host','sg-upgrade-relative');
        }
    };
ctx.getItemRarityForUpgradeBadge = function getItemRarityForUpgradeBadge(element) {
        const maniaRarity = element.getAttribute('data-frame-mania-rarity');
        if ( ['common', 'unique', 'heroic', 'upgraded', 'legendary'] .includes(maniaRarity) ) {
            return maniaRarity;
        }
        const itemType = element.getAttribute('data-item-type');
        return {
            't-norm': 'common', 't-uni': 'unique', 't-uniupg': 'unique', 't-her': 'heroic', 't-upgraded': 'upgraded', 't-upg': 'upgraded', 't-leg': 'legendary'
        }[itemType] || 'common';
    };
ctx.getUpgradeBadgeRarityPalette = function getUpgradeBadgeRarityPalette(element) {
        const rarity = ctx.getItemRarityForUpgradeBadge(element);
        const base = {
            common: {
                color: '#58656a', bright: '#aebdc2', dark: '#101619', glow: 'rgba(120,145,153,.40)', text: '#f2f6f7'
            }, unique: {
                color: '#927019', bright: '#c0922c', dark: '#261b04', glow: 'rgba(146,112,25,.58)', text: '#fff1b0'
            }, heroic: {
                color: '#1d6f9c', bright: '#3395c2', dark: '#071f2c', glow: 'rgba(29,111,156,.58)', text: '#d8f3ff'
            }, upgraded: {
                color: '#087a32', bright: '#10a447', dark: '#031c0c', glow: 'rgba(8,122,50,.60)', text: '#d7ffe3'
            }, legendary: {
                color: '#e842a2', bright: '#ffb5e3', dark: '#74164d', glow: 'rgba(232,66,162,.66)', text: '#ffe4f5'
            }
        };
        const frameSet = Number(ctx.settings.itemFrameSet) || 1;
        if (rarity === 'legendary') {
            const legendaryPalettes = {
                20: { color:'#d52d2d', bright:'#ff6952', dark:'#5c0c12', glow:'rgba(205,28,38,.62)', text:'#ffe0db' },
                21: { color:'#e85b22', bright:'#ff9442', dark:'#7e1e08', glow:'rgba(238,74,18,.58)', text:'#ffe4c7' },
                22: { color:'#d96b1f', bright:'#ffa84a', dark:'#9d360d', glow:'rgba(220,77,16,.62)', text:'#ffe7c2' },
                23: { color:'#b72b39', bright:'#e04349', dark:'#4d0812', glow:'rgba(154,22,34,.60)', text:'#ffd9de' },
                24: { color:'#e07a25', bright:'#f68230', dark:'#79190b', glow:'rgba(215,60,20,.58)', text:'#ffe2c9' },
                25: { color:'#8cbf35', bright:'#a9d64c', dark:'#365814', glow:'rgba(104,153,35,.56)', text:'#edffd2' },
                26: { color:'#c8652c', bright:'#db6f3b', dark:'#6a2448', glow:'rgba(165,56,50,.54)', text:'#ffe1d5' },
                27: { color:'#861526', bright:'#b92b3b', dark:'#180309', glow:'rgba(145,18,37,.58)', text:'#ffd6dc' }
            };
            if (legendaryPalettes[frameSet]) {
                return legendaryPalettes[frameSet];
            }
        }
        const customFramePalettes = {
            28: {
                unique:    { color:'#655f00', bright:'#8b8500', dark:'#211f00', glow:'rgba(101,98,0,.44)', text:'#fff6a8' },
                heroic:    { color:'#00595d', bright:'#00767c', dark:'#001f22', glow:'rgba(0,89,93,.44)', text:'#c8ffff' },
                upgraded:  { color:'#296500', bright:'#3b8700', dark:'#102300', glow:'rgba(41,101,0,.44)', text:'#d9ffbd' },
                legendary: { color:'#5e001f', bright:'#86002f', dark:'#1c0009', glow:'rgba(94,0,31,.48)', text:'#ffd2df' }
            }, 29: {
                unique:    { color:'#464403', bright:'#656100', dark:'#181700', glow:'rgba(70,68,3,.40)', text:'#fff7aa' },
                heroic:    { color:'#014347', bright:'#00636a', dark:'#00181a', glow:'rgba(1,67,71,.40)', text:'#c9ffff' },
                upgraded:  { color:'#1e4603', bright:'#2d6805', dark:'#0c1a01', glow:'rgba(30,70,3,.40)', text:'#dcffc5' },
                legendary: { color:'#46001c', bright:'#68002a', dark:'#150008', glow:'rgba(70,0,28,.44)', text:'#ffd5e1' }
            }
        };
        return ( customFramePalettes[frameSet]?.[rarity] || base[rarity] || base.common );
    };
ctx.applyUpgradeBadgeRarityColor = function applyUpgradeBadgeRarityColor(element, badge) {
        const enabled = ctx.settings.upgradeBadgeSyncRarityColor;
        badge.classList.toggle( 'shacal-upgrade-rarity-sync', enabled );
        if (!enabled) {
            [ '--sg-upgrade-color', '--sg-upgrade-bright', '--sg-upgrade-dark', '--sg-upgrade-glow', '--sg-upgrade-text' ].forEach(name => badge.style.removeProperty(name));
            return;
        }
        const palette = ctx.getUpgradeBadgeRarityPalette(element);
        badge.style.setProperty( '--sg-upgrade-color', palette.color );
        badge.style.setProperty( '--sg-upgrade-bright', palette.bright );
        badge.style.setProperty( '--sg-upgrade-dark', palette.dark );
        badge.style.setProperty( '--sg-upgrade-glow', palette.glow );
        badge.style.setProperty( '--sg-upgrade-text', palette.text );
    };
ctx.ensureUpgradeBadgeOverlay = function ensureUpgradeBadgeOverlay(element) {
        let badge = ctx.upgradeBadgeOverlayMap.get(element);
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'shacal-upgrade-badge';
            badge.setAttribute('aria-hidden', 'true');
            element.classList.add('sg-upgrade-host');
            if(getComputedStyle(element).position==='static')element.classList.add('sg-upgrade-relative');
            element.appendChild(badge);
            ctx.upgradeBadgeOverlayMap.set(element, badge);
        }
        return badge;
    };
ctx.positionUpgradeBadgeOverlay = function positionUpgradeBadgeOverlay(element, badge) {
        if ( !(element instanceof Element) || !(badge instanceof Element) || !element.isConnected || !badge.isConnected ) {
            return false;
        }
        const rect = element.getBoundingClientRect();
        if ( !ctx.isElementVisible(element) || rect.width <= 0 || rect.height <= 0 || rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth ) {
            if (badge.style.display !== 'none') {
                badge.style.display = 'none';
            }
            return false;
        }
        if (badge.style.display !== 'flex') {
            badge.style.display = 'flex';
        }
        badge.style.right='-1px';
        badge.style.top='-1px';
        return true;
    };
ctx.syncUpgradeBadges = function syncUpgradeBadges() {
        ctx.boostUpgradeBadgePositionSync(500);
        const validElements = new Set();
        if (ctx.addonFeatureEnabled('upgradeBadgeEnabled')) {
            document .querySelectorAll('.item[data-upgrade]') .forEach(element => {
                    const level = ctx.getItemUpgradeLevel(element);
                    if ( level === null || element.classList.contains('bag') || element.closest('.shacal-test-loot-window') ) {
                        ctx.removeUpgradeBadgeOverlay(element);
                        return;
                    }
                    validElements.add(element);
                    const badge = ctx.ensureUpgradeBadgeOverlay(element);
                    badge.dataset.style = String(ctx.settings.upgradeBadgeStyle);
                    badge.textContent = String(level);
                    ctx.applyUpgradeBadgeRarityColor( element, badge );
                    ctx.positionUpgradeBadgeOverlay(element, badge);
                });
        }
        for (const [element, badge] of ctx.upgradeBadgeOverlayMap.entries()) {
            if ( !ctx.addonFeatureEnabled('upgradeBadgeEnabled') || !element.isConnected || !validElements.has(element) ) {
                badge.remove();
                ctx.upgradeBadgeOverlayMap.delete(element);
            element.classList.remove('sg-upgrade-host','sg-upgrade-relative');
            }
        }
    };},init(ctx){ctx.upgradeBadgeOverlayMap = new Map();}});
})(window.ShacalRuntime);
