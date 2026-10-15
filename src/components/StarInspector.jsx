import React, { useState, useEffect } from 'react';
import { temperatureToRGB } from '../simulation/blackbody';
import { Sun, Compass, X, Scale, Target, Activity, BookOpen, ExternalLink, Radio, Sparkles, Image as ImageIcon, Info } from 'lucide-react';
import { getWikipediaUrl, getSimbadUrl, getStarCatalogLinks } from '../utils/catalogLinks';
import { fetchSimbadData, simbadTypeLabel } from '../services/simbadService';
import { useLanguage } from '../i18n/LanguageContext';
import { formatSig, formatInt, formatMag } from '../utils/format';

import HabitableZoneVisualizer from './HabitableZoneVisualizer';
import StellarSpectroscopy from './StellarSpectroscopy';

export default function StarInspector({ star, onClose, onAddToCompare, isComparing }) {
  const { lang, t, formatLifetime, translateStageName } = useLanguage();
  const [simbadData, setSimbadData] = useState(null);
  const [loadedStarId, setLoadedStarId] = useState(null);
  const [viewMode, setViewMode] = useState('simbad'); // 'simbad' | 'model'
  const [imageError, setImageError] = useState(false);

  const isLoadingSimbad = Boolean(star && loadedStarId !== star.id);

  useEffect(() => {
    if (!star) return undefined;
    let isMounted = true;
    fetchSimbadData(star)
      .then((data) => {
        if (!isMounted) return;
        setSimbadData(data);
        setLoadedStarId(star.id);
        setImageError(false);
        setViewMode(data && data.available && data.imageUrl ? 'simbad' : 'model');
      })
      .catch(() => {
        if (!isMounted) return;
        setSimbadData({ available: false });
        setLoadedStarId(star.id);
        setImageError(false);
        setViewMode('model');
      });
    return () => {
      isMounted = false;
    };
  }, [star]);

  if (!star) return null;

  const rgb = temperatureToRGB(star.temp);
  const isMainSequence = star.luminosityClass === 'V';
  const lifetime = isMainSequence && star.mass ? formatLifetime(star.mass) : null;
  const catalogLinks = getStarCatalogLinks(star, lang);
  const facts = lang === 'cs' ? star.notableFactsCs : star.notableFacts;
  const isExoticRemnant = star.luminosityClass === 'NS';

  // Logarithmic display size of the photosphere model
  const visualScale = Math.max(22, Math.min(108, Math.log10(Math.max(0.01, star.radius)) * 26 + 46));

  const hasSimbadImage = simbadData && simbadData.available && simbadData.imageUrl && !imageError;
  const isShowingSimbad = viewMode === 'simbad' && hasSimbadImage;

  return (
    <aside className="star-inspector-panel hud-panel" aria-label={t('targetLockTitle')}>
      <div className="inspector-header hud-panel-header">
        <div className="inspector-title-group">
          <div className="hud-status-line">
            <Target size={12} className="target-icon" aria-hidden="true" />
            <span className="hud-label">{t('targetLockTitle')}</span>
            {star.isExotic && (
              <span className="exotic-badge hud-badge">
                {t(star.exoticType === 'black_hole' ? 'blackHoleBinary' : 'neutronStar')}
              </span>
            )}
          </div>
          <div className="inspector-title-row">
            <h2>{star.name}</h2>
            <a
              href={getWikipediaUrl(star, lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="wiki-pill-link"
              title={t('openWikipedia')}
            >
              <span>{t('wikipediaBadge')}</span>
              <ExternalLink size={10} aria-hidden="true" />
            </a>
          </div>
          <div className="inspector-sub hud-sub">
            {star.hip && (
              <a href={getSimbadUrl(star)} target="_blank" rel="noopener noreferrer" className="bayer-tag catalog-link-badge" title={t('querySimbad')}>
                HIP {star.hip} ↗
              </a>
            )}
            {star.bayer && <span className="bayer-tag">{star.bayer}</span>}
            {star.constellation && star.constellation !== 'None' && (
              <span className="constellation-tag">{t('constellationPrefix')} {star.constellation}</span>
            )}
            {star.hasExoplanets && star.neaHost && (
              <a
                href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(star.neaHost)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="exoplanet-header-pill"
                title={t('nasaArchiveTitle')}
              >
                🪐 {t('exoplanetCountShort', { count: star.exoplanetCount })} • NASA ↗
              </a>
            )}
            {star.planetCount > 0 && <span className="exoplanet-header-pill">🪐 {t('solarPlanets', { count: star.planetCount })}</span>}
          </div>
        </div>
        <button type="button" className="close-inspector-btn hud-close" onClick={onClose} title={t('close')} aria-label={t('close')}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Sky image or photosphere model */}
      <div className="photosphere-card hud-sensor-chamber">
        <div className="chamber-mode-selector" role="group" aria-label={t('imageModeLabel')}>
          <button
            type="button"
            className={`chamber-toggle-btn ${isShowingSimbad ? 'active' : ''}`}
            onClick={() => setViewMode('simbad')}
            disabled={!hasSimbadImage}
            aria-pressed={isShowingSimbad}
            title={t('skyImageTitle')}
          >
            <Radio size={11} aria-hidden="true" />
            <span>{t('simbadSkyCutout')}</span>
          </button>
          <button
            type="button"
            className={`chamber-toggle-btn ${!isShowingSimbad ? 'active' : ''}`}
            onClick={() => setViewMode('model')}
            aria-pressed={!isShowingSimbad}
            title={t('photosphereModelTitle')}
          >
            <Sparkles size={11} aria-hidden="true" />
            <span>{t('photosphereModel')}</span>
          </button>
        </div>

        <div className="sensor-reticle-ring">
          <div className="reticle-crosshair-h" />
          <div className="reticle-crosshair-v" />
          {isShowingSimbad ? (
            <div className="simbad-sky-aperture">
              <img
                src={simbadData.imageUrl}
                alt={t('skyImageAlt', { name: star.name })}
                className="simbad-sky-img"
                onError={() => setImageError(true)}
              />
              <div className="simbad-optics-ring" />
            </div>
          ) : (
            <div className="photosphere-display">
              <div
                className="star-photosphere"
                role="img"
                aria-label={t('photosphereModelTitle')}
                style={{
                  width: `${visualScale}px`,
                  height: `${visualScale}px`,
                  borderRadius: '50%',
                  backgroundColor: rgb.css,
                  boxShadow: `0 0 ${visualScale * 0.9}px ${rgb.css}, 0 0 ${visualScale * 1.8}px rgba(0, 240, 255, 0.4)`
                }}
              >
                <div className="star-core-highlight" />
              </div>
            </div>
          )}
          {isLoadingSimbad && (
            <div className="chamber-loading-overlay" role="status">
              <div className="radar-sweep-spinner" />
              <span className="radar-loading-label">{t('queryingSimbad')}…</span>
            </div>
          )}
        </div>

        <div className="photosphere-caption hud-telemetry-caption">
          {isShowingSimbad ? (
            <span className="simbad-source-badge">
              <ImageIcon size={10} aria-hidden="true" />
              {simbadData.isSolarSpecial ? t('sunImageCredit') : t('dssImageCredit')}
            </span>
          ) : (
            <span className="color-temp-badge hud-temp-badge" style={{ borderColor: rgb.css }}>
              {formatInt(star.temp, lang)} K • {star.spectralType}
            </span>
          )}
          <span className="stage-text hud-stage-text">{translateStageName(star.evolutionaryStage)}</span>
        </div>

        {simbadData && simbadData.available && !simbadData.isSolarSpecial && (
          <div className="simbad-telemetry-strip">
            {simbadData.ra !== null && simbadData.dec !== null && (
              <div className="simbad-tel-item">
                <span className="simbad-tel-lbl">J2000:</span>
                <span className="simbad-tel-val">{simbadData.ra.toFixed(3)}°, {simbadData.dec >= 0 ? '+' : '−'}{Math.abs(simbadData.dec).toFixed(3)}°</span>
              </div>
            )}
            {simbadData.objectType && (
              <div className="simbad-tel-item">
                <span className="simbad-tel-lbl">{t('simbadClass')}:</span>
                <span className="simbad-tel-val highlight">{simbadTypeLabel(simbadData.objectType, lang)}</span>
              </div>
            )}
            {simbadData.parallax !== null && (
              <div className="simbad-tel-item">
                <span className="simbad-tel-lbl">{t('simbadPlx')}:</span>
                <span className="simbad-tel-val">{formatSig(simbadData.parallax, lang, 5)} mas</span>
              </div>
            )}
            {simbadData.radVel !== null && (
              <div className="simbad-tel-item">
                <span className="simbad-tel-lbl">{t('simbadRv')}:</span>
                <span className="simbad-tel-val">{simbadData.radVel > 0 ? '+' : ''}{formatSig(simbadData.radVel, lang, 4)} km/s</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="inspector-section spectroscopy-section hud-section">
        <StellarSpectroscopy star={star} />
      </div>

      {!isExoticRemnant && (
        <div className="inspector-section hz-section hud-section">
          <HabitableZoneVisualizer star={star} />
        </div>
      )}

      {/* Physical parameters */}
      <div className="inspector-section hud-section">
        <div className="section-title hud-sec-title">
          <Compass size={14} aria-hidden="true" />
          <h3>{t('astrophysicalMatrix')}</h3>
        </div>
        <dl className="params-grid hud-params-grid">
          <div className="param-item hud-param">
            <dt className="param-label">{t('paramLuminosity')}</dt>
            <dd className="param-val">{formatSig(star.lum, lang)} L☉</dd>
          </div>
          <div className="param-item hud-param">
            <dt className="param-label">{t('paramRadius')}</dt>
            <dd className="param-val">{formatSig(star.radius, lang)} R☉{isExoticRemnant ? ` (${formatSig(star.radius * 695700, lang, 2)} km)` : ''}</dd>
          </div>
          <div className="param-item hud-param">
            <dt className="param-label">{t(star.dataSource === 'derived' ? 'paramEstimatedMass' : 'paramMass')}</dt>
            <dd className="param-val">{star.mass ? `${formatSig(star.mass, lang)} M☉` : '—'}</dd>
          </div>
          <div className="param-item hud-param">
            <dt className="param-label">{t('paramAbsMag')}</dt>
            <dd className="param-val">{formatMag(star.absMag, lang)}</dd>
          </div>
          <div className="param-item hud-param">
            <dt className="param-label">{t('paramDistance')}</dt>
            <dd className="param-val">
              {star.id === 'sun' ? t('distanceSun') : star.distance_ly ? `${formatSig(star.distance_ly, lang)} ${t('lightYears')}` : '—'}
            </dd>
          </div>
          <div className="param-item hud-param">
            <dt className="param-label">{t('paramLifetime')}</dt>
            <dd className="param-val">{lifetime || '—'}</dd>
          </div>
        </dl>
        <p className="data-source-note">
          <Info size={11} aria-hidden="true" />{' '}
          {star.dataSource === 'derived'
            ? t('dataSourceDerived', { err: formatSig((star.parallaxRelError || 0) * 100, lang, 2) })
            : t('dataSourceLiterature')}
        </p>
      </div>

      {(star.pulsationPeriodDays || star.orbitalPeriodDays) && (
        <div className="inspector-section variable-section hud-section">
          <div className="section-title hud-sec-title">
            <Activity size={14} aria-hidden="true" />
            <h3>{t('periodsHeader')}</h3>
          </div>
          {star.pulsationPeriodDays && (
            <p className="variable-desc">{t('pulsationText', { period: formatSig(star.pulsationPeriodDays, lang) })}</p>
          )}
          {star.orbitalPeriodDays && (
            <p className="variable-desc">{t('orbitalPeriodText', { period: formatSig(star.orbitalPeriodDays, lang) })}</p>
          )}
        </div>
      )}

      {facts && (
        <div className="inspector-section facts-section hud-section">
          <div className="section-title hud-sec-title">
            <Sun size={14} aria-hidden="true" />
            <h3>{t('archiveLogHeader')}</h3>
          </div>
          <p className="star-facts-text">{facts}</p>
          {star.refs && star.refs.length > 0 && (
            <p className="star-refs">
              <span>{t('referencesLabel')}</span> {star.refs.join('; ')}
            </p>
          )}
        </div>
      )}

      <div className="inspector-section catalog-links-section hud-section">
        <div className="section-title hud-sec-title">
          <BookOpen size={14} aria-hidden="true" />
          <h3>{t('catalogLinksHeader')}</h3>
        </div>
        <div className="catalog-links-list">
          {catalogLinks.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="catalog-link-card">
              <div className="catalog-link-top">
                <span className="catalog-link-name">{link.name}</span>
                <span className={`cat-badge cat-badge-${link.type}`}>{link.badge}</span>
                <ExternalLink size={12} className="catalog-ext-icon" aria-hidden="true" />
              </div>
              <div className="catalog-link-desc">{link.description}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="inspector-actions hud-actions">
        <button
          type="button"
          className={`action-btn hud-action-btn ${isComparing ? 'active' : ''}`}
          onClick={() => onAddToCompare(star)}
          aria-pressed={isComparing}
        >
          <Scale size={16} aria-hidden="true" />
          <span>{isComparing ? t('disengageCompare') : t('engageCompare')}</span>
        </button>
      </div>
    </aside>
  );
}
