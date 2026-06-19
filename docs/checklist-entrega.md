# Checklist de Entrega — Tech Challenge Fase 1

## Status por PR

| Item do PDF | Responsável | Status |
|-------------|-------------|--------|
| JWT auth (login/refresh/logout) | PR #8 | ✅ pronto |
| CRUD usuário | PR #9 | ✅ pronto |
| CRUD veículo | PR #9 | ✅ pronto |
| CRUD serviços (catálogo) | PR #6 | ⚠️ aguardando fixes |
| CRUD peças (catálogo + estoque) | PR #6 | ⚠️ aguardando fixes |
| CRUD insumos (catálogo + estoque) | PR #6 | ⚠️ aguardando fixes |
| CRUD cliente (CPF/CNPJ) | **NINGUÉM** | ❌ faltando |
| CRUD OS + state machine | feat/os-crud (Pedro) | ❌ faltando |
| Tempo médio de execução | feat/os-crud (Pedro) | ❌ faltando |
| @ApiBearerAuth em todos os endpoints | feat/os-crud (Pedro) | ❌ faltando |
| Validação CPF/CNPJ | feat/os-crud (Pedro) | ❌ faltando |
| E2E cobrindo todas as rotas | feat/os-crud (Pedro) | ❌ faltando |
| Script único para avaliador | feat/os-crud (Pedro) | ❌ faltando |
| README.md | feat/os-crud (Pedro) | ❌ faltando |

---

## O que o PR feat/os-crud precisa entregar

### 1. CRUD Cliente
> Nenhum PR cobriu isso ainda. Pode ficar neste PR ou em um separado.

```
src/domains/cliente/
├── dto/
│   ├── create-cliente.dto.ts    ← validação CPF/CNPJ com class-validator
│   ├── update-cliente.dto.ts
│   └── cliente-response.dto.ts
├── test/
│   ├── cliente.controller.spec.ts
│   ├── cliente.service.spec.ts
│   └── cliente.repository.spec.ts
├── cliente.controller.ts
├── cliente.service.ts
├── cliente.repository.ts
└── cliente.module.ts
```

Endpoints:
```
POST   /clientes
GET    /clientes
GET    /clientes/:id
GET    /clientes/documento/:numDocumento   ← busca por CPF/CNPJ (requisito do PDF)
PATCH  /clientes/:id
DELETE /clientes/:id
```

Validação CPF/CNPJ: usar `class-validator` com regex ou lib `cpf-cnpj-validator`.

### 2. CRUD Ordem de Serviço

```
src/domains/ordem-servico/
```

Endpoints:
```
POST   /ordens-servico
GET    /ordens-servico                        ← filtros: ?status=&clienteId=
GET    /ordens-servico/:id                    ← detalhe com tudo nested
PATCH  /ordens-servico/:id/status             ← avança state machine
DELETE /ordens-servico/:id

POST   /ordens-servico/:id/servicos
DELETE /ordens-servico/:id/servicos/:servicoId

POST   /ordens-servico/:id/pecas              ← desconta estoque
DELETE /ordens-servico/:id/pecas/:pecaId      ← devolve estoque

POST   /ordens-servico/:id/insumos            ← desconta estoque
DELETE /ordens-servico/:id/insumos/:insumoId
```

State machine:
```
recebida → em_diagnostico → aguardando_aprovacao → em_execucao → finalizada → entregue
```

### 3. Endpoint tempo médio de execução
```
GET /ordens-servico/metricas/tempo-medio
```
Retorna média de (atualizadoEm - criadoEm) das OS com status `finalizada` ou `entregue`.

### 4. Swagger — @ApiBearerAuth em TODOS os controllers protegidos

Adicionar `@ApiBearerAuth()` em cada controller (exceto `auth`).
Registrar o scheme no `main.ts`:
```typescript
.addBearerAuth()
```

### 5. Validações obrigatórias do PDF

- CPF/CNPJ no `CreateClienteDto`
- Placa de veículo (formato Mercosul ou antigo) no `CreateVeiculoDto` — verificar se PR #9 já tem

---

## Script para o avaliador

### Estrutura

```
run-tests.sh          ← único comando que o avaliador roda
docker-compose.test.yml   ← compose só para ambiente de teste (sem API, só banco)
test/
  jest-e2e.json
  app.e2e-spec.ts      ← substituir pelo suite completo abaixo
  e2e/
    auth.e2e-spec.ts
    clientes.e2e-spec.ts
    veiculos.e2e-spec.ts
    usuarios.e2e-spec.ts
    servicos.e2e-spec.ts
    pecas.e2e-spec.ts
    insumos.e2e-spec.ts
    ordens-servico.e2e-spec.ts   ← fluxo completo: criar OS, adicionar itens, avançar status
```

### run-tests.sh

```bash
#!/bin/bash
set -e

echo "Subindo banco de dados..."
docker-compose -f docker-compose.test.yml up -d
sleep 5

echo "Rodando migrations..."
npx prisma migrate deploy

echo "Rodando seed..."
npx prisma db seed

echo "Rodando testes E2E..."
npm run test:e2e

echo "Derrubando ambiente..."
docker-compose -f docker-compose.test.yml down
```

### Estratégia dos E2E

Cada spec de e2e:
1. Faz login com o usuário do seed para obter JWT
2. Usa o token em todas as requisições protegidas
3. Cria dados necessários, testa os endpoints, verifica status codes e body
4. Testa o fluxo completo da OS: criar → adicionar itens → avançar status até `entregue`

O avaliador roda `./run-tests.sh` e vê todos os testes passando ou falhando.

---

## Cobertura mínima de 80% (requisito do PDF)

Os domínios críticos são:
- `ordem-servico` (service + repository)
- `auth` (service)
- `cliente` (service)

Cada um precisa de testes unitários cobrindo os fluxos principais e os casos de erro.
