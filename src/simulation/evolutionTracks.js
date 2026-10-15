/**
 * Schematic evolutionary tracks for five initial masses (solar metallicity).
 *
 * Each track is a list of waypoints (Teff, L) at characteristic evolutionary
 * stages; positions in between are interpolated in log Teff and log L, and the
 * radius always follows from the Stefan–Boltzmann law. The waypoints are rounded
 * values guided by published model grids and reviews:
 *  - 1 M☉: Sackmann, Boothroyd & Kraemer (1993, ApJ 418, 457) for the Sun's future;
 *  - 3, 15, 25 M☉: Ekström et al. (2012, A&A 537, A146) Geneva grids;
 *  - 0.4 M☉: main-sequence lifetime ≫ age of the Universe; late stages are
 *    predictions (Laughlin, Bodenheimer & Adams 1997, ApJ 482, 420);
 *  - white-dwarf masses: initial–final mass relation of Cummings et al. (2018, ApJ 866, 21);
 *  - core collapse outcomes: Sukhbold et al. (2016, ApJ 821, 38).
 * They are teaching aids, not substitutes for model isochrones.
 *
 * Waypoints with `offChart` lie outside the diagram's temperature or luminosity
 * range; `noPhotosphere` marks a black hole, which has no Teff.
 */

const step = (progress, ageYears, temp, lum, en, cs, extra = {}) => ({
  progress, ageYears, temp, lum,
  stage: en.stage, coreState: en.core, description: en.desc,
  stageCs: cs.stage, coreStateCs: cs.core, descriptionCs: cs.desc,
  ...extra
});

export const EVOLUTION_TRACKS = {
  0.4: {
    name: '0.4 M☉ (red dwarf)',
    nameCs: '0,4 M☉ (červený trpaslík)',
    remnantType: 'Helium white dwarf (predicted)',
    remnantTypeCs: 'Heliový bílý trpaslík (předpověď)',
    steps: [
      step(0.0, 1e6, 3550, 0.25,
        { stage: 'Pre-main-sequence star', core: 'Fully convective; contracting, no hydrogen fusion yet', desc: 'A young star still contracting towards the main sequence.' },
        { stage: 'Hvězda před hlavní posloupností', core: 'Plně konvektivní; smršťuje se, vodík zatím nefúzuje', desc: 'Mladá hvězda, která se teprve smršťuje k hlavní posloupnosti.' },
        { phase: 'Pre-main-sequence contraction', phaseCs: 'Smršťování před hlavní posloupností' }),
      step(0.05, 2e8, 3470, 0.023,
        { stage: 'Zero-age main sequence (ZAMS)', core: 'Hydrogen fusion via the proton–proton chain', desc: 'Red dwarf near the boundary of full convection (~0.35 M☉); convection mixes most of the star.' },
        { stage: 'Hlavní posloupnost nulového věku (ZAMS)', core: 'Fúze vodíku proton-protonovým řetězcem', desc: 'Červený trpaslík blízko hranice plné konvekce (~0,35 M☉); konvekce promíchává většinu hvězdy.' },
        { phase: 'Main sequence', phaseCs: 'Hlavní posloupnost' }),
      step(0.15, 13.8e9, 3480, 0.025,
        { stage: 'Main sequence at 13.8 billion years', core: 'Steady hydrogen fusion; barely changed since birth', desc: 'After 13.8 billion years such a star has hardly evolved: no 0.4 M☉ star has yet left the main sequence.' },
        { stage: 'Hlavní posloupnost ve věku 13,8 miliardy let', core: 'Stabilní fúze vodíku; od vzniku se téměř nezměnila', desc: 'Po 13,8 miliardy let se taková hvězda téměř nevyvinula: žádná hvězda o hmotnosti 0,4 M☉ dosud neopustila hlavní posloupnost.' },
        { phase: 'Main sequence', phaseCs: 'Hlavní posloupnost' }),
      step(0.85, 1.2e11, 3900, 0.06,
        { stage: 'Late main sequence (predicted)', core: 'Helium accumulates; the star slowly brightens and heats up', desc: 'Model prediction for a time far in the future: the star slowly brightens as hydrogen is used up.' },
        { stage: 'Pozdní hlavní posloupnost (předpověď)', core: 'Hromadí se helium; hvězda pomalu zjasňuje a zahřívá se', desc: 'Předpověď modelů pro velmi vzdálenou budoucnost: hvězda s ubývajícím vodíkem pomalu zjasňuje.' },
        { phase: 'Final evolution (predicted)', phaseCs: 'Závěrečný vývoj (předpověď)' }),
      step(1.0, 1.5e11, 10000, 0.0023,
        { stage: 'Helium white dwarf (predicted)', core: 'Inert, electron-degenerate helium core', desc: 'The core is too light to ignite helium, so the star ends as a cooling helium white dwarf.' },
        { stage: 'Heliový bílý trpaslík (předpověď)', core: 'Neaktivní heliové jádro z degenerovaného elektronového plynu', desc: 'Jádro je příliš lehké na zapálení helia, takže hvězda skončí jako chladnoucí heliový bílý trpaslík.' })
    ]
  },

  1: {
    name: '1 M☉ (the Sun)',
    nameCs: '1 M☉ (Slunce)',
    remnantType: 'Carbon–oxygen white dwarf (~0.54 M☉)',
    remnantTypeCs: 'Uhlíkovo-kyslíkový bílý trpaslík (~0,54 M☉)',
    steps: [
      step(0.0, 1e5, 3900, 15,
        { stage: 'Protostar on the Hayashi track', core: 'Contraction and deuterium burning; no hydrogen fusion yet', desc: 'A large, cool, fully convective young star contracting under its own gravity.' },
        { stage: 'Protohvězda na Hayashiho stopě', core: 'Smršťování a hoření deuteria; vodík zatím nefúzuje', desc: 'Velká, chladná, plně konvektivní mladá hvězda smršťující se vlastní gravitací.' },
        { phase: 'Pre-main-sequence contraction', phaseCs: 'Smršťování před hlavní posloupností' }),
      step(0.05, 5e7, 5650, 0.72,
        { stage: 'Zero-age main sequence (ZAMS)', core: 'Hydrogen fusion ignites in the core (proton–proton chain)', desc: 'Hydrostatic equilibrium: the pressure of the hot gas balances gravity.' },
        { stage: 'Hlavní posloupnost nulového věku (ZAMS)', core: 'V jádře se zapaluje fúze vodíku (proton-protonový řetězec)', desc: 'Hydrostatická rovnováha: tlak horkého plynu vyrovnává gravitaci.' },
        { phase: 'Main sequence', phaseCs: 'Hlavní posloupnost' }),
      step(0.4, 4.6e9, 5772, 1.0,
        { stage: 'The Sun today', core: 'Core hydrogen fusion: about 620 million tonnes of hydrogen per second', desc: 'About halfway through its roughly 10-billion-year main-sequence life.' },
        { stage: 'Slunce dnes', core: 'Fúze vodíku v jádře: asi 620 milionů tun vodíku za sekundu', desc: 'Zhruba v polovině svého asi 10 miliard let dlouhého pobytu na hlavní posloupnosti.' },
        { phase: 'Main sequence', phaseCs: 'Hlavní posloupnost' }),
      step(0.78, 10.0e9, 5800, 1.8,
        { stage: 'Terminal-age main sequence (TAMS)', core: 'Hydrogen exhausted at the centre; inert helium core', desc: 'Hydrogen fusion moves into a shell around the helium core.' },
        { stage: 'Konec hlavní posloupnosti (TAMS)', core: 'Vodík ve středu vyčerpán; neaktivní heliové jádro', desc: 'Fúze vodíku se přesouvá do slupky kolem heliového jádra.' },
        { phase: 'Subgiant branch', phaseCs: 'Větev podobrů' }),
      step(0.85, 11.0e9, 5100, 2.5,
        { stage: 'Subgiant', core: 'Hydrogen shell burning around a contracting helium core', desc: 'The envelope expands and cools while luminosity changes little.' },
        { stage: 'Podobr', core: 'Hoření vodíku ve slupce kolem smršťujícího se heliového jádra', desc: 'Obal se rozpíná a chladne, zatímco zářivý výkon se mění jen málo.' },
        { phase: 'Red giant branch', phaseCs: 'Větev červených obrů' }),
      step(0.93, 12.17e9, 3100, 2350,
        { stage: 'Tip of the red giant branch', core: 'Electron-degenerate helium core reaches ~100 million K', desc: 'A red giant of about 170 R☉; Mercury and probably Venus are engulfed.' },
        { stage: 'Vrchol větve červených obrů', core: 'Degenerované heliové jádro dosahuje ~100 milionů K', desc: 'Červený obr o poloměru asi 170 R☉; Merkur a pravděpodobně i Venuše jsou pohlceny.' },
        { phase: 'Helium flash', phaseCs: 'Heliový záblesk' }),
      step(0.94, 12.172e9, 4800, 44,
        { stage: 'Helium flash and horizontal branch (red clump)', core: 'Helium flash, then steady helium fusion (triple-alpha process) in the core', desc: 'The star shrinks and stays about 100 million years in the red clump.' },
        { stage: 'Heliový záblesk a horizontální větev (červený shluk)', core: 'Heliový záblesk, poté stabilní fúze helia (proces 3α) v jádře', desc: 'Hvězda se zmenší a asi 100 milionů let setrvá v oblasti červeného shluku (red clump).' },
        { phase: 'Core helium burning, then AGB', phaseCs: 'Hoření helia v jádře, poté AGB' }),
      step(0.97, 12.30e9, 3000, 5000,
        { stage: 'Asymptotic giant branch (AGB)', core: 'Inert C/O core with helium- and hydrogen-burning shells; thermal pulses', desc: 'Strong winds strip the outer envelope.' },
        { stage: 'Asymptotická větev obrů (AGB)', core: 'Neaktivní jádro C/O se slupkami hořícího helia a vodíku; tepelné pulzy', desc: 'Silný hvězdný vítr odnáší vnější obal.' },
        { phase: 'Envelope ejection', phaseCs: 'Odvržení obalu' }),
      step(0.98, 12.31e9, 100000, 3000,
        { stage: 'Planetary nebula nucleus', core: 'Hot exposed C/O core ionizes the ejected envelope', desc: 'The ejected gas glows as a planetary nebula for a few ten thousand years.' },
        { stage: 'Jádro planetární mlhoviny', core: 'Horké obnažené jádro C/O ionizuje odvržený obal', desc: 'Odvržený plyn září jako planetární mlhovina po několik desítek tisíc let.' },
        { offChart: true, phase: 'White dwarf cooling', phaseCs: 'Chladnutí bílého trpaslíka' }),
      step(1.0, 12.4e9, 20000, 0.026,
        { stage: 'White dwarf', core: 'No fusion; supported by electron degeneracy pressure', desc: 'An Earth-sized remnant that slowly cools and fades over billions of years.' },
        { stage: 'Bílý trpaslík', core: 'Bez fúze; drží ho tlak degenerovaného elektronového plynu', desc: 'Pozůstatek velikosti Země, který miliardy let pomalu chladne a slábne.' })
    ]
  },

  3: {
    name: '3 M☉ (intermediate mass)',
    nameCs: '3 M☉ (střední hmotnost)',
    remnantType: 'Carbon–oxygen white dwarf (~0.73 M☉)',
    remnantTypeCs: 'Uhlíkovo-kyslíkový bílý trpaslík (~0,73 M☉)',
    steps: [
      step(0.0, 1e5, 4500, 80,
        { stage: 'Protostar', core: 'Gravitational contraction', desc: 'A young star contracting towards the main sequence.' },
        { stage: 'Protohvězda', core: 'Gravitační smršťování', desc: 'Mladá hvězda smršťující se k hlavní posloupnosti.' },
        { phase: 'Pre-main-sequence contraction', phaseCs: 'Smršťování před hlavní posloupností' }),
      step(0.05, 3e6, 12200, 80,
        { stage: 'Zero-age main sequence (ZAMS)', core: 'Hydrogen fusion dominated by the CNO cycle in a convective core', desc: 'A late B-type star about 80 times more luminous than the Sun.' },
        { stage: 'Hlavní posloupnost nulového věku (ZAMS)', core: 'Fúze vodíku v konvektivním jádře, převládá cyklus CNO', desc: 'Hvězda pozdního typu B, asi 80krát zářivější než Slunce.' },
        { phase: 'Main sequence', phaseCs: 'Hlavní posloupnost' }),
      step(0.80, 3.5e8, 10500, 160,
        { stage: 'Terminal-age main sequence (TAMS)', core: 'Core hydrogen exhausted', desc: 'The star then crosses the Hertzsprung gap within a few million years.' },
        { stage: 'Konec hlavní posloupnosti (TAMS)', core: 'Vodík v jádře vyčerpán', desc: 'Hvězda poté během několika milionů let přechází Hertzsprungovu mezeru.' },
        { phase: 'Crossing the Hertzsprung gap', phaseCs: 'Přechod Hertzsprungovy mezery' }),
      step(0.85, 3.57e8, 4200, 500,
        { stage: 'Red giant', core: 'Helium ignites quietly in a non-degenerate core (no helium flash)', desc: 'The envelope expands to tens of solar radii.' },
        { stage: 'Červený obr', core: 'Helium se v nedegenerovaném jádře zapaluje klidně (bez heliového záblesku)', desc: 'Obal se rozpíná na desítky slunečních poloměrů.' },
        { phase: 'Core helium burning', phaseCs: 'Hoření helia v jádře' }),
      step(0.92, 3.9e8, 5500, 200,
        { stage: 'Core helium burning (blue loop)', core: 'Helium fusion in the core and hydrogen fusion in a shell', desc: 'The star makes a loop towards higher temperatures; stars of ≳ 4 M☉ cross the instability strip as Cepheids on such loops.' },
        { stage: 'Hoření helia v jádře (modrá smyčka)', core: 'Fúze helia v jádře a vodíku ve slupce', desc: 'Hvězda opisuje smyčku k vyšším teplotám; hvězdy o hmotnosti ≳ 4 M☉ na takových smyčkách procházejí pásem nestability jako cefeidy.' },
        { phase: 'Core helium burning, then AGB', phaseCs: 'Hoření helia v jádře, poté AGB' }),
      step(0.97, 4.25e8, 3200, 6000,
        { stage: 'Asymptotic giant branch (AGB)', core: 'Degenerate C/O core; heavy mass loss (superwind)', desc: 'The envelope is ejected and forms a planetary nebula.' },
        { stage: 'Asymptotická větev obrů (AGB)', core: 'Degenerované jádro C/O; silná ztráta hmoty (supervítr)', desc: 'Obal je odvržen a vytváří planetární mlhovinu.' },
        { phase: 'Envelope ejection, then white dwarf', phaseCs: 'Odvržení obalu, poté bílý trpaslík' }),
      step(1.0, 4.3e8, 25000, 0.047,
        { stage: 'White dwarf', core: 'C/O white dwarf of about 0.73 M☉', desc: 'A compact remnant smaller than Earth, slowly cooling.' },
        { stage: 'Bílý trpaslík', core: 'Bílý trpaslík C/O o hmotnosti asi 0,73 M☉', desc: 'Kompaktní pozůstatek menší než Země, který pomalu chladne.' })
    ]
  },

  15: {
    name: '15 M☉ (massive star)',
    nameCs: '15 M☉ (hmotná hvězda)',
    remnantType: 'Neutron star',
    remnantTypeCs: 'Neutronová hvězda',
    steps: [
      step(0.0, 1e5, 8000, 1000,
        { stage: 'Embedded protostar (accreting)', core: 'Accretion and contraction inside a dense molecular cloud', desc: 'Massive stars reach the main sequence while still accreting and hidden by dust.' },
        { stage: 'Protohvězda v zárodečném oblaku (akreuje)', core: 'Akrece a smršťování uvnitř hustého molekulového oblaku', desc: 'Hmotné hvězdy dosahují hlavní posloupnosti ještě během akrece, skryté v prachu.' },
        { phase: 'Accretion phase', phaseCs: 'Akreční fáze' }),
      step(0.05, 2e5, 31000, 20000,
        { stage: 'Zero-age main sequence (ZAMS)', core: 'CNO cycle in a large convective core', desc: 'An early B-type star emitting most of its light in the ultraviolet.' },
        { stage: 'Hlavní posloupnost nulového věku (ZAMS)', core: 'Cyklus CNO ve velkém konvektivním jádře', desc: 'Hvězda raného typu B, která vyzařuje většinu světla v ultrafialovém oboru.' },
        { phase: 'Main sequence', phaseCs: 'Hlavní posloupnost' }),
      step(0.80, 1.1e7, 24000, 40000,
        { stage: 'Terminal-age main sequence (blue supergiant)', core: 'Core hydrogen exhausted; helium core contracts', desc: 'The star leaves the main sequence as a blue supergiant.' },
        { stage: 'Konec hlavní posloupnosti (modrý veleobr)', core: 'Vodík v jádře vyčerpán; heliové jádro se smršťuje', desc: 'Hvězda opouští hlavní posloupnost jako modrý veleobr.' },
        { phase: 'Crossing the Hertzsprung gap', phaseCs: 'Přechod Hertzsprungovy mezery' }),
      step(0.95, 1.25e7, 3600, 60000,
        { stage: 'Red supergiant (like Betelgeuse)', core: 'Core helium burning; carbon to silicon burning only in the last ~10,000 years', desc: 'A red supergiant several hundred solar radii in size.' },
        { stage: 'Červený veleobr (podobný Betelgeuse)', core: 'Hoření helia v jádře; hoření uhlíku až křemíku jen v posledních ~10 000 letech', desc: 'Červený veleobr o poloměru několika set slunečních poloměrů.' },
        { phase: 'Red supergiant', phaseCs: 'Červený veleobr' }),
      step(0.98, 1.3e7, 6000, 3e8,
        { stage: 'Core-collapse supernova (Type II-P)', core: 'Iron core collapses in a fraction of a second (infall up to ~70,000 km/s); ~3×10⁴⁶ J escapes in neutrinos', desc: 'During the plateau the expanding photosphere shines at roughly 10⁸ L☉ for about 100 days.' },
        { stage: 'Supernova s kolapsem jádra (typ II-P)', core: 'Železné jádro se zhroutí za zlomek sekundy (pád až ~70 000 km/s); ~3×10⁴⁶ J unikne v neutrinech', desc: 'Během plató svítí rozpínající se fotosféra asi 10⁸ L☉ po dobu zhruba 100 dní.' },
        { offChart: true, jump: true }),
      step(1.0, 1.3e7, 1e6, 0.27,
        { stage: 'Neutron star', core: 'Nuclear-density matter supported by neutron degeneracy and nuclear forces', desc: 'A remnant of about 1.4 M☉ and 12 km radius; young neutron stars have surfaces near 10⁶ K, far left of this diagram.' },
        { stage: 'Neutronová hvězda', core: 'Hmota o jaderné hustotě, kterou drží tlak degenerovaných neutronů a jaderné síly', desc: 'Pozůstatek o hmotnosti asi 1,4 M☉ a poloměru 12 km; mladé neutronové hvězdy mají povrch kolem 10⁶ K, daleko vlevo od tohoto diagramu.' },
        { offChart: true, jump: true })
    ]
  },

  25: {
    name: '25 M☉ (very massive star)',
    nameCs: '25 M☉ (velmi hmotná hvězda)',
    remnantType: 'Black hole or neutron star (model-dependent)',
    remnantTypeCs: 'Černá díra nebo neutronová hvězda (závisí na modelu)',
    steps: [
      step(0.0, 5e4, 12000, 5000,
        { stage: 'Embedded protostar (accreting)', core: 'Rapid accretion and contraction', desc: 'Very massive stars form quickly and are hidden by dust while accreting.' },
        { stage: 'Protohvězda v zárodečném oblaku (akreuje)', core: 'Rychlá akrece a smršťování', desc: 'Velmi hmotné hvězdy vznikají rychle a během akrece jsou skryty prachem.' },
        { phase: 'Accretion phase', phaseCs: 'Akreční fáze' }),
      step(0.05, 1e5, 37500, 80000,
        { stage: 'Zero-age main sequence (ZAMS)', core: 'CNO cycle in a large convective core', desc: 'A luminous O-type star with a strong radiation-driven wind.' },
        { stage: 'Hlavní posloupnost nulového věku (ZAMS)', core: 'Cyklus CNO ve velkém konvektivním jádře', desc: 'Zářivá hvězda typu O se silným větrem hnaným tlakem záření.' },
        { phase: 'Main sequence', phaseCs: 'Hlavní posloupnost' }),
      step(0.80, 6.5e6, 28000, 170000,
        { stage: 'Terminal-age main sequence (blue supergiant)', core: 'Core hydrogen exhausted; strong mass loss', desc: 'The star has already lost a noticeable part of its mass in its wind.' },
        { stage: 'Konec hlavní posloupnosti (modrý veleobr)', core: 'Vodík v jádře vyčerpán; silná ztráta hmoty', desc: 'Hvězda už ve větru ztratila znatelnou část své hmotnosti.' },
        { phase: 'Crossing the Hertzsprung gap', phaseCs: 'Přechod Hertzsprungovy mezery' }),
      step(0.95, 7.3e6, 3800, 200000,
        { stage: 'Red supergiant', core: 'Core helium burning, then advanced burning stages', desc: 'A luminous red supergiant; with stronger mass loss or rotation it may instead become a Wolf–Rayet star.' },
        { stage: 'Červený veleobr', core: 'Hoření helia v jádře, pak pokročilé fáze hoření', desc: 'Zářivý červený veleobr; při silnější ztrátě hmoty nebo rotaci se může stát Wolfovou–Rayetovou hvězdou.' },
        { phase: 'Red supergiant', phaseCs: 'Červený veleobr' }),
      step(0.98, 7.5e6, 6000, 3e8,
        { stage: 'Core collapse', core: 'Iron core collapses; whether a supernova succeeds depends on the core structure', desc: 'Stars of this mass may explode as supernovae or collapse to a black hole with a faint or no explosion.' },
        { stage: 'Kolaps jádra', core: 'Železné jádro se hroutí; zda vznikne supernova, závisí na struktuře jádra', desc: 'Hvězdy této hmotnosti mohou vybuchnout jako supernovy, nebo se zhroutit na černou díru se slabým či žádným výbuchem.' },
        { offChart: true, jump: true }),
      step(1.0, 7.5e6, null, null,
        { stage: 'Stellar-mass black hole', core: 'No surface: an event horizon of radius 2GM/c² (~30 km for 10 M☉)', desc: 'A black hole has no photosphere and no place on the H–R diagram; it is seen only through its gravity or accreting matter.' },
        { stage: 'Černá díra hvězdné hmotnosti', core: 'Bez povrchu: horizont událostí o poloměru 2GM/c² (~30 km pro 10 M☉)', desc: 'Černá díra nemá fotosféru ani místo v H–R diagramu; projevuje se jen gravitací nebo akreující hmotou.' },
        { noPhotosphere: true, jump: true })
    ]
  }
};

export const EVOLUTION_MASSES = Object.keys(EVOLUTION_TRACKS).map(Number).sort((a, b) => a - b);

/**
 * State along the track of `massKey` at `progress` (0–1). Teff and L are
 * interpolated in log space between waypoints; the radius follows from
 * Stefan–Boltzmann. Waypoints marked `jump` (supernova, compact remnant) are
 * reached abruptly: the previous state holds until their progress value.
 */
export function getEvolutionState(massKey, progress) {
  const track = EVOLUTION_TRACKS[massKey] || EVOLUTION_TRACKS[1];
  const steps = track.steps;
  const p = Math.max(0, Math.min(1, progress));

  let i = 0;
  while (i < steps.length - 1 && steps[i + 1].progress <= p) i++;
  const s0 = steps[i];
  const s1 = steps[Math.min(i + 1, steps.length - 1)];
  let t = s1 === s0 ? 0 : (p - s0.progress) / (s1.progress - s0.progress);
  if (s1.jump) t = 0;

  // Label: the waypoint itself when close to it, otherwise the phase in progress
  const NEAR = 0.04;
  const nearStep = t < NEAR ? s0 : t > 1 - NEAR ? s1 : null;
  const labels = nearStep
    ? { stage: nearStep.stage, stageCs: nearStep.stageCs }
    : { stage: s0.phase || s0.stage, stageCs: s0.phaseCs || s0.stageCs };
  const info = t < 0.5 ? s0 : s1;

  const base = {
    progress: p,
    ageYears: s0.ageYears + t * (s1.ageYears - s0.ageYears),
    ...labels,
    coreState: info.coreState,
    coreStateCs: info.coreStateCs,
    description: info.description,
    descriptionCs: info.descriptionCs,
    trackName: track.name,
    trackNameCs: track.nameCs,
    remnant: track.remnantType,
    remnantCs: track.remnantTypeCs,
    offChart: Boolean((t < 0.5 ? s0 : s1).offChart)
  };

  if (s0.noPhotosphere) {
    return { ...base, temp: null, lum: null, radius: null, noPhotosphere: true };
  }
  const temp = t === 0 ? s0.temp : 10 ** (Math.log10(s0.temp) + t * (Math.log10(s1.temp) - Math.log10(s0.temp)));
  const lum = t === 0 ? s0.lum : 10 ** (Math.log10(s0.lum) + t * (Math.log10(s1.lum) - Math.log10(s0.lum)));
  const radius = Math.sqrt(lum) * (5772 / temp) ** 2;
  return {
    ...base,
    temp: Math.round(temp),
    lum: Number(lum.toPrecision(3)),
    radius: Number(radius.toPrecision(3))
  };
}
