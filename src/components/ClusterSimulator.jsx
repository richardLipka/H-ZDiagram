import React from 'react';
import { CLUSTER_PRESETS } from '../simulation/clusterSimulation';
import { Clock, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function ClusterSimulator({
  clusterAgeGyr,
  onChangeClusterAge,
  clusterIsochrone
}) {
  const { lang, t } = useLanguage();
  const to = clusterIsochrone?.turnoff;

  const formatClusterAge = (ageGyr) => {
    if (ageGyr >= 1.0) {
      return lang === 'cs'
        ? `${ageGyr.toFixed(2)} miliard let (Gyr)`
        : `${ageGyr.toFixed(2)} Billion Years (Gyr)`;
    }
    return lang === 'cs'
      ? `${Math.round(ageGyr * 1000)} milionů let (Myr)`
      : `${Math.round(ageGyr * 1000)} Million Years (Myr)`;
  };

  const getClusterName = (cluster) => {
    if (lang !== 'cs') return cluster.name;
    const csNames = {
      pleiades: 'Plejády (Kuřátka / M45)',
      hyades: 'Hvězdokupa Hyády',
      m67: 'Messier 67 (M67)',
      globular_47tuc: '47 Tucanae (Kulová kupa)'
    };
    return csNames[cluster.id] || cluster.name;
  };

  return (
    <div className="cluster-simulator-panel">
      <div className="cluster-header">
        <div className="cluster-title-group">
          <span className="badge-tag">{t('isochroneBadge')}</span>
          <h3>{t('clusterTitle')}</h3>
        </div>

        {/* Cluster Presets */}
        <div className="cluster-presets-bar">
          <span className="control-label">{t('realClustersLabel')}</span>
          <div className="cluster-chips">
            {CLUSTER_PRESETS.map((cluster) => {
              const isSelected = Math.abs(clusterAgeGyr - cluster.ageGyr) < 0.05;
              return (
                <button
                  key={cluster.id}
                  className={`cluster-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => onChangeClusterAge(cluster.ageGyr)}
                >
                  <span className="chip-name">{getClusterName(cluster)}</span>
                  <span className="chip-age">~{cluster.ageGyr >= 1 ? `${cluster.ageGyr} Gyr` : `${cluster.ageGyr * 1000} Myr`}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cluster Age Slider */}
      <div className="cluster-slider-card">
        <div className="slider-header-row">
          <span className="slider-title">{t('clusterAgeLabel')}</span>
          <span className="slider-readout">
            <Clock size={16} />
            <strong>{formatClusterAge(clusterAgeGyr)}</strong>
          </span>
        </div>

        <input
          type="range"
          min="0.05"
          max="13.5"
          step="0.05"
          value={clusterAgeGyr}
          onChange={(e) => onChangeClusterAge(parseFloat(e.target.value))}
          className="cluster-slider"
        />

        <div className="slider-ticks">
          <span>50 Myr ({t('clusterYoung')})</span>
          <span>500 Myr (Hyades)</span>
          <span>4 Gyr ({t('clusterSolarAge')})</span>
          <span>13 Gyr ({t('clusterGlobular')})</span>
        </div>
      </div>

      {/* Turn-off Point Real-time Metrics */}
      {to && (
        <div className="turnoff-metrics-card">
          <div className="metrics-summary">
            <div className="metric-box">
              <span className="metric-label">{t('turnoffMass')}</span>
              <span className="metric-val">{to.massMsun} M☉</span>
              <span className="metric-sub">{t('turnoffMassSub')}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">{t('turnoffTemp')}</span>
              <span className="metric-val">{to.tempK.toLocaleString()} K</span>
              <span className="metric-sub">{t('turnoffTempSub')}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">{t('turnoffLum')}</span>
              <span className="metric-val">{to.lumLsun} L☉</span>
              <span className="metric-sub">{t('turnoffLumSub')}</span>
            </div>
          </div>

          <div className="turnoff-explanation">
            <div className="exp-icon-wrap">
              <Info size={18} />
            </div>
            <p>
              <strong>{t('clusterPrincipleTitle')}</strong> {t('clusterPrincipleText')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

