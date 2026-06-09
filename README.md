# Tech Challenge — Fase 1

Sistema Integrado de Atendimento e Execução de Serviços para uma oficina mecânica. MVP de back-end com foco em gestão de ordens de serviço, clientes e peças, aplicando DDD.

## Stack

- NestJS 11 + TypeScript
- PostgreSQL 16 + TypeORM
- Docker / docker-compose (PostgreSQL + pgAdmin)
- class-validator / class-transformer (validação de DTOs)
- @nestjs/config (variáveis de ambiente)
- Jest (testes)
- Swagger / OpenAPI (documentação da API)

## Pré-requisitos

- Node.js >= 20 (versão fixada em `.nvmrc`: **v22.18.0**)
- npm
- Docker + docker-compose (para subir o PostgreSQL e/ou a stack completa)

> O projeto usa NestJS 11, que **não** roda em Node 18.

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

| Variável           | Padrão              | Descrição            |
| ------------------ | ------------------- | -------------------- |
| `NODE_ENV`         | `development`       | Ambiente de execução |
| `PORT`             | `3000`              | Porta da API         |
| `DB_HOST`          | `localhost`         | Host do PostgreSQL   |
| `DB_PORT`          | `5432`              | Porta do PostgreSQL  |
| `DB_USERNAME`      | `postgres`          | Usuário do banco     |
| `DB_PASSWORD`      | `postgres`          | Senha do banco       |
| `DB_DATABASE`      | `oficina`           | Nome do banco        |
| `PGADMIN_PORT`     | `5050`              | Porta do pgAdmin     |
| `PGADMIN_EMAIL`    | `admin@oficina.com` | Login do pgAdmin     |
| `PGADMIN_PASSWORD` | `admin`             | Senha do pgAdmin     |

> Em ambiente de desenvolvimento, `synchronize` do TypeORM fica ligado (cria/atualiza o schema automaticamente). Em produção fica desligado.

## Como rodar

### Opção A — Stack completa via Docker (recomendado)

Sobe API + PostgreSQL + pgAdmin de uma vez:

```bash
docker compose up --build
```

- API: <http://localhost:3000>
- Swagger: <http://localhost:3000/docs>
- pgAdmin: <http://localhost:5050> (login: `admin@oficina.com` / `admin`)

### Opção B — Localmente (API no host, banco no Docker)

#### 1. Selecione a versão do Node

```bash
nvm install   # instala a versão do .nvmrc (só na primeira vez)
nvm use       # ativa a versão do .nvmrc
```

#### 2. Instale as dependências

```bash
npm install
```

#### 3. Suba o banco (e o pgAdmin)

```bash
docker compose up -d db pgadmin
```

pgAdmin disponível em <http://localhost:5050> (login: `admin@oficina.com` / `admin`).

#### 4. Suba a aplicação

```bash
npm run start:dev   # modo desenvolvimento (watch)
# ou
npm run start       # modo normal
npm run start:prod  # produção (precisa de `npm run build` antes)
```

- API: <http://localhost:3000>
- Swagger: <http://localhost:3000/docs>

## Testes

```bash
npm test            # testes unitários
npm run test:watch  # testes em watch
npm run test:cov    # cobertura
npm run test:e2e    # testes end-to-end
```

## Estrutura

```text
.
├── src/
│   ├── main.ts          # bootstrap: ValidationPipe global + Swagger
│   └── app.module.ts    # ConfigModule + TypeOrmModule (PostgreSQL)
├── test/                # testes e2e
├── Dockerfile           # build multi-stage (Node 22 alpine)
├── docker-compose.yml   # serviços: api + db (postgres:16) + pgadmin
├── .env.example         # template de variáveis de ambiente
└── .nvmrc               # versão do Node (v22.18.0)
```

> Os módulos de domínio (ordens de serviço, clientes, peças) seguindo DDD serão adicionados ao longo da Sprint.

## Grupo

- Nome do grupo: Grupo 66
- Integrantes: Nayara, Pedro, Matheus, Guilherme e Aléxia

## Status

Em desenvolvimento — Sprint 1.
