import React from 'react';
import { X, BookOpen, HelpCircle, Lightbulb, Compass, Award, Ruler, Database, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import Modal from './Modal';

const CATALOG_RESOURCES = [
  {
    titleKey: 'guideCatHYG',
    descKey: 'guideCatHYGDesc',
    url: 'https://github.com/astronexus/HYG-Database',
    badge: 'HYG Database'
  },
  {
    titleKey: 'guideCatNEA',
    descKey: 'guideCatNEADesc',
    url: 'https://exoplanetarchive.ipac.caltech.edu/',
    badge: 'NASA IPAC'
  },
  {
    titleKey: 'guideCatMamajek',
    descKey: 'guideCatMamajekDesc',
    url: 'https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt',
    badge: 'ApJS 208, 9'
  },
  {
    titleKey: 'guideCatTorres',
    descKey: 'guideCatTorresDesc',
    url: 'https://ui.adsabs.harvard.edu/abs/2010A%26ARv..18...67T/abstract',
    badge: 'A&ARv 18, 67'
  },
  {
    titleKey: 'guideCatKopparapu',
    descKey: 'guideCatKopparapuDesc',
    url: 'https://arxiv.org/abs/1404.5292',
    badge: 'ApJ 787, L29'
  },
  {
    titleKey: 'guideCatSpectroscopy',
    descKey: 'guideCatSpectroscopyDesc',
    url: 'https://www.eso.org/sci/observing/tools/uvespop.html',
    badge: 'ESO VLT / NIST'
  },
  {
    titleKey: 'guideCatSimbad',
    descKey: 'guideCatSimbadDesc',
    url: 'https://simbad.cds.unistra.fr/simbad/',
    badge: 'CDS Strasbourg'
  }
];

export default function EducationalGuide({ onClose }) {
  const { t } = useLanguage();

  return (
    <Modal labelledBy="guide-title" className="guide-modal-content" onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title-group">
          <BookOpen size={22} className="modal-icon" aria-hidden="true" />
          <h2 id="guide-title">{t('guideTitle')}</h2>
        </div>
        <button type="button" className="modal-close-btn" onClick={onClose} title={t('close')} aria-label={t('close')}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="guide-body">
        <section className="guide-section">
          <div className="guide-section-header">
            <Award size={18} aria-hidden="true" />
            <h3>{t('guideSec1Title')}</h3>
          </div>
          <p>{t('guideSec1P1')}</p>
          <p>{t('guideSec1P2')}</p>
        </section>

        <section className="guide-section highlight-box">
          <div className="guide-section-header">
            <HelpCircle size={18} aria-hidden="true" />
            <h3>{t('guideSec2Title')}</h3>
          </div>
          <p>{t('guideSec2P1')}</p>
          <p>{t('guideSec2P2')}</p>
        </section>

        <section className="guide-section">
          <div className="guide-section-header">
            <Compass size={18} aria-hidden="true" />
            <h3>{t('guideSec3Title')}</h3>
          </div>
          <div className="branches-grid">
            {['MS', 'RG', 'SG', 'WD'].map((b) => (
              <div key={b} className={`branch-card ${b.toLowerCase()}-card`}>
                <h4>{t(`guideBranch${b}`)}</h4>
                <p>{t(`guideBranch${b}Desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="guide-section">
          <div className="guide-section-header">
            <Lightbulb size={18} aria-hidden="true" />
            <h3>{t('guideSec4Title')}</h3>
          </div>
          <p>{t('guideSec4P1')}</p>
          <div className="math-callout">L = 4π R² σ T⁴ ⟹ R / R☉ = √(L / L☉) × (5 772 K / T)²</div>
          <p>{t('guideSec4P2')}</p>
        </section>

        <section className="guide-section">
          <div className="guide-section-header">
            <Ruler size={18} aria-hidden="true" />
            <h3>{t('guideSec5Title')}</h3>
          </div>
          <ul className="guide-list">
            <li>{t('guideSec5Item1')}</li>
            <li>{t('guideSec5Item2')}</li>
            <li>{t('guideSec5Item3')}</li>
            <li>{t('guideSec5Item4')}</li>
          </ul>
        </section>

        <section className="guide-section highlight-box">
          <div className="guide-section-header">
            <Database size={18} aria-hidden="true" />
            <h3>{t('guideSec6Title')}</h3>
          </div>
          <p>{t('guideSec6Desc')}</p>
          <div className="catalogs-list guide-catalogs-grid">
            {CATALOG_RESOURCES.map((res) => (
              <a
                key={res.titleKey}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="catalog-card guide-cat-card"
              >
                <div className="catalog-header">
                  <h4>{t(res.titleKey)}</h4>
                  <span className="cat-badge cat-badge-simbad">{res.badge}</span>
                  <ExternalLink size={12} className="catalog-ext-icon" aria-hidden="true" />
                </div>
                <p className="cat-desc">{t(res.descKey)}</p>
                <span className="cat-url-link">
                  <span>{res.url}</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}

