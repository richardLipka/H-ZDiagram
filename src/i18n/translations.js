/**
 * Bilingual Localization Dictionary: English (en) & Czech (cs).
 * Accurate scientific terminology according to the Czech Astronomical Society (ČAS)
 * and international astrophysical conventions (IAU).
 */

export const translations = {
  en: {
    // Header & Meta
    appTitle: "Astrometrics // H–R Stellar Cartography",
    appSubtitle: "Interactive Hertzsprung–Russell Diagram Studio",
    shipDesignation: "ASTROMETRICS v3.8",
    sensorsOnline: "ONLINE",
    
    // Navigation Modes
    navExplore: "Explore",
    navEvolution: "Evolution",
    navClusters: "Clusters",
    navCompare: "Compare",
    navAcademy: "Academy",
    navManual: "Guide",
    navDataFeed: "Data Sources",
    navLangToggle: "🇨🇿 CZ",
    navLangTitle: "Přepnout do češtiny",

    // Control Panel
    searchHeader: "SEARCH STARS",
    searchPlaceholder: "Search star (e.g. Sol, Sirius, Betelgeuse)...",
    spectralBandpassHeader: "SPECTRAL CLASS",
    sensorOverlaysHeader: "DIAGRAM LAYERS",
    toggleHipparcos: "Hipparcos Catalog (6,500 stars)",
    toggleRegions: "Astrophysical Zones & Instability",
    toggleIsoradii: "Isoradii Contours (Constant Radius)",
    toggleLabels: "Star Labels",
    togglePlanetsOnly: "Stars with Exoplanets Only",
    toggleGaiaFine: "Gaia DR3: Substructures (Jao Gap)",
    toggleRelativistic: "Relativistic Remnants (Black Holes)",
    dbStatus: "CATALOG:",
    calibration: "CALIBRATION:",
    stefanBoltzmann: "STEFAN-BOLTZMANN",

    // Circumstellar Habitable Zone (CHZ)
    chzTitle: "CIRCUMSTELLAR HABITABLE ZONE",
    chzInnerBoundary: "INNER LIMIT",
    chzEarthEquiv: "EARTH EQUIVALENT",
    chzOuterBoundary: "OUTER LIMIT",
    runawayGreenhouse: "Runaway greenhouse boiling limit",
    maximumGreenhouse: "Max greenhouse CO2 freeze-out",
    flux: "flux",
    zoneHabitable: "LIQUID WATER (HABITABLE)",
    zoneScorched: "SCORCHED (TOO HOT)",
    zoneFrozen: "FROZEN (TOO COLD)",
    zoneWarm: "WARM GREENHOUSE",
    zoneCool: "COOL MARS-LIKE",
    chzEvolutionNotice: "Planetary evolution view: Observe the Habitable Zone sweep outward as the star expands into a Red Giant or contracts into a White Dwarf.",
    chzConfirmedNotice: "Confirmed multi-planetary system with {count} exoplanet(s) catalogued by astronomical observatories.",
    chzTheoreticalNotice: "Kopparapu et al. (2013) habitable boundaries and orbital scale calculated from Stefan-Boltzmann flux.",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    exoticBadge: "EXOTIC OBJECT",
    blackHole: "Stellar-Mass Black Hole",
    neutronStar: "Neutron Star / Pulsar",
    sourceLabel: "Sources",
    hzModelSource: "Kopparapu et al. (2013) HZ Model",
    nasaExoplanetSource: "NASA Exoplanet Archive",

    // Canvas & Coordinates
    axisTemp: "SURFACE TEMPERATURE T_eff (KELVIN)",
    axisSpectral: "HARVARD SPECTRAL CLASSIFICATION",
    axisLum: "LUMINOSITY (L / L☉)",
    axisAbsMag: "ABSOLUTE MAGNITUDE (M_v)",
    hotBlue: "HOT / BLUE ◀",
    coolRed: "▶ COOL / RED",
    recalibrateBtn: "RESET VIEW",
    sectorLabel: "SOLAR NEIGHBORHOOD",
    gridLabel: "GALACTIC GRID",
    zoomLabel: "ZOOM:",
    panLabel: "PAN:",

    // Canvas Regions
    regionMainSequence: "MAIN SEQUENCE (CLASS V)",
    regionSupergiants: "SUPERGIANTS (CLASS I)",
    regionRedGiants: "RED GIANTS (CLASS III)",
    regionWhiteDwarfs: "WHITE DWARFS (CLASS D)",
    regionInstabilityStrip: "INSTABILITY STRIP (CEPHEIDS / RR LYRAE)",
    regionSubgiants: "SUBGIANTS (CLASS IV)",

    // Constant Radii
    radius0001: "0.001 R☉ (Earth / White Dwarf)",
    radius001: "0.01 R☉",
    radius01: "0.1 R☉ (Jupiter / Brown Dwarf)",
    radius10: "1.0 R☉ (Solar Radius)",
    radius100: "10 R☉ (Subgiant / Bright)",
    radius1000: "100 R☉ (Red Giant)",
    radius10000: "1000 R☉ (Supergiant / Jupiter Orbit)",

    // Tooltip
    targetAcquired: "TARGET:",
    classLabel: "CLASS:",
    tempLabel: "TEMP:",
    lumLabel: "LUM:",
    radiusLabel: "RADIUS:",
    tooltipExoplanets: "🪐 {count} EXOPLANETARY BODY(IES)",
    tooltipClickHint: "CLICK TO INSPECT STAR ↗",

    // Star Inspector
    targetLockTitle: "SELECTED STAR",
    constellationPrefix: "CONSTELLATION:",
    hzScanHeader: "HABITABLE ZONE & EXOPLANETS",
    liquidH2OZone: "LIQUID WATER ZONE",
    exoplanetDetected: "🪐 {count} CONFIRMED EXOPLANET(S)",
    noExoplanets: "NO KNOWN EXOPLANETS",
    astrophysicalMatrix: "ASTROPHYSICAL PARAMETERS",
    paramLuminosity: "LUMINOSITY",
    paramRadius: "RADIUS",
    paramEstimatedMass: "ESTIMATED MASS",
    paramAbsMag: "ABS MAGNITUDE (Mv)",
    paramDistance: "DISTANCE FROM EARTH",
    paramLifetime: "MS LIFETIME",
    radialPulsationHeader: "RADIAL PULSATION",
    radialPulsationText: "Periodic luminosity instability observed with a harmonic pulsation period of {period} days.",
    archiveLogHeader: "ASTROPHYSICAL NOTES",
    catalogLinksHeader: "EXTERNAL CATALOGUES & ARCHIVES",
    disengageCompare: "REMOVE FROM COMPARISON",
    engageCompare: "ADD TO COMPARISON",
    wikipediaBadge: "WIKIPEDIA",

    // Stellar Evolution Simulator
    evolutionTitle: "Stellar Evolution Sandbox",
    interactiveSimulation: "Interactive Simulation",
    birthMassLabel: "Birth Mass:",
    elapsedAge: "Elapsed Age:",
    photosphereState: "Photosphere State",
    effectiveTemp: "Effective Temp:",
    luminosity: "Luminosity:",
    radius: "Radius:",
    finalRemnant: "Final Remnant:",
    coreFusionState: "Core Nuclear Fusion State",
    activeCoreProcess: "Active Core Process:",
    resetToStarBirth: "Reset Timeline to Star Birth",
    pauseSim: "Pause Simulation",
    playSim: "Play Cosmic Timeline",

    // Cluster Age Simulator
    clusterTitle: "Star Cluster Age & Turn-off Point Simulator",
    isochroneBadge: "Isochrone & Age Dating",
    realClustersLabel: "Real Clusters:",
    clusterAgeLabel: "Cluster Age:",
    turnoffMass: "Turn-off Mass",
    turnoffMassSub: "Heavier stars have died",
    turnoffTemp: "Turn-off Temp",
    turnoffTempSub: "Surface temperature",
    turnoffLum: "Turn-off Luminosity",
    turnoffLumSub: "Brightness at bend",
    clusterPrincipleTitle: "Astronomical Principle:",
    clusterPrincipleText: "Stars in an open or globular cluster all condense out of the same nebula at roughly the same time. Because high-mass stars consume nuclear fuel exponentially faster, the Main Sequence terminates at the \"turn-off point\" (marked in cyan on the diagram). By identifying where stars bend toward the Giant Branch, astrophysicists calculate the age of the cluster!",
    clusterYoung: "Young",
    clusterSolarAge: "Solar Age",
    clusterGlobular: "Globular",

    // Comparison Modal
    comparisonTitle: "Comparative Stellar Astrophysics",
    clearAll: "Clear All",
    emptyCompareMsg: "No stars selected for comparison yet.",
    emptyCompareSub: "Click on any star on the diagram and choose \"Add to Star Comparison\", or pick from popular benchmarks below:",
    photosphereScaleTitle: "Photosphere Scale Comparison",
    physicalProperty: "Physical Property",
    spectralClass: "Spectral Class",
    surfaceTempK: "Surface Temp (K)",
    luminositySolar: "Luminosity (L / L☉)",
    radiusSolar: "Radius (R / R☉)",
    massSolar: "Mass (M / M☉)",
    habitableZone: "Habitable Zone",
    msLifetime: "MS Lifetime",
    exoplanets: "Exoplanets",
    externalCatalogues: "External Catalogues",
    noneDetected: "None detected",
    planetsCount: "planet(s)",

    // Educational Guide
    guideTitle: "Astrophysics Guide: Mastering the H–R Diagram",
    guideSec1Title: "1. The Rosetta Stone of Stellar Astronomy",
    guideSec1P1: "Invented independently around 1910 by Danish astronomer Ejnar Hertzsprung and American astronomer Henry Norris Russell, the H–R diagram is the single most important diagnostic tool in modern astrophysics.",
    guideSec1P2: "It maps a star's Luminosity (intrinsic energy output) against its Surface Effective Temperature (or Spectral Color). By plotting stars on this 2D plane, their internal physics, evolutionary age, and future destinies become instantly readable.",
    guideSec2Title: "2. Why is the Temperature Axis Reversed?",
    guideSec2P1: "Notice that the X-axis goes from 45,000 K (Hot / Blue) on the left to 2,000 K (Cool / Red) on the right.",
    guideSec2P2: "This historical quirk dates back to early astrophotography: astronomers classified stars using photographic filters to calculate the Color Index (B - V). Hot blue stars have smaller (or negative) B - V values, so they placed them at the left of the graph. When physical temperatures were later calibrated, astrophysicists retained this convention!",
    guideSec3Title: "3. The Four Major Stellar Branches",
    guideBranchMS: "Main Sequence (Class V)",
    guideBranchMSDesc: "The prominent diagonal band running from hot top-left to cool bottom-right. Stars here (including our Sun) are in hydrostatic equilibrium, stably fusing Hydrogen into Helium in their core. Stars spend ~90% of their active lifetimes here.",
    guideBranchRG: "Red Giants (Class III & IV)",
    guideBranchRGDesc: "Located in the upper right. When core hydrogen runs out, the inert helium core collapses and heats up, causing the outer envelope to swell to tens or hundreds of times its original radius, cooling to orange and red hues.",
    guideBranchSG: "Supergiants (Class I)",
    guideBranchSGDesc: "Occupying the topmost stratum of the diagram. Extremely massive stars (> 8 M☉) with luminosities reaching hundreds of thousands of times the Sun. They burn nuclear fuel rapidly and conclude their lives in cataclysmic supernovae.",
    guideBranchWD: "White Dwarfs (Class D)",
    guideBranchWDDesc: "The lower-left corner: hot surface temperatures but faint luminosities because they are tiny (Earth-sized). They are the exposed degenerate cores of dead stars that have shed their planetary nebulae, slowly cooling over trillions of years.",
    guideSec4Title: "4. Stefan–Boltzmann Law: Reading Stellar Radius",
    guideSec4P1: "Every star radiates energy according to the Stefan–Boltzmann equation:",
    guideSec4P2: "This means diagonal lines running from top-left to bottom-right are lines of constant stellar radius! A star at the top right has huge luminosity despite low temperature, meaning its surface area (R²) must be colossal (a red giant/supergiant). Conversely, a white dwarf at the bottom-left is scorching hot yet faint, proving it must be compact.",

    // Attribution Modal
    attributionTitle: "Astronomical Data Sources & Attribution",
    primaryCatalogTitle: "Primary Catalog: {name} (v{version})",
    compiledBy: "Compiled and maintained by {compiler}. Distributed under the {license}.",
    formalCitation: "Formal Citation:",
    githubRepo: "Astronexus GitHub Repository",
    codebergRepo: "Astronexus Codeberg Project",
    constituentSources: "Constituent Astrophysical Data Sources",
    authorAcademicTitle: "Author & Academic Project Information",
    authorAcademicDesc: "Developed by Richard Lipka as an interactive astrophysics and stellar cartography simulator. Designed for astronomy education, computational astrophysics demonstrations, and interactive stellar research.",
    authorHomepageLink: "Richard Lipka's Homepage (home.zcu.cz/~lipka)",
    dataPhilosophyNote: "Note on Data Architecture: All stellar coordinate, photometric, and physical parameters are completely decoupled from the UI code. Raw data files are hosted in /public/data/ and loaded asynchronously at runtime.",

    // Astrometrics Academy
    academyTitle: "Astrometrics Academy",
    academySubtitle: "Master stellar cartography through hands-on astrophysical challenges.",
    missionLabel: "Mission",
    missionsCompleted: "completed",
    currentSelectedTarget: "Selected Star:",
    criteriaMet: "Criteria Met! Mission Accomplished!",
    selectStarHint: "Click a star in the H–R diagram to test it against mission criteria.",
    showHint: "Highlight Benchmark",
    resetMissions: "Reset Progress",
    mission1Title: "The Solar Twin",
    mission1Desc: "Identify a Main Sequence G-type yellow dwarf with surface temperature and luminosity comparable to our Sun (T ≈ 5,400–6,100 K, L ≈ 0.7–1.5 L☉).",
    mission2Title: "Habitable World Hunter",
    mission2Desc: "Locate an exoplanet host star with confirmed exoplanets residing in its circumstellar habitable zone.",
    mission3Title: "White Dwarf Graveyard",
    mission3Desc: "Find a compact stellar remnant (White Dwarf, Class D) that has shed its outer envelope and collapsed to Earth-sized dimensions (R < 0.03 R☉).",

    // SIMBAD & CDS Aladin Telemetry
    simbadSkyCutout: "CDS SIMBAD Sky Cutout",
    photosphereModel: "Photosphere Model",
    queryingSimbad: "Querying CDS Strasbourg",
    simbadClass: "SIMBAD Class",
    simbadPlx: "Parallax",
    simbadRv: "Radial Vel.",

    // Footer & Academic Affiliation
    footerDepartment: "Department of Computer Science and Engineering (KIV)",
    footerFaculty: "Faculty of Applied Sciences",
    footerUniversity: "University of West Bohemia in Pilsen",
    footerAuthorLabel: "Author & Research Lead",
    footerMission: "Interactive Stellar Astrophysics & Astronomical Cartography Simulator",

    // Compact Habitable Zone Labels
    chzInnerShort: "Inner Limit",
    chzEarthEquivShort: "Earth Equiv.",
    chzOuterShort: "Outer Limit",

    // Units & Formats
    trillionYrs: "{val} Trillion yrs",
    billionYrs: "{val} Billion yrs",
    millionYrs: "{val} Million yrs",
    yearsUnit: "{val} yrs",
    billionYearsFull: "{val} Billion Years (Gyr)",
    millionYearsFull: "{val} Million Years (Myr)",
    lightYears: "LY",
    solarRadii: "R☉",
    solarLuminosity: "L☉",
    solarMass: "M☉"
  },

  cs: {
    // Header & Meta
    appTitle: "Astrometrie // H–R hvězdná kartografie",
    appSubtitle: "Interaktivní studio Hertzsprungova–Russellova diagramu",
    shipDesignation: "ASTROMETRIE v3.8",
    sensorsOnline: "ONLINE",

    // Navigation Modes
    navExplore: "Průzkum",
    navEvolution: "Vývoj",
    navClusters: "Kupy",
    navCompare: "Srovnání",
    navAcademy: "Akademie",
    navManual: "Návod",
    navDataFeed: "Datové zdroje",
    navLangToggle: "🇬🇧 EN",
    navLangTitle: "Switch to English",

    // Control Panel
    searchHeader: "VYHLEDÁVÁNÍ HVĚZD",
    searchPlaceholder: "Hledat hvězdu (např. Slunce, Sirius, Betelgeuse)...",
    spectralBandpassHeader: "SPEKTRÁLNÍ TŘÍDA",
    sensorOverlaysHeader: "VRSTVY DIAGRAMU",
    toggleHipparcos: "Katalog Hipparcos (6 500 hvězd)",
    toggleRegions: "Astrofyzikální zóny a pás nestability",
    toggleIsoradii: "Izoradiální křivky (konstantní poloměry)",
    toggleLabels: "Popisky hvězd",
    togglePlanetsOnly: "Pouze hvězdy s exoplanetami",
    toggleGaiaFine: "Gaia DR3: jemné struktury (Jao gap)",
    toggleRelativistic: "Relativistické objekty (černé díry)",
    dbStatus: "KATALOG:",
    calibration: "KALIBRACE:",
    stefanBoltzmann: "STEFAN-BOLTZMANN",

    // Circumstellar Habitable Zone (CHZ)
    chzTitle: "CIRKUMSTELÁRNÍ OBYVATELNÁ ZÓNA",
    chzInnerBoundary: "VNITŘNÍ LIMIT",
    chzEarthEquiv: "EKVIVALENT ZEMĚ",
    chzOuterBoundary: "VNĚJŠÍ LIMIT",
    runawayGreenhouse: "Bod varu vody / skleníkový limit",
    maximumGreenhouse: "Bod mrazu / vymrzání CO2",
    flux: "tok",
    zoneHabitable: "KAPALNÁ VODA (OBYVATELNÉ)",
    zoneScorched: "PŘEHŘÁTO (PŘÍLIŠ HORKÉ)",
    zoneFrozen: "ZMRZLÉ (PŘÍLIŠ CHLADNÉ)",
    zoneWarm: "TEPLÝ SKLENÍK",
    zoneCool: "CHLADNÉ JAKO MARS",
    chzEvolutionNotice: "Vývoj planetární soustavy: Sledujte, jak se obyvatelná zóna rozpíná při přechodu do fáze červeného obra a smršťuje u bílého trpaslíka.",
    chzConfirmedNotice: "Potvrzená planetární soustava s {count} exoplanetami z astronomických observatoří.",
    chzTheoreticalNotice: "Hranice obyvatelné zóny podle modelu Kopparapu et al. (2013) z toku Stefan-Boltzmannova zákona.",
    zoomIn: "Přiblížit",
    zoomOut: "Oddálit",
    exoticBadge: "EXOTICKÝ OBJEKT",
    blackHole: "Hvězdná černá díra",
    neutronStar: "Neutronová hvězda / Pulsar",
    sourceLabel: "Zdroje dat",
    hzModelSource: "Model OZ Kopparapu et al. (2013)",
    nasaExoplanetSource: "Archiv exoplanet NASA",

    // Canvas & Coordinates
    axisTemp: "POVRCHOVÁ TEPLOTA T_eff (KELVIN)",
    axisSpectral: "HARVARDSKÁ SPEKTRÁLNÍ KLASIFIKACE",
    axisLum: "LUMINOSITA (L / L☉)",
    axisAbsMag: "ABSOLUTNÍ MAGNITUDA (M_v)",
    hotBlue: "HORKÉ / MODRÉ ◀",
    coolRed: "▶ CHLADNÉ / ČERVENÉ",
    recalibrateBtn: "RESET POHLEDU",
    sectorLabel: "OKOLÍ SLUNCE",
    gridLabel: "GALAKTICKÁ SÍŤ",
    zoomLabel: "PŘIBLÍŽENÍ:",
    panLabel: "POSUN:",

    // Canvas Regions
    regionMainSequence: "HLAVNÍ POSLOUPNOST (TŘÍDA V)",
    regionSupergiants: "VELEOBŘI (TŘÍDA I)",
    regionRedGiants: "ČERVENÍ OBŘI (TŘÍDA III)",
    regionWhiteDwarfs: "BÍLÍ TRPASLÍCI (TŘÍDA D)",
    regionInstabilityStrip: "PÁS NESTABILITY (CEFEIDY / RR LYRAE)",
    regionSubgiants: "PODOBOŘI (TŘÍDA IV)",

    // Constant Radii
    radius0001: "0,001 R☉ (Země / Bílý trpaslík)",
    radius001: "0,01 R☉",
    radius01: "0,1 R☉ (Jupiter / Hnědý trpaslík)",
    radius10: "1,0 R☉ (Sluneční poloměr)",
    radius100: "10 R☉ (Podobr / Jasný)",
    radius1000: "100 R☉ (Červený obr)",
    radius10000: "1000 R☉ (Veleobr / Dráha Jupitera)",

    // Tooltip
    targetAcquired: "CÍL:",
    classLabel: "TŘÍDA:",
    tempLabel: "TEPLOTA:",
    lumLabel: "LUMINOSITA:",
    radiusLabel: "POLOMĚR:",
    tooltipExoplanets: "🪐 {count} EXOPLANETÁRNÍCH TĚLES",
    tooltipClickHint: "KLIKNĚTE PRO ZOBRAZENÍ DETAILU ↗",

    // Star Inspector
    targetLockTitle: "VYBRANÁ HVĚZDA",
    constellationPrefix: "SOUHVĚZDÍ:",
    hzScanHeader: "OBYVATELNÁ ZÓNA A EXOPLANETY",
    liquidH2OZone: "ZÓNA KAPALNÉ VODY",
    exoplanetDetected: "🪐 {count} POTVRZENÝCH EXOPLANET",
    noExoplanets: "ŽÁDNÉ ZNÁMÉ EXOPLANETY",
    astrophysicalMatrix: "ASTROFYZIKÁLNÍ PARAMETRY",
    paramLuminosity: "LUMINOSITA",
    paramRadius: "POLOMĚR",
    paramEstimatedMass: "ODHADOVANÁ HMOTNOST",
    paramAbsMag: "ABS. MAGNITUDA (Mv)",
    paramDistance: "VZDÁLENOST ZE ZEMĚ",
    paramLifetime: "DOBA NA HLAVNÍ POSL.",
    radialPulsationHeader: "RADIÁLNÍ PULZACE",
    radialPulsationText: "Pozorována periodická nestabilita zářivého výkonu s harmonickou periodou pulzací {period} dní.",
    archiveLogHeader: "ASTROFYZIKÁLNÍ POZNÁMKY",
    catalogLinksHeader: "EXTERNÍ KATALOGY A ARCHIVY",
    disengageCompare: "ODEBRAT ZE SROVNÁNÍ",
    engageCompare: "PŘIDAT KE SROVNÁNÍ",
    wikipediaBadge: "WIKIPEDIE",

    // Stellar Evolution Simulator
    evolutionTitle: "Simulátor vývoje hvězd",
    interactiveSimulation: "Interaktivní simulace",
    birthMassLabel: "Počáteční hmotnost:",
    elapsedAge: "Uplynulý věk:",
    photosphereState: "Stav fotosféry",
    effectiveTemp: "Efektivní teplota:",
    luminosity: "Luminosita:",
    radius: "Poloměr:",
    finalRemnant: "Konečný pozůstatek:",
    coreFusionState: "Stav jaderné fúze v jádře",
    activeCoreProcess: "Aktivní proces v jádře:",
    resetToStarBirth: "Vrátit na zrod hvězdy",
    pauseSim: "Pozastavit simulaci",
    playSim: "Přehrát kosmický vývoj",

    // Cluster Age Simulator
    clusterTitle: "Izochrona hvězdných kup a určení věku",
    isochroneBadge: "Izochrona a určování věku",
    realClustersLabel: "Reálné hvězdokupy:",
    clusterAgeLabel: "Věk hvězdokupy:",
    turnoffMass: "Hmotnost bodu obratu",
    turnoffMassSub: "Těžší hvězdy již zanikly",
    turnoffTemp: "Teplota bodu obratu",
    turnoffTempSub: "Povrchová teplota",
    turnoffLum: "Luminosita bodu obratu",
    turnoffLumSub: "Jas v místě zlomu",
    clusterPrincipleTitle: "Astronomický princip:",
    clusterPrincipleText: "Všechny hvězdy v otevřené či kulové hvězdokupě vznikly ze stejné zárodečné mlhoviny prakticky současně. Jelikož masivní hvězdy spalují jaderné palivo exponenciálně rychleji, hlavní posloupnost končí v tzv. „bodu obratu“ (v diagramu vyznačen azurově). Přesnou polohou tohoto ohybu k větvi obrů určují astrofyzici stáří celé kupy!",
    clusterYoung: "Mladá",
    clusterSolarAge: "Sluneční věk",
    clusterGlobular: "Kulová",

    // Comparison Modal
    comparisonTitle: "Srovnávací astrofyzika hvězd",
    clearAll: "Vymazat vše",
    emptyCompareMsg: "Zatím nebyly vybrány žádné hvězdy ke srovnání.",
    emptyCompareSub: "Klikněte na libovolnou hvězdu v diagramu a zvolte „Přidat do srovnání“, nebo vyberte z populárních hvězd níže:",
    photosphereScaleTitle: "Srovnání měřítka fotosfér",
    physicalProperty: "Fyzikální vlastnost",
    spectralClass: "Spektrální třída",
    surfaceTempK: "Povrchová teplota (K)",
    luminositySolar: "Luminosita (L / L☉)",
    radiusSolar: "Poloměr (R / R☉)",
    massSolar: "Hmotnost (M / M☉)",
    habitableZone: "Obyvatelná zóna",
    msLifetime: "Doba na hlavní posl.",
    exoplanets: "Exoplanety",
    externalCatalogues: "Externí katalogy",
    noneDetected: "Nenalezeny",
    planetsCount: "planet(y)",

    // Educational Guide
    guideTitle: "Průvodce astrofyzikou: Hertzsprungův–Russellův diagram",
    guideSec1Title: "1. Rosettská deska stelární astronomie",
    guideSec1P1: "Diagram, který kolem roku 1910 nezávisle sestavili dánský astronom Ejnar Hertzsprung a americký astronom Henry Norris Russell, představuje nejdůležitější diagnostický nástroj moderní astrofyziky.",
    guideSec1P2: "Zachycuje závislost zářivého výkonu (luminosity) hvězdy na její efektivní povrchové teplotě (či spektrálním typu). Vynesením hvězd do této roviny lze okamžitě vyčíst jejich vnitřní fyzikální stav, věk i budoucí osud.",
    guideSec2Title: "2. Proč je osa teploty obrácená?",
    guideSec2P1: "Všimněte si, že vodorovná osa směřuje od 45 000 K (horké / modré) vlevo k 2 000 K (chladné / červené) vpravo.",
    guideSec2P2: "Tato historická zvyklost pochází z počátků astrofotografie: astronomové klasifikovali hvězdy pomocí barevného indexu (B - V). Horké modré hvězdy mají záporné či nízké hodnoty B - V, proto byly umisťovány vlevo. Když byly později naměřeny skutečné teploty, konvence zůstala zachována!",
    guideSec3Title: "3. Čtyři hlavní větve hvězdného diagramu",
    guideBranchMS: "Hlavní posloupnost (třída V)",
    guideBranchMSDesc: "Výrazný diagonální pás táhnoucí se z horkého levého horního rohu do chladného pravého dolního rohu. Hvězdy zde (včetně našeho Slunce) jsou v hydrostatické rovnováze a stabilně spalují vodík na helium. Hvězdy zde tráví ~90 % svého aktivního života.",
    guideBranchRG: "Červení obři (třída III a IV)",
    guideBranchRGDesc: "Oblast vpravo nahoře. Po vyčerpání vodíku v jádře se heliové jádro smršťuje a zahřívá, což způsobí nafouknutí vnějšího obalu na desítky až stovky původních poloměrů a ochlazení do oranžových a červených odstínů.",
    guideBranchSG: "Veleobři (třída I)",
    guideBranchSGDesc: "Nejvyšší patro diagramu. Extrémně masivní hvězdy (> 8 M☉) se zářivými výkony dosahujícími statisíců Sluncí. Palivo spalují bleskově a své životy zakončují jako kataklyzmatické supernovy.",
    guideBranchWD: "Bílí trpaslíci (třída D)",
    guideBranchWDDesc: "Levý dolní roh: vysoké povrchové teploty, ale nepatrný zářivý výkon daný jejich kompaktní velikostí (srovnatelnou se Zemí). Jde o obnažená degenerovaná jádra vyhaslých hvězd, která pomalu chladnou po biliony let.",
    guideSec4Title: "4. Stefanův–Boltzmannův zákon: Odvození poloměru",
    guideSec4P1: "Každá hvězda vyzařuje energii v souladu se Stefanovým–Boltzmannovým zákonem:",
    guideSec4P2: "Z toho plyne, že diagonální linie probíhající zleva nahoře doprava dolů jsou liniemi konstantního poloměru! Hvězda vpravo nahoře má obrovskou svítivost navzdory nízké teplotě, takže její povrch (R²) musí být gigantický (červený veleobr). Naopak bílý trpaslík vlevo dole je žhavý, ale slabý, což dokazuje jeho kompaktnost.",

    // Attribution Modal
    attributionTitle: "Astronomické datové zdroje a citace",
    primaryCatalogTitle: "Primární katalog: {name} (v{version})",
    compiledBy: "Sestavil a spravuje {compiler}. Šířeno pod licencí {license}.",
    formalCitation: "Formální citace:",
    githubRepo: "GitHub repozitář Astronexus",
    codebergRepo: "Codeberg projekt Astronexus",
    constituentSources: "Dílčí astrofyzikální datové katalogy",
    authorAcademicTitle: "Autor a akademický projekt",
    authorAcademicDesc: "Vytvořil Richard Lipka jako interaktivní astrofyzikální a hvězdný kartografický simulátor. Určeno pro výuku astronomie, demonstrace výpočetní astrofyziky a interaktivní zkoumání stelárních vlastností.",
    authorHomepageLink: "Osobní stránka Richarda Lipky (home.zcu.cz/~lipka)",
    dataPhilosophyNote: "Poznámka k architektuře dat: Veškerá souřadnicová, fotometrická i fyzikální data hvězd jsou zcela oddělena od kódu rozhraní. Datové soubory jsou uloženy v adresáři /public/data/ a načítány asynchronně za běhu.",

    // Astrometrics Academy
    academyTitle: "Astrometrická akademie",
    academySubtitle: "Osvojte si hvězdnou kartografii prostřednictvím praktických astrofyzikálních úkolů.",
    missionLabel: "Úkol",
    missionsCompleted: "splněno",
    currentSelectedTarget: "Vybraná hvězda:",
    criteriaMet: "Kritéria splněna! Úkol úspěšně dokončen!",
    selectStarHint: "Klikněte na hvězdu v H–R diagramu a ověřte její parametry vůči zadání úkolu.",
    showHint: "Zobrazit nápovědu",
    resetMissions: "Resetovat postup",
    mission1Title: "Sluneční dvojče",
    mission1Desc: "Vyhledejte na hlavní posloupnosti žlutého trpaslíka třídy G s povrchovou teplotou a zářivostí srovnatelnou se Sluncem (T ≈ 5 400–6 100 K, L ≈ 0,7–1,5 L☉).",
    mission2Title: "Hledač obyvatelných světů",
    mission2Desc: "Najděte hvězdu s potvrzenými exoplanetami obíhajícími v její cirkumstelární obyvatelné zóně.",
    mission3Title: "Hřbitov bílých trpaslíků",
    mission3Desc: "Najděte kompaktní stelární zbytek (bílý trpaslík, třída D), který odvrhl svou obálku a smrštil se do rozměrů Země (R < 0,03 R☉).",

    // SIMBAD & CDS Aladin Telemetry
    simbadSkyCutout: "Reálný snímek SIMBAD",
    photosphereModel: "Model fotosféry",
    queryingSimbad: "Dotazuji CDS Štrasburk",
    simbadClass: "Třída SIMBAD",
    simbadPlx: "Paralaxa",
    simbadRv: "Radiální rychlost",

    // Footer & Academic Affiliation
    footerDepartment: "Katedra informatiky a výpočetní techniky (KIV)",
    footerFaculty: "Fakulta aplikovaných věd",
    footerUniversity: "Západočeská univerzita v Plzni",
    footerAuthorLabel: "Autor a garant projektu",
    footerMission: "Interaktivní simulátor stelární astrofyziky a hvězdné kartografie",

    // Compact Habitable Zone Labels
    chzInnerShort: "Vnitřní mez",
    chzEarthEquivShort: "Země-ekviv.",
    chzOuterShort: "Vnější mez",

    // Units & Formats
    trillionYrs: "{val} bilionů let",
    billionYrs: "{val} mld. let",
    millionYrs: "{val} mil. let",
    yearsUnit: "{val} let",
    billionYearsFull: "{val} miliard let (Gyr)",
    millionYearsFull: "{val} milionů let (Myr)",
    lightYears: "sv. let",
    solarRadii: "R☉",
    solarLuminosity: "L☉",
    solarMass: "M☉"
  }
};

/**
 * Format stellar main-sequence lifetime in selected language.
 */
export function formatLifetimeLocalized(massSolar, lang = 'en') {
  if (!massSolar || massSolar <= 0) return lang === 'cs' ? 'Neznámá' : 'Unknown';
  const years = 10e9 * Math.pow(massSolar, -2.5);

  if (years >= 1e12) {
    const val = (years / 1e12).toFixed(1);
    return lang === 'cs' ? `${val} bilionů let` : `${val} Trillion yrs`;
  } else if (years >= 1e9) {
    const val = (years / 1e9).toFixed(2);
    return lang === 'cs' ? `${val} mld. let` : `${val} Billion yrs`;
  } else if (years >= 1e6) {
    const val = (years / 1e6).toFixed(1);
    return lang === 'cs' ? `${val} mil. let` : `${val} Million yrs`;
  } else {
    const val = Math.round(years).toLocaleString();
    return lang === 'cs' ? `${val} let` : `${val} yrs`;
  }
}

/**
 * Format cosmic age in selected language.
 */
export function formatAgeLocalized(years, lang = 'en') {
  if (years >= 1e9) {
    const val = (years / 1e9).toFixed(2);
    return lang === 'cs' ? `${val} miliard let` : `${val} Billion Years`;
  }
  if (years >= 1e6) {
    const val = (years / 1e6).toFixed(1);
    return lang === 'cs' ? `${val} milionů let` : `${val} Million Years`;
  }
  const val = Math.round(years).toLocaleString();
  return lang === 'cs' ? `${val} let` : `${val} Years`;
}

/**
 * Translate evolutionary stage label.
 */
export function translateStage(stageName, lang = 'en') {
  if (!stageName) return '';
  if (lang === 'en') return stageName;

  const stageMap = {
    "supernova": "Supernova (kolaps jádra)",
    "black hole": "Hvězdná černá díra",
    "neutron star": "Neutronová hvězda",
    "pulsar": "Pulsar (neutronová hvězda)",
    "planetary nebula": "Planetární mlhovina & bílý trpaslík",
    "helium flash": "Heliový záblesk & horizontální větev",
    "horizontal branch": "Horizontální větev (fúze helia)",
    "asymptotic giant": "Asymptotická větev obrů (AGB)",
    "tip of rgb": "Vrchol větve červených obrů (RGB Tip)",
    "terminal-age": "Konec hlavní posloupnosti (TAMS)",
    "tams": "Konec hlavní posloupnosti (TAMS)",
    "zero-age": "Nulový věk hlavní posloupnosti (ZAMS)",
    "zams": "Nulový věk hlavní posloupnosti (ZAMS)",
    "hayashi": "Protohvězda (Hayashiho stopa)",
    "current solar": "Současný stav Slunce (4,6 mld. let)",
    "blue supergiant": "Modrý veleobr",
    "red supergiant": "Červený veleobr",
    "supergiant": "Veleobr",
    "red giant": "Červený obr",
    "subgiant": "Podobr",
    "white dwarf": "Bílý trpaslík",
    "red dwarf": "Červený trpaslík",
    "hypergiant": "Hyperobr",
    "protostar": "Protohvězda",
    "wolf-rayet": "Wolfova–Rayetova hvězda",
    "brown dwarf": "Hnědý trpaslík",
    "main sequence": "Hlavní posloupnost",
    "cepheid": "Cefeida",
    "rr lyrae": "RR Lyrae proměnná"
  };

  const lower = stageName.toLowerCase().trim();
  for (const [key, csLabel] of Object.entries(stageMap)) {
    if (lower.includes(key)) return csLabel;
  }
  return stageName;
}
