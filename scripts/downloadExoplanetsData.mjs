import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, '..', 'public', 'data', 'exoplanets_hz.json');

const QUERY = 'select pl_name,hostname,st_teff,st_rad,st_lum,st_spectype,pl_orbsmax,pl_rade,pl_bmasse,pl_eqt,pl_insol,disc_year,discoverymethod from pscomppars where pl_orbsmax is not null and st_teff is not null';
const URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=' + encodeURIComponent(QUERY) + '&format=json';

function getDetailedHabitableZone(lum, temp) {
  const T_eff_sun = 5780.0;
  const T_diff = Math.max(-3180, Math.min(1420, temp - T_eff_sun));
  const t2 = T_diff * T_diff;
  const t3 = t2 * T_diff;
  const t4 = t3 * T_diff;
  const calcSeff = (s0, a, b, c, d) => s0 + a * T_diff + b * t2 + c * t3 + d * t4;
  const sRecentVenus = calcSeff(1.776, 2.136e-4, 2.533e-8, -1.332e-11, -3.097e-15);
  const sRunawayGreenhouse = calcSeff(1.107, 1.332e-4, 1.580e-8, -8.308e-12, -1.931e-15);
  const sMaximumGreenhouse = calcSeff(0.356, 6.171e-5, 1.698e-9, -3.198e-12, -5.575e-16);
  const sEarlyMars = calcSeff(0.320, 5.547e-5, 1.526e-9, -2.874e-12, -5.011e-16);
  const calcDist = (sEff) => Math.sqrt(lum / sEff);
  return {
    recentVenusAU: calcDist(sRecentVenus),
    runawayGreenhouseAU: calcDist(sRunawayGreenhouse),
    maximumGreenhouseAU: calcDist(sMaximumGreenhouse),
    earlyMarsAU: calcDist(sEarlyMars)
  };
}

console.log('Downloading NASA Exoplanet Archive composite data...');

https.get(URL, (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    try {
      const rows = JSON.parse(raw);
      console.log(`Parsed ${rows.length} rows from NASA.`);

      const planets = [];
      const hostsWithHZPlanets = new Set(['Sun', 'Sol']);

      for (const r of rows) {
        const teff = Number(r.st_teff);
        const a = Number(r.pl_orbsmax);
        if (!teff || teff < 1500 || teff > 15000 || !a || a <= 0) continue;

        let lum = r.st_lum !== null && r.st_lum !== undefined ? Math.pow(10, Number(r.st_lum)) : null;
        if ((lum === null || Number.isNaN(lum) || lum <= 0) && r.st_rad) {
          lum = Math.pow(Number(r.st_rad), 2) * Math.pow(teff / 5772, 4);
        }
        if (!lum || Number.isNaN(lum) || lum <= 0) {
          lum = Math.pow(teff / 5772, 4);
        }

        const hz = getDetailedHabitableZone(lum, teff);
        const inConservative = a >= hz.runawayGreenhouseAU && a <= hz.maximumGreenhouseAU;
        const inOptimistic = a >= hz.recentVenusAU && a <= hz.earlyMarsAU;
        const hzStatus = inConservative ? 2 : inOptimistic ? 1 : 0;

        const radEarth = r.pl_rade !== null && r.pl_rade !== undefined ? Number(Number(r.pl_rade).toFixed(2)) : null;
        const massEarth = r.pl_bmasse !== null && r.pl_bmasse !== undefined ? Number(Number(r.pl_bmasse).toFixed(2)) : null;
        const isTerr = (radEarth !== null && radEarth <= 1.6) || (radEarth === null && massEarth !== null && massEarth <= 5);

        if (hzStatus > 0) {
          hostsWithHZPlanets.add(r.hostname);
        }

        // Compact tuple: [name, host, teff, a, radius, teq, hzStatus, isTerr, method, mass, lum]
        planets.push([
          r.pl_name,
          r.hostname,
          Math.round(teff),
          Number(a.toFixed(4)),
          radEarth,
          r.pl_eqt ? Math.round(Number(r.pl_eqt)) : null,
          hzStatus,
          isTerr ? 1 : 0,
          r.discoverymethod || 'Unknown',
          massEarth,
          Number(lum.toFixed(4))
        ]);
      }

      // Add Solar System benchmark planets
      const solarSystem = [
        ['Mercury', 'Sun', 5772, 0.387, 0.38, 440, 0, 1, 'Visual', 0.055, 1.0],
        ['Venus', 'Sun', 5772, 0.723, 0.95, 737, 0, 1, 'Visual', 0.815, 1.0],
        ['Earth', 'Sun', 5772, 1.000, 1.00, 288, 2, 1, 'Visual', 1.000, 1.0],
        ['Mars', 'Sun', 5772, 1.524, 0.53, 210, 1, 1, 'Visual', 0.107, 1.0],
        ['Jupiter', 'Sun', 5772, 5.204, 11.2, 165, 0, 0, 'Visual', 317.8, 1.0],
        ['Saturn', 'Sun', 5772, 9.582, 9.45, 134, 0, 0, 'Visual', 95.16, 1.0],
        ['Uranus', 'Sun', 5772, 19.20, 4.01, 76, 0, 0, 'Visual', 14.54, 1.0],
        ['Neptune', 'Sun', 5772, 30.05, 3.88, 72, 0, 0, 'Visual', 17.15, 1.0]
      ];

      for (const sp of solarSystem) {
        planets.push(sp);
      }

      const output = {
        meta: {
          source: 'NASA Exoplanet Archive (pscomppars)',
          updatedAt: new Date().toISOString().slice(0, 10),
          totalPlanets: planets.length,
          conservativeHZCount: planets.filter(p => p[6] === 2).length,
          optimisticHZCount: planets.filter(p => p[6] > 0).length,
          terrestrialHZCount: planets.filter(p => p[6] > 0 && p[7] === 1).length,
          hostsWithHZCount: hostsWithHZPlanets.size
        },
        hostsWithHZPlanets: Array.from(hostsWithHZPlanets),
        planets
      };

      fs.writeFileSync(OUT_FILE, JSON.stringify(output));
      console.log(`Saved ${planets.length} planets to ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024).toFixed(1)} KB)`);
      console.log('Metadata:', output.meta);
    } catch (err) {
      console.error('Processing failed:', err);
    }
  });
}).on('error', err => {
  console.error('Download error:', err);
});
