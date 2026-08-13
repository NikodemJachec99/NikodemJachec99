/**
 * Generuje elementy terminalowego UI profilu:
 *   assets/cmd-*.svg  — paski z komendami, pełnią rolę nagłówków sekcji
 *   assets/stack.svg  — wynik `cat stack.json` z kolorowaniem składni
 *
 * Wszystko jako pliki w repo: ładuje się natychmiast i nie zależy
 * od żadnego zewnętrznego serwisu.
 *
 * Użycie: node scripts/gen-ui.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";

const C = {
  bg: "#0d1117",
  chrome: "#161b22",
  border: "#30363d",
  fg: "#e6edf3",
  dim: "#8b949e",
  prompt: "#3fb950",
  accent: "#58a6ff",
  key: "#79c0ff",
  str: "#a5d6ff",
  punct: "#6e7681",
};

const MONO = "ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace";
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Wartości atrybutów wymagają dodatkowo cudzysłowów — bez tego komenda
// `mail -s "hello" ...` rozwala atrybut i cały plik przestaje być poprawnym XML.
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");

/* ---------------------------------------------------------------- pasek z komendą */

// Nagłówki sekcji to prawdziwe polecenia powłoki, nie ozdobniki —
// każde opisuje, co robi sekcja pod nim.
const COMMANDS = [
  ["about", "./whoami --verbose"],
  ["stack", "cat stack.json"],
  ["patterns", "man architecture"],
  ["projects", "ls -la ~/projects"],
  ["stats", "git log --stat"],
  ["contact", 'mail -s "hello" nikodem@automee.pl'],
];

function cmdStrip(cmd) {
  const FS = 16;
  const CW = FS * 0.6; // szerokość znaku w foncie o stałej szerokości
  const X = 28;
  const full = `$ ${cmd}`;
  const W = full.length * CW;
  const typeDur = Math.min(0.05 * cmd.length, 1.6);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 48" width="1000" height="48" role="img" aria-label="${escAttr(full)}">
  <defs>
    <clipPath id="t"><rect x="${X}" y="12" width="0" height="26">
      <animate attributeName="width" values="0;${W.toFixed(1)}" dur="${typeDur.toFixed(2)}s" begin="0.1s" fill="freeze"/>
    </rect></clipPath>
  </defs>
  <rect x="1" y="1" width="998" height="46" rx="8" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <text x="${X}" y="31" font-family="${MONO}" font-size="${FS}" clip-path="url(#t)" xml:space="preserve"><tspan fill="${C.prompt}">$</tspan><tspan fill="${C.fg}"> ${esc(cmd)}</tspan></text>
  <rect y="15" width="9" height="20" fill="${C.accent}">
    <animate attributeName="x" values="${X};${(X + W).toFixed(1)}" dur="${typeDur.toFixed(2)}s" begin="0.1s" fill="freeze"/>
    <animate attributeName="opacity" values="1;0" keyTimes="0;0.5" calcMode="discrete" dur="1.1s" begin="${(0.1 + typeDur).toFixed(2)}s" repeatCount="indefinite"/>
  </rect>
</svg>
`;
}

/* ---------------------------------------------------------------- cat stack.json */

const STACK = {
  ai: ["OpenAI Realtime", "Gemini", "Vertex AI", "ElevenLabs", "Deepgram", "Supabase Vector"],
  voice: ["Twilio ConversationRelay", "FreeSWITCH", "Asterisk", "SIP B2BUA"],
  backend: ["Python", "FastAPI", "NestJS", "Node.js", "PostgreSQL + RLS", "Redis", "Neo4j"],
  frontend: ["Next.js", "TypeScript", "Flutter"],
  automation: ["n8n", "MCP", "GoHighLevel", "Zapier"],
  infra: ["Docker", "Kubernetes", "nginx", "Linux", "CUDA"],
  embedded: ["nRF52840 Sense", "ADS1292", "BQ25185"],
};

function stackSvg() {
  const FS = 14;
  const LH = 24;
  const keys = Object.keys(STACK);
  const pad = Math.max(...keys.map((k) => k.length));

  const lines = [];
  lines.push([[C.fg, "{"]]);
  keys.forEach((k, i) => {
    const gap = " ".repeat(pad - k.length + 1);
    const parts = [
      [C.punct, "  "],
      [C.key, `"${k}"`],
      [C.punct, `:${gap}`],
      [C.fg, "["],
    ];
    STACK[k].forEach((v, j) => {
      parts.push([C.str, `"${v}"`]);
      if (j < STACK[k].length - 1) parts.push([C.punct, ", "]);
    });
    parts.push([C.fg, "]"]);
    if (i < keys.length - 1) parts.push([C.punct, ","]);
    lines.push(parts);
  });
  lines.push([[C.fg, "}"]]);

  const top = 84;
  const height = top + lines.length * LH + 28;

  const body = lines
    .map((parts, i) => {
      const y = top + i * LH;
      const delay = (0.25 + i * 0.07).toFixed(2);
      const spans = parts
        .map(([fill, txt]) => `<tspan fill="${fill}">${esc(txt)}</tspan>`)
        .join("");
      return `  <text x="28" y="${y}" font-family="${MONO}" font-size="${FS}" xml:space="preserve" opacity="0">${spans}<animate attributeName="opacity" values="0;1" dur="0.3s" begin="${delay}s" fill="freeze"/></text>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${height}" width="1000" height="${height}" role="img" aria-label="Stack technologiczny jako plik JSON">
  <rect x="1" y="1" width="998" height="${height - 2}" rx="10" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <text x="28" y="42" font-family="${MONO}" font-size="15" xml:space="preserve"><tspan fill="${C.prompt}">$</tspan><tspan fill="${C.fg}"> cat stack.json</tspan></text>
  <line x1="28" y1="58" x2="972" y2="58" stroke="#21262d" stroke-width="1"/>
${body}
</svg>
`;
}

/* ---------------------------------------------------------------- zapis */

mkdirSync("assets", { recursive: true });
for (const [slug, cmd] of COMMANDS) {
  writeFileSync(`assets/cmd-${slug}.svg`, cmdStrip(cmd));
}
writeFileSync("assets/stack.svg", stackSvg());

console.log(`OK  ${COMMANDS.length} paskow z komendami + stack.svg`);
