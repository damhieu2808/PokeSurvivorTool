// ==UserScript==
// @name         PokeSurvivor Bot
// @namespace    https://github.com/damhieu2808/PokeSurvivorTool
// @version      1.0.0
// @description  Bot tự chơi pokesurvivor.com — luôn tải bản mới nhất từ repo gốc
// @author       damhieu2808
// @homepageURL  https://github.com/damhieu2808/PokeSurvivorTool
// @license      MIT
// @match        https://pokesurvivor.com/*
// @grant        none
// @inject-into  page
// @run-at       document-idle
// ==/UserScript==
// Installs once (Tampermonkey / Userscripts app), then on every visit fetches loader.js from the
// original repo, so updates to the bot never need a reinstall.
(() => {
  fetch(`https://raw.githubusercontent.com/damhieu2808/PokeSurvivorTool/main/loader.js?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => r.text())
    .then(t => { const s = document.createElement('script'); s.textContent = t; document.body.append(s); s.remove(); })
    .catch(e => console.warn('[PSBot] không tải được loader', e));
})();
