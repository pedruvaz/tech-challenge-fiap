# Tech Challenge — Fase 1 · Documentação

> Sistema Integrado de Atendimento e Execução de Serviços para uma **oficina mecânica**.
> MVP de back-end com foco em gestão de **ordens de serviço, clientes, veículos, peças, insumos e serviços**, aplicando **DDD** (Domain-Driven Design).

Esta pasta concentra toda a documentação técnica e de negócio do projeto. Cada arquivo cobre um tema; comece por aqui.

---

## 📑 Sumário

| # | Documento | Conteúdo |
| - | --------- | -------- |
| 1 | [Arquitetura](./01-arquitetura.md) | Estilo arquitetural, DDD, estrutura de pastas, camadas e autenticação JWT |
| 2 | [Modelo de Dados](./02-modelo-de-dados.md) | Diagrama Entidade-Relacionamento, entidades, enums e _soft delete_ |
| 3 | [Linguagem Ubíqua](./03-linguagem-ubiqua.md) | Dicionário dos termos do domínio, bounded contexts e Event Storming |
| 4 | [Execução do Projeto](./04-execucao.md) | Pré-requisitos, variáveis de ambiente, Docker, execução local e Swagger |
| 5 | [Workflow das APIs](./05-workflow-apis.md) | Fluxos de negócio com diagramas de sequência |
| 6 | [Referência da API](./06-api-referencia.md) | Endpoints por domínio, payloads e respostas |
| 7 | [Integração Contínua (CI)](./07-ci-cd.md) | Workflows do GitHub Actions: build, lint, testes e Docker |
| 8 | [Checklist de Entregas](./08-checklist.md) | Acompanhamento das entregas da Fase 1 |
| 9 | [Relatório de Vulnerabilidades](./09-relatorio-vulnerabilidades.md) | Análise `npm audit` das dependências |

---

## 🎯 O Desafio

Uma oficina mecânica de bairro cresceu e passou a perder o controle do seu fluxo de atendimento: ordens de serviço anotadas em papel, dificuldade para saber quais peças e insumos foram consumidos em cada reparo, falta de histórico por veículo e nenhuma visibilidade do andamento dos serviços.

O objetivo deste MVP é entregar um **back-end** que organize esse fluxo, oferecendo:

- **Cadastro de clientes** (pessoa física e jurídica) e seus **veículos**;
- **Catálogo de serviços** e **estoque de peças e insumos**;
- **Ordens de serviço (OS)** que registram o trabalho do mecânico, os itens consumidos e o **cálculo do valor final**;
- **Controle de status** da OS (da recepção até a entrega);
- **Gestão de usuários** (mecânicos, funcionários e administradores) com **autenticação JWT**;
- **Relatórios e histórico** por veículo.

A solução é construída como uma **API REST** documentada via **Swagger/OpenAPI**, com modelagem de domínio orientada a DDD.

---

## 🧠 Modelagem de Domínio (Event Storming)

A modelagem do domínio foi conduzida via **Event Storming** (metodologia de DDD), mapeando eventos, comandos, atores, políticas e os **bounded contexts** do sistema. O resultado completo — glossário, fluxos da Ordem de Serviço e de peças, contextos delimitados e atores — está no board do Miro:

🔗 **[Board de Event Storming / DDD no Miro](https://miro.com/app/board/uXjVHPI3bCE=/)**

Um resumo dos bounded contexts e da linguagem ubíqua derivados desse board está em [Linguagem Ubíqua](./03-linguagem-ubiqua.md).

---

## 👥 Equipe — Grupo 66

| Integrante |
| ---------- |
| Nayara |
| Pedro |
| Matheus |
| Guilherme |
| Aléxia |

---

## 🧰 Stack

| Camada | Tecnologia |
| ------ | ---------- |
| Linguagem | TypeScript |
| Framework | NestJS 11 |
| ORM | Prisma 7 |
| Banco de dados | PostgreSQL 16 |
| Autenticação | JWT (`@nestjs/jwt`) + bcrypt |
| Validação | class-validator / class-transformer |
| Configuração | `@nestjs/config` |
| Documentação | Swagger / OpenAPI (`@nestjs/swagger`) |
| Testes | Jest |
| Infraestrutura | Docker / Docker Compose (PostgreSQL + pgAdmin) |

---

## 🚀 Início rápido

```bash
nvm install && nvm use      # garante o Node v22.18.0 (.nvmrc)
npm install                 # instala as dependências
cp .env.example .env        # configure as variáveis (ver doc de execução)
docker compose up -d        # sobe PostgreSQL + pgAdmin
npx prisma migrate deploy   # cria as tabelas
npm run start:dev           # sobe a API com hot reload
```

- API: <http://localhost:3000>
- Swagger: <http://localhost:3000/docs>
- pgAdmin: <http://localhost:5050>

O passo a passo completo está em [Execução do Projeto](./04-execucao.md).

---

## 📌 Status do projeto

Em desenvolvimento — **Sprint 1**.

| Domínio | Situação |
| ------- | -------- |
| `auth` (login / refresh / logout) | ✅ Implementado |
| `usuario` | ✅ Implementado |
| `cliente` | ✅ Implementado |
| `veiculo` | ✅ Implementado |
| `peca` | ✅ Implementado |
| `insumo` | ✅ Implementado |
| `servico` | ✅ Implementado |
| `ordem-servico` | 🚧 Planejado (modelo de dados pronto) |
| `relatorio` | 🚧 Planejado |
