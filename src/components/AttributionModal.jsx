import React from 'react';
import { X, Database, ExternalLink, ShieldCheck, BookOpenCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatInt } from '../utils/format';
import Modal from './Modal';

export default function AttributionModal({ attribution, onClose }) {
  const { lang, t } = useLanguage();
  if (!attribution) return null;
  const processing = attribution.processing || {};

  return (
    <Modal labelledBy="attribution-title" className="guide-modal-content attribution-modal-content" onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title-group">
          <Database size={22} className="modal-icon" aria-hidden="true" />
          <h2 id="attribution-title">{t('attributionTitle')}</h2>
        </div>
        <button type="button" className="modal-close-btn" onClick={onClose} title={t('close')} aria-label={t('close')}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="guide-body attribution-body">
        <section className="guide-section highlight-box">
          <div className="guide-section-header">
            <ShieldCheck size={18} aria-hidden="true" />
            <h3>{t('primaryCatalogTitle', { name: attribution.datasetName, version: attribution.version })}</h3>
          </div>
          <p>{t('compiledBy', { compiler: attribution.compiler, license: attribution.license })}</p>
          <div className="citation-box">
            <span className="citation-label">{t('formalCitation')}</span>
            <p className="citation-text">{attribution.citation}</p>
          </div>
          <p>
            {t('processingSummary', {
              background: formatInt(processing.backgroundStars, lang),
              named: formatInt(processing.namedStars, lang),
              curated: formatInt(processing.curatedStars, lang)
            })}
          </p>
          <div className="attribution-links">
            <a href={attribution.originalSourceUrl} target="_blank" rel="noopener noreferrer" className="ext-link-btn">
              <ExternalLink size={14} aria-hidden="true" />
              <span>{t('githubRepo')}</span>
            </a>
            <a href={attribution.codebergUrl} target="_blank" rel="noopener noreferrer" className="ext-link-btn">
              <ExternalLink size={14} aria-hidden="true" />
              <span>{t('codebergRepo')}</span>
            </a>
          </div>
        </section>

        <section className="guide-section">
          <div className="guide-section-header">
            <BookOpenCheck size={18} aria-hidden="true" />
            <h3>{t('constituentSources')}</h3>
          </div>
          <div className="catalogs-list">
            {attribution.constituentCatalogs.map((cat) => (
              <div key={cat.name} className="catalog-card">
                <div className="catalog-header">
                  <h4>{cat.name}</h4>
                  {cat.year && <span className="cat-year">{cat.year}</span>}
                </div>
                <div className="cat-authors">
                  {cat.authors && <span>{cat.authors}</span>}
                  {cat.organization && <span> • {cat.organization}</span>}
                </div>
                <p className="cat-desc">{lang === 'cs' && cat.descriptionCs ? cat.descriptionCs : cat.description}</p>
                {cat.bibcode && (
                  <a
                    className="bibcode-tag"
                    href={`https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(cat.bibcode)}/abstract`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>ADS:</span> <code>{cat.bibcode}</code>
                  </a>
                )}
                {cat.url && (
                  <a href={cat.url} target="_blank" rel="noopener noreferrer" className="cat-url-link">
                    <ExternalLink size={12} aria-hidden="true" />
                    <span>{cat.url}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="guide-section highlight-box">
          <div className="guide-section-header">
            <ShieldCheck size={18} aria-hidden="true" />
            <h3>{t('authorAcademicTitle')}</h3>
          </div>
          <p>{t('authorAcademicDesc')}</p>
          <div className="attribution-links">
            <a href="https://home.zcu.cz/~lipka/" target="_blank" rel="noopener noreferrer" className="ext-link-btn">
              <ExternalLink size={14} aria-hidden="true" />
              <span>{t('authorHomepageLink')}</span>
            </a>
          </div>
        </section>

        <section className="guide-section">
          <p className="data-note">
            <em>{t('dataPhilosophyNote')}</em>
          </p>
        </section>
      </div>
    </Modal>
  );
}
