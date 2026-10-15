/**
 * Astronomical Catalogue & Encyclopedic Linking Utilities.
 * Maps stellar identifiers, Hipparcos numbers, and stellar names to:
 * - Wikipedia (canonical encyclopedic record or search fallback)
 * - SIMBAD Astronomical Database (Centre de Données astronomiques de Strasbourg)
 * - ESA Hipparcos & Tycho Catalogues (CDS VizieR)
 * - NASA Exoplanet Archive (Caltech/IPAC)
 * - NASA ADS (Astrophysics Data System Literature)
 */

// Canonical Wikipedia article titles for famous stars
const WIKIPEDIA_CANONICAL_MAP = {
  "sol": "Sun",
  "sun": "Sun",
  "sirius": "Sirius",
  "sirius a": "Sirius",
  "sirius b": "Sirius#Sirius_B",
  "betelgeuse": "Betelgeuse",
  "rigel": "Rigel",
  "vega": "Vega",
  "polaris": "Polaris",
  "arcturus": "Arcturus",
  "capella": "Capella",
  "aldebaran": "Aldebaran",
  "antares": "Antares",
  "spica": "Spica",
  "pollux": "Pollux_(star)",
  "castor": "Castor_(star)",
  "deneb": "Deneb",
  "altair": "Altair",
  "canopus": "Canopus",
  "achernar": "Achernar",
  "fomalhaut": "Fomalhaut",
  "alpheratz": "Alpha_Andromedae",
  "caph": "Beta_Cassiopeiae",
  "schedar": "Alpha_Cassiopeiae",
  "algenib": "Gamma_Pegasi",
  "diphda": "Beta_Ceti",
  "achird": "Eta_Cassiopeiae",
  "proxima centauri": "Proxima_Centauri",
  "alpha centauri a": "Alpha_Centauri",
  "alpha centauri b": "Alpha_Centauri",
  "barnard's star": "Barnard%27s_Star",
  "wolf 359": "Wolf_359",
  "lalande 21185": "Lalande_21185",
  "luyten 726-8": "Luyten_726-8",
  "ross 128": "Ross_128",
  "ross 154": "Ross_154",
  "ross 248": "Ross_248",
  "tau ceti": "Tau_Ceti",
  "epsilon eridani": "Epsilon_Eridani",
  "trappist-1": "TRAPPIST-1",
  "51 peg": "51_Pegasi",
  "51 pegasi": "51_Pegasi",
  "kepler-186": "Kepler-186",
  "kepler-452": "Kepler-452",
  "gliese 581": "Gliese_581",
  "van maanen's star": "Van_Maanen_2",
  "groombridge 34": "Groombridge_34",
  "electra": "Electra_(star)",
  "taygeta": "Taygeta_(star)",
  "alcyone": "Alcyone_(star)",
  "maia": "Maia_(star)",
  "merope": "Merope_(star)",
  "pleione": "Pleione_(star)",
  "atlas": "Atlas_(star)",
  "prima hyadum": "Gamma_Tauri",
  "secunda hyadum": "Delta1_Tauri",
  "chamukuy": "Theta2_Tauri",
  "cygnus x-1": "Cygnus_X-1",
  "cygnus x-1 (hde 226868)": "Cygnus_X-1",
  "crab pulsar": "Crab_Pulsar",
  "crab pulsar (psr b0531+21)": "Crab_Pulsar",
  "rx j1856": "RX_J1856.5-3754",
  "rx j1856.5-3754 (magnificent seven)": "RX_J1856.5-3754",
  "eta carinae": "Eta_Carinae",
  "vy canis majoris": "VY_Canis_Majoris"
};

// Canonical Czech Wikipedia article titles for famous stars
const CS_WIKIPEDIA_CANONICAL_MAP = {
  "cygnus x-1": "Cygnus_X-1",
  "cygnus x-1 (hde 226868)": "Cygnus_X-1",
  "crab pulsar": "Krab%C3%AD_pulsar",
  "crab pulsar (psr b0531+21)": "Krab%C3%AD_pulsar",
  "rx j1856": "RX_J1856.5-3754",
  "rx j1856.5-3754 (magnificent seven)": "RX_J1856.5-3754",
  "eta carinae": "Eta_Carinae",
  "vy canis majoris": "VY_Canis_Majoris",
  "sol": "Slunce",
  "sun": "Slunce",
  "sirius": "Sirius",
  "sirius a": "Sirius",
  "sirius b": "Sirius_B",
  "betelgeuse": "Betelgeuse",
  "rigel": "Rigel",
  "vega": "Vega",
  "polaris": "Pol%C3%A1rka",
  "arcturus": "Arktur",
  "capella": "Capella",
  "aldebaran": "Aldebaran",
  "antares": "Antares",
  "spica": "Spika",
  "pollux": "Pollux_(hv%C4%9Bzda)",
  "castor": "Kastor_(hv%C4%9Bzda)",
  "deneb": "Deneb",
  "altair": "Altair",
  "canopus": "Canopus",
  "achernar": "Achernar",
  "fomalhaut": "Fomalhaut",
  "proxima centauri": "Proxima_Centauri",
  "alpha centauri a": "Alfa_Centauri",
  "alpha centauri b": "Alfa_Centauri",
  "barnard's star": "Barnardova_hv%C4%9Bzda",
  "wolf 359": "Wolf_359",
  "lalande 21185": "Lalande_21185",
  "ross 128": "Ross_128",
  "ross 154": "Ross_154",
  "ross 248": "Ross_248",
  "tau ceti": "Tau_Ceti",
  "epsilon eridani": "Epsilon_Eridani",
  "trappist-1": "TRAPPIST-1",
  "51 peg": "51_Pegasi",
  "51 pegasi": "51_Pegasi",
  "kepler-186": "Kepler-186",
  "kepler-452": "Kepler-452",
  "gliese 581": "Gliese_581",
  "electra": "Electra_(hv%C4%9Bzda)",
  "taygeta": "Taygeta_(hv%C4%9Bzda)",
  "alcyone": "Alkyon%C3%A9_(hv%C4%9Bzda)",
  "maia": "Maia_(hv%C4%9Bzda)",
  "merope": "Merop%C3%A9_(hv%C4%9Bzda)",
  "pleione": "Pleione_(hv%C4%9Bzda)",
  "atlas": "Atlas_(hv%C4%9Bzda)"
};

/**
 * Returns the canonical Wikipedia URL for a star, or an intelligent search fallback.
 * Supports both Czech and English Wikipedia depending on current language setting.
 */
export function getWikipediaUrl(star, lang = 'en') {
  if (!star || !star.name) {
    return lang === 'cs' ? 'https://cs.wikipedia.org/wiki/Hv%C4%9Bzda' : 'https://en.wikipedia.org/wiki/Star';
  }

  const cleanName = star.name.trim();
  const lower = cleanName.toLowerCase();

  if (lang === 'cs') {
    if (CS_WIKIPEDIA_CANONICAL_MAP[lower]) {
      return `https://cs.wikipedia.org/wiki/${CS_WIKIPEDIA_CANONICAL_MAP[lower]}`;
    }
    return `https://cs.wikipedia.org/w/index.php?search=${encodeURIComponent(cleanName + ' hvězda')}`;
  }

  // Check known canonical English articles
  if (WIKIPEDIA_CANONICAL_MAP[lower]) {
    return `https://en.wikipedia.org/wiki/${WIKIPEDIA_CANONICAL_MAP[lower]}`;
  }

  // Handle standard star names: replace spaces with underscores
  const formatted = cleanName.replace(/\s+/g, '_');
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(formatted)}`;
}

/**
 * Returns a fallback Wikipedia search URL if direct article match is uncertain.
 */
export function getWikipediaSearchUrl(star, lang = 'en') {
  if (!star || !star.name) {
    return lang === 'cs' ? 'https://cs.wikipedia.org/wiki/Hv%C4%9Bzda' : 'https://en.wikipedia.org/w/index.php?search=star';
  }
  if (lang === 'cs') {
    return `https://cs.wikipedia.org/w/index.php?search=${encodeURIComponent(star.name + ' hvězda')}`;
  }
  return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(star.name + ' star')}`;
}

/**
 * Returns the SIMBAD Astronomical Database query URL (CDS Strasbourg).
 * Uses Hipparcos catalogue number (HIP) if available for 100% exact resolution,
 * or the proper/Bayer star designation.
 */
export function getSimbadUrl(star) {
  if (!star) return 'https://simbad.cds.unistra.fr/simbad/';
  const query = star.hip ? `HIP ${star.hip}` : star.name;
  return `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(query)}`;
}

/**
 * Returns the ESA Hipparcos & Tycho Catalogue record URL on CDS VizieR.
 */
export function getVizierHipUrl(star) {
  if (!star || !star.hip) return null;
  return `https://vizier.cds.unistra.fr/viz-bin/VizieR-S?HIP%20${encodeURIComponent(star.hip)}`;
}

/**
 * Returns the NASA Exoplanet Archive record URL (Caltech/IPAC).
 */
export function getNasaExoplanetUrl(star) {
  if (!star || !star.hasExoplanets) return null;
  const targetName = star.name === 'Sol' ? 'Sun' : star.name;
  return `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(targetName)}`;
}

/**
 * Returns the NASA ADS (Astrophysics Data System) literature query URL.
 */
export function getAdsabsUrl(star) {
  if (!star || !star.name) return 'https://ui.adsabs.harvard.edu/';
  return `https://ui.adsabs.harvard.edu/search/q=${encodeURIComponent(star.name)}%20star`;
}

/**
 * Generates an aggregated bundle of all external catalogue & archival links for a star.
 */
export function getStarCatalogLinks(star, lang = 'en') {
  if (!star) return [];
  const isCs = lang === 'cs';

  const links = [
    {
      id: 'wikipedia',
      name: isCs ? 'Článek na Wikipedii' : 'Wikipedia Article',
      url: getWikipediaUrl(star, lang),
      description: isCs
        ? 'Encyklopedický přehled, historie a pozorování'
        : 'Encyclopedic overview, history, and observational records',
      badge: isCs ? 'WIKIPEDIE' : 'WIKI',
      type: 'encyclopedia'
    },
    {
      id: 'simbad',
      name: isCs ? 'Astronomická databáze SIMBAD' : 'SIMBAD Astronomical Database',
      url: getSimbadUrl(star),
      description: isCs
        ? `Dotaz do databáze CDS Štrasburk (${star.hip ? 'HIP ' + star.hip : star.name})`
        : `CDS Strasbourg object query (${star.hip ? 'HIP ' + star.hip : star.name})`,
      badge: 'CDS SIMBAD',
      type: 'catalog'
    }
  ];

  if (star.hip) {
    links.push({
      id: 'vizier',
      name: isCs ? 'Katalog ESA Hipparcos' : 'ESA Hipparcos Catalogue',
      url: getVizierHipUrl(star),
      description: isCs
        ? `Astrometrický záznam na CDS VizieR [HIP ${star.hip}]`
        : `VizieR astrometric record [HIP ${star.hip}]`,
      badge: 'ESA VIZIER',
      type: 'catalog'
    });
  }

  if (star.hasExoplanets) {
    links.push({
      id: 'exoplanet',
      name: isCs ? 'Archiv exoplanet NASA' : 'NASA Exoplanet Archive',
      url: getNasaExoplanetUrl(star),
      description: isCs
        ? `Potvrzené exoplanetární systémy (${star.exoplanetCount} planet)`
        : `Confirmed exoplanetary systems (${star.exoplanetCount} planet(s))`,
      badge: 'NASA EXOPLANET',
      type: 'archive'
    });
  }

  links.push({
    id: 'adsabs',
    name: isCs ? 'Literatura NASA ADS' : 'NASA ADS Literature',
    url: getAdsabsUrl(star),
    description: isCs
      ? 'Recenzované vědecké publikace a astrofyzikální studie'
      : 'Peer-reviewed astrophysical research publications',
      badge: 'NASA ADS',
      type: 'literature'
  });

  return links;
}

