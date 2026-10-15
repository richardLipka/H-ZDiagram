import React, { useState, useEffect, useMemo } from 'react';
import { Award, CheckCircle2, HelpCircle, RotateCcw, Sparkles, Target, Trophy, Compass, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function AcademySimulator({
  selectedStar,
  onSelectStar,
  famousStars = []
}) {
  const { lang, t } = useLanguage();

  // Active mission index: 0 = Mission 1, 1 = Mission 2, 2 = Mission 3
  const [activeTaskIdx, setActiveTaskIdx] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([false, false, false]);
  const [showHint, setShowHint] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState(null);

  // Define the 3 Academy missions
  const missions = useMemo(() => [
    {
      id: 'solar_twin',
      title: lang === 'cs' ? 'Mise 1: Sluneční dvojče' : 'Mission 1: The Solar Twin',
      targetDesc: lang === 'cs'
        ? 'Vyhledejte a označte v diagramu žlutého trpaslíka hlavní posloupnosti s povrchovou teplotou 5 400 – 6 100 K a svítivostí 0,7 – 1,5 L☉.'
        : 'Locate and select a Main Sequence yellow dwarf with surface temperature 5,400 – 6,100 K and luminosity 0.7 – 1.5 L☉.',
      hint: lang === 'cs'
        ? 'Nápověda: Prozkoumejte střední pás hlavní posloupnosti (třída G). Zkuste najít Slunce (Sol), Alfa Centauri A nebo 16 Cygni B.'
        : 'Hint: Explore the central main-sequence band (class G). Look for Sun (Sol), Alpha Centauri A, or 16 Cygni B.',
      xp: 100,
      verify: (s) => {
        if (!s) return false;
        const isTemp = s.temp >= 5300 && s.temp <= 6200;
        const isLum = s.lum >= 0.6 && s.lum <= 1.8;
        const isClass = s.spectralType && (s.spectralType.startsWith('G') || s.spectralType.includes('G'));
        return isTemp && isLum && isClass;
      },
      hintStarId: 'sun'
    },
    {
      id: 'habitable_hunter',
      title: lang === 'cs' ? 'Mise 2: Lovec obyvatelných světů' : 'Mission 2: Habitable World Hunter',
      targetDesc: lang === 'cs'
        ? 'Lokalizujte hvězdu, která hostí potvrzené exoplanety v kapalinové obyvatelné zóně (CHZ).'
        : 'Locate an exoplanet host star harboring confirmed planets within its Circumstellar Habitable Zone (CHZ).',
      hint: lang === 'cs'
        ? 'Nápověda: Zapněte filtr exoplanet na levém panelu nebo vyhledejte TRAPPIST-1, Proxima Centauri, Kepler-186 či Gliese 667 C.'
        : 'Hint: Enable the exoplanet filter on the left panel or search for TRAPPIST-1, Proxima Centauri, Kepler-186, or Gliese 667 C.',
      xp: 150,
      verify: (s) => {
        if (!s) return false;
        return Boolean(s.hasExoplanets && s.exoplanetCount > 0);
      },
      hintStarId: 'trappist_1'
    },
    {
      id: 'white_dwarf',
      title: lang === 'cs' ? 'Mise 3: Hřbitov bílých trpaslíků' : 'Mission 3: White Dwarf Graveyard',
      targetDesc: lang === 'cs'
        ? 'Vyhledejte kompaktního degenerovaného bílého trpaslíka (třída D) o poloměru srovnatelném se Zemí (R < 0,03 R☉).'
        : 'Locate a compact degenerate White Dwarf (class D) with Earth-comparable radius (R < 0.03 R☉).',
      hint: lang === 'cs'
        ? 'Nápověda: Podívejte se do levého spodního sektoru diagramu. Hvězdy jsou zde velmi horké, ale extrémně slabé (např. Sirius B nebo Procyon B).'
        : 'Hint: Look in the bottom-left quadrant. Stars here are blazing hot but faint due to their tiny radius (e.g. Sirius B or Procyon B).',
      xp: 200,
      verify: (s) => {
        if (!s) return false;
        const isClassD = (s.spectralType && s.spectralType.startsWith('D')) || s.luminosityClass === 'D';
        const isTiny = s.radius && s.radius < 0.04;
        const isFaintHot = s.temp >= 7000 && s.lum <= 0.1;
        return isClassD || (isTiny && isFaintHot);
      },
      hintStarId: 'sirius_b'
    }
  ], [lang]);

  const currentMission = missions[activeTaskIdx];
  const allComplete = completedTasks.every(Boolean);
  const totalXp = completedTasks.reduce((acc, comp, i) => comp ? acc + missions[i].xp : acc, 0);

  // Verify target whenever user selects a star
  useEffect(() => {
    if (!selectedStar || allComplete) return;

    if (currentMission && currentMission.verify(selectedStar)) {
      if (!completedTasks[activeTaskIdx]) {
        const timer = setTimeout(() => {
          setCompletedTasks(prev => {
            const next = [...prev];
            next[activeTaskIdx] = true;
            return next;
          });

          // Flash celebration
          setCelebrationMsg({
            title: lang === 'cs' ? 'Cíl úspěšně splněn!' : 'Objective Achieved!',
            starName: selectedStar.name,
            xp: currentMission.xp
          });

          // Advance to next mission after a brief moment
          if (activeTaskIdx < missions.length - 1) {
            setTimeout(() => {
              setActiveTaskIdx(prev => prev + 1);
              setShowHint(false);
            }, 1400);
          }
        }, 20);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedStar, activeTaskIdx, completedTasks, allComplete, currentMission, lang, missions]);

  // Handle hint jump
  const handleJumpToHintStar = () => {
    if (!currentMission || !famousStars.length) return;
    const target = famousStars.find(s => s.id === currentMission.hintStarId || s.name.toLowerCase().includes(currentMission.hintStarId));
    if (target) {
      onSelectStar(target);
    }
  };

  const handleResetProgress = () => {
    setCompletedTasks([false, false, false]);
    setActiveTaskIdx(0);
    setShowHint(false);
    setCelebrationMsg(null);
  };

  return (
    <aside className="academy-drawer hud-card">
      <div className="academy-header">
        <div className="academy-title-group">
          <Trophy size={16} className="trophy-icon" />
          <span className="academy-title">{t('academyTitle')}</span>
          <span className="academy-progress-tag">
            {completedTasks.filter(Boolean).length} / {missions.length} {t('missionsCompleted')}
          </span>
        </div>

        <div className="academy-xp-group">
          <Sparkles size={13} className="xp-icon" />
          <span className="academy-xp">{totalXp} XP</span>
          <button
            className="academy-reset-btn"
            onClick={handleResetProgress}
            title={lang === 'cs' ? 'Resetovat mise akademie' : 'Reset Academy Missions'}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Task step navigator pills */}
      <div className="mission-stepper">
        {missions.map((m, idx) => {
          const isDone = completedTasks[idx];
          const isCurrent = idx === activeTaskIdx;
          return (
            <button
              key={m.id}
              className={`mission-step-pill ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}
              onClick={() => {
                setActiveTaskIdx(idx);
                setShowHint(false);
              }}
            >
              {isDone ? <CheckCircle2 size={13} /> : <span>{idx + 1}</span>}
              <span className="pill-name">{m.title.split(':')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Mission details & interactive target */}
      {!allComplete ? (
        <div className="mission-content">
          <div className="mission-body">
            <h4>{currentMission.title}</h4>
            <p className="mission-instruction">{currentMission.targetDesc}</p>

            {/* Hint toggle and actions */}
            <div className="mission-actions-row">
              <button
                className="mission-hint-btn"
                onClick={() => setShowHint(h => !h)}
              >
                <HelpCircle size={13} />
                <span>{showHint ? (lang === 'cs' ? 'Skrýt nápovědu' : 'Hide Hint') : (lang === 'cs' ? 'Zobrazit nápovědu' : 'Show Clue')}</span>
              </button>

              <button
                className="mission-guide-jump-btn"
                onClick={handleJumpToHintStar}
                title={lang === 'cs' ? 'Označit vzorovou hvězdu v diagramu' : 'Select benchmark star in diagram'}
              >
                <Target size={13} />
                <span>{lang === 'cs' ? 'Zaměřit vzor' : 'Target Example'}</span>
              </button>
            </div>

            {showHint && (
              <div className="mission-hint-box">
                <Compass size={13} className="hint-icon" />
                <span>{currentMission.hint}</span>
              </div>
            )}
          </div>

          {/* Dynamic target inspection readout */}
          <div className="mission-status-readout">
            <span className="readout-label">{t('currentSelectedTarget')}:</span>
            {selectedStar ? (
              <div className="readout-star">
                <strong>{selectedStar.name}</strong>
                <span>({selectedStar.spectralType}, {selectedStar.temp.toLocaleString()} K, {selectedStar.lum} L☉)</span>
                {completedTasks[activeTaskIdx] && (
                  <span className="readout-success">✓ {t('criteriaMet')}</span>
                )}
              </div>
            ) : (
              <span className="readout-empty">{t('selectStarHint')}</span>
            )}
          </div>
        </div>
      ) : (
        /* Grand Completion Banner */
        <div className="academy-completion-banner">
          <Award size={36} className="cert-trophy" />
          <div className="cert-text">
            <h3>{lang === 'cs' ? 'Akademie úspěšně dokončena!' : 'Academy Curriculum Completed!'}</h3>
            <p>
              {lang === 'cs'
                ? 'Gratulujeme! Úspěšně jste zvládli astrofyzikální identifikaci žlutých trpaslíků, obyvatelných zón i bílých trpaslíků.'
                : 'Congratulations! You have mastered the astrophysical identification of solar twins, habitable exoplanet hosts, and white dwarfs.'}
            </p>
            <span className="cert-badge">
              <ShieldCheck size={14} />
              {lang === 'cs' ? 'Certifikovaný astrometrický navigátor' : 'Certified Astrometric Navigator'}
            </span>
          </div>
        </div>
      )}

      {/* Brief celebration toast */}
      {celebrationMsg && (
        <div className="academy-toast">
          <Sparkles size={14} />
          <span>{celebrationMsg.title} {celebrationMsg.starName} (+{celebrationMsg.xp} XP)</span>
        </div>
      )}
    </aside>
  );
}
