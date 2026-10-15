import React, { useState, useMemo } from 'react';
import {
  PROMINENT_SPECTRAL_LINES,
  calculateLineStrength,
  analyzeCoreFusionAndComposition,
  getSpectroscopyLinks
} from '../utils/spectroscopy';
import { useLanguage } from '../i18n/LanguageContext';
import { Activity, Atom, BookOpen, ExternalLink, Flame, Info, Layers, Sparkles, Thermometer } from 'lucide-react';

export default function StellarSpectroscopy({
  star,
  tempOverride,
  lumOverride,
  massOverride,
  stageOverride,
  compact = false
}) {
  const { lang } = useLanguage();
  const isCs = lang === 'cs';

  // Use props or star properties
  const temp = Math.max(1000, tempOverride !== undefined ? tempOverride : (star ? star.temp : 5778));
  const lum = Math.max(1e-6, lumOverride !== undefined ? lumOverride : (star ? star.lum : 1.0));
  const mass = Math.max(0.08, massOverride !== undefined ? massOverride : (star ? star.mass || 1.0 : 1.0));
  const spectralType = star ? star.spectralType || 'G2V' : 'G2V';
  const lumClass = star ? star.luminosityClass || 'V' : 'V';
  const starName = star ? star.name : 'Target Star';

  // Active sub-tab within spectroscopy: 'spectrum' | 'fusion' | 'sources'
  const [activeTab, setActiveTab] = useState('spectrum');
  const [hoveredLine, setHoveredLine] = useState(null);
  const [hoveredWavelength, setHoveredWavelength] = useState(null);

  // Compute Core Fusion & Composition analysis
  const fusionAnalysis = useMemo(() => {
    const mockStar = star || {
      name: starName,
      temp,
      lum,
      mass,
      radius: Math.sqrt(lum) / Math.pow(temp / 5778, 2),
      spectralType,
      evolutionaryStage: stageOverride || 'Main Sequence'
    };
    return analyzeCoreFusionAndComposition(mockStar, lang);
  }, [star, starName, temp, lum, mass, spectralType, stageOverride, lang]);

  // Compute active lines with strengths
  const activeLines = useMemo(() => {
    return PROMINENT_SPECTRAL_LINES.map(line => {
      const strength = calculateLineStrength(line, temp, spectralType, lumClass);
      return {
        ...line,
        strength,
        visible: strength > 0.08
      };
    }).sort((a, b) => a.wavelengthNm - b.wavelengthNm);
  }, [temp, spectralType, lumClass]);

  // SVG dimensions for spectrum intensity curve
  const svgWidth = 280;
  const svgHeight = 44;

  // Generate 2D spectrum intensity curve points (normalized Planck curve with line dips)
  const spectrumPathD = useMemo(() => {
    const points = [];
    for (let x = 0; x <= svgWidth; x += 4) {
      const wl = 380 + (x / svgWidth) * (750 - 380);

      // Wien peak factor relative to 550nm
      const wPeak = 2.898e6 / temp; // nm
      const distFromPeak = Math.abs(wl - wPeak) / 450;
      let continuum = Math.max(0.2, 1.0 - Math.min(0.7, distFromPeak));

      // Calculate absorption line dip
      let absorption = 0;
      for (const line of activeLines) {
        if (!line.visible) continue;
        const delta = Math.abs(wl - line.wavelengthNm);
        if (delta < 8) {
          const depth = line.strength * 0.55 * Math.exp(-Math.pow(delta / 2.2, 2));
          absorption = Math.max(absorption, depth);
        }
      }

      const intensity = Math.max(0.12, continuum * (1.0 - absorption));
      const y = svgHeight - 6 - intensity * (svgHeight - 12);
      points.push(`${x},${y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  }, [temp, activeLines, svgWidth, svgHeight]);

  const spectroscopyLinks = useMemo(() => {
    return getSpectroscopyLinks(star, lang);
  }, [star, lang]);

  return (
    <div className={`stellar-spectroscopy-card ${compact ? 'compact' : ''}`}>
      {/* Top Header & Sub-Tab Switcher */}
      <div className="spec-card-header">
        <div className="spec-title-group">
          <Activity size={14} className="spec-header-icon" />
          <span className="spec-title">
            {isCs ? 'Stelární spektroskopie & jádro' : 'Stellar Spectroscopy & Core Engine'}
          </span>
        </div>

        <div className="spec-tab-buttons">
          <button
            className={`spec-tab-btn ${activeTab === 'spectrum' ? 'active' : ''}`}
            onClick={() => setActiveTab('spectrum')}
            title={isCs ? 'Optické absorpční a emisní spektrum' : 'Photospheric Optical Spectrum'}
          >
            <Sparkles size={11} />
            <span>{isCs ? 'Spektrum' : 'Spectrum'}</span>
          </button>
          <button
            className={`spec-tab-btn ${activeTab === 'fusion' ? 'active' : ''}`}
            onClick={() => setActiveTab('fusion')}
            title={isCs ? 'Termonukleární fúze v jádře' : 'Core Nuclear Fusion Engine'}
          >
            <Atom size={11} />
            <span>{isCs ? 'Fúze v jádře' : 'Core Fusion'}</span>
          </button>
          <button
            className={`spec-tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
            title={isCs ? 'Katalogy a vědecké reference' : 'Scientific Catalogues & Citations'}
          >
            <BookOpen size={11} />
            <span>{isCs ? 'Katalogy' : 'Archives'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OPTICAL SPECTRUM & FRAUNHOFER ABSORPTION LINES */}
      {activeTab === 'spectrum' && (
        <div className="spec-tab-content spectrum-content">
          {/* Continuous Planck Rainbow Strip (380 - 750 nm) */}
          <div
            className="optical-spectrum-viewport"
            onMouseLeave={() => {
              setHoveredLine(null);
              setHoveredWavelength(null);
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const currentWl = 380 + relX * (750 - 380);
              setHoveredWavelength(Math.round(currentWl));

              // Find closest line within 6nm
              const closest = activeLines.find(l => Math.abs(l.wavelengthNm - currentWl) < 6);
              setHoveredLine(closest || null);
            }}
          >
            {/* Base Continuous Blackbody Gradient */}
            <div className="spectrum-rainbow-strip" />

            {/* Overlaid Physical Absorption Lines */}
            {activeLines.map(line => {
              if (!line.visible) return null;
              const leftPercent = ((line.wavelengthNm - 380) / (750 - 380)) * 100;
              const isHovered = hoveredLine && hoveredLine.id === line.id;
              const opacity = 0.4 + line.strength * 0.55;

              return (
                <div
                  key={line.id}
                  className={`spectral-line-marker ${isHovered ? 'hovered' : ''} ${line.type}`}
                  style={{
                    left: `${leftPercent}%`,
                    opacity: opacity,
                    width: `${Math.max(1.5, line.strength * 3)}px`
                  }}
                  title={`${line.name} (${line.wavelengthNm} nm)`}
                >
                  {isHovered && <span className="line-tooltip-pill">{line.name}</span>}
                </div>
              );
            })}

            {/* Cursor tracker indicator */}
            {hoveredWavelength && (
              <div
                className="spectrum-cursor-line"
                style={{
                  left: `${((hoveredWavelength - 380) / (750 - 380)) * 100}%`
                }}
              />
            )}
          </div>

          {/* Scale Wavelength Ticks */}
          <div className="spectrum-ticks-row">
            <span>380 nm (UV)</span>
            <span>450 nm</span>
            <span>500 nm</span>
            <span>550 nm (V)</span>
            <span>600 nm</span>
            <span>656 nm (Hα)</span>
            <span>750 nm (IR)</span>
          </div>

          {/* 2D Normalized Flux Intensity Profile Curve */}
          <div className="spectrum-curve-box">
            <div className="curve-header">
              <span className="curve-title">{isCs ? 'Profil intenzity toku F(λ)' : 'Normalized Flux Intensity F(λ)'}</span>
              <span className="curve-temp-badge">{temp.toLocaleString()} K • {spectralType}</span>
            </div>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="spectrum-curve-svg">
              {/* Baseline */}
              <line x1="0" y1={svgHeight - 4} x2={svgWidth} y2={svgHeight - 4} stroke="rgba(0, 240, 255, 0.2)" strokeDasharray="2,3" />
              {/* Curve line */}
              <path d={spectrumPathD} fill="none" stroke="#00f0ff" strokeWidth="1.6" />
            </svg>
          </div>

          {/* Diagnostic Line Inspection Banner */}
          <div className="spectrum-inspection-banner">
            {hoveredLine ? (
              <div className="line-detail-readout">
                <div className="line-detail-top">
                  <strong className="line-name-highlight">{hoveredLine.name}</strong>
                  <span className="line-wl-badge">{hoveredLine.wavelengthNm.toFixed(1)} nm ({Math.round(hoveredLine.wavelengthNm * 10)} Å)</span>
                  <span className="line-elem-badge">{hoveredLine.element}</span>
                  <span className="line-strength-tag">
                    {isCs ? 'Absorpce:' : 'Absorption:'} {Math.round(hoveredLine.strength * 100)}%
                  </span>
                </div>
                <div className="line-detail-desc">
                  {isCs ? hoveredLine.descriptionCs : hoveredLine.description}
                  <span className="line-transition"> ({hoveredLine.transition})</span>
                </div>
              </div>
            ) : (
              <div className="line-instruction-readout">
                <Info size={12} className="info-icon" />
                <span>
                  {isCs
                    ? 'Přejeďte myší přes spektrum pro detail Fraunhoferových a Balmerových čar (Hα, Hβ, Ca II, Na D, Mg b, Fe I, TiO).'
                    : 'Hover over the visual spectrum strip to inspect Fraunhofer & Balmer absorption lines (Hα, Hβ, Ca II, Na D, Mg b, Fe I, TiO).'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CORE NUCLEAR FUSION & INTERNAL NUCLEOSYNTHESIS */}
      {activeTab === 'fusion' && fusionAnalysis && (
        <div className="spec-tab-content fusion-content">
          {/* Reaction Header Card */}
          <div className="fusion-core-card">
            <div className="fusion-engine-top">
              <Flame size={15} className="flame-icon" />
              <div className="fusion-type-name">{fusionAnalysis.fusionType}</div>
            </div>
            <p className="fusion-explanation">{fusionAnalysis.fusionDesc}</p>

            {/* Reaction Formula Box */}
            <div className="fusion-formula-box">
              <span className="formula-label">{isCs ? 'Klíčová jaderná reakce:' : 'Primary Nuclear Channel:'}</span>
              <code className="formula-code">{fusionAnalysis.primaryReactionFormula}</code>
            </div>
          </div>

          {/* Core Physical Parameters Grid */}
          <div className="core-stats-grid">
            <div className="core-stat-card">
              <span className="c-stat-label">
                <Thermometer size={10} />
                <span>{isCs ? 'Teplota jádra (Tc)' : 'Core Temp (Tc)'}</span>
              </span>
              <span className="c-stat-val">~{fusionAnalysis.coreTempMK} MK</span>
              <span className="c-stat-sub">({fusionAnalysis.coreTempMK >= 1000 ? (fusionAnalysis.coreTempMK / 1000).toFixed(1) + ' mld. K' : `${fusionAnalysis.coreTempMK} × 10⁶ K`})</span>
            </div>

            <div className="core-stat-card">
              <span className="c-stat-label">
                <Layers size={10} />
                <span>{isCs ? 'Vnitřní zónování' : 'Internal Layers'}</span>
              </span>
              <span className="c-stat-val highlight">{fusionAnalysis.coreZoneStructure}</span>
            </div>
          </div>

          {/* Photospheric Composition & Dredge-up */}
          <div className="composition-bar-container">
            <div className="comp-bar-header">
              <span>{isCs ? 'Složení fotosféry (hmotnostní frakce):' : 'Photospheric Abundance (Mass Fraction):'}</span>
              {fusionAnalysis.dredgeUpStatus && (
                <span className="dredge-badge">{fusionAnalysis.dredgeUpStatus}</span>
              )}
            </div>

            <div className="comp-multi-bar">
              <div
                className="comp-segment h-seg"
                style={{ width: `${fusionAnalysis.compositionH * 100}%` }}
                title={`Hydrogen (X): ${(fusionAnalysis.compositionH * 100).toFixed(0)}%`}
              >
                H {(fusionAnalysis.compositionH * 100).toFixed(0)}%
              </div>
              <div
                className="comp-segment he-seg"
                style={{ width: `${fusionAnalysis.compositionHe * 100}%` }}
                title={`Helium (Y): ${(fusionAnalysis.compositionHe * 100).toFixed(0)}%`}
              >
                He {(fusionAnalysis.compositionHe * 100).toFixed(0)}%
              </div>
              <div
                className="comp-segment z-seg"
                style={{ width: `${Math.max(4, fusionAnalysis.compositionMetals * 100)}%` }}
                title={`Metals (Z): ${(fusionAnalysis.compositionMetals * 100).toFixed(1)}%`}
              >
                Z {(fusionAnalysis.compositionMetals * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCIENTIFIC CATALOGUES & ARCHIVAL SPECTRA CITATIONS */}
      {activeTab === 'sources' && (
        <div className="spec-tab-content sources-content">
          <div className="spec-archives-intro">
            <BookOpen size={13} className="intro-icon" />
            <span>
              {isCs
                ? 'Pozorovaná spektra a modely nukleosyntézy jsou ověřeny vůči standardním hvězdným atlasům ESO UVES, STScI a ADS:'
                : 'Observed spectra and nucleosynthetic models cross-referenced against authoritative ESO UVES, STScI, and ADS spectral libraries:'}
            </span>
          </div>

          <div className="spec-links-list">
            {spectroscopyLinks.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="spec-archive-card"
                title={`${link.name} (${isCs ? 'externí vědecký odkaz' : 'external scientific link'})`}
              >
                <div className="spec-card-top">
                  <span className="spec-link-name">{link.name}</span>
                  <span className="spec-link-badge">{link.badge}</span>
                  <ExternalLink size={11} className="spec-ext-icon" />
                </div>
                <p className="spec-link-desc">{link.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
