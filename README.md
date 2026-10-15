# Hertzsprung–Russell (H–R) Stellar Cartography & Astrophysics Simulator

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00ff88.svg?style=flat&logo=github)](https://richardlipka.github.io/H-ZDiagram/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00f0ff.svg)](./LICENSE)
[![Author: Richard Lipka](https://img.shields.io/badge/Author-Richard%20Lipka-0088ff.svg)](https://home.zcu.cz/~lipka/)
[![Languages: EN / CS](https://img.shields.io/badge/Languages-EN%20%7C%20CS%20%F0%9F%87%A8%F0%9F%87%BF-ffd700.svg)](https://richardlipka.github.io/H-ZDiagram/)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vite.dev)

An interactive, high-fidelity astrophysics workstation and stellar cartography simulator based on real observational data from the European Space Agency's Hipparcos and Gaia missions, the Yale Bright Star Catalogue, the Gliese Nearby Star Catalogue (HYG Database v3.8), and the NASA Exoplanet Archive.

🌐 **Live Web Application:** [https://richardlipka.github.io/H-ZDiagram/](https://richardlipka.github.io/H-ZDiagram/)  
🇨🇿 / 🇬🇧 **Bilingual:** Fully localized in Czech and English following Czech Astronomical Society (ČAS) and IAU standards.  
👨‍🏫 **Author:** **[Richard Lipka](https://home.zcu.cz/~lipka/)**

---

## 🌌 Overview

The **Hertzsprung–Russell Diagram** is the cornerstone of modern stellar astrophysics. It plots stellar luminosity ($L / L_\odot$) or absolute visual magnitude ($M_V$) against effective surface temperature ($T_{\text{eff}}$ in Kelvin) or Harvard spectral classification (O, B, A, F, G, K, M).

This application transforms the H–R diagram into an interactive spaceship astrometrics console, allowing students, researchers, and astronomy enthusiasts to:
- Explore the **6,500+ star Hipparcos catalog** alongside prominent benchmark stars (Sol, Sirius A/B, Betelgeuse, Rigel, Vega, TRAPPIST-1, Cygnus X-1, Crab Pulsar, etc.).
- Simulate **stellar evolution** across multiple birth masses ($0.4\,M_\odot$ up to $25\,M_\odot$) from the Zero-Age Main Sequence (ZAMS) to Red Giant, Supernova, and final remnants (**White Dwarfs**, **Neutron Stars / Pulsars**, and **Stellar Black Holes**).
- Inspect real-time **2D Circumstellar Habitable Zones (Kopparapu et al. 2013/2014)** with confirmed exoplanetary orbits (Sol, TRAPPIST-1, Proxima Centauri, Kepler-186) and watch planetary survival as stars evolve.
- Examine **Gaia DR3 Fine-Structure Overlays**: The Jao Gap ($0.35\,M_\odot$ fully convective core boundary), the Equal-Mass Binary Ridge (+$0.75\,\text{mag}$), and White Dwarf Coulomb Crystallization.
- Explore **Relativistic Compact Remnants & Black Holes**: Accretion disks in high-mass X-ray binaries (Cygnus X-1), pulsar magnetospheres, and Chandrasekhar / TOV mass limits.
- Determine the **age of stellar clusters** (Pleiades, Hyades) using real-time isochrones and Main Sequence turn-off points.
- Compare multiple stellar bodies side-by-side with physical parameter telemetry.

---

## 🚀 Interactive Modes & Capabilities

The application provides four dedicated mission modules accessible from the top navigation ribbon:

### 1. `[ 01 // EXPLORE ]` – Astrometric Charting & Star Inspection
- **Interactive High-Resolution Canvas:** Click any star to engage **Target Lock** and open the telemetry inspector.
- **Deep Hipparcos Background Population:** Toggle 6,500 real observational stars from the HYG v3.8 database.
- **Harvard Spectral Bandpass:** Filter stars by spectral class (**O**, **B**, **A**, **F**, **G**, **K**, **M**, and degenerate **D** white dwarfs).
- **Radial Contours (Isoradii):** Diagonal contours of constant stellar radius from $0.001\,R_\odot$ up to $1{,}000\,R_\odot$.
- **Astrophysical Region Corridors:** Overlays of the Main Sequence, the Pulsational Instability Strip (Cepheids/RR Lyrae), Red Giant Branch (RGB), and Supergiant region.
- **Exoplanet Sensor Filter:** Highlight stellar systems with confirmed exoplanets discovered by Kepler, TESS, and radial-velocity surveys.
- **Star Inspector Chamber:** Photosphere visualizer, Stefan-Boltzmann calculations, habitable zone boundaries, distance in light-years, estimated mass, and main-sequence lifetime.
- **Encyclopedic & Scientific Catalogue Links:** Immediate links from any inspected star to its Wikipedia article (with canonical aliases), CDS SIMBAD astronomical database record, ESA Hipparcos Catalogue on VizieR, NASA Exoplanet Archive record, and NASA ADS astrophysics literature.

### 2. `[ 02 // EVOLUTION ]` – Stellar Lifecycle Sandbox
- Choose stellar birth masses: **0.8 $M_\odot$**, **1.0 $M_\odot$ (Solar Twin)**, **3.0 $M_\odot$**, **5.0 $M_\odot$**, and **20.0 $M_\odot$ (Supergiant)**.
- Step through time using the timeline scrubber or click **Play** to animate stellar evolution across millions or billions of years.
- Trace the track directly on the H–R canvas with real-time reticle target lock and track waypoints.
- Monitor core fusion transitions (hydrogen burning, helium flash, asymptotic giant branch, planetary nebula ejection, core-collapse supernova).

### 3. `[ 03 // CLUSTERS ]` – Isochrone Dating & Turn-off Simulator
- Star clusters form coevally from single giant molecular clouds.
- Adjust the cosmic age slider from **50 Myr** to **13.5 Gyr** to watch the Main Sequence turn-off point bend toward the giant branch.
- Inspect real cluster benchmarks: **Pleiades (~100 Myr)**, **Hyades (~650 Myr)**, **M67 (~4.0 Gyr)**, and ancient globular clusters (**~12.5 Gyr**).
- Real-time telemetry readouts for turn-off mass ($M_{\text{turnoff}}$), surface temperature, and transition luminosity.

### 4. `[ 04 // COMPARATOR ]` – Multi-Star Telemetry Comparison
- Compare up to 4 stars simultaneously side-by-side.
- Comparative metric bars for temperature, luminosity, physical radius, and habitable zone boundaries.
- Inspect how our Sun compares against hypergiants like Betelgeuse or compact white dwarfs like Sirius B.

---

## 🎮 Navigation & Canvas Controls

- **Hovering:** Move your cursor over any named star to acquire target coordinates and preview spectral class, temperature, luminosity, and radius.
- **Star Target Lock:** Left-click any star on the diagram or in the search bar dropdown to open the Star Inspector drawer.
- **Canvas Viewport Stability:** The canvas is fixed and stable by default.
  - **Zoom In / Out:** Use the `[+]` and `[-]` buttons on the canvas HUD, or hold `Ctrl + Mouse Wheel` / trackpad pinch.
  - **Pan / Glide:** Click and drag with the left mouse button.
  - **Recalibrate View:** Click the `[ RECALIBRATE ]` button on the canvas HUD to reset zoom and pan back to standard galactic coordinates.
- **Target Jumps:** Jump immediately to representative targets:
  - `SOL (1.0 R☉)` – Standard solar reference.
  - `BETELGEUSE (I)` – Class M red supergiant.
  - `SIRIUS B (WD)` – Degenerate white dwarf.
  - `EXOPLANETS` – TRAPPIST-1, Proxima Centauri, 51 Pegasi, and other exoplanetary hosts.

---

## 📐 Astrophysics & Computational Models

### 1. Stefan–Boltzmann Law & Radius Calculation
Luminosity $L$ is related to radius $R$ and effective temperature $T$ by:
$$\frac{L}{L_\odot} = \left(\frac{R}{R_\odot}\right)^2 \left(\frac{T}{T_\odot}\right)^4$$
Solving for radius:
$$\frac{R}{R_\odot} = \sqrt{\frac{L}{L_\odot}} \left(\frac{5778\,\text{K}}{T}\right)^2$$

### 2. Absolute Visual Magnitude ($M_V$) Conversion
Using the solar absolute magnitude reference ($M_{V,\odot} \approx 4.83$):
$$M_V = 4.83 - 2.5 \log_{10}\left(\frac{L}{L_\odot}\right)$$

### 3. Effective Temperature from $(B - V)$ Color Index
Using Ballesteros' (2012) empirical relation calibrated for the HYG catalog:
$$T_{\text{eff}} = 4600\,\text{K} \cdot \left(\frac{1}{0.92(B - V) + 1.7} + \frac{1}{0.92(B - V) + 0.62}\right)$$

### 4. Circumstellar Habitable Zone (Kasting / Kopparapu Model)
Inner edge (runaway greenhouse) and outer edge (maximum greenhouse):
$$r_{\text{inner}} \approx \sqrt{\frac{L / L_\odot}{1.1}} \quad [\text{AU}], \qquad r_{\text{outer}} \approx \sqrt{\frac{L / L_\odot}{0.53}} \quad [\text{AU}]$$

---

## 🛠️ Technology Stack & Architecture

- **Frontend Core:** React 19, JavaScript (ESM), Vite 8.
- **Canvas Rendering Engine:** Custom 2D Canvas engine with subpixel scaling for High-DPI / Retina displays, logarithmic projection, and `ResizeObserver` lifecycle management.
- **Styling:** Modular Vanilla CSS with CSS custom properties (tactical spaceship astrometrics theme, deep space nebula backgrounds, responsive flexbox layout).
- **Icons:** Lucide React icons.
- **Decoupled Data Pipeline:** Raw datasets (6,500+ stars, cluster catalogs, famous stars) are decoupled in `/public/data/` and loaded asynchronously via `dataLoader.js`.

---

## 💻 Local Installation & Development

### Requirements
- **Node.js** $\ge 20.x$
- **npm** $\ge 10.x$

### Setup
```bash
# Clone the repository
git clone https://github.com/richardLipka/H-ZDiagram.git
cd H-ZDiagram

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173/` in your web browser.

### Production Build
```bash
# Compile and bundle with relative asset paths (compatible with subdirectory hosting)
npm run build

# Preview production build locally
npm run preview
```

The compiled static assets will be output to `./dist/`.

---

## 📄 License & Attribution

- **Application Code:** Released under the [MIT License](./LICENSE). Copyright &copy; 2026 **[Richard Lipka](https://home.zcu.cz/~lipka/)**.
- **Observational Datasets:** 
  - **HYG Database (v3.8):** Compiled by David Nash (Astronexus) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
  - **Hipparcos & Tycho Catalogues:** European Space Agency (ESA, 1997).
  - **Yale Bright Star Catalogue (5th Rev.):** Hoffleit & Warren (Yale University Observatory, 1991).
  - **Catalogue of Nearby Stars (CNS3):** Gliese & Jahreiß (1991).
  - **Exoplanet Records:** NASA / IPAC Exoplanet Archive.

---

## 👤 Author

**Richard Lipka**  
Department of Computer Science and Engineering (KIV), University of West Bohemia  
🌐 Website: [https://home.zcu.cz/~lipka/](https://home.zcu.cz/~lipka/)  
🐙 GitHub: [@richardLipka](https://github.com/richardLipka)
