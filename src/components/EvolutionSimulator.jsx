import React, { useEffect } from 'react';
import { EVOLUTION_TRACKS } from '../simulation/evolutionTracks';
import { temperatureToRGB } from '../simulation/blackbody';
import { Play, Pause, RotateCcw, Flame, Atom } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import HabitableZoneVisualizer from './HabitableZoneVisualizer';
import StellarSpectroscopy from './StellarSpectroscopy';

export default function EvolutionSimulator({
  selectedMass,
  onSelectMass,
  progress,
  onChangeProgress,
  isPlaying,
  onTogglePlay,
  evolutionState
}) {
  const { lang, t, formatAge, translateStageName } = useLanguage();
  const track = EVOLUTION_TRACKS[selectedMass] || EVOLUTION_TRACKS[1.0];

  // Auto-advance timeline if playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onChangeProgress((prev) => {
        if (prev >= 1.0) {
          onTogglePlay();
          return 1.0;
        }
        return Math.min(1.0, prev + 0.005);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, onChangeProgress, onTogglePlay]);

  if (!evolutionState) return null;

  const rgb = temperatureToRGB(evolutionState.temp);

  // Remnant name localization
  const formatRemnant = (remnant) => {
    if (lang !== 'cs' || !remnant) return remnant;
    if (remnant.includes('Carbon-Oxygen White Dwarf')) return 'Uhlíko-kyslíkový bílý trpaslík';
    if (remnant.includes('Helium White Dwarf')) return 'Heliový bílý trpaslík';
    if (remnant.includes('Neutron Star') || remnant.includes('Black Hole')) return 'Neutronová hvězda / Černá díra';
    return remnant;
  };

  return (
    <div className="evolution-simulator-panel">
      <div className="sim-header">
        <div className="sim-title-group">
          <span className="badge-tag">{t('interactiveSimulation')}</span>
          <h3>{t('evolutionTitle')}</h3>
        </div>

        {/* Mass Selector */}
        <div className="mass-selector-group">
          <span className="control-label">{t('birthMassLabel')}</span>
          <div className="mass-buttons">
            {Object.keys(EVOLUTION_TRACKS).map((massKey) => (
              <button
                key={massKey}
                className={`mass-btn ${parseFloat(selectedMass) === parseFloat(massKey) ? 'active' : ''}`}
                onClick={() => {
                  onSelectMass(parseFloat(massKey));
                  onChangeProgress(0.0);
                }}
              >
                {massKey} M☉
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scrubber & Playback */}
      <div className="sim-timeline-card">
        <div className="timeline-controls">
          <button
            className={`play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={onTogglePlay}
            title={isPlaying ? t('pauseSim') : t('playSim')}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            className="reset-time-btn"
            onClick={() => {
              onChangeProgress(0.0);
              if (isPlaying) onTogglePlay();
            }}
            title={t('resetToStarBirth')}
          >
            <RotateCcw size={16} />
          </button>

          <div className="timeline-scrubber-wrap">
            <div className="timeline-info">
              <span className="timeline-stage-title">{translateStageName(evolutionState.stage)}</span>
              <span className="timeline-age-readout">
                {t('elapsedAge')} <strong>{formatAge(evolutionState.ageYears)}</strong>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={progress}
              onChange={(e) => onChangeProgress(parseFloat(e.target.value))}
              className="timeline-slider"
            />
          </div>
        </div>

        {/* Milestones bar */}
        <div className="timeline-milestones">
          {track.steps.map((st, i) => (
            <button
              key={i}
              className={`milestone-dot ${Math.abs(progress - st.progress) < 0.04 ? 'active' : ''}`}
              style={{ left: `${st.progress * 100}%` }}
              onClick={() => onChangeProgress(st.progress)}
              title={`${translateStageName(st.stage)} (${formatAge(st.ageYears)})`}
            />
          ))}
        </div>
      </div>

      {/* Real-time State & Nuclear Core Cross Section */}
      <div className="sim-details-grid">
        {/* Current Star Properties */}
        <div className="sim-card state-card">
          <div className="sim-card-header">
            <Flame size={16} />
            <span>{t('photosphereState')}</span>
          </div>

          <div className="sim-photosphere-preview">
            <div
              className="sim-star-circle"
              style={{
                borderRadius: '50%',
                aspectRatio: '1 / 1',
                backgroundColor: rgb.css,
                boxShadow: `0 0 35px ${rgb.css}`
              }}
            />
            <div className="sim-star-data">
              <div><span>{t('effectiveTemp')}</span> <strong>{evolutionState.temp.toLocaleString()} K</strong></div>
              <div><span>{t('luminosity')}</span> <strong>{evolutionState.lum} L☉</strong></div>
              <div><span>{t('radius')}</span> <strong>{evolutionState.radius} R☉</strong></div>
              <div><span>{t('finalRemnant')}</span> <strong>{formatRemnant(evolutionState.remnant)}</strong></div>
            </div>
          </div>
          <p className="sim-stage-desc">{evolutionState.description}</p>
        </div>

        {/* Nuclear Core Fusion Engine */}
        <div className="sim-card fusion-card">
          <div className="sim-card-header">
            <Atom size={16} />
            <span>{t('coreFusionState')}</span>
          </div>

          <div className="fusion-status-box">
            <div className="fusion-core-indicator">
              <div className="core-concentric core-outer" />
              <div className="core-concentric core-middle" />
              <div
                className="core-concentric core-inner"
                style={{ backgroundColor: rgb.css }}
              />
            </div>
            <div className="fusion-state-text">
              <div className="fusion-state-title">{t('activeCoreProcess')}</div>
              <div className="fusion-state-details">{evolutionState.coreState}</div>
            </div>
          </div>
        </div>

        {/* Live Photospheric Spectrum & Nucleosynthetic Diagnostics */}
        <div className="sim-card spec-sim-card">
          <StellarSpectroscopy
            tempOverride={evolutionState.temp}
            lumOverride={evolutionState.lum}
            massOverride={selectedMass}
            stageOverride={evolutionState.stage}
            compact={true}
          />
        </div>

        {/* Circumstellar Habitable Zone Planetary Fate Card */}
        <div className="sim-card chz-sim-card">
          <HabitableZoneVisualizer
            lum={evolutionState.lum}
            temp={evolutionState.temp}
            name={track.name}
            isEvolutionMode={true}
          />
        </div>
      </div>
    </div>
  );
}

