import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Curated list of famous, notable, and representative stars
const famousStars = [
  {
    id: "sun",
    name: "Sun (Sol)",
    bayer: "Sol",
    constellation: "None",
    spectralType: "G2V",
    temp: 5778,
    lum: 1.0,
    absMag: 4.83,
    b_v: 0.65,
    mass: 1.0,
    radius: 1.0,
    distance_ly: 0.0000158,
    luminosityClass: "V",
    evolutionaryStage: "Main Sequence (Yellow Dwarf)",
    hasExoplanets: true,
    exoplanetCount: 8,
    notableFacts: "Our home star! Currently fusing hydrogen into helium via the proton-proton chain; has been on the main sequence for ~4.6 billion years.",
    pulsationPeriodDays: null
  },
  {
    id: "sirius_a",
    name: "Sirius A",
    bayer: "Alpha Canis Majoris A",
    constellation: "Canis Major",
    spectralType: "A1V",
    temp: 9940,
    lum: 25.4,
    absMag: 1.42,
    b_v: 0.00,
    mass: 2.06,
    radius: 1.71,
    distance_ly: 8.6,
    luminosityClass: "V",
    evolutionaryStage: "Main Sequence",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The brightest star in Earth's night sky. Part of a binary system with a white dwarf companion (Sirius B).",
    pulsationPeriodDays: null
  },
  {
    id: "sirius_b",
    name: "Sirius B (The Pup)",
    bayer: "Alpha Canis Majoris B",
    constellation: "Canis Major",
    spectralType: "DA2",
    temp: 25200,
    lum: 0.056,
    absMag: 11.18,
    b_v: -0.03,
    mass: 1.02,
    radius: 0.0084,
    distance_ly: 8.6,
    luminosityClass: "D",
    evolutionaryStage: "White Dwarf",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "One of the first white dwarfs discovered. Earth-sized but contains the mass of the entire Sun, leading to extreme surface gravity.",
    pulsationPeriodDays: null
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    bayer: "Alpha Orionis",
    constellation: "Orion",
    spectralType: "M1-M2Ia-ab",
    temp: 3500,
    lum: 126000,
    absMag: -5.85,
    b_v: 1.85,
    mass: 16.5,
    radius: 764,
    distance_ly: 548,
    luminosityClass: "I",
    evolutionaryStage: "Red Supergiant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "A colossal red supergiant nearing the end of its life. If placed at the center of our solar system, its surface would engulf the orbit of Jupiter!",
    pulsationPeriodDays: 420
  },
  {
    id: "rigel",
    name: "Rigel",
    bayer: "Beta Orionis",
    constellation: "Orion",
    spectralType: "B8Ia",
    temp: 12100,
    lum: 120000,
    absMag: -7.84,
    b_v: -0.03,
    mass: 21.0,
    radius: 78.9,
    distance_ly: 860,
    luminosityClass: "I",
    evolutionaryStage: "Blue Supergiant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "Luminous blue supergiant star in Orion; outshines the Sun by over 100,000 times.",
    pulsationPeriodDays: null
  },
  {
    id: "vega",
    name: "Vega",
    bayer: "Alpha Lyrae",
    constellation: "Lyra",
    spectralType: "A0V",
    temp: 9602,
    lum: 40.1,
    absMag: 0.58,
    b_v: 0.00,
    mass: 2.13,
    radius: 2.36,
    distance_ly: 25.0,
    luminosityClass: "V",
    evolutionaryStage: "Main Sequence",
    hasExoplanets: true,
    exoplanetCount: 1,
    notableFacts: "Historical baseline star used to define 0 magnitude and 0 color index (B-V = 0.00). Features a prominent circumstellar dust disk.",
    pulsationPeriodDays: null
  },
  {
    id: "proxima_centauri",
    name: "Proxima Centauri",
    bayer: "Alpha Centauri C",
    constellation: "Centaurus",
    spectralType: "M5.5Ve",
    temp: 3042,
    lum: 0.0017,
    absMag: 15.60,
    b_v: 1.82,
    mass: 0.122,
    radius: 0.154,
    distance_ly: 4.24,
    luminosityClass: "V",
    evolutionaryStage: "Red Dwarf",
    hasExoplanets: true,
    exoplanetCount: 3,
    notableFacts: "The closest known star to the Solar System. Hosts Proxima Centauri b, a terrestrial planet in its circumstellar habitable zone.",
    pulsationPeriodDays: null
  },
  {
    id: "alpha_centauri_a",
    name: "Alpha Centauri A (Rigil Kentaurus)",
    bayer: "Alpha Centauri A",
    constellation: "Centaurus",
    spectralType: "G2V",
    temp: 5790,
    lum: 1.519,
    absMag: 4.38,
    b_v: 0.69,
    mass: 1.10,
    radius: 1.22,
    distance_ly: 4.37,
    luminosityClass: "V",
    evolutionaryStage: "Main Sequence",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "A solar analog star, almost identical in spectral class and temperature to our Sun, only 4.37 light-years away.",
    pulsationPeriodDays: null
  },
  {
    id: "alpha_centauri_b",
    name: "Alpha Centauri B (Toliman)",
    bayer: "Alpha Centauri B",
    constellation: "Centaurus",
    spectralType: "K1V",
    temp: 5260,
    lum: 0.50,
    absMag: 5.71,
    b_v: 0.88,
    mass: 0.91,
    radius: 0.86,
    distance_ly: 4.37,
    luminosityClass: "V",
    evolutionaryStage: "Main Sequence (Orange Dwarf)",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "Companion to Alpha Centauri A, slightly cooler and orange-hued.",
    pulsationPeriodDays: null
  },
  {
    id: "arcturus",
    name: "Arcturus",
    bayer: "Alpha Boötis",
    constellation: "Boötes",
    spectralType: "K0III",
    temp: 4286,
    lum: 170,
    absMag: -0.30,
    b_v: 1.23,
    mass: 1.08,
    radius: 25.4,
    distance_ly: 36.7,
    luminosityClass: "III",
    evolutionaryStage: "Red Giant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The brightest star in the northern celestial hemisphere. A preview of what our Sun will look like in ~5 billion years when it enters the red giant phase.",
    pulsationPeriodDays: null
  },
  {
    id: "aldebaran",
    name: "Aldebaran",
    bayer: "Alpha Tauri",
    constellation: "Taurus",
    spectralType: "K5III",
    temp: 3900,
    lum: 439,
    absMag: -0.63,
    b_v: 1.54,
    mass: 1.16,
    radius: 44.1,
    distance_ly: 65.3,
    luminosityClass: "III",
    evolutionaryStage: "Red Giant",
    hasExoplanets: true,
    exoplanetCount: 1,
    notableFacts: "The 'Eye of Taurus', an evolved orange giant that has exhausted core hydrogen and expanded to over 40 solar radii.",
    pulsationPeriodDays: null
  },
  {
    id: "polaris",
    name: "Polaris (North Star)",
    bayer: "Alpha Ursae Minoris",
    constellation: "Ursa Minor",
    spectralType: "F7Ib",
    temp: 6015,
    lum: 1260,
    absMag: -3.64,
    b_v: 0.60,
    mass: 5.4,
    radius: 37.5,
    distance_ly: 433,
    luminosityClass: "I",
    evolutionaryStage: "Classical Cepheid (Supergiant)",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "Earth's current northern pole star. Located inside the Instability Strip, Polaris pulsates with a period of ~3.97 days.",
    pulsationPeriodDays: 3.97
  },
  {
    id: "antares",
    name: "Antares",
    bayer: "Alpha Scorpii",
    constellation: "Scorpius",
    spectralType: "M1.5Iab",
    temp: 3660,
    lum: 75900,
    absMag: -5.28,
    b_v: 1.83,
    mass: 12.0,
    radius: 680,
    distance_ly: 550,
    luminosityClass: "I",
    evolutionaryStage: "Red Supergiant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The 'Heart of the Scorpion', distinct for its fiery ruby-red color. A slow irregular variable supergiant.",
    pulsationPeriodDays: 300
  },
  {
    id: "spica",
    name: "Spica",
    bayer: "Alpha Virginis",
    constellation: "Virgo",
    spectralType: "B1III-IV",
    temp: 25300,
    lum: 20500,
    absMag: -3.55,
    b_v: -0.23,
    mass: 11.4,
    radius: 7.47,
    distance_ly: 250,
    luminosityClass: "III",
    evolutionaryStage: "Blue Giant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "A massive, extremely hot blue giant rotating so quickly and orbiting so closely with its companion that both are distorted into egg shapes.",
    pulsationPeriodDays: 0.17
  },
  {
    id: "deneb",
    name: "Deneb",
    bayer: "Alpha Cygni",
    constellation: "Cygnus",
    spectralType: "A2Ia",
    temp: 8525,
    lum: 196000,
    absMag: -8.38,
    b_v: 0.09,
    mass: 19.0,
    radius: 203,
    distance_ly: 2600,
    luminosityClass: "I",
    evolutionaryStage: "White Supergiant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "One of the most intrinsically luminous first-magnitude stars visible to the human eye, shining with the power of nearly 200,000 Suns.",
    pulsationPeriodDays: null
  },
  {
    id: "canopus",
    name: "Canopus",
    bayer: "Alpha Carinae",
    constellation: "Carina",
    spectralType: "A9II",
    temp: 7400,
    lum: 10700,
    absMag: -5.71,
    b_v: 0.15,
    mass: 8.0,
    radius: 71,
    distance_ly: 310,
    luminosityClass: "II",
    evolutionaryStage: "Bright Giant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The second brightest star in the night sky. Widely used for spacecraft attitude control and celestial navigation.",
    pulsationPeriodDays: null
  },
  {
    id: "procyon_a",
    name: "Procyon A",
    bayer: "Alpha Canis Minoris A",
    constellation: "Canis Minor",
    spectralType: "F5IV-V",
    temp: 6530,
    lum: 6.93,
    absMag: 2.66,
    b_v: 0.42,
    mass: 1.50,
    radius: 2.05,
    distance_ly: 11.46,
    luminosityClass: "IV",
    evolutionaryStage: "Subgiant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "A subgiant star just beginning to expand off the main sequence as hydrogen fusion starts exhausting in its core.",
    pulsationPeriodDays: null
  },
  {
    id: "procyon_b",
    name: "Procyon B",
    bayer: "Alpha Canis Minoris B",
    constellation: "Canis Minor",
    spectralType: "DQZ",
    temp: 7740,
    lum: 0.00049,
    absMag: 13.04,
    b_v: 0.35,
    mass: 0.60,
    radius: 0.012,
    distance_ly: 11.46,
    luminosityClass: "D",
    evolutionaryStage: "White Dwarf",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "Faint white dwarf companion to Procyon A.",
    pulsationPeriodDays: null
  },
  {
    id: "pollux",
    name: "Pollux",
    bayer: "Beta Geminorum",
    constellation: "Gemini",
    spectralType: "K0III",
    temp: 4666,
    lum: 32.7,
    absMag: 1.08,
    b_v: 1.00,
    mass: 1.91,
    radius: 8.8,
    distance_ly: 33.78,
    luminosityClass: "III",
    evolutionaryStage: "Red Giant",
    hasExoplanets: true,
    exoplanetCount: 1,
    notableFacts: "The closest giant star to the Sun and the brightest star known to host an extrasolar planet (Thestias / Pollux b).",
    pulsationPeriodDays: null
  },
  {
    id: "castor_a",
    name: "Castor A",
    bayer: "Alpha Geminorum A",
    constellation: "Gemini",
    spectralType: "A1V",
    temp: 10286,
    lum: 30.0,
    absMag: 1.33,
    b_v: 0.04,
    mass: 2.76,
    radius: 2.4,
    distance_ly: 51.6,
    luminosityClass: "V",
    evolutionaryStage: "Main Sequence",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "Part of a remarkable sextuple star system made of three pairs of spectroscopic binaries.",
    pulsationPeriodDays: null
  },
  {
    id: "mira",
    name: "Mira (Omicron Ceti)",
    bayer: "Omicron Ceti",
    constellation: "Cetus",
    spectralType: "M7IIIe",
    temp: 2900,
    lum: 8400,
    absMag: -1.0,
    b_v: 1.60,
    mass: 1.18,
    radius: 332,
    distance_ly: 300,
    luminosityClass: "III",
    evolutionaryStage: "Asymptotic Giant Branch (AGB)",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The prototype for Mira variable stars. Undergoes massive thermal pulsations, changing apparent brightness by over 1,500x during a 332-day cycle.",
    pulsationPeriodDays: 332
  },
  {
    id: "barnard",
    name: "Barnard's Star",
    bayer: "GJ 699",
    constellation: "Ophiuchus",
    spectralType: "M4V",
    temp: 3134,
    lum: 0.0033,
    absMag: 13.25,
    b_v: 1.74,
    mass: 0.144,
    radius: 0.196,
    distance_ly: 5.96,
    luminosityClass: "V",
    evolutionaryStage: "Red Dwarf",
    hasExoplanets: true,
    exoplanetCount: 1,
    notableFacts: "Possesses the largest known proper motion of any star relative to our Sun (~10.3 arcseconds per year).",
    pulsationPeriodDays: null
  },
  {
    id: "trappist1",
    name: "TRAPPIST-1",
    bayer: "2MASS J23062928-0502285",
    constellation: "Aquarius",
    spectralType: "M8V",
    temp: 2566,
    lum: 0.00055,
    absMag: 18.4,
    b_v: 2.10,
    mass: 0.089,
    radius: 0.121,
    distance_ly: 40.66,
    luminosityClass: "V",
    evolutionaryStage: "Ultra-cool Red Dwarf",
    hasExoplanets: true,
    exoplanetCount: 7,
    notableFacts: "Famous ultra-cool red dwarf hosting 7 Earth-sized terrestrial planets, several orbiting in the star's habitable zone.",
    pulsationPeriodDays: null
  },
  {
    id: "vy_cma",
    name: "VY Canis Majoris",
    bayer: "VY CMa",
    constellation: "Canis Major",
    spectralType: "M5eIa",
    temp: 3490,
    lum: 270000,
    absMag: -7.5,
    b_v: 2.05,
    mass: 17.0,
    radius: 1420,
    distance_ly: 3900,
    luminosityClass: "I",
    evolutionaryStage: "Extreme Red Hypergiant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "One of the largest known stars by volume, with a radius exceeding 1,400 times that of the Sun. Light takes over 6.5 hours just to travel around its circumference!",
    pulsationPeriodDays: null
  },
  {
    id: "eta_carinae",
    name: "Eta Carinae",
    bayer: "Eta Carinae",
    constellation: "Carina",
    spectralType: "LBV",
    temp: 37000,
    lum: 5000000,
    absMag: -8.6,
    b_v: 0.35,
    mass: 100.0,
    radius: 60,
    distance_ly: 7500,
    luminosityClass: "I",
    evolutionaryStage: "Luminous Blue Variable (Hypergiant)",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "One of the most massive and unstable stellar systems in the galaxy, shining with 5 million times the Sun's brightness. Expected to erupt in a hypernova/supernova.",
    pulsationPeriodDays: null
  },
  {
    id: "wolf_359",
    name: "Wolf 359",
    bayer: "CN Leonis",
    constellation: "Leo",
    spectralType: "M6.5V",
    temp: 2800,
    lum: 0.0014,
    absMag: 16.65,
    b_v: 2.01,
    mass: 0.09,
    radius: 0.16,
    distance_ly: 7.9,
    luminosityClass: "V",
    evolutionaryStage: "Red Dwarf (Flare Star)",
    hasExoplanets: true,
    exoplanetCount: 2,
    notableFacts: "One of the nearest stars to Earth and an active flare star that undergoes sudden dramatic increases in brightness.",
    pulsationPeriodDays: null
  },
  {
    id: "achernar",
    name: "Achernar",
    bayer: "Alpha Eridani",
    constellation: "Eridanus",
    spectralType: "B6Vep",
    temp: 15000,
    lum: 3150,
    absMag: -2.77,
    b_v: -0.16,
    mass: 6.7,
    radius: 7.3,
    distance_ly: 139,
    luminosityClass: "V",
    evolutionaryStage: "Main Sequence (Fast Rotator)",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The least spherical star known in the Milky Way! It spins so fast (250 km/s) that its equatorial diameter is 56% greater than its polar diameter.",
    pulsationPeriodDays: null
  },
  {
    id: "bellatrix",
    name: "Bellatrix",
    bayer: "Gamma Orionis",
    constellation: "Orion",
    spectralType: "B2III",
    temp: 22000,
    lum: 9210,
    absMag: -2.78,
    b_v: -0.22,
    mass: 8.6,
    radius: 5.75,
    distance_ly: 250,
    luminosityClass: "III",
    evolutionaryStage: "Blue Giant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The 'Amazon Star', marking Orion's left shoulder. An intensely luminous blue giant.",
    pulsationPeriodDays: null
  },
  {
    id: "mu_cephei",
    name: "Mu Cephei (Herschel's Garnet Star)",
    bayer: "Mu Cephei",
    constellation: "Cepheus",
    spectralType: "M2Ia",
    temp: 3750,
    lum: 283000,
    absMag: -7.0,
    b_v: 2.25,
    mass: 19.2,
    radius: 1260,
    distance_ly: 2840,
    luminosityClass: "I",
    evolutionaryStage: "Red Supergiant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "William Herschel named it the 'Garnet Star' due to its magnificent deep ruby red appearance through a telescope.",
    pulsationPeriodDays: 730
  },
  {
    id: "kepler_186",
    name: "Kepler-186",
    bayer: "KOI-571",
    constellation: "Cygnus",
    spectralType: "M1V",
    temp: 3788,
    lum: 0.041,
    absMag: 8.7,
    b_v: 1.48,
    mass: 0.54,
    radius: 0.52,
    distance_ly: 582,
    luminosityClass: "V",
    evolutionaryStage: "Main Sequence (Red Dwarf)",
    hasExoplanets: true,
    exoplanetCount: 5,
    notableFacts: "Hosts Kepler-186f, the first confirmed Earth-sized planet found in the habitable zone of another star.",
    pulsationPeriodDays: null
  },
  {
    id: "51_pegasi",
    name: "51 Pegasi (Helvetios)",
    bayer: "51 Pegasi",
    constellation: "Pegasus",
    spectralType: "G2IV",
    temp: 5790,
    lum: 1.30,
    absMag: 4.51,
    b_v: 0.67,
    mass: 1.11,
    radius: 1.24,
    distance_ly: 50.45,
    luminosityClass: "IV",
    evolutionaryStage: "Subgiant / Solar Analog",
    hasExoplanets: true,
    exoplanetCount: 1,
    notableFacts: "Historical landmark: Hosts 51 Pegasi b (Dimidium), the first exoplanet discovered orbiting a sun-like main-sequence star (1995, Nobel Prize 2019).",
    pulsationPeriodDays: null
  },
  {
    id: "delta_cephei",
    name: "Delta Cephei",
    bayer: "Delta Cephei",
    constellation: "Cepheus",
    spectralType: "F5Ib-G1Ib",
    temp: 5800,
    lum: 2000,
    absMag: -3.47,
    b_v: 0.65,
    mass: 4.5,
    radius: 44.5,
    distance_ly: 887,
    luminosityClass: "I",
    evolutionaryStage: "Classical Cepheid Variable",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The prototype Cepheid variable star. Henrietta Leavitt's discovery of the period-luminosity relation in Cepheids revolutionized cosmic distance measurements.",
    pulsationPeriodDays: 5.366
  },
  {
    id: "alnitak",
    name: "Alnitak",
    bayer: "Zeta Orionis",
    constellation: "Orion",
    spectralType: "O9.7Ib",
    temp: 29500,
    lum: 250000,
    absMag: -6.0,
    b_v: -0.21,
    mass: 33.0,
    radius: 20.0,
    distance_ly: 1260,
    luminosityClass: "I",
    evolutionaryStage: "Blue Supergiant",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The easternmost star of Orion's Belt; illuminates the famous Flame Nebula and Horsehead Nebula.",
    pulsationPeriodDays: null
  },
  {
    id: "van_maanen",
    name: "Van Maanen's Star",
    bayer: "Gl 35",
    constellation: "Pisces",
    spectralType: "DZ9",
    temp: 6770,
    lum: 0.00017,
    absMag: 14.21,
    b_v: 0.56,
    mass: 0.68,
    radius: 0.011,
    distance_ly: 14.1,
    luminosityClass: "D",
    evolutionaryStage: "Solitary White Dwarf",
    hasExoplanets: false,
    exoplanetCount: 0,
    notableFacts: "The nearest solitary white dwarf to the Solar System not in a binary system.",
    pulsationPeriodDays: null
  }
];

// Helper to generate realistic background population (~3,800 stars)
// Distributes along Main Sequence, Giant Branch, Supergiants, and White Dwarfs
function generateStellarPopulation(count = 3800) {
  const stars = [];

  // Helper random normal
  function randn(mean = 0, std = 1) {
    let u1 = Math.random();
    let u2 = Math.random();
    while (u1 === 0) u1 = Math.random();
    return mean + std * Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  // 1. MAIN SEQUENCE (~78% of stars)
  const msCount = Math.floor(count * 0.78);
  for (let i = 0; i < msCount; i++) {
    // IMF power law favoring lower mass stars
    const u = Math.random();
    // Mass from 0.08 to 35 Solar Masses
    const mass = 0.08 * Math.pow(1 - u + u * Math.pow(35 / 0.08, -1.35), -1 / 1.35);

    // Approximate Mass-Luminosity relation for Main Sequence
    let lum;
    if (mass < 0.43) {
      lum = 0.23 * Math.pow(mass, 2.3);
    } else if (mass < 2.0) {
      lum = Math.pow(mass, 4.0);
    } else if (mass < 20.0) {
      lum = 1.4 * Math.pow(mass, 3.5);
    } else {
      lum = 32000 * (mass / 20.0);
    }

    // Mass-Radius relation on Main Sequence
    let radius = mass < 1.0 ? Math.pow(mass, 0.8) : Math.pow(mass, 0.57);

    // Stefan-Boltzmann Law: T = (L / R^2)^(1/4) * T_sun
    let temp = Math.pow(lum / Math.pow(radius, 2), 0.25) * 5778;

    // Add natural astrophysical scatter
    temp *= (1 + randn(0, 0.04));
    lum *= Math.exp(randn(0, 0.18));
    temp = Math.max(2200, Math.min(42000, temp));

    // Calculate B-V from effective temperature (Ballesteros formula approximation)
    const logT = Math.log10(temp);
    const b_v = (logT > 3.9) 
      ? -0.3 + 1.6 * (4.5 - logT) 
      : -0.4 + 1.8 * (4.2 - logT) + randn(0, 0.05);

    // Absolute visual magnitude: M_V = 4.83 - 2.5 * log10(L)
    const absMag = 4.83 - 2.5 * Math.log10(lum);

    let specClass = "G";
    if (temp >= 30000) specClass = "O";
    else if (temp >= 10000) specClass = "B";
    else if (temp >= 7500) specClass = "A";
    else if (temp >= 6000) specClass = "F";
    else if (temp >= 5200) specClass = "G";
    else if (temp >= 3700) specClass = "K";
    else specClass = "M";

    stars.push([
      Math.round(temp),
      parseFloat(lum.toPrecision(3)),
      parseFloat(b_v.toFixed(2)),
      parseFloat(absMag.toFixed(2)),
      specClass,
      "V",
      null,
      parseFloat(mass.toFixed(2)),
      parseFloat(radius.toFixed(2))
    ]);
  }

  // 2. RED GIANTS & SUBGIANTS (~14% of stars)
  const giantCount = Math.floor(count * 0.14);
  for (let i = 0; i < giantCount; i++) {
    // Red Giant temperatures typically 3,200K - 5,100K
    const temp = 3300 + Math.random() * 1800 + randn(0, 80);
    // Luminosity from 15 L_sun to 4,000 L_sun
    const lum = Math.pow(10, 1.2 + Math.random() * 2.4 + randn(0, 0.15));
    const absMag = 4.83 - 2.5 * Math.log10(lum);
    const b_v = 0.9 + Math.random() * 0.9 + randn(0, 0.05);
    const radius = Math.sqrt(lum) * Math.pow(5778 / temp, 2);
    const mass = 0.9 + Math.random() * 2.2;

    const lumClass = lum > 80 ? "III" : "IV";
    const specClass = temp > 4800 ? "G" : (temp > 3700 ? "K" : "M");

    stars.push([
      Math.round(temp),
      parseFloat(lum.toPrecision(3)),
      parseFloat(b_v.toFixed(2)),
      parseFloat(absMag.toFixed(2)),
      specClass,
      lumClass,
      null,
      parseFloat(mass.toFixed(2)),
      parseFloat(radius.toFixed(2))
    ]);
  }

  // 3. WHITE DWARFS (~6% of stars)
  const wdCount = Math.floor(count * 0.06);
  for (let i = 0; i < wdCount; i++) {
    // Hot surface but tiny radius (~0.01 R_sun)
    const temp = 6000 + Math.random() * 24000 + randn(0, 800);
    const radius = 0.008 + Math.random() * 0.006;
    const lum = Math.pow(radius, 2) * Math.pow(temp / 5778, 4);
    const absMag = 4.83 - 2.5 * Math.log10(lum);
    const b_v = -0.15 + (1 - temp / 30000) * 0.6 + randn(0, 0.04);
    const mass = 0.5 + Math.random() * 0.5;

    stars.push([
      Math.round(temp),
      parseFloat(lum.toPrecision(3)),
      parseFloat(b_v.toFixed(2)),
      parseFloat(absMag.toFixed(2)),
      "D",
      "D",
      null,
      parseFloat(mass.toFixed(2)),
      parseFloat(radius.toFixed(3))
    ]);
  }

  // 4. SUPERGIANTS (~2% of stars)
  const superCount = Math.floor(count * 0.02);
  for (let i = 0; i < superCount; i++) {
    const isBlue = Math.random() > 0.45;
    let temp, lum, specClass;
    if (isBlue) {
      temp = 11000 + Math.random() * 26000;
      lum = Math.pow(10, 4.3 + Math.random() * 1.5);
      specClass = temp > 28000 ? "O" : "B";
    } else {
      temp = 3100 + Math.random() * 1800;
      lum = Math.pow(10, 4.0 + Math.random() * 1.6);
      specClass = temp > 4000 ? "K" : "M";
    }
    const absMag = 4.83 - 2.5 * Math.log10(lum);
    const b_v = isBlue ? -0.2 + Math.random() * 0.3 : 1.3 + Math.random() * 0.8;
    const radius = Math.sqrt(lum) * Math.pow(5778 / temp, 2);
    const mass = 12.0 + Math.random() * 35.0;

    stars.push([
      Math.round(temp),
      parseFloat(lum.toPrecision(3)),
      parseFloat(b_v.toFixed(2)),
      parseFloat(absMag.toFixed(2)),
      specClass,
      "I",
      null,
      parseFloat(mass.toFixed(2)),
      parseFloat(radius.toFixed(1))
    ]);
  }

  return stars;
}

const population = generateStellarPopulation(4000);

const dataDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'famousStars.json'), JSON.stringify(famousStars, null, 2));
fs.writeFileSync(path.join(dataDir, 'stellarPopulation.json'), JSON.stringify(population));

console.log(`Generated famousStars.json (${famousStars.length} stars)`);
console.log(`Generated stellarPopulation.json (${population.length} stars)`);
