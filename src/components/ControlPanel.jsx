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
  const { t } = useLanguage();
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
          <label className="toggle-item hud-toggle" onClick={onToggleBackgroundPopulation}>
            <span className="hud-checkbox-bracket">{showBackgroundPopulation ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleHipparcos')}</span>
          </label>

          <label className="toggle-item hud-toggle" onClick={onToggleRegions}>
            <span className="hud-checkbox-bracket">{showRegions ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleRegions')}</span>
          </label>

          <label className="toggle-item hud-toggle" onClick={onToggleIsoradii}>
            <span className="hud-checkbox-bracket">{showIsoradii ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleIsoradii')}</span>
          </label>

          <label className="toggle-item hud-toggle" onClick={onToggleFamousLabels}>
            <span className="hud-checkbox-bracket">{showFamousLabels ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleLabels')}</span>
          </label>

          <label className="toggle-item hud-toggle" onClick={onTogglePlanetsOnly}>
            <span className="hud-checkbox-bracket">{filterPlanetsOnly ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('togglePlanetsOnly')}</span>
          </label>

          <label className="toggle-item hud-toggle" onClick={onToggleGaiaFineStructure}>
            <span className="hud-checkbox-bracket">{showGaiaFineStructure ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleGaiaFine')}</span>
          </label>

          <label className="toggle-item hud-toggle" onClick={onToggleRelativisticRemnants}>
            <span className="hud-checkbox-bracket">{showRelativisticRemnants ? '[ ■ ]' : '[   ]'}</span>
            <span>{t('toggleRelativistic')}</span>
          </label>
        </div>
      </div>

      {/* Ship Telemetry Footer */}
      <div className="hud-sidebar-footer">
        <div className="telemetry-bar">
          <span className="t-label">{t('dbStatus')}</span>
          <span className="t-val">V3.8 ACTIVE</span>
        </div>
        <div className="telemetry-bar">
          <span className="t-label">{t('calibration')}</span>
          <span className="t-val">{t('stefanBoltzmann')}</span>
        </div>
      </div>
    </div>
  );
}

