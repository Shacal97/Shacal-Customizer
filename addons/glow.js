/* Shacal glow 6.3.4 */
(function(runtime){'use strict';const unsafeWindow=window;const GM_xmlhttpRequest=runtime.request;
runtime.registerPart("modules/glow.js", {declare(ctx){ctx.stopAutomaticLootSounds = function stopAutomaticLootSounds() {
        for(const audio of ctx.activeLootSounds){try{audio.pause();audio.currentTime=0;audio.removeAttribute('src');audio.load();}catch{}}
        ctx.activeLootSounds.clear();
    };
ctx.playLegendSound = function playLegendSound(soundId = ctx.settings.sound, volume = ctx.settings.volume) {
        const id = Math.max( 0, Math.min(30, Number(soundId) || 0) );
        const volumeLevel = Math.max( 0, Math.min(5, Math.round(Number(volume)) || 0) );
        if ( id === 0 || volumeLevel === 0 || !ctx.LEGEND_SOUND_DATA[id] ) {
            return null;
        }
        const volumeTable = [ 0.00, 0.18, 0.32, 0.50, 0.72, 1.00 ];
        try {
            const audio = new Audio( ctx.LEGEND_SOUND_DATA[id] );
            audio.volume = volumeTable[volumeLevel];
            audio.preload = 'auto';
            const result = audio.play();
            if ( result && typeof result.catch === 'function' ) {
                result.catch(() => {
                    ctx.activeLootSounds.delete(audio);
                    if (ctx.activeLegendTestAudio === audio) ctx.activeLegendTestAudio = null;
                });
            }
            return audio;
        } catch (_) {
            return null;
        }
    };
ctx.stopLegendTestSound = function stopLegendTestSound() {
        const audio = ctx.activeLegendTestAudio;
        ctx.activeLegendTestAudio = null;
        if (!audio) {
            return;
        }
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.removeAttribute('src');
            audio.load();
        } catch (_) {}
    };
ctx.playLegendTestSound = function playLegendTestSound(soundId = ctx.settings.sound, volume = ctx.settings.volume) {
        ctx.stopLegendTestSound();
        const audio = ctx.playLegendSound(soundId, volume);
        if (!audio) {
            return;
        }
        ctx.activeLegendTestAudio = audio;
        const clearIfCurrent = () => {
            if (ctx.activeLegendTestAudio === audio) {
                ctx.activeLegendTestAudio = null;
            }
        };
        audio.addEventListener( 'ended', clearIfCurrent, { once: true } );
        audio.addEventListener( 'error', clearIfCurrent, { once: true } );
    };
ctx.getSoundEffectItems = function getSoundEffectItems(windowElement) {
        if (!windowElement) {
            return [];
        }
        if (ctx.settings.dropMode === ctx.DROP_MODE_LEGENDARY) {
            return Array.from( windowElement.querySelectorAll( '[data-frame-mania-rarity="legendary"], [data-item-type="t-leg"]' ) );
        }
        const hasLegendaryItem = !!windowElement.querySelector( '[data-frame-mania-rarity="legendary"], [data-item-type="t-leg"]' );
        if (hasLegendaryItem) {
            return [];
        }
        return Array.from( windowElement.querySelectorAll( '.loot-window .items-wrapper .item' ) );
    };
ctx.playLegendSoundForNewItems = function playLegendSoundForNewItems(windowElement) {
        if ( !windowElement || windowElement.classList.contains( 'shacal-test-loot-window' ) ) {
            return;
        }
        const items = ctx.getSoundEffectItems(windowElement);
        items.forEach(item => {
            if (ctx.soundedItems.has(item)) {
                return;
            }
            ctx.soundedItems.add(item);
            if(!ctx.addonFeatureEnabled('lootSoundEnabled'))return;
            const audio=ctx.playLegendSound();
            if(audio){ctx.activeLootSounds.add(audio);const clear=()=>ctx.activeLootSounds.delete(audio);audio.addEventListener('ended',clear,{once:true});audio.addEventListener('error',clear,{once:true});}
        });
    };
ctx.getPulseConfig = function getPulseConfig() {
        const level = Math.max(0, Math.min(5, Number(ctx.settings.pulse) || 0));
        if (level === 0) {
            return {
                enabled: false, duration: 0, scale: 1, opacity: 1
            };
        }
        return {
            enabled: true, duration: {
                1: 2.8, 2: 2.1, 3: 1.5, 4: 1.0, 5: 0.65
            }[level], scale: {
                1: 1.01, 2: 1.018, 3: 1.028, 4: 1.04, 5: 1.055
            }[level], opacity: {
                1: 0.92, 2: 0.86, 3: 0.78, 4: 0.68, 5: 0.58
            }[level]
        };
    };
ctx.spatialLevel = function spatialLevel(value) {
        const level = ctx.internalLevel(value);
        const table = [ 0.00, 0.35, 0.55, 0.80, 1.10, 1.50, 2.00, 2.65, 3.45, 4.40, 5.50 ];
        return table[level];
    };
ctx.innerAuraMapSpatialLevel = function innerAuraMapSpatialLevel(value) {
        const width = ctx.clampInnerAuraMapWidth(value);
        if (width <= 5) {
            return ctx.spatialLevel(width);
        }
        return ( ctx.spatialLevel(5) + (width - 5) * 2.20 );
    };
ctx.buildNeonShadow = function buildNeonShadow(multiplier = 1, colorOverride = null) {
        const colors = Array.isArray(colorOverride)
            ? colorOverride
            : [ ctx.settings.color1, ctx.settings.color2, ctx.settings.color3 ];
        const levels = [ ctx.clampLevel(ctx.settings.glow1), ctx.clampLevel(ctx.settings.glow2), ctx.clampLevel(ctx.settings.glow3) ];
        const opacities = [ ctx.opacityLevel(ctx.settings.opacity1), ctx.opacityLevel(ctx.settings.opacity2), ctx.opacityLevel(ctx.settings.opacity3) ];
        const widths = [ ctx.clampLevel(ctx.settings.width1), ctx.clampLevel(ctx.settings.width2), ctx.clampLevel(ctx.settings.width3) ];
        const shadows = [];
        if (levels[0] > 0 && opacities[0] > 0 && widths[0] > 0) {
            const l = ctx.internalLevel(levels[0]);
            const w = widths[0];
            const ls = (() => {
                const table = [0.00,0.35,0.55,0.80,1.10,1.50,2.00,2.65,3.45,4.40,5.50];
                return table[Math.max(0, Math.min(10, l))];
            })();
            const ws = ctx.spatialLevel(w);
            const c = colors[0];
            const strengthBoost = 0.60 + (ls / 5.5) * 0.70;
            const o = Math.min(1, opacities[0] * strengthBoost);
            shadows.push(
                `0 0 ${Math.round((2 + ls * 2) * multiplier)}px 0 ${ctx.hexToRgba(c, Math.min(1, o * 1.15))}`
            );
            shadows.push(
                `0 0 ${Math.round((8 + ws * 5) * multiplier)}px ${Math.round((2 + ws * 3) * multiplier)}px ${ctx.hexToRgba(c, Math.min(1, o * 1.00))}`
            );
            shadows.push(
                `0 0 ${Math.round((15 + ws * 7) * multiplier)}px ${Math.round((5 + ws * 5) * multiplier)}px ${ctx.hexToRgba(c, Math.min(1, o * 0.72))}`
            );
        }
        if (levels[1] > 0 && opacities[1] > 0 && widths[1] > 0) {
            const l = ctx.internalLevel(levels[1]);
            const w = widths[1];
            const ls = (() => {
                const table = [0.00,0.35,0.55,0.80,1.10,1.50,2.00,2.65,3.45,4.40,5.50];
                return table[Math.max(0, Math.min(10, l))];
            })();
            const ws = ctx.spatialLevel(w);
            const c = colors[1];
            const strengthBoost = 0.60 + (ls / 5.5) * 0.70;
            const o = Math.min(1, opacities[1] * strengthBoost);
            shadows.push(
                `0 0 ${Math.round((13 + ws * 7) * multiplier)}px ${Math.round((12 + ws * 10) * multiplier)}px ${ctx.hexToRgba(c, Math.min(1, o * 1.00))}`
            );
            shadows.push(
                `0 0 ${Math.round((22 + ws * 10) * multiplier)}px ${Math.round((18 + ws * 15) * multiplier)}px ${ctx.hexToRgba(c, Math.min(1, o * 0.76))}`
            );
            shadows.push(
                `0 0 ${Math.round((32 + ws * 12) * multiplier)}px ${Math.round((24 + ws * 19) * multiplier)}px ${ctx.hexToRgba(c, Math.min(1, o * 0.52))}`
            );
        }
        if (levels[2] > 0 && opacities[2] > 0 && widths[2] > 0) {
            const l = ctx.internalLevel(levels[2]);
            const w = widths[2];
            const ls = (() => {
                const table = [0.00,0.35,0.55,0.80,1.10,1.50,2.00,2.65,3.45,4.40,5.50];
                return table[Math.max(0, Math.min(10, l))];
            })();
            const ws = ctx.spatialLevel(w);
            const c = colors[2];
            const strengthBoost = 0.65 + (ls / 5.5) * 0.75;
            const o = Math.min(1, opacities[2] * strengthBoost);
            shadows.push(
                `0 0 ${Math.round((16 + ws * 8) * multiplier)}px ${Math.round((30 + ws * 21) * multiplier)}px ${ctx.hexToRgba(c, Math.min(1, o * 1.00))}`
            );
            shadows.push(
                `0 0 ${Math.round((28 + ws * 11) * multiplier)}px ${Math.round((42 + ws * 27) * multiplier)}px ${ctx.hexToRgba(c, Math.min(1, o * 0.82))}`
            );
            shadows.push(
                `0 0 ${Math.round((42 + ws * 15) * multiplier)}px ${Math.round((55 + ws * 34) * multiplier)}px ${ctx.hexToRgba(c, Math.min(1, o * 0.58))}`
            );
        }
        return shadows.length
            ? shadows.join(', ')
            : 'none';
    };
ctx.getInnerAuraParams = function getInnerAuraParams( multiplier = 1, allowExtendedMapWidth = false ) {
        const level = ctx.internalLevel(ctx.clampLevel(ctx.settings.glow1));
        const rawWidth = allowExtendedMapWidth
                ? ctx.clampInnerAuraMapWidth(ctx.settings.width1)
                : ctx.clampLevel(ctx.settings.width1);
        const width = allowExtendedMapWidth
                ? ctx.innerAuraMapSpatialLevel(rawWidth)
                : ctx.spatialLevel(rawWidth);
        const opacity = ctx.opacityLevel(ctx.settings.opacity1);
        const color = ctx.settings.color1;
        if ( ctx.clampLevel(ctx.settings.glow1) <= 0 || rawWidth <= 0 || opacity <= 0 ) {
            return null;
        }
        const strength = Math.min( 1, opacity * (0.78 + level * 0.03) );
        const tightBlur = Math.max( 3, Math.round( (4 + level * 0.55 + width * 0.75) * multiplier ) );
        const mediumBlur = Math.max( 12, Math.round( (18 + level * 1.15 + width * 2.4) * multiplier ) );
        const softBlur = Math.max( 24, Math.round( (38 + level * 1.65 + width * 4.6) * multiplier ) );
        const tightSpread = Math.min( 2.5, (0.15 + width * 0.16) * multiplier );
        const mediumSpread = Math.min( 9, (1.0 + width * 0.52) * multiplier );
        const softSpread = Math.min( 15, (1.5 + width * 0.78) * multiplier );
        return {
            color, strength, tightBlur, mediumBlur, softBlur, tightSpread, mediumSpread, softSpread
        };
    };
ctx.buildInnerAuraLootShadow = function buildInnerAuraLootShadow(multiplier = 1) {
        const aura = ctx.getInnerAuraParams(multiplier);
        if (!aura) {
            return 'none';
        }
        return [
            `0 0 ${aura.tightBlur}px ${aura.tightSpread.toFixed(1)}px ${ctx.hexToRgba(aura.color, Math.min(1, aura.strength * 0.95))}`,
            `0 0 ${aura.mediumBlur}px ${aura.mediumSpread.toFixed(1)}px ${ctx.hexToRgba(aura.color, Math.min(0.72, aura.strength * 0.55))}`,
            `0 0 ${aura.softBlur}px ${aura.softSpread.toFixed(1)}px ${ctx.hexToRgba(aura.color, Math.min(0.34, aura.strength * 0.24))}`
        ].join(', ');
    };
ctx.buildInnerAuraMapShadow = function buildInnerAuraMapShadow(multiplier = 1) {
        const aura = ctx.getInnerAuraParams( multiplier, true );
        if (!aura) {
            return 'none';
        }
        return [
            `inset 0 0 ${aura.tightBlur}px ${aura.tightSpread.toFixed(1)}px ${ctx.hexToRgba(aura.color, Math.min(1, aura.strength * 0.90))}`,
            `inset 0 0 ${aura.mediumBlur}px ${aura.mediumSpread.toFixed(1)}px ${ctx.hexToRgba(aura.color, Math.min(0.66, aura.strength * 0.50))}`,
            `inset 0 0 ${aura.softBlur}px ${aura.softSpread.toFixed(1)}px ${ctx.hexToRgba(aura.color, Math.min(0.30, aura.strength * 0.20))}`
        ].join(', ');
    };
ctx.buildRetroNeonShadow = function buildRetroNeonShadow(multiplier = 1, colorOverride = null) {
        const colors = Array.isArray(colorOverride)
            ? colorOverride
            : [ ctx.settings.color1, ctx.settings.color2, ctx.settings.color3 ];
        const levels = [ ctx.clampLevel(ctx.settings.glow1), ctx.clampLevel(ctx.settings.glow2), ctx.clampLevel(ctx.settings.glow3) ];
        const opacities = [ ctx.opacityLevel(ctx.settings.opacity1), ctx.opacityLevel(ctx.settings.opacity2), ctx.opacityLevel(ctx.settings.opacity3) ];
        const widths = [ ctx.clampLevel(ctx.settings.width1), ctx.clampLevel(ctx.settings.width2), ctx.clampLevel(ctx.settings.width3) ];
        const shadows = [];
        shadows.push(
            `0 0 ${Math.max(2, Math.round(3 * multiplier))}px 0 rgba(255,255,255,0.98)`
        );
        shadows.push(
            `inset 0 0 ${Math.max(2, Math.round(3 * multiplier))}px 0 rgba(255,255,255,0.98)`
        );
        for (let index = 0; index < 3; index++) {
            const level = ctx.internalLevel(levels[index]);
            const width = ctx.spatialLevel(widths[index]);
            const opacity = opacities[index];
            if ( levels[index] <= 0 || opacity <= 0 || widths[index] <= 0 ) {
                continue;
            }
            const color = colors[index];
            const strength = Math.min( 1, opacity * (0.72 + level * 0.035) );
            const layerScale = 1 + index * 0.42;
            const tightBlur = (5 + level * 0.55 + width * 1.05) * layerScale * multiplier;
            const mediumBlur = (11 + level * 0.75 + width * 2.0) * layerScale * multiplier;
            const softBlur = (20 + level * 0.95 + width * 3.3) * layerScale * multiplier;
            const tightSpread = Math.min( 3.5, (0.4 + width * 0.28) * layerScale * multiplier );
            const mediumSpread = Math.min( 5.5, (0.8 + width * 0.40) * layerScale * multiplier );
            const softSpread = Math.min( 7.5, (1.2 + width * 0.55) * layerScale * multiplier );
            const tightAlpha = Math.min(1, strength * 0.95);
            const mediumAlpha = Math.min(0.72, strength * 0.56);
            const softAlpha = Math.min(0.32, strength * 0.22);
            shadows.push(
                `0 0 ${Math.round(tightBlur)}px ${tightSpread.toFixed(1)}px ${ctx.hexToRgba(color, tightAlpha)}`
            );
            shadows.push(
                `0 0 ${Math.round(mediumBlur)}px ${mediumSpread.toFixed(1)}px ${ctx.hexToRgba(color, mediumAlpha)}`
            );
            shadows.push(
                `0 0 ${Math.round(softBlur)}px ${softSpread.toFixed(1)}px ${ctx.hexToRgba(color, softAlpha)}`
            );
            shadows.push(
                `inset 0 0 ${Math.round(tightBlur)}px ${tightSpread.toFixed(1)}px ${ctx.hexToRgba(color, tightAlpha)}`
            );
            shadows.push(
                `inset 0 0 ${Math.round(mediumBlur)}px ${mediumSpread.toFixed(1)}px ${ctx.hexToRgba(color, mediumAlpha)}`
            );
            shadows.push(
                `inset 0 0 ${Math.round(softBlur)}px ${softSpread.toFixed(1)}px ${ctx.hexToRgba(color, softAlpha)}`
            );
        }
        return shadows.length
            ? shadows.join(', ')
            : 'none';
    };
ctx.buildRetroNeonItemShadow = function buildRetroNeonItemShadow(colorOverride = null) {
        const colors = Array.isArray(colorOverride)
            ? colorOverride
            : [ ctx.settings.color1, ctx.settings.color2, ctx.settings.color3 ];
        const levels = [ ctx.clampLevel(ctx.settings.glow1), ctx.clampLevel(ctx.settings.glow2), ctx.clampLevel(ctx.settings.glow3) ];
        const opacities = [ ctx.opacityLevel(ctx.settings.opacity1), ctx.opacityLevel(ctx.settings.opacity2), ctx.opacityLevel(ctx.settings.opacity3) ];
        const widths = [ ctx.clampLevel(ctx.settings.width1), ctx.clampLevel(ctx.settings.width2), ctx.clampLevel(ctx.settings.width3) ];
        const shadows = [ '0 0 2px 0 rgba(255,255,255,0.92)' ];
        for (let index = 0; index < 3; index++) {
            if ( levels[index] <= 0 || opacities[index] <= 0 || widths[index] <= 0 ) {
                continue;
            }
            const level = ctx.internalLevel(levels[index]);
            const width = ctx.spatialLevel(widths[index]);
            const color = colors[index];
            const strength = Math.min( 1, opacities[index] * (0.68 + level * 0.025) );
            const layerScale = 1 + index * 0.18;
            const tightBlur = (3 + level * 0.28 + width * 0.45) * layerScale;
            const mediumBlur = (6 + level * 0.38 + width * 0.85) * layerScale;
            const softBlur = (10 + level * 0.48 + width * 1.25) * layerScale;
            const tightSpread = Math.min(1.8, 0.2 + width * 0.12);
            const mediumSpread = Math.min(2.6, 0.4 + width * 0.18);
            const softSpread = Math.min(3.4, 0.7 + width * 0.24);
            shadows.push(
                `0 0 ${Math.round(tightBlur)}px ${tightSpread.toFixed(1)}px ${ctx.hexToRgba(color, Math.min(0.82, strength * 0.72))}`
            );
            shadows.push(
                `0 0 ${Math.round(mediumBlur)}px ${mediumSpread.toFixed(1)}px ${ctx.hexToRgba(color, Math.min(0.46, strength * 0.34))}`
            );
            shadows.push(
                `0 0 ${Math.round(softBlur)}px ${softSpread.toFixed(1)}px ${ctx.hexToRgba(color, Math.min(0.20, strength * 0.14))}`
            );
        }
        return shadows.join(', ');
    };
ctx.getMainNeonColor = function getMainNeonColor() {
        if (ctx.clampLevel(ctx.settings.glow1) > 0 && ctx.opacityLevel(ctx.settings.opacity1) > 0 && ctx.clampLevel(ctx.settings.width1) > 0) {
            return ctx.settings.color1;
        }
        if (ctx.clampLevel(ctx.settings.glow2) > 0 && ctx.opacityLevel(ctx.settings.opacity2) > 0 && ctx.clampLevel(ctx.settings.width2) > 0) {
            return ctx.settings.color2;
        }
        if (ctx.clampLevel(ctx.settings.glow3) > 0 && ctx.opacityLevel(ctx.settings.opacity3) > 0 && ctx.clampLevel(ctx.settings.width3) > 0) {
            return ctx.settings.color3;
        }
        return 'transparent';
    };
ctx.hasAnyGlowLayer = function hasAnyGlowLayer() {
        return ( (ctx.clampLevel(ctx.settings.glow1) > 0 && ctx.opacityLevel(ctx.settings.opacity1) > 0 && ctx.clampLevel(ctx.settings.width1) > 0) ||
            (ctx.clampLevel(ctx.settings.glow2) > 0 && ctx.opacityLevel(ctx.settings.opacity2) > 0 && ctx.clampLevel(ctx.settings.width2) > 0) ||
            (ctx.clampLevel(ctx.settings.glow3) > 0 && ctx.opacityLevel(ctx.settings.opacity3) > 0 && ctx.clampLevel(ctx.settings.width3) > 0) );
    };
ctx.hasGlowForCurrentStyle = function hasGlowForCurrentStyle() {
        if ( Number(ctx.settings.glowStyle) === ctx.STYLE_INNER_AURA ) {
            return ( ctx.clampLevel(ctx.settings.glow1) > 0 && ctx.opacityLevel(ctx.settings.opacity1) > 0 && ctx.clampInnerAuraMapWidth(ctx.settings.width1) > 0 );
        }
        return ctx.hasAnyGlowLayer();
    };
ctx.clearEnergyFrame = function clearEnergyFrame(overlay) {
    const frame = overlay.querySelector('.shacal-energy-canvas');
    if (frame) {
        frame.remove();
        delete overlay.dataset.shacalAnimationSignature;
        delete overlay.dataset.shacalInnerAuraSignature;
        delete overlay.dataset.sgCachedGlow;
    }
    ctx.energyFrames.delete(overlay);
};
ctx.drawEnergyFrame = function drawEnergyFrame(overlay) {
    if (document.hidden) return;
    const now = performance.now();
    let entry = ctx.energyFrames.get(overlay);
    if (!entry) {
        overlay.getAnimations().forEach(animation => animation.cancel());
        overlay.style.boxShadow = 'none';
        overlay.style.border = '0';
        overlay.style.outline = 'none';
        overlay.style.opacity = '1';
        overlay.style.transform = 'none';
        const canvas = document.createElement('canvas');
        canvas.className = 'shacal-energy-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText = 'position:absolute;left:-32px;top:-32px;pointer-events:none;max-width:none;';
        overlay.appendChild(canvas);
        entry = {canvas, g:canvas.getContext('2d'), last:0, time:0, signature:''};
        ctx.energyFrames.set(overlay, entry);
    }
    if (!entry.g || now - entry.last < 33) return;
    const layers = [1,2,3].map(i => ({color:ctx.settings['color'+i], width:ctx.clampLevel(ctx.settings['width'+i]), glow:ctx.clampLevel(ctx.settings['glow'+i]), opacity:ctx.opacityLevel(ctx.settings['opacity'+i])})).filter(l => l.width > 0 && l.glow > 0 && l.opacity > 0);
    const w = Math.max(0,parseFloat(overlay.style.width)||0), h = Math.max(0,parseFloat(overlay.style.height)||0);
    const d = Math.min(window.devicePixelRatio || 1, 2), effect = Number(ctx.settings.effect);
    const moving = effect !== 0 && ctx.clampLevel(ctx.settings.pulse) > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const signature = JSON.stringify([w,h,d,layers,effect,ctx.settings.pulse]);
    const dt = entry.last ? Math.min((now-entry.last)/1000,.05) : 0;
    entry.last = now;
    if (!moving && entry.signature === signature) return;
    entry.signature = signature;
    if (moving) entry.time += dt * (.35 + ctx.clampLevel(ctx.settings.pulse)*.22);
    const canvas = entry.canvas, g = entry.g, pad = 32;
    const cw = Math.ceil((w+pad*2)*d), ch = Math.ceil((h+pad*2)*d);
    if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width=cw; canvas.height=ch;
        canvas.style.width=(w+pad*2)+'px'; canvas.style.height=(h+pad*2)+'px';
    }
    g.setTransform(d,0,0,d,0,0); g.clearRect(0,0,w+pad*2,h+pad*2);
    if (!layers.length || !w || !h) return;
    const t=entry.time, perimeter=2*(w+h), count=Math.ceil(perimeter/4);
    const gradient=g.createLinearGradient(pad,pad,pad+w,pad+h);
    layers.forEach((l,i)=>gradient.addColorStop(layers.length===1?0:i/(layers.length-1),layers[(i+(effect===3?Math.floor(t*.4):0))%layers.length].color));
    const width=layers.reduce((sum,l)=>sum+l.width,0)/layers.length;
    const glow=layers.reduce((sum,l)=>sum+l.glow,0)/layers.length*3;
    const opacity=layers.reduce((sum,l)=>sum+l.opacity,0)/layers.length;
    const pulse=effect===1 ? .85+.15*Math.sin(t*3) : effect===2 ? .8+.2*Math.sin(t*7)*Math.sin(t*11) : 1;
    for(let layer=2;layer>=0;layer--) {
        g.beginPath();
        for(let i=0;i<=count;i++) {
            const s=i/count*perimeter; let x,y,nx,ny,a,len;
            if(s<w){a=s;len=w;x=a;y=0;nx=0;ny=-1;}
            else if(s<w+h){a=s-w;len=h;x=w;y=a;nx=1;ny=0;}
            else if(s<2*w+h){a=s-w-h;len=w;x=w-a;y=h;nx=0;ny=1;}
            else{a=s-2*w-h;len=h;x=0;y=h-a;nx=-1;ny=0;}
            const fade=Math.max(0,Math.min(1,a/12,(len-a)/12));
            const noise=(Math.sin(s*.113+t*3.7+layer*2)*1.7+Math.sin(s*.257-t*5.3+layer)*1.1+Math.sin(s*.631+t*7.1)*.55)*fade;
            const ripple=noise*(layer?1.8:1)+Math.sin(t*2+s*.033)*fade;
            x+=pad+nx*ripple;y+=pad+ny*ripple;
            if(i)g.lineTo(x,y);else g.moveTo(x,y);
        }
        g.closePath();g.strokeStyle=gradient;g.lineWidth=width*(layer===2?3:layer===1?1.5:.8);
        g.globalAlpha=opacity*pulse*(layer===2?.16:layer===1?.6:1);
        g.shadowColor=layers[layer%layers.length].color;g.shadowBlur=glow*(layer===2?1.6:1);g.stroke();
        if(layer===0){g.shadowBlur=0;g.globalAlpha=opacity*.65*pulse;g.strokeStyle='#d6fff6';g.lineWidth=.6;g.stroke();}
    }
    g.globalAlpha=1;g.shadowBlur=0;
};

ctx.ensureGlowOverlay = function ensureGlowOverlay(windowElement) {
        let overlay = ctx.glowOverlayMap.get(windowElement);
        if (overlay && document.body.contains(overlay)) {
            return overlay;
        }
        overlay = document.createElement('div');
        overlay.className = 'shacal-glow-overlay';
        document.body.appendChild(overlay);
        ctx.glowOverlayMap.set(windowElement, overlay);
        return overlay;
    };
ctx.removeGlowOverlay = function removeGlowOverlay(windowElement) {
        const overlay = ctx.glowOverlayMap.get(windowElement);
        if (overlay) {
            overlay.remove();
        }
        ctx.glowOverlayMap.delete(windowElement);
        ctx.removeItemGlowOverlays(windowElement);
    };
ctx.positionGlowOverlay = function positionGlowOverlay(windowElement, overlay) {
        const rect = windowElement.getBoundingClientRect();
        const currentGlowStyle = Number(ctx.settings.glowStyle) || ctx.STYLE_CLASSIC;
        const useLootFrameInset = currentGlowStyle === ctx.STYLE_CLASSIC || currentGlowStyle === ctx.STYLE_INNER_AURA;
        const insetX = useLootFrameInset ? 8 : 0;
        const insetY = useLootFrameInset ? 4 : 0;
        overlay.style.left =
            `${rect.left + insetX}px`;
        overlay.style.top =
            `${rect.top + insetY}px`;
        overlay.style.width =
            `${Math.max(0, rect.width - insetX * 2)}px`;
        overlay.style.height =
            `${Math.max(0, rect.height - insetY * 2)}px`;
        const computedZIndex = Number.parseInt( window.getComputedStyle(windowElement).zIndex, 10 );
        const inlineZIndex = Number.parseInt(windowElement.style.zIndex, 10);
        const lootZIndex = Number.isFinite(computedZIndex)
                ? computedZIndex
                : ( Number.isFinite(inlineZIndex)
                        ? inlineZIndex
                        : 1 );
        overlay.style.zIndex = String( Math.min( lootZIndex - 1, ctx.SHACAL_GLOW_Z_CEILING ) );
    };
ctx.removeItemGlowOverlays = function removeItemGlowOverlays(windowElement) {
        const overlays = ctx.itemGlowOverlayMap.get(windowElement);
        if (overlays) {
            overlays.forEach(overlay => overlay.remove());
        }
        ctx.itemGlowOverlayMap.delete(windowElement);
    };
ctx.ensureItemGlowOverlays = function ensureItemGlowOverlays(windowElement) {
        if (Number(ctx.settings.glowStyle) !== 2) {
            ctx.removeItemGlowOverlays(windowElement);
            return;
        }
        // Obramowanie pojedynczego łupu wyróżnia tylko legendy, nie wszystkie karty okna.
        const wrappers = Array.from(windowElement.querySelectorAll('.loot-window .items-wrapper > .loot-item-wrapper'))
            .filter(wrapper => wrapper.querySelector('.item[data-item-type="t-leg"], .item[data-frame-mania-rarity="legendary"]'));
        if (!wrappers.length) {
            ctx.removeItemGlowOverlays(windowElement);
            return;
        }
        let overlays = ctx.itemGlowOverlayMap.get(windowElement);
        if (!overlays) {
            overlays = [];
            ctx.itemGlowOverlayMap.set(windowElement, overlays);
        }
        while (overlays.length > wrappers.length) {
            overlays.pop().remove();
        }
        while (overlays.length < wrappers.length) {
            const overlay = document.createElement('div');
            overlay.className = 'shacal-neon-item-frame';
            document.body.appendChild(overlay);
            overlays.push(overlay);
        }
        const windowZ = Number.parseInt( window.getComputedStyle(windowElement).zIndex, 10 );
        const isTestWindow = windowElement.classList.contains( 'shacal-test-loot-window' );
        const requestedItemZ = Number.isFinite(windowZ)
                ? ( isTestWindow
                        ? windowZ + 1
                        : windowZ - 1 )
                : 0;
        const itemZ = Math.min( requestedItemZ, ctx.SHACAL_GLOW_Z_CEILING );
        const itemShadow = ctx.buildRetroNeonItemShadow();
        wrappers.forEach((wrapper, index) => {
            const overlay = overlays[index];
            const rect = wrapper.getBoundingClientRect();
            overlay.style.left = `${rect.left}px`;
            overlay.style.top = `${rect.top}px`;
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;
            overlay.style.zIndex = String(itemZ);
            if (overlay.style.boxShadow !== itemShadow) overlay.style.boxShadow = itemShadow;
            overlay.style.display = 'block';
        });
    };
ctx.syncItemGlowAnimations = function syncItemGlowAnimations(windowElement) {
        const itemOverlays = ctx.itemGlowOverlayMap.get(windowElement) || [];
        const effect = Math.max( 0, Math.min(3, Number(ctx.settings.effect) || 0) );
        const pulse = ctx.getPulseConfig();
        const baseShadow = ctx.buildRetroNeonItemShadow();
        const c1 = ctx.settings.color1;
        const c2 = ctx.settings.color2;
        const c3 = ctx.settings.color3;
        const shadowA = ctx.buildRetroNeonItemShadow([c1, c2, c3]);
        const shadowB = ctx.buildRetroNeonItemShadow([c2, c3, c1]);
        const shadowC = ctx.buildRetroNeonItemShadow([c3, c1, c2]);
        const animationSignature = JSON.stringify({
            glowStyle: Number(ctx.settings.glowStyle) || 1, neonColors: [c1, c2, c3], effect, enabled: pulse.enabled, duration: pulse.duration, baseShadow, shadowA, shadowB, shadowC
        });
        itemOverlays.forEach(itemOverlay => {
            if ( itemOverlay.dataset.shacalAnimationSignature === animationSignature ) {
                return;
            }
            itemOverlay .getAnimations() .forEach(animation => animation.cancel());
            itemOverlay.dataset.shacalAnimationSignature = animationSignature;
            itemOverlay.style.boxShadow = baseShadow;
            itemOverlay.style.opacity = '1';
            if ( Number(ctx.settings.glowStyle) !== 2 || !pulse.enabled || effect === 0 ) {
                return;
            }
            if (effect === 1) {
                itemOverlay.animate( [ {
                            boxShadow: baseShadow, opacity: 1
                        }, {
                            boxShadow: baseShadow, opacity: 0.72
                        } ], {
                        duration: (pulse.duration * 1000) / 2, iterations: Infinity, direction: 'alternate', easing: 'cubic-bezier(0.42, 0, 0.58, 1)'
                    } );
            }
            if (effect === 2) {
                itemOverlay.animate( [ { boxShadow: baseShadow, opacity: 0.92, offset: 0 }, { boxShadow: baseShadow, opacity: 1, offset: 0.17 },
                        { boxShadow: baseShadow, opacity: 0.76, offset: 0.31 }, { boxShadow: baseShadow, opacity: 0.96, offset: 0.48 },
                        { boxShadow: baseShadow, opacity: 0.80, offset: 0.67 }, { boxShadow: baseShadow, opacity: 1, offset: 0.82 },
                        { boxShadow: baseShadow, opacity: 0.92, offset: 1 } ], {
                        duration: pulse.duration * 1000 * 1.35, iterations: Infinity, easing: 'ease-in-out'
                    } );
            }
            if (effect === 3) {
                itemOverlay.animate( [ {
                            boxShadow: shadowA, opacity: 1, offset: 0
                        }, {
                            boxShadow: shadowB, opacity: 1, offset: 0.333333
                        }, {
                            boxShadow: shadowC, opacity: 1, offset: 0.666667
                        }, {
                            boxShadow: shadowA, opacity: 1, offset: 1
                        } ], {
                        duration: pulse.duration * 1000 * 2.25, iterations: Infinity, easing: 'linear'
                    } );
            }
        });
    };
ctx.findMapBoundsElement = function findMapBoundsElement() {
        const selectors = [ '.map-wrapper', '.map-layer', '.game-window', '[class*="map-wrapper"]', '[class*="map-layer"]' ];
        const candidates = [];
        selectors.forEach((selector, priority) => {
            document.querySelectorAll(selector).forEach(element => {
                const rect = element.getBoundingClientRect();
                if ( rect.width >= 300 && rect.height >= 200 && rect.right > 0 && rect.bottom > 0 && rect.left < window.innerWidth && rect.top < window.innerHeight ) {
                    candidates.push({
                        element, rect, priority
                    });
                }
            });
        });
        if (candidates.length) {
            candidates.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                return ( b.rect.width * b.rect.height - a.rect.width * a.rect.height );
            });
            return candidates[0].element;
        }
        const canvases = Array.from(document.querySelectorAll('canvas')) .map(element => ({
                    element, rect: element.getBoundingClientRect()
                })) .filter(({ rect }) => rect.width >= 300 && rect.height >= 200 && rect.right > 0 && rect.bottom > 0 ) .sort( (a, b) => b.rect.width * b.rect.height -
                        a.rect.width * a.rect.height );
        return canvases.length
            ? canvases[0].element
            : null;
    };
ctx.getMapGlowGameLayer = function getMapGlowGameLayer( mapElement ) {
        if (!(mapElement instanceof Element)) {
            return null;
        }
        return ( mapElement.closest('.game-layer') || null );
    };
ctx.getMapGlowHost = function getMapGlowHost( mapElement ) {
        const gameLayer = ctx.getMapGlowGameLayer( mapElement );
        return ( gameLayer?.parentElement || mapElement?.parentElement || null );
    };
ctx.ensureMapGlowOverlay = function ensureMapGlowOverlay( mapElement ) {
        const gameLayer = ctx.getMapGlowGameLayer( mapElement );
        const host = ctx.getMapGlowHost( mapElement );
        if (!host) {
            return null;
        }
        if (!ctx.mapGlowOverlay) {
            ctx.mapGlowOverlay = document.createElement('div');
            ctx.mapGlowOverlay.className = 'shacal-map-neon-frame';
        }
        const referenceNode = ( gameLayer && gameLayer.parentElement === host )
                ? gameLayer.nextSibling
                : null;
        const isInCorrectPlace = ctx.mapGlowOverlay.parentElement === host && ( gameLayer
                    ? ctx.mapGlowOverlay.previousSibling === gameLayer
                    : true );
        if (!isInCorrectPlace) {
            if (gameLayer) {
                host.insertBefore( ctx.mapGlowOverlay, referenceNode );
            } else {
                host.appendChild( ctx.mapGlowOverlay );
            }
        }
        return ctx.mapGlowOverlay;
    };
ctx.ensureMapNeonCoreLines = function ensureMapNeonCoreLines( overlay ) {
        if (!(overlay instanceof Element)) {
            return [];
        }
        const definitions = [ ['top', 'shacal-map-neon-core-top'], ['right', 'shacal-map-neon-core-right'], ['bottom', 'shacal-map-neon-core-bottom'],
            ['left', 'shacal-map-neon-core-left'] ];
        return definitions.map( ([edge, className]) => {
                let line = overlay.querySelector(
                        `.${className}`
                    );
                if (!line) {
                    line = document.createElement('div');
                    line.className =
                        `shacal-map-neon-core ${className}`;
                    line.dataset.shacalMapNeonEdge = edge;
                    overlay.appendChild(line);
                }
                return line;
            } );
    };
ctx.setMapNeonCoreVisible = function setMapNeonCoreVisible( overlay, visible ) {
        ctx.ensureMapNeonCoreLines( overlay ).forEach(line => {
            line.style.display = visible
                    ? 'block'
                    : 'none';
        });
    };
ctx.removeMapGlowOverlay = function removeMapGlowOverlay() {
        if (ctx.mapGlowOverlay) {
            ctx.mapGlowOverlay .getAnimations() .forEach(animation => animation.cancel());
            ctx.mapGlowOverlay.remove();
        }
        ctx.mapGlowOverlay = null;
    };
ctx.isElementVisible = function isElementVisible(element) {
        if (!(element instanceof Element) || !element.isConnected) return false;
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        for (let parent = element; parent; parent = parent.parentElement) {
            const style = getComputedStyle(parent);
            if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || Number(style.opacity) === 0) return false;
        }
        return true;
    };
ctx.getActiveGlowLootWindows = function getActiveGlowLootWindows() {
        return Array.from( document.querySelectorAll('.loot-wnd') ).filter(windowElement => ctx.addonFeatureEnabled('enabled') && ctx.isElementVisible(windowElement) && ctx.isTargetLootWindow(windowElement) && ctx.hasGlowForCurrentStyle() );
    };
ctx.positionMapGlowOverlay = function positionMapGlowOverlay( overlay, mapElement, style ) {
        if ( !(overlay instanceof Element) || !(mapElement instanceof Element) ) {
            return;
        }
        const mapRect = mapElement.getBoundingClientRect();
        const containingBlock = overlay.offsetParent instanceof Element
                ? overlay.offsetParent
                : overlay.parentElement;
        const hostRect = containingBlock
                ? containingBlock.getBoundingClientRect()
                : {
                    left: 0, top: 0
                };
        const scrollLeft = containingBlock
                ? containingBlock.scrollLeft
                : 0;
        const scrollTop = containingBlock
                ? containingBlock.scrollTop
                : 0;
        const requestedInset = style === ctx.STYLE_ENERGY ? 12 : style === ctx.STYLE_NEON_80S
                ? ctx.SHACAL_MAP_GLOW_INSET
                : 0;
        const inset = Math.min( requestedInset, Math.max( 0, Math.min( mapRect.width, mapRect.height ) / 4 ) );
        overlay.style.left =
            `${
                mapRect.left -
                hostRect.left +
                scrollLeft +
                inset
            }px`;
        overlay.style.top =
            `${
                mapRect.top -
                hostRect.top +
                scrollTop +
                inset
            }px`;
        overlay.style.width =
            `${Math.max(0, mapRect.width - inset * 2)}px`;
        overlay.style.height =
            `${Math.max(0, mapRect.height - inset * 2)}px`;
        overlay.style.clipPath = 'none';
        overlay.style.webkitClipPath = 'none';
        overlay.style.zIndex = 'auto';
    };
ctx.applyMapGlowAnimation = function applyMapGlowAnimation(overlay) {
        const inputSignature = 'applyMapGlowAnimation:' + ctx.getGlowSettingsSignature();
        if (overlay.dataset.sgCachedGlow === inputSignature) return;
        overlay.dataset.sgCachedGlow = inputSignature;
        const pulse = ctx.getPulseConfig();
        const effect = Math.max( 0, Math.min( 3, Number(ctx.settings.effect) || 0 ) );
        const pulseMultiplier = {
            0: 1, 1: 1.08, 2: 1.16, 3: 1.26, 4: 1.38, 5: 1.52
        }[ctx.clampLevel(ctx.settings.pulse)];
        const baseShadow = ctx.buildRetroNeonShadow(1);
        const peakShadow = ctx.buildRetroNeonShadow( pulseMultiplier );
        const softShadow = ctx.buildRetroNeonShadow( 1 + (pulseMultiplier - 1) * 0.45 );
        const movingColorsA = [ ctx.settings.color1, ctx.settings.color2, ctx.settings.color3 ];
        const movingColorsB = [ ctx.settings.color2, ctx.settings.color3, ctx.settings.color1 ];
        const movingColorsC = [ ctx.settings.color3, ctx.settings.color1, ctx.settings.color2 ];
        const movingShadowA = ctx.buildRetroNeonShadow( 1, movingColorsA );
        const movingShadowB = ctx.buildRetroNeonShadow( 1, movingColorsB );
        const movingShadowC = ctx.buildRetroNeonShadow( 1, movingColorsC );
        const animationSignature = JSON.stringify({
                glowStyle: Number(ctx.settings.glowStyle) || 1, neonColors: [ ctx.settings.color1, ctx.settings.color2, ctx.settings.color3 ], effect, enabled: pulse.enabled,
                duration: pulse.duration, baseShadow, peakShadow, softShadow, movingShadowA, movingShadowB, movingShadowC
            });
        if ( overlay.dataset .shacalAnimationSignature === animationSignature ) {
            return;
        }
        overlay .getAnimations() .forEach(animation => animation.cancel() );
        overlay.dataset .shacalAnimationSignature = animationSignature;
        overlay.style.boxShadow = baseShadow;
        overlay.style.opacity = '1';
        overlay.style.transform = 'scale(1)';
        overlay.style.filter = 'none';
        if (!pulse.enabled || effect === 0) {
            return;
        }
        const halfDuration = (pulse.duration * 1000) / 2;
        if (effect === 1) {
            overlay.animate( [ {
                        boxShadow: baseShadow, opacity: 1
                    }, {
                        boxShadow: peakShadow, opacity: 0.94
                    } ], {
                    duration: halfDuration, iterations: Infinity, direction: 'alternate', easing: 'cubic-bezier(0.42, 0, 0.58, 1)'
                } );
        }
        if (effect === 2) {
            overlay.animate( [ {
                        boxShadow: baseShadow, opacity: 0.94
                    }, {
                        boxShadow: softShadow, opacity: 1, offset: 0.17
                    }, {
                        boxShadow: baseShadow, opacity: 0.90, offset: 0.31
                    }, {
                        boxShadow: peakShadow, opacity: 0.98, offset: 0.48
                    }, {
                        boxShadow: softShadow, opacity: 0.92, offset: 0.67
                    }, {
                        boxShadow: peakShadow, opacity: 1, offset: 0.82
                    }, {
                        boxShadow: baseShadow, opacity: 0.94
                    } ], {
                    duration: pulse.duration * 1000 * 1.35, iterations: Infinity, easing: 'ease-in-out'
                } );
        }
        if (effect === 3) {
            overlay.animate( [ {
                        boxShadow: movingShadowA, opacity: 1, offset: 0
                    }, {
                        boxShadow: movingShadowB, opacity: 1, offset: 0.333333
                    }, {
                        boxShadow: movingShadowC, opacity: 1, offset: 0.666667
                    }, {
                        boxShadow: movingShadowA, opacity: 1, offset: 1
                    } ], {
                    duration: pulse.duration * 1000 * 2.25, iterations: Infinity, easing: 'linear'
                } );
        }
    };
ctx.applyInnerAuraMapAnimation = function applyInnerAuraMapAnimation(overlay) {
        const inputSignature = 'applyInnerAuraMapAnimation:' + ctx.getGlowSettingsSignature();
        if (overlay.dataset.sgCachedGlow === inputSignature) return;
        overlay.dataset.sgCachedGlow = inputSignature;
        const pulse = ctx.getPulseConfig();
        const effect = Math.max( 0, Math.min( ctx.EFFECT_MAGIC_FLICKER, Number(ctx.settings.effect) || 0 ) );
        const pulseMultiplier = {
            0: 1, 1: 1.08, 2: 1.16, 3: 1.26, 4: 1.38, 5: 1.52
        }[ctx.clampLevel(ctx.settings.pulse)];
        const baseShadow = ctx.buildInnerAuraMapShadow(1);
        const peakShadow = ctx.buildInnerAuraMapShadow( pulseMultiplier );
        const softShadow = ctx.buildInnerAuraMapShadow( 1 + (pulseMultiplier - 1) * 0.45 );
        const signature = JSON.stringify({
                color: ctx.settings.color1, glow: ctx.settings.glow1, opacity: ctx.settings.opacity1, width: ctx.settings.width1, effect, enabled: pulse.enabled, duration: pulse.duration,
                baseShadow, peakShadow, softShadow
            });
        if ( overlay.dataset .shacalInnerAuraSignature === signature ) {
            return;
        }
        overlay .getAnimations() .forEach(animation => animation.cancel() );
        overlay.dataset .shacalInnerAuraSignature = signature;
        overlay.style.boxShadow = baseShadow;
        overlay.style.opacity = '1';
        overlay.style.transform = 'scale(1)';
        overlay.style.filter = 'none';
        if (!pulse.enabled || effect === 0) {
            return;
        }
        const halfDuration = (pulse.duration * 1000) / 2;
        if (effect === ctx.EFFECT_PULSE) {
            overlay.animate( [ {
                        boxShadow: baseShadow, opacity: 1
                    }, {
                        boxShadow: peakShadow, opacity: 0.94
                    } ], {
                    duration: halfDuration, iterations: Infinity, direction: 'alternate', easing: 'cubic-bezier(0.42, 0, 0.58, 1)'
                } );
        }
        if (effect === ctx.EFFECT_MAGIC_FLICKER) {
            overlay.animate( [ {
                        boxShadow: baseShadow, opacity: 0.94
                    }, {
                        boxShadow: softShadow, opacity: 1, offset: 0.17
                    }, {
                        boxShadow: baseShadow, opacity: 0.90, offset: 0.36
                    }, {
                        boxShadow: peakShadow, opacity: 1, offset: 0.58
                    }, {
                        boxShadow: softShadow, opacity: 0.93, offset: 0.79
                    }, {
                        boxShadow: baseShadow, opacity: 0.97
                    } ], {
                    duration: pulse.duration * 1000, iterations: Infinity, easing: 'ease-in-out'
                } );
        }
    };
ctx.syncMapGlowOverlay = function syncMapGlowOverlay() {
        const style = Number(ctx.settings.glowStyle) || ctx.STYLE_CLASSIC;
        if ( ![ ctx.STYLE_NEON_80S, ctx.STYLE_INNER_AURA, ctx.STYLE_ENERGY ].includes(style) || !ctx.addonFeatureEnabled('enabled') || !ctx.hasGlowForCurrentStyle() ) {
            ctx.removeMapGlowOverlay();
            return;
        }
        const activeLootWindows = ctx.getActiveGlowLootWindows();
        if (!activeLootWindows.length) {
            ctx.removeMapGlowOverlay();
            return;
        }
        const mapElement = ctx.findMapBoundsElement();
        if (!mapElement) {
            ctx.removeMapGlowOverlay();
            return;
        }
        const overlay = ctx.ensureMapGlowOverlay( mapElement );
        if (!overlay) {
            ctx.removeMapGlowOverlay();
            return;
        }
        ctx.positionMapGlowOverlay( overlay, mapElement, style );
        const styleSignature = String(style);
        if ( overlay.dataset.shacalMapGlowStyle !== styleSignature ) {
            overlay .getAnimations() .forEach(animation => animation.cancel() );
            delete overlay.dataset .shacalAnimationSignature;
            delete overlay.dataset .shacalInnerAuraSignature;
            delete overlay.dataset.sgCachedGlow;
            overlay.dataset.shacalMapGlowStyle = styleSignature;
        }
        if (style === ctx.STYLE_ENERGY) {
            ctx.setMapNeonCoreVisible(overlay, false);
            ctx.drawEnergyFrame(overlay);
            return;
        }
        ctx.clearEnergyFrame(overlay);
        if (style === ctx.STYLE_INNER_AURA) {
            overlay.style.border = '0 solid transparent';
            ctx.setMapNeonCoreVisible( overlay, false );
            ctx.applyInnerAuraMapAnimation( overlay );
        } else {
            overlay.style.border = '0 solid transparent';
            ctx.setMapNeonCoreVisible( overlay, true );
            ctx.applyMapGlowAnimation( overlay );
        }
    };
ctx.applyGlowToWindow = function applyGlowToWindow(windowElement) {
        const targetLoot = ctx.isElementVisible(windowElement) && ctx.isTargetLootWindow(windowElement);
        if (targetLoot) {
            ctx.playLegendSoundForNewItems(windowElement);
        }
        if (ctx.addonFeatureEnabled('enabled') && targetLoot) {
            windowElement.classList.add('shacal-custom-glow');
        } else {
            windowElement.classList.remove('shacal-custom-glow');
        }
        if ( !ctx.addonFeatureEnabled('enabled') || !targetLoot || !ctx.hasGlowForCurrentStyle() ) {
            ctx.removeGlowOverlay(windowElement);
            return;
        }
        const overlay = ctx.ensureGlowOverlay(windowElement);
        ctx.positionGlowOverlay(windowElement, overlay);
        ctx.requestGlowOverlayFrame();
        const pulse = ctx.getPulseConfig();
        const effect = Math.max( 0, Math.min(3, Number(ctx.settings.effect) || 0) );
        const currentGlowStyle = Number(ctx.settings.glowStyle) || ctx.STYLE_CLASSIC;
        if (currentGlowStyle === ctx.STYLE_ENERGY) {
            ctx.removeItemGlowOverlays(windowElement);
            ctx.drawEnergyFrame(overlay);
            return;
        }
        ctx.clearEnergyFrame(overlay);
        overlay.classList.add('shacal-glow-neon');
        overlay.classList.remove('shacal-glow-classic');
        overlay.style.outline = 'none';
        const shadowBuilder = currentGlowStyle === ctx.STYLE_NEON_80S
                ? ctx.buildRetroNeonShadow
                : ( currentGlowStyle === ctx.STYLE_INNER_AURA
                        ? ctx.buildInnerAuraLootShadow
                        : ctx.buildNeonShadow );
        const baseShadow = shadowBuilder(1);
        if ( currentGlowStyle === ctx.STYLE_INNER_AURA ) {
            ctx.removeItemGlowOverlays( windowElement );
        } else {
            ctx.ensureItemGlowOverlays( windowElement );
            ctx.syncItemGlowAnimations( windowElement );
        }
        const pulseMultiplier = {
            0: 1, 1: 1.08, 2: 1.16, 3: 1.26, 4: 1.38, 5: 1.52
        }[ctx.clampLevel(ctx.settings.pulse)];
        const peakShadow = shadowBuilder(pulseMultiplier);
        const softShadow = shadowBuilder( 1 + (pulseMultiplier - 1) * 0.45 );
        const movingColorsA = [ ctx.settings.color1, ctx.settings.color2, ctx.settings.color3 ];
        const movingColorsB = [ ctx.settings.color2, ctx.settings.color3, ctx.settings.color1 ];
        const movingColorsC = [ ctx.settings.color3, ctx.settings.color1, ctx.settings.color2 ];
        const movingShadowA = currentGlowStyle === ctx.STYLE_INNER_AURA
                ? shadowBuilder(1)
                : shadowBuilder(1, movingColorsA);
        const movingShadowB = currentGlowStyle === ctx.STYLE_INNER_AURA
                ? shadowBuilder(1)
                : shadowBuilder(1, movingColorsB);
        const movingShadowC = currentGlowStyle === ctx.STYLE_INNER_AURA
                ? shadowBuilder(1)
                : shadowBuilder(1, movingColorsC);
        const mainColor = ctx.getMainNeonColor();
        if (currentGlowStyle === ctx.STYLE_NEON_80S) {
            overlay.style.background = 'transparent';
            overlay.style.borderImageSource = 'none';
            overlay.style.borderImageSlice = '';
            overlay.style.borderImageWidth = '';
            overlay.style.borderImageOutset = '';
            overlay.style.border =
                `2px solid rgba(255,255,255,0.98)`;
        } else if ( currentGlowStyle === ctx.STYLE_INNER_AURA ) {
            overlay.style.background = 'transparent';
            overlay.style.borderImageSource = 'none';
            overlay.style.borderImageSlice = '';
            overlay.style.borderImageWidth = '';
            overlay.style.borderImageOutset = '';
            overlay.style.border = '0 solid transparent';
        } else {
            overlay.style.background = 'transparent';
            overlay.style.borderImageSource = 'none';
            overlay.style.borderImageSlice = '';
            overlay.style.borderImageWidth = '';
            overlay.style.borderImageOutset = '';
            overlay.style.border = mainColor === 'transparent'
                    ? '0 solid transparent'
                    : `2px solid ${ctx.hexToRgba(mainColor, 0.98)}`;
        }
        const animationSignature = JSON.stringify({
            glowStyle: Number(ctx.settings.glowStyle) || 1, neonColors: [ ctx.settings.color1, ctx.settings.color2, ctx.settings.color3 ], effect, enabled: pulse.enabled, duration: pulse.duration,
            baseShadow, peakShadow, softShadow, movingShadowA, movingShadowB, movingShadowC
        });
        const animationNeedsRefresh = overlay.dataset.shacalAnimationSignature !== animationSignature;
        if (animationNeedsRefresh) {
            overlay.getAnimations().forEach(animation => {
                animation.cancel();
            });
            overlay.dataset.shacalAnimationSignature = animationSignature;
            overlay.style.boxShadow = baseShadow;
            overlay.style.opacity = '1';
            overlay.style.transform = 'scale(1)';
            overlay.style.transformOrigin = 'center';
            overlay.style.filter = 'none';
            if (pulse.enabled && effect !== 0) {
                const halfDuration = (pulse.duration * 1000) / 2;
                if (effect === 1) {
                    overlay.animate( [ {
                                boxShadow: baseShadow, opacity: 1
                            }, {
                                boxShadow: peakShadow, opacity: 0.94
                            } ], {
                            duration: halfDuration, iterations: Infinity, direction: 'alternate', easing: 'cubic-bezier(0.42, 0, 0.58, 1)'
                        } );
                }
                if (effect === 2) {
                    overlay.animate( [ {
                                boxShadow: baseShadow, opacity: 0.94
                            }, {
                                boxShadow: softShadow, opacity: 1, offset: 0.17
                            }, {
                                boxShadow: baseShadow, opacity: 0.90, offset: 0.31
                            }, {
                                boxShadow: peakShadow, opacity: 0.98, offset: 0.48
                            }, {
                                boxShadow: softShadow, opacity: 0.92, offset: 0.67
                            }, {
                                boxShadow: peakShadow, opacity: 1, offset: 0.82
                            }, {
                                boxShadow: baseShadow, opacity: 0.94
                            } ], {
                            duration: pulse.duration * 1000 * 1.35, iterations: Infinity, easing: 'ease-in-out'
                        } );
                }
                if (effect === 3) {
                    overlay.animate( [ {
                                boxShadow: movingShadowA, opacity: 1, offset: 0
                            }, {
                                boxShadow: movingShadowB, opacity: 1, offset: 0.333333
                            }, {
                                boxShadow: movingShadowC, opacity: 1, offset: 0.666667
                            }, {
                                boxShadow: movingShadowA, opacity: 1, offset: 1
                            } ], {
                            duration: pulse.duration * 1000 * 2.25, iterations: Infinity, easing: 'linear'
                        } );
                }
            }
        }
    };
ctx.requestGlowOverlayFrame = function requestGlowOverlayFrame() {
        if (ctx.glowOverlayFrameRequested) {
            return;
        }
        ctx.glowOverlayFrameRequested = true;
        requestAnimationFrame(ctx.syncAllGlowOverlays);
    };
ctx.syncAllGlowOverlays = function syncAllGlowOverlays() {
        ctx.glowOverlayFrameRequested = false;
        for (const [windowElement, overlay] of ctx.glowOverlayMap.entries()) {
            if ( !windowElement.isConnected || !document.body.contains(windowElement) ) {
                overlay.remove();
                ctx.glowOverlayMap.delete(windowElement);
                ctx.removeItemGlowOverlays(windowElement);
                continue;
            }
            if ( !ctx.addonFeatureEnabled('enabled') || !ctx.isElementVisible(windowElement) || !ctx.isTargetLootWindow(windowElement) || !ctx.hasGlowForCurrentStyle() ) {
                overlay.remove();
                ctx.glowOverlayMap.delete(windowElement);
                ctx.removeItemGlowOverlays(windowElement);
                continue;
            }
            ctx.positionGlowOverlay(windowElement, overlay);
            if (Number(ctx.settings.glowStyle) === ctx.STYLE_ENERGY) ctx.drawEnergyFrame(overlay);
            if ( Number(ctx.settings.glowStyle) === ctx.STYLE_INNER_AURA ) {
                ctx.removeItemGlowOverlays( windowElement );
            } else {
                ctx.ensureItemGlowOverlays( windowElement );
            }
        }
        ctx.syncMapGlowOverlay();
        if ( ctx.glowOverlayMap.size > 0 || ctx.itemGlowOverlayMap.size > 0 || ctx.mapGlowOverlay ) {
            ctx.requestGlowOverlayFrame();
        }
    };},init(ctx){ctx.activeLegendTestAudio = null;
ctx.energyFrames = new WeakMap();
ctx.glowOverlayMap = new Map();
ctx.itemGlowOverlayMap = new Map();
ctx.mapGlowOverlay = null;
ctx.glowOverlayFrameRequested = false;}});
})(window.ShacalRuntime);
