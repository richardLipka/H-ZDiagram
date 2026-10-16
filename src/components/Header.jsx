import React from 'react';
import { Telescope, Orbit, Clock, Layers, Info, Database, Globe, GraduationCap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const MODES = [
  { id: 'explore', icon: Telescope, label: 'navExplore', title: 'navExploreTitle' },
  { id: 'evolution', icon: Orbit, label: 'navEvolution', title: 'navEvolutionTitle' },
  { id: 'cluster', icon: Clock, label: 'navClusters', title: 'navClustersTitle' },
  { id: 'academy', icon: GraduationCap, label: 'navAcademy', title: 'navAcademyTitle' },
  { id: 'compare', icon: Layers, label: 'navCompare', title: 'navCompareTitle' }
];

export default function Header({ activeMode, setActiveMode, onOpenGuide, onOpenAttribution }) {
  const { toggleLang, t } = useLanguage();

  return (
    <header className="app-header hud-header">
      <div className="header-brand">
        <div className="brand-reticle">
          <img src="./favicon.svg" alt="" className="brand-logo-img" width="26" height="26" />
        </div>
        <div className="brand-text">
          <h1>{t('appTitle')}</h1>
          <span className="brand-subtitle">{t('appSubtitle')}</span>
        </div>
      </div>

      <nav className="header-nav hud-nav" aria-label={t('navLabel')}>
        {MODES.map(({ id, icon: Icon, label, title }) => (
          <button
            type="button"
            key={id}
            className={`nav-btn hud-btn ${activeMode === id ? 'active' : ''}`}
            aria-pressed={activeMode === id}
            onClick={() => setActiveMode(id)}
            title={t(title)}
          >
            <Icon size={15} aria-hidden="true" />
            <span>{t(label)}</span>
          </button>
        ))}

        <button type="button" className="nav-btn hud-btn guide-btn" onClick={onOpenGuide} title={t('navManualTitle')}>
          <Info size={15} aria-hidden="true" />
          <span>{t('navManual')}</span>
        </button>

        <button type="button" className="nav-btn hud-btn data-btn" onClick={onOpenAttribution} title={t('navDataFeedTitle')}>
          <Database size={15} aria-hidden="true" />
          <span>{t('navDataFeed')}</span>
        </button>

        <button type="button" className="nav-btn hud-btn lang-toggle-btn" onClick={toggleLang} title={t('navLangTitle')} lang={t('navLangCode')}>
          <Globe size={14} aria-hidden="true" />
          <span>{t('navLangToggle')}</span>
        </button>
      </nav>
    </header>
  );
}
