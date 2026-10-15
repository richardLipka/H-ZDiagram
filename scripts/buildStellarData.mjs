/**
 * Builds every dataset in public/data/ from primary sources:
 *
 *  - HYG Stellar Database v3.8 (Nash 2023, CC BY-SA 4.0): names, V magnitudes,
 *    B−V colours, spectral types, proper motions.
 *  - Hipparcos new reduction (van Leeuwen 2007, VizieR I/311): parallaxes and
 *    parallax errors, used to keep only stars with σϖ/ϖ < 10 %.
 *  - NASA Exoplanet Archive (table pscomppars): confirmed planet counts.
 *  - Mamajek's "Modern Mean Dwarf Stellar Color and Effective Temperature
 *    Sequence" (Pecaut & Mamajek 2013, v2022.04.16): Teff, BC_V and M_V of dwarfs.
 *  - scripts/data/curated_stars.json: benchmark stars with literature values.
 *  - scripts/data/star_notes.json: notes for HYG stars, keyed by HIP number.
 *
 * Effective temperatures come from B−V via Flower (1996) as corrected by Torres
 * (2010) or, where B−V is unreliable (O/B stars, M dwarfs, missing colours), from
 * the spectral type via Mamajek's table. Luminosities are bolometric:
 * L/L☉ = 10^(−0.4 (M_V + BC_V − M_bol,☉)), with BC_V from Torres (2010) for giants
 * and supergiants (M_bol,☉ = 4.73) and from Mamajek's table for dwarfs
 * (M_bol,☉ = 4.74, IAU 2015 B2).
 *
 * Usage: node scripts/buildStellarData.mjs [--refresh]
 * Downloads are cached in scripts/.cache/ (git-ignored); --refresh re-downloads.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CACHE = path.join(__dirname, '.cache');
const OUT = path.join(ROOT, 'public', 'data');
const REFRESH = process.argv.includes('--refresh');

const SOURCES = {
  hyg: {
    file: 'hyg_v38.csv.gz',
    url: 'https://raw.githubusercontent.com/astronexus/HYG-Database/master/hyg/v3/hyg_v38.csv.gz'
  },
  hip2: {
    file: 'hip2_plx10.csv',
    url: 'https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync?REQUEST=doQuery&LANG=ADQL&FORMAT=csv&QUERY=' +
      encodeURIComponent('SELECT HIP, Plx, e_Plx FROM "I/311/hip2" WHERE Plx > 0 AND e_Plx < 0.2 * Plx')
  },
  nea: {
    file: 'nea_pscomppars.csv',
    url: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=' +
      encodeURIComponent('select hostname,hip_name,pl_name from pscomppars') + '&format=csv'
  },
  mamajek: {
    file: 'EEM_dwarf_UBVIJHK_colors_Teff.txt',
    url: 'https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt'
  }
};

const T_SUN = 5772; // IAU 2015 Resolution B3
const MBOL_SUN_IAU = 4.74; // IAU 2015 Resolution B2
const MBOL_SUN_FLOWER = 4.73; // Torres (2010), for the Flower (1996) BC_V scale

async function cached(key) {
  const { file, url } = SOURCES[key];
  const target = path.join(CACHE, file);
  if (REFRESH || !fs.existsSync(target)) {
    fs.mkdirSync(CACHE, { recursive: true });
    console.log(`Downloading ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
  }
  const buf = fs.readFileSync(target);
  return file.endsWith('.gz') ? zlib.gunzipSync(buf).toString('utf8') : buf.toString('utf8');
}

function parseCsv(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    const cols = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted;
      } else if (ch === ',' && !quoted) {
        cols.push(cur);
        cur = '';
      } else cur += ch;
    }
    cols.push(cur);
    rows.push(cols);
  }
  const [header, ...data] = rows;
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

// ---------------------------------------------------------------------------
// Calibrations
// ---------------------------------------------------------------------------

// Flower (1996) BC_V(log Teff), coefficients as corrected by Torres (2010), Table 1
const FLOWER_BC = [
  [-0.190537291496456e5, 0.155144866764412e5, -0.421278819301717e4, 0.381476328422343e3],
  [-0.370510203809015e5, 0.385672629965804e5, -0.150651486316025e5, 0.261724637119416e4, -0.170623810323864e3],
  [-0.118115450538963e6, 0.137145973583929e6, -0.636233812100225e5, 0.147412923562646e5, -0.170587278406872e4, 0.788731721804990e2]
];
// Flower (1996) log Teff(B−V), Torres (2010) Table 2
const FLOWER_TEFF_MS_GIANT = [3.979145106714099, -0.654992268598245, 1.740690042385095, -4.608815154057166,
  6.792599779944473, -5.396909891322525, 2.192970376522490, -0.359495739295671];
const FLOWER_TEFF_SUPERGIANT = [4.012559732366214, -1.055043117465989, 2.133394538571825, -2.459769794654992,
  1.349423943497744, -0.283942579112032];

const poly = (c, x) => c.reduce((s, a, i) => s + a * x ** i, 0);
const flowerBC = (teff) => {
  const x = Math.log10(teff);
  return poly(x < 3.7 ? FLOWER_BC[0] : x < 3.9 ? FLOWER_BC[1] : FLOWER_BC[2], x);
};
const flowerTeff = (bv, supergiant) =>
  10 ** (supergiant ? poly(FLOWER_TEFF_SUPERGIANT, Math.min(1.7, Math.max(-0.3, bv)))
    : poly(FLOWER_TEFF_MS_GIANT, Math.min(1.65, Math.max(-0.3, bv))));

const LETTERS = 'OBAFGKM';
const spCode = (letter, sub) => LETTERS.indexOf(letter) * 10 + sub;

function parseMamajek(text) {
  const rows = [];
  const seen = new Set();
  for (const line of text.split(/\r?\n/)) {
    const p = line.trim().split(/\s+/);
    const m = /^([OBAFGKM])(\d(?:\.\d+)?)V$/.exec(p[0]);
    if (!m || seen.has(p[0])) continue;
    seen.add(p[0]);
    const num = (v) => (v === undefined || /^\.+$/.test(v) ? null : Number(v));
    rows.push({ code: spCode(m[1], Number(m[2])), teff: num(p[1]), bc: num(p[3]), mv: num(p[7]), bv: num(p[8]) });
  }
  return rows.sort((a, b) => a.code - b.code);
}

function interp(rows, xKey, yKey, x) {
  const pts = rows.filter((r) => r[xKey] !== null && r[yKey] !== null).sort((a, b) => a[xKey] - b[xKey]);
  if (x <= pts[0][xKey]) return pts[0][yKey];
  if (x >= pts[pts.length - 1][xKey]) return pts[pts.length - 1][yKey];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (x >= a[xKey] && x <= b[xKey]) {
      const t = (x - a[xKey]) / (b[xKey] - a[xKey] || 1);
      return a[yKey] + t * (b[yKey] - a[yKey]);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Spectral types
// ---------------------------------------------------------------------------

function parseSpectralType(spect) {
  const s = (spect || '').trim();
  if (/^D[ABOQZCX]?/.test(s)) return { letter: 'D', sub: null, lumClass: 'D' };
  const m = /([OBAFGKM])(\d(?:\.\d+)?)?/.exec(s);
  if (!m) return { letter: s.charAt(0).toUpperCase() || null, sub: null, lumClass: null };
  const rest = s.slice(m.index + m[0].length);
  const lc = /(Ia0|Iab|Ia|Ib|III|II|IV|VI|V|I)/.exec(rest);
  let lumClass = null;
  if (lc) {
    const v = lc[1];
    lumClass = v.startsWith('I') && !['II', 'III', 'IV'].includes(v) ? 'I' : v === 'VI' ? 'V' : v;
  }
  if (/^sd/.test(s)) lumClass = 'V';
  return { letter: m[1], sub: m[2] !== undefined ? Number(m[2]) : 5, lumClass };
}

const DWARF_LIKE = new Set(['V', 'IV']);

// M giants: B−V saturates, so Teff comes from the spectral subtype
// (Ridgway et al. 1980, ApJ 235, 126; M7–M8 extrapolated)
const M_GIANT_TEFF = [3895, 3810, 3730, 3640, 3560, 3420, 3250, 3080, 2900];
const mGiantTeff = (sub) => {
  const i = Math.max(0, Math.min(M_GIANT_TEFF.length - 1, sub));
  const lo = Math.floor(i), hi = Math.min(M_GIANT_TEFF.length - 1, lo + 1);
  return M_GIANT_TEFF[lo] + (i - lo) * (M_GIANT_TEFF[hi] - M_GIANT_TEFF[lo]);
};

function stellarParameters({ spect, bv, mv }, mamajek) {
  const sp = parseSpectralType(spect);
  if (!sp.letter || !LETTERS.includes(sp.letter)) return null; // carbon stars, WDs, Wolf–Rayet: no calibration here
  const code = spCode(sp.letter, sp.sub);
  let lumClass = sp.lumClass;
  let lumClassInferred = false;

  const spTeff = interp(mamajek, 'code', 'teff', code);
  const effectiveTemperature = (cls) => {
    const giant = cls === 'I' || cls === 'II' || cls === 'III';
    if (sp.letter === 'O' || sp.letter === 'B') return spTeff; // B−V is nearly flat and reddened
    if (sp.letter === 'M') return giant ? mGiantTeff(sp.sub) : spTeff; // B−V saturates
    if (bv === null) return spTeff;
    if (cls === 'I' || cls === 'II') return sp.letter === 'A' ? spTeff : flowerTeff(bv, true);
    if (cls === 'III') return flowerTeff(bv, false);
    return interp(mamajek, 'bv', 'teff', bv); // dwarf colour–temperature sequence
  };

  // Luminosity class from the position relative to the main sequence when the type has none
  let teff = effectiveTemperature(lumClass);
  if (!lumClass) {
    lumClassInferred = true;
    const msMv = interp(mamajek, 'teff', 'mv', teff);
    const excess = msMv - mv; // magnitudes brighter than the main sequence
    // Giants are brighter than M_V ≈ +4.5; fainter outliers come from a wrong subtype
    lumClass = excess < 1.0 || mv > 4.5 ? 'V' : excess < 2.0 ? 'IV' : mv < -4 ? 'I' : 'III';
    teff = effectiveTemperature(lumClass);
  }

  const dwarf = DWARF_LIKE.has(lumClass);
  const bcv = dwarf ? interp(mamajek, 'teff', 'bc', teff) : flowerBC(teff);
  const mbolSun = dwarf ? MBOL_SUN_IAU : MBOL_SUN_FLOWER;
  const lum = 10 ** (-0.4 * (mv + bcv - mbolSun));
  const radius = Math.sqrt(lum) * (T_SUN / teff) ** 2;
  return { teff, lum, radius, lumClass, lumClassInferred, letter: sp.letter };
}

// Main-sequence mass from luminosity, inverting the piecewise mass–luminosity
// relation L ∝ M^a (Duric 2004, Advanced Astrophysics): 0.23 M^2.3 (M < 0.43),
// M^4 (0.43–2), 1.4 M^3.5 (2–55)
function msMassFromLum(lum) {
  if (lum < 0.23 * 0.43 ** 2.3) return (lum / 0.23) ** (1 / 2.3);
  if (lum < 16) return lum ** 0.25;
  return (lum / 1.4) ** (1 / 3.5);
}

function evolutionaryStage(lumClass, teff) {
  if (lumClass === 'I') return teff < 4500 ? 'Red Supergiant' : teff < 7500 ? 'Yellow Supergiant' : 'Blue Supergiant';
  if (lumClass === 'II') return 'Bright Giant';
  if (lumClass === 'III') return teff < 5200 ? 'Red Giant' : 'Giant';
  if (lumClass === 'IV') return 'Subgiant';
  if (teff < 3900) return 'Main Sequence (Red Dwarf)';
  if (teff < 5300) return 'Main Sequence (Orange Dwarf)';
  if (teff < 6000) return 'Main Sequence (Yellow Dwarf)';
  return 'Main Sequence';
}

const CONSTELLATIONS = {
  And: 'Andromeda', Ant: 'Antlia', Aps: 'Apus', Aqr: 'Aquarius', Aql: 'Aquila', Ara: 'Ara', Ari: 'Aries',
  Aur: 'Auriga', Boo: 'Boötes', Cae: 'Caelum', Cam: 'Camelopardalis', Cnc: 'Cancer', CVn: 'Canes Venatici',
  CMa: 'Canis Major', CMi: 'Canis Minor', Cap: 'Capricornus', Car: 'Carina', Cas: 'Cassiopeia', Cen: 'Centaurus',
  Cep: 'Cepheus', Cet: 'Cetus', Cha: 'Chamaeleon', Cir: 'Circinus', Col: 'Columba', Com: 'Coma Berenices',
  CrA: 'Corona Australis', CrB: 'Corona Borealis', Crv: 'Corvus', Crt: 'Crater', Cru: 'Crux', Cyg: 'Cygnus',
  Del: 'Delphinus', Dor: 'Dorado', Dra: 'Draco', Equ: 'Equuleus', Eri: 'Eridanus', For: 'Fornax', Gem: 'Gemini',
  Gru: 'Grus', Her: 'Hercules', Hor: 'Horologium', Hya: 'Hydra', Hyi: 'Hydrus', Ind: 'Indus', Lac: 'Lacerta',
  Leo: 'Leo', LMi: 'Leo Minor', Lep: 'Lepus', Lib: 'Libra', Lup: 'Lupus', Lyn: 'Lynx', Lyr: 'Lyra', Men: 'Mensa',
  Mic: 'Microscopium', Mon: 'Monoceros', Mus: 'Musca', Nor: 'Norma', Oct: 'Octans', Oph: 'Ophiuchus', Ori: 'Orion',
  Pav: 'Pavo', Peg: 'Pegasus', Per: 'Perseus', Phe: 'Phoenix', Pic: 'Pictor', Psc: 'Pisces', PsA: 'Piscis Austrinus',
  Pup: 'Puppis', Pyx: 'Pyxis', Ret: 'Reticulum', Sge: 'Sagitta', Sgr: 'Sagittarius', Sco: 'Scorpius', Scl: 'Sculptor',
  Sct: 'Scutum', Ser: 'Serpens', Sex: 'Sextans', Tau: 'Taurus', Tel: 'Telescopium', Tri: 'Triangulum',
  TrA: 'Triangulum Australe', Tuc: 'Tucana', UMa: 'Ursa Major', UMi: 'Ursa Minor', Vel: 'Vela', Vir: 'Virgo',
  Vol: 'Volans', Vul: 'Vulpecula'
};

const sig = (x, n = 3) => Number(x.toPrecision(n));
const LY_PER_PC = 3.26156;

// Open clusters: Gaia DR2 mean parallaxes and proper motions (Gaia Collaboration,
// Babusiaux et al. 2018, A&A 616, A10); Pleiades reddening E(B−V) = 0.04 (An et al. 2007).
const CLUSTERS = {
  pleiades: { ra: [3.55, 3.95], dec: [22.5, 25.5], plx: 7.364, plxTol: 1.5, pm: [19.997, -45.548], pmTol: 8, ebv: 0.04 },
  hyades: { ra: [3.9, 5.0], dec: [8, 22], plx: 21.052, plxTol: 5, pm: [101.005, -28.490], pmTol: 30, ebv: 0.0 }
};

async function main() {
  const [hygText, hipText, neaText, mamText] = await Promise.all(['hyg', 'hip2', 'nea', 'mamajek'].map(cached));
  const mamajek = parseMamajek(mamText);
  const hip2 = new Map(parseCsv(hipText).map((r) => [Number(r.HIP), { plx: Number(r.Plx), ePlx: Number(r.e_Plx) }]));

  const neaRows = parseCsv(neaText);
  const planetsByHost = new Map();
  const hostByHip = new Map();
  for (const r of neaRows) {
    planetsByHost.set(r.hostname, (planetsByHost.get(r.hostname) || 0) + 1);
    const m = /^HIP (\d+)/.exec(r.hip_name || '');
    if (m) hostByHip.set(Number(m[1]), r.hostname);
  }

  const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'star_notes.json'), 'utf8'));
  const curated = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'curated_stars.json'), 'utf8'));
  const curatedHips = new Set(curated.filter((s) => s.hip).map((s) => Number(s.hip)));

  const named = [];
  const background = [];
  const clusterMembers = { pleiades: [], hyades: [] };
  let quality = 0; // stars with σϖ/ϖ < 10 %

  for (const r of parseCsv(hygText)) {
    const hip = Number(r.hip);
    const vmag = Number(r.mag);
    if (!hip || r.mag === '' || Number.isNaN(vmag)) continue;
    const astrometry = hip2.get(hip);
    if (!astrometry) continue;
    const relErr = astrometry.ePlx / astrometry.plx;
    const override = notes[hip] || {};
    const spect = override.spect || r.spect;
    const bv = override.spect ? null : r.ci === '' ? null : Number(r.ci);
    const ra = Number(r.ra);
    const dec = Number(r.dec);

    // Cluster members: position + parallax + proper motion; the cluster mean
    // distance replaces the individual parallax.
    for (const [key, c] of Object.entries(CLUSTERS)) {
      if (ra < c.ra[0] || ra > c.ra[1] || dec < c.dec[0] || dec > c.dec[1]) continue;
      if (Math.abs(astrometry.plx - c.plx) > c.plxTol) continue;
      if (Math.hypot(Number(r.pmra) - c.pm[0], Number(r.pmdec) - c.pm[1]) > c.pmTol) continue;
      const mv = vmag - 3.1 * c.ebv + 5 * Math.log10(c.plx / 100);
      const p = stellarParameters({ spect, bv: bv === null ? null : bv - c.ebv, mv }, mamajek);
      if (!p) continue;
      clusterMembers[key].push([Math.round(p.teff), sig(p.lum), p.letter, p.lumClass, r.proper || null]);
    }

    if (relErr >= 0.1 && !(r.proper && relErr < 0.2)) continue;
    const mv = vmag + 5 * Math.log10(astrometry.plx / 100);
    const p = stellarParameters({ spect, bv, mv }, mamajek);
    if (!p) continue;
    if (relErr < 0.1) quality++;

    if (r.proper && !curatedHips.has(hip)) {
      const host = hostByHip.get(hip);
      const planets = host ? planetsByHost.get(host) : 0;
      const note = notes[hip] && notes[hip].en ? notes[hip] : null;
      const isMs = p.lumClass === 'V';
      named.push({
        id: `hip_${hip}`,
        name: r.proper,
        hip: String(hip),
        bayer: r.bayer ? `${r.bayer} ${r.con}` : '',
        constellation: CONSTELLATIONS[r.con] || r.con || '',
        spectralType: spect,
        temp: Math.round(p.teff / 10) * 10,
        lum: sig(p.lum),
        absMag: Number(mv.toFixed(2)),
        b_v: bv,
        mass: isMs ? sig(msMassFromLum(p.lum), 2) : null,
        radius: sig(p.radius),
        distance_ly: sig((1000 / astrometry.plx) * LY_PER_PC),
        luminosityClass: p.lumClass,
        evolutionaryStage: evolutionaryStage(p.lumClass, p.teff),
        hasExoplanets: planets > 0,
        exoplanetCount: planets,
        neaHost: host || null,
        notableFacts: note ? note.en : null,
        notableFactsCs: note ? note.cs : null,
        pulsationPeriodDays: null,
        parallaxRelError: Number(relErr.toFixed(3)),
        dataSource: 'derived'
      });
    }

    if (relErr < 0.1 && hip % 4 === 0) {
      background.push([Math.round(p.teff), sig(p.lum), p.letter, p.lumClass]);
    }
  }

  // Curated benchmark stars: planet counts from the archive
  for (const s of curated) {
    if (s.neaHost !== undefined && s.neaHost !== null && !planetsByHost.has(s.neaHost)) {
      throw new Error(`NASA Exoplanet Archive has no host named "${s.neaHost}" (${s.id})`);
    }
    const host = s.neaHost || (s.hip ? hostByHip.get(Number(s.hip)) : null);
    const planets = host ? planetsByHost.get(host) || 0 : 0;
    if (s.hasExoplanets === undefined) {
      s.hasExoplanets = planets > 0;
      s.exoplanetCount = planets;
      s.neaHost = planets > 0 ? host : null;
    } else {
      s.exoplanetCount = 0;
    }
  }

  const famous = [...curated, ...named.sort((a, b) => a.name.localeCompare(b.name))];
  const attribution = JSON.parse(fs.readFileSync(path.join(OUT, 'attribution.json'), 'utf8'));
  attribution.lastUpdated = new Date().toISOString().slice(0, 10);
  attribution.processing = {
    backgroundStars: background.length,
    namedStars: named.length,
    curatedStars: curated.length,
    parallaxQualityCut: 'σϖ/ϖ < 10 % (named stars < 20 %)'
  };

  fs.writeFileSync(path.join(OUT, 'famous_stars.json'), JSON.stringify(famous, null, 2) + '\n');
  fs.writeFileSync(path.join(OUT, 'hyg_stars.json'), JSON.stringify(background));
  fs.writeFileSync(path.join(OUT, 'cluster_members.json'), JSON.stringify(clusterMembers));
  fs.writeFileSync(path.join(OUT, 'attribution.json'), JSON.stringify(attribution, null, 2) + '\n');

  console.log(`Stars with σϖ/ϖ < 10 %: ${quality}`);
  console.log(`Background sample: ${background.length}`);
  console.log(`Named HYG stars: ${named.length}, curated: ${curated.length}`);
  console.log(`Pleiades members: ${clusterMembers.pleiades.length}, Hyades members: ${clusterMembers.hyades.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
