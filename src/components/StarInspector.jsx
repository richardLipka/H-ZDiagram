import React, { useState, useEffect } from 'react';
import { temperatureToRGB } from '../simulation/blackbody';
import { Sun, Compass, X, Scale, Target, ShieldAlert, BookOpen, ExternalLink, Radio, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getWikipediaUrl, getSimbadUrl, getStarCatalogLinks } from '../utils/catalogLinks';
import { fetchSimbadData } from '../services/simbadService';
import { useLanguage } from '../i18n/LanguageContext';

import HabitableZoneVisualizer from './HabitableZoneVisualizer';

export default function StarInspector({
  star,
  onClose,
  onAddToCompare,
  isComparing
}) {
  const { lang, t, formatLifetime, translateStageName } = useLanguage();
  const [simbadData, setSimbadData] = useState(null);
  const [loadedStarId, setLoadedStarId] = useState(null);
  const [viewMode, setViewMode] = useState('simbad'); // 'simbad' | 'model'
  const [imageError, setImageError] = useState(false);

  const isLoadingSimbad = Boolean(star && loadedStarId !== star.id);

  // Fetch SIMBAD and CDS Aladin data when star changes
  useEffect(() => {
    if (!star) return;

    let isMounted = true;

    fetchSimbadData(star)
      .then((data) => {
        if (!isMounted) return;
        setSimbadData(data);
        setLoadedStarId(star.id);
        setImageError(false);
        // Default to simbad view if data available and has image, else model
        if (data && data.available && data.imageUrl) {
          setViewMode('simbad');
        } else {
          setViewMode('model');
        }
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
  const lifetime = formatLifetime(star.mass);
  const catalogLinks = getStarCatalogLinks(star, lang);

  // Scaled radius for astrometrics holographic preview (constrained strictly to circle)
  const visualScale = Math.max(22, Math.min(108, Math.log10(Math.max(0.01, star.radius)) * 26 + 46));

  const hasSimbadImage = simbadData && simbadData.available && simbadData.imageUrl && !imageError;
  const isShowingSimbad = viewMode === 'simbad' && hasSimbadImage;

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

      {/* Holographic Sensor Chamber / CDS SIMBAD Sky Imagery */}
      <div className="photosphere-card hud-sensor-chamber">
        {/* View Mode Switcher: SIMBAD Sky Cutout vs Physical Model */}
        <div className="chamber-mode-selector">
          <button
            className={`chamber-toggle-btn ${isShowingSimbad ? 'active' : ''}`}
            onClick={() => setViewMode('simbad')}
            disabled={!hasSimbadImage && !isLoadingSimbad}
            title={lang === 'cs' ? 'Reálný snímek z CDS SIMBAD / DSS2' : 'Real sky survey cutout from CDS SIMBAD / DSS2'}
          >
            <Radio size={11} />
            <span>{t('simbadSkyCutout')}</span>
          </button>
          <button
            className={`chamber-toggle-btn ${!isShowingSimbad ? 'active' : ''}`}
            onClick={() => setViewMode('model')}
            title={lang === 'cs' ? 'Syntetický model fotosféry (černé těleso)' : 'Physical blackbody photosphere model'}
          >
            <Sparkles size={11} />
            <span>{t('photosphereModel')}</span>
          </button>
        </div>

        {/* Circular Sensor Reticle Chamber */}
        <div className="sensor-reticle-ring">
          <div className="reticle-crosshair-h" />
          <div className="reticle-crosshair-v" />

          {/* Real SIMBAD / Aladin HiPS Sky Cutout */}
          {isShowingSimbad ? (
            <div className="simbad-sky-aperture">
              <img
                src={simbadData.imageUrl}
                alt={`${star.name} CDS SIMBAD sky cutout`}
                className="simbad-sky-img"
                onError={() => setImageError(true)}
              />
              <div className="simbad-optics-ring" />
            </div>
          ) : (
            /* Perfectly Round Physical Photosphere Model (Always Circle) */
            <div className="photosphere-display">
              <div
                className="star-photosphere"
                style={{
                  width: `${visualScale}px`,
                  height: `${visualScale}px`,
                  borderRadius: '50%',
                  aspectRatio: '1 / 1',
                  backgroundColor: rgb.css,
                  boxShadow: `0 0 ${visualScale * 0.9}px ${rgb.css}, 0 0 ${visualScale * 1.8}px rgba(0, 240, 255, 0.4)`
                }}
              >
                <div className="star-core-highlight" />
              </div>
            </div>
          )}

          {/* Loading Radar Sweep */}
          {isLoadingSimbad && (
            <div className="chamber-loading-overlay">
              <div className="radar-sweep-spinner" />
              <span className="radar-loading-label">{t('queryingSimbad')}...</span>
            </div>
          )}
        </div>

        {/* Chamber Caption */}
        <div className="photosphere-caption hud-telemetry-caption">
          {isShowingSimbad ? (
            <span className="simbad-source-badge">
              <ImageIcon size={10} />
              {simbadData.isSolarSpecial ? 'NASA SDO AIA // Solar Photosphere' : 'CDS Strasbourg SIMBAD // DSS2 Color Cutout'}
            </span>
          ) : (
            <span className="color-temp-badge hud-temp-badge" style={{ borderColor: rgb.css, color: '#ffffff' }}>
              {star.temp.toLocaleString()} K • {t('classLabel')} {star.spectralType}
            </span>
          )}
          <span className="stage-text hud-stage-text">// {translateStageName(star.evolutionaryStage).toUpperCase()}</span>
        </div>

        {/* SIMBAD Real Astronomical Telemetry (If Available) */}
        {simbadData && simbadData.available && (
          <div className="simbad-telemetry-strip">
            {simbadData.ra !== null && simbadData.dec !== null && (
              <div className="simbad-tel-item">
                <span className="simbad-tel-lbl">J2000:</span>
                <span className="simbad-tel-val">{simbadData.ra.toFixed(3)}°, {simbadData.dec >= 0 ? `+${simbadData.dec.toFixed(3)}` : simbadData.dec.toFixed(3)}°</span>
              </div>
            )}
            {simbadData.objectType && (
              <div className="simbad-tel-item">
                <span className="simbad-tel-lbl">{t('simbadClass')}:</span>
                <span className="simbad-tel-val highlight">{simbadData.objectType}</span>
              </div>
            )}
            {simbadData.parallax !== null && (
              <div className="simbad-tel-item">
                <span className="simbad-tel-lbl">{t('simbadPlx')}:</span>
                <span className="simbad-tel-val">{simbadData.parallax} mas</span>
              </div>
            )}
            {simbadData.radVel !== null && (
              <div className="simbad-tel-item">
                <span className="simbad-tel-lbl">{t('simbadRv')}:</span>
                <span className="simbad-tel-val">{simbadData.radVel > 0 ? `+${simbadData.radVel}` : simbadData.radVel} km/s</span>
              </div>
            )}
          </div>
        )}
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
