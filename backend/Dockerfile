FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY tsconfig.json ./
COPY src src

RUN npm run build

FROM node:20-alpine AS runner

ENV PORT=5000

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/swagger.yaml ./dist/swagger.yaml

EXPOSE 5000
EXPOSE 5050

ENTRYPOINT ["node", "dist/app.js"]