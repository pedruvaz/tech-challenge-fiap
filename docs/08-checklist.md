# 8 · Checklist de Entregas

> [← Voltar ao índice](./README.md)

Checklist de acompanhamento das entregas do **Tech Challenge — Fase 1**, adaptado ao escopo deste projeto (NestJS + Prisma + DDD). Atualize os checkboxes conforme o andamento.

> Legenda: ✅ feito · 🚧 em andamento/planejado · ⬜ pendente

## 📦 Entregas obrigatórias (Fase 1)

- [x] Código-fonte em repositório
- [x] `Dockerfile` configurado (multi-stage)
- [x] `docker-compose.yml` funcional (PostgreSQL + pgAdmin + API)
- [x] APIs REST documentadas via **Swagger/OpenAPI** (`/docs`)
- [x] Modelagem de domínio (**Event Storming** no Miro + DDD)
- [x] Pipeline de CI (GitHub Actions) — ver [CI/CD](./07-ci-cd.md)
- [x] Relatório de vulnerabilidades — ver [Relatório de Vulnerabilidades](./09-relatorio-vulnerabilidades.md)
- [x] `README.md` com instruções de execução
- [x] Testes automatizados com cobertura adequada (>80%)
- [x] Acesso concedido ao usuário da banca (`soat-architecture`)
- [ ] Vídeo demonstrativo
- [ ] PDF de entrega

## 🔧 Funcionalidades (CRUDs)

> Status conforme a tabela de progresso do [README](./README.md).

- [x] **Usuários** — CRUD + papéis (`admin`, `funcionario`, `mecanico`)
- [x] **Clientes** — CRUD (Pessoa Física / Jurídica)
- [x] **Veículos** — CRUD (associação a clientes)
- [x] **Serviços** — CRUD (catálogo de mão de obra)
- [x] **Peças** — CRUD + controle de estoque
- [x] **Insumos** — CRUD + controle de estoque
- [x] **Ordens de Serviço (OS)**
  - [x] Criar OS (vincula cliente, veículo, mecânico)
  - [x] Listar / consultar OS
  - [x] Adicionar / remover serviços, peças e insumos à OS
  - [x] Cálculo automático do valor final (orçamento)
  - [x] Transição de status (recebida → em_diagnostico → aguardando_aprovacao → em_execucao → finalizada → entregue)
  - [x] Aprovação do orçamento (`POST /ordens-servico/:id/aprovar-orcamento`)
  - [x] Histórico de transições de status
- [x] **Consulta pública pelo cliente** — `GET /publico/ordens-servico/:id?numDocumento=...` (sem JWT, exige o CPF/CNPJ do dono)
- [x] **Métrica de tempo médio de execução** — `GET /ordens-servico/metricas/tempo-medio`

## ✅ Validações

- [x] Validação de **CPF/CNPJ** (validador reutilizável em `common/validators`)
- [x] `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`)
- [x] DTOs com `class-validator` em todas as entradas
- [x] Validação de **placa** (formato antigo `AAA-1234` / `AAA1234` + Mercosul `AAA1A23`)
- [x] Validação de **transição de status** da OS (proíbe pular etapas)
- [x] Validação de **estoque** (impede saldo negativo ao reservar peça/insumo)
- [ ] Validação de **ano** do veículo (formato)

## 🔐 Segurança

- [x] Autenticação **JWT** (access + refresh token)
- [x] Senhas com **hash bcrypt** (nunca retornadas pela API)
- [x] Refresh token armazenado com hash e **revogável** (logout/rotação)
- [x] Middleware JWT protegendo **todas as rotas** (exceto públicas)
- [x] Segredos via variáveis de ambiente (`.env`), fora do código
- [x] Proteção contra SQL injection (Prisma — queries parametrizadas)
- [x] Relatório de vulnerabilidades das dependências (`npm audit`)

## 🏗️ Arquitetura e DDD

- [x] Modularização por domínio (DDD) em `src/domains/`
- [x] Camadas bem definidas (Controller → Service → Repository → DTO)
- [x] Bounded contexts mapeados — ver [Linguagem Ubíqua](./03-linguagem-ubiqua.md)
- [x] Linguagem ubíqua documentada
- [x] Persistência com **Prisma ORM** sobre **PostgreSQL**
- [x] **Soft delete** nas entidades de negócio (`deletado_em`)
- [x] Migrations versionadas no git

## 🧪 Qualidade e testes

- [x] **Jest** configurado (unitários + e2e)
- [x] **ESLint** + **Prettier**
- [x] CI rodando build, lint, testes e build Docker
- [x] Cobertura de testes >80% (`ordem-servico` em 99% statements / 100% lines)
- [x] Testes e2e cobrindo os fluxos principais (`test/e2e/ordens-servico.e2e-spec.ts`)

## 📚 Documentação

- [x] [Arquitetura](./01-arquitetura.md)
- [x] [Modelo de Dados](./02-modelo-de-dados.md)
- [x] [Linguagem Ubíqua](./03-linguagem-ubiqua.md) + bounded contexts
- [x] [Execução do Projeto](./04-execucao.md)
- [x] [Workflow das APIs](./05-workflow-apis.md)
- [x] [Referência da API](./06-api-referencia.md)
- [x] [CI/CD](./07-ci-cd.md)
- [x] [Relatório de Vulnerabilidades](./09-relatorio-vulnerabilidades.md)
- [x] Board de **Event Storming** no Miro (linkado no README)
- [ ] Collection de APIs (Postman) — opcional (Swagger já cobre)

## ☸️ Fase 2 — Kubernetes

Manifestos em [`/k8s`](../k8s/README.md); detalhes em [Arquitetura](./01-arquitetura.md#execução-em-kubernetes-fase-2) e [Execução](./04-execucao.md#execução-em-kubernetes-kind). Terraform/IaC e pipeline de CI/CD publicando imagem em registry são responsabilidade de outros integrantes do grupo — fora do escopo dos PRs desta stack.

- [x] Endpoints de health para probes (`/health/liveness`, `/health/readiness`)
- [x] Graceful shutdown (`app.enableShutdownHooks()` no `main.ts`)
- [x] Namespace `tech-challenge` isolando os recursos
- [x] `ConfigMap` para envs não sensíveis + `Secret` para segredos
- [x] `StatefulSet` do Postgres 16 com PVC e Service headless
- [x] `Job` de migrations com `initContainer` que espera o Postgres
- [x] `Deployment` da API com `initContainer` aguardando o `Job` (`kubectl wait`)
- [x] `Service` ClusterIP `api:3000` (acesso via `kubectl port-forward`)
- [x] `HorizontalPodAutoscaler` por CPU (min=2, max=6, target 70%)
- [x] `ServiceAccount` + `Role`/`RoleBinding` restrito (RBAC mínimo)
- [x] `imagePullPolicy: IfNotPresent` compatível com `kind load docker-image`
- [ ] Terraform / IaC — **fora de escopo** (outro integrante do grupo)
- [ ] Pipeline de CI/CD publicando imagem em registry — **fora de escopo** (outro integrante do grupo)
