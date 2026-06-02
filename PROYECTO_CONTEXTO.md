# 📊 Portfolio Analyzer — Contexto del Proyecto

> Pegá este archivo + el App.jsx al inicio de una conversación nueva para continuar sin perder contexto.
> Decile a Claude: "Continuamos un proyecto, adjunto el contexto completo. Leélo antes de hacer cualquier cosa."

---

## 🔑 Estado actual del archivo

- **Archivo principal:** `src/App.jsx` — 2174 líneas
- **API base:** `/api/fmp` ✅ proxy Vercel (migrado desde FMP directo)
- **API Key:** fuera del código — va como variable de entorno `FMP_API_KEY` en Vercel
- **Storage:** `localStorage` ✅ (migrado desde window.storage de Claude.ai)
- **Deploy:** ⚠️ pendiente solo el Paso C (GitHub + Vercel) — el .zip está listo

---

## ✅ Todo lo que está hecho

### App — 7 fases funcionales
| Fase | Descripción |
|------|-------------|
| F1 | Screening fundamental S&P 500 (scores, ratios TTM, top 5 por sector) |
| F2 | Riesgo & Retorno (Sharpe, Beta, Alpha, Sortino, MaxDD — CP y LP) |
| F3 | Correlación (heatmap interactivo, alertas pares >0.75) |
| F4 | Optimización Markowitz (Monte Carlo 4000 sims, MinVar/MaxSharpe/RP/EW) |
| F5 | Cartera propia desde Excel (upload drag&drop, hasta 100 tickers) |
| F6 | Black-Litterman (views builder, matriz posterior, pesos óptimos BL) |
| F7 | Exportación Excel (.xlsx 4 hojas) + PDF (.html profesional) |

### Migraciones y mejoras completadas
- ✅ FMP `/api/v3` → `/stable` (14 endpoints, parsing robusto array/objeto)
- ✅ `window.storage` → `localStorage`
- ✅ Todos los fetch apuntan al proxy `/api/fmp` — API key fuera del front
- ✅ Caché F1: fundamentales 15 días (`sp500_screener_fund_v2`)
- ✅ Caché F2-F4: histórico compartido 7 días (`sp500_hist_prices_v1`)
- ✅ Caché F5: por nombre de cliente 7 días (`sp500_client_{nombre}_v1`)
- ✅ pe / marketCap fallbacks robustecidos
- ✅ historical / ratios-ttm parsing robusto (array o objeto)

### Estructura del proyecto (zip listo para deploy)
```
sp500-screener/
├── api/
│   └── fmp.js          ← proxy serverless (agrega apikey, resuelve CORS)
├── src/
│   ├── App.jsx         ← app completa, 2174 líneas
│   └── main.jsx        ← entry point React
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 💾 Sistema de caché

| Caché | Key localStorage | TTL | Fases |
|-------|-----------------|-----|-------|
| Fundamentales SP500 | `sp500_screener_fund_v2` | 15 días | F1 |
| Histórico de precios | `sp500_hist_prices_v1` | 7 días | F2, F3, F4 |
| Cartera cliente | `sp500_client_{nombre}_v1` | 7 días | F5 |

**Requests FMP (límite: 250/día plan gratuito):**
- Primera sesión completa: ~175–200 req
- Sesiones siguientes dentro de 7 días: ~0 req
- Renovación caché histórico (día 8): ~60 req

---

## 🚀 Único paso pendiente: Fase C — GitHub + Vercel

### GitHub
1. Ir a github.com → **New repository** → nombre: `sp500-screener` → **Create**
2. Descomprimir el .zip descargado
3. En la carpeta `sp500-screener/` abrir terminal (Windows: clic derecho → "Abrir en Terminal"):
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sp500-screener.git
git push -u origin main
```

### Vercel
1. vercel.com → login con GitHub → **Add New Project**
2. Importar `sp500-screener`
3. Configurar:
   - Framework Preset: **Other**
   - Build Command: `npx vite build`
   - Output Directory: `dist`
4. **Environment Variables** → agregar:
   - Name: `FMP_API_KEY`
   - Value: `EYU6AsphaFiWKu14zwsL4Pf8ey1db0mz`
5. **Deploy** → URL lista en ~3 minutos: `sp500-screener.vercel.app`

### Acceso desde cualquier dispositivo
- **Otra PC / sin Claude:** abrir la URL en cualquier browser
- **iPhone:** Safari → URL → "Añadir a pantalla de inicio" → funciona como app nativa
- **Actualizaciones futuras:** modificar App.jsx → `git push` → Vercel redeploya automáticamente

---

## 🏗️ Arquitectura de componentes

```
App (src/App.jsx, 2174 líneas)
├── localStorage cache: lsGet/lsSet/lsDel
│   ├── cacheLoad/Save/Clear         → F1 SP500 (15d)
│   ├── histCacheLoad/Save/Clear     → F2/F3/F4 compartido (7d)
│   └── clientCacheLoad/Save         → F5 cliente (7d)
├── exportToExcel / exportToHTML
├── StartScreen (SP500 mode + Client mode + CEDEAR filter)
├── LoadingScreen
├── CorrelationHeatmap
├── FrontierChart
└── Main results
    ├── Tabs: Fundamentales · Riesgo · Correlación · Optimización · BL
    └── Export bar fija
```

---

## 🎨 Sistema de diseño

**Fondos:** `#020817` base · `#040d1a` header · `#0f172a` cards · `#1e293b` borders
**Texto:** `#f1f5f9` primario · `#475569` secundario
**Positivo:** `#34d399` · **Negativo:** `#f87171` · **Neutro:** `#fbbf24`
**Sectores:** Tech `#38bdf8` · Health `#34d399` · Fin `#fbbf24` · ConsDis `#f97316` · Comms `#a78bfa` · Ind `#60a5fa` · ConsStap `#86efac` · Energy `#fb923c` · Util `#c4b5fd` · RE `#fdba74` · Mat `#4ade80`
**Portafolios:** minVar `#60a5fa` · maxShp `#fbbf24` · rp `#a78bfa` · ew `#94a3b8` · spy `#f87171` · bl `#818cf8`

---

## ⚠️ Notas técnicas

1. **Proxy:** `api/fmp.js` recibe `?path=endpoint&param=x`, agrega `apikey` desde env var, llama a FMP
2. **localStorage size:** ~2–4 MB por sesión. Límite browser ~5–10 MB. `lsSet` tiene try/catch.
3. **pe fallback:** `(q?.pe > 0) ? q.pe : r.peRatioTTM`
4. **marketCap fallback:** ordena por posición en índice si no viene en batch-quote
5. **historical parsing:** `Array.isArray(d) ? d : (d.historical || [])`
6. **ratios-ttm parsing:** `Array.isArray(d) ? d[0] : d`
7. **Markowitz:** proyección iterativa 20 iter para respetar min/max weights
8. **BL sin views:** retorna portafolio de equilibrio market-cap weighted

---

## 📋 Instrucción para nueva conversación

```
Continuamos un proyecto. Adjunto contexto completo (PROYECTO_CONTEXTO.md)
y código actual (src/App.jsx, 2174 líneas).
Leé solo el .md antes de empezar.

Estado: app completa y deployable. El .zip con toda la estructura está listo.
Solo falta el Paso C (GitHub + Vercel) que es manual.
Si hay algo nuevo que implementar, trabajar sobre App.jsx directamente.
```

---

*Actualizado: Junio 2026 · 7/7 fases ✅ · API /stable ✅ · localStorage ✅ · Proxy Vercel ✅ · Caché completo ✅ · ZIP listo ✅ · Pendiente: solo GitHub + Vercel (manual)*
