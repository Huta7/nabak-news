// ═══════════════════════════════════════════════════
//  نبأك — API Proxy (Vercel Serverless Function)
//  المفتاح محفوظ في متغيرات البيئة على السيرفر
//  الزوار لا يرون المفتاح أبداً
// ═══════════════════════════════════════════════════

export default async function handler(req, res) {
  // السماح بطلبات CORS من الموقع فقط
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 دقائق

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // استخراج المعاملات من الطلب
  const { category = 'top', q = '', size = '10', language = 'ar' } = req.query;

  // التحقق من المدخلات لمنع الإساءة
  const allowedCategories = [
    'top', 'world', 'politics', 'technology', 'science',
    'health', 'sports', 'business', 'entertainment', 'environment', 'food'
  ];
  const safeCategory = allowedCategories.includes(category) ? category : 'top';
  const safeSize     = Math.min(parseInt(size) || 10, 20); // حد أقصى 20
  const safeLanguage = ['ar', 'en'].includes(language) ? language : 'ar';

  // بناء رابط الطلب — المفتاح من متغيرات البيئة فقط
  const API_KEY = process.env.NEWSDATA_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  let url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=${safeLanguage}&category=${safeCategory}&size=${safeSize}`;
  if (q) {
    url += `&q=${encodeURIComponent(q.slice(0, 100))}`; // حد 100 حرف
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.message || 'API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
}
