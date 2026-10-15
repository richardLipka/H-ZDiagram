/**
 * Approximate colour of a blackbody of temperature T as an sRGB value.
 * Tanner Helland's fit to Mitchell Charity's blackbody colour table,
 * valid for 1,000 K – 40,000 K (input is clamped to that range).
 */
export function temperatureToRGB(tempK) {
  const temp = Math.max(1000, Math.min(40000, tempK)) / 100;
  let red, green, blue;

  // Red
  if (temp <= 66) {
    red = 255;
  } else {
    red = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    red = Math.max(0, Math.min(255, red));
  }

  // Green
  if (temp <= 66) {
    green = 99.4708025861 * Math.log(temp) - 161.1195681661;
  } else {
    green = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
  }
  green = Math.max(0, Math.min(255, green));

  // Blue
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
    blue = Math.max(0, Math.min(255, blue));
  }

  const r = Math.round(red);
  const g = Math.round(green);
  const b = Math.round(blue);
  return {
    r,
    g,
    b,
    css: `rgb(${r}, ${g}, ${b})`,
    hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  };
}
