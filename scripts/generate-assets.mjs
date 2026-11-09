// Gera os SVGs animados do README (terminal, cards, divisor, rodapé).
// Uso: node scripts/generate-assets.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (p, s) => {
  const f = join(root, "assets", p);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, s.trim() + "\n");
  console.log("ok", p);
};

const C = {
  bg: "#0a0c07",
  panel: "#10140b",
  line: "#232b14",
  lime: "#c6f432",
  limeDim: "#7f9a24",
  text: "#eef2e2",
  muted: "#98a284",
  mono: "'JetBrains Mono','Fira Code',Consolas,'Courier New',monospace",
  serif: "Georgia,'Times New Roman',serif",
  sans: "'Segoe UI',Inter,Helvetica,Arial,sans-serif",
};

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, max) {
  const lines = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max) {
      lines.push(cur.trim());
      cur = w;
    } else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

/* ------------------------------------------------------------ terminal */
function terminal() {
  const W = 880;
  const lh = 26;
  const charW = 8.6;
  const prompt = "thiago@th1agx:~$ ";
  const script = [
    ["cmd", "whoami"],
    ["out", "Thiago Antunes — Software Engineer @ 3D Lab · Belo Horizonte, BR"],
    ["cmd", "cat foco.txt"],
    ["out", "Python · GenAI · LLMs & Agents · Automação · Sistemas Inteligentes"],
    ["cmd", "ls ~/projetos --em-destaque"],
    ["out", "mneme/  tributax/  devguard/  forza/  english-learning/  portfolio/"],
    ["cmd", "echo $MISSAO"],
    ["out", "construir IA que prova o que faz — com teste, dado e evidência."],
  ];
  const top = 62;
  const H = top + script.length * lh + 34;
  // Só animações CSS: o GitHub exibe SVG dentro de <img>, onde SMIL nem sempre roda.
  // textLength fixa a largura de cada caractere, então steps(n) revela 1 caractere por passo.
  let t = 0.6;
  let body = "";
  let css = "";
  const tl = (s) => `textLength="${(s.length * charW).toFixed(1)}" lengthAdjust="spacingAndGlyphs"`;
  const promptEl = (y, cls) =>
    `<text class="${cls}" x="28" y="${y}" ${tl("thiago@th1agx:~$")}><tspan fill="${C.lime}" font-weight="700">thiago@th1agx</tspan><tspan fill="${C.muted}">:</tspan><tspan fill="#7cc4ff">~</tspan><tspan fill="${C.muted}">$</tspan></text>`;
  script.forEach(([kind, txt], i) => {
    const y = top + i * lh;
    if (kind === "cmd") {
      const dur = txt.length * 0.07;
      css += `.p${i}{opacity:0;animation:show 0s ${(t - 0.3).toFixed(2)}s forwards}
    .l${i}{clip-path:inset(0 100% 0 0);animation:type ${dur.toFixed(2)}s steps(${txt.length}) ${t.toFixed(2)}s forwards}\n    `;
      body += `${promptEl(y, `p${i}`)}
    <text class="l${i}" x="${28 + prompt.length * charW}" y="${y}" fill="${C.text}" ${tl(txt)}>${esc(txt)}</text>\n    `;
      t += dur + 0.25;
    } else {
      const full = "› " + txt;
      css += `.l${i}{clip-path:inset(0 100% 0 0);animation:type .4s ease-out ${t.toFixed(2)}s forwards}\n    `;
      body += `<text class="l${i}" x="28" y="${y}" ${tl(full)}><tspan fill="${C.lime}">›</tspan><tspan fill="${C.muted}"> ${esc(txt)}</tspan></text>\n    `;
      t += 0.95;
    }
  });
  const lastY = top + script.length * lh;
  css += `.pl{opacity:0;animation:show 0s ${t.toFixed(2)}s forwards}`;
  body += `<g class="pl">${promptEl(lastY, "")}
    <rect class="cursor" x="${28 + prompt.length * charW}" y="${lastY - 14}" width="9" height="18" fill="${C.lime}"/></g>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Terminal: whoami — Thiago Antunes, Software Engineer">
  <style>
    text{font-family:${C.mono};font-size:14px}
    .cursor{animation:blink 1s steps(1) infinite}
    @keyframes blink{50%{opacity:0}}
    .scan{animation:scan 7s linear infinite}
    @keyframes scan{from{transform:translateY(-40px)}to{transform:translateY(${H}px)}}
    @keyframes type{to{clip-path:inset(0 0 0 0)}}
    @keyframes show{to{opacity:1}}
    ${css}
  </style>
  <defs>
    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.lime}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C.lime}" stop-opacity=".06"/>
    </linearGradient>
    <clipPath id="win"><rect width="${W}" height="${H}" rx="12"/></clipPath>
  </defs>
  <g clip-path="url(#win)">
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    <rect width="${W}" height="36" fill="${C.panel}"/>
    <line x1="0" y1="36" x2="${W}" y2="36" stroke="${C.line}"/>
    <circle cx="22" cy="18" r="6" fill="#ff5f57"/><circle cx="42" cy="18" r="6" fill="#febc2e"/><circle cx="62" cy="18" r="6" fill="#28c840"/>
    <text x="${W / 2}" y="23" text-anchor="middle" fill="${C.muted}" style="font-size:12px">th1agx — zsh — 88×${script.length + 2}</text>
    ${body}
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${C.line}"/>
  <path d="M1 30 V12 a11 11 0 0 1 11 -11 H30" fill="none" stroke="${C.lime}" stroke-width="2"/>
  <path d="M${W - 1} ${H - 30} V${H - 12} a11 11 0 0 1 -11 11 H${W - 30}" fill="none" stroke="${C.lime}" stroke-width="2"/>
</svg>`;
}

/* --------------------------------------------------------------- cards */
const projects = [
  {
    file: "mneme",
    n: "01",
    lang: "Python",
    title: "MNEME",
    desc: "IA financeira híbrida: ML, deep learning, LLMs, RAG e análise quantitativa para estudar mercados e operar com prova medida em dados nunca vistos.",
    tags: ["LightGBM", "LangGraph", "Ollama", "RAG"],
    status: "em evolução",
  },
  {
    file: "tributax",
    n: "02",
    lang: "TypeScript",
    title: "Tributax",
    desc: "Motor de decisão tributária brasileiro: tributos, alíquotas, CFOP/CST e fundamentos legais com rastro auditável de cada decisão.",
    tags: ["NestJS", "Drizzle", "Postgres", "OpenAPI"],
    status: "API no ar",
  },
  {
    file: "devguard",
    n: "03",
    lang: "Python",
    title: "DevGuard Skill",
    desc: "Skill de disciplina de desenvolvimento para agentes de IA: SDD, planejamento, smoke e stress tests e entrega baseada em evidências.",
    tags: ["AI Agents", "SDD", "Testes", "Claude Code"],
    status: "ativo",
  },
  {
    file: "forza",
    n: "04",
    lang: "Python",
    title: "Forza Horizon 5 Auto Drive",
    desc: "Automação de corridas no Forza Horizon 5: aceleração, controle de tempo e reinício automático para farm contínuo de XP.",
    tags: ["Python", "PyAutoGUI", "Automação"],
    status: "concluído",
  },
  {
    file: "english",
    n: "05",
    lang: "JavaScript",
    title: "English Learning Experience",
    desc: "Site editorial para aulas de inglês do A1 ao C2, com coreografia de scroll e arquitetura MVC + SOLID.",
    tags: ["React", "Vite", "GSAP", "Framer Motion"],
    status: "no ar",
  },
  {
    file: "portfolio",
    n: "06",
    lang: "TypeScript",
    title: "Portfólio",
    desc: "Portfólio construído como um filme: câmera parada, conteúdo transitando, texto acendendo palavra por palavra. Bilíngue PT/EN.",
    tags: ["React 19", "GSAP", "Motion", "Lenis"],
    status: "thiagoantunes.com",
  },
];

const langColor = {
  Python: "#3776ab",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
};

function card(p, i) {
  const W = 420;
  const H = 176;
  const per = 2 * (W + H);
  const lines = wrap(p.desc, 58).slice(0, 3);
  const titleSize = p.title.length > 18 ? 20 : 24;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(p.title)}: ${esc(p.desc)}">
  <style>
    .m{font-family:${C.mono}}
    .s{font-family:${C.sans}}
  </style>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="${C.bg}" stroke="${C.line}"/>
  <path d="M10 26 V10 H26" fill="none" stroke="${C.lime}" stroke-width="2"/>
  <path d="M${W - 10} ${H - 26} V${H - 10} H${W - 26}" fill="none" stroke="${C.lime}" stroke-width="2"/>

  <g class="in">
    <text x="24" y="34" class="m" font-size="11" fill="${C.limeDim}" letter-spacing="2">// ${p.n}</text>
    <circle cx="${78}" cy="30" r="5" fill="${langColor[p.lang]}"/>
    <text x="88" y="34" class="m" font-size="11" fill="${C.muted}">${p.lang}</text>
    <text x="${W - 24}" y="35" class="m" font-size="16" fill="${C.lime}" text-anchor="end">↗</text>
  </g>
  <text x="24" y="66" class="in d1" font-family="${C.serif}" font-size="${titleSize}" fill="${C.text}">${esc(p.title)}</text>
  <g class="in d2 s" font-size="12.5" fill="${C.muted}">
    ${lines.map((l, k) => `<text x="24" y="${92 + k * 18}">${esc(l)}</text>`).join("\n    ")}
  </g>
  <g class="in d3 m" font-size="11">
    <text x="24" y="${H - 18}" fill="${C.lime}">${p.tags.map(esc).join("  ·  ")}</text>
    <circle cx="${W - 24}" cy="${H - 22}" r="4" fill="${C.lime}"/>
    <text x="${W - 34}" y="${H - 18}" fill="${C.muted}" text-anchor="end">${esc(p.status)}</text>
  </g>
</svg>`;
}

/* ------------------------------------------------------------- divider */
function divider() {
  const W = 900;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="16" viewBox="0 0 ${W} 16">
  <style>
    .p{animation:go 4s cubic-bezier(.6,0,.4,1) infinite}
    @keyframes go{from{transform:translateX(-220px)}to{transform:translateX(${W}px)}}
  </style>
  <defs>
    <linearGradient id="g" x1="0" x2="1">
      <stop offset="0" stop-color="${C.lime}" stop-opacity="0"/>
      <stop offset=".8" stop-color="${C.lime}" stop-opacity=".9"/>
      <stop offset="1" stop-color="${C.lime}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <line x1="0" y1="8" x2="${W}" y2="8" stroke="${C.lime}" stroke-opacity=".18"/>
  <rect class="p" x="0" y="7" width="220" height="2" fill="url(#g)"/>
  <rect x="${W / 2 - 4}" y="4" width="8" height="8" fill="${C.bg}" stroke="${C.lime}" transform="rotate(45 ${W / 2} 8)"/>
</svg>`;
}

/* ------------------------------------------------------- section titles */
function heading(file, n, label) {
  const W = 900;
  const H = 46;
  const len = label.length;
  const pillW = 64 + len * 18;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
  <style>
    .t{font-family:${C.mono};font-size:16px;letter-spacing:6px}
    .c{animation:blink 1s steps(1) infinite}
    @keyframes blink{50%{opacity:0}}
    .l{stroke-dasharray:${W};stroke-dashoffset:${W};animation:draw 1.6s ease-out .9s forwards}
    @keyframes draw{to{stroke-dashoffset:0}}
    .r{clip-path:inset(0 100% 0 0);animation:type ${(len * 0.07).toFixed(2)}s steps(${len}) .2s forwards}
    @keyframes type{to{clip-path:inset(0 0 0 0)}}
  </style>
  <line class="l" x1="${pillW}" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="#7f9a24" stroke-opacity=".6"/>
  <rect x=".5" y="6.5" width="${pillW}" height="${H - 13}" rx="6" fill="${C.bg}" stroke="${C.line}"/>
  <path d="M1 18 V12 a6 6 0 0 1 6 -6 H14" fill="none" stroke="${C.lime}" stroke-width="2"/>
  <text x="16" y="${H / 2 + 5}" class="t" fill="${C.limeDim}" style="font-size:12px;letter-spacing:1px">${n}</text>
  <text x="52" y="${H / 2 + 6}" class="t r" fill="${C.lime}" textLength="${len * 18 - 6}" lengthAdjust="spacingAndGlyphs">${esc(label)}</text>
  <rect class="c" x="${pillW - 18}" y="${H / 2 - 7}" width="8" height="14" fill="${C.lime}"/>
</svg>`;
}

/* -------------------------------------------------------------- footer */
function footer() {
  const W = 900;
  const H = 120;
  const n = 56;
  const gap = W / n;
  let bars = "";
  for (let i = 0; i < n; i++) {
    const d = (0.6 + ((i * 37) % 11) / 10).toFixed(2);
    const delay = (-((i * 53) % 17) / 10).toFixed(2);
    const center = 1 - Math.abs(i - n / 2) / (n / 2);
    const h = (18 + center * 46).toFixed(0);
    bars += `<rect class="b" x="${(i * gap + 2).toFixed(1)}" y="${70 - h}" width="${(gap - 5).toFixed(1)}" height="${h}" rx="2" style="animation-duration:${d}s;animation-delay:${delay}s" opacity="${(0.35 + center * 0.65).toFixed(2)}"/>`;
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Equalizador animado — obrigado pela visita">
  <style>
    .b{fill:${C.lime};transform-box:fill-box;transform-origin:bottom;animation:eq 1s ease-in-out infinite alternate}
    @keyframes eq{0%{transform:scaleY(.15)}60%{transform:scaleY(.7)}100%{transform:scaleY(1)}}
    text{font-family:${C.mono};font-size:13px;letter-spacing:4px}
  </style>
  ${bars}
  <line x1="0" y1="72" x2="${W}" y2="72" stroke="${C.lime}" stroke-opacity=".25"/>
  <text x="${W / 2}" y="102" text-anchor="middle" fill="${C.muted}">CODE · BEATS · BUILD · REPEAT</text>
</svg>`;
}

out("terminal.svg", terminal());
projects.forEach((p, i) => out(`cards/${p.file}.svg`, card(p, i)));
out("divider.svg", divider());

[
  ["about", "00", "SOBRE MIM"],
  ["stack", "01", "STACK"],
  ["projects", "02", "PROJETOS"],
  ["journey", "03", "TRAJETÓRIA"],
  ["stats", "04", "ATIVIDADE"],
  ["snake", "05", "SNAKE MODE"],
].forEach(([f, n, l]) => out(`headings/${f}.svg`, heading(f, n, l)));

/* ------------------------------------------------------ contact buttons */
function contact(label, value, icon) {
  const W = 340;
  const H = 64;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}: ${esc(value)}">
  <style>
    .in{opacity:0;animation:in .6s ease-out .1s forwards}
    @keyframes in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  </style>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="${C.bg}" stroke="${C.line}"/>
  <path d="M8 20 V8 H20" fill="none" stroke="${C.lime}" stroke-width="2"/>
  <path d="M${W - 8} ${H - 20} V${H - 8} H${W - 20}" fill="none" stroke="${C.lime}" stroke-width="2"/>
  <g class="in">
    <rect x="16" y="14" width="36" height="36" rx="8" fill="#10140b" stroke="${C.line}"/>
    <g transform="translate(22 20)" fill="none" stroke="${C.lime}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
    <text x="66" y="28" font-family="${C.mono}" font-size="10" letter-spacing="2" fill="${C.limeDim}">${esc(label)}</text>
    <text x="66" y="47" font-family="${C.mono}" font-size="13" fill="${C.text}">${esc(value)}</text>
    <text x="${W - 22}" y="38" font-family="${C.mono}" font-size="15" fill="${C.lime}" text-anchor="end">↗</text>
  </g>
</svg>`;
}

const icons = {
  globe: `<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4.2" ry="10"/><path d="M2 12 H22 M4 6.5 H20 M4 17.5 H20"/>`,
  linkedin: `<rect x="2" y="2" width="20" height="20" rx="4"/><path d="M7.5 10.5 V17 M7.5 7 V7.2 M11.5 17 V10.5 M11.5 13.5 c0-2 1.3-3.1 3-3.1 s2.8 1 2.8 3.1 V17"/>`,
  mail: `<rect x="2" y="4.5" width="20" height="15" rx="2.5"/><path d="M3 6 L12 13 L21 6"/>`,
};
out("contact/portfolio.svg", contact("PORTFÓLIO", "thiagoantunes.com", icons.globe));
out("contact/linkedin.svg", contact("LINKEDIN", "in/thiagofilipeantunes", icons.linkedin));
out("contact/email.svg", contact("E-MAIL", "thiagofsprofissional@gmail.com", icons.mail));
