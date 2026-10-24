// ==UserScript==
// @name         PokeSurvivor Bot
// @author       damhieu2808
// @homepageURL  https://github.com/damhieu2808/PokeSurvivorTool
// @match        https://pokesurvivor.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
//
// PokeSurvivor Bot — tác giả: damhieu2808 · https://github.com/damhieu2808/PokeSurvivorTool
// MIT License (xem LICENSE): dùng lại / chỉnh sửa thì phải giữ dòng bản quyền và giấy phép.
//
// Paste into DevTools Console, install as a Tampermonkey userscript, or load this folder as a Chrome extension (manifest.json).
// F6 = danh mục mọi sprite (ảnh + chỉ số + nút gắn nhãn) · F7 = gắn nhãn bằng click (1 tốt / 2 nguy hiểm / 3 rift / 4 vật cản / 5 buff / 6 kinh nghiệm / 7 vali / 0 xoá)
// F8 = bật/tắt bot · F9 = overlay · PSBot.catalog() = in + copy danh mục · PSBot.tags() = xem nhãn đã lưu
// PSBot.exportConfig() / nút "Xuất data.js" (F6) = tải data.js chứa nhãn + build; chép đè vào thư mục extension để máy khác có sẵn
// While loaded, Firestore/RTDB writes whose path matches CFG.rankRe are replaced by no-ops.
// Reload the page to play normally (unblocked) again.
(function start() {
  // Loaded by the extension at document_idle the game canvas may not exist yet: retry until it does
  if (!document.getElementById('game')) return void setTimeout(start, 500);
  if (window.PSBot) window.PSBot.unload();
  // Keep VERSION equal to "version" in manifest.json: a higher version on GitHub shows the update notice
  const VERSION = '1.2.0';
  const REPO = 'https://github.com/damhieu2808/PokeSurvivorTool';

  const CFG = {
    // Each frame one target is chosen: rift > good item (within goodRange) > nearest enemy.
    contact: 80,          // world units (from enemy edge): only this close do enemies push the player away
    engage: 120,          // world units: distance kept from the targeted enemy while fighting it
    huntWeight: 3,
    goodRange: 1500,      // world units: good items within this become the target
    goodWeight: 5,
    riftWeight: 8,
    magnet: 100,          // world units: initial XP pickup radius; re-learned while playing (state.magnet)
    xpRange: 900,         // world units: XP orbs within this (but outside the pickup radius) become the target
    xpWeight: 4,
    caseReach: 25,        // world units: player must stand on top of a suitcase ("case" tag) to open it
    caseTime: 5500,       // ms of (unpaused) game time to stay next to a suitcase
    buffReach: 80,        // world units: this close to a buff shrine (gem pillar) counts as "visited"
    buffCooldown: 30000,  // ms before going back to the same shrine
    lookahead: 140,       // world units: how far ahead each candidate direction is evaluated
    aim: false,           // true = move the mouse cursor onto the nearest enemy (if moves aim at the cursor)
    hazardMargin: 40,     // world units added around hazard effects
    autoTelegraph: true,  // untagged red-ish path shapes (attack range previews) count as hazards
    enemyRe: /\/assets\/pokemon\/\d+\/(?!Faint)\w+\.png/,
    // src -> 'good' | 'hazard' | 'rift' | 'wall' | 'buff' | 'safe'; edit with F6/F7, saved in localStorage
    tags: { 'canvas:14x14': 'hazard', 'canvas:12x12': 'hazard' },
    autoPick: true,
    // Consumable item slots (hotkeys 5-8): pressed blindly while a run is unpaused, so any item gets used at once
    useItems: true,
    itemKeys: ['5', '6', '7', '8'],
    itemEvery: 1000,      // ms between presses
    // Only the active move fires: cycle it (E = next) so every move's cooldown gets used
    swapSkills: true,
    swapEvery: 10,        // ms between switches; the bot loop runs once per frame (~16 ms), so below that = every frame
    // Held items to drop for any other item, even an unknown one
    swapAwayItems: ['choice band'],
    // Held items ("An item! You can only hold one"): higher = better. The site lists them unranked,
    // so this ranking favours damage/cooldown, then survival, then utility. Edit freely.
    itemScores: {
      'quick claw': 9,      // -20% cooldown on every move, no downside
      'life orb': 8,        // +30% damage, small HP cost per attack (never KOs)
      'choice band': 0,     // +40% damage, but locks moves (breaks E skill cycling): only when nothing else is offered
      'leftovers': 7,       // 1.5% max HP/s regen
      'assault vest': 7,    // -20% damage taken
      'lucky egg': 6,       // +30% XP -> more levels
      'focus sash': 6,      // survive a KO hit once per 60 s
      'choice scarf': 5,    // +35% speed
      'shell bell': 5,      // heal 4% of damage dealt
      'amulet coin': 4,     // more coins at the end of the run, no combat effect
      'rocky helmet': 3,    // only punishes melee attackers
    },
    // Card text that marks "this pick unlocks the evolution of a maxed skill" (adjust once the real wording is known)
    evoRe: /evol|evoluc|awaken|despert|unlock|desbloq|tiến hoá|★|⭐/i,
    maxSkills: 2,         // total active skills (incl. the starting one) when the pokémon has no build
    // Pokémon name (as shown in the HUD, lower-case) -> moves in priority order. Build moves are always
    // taken/levelled first; moves outside the build are avoided. Set them in the "Moveset" popup (saved to data.js on export).
    builds: {},
    // Auto replay: when no run is active, click the first visible button matching these, in order
    autoRestart: true,
    restartSteps: [
      /^(play again|try again|retry|restart|jugar de nuevo|volver a jugar|reintentar|otra vez|chơi lại)/i,
      /^(back to menu|volver al men[uú]|về menu)/i,
      /^(play|jugar|chơi)/i,
      /^(start|go!?|let'?s go|comenzar|empezar|bắt đầu)/i,
      /^(back|menu|volver|ok|aceptar|close|cerrar|đóng)$/i,
    ],
    restartAvoid: /together|juntos|friend|amigo|gacha|shop|tienda|log ?out|sign|link|delete|borrar|revive|revivir|gem|buy|comprar/i,
    background: true,     // keep the game running when the tab is hidden / window covered (see "keep running")
    blockRank: true,
    rankRe: /rank|leader|board|score|season/i,
    logNet: true,
  };

  const canvas = document.getElementById('game');
  const state = {
    // Idle until ▶ Chạy in the control panel (or F8); target = runs to play (0 = forever), done = runs finished
    on: false, target: 0, done: 0, debug: true, keys: {}, dir: null, frame: [], lastFrame: [], texts: [], hudTexts: new Set(),
    posHist: [], walls: [], ignore: [], stuck: [], escape: null, pickAt: 0, netBlocked: 0, picks: {}, newSkills: 0,
    magnet: CFG.magnet, prevXp: [],
  };
  const log = (...a) => console.log('%c[PSBot]', 'color:#7cf', ...a);
  // Priority: defaults above < data.js (bundled with the extension, same on every machine) < localStorage (this browser)
  const DATA = window.PSBotData || {};
  Object.assign(CFG.tags, DATA.tags);
  const userBuilds = { ...DATA.builds };
  const TAG_KEY = 'psbot.tags';
  try { Object.assign(CFG.tags, JSON.parse(localStorage.getItem(TAG_KEY) || '{}')); } catch {}
  const saveTags = () => { try { localStorage.setItem(TAG_KEY, JSON.stringify(CFG.tags)); } catch {} };
  const BUILD_KEY = 'psbot.builds';
  try { Object.assign(userBuilds, JSON.parse(localStorage.getItem(BUILD_KEY) || '{}')); } catch {}
  Object.assign(CFG.builds, userBuilds);
  for (const k in CFG.builds) if (!CFG.builds[k].length) delete CFG.builds[k];   // [] = build deleted on this machine

  // ---------- frame capture ----------
  const P = CanvasRenderingContext2D.prototype;
  const origDraw = P.drawImage, origArc = P.arc;
  // Offscreen canvases are keyed by size + pixel hash so same-sized sprites (chest vs bush) differ
  const canvasKeys = new WeakMap();
  const srcName = img => {
    if (img.src) return img.src.replace(location.origin, '');
    let k = canvasKeys.get(img);
    if (!k) {
      k = `canvas:${img.width}x${img.height}`;
      try {
        const d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data;
        let h = 0;
        for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13 + d[i + 3] * 17) | 0;
        k += '#' + (h >>> 0).toString(36);
      } catch {}
      canvasKeys.set(img, k);
    }
    return k;
  };
  // Exact key first, then the size-only key (older tags / defaults)
  const tagOf = src => CFG.tags[src] || CFG.tags[src.split('#')[0]];
  const record = (ctx, src, cx, cy, w, h, img, rect) => {
    const m = ctx.getTransform();
    state.frame.push({ src, x: m.a * cx + m.c * cy + m.e, y: m.b * cx + m.d * cy + m.f, w: w * m.a, h: h * m.d, s: m.a, e: m.e, f: m.f, img, rect });
  };
  P.drawImage = function (img, ...a) {
    if (this.canvas === canvas) {
      const [dx, dy, dw, dh] = a.length === 8 ? a.slice(4) : a.length === 4 ? a : [a[0], a[1], img.width, img.height];
      record(this, srcName(img), dx + dw / 2, dy + dh / 2, dw, dh, img, a.length === 8 ? a.slice(0, 4) : null);
    }
    return origDraw.call(this, img, ...a);
  };
  P.arc = function (x, y, r, a0, a1, ccw) {
    if (this.canvas === canvas) { record(this, `arc:${this.fillStyle}`, x, y, r * 2, r * 2); addArc(this, x, y, r, r, 0, a0, a1, ccw); }
    return origArc.call(this, x, y, r, a0, a1, ccw);
  };
  // HUD text (move names, timer) tells which skills the player already owns
  const origText = P.fillText;
  P.fillText = function (text, ...a) {
    if (this.canvas === canvas) state.texts.push(String(text).trim());
    return origText.call(this, text, ...a);
  };

  // Attack telegraphs (lines, beams, circles, cones) are drawn as paths, not sprites.
  // Path points are tracked in screen space; on fill/stroke the shape is recorded as
  // a frame item with geometry (poly / line) keyed "fill:<style>" or "stroke:<style>".
  const PATH = { subs: [], cur: null };
  const pathOrig = { beginPath: P.beginPath, moveTo: P.moveTo, lineTo: P.lineTo, rect: P.rect, ellipse: P.ellipse, fill: P.fill, stroke: P.stroke, fillRect: P.fillRect };
  const tp = (ctx, x, y) => { const m = ctx.getTransform(); return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }; };
  const addPt = (ctx, x, y, fresh) => {
    if (fresh || !PATH.cur) PATH.subs.push(PATH.cur = []);
    PATH.cur.push(tp(ctx, x, y));
  };
  const addArc = (ctx, x, y, rx, ry, rot, a0, a1, ccw) => {
    let span = ccw ? a0 - a1 : a1 - a0;
    if (span < 0 || span > Math.PI * 2) span = Math.PI * 2;
    const n = Math.max(6, Math.ceil(span / (Math.PI / 8)));
    for (let i = 0; i <= n; i++) {
      const a = a0 + (ccw ? -1 : 1) * span * i / n;
      const ex = rx * Math.cos(a), ey = ry * Math.sin(a);
      addPt(ctx, x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot));
    }
  };
  const styleKey = s => typeof s === 'string' ? s.replace(/\s+/g, '') : 'gradient';
  const recordShape = (ctx, kind, pts, style) => {
    const s = ctx.getTransform().a;
    if (s === 1 || pts.length < 2) return;                          // HUD / UI is drawn untransformed
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const lw = kind === 'line' ? ctx.lineWidth * s : 0;
    if ((x1 - x0 + lw) * (y1 - y0 + lw) < 150) return;              // ignore tiny particles
    const m = ctx.getTransform();
    state.frame.push({ src: `${kind === 'line' ? 'stroke' : 'fill'}:${styleKey(style)}`, x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0 + lw, h: y1 - y0 + lw,
      s, e: m.e, f: m.f, shape: kind, pts, lw, alpha: ctx.globalAlpha });
  };
  P.beginPath = function () { if (this.canvas === canvas) { PATH.subs = []; PATH.cur = null; } return pathOrig.beginPath.call(this); };
  P.moveTo = function (x, y) { if (this.canvas === canvas) addPt(this, x, y, true); return pathOrig.moveTo.call(this, x, y); };
  P.lineTo = function (x, y) { if (this.canvas === canvas) addPt(this, x, y); return pathOrig.lineTo.call(this, x, y); };
  P.rect = function (x, y, w, h) {
    if (this.canvas === canvas) { addPt(this, x, y, true); addPt(this, x + w, y); addPt(this, x + w, y + h); addPt(this, x, y + h); }
    return pathOrig.rect.call(this, x, y, w, h);
  };
  P.ellipse = function (x, y, rx, ry, rot, a0, a1, ccw) {
    if (this.canvas === canvas) addArc(this, x, y, rx, ry, rot, a0, a1, ccw);
    return pathOrig.ellipse.call(this, x, y, rx, ry, rot, a0, a1, ccw);
  };
  P.fill = function (...a) {
    if (this.canvas === canvas && !a.length) PATH.subs.forEach(sp => sp.length >= 3 && recordShape(this, 'poly', sp, this.fillStyle));
    return pathOrig.fill.apply(this, a);
  };
  P.stroke = function (...a) {
    if (this.canvas === canvas && !a.length) PATH.subs.forEach(sp => recordShape(this, 'line', sp, this.strokeStyle));
    return pathOrig.stroke.apply(this, a);
  };
  P.fillRect = function (x, y, w, h) {
    if (this.canvas === canvas) recordShape(this, 'poly', [tp(this, x, y), tp(this, x + w, y), tp(this, x + w, y + h), tp(this, x, y + h)], this.fillStyle);
    return pathOrig.fillRect.call(this, x, y, w, h);
  };
  // Untagged shapes in a reddish colour are treated as telegraphs by default
  const isTelegraph = d => {
    const m = d.src.match(/(?:fill|stroke):(?:#([0-9a-f]{6})|rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\))/i);
    if (!m) return false;
    const [r, g, b] = m[1] ? [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)) : [+m[2], +m[3], +m[4]];
    return r >= 170 && g <= 120 && b <= 120;
  };

  // ---------- input ----------
  const KEYS = { up: ['w', 'KeyW', 87], down: ['s', 'KeyS', 83], left: ['a', 'KeyA', 65], right: ['d', 'KeyD', 68] };
  const sendKey = (type, key, code, keyCode) =>
    window.dispatchEvent(new KeyboardEvent(type, { key, code, keyCode, which: keyCode, bubbles: true }));
  const setKey = (k, down) => {
    if (!!state.keys[k] === down) return;
    state.keys[k] = down;
    sendKey(down ? 'keydown' : 'keyup', ...KEYS[k]);
  };
  const releaseAll = () => Object.keys(KEYS).forEach(k => setKey(k, false));
  const tap = (key, code, keyCode) => { sendKey('keydown', key, code, keyCode); setTimeout(() => sendKey('keyup', key, code, keyCode), 60); };

  function applyDir(dir) {
    state.dir = dir;
    const [x, y] = dir || [0, 0];
    setKey('left', x < -0.38); setKey('right', x > 0.38);
    setKey('up', y < -0.38); setKey('down', y > 0.38);
  }

  // ---------- movement ----------
  const segDist = (p, a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy;
    const t = l ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l)) : 0;
    return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
  };
  // Screen-space distance from point p to a recorded shape; negative when inside
  function shapeDist(h, p) {
    const pts = h.pts;
    let edge = Infinity;
    for (let i = 0; i < pts.length - 1; i++) edge = Math.min(edge, segDist(p, pts[i], pts[i + 1]));
    if (h.shape === 'line') return edge - h.lw / 2;
    edge = Math.min(edge, segDist(p, pts[pts.length - 1], pts[0]));
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      if ((pts[i].y > p.y) !== (pts[j].y > p.y) && p.x < (pts[j].x - pts[i].x) * (p.y - pts[i].y) / (pts[j].y - pts[i].y) + pts[i].x) inside = !inside;
    }
    return inside ? -edge : edge;
  }
  const DIRS = Array.from({ length: 16 }, (_, i) => [Math.cos(i * Math.PI / 8), Math.sin(i * Math.PI / 8)]);

  function tick(frame) {
    const world = frame.filter(d => d.s !== 1);
    if (!world.length) return;
    const s = world[0].s;
    const me = { x: canvas.width / 2, y: canvas.height / 2 };
    const pokes = world.filter(d => CFG.enemyRe.test(d.src));
    // The sprite closest to the camera centre is the player itself
    const self = pokes.reduce((b, d) => { const r = Math.hypot(d.x - me.x, d.y - me.y); return r < 40 * s && (!b || r < b.r) ? { d, r } : b; }, null);
    if (self) { me.x = self.d.x; me.y = self.d.y; }
    const enemies = pokes.filter(d => !self || d !== self.d);
    const byTag = t => world.filter(d => tagOf(d.src) === t);
    const goods = byTag('good'), rifts = byTag('rift'), buffs = byTag('buff'), xps = byTag('xp'), cases = byTag('case');
    const hazards = world.filter(d => tagOf(d.src) === 'hazard' || (d.shape && !tagOf(d.src) && CFG.autoTelegraph && isTelegraph(d)));
    state.view = { me, enemies, goods, hazards, rifts, buffs, xps, cases, s };

    // Stuck detection: player's world position barely changes while a key is held.
    // Each stuck event leaves a temporary "wall" point ahead of the player; repeated
    // stuck events trigger an escape run in a random direction away from those walls.
    const now = performance.now();
    const e0 = world[0].e, f0 = world[0].f;
    const toScreen = w => ({ x: w.x * s + e0, y: w.y * s + f0 });
    const meW = { x: (me.x - e0) / s, y: (me.y - f0) / s };
    state.walls = state.walls.filter(w => w.until > now);
    state.ignore = state.ignore.filter(w => w.until > now);

    // Learn the XP pickup radius: an orb that was resting and starts moving (pulled in)
    // or vanishes was at about the pickup radius from the player one frame earlier.
    const xpNow = xps.map(d => ({ x: (d.x - e0) / s, y: (d.y - f0) / s, sx: d.x, sy: d.y, rest: false }));
    for (const p of xpNow) p.rest = state.prevXp.some(q => Math.hypot(p.x - q.x, p.y - q.y) < 4);
    for (const q of state.prevXp) {
      if (!q.rest || xpNow.some(p => Math.hypot(p.x - q.x, p.y - q.y) < 4)) continue;
      const onScreen = q.sx > 30 && q.sy > 30 && q.sx < canvas.width - 30 && q.sy < canvas.height - 30;
      const d = Math.hypot(q.x - state.prevMe.x, q.y - state.prevMe.y);
      if (onScreen && d > 20 && d < state.magnet * 3) state.magnet = state.magnet * 0.8 + d * 0.2;
    }
    state.prevXp = xpNow; state.prevMe = meW;
    // While the game is paused (level-up / item dialogs) the player can't move: not "stuck"
    if (now - (state.timerChangedAt || now) > 1500) state.posHist.length = 0;
    else state.posHist.push(meW);
    if (state.posHist.length > 20) {
      const old = state.posHist.shift();
      if (state.on && state.dir && Math.hypot(meW.x - old.x, meW.y - old.y) < 3) {
        state.walls.push({ x: meW.x + state.dir[0] * 60, y: meW.y + state.dir[1] * 60, until: now + 6000 });
        if (state.view.prevTarget && !state.view.prevTarget.enemy) state.ignore.push({ ...state.view.prevTarget.w, until: now + 8000 });
        state.stuck = state.stuck.filter(t => t > now - 3000).concat(now);
        if (state.stuck.length >= 2) {
          const away = state.walls.reduce((a, w) => [a[0] + meW.x - w.x, a[1] + meW.y - w.y], [0, 0]);
          const ang = Math.atan2(away[1], away[0]) + (Math.random() - 0.5) * Math.PI / 1.5;
          state.escape = { dir: [Math.cos(ang), Math.sin(ang)], until: now + 900 };
          state.stuck = [];
        }
        state.posHist.length = 0;
      }
    }
    if (!state.on) return;

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) / s;
    const nearestTo = list => list.reduce((b, d) => (!b || dist(d, me) < dist(b, me) ? d : b), null);
    // Items that got us stuck (behind a wall) are ignored for a while
    const reachable = list => list.filter(d => !state.ignore.some(w => Math.hypot((d.x - e0) / s - w.x, (d.y - f0) / s - w.y) < 50));
    const walls = state.walls.map(toScreen).concat(byTag('wall'));
    const rift = nearestTo(reachable(rifts)), good = nearestTo(reachable(goods)), foe = nearestTo(enemies);
    const buff = nearestTo(reachable(buffs));
    // Once next to a buff shrine the buff is granted; skip that shrine for buffCooldown
    if (buff && dist(buff, me) < CFG.buffReach) state.ignore.push({ x: (buff.x - e0) / s, y: (buff.y - f0) / s, until: now + CFG.buffCooldown });
    // Suitcase: stay within caseReach for caseTime of game time (paused time doesn't count),
    // then skip it for a minute. Leaving the radius restarts the countdown.
    const kase = nearestTo(reachable(cases));
    const paused = now - (state.timerChangedAt || now) > 1500;
    const dt = Math.min(100, now - (state.lastTick || now)); state.lastTick = now;
    if (kase && dist(kase, me) < CFG.caseReach) {
      const kw = { x: (kase.x - e0) / s, y: (kase.y - f0) / s };
      if (!state.dwell || Math.hypot(state.dwell.x - kw.x, state.dwell.y - kw.y) > 30) state.dwell = { ...kw, t: 0 };
      if (!paused) state.dwell.t += dt;
      if (state.dwell.t > CFG.caseTime) { state.ignore.push({ ...kw, until: now + 60000 }); state.dwell = null; log('mở vali xong'); }
    } else state.dwell = null;

    // hold = stand right on the target (suitcase) instead of walking through it
    let target = null, weight = 0, stop = 0, hold = false, xp;
    if (rift) { target = rift; weight = CFG.riftWeight; }
    else if (kase && dist(kase, me) < CFG.goodRange) { target = kase; weight = CFG.goodWeight; hold = dist(kase, me) < CFG.caseReach; }
    else if (buff && dist(buff, me) >= CFG.buffReach && dist(buff, me) < CFG.goodRange) { target = buff; weight = CFG.goodWeight; }
    else if (good && dist(good, me) < CFG.goodRange) { target = good; weight = CFG.goodWeight; }
    // XP: only walk until the orb is inside the pickup radius; it flies in by itself from there
    else if ((xp = nearestTo(xps.filter(d => dist(d, me) > state.magnet * 0.8))) && dist(xp, me) < CFG.xpRange) {
      target = xp; weight = CFG.xpWeight; stop = state.magnet * 0.6;
    }
    else if (foe) { target = foe; weight = CFG.huntWeight; stop = CFG.engage; }
    state.view.target = target;
    state.view.prevTarget = target && { enemy: target === foe, w: { x: (target.x - e0) / s, y: (target.y - f0) / s } };
    state.view.walls = walls;
    const escape = state.escape && state.escape.until > now ? state.escape.dir : null;

    const cost = dir => {
      const at = k => ({ x: me.x + (dir ? dir[0] : 0) * CFG.lookahead * s * k, y: me.y + (dir ? dir[1] : 0) * CFG.lookahead * s * k });
      const p = at(1);
      let c = 0;
      for (const e of enemies) {
        const d = dist(p, e) - Math.max(e.w, e.h) / 2 / s;          // bigger sprites (bosses) count as closer
        if (d < CFG.contact) c += 10 * ((CFG.contact - Math.max(d, 0)) / CFG.contact) ** 2;
      }
      // Hazards are checked along the way (half and full step) so the path doesn't cross a telegraph
      for (const q of [at(0.5), p]) {
        for (const h of hazards) {
          if (h.shape) {
            const d = shapeDist(h, q) / s;                            // < 0 = inside
            if (d < CFG.hazardMargin) c += 25 * Math.min(1, (CFG.hazardMargin - d) / CFG.hazardMargin) + (d < 0 ? 10 : 0);
          } else {
            const d = dist(q, h), r = Math.max(h.w, h.h) / 2 / s + CFG.hazardMargin;
            if (d < r) c += 20 * (1 - d / r) + 5;
          }
        }
      }
      for (const w of walls) {
        const d = dist(p, w), r = (w.w ? Math.max(w.w, w.h) / 2 / s : 0) + 70;
        if (d < r) c += 15 * (1 - d / r) + 3;
      }
      if (escape) c -= dir ? 8 * (dir[0] * escape[0] + dir[1] * escape[1]) : 0;
      else if (target && hold) c += weight * dist(p, target) / CFG.lookahead;     // already on top: stay put
      // Pickups: score by how close the step passes over the item (not where it ends), so the
      // player walks straight through it instead of stopping a few pixels short
      else if (target && !stop) c += weight * (segDist(target, me, p) / s + 0.2 * dist(p, target)) / CFG.lookahead;
      else if (target) c += weight * Math.abs(dist(p, target) - stop) / CFG.lookahead;
      if (dir && dir === state.dir) c -= 0.15;                       // keep heading, avoid jitter
      return c;
    };
    // Standing still is never chosen while heading for a pickup / buff / rift
    let pick = null, pickCost = target && !stop && !hold && !escape ? Infinity : cost(null) + (hold ? 0 : 0.1);
    DIRS.forEach(d => {
      const c = cost(d);
      if (c < pickCost) { pick = d; pickCost = c; }
    });
    applyDir(pick);

    if (CFG.aim && foe) {
      const r = canvas.getBoundingClientRect();
      const clientX = r.left + foe.x * r.width / canvas.width, clientY = r.top + foe.y * r.height / canvas.height;
      window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY, bubbles: true }));
    }
  }

  // ---------- level-up ----------
  // Priority: level up an owned skill (most-levelled first) > offensive passive > new skill
  // (only while under CFG.maxSkills) > defensive passive. Status / no-damage moves are avoided.
  // getClientRects (not offsetParent, which is null for position:fixed menus) + not hidden
  const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const ATK_RE = /damage|dmg|power|attack|crit|cooldown|hit|area|projectile|range|pierce|burst|daño|dano|ataque|dégât/i;
  const DEF_RE = /hp|health|heal|regen|armor|armour|defen|shield|speed|magnet|pickup|vida|salud/i;
  const fontSize = el => parseFloat(getComputedStyle(el).fontSize) || 0;
  // The HUD draws the current pokémon's name; use it to look up its build
  const currentBuild = () => {
    for (const t of state.hudTexts) { const b = CFG.builds[t.toLowerCase()]; if (b) return b; }
    return null;
  };
  function readCard(k) {
    let card = k;
    while (card.parentElement && card.parentElement.querySelectorAll('div.key').length === 1) card = card.parentElement;
    const t = card.innerText;
    // Card title = the largest text in the card that is not the hotkey digit
    const leaves = [...card.querySelectorAll('*')].filter(e => !e.children.length && e !== k && /\D/.test(e.innerText || ''));
    const title = leaves.reduce((b, e) => (!b || fontSize(e) > fontSize(b) ? e : b), null);
    const name = title ? title.innerText.trim() : '';
    const shownLv = t.match(/\b(?:Lv|Nv|Niv)\.?\s*(\d+)/i);                 // "Lv. 3" chip on owned skills, if the game shows one
    const level = Math.max((state.picks[name] || 0) + (state.hudTexts.has(name) ? 1 : 0), shownLv ? +shownLv[1] - 1 : 0);
    const isNew = /\bNew\b|Nuevo|Novo|Mới/i.test(t);
    const build = currentBuild();
    const buildIdx = build ? build.findIndex(m => m.toLowerCase() === name.toLowerCase()) : -1;
    const why = [];
    let score = 0;
    // A card that completes a maxed skill's evolution beats everything else
    if (CFG.evoRe.test(t) || /evo|awaken|ultimate/i.test(card.className + ' ' + [...card.querySelectorAll('[class]')].map(e => e.className).join(' '))) {
      score += 40; why.push('mở tiến hoá skill');
    }
    if (buildIdx >= 0) {
      // Build move: earlier in the build = higher; owned ones also get the stacking bonus
      score += 20 - buildIdx * 2 + 3 * level;
      why.push(`trong build #${buildIdx + 1}${level > 0 ? ` (cấp ${level})` : ''}`);
    } else if (/no damage|sin daño|sem dano/i.test(t)) { score -= 6; why.push('không gây sát thương'); }
    else if (level > 0 && !isNew) { score += 8 + 3 * level; why.push(`dồn skill đang có (cấp ${level})`); }
    else if (isNew) {
      const room = !build && 1 + state.newSkills < CFG.maxSkills;
      score += room ? 3 : -3; why.push(build ? 'skill mới ngoài build' : room ? 'skill mới (còn slot)' : 'skill mới (đủ skill rồi)');
    } else if (ATK_RE.test(t)) { score += 5; why.push('nội tại tấn công'); }
    else if (DEF_RE.test(t)) { score += 1; why.push('nội tại phòng thủ'); }
    if (card.querySelector('.fit-low')) { score -= 3; why.push('hợp kém với pokémon'); }
    if (card.querySelector('.fit-high')) { score += 2; why.push('hợp tốt'); }
    if (CFG.bonusRe && CFG.bonusRe.test(t)) { score += CFG.bonusScore || 0; why.push('ưu tiên preset'); }   // set by presets (farmMoney.js)
    return { key: k.innerText.trim(), name, isNew, score, why: why.join(', '), text: t.replace(/\s+/g, ' ').slice(0, 100) };
  }
  function levelUp() {
    if (!CFG.autoPick || !state.on || !visible(document.getElementById('lvl-num')) || performance.now() < state.pickAt) return;
    const keys = [...document.querySelectorAll('div.key')].filter(visible);
    if (!keys.length) return;
    const cards = keys.map(readCard).sort((a, b) => b.score - a.score);
    state.pickAt = performance.now() + 800;
    console.table(cards);
    const rerolls = +(document.getElementById('lvl-rr-n') || {}).innerText || 0;
    if (cards[0].score < 2 && rerolls > 0) { log('reroll'); tap('r', 'KeyR', 82); return; }
    const c = cards[0];
    state.picks[c.name] = (state.picks[c.name] || 0) + 1;
    if (c.isNew) state.newSkills++;
    log('chọn', c.key, c.name, '—', c.why);
    tap(c.key, `Digit${c.key}`, 48 + +c.key);
  }

  // Only while the run timer is ticking and no level-up is open: the dialogs also use digit hotkeys
  function useItems(t) {
    if (!CFG.useItems || !state.on || t < (state.itemAt || 0)) return;
    if (!state.timerText || t - state.timerChangedAt > 1100 || visible(document.getElementById('lvl-num'))) return;
    state.itemAt = t + CFG.itemEvery;
    CFG.itemKeys.forEach(k => tap(k, `Digit${k}`, 48 + +k));
  }
  function swapSkills(t) {
    if (!CFG.swapSkills || !state.on || t < (state.swapAt || 0)) return;
    if (!state.timerText || t - state.timerChangedAt > 1100 || visible(document.getElementById('lvl-num'))) return;
    state.swapAt = t + CFG.swapEvery;
    // Press + release at once: tap()'s 60 ms hold would leave E down and swallow the next presses
    sendKey('keydown', 'e', 'KeyE', 69); sendKey('keyup', 'e', 'KeyE', 69);
  }

  // ---------- choice dialogs: held item ("An item!") and move bonding ("Bond!") ----------
  // Climb from the header to the first ancestor that `isDialog` accepts, then split it into
  // option rows: one per single-digit hotkey, widened while the ancestor holds only that digit.
  function dialogRows(head, isDialog) {
    let dialog = head;
    while (dialog.parentElement && !isDialog(dialog)) dialog = dialog.parentElement;
    const digits = [...dialog.querySelectorAll('*')].filter(e => !e.children.length && visible(e) && /^\d$/.test((e.innerText || '').trim()));
    return digits.map(k => {
      let row = k;
      while (row.parentElement && row.parentElement !== dialog && [...row.parentElement.querySelectorAll('*')].filter(e => digits.includes(e)).length === 1) row = row.parentElement;
      return { key: k.innerText.trim(), text: row.innerText.replace(/\s+/g, ' ').trim() };
    }).filter(o => o.text.length > 3);
  }
  function pickRow(kind, opts) {
    if (!opts.length) return;
    opts.sort((a, b) => b.score - a.score);
    state.pickAt = performance.now() + 800;
    console.table(opts);
    log(kind, opts[0].key, opts[0].name || '?', opts[0].why || '');
    tap(opts[0].key, `Digit${opts[0].key}`, 48 + +opts[0].key);
  }
  function dialogPick() {
    const now = performance.now();
    if (!CFG.autoPick || !state.on || now < state.pickAt || now < (state.itemScanAt || 0)) return;
    state.itemScanAt = now + 300;                                     // full DOM scan, so not every frame
    const head = [...document.querySelectorAll('body *')].find(e => !e.children.length && visible(e) && /only hold one|An item!|Bond!|to bond/i.test(e.innerText || ''));
    if (!head) return;

    if (/bond/i.test(head.innerText)) {
      // A pokémon's build IS its bond set: build moves always go first, in build order.
      // Outside the build: highest level first, damage over no-damage.
      const build = currentBuild() || [];
      pickRow('bond', dialogRows(head, el => (el.innerText.match(/\b(?:Nv|Lv|Niv)\.?\s*\d/gi) || []).length >= 2).map(o => {
        const lv = +((o.text.match(/\b(?:Nv|Lv|Niv)\.?\s*(\d+)/i) || [])[1] || 0);
        const name = o.text.replace(/\s*\b(?:Nv|Lv|Niv)\.?\s*\d+.*$/i, '').trim();
        const idx = build.findIndex(m => m.toLowerCase() === name.toLowerCase());
        const noDmg = /no damage|sin daño|sem dano/i.test(o.text);
        const score = idx >= 0 ? 100 - idx * 10 : lv * 3 + (noDmg ? -6 : 2);
        return { ...o, name, score, why: `Nv.${lv}${idx >= 0 ? ` · build #${idx + 1}` : ''}${noDmg ? ' · không sát thương' : ''}` };
      }));
      return;
    }

    // Held item: keep / switch by CFG.itemScores
    const names = Object.keys(CFG.itemScores);
    pickRow('chọn đồ', dialogRows(head, el => names.some(n => el.innerText.toLowerCase().includes(n))).map(o => {
      const name = names.find(n => o.text.toLowerCase().includes(n));
      const keep = /^keep|giữ|mantener|conservar/i.test(o.text);
      const dump = keep && CFG.swapAwayItems.includes(name);       // below unknown items (-1): any swap beats keeping it
      return { ...o, name, keep, score: dump ? -2 : name ? CFG.itemScores[name] + (keep ? 0.5 : 0) : -1, why: dump ? '(giữ — muốn bỏ)' : keep ? '(giữ)' : '' };
    }));
  }

  // ---------- auto replay ----------
  // Runs forever (game over -> Back to menu -> Play -> ...) until the bot is switched off with F8.
  // Acts when the game-over screen or the main menu's Play button is on screen, or as a fallback
  // when the HUD timer has stopped ticking (the menu background may keep rendering the map).
  function autoRestart(now) {
    if (!CFG.autoRestart || !state.on || now < (state.restartAt || 0)) return;
    state.restartAt = now + 1500;
    // Paused for a choice (level-up / item / bond) is not the end of a run
    if (visible(document.getElementById('lvl-num'))) return;
    const leaves = [...document.querySelectorAll('body *')].filter(e => !e.children.length && visible(e));
    if (leaves.some(e => /only hold one|An item!|Bond!|to bond/i.test(e.innerText || ''))) return;
    // Only buttons actually on top at their centre (not faded out / covered by the game canvas);
    // the bot's own top-right dock is looked through, so it can't hide the game's Play button
    const onTop = b => {
      const r = b.getBoundingClientRect();
      const t = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find(e => !dock.contains(e));
      return !!t && (t === b || b.contains(t));
    };
    const buttons = [...document.querySelectorAll('button, [role=button]')].filter(b => visible(b) && !dock.contains(b) && onTop(b));
    const over = leaves.some(e => /you fell|game over|has caído|caíste/i.test(e.innerText || ''));
    const menu = buttons.some(b => /^(play|jugar)/i.test((b.innerText || '').trim()) && /dungeon|mazmorra/i.test(b.innerText));
    if (!over && !menu && now - (state.timerChangedAt || 0) < 2500) return;
    const justEnded = over && !state.runEnded;
    state.runEnded = over;
    if (justEnded) {
      state.done++;
      log(`xong ván ${state.done}${state.target ? `/${state.target}` : ''}`);
      if (state.target && state.done >= state.target) { state.on = false; applyDir(null); log('đã chơi đủ số ván — dừng'); return; }
    }
    for (const re of CFG.restartSteps) {
      const b = buttons.find(b => { const x = (b.innerText || '').trim(); return re.test(x) && !CFG.restartAvoid.test(x); });
      if (b) { log('tự chơi lại: bấm', JSON.stringify(b.innerText.trim().slice(0, 40))); b.click(); return; }
    }
  }

  // ---------- leaderboard guard ----------
  const XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send, WS = WebSocket.prototype.send;
  const noopWrite = name => ({
    update: { name: name.replace(/\/documents\/.*$/, `/documents/profiles/${firebase.auth().currentUser.uid}`), fields: {} },
    updateMask: { fieldPaths: [] },
  });
  function filterFirestore(body) {
    const p = new URLSearchParams(body);
    let changed = false;
    for (const [k, v] of [...p]) {
      if (!/^req\d+___data__$/.test(k)) continue;
      let msg; try { msg = JSON.parse(v); } catch { continue; }
      if (!Array.isArray(msg.writes)) continue;
      msg.writes = msg.writes.map(w => {
        const name = (w.update && w.update.name) || w.delete || (w.transform && w.transform.document) || '';
        const path = name.replace(/^.*?\/documents\//, '');
        const hit = CFG.blockRank && CFG.rankRe.test(path);
        if (CFG.logNet) log(`firestore ${hit ? 'CHẶN' : 'ghi'}: ${path}`, hit ? '' : Object.keys((w.update && w.update.fields) || {}));
        if (!hit) return w;
        changed = true; state.netBlocked++;
        return noopWrite(name);
      });
      p.set(k, JSON.stringify(msg));
    }
    return changed ? p.toString() : body;
  }
  function filterRtdb(data) {
    let m; try { m = JSON.parse(data); } catch { return data; }
    const a = m && m.d && m.d.a, b = m && m.d && m.d.b;
    if (!b || (a !== 'p' && a !== 'm')) return data;
    const hit = CFG.blockRank && CFG.rankRe.test(b.p || '');
    if (CFG.logNet) log(`rtdb ${hit ? 'CHẶN' : 'ghi'}: ${b.p}`);
    if (!hit) return data;
    state.netBlocked++;
    m.d.a = 'm'; b.d = {};
    return JSON.stringify(m);
  }
  XMLHttpRequest.prototype.open = function (method, url, ...r) { this._psUrl = String(url); return XO.call(this, method, url, ...r); };
  XMLHttpRequest.prototype.send = function (body) {
    if (typeof body === 'string' && this._psUrl && this._psUrl.includes('/Firestore/Write/channel') && body.includes('___data__')) body = filterFirestore(body);
    return XS.call(this, body);
  };
  WebSocket.prototype.send = function (data) {
    if (typeof data === 'string' && /firebaseio|firebasedatabase/.test(this.url)) data = filterRtdb(data);
    return WS.call(this, data);
  };

  // ---------- overlay + HUD ----------
  const ov = document.createElement('canvas');
  ov.style.cssText = 'position:fixed;pointer-events:none;z-index:99999';
  // Top-right dock stacking the control panel, the HUD line and the F6 catalog (CSS order keeps that order)
  const dock = document.createElement('div');
  dock.style.cssText = 'position:fixed;top:4px;right:4px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:4px;max-height:calc(100vh - 8px);pointer-events:none';
  const hud = document.createElement('div');
  hud.style.cssText = 'order:2;font:12px monospace;background:#000a;color:#7cf;padding:4px 6px;border-radius:4px;pointer-events:none';
  dock.append(hud);
  document.body.append(ov, dock);
  function draw() {
    const r = canvas.getBoundingClientRect();
    Object.assign(ov.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    if (ov.width !== canvas.width || ov.height !== canvas.height) { ov.width = canvas.width; ov.height = canvas.height; }
    const g = ov.getContext('2d');
    g.clearRect(0, 0, ov.width, ov.height);
    const v = state.view;
    hud.textContent = tag.on
      ? (tag.pending ? `${tag.pending}: 1=tốt 2=nguy hiểm 3=rift 4=vật cản 5=buff 6=kinh nghiệm 7=vali 0=xoá nhãn Esc=huỷ` : 'GẮN NHÃN (F7): click vào vật trên màn hình')
      : `bot ${state.on ? 'ON' : 'OFF'} (F8) · ván ${state.done + 1}${state.target ? `/${state.target}` : ''}${state.dwell ? ` · mở vali ${(state.dwell.t / 1000).toFixed(1)}/${CFG.caseTime / 1000}s` : ''} · địch ${v ? v.enemies.length : 0} · exp ${v ? v.xps.length : 0} (hút ${Math.round(state.magnet)}) · tốt ${v ? v.goods.length : 0} · buff ${v ? v.buffs.length : 0} · nguy hiểm ${v ? v.hazards.length : 0} · rift ${v ? v.rifts.length : 0} · chặn rank ${state.netBlocked}`;
    if (tag.on && tag.box) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(tag.box.x - tag.box.w / 2, tag.box.y - tag.box.h / 2, tag.box.w, tag.box.h); }
    if (state.highlight) {
      g.strokeStyle = '#0ff'; g.lineWidth = 2;
      state.lastFrame.forEach(d => { if (d.src === state.highlight) g.strokeRect(d.x - Math.abs(d.w) / 2 - 3, d.y - Math.abs(d.h) / 2 - 3, Math.abs(d.w) + 6, Math.abs(d.h) + 6); });
    }
    // Hide world markers while the game is paused / on menus (they'd be drawn over the dialogs)
    if (!state.debug || !v || performance.now() - (state.timerChangedAt || 0) > 1500) return;
    g.lineWidth = 2;
    const ring = (list, color, r) => { g.strokeStyle = color; list.forEach(d => { g.beginPath(); g.arc(d.x, d.y, r(d), 0, 7); g.stroke(); }); };
    ring(v.enemies, '#f44', () => 10);
    ring(v.hazards.filter(d => !d.shape), '#f90', d => Math.max(d.w, d.h) / 2 + CFG.hazardMargin * v.s);
    g.strokeStyle = '#f90';
    v.hazards.filter(d => d.shape).forEach(d => {
      g.lineWidth = d.shape === 'line' ? Math.max(2, d.lw) : 2;
      g.beginPath(); d.pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
      if (d.shape === 'poly') g.closePath();
      g.stroke();
    });
    g.lineWidth = 2;
    ring(v.goods, '#4f4', () => 8);
    ring(v.rifts, '#f4f', () => 16);
    ring(v.buffs, '#ff0', () => 14);
    ring(v.xps, '#0fc', () => 4);
    ring(v.cases, '#fa0', () => Math.max(6, CFG.caseReach * v.s));
    g.strokeStyle = '#0fc6'; g.setLineDash([2, 6]); g.beginPath(); g.arc(v.me.x, v.me.y, state.magnet * v.s, 0, 7); g.stroke(); g.setLineDash([]);
    ring(v.walls || [], '#88f', d => (d.w ? Math.max(d.w, d.h) / 2 : 0) + 70 * v.s);
    g.strokeStyle = '#ff4'; g.beginPath(); g.arc(v.me.x, v.me.y, CFG.contact * v.s, 0, 7); g.stroke();
    if (v.target) { g.strokeStyle = '#fff8'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(v.me.x, v.me.y); g.lineTo(v.target.x, v.target.y); g.stroke(); g.setLineDash([]); }
    if (state.dir) { g.strokeStyle = '#4cf'; g.beginPath(); g.moveTo(v.me.x, v.me.y); g.lineTo(v.me.x + state.dir[0] * 40, v.me.y + state.dir[1] * 40); g.stroke(); }
  }

  // ---------- control panel: ▶ play N runs (0 = forever), ⏸ pause / resume, ■ stop ----------
  const RUNS_KEY = 'psbot.runs';
  const ctl = document.createElement('div');
  ctl.dataset.psbotCtl = '';
  ctl.style.cssText = 'order:0;pointer-events:auto;font:12px monospace;background:#101418ee;color:#ddd;border:1px solid #345;border-radius:6px;padding:6px 8px;display:flex;flex-direction:column;gap:5px;min-width:190px';
  const btnCss = 'font:12px monospace;padding:3px 8px;border:1px solid #456;border-radius:4px;cursor:pointer;color:#000';
  ctl.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;font-weight:bold;color:#7cf"><span style="flex:1">PokeSurvivor Bot v${VERSION} <a href="${REPO}" target="_blank" rel="noopener" style="font-weight:normal;color:#9ab;text-decoration:none" title="Repo gốc trên GitHub">· by damhieu2808</a></span>
      <button data-ctl="min" style="${btnCss};background:#9ab;padding:0 8px" title="Thu gọn / mở rộng">–</button></div>
    <style>[data-psbot-ctl][data-min] > :not(:first-child) { display: none !important }</style>
    <label style="display:flex;align-items:center;gap:6px">Số ván
      <input data-ctl="runs" type="number" min="0" step="1" style="width:60px;font:12px monospace;background:#223;color:#fff;border:1px solid #456;border-radius:3px;padding:2px 4px">
      <span style="color:#9ab">0 = vô hạn</span></label>
    <div style="display:flex;gap:4px">
      <button data-ctl="play" style="${btnCss};background:#4c4">▶ Chạy</button>
      <button data-ctl="pause" style="${btnCss};background:#fc3">⏸ Tạm dừng</button>
      <button data-ctl="stop" style="${btnCss};background:#f66">■ Dừng</button>
    </div>
    <div style="display:flex;gap:4px">
      <button data-ctl="moveset" style="${btnCss};background:#7cf;flex:1">⚔ Moveset</button>
      <button data-ctl="overlay" style="${btnCss};background:#9ab" title="Lớp vẽ debug (F9)">Overlay</button>
      <button data-ctl="catalog" style="${btnCss};background:#9ab" title="Danh mục sprite (F6)">Danh mục</button>
    </div>
    <div data-ctl="status" style="color:#9ab"></div>
    <a href="${REPO}" target="_blank" rel="noopener" title="Repo gốc — bấm để mở GitHub" style="order:1;border-top:1px solid #345;padding-top:4px;color:#9ab;text-decoration:none">⭐ Tác giả <b style="color:#7cf">damhieu2808</b> · github.com/damhieu2808/PokeSurvivorTool</a>
    <a data-ctl="update" href="${REPO}" target="_blank" rel="noopener" style="display:none;color:#000;background:#fc3;border-radius:4px;padding:3px 6px;text-decoration:none;font-weight:bold"></a>`;
  dock.append(ctl);
  const $ = k => ctl.querySelector(`[data-ctl="${k}"]`);
  try { $('runs').value = localStorage.getItem(RUNS_KEY) || '5'; } catch { $('runs').value = '5'; }
  // Collapse to the title row (small screens); the <style> above hides every other row, the farm line included
  const MIN_KEY = 'psbot.min';
  const setMin = min => {
    if (min) ctl.dataset.min = ''; else delete ctl.dataset.min;
    $('min').textContent = min ? '+' : '–';
    try { localStorage.setItem(MIN_KEY, min ? '1' : ''); } catch {}
  };
  try { setMin(!!localStorage.getItem(MIN_KEY)); } catch {}
  $('min').onclick = () => setMin(!('min' in ctl.dataset));
  // Buttons for the F-key toggles (no function keys on phones)
  $('overlay').onclick = () => { state.debug = !state.debug; };
  $('catalog').onclick = () => toggleCatalog();
  // Keep typing / clicks in the panel away from the game's keyboard and pointer handlers
  ['keydown', 'keyup', 'pointerdown', 'mousedown', 'click'].forEach(t => ctl.addEventListener(t, e => e.stopPropagation()));

  const control = {
    play() {
      const n = Math.max(0, Math.floor(+$('runs').value || 0));
      try { localStorage.setItem(RUNS_KEY, String(n)); } catch {}
      Object.assign(state, { target: n, done: 0, runEnded: false, on: true, started: true, restartAt: 0 });
      log(`chạy ${n ? `${n} ván` : 'vô hạn'}`);
    },
    pause() { state.on = false; applyDir(null); log('tạm dừng — bạn có thể tự điều khiển'); },
    resume() { state.on = true; log('tiếp tục'); },
    stop() { Object.assign(state, { on: false, target: 0, done: 0, started: false }); applyDir(null); log('dừng'); },
  };
  // Update check: compare with the manifest on the original repo (copies of the tool point here too)
  const newer = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };
  async function checkUpdate() {
    try {
      const r = await fetch('https://raw.githubusercontent.com/damhieu2808/PokeSurvivorTool/main/manifest.json', { cache: 'no-store' });
      const latest = (await r.json()).version;
      if (!latest || !newer(latest, VERSION)) return;
      $('update').style.display = 'block';
      $('update').textContent = `⬆ Có bản mới v${latest} (đang dùng v${VERSION}) → github.com/damhieu2808/PokeSurvivorTool`;
      log(`có bản mới v${latest} — tải tại ${REPO}`);
    } catch {}
  }
  checkUpdate();
  const updateTimer = setInterval(checkUpdate, 6 * 3600000);

  $('play').onclick = () => control.play();
  $('pause').onclick = () => (state.on ? control.pause() : control.resume());
  $('stop').onclick = () => control.stop();

  function renderCtl() {
    const finished = state.target && state.done >= state.target;
    $('pause').textContent = state.on ? '⏸ Tạm dừng' : '▶ Tiếp tục';
    $('pause').disabled = !state.on && (!state.started || finished);      // nothing to resume
    $('status').textContent = finished ? `Đã xong ${state.done}/${state.target} ván`
      : !state.started && !state.on ? 'Chưa chạy — nhập số ván rồi bấm ▶'
      : `${state.on ? 'Đang chạy' : 'Tạm dừng'} · ván ${state.done + 1}${state.target ? `/${state.target}` : ' (vô hạn)'}`;
  }

  // ---------- moveset popup: pick up to 4 priority moves per pokémon from its learnable list (moves.js) ----------
  const MOVES = window.PSBotMoves || { moves: [], mons: {} };
  const learnable = name => (MOVES.mons[name.toLowerCase()] || []).map(i => MOVES.moves[i]);
  const currentMon = () => [...state.hudTexts].map(t => t.toLowerCase()).find(t => MOVES.mons[t]) || '';
  const ms = document.createElement('div');
  ms.style.cssText = 'order:1;pointer-events:auto;width:300px;max-width:calc(100vw - 8px);font:12px monospace;background:#101418ee;color:#ddd;border:1px solid #345;border-radius:6px;padding:6px 8px;display:none;flex-direction:column;gap:5px';
  const inCss = 'font:12px monospace;background:#223;color:#fff;border:1px solid #456;border-radius:3px;padding:2px 4px';
  ms.innerHTML = `
    <div style="display:flex;justify-content:space-between;font-weight:bold;color:#7cf">Moveset (4 move ưu tiên)<span data-ms="close" style="cursor:pointer;color:#9ab">✕</span></div>
    <div style="display:flex;gap:4px"><input data-ms="mon" list="psbot-mons" placeholder="Tên pokémon" style="${inCss};flex:1;min-width:0">
      <button data-ms="cur" style="${btnCss};background:#9ab" title="Pokémon đang chơi">Hiện tại</button></div>
    <datalist id="psbot-mons">${Object.keys(MOVES.mons).map(n => `<option value="${n.replace(/"/g, '&quot;')}">`).join('')}</datalist>
    <div data-ms="slots" style="display:flex;flex-direction:column;gap:3px"></div>
    <div style="display:flex;gap:4px">
      <button data-ms="save" style="${btnCss};background:#4c4">Lưu</button>
      <button data-ms="del" style="${btnCss};background:#f66">Xoá build</button></div>
    <div data-ms="msg" style="color:#9ab"></div>
    <div data-ms="list" style="color:#9ab;max-height:120px;overflow:auto"></div>`;
  dock.append(ms);
  ['keydown', 'keyup', 'pointerdown', 'mousedown', 'click'].forEach(t => ms.addEventListener(t, e => e.stopPropagation()));
  const $m = k => ms.querySelector(`[data-ms="${k}"]`);
  const moveLabel = m => `${m.name} · ${m.cat === 'status' ? 'buff' : `${m.kind} ${m.dmg ?? '?'}dmg/${m.cd ?? '?'}s`}`;
  function renderMoveset() {
    const name = $m('mon').value.trim().toLowerCase(), list = learnable(name), build = CFG.builds[name] || [];
    $m('slots').innerHTML = list.length ? [0, 1, 2, 3].map(i => `<label style="display:flex;gap:6px;align-items:center">#${i + 1}
      <select data-slot style="${inCss};flex:1;min-width:0"><option value="">(trống)</option>${list.map((m, j) =>
        `<option value="${m.name}" ${build[i] === m.name ? 'selected' : ''}>${j ? '' : '★ '}${moveLabel(m)}</option>`).join('')}</select></label>`).join('')
      : `<div style="color:#f96">${name ? 'Không có trong pokedex' : 'Chọn pokémon'}</div>`;
    const saved = Object.entries(CFG.builds);
    $m('list').innerHTML = saved.length ? 'Đã lưu: ' + saved.map(([n, b]) => `<a data-load="${n}" style="color:#7cf;cursor:pointer;text-decoration:underline" title="${b.join(', ')}">${n}</a>`).join(', ') : 'Chưa có build nào';
  }
  function openMoveset() {
    const show = ms.style.display === 'none';
    ms.style.display = show ? 'flex' : 'none';
    if (show) { if (!$m('mon').value) $m('mon').value = currentMon(); $m('msg').textContent = ''; renderMoveset(); }
  }
  $('moveset').onclick = openMoveset;
  $m('close').onclick = openMoveset;
  $m('mon').oninput = renderMoveset;
  $m('cur').onclick = () => { $m('mon').value = currentMon(); $m('msg').textContent = currentMon() ? '' : 'Chưa thấy tên pokémon trên màn (vào trận trước)'; renderMoveset(); };
  $m('save').onclick = () => {
    const name = $m('mon').value.trim();
    const moves = [...new Set([...ms.querySelectorAll('select[data-slot]')].map(s => s.value).filter(Boolean))];
    if (!learnable(name).length || !moves.length) return void ($m('msg').textContent = 'Chọn pokémon và ít nhất 1 move');
    window.PSBot.setBuild(name, moves);
    $m('msg').textContent = `Đã lưu ${name}: ${moves.join(' > ')}`; renderMoveset();
  };
  $m('del').onclick = () => {
    const name = $m('mon').value.trim();
    if (!CFG.builds[name.toLowerCase()]) return;
    window.PSBot.setBuild(name, []);
    $m('msg').textContent = `Đã xoá build ${name}`; renderMoveset();
  };
  $m('list').onclick = e => { const a = e.target.closest('[data-load]'); if (a) { $m('mon').value = a.dataset.load; renderMoveset(); } };

  // ---------- catalog (F6): every world sprite type seen, with thumbnail + stats ----------
  function toggleCatalog() { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; renderPanel(); }
  const catalog = new Map();   // src -> { src, img, rect, w, h, max, frames, lastSeen, speed, prev }
  function collect(frame) {
    const now = performance.now();
    const groups = new Map();
    for (const d of frame) {
      if (d.s === 1) continue;
      let g = groups.get(d.src);
      if (!g) groups.set(d.src, g = []);
      g.push({ x: (d.x - d.e) / d.s, y: (d.y - d.f) / d.s, d });
    }
    for (const [src, list] of groups) {
      let c = catalog.get(src);
      if (!c) {
        const d = list[0].d;
        catalog.set(src, c = { src, img: d.img, rect: d.rect, w: Math.round(Math.abs(d.w / d.s)), h: Math.round(Math.abs(d.h / d.s)), max: 0, frames: 0, speed: 0, prev: null });
      }
      c.max = Math.max(c.max, list.length); c.frames++; c.lastSeen = now;
      // Average per-frame displacement, matching each sprite to its nearest one in the previous frame
      if (c.prev && list.length <= 40) {
        let sum = 0, n = 0;
        for (const p of list) {
          let best = Infinity;
          for (const q of c.prev) best = Math.min(best, Math.hypot(p.x - q.x, p.y - q.y));
          if (best < 60) { sum += best; n++; }
        }
        if (n) c.speed = c.speed * 0.9 + (sum / n) * 0.1;
      }
      c.prev = list.length <= 40 ? list : null;
    }
  }
  // Enemies last (already handled, no tagging needed), then on-screen sprites first, then by how rare they are per frame
  const catalogRows = () => {
    const now = performance.now(), live = c => now - c.lastSeen < 1500, enemy = c => CFG.enemyRe.test(c.src);
    return [...catalog.values()].sort((a, b) => enemy(a) - enemy(b) || live(b) - live(a) || a.max - b.max);
  };
  const thumbs = new Map();
  function thumb(c) {
    if (thumbs.has(c.src)) return thumbs.get(c.src);
    let url = '';
    const color = c.src.match(/^(?:fill|stroke):(.+)$/);
    if (color) {                                                      // path shapes: show their colour as a swatch
      const t = document.createElement('canvas'); t.width = t.height = 24;
      const tc = t.getContext('2d'); tc.fillStyle = color[1] === 'gradient' ? '#888' : color[1];
      pathOrig.fillRect.call(tc, 0, 0, 24, 24); url = t.toDataURL();
    } else if (c.img) {
      try {
        const t = document.createElement('canvas');
        const [sx, sy, sw, sh] = c.rect || [0, 0, c.img.width, c.img.height];
        const k = Math.min(40 / sw, 40 / sh, 4);
        t.width = Math.max(1, sw * k); t.height = Math.max(1, sh * k);
        const tc = t.getContext('2d'); tc.imageSmoothingEnabled = false;
        origDraw.call(tc, c.img, sx, sy, sw, sh, 0, 0, t.width, t.height);
        url = t.toDataURL();
      } catch {}
    }
    thumbs.set(c.src, url);
    return url;
  }

  const panel = document.createElement('div');
  panel.style.cssText = 'order:3;pointer-events:auto;width:380px;max-width:calc(100vw - 8px);min-height:0;flex:0 1 auto;overflow:auto;font:11px monospace;background:#101418ee;color:#ddd;border:1px solid #345;border-radius:6px;display:none';
  dock.append(panel);
  const TAG_LABEL = { good: ['Tốt', '#4f4'], hazard: ['Nguy hiểm', '#f90'], rift: ['Rift', '#f4f'], wall: ['Vật cản', '#88f'], buff: ['Buff', '#ff0'], xp: ['Kinh nghiệm', '#0fc'], case: ['Vali (đứng 5s)', '#fa0'], safe: ['An toàn', '#9cf'] };
  function renderPanel() {
    if (panel.style.display === 'none') return;
    const now = performance.now();
    const esc = s => s.replace(/[&<>"]/g, ch => `&#${ch.charCodeAt(0)};`);
    panel.innerHTML = `<div style="padding:6px;border-bottom:1px solid #345">Danh mục sprite (F6 đóng) · rê chuột = khoanh trên màn hình · <b>đậm</b> = đang có trên màn
      <button data-export style="font:10px monospace;padding:1px 6px;margin-left:4px;background:#2a5;color:#000;border:1px solid #456;border-radius:3px;cursor:pointer" title="Tải data.js (nhãn + build) — chép đè vào thư mục extension">Xuất data.js</button></div>` +
      catalogRows().map(c => {
        const t = tagOf(c.src) || (/^(fill|stroke):/.test(c.src) && CFG.autoTelegraph && isTelegraph(c) ? 'hazard' : undefined);
        const live = now - c.lastSeen < 1500, enemy = CFG.enemyRe.test(c.src);
        const btn = (v, label, color) => `<button data-src="${esc(c.src)}" data-tag="${v}" style="font:10px monospace;padding:1px 4px;margin-right:2px;background:${t === v ? color : '#223'};color:${t === v ? '#000' : '#ccc'};border:1px solid #456;border-radius:3px;cursor:pointer">${label}</button>`;
        return `<div data-row="${esc(c.src)}" style="display:flex;gap:6px;align-items:center;padding:4px 6px;border-bottom:1px solid #223;${live ? 'font-weight:bold' : 'opacity:.55'}">
          <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:#000">${thumb(c) ? `<img src="${thumb(c)}" style="image-rendering:pixelated;max-width:40px;max-height:40px">` : '?'}</div>
          <div style="flex:1;min-width:0">
            <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(c.src)}">${esc(c.src)}</div>
            <div style="color:#9ab">${c.w}×${c.h} · tối đa ${c.max}/frame · ${c.speed > 1 ? `di chuyển ${c.speed.toFixed(1)}` : 'đứng yên'}${enemy ? ' · <span style="color:#f66">quái</span>' : ''}</div>
            <div style="margin-top:2px">${Object.entries(TAG_LABEL).map(([v, [l, col]]) => btn(v, l, col)).join('')}${btn('', 'Bỏ', '#888')}</div>
          </div></div>`;
      }).join('');
  }
  panel.addEventListener('pointerdown', e => e.stopPropagation());
  panel.addEventListener('click', e => {
    if (e.target.closest('button[data-export]')) return void window.PSBot.exportConfig();
    const b = e.target.closest('button[data-src]');
    if (!b) return;
    if (b.dataset.tag) CFG.tags[b.dataset.src] = b.dataset.tag; else { delete CFG.tags[b.dataset.src]; delete CFG.tags[b.dataset.src.split('#')[0]]; }
    saveTags(); renderPanel();
  });
  panel.addEventListener('mouseover', e => { const r = e.target.closest('[data-row]'); state.highlight = r ? r.dataset.row : null; });
  panel.addEventListener('mouseleave', () => { state.highlight = null; });

  // ---------- keep running in a background tab / covered window ----------
  // 1) The game pauses on visibilitychange / blur: swallow those and report the page as visible.
  // 2) Chrome stops requestAnimationFrame when the tab is hidden or the window fully covered:
  //    every rAF request is also queued, and a Web Worker tick (~60 Hz, not throttled like page
  //    timers) runs any callback the browser hasn't run within 40 ms.
  const nativeRAF = window.requestAnimationFrame, nativeCAF = window.cancelAnimationFrame;
  const visDesc = { hidden: Object.getOwnPropertyDescriptor(document, 'hidden'), visibilityState: Object.getOwnPropertyDescriptor(document, 'visibilityState') };
  const origHasFocus = document.hasFocus;
  const swallow = e => { if (CFG.background) e.stopImmediatePropagation(); };
  let bgWorker = null;
  if (CFG.background) {
    ['visibilitychange', 'webkitvisibilitychange', 'blur', 'pagehide', 'freeze'].forEach(t => window.addEventListener(t, swallow, true));
    Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
    document.hasFocus = () => true;

    const pending = new Map();                                       // id -> { cb, at, native }
    let seq = 0;
    const run = id => { const p = pending.get(id); if (!p) return; pending.delete(id); nativeCAF.call(window, p.native); p.cb(performance.now()); };
    window.requestAnimationFrame = cb => {
      const id = ++seq;
      pending.set(id, { cb, at: performance.now(), native: nativeRAF.call(window, () => run(id)) });
      return id;
    };
    window.cancelAnimationFrame = id => { const p = pending.get(id); if (p) { nativeCAF.call(window, p.native); pending.delete(id); } };
    const fallback = () => { const now = performance.now(); for (const [id, p] of [...pending]) if (now - p.at > 40) run(id); };
    try {
      bgWorker = new Worker(URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 16)'], { type: 'text/javascript' })));
      bgWorker.onmessage = fallback;
    } catch (err) {
      log('không tạo được Worker (CSP?) — chạy nền sẽ bị Chrome giới hạn ~1 khung hình/giây', err);
      bgWorker = { terminate: clearInterval.bind(null, setInterval(fallback, 16)) };
    }
  }

  // ---------- main loop ----------
  const origRAF = window.requestAnimationFrame.bind(window);
  let running = true, lastResend = 0, lastPanel = 0;
  function loop(t) {
    if (!running) return;
    const frame = state.frame; state.frame = [];
    if (state.texts.length) {
      state.hudTexts = new Set(state.texts); state.texts = [];
      const timer = [...state.hudTexts].find(x => /^\d+:\d\d$/.test(x));
      if (timer) state.lastTimer = t;                                                            // run timer on screen = in a run
      if (timer !== state.timerText) { state.timerText = timer; state.timerChangedAt = t; }      // frozen timer = game paused (menus)
      if ([...state.hudTexts].some(t => /^0:0[0-2]$/.test(t))) { state.picks = {}; state.newSkills = 0; }   // new run
    }
    if (frame.length) { state.lastFrame = frame; collect(frame); tick(frame); }
    if (t - lastPanel > 1000 && !panel.matches(':hover')) { lastPanel = t; renderPanel(); }
    renderCtl();
    levelUp();
    dialogPick();
    useItems(t);
    swapSkills(t);
    autoRestart(t);
    if (state.on && t - lastResend > 400) {                    // re-assert held keys (game clears them on blur)
      lastResend = t;
      Object.keys(KEYS).forEach(k => state.keys[k] && sendKey('keydown', ...KEYS[k]));
    }
    draw();
    origRAF(loop);
  }
  origRAF(loop);

  // ---------- tag mode (F7): click an object, then press 1/2/3/0 ----------
  const tag = { on: false, pending: null, box: null };
  const TAGS = { Digit1: 'good', Digit2: 'hazard', Digit3: 'rift', Digit4: 'wall', Digit5: 'buff', Digit6: 'xp', Digit7: 'case' };
  const onClick = e => {
    if (!tag.on || !e.isTrusted) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * canvas.width / r.width, y = (e.clientY - r.top) * canvas.height / r.height;
    const hit = state.lastFrame
      .filter(d => d.s !== 1 && Math.abs(d.x - x) <= Math.abs(d.w) / 2 + 4 && Math.abs(d.y - y) <= Math.abs(d.h) / 2 + 4)
      .sort((a, b) => Math.abs(a.w * a.h) - Math.abs(b.w * b.h))[0];
    e.preventDefault(); e.stopImmediatePropagation();
    tag.pending = hit ? hit.src : null; tag.box = hit || null;
    log(hit ? `chọn ${hit.src} (nhãn hiện tại: ${tagOf(hit.src) || 'không'})` : 'không có gì ở đó');
  };
  window.addEventListener('pointerdown', onClick, true);

  const onKey = e => {
    if (!e.isTrusted) return;
    if (e.code === 'F7') {
      tag.on = !tag.on; tag.pending = tag.box = null;
      if (tag.on) { state.on = false; applyDir(null); }
      e.preventDefault();
    }
    if (tag.on && tag.pending && (TAGS[e.code] || e.code === 'Digit0' || e.code === 'Escape')) {
      if (TAGS[e.code]) CFG.tags[tag.pending] = TAGS[e.code];
      else if (e.code === 'Digit0') delete CFG.tags[tag.pending];
      if (e.code !== 'Escape') { saveTags(); log(`${tag.pending} → ${CFG.tags[tag.pending] || 'không nhãn'}`); }
      tag.pending = tag.box = null;
      e.preventDefault(); e.stopImmediatePropagation();
    }
    if (e.code === 'F8') { state.on = !state.on; if (!state.on) applyDir(null); log('bot', state.on ? 'ON' : 'OFF'); e.preventDefault(); }
    if (e.code === 'F9') { state.debug = !state.debug; e.preventDefault(); }
    if (e.code === 'F6') { toggleCatalog(); e.preventDefault(); }
  };
  window.addEventListener('keydown', onKey, true);

  window.PSBot = {
    CFG, state, ctl,       // ctl = control panel (top-left); presets append their own lines to it
    // PSBot.play(5) = chơi 5 ván (0 = vô hạn) · PSBot.pause() / resume() / stop()
    play(n) { if (n !== undefined) $('runs').value = n; control.play(); },
    pause: () => control.pause(), resume: () => control.resume(), stop: () => control.stop(),
    sources() {
      const by = {};
      state.lastFrame.forEach(d => { (by[d.src] ||= []).push([Math.round(d.x), Math.round(d.y)]); });
      console.table(Object.entries(by).map(([src, pts]) => ({ src, tag: tagOf(src) || '', n: pts.length, sample: JSON.stringify(pts.slice(0, 3)) })));
    },
    catalog() {
      const rows = catalogRows().map(c => ({ src: c.src, tag: tagOf(c.src) || '', max: c.max, size: `${c.w}x${c.h}`, moving: c.speed.toFixed(1), seenSec: Math.round(c.frames / 60) }));
      console.table(rows);
      try { copy(JSON.stringify(rows)); log('đã copy danh mục vào clipboard'); } catch {}
    },
    tags() { console.table(CFG.tags); },
    // PSBot.setBuild('Kartana', ['Meteor Mash', 'Seed Bomb', 'Harden', 'Swords Dance']) · [] = delete
    setBuild(name, moves) {
      userBuilds[name.toLowerCase()] = moves;
      if (moves.length) CFG.builds[name.toLowerCase()] = moves; else delete CFG.builds[name.toLowerCase()];
      try {
        const saved = JSON.parse(localStorage.getItem(BUILD_KEY) || '{}');
        saved[name.toLowerCase()] = moves;
        localStorage.setItem(BUILD_KEY, JSON.stringify(saved));
      } catch {}
      log('build', name, moves);
    },
    resetTags() { CFG.tags = {}; saveTags(); },
    // Downloads data.js (tags + builds set with setBuild) to drop into the extension folder, so every machine gets them
    exportConfig() {
      const json = JSON.stringify({ tags: CFG.tags, builds: CFG.builds }, null, 2);
      const src = '// Nhãn sprite + build đã đánh dấu, đi kèm extension để máy nào cài cũng có sẵn.\n' +
        '// Tạo lại file này bằng nút "Xuất data.js" trong bảng F6 (hoặc PSBot.exportConfig()), rồi chép đè vào thư mục extension.\n' +
        `window.PSBotData = ${json};\n`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      a.download = 'data.js';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      log(`đã xuất data.js: ${Object.keys(CFG.tags).length} nhãn, ${Object.keys(CFG.builds).length} build — chép đè vào thư mục extension`);
    },
    unload() {
      running = false; applyDir(null); clearInterval(updateTimer);
      P.drawImage = origDraw; P.arc = origArc; P.fillText = origText;
      Object.assign(P, pathOrig);
      if (bgWorker) {
        bgWorker.terminate();
        window.requestAnimationFrame = nativeRAF; window.cancelAnimationFrame = nativeCAF;
        ['visibilitychange', 'webkitvisibilitychange', 'blur', 'pagehide', 'freeze'].forEach(t => window.removeEventListener(t, swallow, true));
        for (const k of ['hidden', 'visibilityState']) { if (visDesc[k]) Object.defineProperty(document, k, visDesc[k]); else delete document[k]; }
        document.hasFocus = origHasFocus;
      }
      XMLHttpRequest.prototype.open = XO; XMLHttpRequest.prototype.send = XS; WebSocket.prototype.send = WS;
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onClick, true);
      ov.remove(); dock.remove();
      delete window.PSBot;
      log('unloaded');
    },
  };
  log(`loaded — F8 bật/tắt, F9 overlay, PSBot.sources() để xem sprite · v${VERSION} · tác giả damhieu2808 · ${REPO}`);
})();
