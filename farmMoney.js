// PokeSurvivor coin-farming preset. Paste into the DevTools Console AFTER bot.js.
// Plays real runs, tuned for Pokécoins per hour, and tracks coins from each "You fell" screen.
// Run results are summed in localStorage ("psbot.farm"). PSFarm.stats() = per-run table, PSFarm.reset() = clear.
//
// Coins (end-of-run screen): Time + Defeated + Bosses + collected pickups, × Fortune.
// Pickups and bosses pay the most, so: pick up everything, go for rifts/bosses, favour Amulet Coin.
(function start(tries = 0) {
  // bot.js may still be waiting for the game canvas (extension load): retry for a while
  if (!window.PSBot) {
    if (tries < 120) return void setTimeout(() => start(tries + 1), 500);
    console.warn('[PSFarm] chạy bot.js trước'); return;
  }
  if (window.PSFarm) window.PSFarm.unload();
  const { CFG } = window.PSBot;
  const log = (...a) => console.log('%c[PSFarm]', 'color:#fc3', ...a);

  // ---------- bot tuning ----------
  Object.assign(CFG, {
    goodRange: 2500, goodWeight: 7,     // chase every pickup on screen (tag coin drops as "Tốt" in F6)
    xpRange: 1400,                      // more levels = longer runs = more kills/bosses
    riftWeight: 10,                     // rifts lead to bosses
    autoRestart: true,
    // Level-up: prefer pickup radius / XP / coin passives
    bonusRe: /magnet|pickup|pick-up|attract|radius|coin|fortune|luck|experience|\bxp\b|exp\b|imán|monedas|suerte/i,
    bonusScore: 4,
  });
  Object.assign(CFG.itemScores, { 'amulet coin': 10, 'lucky egg': 8 });

  // ---------- coin tracking ----------
  const KEY = 'psbot.farm';
  let data = { runs: [], since: Date.now() };
  try { data = JSON.parse(localStorage.getItem(KEY)) || data; } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} };

  const num = s => +String(s || '0').replace(/[^\d]/g, '') || 0;
  const visible = el => el.getClientRects().length > 0;
  let onScreen = false;
  function scan() {
    const head = [...document.querySelectorAll('body *')].find(e => !e.children.length && visible(e) && /you fell|game over|has caído/i.test(e.innerText || ''));
    if (!head) { onScreen = false; return; }
    if (onScreen) return;                                         // already counted this screen
    let box = head;
    while (box.parentElement && !/coins/i.test(box.innerText)) box = box.parentElement;
    const t = box.innerText.replace(/\s+/g, ' ');
    const coins = num((t.match(/coins earned\s*\+?\s*([\d.,]+)/i) || [])[1]);
    if (!coins) return;                                           // numbers may still be animating in
    onScreen = true;
    const run = {
      at: Date.now(), coins,
      time: (t.match(/time\s*(\d+:\d\d)/i) || [])[1] || '',
      kills: num((t.match(/defeated\s*(\d+)/i) || [])[1]),
      bosses: num((t.match(/bosses\s*(\d+)/i) || [])[1]),
      level: num((t.match(/level\s*(\d+)/i) || [])[1]),
    };
    data.runs.push(run); save();
    log(`trận ${data.runs.length}: +${coins} xu (${run.time}, ${run.kills} quái, ${run.bosses} boss) · tổng ${total()}`);
  }
  const total = () => data.runs.reduce((a, r) => a + r.coins, 0);
  const perHour = () => {
    const h = (Date.now() - data.since) / 3600000;
    return h > 0.01 ? Math.round(total() / h) : 0;
  };

  // ---------- HUD ----------
  const hud = document.createElement('div');
  hud.style.cssText = 'position:fixed;bottom:4px;right:4px;z-index:99999;font:12px monospace;background:#000b;color:#fc3;padding:4px 6px;border-radius:4px;pointer-events:none';
  document.body.append(hud);
  const render = () => {
    const last = data.runs[data.runs.length - 1];
    hud.textContent = `farm: ${total()} xu · ${data.runs.length} trận · ${perHour()} xu/giờ${last ? ` · trận cuối +${last.coins}` : ''}`;
  };

  const timer = setInterval(() => { scan(); render(); }, 1000);
  render();

  window.PSFarm = {
    stats() {
      console.table(data.runs.map((r, i) => ({ '#': i + 1, coins: r.coins, time: r.time, kills: r.kills, bosses: r.bosses, level: r.level, at: new Date(r.at).toLocaleTimeString() })));
      log(`tổng ${total()} xu · ${data.runs.length} trận · ${perHour()} xu/giờ`);
    },
    reset() { data = { runs: [], since: Date.now() }; save(); render(); log('đã xoá thống kê'); },
    unload() { clearInterval(timer); hud.remove(); delete window.PSFarm; },
  };
  log('preset farm xu đã bật — PSFarm.stats() xem từng trận, PSFarm.reset() xoá thống kê');
})();
