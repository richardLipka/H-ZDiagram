/**
 * Planetary Architectures and Habitable Zone calculations.
 * Based on Kopparapu et al. (2013, 2014) climate models for circumstellar habitability.
 */

// Confirmed exoplanet systems with realistic semi-major axes (AU)
export const KNOWN_PLANETARY_SYSTEMS = {
  // Solar System
  "sun": [
    { name: "Mercury", nameCs: "Merkur", semiMajorAxisAU: 0.387, radiusEarth: 0.38, type: "scorched_rocky" },
    { name: "Venus", nameCs: "Venuše", semiMajorAxisAU: 0.723, radiusEarth: 0.95, type: "runaway_greenhouse" },
    { name: "Earth", nameCs: "Země", semiMajorAxisAU: 1.000, radiusEarth: 1.00, type: "habitable" },
    { name: "Mars", nameCs: "Mars", semiMajorAxisAU: 1.524, radiusEarth: 0.53, type: "outer_habitable" },
    { name: "Jupiter", nameCs: "Jupiter", semiMajorAxisAU: 5.204, radiusEarth: 11.2, type: "gas_giant" }
  ],
  "sol": [
    { name: "Mercury", nameCs: "Merkur", semiMajorAxisAU: 0.387, radiusEarth: 0.38, type: "scorched_rocky" },
    { name: "Venus", nameCs: "Venuše", semiMajorAxisAU: 0.723, radiusEarth: 0.95, type: "runaway_greenhouse" },
    { name: "Earth", nameCs: "Země", semiMajorAxisAU: 1.000, radiusEarth: 1.00, type: "habitable" },
    { name: "Mars", nameCs: "Mars", semiMajorAxisAU: 1.524, radiusEarth: 0.53, type: "outer_habitable" },
    { name: "Jupiter", nameCs: "Jupiter", semiMajorAxisAU: 5.204, radiusEarth: 11.2, type: "gas_giant" }
  ],
  // TRAPPIST-1 (Ultra-cool M dwarf with 7 terrestrial planets)
  "trappist1": [
    { name: "TRAPPIST-1b", nameCs: "TRAPPIST-1b", semiMajorAxisAU: 0.0115, radiusEarth: 1.12, type: "scorched_rocky" },
    { name: "TRAPPIST-1c", nameCs: "TRAPPIST-1c", semiMajorAxisAU: 0.0158, radiusEarth: 1.10, type: "runaway_greenhouse" },
    { name: "TRAPPIST-1d", nameCs: "TRAPPIST-1d", semiMajorAxisAU: 0.0223, radiusEarth: 0.79, type: "inner_habitable" },
    { name: "TRAPPIST-1e", nameCs: "TRAPPIST-1e", semiMajorAxisAU: 0.0293, radiusEarth: 0.92, type: "habitable" },
    { name: "TRAPPIST-1f", nameCs: "TRAPPIST-1f", semiMajorAxisAU: 0.0385, radiusEarth: 1.05, type: "habitable" },
    { name: "TRAPPIST-1g", nameCs: "TRAPPIST-1g", semiMajorAxisAU: 0.0469, radiusEarth: 1.13, type: "outer_habitable" },
    { name: "TRAPPIST-1h", nameCs: "TRAPPIST-1h", semiMajorAxisAU: 0.0619, radiusEarth: 0.78, type: "frozen" }
  ],
  // Proxima Centauri (M dwarf)
  "proxima_centauri": [
    { name: "Proxima d", nameCs: "Proxima d", semiMajorAxisAU: 0.0289, radiusEarth: 0.81, type: "scorched_rocky" },
    { name: "Proxima b", nameCs: "Proxima b", semiMajorAxisAU: 0.0485, radiusEarth: 1.03, type: "habitable" }
  ],
  // Kepler-186 (M dwarf with first Earth-sized planet in habitable zone)
  "kepler_186": [
    { name: "Kepler-186b", nameCs: "Kepler-186b", semiMajorAxisAU: 0.0378, radiusEarth: 1.07, type: "scorched_rocky" },
    { name: "Kepler-186c", nameCs: "Kepler-186c", semiMajorAxisAU: 0.0515, radiusEarth: 1.25, type: "scorched_rocky" },
    { name: "Kepler-186d", nameCs: "Kepler-186d", semiMajorAxisAU: 0.0881, radiusEarth: 1.39, type: "runaway_greenhouse" },
    { name: "Kepler-186e", nameCs: "Kepler-186e", semiMajorAxisAU: 0.1216, radiusEarth: 1.33, type: "inner_habitable" },
    { name: "Kepler-186f", nameCs: "Kepler-186f", semiMajorAxisAU: 0.4320, radiusEarth: 1.17, type: "habitable" }
  ],
  // Pollux (Giant with confirmed giant planet)
  "pollux": [
    { name: "Thestias (Pollux b)", nameCs: "Thestias (Pollux b)", semiMajorAxisAU: 1.69, radiusEarth: 12.0, type: "scorched_giant" }
  ],
  // 51 Pegasi (Prototype Hot Jupiter)
  "51_peg": [
    { name: "Dimidium (51 Peg b)", nameCs: "Dimidium (51 Peg b)", semiMajorAxisAU: 0.0527, radiusEarth: 13.5, type: "hot_jupiter" }
  ]
};

/**
 * Detailed Habitable Zone boundaries (Kopparapu et al. 2013/2014)
 * Returns { recentVenusAU, runawayGreenhouseAU, maximumGreenhouseAU, earlyMarsAU, centerAU }
 */
export function getDetailedHabitableZone(lumSolar, tempK) {
  const lum = Math.max(1e-6, lumSolar || 1.0);
  const temp = Math.max(2000, Math.min(30000, tempK || 5778));
  const T_diff = temp - 5778;

  // Coefficients from Kopparapu et al. (2013)
  // 1. Recent Venus (optimistic inner boundary)
  const S_rv = 1.776 + 2.136e-4 * T_diff + 2.533e-8 * Math.pow(T_diff, 2);
  // 2. Runaway Greenhouse (conservative inner boundary - water vapor feedback)
  const S_rg = 1.0140 + 8.1774e-5 * T_diff + 1.7063e-9 * Math.pow(T_diff, 2);
  // 3. Maximum Greenhouse (conservative outer boundary - CO2 condensation limit)
  const S_mg = 0.3438 + 5.8942e-5 * T_diff + 1.6558e-9 * Math.pow(T_diff, 2);
  // 4. Early Mars (optimistic outer boundary)
  const S_em = 0.3207 + 5.4471e-5 * T_diff + 1.5275e-9 * Math.pow(T_diff, 2);

  const recentVenusAU = Math.sqrt(lum / Math.max(0.1, S_rv));
  const runawayGreenhouseAU = Math.sqrt(lum / Math.max(0.1, S_rg));
  const maximumGreenhouseAU = Math.sqrt(lum / Math.max(0.01, S_mg));
  const earlyMarsAU = Math.sqrt(lum / Math.max(0.01, S_em));

  return {
    recentVenusAU: parseFloat(recentVenusAU.toFixed(3)),
    runawayGreenhouseAU: parseFloat(runawayGreenhouseAU.toFixed(3)),
    maximumGreenhouseAU: parseFloat(maximumGreenhouseAU.toFixed(3)),
    earlyMarsAU: parseFloat(earlyMarsAU.toFixed(3)),
    centerAU: parseFloat(((runawayGreenhouseAU + maximumGreenhouseAU) / 2).toFixed(3)),
    earthEquivAU: parseFloat(Math.sqrt(lum).toFixed(3))
  };
}

/**
 * Determine a planet's climatic zone given its semi-major axis and star parameters
 */
export function classifyPlanetZone(orbitAU, hz) {
  if (orbitAU < hz.recentVenusAU) return "scorched";
  if (orbitAU < hz.runawayGreenhouseAU) return "optimistic_inner";
  if (orbitAU <= hz.maximumGreenhouseAU) return "habitable";
  if (orbitAU <= hz.earlyMarsAU) return "optimistic_outer";
  return "frozen";
}
