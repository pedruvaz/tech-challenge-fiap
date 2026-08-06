# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

# ---- Production stage ----
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

USER node

EXPOSE 3000

# Aplica migrations pendentes e sobe a API
CMD ["node", "dist/main"]