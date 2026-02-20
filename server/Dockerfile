FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY src/db/schema.sql ./dist/db/schema.sql

RUN mkdir -p /data/uploads

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/game.db
ENV UPLOAD_DIR=/data/uploads

EXPOSE 3001

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
