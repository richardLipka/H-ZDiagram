import React, { useState, useEffect, useMemo } from 'react';
import { Award, CheckCircle2, HelpCircle, RotateCcw, Sparkles, Target, Trophy, Compass, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { HABITABLE_ZONE_PLANET_HOSTS } from '../simulation/planetaryData';
import { formatSig, formatInt } from '../utils/format';

const MISSIONS = [
  {
    id: 'solar_twin',
    xp: 100,
    hintStarId: 'sun',
    // Same criteria as stated in the mission text
    verify: (s) => s.temp >= 5400 && s.temp <= 6100 && s.lum >= 0.7 && s.lum <= 1.5
      && (s.spectralType || '').startsWith('G') && s.luminosityClass === 'V'
  },
  {
    id: 'habitable_hunter',
    xp: 150,
    hintStarId: 'trappist1',
    verify: (s) => HABITABLE_ZONE_PLANET_HOSTS.has(s.id)
  },
  {
    id: 'white_dwarf',
    xp: 200,
    hintStarId: 'sirius_b',
    verify: (s) => s.luminosityClass === 'D' && s.radius < 0.03
  }
];

export default function AcademySimulator({ selectedStar, onSelectStar, famousStars = [] }) {
  const { lang, t } = useLanguage();
  const [activeTaskIdx, setActiveTaskIdx] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([false, false, false]);
  const [showHint, setShowHint] = useState(false);
  const [celebration, setCelebration] = useState(null);

  const currentMission = MISSIONS[activeTaskIdx];
  const allComplete = completedTasks.every(Boolean);
  const totalXp = useMemo(() => completedTasks.reduce((acc, done, i) => (done ? acc + MISSIONS[i].xp : acc), 0), [completedTasks]);

  // Check the selected star against the active mission whenever either changes
  // (state adjusted during render, see https://react.dev/learn/you-might-not-need-an-effect)
  const checkKey = selectedStar ? `${selectedStar.id}:${activeTaskIdx}` : null;
  const [lastCheckKey, setLastCheckKey] = useState(null);
  if (checkKey !== lastCheckKey) {
    setLastCheckKey(checkKey);
    if (selectedStar && !completedTasks[activeTaskIdx] && currentMission.verify(selectedStar)) {
      setCompletedTasks((prev) => prev.map((done, i) => (i === activeTaskIdx ? true : done)));
      setCelebration({ starName: selectedStar.name, xp: currentMission.xp });
    }
  }

  // Move on to the next task shortly after completing one
  const currentDone = completedTasks[activeTaskIdx];
  useEffect(() => {
    if (!currentDone || activeTaskIdx >= MISSIONS.length - 1) return undefined;
    const timer = setTimeout(() => {
      setActiveTaskIdx((i) => i + 1);
      setShowHint(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, [currentDone, activeTaskIdx]);

  // Hide the toast after a few seconds
  useEffect(() => {
    if (!celebration) return undefined;
    const timer = setTimeout(() => setCelebration(null), 3500);
    return () => clearTimeout(timer);
  }, [celebration]);

  const handleJumpToHintStar = () => {
    const target = famousStars.find((s) => s.id === currentMission.hintStarId);
    if (target) onSelectStar(target);
  };

  const handleResetProgress = () => {
    setCompletedTasks([false, false, false]);
    setActiveTaskIdx(0);
    setShowHint(false);
    setCelebration(null);
  };

  return (
    <section className="academy-drawer hud-card" aria-labelledby="academy-title">
      <div className="academy-header">
        <div className="academy-title-group">
          <Trophy size={16} className="trophy-icon" aria-hidden="true" />
          <h3 id="academy-title" className="academy-title">{t('academyTitle')}</h3>
          <span className="academy-progress-tag">
            {completedTasks.filter(Boolean).length} / {MISSIONS.length} {t('missionsCompleted')}
          </span>
        </div>
        <div className="academy-xp-group">
          <Sparkles size={13} className="xp-icon" aria-hidden="true" />
          <span className="academy-xp">{totalXp} XP</span>
          <button type="button" className="academy-reset-btn" onClick={handleResetProgress} title={t('resetMissions')} aria-label={t('resetMissions')}>
            <RotateCcw size={12} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mission-stepper" role="tablist">
        {MISSIONS.map((m, idx) => (
          <button
            type="button"
            role="tab"
            aria-selected={idx === activeTaskIdx}
            key={m.id}
            className={`mission-step-pill ${completedTasks[idx] ? 'done' : ''} ${idx === activeTaskIdx ? 'active' : ''}`}
            onClick={() => {
              setActiveTaskIdx(idx);
              setShowHint(false);
            }}
          >
            {completedTasks[idx] ? <CheckCircle2 size={13} aria-hidden="true" /> : <span>{idx + 1}</span>}
            <span className="pill-name">{t('missionLabel')} {idx + 1}</span>
          </button>
        ))}
      </div>

      {!allComplete ? (
        <div className="mission-content">
          <div className="mission-body">
            <h4>{t(`mission_${currentMission.id}_title`)}</h4>
            <p className="mission-instruction">{t(`mission_${currentMission.id}_desc`)}</p>
            <div className="mission-actions-row">
              <button type="button" className="mission-hint-btn" onClick={() => setShowHint((h) => !h)} aria-expanded={showHint}>
                <HelpCircle size={13} aria-hidden="true" />
                <span>{showHint ? t('hideHint') : t('showHint')}</span>
              </button>
              <button type="button" className="mission-guide-jump-btn" onClick={handleJumpToHintStar} title={t('targetExampleTitle')}>
                <Target size={13} aria-hidden="true" />
                <span>{t('targetExample')}</span>
              </button>
            </div>
            {showHint && (
              <div className="mission-hint-box">
                <Compass size={13} className="hint-icon" aria-hidden="true" />
                <span>{t(`mission_${currentMission.id}_hint`)}</span>
              </div>
            )}
          </div>

          <div className="mission-status-readout" aria-live="polite">
            <span className="readout-label">{t('currentSelectedTarget')}</span>
            {selectedStar ? (
              <div className="readout-star">
                <strong>{selectedStar.name}</strong>
                <span>({selectedStar.spectralType}, {formatInt(selectedStar.temp, lang)} K, {formatSig(selectedStar.lum, lang)} L☉)</span>
                {completedTasks[activeTaskIdx] && <span className="readout-success">✓ {t('criteriaMet')}</span>}
              </div>
            ) : (
              <span className="readout-empty">{t('selectStarHint')}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="academy-completion-banner">
          <Award size={36} className="cert-trophy" aria-hidden="true" />
          <div className="cert-text">
            <h3>{t('academyCompleteTitle')}</h3>
            <p>{t('academyCompleteText')}</p>
            <span className="cert-badge">
              <ShieldCheck size={14} aria-hidden="true" />
              {t('academyCertificate')}
            </span>
          </div>
        </div>
      )}

      {celebration && (
        <div className="academy-toast" role="status">
          <Sparkles size={14} aria-hidden="true" />
          <span>{t('missionAccomplished', { name: celebration.starName, xp: celebration.xp })}</span>
        </div>
      )}
    </section>
  );
}
