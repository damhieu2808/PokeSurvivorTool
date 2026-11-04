// PokeSurvivor Bot loader (damhieu2808 · https://github.com/damhieu2808/PokeSurvivorTool)
// For browsers without Chrome extensions (Android / iOS): a bookmarklet runs this on pokesurvivor.com (or pokesurvivor.doofcraft.com),
// it fetches the released files from the public repo and runs them in the same order as manifest.json.
// This runs in the page's own context, so it is blocked by pokesurvivor.com's CSP (script-src 'self') and only works
// on doofcraft. Android userscript installs go through psbot.user.js instead, which has a Firefox branch for that.
(async () => {
  // Stays at the repo root of both repos: bookmarklets installed earlier fetch it from there.
  // The bot files come from the public repo (built, obfuscated: publish.js)
  // PokéLit (pokelit.0d4y.cc, a fork of pokesurvivor.com) has its own copy of that profile: sites/pokelit
  const lit = /pokelit/i.test(location.hostname);
  const site = /doofcraft/i.test(location.hostname) ? 'doofcraft' : lit ? 'pokelit' : 'default';
  // moves.js is pokesurvivor.com's table; doofcraft reads its own from the game (SITE.moveTable, since 1.7.10), PokéLit
  // from its G (none when loaded this late: the bot then reads the canvas)
  const FILES = [`sites/${site}/site.js`, `sites/${site}/data.js`, ...(lit ? ['sites/pokelit/shop.js'] : []), ...(site === 'default' ? ['core/moves.js'] : []), 'core/bot.js', 'core/farmMoney.js'];
  // PokéLit's CSP limits fetch (connect-src) but not scripts: the files come as <script src> from jsDelivr, in order
  if (lit) {
    for (const f of FILES) {
      const ok = await new Promise(res => {
        const s = document.createElement('script');
        s.src = `https://cdn.jsdelivr.net/gh/damhieu2808/PokeSurvivorTool@main/${f}`;
        s.onload = () => res(true); s.onerror = () => res(false);
        document.body.append(s);
      });
      if (!ok) {
        let en = false;
        try { en = localStorage.getItem('psbot.lang') === 'en'; } catch {}
        return alert(`[PSBot] ${en ? `could not load ${f}: check the connection and try again` : `không tải được ${f} — kiểm tra mạng rồi thử lại`}`);
      }
    }
    return;
  }
  const SOURCES = [
    f => `https://raw.githubusercontent.com/damhieu2808/PokeSurvivorTool/main/${f}?t=${Date.now()}`,
    f => `https://cdn.jsdelivr.net/gh/damhieu2808/PokeSurvivorTool@main/${f}`,
  ];
  const get = async f => {
    for (const src of SOURCES) {
      try { const r = await fetch(src(f), { cache: 'no-store' }); if (r.ok) return await r.text(); } catch {}
    }
    throw new Error(`không tải được ${f}`);
  };
  try {
    const code = await Promise.all(FILES.map(get));
    // Inline <script> runs in the page itself, like the extension's "world": "MAIN"
    code.forEach((c, i) => { const s = document.createElement('script'); s.textContent = `${c}\n//# sourceURL=psbot/${FILES[i]}`; document.body.append(s); s.remove(); });
  } catch (e) {
    let en = false;
    try { en = localStorage.getItem('psbot.lang') === 'en'; } catch {}
    alert(`[PSBot] ${e.message} — ${en ? 'check the connection and try again' : 'kiểm tra mạng rồi thử lại'}`);
  }
})();
