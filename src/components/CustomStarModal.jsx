import React, { useState } from 'react';
import { X, Search, PlusCircle, Database, Trash2, Download, Upload, Sparkles, Check, AlertCircle, Compass, Radio } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { resolveStarOnline } from '../services/starResolverService';
import { temperatureToRGB } from '../simulation/blackbody';
import { radiusFromLumTemp, lumFromRadiusTemp } from '../simulation/physics';
import { formatSig, formatInt } from '../utils/format';
import Modal from './Modal';

export default function CustomStarModal({
  customStars,
  onAddCustomStar,
  onRemoveCustomStar,
  onClearCustomStars,
  onImportCustomStars,
  onSelectStar,
  onClose
}) {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('online'); // 'online' | 'manual' | 'manage'

  // Online search state
  const [query, setQuery] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState(null);
  const [resolvedStar, setResolvedStar] = useState(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Manual star entry state
  const [manualName, setManualName] = useState('');
  const [manualSpectral, setManualSpectral] = useState('G2V');
  const [manualTemp, setManualTemp] = useState('5772');
  const [manualLum, setManualLum] = useState('1.0');
  const [manualRadius, setManualRadius] = useState('1.0');
  const [manualMass, setManualMass] = useState('1.0');
  const [manualDistance, setManualDistance] = useState('');
  const [manualConstellation, setManualConstellation] = useState('');
  const [manualPlanets, setManualPlanets] = useState('0');
  const [manualNotes, setManualNotes] = useState('');
  const [manualError, setManualError] = useState('');

  // Handle online search
  const handleResolve = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setIsResolving(true);
    setResolveError(null);
    setResolvedStar(null);
    setAddSuccess(false);

    try {
      const star = await resolveStarOnline(query);
      setResolvedStar(star);
    } catch (err) {
      setResolveError(err.message || 'Failed to resolve star');
    } finally {
      setIsResolving(false);
    }
  };

  const handleAddResolved = () => {
    if (!resolvedStar) return;
    onAddCustomStar(resolvedStar);
    setAddSuccess(true);
    setTimeout(() => {
      onSelectStar(resolvedStar);
      onClose();
    }, 600);
  };

  // Recalculate radius when manual temp or lum changes
  const handleTempChange = (v) => {
    setManualTemp(v);
    const tNum = parseFloat(v);
    const lNum = parseFloat(manualLum);
    if (tNum > 1000 && lNum > 0) {
      const r = radiusFromLumTemp(lNum, tNum);
      setManualRadius(r.toFixed(3));
    }
  };

  const handleLumChange = (v) => {
    setManualLum(v);
    const tNum = parseFloat(manualTemp);
    const lNum = parseFloat(v);
    if (tNum > 1000 && lNum > 0) {
      const r = radiusFromLumTemp(lNum, tNum);
      setManualRadius(r.toFixed(3));
    }
  };

  const handleRadiusChange = (v) => {
    setManualRadius(v);
    const rNum = parseFloat(v);
    const tNum = parseFloat(manualTemp);
    if (rNum > 0 && tNum > 1000) {
      const l = lumFromRadiusTemp(rNum, tNum);
      setManualLum(l.toFixed(4));
    }
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    setManualError('');
    if (!manualName.trim()) {
      setManualError(lang === 'cs' ? 'Zadejte prosím název hvězdy' : 'Please provide a star name');
      return;
    }
    const tempNum = parseFloat(manualTemp);
    const lumNum = parseFloat(manualLum);
    const radiusNum = parseFloat(manualRadius) || radiusFromLumTemp(lumNum, tempNum);
    const massNum = parseFloat(manualMass) || 1.0;
    const planetsNum = parseInt(manualPlanets, 10) || 0;
    const distanceNum = parseFloat(manualDistance) || null;

    if (isNaN(tempNum) || tempNum < 1000 || tempNum > 100000) {
      setManualError(lang === 'cs' ? 'Teplota musí být mezi 1 000 a 100 000 K' : 'Temperature must be between 1,000 and 100,000 K');
      return;
    }
    if (isNaN(lumNum) || lumNum <= 0) {
      setManualError(lang === 'cs' ? 'Zářivý výkon musí být větší než 0' : 'Luminosity must be positive');
      return;
    }

    const specChar = (manualSpectral.charAt(0) || 'G').toUpperCase();
    const lumClass = manualSpectral.match(/(Ia0|Iab|Ia|Ib|III|II|IV|VI|V|I)/i)?.[1] || 'V';

    const newStar = {
      id: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: manualName.trim(),
      spectralType: manualSpectral.trim() || 'G2V',
      spectralClass: specChar,
      luminosityClass: lumClass,
      temp: Math.round(tempNum),
      lum: lumNum,
      radius: radiusNum,
      mass: massNum,
      absMag: Number((4.74 - 2.5 * Math.log10(lumNum)).toFixed(2)),
      distance_ly: distanceNum,
      constellation: manualConstellation.trim() || undefined,
      hasExoplanets: planetsNum > 0,
      exoplanetCount: planetsNum,
      notableFacts: manualNotes.trim() || 'Custom user-defined stellar object.',
      notableFactsCs: manualNotes.trim() || 'Vlastní uživatelsky definovaný hvězdný objekt.',
      isCustom: true,
      dataSource: 'user_created'
    };

    onAddCustomStar(newStar);
    onSelectStar(newStar);
    onClose();
  };

  // Export custom stars as JSON
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customStars, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hr_custom_stars_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import custom stars from JSON file
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportCustomStars(parsed);
          setActiveTab('manage');
        } else {
          alert(lang === 'cs' ? 'Neplatný formát souboru (očekáváno pole hvězd)' : 'Invalid file format (expected array of stars)');
        }
      } catch (err) {
        alert(lang === 'cs' ? 'Chyba při čtení JSON souboru: ' + err.message : 'Error reading JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Modal labelledBy="custom-star-title" className="guide-modal-content custom-star-modal" onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title-group">
          <PlusCircle size={22} className="modal-icon" aria-hidden="true" />
          <h2 id="custom-star-title">{t('customStarModalTitle')}</h2>
        </div>
        <button type="button" className="modal-close-btn" onClick={onClose} title={t('close')} aria-label={t('close')}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="custom-star-tabs hud-sensor-chamber">
        <button
          type="button"
          className={`custom-tab-btn ${activeTab === 'online' ? 'active' : ''}`}
          onClick={() => setActiveTab('online')}
        >
          <Search size={14} aria-hidden="true" />
          <span>{t('tabSearchOnline')}</span>
        </button>
        <button
          type="button"
          className={`custom-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          <Sparkles size={14} aria-hidden="true" />
          <span>{t('tabManualEntry')}</span>
        </button>
        <button
          type="button"
          className={`custom-tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          <Database size={14} aria-hidden="true" />
          <span>{t('tabCustomDataset')} ({customStars.length})</span>
        </button>
      </div>

      <div className="guide-body custom-star-body">
        {/* TAB 1: SEARCH ONLINE (SIMBAD / SESAME) */}
        {activeTab === 'online' && (
          <div className="online-search-panel">
            <p className="tab-explainer">
              {t('onlineSearchExplainer')}
            </p>
            <form onSubmit={handleResolve} className="online-search-form">
              <div className="online-input-row">
                <input
                  type="text"
                  placeholder={t('onlineSearchPlaceholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-field hud-input"
                  autoFocus
                />
                <button type="submit" className="action-btn hud-action-btn primary" disabled={isResolving || !query.trim()}>
                  <Radio size={14} aria-hidden="true" />
                  <span>{isResolving ? t('resolvingStar') : t('querySimbadBtn')}</span>
                </button>
              </div>
            </form>

            {resolveError && (
              <div className="error-callout" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{resolveError}</span>
              </div>
            )}

            {resolvedStar && (
              <div className="resolved-preview-card hud-sensor-chamber">
                <div className="resolved-header">
                  <div className="resolved-title">
                    <span className="star-dot-badge" style={{ backgroundColor: temperatureToRGB(resolvedStar.temp).css }} />
                    <h3>{resolvedStar.name}</h3>
                    <span className="spec-badge">{resolvedStar.spectralType}</span>
                    <span className="simbad-type-pill">{resolvedStar.simbadType}</span>
                  </div>
                  <button
                    type="button"
                    className="action-btn hud-action-btn primary"
                    onClick={handleAddResolved}
                    disabled={addSuccess}
                  >
                    {addSuccess ? <Check size={16} aria-hidden="true" /> : <PlusCircle size={16} aria-hidden="true" />}
                    <span>{addSuccess ? t('starAddedSuccess') : t('addToPlotBtn')}</span>
                  </button>
                </div>

                <div className="resolved-grid">
                  <div className="res-cell">
                    <span className="res-lbl">{t('surfaceTempK')}:</span>
                    <span className="res-val">{formatInt(resolvedStar.temp, lang)} K</span>
                  </div>
                  <div className="res-cell">
                    <span className="res-lbl">{t('luminositySolar')}:</span>
                    <span className="res-val">{formatSig(resolvedStar.lum, lang)} L☉</span>
                  </div>
                  <div className="res-cell">
                    <span className="res-lbl">{t('radiusSolar')}:</span>
                    <span className="res-val">{formatSig(resolvedStar.radius, lang)} R☉</span>
                  </div>
                  <div className="res-cell">
                    <span className="res-lbl">{t('paramAbsMag')}:</span>
                    <span className="res-val">{resolvedStar.absMag !== null ? `${resolvedStar.absMag} mag` : '—'}</span>
                  </div>
                  <div className="res-cell">
                    <span className="res-lbl">{t('paramDistance')}:</span>
                    <span className="res-val">{resolvedStar.distance_ly ? `${formatInt(resolvedStar.distance_ly, lang)} ly` : '—'}</span>
                  </div>
                  <div className="res-cell">
                    <span className="res-lbl">Parallax:</span>
                    <span className="res-val">{resolvedStar.parallaxMas ? `${resolvedStar.parallaxMas} mas` : '—'}</span>
                  </div>
                  {resolvedStar.ra !== null && (
                    <div className="res-cell">
                      <span className="res-lbl">J2000 RA/Dec:</span>
                      <span className="res-val">{resolvedStar.ra?.toFixed(2)}°, {resolvedStar.dec >= 0 ? '+' : ''}{resolvedStar.dec?.toFixed(2)}°</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="examples-section">
              <span className="examples-label">{t('popularExamples')}:</span>
              <div className="examples-chips">
                {['HD 209458', 'TRAPPIST-1', 'LHS 1140', "Barnard's Star", 'HIP 87937', 'Kepler-452', 'Tau Ceti', 'Epsilon Eridani'].map((ex) => (
                  <button
                    type="button"
                    key={ex}
                    className="example-chip"
                    onClick={() => {
                      setQuery(ex);
                      setIsResolving(true);
                      setResolveError(null);
                      setResolvedStar(null);
                      resolveStarOnline(ex)
                        .then((s) => setResolvedStar(s))
                        .catch((err) => setResolveError(err.message))
                        .finally(() => setIsResolving(false));
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL ENTRY */}
        {activeTab === 'manual' && (
          <form onSubmit={handleAddManual} className="manual-entry-form">
            <p className="tab-explainer">{t('manualEntryExplainer')}</p>

            {manualError && (
              <div className="error-callout" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{manualError}</span>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="m-name">{t('paramName')} *</label>
                <input
                  id="m-name"
                  type="text"
                  required
                  placeholder="e.g. My Target Alpha"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="search-field hud-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="m-spectral">{t('spectralClass')} (MK)</label>
                <input
                  id="m-spectral"
                  type="text"
                  placeholder="e.g. G2V, M4V, K1III, A0V"
                  value={manualSpectral}
                  onChange={(e) => setManualSpectral(e.target.value)}
                  className="search-field hud-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="m-temp">{t('surfaceTempK')} (K) *</label>
                <input
                  id="m-temp"
                  type="number"
                  step="10"
                  min="1000"
                  max="100000"
                  required
                  value={manualTemp}
                  onChange={(e) => handleTempChange(e.target.value)}
                  className="search-field hud-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="m-lum">{t('luminositySolar')} (L☉) *</label>
                <input
                  id="m-lum"
                  type="number"
                  step="any"
                  min="0.000001"
                  max="5000000"
                  required
                  value={manualLum}
                  onChange={(e) => handleLumChange(e.target.value)}
                  className="search-field hud-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="m-radius">{t('radiusSolar')} (R☉) [auto Stefan-Boltzmann]</label>
                <input
                  id="m-radius"
                  type="number"
                  step="any"
                  min="0.0001"
                  value={manualRadius}
                  onChange={(e) => handleRadiusChange(e.target.value)}
                  className="search-field hud-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="m-mass">{t('massSolar')} (M☉)</label>
                <input
                  id="m-mass"
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="200"
                  value={manualMass}
                  onChange={(e) => setManualMass(e.target.value)}
                  className="search-field hud-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="m-distance">{t('paramDistance')} ({t('lightYears')})</label>
                <input
                  id="m-distance"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 42"
                  value={manualDistance}
                  onChange={(e) => setManualDistance(e.target.value)}
                  className="search-field hud-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="m-constellation">{t('constellationPrefix')}</label>
                <input
                  id="m-constellation"
                  type="text"
                  placeholder="e.g. Cygnus"
                  value={manualConstellation}
                  onChange={(e) => setManualConstellation(e.target.value)}
                  className="search-field hud-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="m-planets">{t('exoplanetCountLabel')}</label>
                <input
                  id="m-planets"
                  type="number"
                  min="0"
                  max="20"
                  value={manualPlanets}
                  onChange={(e) => setManualPlanets(e.target.value)}
                  className="search-field hud-input"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="m-notes">{t('notesOrDescription')}</label>
                <textarea
                  id="m-notes"
                  rows="2"
                  placeholder="Optional astrophysical notes or discoveries..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="search-field hud-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="action-btn hud-action-btn primary">
                <PlusCircle size={16} aria-hidden="true" />
                <span>{t('createCustomStarBtn')}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: MANAGE CUSTOM STARS DATASET */}
        {activeTab === 'manage' && (
          <div className="dataset-manage-panel">
            <div className="dataset-controls-bar">
              <div className="dataset-summary">
                <Database size={16} aria-hidden="true" />
                <span>{t('customStarsInDataset', { count: customStars.length })}</span>
              </div>
              <div className="dataset-buttons">
                <button type="button" className="dataset-btn" onClick={handleExport} disabled={customStars.length === 0} title={t('exportJsonTitle')}>
                  <Download size={14} aria-hidden="true" />
                  <span>{t('exportJson')}</span>
                </button>
                <label className="dataset-btn import-btn" title={t('importJsonTitle')}>
                  <Upload size={14} aria-hidden="true" />
                  <span>{t('importJson')}</span>
                  <input type="file" accept=".json,application/json" onChange={handleImportFile} style={{ display: 'none' }} />
                </label>
                {customStars.length > 0 && (
                  <button type="button" className="dataset-btn danger" onClick={onClearCustomStars} title={t('clearCustomDatasetTitle')}>
                    <Trash2 size={14} aria-hidden="true" />
                    <span>{t('clearAll')}</span>
                  </button>
                )}
              </div>
            </div>

            {customStars.length === 0 ? (
              <div className="empty-dataset-state">
                <Compass size={32} className="empty-icon" aria-hidden="true" />
                <p>{t('noCustomStarsMsg')}</p>
                <span>{t('noCustomStarsSub')}</span>
              </div>
            ) : (
              <div className="custom-stars-list">
                {customStars.map((s) => {
                  const rgb = temperatureToRGB(s.temp);
                  return (
                    <div key={s.id} className="custom-star-row hud-sensor-chamber">
                      <div className="cs-left">
                        <span className="cs-dot" style={{ backgroundColor: rgb.css, boxShadow: `0 0 10px ${rgb.css}` }} />
                        <div className="cs-info">
                          <span className="cs-name">{s.name}</span>
                          <span className="cs-props">
                            {s.spectralType} • {formatInt(s.temp, lang)} K • {formatSig(s.lum, lang)} L☉ • {formatSig(s.radius, lang)} R☉
                          </span>
                        </div>
                      </div>
                      <div className="cs-actions">
                        <button
                          type="button"
                          className="action-btn hud-action-btn small"
                          onClick={() => {
                            onSelectStar(s);
                            onClose();
                          }}
                        >
                          <span>{t('locateOnPlot')}</span>
                        </button>
                        <button
                          type="button"
                          className="action-btn hud-action-btn small danger"
                          onClick={() => onRemoveCustomStar(s.id)}
                          title={t('removeStar', { name: s.name })}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
