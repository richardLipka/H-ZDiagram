import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, PlusCircle } from 'lucide-react';
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
  filterHabitableZoneOnly = false,
  onToggleHabitableZoneOnly,
  hostsWithHZ,
  showNamedStars,
  onToggleNamedStars,
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
  onSelectStar,
  onOpenCustomStarModal,
  customStarsCount = 0
}) {
  const { t, lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(-1);

  const planetStarsCount = useMemo(
    () => famousStars.filter((s) => Boolean(s.hasExoplanets || (s.planetCount && s.planetCount > 0) || (s.exoplanetCount && s.exoplanetCount > 0))).length,
    [famousStars]
  );

  const hzStarsCount = useMemo(() => {
    return famousStars.filter((s) => {
      if (s.id === 'sun') return true;
      const hostKey = (s.neaHost || s.name || s.id || '').toLowerCase();
      return hostsWithHZ?.has(hostKey) || false;
    }).length;
  }, [famousStars, hostsWithHZ]);

  const matches = useMemo(() => {
    if (!filterSearch) return [];
    const query = filterSearch.toLowerCase();
    return famousStars
      .filter((s) => {
        if (!s.name.toLowerCase().includes(query)) return false;
        if (filterPlanetsOnly && !s.hasExoplanets && !(s.planetCount > 0) && !(s.exoplanetCount > 0)) return false;
        if (filterHabitableZoneOnly) {
          const hostKey = (s.neaHost || s.name || s.id || '').toLowerCase();
          if (s.id !== 'sun' && !hostsWithHZ?.has(hostKey)) return false;
        }
        if (filterClass !== 'ALL') {
          const spec = s.spectralType || '';
          if (filterClass === 'D' ? s.luminosityClass !== 'D' : !spec.startsWith(filterClass)) return false;
        }
        return true;
      })
      .slice(0, 8);
  }, [filterSearch, famousStars, filterPlanetsOnly, filterHabitableZoneOnly, hostsWithHZ, filterClass]);

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
            <li
              className="autocomplete-item hud-dropdown-item online-search-action"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onOpenCustomStarModal(filterSearch);
                onSearchChange('');
              }}
            >
              <span className="ac-name highlight">{t('searchOnlinePrompt', { query: filterSearch })}</span>
            </li>
          </ul>
        )}

        <button
          type="button"
          className="action-btn hud-action-btn custom-star-trigger-btn"
          onClick={() => onOpenCustomStarModal()}
          title={t('customStarModalTitle')}
        >
          <PlusCircle size={14} aria-hidden="true" />
          <span>{t('addOrCustomStarBtn')}</span>
          {customStarsCount > 0 && <span className="custom-count-pill">{customStarsCount}</span>}
        </button>
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
          <Toggle checked={showNamedStars} onToggle={onToggleNamedStars} label={t('toggleNamedStars', { count: formatInt(famousStars.length, lang) })} hint={t('toggleNamedStarsHint')} />
          <Toggle checked={showBackgroundPopulation} onToggle={onToggleBackgroundPopulation} label={t('toggleHipparcos', { count: formatInt(backgroundCount, lang) })} hint={t('toggleHipparcosHint')} />
          <Toggle checked={showRegions} onToggle={onToggleRegions} label={t('toggleRegions')} />
          <Toggle checked={showIsoradii} onToggle={onToggleIsoradii} label={t('toggleIsoradii')} />
          <Toggle checked={showFamousLabels} onToggle={onToggleFamousLabels} label={t('toggleLabels')} />
          <Toggle checked={filterPlanetsOnly} onToggle={onTogglePlanetsOnly} label={t('togglePlanetsOnly', { count: formatInt(planetStarsCount, lang) })} hint={t('togglePlanetsOnlyHint')} />
          <Toggle checked={filterHabitableZoneOnly} onToggle={onToggleHabitableZoneOnly} label={t('toggleHZPlanetsOnly', { count: formatInt(hzStarsCount, lang) })} hint={t('toggleHZPlanetsOnlyHint')} />
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

