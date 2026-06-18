let cache = { time: 0, data: null, status: 200 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  const now = Date.now();
  if (cache.data && now - cache.time < 60000) {
    return res.status(cache.status || 200).json(cache.data);
  }

  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Missing FOOTBALL_DATA_TOKEN' });
  }

  try {
    const season = req.query.season || '2026';
    const url = `https://api.football-data.org/v4/competitions/WC/matches?season=${season}`;
    const upstream = await fetch(url, { headers: { 'X-Auth-Token': token } });
    const data = await upstream.json();

    // Nếu Football-Data báo hết hạn ngạch, trả lại cache cũ để trang không bị trống.
    if (upstream.status === 429 && cache.data) {
      return res.status(200).json(cache.data);
    }

    cache = { time: now, data, status: upstream.status };
    return res.status(upstream.status).json(data);
  } catch (error) {
    if (cache.data) return res.status(200).json(cache.data);
    return res.status(500).json({ error: 'Failed to fetch matches', message: error.message });
  }
}
