import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import HRCanvas from './components/HRCanvas';
import StarInspector from './components/StarInspector';
import EvolutionSimulator from './components/EvolutionSimulator';
import ClusterSimulator from './components/ClusterSimulator';
import AcademySimulator from './components/AcademySimulator';
import ComparisonModal from './components/ComparisonModal';
import EducationalGuide from './components/EducationalGuide';
import AttributionModal from './components/AttributionModal';
import ControlPanel from './components/ControlPanel';
import Footer from './components/Footer';

import { loadStellarDatasets } from './services/dataLoader';
import { getEvolutionState, EVOLUTION_TRACKS } from './simulation/evolutionTracks';
import { generateIsochronePoints } from './simulation/clusterSimulation';

import './App.css';

export default function App() {
  // Datasets loaded asynchronously from /data/
  const [famousStars, setFamousStars] = useState([]);
  const [backgroundStars, setBackgroundStars] = useState([]);
  const [clusterMembers, setClusterMembers] = useState({ pleiades: [], hyades: [] });
  const [attribution, setAttribution] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Navigation & Modals
  const [activeMode, setActiveMode] = useState('explore'); // 'explore' | 'evolution' | 'cluster' | 'compare'
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAttributionOpen, setIsAttributionOpen] = useState(false);

  // Selected Star for Inspector
  const [selectedStar, setSelectedStar] = useState(null);

  // Stars selected for Comparison
  const [compareStars, setCompareStars] = useState([]);

  // Diagram Filters & Layer Toggles
  const [filterSearch, setFilterSearch] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterPlanetsOnly, setFilterPlanetsOnly] = useState(false);
  const [showIsoradii, setShowIsoradii] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [showBackgroundPopulation, setShowBackgroundPopulation] = useState(true);
  const [showFamousLabels, setShowFamousLabels] = useState(false);
  const [showGaiaFineStructure, setShowGaiaFineStructure] = useState(false);
  const [showRelativisticRemnants, setShowRelativisticRemnants] = useState(false);

  // Stellar Evolution Simulation State
  const [evolutionMass, setEvolutionMass] = useState(1.0);
  const [evolutionProgress, setEvolutionProgress] = useState(0.40); // 4.6 Gyr (Current Sun)
  const [isPlayingEvolution, setIsPlayingEvolution] = useState(false);

  // Cluster Age Simulation State
  const [clusterAgeGyr, setClusterAgeGyr] = useState(0.1); // 100 Myr (Pleiades)

  // Asynchronously fetch stellar datasets at startup
  useEffect(() => {
    loadStellarDatasets()
      .then((data) => {
        setFamousStars(data.famousStars);
        setBackgroundStars(data.backgroundStars);
        setClusterMembers(data.clusterMembers);
        setAttribution(data.attribution);

        // Default to Sun once famous stars arrive
        const sun = data.famousStars.find((s) => s.name.toLowerCase() === 'sol' || s.name.toLowerCase().includes('sun')) || data.famousStars[0];
        const sirius = data.famousStars.find((s) => s.name.toLowerCase() === 'sirius');
        if (sun) {
          setSelectedStar(sun);
          setCompareStars(sirius ? [sun, sirius] : [sun]);
        }
        setIsLoadingData(false);
      })
      .catch((err) => {
        console.error("Failed to load astronomical datasets:", err);
        setIsLoadingData(false);
      });
  }, []);

  // Current interpolated state of simulated evolving star
  const evolutionState = useMemo(() => {
    return getEvolutionState(evolutionMass, evolutionProgress);
  }, [evolutionMass, evolutionProgress]);

  // Points along selected evolution track for canvas path
  const evolutionTrackPoints = useMemo(() => {
    const track = EVOLUTION_TRACKS[evolutionMass] || EVOLUTION_TRACKS[1.0];
    return track.steps;
  }, [evolutionMass]);

  // Cluster Isochrone & Turn-Off calculation
  const clusterIsochrone = useMemo(() => {
    return generateIsochronePoints(clusterAgeGyr);
  }, [clusterAgeGyr]);

  // Add / Remove from Star Comparison
  const handleToggleAddToCompare = (star) => {
    setCompareStars((prev) => {
      const exists = prev.some((s) => s.id === star.id);
      if (exists) {
        return prev.filter((s) => s.id !== star.id);
      } else {
        if (prev.length >= 4) {
          alert('You can compare up to 4 stars simultaneously.');
          return prev;
        }
        return [...prev, star];
      }
    });
  };

  const handleRemoveFromCompare = (starId) => {
    setCompareStars((prev) => prev.filter((s) => s.id !== starId));
  };

  const handleAddStarToCompare = (star) => {
    if (!compareStars.some((s) => s.id === star.id)) {
      if (compareStars.length >= 4) {
        alert('You can compare up to 4 stars simultaneously.');
        return;
      }
      setCompareStars((prev) => [...prev, star]);
    }
  };

  const handleClearCompare = () => {
    setCompareStars([]);
  };

  const isSelectedInCompare = selectedStar && compareStars.some((s) => s.id === selectedStar.id);

  if (isLoadingData) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <h2>Loading Astronomical Datasets...</h2>
        <p>Decoupled Hipparcos, Yale Bright Star, and Gliese (HYG v3.8) stellar catalog</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Top Application Header */}
      <Header
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAttribution={() => setIsAttributionOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="app-main-content">
        {/* Left Side Control Panel */}
        <ControlPanel
          filterSearch={filterSearch}
          onSearchChange={setFilterSearch}
          filterClass={filterClass}
          onSelectClass={setFilterClass}
          filterPlanetsOnly={filterPlanetsOnly}
          onTogglePlanetsOnly={() => setFilterPlanetsOnly((v) => !v)}
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
          famousStars={famousStars}
          onSelectStar={setSelectedStar}
        />

        {/* Center: Interactive H-R Canvas & Mode Specific Simulators */}
        <div className="diagram-workspace">
          <HRCanvas
            famousStars={famousStars}
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
            filterSearch={filterSearch}
            showIsoradii={showIsoradii}
            showRegions={showRegions}
            showBackgroundPopulation={showBackgroundPopulation}
            showFamousLabels={showFamousLabels}
            showGaiaFineStructure={showGaiaFineStructure}
            showRelativisticRemnants={showRelativisticRemnants}
          />

          {/* Evolution Simulator Drawer if active */}
          {activeMode === 'evolution' && (
            <EvolutionSimulator
              selectedMass={evolutionMass}
              onSelectMass={setEvolutionMass}
              progress={evolutionProgress}
              onChangeProgress={setEvolutionProgress}
              isPlaying={isPlayingEvolution}
              onTogglePlay={() => setIsPlayingEvolution((v) => !v)}
              evolutionState={evolutionState}
            />
          )}

          {/* Cluster Dating Simulator Drawer if active */}
          {activeMode === 'cluster' && (
            <ClusterSimulator
              clusterAgeGyr={clusterAgeGyr}
              onChangeClusterAge={setClusterAgeGyr}
              clusterIsochrone={clusterIsochrone}
            />
          )}

          {/* Astrometrics Academy Gamified Missions Drawer if active */}
          {activeMode === 'academy' && (
            <AcademySimulator
              selectedStar={selectedStar}
              onSelectStar={setSelectedStar}
              famousStars={famousStars}
            />
          )}
        </div>

        {/* Right Side: Star Inspector Panel */}
        {selectedStar && (
          <StarInspector
            star={selectedStar}
            onClose={() => setSelectedStar(null)}
            onAddToCompare={handleToggleAddToCompare}
            isComparing={isSelectedInCompare}
          />
        )}
      </main>

      {/* Persistent Academic & Institutional Footer */}
      <Footer />

      {/* Comparison Modal Dialog */}
      {activeMode === 'compare' && (
        <ComparisonModal
          compareStars={compareStars}
          famousStars={famousStars}
          onRemoveFromCompare={handleRemoveFromCompare}
          onAddStarToCompare={handleAddStarToCompare}
          onClearCompare={handleClearCompare}
          onClose={() => setActiveMode('explore')}
        />
      )}

      {/* Educational Guide Modal Dialog */}
      {isGuideOpen && (
        <EducationalGuide onClose={() => setIsGuideOpen(false)} />
      )}

      {/* Astronomical Data Attribution & Sources Modal */}
      {isAttributionOpen && (
        <AttributionModal
          attribution={attribution}
          onClose={() => setIsAttributionOpen(false)}
        />
      )}
    </div>
  );
}
