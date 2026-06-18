export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Missing FOOTBALL_DATA_TOKEN' });
  }

  try {
    const season = req.query.season || '2026';
    const url = `https://api.football-data.org/v4/competitions/WC/matches?season=${season}`;
    const upstream = await fetch(url, {
      headers: { 'X-Auth-Token': token }
    });
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    return res.status(upstream.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch matches', message: error.message });
  }
}
