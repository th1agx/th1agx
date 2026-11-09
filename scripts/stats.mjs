// Gera um card de estatísticas animado (SVG) a partir da API GraphQL do GitHub.
// Uso: GITHUB_TOKEN=... node scripts/stats.mjs <usuario> <arquivo-de-saida>
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [user = "th1agx", outFile = "dist/stats.svg"] = process.argv.slice(2);
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("GITHUB_TOKEN ausente");

const query = `query($login:String!){
  user(login:$login){
    followers{totalCount}
    contributionsCollection{
      totalCommitContributions
      contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount } } }
    }
    repositories(ownerAffiliations:OWNER,isFork:false,first:100,privacy:PUBLIC){
      totalCount
      nodes{ stargazerCount languages(first:10,orderBy:{field:SIZE,direction:DESC}){ edges{ size node{ name color } } } }
    }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "th1agx-readme-stats" },
  body: JSON.stringify({ query, variables: { login: user } }),
});
const json = await res.json();
if (json.errors) throw new Error(JSON.stringify(json.errors));
const u = json.data.user;

const days = u.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
const total = u.contributionsCollection.contributionCalendar.totalContributions;
const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);

// sequências
let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
let current = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount > 0) current++;
  else if (i === days.length - 1) continue; // hoje ainda sem contribuição não quebra a sequência
  else break;
}

// linguagens por bytes
const langs = {};
for (const r of u.repositories.nodes)
  for (const e of r.languages.edges) {
    const k = e.node.name;
    langs[k] ??= { size: 0, color: e.node.color || "#888" };
    langs[k].size += e.size;
  }
const langTotal = Object.values(langs).reduce((s, l) => s + l.size, 0) || 1;
const topLangs = Object.entries(langs).sort((a, b) => b[1].size - a[1].size).slice(0, 6)
  .map(([name, l]) => ({ name, color: l.color, pct: (l.size / langTotal) * 100 }));

// ---------------------------------------------------------------- SVG
const C = { bg: "#0a0c07", line: "#232b14", lime: "#c6f432", dim: "#7f9a24", text: "#eef2e2", muted: "#98a284" };
const mono = "'JetBrains Mono','Fira Code',Consolas,monospace";
const W = 900, H = 400;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const tiles = [
  ["CONTRIBUIÇÕES · 12M", total],
  ["REPOSITÓRIOS", u.repositories.totalCount],
  ["SEQUÊNCIA ATUAL", `${current}d`],
  ["MAIOR SEQUÊNCIA", `${longest}d`],
  ["ESTRELAS", stars],
];
const tw = (W - 48 - 4 * 12) / 5;
const tilesSvg = tiles.map(([label, val], i) => {
  const x = 24 + i * (tw + 12);
  return `<g class="up" style="animation-delay:${(i * 0.12).toFixed(2)}s">
    <rect x="${x}" y="24" width="${tw}" height="78" rx="8" fill="#10140b" stroke="${C.line}"/>
    <text x="${x + 14}" y="48" font-size="10" fill="${C.muted}" letter-spacing="1.5">${esc(label)}</text>
    <text x="${x + 14}" y="86" font-size="28" font-weight="700" fill="${C.lime}">${esc(val)}</text>
  </g>`;
}).join("");

// gráfico: últimos 60 dias
const last = days.slice(-60);
const cx = 24, cy = 138, cw = 560, ch = 200;
const max = Math.max(1, ...last.map((d) => d.contributionCount));
const pts = last.map((d, i) => [cx + (i / (last.length - 1)) * cw, cy + ch - (d.contributionCount / max) * (ch - 20)]);
const linePath = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
const areaPath = `${linePath} L${cx + cw} ${cy + ch} L${cx} ${cy + ch} Z`;
const lastPt = pts[pts.length - 1];
const grid = [0.25, 0.5, 0.75].map((f) => `<line x1="${cx}" x2="${cx + cw}" y1="${(cy + ch * f).toFixed(1)}" y2="${(cy + ch * f).toFixed(1)}" stroke="${C.line}" stroke-dasharray="3 5"/>`).join("");
const fmt = (s) => s.slice(8, 10) + "/" + s.slice(5, 7);

// linguagens
const lx = 612, lw = W - lx - 24;
let acc = 0;
const bar = topLangs.map((l) => {
  const w = (l.pct / topLangs.reduce((s, x) => s + x.pct, 0)) * lw;
  const seg = `<rect x="${(lx + acc).toFixed(1)}" y="${cy + 30}" width="${Math.max(w - 2, 1).toFixed(1)}" height="10" fill="${l.color}"/>`;
  acc += w;
  return seg;
}).join("");
const legend = topLangs.map((l, i) => {
  const y = cy + 72 + i * 22;
  return `<g class="up" style="animation-delay:${(0.6 + i * 0.1).toFixed(2)}s">
    <circle cx="${lx + 5}" cy="${y - 4}" r="5" fill="${l.color}"/>
    <text x="${lx + 18}" y="${y}" font-size="12" fill="${C.text}">${esc(l.name)}</text>
    <text x="${lx + lw}" y="${y}" font-size="12" fill="${C.muted}" text-anchor="end">${l.pct.toFixed(1)}%</text>
  </g>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Estatísticas do GitHub de ${esc(user)}: ${total} contribuições no último ano">
  <style>
    text{font-family:${mono}}
    .up{opacity:0;animation:up .7s ease-out forwards}
    @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .ln{stroke-dasharray:3000;stroke-dashoffset:3000;animation:draw 2.4s ease-out .4s forwards}
    @keyframes draw{to{stroke-dashoffset:0}}
    .ar{opacity:0;animation:fade 1.2s ease-out 1.6s forwards}
    @keyframes fade{to{opacity:1}}
    .bar{clip-path:inset(0 100% 0 0);animation:grow 1.4s cubic-bezier(.2,.8,.2,1) .5s forwards}
    @keyframes grow{to{clip-path:inset(0 0 0 0)}}
    .pt{opacity:0;animation:fade .3s 2.7s forwards}
    .ring{transform-box:fill-box;transform-origin:center;animation:ping 1.8s ease-out 2.8s infinite;opacity:0}
    @keyframes ping{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}
  </style>
  <defs>
    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.lime}" stop-opacity=".35"/>
      <stop offset="1" stop-color="${C.lime}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="${C.bg}" stroke="${C.line}"/>
  <path d="M1 30 V12 a11 11 0 0 1 11 -11 H30" fill="none" stroke="${C.lime}" stroke-width="2"/>
  <path d="M${W - 1} ${H - 30} V${H - 12} a11 11 0 0 1 -11 11 H${W - 30}" fill="none" stroke="${C.lime}" stroke-width="2"/>
  ${tilesSvg}
  <text x="${cx}" y="${cy - 6}" font-size="11" fill="${C.dim}" letter-spacing="1.5">// CONTRIBUIÇÕES · ÚLTIMOS 60 DIAS</text>
  ${grid}
  <line x1="${cx}" x2="${cx + cw}" y1="${cy + ch}" y2="${cy + ch}" stroke="${C.line}"/>
  <path class="ar" d="${areaPath}" fill="url(#ag)"/>
  <path class="ln" d="${linePath}" fill="none" stroke="${C.lime}" stroke-width="2" stroke-linejoin="round"/>
  <circle class="ring" cx="${lastPt[0].toFixed(1)}" cy="${lastPt[1].toFixed(1)}" r="4" fill="none" stroke="${C.lime}" stroke-width="1.5"/>
  <circle class="pt" cx="${lastPt[0].toFixed(1)}" cy="${lastPt[1].toFixed(1)}" r="4" fill="${C.lime}"/>
  <text x="${cx}" y="${cy + ch + 20}" font-size="10" fill="${C.muted}">${fmt(last[0].date)}</text>
  <text x="${cx + cw}" y="${cy + ch + 20}" font-size="10" fill="${C.muted}" text-anchor="end">${fmt(last[last.length - 1].date)}</text>
  <text x="${cx + cw / 2}" y="${cy + ch + 20}" font-size="10" fill="${C.muted}" text-anchor="middle">pico: ${max}/dia</text>
  <text x="${lx}" y="${cy - 6}" font-size="11" fill="${C.dim}" letter-spacing="1.5">// LINGUAGENS</text>
  <rect x="${lx}" y="${cy + 30}" width="${lw}" height="10" rx="5" fill="#10140b"/>
  <g class="bar">${bar}</g>
  ${legend}
  <text x="${W - 24}" y="${H - 14}" font-size="9" fill="${C.muted}" text-anchor="end" opacity=".7">atualizado em ${new Date().toISOString().slice(0, 10)}</text>
</svg>
`;

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, svg);
console.log(`ok ${outFile}: ${total} contribuições, ${u.repositories.totalCount} repos, sequência ${current}/${longest}`);
