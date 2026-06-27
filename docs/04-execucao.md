# 4 · Execução do Projeto

> [← Voltar ao índice](./README.md)

## Pré-requisitos

| Ferramenta | Versão | Observação |
| ---------- | ------ | ---------- |
| [nvm](https://github.com/nvm-sh/nvm) | — | **Fortemente recomendado** — garante a versão correta do Node |
| Node.js | `>= 20` (fixado em `.nvmrc`: **v22.18.0**) | NestJS 11 **não** roda em Node 18 |
| npm | — | Gerenciador de pacotes |
| Docker + Docker Compose | — | Sobe PostgreSQL e pgAdmin |

> Use `nvm install && nvm use` na raiz do projeto para alinhar a versão do Node com o `.nvmrc`.

## Variáveis de ambiente

Copie `.env.example` para `.env` na raiz e preencha os valores:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=oficina
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oficina"

# pgAdmin
PGADMIN_PORT=5050
PGADMIN_EMAIL=admin@oficina.com
PGADMIN_PASSWORD=admin

# JWT
JWT_ACCESS_SECRET=troque-este-segredo
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=troque-este-outro-segredo
JWT_REFRESH_EXPIRES_IN=7d
```

| Variável | Padrão | Descrição |
| -------- | ------ | --------- |
| `NODE_ENV` | `development` | Ambiente de execução |
| `PORT` | `3000` | Porta da API |
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_USERNAME` | `postgres` | Usuário do PostgreSQL |
| `DB_PASSWORD` | `postgres` | Senha do PostgreSQL |
| `DB_DATABASE` | `oficina` | Nome do banco |
| `DATABASE_URL` | — | URL de conexão usada pelo Prisma |
| `PGADMIN_PORT` | `5050` | Porta do pgAdmin |
| `PGADMIN_EMAIL` | `admin@oficina.com` | Login do pgAdmin |
| `PGADMIN_PASSWORD` | `admin` | Senha do pgAdmin |
| `JWT_ACCESS_SECRET` | — | Segredo do access token |
| `JWT_ACCESS_EXPIRES_IN` | — | Expiração do access token (ex.: `15m`) |
| `JWT_REFRESH_SECRET` | — | Segredo do refresh token |
| `JWT_REFRESH_EXPIRES_IN` | — | Expiração do refresh token (ex.: `7d`) |

## Execução em desenvolvimento (recomendado)

O banco roda no Docker e a API roda localmente com **hot reload**.

```bash
# 1. Versão do Node
nvm install && nvm use

# 2. Dependências
npm install

# 3. Gera o Prisma Client (necessário para compilar/rodar)
npx prisma generate

# 4. .env (ver seção acima)
cp .env.example .env

# 5. Sobe PostgreSQL + pgAdmin
docker compose up -d

# 6. Aplica as migrations e sobe a API
npx prisma migrate deploy
npm run start:dev

# 7. (Opcional) Carga inicial de dados
npm run db:seed
```

- **API:** <http://localhost:3000>
- **Swagger:** <http://localhost:3000/docs>
- **pgAdmin:** <http://localhost:5050> (login: `admin@oficina.com` / `admin`)

> O script `npm run start:dev` já executa `prisma migrate deploy` antes de iniciar a API.
> Atalho: `npm run dev` sobe o Postgres (`--wait`) e a API em um único comando.
> ⚠️ Rode `npx prisma generate` ao menos uma vez após `npm install` (e sempre que alterar o `schema.prisma`) — o Prisma Client é **gerado**, não versionado. Sem ele, o build e a API falham.

## Execução totalmente em Docker

O `docker-compose.yml` também define o serviço `api` (build via `Dockerfile` multi-stage):

```bash
docker compose up -d --build
```

Isso sobe **PostgreSQL + pgAdmin + API** juntos. A API fica em <http://localhost:3000>.

## Parar e limpar

```bash
docker compose down          # para os containers (mantém os dados)
docker compose down -v       # para os containers e APAGA o volume do banco
docker compose logs -f api   # acompanha os logs da API
docker compose ps            # lista os serviços e seus status
```

## Documentação da API (Swagger)

Com a aplicação no ar, acesse <http://localhost:3000/docs>.

A interface lista todos os endpoints por tag (`auth`, `usuarios`, `clientes`, `veiculos`, `Pecas`, `Insumos`, `Servico`). Para testar rotas protegidas:

1. Faça `POST /auth/login` e copie o `accessToken` da resposta.
2. Clique em **Authorize** e cole **apenas o token** (sem o prefixo `Bearer `).
3. Execute as demais rotas autenticado.

## Banco de dados — comandos úteis

```bash
npx prisma migrate dev --name <descricao>   # cria e aplica uma nova migration
npx prisma migrate deploy                    # aplica migrations existentes
npx prisma migrate reset                     # reseta o banco (apaga tudo e re-aplica)
npm run db:reset                             # atalho para reset --force
npm run db:seed                              # carga inicial (prisma/seed.ts)
npx prisma studio                            # interface visual do banco
npx prisma generate                          # regenera o Prisma Client
```

### Workflow de mudanças no banco

1. Edite `prisma/schema.prisma`.
2. Rode `npx prisma migrate dev --name <descricao>`.
3. Commite `prisma/schema.prisma` + `prisma/migrations/` juntos.

Qualquer integrante que puxar o repositório e rodar `npx prisma migrate deploy` terá o banco atualizado.

## Testes

```bash
npm test            # testes unitários
npm run test:watch  # modo watch
npm run test:cov    # cobertura
npm run test:e2e    # testes end-to-end
```

## Qualidade de código

```bash
npm run lint    # ESLint (--fix)
npm run format  # Prettier
```

## Solução de problemas

| Sintoma | Causa provável | Solução |
| ------- | -------------- | ------- |
| Erro de tipos do `@prisma/client` ou `Cannot find module '.prisma/client'` | Prisma Client não foi gerado | `npx prisma generate` |
| `Can't reach database server at localhost:5432` | PostgreSQL não está no ar | `docker compose up -d` e confira com `docker compose ps` |
| `port is already allocated` (5432 / 3000 / 5050) | Porta ocupada por outro processo/container | Pare o processo conflitante ou ajuste `PORT`/`DB_PORT`/`PGADMIN_PORT` no `.env` |
| Migrations fora de sincronia / erro de schema | Banco em estado inconsistente | `npm run db:reset` (⚠️ apaga os dados) e depois `npm run db:seed` |
| API sobe mas rotas retornam 401 | Falta o token JWT | Faça `POST /auth/login` e use o `accessToken` (ver seção do Swagger acima) |
| Versão do Node incompatível | Node diferente do `.nvmrc` | `nvm install && nvm use` |
