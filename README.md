# Tech Challenge — Fase 1

Sistema Integrado de Atendimento e Execução de Serviços para uma oficina mecânica. MVP de back-end com foco em gestão de ordens de serviço, clientes e peças, aplicando DDD.

## Stack

- NestJS 11 + TypeScript
- PostgreSQL 16 + Prisma ORM
- Docker / docker-compose (API + PostgreSQL + pgAdmin)
- JWT (autenticação)
- class-validator / class-transformer (validação de DTOs)
- @nestjs/config (variáveis de ambiente)
- Jest (testes)
- Swagger / OpenAPI (documentação da API)

## Pré-requisitos

- Docker + Docker Compose (único requisito para o quickstart)
- (Opcional, para rodar a API localmente com hot reload) [nvm](https://github.com/nvm-sh/nvm) e Node v22.18.0

## Quickstart — testar a API em 4 passos

O `docker-compose.yml` sobe **3 serviços**: API, PostgreSQL e pgAdmin. A API roda dentro do container, então não é necessário ter Node instalado localmente para apenas testar.

### 1. Clone o repo e crie o `.env`

```bash
git clone <repo> && cd tech-challenge-fiap
cp .env.example .env
```

Preencha as variáveis JWT no `.env` (qualquer string serve em dev):

```env
JWT_ACCESS_SECRET=dev-access-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oficina
```

> Sem os segredos JWT o login falha (tokens não são assinados).

### 2. Suba tudo via Docker

```bash
docker compose up -d --build
```

Isso sobe:

- **API** em <http://localhost:3000> — Swagger em <http://localhost:3000/docs>
- **PostgreSQL** em `localhost:5432`
- **pgAdmin** em <http://localhost:5050> (login: `admin@oficina.com` / `admin`)

O container da API roda `prisma migrate deploy` automaticamente no boot (cria as tabelas). **Não roda o seed** — isso é um passo manual.

### 3. Popule o banco com dados de teste (seed)

O seed cria usuários, clientes, veículos, peças, insumos e serviços iniciais.

```bash
npm install        # precisa do Node localmente só para esta etapa
npm run db:seed
```

> Alternativa sem Node local: `docker compose exec api npx prisma db seed`

### 4. Faça login e teste no Swagger

Abra <http://localhost:3000/docs>.

1. Em `POST /auth/login`, envie:
   ```json
   { "email": "admin@oficina.com", "senha": "senha123" }
   ```
2. Copie o `accessToken` da resposta.
3. Clique no botão **Authorize** (topo direito) e cole o token (sem o prefixo `Bearer`).
4. Pronto — todos os endpoints protegidos passam a enviar o `Authorization: Bearer <token>` automaticamente.

### Usuários de teste (após o seed)

| Email                          | Senha      | Role         |
| ------------------------------ | ---------- | ------------ |
| `admin@oficina.com`            | `senha123` | `admin`      |
| `joao.mecanico@oficina.com`    | `senha123` | `mecanico`   |
| `carlos.mecanico@oficina.com`  | `senha123` | `mecanico`   |

## Variáveis de ambiente

Use o `.env.example` como referência (`cp .env.example .env`).

| Variável                | Padrão                | Descrição                             |
| ----------------------- | --------------------- | ------------------------------------- |
| `DATABASE_URL`          | —                     | URL de conexão do Prisma              |
| `NODE_ENV`              | `development`         | Ambiente de execução                  |
| `PORT`                  | `3000`                | Porta da API                          |
| `DB_USERNAME`           | `postgres`            | Usuário do PostgreSQL                 |
| `DB_PASSWORD`           | `postgres`            | Senha do PostgreSQL                   |
| `DB_DATABASE`           | `oficina`             | Nome do banco                         |
| `DB_PORT`               | `5432`                | Porta do PostgreSQL                   |
| `PGADMIN_PORT`          | `5050`                | Porta do pgAdmin                      |
| `PGADMIN_EMAIL`         | `admin@oficina.com`   | Login do pgAdmin                      |
| `PGADMIN_PASSWORD`      | `admin`               | Senha do pgAdmin                      |
| `JWT_ACCESS_SECRET`     | —                     | Segredo do access token (obrigatório) |
| `JWT_ACCESS_EXPIRES_IN` | —                     | Ex.: `15m`                            |
| `JWT_REFRESH_SECRET`    | —                     | Segredo do refresh token (obrigatório)|
| `JWT_REFRESH_EXPIRES_IN`| —                     | Ex.: `7d`                             |

## Rodar a API localmente (hot reload)

Use este modo quando estiver desenvolvendo. O banco continua no Docker; a API roda direto no host com `nest start --watch`.

```bash
nvm install && nvm use          # garante Node v22.18.0
npm install
docker compose up -d db pgadmin # sobe só o banco e o pgAdmin
npm run start:dev               # já aplica migrations e sobe a API
npm run db:seed                 # popula o banco (uma vez)
```

## Comandos úteis

```bash
npm run dev                                # docker compose db + start:dev
npm run db:seed                            # popula o banco
npm run db:reset                           # dropa, refaz migrations e reseeda
npx prisma migrate dev --name <descricao>  # cria e aplica uma nova migration
npx prisma migrate deploy                  # aplica migrations existentes
npx prisma studio                          # interface visual para o banco
npx prisma generate                        # regenera o Prisma Client
```

### Workflow de mudanças no banco

1. Edite `prisma/schema.prisma`.
2. Rode `npx prisma migrate dev --name <descricao>`.
3. Commite `prisma/schema.prisma` + `prisma/migrations/` juntos.

Quem puxar o repo e rodar `docker compose up -d --build` (ou `npx prisma migrate deploy` no host) terá o banco atualizado automaticamente.

## Testes

```bash
npm test                # testes unitários
npm run test:watch      # testes em watch
npm run test:cov        # cobertura
npm run test:e2e        # testes end-to-end
```

## Estrutura

```text
.
├── src/
│   ├── auth/                    # login, refresh, logout (JWT)
│   ├── middleware/              # JwtAuthMiddleware (global, com exceções)
│   ├── prisma/                  # PrismaService + PrismaModule (global)
│   ├── domains/                 # módulos de domínio
│   │   ├── usuario/
│   │   ├── veiculo/
│   │   ├── insumos/
│   │   ├── pecas/
│   │   ├── servico/
│   │   └── ordem-servico/
│   ├── main.ts                  # bootstrap: ValidationPipe + Swagger
│   └── app.module.ts            # registro dos módulos + middleware JWT
├── prisma/
│   ├── schema.prisma            # models, enums e relações
│   ├── migrations/              # histórico de migrations (versionado no git)
│   └── seed.ts                  # dados iniciais para dev
├── prisma.config.ts             # configuração do Prisma CLI (v7)
├── Dockerfile                   # build multi-stage para produção
├── docker-compose.yml           # API + PostgreSQL + pgAdmin
└── .nvmrc                       # versão do Node (v22.18.0)
```

## Domínios

| Domínio          | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| `auth`           | Autenticação JWT (login, refresh, logout)      |
| `usuario`        | Gestão de usuários e roles (admin, mecânico)   |
| `veiculo`        | Gestão de veículos vinculados a clientes       |
| `insumos`        | Catálogo / estoque de insumos                  |
| `pecas`          | Catálogo / estoque de peças                    |
| `servico`        | Catálogo de serviços disponíveis               |
| `ordem-servico`  | Ordens de serviço com itens e cálculo de valor |

## Endpoints

- **Públicos:** `GET /`, `POST /auth/login`, `POST /auth/refresh`, `GET /publico/ordens-servico/:id?numDocumento=...` (consulta da OS pelo cliente)
- **Protegidos (Bearer JWT):** todos os demais (`/usuarios`, `/clientes`, `/veiculos`, `/insumos`, `/pecas`, `/servico`, `/ordens-servico`, `/auth/logout`)

Documentação interativa em <http://localhost:3000/docs>.

## Grupo

- **Grupo:** 66
- **Integrantes:** Nayara, Pedro, Matheus, Guilherme e Aléxia
