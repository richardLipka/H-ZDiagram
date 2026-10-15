# Hertzsprung–Russell Stellar Cartography & Astrophysics Simulator
## Complete User Guide & Educational Documentation

Author: **[Richard Lipka](https://home.zcu.cz/~lipka/)**  
Homepage: [https://home.zcu.cz/~lipka/](https://home.zcu.cz/~lipka/)  
License: [MIT License](../LICENSE)

---

## 1. Introduction to the Hertzsprung–Russell Diagram

The **Hertzsprung–Russell (H–R) diagram** is the central analytical tool of stellar astrophysics, independently developed around 1910 by Ejnar Hertzsprung and Henry Norris Russell. It plots:
- **Vertical Axis:** Stellar **Luminosity** ($L / L_\odot$, logarithmic scale from $10^{-5}$ up to $10^{6}$) and **Absolute Visual Magnitude** ($M_V$, inverted scale from $+20$ at the bottom to $-10$ at the top).
- **Horizontal Axis:** **Effective Surface Temperature** ($T_{\text{eff}}$ in Kelvin, reversed so hotter stars are on the left and cooler stars are on the right, from $45{,}000\,\text{K}$ down to $2{,}000\,\text{K}$) and **Harvard Spectral Classification** (O, B, A, F, G, K, M).

Because stars spend ~90% of their lifespans converting hydrogen into helium in their cores, most stars lie along a continuous diagonal band known as the **Main Sequence (Class V)**. When stars deplete their core hydrogen, they expand into **Giants (Class III)** and **Supergiants (Class I)**, or eventually contract into degenerate **White Dwarfs (Class D)**.

---

## 2. Navigating the Simulator

### 2.1 The Tactical Astrometrics Viewport
The central canvas displays the interactive diagram.
- **Fixed & Stable Viewport:** The canvas is calibrated to fit galactic standard coordinates cleanly without drifting.
- **Panning:** Left-click and drag anywhere on the canvas to inspect dense regions of the plot.
- **Zooming:**
  - Click the **`[+]`** button (top-right of canvas) to magnify.
  - Click the **`[-]`** button to demagnify.
  - Alternatively, hold **`Ctrl`** while scrolling your mouse wheel or using a trackpad pinch gesture.
  - Click **`[ RECALIBRATE ]`** at any time to return to default scale (1.00x) and center coordinates.
- **Target Acquisition (Hover):** Moving the cursor over benchmark stars highlights them with a crosshair reticle and displays the HUD target tooltip with instantaneous telemetry.
- **Target Lock (Click):** Left-clicking a star locks onto it, opening the **Star Inspector** on the right side.

---

## 3. Mission Modes & How to Use Them

### 3.1 Mode 01: EXPLORE (Astrometric Exploration)
The Explore mode is the primary research and survey module.

#### Left Sidebar Controls:
1. **Astrometric Search Scan:**
   - Type any star name (e.g. `Sol`, `Sirius`, `Betelgeuse`, `Rigel`, `Vega`, `TRAPPIST-1`, `Aldebaran`, `Polaris`).
   - Click the star in the auto-complete dropdown to immediately lock target coordinates.
2. **Spectral Bandpass Filter:**
   - Click any class button (**O**, **B**, **A**, **F**, **G**, **K**, **M**, **D**, or **ALL**) to isolate stars by thermal class.
3. **Sensor Overlay Channels:**
   - **Hipparcos Census (6,500 Stars):** Toggle the deep observational background population sampled from the European Space Agency's Hipparcos catalog.
   - **Astrophysical Zones & Instability:** Display colored corridors for the Main Sequence, the Instability Strip (Cepheid and RR Lyrae pulsating variables), Red Giant Branch, and White Dwarf cooling track.
   - **Radial Contours (Isoradii):** Toggle diagonal dashed lines of constant physical radius ($0.001\,R_\odot$, $0.01\,R_\odot$, $0.1\,R_\odot$, $1.0\,R_\odot$, $10\,R_\odot$, $100\,R_\odot$, $1000\,R_\odot$).
   - **Tactical Identifiers on All Stars:** Show permanent labels on all prominent stars.
   - **Exoplanetary Host Stars Only:** Filter for stars known to harbor exoplanets.

#### Right Sidebar: Star Inspector Drawer
When a star is selected, the inspector reveals:
- **Photosphere Sensor Chamber:** True blackbody color rendition and visual scale.
- **Biosignature Scan & Circumstellar Habitable Zone:** Graphic scale showing the Goldilocks zone in Astronomical Units (AU) where liquid water can exist, along with confirmed exoplanet counts.
- **Astrophysical Telemetry Matrix:** Luminosity ($L_\odot$), radius ($R_\odot$), estimated mass ($M_\odot$), absolute visual magnitude ($M_V$), distance from Earth (light-years), and estimated main-sequence lifetime.
- **Variable Star Pulsation Data:** Measured pulsation periods in standard days for variable stars like Betelgeuse, Delta Cephei, or RR Lyrae.
- **Historical & Astrometric Logs:** Scientific trivia, historical observations, and planetary system facts.
- **External Catalogues & Encyclopedic Archives:** One-click direct links to:
  - **Wikipedia:** Direct canonical articles (with 50+ disambiguated aliases) or intelligent Wikipedia search.
  - **SIMBAD (CDS Strasbourg):** Deep astronomical database query using Hipparcos (HIP) catalog numbers or Bayer designations.
  - **ESA Hipparcos Catalogue (VizieR):** Official astrometric records from the Hipparcos mission.
  - **NASA Exoplanet Archive (Caltech/IPAC):** Confirmed exoplanet planetary system dossiers.
  - **NASA ADS (Astrophysics Data System):** Peer-reviewed literature and observational studies.
- **Add to Compare:** Adds the star to the Comparator module.

---

### 3.2 Mode 02: EVOLUTION (Stellar Lifecycle Sandbox)
This mode models how stars evolve through time depending on their birth mass.

#### How to use:
1. Switch to `[ 02 // EVOLUTION ]` in the top navigation.
2. Select a **Birth Mass** from the preset buttons:
   - **0.8 $M_\odot$ (K/M Red Dwarf):** Long-lived dwarf, spends >20 billion years on the Main Sequence, ends as a helium white dwarf.
   - **1.0 $M_\odot$ (Solar Twin / Sun):** Spends ~10 billion years on the Main Sequence, ascends the Red Giant Branch, undergoes helium core flash, expels a planetary nebula, and leaves a carbon-oxygen White Dwarf.
   - **3.0 $M_\odot$ (Intermediate Mass Star):** Rapid evolution, enters the Instability Strip, undergoes thermal pulses, and sheds outer layers.
   - **5.0 $M_\odot$ (B-type Star):** Powerful blue star evolving horizontally across the diagram into a massive red giant.
   - **20.0 $M_\odot$ (High-Mass Supergiant):** Extremely short lifespan (~8 million years), loops through blue and red supergiant phases, ending in a catastrophic Type II Core-Collapse Supernova leaving a neutron star or black hole.
3. Drag the **Timeline Scrubber** or click the **Play** button to watch the star move across the diagram.
4. Watch the real-time crosshair reticle on the canvas track the star's path while the Photosphere preview displays changes in size, temperature, and color.

---

### 3.3 Mode 03: CLUSTERS (Isochrone & Age Dating)
Star clusters are nature's stellar laboratories: all stars in a cluster formed at the same time and distance from the same gas cloud.

#### How to use:
1. Switch to `[ 03 // CLUSTERS ]` in the top navigation.
2. The cyan curve on the diagram represents the theoretical **stellar isochrone**.
3. Move the **Cluster Age Slider** from **50 Myr** up to **13.5 Gyr**:
   - At young ages (50–100 Myr), even massive blue O and B stars remain on the Main Sequence.
   - As age increases, high-mass stars exhaust their core fuel and "peel off" the Main Sequence, turning right toward the Red Giant branch.
   - The point where the Main Sequence terminates is the **Turn-off Point** (marked with a white and cyan target reticle).
4. Use the **Real Clusters Presets**:
   - **Pleiades (Seven Sisters):** ~100 Myr — high turn-off mass (~5 $M_\odot$), bright blue stars dominate.
   - **Hyades:** ~650 Myr — turn-off mass drops to ~2.2 $M_\odot$.
   - **M67 (Solar-Age Open Cluster):** ~4.0 Gyr — turn-off mass is ~1.2 $M_\odot$, closely resembling the future of our Sun.
   - **Globular Clusters (e.g. M13):** ~12.5 Gyr — ancient remnant, turn-off mass $\le 0.85\,M_\odot$.

---

### 3.4 Mode 04: COMPARATOR (Multi-Star Benchmarking)
1. Switch to `[ 04 // COMPARATOR ]` in the top navigation (or click "Add to Compare" from the Star Inspector).
2. Add up to 4 stars to compare side-by-side.
3. Compare:
   - Size differences (e.g., Sol vs. Betelgeuse vs. Sirius B).
   - Habitable zone distance shifts (a habitable planet around an M-dwarf must orbit at 0.05 AU, while around a giant star it would need to orbit at >20 AU).
   - Luminosity ratios (Betelgeuse is over 100,000 times brighter than the Sun).

---

## 4. Educational Classroom Worksheets & Activities

### Activity 1: Verify the Stefan–Boltzmann Law
1. Select **Sol** from the search bar. Note $T_{\text{eff}} = 5778\,\text{K}$ and $L = 1.0\,L_\odot$.
2. Select **Sirius A**. Note $T_{\text{eff}} \approx 9940\,\text{K}$ and $L \approx 25.4\,L_\odot$.
3. Using the formula:
   $$R = \sqrt{L} \times \left(\frac{5778}{T}\right)^2$$
   Calculate $R$ and verify that the Star Inspector displays $R \approx 1.71\,R_\odot$.

### Activity 2: The Red Supergiant Mystery
1. Locate **Betelgeuse** (top-right of the H–R diagram).
2. Observe its temperature: only ~3,600 K (cooler than the Sun, glowing red-orange).
3. Question: *If Betelgeuse is cooler than the Sun, how can its luminosity be over 100,000 times greater?*
4. Solution: The Stefan–Boltzmann law shows $L \propto R^2 T^4$. Because its surface area is gargantuan ($R \approx 764\,R_\odot$, larger than the orbit of Mars and Jupiter), its total radiated flux is immense!

### Activity 3: Dating a Star Cluster
1. Open the **Cluster Simulator**.
2. Set the age to match the **Pleiades** preset.
3. Read the turn-off point: $M_{\text{turnoff}} \approx 5.1\,M_\odot$, $T_{\text{eff}} \approx 16{,}000\,\text{K}$.
4. Explain why there are no red giants with masses $> 6\,M_\odot$ in the Pleiades: *They have already completed their lifecycles and exploded as supernovae millions of years ago!*

---

## 5. Technical Architecture & Data Provenance

- **Coordinate Projection:** Custom logarithmic-to-pixel mapping in `src/utils/coordinates.js`.
- **Blackbody Color Rendering:** Accurate Planckian locus chromaticity transformation in `src/simulation/blackbody.js`.
- **Data Source:** HYG Database v3.8, compiled by David Nash from Hipparcos (ESA), Yale Bright Star Catalogue, and CNS3 Gliese catalogs.
- **Decoupled Datasets:** JSON data files in `/public/data/` asynchronously retrieved via `dataLoader.js`.

---

## 6. Author & Contact

**Richard Lipka**  
Department of Computer Science and Engineering (KIV)  
Faculty of Applied Sciences, University of West Bohemia, Pilsen, Czech Republic  
- Personal Website: [https://home.zcu.cz/~lipka/](https://home.zcu.cz/~lipka/)  
- GitLab / GitHub Projects: [https://github.com/richardLipka](https://github.com/richardLipka)
