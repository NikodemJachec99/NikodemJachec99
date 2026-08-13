/**
 * Generuje terminalowy interfejs profilu, po dwa warianty każdego pliku
 * (ciemny i jasny), plus tekstowe odbicie stacku wstrzykiwane do README.
 *
 *   assets/hero.svg        assets/hero-light.svg
 *   assets/cmd-*.svg       assets/cmd-*-light.svg
 *   assets/stack.svg       assets/stack-light.svg
 *
 * Hero jest generowany, a nie pisany ręcznie, właśnie po to, żeby wariant
 * jasny nie mógł się rozjechać z ciemnym przy kolejnej zmianie.
 *
 * Użycie: node scripts/gen-ui.mjs
 */

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { MONO, PAD, TYPE, CW_EM, THEMES, esc, escAttr } from "./theme.mjs";

/* ═══════════════════════════════════════════════════════════ dane */

// Nagłówki sekcji to prawdziwe polecenia powłoki, nie ozdobniki — każde
// opisuje, co robi sekcja pod nim. `./projects --list` zamiast `ls -la`,
// bo wyjście nie ma kolumn, które `-la` obiecuje; łatwiej zmienić komendę
// niż podrabiać kolumny.
const COMMANDS = [
  ["about", "./whoami --verbose"],
  ["stack", "cat stack.json"],
  ["patterns", "man architecture"],
  ["projects", "./projects --list"],
  ["stats", "git log --stat"],
  ["contact", 'mail -s "hello" nikodem@automee.pl'],
];

const NEOFETCH = [
  ["role", "AI Automation Engineer", true],
  ["builds", "voice agents · LLM pipelines · process automation", false],
  ["stack", "n8n · FastAPI · NestJS · PostgreSQL · Docker", false],
  ["ai", "OpenAI Realtime · Gemini · ElevenLabs · Deepgram", false],
  ["hardware", "AEROS — wearable ECG on nRF52840", false],
  ["studies", "Medical Informatics @ Wrocław Univ. of Science and Tech.", false],
  ["location", "Wrocław, Poland", false],
];

// Rozbite na `llm` i `speech` zamiast jednego `ai` — nie tylko czytelniej,
// ale też najdłuższy wiersz mieści się wreszcie w szerokości panelu.
const STACK = {
  llm: ["OpenAI Realtime", "Gemini", "Vertex AI"],
  speech: ["ElevenLabs", "Deepgram", "DeepL"],
  voice: ["Twilio ConversationRelay", "FreeSWITCH", "Asterisk", "SIP B2BUA"],
  rag: ["Supabase Vector Store"],
  backend: ["Python", "FastAPI", "NestJS", "Node.js", "PostgreSQL + RLS", "Redis", "Neo4j"],
  frontend: ["Next.js", "TypeScript", "Flutter"],
  automation: ["n8n", "MCP", "GoHighLevel", "Zapier"],
  infra: ["Docker", "Kubernetes", "nginx", "Linux", "CUDA"],
  embedded: ["nRF52840 Sense", "ADS1292", "BQ25185"],
};

/* ═══════════════════════════════════════════════════════════ hero */

// Jeden cykl PQRST o szerokości 117 jednostek. Względem linii bazowej
// wychyla się od -19 (załamek R) do +13 (S), więc ślad mieści się w pasie
// ~34 jednostek nad i pod nią.
const BEAT = "h16 q6,-7 11,0 h9 l6,13 l6,-32 l7,25 l5,-6 h11 q9,-12 17,0 h29";
const ECG_BASELINE = 316;
const ECG_PATH = `M${PAD},${ECG_BASELINE} ` + Array(8).fill(BEAT).join(" ");

// Zamiatanie startuje dopiero po tym, jak grupa skończy się pojawiać (1.4 + 0.5).
// Bez tego pierwsza jedna trzecia przebiegu leci pod niewidoczną warstwą,
// a przesunięcie fazy już nigdy się nie wyrównuje.
const SWEEP_BEGIN = "1.9s";
const SWEEP_DUR = "4.5s";
const SWEEP_W = 170;

function hero(t) {
  const CW = TYPE.body * CW_EM;
  const VALUE_X = 125; // PAD + 10 komórek: najdłuższa etykieta ma 8 znaków

  const rows = NEOFETCH.map(([label, value, strong], i) => {
    const y = 104 + i * 26;
    const begin = (0.35 + i * 0.15).toFixed(2);
    const fill = strong ? t.accent : t.fg;
    const weight = strong ? ' font-weight="600"' : "";
    return `  <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.3s" begin="${begin}s" fill="freeze"/>
    <text x="${PAD}" y="${y}" fill="${t.dim}">${esc(label)}</text><text x="${VALUE_X}" y="${y}" fill="${fill}"${weight}>${esc(value)}</text></g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 368" width="1000" height="368" role="img" aria-label="${escAttr("nikodem@automee — neofetch")}">
  <defs>
    <clipPath id="sweep">
      <rect x="${-SWEEP_W - 10}" y="284" width="${SWEEP_W}" height="64">
        <animate attributeName="x" values="${-SWEEP_W - 10};${1000 - SWEEP_W}" dur="${SWEEP_DUR}" begin="${SWEEP_BEGIN}" repeatCount="indefinite"/>
      </rect>
    </clipPath>
    <linearGradient id="comet" gradientUnits="userSpaceOnUse" x1="${-SWEEP_W - 10}" y1="0" x2="-10" y2="0">
      <stop offset="0%" stop-color="${t.ecg}" stop-opacity="0"/>
      <stop offset="60%" stop-color="${t.ecg}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${t.ecg}" stop-opacity="1"/>
      <animate attributeName="x1" values="${-SWEEP_W - 10};${1000 - SWEEP_W}" dur="${SWEEP_DUR}" begin="${SWEEP_BEGIN}" repeatCount="indefinite"/>
      <animate attributeName="x2" values="-10;1000" dur="${SWEEP_DUR}" begin="${SWEEP_BEGIN}" repeatCount="indefinite"/>
    </linearGradient>
  </defs>

  <rect x="1" y="1" width="998" height="366" rx="12" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>
  <path d="M1,13 a12,12 0 0 1 12,-12 h974 a12,12 0 0 1 12,12 v27 h-998 z" fill="${t.chrome}"/>
  <line x1="1" y1="40" x2="999" y2="40" stroke="${t.border}" stroke-width="1.5"/>
  <g opacity="0.85">
    <circle cx="26" cy="20" r="5.5" fill="#f0625b"/>
    <circle cx="46" cy="20" r="5.5" fill="#f5be4f"/>
    <circle cx="66" cy="20" r="5.5" fill="#4fc76a"/>
  </g>
  <text x="500" y="25" text-anchor="middle" font-family="${MONO}" font-size="${TYPE.chrome}" fill="${t.dim}">nikodem@automee: ~</text>

  <text x="${PAD}" y="70" font-family="${MONO}" font-size="${TYPE.body}" xml:space="preserve"><tspan fill="${t.prompt}">$</tspan><tspan fill="${t.fg}"> neofetch</tspan></text>

  <g font-family="${MONO}" font-size="${TYPE.body}">
${rows}
  </g>

  <line x1="${PAD}" y1="284" x2="968" y2="284" stroke="${t.rule}" stroke-width="1"/>

  <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.4s" fill="freeze"/>
    <g fill="none" stroke-linejoin="round" stroke-linecap="round">
      <path stroke="${t.ecg}" stroke-opacity="${t.ecgBase}" stroke-width="1.6" d="${ECG_PATH}"/>
      <g clip-path="url(#sweep)"><path stroke="url(#comet)" stroke-width="2.2" d="${ECG_PATH}"/></g>
    </g>
    <circle cx="-10" cy="${ECG_BASELINE}" r="3" fill="${t.ecg}">
      <animate attributeName="cx" values="-10;1000" dur="${SWEEP_DUR}" begin="${SWEEP_BEGIN}" repeatCount="indefinite"/>
    </circle>
    <text x="${PAD}" y="350" font-family="${MONO}" font-size="${TYPE.meta}" fill="${t.dim}" letter-spacing="1.5">ecg · aeros</text>
  </g>
</svg>
`;
}

/* ═══════════════════════════════════════════════════════════ paski komend */

function cmdStrip(cmd, t) {
  const CW = TYPE.body * CW_EM;
  const full = `$ ${cmd}`;
  const W = full.length * CW;
  const typeDur = Math.min(0.05 * cmd.length, 1.6);
  const end = (0.1 + typeDur).toFixed(2);

  // textLength + lengthAdjust przypina tekst do dokładnie W jednostek, więc
  // kursor trafia na koniec wiersza niezależnie od tego, który font ze stosu
  // faktycznie ma czytelnik. Bez tego na Windowsie (Consolas, 0.55 em zamiast
  // zakładanych 0.6) kursor parkował trzy komórki za tekstem.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 48" width="1000" height="48" role="img" aria-label="${escAttr(full)}">
  <defs>
    <clipPath id="t"><rect x="${PAD}" y="12" width="0" height="26">
      <animate attributeName="width" values="0;${W.toFixed(1)}" dur="${typeDur.toFixed(2)}s" begin="0.1s" fill="freeze"/>
    </rect></clipPath>
  </defs>
  <rect x="1" y="1" width="998" height="46" rx="8" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>
  <text x="${PAD}" y="31" font-family="${MONO}" font-size="${TYPE.body}" textLength="${W.toFixed(1)}" lengthAdjust="spacing" clip-path="url(#t)" xml:space="preserve"><tspan fill="${t.prompt}">$</tspan><tspan fill="${t.fg}"> ${esc(cmd)}</tspan></text>
  <rect x="${PAD}" y="15" width="${CW.toFixed(1)}" height="20" fill="${t.accent}">
    <animate attributeName="x" values="${PAD};${(PAD + W).toFixed(1)}" dur="${typeDur.toFixed(2)}s" begin="0.1s" fill="freeze"/>
    <animate attributeName="opacity" values="1;0" keyTimes="0;0.5" calcMode="discrete" dur="1.1s" begin="${end}s" repeatCount="2" fill="freeze"/>
  </rect>
</svg>
`;
}

/* ═══════════════════════════════════════════════════════════ cat stack.json */

/** Wspólne źródło dla panelu SVG i tekstowego odbicia w README. */
function stackLines() {
  const keys = Object.keys(STACK);
  const pad = Math.max(...keys.map((k) => k.length));
  const out = [[["fg", "{"]]];
  keys.forEach((k, i) => {
    const gap = " ".repeat(pad - k.length + 1);
    const parts = [
      ["punct", "  "],
      ["key", `"${k}"`],
      ["punct", `:${gap}`],
      ["fg", "["],
    ];
    STACK[k].forEach((v, j) => {
      parts.push(["str", `"${v}"`]);
      if (j < STACK[k].length - 1) parts.push(["punct", ", "]);
    });
    parts.push(["fg", "]"]);
    if (i < keys.length - 1) parts.push(["punct", ","]);
    out.push(parts);
  });
  out.push([["fg", "}"]]);
  return out;
}

function stackSvg(t) {
  const LH = 26;
  const TOP = 42;
  const lines = stackLines();
  const height = TOP + (lines.length - 1) * LH + 36;

  // Brak drugiego `$ cat stack.json` w środku: pasek nad panelem już go
  // wypisał, a powłoka nie powtarza polecenia, które przed chwilą wpisałeś.
  const body = lines
    .map((parts, i) => {
      const y = TOP + i * LH;
      const begin = (0.2 + i * 0.06).toFixed(2);
      const spans = parts
        .map(([tok, txt]) => `<tspan fill="${t[tok]}">${esc(txt)}</tspan>`)
        .join("");
      return `  <text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${TYPE.dense}" xml:space="preserve" opacity="0">${spans}<animate attributeName="opacity" values="0;1" dur="0.3s" begin="${begin}s" fill="freeze"/></text>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${height}" width="1000" height="${height}" role="img" aria-label="${escAttr("stack.json")}">
  <rect x="1" y="1" width="998" height="${height - 2}" rx="10" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>
${body}
</svg>
`;
}

/** Ten sam stack jako zwykły tekst — dla czytników ekranu, Ctrl+F i telefonów,
 *  gdzie panel na płótnie 1000 jednostek renderuje się nieczytelnie małym pismem. */
function stackText() {
  return stackLines()
    .map((parts) => parts.map(([, txt]) => txt).join(""))
    .join("\n");
}

/* ═══════════════════════════════════════════════════════════ zapis */

mkdirSync("assets", { recursive: true });

for (const t of THEMES) {
  writeFileSync(`assets/hero${t.suffix}.svg`, hero(t));
  writeFileSync(`assets/stack${t.suffix}.svg`, stackSvg(t));
  for (const [slug, cmd] of COMMANDS) {
    writeFileSync(`assets/cmd-${slug}${t.suffix}.svg`, cmdStrip(cmd, t));
  }
}

// Wstrzyknięcie tekstowego odbicia stacku między znaczniki w README, żeby
// panel i jego tekstowy odpowiednik nie mogły się rozjechać.
const MARK_A = "<!-- stack:begin -->";
const MARK_B = "<!-- stack:end -->";
const readme = readFileSync("README.md", "utf8");
const a = readme.indexOf(MARK_A);
const b = readme.indexOf(MARK_B);
if (a === -1 || b === -1) {
  console.error(`BŁĄD: brak znaczników ${MARK_A} / ${MARK_B} w README.md`);
  process.exit(1);
}
const block = `${MARK_A}\n\n<details>\n<summary>stack.json as text</summary>\n\n\`\`\`json\n${stackText()}\n\`\`\`\n\n</details>\n\n`;
writeFileSync("README.md", readme.slice(0, a) + block + readme.slice(b));

console.log(
  `OK  ${THEMES.length} warianty × (hero + stack + ${COMMANDS.length} paskow) = ${THEMES.length * (2 + COMMANDS.length)} plikow`
);
console.log(`    tekstowe odbicie stacku wstrzykniete do README.md`);
