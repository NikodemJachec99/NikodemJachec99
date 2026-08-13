/**
 * Generuje assets/stats.svg i assets/langs.svg z danych GitHub GraphQL.
 *
 * Powód istnienia: publiczna instancja github-readme-stats regularnie zwraca 503,
 * co zamienia karty na profilu w połamane obrazki. Te SVG leżą w repo, więc
 * ładują się zawsze — odświeża je workflow na tym samym harmonogramie co węża.
 *
 * Użycie: GITHUB_TOKEN=... LOGIN=NikodemJachec99 node scripts/gen-stats.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";

const TOKEN = process.env.GITHUB_TOKEN;
const LOGIN = process.env.LOGIN || "NikodemJachec99";
if (!TOKEN) {
  console.error("Brak GITHUB_TOKEN w środowisku.");
  process.exit(1);
}

// Paleta zgodna z assets/header.svg (GitHub dark).
const C = {
  bg: "#0d1117",
  border: "#30363d",
  accent: "#58a6ff",
  text: "#e6edf3",
  muted: "#8b949e",
  track: "#21262d",
};

const MONO = "ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
  // jeden notebook potrafi przebić cały resztę repozytoriów. Liczenie ich
  // zniekształcałoby wykres, więc wypadają.
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
      color: colors.get(name) || C.accent,
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

function card(inner, w = 480, h = 220, title, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="10" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <text x="24" y="38" font-family="${MONO}" font-size="15" font-weight="600" fill="${C.accent}">${esc(title)}</text>
  <line x1="24" y1="52" x2="${w - 24}" y2="52" stroke="${C.border}" stroke-width="1"/>
${inner}
</svg>
`;
}

function statsSvg(d) {
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

  const startY = 82 + Math.max(0, 6 - rows.length) * 11;
  const inner = rows
    .map(([label, value], i) => {
      const y = startY + i * 23;
      const delay = (0.15 + i * 0.09).toFixed(2);
      return `  <g opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.45s" begin="${delay}s" fill="freeze"/>
    <text x="24" y="${y}" font-family="${MONO}" font-size="13" fill="${C.muted}">${esc(label)}</text>
    <text x="456" y="${y}" font-family="${MONO}" font-size="13" font-weight="600" fill="${C.text}" text-anchor="end">${esc(value)}</text>
  </g>`;
    })
    .join("\n");
  return card(inner, 480, 220, "GitHub Stats", `GitHub statistics for ${LOGIN}`);
}

function langsSvg(d) {
  const X = 24;
  const W = 432;
  let cx = X;

  const bar = d.langs
    .map((l) => {
      const w = Math.max((l.pct / 100) * W, 2);
      const seg = `  <rect x="${cx.toFixed(1)}" y="72" width="${w.toFixed(1)}" height="11" fill="${l.color}"/>`;
      cx += w;
      return seg;
    })
    .join("\n");

  const legend = d.langs
    .map((l, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = X + col * 218;
      const y = 116 + row * 26;
      const delay = (0.5 + i * 0.08).toFixed(2);
      return `  <g opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.4s" begin="${delay}s" fill="freeze"/>
    <circle cx="${x + 5}" cy="${y - 4}" r="5" fill="${l.color}"/>
    <text x="${x + 18}" y="${y}" font-family="${MONO}" font-size="13" fill="${C.text}">${esc(l.name)}</text>
    <text x="${x + 196}" y="${y}" font-family="${MONO}" font-size="13" fill="${C.muted}" text-anchor="end">${l.pct.toFixed(1)}%</text>
  </g>`;
    })
    .join("\n");

  const inner = `  <defs>
    <clipPath id="grow"><rect x="${X}" y="72" width="0" height="11" rx="5.5">
      <animate attributeName="width" values="0;${W}" dur="1s" begin="0.2s" fill="freeze"/>
    </rect></clipPath>
    <clipPath id="round"><rect x="${X}" y="72" width="${W}" height="11" rx="5.5"/></clipPath>
  </defs>
  <rect x="${X}" y="72" width="${W}" height="11" rx="5.5" fill="${C.track}"/>
  <g clip-path="url(#round)"><g clip-path="url(#grow)">
${bar}
  </g></g>
${legend}`;

  return card(inner, 480, 220, "Most Used Languages", `Most used languages for ${LOGIN}`);
}

const data = await collect();
mkdirSync("assets", { recursive: true });
writeFileSync("assets/stats.svg", statsSvg(data));
writeFileSync("assets/langs.svg", langsSvg(data));

console.log(
  `OK  commits=${data.commits} prs=${data.prs} issues=${data.issues} ` +
    `stars=${data.stars} repos=${data.repos} followers=${data.followers}`
);
console.log("    " + data.langs.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", "));
