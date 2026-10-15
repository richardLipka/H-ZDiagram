import React, { useState, useMemo } from 'react';
import { temperatureToRGB } from '../simulation/blackbody';
import { KNOWN_PLANETARY_SYSTEMS, getDetailedHabitableZone, classifyPlanetZone } from '../simulation/planetaryData';
import { useLanguage } from '../i18n/LanguageContext';
import { Orbit, ZoomIn, ZoomOut, Info, ShieldCheck, Snowflake, Flame } from 'lucide-react';

export default function HabitableZoneVisualizer({
  star,
  lum,
  temp,
  name,
  isEvolutionMode = false
}) {
  const { lang, t } = useLanguage();

  // Active values (either from star object or from evolution slider)
  const currentLum = Math.max(1e-6, lum !== undefined ? lum : (star ? star.lum : 1.0));
  const currentTemp = Math.max(1000, temp !== undefined ? temp : (star ? star.temp : 5778));
  const currentName = name || (star ? star.name : 'Unknown Host');
  const starId = star ? (star.id || '').toLowerCase() : '';

  // Calculate Kopparapu et al. (2013) Habitable Zone boundaries
  const hz = useMemo(() => {
    return getDetailedHabitableZone(currentLum, currentTemp);
  }, [currentLum, currentTemp]);

  // Identify planetary architecture if known
  const planets = useMemo(() => {
    if (KNOWN_PLANETARY_SYSTEMS[starId]) {
      return KNOWN_PLANETARY_SYSTEMS[starId];
    }
    // Check by name prefix
    const nameLow = currentName.toLowerCase();
    if (nameLow.includes('sun') || nameLow.includes('sol')) return KNOWN_PLANETARY_SYSTEMS['sol'];
    if (nameLow.includes('trappist')) return KNOWN_PLANETARY_SYSTEMS['trappist1'];
    if (nameLow.includes('proxima')) return KNOWN_PLANETARY_SYSTEMS['proxima_centauri'];
    if (nameLow.includes('kepler-186')) return KNOWN_PLANETARY_SYSTEMS['kepler_186'];
    if (nameLow.includes('pollux')) return KNOWN_PLANETARY_SYSTEMS['pollux'];
    if (nameLow.includes('51 peg')) return KNOWN_PLANETARY_SYSTEMS['51_peg'];

    // Generic hypothetical system for any star: 1 hypothetical planet in HZ center, 1 inner, 1 outer
    return [
      {
        name: `${currentName} b (Inner)`,
        nameCs: `${currentName} b (Vnitřní)`,
        semiMajorAxisAU: parseFloat((hz.recentVenusAU * 0.75).toFixed(3)),
        radiusEarth: 0.9,
        type: 'scorched_rocky',
        isHypothetical: true
      },
      {
        name: `${currentName} c (Habitable Candidate)`,
        nameCs: `${currentName} c (Kandidát v obyvatelné zóně)`,
        semiMajorAxisAU: parseFloat(hz.earthEquivAU.toFixed(3)),
        radiusEarth: 1.1,
        type: 'habitable',
        isHypothetical: true
      },
      {
        name: `${currentName} d (Outer)`,
        nameCs: `${currentName} d (Vnější)`,
        semiMajorAxisAU: parseFloat((hz.maximumGreenhouseAU * 1.5).toFixed(3)),
        radiusEarth: 2.2,
        type: 'frozen',
        isHypothetical: true
      }
    ];
  }, [starId, currentName, hz]);

  // Maximum orbital distance in system for adaptive viewport scaling
  const maxSystemDistance = useMemo(() => {
    const planetMax = Math.max(...planets.map(p => p.semiMajorAxisAU), 0.1);
    return Math.max(planetMax * 1.25, hz.earlyMarsAU * 1.25);
  }, [planets, hz]);

  // Interactive zoom scale state (1.0 = auto fit, >1 = zoom in, <1 = zoom out)
  const [zoomFactor, setZoomFactor] = useState(1.0);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  // SVG dimensions
  const svgSize = 340;
  const center = svgSize / 2;
  const maxRadiusPx = center - 24;

  // Scale function: AU -> Pixels
  const auToPx = (au) => {
    const scale = (maxRadiusPx / maxSystemDistance) * zoomFactor;
    return Math.min(center + 60, au * scale);
  };

  const starRGB = temperatureToRGB(currentTemp);

  return (
    <div className="chz-visualizer-card hud-card">
      <div className="chz-card-header">
        <div className="chz-title-row">
          <Orbit size={15} className="chz-icon" />
          <span className="chz-title">{t('chzTitle')}</span>
          <span className="chz-model-badge">Kopparapu (2013)</span>
        </div>

        {/* Viewport Zoom Controls */}
        <div className="chz-zoom-controls">
          <button
            className="chz-zoom-btn"
            onClick={() => setZoomFactor(prev => Math.max(0.4, prev * 0.75))}
            title={t('zoomOut')}
          >
            <ZoomOut size={13} />
          </button>
          <span className="chz-zoom-level">{(zoomFactor * 100).toFixed(0)}%</span>
          <button
            className="chz-zoom-btn"
            onClick={() => setZoomFactor(prev => Math.min(4.0, prev * 1.33))}
            title={t('zoomIn')}
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* 2D Orbital Radar Display */}
      <div className="chz-radar-viewport">
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="chz-svg"
          aria-label="Habitable Zone Radar"
        >
          <defs>
            {/* Radial glow for host star */}
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor={starRGB.css} stopOpacity="0.9" />
              <stop offset="70%" stopColor={starRGB.css} stopOpacity="0.3" />
              <stop offset="100%" stopColor={starRGB.css} stopOpacity="0" />
            </radialGradient>

            {/* Habitable Zone annular gradient */}
            <radialGradient id="hzGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#00f0ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0088ff" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* Background grid reticles */}
          <circle cx={center} cy={center} r={center - 10} fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeDasharray="3,3" />
          <line x1={center} y1={10} x2={center} y2={svgSize - 10} stroke="rgba(0, 240, 255, 0.08)" />
          <line x1={10} y1={center} x2={svgSize - 10} y2={center} stroke="rgba(0, 240, 255, 0.08)" />

          {/* 1. Habitable Zone Annulus (Conservative Zone) */}
          {auToPx(hz.maximumGreenhouseAU) > 0 && (
            <circle
              cx={center}
              cy={center}
              r={auToPx(hz.maximumGreenhouseAU)}
              fill="rgba(0, 255, 136, 0.12)"
              stroke="rgba(0, 255, 136, 0.4)"
              strokeWidth="1.2"
              strokeDasharray="4,2"
            />
          )}
          {auToPx(hz.runawayGreenhouseAU) > 0 && (
            <circle
              cx={center}
              cy={center}
              r={auToPx(hz.runawayGreenhouseAU)}
              fill="rgba(10, 15, 30, 0.95)" // Masks out the inner too-hot zone
              stroke="rgba(255, 170, 0, 0.5)"
              strokeWidth="1.2"
              strokeDasharray="4,2"
            />
          )}

          {/* 2. Earth Equivalent 1.0 S_eff Orbit */}
          {auToPx(hz.earthEquivAU) > 0 && (
            <circle
              cx={center}
              cy={center}
              r={auToPx(hz.earthEquivAU)}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1"
              strokeDasharray="2,3"
              opacity="0.75"
            />
          )}

          {/* 3. Planetary Orbits & Markers */}
          {planets.map((planet, idx) => {
            const orbitR = auToPx(planet.semiMajorAxisAU);
            if (orbitR <= 4 || orbitR > center + 80) return null;

            // Distribute planet angles along orbits for clean visibility
            const angleDeg = (idx * (360 / planets.length) + 35) % 360;
            const angleRad = (angleDeg * Math.PI) / 180;
            const px = center + orbitR * Math.cos(angleRad);
            const py = center + orbitR * Math.sin(angleRad);

            const zoneType = classifyPlanetZone(planet.semiMajorAxisAU, hz);
            let planetColor = '#ffffff';
            if (zoneType === 'habitable' || zoneType === 'optimistic_inner' || zoneType === 'optimistic_outer') {
              planetColor = '#00ff88';
            } else if (zoneType === 'scorched') {
              planetColor = '#ff6b4a';
            } else {
              planetColor = '#60a5fa';
            }

            const isHovered = hoveredPlanet && hoveredPlanet.name === planet.name;
            const planetDotR = Math.max(3.5, Math.min(8.5, (planet.radiusEarth || 1.0) * 3));

            return (
              <g
                key={idx}
                className="chz-planet-group"
                onMouseEnter={() => setHoveredPlanet(planet)}
                onMouseLeave={() => setHoveredPlanet(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Orbit path circle */}
                <circle
                  cx={center}
                  cy={center}
                  r={orbitR}
                  fill="none"
                  stroke={isHovered ? 'rgba(0, 240, 255, 0.6)' : 'rgba(255, 255, 255, 0.14)'}
                  strokeWidth={isHovered ? 1.5 : 1}
                />

                {/* Hover bracket reticle */}
                {isHovered && (
                  <circle
                    cx={px}
                    cy={py}
                    r={planetDotR + 5}
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                  />
                )}

                {/* Planet dot */}
                <circle
                  cx={px}
                  cy={py}
                  r={planetDotR}
                  fill={planetColor}
                  stroke="#000000"
                  strokeWidth="1"
                />

                {/* Tactical mini label */}
                <text
                  x={px + planetDotR + 4}
                  y={py + 3}
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  fill={isHovered ? '#00f0ff' : '#cbd5e1'}
                  textShadow="0 0 3px #000000"
                >
                  {lang === 'cs' && planet.nameCs ? planet.nameCs : planet.name}
                </text>
              </g>
            );
          })}

          {/* 4. Central Host Star */}
          <circle cx={center} cy={center} r={16} fill="url(#starGlow)" />
          <circle cx={center} cy={center} r={7} fill={starRGB.css} stroke="#ffffff" strokeWidth="1" />
        </svg>
      </div>

      {/* Dynamic Telemetry & Zone Boundaries */}
      <div className="chz-telemetry-grid">
        <div className="chz-stat-box inner">
          <span className="chz-stat-label">
            <Flame size={11} /> {t('chzInnerBoundary')}
          </span>
          <span className="chz-stat-val">{hz.runawayGreenhouseAU} AU</span>
          <span className="chz-stat-sub">{t('runawayGreenhouse')}</span>
        </div>

        <div className="chz-stat-box optimum">
          <span className="chz-stat-label">
            <ShieldCheck size={11} /> {t('chzEarthEquiv')}
          </span>
          <span className="chz-stat-val">{hz.earthEquivAU} AU</span>
          <span className="chz-stat-sub">1.0 S☉ {t('flux')}</span>
        </div>

        <div className="chz-stat-box outer">
          <span className="chz-stat-label">
            <Snowflake size={11} /> {t('chzOuterBoundary')}
          </span>
          <span className="chz-stat-val">{hz.maximumGreenhouseAU} AU</span>
          <span className="chz-stat-sub">{t('maximumGreenhouse')}</span>
        </div>
      </div>

      {/* Hovered Planet or System Status Banner */}
      <div className="chz-status-banner">
        {hoveredPlanet ? (
          <div className="chz-planet-detail">
            <strong>{lang === 'cs' && hoveredPlanet.nameCs ? hoveredPlanet.nameCs : hoveredPlanet.name}:</strong>
            <span> {hoveredPlanet.semiMajorAxisAU} AU</span>
            <span className={`chz-tag ${classifyPlanetZone(hoveredPlanet.semiMajorAxisAU, hz)}`}>
              {classifyPlanetZone(hoveredPlanet.semiMajorAxisAU, hz) === 'habitable' && `[ ${t('zoneHabitable')} ]`}
              {classifyPlanetZone(hoveredPlanet.semiMajorAxisAU, hz) === 'scorched' && `[ ${t('zoneScorched')} ]`}
              {classifyPlanetZone(hoveredPlanet.semiMajorAxisAU, hz) === 'frozen' && `[ ${t('zoneFrozen')} ]`}
              {classifyPlanetZone(hoveredPlanet.semiMajorAxisAU, hz) === 'optimistic_inner' && `[ ${t('zoneWarm')} ]`}
              {classifyPlanetZone(hoveredPlanet.semiMajorAxisAU, hz) === 'optimistic_outer' && `[ ${t('zoneCool')} ]`}
            </span>
          </div>
        ) : (
          <div className="chz-system-summary">
            <Info size={12} className="chz-info-icon" />
            <span>
              {isEvolutionMode
                ? t('chzEvolutionNotice')
                : (star && star.hasExoplanets
                  ? t('chzConfirmedNotice', { count: star.exoplanetCount })
                  : t('chzTheoreticalNotice'))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
