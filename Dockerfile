# Dockerfile (sauber für Railway)
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# 1) Nur package files für Cache-Layer
COPY package.json package-lock.json ./

# 2) Reproduzierbar & schnell
RUN npm ci --omit=dev

# 3) Restlichen Code
COPY . .

# 4) Expose (Dokumentation; Railway nutzt $PORT)
EXPOSE 8080

# 5) Start (falls "start": "node server/index.js" gesetzt ist)
CMD ["npm","start"]
