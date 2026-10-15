import React from 'react';
import { X, BookOpen, HelpCircle, Lightbulb, Compass, Award } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function EducationalGuide({ onClose }) {
  const { lang, t } = useLanguage();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="guide-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <BookOpen size={22} className="modal-icon" />
            <h2>{t('guideTitle')}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} title={lang === 'cs' ? 'Zavřít' : 'Close'}>
            <X size={20} />
          </button>
        </div>

        <div className="guide-body">
          {/* Section 1: Intro */}
          <section className="guide-section">
            <div className="guide-section-header">
              <Award size={18} />
              <h3>{t('guideSec1Title')}</h3>
            </div>
            <p>
              {t('guideSec1P1')}
            </p>
            <p>
              {t('guideSec1P2')}
            </p>
          </section>

          {/* Section 2: Why Reversed? */}
          <section className="guide-section highlight-box">
            <div className="guide-section-header">
              <HelpCircle size={18} />
              <h3>{t('guideSec2Title')}</h3>
            </div>
            <p>
              {t('guideSec2P1')}
            </p>
            <p>
              {t('guideSec2P2')}
            </p>
          </section>

          {/* Section 3: The 4 Major Stellar Regions */}
          <section className="guide-section">
            <div className="guide-section-header">
              <Compass size={18} />
              <h3>{t('guideSec3Title')}</h3>
            </div>
            <div className="branches-grid">
              <div className="branch-card ms-card">
                <h4>{t('guideBranchMS')}</h4>
                <p>
                  {t('guideBranchMSDesc')}
                </p>
              </div>

              <div className="branch-card rg-card">
                <h4>{t('guideBranchRG')}</h4>
                <p>
                  {t('guideBranchRGDesc')}
                </p>
              </div>

              <div className="branch-card sg-card">
                <h4>{t('guideBranchSG')}</h4>
                <p>
                  {t('guideBranchSGDesc')}
                </p>
              </div>

              <div className="branch-card wd-card">
                <h4>{t('guideBranchWD')}</h4>
                <p>
                  {t('guideBranchWDDesc')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Physics Law */}
          <section className="guide-section">
            <div className="guide-section-header">
              <Lightbulb size={18} />
              <h3>{t('guideSec4Title')}</h3>
            </div>
            <p>
              {t('guideSec4P1')}
            </p>
            <div className="math-callout">
              L = 4π R² σ T⁴  ⟹  (R / R☉) = √(L / L☉) × (5778 K / T)²
            </div>
            <p>
              {t('guideSec4P2')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

