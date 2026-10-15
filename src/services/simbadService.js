/**
 * CDS Sesame name resolver (SIMBAD) and hips2fits sky cutouts.
 * https://cds.unistra.fr/cgi-bin/Sesame — https://alasky.cds.unistra.fr/hips-image-services/hips2fits
 */

const simbadCache = new Map();

// The Sun has no sky position; show a full-disc solar image instead
const SUN_DATA = {
  available: true,
  ra: null,
  dec: null,
  objectType: null,
  parallax: null,
  radVel: null,
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/600px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
  isSolarSpecial: true
};

function sesameQuery(star) {
  if (star.hip) return `HIP ${star.hip}`;
  const name = (star.name || '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
  return name || star.bayer || '';
}

/**
 * Resolve a star with Sesame and return its position, SIMBAD object type,
 * parallax, radial velocity and a DSS2 colour cutout URL.
 */
export async function fetchSimbadData(star) {
  if (!star) return { available: false };
  if (star.id === 'sun') return SUN_DATA;

  const query = sesameQuery(star);
  const cacheKey = query.toLowerCase();
  if (simbadCache.has(cacheKey)) return simbadCache.get(cacheKey);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://cds.unistra.fr/cgi-bin/nph-sesame/-oI/A?${encodeURIComponent(query)}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return remember(cacheKey, { available: false, query });

    const text = await res.text();
    const jMatch = text.match(/%J\s+([+\-\d.]+)\s+([+\-\d.]+)/);
    if (!jMatch) return remember(cacheKey, { available: false, query });
    const cMatch = text.match(/%C(?:\.0)?\s+([^\n\r]+)/);
    const xMatch = text.match(/%X\s+([+\-\d.]+)/);
    const vMatch = text.match(/%V\s+[a-z]?\s*([+\-\d.]+)/);

    const ra = parseFloat(jMatch[1]);
    const dec = parseFloat(jMatch[2]);
    return remember(cacheKey, {
      available: true,
      query,
      ra,
      dec,
      objectType: cMatch ? cMatch[1].trim() : null,
      parallax: xMatch ? parseFloat(xMatch[1]) : null,
      radVel: vMatch ? parseFloat(vMatch[1]) : null,
      // DSS2 colour cutout, 0.28° field of view
      imageUrl: `https://alasky.cds.unistra.fr/hips-image-services/hips2fits?hips=CDS/P/DSS2/color&width=240&height=240&fov=0.28&ra=${ra}&dec=${dec}&format=jpg`
    });
  } catch (err) {
    // Network errors and timeouts are not cached so that a later retry can succeed
    return { available: false, query, error: err.message };
  }
}

function remember(key, value) {
  simbadCache.set(key, value);
  return value;
}

// SIMBAD object-type codes (https://simbad.cds.unistra.fr/guide/otypes.htx)
const OBJECT_TYPES = {
  '*': ['Star', 'Hvězda'],
  '**': ['Double or multiple star', 'Dvojhvězda nebo vícenásobná hvězda'],
  'SB*': ['Spectroscopic binary', 'Spektroskopická dvojhvězda'],
  'EB*': ['Eclipsing binary', 'Zákrytová dvojhvězda'],
  'V*': ['Variable star', 'Proměnná hvězda'],
  'Pu*': ['Pulsating variable', 'Pulzující proměnná hvězda'],
  'Ce*': ['Classical Cepheid', 'Klasická cefeida'],
  'cC*': ['Classical Cepheid', 'Klasická cefeida'],
  'RR*': ['RR Lyrae variable', 'Proměnná typu RR Lyrae'],
  'Mi*': ['Mira variable', 'Proměnná typu Mira'],
  'sr*': ['Semiregular variable', 'Polopravidelná proměnná'],
  'RG*': ['Red giant branch star', 'Hvězda větve červených obrů'],
  'AB*': ['Asymptotic giant branch star', 'Hvězda asymptotické větve obrů'],
  's*r': ['Red supergiant', 'Červený veleobr'],
  's*b': ['Blue supergiant', 'Modrý veleobr'],
  's*y': ['Yellow supergiant', 'Žlutý veleobr'],
  'WD*': ['White dwarf', 'Bílý trpaslík'],
  'LM*': ['Low-mass star', 'Hvězda nízké hmotnosti'],
  'BD*': ['Brown dwarf', 'Hnědý trpaslík'],
  'BY*': ['BY Draconis variable', 'Proměnná typu BY Draconis'],
  'Er*': ['Eruptive variable', 'Eruptivní proměnná'],
  'Fl*': ['Flare star', 'Erupční hvězda'],
  'HXB': ['High-mass X-ray binary', 'Rentgenová dvojhvězda s hmotnou složkou'],
  'LXB': ['Low-mass X-ray binary', 'Rentgenová dvojhvězda s málo hmotnou složkou'],
  'Psr': ['Pulsar', 'Pulzar'],
  'N*': ['Neutron star', 'Neutronová hvězda'],
  'X': ['X-ray source', 'Rentgenový zdroj'],
  'PM*': ['High proper-motion star', 'Hvězda s velkým vlastním pohybem'],
  'Em*': ['Emission-line star', 'Hvězda s emisními čarami'],
  'Be*': ['Be star', 'Hvězda Be'],
  'a2*': ['α² CVn variable', 'Proměnná typu α² CVn'],
  'dS*': ['δ Scuti variable', 'Proměnná typu δ Scuti'],
  'bC*': ['β Cephei variable', 'Proměnná typu β Cephei'],
  'Or*': ['Young stellar object (Orion variable)', 'Mladá hvězda (proměnná typu Orion)'],
  'TT*': ['T Tauri star', 'Hvězda typu T Tauri'],
  'LP*': ['Long-period variable', 'Dlouhoperiodická proměnná'],
  'C*': ['Carbon star', 'Uhlíková hvězda'],
  'WR*': ['Wolf–Rayet star', 'Wolfova–Rayetova hvězda'],
  'LB*': ['Luminous blue variable', 'Svítivá modrá proměnná'],
  'El*': ['Ellipsoidal variable', 'Elipsoidální proměnná'],
  'RS*': ['RS Canum Venaticorum variable', 'Proměnná typu RS CVn'],
  'Ro*': ['Rotating variable', 'Rotující proměnná'],
  'Pl': ['Planet', 'Planeta']
};

/** Human-readable SIMBAD object type in the requested language. */
export function simbadTypeLabel(code, lang = 'en') {
  if (!code) return null;
  const entry = OBJECT_TYPES[code];
  return entry ? entry[lang === 'cs' ? 1 : 0] : code;
}
