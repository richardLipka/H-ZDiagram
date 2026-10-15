/**
 * Star cluster ages from the main-sequence turn-off.
 *
 * Stars of a cluster are coeval: the most massive ones leave the main sequence
 * first, so the turn-off moves to lower masses and luminosities as the cluster ages.
 * This is a schematic isochrone, not one interpolated in stellar-evolution model grids:
 *  - turn-off mass from the scaling t_MS ≈ 10 Gyr · M^−2.5 (simulation/physics.js),
 *  - main sequence from the empirical mean dwarf sequence of Pecaut & Mamajek (2013),
 *  - post-main-sequence branch drawn schematically (subgiant + red giant branch
 *    for low-mass turn-offs, Hertzsprung-gap crossing to the red (super)giant
 *    region for higher masses).
 */
import { turnoffMass } from './physics.js';
import { mainSequenceParams } from './mainSequence.js';

// Ages: Pleiades from the lithium depletion boundary (Stauffer et al. 1998, ApJL 499, L199);
// Hyades (Perryman et al. 1998, A&A 331, 81); M67 (e.g. Sarajedini et al. 2009, AJ 138, 1985);
// 47 Tucanae (e.g. Brogaard et al. 2017, MNRAS 468, 645).
export const CLUSTER_PRESETS = [
  { id: 'pleiades', name: 'Pleiades (M45)', ageGyr: 0.125, distanceLy: 444 },
  { id: 'hyades', name: 'Hyades', ageGyr: 0.625, distanceLy: 153 },
  { id: 'm67', name: 'Messier 67', ageGyr: 4.0, distanceLy: 2800 },
  { id: 'globular_47tuc', name: '47 Tucanae (globular cluster)', ageGyr: 12.0, distanceLy: 14700 }
];

export const CLUSTER_AGE_RANGE_GYR = [0.05, 13.5];

/**
 * Main-sequence turn-off for a cluster of the given age (Gyr).
 */
export function calculateTurnOffPoint(ageGyr) {
  const age = Math.max(CLUSTER_AGE_RANGE_GYR[0], Math.min(13.8, ageGyr));
  const mass = turnoffMass(age * 1e9);
  const { temp, lum } = mainSequenceParams(mass);
  return {
    ageGyr: age,
    massMsun: Number(mass.toFixed(2)),
    lumLsun: Number(lum.toPrecision(3)),
    tempK: Math.round(temp)
  };
}

/**
 * Isochrone points { temp, lum } for the given age; `postMsIndex` marks where
 * the schematic post-main-sequence part begins.
 */
export function generateIsochronePoints(ageGyr) {
  const to = calculateTurnOffPoint(ageGyr);
  const points = [];

  // Main sequence from 0.1 M☉ up to the turn-off mass (log-spaced)
  const steps = 40;
  const logMin = Math.log10(0.1);
  const logMax = Math.log10(to.massMsun);
  for (let i = 0; i <= steps; i++) {
    const ms = mainSequenceParams(10 ** (logMin + (i / steps) * (logMax - logMin)));
    points.push({ temp: Math.round(ms.temp), lum: Number(ms.lum.toPrecision(3)) });
  }
  const postMsIndex = points.length - 1;

  const T = to.tempK;
  const L = to.lumLsun;
  if (to.massMsun < 2.0) {
    // Subgiant branch, then the red giant branch up to its tip (~2,500 L☉)
    points.push({ temp: Math.round(T * 0.96), lum: L * 1.3 });
    points.push({ temp: Math.round(Math.max(4950, Math.min(T * 0.9, 5100))), lum: L * 1.8 });
    const rgb = [[4900, 5], [4600, 20], [4300, 100], [4000, 500], [3700, 2500]];
    for (const [t, l] of rgb) {
      if (l > L * 1.8) points.push({ temp: t, lum: l });
    }
  } else {
    // Rapid crossing of the Hertzsprung gap at roughly constant luminosity,
    // ending as a red giant (≲ 8 M☉) or red supergiant
    const redTemp = to.massMsun < 8 ? 4400 : 3800;
    points.push({ temp: Math.round(T * 0.9), lum: L * 1.3 });
    points.push({ temp: Math.round((T * 0.9 + redTemp) / 2), lum: L * 1.5 });
    points.push({ temp: redTemp, lum: L * 2 });
    points.push({ temp: redTemp - 300, lum: L * 3 });
  }

  return { turnoff: to, points, postMsIndex };
}
