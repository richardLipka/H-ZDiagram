import React from 'react';
import { X, Database, ExternalLink, ShieldCheck, BookOpenCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function AttributionModal({ attribution, onClose }) {
  const { lang, t } = useLanguage();
  if (!attribution) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="guide-modal-content attribution-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Database size={22} className="modal-icon" />
            <h2>{t('attributionTitle')}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} title={lang === 'cs' ? 'Zavřít' : 'Close'}>
            <X size={20} />
          </button>
        </div>

        <div className="guide-body attribution-body">
          {/* Main Dataset Card */}
          <section className="guide-section highlight-box">
            <div className="guide-section-header">
              <ShieldCheck size={18} />
              <h3>{t('primaryCatalogTitle', { name: attribution.datasetName, version: attribution.version })}</h3>
            </div>
            <p>
              {t('compiledBy', { compiler: attribution.compiler, license: attribution.license })}
            </p>
            <div className="citation-box">
              <span className="citation-label">{t('formalCitation')}</span>
              <p className="citation-text">{attribution.citation}</p>
            </div>
            <div className="attribution-links">
              <a
                href={attribution.originalSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ext-link-btn"
              >
                <ExternalLink size={14} />
                <span>{t('githubRepo')}</span>
              </a>
              <a
                href={attribution.codebergUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ext-link-btn"
              >
                <ExternalLink size={14} />
                <span>{t('codebergRepo')}</span>
              </a>
            </div>
          </section>

          {/* Constituent Astronomical Catalogs */}
          <section className="guide-section">
            <div className="guide-section-header">
              <BookOpenCheck size={18} />
              <h3>{t('constituentSources')}</h3>
            </div>
            <div className="catalogs-list">
              {attribution.constituentCatalogs.map((cat, idx) => (
                <div key={idx} className="catalog-card">
                  <div className="catalog-header">
                    <h4>{cat.name}</h4>
                    {cat.year && <span className="cat-year">{cat.year}</span>}
                  </div>
                  <div className="cat-authors">
                    {cat.organization && <span>{cat.organization}</span>}
                    {cat.authors && <span> • {cat.authors}</span>}
                  </div>
                  <p className="cat-desc">{cat.description}</p>
                  {cat.bibcode && (
                    <div className="bibcode-tag">
                      <span>ADS Bibcode:</span> <code>{cat.bibcode}</code>
                    </div>
                  )}
                  {cat.url && (
                    <a
                      href={cat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cat-url-link"
                    >
                      <ExternalLink size={12} />
                      <span>{cat.url}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Author & Project Information */}
          <section className="guide-section highlight-box">
            <div className="guide-section-header">
              <ShieldCheck size={18} />
              <h3>{t('authorAcademicTitle')}</h3>
            </div>
            <p>
              {t('authorAcademicDesc')}
            </p>
            <div className="attribution-links" style={{ marginTop: '10px' }}>
              <a
                href="https://home.zcu.cz/~lipka/"
                target="_blank"
                rel="noopener noreferrer"
                className="ext-link-btn"
              >
                <ExternalLink size={14} />
                <span>{t('authorHomepageLink')}</span>
              </a>
            </div>
          </section>

          {/* Data Separation Philosophy */}
          <section className="guide-section">
            <p className="data-note">
              <em>{t('dataPhilosophyNote')}</em>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

