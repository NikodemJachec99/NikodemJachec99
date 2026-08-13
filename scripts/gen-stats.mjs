/**
 * Generuje karty statystyk z danych GitHub GraphQL, po dwa warianty każdej:
 *
 *   assets/stats.svg   assets/stats-light.svg
 *   assets/langs.svg   assets/langs-light.svg
 *
 * Powód istnienia: publiczna instancja github-readme-stats regularnie zwraca
 * 503, co zamienia karty na profilu w połamane obrazki. Te SVG leżą w repo,
 * więc ładują się zawsze — odświeża je workflow co 12 h.
 *
 * Oba warianty powstają z jednego pobrania danych. Osobne wywołania per motyw
 * oznaczałyby dwa zapytania do API, których wyniki mogłyby się różnić.
 *
 * Użycie: GITHUB_TOKEN=... LOGIN=NikodemJachec99 node scripts/gen-stats.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { MONO, TYPE, THEMES, esc, escAttr } from "./theme.mjs";

const TOKEN = process.env.GITHUB_TOKEN;
const LOGIN = process.env.LOGIN || "NikodemJachec99";
if (!TOKEN) {
  console.error("Brak GITHUB_TOKEN w środowisku.");
  process.exit(1);
}

const W = 480;
const H = 220;
const PAD = 24; // karty mają własne płótno 480 i siedzą w wyśrodkowanym divie,
//                 więc nie należą do kolumny promptów wyznaczonej przez theme.PAD

async function gql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "profile-stats-generator",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data;
}

// privacy: PUBLIC celowo — dzięki temu wynik jest identyczny lokalnie
// (token użytkownika) i w Actions (GITHUB_TOKEN), więc liczby nie skaczą.
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
      first: 100
      after: $cursor
      ownerAffiliations: OWNER
      privacy: PUBLIC
      isFork: false
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
  let cursor = null;
  let user = null;
  const repos = [];
  do {
    const data = await gql(QUERY, { login: LOGIN, cursor });
    user = data.user;
    repos.push(...user.repositories.nodes);
    cursor = user.repositories.pageInfo.hasNextPage
      ? user.repositories.pageInfo.endCursor
      : null;
  } while (cursor);

  const stars = repos.reduce((a, r) => a + r.stargazerCount, 0);

  // Notebooki zapisują wyjścia komórek (obrazy w base64) wewnątrz pliku, więc
  // ich rozmiar w bajtach nie ma nic wspólnego z ilością napisanego kodu —
  // jeden notebook potrafi przebić resztę repozytoriów razem wziętą.
  const EXCLUDED = new Set(["Jupyter Notebook"]);

  const bytes = new Map();
  const colors = new Map();
  for (const r of repos) {
    for (const e of r.languages.edges) {
      if (EXCLUDED.has(e.node.name)) continue;
      bytes.set(e.node.name, (bytes.get(e.node.name) || 0) + e.size);
      if (e.node.color) colors.set(e.node.name, e.node.color);
    }
  }
  const total = [...bytes.values()].reduce((a, b) => a + b, 0) || 1;
  const langs = [...bytes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, size]) => ({
      name,
      pct: (size / total) * 100,
      color: colors.get(name) || "#58a6ff",
    }));

  const cc = user.contributionsCollection;
  return {
    contributions: cc.contributionCalendar.totalContributions,
    commits: cc.totalCommitContributions,
    prs: cc.totalPullRequestContributions,
    issues: cc.totalIssueContributions,
    stars,
    repos: user.repositories.totalCount,
    followers: user.followers.totalCount,
    languages: bytes.size,
    langs,
  };
}

function card(inner, title, label, t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escAttr(label)}">
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>
  <text x="${PAD}" y="38" font-family="${MONO}" font-size="15" font-weight="600" fill="${t.accent}">${esc(title)}</text>
  <line x1="${PAD}" y1="52" x2="${W - PAD}" y2="52" stroke="${t.rule}" stroke-width="1"/>
${inner}
</svg>
`;
}

function statsSvg(d, t) {
  const LH = 26;
  // Wiersze o wartości 0 są pomijane — "Stars earned: 0" na profilu szkodzi
  // bardziej, niż pomaga. Pojawią się same, gdy będzie co pokazać.
  const rows = [
    ["Contributions (last year)", d.contributions],
    ["Commits (last year)", d.commits],
    ["Public repos", d.repos],
    ["Languages used", d.languages],
    ["Pull requests", d.prs],
    ["Issues opened", d.issues],
    ["Stars earned", d.stars],
    ["Followers", d.followers],
  ].filter(([, v]) => v > 0);

  const startY = 52 + (H - 52 - (rows.length - 1) * LH) / 2 + 6;
  const inner = rows
    .map(([label, value], i) => {
      const y = startY + i * LH;
      const begin = (0.15 + i * 0.09).toFixed(2);
      return `  <g opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.45s" begin="${begin}s" fill="freeze"/>
    <text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${TYPE.card}" fill="${t.dim}">${esc(label)}</text>
    <text x="${W - PAD}" y="${y}" font-family="${MONO}" font-size="${TYPE.card}" font-weight="600" fill="${t.fg}" text-anchor="end">${esc(value)}</text>
  </g>`;
    })
    .join("\n");

  return card(inner, "GitHub Stats", `GitHub statistics for ${LOGIN}`, t);
}

function langsSvg(d, t) {
  const BAR_W = W - PAD * 2; // 432 — kończy się dokładnie tam, gdzie linia nagłówka
  const COL = 232;
  let cx = PAD;

  const bar = d.langs
    .map((l) => {
      const w = Math.max((l.pct / 100) * BAR_W, 2);
      const seg = `  <rect x="${cx.toFixed(1)}" y="84" width="${w.toFixed(1)}" height="11" fill="${l.color}"/>`;
      cx += w;
      return seg;
    })
    .join("\n");

  const legend = d.langs
    .map((l, i) => {
      const x = PAD + (i % 2) * COL;
      const y = 128 + Math.floor(i / 2) * 28;
      const begin = (0.5 + i * 0.08).toFixed(2);
      return `  <g opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.4s" begin="${begin}s" fill="freeze"/>
    <circle cx="${x + 4}" cy="${y - 5}" r="4" fill="${l.color}"/>
    <text x="${x + 18}" y="${y}" font-family="${MONO}" font-size="${TYPE.card}" fill="${t.fg}">${esc(l.name)}</text>
    <text x="${x + 200}" y="${y}" font-family="${MONO}" font-size="${TYPE.card}" fill="${t.dim}" text-anchor="end">${l.pct.toFixed(1)}%</text>
  </g>`;
    })
    .join("\n");

  const inner = `  <defs>
    <clipPath id="grow"><rect x="${PAD}" y="84" width="0" height="11" rx="5.5">
      <animate attributeName="width" values="0;${BAR_W}" dur="1s" begin="0.2s" fill="freeze"/>
    </rect></clipPath>
    <clipPath id="round"><rect x="${PAD}" y="84" width="${BAR_W}" height="11" rx="5.5"/></clipPath>
  </defs>
  <rect x="${PAD}" y="84" width="${BAR_W}" height="11" rx="5.5" fill="${t.track}"/>
  <g clip-path="url(#round)"><g clip-path="url(#grow)">
${bar}
  </g></g>
${legend}`;

  return card(inner, "Most Used Languages", `Most used languages for ${LOGIN}`, t);
}

const data = await collect();
mkdirSync("assets", { recursive: true });
for (const t of THEMES) {
  writeFileSync(`assets/stats${t.suffix}.svg`, statsSvg(data, t));
  writeFileSync(`assets/langs${t.suffix}.svg`, langsSvg(data, t));
}

console.log(
  `OK  contributions=${data.contributions} commits=${data.commits} repos=${data.repos} ` +
    `languages=${data.languages} prs=${data.prs} issues=${data.issues} stars=${data.stars} followers=${data.followers}`
);
console.log("    " + data.langs.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", "));
