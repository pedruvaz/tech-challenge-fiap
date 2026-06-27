# 7 · Integração Contínua (CI)

> [← Voltar ao índice](./README.md)

O projeto usa **GitHub Actions** para validar automaticamente cada mudança antes do merge. Os workflows ficam em [`.github/workflows/`](../.github/workflows) e rodam em **push** e **pull request** para as branches `main` e `dev`.

## Visão geral dos workflows

| Workflow | Arquivo | O que faz |
| -------- | ------- | --------- |
| **Build** | `build.yml` | Compila o projeto (`npm run build`) garantindo que o TypeScript compila |
| **Lint** | `lint.yml` | Roda o ESLint (`npm run lint`) para padronização e qualidade do código |
| **Testes** | `test.yml` | Sobe um PostgreSQL, aplica migrations e roda os testes unitários e e2e |
| **Docker** | `docker.yml` | Valida o `docker-compose.yml` e faz o build da imagem Docker |

Cada workflow é **independente** e roda em paralelo, dando feedback granular: um lint quebrado não impede ver o resultado dos testes, por exemplo.

## Gatilhos e concorrência

Todos os workflows compartilham a mesma configuração de disparo:

```yaml
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

concurrency:
  group: <nome>-${{ github.ref }}
  cancel-in-progress: true
```

- **`push` / `pull_request` em `main` e `dev`:** garante que tanto a branch de integração (`dev`) quanto a de produção (`main`) sejam sempre validadas.
- **`concurrency` com `cancel-in-progress`:** se um novo commit chega antes de a execução anterior terminar, a antiga é **cancelada**, economizando minutos de runner e dando feedback sempre sobre o código mais recente.

## Detalhe de cada workflow

### Build (`build.yml`)

Compila a aplicação para garantir que não há erros de TypeScript.

1. **Checkout** do código (`actions/checkout@v4`).
2. **Configura Node** lendo a versão do `.nvmrc` (`actions/setup-node@v4` com `cache: npm`) — mesma versão usada localmente (v22.18.0).
3. **`npm ci`** — instalação limpa e reprodutível a partir do `package-lock.json`.
4. **`npx prisma generate`** — gera o Prisma Client (necessário para o código compilar).
5. **`npm run build`** — `nest build`.

> Define `DATABASE_URL` no ambiente porque o `prisma generate` lê a configuração do datasource.

### Lint (`lint.yml`)

Mesma preparação do Build (checkout → Node + cache → `npm ci` → `prisma generate`) e ao final roda:

```bash
npm run lint   # eslint "{src,apps,libs,test}/**/*.ts" --fix
```

### Testes (`test.yml`)

É o workflow mais completo, pois precisa de um banco real.

- **Service container PostgreSQL 16** (`postgres:16-alpine`) com *health check* (`pg_isready`) — o job só prossegue quando o banco está pronto.
- Variáveis de ambiente apontando para esse Postgres (`DB_*` e `DATABASE_URL`), com `NODE_ENV=test`.
- Passos: checkout → Node + cache → `npm ci` → `npx prisma generate` → **`npx prisma migrate deploy`** (cria o schema no banco do CI) → **`npm test`** (unitários) → **`npm run test:e2e`** (end-to-end).

### Docker (`docker.yml`)

Garante que a aplicação **containeriza** corretamente.

1. **Checkout**.
2. **`docker compose config -q`** — valida a sintaxe do `docker-compose.yml`.
3. **Configura o Buildx** (`docker/setup-buildx-action@v3`).
4. **Build da imagem** (`docker/build-push-action@v6`) com `push: false` (apenas valida o build, não publica) e **cache do GitHub Actions** (`cache-from`/`cache-to: type=gha`) para acelerar execuções seguintes.

## Decisões de projeto da CI

- **Workflows separados por responsabilidade** em vez de um único pipeline gigante — feedback mais rápido e legível na aba *Checks* do PR.
- **`.nvmrc` como fonte única da versão do Node** — o CI usa exatamente a mesma versão do ambiente local, evitando o clássico "na minha máquina funciona".
- **`npm ci` (não `npm install`)** — instalação determinística baseada no lockfile, ideal para CI.
- **`prisma generate` em todos os jobs de código** — o Prisma Client é gerado, não versionado; sem ele o build/lint/test falham.
- **PostgreSQL como service container nos testes** — testes rodam contra um banco real e efêmero, fiel ao runtime.
- **Cache de npm e de camadas Docker** — reduz o tempo das execuções.

## Como rodar os mesmos passos localmente

Antes de abrir um PR, dá para reproduzir a CI localmente:

```bash
npm ci
npx prisma generate
npm run lint
npm run build
npm test
npm run test:e2e
docker compose config -q
```
