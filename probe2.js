// Probe 2: record what #game draws during one frame + which input events the game listens to.
// Paste into DevTools Console WHILE IN A RUN (enemies on screen). Result is copied to clipboard.
(async () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const out = { canvas: { w: canvas.width, h: canvas.height, cssW: canvas.clientWidth, cssH: canvas.clientHeight } };

  // Input listeners (getEventListeners only exists in the DevTools console)
  const lst = el => { try { return Object.fromEntries(Object.entries(getEventListeners(el)).map(([k, v]) => [k, v.length])); } catch { return 'n/a'; } };
  out.listeners = { window: lst(window), document: lst(document), canvas: lst(canvas), body: lst(document.body) };

  // Name an image source compactly
  const srcName = img => {
    if (!img) return '?';
    if (img.src) return img.src.replace(location.origin, '').slice(-80);
    if (img instanceof HTMLCanvasElement || img instanceof OffscreenCanvas) return `canvas${img.id ? '#' + img.id : ''}:${img.width}x${img.height}`;
    if (img instanceof ImageBitmap) return `bitmap:${img.width}x${img.height}`;
    return img.constructor.name;
  };

  // Hook drawing calls for exactly one frame
  const calls = [];
  const orig = {};
  const hook = name => {
    orig[name] = ctx[name];
    ctx[name] = function (...a) {
      const t = ctx.getTransform();
      const rec = { f: name, tf: [t.a, t.d, t.e, t.f].map(n => +n.toFixed(2)) };
      if (name === 'drawImage') {
        rec.src = srcName(a[0]);
        rec.args = a.slice(1).map(n => +(+n).toFixed(1));
      } else if (name === 'fillText' || name === 'strokeText') {
        rec.text = String(a[0]).slice(0, 40);
        rec.args = a.slice(1, 3).map(n => +(+n).toFixed(1));
        rec.style = String(ctx.fillStyle);
      } else {
        rec.args = a.slice(0, 4).map(n => typeof n === 'number' ? +n.toFixed(1) : n);
        rec.style = String(ctx.fillStyle);
      }
      calls.push(rec);
      return orig[name].apply(this, a);
    };
  };
  ['drawImage', 'fillRect', 'fillText', 'strokeText', 'arc', 'ellipse'].forEach(hook);

  await new Promise(r => requestAnimationFrame(() => { calls.length = 0; requestAnimationFrame(r); }));
  Object.entries(orig).forEach(([k, f]) => { ctx[k] = f; });

  // Summarize drawImage by source
  const bySrc = {};
  for (const c of calls) {
    const key = c.f === 'drawImage' ? c.src : c.f;
    (bySrc[key] ||= { n: 0, samples: [] }).n++;
    if (bySrc[key].samples.length < 4) bySrc[key].samples.push(c);
  }
  out.totalCalls = calls.length;
  out.bySource = Object.entries(bySrc).sort((a, b) => b[1].n - a[1].n);
  out.texts = calls.filter(c => c.text).map(c => c.text);

  // Visible overlay DOM (HUD / level-up)
  out.visibleOverlays = [...document.querySelectorAll('body *')]
    .filter(e => e.children.length === 0 && e.offsetParent && (e.innerText || '').trim())
    .slice(0, 60).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className ? '.' + String(e.className).split(' ').join('.') : ''}: ${e.innerText.trim().slice(0, 50)}`);

  const json = JSON.stringify(out, null, 1);
  try { copy(json); console.log('%cĐã copy kết quả vào clipboard', 'color:lime'); } catch {}
  console.log(json);
})();
