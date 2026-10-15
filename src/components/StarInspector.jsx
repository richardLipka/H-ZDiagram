import { temperatureToRGB } from '../simulation/blackbody';
import { Sun, Compass, X, Scale, Target, ShieldAlert, BookOpen, ExternalLink } from 'lucide-react';
import { getWikipediaUrl, getSimbadUrl, getStarCatalogLinks } from '../utils/catalogLinks';
import { useLanguage } from '../i18n/LanguageContext';

import HabitableZoneVisualizer from './HabitableZoneVisualizer';

export default function StarInspector({
  star,
  onClose,
  onAddToCompare,
  isComparing
}) {
  const { lang, t, formatLifetime, translateStageName } = useLanguage();
  if (!star) return null;

  const rgb = temperatureToRGB(star.temp);
  const lifetime = formatLifetime(star.mass);
  const catalogLinks = getStarCatalogLinks(star, lang);

  // Scaled radius for astrometrics holographic preview
  const visualScale = Math.max(16, Math.min(110, Math.log10(Math.max(0.01, star.radius)) * 26 + 44));

  return (
    <aside className="star-inspector-panel hud-panel">
      {/* Tactical HUD Header */}
      <div className="inspector-header hud-panel-header">
        <div className="inspector-title-group">
          <div className="hud-status-line">
            <Target size={12} className="target-icon" />
            <span className="hud-label">{t('targetLockTitle')}</span>
            {star.isExotic && (
              <span className="exotic-badge hud-badge pulse">
                [ {t('exoticBadge')}: {t(star.exoticType === 'black_hole' ? 'blackHole' : 'neutronStar')} ]
              </span>
            )}
          </div>
          <div className="inspector-title-row">
            <h2>{star.name.toUpperCase()}</h2>
            <a
              href={getWikipediaUrl(star, lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="wiki-pill-link"
              title={lang === 'cs' ? 'Otevřít článek na Wikipedii' : 'Open encyclopedic record on Wikipedia'}
            >
              <span>{t('wikipediaBadge')}</span>
              <ExternalLink size={10} />
            </a>
          </div>
          <div className="inspector-sub hud-sub">
            {star.hip && (
              <a
                href={getSimbadUrl(star)}
                target="_blank"
                rel="noopener noreferrer"
                className="bayer-tag catalog-link-badge"
                title={lang === 'cs' ? 'Dotaz do astronomické databáze CDS SIMBAD' : 'Query CDS SIMBAD database for HIP record'}
              >
                [ HIP {star.hip} ↗ ]
              </a>
            )}
            {star.bayer && <span className="bayer-tag">[ {star.bayer} ]</span>}
            <span className="constellation-tag">{t('constellationPrefix')} {star.constellation.toUpperCase()}</span>
          </div>
        </div>
        <button
          className="close-inspector-btn hud-close"
          onClick={onClose}
          title={lang === 'cs' ? 'Zavřít inspekci cíle' : 'Disengage Target'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Holographic Photosphere Sensor Chamber */}
      <div className="photosphere-card hud-sensor-chamber">
        <div className="sensor-reticle-ring">
          <div className="reticle-crosshair-h" />
          <div className="reticle-crosshair-v" />
          <div className="photosphere-display">
            <div
              className="star-photosphere"
              style={{
                width: `${visualScale}px`,
                height: `${visualScale}px`,
                backgroundColor: rgb.css,
                boxShadow: `0 0 ${visualScale * 0.9}px ${rgb.css}, 0 0 ${visualScale * 1.8}px rgba(0, 240, 255, 0.4)`
              }}
            >
              <div className="star-core-highlight" />
            </div>
          </div>
        </div>

        <div className="photosphere-caption hud-telemetry-caption">
          <span className="color-temp-badge hud-temp-badge" style={{ borderColor: rgb.css, color: '#ffffff' }}>
            {star.temp.toLocaleString()} K • {t('classLabel')} {star.spectralType}
          </span>
          <span className="stage-text hud-stage-text">// {translateStageName(star.evolutionaryStage).toUpperCase()}</span>
        </div>
      </div>

      {/* Circumstellar Habitable Zone & 2D Orbital Radar */}
      <div className="inspector-section hz-section hud-section">
        <HabitableZoneVisualizer star={star} />
      </div>

      {/* Primary Astrophysics Telemetry Matrix */}
      <div className="inspector-section hud-section">
        <div className="section-title hud-sec-title">
          <Compass size={14} />
          <span>{t('astrophysicalMatrix')}</span>
        </div>

        <div className="params-grid hud-params-grid">
          <div className="param-item hud-param">
            <span className="param-label">{t('paramLuminosity')}</span>
            <span className="param-val">{star.lum >= 1000 ? star.lum.toLocaleString() : star.lum} L☉</span>
          </div>
          <div className="param-item hud-param">
            <span className="param-label">{t('paramRadius')}</span>
            <span className="param-val">{star.radius} R☉</span>
          </div>
          <div className="param-item hud-param">
            <span className="param-label">{t('paramEstimatedMass')}</span>
            <span className="param-val">{star.mass ? `${star.mass} M☉` : '—'}</span>
          </div>
          <div className="param-item hud-param">
            <span className="param-label">{t('paramAbsMag')}</span>
            <span className="param-val">{star.absMag > 0 ? `+${star.absMag}` : star.absMag}</span>
          </div>
          <div className="param-item hud-param">
            <span className="param-label">{t('paramDistance')}</span>
            <span className="param-val">{star.distance_ly ? `${star.distance_ly.toLocaleString()} ${t('lightYears')}` : '—'}</span>
          </div>
          <div className="param-item hud-param">
            <span className="param-label">{t('paramLifetime')}</span>
            <span className="param-val">{lifetime.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Stellar Pulsations if variable */}
      {star.pulsationPeriodDays && (
        <div className="inspector-section variable-section hud-section">
          <div className="section-title hud-sec-title">
            <ShieldAlert size={14} />
            <span>{t('radialPulsationHeader')}</span>
          </div>
          <p className="variable-desc">
            {t('radialPulsationText', { period: star.pulsationPeriodDays })}
          </p>
        </div>
      )}

      {/* Notable Facts & Astrometric Logs */}
      {star.notableFacts && (
        <div className="inspector-section facts-section hud-section">
          <div className="section-title hud-sec-title">
            <Sun size={14} />
            <span>{t('archiveLogHeader')}</span>
          </div>
          <p className="star-facts-text">{star.notableFacts}</p>
        </div>
      )}

      {/* External Catalogues & Encyclopedic Archives */}
      <div className="inspector-section catalog-links-section hud-section">
        <div className="section-title hud-sec-title">
          <BookOpen size={14} />
          <span>{t('catalogLinksHeader')}</span>
        </div>
        <div className="catalog-links-list">
          {catalogLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="catalog-link-card"
              title={`${link.name} (${lang === 'cs' ? 'externí odkaz' : 'external link'})`}
            >
              <div className="catalog-link-top">
                <span className="catalog-link-name">{link.name}</span>
                <span className={`cat-badge cat-badge-${link.type}`}>{link.badge}</span>
                <ExternalLink size={12} className="catalog-ext-icon" />
              </div>
              <div className="catalog-link-desc">{link.description}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Tactical Actions */}
      <div className="inspector-actions hud-actions">
        <button
          className={`action-btn hud-action-btn ${isComparing ? 'active' : ''}`}
          onClick={() => onAddToCompare(star)}
        >
          <Scale size={16} />
          <span>{isComparing ? t('disengageCompare') : t('engageCompare')}</span>
        </button>
      </div>
    </aside>
  );
}

