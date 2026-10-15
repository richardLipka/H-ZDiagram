/**
 * Planetary architectures and circumstellar habitable zone (HZ) limits.
 *
 * HZ limits follow Kopparapu et al. (2014, ApJL 787, L29; Table 1, 1 Earth-mass planet),
 * an update of Kopparapu et al. (2013, ApJ 765, 131):
 *   S_eff = S_eff,☉ + a·T + b·T² + c·T³ + d·T⁴,  T = Teff − 5780 K
 *   d = √(L / L☉ / S_eff)  [AU]
 * The fits are valid for 2,600 K ≤ Teff ≤ 7,200 K; outside that range the
 * temperature is clamped and the result is flagged as an extrapolation.
 */

// Semi-major axes and radii. Radii of non-transiting planets (Proxima b/d, Pollux b,
// 51 Peg b) are not measured; the values below are illustrative estimates.
export const KNOWN_PLANETARY_SYSTEMS = {
  // Solar System (planets, not exoplanets)
  sun: [
    { name: "Mercury", nameCs: "Merkur", semiMajorAxisAU: 0.387, radiusEarth: 0.38 },
    { name: "Venus", nameCs: "Venuše", semiMajorAxisAU: 0.723, radiusEarth: 0.95 },
    { name: "Earth", nameCs: "Země", semiMajorAxisAU: 1.000, radiusEarth: 1.00 },
    { name: "Mars", nameCs: "Mars", semiMajorAxisAU: 1.524, radiusEarth: 0.53 },
    { name: "Jupiter", nameCs: "Jupiter", semiMajorAxisAU: 5.204, radiusEarth: 11.2 }
  ],
  // TRAPPIST-1 (Agol et al. 2021, PSJ 2, 1)
  trappist1: [
    { name: "TRAPPIST-1b", semiMajorAxisAU: 0.01154, radiusEarth: 1.12 },
    { name: "TRAPPIST-1c", semiMajorAxisAU: 0.01580, radiusEarth: 1.10 },
    { name: "TRAPPIST-1d", semiMajorAxisAU: 0.02227, radiusEarth: 0.79 },
    { name: "TRAPPIST-1e", semiMajorAxisAU: 0.02925, radiusEarth: 0.92 },
    { name: "TRAPPIST-1f", semiMajorAxisAU: 0.03849, radiusEarth: 1.05 },
    { name: "TRAPPIST-1g", semiMajorAxisAU: 0.04683, radiusEarth: 1.13 },
    { name: "TRAPPIST-1h", semiMajorAxisAU: 0.06189, radiusEarth: 0.76 }
  ],
  // Proxima Centauri (Faria et al. 2022, A&A 658, A115)
  proxima_centauri: [
    { name: "Proxima d", semiMajorAxisAU: 0.02885, radiusEarth: 0.81 },
    { name: "Proxima b", semiMajorAxisAU: 0.04856, radiusEarth: 1.03 }
  ],
  // Kepler-186: periods from Quintana et al. (2014, Science 344, 277), semi-major axes
  // from Kepler's third law with M = 0.544 M☉ (Souto et al. 2017, ApJ 835, 239)
  kepler_186: [
    { name: "Kepler-186b", semiMajorAxisAU: 0.0395, radiusEarth: 1.07 },
    { name: "Kepler-186c", semiMajorAxisAU: 0.0599, radiusEarth: 1.25 },
    { name: "Kepler-186d", semiMajorAxisAU: 0.0899, radiusEarth: 1.40 },
    { name: "Kepler-186e", semiMajorAxisAU: 0.1270, radiusEarth: 1.27 },
    { name: "Kepler-186f", semiMajorAxisAU: 0.410, radiusEarth: 1.17 }
  ],
  // Pollux (Hatzes et al. 2006, A&A 457, 335)
  pollux: [
    { name: "Thestias (Pollux b)", semiMajorAxisAU: 1.64, radiusEarth: 12.0 }
  ],
  // 51 Pegasi (Mayor & Queloz 1995, Nature 378, 355)
  hip_113357: [
    { name: "Dimidium (51 Peg b)", semiMajorAxisAU: 0.0527, radiusEarth: 13.5 }
  ]
};

// Stars in this catalogue with at least one confirmed planet inside the
// (optimistic) habitable zone; used by the Academy mission.
export const HABITABLE_ZONE_PLANET_HOSTS = new Set([
  'proxima_centauri', 'trappist1', 'kepler_186', 'gliese_667_c', 'k2_18', 'lhs_1140', 'toi_700',
  'teegarden_s_star', 'kepler_22', 'kepler_452', 'kepler_442', 'toi_715', 'lp_791_18', 'hip_57548'
]);

const KOPPARAPU_2014 = {
  recentVenus: [1.776, 2.136e-4, 2.533e-8, -1.332e-11, -3.097e-15],
  runawayGreenhouse: [1.107, 1.332e-4, 1.58e-8, -8.308e-12, -1.931e-15],
  maximumGreenhouse: [0.356, 6.171e-5, 1.698e-9, -3.198e-12, -5.575e-16],
  earlyMars: [0.320, 5.547e-5, 1.526e-9, -2.874e-12, -5.011e-16]
};

export const HZ_TEFF_RANGE = [2600, 7200];

function effectiveFlux([s0, a, b, c, d], tempK) {
  const t = tempK - 5780;
  return s0 + a * t + b * t ** 2 + c * t ** 3 + d * t ** 4;
}

/**
 * Habitable zone limits in AU for a star of luminosity L (L☉) and Teff (K).
 * Returns { recentVenusAU, runawayGreenhouseAU, maximumGreenhouseAU, earlyMarsAU,
 *           earthEquivAU, centerAU, extrapolated }.
 */
export function getDetailedHabitableZone(lumSolar, tempK) {
  const lum = Math.max(1e-8, lumSolar || 1.0);
  const rawTemp = tempK || 5772;
  const temp = Math.max(HZ_TEFF_RANGE[0], Math.min(HZ_TEFF_RANGE[1], rawTemp));
  const dist = (coeffs) => Math.sqrt(lum / effectiveFlux(coeffs, temp));

  const runawayGreenhouseAU = dist(KOPPARAPU_2014.runawayGreenhouse);
  const maximumGreenhouseAU = dist(KOPPARAPU_2014.maximumGreenhouse);
  const round = (x) => Number(x.toPrecision(4));

  return {
    recentVenusAU: round(dist(KOPPARAPU_2014.recentVenus)),
    runawayGreenhouseAU: round(runawayGreenhouseAU),
    maximumGreenhouseAU: round(maximumGreenhouseAU),
    earlyMarsAU: round(dist(KOPPARAPU_2014.earlyMars)),
    centerAU: round((runawayGreenhouseAU + maximumGreenhouseAU) / 2),
    earthEquivAU: round(Math.sqrt(lum)),
    extrapolated: rawTemp < HZ_TEFF_RANGE[0] || rawTemp > HZ_TEFF_RANGE[1]
  };
}

/**
 * Climatic zone of a planet with semi-major axis orbitAU.
 */
export function classifyPlanetZone(orbitAU, hz) {
  if (orbitAU < hz.recentVenusAU) return "scorched";
  if (orbitAU < hz.runawayGreenhouseAU) return "optimistic_inner";
  if (orbitAU <= hz.maximumGreenhouseAU) return "habitable";
  if (orbitAU <= hz.earlyMarsAU) return "optimistic_outer";
  return "frozen";
}

/**
 * Planetary system to draw for a star, by catalogue id.
 */
export function getPlanetarySystem(starId) {
  return KNOWN_PLANETARY_SYSTEMS[starId] || null;
}
