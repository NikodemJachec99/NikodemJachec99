/**
 * Generuje assets/terminal.svg i assets/terminal-light.svg — CAŁY profil jako
 * jedno okno terminala, z animacjami w środku: wpisywane komendy, kolorowany
 * JSON, rosnące słupki języków i przesuwający się zapis EKG.
 *
 * Jedno wielkie SVG, a nie kilkanaście sklejonych: markdown wstawia margines
 * między obrazkami, więc każdy kolejny plik to widoczny szew. Okno musi być
 * jednym elementem, żeby faktycznie wyglądało jak jedno okno.
 *
 * Do README trafia dodatkowo tekstowe odbicie sesji w <details> — panel na
 * płótnie 640 jednostek jest na telefonie nieczytelny, a treść ma być
 * dostępna dla czytników ekranu i Ctrl+F.
 *
 * Użycie: GITHUB_TOKEN=... LOGIN=NikodemJachec99 node scripts/gen-terminal.mjs
 */

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { MONO, THEMES, esc, escAttr } from "./theme.mjs";
import {
  COLS, NEOFETCH, MANPAGE, PROJECTS, CONTACT, STATS_NOTE, stackJson,
} from "./content.mjs";

/* ───────────────────────────────────────────────── metryka */

const W = 640; // węższe płótno niż strona: przy width=100% tekst renderuje się
//                większy, co jest jedyną dźwignią czytelności na telefonie
const PAD = 24;
const FS = 11.5;
const CW = FS * 0.6;
const LH = 18;
const CHROME = 34;
const RIGHT = W - PAD;

/* ───────────────────────────────────────────────── dane z GitHuba */

const TOKEN = process.env.GITHUB_TOKEN;
const LOGIN = process.env.LOGIN || "NikodemJachec99";
if (!TOKEN) {
  console.error("Brak GITHUB_TOKEN w środowisku.");
  process.exit(1);
}

async function gql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "profile-terminal-generator",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data;
}

// privacy: PUBLIC celowo — wynik jest wtedy identyczny lokalnie (token
// użytkownika) i w Actions (GITHUB_TOKEN), więc liczby nie skaczą.
const QUERY = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar { totalContributions }
    }
    repositories(
      first: 100, after: $cursor
      ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false
    ) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        stargazerCount
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

async function collect() {
  let cursor = null, user = null;
  const repos = [];
  do {
    const data = await gql(QUERY, { login: LOGIN, cursor });
    user = data.user;
    repos.push(...user.repositories.nodes);
    cursor = user.repositories.pageInfo.hasNextPage
      ? user.repositories.pageInfo.endCursor : null;
  } while (cursor);

  // Notebooki zapisują wyjścia komórek (obrazy w base64) w środku pliku, więc
  // rozmiar w bajtach nie mówi nic o ilości napisanego kodu — jeden notebook
  // potrafi przebić resztę repozytoriów razem wziętą.
  const EXCLUDED = new Set(["Jupyter Notebook"]);
  const bytes = new Map(), colors = new Map();
  for (const r of repos) {
    for (const e of r.languages.edges) {
      if (EXCLUDED.has(e.node.name)) continue;
      bytes.set(e.node.name, (bytes.get(e.node.name) || 0) + e.size);
      if (e.node.color) colors.set(e.node.name, e.node.color);
    }
  }
  const total = [...bytes.values()].reduce((a, b) => a + b, 0) || 1;
  const langs = [...bytes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, size]) => ({ name, pct: (size / total) * 100, color: colors.get(name) }));

  const cc = user.contributionsCollection;
  return {
    contributions: cc.contributionCalendar.totalContributions,
    commits: cc.totalCommitContributions,
    prs: cc.totalPullRequestContributions,
    issues: cc.totalIssueContributions,
    stars: repos.reduce((a, r) => a + r.stargazerCount, 0),
    repos: user.repositories.totalCount,
    followers: user.followers.totalCount,
    languages: bytes.size,
    langs,
  };
}

/* ───────────────────────────────────────────────── model sesji */

const blank = () => ({ k: "blank" });
const txt = (line, tok = "fg") => ({ k: "txt", line, tok });

function buildSession(d) {
  // Wiersze o wartości 0 są pomijane — "stars earned  0" szkodzi bardziej,
  // niż pomaga. Pojawią się same, gdy będzie co pokazać.
  const counts = [
    ["contributions (last year)", d.contributions],
    ["commits (last year)", d.commits],
    ["public repos", d.repos],
    ["languages used", d.languages],
    ["pull requests", d.prs],
    ["issues opened", d.issues],
    ["stars earned", d.stars],
    ["followers", d.followers],
  ].filter(([, v]) => v > 0);

  const manLines = MANPAGE.split("\n").map((l) => {
    if (/^[A-Z][A-Z0-9()\- ]*$/.test(l.trim()) && !l.startsWith(" ") && l.trim())
      return txt(l, "accent");
    if (l.startsWith("ARCHITECTURE(7)") || l.startsWith("Nikodem Jachec"))
      return txt(l, "dim");
    return txt(l, "fg");
  });

  const projectItems = [];
  PROJECTS.forEach((p, i) => {
    if (i) projectItems.push(blank());
    projectItems.push({ k: "proj", ...p });
    p.body.split("\n").forEach((l) => projectItems.push(txt("             " + l, "fg")));
  });

  return [
    {
      cmd: "neofetch",
      items: [
        ...NEOFETCH.map(([label, value, accent]) => ({ k: "kv", label, value, accent })),
        blank(),
        { k: "ecg" },
      ],
    },
    {
      cmd: "cat stack.json",
      items: stackJson(COLS).split("\n").map((l) => ({ k: "json", line: l })),
    },
    { cmd: "man architecture", items: manLines },
    { cmd: "./projects --list", items: projectItems },
    {
      cmd: "git log --stat",
      items: [
        ...counts.map(([label, value]) => ({ k: "count", label, value })),
        blank(),
        ...d.langs.map((l) => ({ k: "bar", ...l })),
        blank(),
        ...STATS_NOTE.split("\n").map((l) => txt(l, "dim")),
      ],
    },
    {
      cmd: 'mail -s "hello" nikodem@automee.pl',
      items: CONTACT.map(([label, value]) => ({ k: "kv", label, value, accent: false })),
    },
    { cmd: "logout", items: [txt("Connection to nikodem closed.", "dim")] },
  ];
}

/* ───────────────────────────────────────────────── EKG */

// Jeden cykl PQRST szerokości 117 jednostek; wychyla się od -19 (R) do +13 (S).
const BEAT = "h16 q6,-7 11,0 h9 l6,13 l6,-32 l7,25 l5,-6 h11 q9,-12 17,0 h29";
const BEATS = 5;
const ECG_H = 56;
const SWEEP = 120;
const DUR = "4.5s";

function ecgBlock(y, t, begin) {
  const base = y + 30;
  const path = `M${PAD},${base} ` + Array(BEATS).fill(BEAT).join(" ");
  const from = -SWEEP - 10;
  return `  <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.4s" begin="${begin}s" fill="freeze"/>
    <defs>
      <clipPath id="sweepClip"><rect x="${from}" y="${y}" width="${SWEEP}" height="${ECG_H}">
        <animate attributeName="x" values="${from};${W - SWEEP}" dur="${DUR}" begin="${begin}s" repeatCount="indefinite"/>
      </rect></clipPath>
      <linearGradient id="comet" gradientUnits="userSpaceOnUse" x1="${from}" y1="0" x2="-10" y2="0">
        <stop offset="0%" stop-color="${t.ecg}" stop-opacity="0"/>
        <stop offset="60%" stop-color="${t.ecg}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${t.ecg}" stop-opacity="1"/>
        <animate attributeName="x1" values="${from};${W - SWEEP}" dur="${DUR}" begin="${begin}s" repeatCount="indefinite"/>
        <animate attributeName="x2" values="-10;${W}" dur="${DUR}" begin="${begin}s" repeatCount="indefinite"/>
      </linearGradient>
    </defs>
    <g fill="none" stroke-linejoin="round" stroke-linecap="round">
      <path stroke="${t.ecg}" stroke-opacity="${t.ecgBase}" stroke-width="1.4" d="${path}"/>
      <g clip-path="url(#sweepClip)"><path stroke="url(#comet)" stroke-width="2" d="${path}"/></g>
    </g>
    <circle cx="-10" cy="${base}" r="2.6" fill="${t.ecg}">
      <animate attributeName="cx" values="-10;${W}" dur="${DUR}" begin="${begin}s" repeatCount="indefinite"/>
    </circle>
    <text x="${PAD}" y="${y + ECG_H - 4}" font-family="${MONO}" font-size="9" fill="${t.dim}" letter-spacing="1.4">ecg · aeros</text>
  </g>`;
}

/* ───────────────────────────────────────────────── render */

function render(session, t) {
  const out = [];
  let y = CHROME + 26;
  let uid = 0;

  session.forEach((sec, si) => {
    const base = 0.3 + si * 0.5;
    const typeDur = Math.min(0.045 * sec.cmd.length, 0.7);
    const full = `$ ${sec.cmd}`;
    const width = full.length * CW;
    const id = `typ${uid++}`;
    const isLast = si === session.length - 1;

    out.push(`  <defs><clipPath id="${id}"><rect x="${PAD}" y="${y - 13}" width="0" height="18">
      <animate attributeName="width" values="0;${width.toFixed(1)}" dur="${typeDur.toFixed(2)}s" begin="${base.toFixed(2)}s" fill="freeze"/>
    </rect></clipPath></defs>
  <text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${FS}" textLength="${width.toFixed(1)}" lengthAdjust="spacing" clip-path="url(#${id})" xml:space="preserve"><tspan fill="${t.prompt}">$</tspan><tspan fill="${t.fg}"> ${esc(sec.cmd)}</tspan></text>
  <rect x="${PAD}" y="${y - 11}" width="${CW.toFixed(1)}" height="14" fill="${t.accent}">
    <animate attributeName="x" values="${PAD};${(PAD + width).toFixed(1)}" dur="${typeDur.toFixed(2)}s" begin="${base.toFixed(2)}s" fill="freeze"/>
    <animate attributeName="opacity" values="1;0" keyTimes="0;0.5" calcMode="discrete" dur="1s" begin="${(base + typeDur).toFixed(2)}s" repeatCount="${isLast ? "indefinite" : "2"}"${isLast ? "" : ' fill="freeze"'}/>
  </rect>`);

    y += LH * 2; // wiersz polecenia + pusty wiersz

    const reveal = base + typeDur + 0.12;
    sec.items.forEach((it, ii) => {
      const b = (reveal + Math.min(ii, 20) * 0.012).toFixed(2);
      const fade = `<animate attributeName="opacity" values="0;1" dur="0.3s" begin="${b}s" fill="freeze"/>`;

      if (it.k === "blank") { y += LH; return; }

      if (it.k === "ecg") { out.push(ecgBlock(y - 12, t, reveal + 0.2)); y += ECG_H + 4; return; }

      if (it.k === "kv") {
        out.push(`  <g opacity="0">${fade}<text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${FS}" fill="${t.dim}">${esc(it.label)}</text><text x="${(PAD + 13 * CW).toFixed(1)}" y="${y}" font-family="${MONO}" font-size="${FS}" fill="${it.accent ? t.accent : t.fg}"${it.accent ? ' font-weight="600"' : ""}>${esc(it.value)}</text></g>`);
        y += LH; return;
      }

      if (it.k === "count") {
        out.push(`  <g opacity="0">${fade}<text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${FS}" fill="${t.dim}">${esc(it.label)}</text><text x="${RIGHT}" y="${y}" font-family="${MONO}" font-size="${FS}" font-weight="600" fill="${t.fg}" text-anchor="end">${esc(it.value)}</text></g>`);
        y += LH; return;
      }

      if (it.k === "bar") {
        const bx = PAD + 13 * CW, bw = 300;
        const grow = (reveal + 0.25).toFixed(2);
        out.push(`  <g opacity="0">${fade}<text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${FS}" fill="${t.fg}">${esc(it.name)}</text>
    <rect x="${bx.toFixed(1)}" y="${y - 8}" width="${bw}" height="8" rx="4" fill="${t.track}"/>
    <rect x="${bx.toFixed(1)}" y="${y - 8}" width="0" height="8" rx="4" fill="${it.color || t.accent}"><animate attributeName="width" values="0;${((it.pct / 100) * bw).toFixed(1)}" dur="0.9s" begin="${grow}s" fill="freeze"/></rect>
    <text x="${RIGHT}" y="${y}" font-family="${MONO}" font-size="${FS}" fill="${t.dim}" text-anchor="end">${it.pct.toFixed(1)}%</text></g>`);
        y += LH; return;
      }

      if (it.k === "proj") {
        out.push(`  <g opacity="0">${fade}<text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${FS}" xml:space="preserve"><tspan fill="${t.dim}">${esc(it.mode)}</tspan><tspan fill="${t.fg}">   </tspan><tspan fill="${t.accent}" font-weight="600">${esc(it.name)}</tspan></text><text x="${RIGHT}" y="${y}" font-family="${MONO}" font-size="${FS}" fill="${it.vis === "public" ? t.prompt : t.dim}" text-anchor="end">${esc(it.vis)}</text></g>`);
        y += LH; return;
      }

      if (it.k === "json") {
        out.push(`  <g opacity="0">${fade}<text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${FS}" xml:space="preserve">${jsonSpans(it.line, t)}</text></g>`);
        y += LH; return;
      }

      out.push(`  <g opacity="0">${fade}<text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${FS}" fill="${t[it.tok]}" xml:space="preserve">${esc(it.line)}</text></g>`);
      y += LH;
    });

    y += LH; // odstęp między sekcjami
  });

  const H = y + 10;
  const body = out.join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escAttr("Terminal session: nikodem@automee — AI Automation Engineer")}">
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>
  <path d="M1,11 a10,10 0 0 1 10,-10 h${W - 22} a10,10 0 0 1 10,10 v${CHROME - 11} h-${W - 2} z" fill="${t.chrome}"/>
  <line x1="1" y1="${CHROME}" x2="${W - 1}" y2="${CHROME}" stroke="${t.border}" stroke-width="1"/>
  <g opacity="0.85">
    <circle cx="22" cy="17" r="4.6" fill="#f0625b"/><circle cx="39" cy="17" r="4.6" fill="#f5be4f"/><circle cx="56" cy="17" r="4.6" fill="#4fc76a"/>
  </g>
  <text x="${W / 2}" y="21" text-anchor="middle" font-family="${MONO}" font-size="10.5" fill="${t.dim}">nikodem@automee: ~</text>
${body}
</svg>
`;
}

function jsonSpans(line, t) {
  const parts = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|([{}\[\],])|(\s+)/g;
  let m;
  while ((m = re.exec(line))) {
    if (m[1] !== undefined) parts.push([m[2] ? t.key : t.str, m[1] + (m[2] || "")]);
    else if (m[3] !== undefined) parts.push([t.punct, m[3]]);
    else parts.push([t.punct, m[4]]);
  }
  return parts.map(([fill, s]) => `<tspan fill="${fill}">${esc(s)}</tspan>`).join("");
}

/* ───────────────────────────────────────────────── tekstowe odbicie */

function plain(session) {
  const lines = [];
  for (const sec of session) {
    lines.push(`$ ${sec.cmd}`, "");
    for (const it of sec.items) {
      if (it.k === "blank") lines.push("");
      else if (it.k === "ecg") continue;
      else if (it.k === "kv") lines.push(it.label.padEnd(13) + it.value);
      else if (it.k === "count") lines.push("  " + it.label.padEnd(28) + String(it.value).padStart(6));
      else if (it.k === "bar") lines.push("  " + it.name.padEnd(13) + `${it.pct.toFixed(1)}%`.padStart(6));
      else if (it.k === "proj") lines.push(`${it.mode}   ${it.name.padEnd(24)}${it.vis}`);
      else lines.push(it.line);
    }
    lines.push("");
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ───────────────────────────────────────────────── zapis */

const data = await collect();
const session = buildSession(data);

mkdirSync("assets", { recursive: true });
for (const t of THEMES) writeFileSync(`assets/terminal${t.suffix}.svg`, render(session, t));

const A = "<!-- session:begin -->";
const B = "<!-- session:end -->";
const readme = readFileSync("README.md", "utf8");
const a = readme.indexOf(A), b = readme.indexOf(B);
if (a === -1 || b === -1) {
  console.error(`BŁĄD: brak znaczników ${A} / ${B} w README.md`);
  process.exit(1);
}
const mirror = `${A}\n\n<details>\n<summary>Read the session as text</summary>\n\n\`\`\`console\n${plain(session)}\n\`\`\`\n\n</details>\n\n`;
writeFileSync("README.md", readme.slice(0, a) + mirror + readme.slice(b));

const svg = render(session, THEMES[0]);
const h = svg.match(/viewBox="0 0 \d+ (\d+)"/)[1];
console.log(`OK  terminal.svg + terminal-light.svg  (${W}×${h}, ${(svg.length / 1024).toFixed(1)} KB)`);
console.log(`    ${data.langs.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", ")}`);
console.log(`    tekstowe odbicie sesji wstrzykniete do README.md`);
