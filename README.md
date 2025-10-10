# hohl.rocks — Gold‑Standard++

**Features**
- ✅ **Echtes Streaming** (SSE) von Anthropic `/chat-sse` mit Token‑Forwarding
- ✅ **Model‑Picker + System‑Prompt** (persistiert im Browser)
- ✅ **Tavily‑Recherche** `/api/search` + UI‑Panel
- ✅ **i18n (DE/EN)** — Toggle in der Navigation
- ✅ **Consent‑basierte Analytics** (umami) via `/api/config`
- ✅ **Performance‑Adaptive Bubbles** (FPS‑aware)
- ✅ **Security & Stability**: Helmet, CORS‑Allow‑List, Compression, Rate‑Limit, Healthcheck, Request‑ID, graceful shutdown
- ✅ **Deploy**: Dockerfile, Procfile (Railway), CI (GitHub), Netlify Hinweis

## Start

```bash
npm install
npm start
# http://localhost:8080
```

### ENV Variablen
- `ANTHROPIC_API_KEY` (oder `CLAUDE_API_KEY`), optional `CLAUDE_MODEL`, `ANTHROPIC_VERSION`
- `TAVILY_API_KEY` (für News‑/Websuche), optional `TAVILY_MAX_RESULTS`
- `UMAMI_WEBSITE_ID` und optional `UMAMI_SCRIPT_URL`
- `CORS_ORIGINS` Komma‑Liste erlaubter Origins
- `RATE_LIMIT_PER_MIN` Default 180

## Deploy
- **Railway**: Repo verbinden → Procfile (`web: npm start`) wird erkannt.  
- **Netlify**: Frontend kann als statisch deployt werden; Backend separat (Railway) oder via Docker.  
- **GitHub Actions**: Basis‑CI liegt unter `.github/workflows/ci.yml`.

