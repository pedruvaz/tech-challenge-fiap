# Tech Challenge — Oficina Mecânica (Fase 2)

Sistema de gestão de ordens de serviço, clientes, veículos e estoque para uma oficina mecânica. Back-end NestJS com **Clean Architecture**, empacotado em **Kubernetes (EKS)**, com infraestrutura provisionada por **Terraform** e **CI/CD completo** no GitHub Actions.

**Objetivos desta fase:** refatorar a Fase 1 para Clean Architecture, containerizar e orquestrar em K8s com escalabilidade automática (HPA), provisionar cluster e banco via IaC, e automatizar build → testes → imagem → deploy.

- 🎥 **Vídeo demonstrativo:** _link será adicionado na entrega_
- 📚 **Documentação completa:** [`docs/`](docs/README.md) · **Collection das APIs:** Swagger em `/docs` (OpenAPI em `/docs-json`, importável no Postman/Insomnia)

## Como avaliar sem conta AWS

Não é preciso ter AWS, credencial ou qualquer recurso de nuvem para rodar e avaliar este projeto — **inclusive a parte de Kubernetes da Fase 2**. Dois caminhos, os dois na máquina do avaliador:

| Caminho | O que demonstra | Requisitos | Tempo |
| --- | --- | --- | --- |
| [Docker Compose](#execução-local-docker-compose) | A API, o banco e o Swagger funcionando | Docker | ~3 min |
| [Kubernetes com kind](#local-kind--sem-nenhum-recurso-aws) | A entrega de K8s: Job de migration, probes, rollout, HPA e os mesmos manifestos que vão para o EKS | Docker + `kind` + `kubectl` | ~10 min |

O caminho do kind não é passo a passo escrito no papel: o job **Kubernetes (kind)** da [CI](.github/workflows/ci.yml) executa exatamente esses comandos a cada pull request — sobe o cluster, aplica `k8s/`, roda a migration, popula o banco e faz um login autenticado contra a API. Se a documentação desandar, a CI quebra junto.

O que **não** é replicável sem uma conta AWS é apenas a camada de nuvem — EKS, RDS, ECR e o OIDC do GitHub, em [`infra/terraform/`](infra/terraform/README.md). Ela custa ~US$ 160/mês ligada, por isso a stack `cluster/` sobe para demonstrar e é destruída em seguida. O que sustenta essa parte da entrega é o código Terraform, o workflow de [Deploy](.github/workflows/deploy.yml) com seu histórico de execuções na aba Actions, e o vídeo de demonstração.

## Arquitetura

### Infraestrutura provisionada (AWS)

```mermaid
flowchart TB
    USER["Cliente / Banca"] -->|HTTPS| NLB

    subgraph AWS["AWS us-east-1"]
        ECR[("ECR<br/>imagens da API")]
        SM[("Secrets Manager<br/>DATABASE_URL + JWT")]

        subgraph VPC["VPC (2 AZs, NAT único)"]
            subgraph EKS["EKS Auto Mode"]
                NLB["NLB internet-facing"]
                API["Deployment api<br/>2–6 réplicas (HPA por CPU)"]
                MIG["Job migrate<br/>prisma migrate deploy"]
                NLB --> API
            end
            RDS[("RDS PostgreSQL 16<br/>subnet privada")]
        end
    end

    EKS -.pull da imagem.-> ECR
    API --> RDS
    MIG --> RDS
```

| Componente | Onde é definido | Papel |
|---|---|---|
| VPC, EKS Auto Mode, RDS, Secrets Manager | [`infra/terraform/cluster/`](infra/terraform/cluster/) | Stack **efêmera** — sobe para demonstrar, desce para não custar |
| ECR + OIDC GitHub↔AWS + role do CI | [`infra/terraform/base/`](infra/terraform/base/) | Stack **permanente** (~US$ 0/mês) |
| Namespace, Deployment, Service NLB, HPA, Job de migration | [`k8s/`](k8s/README.md) | Estado declarativo aplicado a cada deploy |
| Postgres local + Secret de exemplo | [`k8s/local/`](k8s/) | Só para desenvolvimento (kind) |

Decisões e trade-offs (EKS Auto Mode, RDS vs StatefulSet, NLB via `loadBalancerClass`, migration em Job separado, non-root): [`docs/01-arquitetura.md`](docs/01-arquitetura.md) e READMEs de [`infra/terraform/`](infra/terraform/README.md) e [`k8s/`](k8s/README.md).

### Fluxo de deploy (CI/CD)

```mermaid
flowchart LR
    PR["Pull Request"] --> CI["ci.yml: Lint · Build · Testes com gate<br/>· Imagem Docker · Quality Gate<br/>+ Terraform validate"]
    MERGE["Merge na main"] --> PUSH["Docker: build + push no ECR<br/>tags: SHA do commit e latest"]
    PUSH -->|workflow_run| DEPLOY["Deploy no EKS"]
    DEPLOY --> D1["1 · Secret api-secrets<br/>materializado do Secrets Manager"]
    D1 --> D2["2 · kubectl apply -f k8s/"]
    D2 --> D3["3 · Job migrate recriado<br/>com a imagem da release"]
    D3 --> D4["4 · set image + rollout status"]
```

A autenticação do CI na AWS é **OIDC** — nenhuma access key guardada em secret do GitHub. Detalhes de cada workflow: [`docs/07-ci-cd.md`](docs/07-ci-cd.md).

## Stack

- NestJS 11 + TypeScript (Clean Architecture: `domain` / `application` / `infrastructure` por módulo)
- PostgreSQL 16 + Prisma ORM · JWT · Swagger/OpenAPI · Jest
- Docker + docker-compose (dev) · Kubernetes (kind local / EKS produção)
- Terraform ≥ 1.10 (backend S3 com lock nativo) · GitHub Actions

## Execução local (docker-compose)

Único pré-requisito: Docker.

```bash
git clone https://github.com/pedruvaz/tech-challenge-fiap.git && cd tech-challenge-fiap
cp .env.example .env   # preencha os segredos JWT (qualquer string em dev)
docker compose up -d --build
```

Sobe **API** (<http://localhost:3000>, Swagger em [/docs](http://localhost:3000/docs)), **PostgreSQL** (`localhost:5432`) e **pgAdmin** (<http://localhost:5050>, `admin@oficina.com` / `admin`). As migrations rodam no boot do container; o seed é manual:

```bash
docker compose exec api node dist/prisma/seed.js
```

Login no Swagger: `POST /auth/login` com `{ "email": "admin@oficina.com", "senha": "senha123" }` → botão **Authorize** → cole o `accessToken`.

| Email | Senha | Role |
| --- | --- | --- |
| `admin@oficina.com` | `senha123` | `admin` |
| `joao.mecanico@oficina.com` | `senha123` | `mecanico` |
| `carlos.mecanico@oficina.com` | `senha123` | `mecanico` |

Desenvolvimento com hot reload, variáveis de ambiente e comandos de banco: [`docs/04-execucao.md`](docs/04-execucao.md).

## Deploy em Kubernetes

### Local (kind) — sem nenhum recurso AWS

Os mesmos manifestos que o pipeline aplica no EKS rodam num cluster local. O que muda é só o que é externo ao K8s: o banco é um StatefulSet em vez do RDS, e o Secret vem de [`k8s/local/`](k8s/) em vez do Secrets Manager.

```bash
kind create cluster --name tech-challenge
docker build -t tech-challenge-fiap:latest .
kind load docker-image tech-challenge-fiap:latest --name tech-challenge

kubectl apply -f k8s/00-namespace.yaml -f k8s/05-rbac.yaml -f k8s/10-configmap.yaml
kubectl apply -f k8s/local/11-secret.example.yaml -f k8s/local/20-postgres.yaml
kubectl -n tech-challenge rollout status statefulset/postgres

kubectl apply -f k8s/jobs/30-migrate-job.yaml
kubectl -n tech-challenge wait --for=condition=complete --timeout=300s job/migrate

kubectl apply -f k8s/40-api-deployment.yaml -f k8s/41-api-service.yaml -f k8s/50-hpa.yaml
kubectl -n tech-challenge rollout status deployment/api

kubectl -n tech-challenge exec deploy/api -- node dist/prisma/seed.js   # sem isso não há usuário para logar
kubectl -n tech-challenge port-forward svc/api 3000:3000                # Swagger em http://localhost:3000/docs
```

Duas coisas que parecem erro e não são: o `Service` fica `Pending` porque declara `loadBalancerClass` do EKS (por isso o acesso local é por `port-forward`), e o HPA aparece com métrica `<unknown>` enquanto não houver metrics-server — no EKS ele vem pela stack `cluster/`. Detalhes e troubleshooting: [`k8s/README.md`](k8s/README.md).

### EKS (produção da fase)

O deploy é feito pela pipeline (workflow **Deploy**), nunca à mão. Pré-requisito: infraestrutura aplicada e os secrets/vars do repositório configurados (tabela no cabeçalho de [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). O disparo é automático a cada merge na `main`, ou manual em *Actions → Deploy → Run workflow* com uma tag de imagem específica.

## Provisionamento da infraestrutura (Terraform)

Guia completo com bootstrap, custos e ordem de aplicação: [`infra/terraform/README.md`](infra/terraform/README.md).

```bash
# uma vez: bucket de state (nome no versions.tf) + aws configure

cd infra/terraform/base      # ECR + OIDC — fica de pé (~US$ 0)
terraform init && terraform apply

cd ../cluster                # VPC + EKS + RDS + Secrets — sobe e desce
terraform init && terraform apply
# ao final da sessão de demonstração:
terraform destroy
```

> A `cluster/` ligada 24/7 custaria ~US$ 160/mês; uma sessão de 4h sai por ~US$ 1. Os ajustes que garantem o `destroy` limpo (RDS sem deletion protection, secret com recovery window zero) estão comentados no código.

## CI/CD

Build, lint, testes e imagem vivem num workflow só (`ci.yml`), em jobs paralelos:

| Job (`ci.yml`) | Quando roda | O que garante |
|---|---|---|
| Build · Lint | PR e push (`main`, `dev`) | Compilação TypeScript · ESLint |
| Testes | PR e push | Unitários **com gate de cobertura** (piso global 95/80/95/95) + e2e com Postgres real |
| Build da imagem Docker | PR e branches fora da `main` | A aplicação containeriza; compose válido |
| Kubernetes (kind) | PR e push | A aplicação **sobe de fato** num cluster K8s: manifestos, Job de migration, seed, health, login e rota protegida |
| Push para o ECR | Push na `main` | Publica `SHA` + `latest` via OIDC, sem access key |
| Quality Gate | Sempre | Agrega os seis; `skipped` só nos dois casos previstos |

| Workflow | Quando roda | O que garante |
|---|---|---|
| Terraform | PR/push que toca `infra/terraform/**` | `fmt -check` + `validate` nas stacks `base` e `cluster` |
| Deploy | Após a CI na `main`, ou manual | URLs públicas no ConfigMap + migration + manifests + rollout no EKS |

## Estrutura do repositório

```text
.
├── src/
│   ├── modules/<dominio>/       # Clean Architecture por módulo:
│   │   ├── domain/              #   entities, value objects, exceptions, portas
│   │   ├── application/         #   use cases (puros, sem framework)
│   │   └── infrastructure/      #   http (controllers/DTOs) + persistence (Prisma)
│   ├── auth/ · middleware/ · prisma/ · shared/
│   └── main.ts · app.module.ts
├── prisma/                      # schema, migrations, seed
├── k8s/                         # manifests (+ jobs/ e local/)
├── infra/terraform/             # base/ (ECR+OIDC) e cluster/ (VPC+EKS+RDS)
├── .github/workflows/           # lint, build, test, docker, terraform, deploy
└── docs/                        # documentação por tema (índice em docs/README.md)
```

## Grupo

- **Grupo:** 66
- **Integrantes:** Nayara, Pedro, Matheus, Guilherme e Aléxia
