/**
 * CrisisDataService — fetches live humanitarian data.
 *
 * Sources:
 *   1. HDX (Humanitarian Data Exchange) — dataset metadata for Lebanon IDPs
 *   2. ReliefWeb — latest humanitarian reports (via server proxy, optional)
 *   3. UNHCR — refugee population statistics
 *
 * HDX and UNHCR are called directly (both serve Access-Control-Allow-Origin: *).
 * ReliefWeb RSS requires a server proxy (no CORS); if unavailable it degrades gracefully.
 */

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const HDX_URL =
  'https://data.humdata.org/api/3/action/package_search?q=lebanon+idp&rows=6';
const UNHCR_URL =
  'https://api.unhcr.org/population/v1/population/?limit=100&year=2023&coa=LEB&coo_all=true';

class CrisisDataService {
  constructor() {
    this._cache = new Map();
  }

  /* ── private helpers ── */

  _getCached(key) {
    const entry = this._cache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    return null;
  }

  _setCache(key, data) {
    this._cache.set(key, { data, ts: Date.now() });
  }

  async _fetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  /* ── public methods ── */

  /**
   * HDX — Lebanon IDP dataset search (direct call, CORS-safe).
   */
  async getHDXData() {
    const key = 'hdx';
    const cached = this._getCached(key);
    if (cached) return cached;

    const raw = await this._fetch(HDX_URL);
    const result = raw.result || {};
    const datasets = (result.results || []).slice(0, 6).map((pkg) => ({
      title: pkg.title,
      org: pkg.organization?.title || 'Unknown',
      updated: pkg.metadata_modified?.split('T')[0],
      resources: pkg.num_resources,
      url: `https://data.humdata.org/dataset/${pkg.name}`,
      notes: pkg.notes?.slice(0, 160),
    }));
    const data = { count: result.count || 0, datasets };
    this._setCache(key, data);
    return data;
  }

  /**
   * ReliefWeb — latest Lebanon humanitarian reports.
   * Tries our server proxy first (parses RSS server-side).
   * Returns [] if the proxy is unavailable (e.g. static hosting).
   */
  async getReliefWebReports() {
    const key = 'reliefweb';
    const cached = this._getCached(key);
    if (cached) return cached;

    try {
      const raw = await this._fetch('/api/crisis/reliefweb');
      const data = (raw.data || []).slice(0, 6).map((item) => ({
        title: item.title,
        date: item.pubDate
          ? new Date(item.pubDate).toISOString().split('T')[0]
          : '',
        source: 'ReliefWeb',
        url: item.link,
        summary: item.description?.slice(0, 180),
      }));
      this._setCache(key, data);
      return data;
    } catch {
      // Proxy not available (static hosting) — degrade gracefully
      this._setCache(key, []);
      return [];
    }
  }

  /**
   * UNHCR — Lebanon refugee population statistics (direct call, CORS-safe).
   */
  async getUNHCRData() {
    const key = 'unhcr';
    const cached = this._getCached(key);
    if (cached) return cached;

    const raw = await this._fetch(UNHCR_URL);
    const items = raw.items || [];
    let totalRefugees = 0;
    const byOrigin = [];

    for (const item of items) {
      const count = Number(item.refugees) || 0;
      totalRefugees += count;
      if (count > 0) {
        byOrigin.push({ origin: item.coo_name || 'Unknown', count });
      }
    }
    byOrigin.sort((a, b) => b.count - a.count);

    const data = {
      totalRefugees,
      byOrigin: byOrigin.slice(0, 8),
      year: items[0]?.year || new Date().getFullYear(),
    };
    this._setCache(key, data);
    return data;
  }

  /**
   * Aggregated overview — fetches all sources in parallel,
   * returns a summary object even if some sources fail.
   */
  async getOverview() {
    const [hdx, reliefweb, unhcr] = await Promise.allSettled([
      this.getHDXData(),
      this.getReliefWebReports(),
      this.getUNHCRData(),
    ]);

    return {
      hdx: hdx.status === 'fulfilled' ? hdx.value : null,
      reliefweb: reliefweb.status === 'fulfilled' ? reliefweb.value : null,
      unhcr: unhcr.status === 'fulfilled' ? unhcr.value : null,
    };
  }

  clearCache() {
    this._cache.clear();
  }
}

// Singleton
const crisisDataService = new CrisisDataService();
export default crisisDataService;
