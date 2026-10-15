/**
 * Blackbody radiation and stellar physics utilities.
 */

/**
 * Approximate effective temperature (Kelvin) to RGB color.
 * Based on Tanner Helland's algorithm and Mitchell Charity's blackbody color data.
 * Valid for T from 1,000 K to 50,000 K.
 */
export function temperatureToRGB(tempK) {
  const temp = Math.max(1000, Math.min(50000, tempK)) / 100;
  let red, green, blue;

  // Red
  if (temp <= 66) {
    red = 255;
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    red = Math.max(0, Math.min(255, red));
  }

  // Green
  if (temp <= 66) {
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
    green = Math.max(0, Math.min(255, green));
  } else {
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
    green = Math.max(0, Math.min(255, green));
  }

  // Blue
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    blue = Math.max(0, Math.min(255, blue));
  }

  return {
    r: Math.round(red),
    g: Math.round(green),
    b: Math.round(blue),
    css: `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`,
    hex: `#${Math.round(red).toString(16).padStart(2, '0')}${Math.round(green).toString(16).padStart(2, '0')}${Math.round(blue).toString(16).padStart(2, '0')}`
  };
}

/**
 * Calculate stellar radius in Solar Radii (R_sun) using Stefan-Boltzmann Law:
 * L = 4 * pi * R^2 * sigma * T^4
 * R / R_sun = sqrt(L / L_sun) * (T_sun / T)^2, where T_sun = 5778 K
 */
export function calculateRadius(lumSolar, tempK) {
  if (!lumSolar || !tempK) return 1.0;
  const T_SUN = 5778;
  return Math.sqrt(lumSolar) * Math.pow(T_SUN / tempK, 2);
}

/**
 * Circumstellar Habitable Zone boundaries in Astronomical Units (AU)
 * Based on Kopparapu et al. (2013) habitable zone models.
 */
export function calculateHabitableZone(lumSolar, tempK) {
  if (!lumSolar || !tempK) return { innerAU: 0.95, outerAU: 1.67 };
  const T_diff = tempK - 5778;

  // Runaway Greenhouse (Inner edge)
  const S_inner = 1.0140 + 8.1774e-5 * T_diff + 1.7063e-9 * Math.pow(T_diff, 2);
  // Maximum Greenhouse (Outer edge)
  const S_outer = 0.3438 + 5.8942e-5 * T_diff + 1.6558e-9 * Math.pow(T_diff, 2);

  const innerAU = Math.sqrt(lumSolar / S_inner);
  const outerAU = Math.sqrt(lumSolar / S_outer);

  return {
    innerAU: parseFloat(innerAU.toFixed(3)),
    outerAU: parseFloat(outerAU.toFixed(3)),
    centerAU: parseFloat(((innerAU + outerAU) / 2).toFixed(3))
  };
}

/**
 * Estimated Main Sequence Lifetime (Gyr or Myr) based on initial stellar mass.
 * t_ms ~ 10 * (M / M_sun)^(-2.5) Gyr
 */
export function calculateLifetime(massSolar) {
  if (!massSolar || massSolar <= 0) return "Unknown";
  const years = 10e9 * Math.pow(massSolar, -2.5);

  if (years >= 1e12) {
    return `${(years / 1e12).toFixed(1)} Trillion yrs`;
  } else if (years >= 1e9) {
    return `${(years / 1e9).toFixed(2)} Billion yrs`;
  } else if (years >= 1e6) {
    return `${(years / 1e6).toFixed(1)} Million yrs`;
  } else {
    return `${Math.round(years).toLocaleString()} yrs`;
  }
}
