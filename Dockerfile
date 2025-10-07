# Dockerfile (Node 20, reproduzierbar – mit Fallback ohne lockfile)
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# 1) Nur package-Dateien für Cache-Layer
#    -> funktioniert mit oder ohne package-lock.json
COPY package*.json ./

# 2) Install: bevorzugt npm ci (falls lockfile vorhanden), sonst npm install
#    --omit=dev => kleinere Prod-Images
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# 3) Projektcode
COPY . .

# 4) Expose (nur Doku; Railway nutzt $PORT)
EXPOSE 8080

# 5) Start (package.json: "start": "node server/index.js")
CMD ["npm","start"]
