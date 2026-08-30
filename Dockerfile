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
# O schema declara `datasource db` sem `url` — quem fornece a URL para a CLI é
# o prisma.config.ts. Sem ele no runtime, `prisma migrate deploy` falha com
# "datasource.url property is required", derrubando o Job de migration.
COPY --from=build /app/prisma.config.ts ./

USER node

# Roda como o usuário `node` (uid 1000) da imagem base — nunca root.
# Par com o runAsNonRoot/runAsUser dos manifestos K8s.
USER node

EXPOSE 3000

# Só sobe a API: a migration é responsabilidade do Job do K8s (k8s/jobs/) e,
# no compose, do `command` do serviço `api`.
CMD ["node", "dist/main"]
