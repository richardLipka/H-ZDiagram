/**
 * Links from a star to Wikipedia, SIMBAD, VizieR (Hipparcos), the NASA Exoplanet
 * Archive and NASA ADS.
 */

// Wikipedia article titles for names that are ambiguous or differ from the article title
const WIKIPEDIA_EN = {
  sun: 'Sun',
  sirius_a: 'Sirius',
  sirius_b: 'Sirius#Sirius_B',
  procyon_b: 'Procyon#Procyon_B',
  '40_eridani_b': '40_Eridani#40_Eridani_B',
  van_maanen_2: 'Van_Maanen_2',
  cygnus_x1: 'Cygnus_X-1',
  rx_j1856: 'RX_J1856.5−3754',
  pollux: 'Pollux_(star)',
  polaris: 'Polaris',
  vega: 'Vega',
  spica: 'Spica',
  antares: 'Antares',
  hd_209458_osiris: 'HD_209458',
  barnard: "Barnard's_Star",
  kepler_16: 'Kepler-16',
  au_microscopii: 'AU_Microscopii'
};

const WIKIPEDIA_CS = {
  sun: 'Slunce',
  sirius_a: 'Sirius',
  sirius_b: 'Sirius',
  polaris: 'Polárka',
  betelgeuse: 'Betelgeuze',
  proxima_centauri: 'Proxima_Centauri'
};

const AMBIGUOUS_EN_NAMES = new Set(['mira', 'castor', 'atlas', 'electra', 'maia', 'merope', 'taygeta', 'alcyone', 'pleione', 'canopus', 'mimosa', 'ran', 'copernicus', 'solaris', 'helvetios', 'titawin']);

const searchName = (star) => (star.name || '').replace(/\s*\(.*?\)\s*/g, ' ').trim();

/** Wikipedia article (or "go to article if it exists" search) in the UI language. */
export function getWikipediaUrl(star, lang = 'en') {
  if (!star) return lang === 'cs' ? 'https://cs.wikipedia.org/wiki/Hvězda' : 'https://en.wikipedia.org/wiki/Star';
  if (lang === 'cs') {
    if (WIKIPEDIA_CS[star.id]) return `https://cs.wikipedia.org/wiki/${encodeURIComponent(WIKIPEDIA_CS[star.id])}`;
    return `https://cs.wikipedia.org/w/index.php?search=${encodeURIComponent(searchName(star))}&go=Go`;
  }
  if (WIKIPEDIA_EN[star.id]) return `https://en.wikipedia.org/wiki/${encodeURI(WIKIPEDIA_EN[star.id])}`;
  const name = searchName(star);
  // Proper names shared with mythology etc. go to the "(star)" article when one exists
  const query = AMBIGUOUS_EN_NAMES.has(name.toLowerCase()) ? `${name} (star)` : name;
  return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}&go=Go`;
}

/** SIMBAD record, by Hipparcos number when available. */
export function getSimbadUrl(star) {
  if (!star) return 'https://simbad.cds.unistra.fr/simbad/';
  const query = star.hip ? `HIP ${star.hip}` : searchName(star);
  return `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(query)}`;
}

/** Hipparcos new reduction (van Leeuwen 2007, VizieR I/311) record. */
export function getVizierHipUrl(star) {
  if (!star || !star.hip) return null;
  return `https://vizier.cds.unistra.fr/viz-bin/VizieR-5?-source=I/311/hip2&HIP=${encodeURIComponent(star.hip)}`;
}

/** NASA Exoplanet Archive system overview. */
export function getNasaExoplanetUrl(star) {
  if (!star || !star.hasExoplanets || !star.neaHost) return null;
  return `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(star.neaHost)}`;
}

/** NASA ADS papers about the object (SIMBAD-linked object search). */
export function getAdsabsUrl(star) {
  if (!star) return 'https://ui.adsabs.harvard.edu/';
  const object = star.hip ? `HIP ${star.hip}` : searchName(star);
  return `https://ui.adsabs.harvard.edu/search/q=${encodeURIComponent(`object:"${object}"`)}&sort=citation_count%20desc`;
}

/** All external links for the star inspector. */
export function getStarCatalogLinks(star, lang = 'en') {
  if (!star) return [];
  const cs = lang === 'cs';
  const idLabel = star.hip ? `HIP ${star.hip}` : searchName(star);

  const links = [
    {
      id: 'wikipedia',
      name: cs ? 'Wikipedie' : 'Wikipedia',
      url: getWikipediaUrl(star, lang),
      description: cs ? 'Encyklopedický článek' : 'Encyclopedia article',
      badge: cs ? 'WIKIPEDIE' : 'WIKIPEDIA',
      type: 'encyclopedia'
    },
    {
      id: 'simbad',
      name: cs ? 'Astronomická databáze SIMBAD' : 'SIMBAD astronomical database',
      url: getSimbadUrl(star),
      description: cs ? `Záznam objektu v CDS Štrasburk (${idLabel})` : `Object record at CDS Strasbourg (${idLabel})`,
      badge: 'CDS SIMBAD',
      type: 'catalog'
    }
  ];

  if (star.hip) {
    links.push({
      id: 'vizier',
      name: cs ? 'Katalog Hipparcos (nová redukce)' : 'Hipparcos catalogue (new reduction)',
      url: getVizierHipUrl(star),
      description: cs ? `Paralaxa a astrometrie v katalogu VizieR I/311 [HIP ${star.hip}]` : `Parallax and astrometry in VizieR catalogue I/311 [HIP ${star.hip}]`,
      badge: 'VIZIER',
      type: 'catalog'
    });
  }

  const nea = getNasaExoplanetUrl(star);
  if (nea) {
    links.push({
      id: 'exoplanet',
      name: cs ? 'Archiv exoplanet NASA' : 'NASA Exoplanet Archive',
      url: nea,
      description: cs ? `Potvrzené planety: ${star.exoplanetCount}` : `Confirmed planets: ${star.exoplanetCount}`,
      badge: 'NASA',
      type: 'archive'
    });
  }

  links.push({
    id: 'adsabs',
    name: cs ? 'Literatura v NASA ADS' : 'Literature in NASA ADS',
    url: getAdsabsUrl(star),
    description: cs ? 'Odborné publikace o objektu, seřazené podle citací' : 'Research papers about the object, sorted by citations',
    badge: 'NASA ADS',
    type: 'literature'
  });

  return links;
}
