/**
 * Exoplanet dataset service providing access to 5,600+ confirmed exoplanets
 * from the NASA Exoplanet Archive with Habitable Zone classifications.
 */

let cachedPromise = null;

export async function loadExoplanetDataset() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    try {
      const base = import.meta.env.BASE_URL || './';
      const url = `${base.replace(/\/$/, '')}/data/exoplanets_hz.json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} loading exoplanets_hz.json`);
      const data = await res.json();

      // Decompress tuples into rich objects:
      // [name, host, teff, a, radius, teq, hzStatus, isTerr, method, mass, lum]
      const planets = data.planets.map((p, idx) => ({
        id: `pl_${idx}`,
        name: p[0],
        host: p[1],
        teff: p[2],
        a: p[3],
        radiusEarth: p[4],
        teq: p[5],
        hz: p[6], // 2 = Conservative HZ, 1 = Optimistic HZ, 0 = Outside
        isTerr: p[7] === 1,
        method: p[8],
        massEarth: p[9],
        lum: p[10]
      }));

      const planetsByHost = new Map();
      for (const p of planets) {
        const hostKey = p.host.toLowerCase();
        if (!planetsByHost.has(hostKey)) {
          planetsByHost.set(hostKey, []);
        }
        planetsByHost.get(hostKey).push({
          name: p.name,
          semiMajorAxisAU: p.a,
          radiusEarth: p.radiusEarth || (p.massEarth ? Number(Math.pow(p.massEarth, 0.28).toFixed(2)) : 1.0),
          massEarth: p.massEarth,
          teq: p.teq,
          inHZ: p.hz > 0
        });
      }

      const hostsWithHZ = new Set(data.hostsWithHZPlanets.map((h) => h.toLowerCase()));

      return {
        meta: data.meta,
        planets,
        planetsByHost,
        hostsWithHZ
      };
    } catch (err) {
      console.warn('Could not load full exoplanet dataset, using fallback:', err);
      return {
        meta: { totalPlanets: 0 },
        planets: [],
        planetsByHost: new Map(),
        hostsWithHZ: new Set()
      };
    }
  })();

  return cachedPromise;
}

/**
 * Calculates Kopparapu et al. (2014) habitable zone boundary curves
 * across an array of temperatures for the main sequence.
 */
export function getKopparapuHZCurves(tempRange = [2200, 7200], steps = 60) {
  const points = [];
  const [minT, maxT] = tempRange;
  const T_eff_sun = 5780.0;

  for (let i = 0; i <= steps; i++) {
    const teff = minT + (i / steps) * (maxT - minT);
    const T_diff = teff - T_eff_sun;
    const t2 = T_diff * T_diff;
    const t3 = t2 * T_diff;
    const t4 = t3 * T_diff;

    // Approximate main-sequence luminosity from Teff
    let lum;
    if (teff < 3900) {
      lum = 0.23 * Math.pow(teff / 5772, 2.3 * 4);
    } else {
      lum = Math.pow(teff / 5772, 4);
    }
    lum = Math.max(1e-5, lum);

    const sRecentVenus = 1.776 + 2.136e-4 * T_diff + 2.533e-8 * t2 - 1.332e-11 * t3 - 3.097e-15 * t4;
    const sRunawayGreenhouse = 1.107 + 1.332e-4 * T_diff + 1.580e-8 * t2 - 8.308e-12 * t3 - 1.931e-15 * t4;
    const sMaximumGreenhouse = 0.356 + 6.171e-5 * T_diff + 1.698e-9 * t2 - 3.198e-12 * t3 - 5.575e-16 * t4;
    const sEarlyMars = 0.320 + 5.547e-5 * T_diff + 1.526e-9 * t2 - 2.874e-12 * t3 - 5.011e-16 * t4;

    points.push({
      teff,
      recentVenusAU: Math.sqrt(lum / sRecentVenus),
      runawayGreenhouseAU: Math.sqrt(lum / sRunawayGreenhouse),
      maximumGreenhouseAU: Math.sqrt(lum / sMaximumGreenhouse),
      earlyMarsAU: Math.sqrt(lum / sEarlyMars)
    });
  }

  return points;
}
