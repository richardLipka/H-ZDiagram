import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HRCoordinates, SPECTRAL_CLASSES, CONSTANT_RADII } from '../utils/coordinates';
import { temperatureToRGB } from '../simulation/blackbody';
import { useLanguage } from '../i18n/LanguageContext';

export default function HRCanvas({
  famousStars,
  backgroundStars,
  selectedStar,
  onSelectStar,
  activeMode, // 'explore' | 'evolution' | 'cluster' | 'compare'
  evolutionState,
  evolutionTrackPoints,
  clusterIsochrone,
  clusterMembers,
  clusterAgeGyr,
  filterClass, // 'ALL' | 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M' | 'D'
  filterPlanetsOnly,
  filterSearch,
  showIsoradii,
  showRegions,
  showBackgroundPopulation,
  showFamousLabels,
  showGaiaFineStructure,
  showRelativisticRemnants
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { lang, t, translateStageName } = useLanguage();

  // Pan & Zoom state - stable by default
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredStar, setHoveredStar] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  // Stable drag tracking ref to avoid stale state and sticky drag
  const dragRef = useRef({
    isDown: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    panX: 0,
    panY: 0
  });

  // Observe container size smoothly without subpixel layout oscillations
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Reset zoom & pan
  const handleResetView = useCallback(() => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  }, []);

  // Main render loop - driven by dataset & dimensions, NOT by high-frequency mouse movements
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

    const coords = new HRCoordinates(width, height, { top: 68, right: 75, bottom: 65, left: 85 });
    coords.setTransform(zoom, pan.x, pan.y);

    // 1. Clear background & draw Deep Void Black with subtle Astrometrics Blue Nebula
    ctx.fillStyle = '#010308';
    ctx.fillRect(0, 0, width, height);

    const bgGrad = ctx.createRadialGradient(
      width * 0.5, height * 0.45, 100,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.8
    );
    bgGrad.addColorStop(0, 'rgba(4, 18, 48, 0.45)');
    bgGrad.addColorStop(0.6, 'rgba(2, 8, 24, 0.7)');
    bgGrad.addColorStop(1, '#010308');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Plot Area Coordinates
    const plotLeft = coords.margins.left;
    const plotTop = coords.margins.top;
    const plotRight = width - coords.margins.right;
    const plotBottom = height - coords.margins.bottom;
    const plotW = plotRight - plotLeft;
    const plotH = plotBottom - plotTop;

    // Deep astrometrics tactical grid fill
    ctx.fillStyle = 'rgba(2, 6, 16, 0.85)';
    ctx.fillRect(plotLeft, plotTop, plotW, plotH);

    // 3. Draw Tactical Astrometrics Region Boundaries
    if (showRegions) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();

      // Main Sequence tactical corridor
      ctx.fillStyle = 'rgba(0, 140, 255, 0.06)';
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const msPointsTop = [
        coords.toCanvas(35000, 150000),
        coords.toCanvas(20000, 10000),
        coords.toCanvas(10000, 100),
        coords.toCanvas(6000, 3.5),
        coords.toCanvas(3000, 0.02),
        coords.toCanvas(2200, 0.0004)
      ];
      const msPointsBottom = [
        coords.toCanvas(2200, 0.00002),
        coords.toCanvas(3000, 0.001),
        coords.toCanvas(6000, 0.3),
        coords.toCanvas(10000, 10),
        coords.toCanvas(20000, 800),
        coords.toCanvas(35000, 15000)
      ];
      ctx.moveTo(msPointsTop[0].x, msPointsTop[0].y);
      for (let p of msPointsTop) ctx.lineTo(p.x, p.y);
      for (let p of msPointsBottom) ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Instability Strip overlay (Cepheids, RR Lyrae pulsators)
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const isTopL = coords.toCanvas(7500, 80000);
      const isTopR = coords.toCanvas(5200, 80000);
      const isBotR = coords.toCanvas(5800, 10);
      const isBotL = coords.toCanvas(8200, 10);
      ctx.moveTo(isTopL.x, isTopL.y);
      ctx.lineTo(isTopR.x, isTopR.y);
      ctx.lineTo(isBotR.x, isBotR.y);
      ctx.lineTo(isBotL.x, isBotL.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      // Label instability strip
      const isCenter = coords.toCanvas(6500, 2500);
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'cs' ? '[ PÁS NESTABILITY // CEFEIDY ]' : '[ INSTABILITY STRIP // PULSATING ]', isCenter.x, isCenter.y);

      // White Dwarf Region
      const wdCenter = coords.toCanvas(16000, 0.002);
      ctx.font = '600 11px "Orbitron", sans-serif';
      ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
      ctx.fillText(lang === 'cs' ? '[ DEGENEROVANÁ JÁDRA // BÍLÍ TRPASLÍCI ]' : '[ DEGENERATE CORES // WHITE DWARFS ]', wdCenter.x, wdCenter.y);

      // Red Giants Region
      const rgCenter = coords.toCanvas(3900, 250);
      ctx.fillStyle = 'rgba(255, 120, 120, 0.7)';
      ctx.fillText(lang === 'cs' ? '[ ČERVENÍ OBŘI // RGB ]' : '[ RED GIANTS // RGB ]', rgCenter.x, rgCenter.y);

      // Supergiants Region
      const sgCenter = coords.toCanvas(8000, 150000);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillText(lang === 'cs' ? '[ VELEOBŘI // TŘÍDA I ]' : '[ SUPERGIANTS // CLASS I ]', sgCenter.x, sgCenter.y);

      // Main Sequence label
      const msLabel = coords.toCanvas(5800, 1.2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.font = '700 11px "Orbitron", sans-serif';
      ctx.fillText(lang === 'cs' ? 'HLAVNÍ POSLOUPNOST // TŘÍDA V' : 'MAIN SEQUENCE // CLASS V', msLabel.x + 45, msLabel.y + 25);

      ctx.restore();
    }

    // 4. Draw Constant Radius Lines (Diagonal Isoradius Lines)
    if (showIsoradii) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();

      ctx.strokeStyle = 'rgba(0, 200, 255, 0.16)';
      ctx.setLineDash([2, 5]);
      ctx.lineWidth = 1;

      for (let rObj of CONSTANT_RADII) {
        const p1 = coords.toCanvas(45000, HRCoordinates.getLumForRadius(rObj.radius, 45000));
        const p2 = coords.toCanvas(2000, HRCoordinates.getLumForRadius(rObj.radius, 2000));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const midT = 11000;
        const pLabel = coords.toCanvas(midT, HRCoordinates.getLumForRadius(rObj.radius, midT));
        if (coords.isInPlotBounds(pLabel.x, pLabel.y)) {
          ctx.save();
          ctx.translate(pLabel.x, pLabel.y);
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          ctx.rotate(angle);
          ctx.font = '500 9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
          ctx.fillText(`R = ${rObj.radius} R☉`, 0, -3);
          ctx.restore();
        }
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 4b. Draw Gaia DR3 Fine-Structure Overlays (Jao Gap, Binary Ridge, Crystallization)
    if (showGaiaFineStructure) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();

      // 1. Equal-Mass Binary Ridge (+0.753 mag / 2x L parallel sequence)
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      const msPoints = [
        { t: 35000, l: 150000 * 2 },
        { t: 25000, l: 20000 * 2 },
        { t: 15000, l: 800 * 2 },
        { t: 10000, l: 50 * 2 },
        { t: 7500, l: 6 * 2 },
        { t: 6000, l: 1.2 * 2 },
        { t: 5000, l: 0.35 * 2 },
        { t: 3800, l: 0.05 * 2 },
        { t: 2800, l: 0.001 * 2 }
      ];
      let firstBin = true;
      for (let pt of msPoints) {
        const pos = coords.toCanvas(pt.t, pt.l);
        if (firstBin) { ctx.moveTo(pos.x, pos.y); firstBin = false; }
        else { ctx.lineTo(pos.x, pos.y); }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const binLabelPos = coords.toCanvas(7500, 6 * 2);
      if (coords.isInPlotBounds(binLabelPos.x, binLabelPos.y)) {
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'left';
        ctx.fillText(
          lang === 'cs'
            ? '// NEROZLIŠENÉ FYZICKÉ DVOJHVEZDY [ +0,75 MAG / 2× L☉ ]'
            : '// UNRESOLVED EQUAL-MASS BINARIES [ -0.75 MAG / 2× L☉ ]',
          binLabelPos.x + 8,
          binLabelPos.y - 6
        );
      }

      // 2. The Jao Gap (0.35 M_sun fully convective boundary)
      const jaoPos = coords.toCanvas(3250, 0.0035);
      if (coords.isInPlotBounds(jaoPos.x, jaoPos.y)) {
        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(jaoPos.x - 45, jaoPos.y);
        ctx.lineTo(jaoPos.x + 45, jaoPos.y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(jaoPos.x - 45, jaoPos.y - 5);
        ctx.lineTo(jaoPos.x - 45, jaoPos.y + 5);
        ctx.moveTo(jaoPos.x + 45, jaoPos.y - 5);
        ctx.lineTo(jaoPos.x + 45, jaoPos.y + 5);
        ctx.stroke();

        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffaa00';
        ctx.textAlign = 'left';
        ctx.fillText(
          lang === 'cs'
            ? '// GAIA DR3: JAO GAP [ 0,35 M☉ MEZ PLRÉHO PROCHLAZOVÁNÍ A PLNÉ KONVEKCE ]'
            : '// GAIA DR3: JAO GAP [ 0.35 M☉ FULLY CONVECTIVE CORE BOUNDARY ]',
          jaoPos.x + 52,
          jaoPos.y + 3
        );
      }

      // 3. White Dwarf Crystallization & Q-Branch
      const wdCrystPos = coords.toCanvas(7200, 0.0003);
      if (coords.isInPlotBounds(wdCrystPos.x, wdCrystPos.y)) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(wdCrystPos.x - 55, wdCrystPos.y - 11, 110, 22);
        ctx.fillRect(wdCrystPos.x - 55, wdCrystPos.y - 11, 110, 22);

        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'center';
        ctx.fillText(
          lang === 'cs'
            ? '// KRYSTALIZACE JÁDRA C/O (VĚTEV Q) //'
            : '// COULOMB C/O CRYSTALLIZATION (Q-BRANCH) //',
          wdCrystPos.x,
          wdCrystPos.y + 3
        );
      }

      ctx.restore();
    }

    // 4c. Draw Compact Relativistic Remnants (Neutron Stars & Black Hole X-ray Binaries)
    if (showRelativisticRemnants) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();

      // 1. Neutron Star / Pulsar Regime (Extreme Upper-Left sub-luminous)
      const nsPos = coords.toCanvas(38000, 0.0003);
      if (coords.isInPlotBounds(nsPos.x, nsPos.y)) {
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(nsPos.x - 70, nsPos.y - 16, 140, 32);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.fillRect(nsPos.x - 70, nsPos.y - 16, 140, 32);
        ctx.setLineDash([]);

        ctx.font = '700 9px "Orbitron", sans-serif';
        ctx.fillStyle = '#e9d5ff';
        ctx.textAlign = 'center';
        ctx.fillText(
          lang === 'cs' ? 'NEUTRONOVÉ HVĚZDY // PULSARY' : 'NEUTRON STARS // PULSARS',
          nsPos.x,
          nsPos.y - 2
        );
        ctx.font = '500 8px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f3e8ff';
        ctx.fillText('R ~ 11 km • M <= 2.16 M☉', nsPos.x, nsPos.y + 10);
      }

      // 2. Black Hole X-ray Binary Accretion Locus (e.g. Cygnus X-1 companion domain)
      const bhPos = coords.toCanvas(31000, 210000);
      if (coords.isInPlotBounds(bhPos.x, bhPos.y)) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(bhPos.x, bhPos.y, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(bhPos.x, bhPos.y, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '700 9px "Orbitron", sans-serif';
        ctx.fillStyle = '#fda4af';
        ctx.textAlign = 'left';
        ctx.fillText(
          lang === 'cs'
            ? '// AKREČNÍ DISK ČERNÉ DÍRY [ CYGNUS X-1 // T ~ 10^7 K ]'
            : '// BLACK HOLE ACCRETION DISK [ CYGNUS X-1 // T ~ 10^7 K ]',
          bhPos.x + 28,
          bhPos.y + 4
        );
      }

      // 3. Chandrasekhar & TOV Demarcation Line in Corner
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'right';
      ctx.fillText(
        lang === 'cs'
          ? 'LIMIT: CHANDRASEKHAR (1,44 M☉) | TOV (~2,16 M☉ -> SINGULARITA)'
          : 'LIMITS: CHANDRASEKHAR (1.44 M☉) | TOV (~2.16 M☉ -> SINGULARITY)',
        plotRight - 12,
        plotBottom - 10
      );

      ctx.restore();
    }

    // 5. Draw Tactical Coordinate Grid & Telemetry Lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 170, 255, 0.1)';
    ctx.lineWidth = 1;

    // Luminosity Grid (Horizontal)
    const lumTicks = [1000000, 10000, 100, 1, 0.01, 0.0001];
    for (let lum of lumTicks) {
      const p = coords.toCanvas(10000, lum);
      if (p.y >= plotTop && p.y <= plotBottom) {
        ctx.beginPath();
        ctx.moveTo(plotLeft, p.y);
        ctx.lineTo(plotRight, p.y);
        ctx.stroke();

        // Ticks
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(plotLeft, p.y);
        ctx.lineTo(plotLeft + 5, p.y);
        ctx.moveTo(plotRight - 5, p.y);
        ctx.lineTo(plotRight, p.y);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0, 170, 255, 0.1)';

        // Left axis labels: L / L_sun
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        let label = lum >= 1 ? `${lum.toLocaleString()} L☉` : `${lum} L☉`;
        if (lum === 1) label = lang === 'cs' ? '1,0 L☉ [SLUNCE]' : '1.0 L☉ [SOL]';
        ctx.fillText(label, plotLeft - 8, p.y);

        // Right axis labels: Absolute Magnitude M_V
        const absMag = HRCoordinates.lumToAbsMag(lum);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`${absMag > 0 ? '+' : ''}${absMag.toFixed(1)} Mv`, plotRight + 8, p.y);
      }
    }

    // Temperature Grid (Vertical)
    const tempTicks = [40000, 30000, 20000, 10000, 7500, 6000, 5000, 4000, 3000, 2000];
    for (let t of tempTicks) {
      const p = coords.toCanvas(t, 1);
      if (p.x >= plotLeft && p.x <= plotRight) {
        ctx.beginPath();
        ctx.moveTo(p.x, plotTop);
        ctx.lineTo(p.x, plotBottom);
        ctx.stroke();

        // Ticks
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(p.x, plotTop);
        ctx.lineTo(p.x, plotTop + 5);
        ctx.moveTo(p.x, plotBottom - 5);
        ctx.lineTo(p.x, plotBottom);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0, 170, 255, 0.1)';

        // Bottom axis labels
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#d9e6f7';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${(t / 1000).toFixed(t < 10000 && t % 1000 !== 0 ? 1 : 0)}k K`, p.x, plotBottom + 8);
      }
    }
    ctx.restore();

    // 6. Draw Spectral Class Header Bar (Spaceship Astrometrics HUD Ribbon)
    ctx.save();
    const headerY = plotTop - 32;
    const headerHeight = 24;

    for (let spec of SPECTRAL_CLASSES) {
      const pLeft = coords.toCanvas(spec.tempRange[1], 1).x;
      const pRight = coords.toCanvas(spec.tempRange[0], 1).x;

      const clampedL = Math.max(plotLeft, Math.min(plotRight, pLeft));
      const clampedR = Math.max(plotLeft, Math.min(plotRight, pRight));

      if (clampedR > clampedL) {
        // Holographic cell background
        ctx.fillStyle = 'rgba(0, 20, 48, 0.7)';
        ctx.fillRect(clampedL, headerY, clampedR - clampedL, headerHeight);

        // Tech borders
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.strokeRect(clampedL, headerY, clampedR - clampedL, headerHeight);

        // Accent top bar
        ctx.fillStyle = spec.color;
        ctx.fillRect(clampedL + 1, headerY, clampedR - clampedL - 2, 2.5);

        // Text label
        ctx.font = '700 12px "Orbitron", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${lang === 'cs' ? 'TŘÍDA' : 'CLASS'} ${spec.class}`, (clampedL + clampedR) / 2, headerY + headerHeight / 2 + 1);
      }
    }
    ctx.restore();

    // 7. Draw Background Stellar Population (Real Hipparcos stars)
    if (showBackgroundPopulation && backgroundStars && backgroundStars.length > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();

      for (let star of backgroundStars) {
        const [temp, lum, , , specClass] = star;

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

    // 8. Draw Cluster Isochrone & Turn-Off in Cluster Mode
    if (activeMode === 'cluster' && clusterIsochrone && clusterIsochrone.points) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      let first = true;
      for (let pt of clusterIsochrone.points) {
        const p = coords.toCanvas(pt.temp, pt.lum);
        if (first) {
          ctx.moveTo(p.x, p.y);
          first = false;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();

      // Draw Turn-Off Point HUD Target
      const to = clusterIsochrone.turnoff;
      const toPos = coords.toCanvas(to.tempK, to.lumLsun);
      
      // Outer Target Reticle
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
      ctx.fillText(lang === 'cs' ? `[ BOD OBRATU: ~${to.massMsun} M☉ ]` : `[ TURN-OFF: ~${to.massMsun} M☉ ]`, toPos.x + 14, toPos.y + 4);

      // Draw real observational cluster member stars from catalog if available
      const activeClusterKey = clusterAgeGyr < 0.35 ? 'pleiades' : (clusterAgeGyr < 2.0 ? 'hyades' : null);
      const activeMembers = activeClusterKey && clusterMembers ? clusterMembers[activeClusterKey] : null;

      if (activeMembers && activeMembers.length > 0) {
        ctx.save();
        for (let member of activeMembers) {
          const [temp, lum, , , , , name] = member;
          const pos = coords.toCanvas(temp, lum);
          if (!coords.isInPlotBounds(pos.x, pos.y)) continue;

          const rgb = temperatureToRGB(temp);
          ctx.strokeStyle = activeClusterKey === 'pleiades' ? '#00f0ff' : '#ffbe80';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = rgb.css;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          if (name) {
            ctx.font = '600 10px "JetBrains Mono", monospace';
            ctx.fillStyle = activeClusterKey === 'pleiades' ? '#00f0ff' : '#ffbe80';
            ctx.fillText(name, pos.x + 8, pos.y + 3);
          }
        }
        ctx.restore();
      }

      ctx.restore();
    }

    // 9. Draw Stellar Evolution Track in Evolution Mode
    if (activeMode === 'evolution' && evolutionTrackPoints && evolutionTrackPoints.length > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();

      // Track trajectory line
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 3]);
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      evolutionTrackPoints.forEach((step, idx) => {
        const p = coords.toCanvas(step.temp, step.lum);
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Milestones along track
      evolutionTrackPoints.forEach((step) => {
        const p = coords.toCanvas(step.temp, step.lum);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Current animated position marker
      if (evolutionState) {
        const curPos = coords.toCanvas(evolutionState.temp, evolutionState.lum);
        const rgb = temperatureToRGB(evolutionState.temp);

        // Tactical Reticle Crosshairs around current star
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(curPos.x, curPos.y, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(curPos.x - 18, curPos.y); ctx.lineTo(curPos.x - 10, curPos.y);
        ctx.moveTo(curPos.x + 10, curPos.y); ctx.lineTo(curPos.x + 18, curPos.y);
        ctx.moveTo(curPos.x, curPos.y - 18); ctx.lineTo(curPos.x, curPos.y - 10);
        ctx.moveTo(curPos.x, curPos.y + 10); ctx.lineTo(curPos.x, curPos.y + 18);
        ctx.stroke();

        ctx.fillStyle = rgb.css;
        ctx.shadowColor = rgb.css;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(curPos.x, curPos.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '700 12px "Orbitron", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`// ${translateStageName(evolutionState.stage).toUpperCase()}`, curPos.x + 22, curPos.y + 4);
      }

      ctx.restore();
    }

    // 10. Draw Famous Stars (Astrometrics Tactical Targets)
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotLeft, plotTop, plotW, plotH);
    ctx.clip();

    for (let star of famousStars) {
      if (filterClass !== 'ALL' && !star.spectralType.startsWith(filterClass)) continue;
      if (filterPlanetsOnly && !star.hasExoplanets) continue;
      if (filterSearch && !star.name.toLowerCase().includes(filterSearch.toLowerCase())) continue;

      const pos = coords.toCanvas(star.temp, star.lum);
      if (!coords.isInPlotBounds(pos.x, pos.y)) continue;

      const rgb = temperatureToRGB(star.temp);
      const isSelected = selectedStar && selectedStar.id === star.id;
      const isHovered = hoveredStar && hoveredStar.id === star.id;

      let dotRadius = 4;
      if (star.luminosityClass === 'I') dotRadius = 6.5;
      else if (star.luminosityClass === 'III') dotRadius = 5.2;
      else if (star.luminosityClass === 'D') dotRadius = 3.2;

      // Spaceship Astrometrics Reticle for Selected or Hovered Target
      if (isSelected || isHovered) {
        const reticleR = dotRadius + 8;
        ctx.strokeStyle = isSelected ? '#00f0ff' : '#ffffff';
        ctx.lineWidth = 1.5;

        // Bracket corners
        const cornerLen = 5;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(pos.x - reticleR, pos.y - reticleR + cornerLen);
        ctx.lineTo(pos.x - reticleR, pos.y - reticleR);
        ctx.lineTo(pos.x - reticleR + cornerLen, pos.y - reticleR);
        // Top-right
        ctx.moveTo(pos.x + reticleR - cornerLen, pos.y - reticleR);
        ctx.lineTo(pos.x + reticleR, pos.y - reticleR);
        ctx.lineTo(pos.x + reticleR, pos.y - reticleR + cornerLen);
        // Bottom-left
        ctx.moveTo(pos.x - reticleR, pos.y + reticleR - cornerLen);
        ctx.lineTo(pos.x - reticleR, pos.y + reticleR);
        ctx.lineTo(pos.x - reticleR + cornerLen, pos.y + reticleR);
        // Bottom-right
        ctx.moveTo(pos.x + reticleR - cornerLen, pos.y + reticleR);
        ctx.lineTo(pos.x + reticleR, pos.y + reticleR);
        ctx.lineTo(pos.x + reticleR, pos.y + reticleR - cornerLen);
        ctx.stroke();

        // Pulsing glow
        ctx.shadowColor = isSelected ? '#00f0ff' : '#ffffff';
        ctx.shadowBlur = 16;
      }

      // Star Core Circle
      ctx.fillStyle = rgb.css;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      // Star Sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, dotRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Tactical Label
      if (showFamousLabels || isSelected || isHovered || star.name === 'Sol' || star.name === 'Sirius' || star.name === 'Betelgeuse') {
        ctx.font = isSelected ? '700 11px "JetBrains Mono", monospace' : '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = isSelected ? '#00f0ff' : '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'left';
        ctx.fillText(`// ${star.name.toUpperCase()}`, pos.x + dotRadius + 8, pos.y + 3);
      }
    }
    ctx.restore();

    // 11. Astrometrics Viewport HUD Frame & Corner Brackets
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

    // Tactical Corner Notches
    const cSize = 16;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;

    // Top-Left corner
    ctx.beginPath();
    ctx.moveTo(plotLeft, plotTop + cSize);
    ctx.lineTo(plotLeft, plotTop);
    ctx.lineTo(plotLeft + cSize, plotTop);
    ctx.stroke();

    // Top-Right corner
    ctx.beginPath();
    ctx.moveTo(plotRight - cSize, plotTop);
    ctx.lineTo(plotRight, plotTop);
    ctx.lineTo(plotRight, plotTop + cSize);
    ctx.stroke();

    // Bottom-Left corner
    ctx.beginPath();
    ctx.moveTo(plotLeft, plotBottom - cSize);
    ctx.lineTo(plotLeft, plotBottom);
    ctx.lineTo(plotLeft + cSize, plotBottom);
    ctx.stroke();

    // Bottom-Right corner
    ctx.beginPath();
    ctx.moveTo(plotRight - cSize, plotBottom);
    ctx.lineTo(plotRight, plotBottom);
    ctx.lineTo(plotRight, plotBottom - cSize);
    ctx.stroke();

    // Telemetry Axis Titles
    ctx.font = '700 11px "Orbitron", sans-serif';
    ctx.fillStyle = '#00f0ff';

    // Bottom Axis: Effective Temperature
    ctx.textAlign = 'center';
    ctx.fillText(
      lang === 'cs'
        ? '◄ HORKÉ [ MODRÉ ] ──── EFEKTIVNÍ POVRCHOVÁ TEPLOTA (KELVIN) ──── CHLADNÉ [ ČERVENÉ ] ►'
        : '◄ HOTTER [ BLUE ] ──── EFFECTIVE SURFACE TEMPERATURE (KELVIN) ──── COOLER [ RED ] ►',
      plotLeft + plotW / 2,
      height - 12
    );

    // Top Axis: Spectral Classification
    ctx.fillText(
      lang === 'cs'
        ? 'HARVARDSKÁ SPEKTRÁLNÍ KLASIFIKACE // TEPLOTNÍ INDEX'
        : 'HARVARD SPECTRAL CLASSIFICATION // THERMAL INDEX',
      plotLeft + plotW / 2,
      22
    );

    // Left Axis: Luminosity
    ctx.save();
    ctx.translate(22, plotTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(
      lang === 'cs'
        ? 'LUMINOSITA / VÝKON (L / L☉) [LOGARITMICKÁ TELEMETRIE]'
        : 'LUMINOSITY (L / L☉) [LOGARITHMIC TELEMETRY]',
      0,
      0
    );
    ctx.restore();

    // Right Axis: Absolute Magnitude
    ctx.save();
    ctx.translate(width - 15, plotTop + plotH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(
      lang === 'cs'
        ? 'ABSOLUTNÍ VIZUÁLNÍ MAGNITUDA (Mv) [PŘEVRÁCENÝ TOK]'
        : 'ABSOLUTE VISUAL MAGNITUDE (Mv) [INVERTED FLUX]',
      0,
      0
    );
    ctx.restore();

  }, [
    zoom,
    pan,
    dimensions,
    famousStars,
    backgroundStars,
    selectedStar,
    hoveredStar,
    activeMode,
    evolutionState,
    evolutionTrackPoints,
    clusterIsochrone,
    clusterMembers,
    clusterAgeGyr,
    filterClass,
    filterPlanetsOnly,
    filterSearch,
    showIsoradii,
    showRegions,
    showBackgroundPopulation,
    showFamousLabels,
    showGaiaFineStructure,
    showRelativisticRemnants,
    lang,
    translateStageName
  ]);

  // Robust pointer interaction handlers: reliable drag and click without sticky dragging
  const handlePointerDown = (e) => {
    if (e.button !== 0) return; // Only track primary left mouse button
    const canvas = canvasRef.current;
    if (canvas && canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    }
    dragRef.current = {
      isDown: true,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
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
      if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 4) {
        dragRef.current.hasMoved = true;
      }
      if (dragRef.current.hasMoved) {
        setPan({
          x: dragRef.current.panX + dx,
          y: dragRef.current.panY + dy
        });
        return;
      }
    }

    // Hit test famous stars for hover
    const coords = new HRCoordinates(rect.width, rect.height, { top: 68, right: 75, bottom: 65, left: 85 });
    coords.setTransform(zoom, pan.x, pan.y);

    let found = null;
    let minD = 18;

    for (let star of famousStars) {
      const p = coords.toCanvas(star.temp, star.lum);
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < minD) {
        minD = dist;
        found = star;
      }
    }
    setHoveredStar(found);
  };

  const handlePointerUp = (e) => {
    const wasDragging = dragRef.current.hasMoved;
    dragRef.current.isDown = false;
    dragRef.current.hasMoved = false;

    const canvas = canvasRef.current;
    if (canvas && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }

    // Clean click on star targets star
    if (!wasDragging && hoveredStar) {
      onSelectStar(hoveredStar);
    }
  };

  const handlePointerCancel = (e) => {
    dragRef.current.isDown = false;
    dragRef.current.hasMoved = false;
    const canvas = canvasRef.current;
    if (canvas && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Zoom handling: graph stays stable during normal mouse/wheel scrolling.
  // Zooming via wheel requires holding Ctrl (or Meta) or clicking on-screen [+] / [-] buttons.
  const handleWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) {
      // Allow normal scroll or keep graph stable
      return;
    }
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    const factor = Math.max(0.7, Math.min(1.3, 1 + delta));
    setZoom((prevZoom) => Math.max(0.6, Math.min(6.0, parseFloat((prevZoom * factor).toFixed(3)))));
  };

  return (
    <div className="hr-canvas-container hud-canvas-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="hr-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleWheel}
      />

      {/* Astrometrics Tactical Telemetry Overlay in corners */}
      <div className="canvas-telemetry-tl">
        <span className="telemetry-item">{t('sectorLabel')}</span>
        <span className="telemetry-item">{t('gridLabel')}</span>
      </div>

      <div className="canvas-telemetry-br">
        <span className="telemetry-item">{t('zoomLabel')} {zoom.toFixed(2)}x</span>
        <span className="telemetry-item">{t('panLabel')} [{pan.x.toFixed(0)}, {pan.y.toFixed(0)}]</span>
      </div>

      {/* Floating Canvas Tactical Controls */}
      <div className="canvas-overlay-controls hud-canvas-controls">
        <button
          className="canvas-btn hud-square-btn"
          onClick={() => setZoom((z) => Math.min(6.0, z * 1.25))}
          title={lang === 'cs' ? 'Přiblížit' : 'Magnify (Zoom In)'}
        >
          +
        </button>
        <button
          className="canvas-btn hud-square-btn"
          onClick={() => setZoom((z) => Math.max(0.6, z * 0.8))}
          title={lang === 'cs' ? 'Oddálit' : 'Demagnify (Zoom Out)'}
        >
          −
        </button>
        <button
          className="canvas-btn hud-square-btn reset-btn"
          onClick={handleResetView}
          title={lang === 'cs' ? 'Resetovat pohled senzoru' : 'Recalibrate Sensor View'}
        >
          {t('recalibrateBtn')}
        </button>
      </div>

      {/* Tactical HUD Target Tooltip on Hover */}
      {hoveredStar && (
        <div
          className="star-hover-tooltip hud-tooltip"
          style={{
            left: `${mousePos.x + 18}px`,
            top: `${mousePos.y - 20}px`
          }}
        >
          <div className="tooltip-header hud-tooltip-header">
            <span
              className="tooltip-dot"
              style={{ backgroundColor: temperatureToRGB(hoveredStar.temp).css }}
            />
            <span className="hud-target-label">{t('targetAcquired')}</span>
            <strong>{hoveredStar.name.toUpperCase()}</strong>
          </div>
          <div className="tooltip-details hud-tooltip-details">
            <div><span>{t('classLabel')}</span> {hoveredStar.spectralType}</div>
            <div><span>{t('tempLabel')}</span> {hoveredStar.temp.toLocaleString()} K</div>
            <div><span>{t('lumLabel')}</span> {hoveredStar.lum} L☉</div>
            <div><span>{t('radiusLabel')}</span> {hoveredStar.radius} R☉</div>
            {hoveredStar.hasExoplanets && (
              <div className="tooltip-planet-tag">
                {t('tooltipExoplanets', { count: hoveredStar.exoplanetCount })}
              </div>
            )}
            <div className="tooltip-action-hint">
              {t('tooltipClickHint')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

