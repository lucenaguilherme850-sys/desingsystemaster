/**
 * Heurística de bloqueio para provedores de e-mail descartável conhecidos.
 *
 * Limitação: isso não revela a idade de uma caixa Gmail/Outlook nem é uma
 * lista exaustiva. A confirmação do provedor de autenticação continua obrigatória.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "33mail.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "maildrop.cc",
  "mailinator.com",
  "mailinator.net",
  "mailnesia.com",
  "mintemail.com",
  "mohmal.com",
  "mytemp.email",
  "sharklasers.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "dispostable.com",
  "fakeinbox.com",
  "emailondeck.com",
  "burnermail.io",
  "inboxkitten.com",
]);

export function isDisposableEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(normalized.slice(at + 1));
}
