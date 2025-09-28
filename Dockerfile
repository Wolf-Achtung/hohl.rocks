# Optional: Dockerfile (Railway kann auch ohne)
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev || true
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm","start"]
