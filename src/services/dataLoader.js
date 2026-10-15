/**
 * Stellar Data Loader Service.
 * Fetches decoupled astronomical datasets from static public assets.
 * Keeps data cleanly separated from application code.
 */

export async function loadStellarDatasets() {
  try {
    const base = import.meta.env.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;

    const [famousRes, populationRes, clusterRes, attributionRes] = await Promise.all([
      fetch(`${cleanBase}data/famous_stars.json`),
      fetch(`${cleanBase}data/hyg_stars.json`),
      fetch(`${cleanBase}data/cluster_members.json`),
      fetch(`${cleanBase}data/attribution.json`)
    ]);

    if (!famousRes.ok || !populationRes.ok) {
      throw new Error("Failed to load one or more stellar data files.");
    }

    const famousStars = await famousRes.json();
    const backgroundStars = await populationRes.json();
    const clusterMembers = clusterRes.ok ? await clusterRes.json() : { pleiades: [], hyades: [] };
    const attribution = attributionRes.ok ? await attributionRes.json() : null;

    return {
      famousStars,
      backgroundStars,
      clusterMembers,
      attribution
    };
  } catch (err) {
    console.error("Data loading error:", err);
    throw err;
  }
}
