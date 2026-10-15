/**
 * Star Cluster Age & Turn-off Point Simulation.
 * Real stars in a cluster are coeval (born at the same time).
 * As a cluster ages, the more massive stars die first, causing the main sequence
 * to "turn off" at progressively lower masses and temperatures.
 */

export const CLUSTER_PRESETS = [
  {
    id: "pleiades",
    name: "Pleiades (Seven Sisters / M45)",
    ageGyr: 0.1, // 100 Myr
    description: "Young open cluster dominated by hot, luminous blue stars. The turn-off is high on the main sequence around spectral type B8.",
    turnoffSpectral: "B8V",
    distanceLy: 444
  },
  {
    id: "hyades",
    name: "Hyades Cluster",
    ageGyr: 0.625, // 625 Myr
    description: "Intermediate-age open cluster in Taurus with prominent red giants forming the 'V' shape.",
    turnoffSpectral: "A2V",
    distanceLy: 153
  },
  {
    id: "m67",
    name: "Messier 67 (M67)",
    ageGyr: 4.0, // 4 Gyr
    description: "One of the oldest known open clusters, roughly the same age as our Solar System (~4.6 Gyr). Turn-off is at early F-type stars.",
    turnoffSpectral: "F0V",
    distanceLy: 2900
  },
  {
    id: "globular_47tuc",
    name: "47 Tucanae (Globular Cluster)",
    ageGyr: 12.0, // 12 Gyr
    description: "Ancient globular cluster from the early Milky Way. All stars above ~0.8 Solar Masses have died, leaving a stark turn-off around spectral type G.",
    turnoffSpectral: "G3V",
    distanceLy: 14700
  }
];

/**
 * Calculate the Main Sequence Turn-Off point for a given age in Gyr.
 * t_ms ~ 10 * (M / M_sun)^(-2.5) Gyr -> M_turnoff = (10 / ageGyr)^(1 / 2.5)
 */
export function calculateTurnOffPoint(ageGyr) {
  const age = Math.max(0.01, Math.min(13.8, ageGyr));
  const massTurnoff = Math.pow(10.0 / age, 1 / 2.5);

  // Luminosity at turn-off
  let lum;
  if (massTurnoff < 0.43) {
    lum = 0.23 * Math.pow(massTurnoff, 2.3);
  } else if (massTurnoff < 2.0) {
    lum = Math.pow(massTurnoff, 4.0);
  } else {
    lum = 1.4 * Math.pow(massTurnoff, 3.5);
  }

  // Radius at turn-off on main sequence
  const radius = massTurnoff < 1.0 
    ? Math.pow(massTurnoff, 0.8) 
    : Math.pow(massTurnoff, 0.65);

  // Temperature via Stefan-Boltzmann Law
  const temp = Math.pow(lum / Math.pow(radius, 2), 0.25) * 5778;

  return {
    ageGyr: age,
    massMsun: parseFloat(massTurnoff.toFixed(2)),
    lumLsun: parseFloat(lum.toPrecision(3)),
    tempK: Math.round(temp),
    radiusRsun: parseFloat(radius.toFixed(2))
  };
}

/**
 * Generate an isochrone line (points in [temp, lum]) for the specified cluster age.
 */
export function generateIsochronePoints(ageGyr) {
  const to = calculateTurnOffPoint(ageGyr);
  const points = [];

  // 1. Lower Main Sequence (still burning Hydrogen steadily up to turn-off)
  const minMass = 0.1;
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const m = minMass + fraction * (to.massMsun - minMass);
    let lum = m < 0.43 ? 0.23 * Math.pow(m, 2.3) : Math.pow(m, 4.0);
    let r = m < 1.0 ? Math.pow(m, 0.8) : Math.pow(m, 0.6);
    let temp = Math.pow(lum / Math.pow(r, 2), 0.25) * 5778;
    points.push({ temp: Math.round(temp), lum: parseFloat(lum.toPrecision(3)) });
  }

  // 2. Turn-off Hook & Subgiant Branch
  points.push({
    temp: Math.round(to.tempK * 0.95),
    lum: parseFloat((to.lumLsun * 1.6).toPrecision(3))
  });
  points.push({
    temp: Math.round(to.tempK * 0.82),
    lum: parseFloat((to.lumLsun * 2.8).toPrecision(3))
  });

  // 3. Red Giant Branch (climbing vertically at cool temperatures ~3500K - 4500K)
  const rgbTemp = Math.min(to.tempK * 0.7, 4400);
  points.push({
    temp: Math.round(rgbTemp),
    lum: parseFloat((to.lumLsun * 10).toPrecision(3))
  });
  points.push({
    temp: Math.round(Math.max(3100, rgbTemp - 400)),
    lum: parseFloat((to.lumLsun * 60).toPrecision(3))
  });
  points.push({
    temp: Math.round(Math.max(3000, rgbTemp - 800)),
    lum: parseFloat((to.lumLsun * 350).toPrecision(3))
  });

  return {
    turnoff: to,
    points
  };
}
