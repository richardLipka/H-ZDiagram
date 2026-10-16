import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatSig, formatInt } from '../utils/format';
import { getKopparapuHZCurves } from '../services/exoplanetService';
import { Search, ZoomIn, ZoomOut, RotateCcw, Filter, Orbit, Sparkles, Compass } from 'lucide-react';

const MARGINS = { top: 65, right: 60, bottom: 60, left: 85 };
const MIN_A = 0.005; // AU
const MAX_A = 50.0; // AU
const MIN_TEFF = 2200; // K
const MAX_TEFF = 7500; // K

const SPECTRAL_BANDS = [
  { class: 'M', tempRange: [2200, 3700], color: '#ff4d4d' },
  { class: 'K', tempRange: [3700, 5200], color: '#ffbe80' },
  { class: 'G', tempRange: [5200, 6000], color: '#fffae6' },
  { class: 'F', tempRange: [6000, 7500], color: '#cce6ff' }
];

export default function HZDiagramCanvas({
  exoplanetData,
  onSelectStar,
  famousStars = [],
  onOpenCustomStarModal
}) {
  const { lang, t } = useLanguage();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHZOnly, setFilterHZOnly] = useState(false);
  const [filterEarthSizeOnly, setFilterEarthSizeOnly] = useState(false);
  const [selectedSizeCategory, setSelectedSizeCategory] = useState('ALL'); // ALL, TERRESTRIAL, SUPER_EARTH, NEPTUNE, GIANT

  const dragRef = useRef({ isDown: false, hasMoved: false, startX: 0, startY: 0, panX: 0, panY: 0 });

  const hzCurves = useMemo(() => getKopparapuHZCurves([MIN_TEFF, MAX_TEFF], 80), []);

  const planets = useMemo(() => exoplanetData?.planets || [], [exoplanetData]);

  // Filtered planets
  const filteredPlanets = useMemo(() => {
    return planets.filter((p) => {
      if (filterHZOnly && p.hz === 0) return false;
      if (filterEarthSizeOnly && !p.isTerr) return false;
      if (selectedSizeCategory === 'TERRESTRIAL' && (p.radiusEarth > 1.25 || (!p.radiusEarth && p.massEarth > 2))) return false;
      if (selectedSizeCategory === 'SUPER_EARTH' && (p.radiusEarth <= 1.25 || p.radiusEarth > 2.0)) return false;
      if (selectedSizeCategory === 'NEPTUNE' && (p.radiusEarth <= 2.0 || p.radiusEarth > 4.0)) return false;
      if (selectedSizeCategory === 'GIANT' && (p.radiusEarth <= 4.0 && (!p.massEarth || p.massEarth < 50))) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.host.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [planets, filterHZOnly, filterEarthSizeOnly, selectedSizeCategory, searchQuery]);

  // Coordinate transforms
  const getCoords = useCallback((width, height) => {
    const plotW = width - MARGINS.left - MARGINS.right;
    const plotH = height - MARGINS.top - MARGINS.bottom;

    const logMinA = Math.log10(MIN_A);
    const logMaxA = Math.log10(MAX_A);

    const toCanvas = (a, teff) => {
      const logA = Math.log10(Math.max(MIN_A, Math.min(MAX_A, a)));
      // Base normalized
      const normX = (logA - logMinA) / (logMaxA - logMinA);
      const normY = (MAX_TEFF - teff) / (MAX_TEFF - MIN_TEFF);

      // Apply zoom & pan around center
      const centerX = MARGINS.left + plotW / 2;
      const centerY = MARGINS.top + plotH / 2;

      const x = centerX + (MARGINS.left + normX * plotW - centerX) * zoom + pan.x;
      const y = centerY + (MARGINS.top + normY * plotH - centerY) * zoom + pan.y;

      return { x, y };
    };

    const isInPlot = (x, y) => x >= MARGINS.left && x <= width - MARGINS.right && y >= MARGINS.top && y <= height - MARGINS.bottom;

    return { toCanvas, isInPlot, plotW, plotH, plotLeft: MARGINS.left, plotTop: MARGINS.top, plotRight: width - MARGINS.right, plotBottom: height - MARGINS.bottom };
  }, [zoom, pan]);

  // Draw main diagram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { toCanvas, isInPlot, plotLeft, plotTop, plotRight, plotBottom, plotW, plotH } = getCoords(width, height);

    const clipToPlot = () => {
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();
    };

    // 1. Background grid
    ctx.fillStyle = '#060a17';
    ctx.fillRect(plotLeft, plotTop, plotW, plotH);

    // 2. Shaded Habitable Zone
    ctx.save();
    clipToPlot();

    // Optimistic HZ (recent Venus to early Mars)
    ctx.fillStyle = 'rgba(0, 255, 136, 0.06)';
    ctx.beginPath();
    hzCurves.forEach((pt, i) => {
      const p = toCanvas(pt.recentVenusAU, pt.teff);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    for (let i = hzCurves.length - 1; i >= 0; i--) {
      const p = toCanvas(hzCurves[i].earlyMarsAU, hzCurves[i].teff);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();

    // Conservative HZ (runaway greenhouse to maximum greenhouse)
    ctx.fillStyle = 'rgba(0, 255, 136, 0.16)';
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    hzCurves.forEach((pt, i) => {
      const p = toCanvas(pt.runawayGreenhouseAU, pt.teff);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    for (let i = hzCurves.length - 1; i >= 0; i--) {
      const p = toCanvas(hzCurves[i].maximumGreenhouseAU, hzCurves[i].teff);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Earth-equivalent flux line (1.0 S☉)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    hzCurves.forEach((pt, i) => {
      // Earth-equiv flux is approx sqrt(L)
      const equivA = Math.sqrt(pt.runawayGreenhouseAU * pt.maximumGreenhouseAU);
      const p = toCanvas(equivA, pt.teff);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Habitable zone label
    const hzLabelPos = toCanvas(0.9, 4500);
    if (isInPlot(hzLabelPos.x, hzLabelPos.y)) {
      ctx.font = '700 11px "Orbitron", sans-serif';
      ctx.fillStyle = 'rgba(0, 255, 136, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText(t('chzTitle').toUpperCase(), hzLabelPos.x, hzLabelPos.y);
    }

    ctx.restore();

    // 3. Coordinate Grid Lines
    ctx.save();
    clipToPlot();
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.lineWidth = 1;

    // Major AU grid lines: 0.01, 0.1, 1, 10
    const majorAUs = [0.01, 0.05, 0.1, 0.5, 1.0, 5.0, 10.0, 30.0];
    majorAUs.forEach((au) => {
      const p1 = toCanvas(au, MIN_TEFF);
      const p2 = toCanvas(au, MAX_TEFF);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(p1.x, plotTop);
      ctx.lineTo(p1.x, plotBottom);
      ctx.stroke();
    });

    // Teff horizontal grid lines
    for (let temp = 2500; temp <= 7000; temp += 500) {
      const p = toCanvas(1.0, temp);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(plotLeft, p.y);
      ctx.lineTo(plotRight, p.y);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Spectral Class Header Ribbon
    ctx.save();
    const ribbonY = plotTop - 28;
    const ribbonH = 20;
    for (const b of SPECTRAL_BANDS) {
      const pTop = toCanvas(1.0, b.tempRange[1]);
      const pBot = toCanvas(1.0, b.tempRange[0]);
      const yStart = Math.max(plotTop, Math.min(plotBottom, pTop.y));
      const yEnd = Math.max(plotTop, Math.min(plotBottom, pBot.y));
      if (yEnd - yStart < 4) continue;

      ctx.fillStyle = b.color;
      ctx.fillRect(plotLeft - 10, yStart, 4, yEnd - yStart);
      ctx.font = '700 11px "Orbitron", sans-serif';
      ctx.fillStyle = b.color;
      ctx.textAlign = 'right';
      ctx.fillText(b.class, plotLeft - 16, (yStart + yEnd) / 2 + 4);
    }
    ctx.restore();

    // 5. Render Planets
    ctx.save();
    clipToPlot();

    for (const p of filteredPlanets) {
      const pos = toCanvas(p.a, p.teff);
      if (!isInPlot(pos.x, pos.y)) continue;

      const isHovered = hoveredPlanet && hoveredPlanet.name === p.name;
      const isSolar = p.host === 'Sun';

      let baseRadius = 2.5;
      if (p.radiusEarth) {
        baseRadius = Math.max(2, Math.min(7, p.radiusEarth * 1.5));
      } else if (p.massEarth) {
        baseRadius = Math.max(2, Math.min(7, Math.pow(p.massEarth, 0.28) * 1.5));
      }

      // Color coding
      let color = '#38bdf8'; // Cyan default
      if (p.hz === 2) {
        color = '#00ff88'; // Conservative HZ: bright emerald
      } else if (p.hz === 1) {
        color = '#34d399'; // Optimistic HZ: light emerald
      } else if (p.radiusEarth > 4.0 || p.massEarth > 50) {
        color = '#f97316'; // Gas Giant: orange
      } else if (p.radiusEarth > 2.0) {
        color = '#f59e0b'; // Neptune: amber
      } else if (p.a < 0.05) {
        color = '#f43f5e'; // Hot / Scorched: rose
      }

      if (isSolar) {
        color = p.name === 'Earth' ? '#00f0ff' : p.name === 'Mars' ? '#ff6b4a' : '#fbbf24';
      }

      if (isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, baseRadius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Planet dot
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = p.hz > 0 ? 10 : 4;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Special highlight for Earth-like habitable candidates & Solar planets
      if (isSolar || (p.hz > 0 && p.isTerr && (p.name.includes('TRAPPIST') || p.name.includes('Proxima') || p.name.includes('Kepler-186')))) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, baseRadius + 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillStyle = isSolar ? '#fef08a' : '#a7f3d0';
        ctx.textAlign = 'left';
        ctx.fillText(p.name, pos.x + baseRadius + 5, pos.y + 3);
      }
    }

    ctx.restore();

    // 6. Canvas Frame & Axes
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

    // Axis Ticks: X-axis (Semi-major axis a [AU])
    ctx.fillStyle = '#00f0ff';
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    majorAUs.forEach((au) => {
      const p = toCanvas(au, MIN_TEFF);
      if (p.x >= plotLeft && p.x <= plotRight) {
        ctx.beginPath();
        ctx.moveTo(p.x, plotBottom);
        ctx.lineTo(p.x, plotBottom + 5);
        ctx.stroke();
        ctx.fillText(`${au} AU`, p.x, plotBottom + 18);
      }
    });

    // Axis Ticks: Y-axis (Effective Temperature Teff [K])
    ctx.textAlign = 'right';
    for (let temp = 2500; temp <= 7000; temp += 1000) {
      const p = toCanvas(1.0, temp);
      if (p.y >= plotTop && p.y <= plotBottom) {
        ctx.beginPath();
        ctx.moveTo(plotLeft - 5, p.y);
        ctx.lineTo(plotLeft, p.y);
        ctx.stroke();
        ctx.fillText(`${temp} K`, plotLeft - 8, p.y + 3);
      }
    }

    // Axis Titles
    ctx.font = '700 11px "Orbitron", sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.fillText(`${t('hzAxisSemiMajor')} a [AU] (logarithmic)`, plotLeft + plotW / 2, height - 12);

    ctx.save();
    ctx.translate(22, plotTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(t('axisTemperature'), 0, 0);
    ctx.restore();

  }, [getCoords, filteredPlanets, hoveredPlanet, hzCurves, t, lang]);

  // Resize canvas to match display size
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Nearest planet hit-testing
  const hitTest = useCallback((x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { toCanvas, isInPlot } = getCoords(rect.width, rect.height);

    let nearest = null;
    let minD = 14;

    for (const p of filteredPlanets) {
      const pos = toCanvas(p.a, p.teff);
      if (!isInPlot(pos.x, pos.y)) continue;
      const d = Math.hypot(pos.x - x, pos.y - y);
      if (d < minD) {
        minD = d;
        nearest = p;
      }
    }
    return nearest;
  }, [getCoords, filteredPlanets]);

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
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
        setHoveredPlanet(null);
        return;
      }
    }
    setHoveredPlanet(hitTest(x, y));
  };

  const handlePointerUp = () => {
    if (!dragRef.current.hasMoved && hoveredPlanet) {
      const matchingStar = famousStars.find(
        (s) => s.name.toLowerCase() === hoveredPlanet.host.toLowerCase() ||
               (s.neaHost && s.neaHost.toLowerCase() === hoveredPlanet.host.toLowerCase())
      );
      if (matchingStar) {
        onSelectStar(matchingStar);
      } else {
        const temp = hoveredPlanet.teff;
        const lum = hoveredPlanet.lum || Math.max(0.0001, Math.pow(temp / 5772, 4));
        const synthStar = {
          id: `nea_${hoveredPlanet.host.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          name: hoveredPlanet.host,
          neaHost: hoveredPlanet.host,
          temp,
          lum,
          b_v: temp < 3700 ? 1.5 : temp < 5200 ? 1.0 : temp < 6000 ? 0.65 : 0.35,
          spectralType: temp < 3700 ? 'M-type host' : temp < 5200 ? 'K-type host' : temp < 6000 ? 'G-type host' : 'F-type host',
          luminosityClass: 'V',
          evolutionaryStage: 'Main Sequence (Exoplanet Host)',
          hasExoplanets: true,
          exoplanetCount: 1,
          dataSource: 'NASA Exoplanet Archive (pscomppars)'
        };
        onSelectStar(synthStar);
      }
    }
    dragRef.current.isDown = false;
    dragRef.current.hasMoved = false;
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setSearchQuery('');
    setFilterHZOnly(false);
    setFilterEarthSizeOnly(false);
    setSelectedSizeCategory('ALL');
  };

  return (
    <div className="hz-diagram-wrapper hud-workspace" ref={containerRef}>
      {/* Top Controls Bar */}
      <div className="hz-controls-bar hud-panel">
        <div className="hz-search-box">
          <Search size={14} className="hz-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="hud-input hz-search-input"
            placeholder={t('hzSearchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="hz-filter-group">
          <button
            type="button"
            className={`hz-filter-btn hud-btn ${filterHZOnly ? 'active' : ''}`}
            onClick={() => setFilterHZOnly((v) => !v)}
          >
            <Orbit size={13} aria-hidden="true" />
            <span>{t('hzFilterOnlyHZ')} ({exoplanetData?.meta?.optimisticHZCount || 284})</span>
          </button>

          <button
            type="button"
            className={`hz-filter-btn hud-btn ${filterEarthSizeOnly ? 'active' : ''}`}
            onClick={() => setFilterEarthSizeOnly((v) => !v)}
          >
            <Sparkles size={13} aria-hidden="true" />
            <span>{t('hzFilterEarthLike')} ({exoplanetData?.meta?.terrestrialHZCount || 34})</span>
          </button>
        </div>

        <div className="hz-size-filters">
          {['ALL', 'TERRESTRIAL', 'SUPER_EARTH', 'NEPTUNE', 'GIANT'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`hz-size-btn ${selectedSizeCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedSizeCategory(cat)}
            >
              {t(`hzSize_${cat}`)}
            </button>
          ))}
        </div>

        <div className="hz-zoom-group">
          <button type="button" className="hud-square-btn" onClick={() => setZoom((z) => Math.min(8.0, z * 1.25))} title={t('zoomIn')}>
            <ZoomIn size={14} />
          </button>
          <button type="button" className="hud-square-btn" onClick={() => setZoom((z) => Math.max(0.6, z * 0.8))} title={t('zoomOut')}>
            <ZoomOut size={14} />
          </button>
          <button type="button" className="hud-square-btn" onClick={handleResetView} title={t('recalibrateBtn')}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="hz-canvas-container">
        <canvas
          ref={canvasRef}
          className="hz-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => setHoveredPlanet(null)}
        />

        {/* Telemetry info header */}
        <div className="hz-canvas-telemetry">
          <span>{t('hzTelemetryCount', { count: formatInt(filteredPlanets.length, lang), total: formatInt(planets.length, lang) })}</span>
          <span className="hz-telemetry-badge">NASA Exoplanet Archive</span>
        </div>

        {/* Planet Tooltip */}
        {hoveredPlanet && (
          <div
            className="hud-tooltip hz-planet-tooltip"
            style={{ left: `${mousePos.x + 14}px`, top: `${mousePos.y - 12}px` }}
          >
            <div className="tooltip-header hud-tooltip-header">
              <span className={`tooltip-dot ${hoveredPlanet.hz > 0 ? 'hz-glow' : ''}`} style={{ backgroundColor: hoveredPlanet.hz > 0 ? '#00ff88' : '#38bdf8' }} />
              <strong>{hoveredPlanet.name}</strong>
            </div>
            <div className="tooltip-details hud-tooltip-details">
              <div><span>{t('hzHostLabel')}:</span> {hoveredPlanet.host} ({formatInt(hoveredPlanet.teff, lang)} K)</div>
              <div><span>{t('hzDistanceLabel')}:</span> {formatSig(hoveredPlanet.a, lang, 4)} AU</div>
              {hoveredPlanet.radiusEarth && (
                <div><span>{t('hzRadiusLabel')}:</span> {formatSig(hoveredPlanet.radiusEarth, lang, 2)} R⊕</div>
              )}
              {hoveredPlanet.massEarth && (
                <div><span>{t('hzMassLabel')}:</span> {formatSig(hoveredPlanet.massEarth, lang, 2)} M⊕</div>
              )}
              {hoveredPlanet.teq && (
                <div><span>{t('hzTeqLabel')}:</span> {formatInt(hoveredPlanet.teq, lang)} K</div>
              )}
              <div className="hz-status-pill">
                {hoveredPlanet.hz === 2 ? `🟢 ${t('hzConservative')}` : hoveredPlanet.hz === 1 ? `🟡 ${t('hzOptimistic')}` : `⚪ ${t('hzOutside')}`}
              </div>
              <div className="tooltip-action-hint">{t('hzClickToInspect')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
