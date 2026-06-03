export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const key = process.env.FMP_API_KEY;
  
  // Diagnóstico temporal — borramos esto después
  if (!key) {
    res.status(200).json({ debug: 'FMP_API_KEY es undefined o vacía' });
    return;
  }

  const { path, ...params } = req.query;
  if (!path) { res.status(400).json({ error: 'path requerido' }); return; }

  const qs = new URLSearchParams({ ...params, apikey: key }).toString();

  try {
    const r = await fetch(`https://financialmodelingprep.com/stable/${path}?${qs}`);
    const text = await r.text();
    try {
      res.status(200).json(JSON.parse(text));
    } catch {
      res.status(200).json({ raw: text.substring(0, 200) });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}