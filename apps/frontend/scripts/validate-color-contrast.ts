type ContrastTest = {
  name: string;
  bg: string; // CSS color token (e.g. hsl(var(--background)))
  fg: string; // CSS color token (e.g. hsl(var(--foreground)))
  min: number;
};

type Rgb = { r: number; g: number; b: number };

const GLOBALS_CSS_PATH = new URL("../app/globals.css", import.meta.url);

function readFileText(url: URL): string {
  const fs = require("fs") as typeof import("fs");
  return fs.readFileSync(url, "utf-8");
}

function extractCssVarBlock(content: string, selector: ":root" | ".dark") {
  const startIdx = content.indexOf(`${selector} {`);
  if (startIdx === -1) return "";
  const afterStart = content.slice(startIdx);
  const openIdx = afterStart.indexOf("{");
  if (openIdx === -1) return "";
  const body = afterStart.slice(openIdx + 1);
  const closeIdx = body.indexOf("}");
  if (closeIdx === -1) return "";
  return body.slice(0, closeIdx);
}

function parseCssVars(block: string): Record<string, string> {
  const vars: Record<string, string> = {};
  block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("--") && l.includes(":"))
    .forEach((line) => {
      const cleaned = line.replace(/;$/, "");
      const idx = cleaned.indexOf(":");
      const name = cleaned.slice(0, idx).trim();
      const value = cleaned.slice(idx + 1).trim();
      vars[name] = value;
    });
  return vars;
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const S = s / 100;
  const L = l / 100;
  const C = (1 - Math.abs(2 * L - 1)) * S;
  const hh = (h % 360) / 60;
  const X = C * (1 - Math.abs((hh % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hh >= 0 && hh < 1) [r1, g1, b1] = [C, X, 0];
  else if (hh >= 1 && hh < 2) [r1, g1, b1] = [X, C, 0];
  else if (hh >= 2 && hh < 3) [r1, g1, b1] = [0, C, X];
  else if (hh >= 3 && hh < 4) [r1, g1, b1] = [0, X, C];
  else if (hh >= 4 && hh < 5) [r1, g1, b1] = [X, 0, C];
  else if (hh >= 5 && hh < 6) [r1, g1, b1] = [C, 0, X];

  const m = L - C / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function parseHslTriplet(value: string) {
  // Expected format: "199 89% 48%"
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;
  const h = Number(parts[0]);
  const s = Number(parts[1].replace("%", ""));
  const l = Number(parts[2].replace("%", ""));
  if ([h, s, l].some((n) => Number.isNaN(n))) return null;
  return { h, s, l };
}

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const value = parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function resolveToRgb(color: string, vars: Record<string, string>): Rgb {
  const trimmed = color.trim();
  if (trimmed === "white") return { r: 255, g: 255, b: 255 };
  if (trimmed === "black") return { r: 0, g: 0, b: 0 };
  if (trimmed.startsWith("#")) return hexToRgb(trimmed);

  // color-mix(in srgb, <color1> <p1>%, <color2> <p2>%)
  // Example from tokens: color-mix(in srgb, hsl(var(--primary)) 75%, black 25%)
  const mixMatch = trimmed.match(
    /^color-mix\(in\s+srgb,\s*(.+)\s+(\d+(?:\.\d+)?)%\s*,\s*(.+)\s+(\d+(?:\.\d+)?)%\s*\)$/,
  );
  if (mixMatch) {
    const c1 = mixMatch[1].trim();
    const p1 = Number(mixMatch[2]);
    const c2 = mixMatch[3].trim();
    const p2 = Number(mixMatch[4]);
    const rgb1 = resolveToRgb(c1, vars);
    const rgb2 = resolveToRgb(c2, vars);

    const w1 = p1 / 100;
    const w2 = p2 / 100;
    const total = w1 + w2;
    const a = total === 0 ? 0.5 : w1 / total;
    const b = total === 0 ? 0.5 : w2 / total;

    return {
      r: Math.round(rgb1.r * a + rgb2.r * b),
      g: Math.round(rgb1.g * a + rgb2.g * b),
      b: Math.round(rgb1.b * a + rgb2.b * b),
    };
  }

  const hslVarMatch = trimmed.match(/^hsl\(var\((--[^)]+)\)\)$/);
  if (hslVarMatch) {
    const varName = hslVarMatch[1];
    const raw = vars[varName];
    if (!raw) throw new Error(`CSS var ${varName} not found in globals.css`);
    const triplet = parseHslTriplet(raw);
    if (!triplet)
      throw new Error(`CSS var ${varName} has unsupported value: ${raw}`);
    return hslToRgb(triplet.h, triplet.s, triplet.l);
  }

  // If it's a plain var name (e.g. "--background"), support it too.
  if (trimmed.startsWith("--") && vars[trimmed]) {
    const triplet = parseHslTriplet(vars[trimmed]);
    if (!triplet)
      throw new Error(
        `CSS var ${trimmed} has unsupported value: ${vars[trimmed]}`,
      );
    return hslToRgb(triplet.h, triplet.s, triplet.l);
  }

  throw new Error(`Unsupported color format for contrast check: ${trimmed}`);
}

function tokenScale(
  baseVar: string,
  amount: number,
  target: "white" | "black",
) {
  // Mirrors styles/design-tokens.ts: mixWith(baseVar, target, amount)
  return `color-mix(in srgb, hsl(var(${baseVar})) ${100 - amount}%, ${target} ${amount}%)`;
}

function srgbToLinear(channel: number) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb: Rgb) {
  const { r, g, b } = rgb;
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(color1: Rgb, color2: Rgb) {
  const L1 = relativeLuminance(color1);
  const L2 = relativeLuminance(color2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const contrastTests: ContrastTest[] = [
  // Base body tokens
  {
    name: "Body primary",
    bg: "hsl(var(--background))",
    fg: "hsl(var(--foreground))",
    min: 7,
  },
  {
    name: "Body secondary",
    bg: "hsl(var(--background))",
    fg: "hsl(var(--muted-foreground))",
    min: 4.5,
  },
  // Buttons (match actual component classes)
  // button.tsx default: bg-primary-700 text-white
  {
    name: "Primary button (bg-primary-700/text-white)",
    bg: tokenScale("--primary", 25, "black"),
    fg: "white",
    min: 4.5,
  },
  // button.tsx secondary: bg-secondary-600 text-white
  {
    name: "Secondary button (bg-secondary-600/text-white)",
    bg: tokenScale("--secondary", 15, "black"),
    fg: "white",
    min: 4.5,
  },
  // button.tsx destructive: bg-error-600 text-white
  {
    name: "Error button (bg-error-600/text-white)",
    bg: tokenScale("--error", 15, "black"),
    fg: "white",
    min: 4.5,
  },
  {
    name: "Warning button",
    bg: "hsl(var(--warning))",
    fg: "hsl(var(--warning-foreground))",
    min: 4.5,
  },
  // button.tsx success: bg-success-800 text-white
  {
    name: "Success button (bg-success-800/text-white)",
    bg: tokenScale("--success", 35, "black"),
    fg: "white",
    min: 4.5,
  },
];

function runForTheme(theme: "light" | "dark") {
  const css = readFileText(GLOBALS_CSS_PATH);
  const rootVars = parseCssVars(extractCssVarBlock(css, ":root"));
  const darkVars = parseCssVars(extractCssVarBlock(css, ".dark"));
  const vars = theme === "dark" ? { ...rootVars, ...darkVars } : rootVars;

  let failed = 0;
  console.log(`\n🔎 WCAG Contrast Checks (${theme})\n`);

  contrastTests.forEach((test) => {
    const bgRgb = resolveToRgb(test.bg, vars);
    const fgRgb = resolveToRgb(test.fg, vars);
    const ratio = contrastRatio(bgRgb, fgRgb);
    const ok = ratio >= test.min;
    if (!ok) failed += 1;
    const status = ok ? "✅" : "❌";
    console.log(
      `${status} ${test.name}: ${ratio.toFixed(2)}:1 (min ${test.min})`,
    );
  });

  return failed;
}

const failedLight = runForTheme("light");
const failedDark = runForTheme("dark");
const failedTotal = failedLight + failedDark;

if (failedTotal > 0) {
  console.error(
    `\n${failedTotal} contraste(s) abaixo do mínimo (somando light+dark).`,
  );
  process.exit(1);
}

console.log("\n✅ Todos os contrastes atendem WCAG AA.\n");
