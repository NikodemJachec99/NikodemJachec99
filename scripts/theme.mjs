/**
 * Jedyne źródło prawdy dla wyglądu paneli.
 *
 * Wcześniej gen-ui.mjs i gen-stats.mjs trzymały własne kopie palety, te same
 * kolory pod innymi nazwami (fg/text, dim/muted) — i już zdążyły się rozjechać:
 * linia pod nagłówkiem panelu była #21262d w jednych plikach, a #30363d
 * w innych. Wszystko, co wspólne, mieszka teraz tutaj.
 */

export const MONO =
  "ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace";

/** Lewy margines tekstu we wszystkich panelach — prompty `$` mają tworzyć jedną kolumnę. */
export const PAD = 32;

/**
 * Panele renderują się przez `width="100%"` na kolumnie ~880 px, więc rozmiar
 * na ekranie = font-size × (880 / 1000). Wartość 15.5 daje ~13.6 px, czyli
 * dokładnie tyle, ile GitHub renderuje bloki ```console wciśnięte pomiędzy nie.
 */
export const TYPE = {
  body: 15.5, // hero i paski komend
  dense: 15, // stack.json — najdłuższy wiersz nie zmieściłby się przy 15.5
  card: 15, // karty statystyk (płótno 480, nie 1000)
  chrome: 13, // pasek tytułu okna
  meta: 11, // podpis pod EKG
};

/** Szerokość znaku w foncie o stałej szerokości, w em. */
export const CW_EM = 0.6;

export const dark = {
  name: "dark",
  suffix: "",
  // #161b22 to powierzchnia, którą GitHub maluje bloki kodu w ciemnym motywie —
  // panel hero i blok ```console pod nim mają czytać się jako jedno okno.
  bg: "#161b22",
  chrome: "#21262d",
  border: "#30363d",
  rule: "#21262d",
  track: "#21262d",
  fg: "#e6edf3",
  dim: "#8b949e",
  prompt: "#3fb950",
  accent: "#58a6ff",
  key: "#79c0ff",
  str: "#a5d6ff",
  punct: "#6e7681",
  ecg: "#f85149",
  ecgBase: 0.18,
};

export const light = {
  name: "light",
  suffix: "-light",
  // #f6f8fa to dokładnie tło bloków kodu GitHuba w jasnym motywie — panele
  // i bloki ```console mają wyglądać jak jedna powierzchnia, nie jak paski.
  bg: "#f6f8fa",
  chrome: "#eaeef2",
  border: "#d1d9e0",
  rule: "#d8dee4",
  track: "#eaeef2",
  fg: "#1f2328",
  dim: "#59636e",
  prompt: "#1a7f37",
  accent: "#0969da",
  key: "#0550ae",
  str: "#0a3069",
  punct: "#6e7781",
  // #f85149 ma na białym kontrast ~2.4:1, a ślad bazowy przy 0.18 znika zupełnie.
  ecg: "#cf222e",
  ecgBase: 0.35,
};

export const THEMES = [dark, light];

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Wartości atrybutów wymagają dodatkowo cudzysłowów. */
export const escAttr = (s) => esc(s).replace(/"/g, "&quot;");
