// Probe PokeSurvivor: paste into DevTools Console while a run is in progress.
// Result is copied to clipboard (copy()) and also printed.
(() => {
  const out = { url: location.href, ua: navigator.userAgent };

  // Engine detection
  out.engines = {
    phaser: !!window.Phaser && (window.Phaser.VERSION || true),
    pixi: !!window.PIXI && (window.PIXI.VERSION || true),
    unity: !!(window.createUnityInstance || window.unityInstance || window.UnityLoader),
    godot: !!(window.Engine && window.Engine.prototype && /godot/i.test(String(window.Engine))),
    construct: !!(window.c3_runtimeInterface || window.cr_getC2Runtime),
    cocos: !!window.cc,
    three: !!window.THREE,
    babylon: !!window.BABYLON,
    react: !!document.querySelector('[data-reactroot], #root, #__next'),
  };

  // Canvases
  out.canvases = [...document.querySelectorAll('canvas')].map(c => ({
    id: c.id, cls: c.className, w: c.width, h: c.height,
    ctx: c.getContext('webgl2') ? 'webgl2?' : 'other',
  }));

  // Scripts loaded
  out.scripts = [...document.scripts].map(s => s.src || `[inline ${s.textContent.length}b]`);

  // Non-standard globals (compare with a fresh iframe)
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  const base = new Set(Object.getOwnPropertyNames(iframe.contentWindow));
  iframe.remove();
  const custom = Object.getOwnPropertyNames(window).filter(k => !base.has(k));
  out.globals = custom.map(k => {
    let v; try { v = window[k]; } catch { return { k, t: 'err' }; }
    const t = typeof v;
    const info = { k, t };
    if (v && t === 'object') {
      try { info.keys = Object.keys(v).slice(0, 40); } catch {}
      if (v.constructor && v.constructor.name) info.ctor = v.constructor.name;
    }
    return info;
  });

  // Phaser specifics
  const games = window.Phaser && window.Phaser.GAMES;
  const game = (games && games[0]) || custom.map(k => window[k]).find(v => v && v.scene && v.scene.scenes);
  if (game && game.scene) {
    out.phaserScenes = game.scene.scenes.map(s => ({
      key: s.sys.settings.key, active: s.sys.isActive(),
      ownKeys: Object.keys(s).filter(k => !['sys', 'game', 'anims', 'cache', 'registry', 'sound', 'textures', 'events', 'cameras', 'add', 'make', 'scene', 'children', 'lights', 'data', 'input', 'load', 'time', 'tweens', 'physics', 'matter', 'plugins', 'renderer'].includes(k)).slice(0, 60),
      childCount: s.children && s.children.list.length,
    }));
  }

  // Storage
  out.localStorage = Object.keys(localStorage).map(k => ({ k, len: (localStorage.getItem(k) || '').length, head: (localStorage.getItem(k) || '').slice(0, 200) }));

  // DOM overlay (level-up UI may be HTML)
  out.buttons = [...document.querySelectorAll('button, [role=button]')].slice(0, 30).map(b => (b.innerText || '').trim().slice(0, 60));

  const json = JSON.stringify(out, null, 1);
  try { copy(json); console.log('%cĐã copy kết quả vào clipboard', 'color:lime'); } catch {}
  console.log(json);
  return out;
})();
