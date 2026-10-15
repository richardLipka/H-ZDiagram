/**
 * Coordinate transformations for the Hertzsprung-Russell Diagram.
 * Handles logarithmic axes, reversed temperature direction, pan, zoom,
 * and conversions between physical astrophysics units and canvas pixel space.
 */

export const DEFAULT_BOUNDS = {
  // Temperature (K) - reversed: hot on left, cool on right
  minTemp: 2000,
  maxTemp: 45000,

  // Luminosity (L / L_sun) - log scale
  minLum: 0.00001, // 10^-5
  maxLum: 1000000  // 10^6
};

export const SPECTRAL_CLASSES = [
  { class: 'O', tempRange: [30000, 50000], color: '#9bb0ff', desc: 'Ionized helium, blue' },
  { class: 'B', tempRange: [10000, 30000], color: '#bbccff', desc: 'Neutral helium, blue-white' },
  { class: 'A', tempRange: [7500, 10000], color: '#f8f9ff', desc: 'Hydrogen Balmer lines, white' },
  { class: 'F', tempRange: [6000, 7500], color: '#ffffed', desc: 'Weak ionized calcium, yellow-white' },
  { class: 'G', tempRange: [5200, 6000], color: '#fff4e8', desc: 'Solar type, neutral metals, yellow' },
  { class: 'K', tempRange: [3700, 5200], color: '#ffd2a1', desc: 'Molecular bands, orange' },
  { class: 'M', tempRange: [2000, 3700], color: '#ff6060', desc: 'Titanium oxide, red' }
];

export const CONSTANT_RADII = [
  { radius: 0.001, label: "0.001 R☉ (Earth / White Dwarf)" },
  { radius: 0.01, label: "0.01 R☉" },
  { radius: 0.1, label: "0.1 R☉ (Jupiter / Brown Dwarf)" },
  { radius: 1.0, label: "1.0 R☉ (Solar Radius)" },
  { radius: 10.0, label: "10 R☉ (Subgiant / Bright)" },
  { radius: 100.0, label: "100 R☉ (Red Giant)" },
  { radius: 1000.0, label: "1000 R☉ (Supergiant / Jupiter Orbit)" }
];

export class HRCoordinates {
  constructor(width, height, margins = { top: 60, right: 70, bottom: 65, left: 80 }) {
    this.width = width;
    this.height = height;
    this.margins = margins;

    this.plotWidth = Math.max(10, width - margins.left - margins.right);
    this.plotHeight = Math.max(10, height - margins.top - margins.bottom);

    this.minTemp = DEFAULT_BOUNDS.minTemp;
    this.maxTemp = DEFAULT_BOUNDS.maxTemp;
    this.minLum = DEFAULT_BOUNDS.minLum;
    this.maxLum = DEFAULT_BOUNDS.maxLum;

    this.logMinTemp = Math.log10(this.minTemp);
    this.logMaxTemp = Math.log10(this.maxTemp);
    this.logMinLum = Math.log10(this.minLum);
    this.logMaxLum = Math.log10(this.maxLum);

    // Pan & Zoom state
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  setDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.plotWidth = Math.max(10, width - this.margins.left - this.margins.right);
    this.plotHeight = Math.max(10, height - this.margins.top - this.margins.bottom);
  }

  setTransform(zoom, panX, panY) {
    this.zoom = zoom;
    this.panX = panX;
    this.panY = panY;
  }

  /**
   * Convert Temperature (K) and Luminosity (L_sun) to Canvas (x, y) pixels.
   * Remember: Temperature is reversed (maxTemp is at left, minTemp is at right).
   */
  toCanvas(tempK, lumSolar) {
    const safeTemp = Math.max(1000, Math.min(80000, tempK));
    const safeLum = Math.max(1e-7, Math.min(1e8, lumSolar));

    const logT = Math.log10(safeTemp);
    const logL = Math.log10(safeLum);

    // Normalized 0 to 1 inside plot area
    // Reverse temperature: logMaxTemp -> 0 (left), logMinTemp -> 1 (right)
    const normX = (this.logMaxTemp - logT) / (this.logMaxTemp - this.logMinTemp);
    // Standard luminosity: logMinLum -> 1 (bottom), logMaxLum -> 0 (top)
    const normY = (this.logMaxLum - logL) / (this.logMaxLum - this.logMinLum);

    // Apply plot bounds
    let px = this.margins.left + normX * this.plotWidth;
    let py = this.margins.top + normY * this.plotHeight;

    // Apply Pan & Zoom around center of plot
    const centerX = this.margins.left + this.plotWidth / 2;
    const centerY = this.margins.top + this.plotHeight / 2;

    px = (px - centerX) * this.zoom + centerX + this.panX;
    py = (py - centerY) * this.zoom + centerY + this.panY;

    return { x: px, y: py };
  }

  /**
   * Convert Canvas (x, y) pixels back to Temperature (K) and Luminosity (L_sun).
   */
  toAstrophysics(px, py) {
    const centerX = this.margins.left + this.plotWidth / 2;
    const centerY = this.margins.top + this.plotHeight / 2;

    // Un-zoom and un-pan
    const unscaledX = (px - centerX - this.panX) / this.zoom + centerX;
    const unscaledY = (py - centerY - this.panY) / this.zoom + centerY;

    const normX = (unscaledX - this.margins.left) / this.plotWidth;
    const normY = (unscaledY - this.margins.top) / this.plotHeight;

    const logT = this.logMaxTemp - normX * (this.logMaxTemp - this.logMinTemp);
    const logL = this.logMaxLum - normY * (this.logMaxLum - this.logMinLum);

    return {
      temp: Math.pow(10, logT),
      lum: Math.pow(10, logL)
    };
  }

  /**
   * Check if a canvas point is within the visible plot clipping rectangle.
   */
  isInPlotBounds(px, py) {
    return (
      px >= this.margins.left &&
      px <= this.width - this.margins.right &&
      py >= this.margins.top &&
      py <= this.height - this.margins.bottom
    );
  }

  /**
   * Calculate Luminosity for a constant radius R at temperature T:
   * L = R^2 * (T / 5778)^4
   */
  static getLumForRadius(radiusSolar, tempK) {
    return Math.pow(radiusSolar, 2) * Math.pow(tempK / 5778, 4);
  }

  /**
   * Convert Luminosity to Absolute Visual Magnitude: M_V = 4.83 - 2.5 * log10(L)
   */
  static lumToAbsMag(lum) {
    return 4.83 - 2.5 * Math.log10(Math.max(1e-8, lum));
  }

  /**
   * Convert Absolute Magnitude to Luminosity: L = 10^((4.83 - M_V) / 2.5)
   */
  static absMagToLum(absMag) {
    return Math.pow(10, (4.83 - absMag) / 2.5);
  }
}
