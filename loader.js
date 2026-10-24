// PokeSurvivor Bot loader (damhieu2808 · https://github.com/damhieu2808/PokeSurvivorTool) — MIT License
// For browsers without Chrome extensions (Android / iOS): a bookmarklet runs this on pokesurvivor.com,
// it fetches the latest files from the original repo and runs them in the same order as manifest.json.
(async () => {
  const FILES = ['data.js', 'moves.js', 'bot.js', 'farmMoney.js'];
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
    alert(`[PSBot] ${e.message} — kiểm tra mạng rồi thử lại`);
  }
})();
