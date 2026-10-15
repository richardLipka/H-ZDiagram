import React, { useState, useMemo } from 'react';
import {
  PROMINENT_SPECTRAL_LINES,
  calculateLineStrength,
  calculatePlanckFlux,
  analyzeCoreFusionAndComposition,
  getSpectroscopyLinks
} from '../utils/spectroscopy';
import { useLanguage } from '../i18n/LanguageContext';
import { formatInt, formatFixed } from '../utils/format';
import { Activity, Atom, BookOpen, ExternalLink, Flame, Info, Layers, Sparkles, Thermometer } from 'lucide-react';

const WL_MIN = 380;
const WL_MAX = 750;

export default function StellarSpectroscopy({ star, evolutionState, massOverride, compact = false }) {
  const { lang, t } = useLanguage();

  // Either a catalogue star or a state of the evolution simulator
  const subject = useMemo(() => {
    if (star) return star;
    if (!evolutionState) return null;
    return {
      temp: evolutionState.temp,
      lum: evolutionState.lum,
      radius: evolutionState.radius,
      mass: massOverride,
      stage: evolutionState.stage,
      noPhotosphere: evolutionState.noPhotosphere
    };
  }, [star, evolutionState, massOverride]);

  const [activeTab, setActiveTab] = useState('spectrum');
  const [hoveredLine, setHoveredLine] = useState(null);
  const [hoveredWavelength, setHoveredWavelength] = useState(null);

  const temp = subject && subject.temp ? subject.temp : null;
  const spectralType = star ? star.spectralType : null;
  const lumClass = star ? star.luminosityClass : 'V';
  const fusionAnalysis = useMemo(() => (subject ? analyzeCoreFusionAndComposition(subject, lang) : null), [subject, lang]);

  // Neutron stars: a thermal continuum without the stellar absorption features modelled here
  const showLines = Boolean(temp) && fusionAnalysis && fusionAnalysis.phase !== 'neutron_star';
  const activeLines = useMemo(() => {
    if (!showLines) return [];
    return PROMINENT_SPECTRAL_LINES.map((line) => {
      const strength = calculateLineStrength(line, temp, spectralType, lumClass);
      return { ...line, strength, visible: strength > 0.08 };
    }).sort((a, b) => a.wavelengthNm - b.wavelengthNm);
  }, [showLines, temp, spectralType, lumClass]);

  // Planck continuum normalised to its maximum in the visible range, with line dips
  const svgWidth = 280;
  const svgHeight = 44;
  const spectrumPathD = useMemo(() => {
    if (!temp) return '';
    const samples = [];
    for (let x = 0; x <= svgWidth; x += 4) {
      samples.push({ x, wl: WL_MIN + (x / svgWidth) * (WL_MAX - WL_MIN) });
    }
    const flux = samples.map((s) => calculatePlanckFlux(s.wl, temp));
    const maxFlux = Math.max(...flux) || 1;
    const points = samples.map((s, i) => {
      let absorption = 0;
      for (const line of activeLines) {
        if (!line.visible) continue;
        const delta = Math.abs(s.wl - line.wavelengthNm);
        if (delta < 8) absorption = Math.max(absorption, line.strength * 0.55 * Math.exp(-((delta / 2.2) ** 2)));
      }
      const intensity = (flux[i] / maxFlux) * (1 - absorption);
      const y = svgHeight - 4 - intensity * (svgHeight - 8);
      return `${s.x},${y.toFixed(1)}`;
    });
    return `M ${points.join(' L ')}`;
  }, [temp, activeLines]);

  const spectroscopyLinks = useMemo(() => getSpectroscopyLinks(star, lang), [star, lang]);
  const wienPeakNm = temp ? 2.897771955e6 / temp : null;

  const tabs = [
    { id: 'spectrum', icon: Sparkles, label: t('specTabSpectrum') },
    { id: 'fusion', icon: Atom, label: t('specTabFusion') },
    { id: 'sources', icon: BookOpen, label: t('specTabSources') }
  ];

  return (
    <div className={`stellar-spectroscopy-card ${compact ? 'compact' : ''}`}>
      <div className="spec-card-header">
        <div className="spec-title-group">
          <Activity size={14} className="spec-header-icon" aria-hidden="true" />
          <h3 className="spec-title">{t('specTitle')}</h3>
        </div>
        <div className="spec-tab-buttons" role="tablist">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={`spec-tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={11} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'spectrum' && (
        <div className="spec-tab-content spectrum-content" role="tabpanel">
          {!temp ? (
            <p className="line-instruction-readout">{t('specNoPhotosphere')}</p>
          ) : (
            <>
              <div
                className="optical-spectrum-viewport"
                onMouseLeave={() => {
                  setHoveredLine(null);
                  setHoveredWavelength(null);
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const wl = WL_MIN + Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * (WL_MAX - WL_MIN);
                  setHoveredWavelength(Math.round(wl));
                  setHoveredLine(activeLines.find((l) => l.visible && Math.abs(l.wavelengthNm - wl) < 6) || null);
                }}
              >
                <div className="spectrum-rainbow-strip" />
                {activeLines.map((line) => {
                  if (!line.visible) return null;
                  const isHovered = hoveredLine && hoveredLine.id === line.id;
                  return (
                    <button
                      type="button"
                      key={line.id}
                      className={`spectral-line-marker ${isHovered ? 'hovered' : ''} ${line.type}`}
                      style={{
                        left: `${((line.wavelengthNm - WL_MIN) / (WL_MAX - WL_MIN)) * 100}%`,
                        opacity: 0.4 + line.strength * 0.55,
                        width: `${Math.max(1.5, line.strength * 3)}px`
                      }}
                      aria-label={`${line.name} (${formatFixed(line.wavelengthNm, lang, 1)} nm)`}
                      onFocus={() => setHoveredLine(line)}
                      onBlur={() => setHoveredLine(null)}
                    >
                      {isHovered && <span className="line-tooltip-pill">{line.name}</span>}
                    </button>
                  );
                })}
                {hoveredWavelength && (
                  <div className="spectrum-cursor-line" style={{ left: `${((hoveredWavelength - WL_MIN) / (WL_MAX - WL_MIN)) * 100}%` }} />
                )}
              </div>

              <div className="spectrum-ticks-row" aria-hidden="true">
                <span>380 nm</span>
                <span>450</span>
                <span>500</span>
                <span>550</span>
                <span>600</span>
                <span>656 (Hα)</span>
                <span>750 nm</span>
              </div>

              <div className="spectrum-curve-box">
                <div className="curve-header">
                  <span className="curve-title">{t('specCurveTitle')}</span>
                  <span className="curve-temp-badge">
                    {formatInt(temp, lang)} K{spectralType ? ` • ${spectralType}` : ''} • λ<sub>max</sub> ≈ {formatInt(wienPeakNm, lang)} nm
                  </span>
                </div>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="spectrum-curve-svg" role="img" aria-label={t('specCurveTitle')}>
                  <line x1="0" y1={svgHeight - 4} x2={svgWidth} y2={svgHeight - 4} stroke="rgba(0, 240, 255, 0.2)" strokeDasharray="2,3" />
                  <path d={spectrumPathD} fill="none" stroke="#00f0ff" strokeWidth="1.6" />
                </svg>
              </div>

              <div className="spectrum-inspection-banner" aria-live="polite">
                {hoveredLine ? (
                  <div className="line-detail-readout">
                    <div className="line-detail-top">
                      <strong className="line-name-highlight">{hoveredLine.name}</strong>
                      <span className="line-wl-badge">{formatFixed(hoveredLine.wavelengthNm, lang, 2)} nm</span>
                      <span className="line-elem-badge">{hoveredLine.ionization}</span>
                      <span className="line-strength-tag">{t('specRelativeStrength')}: {Math.round(hoveredLine.strength * 100)} %</span>
                    </div>
                    <div className="line-detail-desc">
                      {lang === 'cs' ? hoveredLine.descriptionCs : hoveredLine.description}
                      <span className="line-transition"> ({hoveredLine.transition})</span>
                    </div>
                  </div>
                ) : (
                  <div className="line-instruction-readout">
                    <Info size={12} className="info-icon" aria-hidden="true" />
                    <span>{t('specHint')}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'fusion' && fusionAnalysis && (
        <div className="spec-tab-content fusion-content" role="tabpanel">
          <div className="fusion-core-card">
            <div className="fusion-engine-top">
              <Flame size={15} className="flame-icon" aria-hidden="true" />
              <div className="fusion-type-name">{fusionAnalysis.fusionType}</div>
            </div>
            <p className="fusion-explanation">{fusionAnalysis.fusionDesc}</p>
            <div className="fusion-formula-box">
              <span className="formula-label">{t('specKeyRelation')}</span>
              <code className="formula-code">{fusionAnalysis.primaryReactionFormula}</code>
            </div>
          </div>

          <div className="core-stats-grid">
            <div className="core-stat-card">
              <span className="c-stat-label">
                <Thermometer size={10} aria-hidden="true" />
                <span>{t('specCoreTemp')}</span>
              </span>
              <span className="c-stat-val">{fusionAnalysis.coreTempLabel}</span>
            </div>
            <div className="core-stat-card">
              <span className="c-stat-label">
                <Layers size={10} aria-hidden="true" />
                <span>{t('specStructure')}</span>
              </span>
              <span className="c-stat-val highlight">{fusionAnalysis.coreZoneStructure}</span>
            </div>
          </div>

          {fusionAnalysis.compositionH !== null && (
            <div className="composition-bar-container">
              <div className="comp-bar-header">
                <span>{t('specComposition')}</span>
                <span className="dredge-badge">{fusionAnalysis.compositionNote}</span>
              </div>
              <div className="comp-multi-bar">
                {[
                  ['h-seg', 'H', 'X', fusionAnalysis.compositionH],
                  ['he-seg', 'He', 'Y', fusionAnalysis.compositionHe],
                  ['z-seg', 'Z', 'Z', fusionAnalysis.compositionMetals]
                ].filter(([, , , v]) => v > 0).map(([cls, label, symbol, v]) => (
                  <div key={cls} className={`comp-segment ${cls}`} style={{ width: `${Math.max(6, v * 100)}%` }} title={`${symbol} = ${formatFixed(v, lang, 4)}`}>
                    {label} {formatFixed(v * 100, lang, v < 0.1 ? 1 : 0)} %
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="fusion-citation">{t('referencesLabel')} {fusionAnalysis.scientificCitation}</p>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="spec-tab-content sources-content" role="tabpanel">
          <p className="spec-archives-intro">
            <BookOpen size={13} className="intro-icon" aria-hidden="true" /> {t('specSourcesIntro')}
          </p>
          <div className="spec-links-list">
            {spectroscopyLinks.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="spec-archive-card">
                <div className="spec-card-top">
                  <span className="spec-link-name">{link.name}</span>
                  <span className="spec-link-badge">{link.badge}</span>
                  <ExternalLink size={11} className="spec-ext-icon" aria-hidden="true" />
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
