/**
 * Coordinate transformations for the Hertzsprung–Russell diagram:
 * logarithmic axes, reversed temperature direction, pan and zoom.
 */
import { T_SUN, M_BOL_SUN } from '../simulation/physics.js';

export const DEFAULT_BOUNDS = {
  // Effective temperature (K), reversed: hot on the left
  minTemp: 2000,
  maxTemp: 45000,
  // Luminosity (L / L☉), logarithmic
  minLum: 1e-5,
  maxLum: 1e6
};

// Boundaries between spectral classes on the main-sequence temperature scale
// (Pecaut & Mamajek 2013, ApJS 208, 9). Giants of the same class are cooler.
export const SPECTRAL_CLASSES = [
  { class: 'O', tempRange: [31000, 50000], color: '#9bb0ff' },
  { class: 'B', tempRange: [10000, 31000], color: '#bbccff' },
  { class: 'A', tempRange: [7300, 10000], color: '#f8f9ff' },
  { class: 'F', tempRange: [5950, 7300], color: '#ffffed' },
  { class: 'G', tempRange: [5300, 5950], color: '#fff4e8' },
  { class: 'K', tempRange: [3900, 5300], color: '#ffd2a1' },
  { class: 'M', tempRange: [2000, 3900], color: '#ff6060' }
];

// Lines of constant radius. Reference sizes: Earth ≈ 0.009 R☉ (white dwarfs ~0.008–0.02 R☉),
// Jupiter ≈ 0.10 R☉, red-clump giants ~10 R☉, 1 AU ≈ 215 R☉.
export const CONSTANT_RADII = [0.001, 0.01, 0.1, 1, 10, 100, 1000];

export class HRCoordinates {
  constructor(width, height, margins = { top: 60, right: 70, bottom: 65, left: 80 }) {
    this.width = width;
    this.height = height;
    this.margins = margins;

    this.plotWidth = Math.max(10, width - margins.left - margins.right);
    this.plotHeight = Math.max(10, height - margins.top - margins.bottom);

    this.logMinTemp = Math.log10(DEFAULT_BOUNDS.minTemp);
    this.logMaxTemp = Math.log10(DEFAULT_BOUNDS.maxTemp);
    this.logMinLum = Math.log10(DEFAULT_BOUNDS.minLum);
    this.logMaxLum = Math.log10(DEFAULT_BOUNDS.maxLum);

    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  setTransform(zoom, panX, panY) {
    this.zoom = zoom;
    this.panX = panX;
    this.panY = panY;
  }

  /**
   * Temperature (K) and luminosity (L☉) to canvas pixels. Values far outside the
   * diagram are clamped so that drawing code never receives infinities.
   */
  toCanvas(tempK, lumSolar) {
    const logT = Math.log10(Math.max(500, Math.min(1e7, tempK)));
    const logL = Math.log10(Math.max(1e-12, Math.min(1e12, lumSolar)));

    const normX = (this.logMaxTemp - logT) / (this.logMaxTemp - this.logMinTemp);
    const normY = (this.logMaxLum - logL) / (this.logMaxLum - this.logMinLum);

    let px = this.margins.left + normX * this.plotWidth;
    let py = this.margins.top + normY * this.plotHeight;

    // Pan & zoom around the centre of the plot
    const centerX = this.margins.left + this.plotWidth / 2;
    const centerY = this.margins.top + this.plotHeight / 2;
    px = (px - centerX) * this.zoom + centerX + this.panX;
    py = (py - centerY) * this.zoom + centerY + this.panY;

    return { x: px, y: py };
  }

  /**
   * Canvas pixels back to temperature (K) and luminosity (L☉).
   */
  toAstrophysics(px, py) {
    const centerX = this.margins.left + this.plotWidth / 2;
    const centerY = this.margins.top + this.plotHeight / 2;
    const unscaledX = (px - centerX - this.panX) / this.zoom + centerX;
    const unscaledY = (py - centerY - this.panY) / this.zoom + centerY;

    const normX = (unscaledX - this.margins.left) / this.plotWidth;
    const normY = (unscaledY - this.margins.top) / this.plotHeight;

    return {
      temp: 10 ** (this.logMaxTemp - normX * (this.logMaxTemp - this.logMinTemp)),
      lum: 10 ** (this.logMaxLum - normY * (this.logMaxLum - this.logMinLum))
    };
  }

  isInPlotBounds(px, py) {
    return (
      px >= this.margins.left &&
      px <= this.width - this.margins.right &&
      py >= this.margins.top &&
      py <= this.height - this.margins.bottom
    );
  }

  /** Luminosity of a star of radius R at temperature T: L = R² (T/T☉)⁴. */
  static getLumForRadius(radiusSolar, tempK) {
    return radiusSolar ** 2 * (tempK / T_SUN) ** 4;
  }

  /** Absolute bolometric magnitude: M_bol = 4.74 − 2.5 log₁₀(L/L☉) (IAU 2015 B2). */
  static lumToBolMag(lum) {
    return M_BOL_SUN - 2.5 * Math.log10(Math.max(1e-12, lum));
  }
}
