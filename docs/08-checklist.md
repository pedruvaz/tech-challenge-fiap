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
- [ ] Testes automatizados com cobertura adequada (>80%)
- [ ] Vídeo demonstrativo
- [ ] PDF de entrega
- [ ] Acesso concedido ao usuário da banca (`soat-architecture`)

## 🔧 Funcionalidades (CRUDs)

> Status conforme a tabela de progresso do [README](./README.md).

- [x] **Usuários** — CRUD + papéis (`admin`, `funcionario`, `mecanico`)
- [x] **Clientes** — CRUD (Pessoa Física / Jurídica)
- [x] **Veículos** — CRUD (associação a clientes)
- [x] **Serviços** — CRUD (catálogo de mão de obra)
- [x] **Peças** — CRUD + controle de estoque
- [x] **Insumos** — CRUD + controle de estoque
- [ ] **Ordens de Serviço (OS)** — 🚧 planejado (modelo de dados pronto)
  - [ ] Criar OS (vincula cliente, veículo, mecânico)
  - [ ] Listar / consultar OS
  - [ ] Adicionar serviços, peças e insumos à OS
  - [ ] Cálculo do valor final
  - [ ] Transição de status (recebida → … → entregue)
- [ ] **Relatórios / histórico por veículo** — 🚧 planejado

## ✅ Validações

- [x] Validação de **CPF/CNPJ** (validador reutilizável em `common/validators`)
- [x] `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`)
- [x] DTOs com `class-validator` em todas as entradas
- [ ] Validação de **placa** (formato antigo + Mercosul)
- [ ] Validação de **ano** do veículo
- [ ] Validação de **transição de status** da OS
- [ ] Validação de **estoque** (impedir saldo negativo)

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
- [ ] Cobertura de testes >80% (`npm run test:cov`)
- [ ] Testes e2e cobrindo os fluxos principais

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
