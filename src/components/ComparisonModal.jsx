import React from 'react';
import { temperatureToRGB } from '../simulation/blackbody';
import { getDetailedHabitableZone } from '../simulation/planetaryData';
import { X, Scale, Plus, Trash2, ExternalLink } from 'lucide-react';
import { getWikipediaUrl, getSimbadUrl, getVizierHipUrl } from '../utils/catalogLinks';
import { useLanguage } from '../i18n/LanguageContext';
import { formatSig, formatInt } from '../utils/format';
import Modal from './Modal';

const QUICK_ADD_IDS = ['sun', 'betelgeuse', 'sirius_a', 'sirius_b', 'proxima_centauri', 'rigel', 'vega'];

export default function ComparisonModal({ compareStars, famousStars, onRemoveFromCompare, onAddStarToCompare, onClearCompare, onClose }) {
  const { lang, t, formatLifetime } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const availableStars = famousStars.filter((s) => !compareStars.some((cs) => cs.id === s.id));
  const searchMatches = searchTerm
    ? availableStars.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8)
    : [];

  const handleSelectStar = (star) => {
    onAddStarToCompare(star);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const rows = [
    { label: t('spectralClass'), render: (s) => s.spectralType, className: 'mono-cell' },
    { label: t('surfaceTempK'), render: (s) => `${formatInt(s.temp, lang)} K` },
    { label: t('luminositySolar'), render: (s) => `${formatSig(s.lum, lang)} L☉` },
    { label: t('radiusSolar'), render: (s) => `${formatSig(s.radius, lang)} R☉` },
    { label: t('massSolar'), render: (s) => (s.mass ? `${formatSig(s.mass, lang)} M☉` : '—') },
    {
      label: t('habitableZone'),
      source: { href: 'https://arxiv.org/abs/1404.5292', text: 'Kopparapu 2014' },
      render: (s) => {
        if (s.luminosityClass !== 'V') return t('hzNotApplicable');
        const hz = getDetailedHabitableZone(s.lum, s.temp);
        return `${formatSig(hz.runawayGreenhouseAU, lang)} – ${formatSig(hz.maximumGreenhouseAU, lang)} AU${hz.extrapolated ? ' *' : ''}`;
      },
      className: 'hz-cell'
    },
    { label: t('msLifetime'), render: (s) => (s.luminosityClass === 'V' && s.mass ? formatLifetime(s.mass) : '—') },
    {
      label: t('exoplanets'),
      source: { href: 'https://exoplanetarchive.ipac.caltech.edu/', text: 'NASA Exoplanet Archive' },
      render: (s) => (s.planetCount ? t('solarPlanets', { count: s.planetCount }) : s.hasExoplanets ? `🪐 ${s.exoplanetCount}` : t('noneDetected'))
    }
  ];

  const quickPicks = QUICK_ADD_IDS
    .map((id) => famousStars.find((st) => st.id === id))
    .filter(Boolean)
    .filter((s) => !compareStars.some((cs) => cs.id === s.id));

  return (
    <Modal labelledBy="comparison-title" className="comparison-modal-content" onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title-group">
          <Scale size={20} className="modal-icon" aria-hidden="true" />
          <h2 id="comparison-title">{t('comparisonTitle')}</h2>
          <span className="compare-slot-badge">{t('compareSlotCount', { count: compareStars.length, max: 4 })}</span>
        </div>
        <div className="modal-header-actions">
          {compareStars.length > 0 && (
            <button type="button" className="clear-btn" onClick={onClearCompare}>
              <Trash2 size={16} aria-hidden="true" />
              <span>{t('clearAll')}</span>
            </button>
          )}
          <button type="button" className="modal-close-btn" onClick={onClose} title={t('close')} aria-label={t('close')}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {compareStars.length === 0 ? (
        <div className="empty-compare-state">
          <p>{t('emptyCompareMsg')}</p>
          <span className="empty-sub">{t('emptyCompareSub')}</span>
          <div className="quick-add-chips">
            {QUICK_ADD_IDS.map((id) => famousStars.find((st) => st.id === id)).filter(Boolean).map((s) => (
              <button type="button" key={s.id} className="quick-add-chip" onClick={() => onAddStarToCompare(s)}>
                <Plus size={14} aria-hidden="true" />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="comparison-body">
          <div className="size-comparison-section">
            <h3>{t('photosphereScaleTitle')}</h3>
            <p className="scale-note">{t('photosphereScaleNote')}</p>
            <div className="photosphere-scale-row">
              {compareStars.map((star) => {
                const rgb = temperatureToRGB(star.temp);
                const visualPx = Math.max(8, Math.min(180, Math.log10(Math.max(1e-5, star.radius)) * 35 + 50));
                return (
                  <div key={star.id} className="scale-item">
                    <div className="scale-sphere-container">
                      <div
                        className="scale-sphere"
                        style={{ width: `${visualPx}px`, height: `${visualPx}px`, borderRadius: '50%', display: 'block', backgroundColor: rgb.css, boxShadow: `0 0 25px ${rgb.css}99` }}
                      />
                    </div>
                    <span className="scale-star-name">{star.name}</span>
                    <span className="scale-star-radius">{formatSig(star.radius, lang)} R☉</span>
                  </div>
                );
              })}
            </div>
          </div>

          {compareStars.length < 4 && (
            <div className="compare-add-controls hud-sensor-chamber">
              <div className="compare-search-box">
                <input
                  type="text"
                  placeholder={t('searchStarToCompare')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="search-field hud-input"
                />
                {isDropdownOpen && searchMatches.length > 0 && (
                  <ul className="search-autocomplete-dropdown hud-dropdown" role="listbox">
                    {searchMatches.map((s) => (
                      <li
                        key={s.id}
                        role="option"
                        className="autocomplete-item hud-dropdown-item"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectStar(s)}
                      >
                        <span className="ac-name">{s.name}</span>
                        <span className="ac-class">{s.spectralType} ({formatInt(s.temp, lang)} K)</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {quickPicks.length > 0 && (
                <div className="compare-quick-row">
                  <span className="compare-quick-label">{t('quickAddCompare')}</span>
                  <div className="quick-add-chips">
                    {quickPicks.slice(0, 5).map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        className="quick-add-chip"
                        onClick={() => onAddStarToCompare(s)}
                      >
                        <Plus size={12} aria-hidden="true" />
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th scope="col">{t('physicalProperty')}</th>
                  {compareStars.map((star) => (
                    <th scope="col" key={star.id}>
                      <div className="th-star-header">
                        <span className="th-star-name">{star.name}</span>
                        <div className="th-star-links">
                          <a href={getWikipediaUrl(star, lang)} target="_blank" rel="noopener noreferrer" className="th-ext-link wiki-link">
                            <span>Wiki</span>
                            <ExternalLink size={9} aria-hidden="true" />
                          </a>
                          <a href={getSimbadUrl(star)} target="_blank" rel="noopener noreferrer" className="th-ext-link simbad-link">
                            <span>SIMBAD</span>
                            <ExternalLink size={9} aria-hidden="true" />
                          </a>
                          {star.hip && (
                            <a href={getVizierHipUrl(star)} target="_blank" rel="noopener noreferrer" className="th-ext-link simbad-link">
                              <span>HIP</span>
                              <ExternalLink size={9} aria-hidden="true" />
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          className="th-remove-btn"
                          onClick={() => onRemoveFromCompare(star.id)}
                          title={t('removeStar', { name: star.name })}
                          aria-label={t('removeStar', { name: star.name })}
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="prop-name">
                      <div className="prop-name-title">{row.label}</div>
                      {row.source && (
                        <a href={row.source.href} target="_blank" rel="noopener noreferrer" className="prop-source-sublink">
                          {row.source.text} ↗
                        </a>
                      )}
                    </th>
                    {compareStars.map((s) => (
                      <td key={s.id} className={row.className}>{row.render(s)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="scale-note">{t('comparisonFootnote')}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
