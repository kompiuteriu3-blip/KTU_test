# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install deps first for layer caching
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm i --only=production

# Copy source
COPY src ./src

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["node", "src/server.js"]
