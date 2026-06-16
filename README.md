# Tech Challenge — Fase 1

Sistema Integrado de Atendimento e Execução de Serviços para uma oficina mecânica. MVP de back-end com foco em gestão de ordens de serviço, clientes e peças, aplicando DDD.

## Stack

- NestJS 11 + TypeScript
- PostgreSQL 16 + Prisma ORM
- Docker / docker-compose (PostgreSQL + pgAdmin)
- class-validator / class-transformer (validação de DTOs)
- @nestjs/config (variáveis de ambiente)
- Jest (testes)
- Swagger / OpenAPI (documentação da API)

## Pré-requisitos

- [nvm](https://github.com/nvm-sh/nvm) (**fortemente recomendado** — garante a versão correta do Node)
- Node.js >= 20 (versão fixada em `.nvmrc`: **v22.18.0**)
- npm
- Docker + Docker Compose

> O projeto usa NestJS 11, que **não** roda em Node 18. Use `nvm install && nvm use` para garantir a versão correta.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```env
NODE_ENV=development
PORT=3000

DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=oficina
DB_PORT=5432

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oficina"

PGADMIN_PORT=5050
PGADMIN_EMAIL=admin@oficina.com
PGADMIN_PASSWORD=admin
```

| Variável           | Padrão              | Descrição                        |
| ------------------ | ------------------- | -------------------------------- |
| `DATABASE_URL`     | —                   | URL de conexão do Prisma         |
| `NODE_ENV`         | `development`       | Ambiente de execução             |
| `PORT`             | `3000`              | Porta da API                     |
| `DB_USERNAME`      | `postgres`          | Usuário do PostgreSQL            |
| `DB_PASSWORD`      | `postgres`          | Senha do PostgreSQL              |
| `DB_DATABASE`      | `oficina`           | Nome do banco                    |
| `DB_PORT`          | `5432`              | Porta do PostgreSQL              |
| `PGADMIN_PORT`     | `5050`              | Porta do pgAdmin                 |
| `PGADMIN_EMAIL`    | `admin@oficina.com` | Login do pgAdmin                 |
| `PGADMIN_PASSWORD` | `admin`             | Senha do pgAdmin                 |

## Como rodar (desenvolvimento)

Este é o setup recomendado para o time. O banco roda no Docker e a API roda localmente com hot reload.

### 1. Selecione a versão do Node

```bash
nvm install
nvm use
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Crie o `.env`

Copie o conteúdo da seção acima para um arquivo `.env` na raiz do projeto.

### 4. Suba o banco de dados

```bash
docker compose up -d
```

Isso sobe o PostgreSQL e o pgAdmin. As tabelas são criadas automaticamente via Prisma na primeira vez.

- pgAdmin: <http://localhost:5050> (login: `admin@oficina.com` / `admin`)

### 5. Aplique as migrations e suba a API

```bash
npx prisma migrate deploy   # cria as tabelas no banco
npm run start:dev           # sobe a API com hot reload
```

- API: <http://localhost:3000>
- Swagger: <http://localhost:3000/docs>

### Comandos úteis

```bash
npx prisma migrate dev --name <descricao>   # cria e aplica uma nova migration
npx prisma migrate deploy                   # aplica migrations existentes
npx prisma migrate reset                    # reseta o banco (apaga tudo e re-aplica)
npx prisma studio                           # interface visual para o banco
npx prisma generate                         # regenera o Prisma Client
```

### Como funciona o workflow de mudanças no banco

1. Edite `prisma/schema.prisma`
2. Rode `npx prisma migrate dev --name <descricao>`
3. Commite os arquivos `prisma/schema.prisma` + `prisma/migrations/` juntos

Qualquer colega que puxar o repositório e rodar `npx prisma migrate deploy` terá o banco atualizado automaticamente.

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
│   ├── prisma/
│   │   ├── prisma.service.ts    # PrismaClient como serviço NestJS
│   │   └── prisma.module.ts     # módulo global do Prisma
│   ├── domains/                 # módulos de domínio (em desenvolvimento)
│   ├── main.ts                  # bootstrap: ValidationPipe + Swagger
│   └── app.module.ts            # ConfigModule + PrismaModule
├── prisma/
│   ├── schema.prisma            # models, enums e relações
│   └── migrations/              # histórico de migrations (versionado no git)
├── prisma.config.ts             # configuração do Prisma CLI (v7)
├── Dockerfile                   # build multi-stage para produção
├── docker-compose.yml           # PostgreSQL + pgAdmin para desenvolvimento
└── .nvmrc                       # versão do Node (v22.18.0)
```

## Domínios

| Domínio          | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| `auth`           | Autenticação JWT (login, logout, cadastro)     |
| `usuario`        | Gestão de usuários e roles (admin, mecânico)   |
| `cliente`        | Gestão de clientes (PF e PJ)                   |
| `veiculo`        | Gestão de veículos vinculados a clientes       |
| `ordem-servico`  | Ordens de serviço com cálculo de valor final   |
| `servico`        | Catálogo de serviços disponíveis               |
| `peca`           | Estoque de peças                               |
| `insumo`         | Estoque de insumos                             |
| `relatorio`      | Relatórios e histórico por veículo             |

## Grupo

- **Grupo:** 66
- **Integrantes:** Nayara, Pedro, Matheus, Guilherme e Aléxia

## Status

Em desenvolvimento — Sprint 1.
