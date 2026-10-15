import React, { useEffect } from 'react';
import { EVOLUTION_TRACKS, EVOLUTION_MASSES } from '../simulation/evolutionTracks';
import { temperatureToRGB } from '../simulation/blackbody';
import { Play, Pause, RotateCcw, Flame, Atom } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatSig, formatInt } from '../utils/format';
import HabitableZoneVisualizer from './HabitableZoneVisualizer';
import StellarSpectroscopy from './StellarSpectroscopy';

export default function EvolutionSimulator({
  selectedMass,
  onSelectMass,
  progress,
  onChangeProgress,
  isPlaying,
  onSetPlaying,
  evolutionState
}) {
  const { lang, t, formatAge } = useLanguage();
  const track = EVOLUTION_TRACKS[selectedMass] || EVOLUTION_TRACKS[1];
  const cs = lang === 'cs';

  // Advance the timeline while playing
  useEffect(() => {
    if (!isPlaying) return undefined;
    const interval = setInterval(() => {
      onChangeProgress((prev) => Math.min(1.0, prev + 0.004));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, onChangeProgress]);

  // Stop at the end of the track
  useEffect(() => {
    if (isPlaying && progress >= 1.0) onSetPlaying(false);
  }, [isPlaying, progress, onSetPlaying]);

  if (!evolutionState) return null;

  const hasPhotosphere = !evolutionState.noPhotosphere;
  const rgb = hasPhotosphere ? temperatureToRGB(evolutionState.temp) : { css: '#000000' };
  const stageLabel = cs ? evolutionState.stageCs : evolutionState.stage;

  return (
    <section className="evolution-simulator-panel" aria-labelledby="evolution-title">
      <div className="sim-header">
        <div className="sim-title-group">
          <span className="badge-tag">{t('interactiveSimulation')}</span>
          <h3 id="evolution-title">{t('evolutionTitle')}</h3>
        </div>

        <div className="mass-selector-group" role="group" aria-label={t('birthMassLabel')}>
          <span className="control-label">{t('birthMassLabel')}</span>
          <div className="mass-buttons">
            {EVOLUTION_MASSES.map((mass) => (
              <button
                type="button"
                key={mass}
                className={`mass-btn ${selectedMass === mass ? 'active' : ''}`}
                aria-pressed={selectedMass === mass}
                title={cs ? EVOLUTION_TRACKS[mass].nameCs : EVOLUTION_TRACKS[mass].name}
                onClick={() => {
                  onSelectMass(mass);
                  onChangeProgress(0.0);
                }}
              >
                {formatSig(mass, lang, 2)} M☉
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sim-timeline-card">
        <div className="timeline-controls">
          <button
            type="button"
            className={`play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={() => {
              if (!isPlaying && progress >= 1.0) onChangeProgress(0.0);
              onSetPlaying(!isPlaying);
            }}
            title={isPlaying ? t('pauseSim') : t('playSim')}
            aria-label={isPlaying ? t('pauseSim') : t('playSim')}
          >
            {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          </button>

          <button
            type="button"
            className="reset-time-btn"
            onClick={() => {
              onChangeProgress(0.0);
              onSetPlaying(false);
            }}
            title={t('resetToStarBirth')}
            aria-label={t('resetToStarBirth')}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>

          <div className="timeline-scrubber-wrap">
            <div className="timeline-info">
              <span className="timeline-stage-title" aria-live="polite">{stageLabel}</span>
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
              aria-label={t('timelineLabel')}
              aria-valuetext={`${stageLabel}, ${formatAge(evolutionState.ageYears)}`}
            />
            <div className="timeline-milestones">
              {track.steps.map((st) => (
                <button
                  type="button"
                  key={st.progress}
                  className={`milestone-dot ${Math.abs(progress - st.progress) < 0.01 ? 'active' : ''}`}
                  style={{ left: `${st.progress * 100}%` }}
                  onClick={() => onChangeProgress(st.progress)}
                  title={`${cs ? st.stageCs : st.stage} (${formatAge(st.ageYears)})`}
                  aria-label={`${cs ? st.stageCs : st.stage} (${formatAge(st.ageYears)})`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="sim-model-note">{t('evolutionModelNote')}</p>
      </div>

      <div className="sim-details-grid">
        <div className="sim-card state-card">
          <div className="sim-card-header">
            <Flame size={16} aria-hidden="true" />
            <span>{t('photosphereState')}</span>
          </div>
          <div className="sim-photosphere-preview">
            <div
              className="sim-star-circle"
              style={{ borderRadius: '50%', aspectRatio: '1 / 1', backgroundColor: rgb.css, boxShadow: hasPhotosphere ? `0 0 35px ${rgb.css}` : '0 0 0 2px #f43f5e' }}
            />
            <dl className="sim-star-data">
              <div><dt>{t('effectiveTemp')}</dt> <dd>{hasPhotosphere ? `${formatInt(evolutionState.temp, lang)} K` : '—'}</dd></div>
              <div><dt>{t('luminosity')}</dt> <dd>{hasPhotosphere ? `${formatSig(evolutionState.lum, lang)} L☉` : '—'}</dd></div>
              <div><dt>{t('radius')}</dt> <dd>{hasPhotosphere ? `${formatSig(evolutionState.radius, lang)} R☉` : '—'}</dd></div>
              <div><dt>{t('finalRemnant')}</dt> <dd>{cs ? evolutionState.remnantCs : evolutionState.remnant}</dd></div>
            </dl>
          </div>
          <p className="sim-stage-desc">{cs ? evolutionState.descriptionCs : evolutionState.description}</p>
        </div>

        <div className="sim-card fusion-card">
          <div className="sim-card-header">
            <Atom size={16} aria-hidden="true" />
            <span>{t('coreFusionState')}</span>
          </div>
          <div className="fusion-status-box">
            <div className="fusion-core-indicator" aria-hidden="true">
              <div className="core-concentric core-outer" />
              <div className="core-concentric core-middle" />
              <div className="core-concentric core-inner" style={{ backgroundColor: rgb.css }} />
            </div>
            <div className="fusion-state-text">
              <div className="fusion-state-title">{t('activeCoreProcess')}</div>
              <div className="fusion-state-details">{cs ? evolutionState.coreStateCs : evolutionState.coreState}</div>
            </div>
          </div>
        </div>

        <div className="sim-card spec-sim-card">
          <StellarSpectroscopy evolutionState={evolutionState} massOverride={selectedMass} compact={true} />
        </div>

        <div className="sim-card chz-sim-card">
          {hasPhotosphere ? (
            <HabitableZoneVisualizer lum={evolutionState.lum} temp={evolutionState.temp} isEvolutionMode={true} />
          ) : (
            <p className="sim-stage-desc">{t('noHabitableZoneBlackHole')}</p>
          )}
        </div>
      </div>
    </section>
  );
}
