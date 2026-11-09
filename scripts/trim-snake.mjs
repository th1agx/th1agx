// Remove a barra de progresso que o Platane/snk desenha embaixo da cobrinha
// e encurta o SVG para não sobrar espaço vazio.
// Uso: node scripts/trim-snake.mjs dist/github-snake.svg dist/github-snake-dark.svg
import { readFileSync, writeFileSync } from "node:fs";

for (const file of process.argv.slice(2)) {
  let svg = readFileSync(file, "utf8");
  svg = svg.replace(/<rect class="u [^>]*\/>/g, "");
  svg = svg.replace(
    /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
    (_, x, y, w, h, W, H) => {
      const cut = 24; // altura da barra + margem
      return `viewBox="${x} ${y} ${w} ${+h - cut}" width="${W}" height="${+H - cut}"`;
    },
  );
  writeFileSync(file, svg);
  console.log("ok", file);
}
