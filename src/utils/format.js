/**
 * Locale-aware number formatting (decimal comma and thin-space grouping in Czech).
 */
const locale = (lang) => (lang === 'cs' ? 'cs-CZ' : 'en-US');

/** Number with at most `digits` significant digits, e.g. 0.0017, 25.4, 126,000. */
export function formatSig(value, lang, digits = 3) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value !== 0 && (Math.abs(value) < 1e-4 || Math.abs(value) >= 1e9)) {
    const [mantissa, exp] = value.toExponential(digits - 1).split('e');
    const m = Number(mantissa).toLocaleString(locale(lang), { maximumSignificantDigits: digits });
    return `${m} × 10${toSuperscript(Number(exp))}`;
  }
  return value.toLocaleString(locale(lang), { maximumSignificantDigits: digits });
}

/** Integer with grouping, e.g. 5 772 K / 5,772 K. */
export function formatInt(value, lang) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return Math.round(value).toLocaleString(locale(lang));
}

/** Fixed number of decimals with the locale's decimal separator. */
export function formatFixed(value, lang, decimals) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return value.toLocaleString(locale(lang), { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Signed magnitude, e.g. +4.83 / −1.46 (true minus sign). */
export function formatMag(value, lang) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const abs = formatFixed(Math.abs(value), lang, 2);
  return value < 0 ? `−${abs}` : `+${abs}`;
}

const SUPERSCRIPTS = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function toSuperscript(n) {
  return String(n).split('').map((c) => SUPERSCRIPTS[c] || c).join('');
}
