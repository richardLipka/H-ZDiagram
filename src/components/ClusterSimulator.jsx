import React from 'react';
import { CLUSTER_PRESETS, CLUSTER_AGE_RANGE_GYR } from '../simulation/clusterSimulation';
import { Clock, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatSig, formatInt } from '../utils/format';

// The age slider is logarithmic: young clusters need finer steps than old ones
const LOG_MIN = Math.log10(CLUSTER_AGE_RANGE_GYR[0]);
const LOG_MAX = Math.log10(CLUSTER_AGE_RANGE_GYR[1]);
const TICKS_GYR = [0.05, 0.5, 1, 5, 13.5];

export default function ClusterSimulator({ clusterAgeGyr, onChangeClusterAge, clusterIsochrone }) {
  const { lang, t } = useLanguage();
  const to = clusterIsochrone?.turnoff;

  const formatClusterAge = (ageGyr) =>
    ageGyr >= 1
      ? t('ageGyr', { val: formatSig(ageGyr, lang, 3) })
      : t('ageMyr', { val: formatInt(ageGyr * 1000, lang) });

  return (
    <section className="cluster-simulator-panel" aria-labelledby="cluster-title">
      <div className="cluster-header">
        <div className="cluster-title-group">
          <span className="badge-tag">{t('isochroneBadge')}</span>
          <h3 id="cluster-title">{t('clusterTitle')}</h3>
        </div>

        <div className="cluster-presets-bar">
          <span className="control-label">{t('realClustersLabel')}</span>
          <div className="cluster-chips">
            {CLUSTER_PRESETS.map((cluster) => {
              const isSelected = Math.abs(Math.log10(clusterAgeGyr / cluster.ageGyr)) < 0.02;
              return (
                <button
                  type="button"
                  key={cluster.id}
                  className={`cluster-chip ${isSelected ? 'active' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => onChangeClusterAge(cluster.ageGyr)}
                >
                  <span className="chip-name">{t(`cluster_${cluster.id}`)}</span>
                  <span className="chip-age">~{formatClusterAge(cluster.ageGyr)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cluster-slider-card">
        <div className="slider-header-row">
          <label className="slider-title" htmlFor="cluster-age-slider">{t('clusterAgeLabel')}</label>
          <span className="slider-readout">
            <Clock size={16} aria-hidden="true" />
            <strong>{formatClusterAge(clusterAgeGyr)}</strong>
          </span>
        </div>
        <input
          id="cluster-age-slider"
          type="range"
          min={LOG_MIN}
          max={LOG_MAX}
          step="0.005"
          value={Math.log10(clusterAgeGyr)}
          onChange={(e) => onChangeClusterAge(Number((10 ** parseFloat(e.target.value)).toPrecision(3)))}
          className="cluster-slider"
          aria-valuetext={formatClusterAge(clusterAgeGyr)}
        />
        <div className="slider-ticks log-ticks" aria-hidden="true">
          {TICKS_GYR.map((age) => (
            <span key={age} style={{ left: `${((Math.log10(age) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100}%` }}>
              {formatClusterAge(age)}
            </span>
          ))}
        </div>
      </div>

      {to && (
        <div className="turnoff-metrics-card">
          <div className="metrics-summary">
            <div className="metric-box">
              <span className="metric-label">{t('turnoffMass')}</span>
              <span className="metric-val">{formatSig(to.massMsun, lang, 3)} M☉</span>
              <span className="metric-sub">{t('turnoffMassSub')}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">{t('turnoffTemp')}</span>
              <span className="metric-val">{formatInt(Math.round(to.tempK / 10) * 10, lang)} K</span>
              <span className="metric-sub">{t('turnoffTempSub')}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">{t('turnoffLum')}</span>
              <span className="metric-val">{formatSig(to.lumLsun, lang, 3)} L☉</span>
              <span className="metric-sub">{t('turnoffLumSub')}</span>
            </div>
          </div>

          <div className="turnoff-explanation">
            <div className="exp-icon-wrap">
              <Info size={18} aria-hidden="true" />
            </div>
            <p>
              <strong>{t('clusterPrincipleTitle')}</strong> {t('clusterPrincipleText')}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
