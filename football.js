// ═══════════════════════════════════════════════════
//  نبأك — Football API Proxy (Vercel Serverless)
//  مفتاح API-Football محمي على السيرفر
// ═══════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60'); // cache دقيقة واحدة

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.FOOTBALL_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'Football API key not configured' });

  // المسار المطلوب مثل /fixtures?live=all
  const { path = '/fixtures', ...params } = req.query;

  // بناء query string
  const qs = new URLSearchParams(params).toString();
  const url = `https://v3.football.api-sports.io${path}${qs ? '?' + qs : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-apisports-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Football proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch football data' });
  }
}
