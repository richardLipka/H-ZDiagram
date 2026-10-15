# Hertzsprung–Russell Diagram Studio
## User guide and classroom activities

Author: **[Richard Lipka](https://home.zcu.cz/~lipka/)** · License: [MIT](../LICENSE) (code), CC BY-SA 4.0 (star data)

---

## 1. The Hertzsprung–Russell diagram

Ejnar Hertzsprung (1905–1911) and Henry Norris Russell (1913–1914) independently discovered that stars do not scatter randomly when brightness is plotted against colour or spectral type. In this application:

- the **vertical axis** shows luminosity $L/L_\odot$ on a logarithmic scale from $10^{-5}$ to $10^{6}$; the right-hand axis gives the equivalent absolute bolometric magnitude $M_\mathrm{bol} = 4.74 - 2.5\log_{10}(L/L_\odot)$;
- the **horizontal axis** shows effective temperature from 45,000 K (left) to 2,000 K (right), with the spectral classes O–M above it.

About 90 % of a star's life is spent fusing hydrogen in the core, on the **main sequence** (luminosity class V). Evolved stars become **subgiants** (IV), **giants** (III), **bright giants** (II) or **supergiants** (I); low- and intermediate-mass stars end as **white dwarfs** (spectral class D).

---

## 2. Controls

- **Pan:** drag the diagram.
- **Zoom:** the `+` / `−` buttons in the lower-left corner of the plot, or Ctrl + mouse wheel (trackpad pinch). **Reset view** restores the default.
- **Keyboard:** focus the diagram (Tab), then arrow keys pan, `+`/`−` zoom and `0` resets. Stars are selected with the search box (↑/↓ and Enter).
- **Hover** a star to see its type, temperature, luminosity and radius; **click** it to open the inspector.
- Dialogs (Compare, Guide, Data sources) close with Esc.

---

## 3. Modes

### 3.1 Explore

**Left panel**

1. *Search stars* — type a name (Sun, Sirius, Betelgeuse, Vega, TRAPPIST-1, …).
2. *Spectral class* — show only O, B, A, F, G, K, M or white dwarfs (D).
3. *Diagram layers*:
   - **Hipparcos stars** — 7,475 stars with parallax errors below 10 % (van Leeuwen 2007);
   - **Regions and instability strip** — main-sequence band and the classical instability strip (Cepheids, RR Lyrae, δ Scuti stars);
   - **Lines of constant radius** — 0.001 to 1000 R☉ (Earth ≈ 0.009 R☉, Jupiter ≈ 0.10 R☉, 1 AU ≈ 215 R☉);
   - **Star names**, **only stars with exoplanets**;
   - **Gaia fine structure** — the equal-mass binary sequence (twice the luminosity, 0.75 mag brighter), the Jao gap near 0.35 M☉ where stars become fully convective (Jao et al. 2018), and crystallizing massive white dwarfs (Tremblay et al. 2019);
   - **Compact remnants** — the neutron star RX J1856.5−3754 (far hotter than the axis allows, shown as an arrow at the left edge) and the O-type donor of the black-hole binary Cygnus X-1.

**Star inspector**

- sky image (DSS2 via CDS hips2fits) or a blackbody-colour model;
- SIMBAD object type, parallax and radial velocity (via CDS Sesame);
- **spectrum** — Planck continuum with schematic absorption lines (Balmer, He I/II, Ca II H & K, Na D, Mg b, Fe I, TiO);
- **core** — energy source for the evolutionary stage (p–p chain, CNO cycle, shell burning, triple-alpha process, degenerate remnant), structure and surface composition, with a reference;
- **habitable zone** — Kopparapu et al. (2014) limits with the planets of the Solar System, TRAPPIST-1, Proxima Centauri, Kepler-186, Pollux and 51 Pegasi; warnings when the model is extrapolated or the star is not on the main sequence;
- **physical parameters** — luminosity, radius, mass, absolute visual magnitude, distance and main-sequence lifetime (main-sequence stars only);
- notes with references, and links to Wikipedia, SIMBAD, VizieR, the NASA Exoplanet Archive and NASA ADS.

Values of benchmark stars come from the literature (references are listed). Values of the other named stars are derived from Hipparcos photometry and parallaxes with standard calibrations and are approximate (see section 5).

### 3.2 Evolution

Choose an initial mass (0.4, 1, 3, 15 or 25 M☉) and move the time slider or press Play. The marker on the diagram, the photosphere, the core process and the habitable zone follow the star.

- **0.4 M☉** — main-sequence lifetime far longer than the age of the Universe; the late stages are model predictions (Laughlin et al. 1997). Ends as a helium white dwarf.
- **1 M☉ (the Sun)** — main sequence for about 10 Gyr, red giant branch (tip ≈ 2,350 L☉, ≈ 170 R☉; Sackmann et al. 1993), helium flash, red clump, asymptotic giant branch, planetary nebula, C/O white dwarf of about 0.54 M☉.
- **3 M☉** — core helium ignites without a flash; blue loop; AGB; C/O white dwarf of about 0.73 M☉ (Cummings et al. 2018).
- **15 M☉** — blue and red supergiant, core-collapse supernova (Type II-P), neutron star.
- **25 M☉** — red supergiant; core collapse may give a supernova or a black hole (Sukhbold et al. 2016).

Waypoints are rounded values guided by published models (Ekström et al. 2012 for 3–25 M☉); the time axis is not to scale. Objects outside the diagram (planetary-nebula nucleus, supernova, neutron star) are pinned to its edge and labelled "off scale"; a black hole has no photosphere and no place on the diagram.

### 3.3 Clusters

The stars of a cluster formed at nearly the same time. Main-sequence lifetime drops steeply with mass, $t_\mathrm{MS} \approx 10\,\mathrm{Gyr}\,(M/M_\odot)^{-2.5}$, so the main sequence of an older cluster ends at a lower mass — the **turn-off point**.

- The slider is logarithmic, from 50 Myr to 13.5 Gyr.
- The solid curve is the main sequence (empirical dwarf sequence of Pecaut & Mamajek 2013); the dashed curve after the turn-off is a schematic giant branch.
- Presets: Pleiades (~125 Myr, Stauffer et al. 1998), Hyades (~625 Myr, Perryman et al. 1998), M67 (~4 Gyr), 47 Tucanae (~12 Gyr).
- Hipparcos members of the Pleiades (ages up to 300 Myr) or the Hyades (300 Myr – 1.5 Gyr) are overplotted, placed at the cluster mean distance from Gaia DR2.

The lifetime scaling overestimates the lifetimes of massive stars, so turn-off masses of young clusters are somewhat too high.

### 3.4 Academy

Three tasks: find a Sun-like main-sequence G star (5,400–6,100 K, 0.7–1.5 L☉), a star with a confirmed planet in its habitable zone, and a white dwarf smaller than 0.03 R☉.

### 3.5 Compare

Up to four stars side by side, with a logarithmic size comparison and a table of temperature, luminosity, radius, mass, habitable zone (main-sequence stars), main-sequence lifetime and number of planets.

---

## 4. Classroom activities

### Activity 1: the Stefan–Boltzmann law

1. Select **Sun (Sol)**: $T_\mathrm{eff} = 5{,}772$ K, $L = 1\,L_\odot$.
2. Select **Sirius A**: $T_\mathrm{eff} = 9{,}940$ K, $L = 25.4\,L_\odot$.
3. Compute $R = \sqrt{L}\,(5772/T)^2 = \sqrt{25.4}\times(5772/9940)^2 \approx 1.70\,R_\odot$ and compare with the inspector (1.71 R☉).
4. Repeat for **Sirius B** ($T = 25{,}000$ K, $L = 0.024\,L_\odot$): $R \approx 0.0081\,R_\odot$, about 5,600 km — the size of the Earth.

### Activity 2: a cool but luminous star

1. Find **Betelgeuse** (upper right).
2. It is cooler than the Sun (≈ 3,600 K) but about 89,000 times more luminous.
3. Since $L \propto R^2 T^4$, its radius must be huge: $R \approx 764\,R_\odot \approx 3.6$ AU, beyond the orbit of Mars.

### Activity 3: dating a cluster

1. Open **Clusters** and choose the **Pleiades** preset.
2. Read the turn-off: about 5.8 M☉, 17,800 K, 1,300 L☉ (from the simplified lifetime relation; detailed isochrones give about 4–5 M☉).
3. Why are there no main-sequence O stars in the Pleiades? Stars more massive than the turn-off mass have already left the main sequence; those above about 8 M☉ have ended as supernovae.
4. Move the slider to 4 Gyr (M67) and to 12 Gyr (47 Tucanae) and watch the turn-off move down the main sequence.

### Activity 4: habitable zones

1. Open **TRAPPIST-1** and look at the habitable-zone diagram: planets e, f and g lie inside the zone, at only 0.03–0.05 AU.
2. Compare with the Sun (0.95–1.68 AU) and explain the difference with $d \propto \sqrt{L}$.

---

## 5. Data provenance

- **Background stars:** HYG v3.8 (Nash) photometry with Hipparcos new-reduction parallaxes (van Leeuwen 2007), only σϖ/ϖ < 10 %.
- **Temperatures and luminosities:** Flower (1996) as corrected by Torres (2010) for giants and supergiants; Pecaut & Mamajek (2013) for dwarfs, O/B stars and M dwarfs; luminosities are bolometric.
- **Planet counts:** NASA Exoplanet Archive (table of composite planet parameters).
- **Benchmark stars:** literature values with references (`scripts/data/curated_stars.json`).
- **Build script:** `npm run data` (`scripts/buildStellarData.mjs`) regenerates everything in `public/data/`.
- **Simplified models:** evolutionary tracks, cluster isochrones and absorption-line strengths are teaching models, not stellar-evolution or radiative-transfer calculations.

---

## 6. Author

**Richard Lipka**, Department of Computer Science and Engineering (KIV), Faculty of Applied Sciences, University of West Bohemia, Pilsen, Czech Republic — [home.zcu.cz/~lipka](https://home.zcu.cz/~lipka/) · [github.com/richardLipka](https://github.com/richardLipka)
