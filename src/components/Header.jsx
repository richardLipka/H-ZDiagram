import React from 'react';
import { Telescope, Orbit, Clock, Layers, BookOpen, Database, Globe, GraduationCap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Header({
  activeMode,
  setActiveMode,
  onOpenGuide,
  onOpenAttribution
}) {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="app-header hud-header">
      {/* Brand Title */}
      <div className="header-brand">
        <div className="brand-reticle">
          <img src="./favicon.svg" alt="H-R Diagram Logo" className="brand-logo-img" width="26" height="26" />
        </div>
        <div className="brand-text">
          <h1>{t('appTitle')}</h1>
          <span className="brand-subtitle">{t('appSubtitle')}</span>
        </div>
      </div>

      {/* Mode Navigation */}
      <nav className="header-nav hud-nav">
        <button
          className={`nav-btn hud-btn ${activeMode === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveMode('explore')}
          title={lang === 'cs' ? 'Prohlížet hvězdy v diagramu' : 'Explore stars in diagram'}
        >
          <Telescope size={15} />
          <span>{t('navExplore')}</span>
        </button>

        <button
          className={`nav-btn hud-btn ${activeMode === 'evolution' ? 'active' : ''}`}
          onClick={() => setActiveMode('evolution')}
          title={lang === 'cs' ? 'Simulace vývoje hvězd' : 'Stellar Evolution Tracks'}
        >
          <Orbit size={15} />
          <span>{t('navEvolution')}</span>
        </button>

        <button
          className={`nav-btn hud-btn ${activeMode === 'cluster' ? 'active' : ''}`}
          onClick={() => setActiveMode('cluster')}
          title={lang === 'cs' ? 'Datování hvězdokup a izochrony' : 'Cluster Dating & Isochrones'}
        >
          <Clock size={15} />
          <span>{t('navClusters')}</span>
        </button>

        <button
          className={`nav-btn hud-btn ${activeMode === 'academy' ? 'active' : ''}`}
          onClick={() => setActiveMode('academy')}
          title={lang === 'cs' ? 'Astrometrická akademie: Výukové mise a úkoly' : 'Astrometrics Academy: Interactive Challenges'}
        >
          <GraduationCap size={15} />
          <span>{t('navAcademy')}</span>
        </button>

        <button
          className={`nav-btn hud-btn ${activeMode === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveMode('compare')}
          title={lang === 'cs' ? 'Srovnávač parametrů hvězd' : 'Compare Stellar Parameters'}
        >
          <Layers size={15} />
          <span>{t('navCompare')}</span>
        </button>

        <button
          className="nav-btn hud-btn guide-btn"
          onClick={onOpenGuide}
          title={lang === 'cs' ? 'Otevřít astrofyzikální návod' : 'Open Educational Guide'}
        >
          <BookOpen size={15} />
          <span>{t('navManual')}</span>
        </button>

        <button
          className="nav-btn hud-btn data-btn"
          onClick={onOpenAttribution}
          title={lang === 'cs' ? 'Zdroje dat a katalogů' : 'View Data Sources & Attribution'}
        >
          <Database size={15} />
          <span>{t('navDataFeed')}</span>
        </button>

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
    </header>
  );
}
