import React from 'react';
import { temperatureToRGB, calculateHabitableZone } from '../simulation/blackbody';
import { X, Scale, Plus, Trash2, ExternalLink } from 'lucide-react';
import { getWikipediaUrl, getSimbadUrl, getVizierHipUrl } from '../utils/catalogLinks';
import { useLanguage } from '../i18n/LanguageContext';

export default function ComparisonModal({
  compareStars,
  famousStars,
  onRemoveFromCompare,
  onAddStarToCompare,
  onClearCompare,
  onClose
}) {
  const { lang, t, formatLifetime } = useLanguage();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="comparison-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Scale size={20} className="modal-icon" />
            <h2>{t('comparisonTitle')}</h2>
          </div>
          <div className="modal-header-actions">
            {compareStars.length > 0 && (
              <button className="clear-btn" onClick={onClearCompare} title={t('clearAll')}>
                <Trash2 size={16} />
                <span>{t('clearAll')}</span>
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {compareStars.length === 0 ? (
          <div className="empty-compare-state">
            <p>{t('emptyCompareMsg')}</p>
            <span className="empty-sub">
              {t('emptyCompareSub')}
            </span>
            <div className="quick-add-chips">
              {['Sol', 'Betelgeuse', 'Sirius', 'Proxima Centauri', 'Rigel', 'Vega'].map((starName) => {
                const s = famousStars.find((st) => st.name.toLowerCase() === starName.toLowerCase() || st.name.toLowerCase().includes(starName.toLowerCase()));
                if (!s) return null;
                return (
                  <button
                    key={s.id}
                    className="quick-add-chip"
                    onClick={() => onAddStarToCompare(s)}
                  >
                    <Plus size={14} />
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="comparison-body">
            {/* Visual Photosphere Scale Comparator */}
            <div className="size-comparison-section">
              <h4>{t('photosphereScaleTitle')}</h4>
              <div className="photosphere-scale-row">
                {compareStars.map((star) => {
                  const rgb = temperatureToRGB(star.temp);
                  // Scaled diameter in pixels for visual representation (logarithmic dampening for huge giants)
                  let visualPx = Math.max(14, Math.min(180, Math.log10(Math.max(0.01, star.radius)) * 35 + 50));
                  if (star.radius < 0.02) visualPx = 10; // White dwarf

                  return (
                    <div key={star.id} className="scale-item">
                      <div className="scale-sphere-container">
                        <div
                          className="scale-sphere"
                          style={{
                            width: `${visualPx}px`,
                            height: `${visualPx}px`,
                            backgroundColor: rgb.css,
                            boxShadow: `0 0 25px ${rgb.css}99`
                          }}
                        />
                      </div>
                      <span className="scale-star-name">{star.name}</span>
                      <span className="scale-star-radius">{star.radius} R☉</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Astrophysical Parameters Comparison Table */}
            <div className="table-responsive">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>{t('physicalProperty')}</th>
                    {compareStars.map((star) => (
                      <th key={star.id}>
                        <div className="th-star-header">
                          <span className="th-star-name">{star.name}</span>
                          <div className="th-star-links">
                            <a
                              href={getWikipediaUrl(star, lang)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="th-ext-link wiki-link"
                              title={lang === 'cs' ? 'Článek na Wikipedii' : 'Open encyclopedic record on Wikipedia'}
                            >
                              <span>Wiki</span>
                              <ExternalLink size={9} />
                            </a>
                            <a
                              href={getSimbadUrl(star)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="th-ext-link simbad-link"
                              title={lang === 'cs' ? 'Astronomická databáze CDS SIMBAD' : 'Query CDS SIMBAD database'}
                            >
                              <span>SIMBAD</span>
                              <ExternalLink size={9} />
                            </a>
                          </div>
                          <button
                            className="th-remove-btn"
                            onClick={() => onRemoveFromCompare(star.id)}
                            title={lang === 'cs' ? 'Odebrat' : 'Remove'}
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="prop-name">{t('spectralClass')}</td>
                    {compareStars.map((s) => (
                      <td key={s.id} className="mono-cell">{s.spectralType}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="prop-name">{t('surfaceTempK')}</td>
                    {compareStars.map((s) => (
                      <td key={s.id}>{s.temp.toLocaleString()} K</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="prop-name">{t('luminositySolar')}</td>
                    {compareStars.map((s) => (
                      <td key={s.id}>{s.lum >= 1000 ? s.lum.toLocaleString() : s.lum} L☉</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="prop-name">{t('radiusSolar')}</td>
                    {compareStars.map((s) => (
                      <td key={s.id}>{s.radius} R☉</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="prop-name">{t('massSolar')}</td>
                    {compareStars.map((s) => (
                      <td key={s.id}>{s.mass ? `${s.mass} M☉` : '—'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="prop-name">{t('habitableZone')}</td>
                    {compareStars.map((s) => {
                      const hz = calculateHabitableZone(s.lum, s.temp);
                      return (
                        <td key={s.id} className="hz-cell">
                          {hz.innerAU} – {hz.outerAU} AU
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="prop-name">{t('msLifetime')}</td>
                    {compareStars.map((s) => (
                      <td key={s.id}>{formatLifetime(s.mass)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="prop-name">{t('exoplanets')}</td>
                    {compareStars.map((s) => (
                      <td key={s.id}>
                        {s.hasExoplanets ? `🪐 ${s.exoplanetCount} ${t('planetsCount')}` : t('noneDetected')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="prop-name">{t('externalCatalogues')}</td>
                    {compareStars.map((s) => (
                      <td key={s.id} className="catalog-links-cell">
                        <div className="comp-links-row">
                          <a
                            href={getWikipediaUrl(s, lang)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cat-table-link wiki-badge"
                            title={lang === 'cs' ? 'Otevřít článek na Wikipedii' : 'Open Wikipedia article'}
                          >
                            <span>{t('wikipediaBadge')}</span>
                            <ExternalLink size={10} />
                          </a>
                          <a
                            href={getSimbadUrl(s)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cat-table-link simbad-badge"
                            title={lang === 'cs' ? 'Dotaz do astronomické databáze CDS SIMBAD' : 'Query CDS SIMBAD database'}
                          >
                            <span>SIMBAD</span>
                            <ExternalLink size={10} />
                          </a>
                          {s.hip && (
                            <a
                              href={getVizierHipUrl(s)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cat-table-link vizier-badge"
                              title={lang === 'cs' ? 'Záznam v katalogu ESA Hipparcos (VizieR)' : 'Query ESA Hipparcos on CDS VizieR'}
                            >
                              <span>HIP {s.hip}</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


