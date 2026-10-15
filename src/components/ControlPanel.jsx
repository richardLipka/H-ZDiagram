import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatInt } from '../utils/format';

const SPECTRAL_FILTERS = ['ALL', 'O', 'B', 'A', 'F', 'G', 'K', 'M', 'D'];

function Toggle({ checked, onToggle, label, hint }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="toggle-item hud-toggle" onClick={onToggle} title={hint}>
      <span className="hud-checkbox-bracket" aria-hidden="true">{checked ? '[ ■ ]' : '[   ]'}</span>
      <span>{label}</span>
    </button>
  );
}

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
  backgroundCount,
  onSelectStar
}) {
  const { t, lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(-1);

  const matches = filterSearch
    ? famousStars.filter((s) => s.name.toLowerCase().includes(filterSearch.toLowerCase())).slice(0, 8)
    : [];

  const choose = (s) => {
    onSelectStar(s);
    onSearchChange('');
    setActiveIndex(-1);
  };

  const onSearchKeyDown = (e) => {
    if (!matches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(matches[Math.max(0, activeIndex)]);
    } else if (e.key === 'Escape') {
      onSearchChange('');
    }
  };

  return (
    <div className="diagram-control-panel hud-panel hud-sidebar">
      <div className="control-group search-group hud-search-group">
        <label className="control-header hud-header-tag" htmlFor="star-search">
          <Search size={13} aria-hidden="true" />
          <span>{t('searchHeader')}</span>
        </label>
        <div className="search-input-wrapper hud-input-wrapper">
          <input
            id="star-search"
            type="search"
            placeholder={t('searchPlaceholder')}
            value={filterSearch}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={onSearchKeyDown}
            className="search-field hud-input"
            role="combobox"
            aria-expanded={matches.length > 0}
            aria-controls="star-search-results"
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 && matches[activeIndex] ? `search-opt-${matches[activeIndex].id}` : undefined}
            autoComplete="off"
          />
          {filterSearch && (
            <button type="button" className="clear-search-btn" onClick={() => onSearchChange('')} aria-label={t('clearSearch')} title={t('clearSearch')}>
              ×
            </button>
          )}
        </div>

        {filterSearch && (
          <ul id="star-search-results" className="search-autocomplete-dropdown hud-dropdown" role="listbox">
            {matches.length === 0 && <li className="autocomplete-empty">{t('noSearchResults')}</li>}
            {matches.map((s, i) => (
              <li
                key={s.id}
                id={`search-opt-${s.id}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`autocomplete-item hud-dropdown-item ${i === activeIndex ? 'active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(s)}
              >
                <span className="ac-name">{s.name}</span>
                <span className="ac-class">{s.spectralType}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="control-group hud-group">
        <div className="control-header hud-header-tag" id="spectral-filter-label">
          <Filter size={13} aria-hidden="true" />
          <span>{t('spectralBandpassHeader')}</span>
        </div>
        <div className="spectral-buttons-row hud-spec-row" role="group" aria-labelledby="spectral-filter-label">
          {SPECTRAL_FILTERS.map((cls) => (
            <button
              type="button"
              key={cls}
              className={`spec-filter-btn hud-btn-spec ${filterClass === cls ? 'active' : ''} class-${cls.toLowerCase()}`}
              aria-pressed={filterClass === cls}
              title={cls === 'ALL' ? t('filterAllTitle') : cls === 'D' ? t('filterWhiteDwarfTitle') : t('filterClassTitle', { cls })}
              onClick={() => onSelectClass(cls)}
            >
              {cls === 'ALL' ? t('filterAll') : cls}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group hud-group">
        <div className="control-header hud-header-tag">
          <SlidersHorizontal size={13} aria-hidden="true" />
          <span>{t('sensorOverlaysHeader')}</span>
        </div>
        <div className="toggles-list hud-toggles">
          <Toggle checked={showBackgroundPopulation} onToggle={onToggleBackgroundPopulation} label={t('toggleHipparcos', { count: formatInt(backgroundCount, lang) })} hint={t('toggleHipparcosHint')} />
          <Toggle checked={showRegions} onToggle={onToggleRegions} label={t('toggleRegions')} />
          <Toggle checked={showIsoradii} onToggle={onToggleIsoradii} label={t('toggleIsoradii')} />
          <Toggle checked={showFamousLabels} onToggle={onToggleFamousLabels} label={t('toggleLabels')} />
          <Toggle checked={filterPlanetsOnly} onToggle={onTogglePlanetsOnly} label={t('togglePlanetsOnly')} />
          <Toggle checked={showGaiaFineStructure} onToggle={onToggleGaiaFineStructure} label={t('toggleGaiaFine')} />
          <Toggle checked={showRelativisticRemnants} onToggle={onToggleRelativisticRemnants} label={t('toggleRelativistic')} />
        </div>
      </div>

      <div className="hud-sidebar-footer">
        <div className="telemetry-bar">
          <span className="t-label">{t('dbStatus')}</span>
          <span className="t-val">{t('namedStarsCount', { count: famousStars.length })}</span>
        </div>
      </div>
    </div>
  );
}
