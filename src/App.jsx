import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import HRCanvas from './components/HRCanvas';
import HZDiagramCanvas from './components/HZDiagramCanvas';
import StarInspector from './components/StarInspector';
import EvolutionSimulator from './components/EvolutionSimulator';
import ClusterSimulator from './components/ClusterSimulator';
import AcademySimulator from './components/AcademySimulator';
import ComparisonModal from './components/ComparisonModal';
import EducationalGuide from './components/EducationalGuide';
import AttributionModal from './components/AttributionModal';
import CustomStarModal from './components/CustomStarModal';
import ControlPanel from './components/ControlPanel';
import Footer from './components/Footer';

import { loadStellarDatasets } from './services/dataLoader';
import { loadExoplanetDataset } from './services/exoplanetService';
import { getEvolutionState, EVOLUTION_TRACKS } from './simulation/evolutionTracks';
import { generateIsochronePoints } from './simulation/clusterSimulation';
import { useLanguage } from './i18n/LanguageContext';

import './App.css';

const MAX_COMPARE = 4;

export default function App() {
  const { t } = useLanguage();

  // Datasets loaded asynchronously from public/data/
  const [famousStars, setFamousStars] = useState([]);
  const [customStars, setCustomStars] = useState(() => {
    try {
      const saved = localStorage.getItem('hr_custom_stars');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [backgroundStars, setBackgroundStars] = useState([]);
  const [clusterMembers, setClusterMembers] = useState({ pleiades: [], hyades: [] });
  const [attribution, setAttribution] = useState(null);
  const [exoplanetData, setExoplanetData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [activeMode, setActiveMode] = useState('explore'); // explore | evolution | cluster | academy | compare | hz_diagram
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAttributionOpen, setIsAttributionOpen] = useState(false);
  const [isCustomStarModalOpen, setIsCustomStarModalOpen] = useState(false);
  const [selectedStar, setSelectedStar] = useState(null);
  const [compareStars, setCompareStars] = useState([]);
  const [compareNotice, setCompareNotice] = useState(false);

  // Diagram filters and layers
  const [filterSearch, setFilterSearch] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterPlanetsOnly, setFilterPlanetsOnly] = useState(false);
  const [filterHabitableZoneOnly, setFilterHabitableZoneOnly] = useState(false);
  const [showNamedStars, setShowNamedStars] = useState(true);
  const [showIsoradii, setShowIsoradii] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [showBackgroundPopulation, setShowBackgroundPopulation] = useState(true);
  const [showFamousLabels, setShowFamousLabels] = useState(false);
  const [showGaiaFineStructure, setShowGaiaFineStructure] = useState(false);
  const [showRelativisticRemnants, setShowRelativisticRemnants] = useState(false);

  // Stellar evolution simulation
  const [evolutionMass, setEvolutionMass] = useState(1);
  const [evolutionProgress, setEvolutionProgress] = useState(0.4); // the Sun today
  const [isPlayingEvolution, setIsPlayingEvolution] = useState(false);

  // Cluster age (Gyr); starts at the Pleiades
  const [clusterAgeGyr, setClusterAgeGyr] = useState(0.125);

  useEffect(() => {
    try {
      localStorage.setItem('hr_custom_stars', JSON.stringify(customStars));
    } catch (e) {
      console.warn('Failed to save custom stars to localStorage', e);
    }
  }, [customStars]);

  useEffect(() => {
    loadStellarDatasets()
      .then((data) => {
        setFamousStars(data.famousStars);
        setBackgroundStars(data.backgroundStars);
        setClusterMembers(data.clusterMembers);
        setAttribution(data.attribution);
        const sun = data.famousStars.find((s) => s.id === 'sun');
        const sirius = data.famousStars.find((s) => s.id === 'sirius_a');
        if (sun) {
          setSelectedStar(sun);
          setCompareStars(sirius ? [sun, sirius] : [sun]);
        }
        setIsLoadingData(false);
      })
      .catch((err) => {
        console.error('Failed to load astronomical datasets:', err);
        setLoadError(true);
        setIsLoadingData(false);
      });

    loadExoplanetDataset()
      .then(setExoplanetData)
      .catch((err) => console.warn('Failed to load exoplanet dataset:', err));
  }, []);

  const hostsWithHZ = useMemo(() => exoplanetData?.hostsWithHZ || new Set(), [exoplanetData]);

  const allStars = useMemo(() => [...famousStars, ...customStars], [famousStars, customStars]);

  const handleAddCustomStar = useCallback((newStar) => {
    setCustomStars((prev) => {
      if (prev.some((s) => s.id === newStar.id)) return prev;
      return [newStar, ...prev];
    });
  }, []);

  const handleRemoveCustomStar = useCallback((id) => {
    setCustomStars((prev) => prev.filter((s) => s.id !== id));
    setSelectedStar((cur) => (cur && cur.id === id ? null : cur));
    setCompareStars((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleClearCustomStars = useCallback(() => {
    setCustomStars([]);
    setSelectedStar((cur) => (cur && cur.isCustom ? null : cur));
    setCompareStars((prev) => prev.filter((s) => !s.isCustom));
  }, []);

  const handleImportCustomStars = useCallback((stars) => {
    if (!Array.isArray(stars)) return;
    const validStars = stars.map((s, idx) => ({
      ...s,
      id: s.id || `custom_imported_${Date.now()}_${idx}`,
      isCustom: true
    }));
    setCustomStars((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const fresh = validStars.filter((s) => !existingIds.has(s.id));
      return [...fresh, ...prev];
    });
  }, []);

  const handleOpenCustomStarModal = useCallback(() => {
    setIsCustomStarModalOpen(true);
  }, []);

  const evolutionState = useMemo(() => getEvolutionState(evolutionMass, evolutionProgress), [evolutionMass, evolutionProgress]);
  const evolutionTrackPoints = useMemo(() => (EVOLUTION_TRACKS[evolutionMass] || EVOLUTION_TRACKS[1]).steps, [evolutionMass]);
  const clusterIsochrone = useMemo(() => generateIsochronePoints(clusterAgeGyr), [clusterAgeGyr]);

  const addToCompare = useCallback((star) => {
    setCompareStars((prev) => {
      if (prev.some((s) => s.id === star.id)) return prev;
      if (prev.length >= MAX_COMPARE) {
        setCompareNotice(true);
        return prev;
      }
      return [...prev, star];
    });
  }, []);

  const handleToggleAddToCompare = (star) => {
    if (compareStars.some((s) => s.id === star.id)) {
      setCompareStars((prev) => prev.filter((s) => s.id !== star.id));
    } else {
      addToCompare(star);
    }
  };

  useEffect(() => {
    if (!compareNotice) return undefined;
    const timer = setTimeout(() => setCompareNotice(false), 4000);
    return () => clearTimeout(timer);
  }, [compareNotice]);

  // Leaving the evolution mode stops playback
  const changeMode = useCallback((mode) => {
    setActiveMode(mode);
    if (mode !== 'evolution') setIsPlayingEvolution(false);
  }, []);
  const closeCompare = useCallback(() => setActiveMode('explore'), []);
  const closeGuide = useCallback(() => setIsGuideOpen(false), []);
  const closeAttribution = useCallback(() => setIsAttributionOpen(false), []);

  const isSelectedInCompare = Boolean(selectedStar && compareStars.some((s) => s.id === selectedStar.id));

  if (isLoadingData || loadError) {
    return (
      <div className="loading-screen" role="status">
        {!loadError && <div className="loading-spinner" />}
        <h2>{loadError ? t('loadErrorTitle') : t('loadingTitle')}</h2>
        <p>{loadError ? t('loadErrorText') : t('loadingText')}</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header
        activeMode={activeMode}
        setActiveMode={changeMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAttribution={() => setIsAttributionOpen(true)}
      />

      <main className="app-main-content">
        {activeMode !== 'hz_diagram' && (
          <ControlPanel
            filterSearch={filterSearch}
            onSearchChange={setFilterSearch}
            filterClass={filterClass}
            onSelectClass={setFilterClass}
            filterPlanetsOnly={filterPlanetsOnly}
            onTogglePlanetsOnly={() => setFilterPlanetsOnly((v) => !v)}
            filterHabitableZoneOnly={filterHabitableZoneOnly}
            onToggleHabitableZoneOnly={() => setFilterHabitableZoneOnly((v) => !v)}
            hostsWithHZ={hostsWithHZ}
            showNamedStars={showNamedStars}
            onToggleNamedStars={() => setShowNamedStars((v) => !v)}
            showIsoradii={showIsoradii}
            onToggleIsoradii={() => setShowIsoradii((v) => !v)}
            showRegions={showRegions}
            onToggleRegions={() => setShowRegions((v) => !v)}
            showBackgroundPopulation={showBackgroundPopulation}
            onToggleBackgroundPopulation={() => setShowBackgroundPopulation((v) => !v)}
            showFamousLabels={showFamousLabels}
            onToggleFamousLabels={() => setShowFamousLabels((v) => !v)}
            showGaiaFineStructure={showGaiaFineStructure}
            onToggleGaiaFineStructure={() => setShowGaiaFineStructure((v) => !v)}
            showRelativisticRemnants={showRelativisticRemnants}
            onToggleRelativisticRemnants={() => setShowRelativisticRemnants((v) => !v)}
            famousStars={allStars}
            backgroundCount={backgroundStars.length}
            onSelectStar={setSelectedStar}
            onOpenCustomStarModal={handleOpenCustomStarModal}
            customStarsCount={customStars.length}
          />
        )}

        <div className="diagram-workspace">
          {activeMode === 'hz_diagram' ? (
            <HZDiagramCanvas
              exoplanetData={exoplanetData}
              onSelectStar={setSelectedStar}
              famousStars={allStars}
              onOpenCustomStarModal={handleOpenCustomStarModal}
            />
          ) : (
            <HRCanvas
              famousStars={allStars}
              backgroundStars={backgroundStars}
              selectedStar={selectedStar}
              onSelectStar={setSelectedStar}
              activeMode={activeMode}
              evolutionState={evolutionState}
              evolutionTrackPoints={evolutionTrackPoints}
              clusterIsochrone={clusterIsochrone}
              clusterMembers={clusterMembers}
              clusterAgeGyr={clusterAgeGyr}
              filterClass={filterClass}
              filterPlanetsOnly={filterPlanetsOnly}
              filterHabitableZoneOnly={filterHabitableZoneOnly}
              hostsWithHZ={hostsWithHZ}
              filterSearch={filterSearch}
              showNamedStars={showNamedStars}
              showIsoradii={showIsoradii}
              showRegions={showRegions}
              showBackgroundPopulation={showBackgroundPopulation}
              showFamousLabels={showFamousLabels}
              showGaiaFineStructure={showGaiaFineStructure}
              showRelativisticRemnants={showRelativisticRemnants}
            />
          )}

          {activeMode === 'evolution' && (
            <EvolutionSimulator
              selectedMass={evolutionMass}
              onSelectMass={setEvolutionMass}
              progress={evolutionProgress}
              onChangeProgress={setEvolutionProgress}
              isPlaying={isPlayingEvolution}
              onSetPlaying={setIsPlayingEvolution}
              evolutionState={evolutionState}
            />
          )}

          {activeMode === 'cluster' && (
            <ClusterSimulator clusterAgeGyr={clusterAgeGyr} onChangeClusterAge={setClusterAgeGyr} clusterIsochrone={clusterIsochrone} />
          )}

          {activeMode === 'academy' && (
            <AcademySimulator selectedStar={selectedStar} onSelectStar={setSelectedStar} famousStars={allStars} />
          )}
        </div>

        {selectedStar && (
          <StarInspector
            star={selectedStar}
            onClose={() => setSelectedStar(null)}
            onAddToCompare={handleToggleAddToCompare}
            isComparing={isSelectedInCompare}
          />
        )}
      </main>

      {compareNotice && (
        <div className="app-toast" role="alert">
          {t('compareLimit', { max: MAX_COMPARE })}
        </div>
      )}

      <Footer />

      {activeMode === 'compare' && (
        <ComparisonModal
          compareStars={compareStars}
          famousStars={allStars}
          onRemoveFromCompare={(id) => setCompareStars((prev) => prev.filter((s) => s.id !== id))}
          onAddStarToCompare={addToCompare}
          onClearCompare={() => setCompareStars([])}
          onClose={closeCompare}
        />
      )}

      {isGuideOpen && <EducationalGuide onClose={closeGuide} />}
      {isAttributionOpen && <AttributionModal attribution={attribution} onClose={closeAttribution} />}
      {isCustomStarModalOpen && (
        <CustomStarModal
          customStars={customStars}
          onAddCustomStar={handleAddCustomStar}
          onRemoveCustomStar={handleRemoveCustomStar}
          onClearCustomStars={handleClearCustomStars}
          onImportCustomStars={handleImportCustomStars}
          onSelectStar={setSelectedStar}
          onClose={() => setIsCustomStarModalOpen(false)}
        />
      )}
    </div>
  );
}
