# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production stage ----
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY prisma.config.ts ./

# Roda como o usuário `node` (uid 1000) da imagem base — nunca root.
# Par com o runAsNonRoot/runAsUser dos manifestos K8s.
USER node

EXPOSE 3000

# Aplica migrations pendentes e sobe a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
