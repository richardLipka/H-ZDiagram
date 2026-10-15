/**
 * Stellar Spectroscopy & Core Nucleosynthesis Physics Engine
 * 
 * Educational model of a stellar optical spectrum and of the energy source in the core:
 * 1. Planck continuum B_λ(T) across the visible range (380–750 nm);
 * 2. schematic strengths of prominent absorption features whose maxima follow the
 *    MK spectral sequence (Balmer lines peak near A0, He I near B2, He II in O stars,
 *    Ca II H & K and metal lines in G–K stars, TiO bands in M stars; see Gray &
 *    Corbally 2009, Stellar Spectral Classification) — not a radiative-transfer model;
 * 3. the dominant nuclear process and internal structure for the star's evolutionary stage.
 */

// Wavelength to RGB conversion (380 nm - 750 nm)
export function wavelengthToRGB(wavelength) {
  let r = 0, g = 0, b = 0;
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0;
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0;
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
    b = 0;
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1;
    g = 0;
    b = 0;
  }

  // Intensity falloff near visual limits (human eye response)
  let factor = 1.0;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  } else if (wavelength > 700 && wavelength <= 750) {
    factor = 0.3 + 0.7 * (750 - wavelength) / (750 - 700);
  }

  return {
    r: Math.round(r * factor * 255),
    g: Math.round(g * factor * 255),
    b: Math.round(b * factor * 255),
    css: `rgb(${Math.round(r * factor * 255)}, ${Math.round(g * factor * 255)}, ${Math.round(b * factor * 255)})`
  };
}

// Major diagnostic absorption & emission lines in stellar atmospheres
export const PROMINENT_SPECTRAL_LINES = [
  {
    id: 'ca2_k',
    name: 'Ca II K',
    wavelengthNm: 393.37,
    element: 'Calcium (Ca⁺)',
    ionization: 'Ca II',
    transition: '4s ²S₁/₂ → 4p ²P°₃/₂',
    peakType: ['F', 'G', 'K'],
    description: 'Resonance absorption doublet of singly-ionized calcium. Dominates solar & cool stellar spectra.',
    descriptionCs: 'Rezonanční absorpční čára ionizovaného vápníku. Dominuje slunečnímu spektru a chladnějším hvězdám.',
    type: 'absorption'
  },
  {
    id: 'ca2_h',
    name: 'Ca II H',
    wavelengthNm: 396.85,
    element: 'Calcium (Ca⁺)',
    ionization: 'Ca II',
    transition: '4s ²S₁/₂ → 4p ²P°₁/₂',
    peakType: ['F', 'G', 'K'],
    description: 'Fraunhofer H line, blended with Hydrogen H-epsilon in hot stars.',
    descriptionCs: 'Fraunhoferova čára H, u teplejších hvězd splývá s vodíkovou čárou H-epsilon.',
    type: 'absorption'
  },
  {
    id: 'h_delta',
    name: 'Hδ (Balmer)',
    wavelengthNm: 410.17,
    element: 'Hydrogen (H)',
    ionization: 'H I',
    transition: 'n = 2 → 6',
    peakType: ['A', 'B', 'F'],
    description: 'Balmer series Hydrogen absorption; peaks in A-type stars (Vega, Sirius).',
    descriptionCs: 'Čára Balmerovy série vodíku; vrcholí u hvězd třídy A (Vega, Sirius).',
    type: 'absorption'
  },
  {
    id: 'h_gamma',
    name: 'Hγ (Balmer)',
    wavelengthNm: 434.05,
    element: 'Hydrogen (H)',
    ionization: 'H I',
    transition: 'n = 2 → 5',
    peakType: ['A', 'B', 'F'],
    description: 'Balmer series Hydrogen absorption in blue-violet optical window.',
    descriptionCs: 'Čára Balmerovy série vodíku v modrofialové části spektra.',
    type: 'absorption'
  },
  {
    id: 'fe1_4383',
    name: 'Fe I (4383)',
    wavelengthNm: 438.35,
    element: 'Iron (Fe)',
    ionization: 'Fe I',
    transition: 'Fe I multiplet 41',
    peakType: ['G', 'K', 'M'],
    description: 'Neutral iron metallic absorption line; indicator of stellar metallicity [Fe/H].',
    descriptionCs: 'Absorpční čára neutrálního železa; klíčový indikátor metalicity [Fe/H].',
    type: 'absorption'
  },
  {
    id: 'he1_4471',
    name: 'He I (4471)',
    wavelengthNm: 447.15,
    element: 'Helium (He)',
    ionization: 'He I',
    transition: '2p ³P° → 4d ³D',
    peakType: ['B', 'O'],
    description: 'Neutral Helium absorption; strong in hot B-type stars (Rigel, Spica).',
    descriptionCs: 'Absorpce neutrálního helia; výrazná u horkých hvězd třídy B (Rigel, Spica).',
    type: 'absorption'
  },
  {
    id: 'he2_4686',
    name: 'He II (4686)',
    wavelengthNm: 468.57,
    element: 'Helium (He⁺)',
    ionization: 'He II',
    transition: 'n = 3 → 4',
    peakType: ['O', 'WR'],
    description: 'Ionized Helium; requires extreme temperatures (>30,000 K) or Wolf-Rayet emission.',
    descriptionCs: 'Ionizované helium; vyžaduje extrémní teplotu (>30 000 K) nebo stav Wolfovy–Rayetovy hvězdy.',
    type: 'absorption'
  },
  {
    id: 'h_beta',
    name: 'Hβ (Balmer)',
    wavelengthNm: 486.13,
    element: 'Hydrogen (H)',
    ionization: 'H I',
    transition: 'n = 2 → 4',
    peakType: ['A', 'B', 'F'],
    description: 'Fraunhofer F line; its strength and width are key diagnostics of temperature and surface gravity.',
    descriptionCs: 'Fraunhoferova čára F; její síla a šířka jsou klíčovou diagnostikou teploty a povrchové gravitace.',
    type: 'absorption'
  },
  {
    id: 'tio_4954',
    name: 'TiO Band Head',
    wavelengthNm: 495.40,
    element: 'Titanium Oxide (TiO)',
    ionization: 'Molecule',
    transition: 'α-system (C ³Δ - X ³Δ)',
    peakType: ['M', 'K'],
    description: 'Molecular absorption band characteristic of cool M-type stars (red dwarfs, giants and supergiants).',
    descriptionCs: 'Molekulární absorpční pás typický pro chladné hvězdy třídy M (červené trpaslíky, obry i veleobry).',
    type: 'molecular'
  },
  {
    id: 'mg1_b',
    name: 'Mg I b Triplet',
    wavelengthNm: 517.27,
    element: 'Magnesium (Mg)',
    ionization: 'Mg I',
    transition: '3p ³P° → 4s ³S',
    peakType: ['G', 'K'],
    description: 'Fraunhofer b line; pressure-broadened in dwarf stars, narrow in supergiants.',
    descriptionCs: 'Fraunhoferova čára b; tlakově rozšířená u trpaslíků, úzká u veleobrů.',
    type: 'absorption'
  },
  {
    id: 'fe1_5270',
    name: 'Fe I (5270)',
    wavelengthNm: 527.04,
    element: 'Iron (Fe)',
    ionization: 'Fe I',
    transition: 'Fraunhofer E line',
    peakType: ['G', 'K'],
    description: 'Prominent neutral iron line in solar & yellow dwarf spectra.',
    descriptionCs: 'Výrazná čára neutrálního železa ve spektru Slunce a žlutých trpaslíků.',
    type: 'absorption'
  },
  {
    id: 'na1_d',
    name: 'Na I D Doublet',
    wavelengthNm: 589.29,
    element: 'Sodium (Na)',
    ionization: 'Na I',
    transition: '3s ²S₁/₂ → 3p ²P°₃/₂,₁/₂',
    peakType: ['G', 'K', 'M'],
    description: 'Fraunhofer D1 & D2 resonance doublet at 589.0 & 589.6 nm. Very strong in cool stars.',
    descriptionCs: 'Fraunhoferův dublet D1 a D2 (589,0 a 589,6 nm). Mimořádně silný u chladných hvězd.',
    type: 'absorption'
  },
  {
    id: 'h_alpha',
    name: 'Hα (Balmer)',
    wavelengthNm: 656.28,
    element: 'Hydrogen (H)',
    ionization: 'H I',
    transition: 'n = 2 → 3',
    peakType: ['A', 'B', 'F'],
    description: 'Red Balmer line of hydrogen (Fraunhofer C). In emission it marks chromospheric activity and ionized nebulae.',
    descriptionCs: 'Červená Balmerova čára vodíku (Fraunhoferova čára C). V emisi prozrazuje chromosférickou aktivitu a ionizované mlhoviny.',
    type: 'absorption'
  },
  {
    id: 'tio_7054',
    name: 'TiO Red Band',
    wavelengthNm: 705.40,
    element: 'Titanium Oxide (TiO)',
    ionization: 'Molecule',
    transition: 'γ-system (A ³Φ - X ³Δ)',
    peakType: ['M'],
    description: 'Deep molecular absorption depressions swallowing the red spectrum of M-stars (Betelgeuse, Proxima).',
    descriptionCs: 'Hluboká molekulární absorpce pohlcující červenou část spektra u hvězd třídy M.',
    type: 'molecular'
  }
];

/**
 * Schematic strength (0–1) of a line or band at temperature T. Gaussian-like
 * curves placed at the temperatures where each feature is strongest.
 */
export function calculateLineStrength(line, temp, _spectralType = 'G', lumClass = 'V') {
  const t = Math.max(1000, temp);
  // Supergiants: lower pressure, slightly weaker pressure-broadened lines
  const lumFactor = lumClass === 'I' ? 0.9 : 1.0;

  // Hydrogen Balmer lines: strongest near A0–A2 (~9,500 K)
  if (line.id.startsWith('h_')) {
    const strength = Math.exp(-(((t - 9500) / 3400) ** 2)) * lumFactor;
    return Math.max(0.08, Math.min(0.92, strength));
  }
  // He I: strongest near B2 (~20,000 K), absent in cool stars
  if (line.id.startsWith('he1_')) {
    if (t < 9000) return 0.0;
    return Math.min(0.85, Math.exp(-(((t - 20000) / 6000) ** 2)));
  }
  // He II: only in O stars (≳ 30,000 K)
  if (line.id.startsWith('he2_')) {
    if (t < 28000) return 0.0;
    return Math.min(0.9, (t - 28000) / 15000);
  }
  // Ca II H & K: strongest in G–K stars
  if (line.id.startsWith('ca2_')) {
    return Math.max(0.05, Math.min(0.95, Math.exp(-(((t - 5000) / 2200) ** 2))));
  }
  // Na I D: grows towards cooler stars
  if (line.id.startsWith('na1_')) {
    if (t > 8500) return 0.05;
    return Math.min(0.92, 0.15 + 0.8 * Math.exp(-(t - 3000) / 2500));
  }
  // Mg I b: strongest in G–K stars
  if (line.id.startsWith('mg1_')) {
    return Math.min(0.88, Math.exp(-(((t - 5000) / 2400) ** 2)));
  }
  // Neutral iron: strongest in G–K stars
  if (line.id.startsWith('fe1_')) {
    return Math.min(0.82, Math.exp(-(((t - 5200) / 2500) ** 2)));
  }
  // TiO bands: appear in late K and dominate M stars
  if (line.id.startsWith('tio_')) {
    if (t > 4100) return 0.0;
    return Math.min(0.95, ((4100 - t) / 1600) ** 1.5);
  }
  return 0.3;
}

/**
 * Planck spectral radiance B_λ(T) in W·sr⁻¹·m⁻³.
 */
export function calculatePlanckFlux(wavelengthNm, temp) {
  const w = wavelengthNm * 1e-9;
  const h = 6.62607015e-34; // Planck constant (J s)
  const c = 2.99792458e8; // speed of light (m/s)
  const k = 1.380649e-23; // Boltzmann constant (J/K)
  const x = (h * c) / (w * k * Math.max(500, temp));
  if (x > 700) return 0;
  return (2 * h * c * c) / (w ** 5 * Math.expm1(x));
}

// Present-day solar photospheric mass fractions (Asplund et al. 2009, ARA&A 47, 481)
const SOLAR_XYZ = { X: 0.7381, Y: 0.2485, Z: 0.0134 };

/**
 * Evolutionary phase of a catalogue star or of a simulated evolution state.
 */
export function classifyPhase(star) {
  const stage = (star.evolutionaryStage || star.stage || '').toLowerCase();
  const spec = (star.spectralType || '').toUpperCase();
  const lc = star.luminosityClass;
  if (star.noPhotosphere || stage.includes('black hole')) return 'black_hole';
  if (lc === 'NS' || stage.includes('neutron star')) return 'neutron_star';
  if (stage.includes('supernova') || stage.includes('core collapse')) return 'supernova';
  if (lc === 'D' || spec.startsWith('D') || stage.includes('white dwarf')) return 'white_dwarf';
  if (stage.includes('protostar') || stage.includes('pre-main') || stage.includes('accret')) return 'pre_main_sequence';
  if (stage.includes('planetary nebula') || stage.includes('envelope ejection')) return 'post_agb';
  if (stage.includes('asymptotic') || stage.includes('agb')) return 'agb';
  if (stage.includes('helium') || stage.includes('horizontal') || stage.includes('blue loop')) return 'core_helium';
  if (stage.includes('terminal-age') || stage.includes('final evolution')) return 'shell_hydrogen';
  if (stage.includes('main sequence') || stage.includes('zams') || stage.includes('sun today')) return 'main_sequence';
  if (stage.includes('subgiant') || stage.includes('red giant branch') || stage.includes('hertzsprung')) return 'shell_hydrogen';
  if (lc === 'V') return 'main_sequence';
  // Hot B-type giants and subgiants are mostly still burning hydrogen in the core
  if ((lc === 'III' || lc === 'IV') && (star.temp || 0) > 10000) return 'main_sequence';
  if (lc === 'I' || lc === 'II' || stage.includes('supergiant')) return 'supergiant';
  if (lc === 'IV') return 'shell_hydrogen';
  return 'giant';
}

/**
 * Dominant energy source, internal structure and surface composition.
 * All texts are returned in the requested language.
 */
export function analyzeCoreFusionAndComposition(star, lang = 'en') {
  if (!star) return null;
  const cs = lang === 'cs';
  const L = (en, czech) => (cs ? czech : en);
  const mass = star.mass || null;
  const radius = star.radius || null;
  const phase = classifyPhase(star);
  let composition = SOLAR_XYZ;
  let compositionNote = L('Assumed solar composition (Asplund et al. 2009)', 'Předpokládáno sluneční složení (Asplund a kol. 2009)');
  let r;

  switch (phase) {
    case 'black_hole':
      r = {
        fusionType: L('No fusion: black hole', 'Bez fúze: černá díra'),
        fusionDesc: L('The core collapsed beyond the maximum mass of a neutron star (Tolman–Oppenheimer–Volkoff limit, about 2–2.3 M☉). Nothing escapes from inside the event horizon.',
          'Jádro se zhroutilo za maximální hmotnost neutronové hvězdy (Tolmanova–Oppenheimerova–Volkoffova mez, asi 2–2,3 M☉). Zpod horizontu událostí nic neunikne.'),
        coreZoneStructure: L('Event horizon (no surface)', 'Horizont událostí (bez povrchu)'),
        primaryReactionFormula: 'R_s = 2GM/c² ≈ 3 km × (M/M☉)',
        coreTempLabel: '—',
        scientificCitation: 'Oppenheimer & Snyder 1939, Phys. Rev. 56, 455'
      };
      composition = null;
      break;
    case 'neutron_star':
      r = {
        fusionType: L('No fusion: neutron star', 'Bez fúze: neutronová hvězda'),
        fusionDesc: L('Matter at and above nuclear density (~2×10¹⁷ kg/m³) is held up by neutron degeneracy pressure and the strong nuclear force. The star radiates stored heat and cools over millions of years.',
          'Hmotu o jaderné a vyšší hustotě (~2×10¹⁷ kg/m³) drží tlak degenerovaných neutronů a silná jaderná interakce. Hvězda vyzařuje uložené teplo a chladne po miliony let.'),
        coreZoneStructure: L('Thin atmosphere • crust • neutron-rich core', 'Tenká atmosféra • kůra • jádro bohaté na neutrony'),
        primaryReactionFormula: L('M_max ≈ 2.2 M☉ (TOV limit)', 'M_max ≈ 2,2 M☉ (mez TOV)'),
        coreTempLabel: L('~10⁸–10⁹ K (young)', '~10⁸–10⁹ K (mladá)'),
        scientificCitation: 'Oppenheimer & Volkoff 1939, Phys. Rev. 55, 374'
      };
      composition = null;
      break;
    case 'supernova':
      r = {
        fusionType: L('Core collapse', 'Kolaps jádra'),
        fusionDesc: L('The iron core can no longer release energy by fusion and collapses within a fraction of a second; about 99 % of the released gravitational energy escapes as neutrinos.',
          'Železné jádro už fúzí nemůže uvolnit energii a během zlomku sekundy se zhroutí; asi 99 % uvolněné gravitační energie unikne v neutrinech.'),
        coreZoneStructure: L('Proto-neutron star • shock • ejected envelope', 'Protoneutronová hvězda • rázová vlna • odvržený obal'),
        primaryReactionFormula: 'p + e⁻ → n + νₑ',
        coreTempLabel: '~10¹¹ K',
        scientificCitation: 'Woosley, Heger & Weaver 2002, Rev. Mod. Phys. 74, 1015'
      };
      break;
    case 'white_dwarf': {
      const spec = (star.spectralType || '').toUpperCase();
      const isDA = spec.startsWith('DA');
      r = {
        fusionType: L('No fusion: electron-degenerate remnant', 'Bez fúze: elektronově degenerovaný pozůstatek'),
        fusionDesc: L('Supported by electron degeneracy pressure; it shines only by radiating stored heat and slowly cools (Mestel cooling). Cool massive white dwarfs crystallize.',
          'Drží ho tlak degenerovaného elektronového plynu; svítí jen díky vyzařování uloženého tepla a pomalu chladne (Mestelovo chladnutí). Chladní hmotní bílí trpaslíci krystalizují.'),
        coreZoneStructure: L('C/O (or He) degenerate core • thin H/He envelope', 'Degenerované jádro C/O (nebo He) • tenký obal H/He'),
        primaryReactionFormula: L('P ∝ ρ^5/3 (non-relativistic degenerate electrons); M < 1.4 M☉', 'P ∝ ρ^5/3 (nerelativistické degenerované elektrony); M < 1,4 M☉'),
        coreTempLabel: L('~10⁶–10⁷ K, cooling', '~10⁶–10⁷ K, chladne'),
        scientificCitation: 'Chandrasekhar 1931, ApJ 74, 81; Mestel 1952, MNRAS 112, 583'
      };
      // Gravitational settling: the atmosphere is almost pure H (DA) or He (DB, DC, DQ, DZ)
      composition = isDA ? { X: 1.0, Y: 0, Z: 0 } : { X: 0, Y: 1.0, Z: 0 };
      compositionNote = L('Gravitational settling: hydrogen (DA) or helium atmosphere', 'Gravitační usazování: vodíková (DA) nebo heliová atmosféra');
      break;
    }
    case 'pre_main_sequence':
      r = {
        fusionType: L('Gravitational contraction', 'Gravitační smršťování'),
        fusionDesc: L('The young star shines by releasing gravitational energy as it contracts; deuterium burns briefly, but hydrogen fusion has not started.',
          'Mladá hvězda září uvolňováním gravitační energie při smršťování; krátce hoří deuterium, fúze vodíku ale ještě nezačala.'),
        coreZoneStructure: L('Fully or largely convective', 'Plně nebo převážně konvektivní'),
        primaryReactionFormula: '²H + p → ³He + γ',
        coreTempLabel: '≲ 10 MK',
        scientificCitation: 'Hayashi 1961, PASJ 13, 450'
      };
      break;
    case 'main_sequence': {
      const m = mass || 1;
      // Homology: T_c ∝ M/R, normalised to the solar central temperature of 15.7 MK
      const tc = radius ? 15.7 * (m / radius) : null;
      const tcLabel = tc ? `~${tc < 100 ? tc.toFixed(1) : Math.round(tc)} MK` : '—';
      const structure = m < 0.35
        ? L('Fully convective', 'Plně konvektivní')
        : m < 1.3
          ? L('Radiative core • convective envelope', 'Zářivé jádro • konvektivní obal')
          : L('Convective core • radiative envelope', 'Konvektivní jádro • zářivý obal');
      if (m < 1.3) {
        r = {
          fusionType: L('Proton–proton chain', 'Proton-protonový řetězec'),
          fusionDesc: L('Hydrogen fuses into helium mainly through the proton–proton chain, which dominates in stars below about 1.3 M☉ (core temperatures below ~18 MK).',
            'Vodík se slučuje na helium převážně proton-protonovým řetězcem, který převládá u hvězd pod asi 1,3 M☉ (teplota jádra pod ~18 MK).'),
          coreZoneStructure: structure,
          primaryReactionFormula: '4 ¹H → ⁴He + 2e⁺ + 2νₑ (Q = 26.73 MeV)',
          coreTempLabel: tcLabel,
          scientificCitation: 'Bethe & Critchfield 1938, Phys. Rev. 54, 248'
        };
      } else {
        r = {
          fusionType: L('CNO cycle', 'Cyklus CNO'),
          fusionDesc: L('Above about 1.3 M☉ hydrogen burns mainly through the CNO cycle, with carbon, nitrogen and oxygen as catalysts. Its rate rises steeply with temperature (∝ T^16–20), which makes the core convective.',
            'Nad asi 1,3 M☉ hoří vodík převážně v cyklu CNO, v němž uhlík, dusík a kyslík slouží jako katalyzátory. Jeho rychlost strmě roste s teplotou (∝ T^16–20), a proto je jádro konvektivní.'),
          coreZoneStructure: structure,
          primaryReactionFormula: '¹²C(p,γ)¹³N(β⁺ν)¹³C(p,γ)¹⁴N(p,γ)¹⁵O(β⁺ν)¹⁵N(p,α)¹²C',
          coreTempLabel: tcLabel,
          scientificCitation: 'Bethe 1939, Phys. Rev. 55, 434'
        };
      }
      break;
    }
    case 'shell_hydrogen':
      r = {
        fusionType: L('Hydrogen shell burning', 'Hoření vodíku ve slupce'),
        fusionDesc: L('Hydrogen is exhausted in the centre; it burns in a shell around a contracting helium core while the envelope expands and cools.',
          'Vodík je ve středu vyčerpán; hoří ve slupce kolem smršťujícího se heliového jádra, zatímco obal se rozpíná a chladne.'),
        coreZoneStructure: L('Inert He core • H-burning shell • expanding envelope', 'Neaktivní heliové jádro • slupka hořícího vodíku • rozpínající se obal'),
        primaryReactionFormula: L('4 ¹H → ⁴He in a shell', '4 ¹H → ⁴He ve slupce'),
        coreTempLabel: L('rising towards ~100 MK', 'roste k ~100 MK'),
        scientificCitation: 'Kippenhahn, Weigert & Weiss 2012, Stellar Structure and Evolution'
      };
      break;
    case 'core_helium':
      r = {
        fusionType: L('Core helium burning (triple-alpha process)', 'Hoření helia v jádře (proces 3α)'),
        fusionDesc: L('At ~100 MK helium fuses into carbon (and oxygen) through the triple-alpha process, made possible by the 7.65 MeV resonance of ¹²C; hydrogen still burns in a shell.',
          'Při ~100 MK se helium slučuje na uhlík (a kyslík) procesem 3α, který umožňuje rezonance ¹²C o energii 7,65 MeV; vodík dál hoří ve slupce.'),
        coreZoneStructure: L('He-burning core • H-burning shell • envelope', 'Jádro hořícího helia • slupka hořícího vodíku • obal'),
        primaryReactionFormula: '3 ⁴He → ¹²C + γ (Q = 7.27 MeV)',
        coreTempLabel: '~100 MK',
        scientificCitation: 'Salpeter 1952, ApJ 115, 326; Hoyle 1954, ApJS 1, 121'
      };
      break;
    case 'agb':
    case 'post_agb':
      r = {
        fusionType: L('Helium and hydrogen shell burning', 'Hoření helia a vodíku ve slupkách'),
        fusionDesc: L('An inert carbon–oxygen core is surrounded by alternately burning helium and hydrogen shells (thermal pulses); strong winds remove the envelope, which later glows as a planetary nebula.',
          'Neaktivní uhlíkovo-kyslíkové jádro obklopují střídavě hořící slupky helia a vodíku (tepelné pulzy); silný vítr odnáší obal, který později září jako planetární mlhovina.'),
        coreZoneStructure: L('Degenerate C/O core • He shell • H shell • convective envelope', 'Degenerované jádro C/O • slupka He • slupka H • konvektivní obal'),
        primaryReactionFormula: '3 ⁴He → ¹²C;  ¹²C + ⁴He → ¹⁶O + γ',
        coreTempLabel: '~100–300 MK',
        scientificCitation: 'Herwig 2005, ARA&A 43, 435'
      };
      break;
    case 'supergiant':
      r = {
        fusionType: L('Massive star: core helium burning or later stages', 'Hmotná hvězda: hoření helia v jádře nebo pozdější fáze'),
        fusionDesc: L('Hot blue supergiants may still be finishing core hydrogen burning. Supergiants spend most of their post-main-sequence life burning helium in the core; carbon, neon, oxygen and silicon burning follow only in the last ~10⁴ years, building an onion-like structure that ends with an iron core.',
          'Horcí modří veleobři mohou ještě dokončovat hoření vodíku v jádře. Veleobři tráví většinu života po hlavní posloupnosti hořením helia v jádře; hoření uhlíku, neonu, kyslíku a křemíku následuje až v posledních ~10⁴ letech a vytváří cibulovitou stavbu zakončenou železným jádrem.'),
        coreZoneStructure: L('He- (or later C/O/Si-) burning core • burning shells • extended envelope', 'Jádro hořícího helia (později C/O/Si) • hořící slupky • rozsáhlý obal'),
        primaryReactionFormula: L('3 ⁴He → ¹²C, later C → Ne → O → Si → Fe-group', '3 ⁴He → ¹²C, později C → Ne → O → Si → prvky skupiny železa'),
        coreTempLabel: L('~0.03 GK (H) – 0.1 GK (He) – 3 GK (Si)', '~0,03 GK (H) – 0,1 GK (He) – 3 GK (Si)'),
        scientificCitation: 'Woosley, Heger & Weaver 2002, Rev. Mod. Phys. 74, 1015'
      };
      break;
    default:
      r = {
        fusionType: L('Hydrogen shell or core helium burning', 'Hoření vodíku ve slupce nebo helia v jádře'),
        fusionDesc: L('Giants either burn hydrogen in a shell around an inert helium core (red giant branch) or burn helium in the core (red clump, horizontal branch); the H–R position alone cannot always tell which.',
          'Obři buď spalují vodík ve slupce kolem neaktivního heliového jádra (větev červených obrů), nebo helium v jádře (červený shluk, horizontální větev); samotná poloha v H–R diagramu to vždy nerozliší.'),
        coreZoneStructure: L('He core • H-burning shell • convective envelope', 'Heliové jádro • slupka hořícího vodíku • konvektivní obal'),
        primaryReactionFormula: L('4 ¹H → ⁴He (shell) or 3 ⁴He → ¹²C (core)', '4 ¹H → ⁴He (slupka) nebo 3 ⁴He → ¹²C (jádro)'),
        coreTempLabel: '~30–100 MK',
        scientificCitation: 'Kippenhahn, Weigert & Weiss 2012, Stellar Structure and Evolution'
      };
  }

  return {
    ...r,
    phase,
    compositionH: composition ? composition.X : null,
    compositionHe: composition ? composition.Y : null,
    compositionMetals: composition ? composition.Z : null,
    compositionNote: composition ? compositionNote : null
  };
}

/**
 * External spectral archives and literature for a star.
 */
export function getSpectroscopyLinks(star, lang = 'en') {
  const cs = lang === 'cs';
  const simbadTarget = star && star.hip ? `HIP ${star.hip}` : star ? star.name : null;
  const links = [];

  if (simbadTarget) {
    links.push({
      id: 'simbad_spectra',
      name: `SIMBAD: ${simbadTarget}`,
      url: `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(simbadTarget)}`,
      badge: 'CDS SIMBAD',
      description: cs
        ? 'Spektrální klasifikace, radiální rychlost a literatura k objektu'
        : 'Spectral classification, radial velocity and literature for the object'
    });
  }
  links.push(
    {
      id: 'eso_uves',
      name: cs ? 'Knihovna spekter UVES POP (ESO)' : 'UVES Paranal Observatory Project (ESO)',
      url: 'https://www.eso.org/sci/observing/tools/uvespop.html',
      badge: 'ESO VLT',
      description: cs
        ? 'Spektra jasných hvězd s vysokým rozlišením (R ≈ 80 000, 300–1000 nm; Bagnulo a kol. 2003)'
        : 'High-resolution spectra of bright stars (R ≈ 80,000, 300–1000 nm; Bagnulo et al. 2003)'
    },
    {
      id: 'pickles',
      name: cs ? 'Knihovna spekter Pickles (1998)' : 'Pickles (1998) stellar flux library',
      url: 'https://ui.adsabs.harvard.edu/abs/1998PASP..110..863P/abstract',
      badge: 'PASP',
      description: cs
        ? 'Kalibrovaná spektra všech spektrálních tříd MK (Pickles 1998, PASP 110, 863)'
        : 'Flux-calibrated spectra across all MK spectral classes (Pickles 1998, PASP 110, 863)'
    },
    {
      id: 'b2fh_nucleosynthesis',
      name: cs ? 'Vznik prvků ve hvězdách (B²FH 1957)' : 'Synthesis of the Elements in Stars (B²FH 1957)',
      url: 'https://ui.adsabs.harvard.edu/abs/1957RvMP...29..547B/abstract',
      badge: 'Rev. Mod. Phys.',
      description: 'Burbidge, Burbidge, Fowler & Hoyle 1957, Rev. Mod. Phys. 29, 547'
    }
  );
  return links;
}
