# 7 · CI/CD

> [← Voltar ao índice](./README.md)

O projeto usa **GitHub Actions** em duas camadas: **CI** valida cada mudança antes do merge; **CD** publica a imagem no ECR e faz o deploy no EKS a cada merge na `main`. Os workflows ficam em [`.github/workflows/`](../.github/workflows).

## Visão geral dos workflows

| Workflow | Arquivo | O que faz |
| -------- | ------- | --------- |
| **Build** | `build.yml` | Compila o projeto (`npm run build`) garantindo que o TypeScript compila |
| **Lint** | `lint.yml` | Roda o ESLint (`npm run lint`) para padronização e qualidade do código |
| **Testes** | `test.yml` | Sobe um PostgreSQL, aplica migrations e roda os testes unitários **com gate de cobertura** e os e2e |
| **Docker** | `docker.yml` | PR: valida compose e builda a imagem · main: **publica no ECR** (tags `SHA` + `latest`) via OIDC |
| **Terraform** | `terraform.yml` | `fmt -check` + `init -backend=false` + `validate` nas stacks `base` e `cluster` quando `infra/terraform/**` muda |
| **Deploy** | `deploy.yml` | Deploy no EKS — automático após o Docker publicar imagem da `main`, ou manual com tag específica |

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
npm run test:cov
npm run test:e2e
docker compose config -q
```

## Entrega Contínua (CD) — Fase 2

### Gate de cobertura

O job de testes roda `npm run test:cov`, e o `coverageThreshold` do Jest falha o CI se a cobertura global cair abaixo do piso (statements 24 / branches 12 / functions 30 / lines 24). Detalhe da semântica: os arquivos de `ordem-servico/domain` têm um grupo próprio (piso 80%) e por isso **saem do pool do global**. O piso global é deliberadamente baixo — nasceu ~2pp abaixo do medido após o refactor de Clean Architecture — e deve **subir a cada PR que recuperar specs**.

### Publicação da imagem (`docker.yml`, job `push`)

A cada merge na `main`: autenticação na AWS **via OIDC** (o workflow troca o token efêmero do GitHub por credenciais temporárias — nenhuma access key em secret), build com cache e push de `tech-challenge-fiap:<SHA>` + `:latest` no ECR. A tag por SHA é o que dá rollout determinístico e rollback trivial (`Run workflow` do Deploy com a tag antiga).

### Deploy (`deploy.yml`)

Dispara via `workflow_run` quando o Docker conclui com sucesso na `main` (deploya exatamente o commit que gerou a imagem), ou manualmente. Sequência:

1. OIDC → `aws eks update-kubeconfig`
2. Secret `api-secrets` **materializado do Secrets Manager** (criado pela stack `cluster/`) — valores sensíveis nunca passam pelo repositório
3. `kubectl apply -f k8s/` (estado declarativo; `k8s/jobs/` e `k8s/local/` ficam fora do lote de propósito)
4. Job de migration deletado e recriado **com a imagem da release**, seguido de `kubectl wait` — o initContainer do Deployment segura as réplicas até a migration completar
5. `kubectl set image` com a tag do SHA + `rollout status`

### Pré-requisitos de ambiente

Configurados uma única vez após o `terraform apply` da stack `base/` (valores nos outputs): secret `AWS_DEPLOY_ROLE_ARN` e vars `AWS_REGION`, `ECR_REPOSITORY`, `EKS_CLUSTER_NAME`, `API_SECRET_NAME`. A tabela completa está no cabeçalho do próprio [`deploy.yml`](../.github/workflows/deploy.yml).
