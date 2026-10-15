/**
 * SIMBAD Astronomical Database & CDS Aladin/HiPS Service
 * Resolves celestial coordinates and retrieves astronomical telemetry and imagery from CDS Strasbourg.
 */

// In-memory cache to prevent redundant queries
const simbadCache = new Map();

/**
 * Query CDS Sesame resolver for SIMBAD astronomical records.
 * @param {Object} star - Star object from catalog
 * @returns {Promise<Object>} Astronomical data including coordinates and HiPS image cutout URL
 */
export async function fetchSimbadData(star) {
  if (!star) return { available: false };

  // Check cache first
  const cacheKey = (star.hip ? `hip_${star.hip}` : star.name).toLowerCase();
  if (simbadCache.has(cacheKey)) {
    return simbadCache.get(cacheKey);
  }

  // Sol / Sun special handling: Solar Dynamics Observatory visible light image
  if (star.id === 'sun' || star.name.toLowerCase() === 'sol' || star.name.toLowerCase() === 'sun (sol)') {
    const sunData = {
      available: true,
      ra: null,
      dec: null,
      spectralType: 'G2V',
      objectType: 'Yellow Dwarf (Home Star)',
      objectTypeCs: 'Žlutý trpaslík (Naše hvězda)',
      parallax: null,
      radVel: '0.0',
      properMotion: null,
      vMag: '-26.74',
      simbadName: 'Sun (Sol)',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/600px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
      isSolarSpecial: true
    };
    simbadCache.set(cacheKey, sunData);
    return sunData;
  }

  // Construct query: prioritize HIP number, then Bayer designation, then canonical name
  let query = '';
  if (star.hip) {
    query = `HIP ${star.hip}`;
  } else if (star.bayer) {
    query = star.bayer;
  } else {
    query = star.name.replace(/\s*\(.*?\)\s*/g, '').trim();
  }

  try {
    const sesameUrl = `https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oI/A?${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(sesameUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const fallback = { available: false, query };
      simbadCache.set(cacheKey, fallback);
      return fallback;
    }

    const text = await res.text();

    // Parse Sesame text output
    // %J: J2000 Coordinates: RA(deg) Dec(deg)
    const jMatch = text.match(/%J\s+([+\-\d.]+)\s+([+\-\d.]+)/);
    // %S: SIMBAD Spectral Type
    const sMatch = text.match(/%S\s+([^\n\r=]+)/);
    // %C.0 or %C: SIMBAD Object Type
    const cMatch = text.match(/%C(?:\.0)?\s+([^\n\r]+)/);
    // %X: Parallax (mas)
    const xMatch = text.match(/%X\s+([+\-\d.]+)/);
    // %V: Radial Velocity (km/s)
    const vMatch = text.match(/%V\s+[a-z]?\s*([+\-\d.]+)/);
    // %P: Proper Motion (mas/yr)
    const pMatch = text.match(/%P\s+([+\-\d.]+)\s+([+\-\d.]+)/);
    // %M.V: Visual Magnitude
    const mvMatch = text.match(/%M\.V\s+([+\-\d.]+)/);
    // %I.0 or %I: Canonical Identifier
    const iMatch = text.match(/%I(?:\.0)?\s+([^\n\r]+)/);

    if (!jMatch) {
      const fallback = { available: false, query };
      simbadCache.set(cacheKey, fallback);
      return fallback;
    }

    const ra = parseFloat(jMatch[1]);
    const dec = parseFloat(jMatch[2]);

    // CDS Aladin HiPS2FITS cutout endpoint for true DSS2 color sky imagery
    const imageUrl = `https://alasky.cds.unistra.fr/hips-image-services/hips2fits?hips=CDS/P/DSS2/color&width=240&height=240&fov=0.08&ra=${ra}&dec=${dec}&format=jpg`;

    const simbadData = {
      available: true,
      query,
      ra,
      dec,
      spectralType: sMatch ? sMatch[1].trim() : star.spectralType,
      objectType: cMatch ? formatSimbadObjectType(cMatch[1].trim()) : 'Star',
      parallax: xMatch ? parseFloat(xMatch[1]) : null,
      radVel: vMatch ? parseFloat(vMatch[1]) : null,
      properMotion: pMatch ? `${parseFloat(pMatch[1]).toFixed(1)}, ${parseFloat(pMatch[2]).toFixed(1)} mas/yr` : null,
      vMag: mvMatch ? parseFloat(mvMatch[1]) : null,
      simbadName: iMatch ? iMatch[1].trim() : query,
      imageUrl
    };

    simbadCache.set(cacheKey, simbadData);
    return simbadData;
  } catch (err) {
    // Network error or timeout
    const fallback = { available: false, query, error: err.message };
    simbadCache.set(cacheKey, fallback);
    return fallback;
  }
}

/**
 * Human-friendly labels for common SIMBAD astronomical object classification codes
 */
function formatSimbadObjectType(code) {
  const map = {
    '*': 'Star',
    '**': 'Double or Binary Star',
    'SB*': 'Spectroscopic Binary Star',
    'EB*': 'Eclipsing Binary Star',
    'V*': 'Variable Star',
    'PulsV*': 'Pulsating Variable Star',
    'Cepheid': 'Classical Cepheid Variable',
    's*r': 'Red Supergiant Star',
    's*b': 'Blue Supergiant Star',
    's*y': 'Yellow Supergiant Star',
    'AB*': 'Asymptotic Giant Branch (AGB)',
    'WD*': 'White Dwarf Remnant',
    'LM*': 'Low-Mass M-Dwarf Star',
    'BD*': 'Brown Dwarf Sub-Stellar Object',
    'HXB': 'High-Mass X-Ray Binary (BH/NS)',
    'LXB': 'Low-Mass X-Ray Binary',
    'X': 'High-Energy X-Ray Source',
    'Pulsar': 'Neutron Star Pulsar',
    'SNRemnant': 'Supernova Remnant'
  };
  return map[code] || code;
}
