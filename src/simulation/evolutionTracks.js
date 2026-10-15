/**
 * Stellar evolutionary tracks based on standard stellar astrophysics (MIST / PARSEC models).
 * Allows users to choose an initial stellar mass and trace its trajectory on the H-R diagram
 * from birth to remnant.
 */

export const EVOLUTION_TRACKS = {
  // 1.0 M_sun (Our Sun)
  1.0: {
    name: "1.0 M☉ (Solar Analog)",
    totalLifetimeYears: 12.3e9,
    remnantType: "Carbon-Oxygen White Dwarf",
    steps: [
      {
        progress: 0.0,
        ageYears: 1e5,
        stage: "Protostar (Hayashi Track)",
        temp: 3900,
        lum: 15.0,
        radius: 8.5,
        coreState: "Gravitational contraction, central temp ~1M K (no fusion yet)",
        description: "A cool, bloated gas cloud contracting under self-gravity."
      },
      {
        progress: 0.05,
        ageYears: 5e7,
        stage: "Zero-Age Main Sequence (ZAMS)",
        temp: 5700,
        lum: 0.72,
        radius: 0.88,
        coreState: "Core Hydrogen fusion ignites via Proton-Proton (p-p) chain",
        description: "Reaches hydrostatic equilibrium; nuclear fusion balances gravity."
      },
      {
        progress: 0.40,
        ageYears: 4.6e9,
        stage: "Current Solar State",
        temp: 5778,
        lum: 1.0,
        radius: 1.0,
        coreState: "Steady Core H-fusion: 600M tons of H converted to He per second",
        description: "Midway through its 10-billion-year main sequence phase."
      },
      {
        progress: 0.80,
        ageYears: 10.0e9,
        stage: "Terminal-Age Main Sequence (TAMS)",
        temp: 6000,
        lum: 2.2,
        radius: 1.38,
        coreState: "Core Hydrogen exhausted; inert Helium ash core begins to contract",
        description: "Core contracts while outer hydrogen envelope begins to swell."
      },
      {
        progress: 0.88,
        ageYears: 11.2e9,
        stage: "Subgiant Branch",
        temp: 5000,
        lum: 3.5,
        radius: 2.4,
        coreState: "Hydrogen shell burning around contracting Helium core",
        description: "Star cools and turns redder as outer layers expand."
      },
      {
        progress: 0.94,
        ageYears: 11.8e9,
        stage: "Red Giant Branch (Tip of RGB)",
        temp: 3100,
        lum: 2300,
        radius: 160.0,
        coreState: "Electron-degenerate Helium core reaches critical 100M Kelvin",
        description: "Enormous red giant; engulfs Mercury and Venus, skies turn crimson on Earth."
      },
      {
        progress: 0.95,
        ageYears: 11.801e9,
        stage: "Helium Flash & Horizontal Branch",
        temp: 4800,
        lum: 45.0,
        radius: 9.8,
        coreState: "Explosive ignition of Helium fusion (Triple-alpha process: 3 He -> C)",
        description: "Star contracts and stabilizes as helium burns peacefully in the core."
      },
      {
        progress: 0.98,
        ageYears: 12.0e9,
        stage: "Asymptotic Giant Branch (AGB)",
        temp: 3000,
        lum: 6000,
        radius: 280.0,
        coreState: "Inert Carbon-Oxygen core with burning Helium and Hydrogen shells",
        description: "Thermal pulsations trigger strong stellar winds blowing off the outer mantle."
      },
      {
        progress: 0.99,
        ageYears: 12.02e9,
        stage: "Planetary Nebula Ejection",
        temp: 35000,
        lum: 3000,
        radius: 1.5,
        coreState: "Hot bare Carbon-Oxygen core ionizing the expelled gas envelope",
        description: "Forms a breathtaking planetary nebula glowing in fluorescent colors."
      },
      {
        progress: 1.0,
        ageYears: 12.3e9,
        stage: "White Dwarf Cooling Track",
        temp: 20000,
        lum: 0.015,
        radius: 0.009,
        coreState: "Dead degenerate C-O core supported by electron degeneracy pressure",
        description: "Earth-sized stellar ember slowly radiating residual thermal heat over trillions of years."
      }
    ]
  },

  // 0.4 M_sun (Red Dwarf)
  0.4: {
    name: "0.4 M☉ (Red Dwarf)",
    totalLifetimeYears: 150.0e9,
    remnantType: "Helium White Dwarf",
    steps: [
      {
        progress: 0.0,
        ageYears: 1e6,
        stage: "Protostar",
        temp: 3200,
        lum: 2.0,
        radius: 4.6,
        coreState: "Convective contraction",
        description: "Deeply convective gas ball condensing slowly."
      },
      {
        progress: 0.02,
        ageYears: 2e8,
        stage: "Zero-Age Main Sequence",
        temp: 3600,
        lum: 0.025,
        radius: 0.41,
        coreState: "Hydrogen fusion via p-p chain in fully convective interior",
        description: "Entire star circulates fuel from surface to core, wasting almost nothing."
      },
      {
        progress: 0.80,
        ageYears: 100.0e9,
        stage: "Late Main Sequence",
        temp: 3900,
        lum: 0.06,
        radius: 0.53,
        coreState: "Gradual buildup of Helium throughout the convective envelope",
        description: "Slowly warming up as composition becomes helium-rich."
      },
      {
        progress: 0.98,
        ageYears: 145.0e9,
        stage: "Blue Dwarf Phase",
        temp: 6500,
        lum: 0.35,
        radius: 0.47,
        coreState: "Pure Helium interior nearing exhaustion of remaining Hydrogen",
        description: "Hypothetical stage: star heats up to yellow-white before fusion ceases."
      },
      {
        progress: 1.0,
        ageYears: 150.0e9,
        stage: "Helium White Dwarf",
        temp: 18000,
        lum: 0.008,
        radius: 0.012,
        coreState: "Degenerate Helium core",
        description: "Fades into a cold helium white dwarf without ever passing through a giant phase."
      }
    ]
  },

  // 3.0 M_sun (Intermediate Mass / B-V star)
  3.0: {
    name: "3.0 M☉ (Intermediate Mass)",
    totalLifetimeYears: 420.0e6,
    remnantType: "Massive White Dwarf (CO/ONe)",
    steps: [
      {
        progress: 0.0,
        ageYears: 1e5,
        stage: "Protostar",
        temp: 4500,
        lum: 80.0,
        radius: 14.5,
        coreState: "Rapid gravitational contraction",
        description: "Protostellar collapse with radiative core forming."
      },
      {
        progress: 0.05,
        ageYears: 5e6,
        stage: "Zero-Age Main Sequence",
        temp: 12200,
        lum: 80.0,
        radius: 2.0,
        coreState: "CNO cycle core hydrogen fusion dominates",
        description: "Brilliant blue-white star shining 80 times brighter than the Sun."
      },
      {
        progress: 0.85,
        ageYears: 350.0e6,
        stage: "Main Sequence Turnoff",
        temp: 11000,
        lum: 150.0,
        radius: 3.4,
        coreState: "Core hydrogen exhausted; isothermal helium core",
        description: "Crosses the Hertzsprung gap quickly towards the giant branch."
      },
      {
        progress: 0.92,
        ageYears: 390.0e6,
        stage: "Red Giant Branch",
        temp: 4200,
        lum: 800.0,
        radius: 54.0,
        coreState: "Helium core ignition without degenerate flash (quiescent ignition)",
        description: "Expands into an orange-red giant."
      },
      {
        progress: 0.96,
        ageYears: 410.0e6,
        stage: "Horizontal Branch / Blue Loop",
        temp: 5800,
        lum: 300.0,
        radius: 17.0,
        coreState: "Core Helium fusion + Hydrogen shell burning",
        description: "Loops across the Instability Strip as a classical Cepheid pulsator."
      },
      {
        progress: 0.99,
        ageYears: 419.0e6,
        stage: "AGB & Superwind Ejection",
        temp: 3200,
        lum: 3500.0,
        radius: 190.0,
        coreState: "Degenerate C-O core drives superwinds shedding envelope",
        description: "Heavy mass loss forms an intricate bipolar planetary nebula."
      },
      {
        progress: 1.0,
        ageYears: 420.0e6,
        stage: "White Dwarf",
        temp: 35000,
        lum: 0.04,
        radius: 0.0075,
        coreState: "Degenerate Carbon-Oxygen white dwarf (~0.8 M☉)",
        description: "Extremely dense white dwarf, cooling quietly."
      }
    ]
  },

  // 15.0 M_sun (Massive Star -> Supernova & Neutron Star)
  15.0: {
    name: "15.0 M☉ (Massive Star)",
    totalLifetimeYears: 13.0e6,
    remnantType: "Neutron Star / Pulsar",
    steps: [
      {
        progress: 0.0,
        ageYears: 2e4,
        stage: "Protostar Collapse",
        temp: 8000,
        lum: 1000.0,
        radius: 16.0,
        coreState: "Violent gravitational accretion inside dense molecular cloud",
        description: "Massive gas cocoon heated by intense gravitational contraction."
      },
      {
        progress: 0.05,
        ageYears: 1e5,
        stage: "Zero-Age Main Sequence",
        temp: 30000,
        lum: 25000.0,
        radius: 5.8,
        coreState: "Vigorous CNO cycle H-fusion; massive convective core",
        description: "Luminous class O/B blue star driving powerful stellar radiation."
      },
      {
        progress: 0.85,
        ageYears: 11.0e6,
        stage: "Blue Supergiant",
        temp: 20000,
        lum: 45000.0,
        radius: 17.7,
        coreState: "Core H exhausted; Helium core fusion starts peacefully",
        description: "Expands slightly, glowing with tremendous ultraviolet luminosity."
      },
      {
        progress: 0.95,
        ageYears: 12.6e6,
        stage: "Red Supergiant (Betelgeuse analog)",
        temp: 3500,
        lum: 85000.0,
        radius: 790.0,
        coreState: "Concentric fusion shells: H -> He -> C -> Ne -> O -> Si -> Fe (Iron)",
        description: "Onion-like burning shells inside an enormous bloated red supergiant."
      },
      {
        progress: 0.999,
        ageYears: 12.999e6,
        stage: "Iron Core Collapse & Type II Supernova",
        temp: 40000,
        lum: 100000000.0,
        radius: 50.0,
        coreState: "Iron fusion consumes energy; core collapses at 23% speed of light in 0.1s!",
        description: "Core collapse releases 10^46 joules in neutrinos and an explosive supernova outshining an entire galaxy!"
      },
      {
        progress: 1.0,
        ageYears: 13.0e6,
        stage: "Neutron Star / Pulsar",
        temp: 50000,
        lum: 0.0001,
        radius: 0.00002, // ~14 km!
        coreState: "Nuclear density matter supported by neutron degeneracy pressure",
        description: "City-sized spinning sphere of pure neutrons spinning hundreds of times per second."
      }
    ]
  },

  // 25.0 M_sun (Very Massive Star -> Black Hole)
  25.0: {
    name: "25.0 M☉ (Very Massive Star)",
    totalLifetimeYears: 7.5e6,
    remnantType: "Stellar-Mass Black Hole",
    steps: [
      {
        progress: 0.0,
        ageYears: 1e4,
        stage: "Protostar",
        temp: 12000,
        lum: 5000.0,
        radius: 16.0,
        coreState: "Rapid free-fall collapse",
        description: "Enormous accretion luminosity before clearing circumstellar dust."
      },
      {
        progress: 0.05,
        ageYears: 5e4,
        stage: "Zero-Age Main Sequence",
        temp: 38000,
        lum: 95000.0,
        radius: 7.1,
        coreState: "Extreme CNO burning",
        description: "Blinding blue O-star with ferocious stellar wind stripping its outer layers."
      },
      {
        progress: 0.85,
        ageYears: 6.5e6,
        stage: "Luminous Blue Variable (LBV) / Wolf-Rayet",
        temp: 32000,
        lum: 250000.0,
        radius: 16.0,
        coreState: "Helium core burning, massive envelope shedding",
        description: "Loses its outer hydrogen envelope entirely due to radiation pressure."
      },
      {
        progress: 0.97,
        ageYears: 7.3e6,
        stage: "Wolf-Rayet Star (Bare Core)",
        temp: 48000,
        lum: 300000.0,
        radius: 8.0,
        coreState: "Carbon and Oxygen fusion, intense relativistic winds",
        description: "Exposed naked stellar core burning violently before final collapse."
      },
      {
        progress: 0.999,
        ageYears: 7.499e6,
        stage: "Collapsar / Hypernova",
        temp: 50000,
        lum: 500000000.0,
        radius: 30.0,
        coreState: "Core mass exceeds Tolman-Oppenheimer-Volkoff limit",
        description: "Unstoppable gravitational collapse directly forming an event horizon."
      },
      {
        progress: 1.0,
        ageYears: 7.5e6,
        stage: "Stellar Black Hole",
        temp: 1000, // undetectable Hawking radiation
        lum: 0.000001,
        radius: 0.00004, // Schwarzschild radius ~30km
        coreState: "Gravitational Singularity surrounded by an Event Horizon",
        description: "Spacetime is ruptured; nothing—not even light—can escape."
      }
    ]
  }
};

/**
 * Get interpolated state along an evolutionary track given mass and progress (0.0 to 1.0).
 */
export function getEvolutionState(massKey, progress) {
  const track = EVOLUTION_TRACKS[massKey] || EVOLUTION_TRACKS[1.0];
  const steps = track.steps;
  const clampedProgress = Math.max(0.0, Math.min(1.0, progress));

  // Find surrounding step bracket
  let i = 0;
  while (i < steps.length - 1 && steps[i + 1].progress <= clampedProgress) {
    i++;
  }

  if (i >= steps.length - 1) {
    return { ...steps[steps.length - 1], trackName: track.name, remnant: track.remnantType };
  }

  const s0 = steps[i];
  const s1 = steps[i + 1];
  const t = (clampedProgress - s0.progress) / (s1.progress - s0.progress || 1);

  // Logarithmic interpolation for temperature and luminosity for astrophysical realism
  const logT = Math.log10(s0.temp) * (1 - t) + Math.log10(s1.temp) * t;
  const logL = Math.log10(s0.lum) * (1 - t) + Math.log10(s1.lum) * t;
  const temp = Math.pow(10, logT);
  const lum = Math.pow(10, logL);

  const radius = Math.sqrt(lum) * Math.pow(5778 / temp, 2);
  const ageYears = s0.ageYears * (1 - t) + s1.ageYears * t;

  return {
    progress: clampedProgress,
    ageYears,
    stage: t < 0.5 ? s0.stage : s1.stage,
    temp: Math.round(temp),
    lum: parseFloat(lum.toPrecision(3)),
    radius: radius < 0.01 ? parseFloat(radius.toPrecision(2)) : parseFloat(radius.toFixed(2)),
    coreState: t < 0.5 ? s0.coreState : s1.coreState,
    description: t < 0.5 ? s0.description : s1.description,
    trackName: track.name,
    remnant: track.remnantType
  };
}
