/**
 * Identificador estável (não-PII) do dispositivo/navegador.
 * Usado apenas para impedir que a mesma máquina crie várias contas
 * só para coletar amostras grátis. Não identifica a pessoa.
 */
const STORAGE_KEY = "dm_device_id";

function hash(input: string): string {
  // FNV-1a 32 bits — suficiente para agrupar dispositivos.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function fingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  const nav = window.navigator;
  const parts = [
    nav.userAgent,
    nav.language,
    (nav.languages ?? []).join(","),
    String(nav.hardwareConcurrency ?? ""),
    String((nav as Navigator & { deviceMemory?: number }).deviceMemory ?? ""),
    `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    String(new Date().getTimezoneOffset()),
  ];
  return hash(parts.join("|"));
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const id = fingerprint();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage indisponível (modo privado): usa só o fingerprint.
    return fingerprint();
  }
}
