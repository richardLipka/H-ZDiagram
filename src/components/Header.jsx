import React from 'react';
import { Telescope, Orbit, Clock, Layers, BookOpen, Database, Home, ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Header({
  activeMode,
  setActiveMode,
  onApplyPreset,
  onOpenGuide,
  onOpenAttribution
}) {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="app-header hud-header">
      {/* Astrometrics Department Brand */}
      <div className="header-brand">
        <a
          href="https://home.zcu.cz/~lipka/"
          target="_blank"
          rel="noopener noreferrer"
          className="brand-reticle"
          title="Created by Richard Lipka – Visit Home Page"
        >
          <img src="./favicon.svg" alt="H-R Astrometrics Logo" className="brand-logo-img" width="24" height="24" />
        </a>
        <div className="brand-text">
          <div className="brand-top-row">
            <span className="ship-designation">{t('shipDesignation')}</span>
            <span className="hud-badge pulse">{t('sensorsOnline')}</span>
          </div>
          <h1>{t('appTitle').toUpperCase()}</h1>
          <span className="brand-subtitle">{t('appSubtitle').toUpperCase()}</span>
        </div>
      </div>

      {/* Tactical Mode Navigation */}
      <nav className="header-nav hud-nav">
        <button
          className={`nav-btn hud-btn ${activeMode === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveMode('explore')}
        >
          <Telescope size={15} />
          <span>{t('navExplore')}</span>
        </button>

        <button
          className={`nav-btn hud-btn ${activeMode === 'evolution' ? 'active' : ''}`}
          onClick={() => setActiveMode('evolution')}
        >
          <Orbit size={15} />
          <span>{t('navEvolution')}</span>
        </button>

        <button
          className={`nav-btn hud-btn ${activeMode === 'cluster' ? 'active' : ''}`}
          onClick={() => setActiveMode('cluster')}
        >
          <Clock size={15} />
          <span>{t('navClusters')}</span>
        </button>

        <button
          className={`nav-btn hud-btn ${activeMode === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveMode('compare')}
        >
          <Layers size={15} />
          <span>{t('navCompare')}</span>
        </button>

        <button
          className="nav-btn hud-btn guide-btn"
          onClick={onOpenGuide}
          title={lang === 'cs' ? 'Otevřít astrofyzikální návod a průvodce' : 'Open Astrometrics Manual & Guide'}
        >
          <BookOpen size={15} />
          <span>{t('navManual')}</span>
        </button>

        <button
          className="nav-btn hud-btn data-btn"
          onClick={onOpenAttribution}
          title={lang === 'cs' ? 'Zobrazit zdroje dat a katalogů' : 'View Satellite / Catalog Telemetry Sources'}
        >
          <Database size={15} />
          <span>{t('navDataFeed')}</span>
        </button>

        <a
          href="https://home.zcu.cz/~lipka/"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-btn hud-btn author-btn"
          title="Richard Lipka – University Homepage & Research"
        >
          <Home size={15} />
          <span>{t('navAuthor')}</span>
          <ExternalLink size={11} style={{ opacity: 0.6 }} />
        </a>

        {/* Bilingual Language Switcher */}
        <button
          className="nav-btn hud-btn lang-toggle-btn"
          onClick={toggleLang}
          title={t('navLangTitle')}
        >
          <Globe size={14} />
          <span>{t('navLangToggle')}</span>
        </button>
      </nav>

      {/* Tactical Astrometrics Jump Coordinates */}
      <div className="header-presets hud-presets">
        <span className="preset-label">{t('targetJump')}</span>
        <button className="preset-chip hud-chip" onClick={() => onApplyPreset('sun')}>{t('presetSun')}</button>
        <button className="preset-chip hud-chip" onClick={() => onApplyPreset('hypergiants')}>{t('presetBetelgeuse')}</button>
        <button className="preset-chip hud-chip" onClick={() => onApplyPreset('whitedwarfs')}>{t('presetSiriusB')}</button>
        <button className="preset-chip hud-chip" onClick={() => onApplyPreset('exoplanets')}>{t('presetExoplanets')}</button>
        <button className="preset-chip hud-chip exotic-chip" onClick={() => onApplyPreset('exotic')}>{t('presetExotic')}</button>
      </div>
    </header>
  );
}

