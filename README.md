# HohlRocks Chat Mini-Server (Express, SSE + JSON)

**Endpunkte**

- `POST /chat` → JSON-Antwort `{ answer }`
- `POST /chat-sse` → **Server-Sent Events** (Streaming). Jede Nachricht enthält `{"delta":"..."}`; Abschluss mit `{"done":true}`.
- `GET /healthz` → `"ok"`

**Env**

- `OPENAI_API_KEY` – dein API-Key
- `OPENAI_MODEL` – optional, Standard: `gpt-4o-mini`
- `ALLOWED_ORIGINS` – kommasepariert, z. B.: `https://hohl.rocks,https://www.hohl.rocks`
- `PORT` – von Railway gesetzt

**Deploy (Railway)**

1. Neues Projekt → „Deploy from repo/zip“. Dieses Verzeichnis deployen.
2. **Variables**: `OPENAI_API_KEY`, `ALLOWED_ORIGINS`, optional `OPENAI_MODEL`.
3. Start-Command: automatisch `npm start` (steht in package.json).
4. Test: `curl -s -N -H "Content-Type: application/json" -d '{"message":"Sag Hallo."}' https://<your>.railway.app/chat-sse`

**CORS**: Der Server akzeptiert nur Origins aus `ALLOWED_ORIGINS`. In Dev (Env leer) ist `*` erlaubt.
