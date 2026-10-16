# Hertzsprung–Russell Diagram Studio

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00ff88.svg?style=flat&logo=github)](https://richardlipka.github.io/H-ZDiagram/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00f0ff.svg)](./LICENSE)
[![Author: Richard Lipka](https://img.shields.io/badge/Author-Richard%20Lipka-0088ff.svg)](https://home.zcu.cz/~lipka/)
[![Languages: EN / CS](https://img.shields.io/badge/Languages-EN%20%7C%20CS-ffd700.svg)](https://richardlipka.github.io/H-ZDiagram/)

An interactive Hertzsprung–Russell (H–R) diagram for teaching stellar astrophysics, built on the HYG database (Hipparcos, Yale Bright Star and Gliese catalogues), the Hipparcos new reduction parallaxes and the NASA Exoplanet Archive.

**Live application:** [https://richardlipka.github.io/H-ZDiagram/](https://richardlipka.github.io/H-ZDiagram/)
**Languages:** English and Czech.
**Author:** [Richard Lipka](https://home.zcu.cz/~lipka/)

---

## Overview

The H–R diagram plots stellar luminosity *L/L☉* against effective temperature *T*<sub>eff</sub> (temperature decreasing to the right). The application lets you:

- explore **7,475 Hipparcos stars** with parallax errors below 10 % (all points interactively hoverable and clickable for inspection), plus about 400 stars with proper names and about 60 benchmark objects with literature values;
- **search any star online** via CDS Sesame / SIMBAD (e.g. by Bayer designation, HD, HIP, Gliese, or exoplanet host name) to resolve its coordinates, spectral type, photometry, and parallax, and plot it directly on the diagram;
- **create and manage custom star datasets** with manual parameter entry, persistent browser storage, and JSON import/export;
- follow schematic **evolutionary tracks** for initial masses of 0.4, 1, 3, 15 and 25 M☉;
- estimate **cluster ages** from the main-sequence turn-off and compare with Pleiades and Hyades members;
- show **habitable-zone limits** (Kopparapu et al. 2014) and the planets of selected systems;
- compare up to four stars side by side with built-in search and quick-add chips, and solve three short exercises (Academy).

---

## Modes

| Mode | What it does |
| --- | --- |
| **Explore** | Click any star (including Hipparcos background points) or use the search box. The inspector shows a DSS2 sky image (CDS hips2fits), SIMBAD data, a Planck continuum with schematic absorption lines, the energy source in the core, the habitable zone, physical parameters and links to Wikipedia, SIMBAD, VizieR, the NASA Exoplanet Archive and NASA ADS. |
| **Online Search & Custom Stars** | Search the CDS Sesame resolver by any star name or catalog number to calculate $T_{\mathrm{eff}}$, $L/L_\odot$, radius, and spectral classification on the fly, or manually input parameters. Custom stars are plotted with glowing markers and can be saved, exported, or imported as JSON. |
| **Evolution** | Tracks for 0.4, 1, 3, 15 and 25 M☉ from the pre-main sequence to the remnant (white dwarf, neutron star or black hole). The time axis is not to scale. |
| **Clusters** | A schematic isochrone for ages from 50 Myr to 13.5 Gyr; presets: Pleiades (~125 Myr), Hyades (~625 Myr), M67 (~4 Gyr), 47 Tucanae (~12 Gyr). Hipparcos members of the Pleiades and Hyades are overplotted. |
| **Academy** | Find a Sun-like star, a host of a planet in the habitable zone, and a white dwarf. |
| **Compare** | Compare up to four stars: direct search and benchmark quick-adds inside the modal, or one-click toggle in the inspector header. Shows temperature, luminosity, radius, mass, habitable zone, main-sequence lifetime, and exoplanetary systems side by side. |
| **Info & Data Sources** | Comprehensive astrophysical guide and literature citations with direct outbound links to source catalogues (HYG, Hipparcos, NASA Exoplanet Archive, Pecaut & Mamajek, Torres, Kopparapu, NIST ASD, ESO UVES POP, and CDS SIMBAD). |

Diagram layers: Hipparcos background, main sequence and instability strip, lines of constant radius, star names, exoplanet hosts only, Gaia fine structure (equal-mass binary sequence, Jao gap, crystallizing white dwarfs) and compact remnants.

Controls: drag to pan; zoom with the on-canvas buttons or Ctrl + mouse wheel (trackpad pinch); with the diagram focused, arrow keys pan, `+`/`−` zoom and `0` resets the view. Dialogs close with Esc.

---

## Physics and calibrations

**Stefan–Boltzmann law.** With T☉ = 5,772 K (IAU 2015 Resolution B3):

$$\frac{R}{R_\odot} = \sqrt{\frac{L}{L_\odot}}\left(\frac{5772\,\mathrm{K}}{T_\mathrm{eff}}\right)^2$$

**Luminosity axis.** The right axis is the absolute *bolometric* magnitude, $M_\mathrm{bol} = 4.74 - 2.5\log_{10}(L/L_\odot)$ (IAU 2015 Resolution B2). It differs from the visual magnitude $M_V$ by the bolometric correction.

**Stars derived from the catalogue.** For each Hipparcos star:

- $M_V = V + 5\log_{10}(\varpi/100\,\mathrm{mas})$ with parallaxes from van Leeuwen (2007);
- $T_\mathrm{eff}$ from B−V with the Flower (1996) relations as corrected by Torres (2010) for giants and supergiants, from the dwarf colour–temperature sequence of Pecaut & Mamajek (2013) for dwarfs, and from the spectral type for O/B stars and M dwarfs (where B−V is unreliable);
- $L = 10^{-0.4\,(M_V + BC_V - M_{\mathrm{bol},\odot})}$ with bolometric corrections from Torres (2010) or Pecaut & Mamajek (2013);
- masses only for main-sequence stars, from the mass–luminosity relation.

These values are approximate and are marked as such in the inspector; benchmark stars use literature values with references.

**Habitable zone.** Kopparapu et al. (2014, ApJL 787, L29), Table 1, for a 1 Earth-mass planet:

$$S_\mathrm{eff} = S_{\mathrm{eff},\odot} + aT_\star + bT_\star^2 + cT_\star^3 + dT_\star^4,\qquad T_\star = T_\mathrm{eff} - 5780\,\mathrm{K},\qquad d = \sqrt{\frac{L/L_\odot}{S_\mathrm{eff}}}\ \mathrm{AU}$$

The conservative zone runs from the runaway-greenhouse limit ($S_{\mathrm{eff},\odot}$ = 1.107) to the maximum-greenhouse limit (0.356); the optimistic limits are "recent Venus" (1.776) and "early Mars" (0.320). The fits are valid for 2,600–7,200 K; outside this range the application warns that the values are extrapolated. For the Sun the conservative zone is 0.95–1.68 AU.

**Main-sequence lifetime and turn-off.** $t_\mathrm{MS} \approx 10\,\mathrm{Gyr}\,(M/M_\odot)^{-2.5}$; the cluster turn-off mass is its inverse. The main sequence of the isochrone follows the empirical dwarf sequence of Pecaut & Mamajek (2013); the giant branch is schematic.

**Evolutionary tracks.** Rounded waypoints guided by Sackmann, Boothroyd & Kraemer (1993) for the Sun and the Geneva grids of Ekström et al. (2012) for 3–25 M☉, interpolated in log T and log L. White-dwarf masses follow Cummings et al. (2018); the outcome of core collapse of a 25 M☉ star is uncertain (Sukhbold et al. 2016).

---

## Data pipeline

All data are in `public/data/` and are produced by one script:

```bash
npm run data
```

`scripts/buildStellarData.mjs` downloads (and caches in `scripts/.cache/`) the HYG v3.8 catalogue, the Hipparcos new reduction parallaxes (VizieR I/311), the NASA Exoplanet Archive host table and Mamajek's dwarf table, then writes `famous_stars.json`, `hyg_stars.json`, `cluster_members.json` and `attribution.json`. Benchmark stars with literature values and references are kept in `scripts/data/curated_stars.json`; notes and spectral-type corrections for HYG stars are in `scripts/data/star_notes.json`.

---

## Development

Requirements: Node.js 20.19+ or 22.12+ (required by Vite 8).

```bash
git clone https://github.com/richardLipka/H-ZDiagram.git
cd H-ZDiagram
npm install
npm run dev
```

```bash
npm run lint
```

```bash
npm run build
```

The build uses relative asset paths (`base: './'`), so `dist/` can be served from any subdirectory. Pushing to `main` deploys to GitHub Pages.

---

## Licence and attribution

- **Application code:** [MIT License](./LICENSE), © 2026 Richard Lipka.
- **Star data:** the HYG database (David Nash, Astronexus) is licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); the derived files in `public/data/` are distributed under the same licence.
- **Catalogues and literature:** Hipparcos (Perryman et al. 1997), Hipparcos new reduction (van Leeuwen 2007), Yale Bright Star Catalogue (Hoffleit & Warren 1991), CNS3 (Gliese & Jahreiß 1991), NASA Exoplanet Archive (Akeson et al. 2013), Flower (1996), Torres (2010), Pecaut & Mamajek (2013), Kopparapu et al. (2013, 2014), Gaia Collaboration (Babusiaux et al. 2018), Jao et al. (2018), Tremblay et al. (2019). The full list with ADS bibcodes is in the application under *Data sources*.

---

## Author

**Richard Lipka**
Department of Computer Science and Engineering (KIV), University of West Bohemia
Website: [https://home.zcu.cz/~lipka/](https://home.zcu.cz/~lipka/) · GitHub: [@richardLipka](https://github.com/richardLipka)
