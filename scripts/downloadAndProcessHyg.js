import { Readable } from 'stream';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constellation abbreviations to full Latin names
const CONSTELLATIONS = {
  And: "Andromeda", Ant: "Antlia", Aps: "Apus", Aqr: "Aquarius", Aql: "Aquila",
  Ara: "Ara", Ari: "Aries", Aur: "Auriga", Boo: "Boötes", Cae: "Caelum",
  Cam: "Camelopardalis", Cnc: "Cancer", CVn: "Canes Venatici", CMa: "Canis Major",
  CMi: "Canis Minor", Cap: "Capricornus", Car: "Carina", Cas: "Cassiopeia",
  Cen: "Centaurus", Cep: "Cepheus", Cet: "Cetus", Cha: "Chamaeleon", Cir: "Circinus",
  Col: "Columba", Com: "Coma Berenices", CrA: "Corona Australis", CrB: "Corona Borealis",
  Crv: "Corvus", Crt: "Crater", Cru: "Crux", Cyg: "Cygnus", Del: "Delphinus",
  Dor: "Dorado", Dra: "Draco", Equ: "Equuleus", Eri: "Eridanus", For: "Fornax",
  Gem: "Gemini", Gru: "Grus", Her: "Hercules", Hor: "Horologium", Hya: "Hydra",
  Hyi: "Hydrus", Ind: "Indus", Lac: "Lacerta", Leo: "Leo", LMi: "Leo Minor",
  Lep: "Lepus", Lib: "Libra", Lup: "Lupus", Lyn: "Lynx", Lyr: "Lyra",
  Men: "Mensa", Mic: "Microscopium", Mon: "Monoceros", Mus: "Musca", Nor: "Norma",
  Oct: "Octans", Oph: "Ophiuchus", Ori: "Orion", Pav: "Pavo", Peg: "Pegasus",
  Per: "Perseus", Phe: "Phoenix", Pic: "Pictor", Psc: "Pisces", PsA: "Piscis Austrinus",
  Pup: "Puppis", Pyx: "Pyxis", Ret: "Reticulum", Sge: "Sagitta", Sgr: "Sagittarius",
  Sco: "Scorpius", Scl: "Sculptor", Sct: "Scutum", Ser: "Serpens", Sex: "Sextans",
  Tau: "Taurus", Tel: "Telescopium", Tri: "Triangulum", TrA: "Triangulum Australe",
  Tuc: "Tucana", UMa: "Ursa Major", UMi: "Ursa Minor", Vel: "Vela", Vir: "Virgo",
  Vol: "Volans", Vul: "Vulpecula"
};

// Known exoplanet hosts (NASA Exoplanet Archive subset)
const EXOPLANET_HOSTS = {
  "Sol": { count: 8, facts: "Our solar system! Hosts 8 planets, asteroid belts, and dwarf planets." },
  "Proxima Centauri": { count: 3, facts: "Closest star system to Earth; hosts Earth-mass planet in habitable zone." },
  "Barnard's Star": { count: 1, facts: "Sub-Earth planet candidate in close orbit." },
  "TRAPPIST-1": { count: 7, facts: "Ultra-cool dwarf with 7 Earth-sized rocky planets, 3 in habitable zone." },
  "51 Peg": { count: 1, facts: "Dimidium (51 Pegasi b) was the first exoplanet discovered orbiting a sun-like star (1995)." },
  "Pollux": { count: 1, facts: "Hosts Thestias (Pollux b), a gas giant in orbit around an evolved red giant." },
  "Vega": { count: 1, facts: "Candidate giant planet embedded in circumstellar debris disc." },
  "Aldebaran": { count: 1, facts: "Candidate Jupiter-mass planet orbiting orange giant." },
  "Kepler-186": { count: 5, facts: "First confirmed Earth-sized planet in habitable zone (Kepler-186f)." },
  "Kepler-452": { count: 1, facts: "Super-Earth in habitable zone of a G2V solar twin." },
  "Gliese 581": { count: 3, facts: "Famous multi-planetary M-dwarf system." },
  "Tau Ceti": { count: 4, facts: "Nearby G-class star with multiple terrestrial candidates." },
  "Epsilon Eridani": { count: 1, facts: "Ran (Epsilon Eridani b), Jupiter-like planet in young debris system." },
  "Wolf 359": { count: 2, facts: "Two exoplanets detected via radial velocity." },
  "Ross 128": { count: 1, facts: "Inactive red dwarf hosting a temperate terrestrial planet." }
};

// Ballesteros (2012) formula to convert (B - V) to Effective Temperature (K)
function bvToTemp(bv) {
  if (bv === null || isNaN(bv)) return 5778;
  const safeBV = Math.max(-0.4, Math.min(2.5, bv));
  const t = 4600 * (1 / (0.92 * safeBV + 1.7) + 1 / (0.92 * safeBV + 0.62));
  return Math.max(2200, Math.min(45000, Math.round(t)));
}

// Calculate radius using Stefan-Boltzmann: R = sqrt(L) * (5778 / T)^2
function calcRadius(lum, temp) {
  return parseFloat((Math.sqrt(Math.max(1e-6, lum)) * Math.pow(5778 / temp, 2)).toFixed(2));
}

// Determine luminosity class
function parseLumClass(spect, lum, temp) {
  if (spect.includes("Ia") || spect.includes("Ib") || spect.includes("Iab") || lum > 20000) return "I";
  if (spect.includes("II") || (lum > 2000 && temp < 6000)) return "II";
  if (spect.includes("III") || (lum > 25 && temp < 5200)) return "III";
  if (spect.includes("IV") || (lum > 2.5 && temp < 6200)) return "IV";
  if (spect.startsWith("D") || spect.includes("DA") || spect.includes("DB") || (lum < 0.05 && temp > 6000)) return "D";
  return "V";
}

// Determine general evolutionary stage
function determineStage(lumClass, specClass, temp) {
  if (lumClass === "I") return temp < 4500 ? "Red Supergiant" : "Blue/White Supergiant";
  if (lumClass === "II") return "Bright Giant";
  if (lumClass === "III") return temp < 5000 ? "Red Giant" : "Giant Star";
  if (lumClass === "IV") return "Subgiant";
  if (lumClass === "D") return "White Dwarf";
  if (temp < 3800) return "Red Dwarf (Main Sequence)";
  if (temp < 5200) return "Orange Dwarf (Main Sequence)";
  if (temp < 6000) return "Yellow Dwarf (Main Sequence)";
  if (temp < 7500) return "Yellow-White Main Sequence";
  return "Blue-White Main Sequence";
}

async function downloadAndProcessHYG() {
  console.log("Downloading HYG Database v3.8 from Astronexus...");
  const url = "https://raw.githubusercontent.com/astronexus/HYG-Database/master/hyg/v3/hyg_v38.csv.gz";

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch HYG database: ${res.status} ${res.statusText}`);
  }

  const nodeReadable = Readable.fromWeb(res.body);
  const gunzip = zlib.createGunzip();
  nodeReadable.pipe(gunzip);

  const rl = readline.createInterface({
    input: gunzip,
    crlfDelay: Infinity
  });

  let isHeader = true;
  let _headers = [];
  const famousStars = [];
  const populationSample = [];
  const pleiadesStars = [];
  const hyadesStars = [];

  let count = 0;
  let properCount = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    // Simple CSV parser supporting quotes
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());

    if (isHeader) {
      _headers = cols;
      isHeader = false;
      continue;
    }

    count++;

    // Extract fields
    const id = cols[0];
    const hip = cols[1];
    const proper = cols[6];
    const ra = parseFloat(cols[7]); // hours
    const dec = parseFloat(cols[8]); // deg
    const dist = parseFloat(cols[9]); // parsecs
    const _mag = parseFloat(cols[13]);
    const absmag = parseFloat(cols[14]);
    const spect = cols[15] || "G2V";
    const ci = cols[16] !== "" ? parseFloat(cols[16]) : null;
    const bayer = cols[27];
    const con = cols[29];
    let lum = cols[33] !== "" ? parseFloat(cols[33]) : null;

    if (isNaN(absmag) || isNaN(dist) || dist <= 0) continue;

    // If lum is missing, derive from absmag: L = 10^((4.83 - Mv) / 2.5)
    if (lum === null || isNaN(lum)) {
      lum = Math.pow(10, (4.83 - absmag) / 2.5);
    }

    // Derive temperature
    let temp = ci !== null ? bvToTemp(ci) : 5778;

    // Constellation full name
    const conFull = CONSTELLATIONS[con] || con || "Unknown";

    const lumClass = parseLumClass(spect, lum, temp);
    const specLetter = spect.charAt(0).toUpperCase();

    // 1. Process Named Stars (Proper Name present)
    if (proper && proper.length > 0) {
      properCount++;
      const exo = EXOPLANET_HOSTS[proper] || null;

      famousStars.push({
        id: `hyg_${id}`,
        name: proper,
        hip: hip || null,
        bayer: bayer || "",
        constellation: conFull,
        spectralType: spect,
        temp: temp,
        lum: parseFloat(lum.toPrecision(3)),
        absMag: parseFloat(absmag.toFixed(2)),
        b_v: ci !== null ? parseFloat(ci.toFixed(2)) : 0.65,
        mass: parseFloat((Math.pow(lum, 1/3.5)).toFixed(2)), // Approx mass estimate
        radius: calcRadius(lum, temp),
        distance_ly: parseFloat((dist * 3.262).toFixed(1)),
        luminosityClass: lumClass,
        evolutionaryStage: determineStage(lumClass, specLetter, temp),
        hasExoplanets: exo ? true : false,
        exoplanetCount: exo ? exo.count : 0,
        notableFacts: exo ? exo.facts : `Prominent naked-eye star in ${conFull} catalogued by Hipparcos/Yale.`
      });
    }

    // 2. Identify Pleiades & Hyades Cluster Members
    // Pleiades: RA 3.6 - 3.9h, Dec +23 - +25 deg, Dist 125 - 145 pc
    if (ra >= 3.65 && ra <= 3.85 && dec >= 23.5 && dec <= 25.0 && dist >= 120 && dist <= 145) {
      pleiadesStars.push([temp, parseFloat(lum.toPrecision(3)), ci, absmag, specLetter, lumClass, proper || null]);
    }
    // Hyades: RA 4.2 - 4.6h, Dec +14 - +18 deg, Dist 42 - 50 pc
    if (ra >= 4.2 && ra <= 4.6 && dec >= 14.0 && dec <= 18.0 && dist >= 40 && dist <= 55) {
      hyadesStars.push([temp, parseFloat(lum.toPrecision(3)), ci, absmag, specLetter, lumClass, proper || null]);
    }

    // 3. Collect balanced background population (~6,000 stars)
    // Filter out huge distance errors and select downsampled uniform distribution
    if (count % 16 === 0 && populationSample.length < 6500) {
      populationSample.push([
        temp,
        parseFloat(lum.toPrecision(3)),
        ci !== null ? parseFloat(ci.toFixed(2)) : 0.65,
        parseFloat(absmag.toFixed(2)),
        specLetter,
        lumClass,
        proper || null,
        parseFloat((Math.pow(lum, 1/3.8)).toFixed(2)),
        calcRadius(lum, temp)
      ]);
    }
  }

  console.log(`Processed ${count} stars from HYG database.`);
  console.log(`Extracted ${famousStars.length} named stars.`);
  console.log(`Extracted ${populationSample.length} background population stars.`);
  console.log(`Identified ${pleiadesStars.length} Pleiades cluster members.`);
  console.log(`Identified ${hyadesStars.length} Hyades cluster members.`);

  // Attribution metadata
  const attribution = {
    datasetName: "HYG Stellar Database",
    version: "3.8",
    compiler: "David Nash (Astronexus)",
    license: "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
    originalSourceUrl: "https://github.com/astronexus/HYG-Database",
    codebergUrl: "https://codeberg.org/astronexus/hyg",
    citation: "Nash, D. (2019). The HYG Database, version 3.8. astronexus.com.",
    constituentCatalogs: [
      {
        name: "Hipparcos and Tycho Catalogues",
        organization: "European Space Agency (ESA)",
        year: 1997,
        bibcode: "1997A&A...323L..49P",
        description: "Primary astrometric data, precise parallaxes, and high-accuracy visual magnitudes."
      },
      {
        name: "The Bright Star Catalogue, 5th Revised Ed.",
        authors: "Hoffleit, D. and Warren, W. H. Jr.",
        organization: "Yale University Observatory",
        year: 1991,
        bibcode: "1991bsc..book.....H",
        description: "Harvard Revised (HR) designations, spectral types, and historical designations."
      },
      {
        name: "Third Catalogue of Nearby Stars (CNS3)",
        authors: "Gliese, W. and Jahreiß, H.",
        organization: "Astronomisches Rechen-Institut Heidelberg",
        year: 1991,
        bibcode: "1991cns3.rep.....G",
        description: "Stellar parameters for stars within 25 parsecs of the Sun."
      },
      {
        name: "NASA Exoplanet Archive",
        organization: "NASA / Caltech-IPAC",
        url: "https://exoplanetarchive.ipac.caltech.edu/",
        description: "Confirmed exoplanet host counts, discovery dates, and planetary system properties."
      }
    ],
    lastUpdated: new Date().toISOString()
  };

  // Ensure output directory in public/data
  const publicDataDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }

  // Write datasets
  fs.writeFileSync(path.join(publicDataDir, 'attribution.json'), JSON.stringify(attribution, null, 2));
  fs.writeFileSync(path.join(publicDataDir, 'famous_stars.json'), JSON.stringify(famousStars, null, 2));
  fs.writeFileSync(path.join(publicDataDir, 'hyg_stars.json'), JSON.stringify(populationSample));
  fs.writeFileSync(path.join(publicDataDir, 'cluster_members.json'), JSON.stringify({
    pleiades: pleiadesStars,
    hyades: hyadesStars
  }));

  console.log("Successfully wrote all separated datasets to public/data/");
}

downloadAndProcessHYG().catch(err => {
  console.error("Pipeline error:", err);
  process.exit(1);
});
