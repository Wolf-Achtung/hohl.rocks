# hohlrocks-chat (Railway)

Minimaler, sicherer Proxy von **hohl.rocks** zum **OpenAI Chat API**.

## Deploy (1–Click über Railway)

1. Neues Projekt auf Railway anlegen → "Deploy from GitHub" (oder Upload deines Repos).
2. **Environment Variables** setzen:
   - `OPENAI_API_KEY` = dein OpenAI API Key
   - `ALLOWED_ORIGINS` = `https://hohl.rocks,https://www.hohl.rocks,http://localhost:5173`
   - (optional) `OPENAI_MODEL` = `gpt-4o-mini`
   - (optional) `RATE_LIMIT_MAX` = `60`
3. Deploy starten. Healthcheck: `GET /health` → `{ ok: true }`.

## API

### `POST /chat`
```json
{
  "q": "Deine Frage",
  "model": "gpt-4o-mini",
  "temperature": 0.3
}
```
**Response**
```json
{
  "answer": "…",
  "model": "gpt-4o-mini",
  "usage": { "prompt_tokens": ..., "completion_tokens": ..., "total_tokens": ... }
}
```

## Frontend (deine Website)
```html
<script>window.CHAT_ENDPOINT='https://<dein-service>.up.railway.app/chat';</script>
```
(Dein bestehendes Chatfeld ruft dann diesen Endpoint auf.)

## Sicherheit
- **CORS** restriktiv: nur definierte `ALLOWED_ORIGINS`
- **Rate Limiting**: default 60 req/min/IP
- **Body Size** limitiert
- **Keine API Keys im Frontend**
