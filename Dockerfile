# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build
# O seed compilado vai junto no dist: em produção não existe ts-node (é
# devDependency e sai no prune abaixo), então `prisma db seed` não funciona
# dentro do container. Rodar no cluster: node dist/prisma/seed.js
RUN npx tsc prisma/seed.ts --outDir dist/prisma --module commonjs     --esModuleInterop --skipLibCheck --target ES2023
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

# Roda como o usuário `node` (uid 1000) da imagem base — nunca root.
# Par com o runAsNonRoot/runAsUser dos manifestos K8s.
USER node

EXPOSE 3000

# Aplica migrations pendentes e sobe a API
CMD ["node", "dist/main"]