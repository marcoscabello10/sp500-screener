// v3
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { path, ...params } = req.query;
  if (!path) { res.status(400).json({ error: 'path requerido' }); return; }

  const key = process.env.FMP_API_KEY;
  const qs = new URLSearchParams({ ...params, apikey: key }).toString();

  try {
    const url = `https://financialmodelingprep.com/api/v3/${path}?${qs}`;
    const r = await fetch(url);
    const text = await r.text();
    try {
      res.status(200).json(JSON.parse(text));
    } catch {
      res.status(200).json({ raw: text.substring(0, 300) });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
