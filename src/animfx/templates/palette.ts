export const PALETTES: Array<[string, string, string]> = [
  ["#00e5ff", "#0066ff", "#050914"],
  ["#ff00c8", "#ff5b00", "#0f0518"],
  ["#a4ff00", "#00c8b4", "#05140f"],
  ["#7a5cff", "#ff00a8", "#0a0518"],
  ["#ffcc00", "#ff6a00", "#140a05"],
  ["#ff3860", "#7a00ff", "#0a0a18"],
  ["#00ffb2", "#3ea3ff", "#04121a"],
  ["#ff9ecb", "#c964ff", "#12081a"],
];

export function palette(seed: number) {
  return PALETTES[Math.abs(seed) % PALETTES.length];
}

export function seedFromSlug(slug: string): { category: string; n: number } {
  const m = slug.match(/^([a-z0-9]+)-(\d+)-\d+$/);
  if (!m) return { category: slug, n: 1 };
  return { category: m[1], n: parseInt(m[2], 10) };
}