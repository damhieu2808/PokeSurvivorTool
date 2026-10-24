// Re-crawl the learnable moves of every pokémon from pokesurvivor.wiki into moves.js:  node crawl-moves.js
const fs = require('fs');
const outFile = require('path').join(__dirname, 'moves.js');
let list;
const parseDex = dex => {
  const mons = [...dex.matchAll(/slug:"([a-z0-9-]+)",dex:(\d+),name:"([^"]+)"/g)].map(m => ({ slug: m[1], dex: +m[2], name: m[3] }));
  const seen = new Set(); list = mons.filter(m => !seen.has(m.slug) && seen.add(m.slug));
  console.log('mons', list.length);
};

const moveRe = /\{id:"([^"]+)",name:"([^"]+)",type:"(\w+)",desc:"((?:[^"\\]|\\.)*)",kind:"(\w+)",category:(?:"(\w+)"|null)([^}]*)\}/g;
const moves = {}; const out = {}; const fails = [];
async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } }); if (r.ok) return await r.text(); } catch {}
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}
async function one(m) {
  const html = await get(`https://pokesurvivor.wiki/pokemon/${m.slug}`);
  const i = html ? html.indexOf('moves:$R[') : -1;
  if (i < 0) { fails.push(m.slug); return; }
  const names = [];
  for (const x of html.slice(i).matchAll(moveRe)) {
    const [, id, name, type, desc, kind, cat, rest] = x;
    if (names.includes(name)) continue;
    const num = k => { const v = (rest.match(new RegExp(`,${k}:([\\d.]+)`)) || [])[1]; return v ? +v : undefined; };
    moves[name] ??= { type, kind, cat: cat || 'status', dmg: num('dmg'), cd: num('cd'), desc: desc.replace(/\\"/g, '"') };
    if (/starting:!0/.test(rest)) names.unshift(name); else names.push(name);
  }
  out[m.name.toLowerCase()] = names;
}
(async () => {
  const dex = await get('https://pokesurvivor.wiki/pokedex');
  parseDex(dex);
  let k = 0;
  const queue = [...list];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) { await one(queue.shift()); if (++k % 100 === 0) console.log(k); }
  }));
  const names = Object.keys(moves).sort();
  const idx = Object.fromEntries(names.map((n, i) => [n, i]));
  const data = {
    moves: names.map(n => ({ name: n, ...moves[n] })),
    mons: Object.fromEntries(list.filter(m => out[m.name.toLowerCase()]).map(m => [m.name.toLowerCase(), out[m.name.toLowerCase()].map(n => idx[n])])),
  };
  const src = '// Moves each pokémon can learn (first = starting move), crawled from https://pokesurvivor.wiki/pokedex\n' +
    `// ${new Date().toISOString().slice(0, 10)} · ${Object.keys(data.mons).length} pokémon · ${names.length} moves. mons[name] = indices into moves.\n` +
    `window.PSBotMoves = ${JSON.stringify(data)};\n`;
  fs.writeFileSync(outFile, src);
  console.log('done', Object.keys(data.mons).length, 'mons', names.length, 'moves', 'fails', fails);
})();
