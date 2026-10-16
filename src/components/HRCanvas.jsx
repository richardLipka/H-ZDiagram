import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { HRCoordinates, SPECTRAL_CLASSES, CONSTANT_RADII, DEFAULT_BOUNDS } from '../utils/coordinates';
import { temperatureToRGB } from '../simulation/blackbody';
import { mainSequenceParams, MAMAJEK_DWARF_SEQUENCE } from '../simulation/mainSequence';
import { radiusFromLumTemp } from '../simulation/physics';
import { useLanguage } from '../i18n/LanguageContext';
import { formatSig, formatInt } from '../utils/format';

const MARGINS = { top: 68, right: 75, bottom: 65, left: 85 };
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 6.0;

/** Whether a star has confirmed exoplanets or planetary companions. */
function hasPlanetarySystem(star) {
  if (!star) return false;
  return Boolean(star.hasExoplanets || (star.planetCount && star.planetCount > 0) || (star.exoplanetCount && star.exoplanetCount > 0));
}

/** Whether a catalogue star passes the active filters. */
function isVisible(star, { filterClass, filterPlanetsOnly, filterSearch, showRelativisticRemnants }) {
  if (filterClass !== 'ALL') {
    const spec = star.spectralType || '';
    if (filterClass === 'D' ? star.luminosityClass !== 'D' : !spec.startsWith(filterClass)) return false;
  }
  if (filterPlanetsOnly && !hasPlanetarySystem(star)) return false;
  if (filterSearch && !star.name.toLowerCase().includes(filterSearch.toLowerCase())) return false;
  if (star.isExotic && !showRelativisticRemnants) return false;
  return true;
}

/** Canvas position of a star; objects hotter than the axis are pinned to its edge. */
function starPosition(coords, star) {
  const offScale = star.temp > DEFAULT_BOUNDS.maxTemp;
  const pos = coords.toCanvas(Math.min(star.temp, DEFAULT_BOUNDS.maxTemp), star.lum);
  return { ...pos, offScale };
}

export default function HRCanvas({
  famousStars,
  backgroundStars,
  selectedStar,
  onSelectStar,
  activeMode,
  evolutionState,
  evolutionTrackPoints,
  clusterIsochrone,
  clusterMembers,
  clusterAgeGyr,
  filterClass,
  filterPlanetsOnly,
  filterSearch,
  showNamedStars = true,
  showIsoradii,
  showRegions,
  showBackgroundPopulation,
  showFamousLabels,
  showGaiaFineStructure,
  showRelativisticRemnants
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { lang, t } = useLanguage();

  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredStar, setHoveredStar] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  const dragRef = useRef({ isDown: false, hasMoved: false, startX: 0, startY: 0, panX: 0, panY: 0 });
  const filters = useMemo(
    () => ({ filterClass, filterPlanetsOnly, filterSearch, showRelativisticRemnants }),
    [filterClass, filterPlanetsOnly, filterSearch, showRelativisticRemnants]
  );

  // Track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const clampZoom = (z) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number(z.toFixed(3))));
  const handleResetView = useCallback(() => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  }, []);

  // Ctrl/⌘ + wheel (and trackpad pinch) zooms. The listener must be non-passive
  // to be allowed to cancel the browser's own page zoom.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = Math.max(0.7, Math.min(1.3, 1 - e.deltaY * 0.002));
      setZoom((z) => clampZoom(z * factor));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);

    const coords = new HRCoordinates(width, height, MARGINS);
    coords.setTransform(zoom, pan.x, pan.y);

    const plotLeft = MARGINS.left;
    const plotTop = MARGINS.top;
    const plotRight = width - MARGINS.right;
    const plotBottom = height - MARGINS.bottom;
    const plotW = plotRight - plotLeft;
    const plotH = plotBottom - plotTop;
    const clipToPlot = () => {
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();
    };

    // 1. Background
    ctx.fillStyle = '#010308';
    ctx.fillRect(0, 0, width, height);
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.45, 100, width * 0.5, height * 0.5, Math.max(width, height) * 0.8);
    bgGrad.addColorStop(0, 'rgba(4, 18, 48, 0.45)');
    bgGrad.addColorStop(0.6, 'rgba(2, 8, 24, 0.7)');
    bgGrad.addColorStop(1, '#010308');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(2, 6, 16, 0.85)';
    ctx.fillRect(plotLeft, plotTop, plotW, plotH);

    // 2. Regions of the diagram
    if (showRegions) {
      ctx.save();
      clipToPlot();

      // Main-sequence band
      ctx.fillStyle = 'rgba(0, 140, 255, 0.06)';
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
      ctx.lineWidth = 1;
      const msTop = [[35000, 150000], [20000, 10000], [10000, 100], [6000, 3.5], [3000, 0.02], [2200, 0.0004]];
      const msBottom = [[2200, 0.00002], [3000, 0.001], [6000, 0.3], [10000, 10], [20000, 800], [35000, 15000]];
      ctx.beginPath();
      [...msTop, ...msBottom].forEach(([tK, l], i) => {
        const p = coords.toCanvas(tK, l);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Classical instability strip (Cepheids, RR Lyrae, δ Scuti)
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      [[7500, 80000], [5200, 80000], [5800, 10], [8200, 10]].forEach(([tK, l], i) => {
        const p = coords.toCanvas(tK, l);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.textAlign = 'center';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
      const isCenter = coords.toCanvas(6500, 2500);
      ctx.fillText(t('canvasInstabilityStrip'), isCenter.x, isCenter.y);

      ctx.font = '600 11px "Orbitron", sans-serif';
      ctx.fillStyle = 'rgba(200, 230, 255, 0.7)';
      const wdCenter = coords.toCanvas(16000, 0.0015);
      ctx.fillText(t('canvasWhiteDwarfs'), wdCenter.x, wdCenter.y);

      ctx.fillStyle = 'rgba(255, 140, 140, 0.8)';
      const rgCenter = coords.toCanvas(3400, 2500);
      ctx.fillText(t('canvasRedGiants'), rgCenter.x, rgCenter.y);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      const sgCenter = coords.toCanvas(8000, 300000);
      ctx.fillText(t('canvasSupergiants'), sgCenter.x, sgCenter.y);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.font = '700 11px "Orbitron", sans-serif';
      const msLabel = coords.toCanvas(13000, 0.4);
      ctx.fillText(t('canvasMainSequence'), msLabel.x, msLabel.y);
      ctx.restore();
    }

    // 3. Lines of constant radius
    if (showIsoradii) {
      ctx.save();
      clipToPlot();
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.16)';
      ctx.setLineDash([2, 5]);
      ctx.lineWidth = 1;
      for (const radius of CONSTANT_RADII) {
        const p1 = coords.toCanvas(DEFAULT_BOUNDS.maxTemp, HRCoordinates.getLumForRadius(radius, DEFAULT_BOUNDS.maxTemp));
        const p2 = coords.toCanvas(DEFAULT_BOUNDS.minTemp, HRCoordinates.getLumForRadius(radius, DEFAULT_BOUNDS.minTemp));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const pLabel = coords.toCanvas(11000, HRCoordinates.getLumForRadius(radius, 11000));
        if (coords.isInPlotBounds(pLabel.x, pLabel.y)) {
          ctx.save();
          ctx.translate(pLabel.x, pLabel.y);
          ctx.rotate(Math.atan2(p2.y - p1.y, p2.x - p1.x));
          ctx.font = '500 9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
          ctx.fillText(`R = ${formatSig(radius, lang)} R☉`, 0, -3);
          ctx.restore();
        }
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 4. Fine structure seen in Gaia H–R diagrams
    if (showGaiaFineStructure) {
      ctx.save();
      clipToPlot();

      // Unresolved equal-mass binaries: same colour, twice the luminosity (0.75 mag brighter)
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      MAMAJEK_DWARF_SEQUENCE.filter(([, tK]) => tK <= 40000).forEach(([, tK, logL], i) => {
        const p = coords.toCanvas(tK, 2 * 10 ** logL);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      const binMs = mainSequenceParams(9);
      const binPos = coords.toCanvas(binMs.temp, 2 * binMs.lum);
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'left';
      ctx.fillText(t('canvasBinarySequence'), binPos.x + 8, binPos.y - 6);

      // Jao gap: onset of full convection near 0.35 M☉ (Jao et al. 2018)
      const jao = mainSequenceParams(0.35);
      const jaoPos = coords.toCanvas(jao.temp, jao.lum);
      ctx.strokeStyle = '#ff9900';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(jaoPos.x - 30, jaoPos.y - 8);
      ctx.lineTo(jaoPos.x + 30, jaoPos.y + 8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffaa00';
      ctx.textAlign = 'right';
      ctx.fillText(t('canvasJaoGap'), jaoPos.x - 36, jaoPos.y + 14);
      ctx.textAlign = 'left';

      // Crystallizing massive white dwarfs (Q branch; Tremblay et al. 2019, Cheng et al. 2019)
      const qPos = coords.toCanvas(10000, 6e-4);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.2;
      ctx.fillRect(qPos.x - 6, qPos.y - 6, 12, 12);
      ctx.strokeRect(qPos.x - 6, qPos.y - 6, 12, 12);
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(t('canvasCrystallization'), qPos.x + 12, qPos.y + 3);
      ctx.restore();
    }

    // 5. Compact remnants annotations
    if (showRelativisticRemnants) {
      ctx.save();
      clipToPlot();
      // Neutron stars are far hotter and smaller than anything on this chart
      const nsPos = coords.toCanvas(DEFAULT_BOUNDS.maxTemp, 0.03);
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#e9d5ff';
      ctx.textAlign = 'left';
      ctx.fillText(t('canvasNeutronStars'), nsPos.x + 22, nsPos.y + 3);

      const cyg = famousStars.find((s) => s.id === 'cygnus_x1');
      if (cyg) {
        const bhPos = coords.toCanvas(cyg.temp, cyg.lum);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bhPos.x, bhPos.y, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fda4af';
        ctx.fillText(t('canvasCygX1'), bhPos.x + 22, bhPos.y + 22);
      }
      ctx.restore();

      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'left';
      ctx.fillText(t('canvasMassLimits'), plotLeft + 12, plotBottom - 52);
    }

    // 6. Grid and axis labels
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = '500 10px "JetBrains Mono", monospace';
    for (const lum of [1e6, 1e4, 1e2, 1, 1e-2, 1e-4]) {
      const p = coords.toCanvas(10000, lum);
      if (p.y < plotTop || p.y > plotBottom) continue;
      ctx.strokeStyle = 'rgba(0, 170, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(plotLeft, p.y);
      ctx.lineTo(plotRight, p.y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(plotLeft, p.y);
      ctx.lineTo(plotLeft + 5, p.y);
      ctx.moveTo(plotRight - 5, p.y);
      ctx.lineTo(plotRight, p.y);
      ctx.stroke();

      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'right';
      const exp = Math.round(Math.log10(lum));
      ctx.fillText(exp === 0 ? '1' : `10${exp < 0 ? '⁻' : ''}${String(Math.abs(exp)).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')}`, plotLeft - 8, p.y);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      const mbol = HRCoordinates.lumToBolMag(lum);
      ctx.fillText(`${mbol < 0 ? '−' : '+'}${formatSig(Math.abs(mbol), lang, 3)}`, plotRight + 8, p.y);
    }
    let lastTickX = -Infinity;
    for (const tK of [40000, 30000, 20000, 10000, 7500, 6000, 5000, 4000, 3000, 2000]) {
      const p = coords.toCanvas(tK, 1);
      if (p.x < plotLeft || p.x > plotRight) continue;
      // Skip labels that would collide with the previous one on narrow canvases
      const showLabel = p.x - lastTickX > 44;
      if (showLabel) lastTickX = p.x;
      ctx.strokeStyle = 'rgba(0, 170, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(p.x, plotTop);
      ctx.lineTo(p.x, plotBottom);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(p.x, plotTop);
      ctx.lineTo(p.x, plotTop + 5);
      ctx.moveTo(p.x, plotBottom - 5);
      ctx.lineTo(p.x, plotBottom);
      ctx.stroke();
      ctx.fillStyle = '#d9e6f7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      if (showLabel) ctx.fillText(formatInt(tK, lang), p.x, plotBottom + 8);
    }
    ctx.restore();

    // 7. Spectral class ribbon
    ctx.save();
    const headerY = plotTop - 32;
    const headerHeight = 24;
    for (const spec of SPECTRAL_CLASSES) {
      const left = Math.max(plotLeft, Math.min(plotRight, coords.toCanvas(spec.tempRange[1], 1).x));
      const right = Math.max(plotLeft, Math.min(plotRight, coords.toCanvas(spec.tempRange[0], 1).x));
      if (right - left < 2) continue;
      ctx.fillStyle = 'rgba(0, 20, 48, 0.7)';
      ctx.fillRect(left, headerY, right - left, headerHeight);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.strokeRect(left, headerY, right - left, headerHeight);
      ctx.fillStyle = spec.color;
      ctx.fillRect(left + 1, headerY, right - left - 2, 2.5);
      if (right - left > 14) {
        ctx.font = '700 12px "Orbitron", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(spec.class, (left + right) / 2, headerY + headerHeight / 2 + 1);
      }
    }
    ctx.restore();

    // 8. Background population (Hipparcos stars with parallax errors < 10 %)
    if (showBackgroundPopulation && !filterPlanetsOnly && backgroundStars && backgroundStars.length > 0) {
      ctx.save();
      clipToPlot();
      for (const [temp, lum, specClass] of backgroundStars) {
        if (filterClass !== 'ALL' && specClass !== filterClass) continue;
        const pos = coords.toCanvas(temp, lum);
        if (!coords.isInPlotBounds(pos.x, pos.y)) continue;
        const rgb = temperatureToRGB(temp);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.65)`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 9. Cluster isochrone and turn-off
    if (activeMode === 'cluster' && clusterIsochrone && clusterIsochrone.points) {
      ctx.save();
      clipToPlot();
      const { points, postMsIndex, turnoff } = clusterIsochrone;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      const drawSegment = (segment, dashed) => {
        ctx.setLineDash(dashed ? [6, 5] : []);
        ctx.beginPath();
        segment.forEach((pt, i) => {
          const p = coords.toCanvas(pt.temp, pt.lum);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      };
      drawSegment(points.slice(0, postMsIndex + 1), false);
      drawSegment(points.slice(postMsIndex), true);
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      const toPos = coords.toCanvas(turnoff.tempK, turnoff.lumLsun);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(toPos.x, toPos.y, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(toPos.x, toPos.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(t('canvasTurnoff', { mass: formatSig(turnoff.massMsun, lang, 2) }), toPos.x + 14, toPos.y + 4);

      // Real members of the cluster closest in age
      const activeClusterKey = clusterAgeGyr < 0.3 ? 'pleiades' : clusterAgeGyr < 1.5 ? 'hyades' : null;
      const members = activeClusterKey && clusterMembers ? clusterMembers[activeClusterKey] : null;
      if (members && members.length > 0) {
        const color = activeClusterKey === 'pleiades' ? '#00f0ff' : '#ffbe80';
        for (const [temp, lum, , , name] of members) {
          const pos = coords.toCanvas(temp, lum);
          if (!coords.isInPlotBounds(pos.x, pos.y)) continue;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = temperatureToRGB(temp).css;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          if (name) {
            ctx.font = '600 10px "JetBrains Mono", monospace';
            ctx.fillStyle = color;
            ctx.fillText(name, pos.x + 8, pos.y + 3);
          }
        }
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'right';
        ctx.fillText(t(activeClusterKey === 'pleiades' ? 'canvasPleiadesMembers' : 'canvasHyadesMembers'), plotRight - 12, plotTop + 18);
      }
      ctx.restore();
    }

    // 10. Evolutionary track
    if (activeMode === 'evolution' && evolutionTrackPoints && evolutionTrackPoints.length > 0) {
      ctx.save();
      clipToPlot();
      const drawable = evolutionTrackPoints.filter((s) => s.temp !== null);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 3]);
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      drawable.forEach((s, i) => {
        const p = coords.toCanvas(s.temp, s.lum);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      for (const s of drawable) {
        const p = coords.toCanvas(s.temp, s.lum);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (evolutionState) {
        const label = `${lang === 'cs' ? evolutionState.stageCs : evolutionState.stage}`;
        ctx.font = '700 12px "Orbitron", sans-serif';
        ctx.textAlign = 'left';
        if (evolutionState.noPhotosphere) {
          ctx.fillStyle = '#fda4af';
          ctx.fillText(t('canvasNoPhotosphere'), plotLeft + 14, plotTop + 22);
        } else {
          let pos = coords.toCanvas(evolutionState.temp, evolutionState.lum);
          const outside = !coords.isInPlotBounds(pos.x, pos.y);
          if (outside) {
            // Pin to the nearest edge and point outwards
            pos = { x: Math.max(plotLeft + 14, Math.min(plotRight - 14, pos.x)), y: Math.max(plotTop + 14, Math.min(plotBottom - 14, pos.y)) };
          }
          const rgb = temperatureToRGB(evolutionState.temp);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(pos.x - 18, pos.y); ctx.lineTo(pos.x - 10, pos.y);
          ctx.moveTo(pos.x + 10, pos.y); ctx.lineTo(pos.x + 18, pos.y);
          ctx.moveTo(pos.x, pos.y - 18); ctx.lineTo(pos.x, pos.y - 10);
          ctx.moveTo(pos.x, pos.y + 10); ctx.lineTo(pos.x, pos.y + 18);
          ctx.stroke();
          ctx.fillStyle = rgb.css;
          ctx.shadowColor = rgb.css;
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          const text = outside ? `${label} ${t('canvasOffScale')}` : label;
          const textWidth = ctx.measureText(text).width;
          const rightSide = pos.x + 22 + textWidth < plotRight;
          ctx.textAlign = rightSide ? 'left' : 'right';
          ctx.fillText(text, rightSide ? pos.x + 22 : pos.x - 22, pos.y + 4);
        }
      }
      ctx.restore();
    }

    // 11. Catalogue stars
    ctx.save();
    clipToPlot();
    for (const star of famousStars) {
      if (!showNamedStars && !star.isCustom && !filterPlanetsOnly) continue;
      if (!isVisible(star, filters)) continue;
      const pos = starPosition(coords, star);
      if (!coords.isInPlotBounds(pos.x, pos.y)) continue;

      const rgb = temperatureToRGB(star.temp);
      const isSelected = selectedStar && selectedStar.id === star.id;
      const isHovered = hoveredStar && hoveredStar.id === star.id;
      const starHasPlanets = hasPlanetarySystem(star);
      let dotRadius = star.isCustom ? 5.5 : 4;
      if (star.luminosityClass === 'I') dotRadius = 6.5;
      else if (star.luminosityClass === 'III' || star.luminosityClass === 'II') dotRadius = 5.2;
      else if (star.luminosityClass === 'D') dotRadius = 3.2;

      // Draw planetary orbit indicator around stars with confirmed planets
      if (starHasPlanets) {
        const ringR = dotRadius + (filterPlanetsOnly ? 5 : 3.5);
        ctx.strokeStyle = filterPlanetsOnly ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = filterPlanetsOnly ? 1.5 : 1;
        ctx.setLineDash(filterPlanetsOnly ? [] : [2, 2]);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small satellite planet dot
        const angle = -0.7;
        const px = pos.x + Math.cos(angle) * ringR;
        const py = pos.y + Math.sin(angle) * ringR;
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(px, py, filterPlanetsOnly ? 2 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isSelected || isHovered) {
        const r = dotRadius + 8;
        const c = 5;
        ctx.strokeStyle = isSelected ? '#00f0ff' : '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pos.x - r, pos.y - r + c); ctx.lineTo(pos.x - r, pos.y - r); ctx.lineTo(pos.x - r + c, pos.y - r);
        ctx.moveTo(pos.x + r - c, pos.y - r); ctx.lineTo(pos.x + r, pos.y - r); ctx.lineTo(pos.x + r, pos.y - r + c);
        ctx.moveTo(pos.x - r, pos.y + r - c); ctx.lineTo(pos.x - r, pos.y + r); ctx.lineTo(pos.x - r + c, pos.y + r);
        ctx.moveTo(pos.x + r - c, pos.y + r); ctx.lineTo(pos.x + r, pos.y + r); ctx.lineTo(pos.x + r, pos.y + r - c);
        ctx.stroke();
        ctx.shadowColor = isSelected ? '#00f0ff' : '#ffffff';
        ctx.shadowBlur = 16;
      }

      if (star.isCustom) {
        // Custom star: distinctive glowing diamond marker
        const dSize = dotRadius + 3;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.fillStyle = rgb.css;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - dSize);
        ctx.lineTo(pos.x + dSize, pos.y);
        ctx.lineTo(pos.x, pos.y + dSize);
        ctx.lineTo(pos.x - dSize, pos.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (pos.offScale) {
        // Off-scale object: arrow pointing to the hot side
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(pos.x - 2, pos.y);
        ctx.lineTo(pos.x + 10, pos.y - 6);
        ctx.lineTo(pos.x + 10, pos.y + 6);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = rgb.css;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      if (showFamousLabels || isSelected || isHovered || star.isCustom || (filterPlanetsOnly && starHasPlanets)) {
        ctx.font = isSelected ? '700 11px "JetBrains Mono", monospace' : '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = isSelected ? '#00f0ff' : star.isCustom ? '#38bdf8' : filterPlanetsOnly ? '#e0f2fe' : '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'left';
        const prefix = star.isCustom ? '✦ ' : '';
        const planetCountNum = star.exoplanetCount || star.planetCount || 0;
        const planetTag = (filterPlanetsOnly && planetCountNum > 0) ? ` 🪐 ${planetCountNum}` : '';
        ctx.fillText(pos.offScale ? `${prefix}${star.name} (${formatInt(star.temp, lang)} K)` : `${prefix}${star.name}${planetTag}`, pos.x + dotRadius + 8, pos.y + 3);
        ctx.shadowBlur = 0;
      }
    }
    ctx.restore();

    // 12. Frame and axis titles
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plotLeft, plotTop, plotW, plotH);
    const cSize = 16;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    for (const [x, y, dx, dy] of [[plotLeft, plotTop, 1, 1], [plotRight, plotTop, -1, 1], [plotLeft, plotBottom, 1, -1], [plotRight, plotBottom, -1, -1]]) {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * cSize);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * cSize, y);
      ctx.stroke();
    }

    ctx.font = '700 11px "Orbitron", sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(t('axisTemperature'), plotLeft + plotW / 2, height - 12);
    ctx.font = '700 9px "Orbitron", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(t('axisSpectral'), plotLeft - 6, plotTop - 16);
    ctx.font = '700 11px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(22, plotTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(t('axisLuminosity'), 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(width - 15, plotTop + plotH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(t('axisBolometricMag'), 0, 0);
    ctx.restore();
  }, [
    zoom, pan, dimensions, famousStars, backgroundStars, selectedStar, hoveredStar, activeMode,
    evolutionState, evolutionTrackPoints, clusterIsochrone, clusterMembers, clusterAgeGyr,
    filters, filterClass, filterPlanetsOnly, filterSearch, showNamedStars, showIsoradii, showRegions, showBackgroundPopulation,
    showFamousLabels, showGaiaFineStructure, showRelativisticRemnants, lang, t
  ]);

  const coordsForRect = (rect) => {
    const coords = new HRCoordinates(rect.width, rect.height, MARGINS);
    coords.setTransform(zoom, pan.x, pan.y);
    return coords;
  };

  // Nearest visible catalogue or background star to a point within maxDist pixels
  const hitTest = (x, y, rect, maxDist) => {
    const coords = coordsForRect(rect);
    let found = null;
    let minD = maxDist;

    // 1. Check named & custom stars
    for (const star of famousStars) {
      if (!showNamedStars && !star.isCustom && !filterPlanetsOnly) continue;
      if (!isVisible(star, filters)) continue;
      const p = starPosition(coords, star);
      if (!coords.isInPlotBounds(p.x, p.y)) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < minD) {
        minD = d;
        found = star;
      }
    }

    // 2. If nothing matched and Hipparcos background population is visible, check background survey stars
    if (!found && showBackgroundPopulation && !filterPlanetsOnly && backgroundStars && backgroundStars.length > 0) {
      let bgMinD = Math.min(maxDist, 10);
      for (let i = 0; i < backgroundStars.length; i++) {
        const [temp, lum, specClass, lumClass] = backgroundStars[i];
        if (filterClass !== 'ALL' && specClass !== filterClass) continue;
        const p = coords.toCanvas(temp, lum);
        if (!coords.isInPlotBounds(p.x, p.y)) continue;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bgMinD) {
          bgMinD = d;
          const rad = radiusFromLumTemp(lum, temp);
          found = {
            id: `hip_bg_${i}`,
            name: `${lang === 'cs' ? 'Hvězda pole Hipparcos' : 'Hipparcos field star'} #${i + 1}`,
            temp,
            lum,
            radius: rad,
            spectralType: `${specClass}${lumClass || 'V'}`,
            spectralClass: specClass,
            luminosityClass: lumClass || 'V',
            absMag: Number((4.74 - 2.5 * Math.log10(Math.max(1e-6, lum))).toFixed(2)),
            isBackgroundFieldStar: true,
            dataSource: 'hipparcos_survey',
            notableFacts: `Point from the Hipparcos catalog background survey (van Leeuwen 2007) with relative parallax error < 10%. Effective temperature: ${formatInt(temp, 'en')} K, Luminosity: ${formatSig(lum, 'en')} L☉.`,
            notableFactsCs: `Objekt z přehlídky katalogu Hipparcos (van Leeuwen 2007) s chybou paralaxy pod 10 %. Efektivní teplota: ${formatInt(temp, 'cs')} K, zářivý výkon: ${formatSig(lum, 'cs')} L☉.`
          };
        }
      }
    }
    return found;
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    try {
      canvasRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // pointer capture is optional
    }
    dragRef.current = { isDown: true, hasMoved: false, startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (dragRef.current.isDown) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 4) dragRef.current.hasMoved = true;
      if (dragRef.current.hasMoved) {
        setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
        setHoveredStar(null);
        return;
      }
    }
    if (e.pointerType === 'mouse') setHoveredStar(hitTest(x, y, rect, 18));
  };

  const endDrag = (e) => {
    dragRef.current.isDown = false;
    dragRef.current.hasMoved = false;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture is optional
    }
  };

  const handlePointerUp = (e) => {
    const wasDragging = dragRef.current.hasMoved;
    endDrag(e);
    if (wasDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const target = hitTest(e.clientX - rect.left, e.clientY - rect.top, rect, e.pointerType === 'mouse' ? 18 : 26);
    if (target) onSelectStar(target);
  };

  // Keyboard: arrows pan, +/− zoom, 0 resets
  const handleKeyDown = (e) => {
    const step = 40;
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      setZoom((z) => clampZoom(z * 1.25));
    } else if (e.key === '-') {
      e.preventDefault();
      setZoom((z) => clampZoom(z * 0.8));
    } else if (e.key === '0') {
      e.preventDefault();
      handleResetView();
    }
  };

  // Keep the tooltip inside the canvas
  const TOOLTIP_W = 230;
  const TOOLTIP_H = 150;
  const tooltipLeft = mousePos.x + 18 + TOOLTIP_W > dimensions.width ? mousePos.x - 18 - TOOLTIP_W : mousePos.x + 18;
  const tooltipTop = Math.max(4, Math.min(dimensions.height - TOOLTIP_H, mousePos.y - 20));

  return (
    <div className="hr-canvas-container hud-canvas-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="hr-canvas"
        role="img"
        tabIndex={0}
        aria-label={t('canvasAriaLabel')}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={endDrag}
        onPointerLeave={() => setHoveredStar(null)}
        onKeyDown={handleKeyDown}
      />

      <div className="canvas-telemetry-tl" aria-hidden="true">
        <span className="telemetry-item">{t('canvasHelp')}</span>
        {filterPlanetsOnly && (
          <span className="telemetry-item telemetry-filter-active">
            🪐 {t('activePlanetsFilter', { count: famousStars.filter(hasPlanetarySystem).length })}
          </span>
        )}
      </div>

      <div className="canvas-overlay-controls hud-canvas-controls">
        <span className="canvas-zoom-readout" aria-live="polite">{t('zoomLabel')} {formatSig(zoom, lang, 3)}×</span>
        <button type="button" className="canvas-btn hud-square-btn" onClick={() => setZoom((z) => clampZoom(z * 1.25))} title={t('zoomIn')} aria-label={t('zoomIn')}>
          +
        </button>
        <button type="button" className="canvas-btn hud-square-btn" onClick={() => setZoom((z) => clampZoom(z * 0.8))} title={t('zoomOut')} aria-label={t('zoomOut')}>
          −
        </button>
        <button type="button" className="canvas-btn hud-square-btn reset-btn" onClick={handleResetView} title={t('resetViewTitle')}>
          {t('recalibrateBtn')}
        </button>
      </div>

      {hoveredStar && (
        <div className="star-hover-tooltip hud-tooltip" style={{ left: `${tooltipLeft}px`, top: `${tooltipTop}px` }}>
          <div className="tooltip-header hud-tooltip-header">
            <span className="tooltip-dot" style={{ backgroundColor: temperatureToRGB(hoveredStar.temp).css }} />
            <strong>{hoveredStar.name}</strong>
          </div>
          <div className="tooltip-details hud-tooltip-details">
            <div><span>{t('classLabel')}</span> {hoveredStar.spectralType}</div>
            <div><span>{t('tempLabel')}</span> {formatInt(hoveredStar.temp, lang)} K</div>
            <div><span>{t('lumLabel')}</span> {formatSig(hoveredStar.lum, lang)} L☉</div>
            <div><span>{t('radiusLabel')}</span> {formatSig(hoveredStar.radius, lang)} R☉</div>
            {hasPlanetarySystem(hoveredStar) && (
              <div className="tooltip-planet-tag">{t('tooltipExoplanets', { count: hoveredStar.exoplanetCount || hoveredStar.planetCount || 1 })}</div>
            )}
            <div className="tooltip-action-hint">{t('tooltipClickHint')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
