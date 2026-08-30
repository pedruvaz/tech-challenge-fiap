# 7 · CI/CD

> [← Voltar ao índice](./README.md)

O projeto usa **GitHub Actions** em duas camadas: **CI** valida cada mudança antes do merge; **CD** publica a imagem no ECR e faz o deploy no EKS a cada merge na `main`. Os workflows ficam em [`.github/workflows/`](../.github/workflows).

## Visão geral dos workflows

| Workflow | Arquivo | O que faz |
| -------- | ------- | --------- |
| **CI** | `ci.yml` | Build, lint, testes com gate de cobertura, imagem Docker e um deploy real em cluster kind. Na `main`, publica no ECR. Fecha com um **Quality Gate** que agrega os resultados |
| **Terraform** | `terraform.yml` | `fmt -check` + `init -backend=false` + `validate` nas stacks `base` e `cluster` quando `infra/terraform/**` muda |
| **Deploy** | `deploy.yml` | Deploy no EKS — automático após a CI publicar a imagem da `main`, ou manual com tag específica |

Os quatro workflows originais (`build.yml`, `lint.yml`, `test.yml`, `docker.yml`) foram consolidados no `ci.yml`. Os quatro repetiam `checkout → setup-node → npm ci → prisma generate`, e a duplicação era um lugar fácil para a configuração divergir. Os jobs seguem **paralelos**, então o feedback na aba *Checks* continua granular: um lint quebrado não esconde o resultado dos testes.

## Gatilhos e concorrência

```yaml
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev, 'feat/**']
  workflow_call:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

- **`push` / `pull_request`:** tanto a branch de integração (`dev`) quanto a de produção (`main`) são sempre validadas; PRs abertos contra `feat/**` também rodam.
- **`workflow_call`:** permite que outro workflow reaproveite a CI inteira como etapa.
- **`concurrency` com `cancel-in-progress`:** um commit novo cancela a execução anterior da mesma ref, economizando minutos de runner e dando feedback sempre sobre o código mais recente.

## Os jobs do `ci.yml`

Os quatro primeiros rodam em paralelo; `quality-gate` espera todos.

### `build` — *Build*

1. **Checkout** (`actions/checkout@v4`).
2. **Configura Node** lendo a versão do `.nvmrc` (`actions/setup-node@v4` com `cache: npm`) — mesma versão do ambiente local (v22.18.0).
3. **`npm ci`** — instalação determinística a partir do `package-lock.json`.
4. **`npx prisma generate`** — gera o Prisma Client, sem o qual o código não compila.
5. **`npm run build`** — `nest build`.

> Define `DATABASE_URL` no ambiente porque o `prisma generate` lê a configuração do datasource.

### `lint` — *Lint*

Mesma preparação do build (checkout → Node + cache → `npm ci` → `prisma generate`) e ao final:

```bash
npm run lint   # eslint "{src,apps,libs,test}/**/*.ts" --fix
```

> O script roda com `--fix`: o ESLint corrige o que consegue e sai com código 0. Ou seja, este job pega erros que **não** são auto-corrigíveis; divergência de formatação passa despercebida no CI e chega no seu working tree no próximo `npm run lint`.

### `test` — *Testes*

O job mais completo, porque precisa de um banco real.

- **Service container PostgreSQL 16** (`postgres:16-alpine`) com health check (`pg_isready`) — o job só prossegue quando o banco responde.
- Variáveis apontando para esse Postgres (`DB_*`, `DATABASE_URL`), com `NODE_ENV=test`.
- Passos: checkout → Node + cache → `npm ci` → `prisma generate` → **`prisma migrate deploy`** (cria o schema) → **`prisma db seed`** → **`npm run test:cov`** (unitários + gate de cobertura) → **`npm run test:e2e`**.
- O relatório de cobertura sobe como artefato (`coverage-report`), inclusive quando o job falha.

### `docker` — *Build da imagem Docker*

Roda em PR e em branches que não sejam a `main`. Garante que a aplicação **containeriza**: valida o `docker-compose.yml` (`docker compose config -q`), configura o Buildx e builda a imagem sem publicar, com cache de camadas via GitHub Actions.

### `kind` — *Kubernetes (kind)*

Roda em PR e em push. Sobe um cluster Kubernetes real no runner (`helm/kind-action`) e executa **o mesmo passo a passo que o [`k8s/README.md`](../k8s/README.md) manda o avaliador rodar**: build da imagem, `kind load`, apply dos manifestos na ordem, Job de migration, seed, `rollout status` e, por fim, um smoke test via `port-forward` — `/health/liveness`, `/health/readiness` (que pinga o banco), `/docs`, `POST /auth/login` com o usuário do seed e uma rota protegida com o `Bearer` recebido. Em falha, despeja `describe` e logs de todos os componentes na própria run.

Existe por dois motivos. O primeiro é que os demais jobs provam que o código compila, passa nos testes e **containeriza** — nenhum deles prova que a aplicação **sobe**. O segundo é que a documentação do caminho local passa a ser executada a cada PR, em vez de envelhecer em silêncio.

O `Service` fica `Pending` no kind (declara `loadBalancerClass` do EKS) e o HPA fica sem métrica sem metrics-server. Nenhum dos dois derruba o job, e ambos estão documentados como comportamento esperado.

### `push` — *Push para o ECR*

Só em push na `main`. Autentica na AWS **via OIDC** — o workflow troca o token efêmero do GitHub por credenciais temporárias, sem nenhuma access key guardada em secret — e publica `tech-challenge-fiap:<SHA>` e `:latest` no ECR.

### `quality-gate` — *Quality Gate*

Agrega o resultado dos seis. Roda com `if: always()` e trata `skipped` como aceitável em dois casos previstos: `docker` é pulado no push para a `main` (o `push` o substitui) e `push` é pulado em PR. Qualquer outro resultado que não seja `success` derruba o gate, com o motivo impresso no log.

> **Os nomes dos jobs são contrato.** O ruleset `cannot-merge-directly-to-main` exige os contextos `Build`, `Lint`, `Testes` e `Build da imagem Docker` — casados pelo **nome exibido** do job, não pela chave. Renomear qualquer um sem atualizar o ruleset deixa o check em `Expected — waiting for status to be reported` e **trava o merge de todo PR**, inclusive os já aprovados. Editar o ruleset exige permissão de admin no repositório.

## Decisões de projeto da CI

- **Um workflow, jobs paralelos** — a preparação (`checkout → setup-node → npm ci → prisma generate`) é idêntica em build, lint e test; mantê-la em quatro arquivos era convite para divergirem. Os jobs continuam independentes, então a granularidade na aba *Checks* não se perde.
- **Quality Gate agregando os jobs** — um único check para exigir na proteção da branch, em vez de listar cada job.
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

O job `test` roda `npm run test:cov`, e o `coverageThreshold` do Jest derruba o CI se a cobertura cair abaixo do piso:

| Pool | statements | branches | functions | lines |
| ---- | ---------- | -------- | --------- | ----- |
| global | 95 | 80 | 95 | 95 |
| `ordem-servico/domain` | 95 | 90 | 95 | 95 |

O piso é o contrato; o número medido não vai citado aqui de propósito, porque muda a cada PR e vira exatamente o tipo de doc que envelhece sem ninguém notar. Para ver o valor atual, rode `npm run test:cov` ou baixe o artefato `coverage-report` da execução da CI.

Detalhe da semântica que vale conhecer: um caminho listado no `coverageThreshold` ganha um pool **próprio** e por isso **sai do pool do global**. É por isso que `ordem-servico/domain` aparece separado. O mesmo mecanismo já causou um falso verde neste repositório — um grupo `./src/modules/` subtraía todos os módulos do global, deixando o gate global medir 90 de 1096 branches (corrigido no #60).

### Publicação da imagem (`ci.yml`, job `push`)

A cada merge na `main`: autenticação na AWS **via OIDC** (o workflow troca o token efêmero do GitHub por credenciais temporárias — nenhuma access key em secret), build com cache e push de `tech-challenge-fiap:<SHA>` + `:latest` no ECR. A tag por SHA é o que dá rollout determinístico e rollback trivial (`Run workflow` do Deploy com a tag antiga).

### Deploy (`deploy.yml`)

Dispara via `workflow_run` quando a **CI** conclui com sucesso na `main` (deploya exatamente o commit que gerou a imagem), ou manualmente com uma tag já publicada. Sequência:

1. OIDC → `aws eks update-kubeconfig`
2. Secret `api-secrets` **materializado do Secrets Manager** (criado pela stack `cluster/`) — valores sensíveis nunca passam pelo repositório
3. **URLs públicas resolvidas no ConfigMap** — o Service sobe primeiro, o workflow espera o hostname do NLB e o grava em `APP_URL`; `FRONTEND_URL` é derivada do bucket do front. Precisa acontecer **antes** do Deployment: `envFrom` é lido na criação do pod, então corrigir depois exigiria outro rollout
4. `kubectl apply -f k8s/` com a imagem da release injetada no manifesto (estado declarativo; `k8s/jobs/` e `k8s/local/` ficam fora do lote de propósito)
5. Job de migration deletado e recriado **com a imagem da release**, seguido de `kubectl wait` — o initContainer do Deployment segura as réplicas até a migration completar
6. `rollout status`

O `APP_URL` não é versionado porque o hostname do NLB **muda a cada recriação do cluster**. Sem ele, os links de aprovação de orçamento sairiam apontando para `localhost` — com o e-mail entregue normalmente, sem nenhum sinal de erro.

### Pré-requisitos de ambiente

Configurados uma única vez após o `terraform apply` da stack `base/` (valores nos outputs): secret `AWS_DEPLOY_ROLE_ARN` e vars `AWS_REGION`, `ECR_REPOSITORY`, `EKS_CLUSTER_NAME`, `API_SECRET_NAME`. A tabela completa está no cabeçalho do próprio [`deploy.yml`](../.github/workflows/deploy.yml).

A var `FRONTEND_URL` é **opcional**: se não existir, o deploy deriva a URL do bucket padrão da stack `base/` (`<project>-front-<conta>`). Definir a var só é necessário quando o front não estiver nesse bucket.
