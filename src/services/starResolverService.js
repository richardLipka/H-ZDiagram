/**
 * Star Resolver Service
 * Resolves stars by name or catalogue designation (HD, HIP, Gliese, Bayer, etc.)
 * via CDS Sesame (SIMBAD/VizieR), extracting astrometric and photometric parameters,
 * and deriving fundamental astrophysical properties (Teff, L, R, Mass).
 */

import { MAMAJEK_DWARF_SEQUENCE } from '../simulation/mainSequence';
import { M_BOL_SUN, radiusFromLumTemp, msLuminosity } from '../simulation/physics';

// Flower (1996) BC_V(log Teff), coefficients as corrected by Torres (2010), Table 1
const FLOWER_BC = [
  [-0.190537291496456e5, 0.155144866764412e5, -0.421278819301717e4, 0.381476328422343e3],
  [-0.370510203809015e5, 0.385672629965804e5, -0.150651486316025e5, 0.261724637119416e4, -0.170623810323864e3],
  [-0.118115450538963e6, 0.137145973583929e6, -0.636233812100225e5, 0.147412923562646e5, -0.170587278406872e4, 0.788731721804990e2]
];

// Flower (1996) log Teff(B−V), Torres (2010) Table 2
const FLOWER_TEFF_MS_GIANT = [
  3.979145106714099, -0.654992268598245, 1.740690042385095, -4.608815154057166,
  6.792599779944473, -5.396909891322525, 2.192970376522490, -0.359495739295671
];
const FLOWER_TEFF_SUPERGIANT = [
  4.012559732366214, -1.055043117465989, 2.133394538571825, -2.459769794654992,
  1.349423943497744, -0.283942579112032
];

const poly = (c, x) => c.reduce((s, a, i) => s + a * x ** i, 0);

function flowerBC(teff) {
  const x = Math.log10(teff);
  const coeffs = x < 3.7 ? FLOWER_BC[0] : x < 3.9 ? FLOWER_BC[1] : FLOWER_BC[2];
  return poly(coeffs, x);
}

function flowerTeff(bv, isSupergiant = false) {
  const clamped = Math.min(1.65, Math.max(-0.3, bv));
  const coeffs = isSupergiant ? FLOWER_TEFF_SUPERGIANT : FLOWER_TEFF_MS_GIANT;
  return 10 ** poly(coeffs, clamped);
}

/** Parse spectral classification into spectral letter, subtype, and luminosity class. */
export function parseSpectralClassification(spect) {
  const s = (spect || '').trim();
  if (/^D[ABOQZCX]?/i.test(s)) {
    return { letter: 'D', sub: 5, lumClass: 'D', raw: s };
  }
  const m = /([OBAFGKM])(\d(?:\.\d+)?)?/i.exec(s);
  if (!m) {
    const first = s.charAt(0).toUpperCase();
    return { letter: 'OBAFGKM'.includes(first) ? first : 'G', sub: 2, lumClass: 'V', raw: s };
  }
  const letter = m[1].toUpperCase();
  const sub = m[2] !== undefined ? parseFloat(m[2]) : 5;
  const rest = s.slice(m.index + m[0].length);
  const lcMatch = /(Ia0|Iab|Ia|Ib|III|II|IV|VI|V|I)/i.exec(rest);
  let lumClass = 'V';
  if (lcMatch) {
    const v = lcMatch[1].toUpperCase();
    lumClass = v.startsWith('I') && !['II', 'III', 'IV'].includes(v) ? 'I' : v === 'VI' ? 'V' : v;
  }
  if (/^sd/i.test(s)) lumClass = 'V';
  return { letter, sub, lumClass, raw: s };
}

/** Interpolate dwarf sequence properties from spectral type letter and sub. */
function dwarfPropertiesFromSpectral(letter, sub) {
  const codeLetters = 'OBAFGKM';
  const targetCode = codeLetters.indexOf(letter) * 10 + sub;

  // Find closest or interpolate in MAMAJEK_DWARF_SEQUENCE
  const seq = MAMAJEK_DWARF_SEQUENCE.map(([m, tK, logL, sp]) => {
    const parsed = parseSpectralClassification(sp);
    return {
      mass: m,
      temp: tK,
      lum: 10 ** logL,
      code: codeLetters.indexOf(parsed.letter) * 10 + parsed.sub
    };
  }).sort((a, b) => a.code - b.code);

  if (targetCode <= seq[0].code) return seq[0];
  if (targetCode >= seq[seq.length - 1].code) return seq[seq.length - 1];

  for (let i = 0; i < seq.length - 1; i++) {
    const a = seq[i];
    const b = seq[i + 1];
    if (targetCode >= a.code && targetCode <= b.code) {
      const frac = (targetCode - a.code) / (b.code - a.code || 1);
      return {
        mass: a.mass + frac * (b.mass - a.mass),
        temp: Math.round(a.temp + frac * (b.temp - a.temp)),
        lum: 10 ** (Math.log10(a.lum) + frac * (Math.log10(b.lum) - Math.log10(a.lum)))
      };
    }
  }
  return { mass: 1, temp: 5772, lum: 1 };
}

/**
 * Query CDS Sesame for a star designation and compute its physical properties.
 */
export async function resolveStarOnline(query) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) throw new Error('Query is empty');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const res = await fetch(`https://cds.unistra.fr/cgi-bin/nph-sesame/-oI/A?${encodeURIComponent(cleanQuery)}`, {
    signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`CDS Sesame returned HTTP ${res.status}`);
  }

  const text = await res.text();

  // Check if object was found
  if (text.includes('Nothing found') || text.includes('ERR:')) {
    throw new Error(`Object "${cleanQuery}" not found in astronomical databases`);
  }

  // Parse Sesame fields
  const idMatch = text.match(/%I\s+([^\n\r]+)/);
  const jMatch = text.match(/%J\s+([+\-\d.]+)\s+([+\-\d.]+)/);
  const sMatch = text.match(/%S\s+([^\n\r]+)/);
  const xMatch = text.match(/%X\s+([+\-\d.]+)/); // Parallax in mas
  const vMatch = text.match(/%M\.V\s+([+\-\d.]+)/); // V mag
  const bMatch = text.match(/%M\.B\s+([+\-\d.]+)/); // B mag
  const gMatch = text.match(/%M\.G\s+([+\-\d.]+)/); // Gaia G mag
  const cMatch = text.match(/%C(?:\.0)?\s+([^\n\r]+)/); // SIMBAD Object Type
  const hipMatch = text.match(/HIP\s*(\d+)/i);

  const primaryName = idMatch ? idMatch[1].trim() : cleanQuery;
  const rawSpectral = sMatch ? sMatch[1].trim() : 'G2V';
  const spectral = parseSpectralClassification(rawSpectral);
  const parallaxMas = xMatch ? parseFloat(xMatch[1]) : null;
  const vMag = vMatch ? parseFloat(vMatch[1]) : (gMatch ? parseFloat(gMatch[1]) : null);
  const bMag = bMatch ? parseFloat(bMatch[1]) : null;
  const ra = jMatch ? parseFloat(jMatch[1]) : null;
  const dec = jMatch ? parseFloat(jMatch[2]) : null;
  const simbadType = cMatch ? cMatch[1].trim() : '*';

  // Distance
  let distancePc = null;
  let distanceLy = null;
  if (parallaxMas && parallaxMas > 0.05) {
    distancePc = 1000 / parallaxMas;
    distanceLy = distancePc * 3.26156;
  }

  // Absolute magnitude
  let absMag = null;
  if (vMag !== null && distancePc) {
    absMag = vMag - 5 * Math.log10(distancePc / 10);
  }

  // Color B-V
  let bv = null;
  if (bMag !== null && vMag !== null) {
    bv = bMag - vMag;
  }

  // Effective temperature Teff
  let temp = null;
  const isSupergiant = spectral.lumClass === 'I';
  const isGiant = spectral.lumClass === 'III' || spectral.lumClass === 'II';

  if (bv !== null && bv >= -0.3 && bv <= 1.8 && spectral.letter !== 'M' && spectral.letter !== 'O') {
    temp = Math.round(flowerTeff(bv, isSupergiant));
  } else {
    const dwarf = dwarfPropertiesFromSpectral(spectral.letter, spectral.sub);
    temp = dwarf.temp;
    if (isGiant) {
      temp = Math.max(3000, Math.round(temp * 0.9));
    } else if (isSupergiant) {
      temp = Math.max(2800, Math.round(temp * 0.85));
    }
  }

  // Bolometric correction and Luminosity
  let lum = null;
  if (absMag !== null && temp) {
    const bc = flowerBC(temp);
    const mBol = absMag + bc;
    lum = 10 ** (-0.4 * (mBol - M_BOL_SUN));
  } else {
    // Fall back to dwarf sequence luminosity adjusted for class
    const dwarf = dwarfPropertiesFromSpectral(spectral.letter, spectral.sub);
    lum = dwarf.lum;
    if (isGiant) lum = Math.max(20, lum * 40);
    if (isSupergiant) lum = Math.max(500, lum * 1000);
  }

  // Ensure minimum physical sanity
  temp = Math.max(2000, Math.min(60000, temp || 5772));
  lum = Math.max(1e-6, Math.min(2e6, lum || 1));

  // Radius via Stefan-Boltzmann
  const radius = radiusFromLumTemp(lum, temp);

  // Approximate Mass
  let mass = null;
  if (spectral.lumClass === 'V') {
    const dwarf = dwarfPropertiesFromSpectral(spectral.letter, spectral.sub);
    mass = dwarf.mass;
  } else {
    mass = msLuminosity(lum) || 1.5;
  }

  const generatedId = `custom_${primaryName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now().toString(36)}`;

  return {
    id: generatedId,
    name: primaryName,
    rawDesignation: cleanQuery,
    spectralType: rawSpectral,
    spectralClass: spectral.letter,
    luminosityClass: spectral.lumClass,
    temp,
    lum,
    radius,
    mass: mass ? Number(mass.toFixed(2)) : null,
    absMag: absMag !== null ? Number(absMag.toFixed(2)) : null,
    vMag: vMag !== null ? Number(vMag.toFixed(2)) : null,
    bMag: bMag !== null ? Number(bMag.toFixed(2)) : null,
    parallaxMas: parallaxMas ? Number(parallaxMas.toFixed(3)) : null,
    distance_ly: distanceLy ? Math.round(distanceLy) : null,
    ra,
    dec,
    simbadType,
    hip: hipMatch ? parseInt(hipMatch[1], 10) : null,
    isCustom: true,
    dataSource: 'sesame_derived',
    notableFacts: `Resolved via CDS Sesame from SIMBAD/VizieR databases. Spectral type: ${rawSpectral}.`,
    notableFactsCs: `Získáno přes CDS Sesame z astronomických databází SIMBAD/VizieR. Spektrální typ: ${rawSpectral}.`,
    hasExoplanets: false,
    exoplanetCount: 0
  };
}
