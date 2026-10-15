import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function ControlPanel({
  filterSearch,
  onSearchChange,
  filterClass,
  onSelectClass,
  filterPlanetsOnly,
  onTogglePlanetsOnly,
  showIsoradii,
  onToggleIsoradii,
  showRegions,
  onToggleRegions,
  showBackgroundPopulation,
  onToggleBackgroundPopulation,
  showFamousLabels,
  onToggleFamousLabels,
  showGaiaFineStructure,
  onToggleGaiaFineStructure,
  showRelativisticRemnants,
  onToggleRelativisticRemnants,
  famousStars,
  onSelectStar
}) {
  const { t, lang } = useLanguage();
  const spectralClasses = ['ALL', 'O', 'B', 'A', 'F', 'G', 'K', 'M', 'D'];

  return (
    <div className="diagram-control-panel hud-panel hud-sidebar">
      {/* Tactical Target Query Scan */}
      <div className="control-group search-group hud-search-group">
        <div className="control-header hud-header-tag">
          <Search size={13} />
          <span>{t('searchHeader')}</span>
        </div>
        <div className="search-input-wrapper hud-input-wrapper">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filterSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-field hud-input"
          />
          {filterSearch && (
            <button className="clear-search-btn" onClick={() => onSearchChange('')}>
              ×
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {filterSearch && (
          <div className="search-autocomplete-dropdown hud-dropdown">
            {famousStars
              .filter((s) => s.name.toLowerCase().includes(filterSearch.toLowerCase()))
              .slice(0, 5)
              .map((s) => (
                <div
                  key={s.id}
                  className="autocomplete-item hud-dropdown-item"
                  onClick={() => {
                    onSelectStar(s);
                    onSearchChange('');
                  }}
                >
                  <span className="ac-name">// {s.name.toUpperCase()}</span>
                  <span className="ac-class">[ {s.spectralType} ]</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Spectral Bandpass Sensor Filter */}
      <div className="control-group hud-group">
        <div className="control-header hud-header-tag">
          <Filter size={13} />
          <span>{t('spectralBandpassHeader')}</span>
        </div>
        <div className="spectral-buttons-row hud-spec-row">
          {spectralClasses.map((cls) => (
            <button
              key={cls}
              className={`spec-filter-btn hud-btn-spec ${filterClass === cls ? 'active' : ''} class-${cls.toLowerCase()}`}
              onClick={() => onSelectClass(cls)}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Astrometric Sensor Projection Layers */}
      <div className="control-group hud-group">
        <div className="control-header hud-header-tag">
          <SlidersHorizontal size={13} />
          <span>{t('sensorOverlaysHeader')}</span>
        </div>
        <div className="toggles-list hud-toggles">
          <label
            className="toggle-item hud-toggle"
            onClick={onToggleBackgroundPopulation}
            role="checkbox"
            aria-checked={showBackgroundPopulation}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggleBackgroundPopulation(); } }}
          >
            <span className="hud-checkbox-bracket">{showBackgroundPopulation ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleHipparcos')}</span>
          </label>

          <label
            className="toggle-item hud-toggle"
            onClick={onToggleRegions}
            role="checkbox"
            aria-checked={showRegions}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggleRegions(); } }}
          >
            <span className="hud-checkbox-bracket">{showRegions ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleRegions')}</span>
          </label>

          <label
            className="toggle-item hud-toggle"
            onClick={onToggleIsoradii}
            role="checkbox"
            aria-checked={showIsoradii}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggleIsoradii(); } }}
          >
            <span className="hud-checkbox-bracket">{showIsoradii ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleIsoradii')}</span>
          </label>

          <label
            className="toggle-item hud-toggle"
            onClick={onToggleFamousLabels}
            role="checkbox"
            aria-checked={showFamousLabels}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggleFamousLabels(); } }}
          >
            <span className="hud-checkbox-bracket">{showFamousLabels ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleLabels')}</span>
          </label>

          <label
            className="toggle-item hud-toggle"
            onClick={onTogglePlanetsOnly}
            role="checkbox"
            aria-checked={filterPlanetsOnly}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onTogglePlanetsOnly(); } }}
          >
            <span className="hud-checkbox-bracket">{filterPlanetsOnly ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('togglePlanetsOnly')}</span>
          </label>

          <label
            className="toggle-item hud-toggle"
            onClick={onToggleGaiaFineStructure}
            role="checkbox"
            aria-checked={showGaiaFineStructure}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggleGaiaFineStructure(); } }}
          >
            <span className="hud-checkbox-bracket">{showGaiaFineStructure ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleGaiaFine')}</span>
          </label>

          <label
            className="toggle-item hud-toggle"
            onClick={onToggleRelativisticRemnants}
            role="checkbox"
            aria-checked={showRelativisticRemnants}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggleRelativisticRemnants(); } }}
          >
            <span className="hud-checkbox-bracket">{showRelativisticRemnants ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleRelativistic')}</span>
          </label>
        </div>
      </div>

      {/* Astrometrics Catalog Info Footer */}
      <div className="hud-sidebar-footer">
        <div className="telemetry-bar">
          <span className="t-label">{t('dbStatus')}</span>
          <span className="t-val">{famousStars ? `${famousStars.length} ${lang === 'cs' ? 'hvězd' : 'stars'}` : (lang === 'cs' ? '488 hvězd' : '488 stars')}</span>
        </div>
        <div className="telemetry-bar">
          <span className="t-label">{t('calibration')}</span>
          <span className="t-val">{t('stefanBoltzmann')}</span>
        </div>
      </div>
    </div>
  );
}

