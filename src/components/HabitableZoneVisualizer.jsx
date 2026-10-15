import React, { useState, useMemo } from 'react';
import { temperatureToRGB } from '../simulation/blackbody';
import { getPlanetarySystem, getDetailedHabitableZone, classifyPlanetZone } from '../simulation/planetaryData';
import { useLanguage } from '../i18n/LanguageContext';
import { formatSig } from '../utils/format';
import { Orbit, ZoomIn, ZoomOut, Info, ShieldCheck, Snowflake, Flame, BookOpen, Database, ExternalLink, AlertTriangle } from 'lucide-react';

const ZONE_LABEL_KEYS = {
  habitable: 'zoneHabitable',
  scorched: 'zoneScorched',
  frozen: 'zoneFrozen',
  optimistic_inner: 'zoneWarm',
  optimistic_outer: 'zoneCool'
};

export default function HabitableZoneVisualizer({ star, lum, temp, isEvolutionMode = false }) {
  const { lang, t } = useLanguage();

  const currentLum = Math.max(1e-8, lum !== undefined ? lum : star ? star.lum : 1.0);
  const currentTemp = Math.max(1000, temp !== undefined ? temp : star ? star.temp : 5772);
  const hz = useMemo(() => getDetailedHabitableZone(currentLum, currentTemp), [currentLum, currentTemp]);
  const planets = useMemo(() => (star ? getPlanetarySystem(star.id) : null) || [], [star]);

  // Kopparapu et al. limits are computed for main-sequence hosts
  const notMainSequence = !isEvolutionMode && star && star.luminosityClass !== 'V';

  const maxSystemDistance = useMemo(() => {
    const planetMax = Math.max(...planets.map((p) => p.semiMajorAxisAU), 0);
    return Math.max(planetMax * 1.25, hz.earlyMarsAU * 1.25);
  }, [planets, hz]);

  const [zoomFactor, setZoomFactor] = useState(1.0);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  const formatAU = (val) => (val === undefined || val === null || Number.isNaN(val) ? '—' : formatSig(val, lang, 3));

  const svgSize = 300;
  const center = svgSize / 2;
  const maxRadiusPx = center - 20;
  const auToPx = (au) => (au * maxRadiusPx * zoomFactor) / maxSystemDistance;
  const starRGB = temperatureToRGB(currentTemp);
  const gradientId = `starGlow-${star ? star.id : 'evolution'}`;

  const zoneOf = (planet) => classifyPlanetZone(planet.semiMajorAxisAU, hz);
  const zoneColor = (zone) =>
    zone === 'habitable' || zone === 'optimistic_inner' || zone === 'optimistic_outer' ? '#00ff88' : zone === 'scorched' ? '#ff6b4a' : '#60a5fa';

  let notice;
  if (isEvolutionMode) notice = t('chzEvolutionNotice');
  else if (star && star.id === 'sun') notice = t('chzSolarSystemNotice');
  else if (star && star.hasExoplanets) notice = t(planets.length ? 'chzConfirmedNotice' : 'chzConfirmedNoOrbitsNotice', { count: star.exoplanetCount });
  else notice = t('chzTheoreticalNotice');

  return (
    <div className="chz-visualizer-card hud-card">
      <div className="chz-card-header">
        <div className="chz-title-row">
          <Orbit size={15} className="chz-icon" aria-hidden="true" />
          <h3 className="chz-title">{t('chzTitle')}</h3>
        </div>
        <div className="chz-zoom-controls">
          <button type="button" className="chz-zoom-btn" onClick={() => setZoomFactor((z) => Math.max(0.4, z * 0.75))} title={t('zoomOut')} aria-label={t('zoomOut')}>
            <ZoomOut size={13} aria-hidden="true" />
          </button>
          <span className="chz-zoom-level">{Math.round(zoomFactor * 100)} %</span>
          <button type="button" className="chz-zoom-btn" onClick={() => setZoomFactor((z) => Math.min(4.0, z * 1.33))} title={t('zoomIn')} aria-label={t('zoomIn')}>
            <ZoomIn size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="chz-radar-viewport">
        <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="chz-svg" role="img" aria-label={t('chzSvgLabel', {
          inner: formatAU(hz.runawayGreenhouseAU), outer: formatAU(hz.maximumGreenhouseAU)
        })}>
          <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor={starRGB.css} stopOpacity="0.9" />
              <stop offset="70%" stopColor={starRGB.css} stopOpacity="0.3" />
              <stop offset="100%" stopColor={starRGB.css} stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={center} cy={center} r={center - 10} fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeDasharray="3,3" />
          <line x1={center} y1={10} x2={center} y2={svgSize - 10} stroke="rgba(0, 240, 255, 0.08)" />
          <line x1={10} y1={center} x2={svgSize - 10} y2={center} stroke="rgba(0, 240, 255, 0.08)" />

          {/* Optimistic limits (recent Venus – early Mars) */}
          <circle cx={center} cy={center} r={auToPx(hz.earlyMarsAU)} fill="rgba(0, 255, 136, 0.05)" stroke="rgba(0, 255, 136, 0.25)" strokeWidth="1" strokeDasharray="2,3" />
          <circle cx={center} cy={center} r={auToPx(hz.recentVenusAU)} fill="rgba(10, 15, 30, 0.95)" stroke="rgba(255, 170, 0, 0.3)" strokeWidth="1" strokeDasharray="2,3" />
          {/* Conservative limits (runaway – maximum greenhouse) */}
          <circle cx={center} cy={center} r={auToPx(hz.maximumGreenhouseAU)} fill="rgba(0, 255, 136, 0.12)" stroke="rgba(0, 255, 136, 0.5)" strokeWidth="1.2" strokeDasharray="4,2" />
          <circle cx={center} cy={center} r={auToPx(hz.runawayGreenhouseAU)} fill="rgba(10, 15, 30, 0.95)" stroke="rgba(255, 170, 0, 0.55)" strokeWidth="1.2" strokeDasharray="4,2" />
          {/* Distance at which the planet receives Earth's insolation */}
          <circle cx={center} cy={center} r={auToPx(hz.earthEquivAU)} fill="none" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2,3" opacity="0.75" />

          {planets.map((planet, idx) => {
            const orbitR = auToPx(planet.semiMajorAxisAU);
            if (orbitR <= 4 || orbitR > center * 1.6) return null;
            const angle = ((idx * (360 / planets.length) + 35) % 360) * (Math.PI / 180);
            const px = center + orbitR * Math.cos(angle);
            const py = center + orbitR * Math.sin(angle);
            const isHovered = hoveredPlanet && hoveredPlanet.name === planet.name;
            const dotR = Math.max(3.5, Math.min(8.5, (planet.radiusEarth || 1.0) * 3));
            const name = lang === 'cs' && planet.nameCs ? planet.nameCs : planet.name;
            return (
              <g
                key={planet.name}
                className="chz-planet-group"
                tabIndex={0}
                role="button"
                aria-label={`${name}: ${formatAU(planet.semiMajorAxisAU)} AU`}
                onMouseEnter={() => setHoveredPlanet(planet)}
                onMouseLeave={() => setHoveredPlanet(null)}
                onFocus={() => setHoveredPlanet(planet)}
                onBlur={() => setHoveredPlanet(null)}
              >
                <circle cx={center} cy={center} r={orbitR} fill="none" stroke={isHovered ? 'rgba(0, 240, 255, 0.6)' : 'rgba(255, 255, 255, 0.14)'} strokeWidth={isHovered ? 1.5 : 1} />
                {isHovered && <circle cx={px} cy={py} r={dotR + 5} fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="3,2" />}
                <circle cx={px} cy={py} r={dotR} fill={zoneColor(zoneOf(planet))} stroke="#000000" strokeWidth="1" />
                <text x={px + dotR + 4} y={py + 3} fontSize="9" fontFamily="'JetBrains Mono', monospace" fill={isHovered ? '#00f0ff' : '#cbd5e1'}>
                  {name}
                </text>
              </g>
            );
          })}

          <circle cx={center} cy={center} r={16} fill={`url(#${gradientId})`} />
          <circle cx={center} cy={center} r={7} fill={starRGB.css} stroke="#ffffff" strokeWidth="1" />
        </svg>
      </div>

      <div className="chz-telemetry-grid">
        <div className="chz-stat-box inner">
          <span className="chz-stat-label">
            <Flame size={10} aria-hidden="true" />
            <span>{t('chzInnerShort')}</span>
          </span>
          <span className="chz-stat-val">{formatAU(hz.runawayGreenhouseAU)} AU</span>
          <span className="chz-stat-sub">{t('runawayGreenhouse')}</span>
        </div>
        <div className="chz-stat-box optimum">
          <span className="chz-stat-label">
            <ShieldCheck size={10} aria-hidden="true" />
            <span>{t('chzEarthEquivShort')}</span>
          </span>
          <span className="chz-stat-val">{formatAU(hz.earthEquivAU)} AU</span>
          <span className="chz-stat-sub">{t('earthFluxSub')}</span>
        </div>
        <div className="chz-stat-box outer">
          <span className="chz-stat-label">
            <Snowflake size={10} aria-hidden="true" />
            <span>{t('chzOuterShort')}</span>
          </span>
          <span className="chz-stat-val">{formatAU(hz.maximumGreenhouseAU)} AU</span>
          <span className="chz-stat-sub">{t('maximumGreenhouse')}</span>
        </div>
      </div>

      {(hz.extrapolated || notMainSequence) && (
        <p className="chz-warning" role="note">
          <AlertTriangle size={12} aria-hidden="true" />{' '}
          {hz.extrapolated ? t('chzExtrapolatedWarning') : t('chzNotMainSequenceWarning')}
        </p>
      )}

      <div className="chz-status-banner" aria-live="polite">
        {hoveredPlanet ? (
          <div className="chz-planet-detail">
            <strong>{lang === 'cs' && hoveredPlanet.nameCs ? hoveredPlanet.nameCs : hoveredPlanet.name}:</strong>
            <span> {formatAU(hoveredPlanet.semiMajorAxisAU)} AU </span>
            <span className={`chz-tag ${zoneOf(hoveredPlanet)}`}>[ {t(ZONE_LABEL_KEYS[zoneOf(hoveredPlanet)])} ]</span>
          </div>
        ) : (
          <div className="chz-system-summary">
            <Info size={12} className="chz-info-icon" aria-hidden="true" />
            <span>{notice}</span>
          </div>
        )}
      </div>

      <div className="chz-sources-bar">
        <span className="chz-sources-label">{t('sourceLabel')}:</span>
        <div className="chz-sources-list">
          <a href="https://arxiv.org/abs/1404.5292" target="_blank" rel="noopener noreferrer" className="chz-source-pill" title="Kopparapu et al. 2014, ApJL 787, L29; Kopparapu et al. 2013, ApJ 765, 131">
            <BookOpen size={10} aria-hidden="true" />
            <span>Kopparapu et al. (2014)</span>
            <ExternalLink size={9} aria-hidden="true" />
          </a>
          {star && star.hasExoplanets && star.neaHost && (
            <a href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(star.neaHost)}`} target="_blank" rel="noopener noreferrer" className="chz-source-pill" title="NASA Exoplanet Archive (NExScI / Caltech-IPAC)">
              <Database size={10} aria-hidden="true" />
              <span>NASA Exoplanet Archive</span>
              <ExternalLink size={9} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
