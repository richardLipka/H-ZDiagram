/**
 * Shared physical constants and textbook scaling relations.
 */

// IAU 2015 Resolution B3 nominal solar effective temperature
export const T_SUN = 5772;
// IAU 2015 Resolution B2 absolute bolometric magnitude of the Sun
export const M_BOL_SUN = 4.74;

/** Stefan–Boltzmann law: R/R☉ = √(L/L☉) · (T☉/T)². */
export function radiusFromLumTemp(lumSolar, tempK) {
  return Math.sqrt(lumSolar) * (T_SUN / tempK) ** 2;
}

/** Stefan–Boltzmann law: L/L☉ = (R/R☉)² · (T/T☉)⁴. */
export function lumFromRadiusTemp(radiusSolar, tempK) {
  return radiusSolar ** 2 * (tempK / T_SUN) ** 4;
}

/** Absolute bolometric magnitude: M_bol = M_bol,☉ − 2.5 log₁₀(L/L☉). */
export function lumToBolometricMag(lumSolar) {
  return M_BOL_SUN - 2.5 * Math.log10(Math.max(1e-12, lumSolar));
}

/**
 * Zero-age main-sequence luminosity from mass, piecewise power law
 * (Duric 2004, Advanced Astrophysics, §8.3): L ∝ M^2.3, M^4, M^3.5.
 */
export function msLuminosity(massSolar) {
  if (massSolar < 0.43) return 0.23 * massSolar ** 2.3;
  if (massSolar < 2) return massSolar ** 4;
  return 1.4 * massSolar ** 3.5;
}

/** Main-sequence radius from mass: R ∝ M^0.8 below 1 M☉, M^0.57 above. */
export function msRadius(massSolar) {
  return massSolar < 1 ? massSolar ** 0.8 : massSolar ** 0.57;
}

/**
 * Approximate main-sequence lifetime t ≈ 10 Gyr · (M/M☉)^−2.5, from t ∝ M/L with
 * L ∝ M^3.5. It overestimates lifetimes of massive stars (≳ 5 M☉), whose
 * luminosity grows more slowly with mass.
 */
export function msLifetimeYears(massSolar) {
  return 10e9 * massSolar ** -2.5;
}

/** Main-sequence turn-off mass for a population of the given age (inverse of the above). */
export function turnoffMass(ageYears) {
  return (ageYears / 10e9) ** (-1 / 2.5);
}
