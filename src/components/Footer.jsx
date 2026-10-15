import React from 'react';
import { ExternalLink, Award, GraduationCap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        {/* Left: Department & University Affiliation with official KIV Logo */}
        <div className="footer-col affiliation-col">
          <a
            href="https://www.kiv.zcu.cz/"
            target="_blank"
            rel="noopener noreferrer"
            className="kiv-logo-link"
            title="Katedra informatiky a výpočetní techniky (KIV), Fakulta aplikovaných věd ZČU v Plzni"
          >
            <img
              src="./kiv_logo.svg"
              alt="KIV - Katedra informatiky a výpočetní techniky"
              className="kiv-logo-img"
            />
          </a>
          <div className="affiliation-text">
            <span className="dept-name">
              <GraduationCap size={13} className="footer-icon" />
              {t('footerDepartment')}
            </span>
            <span className="faculty-univ">
              {t('footerFaculty')}, {t('footerUniversity')}
            </span>
          </div>
        </div>

        {/* Center: Author & Academic Mission */}
        <div className="footer-col author-col">
          <div className="author-card">
            <span className="author-label">{t('footerAuthorLabel')}:</span>
            <a
              href="https://home.zcu.cz/~lipka/"
              target="_blank"
              rel="noopener noreferrer"
              className="author-name-link"
              title="Richard Lipka – University Homepage & Research"
            >
              <strong>Richard Lipka</strong>
              <ExternalLink size={11} className="footer-ext-icon" />
            </a>
          </div>
          <span className="academic-mission">
            {t('footerMission')}
          </span>
        </div>

        {/* Right: Open Source License & GitHub Project */}
        <div className="footer-col meta-col">
          <div className="footer-links">
            <a
              href="https://github.com/richardLipka/H-ZDiagram"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link-pill"
              title="GitHub Repository: richardLipka/H-ZDiagram"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
            <a
              href="https://github.com/richardLipka/H-ZDiagram/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link-pill"
              title="MIT License"
            >
              <Award size={13} />
              <span>MIT License</span>
            </a>
          </div>
          <span className="build-tag">
            v1.2.0 • Astrometrics Cartography Studio
          </span>
        </div>
      </div>
    </footer>
  );
}
