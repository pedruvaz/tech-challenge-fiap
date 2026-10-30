# 6 · Referência da API

> [← Voltar ao índice](./README.md)

- **Base URL (dev):** `http://localhost:3000`
- **Documentação interativa:** `http://localhost:3000/docs` (Swagger)
- **Autenticação:** header `Authorization: Bearer <accessToken>` em todas as rotas protegidas.
- **Dois tipos de token** (mesmo segredo `JWT_ACCESS_SECRET`, algoritmo `HS256`):
  - **Funcionário** — emitido por `POST /auth/login` desta API: `{ sub: number, email, roles }`. Acessa todas as rotas protegidas.
  - **Cliente** — emitido pela Lambda `POST /auth` (login por CPF): `{ sub: uuid, nome, email, tipo: "CLIENTE" }`. Acessa **apenas** as rotas marcadas como `🔶` na tabela abaixo, com restrição de posse (só vê/altera as próprias OS).

A tabela abaixo resume os endpoints; os payloads detalhados vêm na sequência.

| Recurso | Método | Rota | Quem acessa | Descrição |
| ------- | ------ | ---- | :---------: | --------- |
| Health | `GET` | `/` | ❌ público | Health check |
| Auth | `POST` | `/auth/login` | ❌ público | Autentica funcionário e retorna par de tokens |
| Auth | `POST` | `/auth/refresh` | ❌ público | Renova o par de tokens |
| Auth | `POST` | `/auth/logout` | ✅ funcionário | Revoga o refresh token |
| Aprovação | `GET` | `/aprovacao/confirmar` | ❌ público | Página HTML (link de e-mail do cliente) |
| Aprovação | `POST` | `/aprovacao/processar` | ❌ público | Processa aprovação/rejeição via token de e-mail |
| Aprovação | `POST` | `/aprovacao/:osId/solicitar` | ✅ funcionário | Envia e-mail de aprovação ao cliente |
| Usuários | `POST` | `/usuarios` | ✅ funcionário | Cria usuário |
| Usuários | `GET` | `/usuarios` | ✅ funcionário | Lista usuários |
| Usuários | `GET` | `/usuarios/:id` | ✅ funcionário | Busca usuário por id |
| Usuários | `PATCH` | `/usuarios/:id` | ✅ funcionário | Atualiza usuário |
| Usuários | `DELETE` | `/usuarios/:id` | ✅ funcionário | Remove (soft delete) usuário |
| Clientes | `POST` | `/clientes` | ✅ funcionário | Cria cliente |
| Clientes | `GET` | `/clientes` | ✅ funcionário | Lista clientes |
| Clientes | `GET` | `/clientes/:id` | ✅ funcionário | Busca cliente por id |
| Clientes | `PATCH` | `/clientes/:id` | ✅ funcionário | Atualiza cliente |
| Clientes | `DELETE` | `/clientes/:id` | ✅ funcionário | Remove (soft delete) cliente |
| Veículos | `POST` | `/veiculos` | ✅ funcionário | Cria veículo |
| Veículos | `GET` | `/veiculos` | ✅ funcionário | Lista veículos |
| Veículos | `GET` | `/veiculos/:id` | ✅ funcionário | Busca veículo por id |
| Veículos | `PATCH` | `/veiculos/:id` | ✅ funcionário | Atualiza veículo |
| Veículos | `DELETE` | `/veiculos/:id` | ✅ funcionário | Remove (soft delete) veículo |
| Peças | `POST` | `/pecas` | ✅ funcionário | Cria peça |
| Peças | `GET` | `/pecas` | ✅ funcionário | Lista peças |
| Peças | `GET` | `/pecas/:id` | ✅ funcionário | Busca peça por id |
| Peças | `PATCH` | `/pecas/:id` | ✅ funcionário | Atualiza peça |
| Peças | `DELETE` | `/pecas/:id` | ✅ funcionário | Remove peça |
| Insumos | `POST` | `/insumos` | ✅ funcionário | Cria insumo |
| Insumos | `GET` | `/insumos` | ✅ funcionário | Lista insumos |
| Insumos | `GET` | `/insumos/:id` | ✅ funcionário | Busca insumo por id |
| Insumos | `PATCH` | `/insumos/:id` | ✅ funcionário | Atualiza insumo |
| Insumos | `DELETE` | `/insumos/:id` | ✅ funcionário | Remove insumo |
| Serviços | `POST` | `/servico` | ✅ funcionário | Cria serviço |
| Serviços | `GET` | `/servico` | ✅ funcionário | Lista serviços |
| Serviços | `GET` | `/servico/:id` | ✅ funcionário | Busca serviço por id |
| Serviços | `PATCH` | `/servico/:id` | ✅ funcionário | Atualiza serviço |
| Serviços | `DELETE` | `/servico/:id` | ✅ funcionário | Remove serviço |
| OS | `POST` | `/ordens-servico` | ✅ funcionário | Cria OS (cliente + veículo + mecânico) |
| OS | `GET` | `/ordens-servico` | 🔶 func + cliente | Lista OS; cliente só vê as suas (ignora `?clienteId`) |
| OS | `GET` | `/ordens-servico/:id` | 🔶 func + cliente | Detalha OS; cliente recebe 403 se não for a sua |
| OS | `PATCH` | `/ordens-servico/:id/status` | ✅ funcionário | Avança o status (transição validada) |
| OS | `POST` | `/ordens-servico/:id/aprovar-orcamento` | 🔶 func + cliente | Aprova orçamento; cliente recebe 403 se não for a sua |
| OS | `DELETE` | `/ordens-servico/:id` | ✅ funcionário | Soft delete da OS |
| OS · Itens | `POST` | `/ordens-servico/:id/servicos` | ✅ funcionário | Adiciona/atualiza serviço |
| OS · Itens | `DELETE` | `/ordens-servico/:id/servicos/:servicoId` | ✅ funcionário | Remove serviço |
| OS · Itens | `POST` | `/ordens-servico/:id/pecas` | ✅ funcionário | Adiciona/atualiza peça (baixa estoque) |
| OS · Itens | `DELETE` | `/ordens-servico/:id/pecas/:pecaId` | ✅ funcionário | Remove peça (devolve estoque) |
| OS · Itens | `POST` | `/ordens-servico/:id/insumos` | ✅ funcionário | Adiciona/atualiza insumo (baixa estoque) |
| OS · Itens | `DELETE` | `/ordens-servico/:id/insumos/:insumoId` | ✅ funcionário | Remove insumo (devolve estoque) |
| OS · Métricas | `GET` | `/ordens-servico/metricas/tempo-medio` | ✅ funcionário | Tempo médio de execução (ms / min / h) |
| Público | `GET` | `/publico/ordens-servico/:id?numDocumento=...` | ❌ público | Consulta da OS pelo cliente (sem JWT), prova de posse por CPF/CNPJ |

> **Identificadores:** `clientes` e `veiculos` usam **UUID**; `usuarios`, `pecas`, `insumos` e `servico` usam **inteiro**.

---

## Auth

### POST `/auth/login`
```json
{
  "email": "admin@oficina.com",
  "senha": "senha123"
}
```
**200 OK**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "usuario": { "id": 1, "nome": "Admin", "email": "admin@oficina.com", "roles": "admin" }
}
```
Erros: `401` credenciais inválidas.

### POST `/auth/refresh`
```json
{ "refreshToken": "<jwt>" }
```
**200 OK** → `{ "accessToken": "<jwt>", "refreshToken": "<jwt>" }`
Erros: `401` sessão/refresh token inválido ou expirado.

### POST `/auth/logout`
Requer Bearer token. **204 No Content** — revoga o refresh token do usuário autenticado.

---

## Usuários

### POST `/usuarios`
```json
{
  "nome": "João da Silva",
  "email": "joao.silva@oficina.com",
  "senha": "senhaSegura123",
  "roles": "funcionario"
}
```
- `senha`: mínimo 6 caracteres. `roles`: opcional (`admin` | `funcionario` | `mecanico`, padrão `funcionario`).
- **201 Created** (sem expor `senha`/`refreshToken`). Erros: `409` email já cadastrado.

### GET `/usuarios` · GET `/usuarios/:id` · PATCH `/usuarios/:id` · DELETE `/usuarios/:id`
- `:id` é numérico. `PATCH` aceita os mesmos campos do create (parciais).
- `DELETE` → **204**. Erros: `404` não encontrado, `409` email duplicado (no update).

---

## Clientes

### POST `/clientes`
```json
{
  "numDocumento": "111.444.777-35",
  "nome": "João da Silva",
  "telefone": "11999998888",
  "tipo": "pessoa_fisica"
}
```
- `numDocumento`: CPF (`pessoa_fisica`) ou CNPJ (`pessoa_juridica`), com ou sem máscara — **validado** pelo validador `IsCpfCnpj`.
- **201 Created**. Erros: `409` documento já cadastrado.

### GET `/clientes` · GET `/clientes/:id` · PATCH `/clientes/:id` · DELETE `/clientes/:id`
- `:id` é UUID. `DELETE` → **204**. Erros: `404` não encontrado, `409` documento duplicado (no update).

---

## Veículos

### POST `/veiculos`
```json
{
  "placa": "ABC1D23",
  "marca": "Toyota",
  "modelo": "Corolla",
  "ano": "2020",
  "cor": "Preto"
}
```
- `placa`: aceita formato antigo (`AAA-1234` / `AAA1234`) e Mercosul (`AAA1A23`), validada pelo `IsPlacaVeiculo`.
- **201 Created**. Erros: `400` placa em formato inválido, `409` placa já cadastrada.

### GET `/veiculos` · GET `/veiculos/:id` · PATCH `/veiculos/:id` · DELETE `/veiculos/:id`
- `:id` é UUID. `DELETE` → **204**. Erros: `404` não encontrado, `409` placa duplicada (no update).

---

## Peças · Insumos

Estrutura idêntica (estoque). `:id` é numérico.

### POST `/pecas` · POST `/insumos`
```json
{
  "nome": "Filtro de óleo",
  "qtdEstoque": 10,
  "valorUn": 49.9
}
```
- `nome`: mínimo 2 caracteres. `qtdEstoque` e `valorUn`: número `>= 0`.

### GET · GET `/:id` · PATCH `/:id` · DELETE `/:id`
Operações de listagem, busca, atualização e remoção.

---

## Serviços

### POST `/servico`
```json
{
  "descricao": "Troca de óleo",
  "valor": 100.0
}
```
- `descricao`: mínimo 2 caracteres. `valor`: número `>= 0`. `:id` é numérico.

### GET `/servico` · GET `/servico/:id` · PATCH `/servico/:id` · DELETE `/servico/:id`

---

## Ordens de Serviço

`:id` é UUID em todas as rotas de OS.

### POST `/ordens-servico`
```json
{
  "mecanicoId": 2,
  "clienteId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "veiculoId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```
Cria a OS com status `recebida` e registra o marco inicial no histórico.
- **201 Created**. Erros: `404` cliente/veículo/mecânico não encontrado, `400` veículo não pertence ao cliente.

### GET `/ordens-servico` · GET `/ordens-servico/:id`
Lista (com filtros `?status=`, `?clienteId=`) e detalha OS — inclui serviços, peças e insumos.

### PATCH `/ordens-servico/:id/status`
```json
{ "status": "em_diagnostico" }
```
Só avança um passo na cadeia `recebida → em_diagnostico → aguardando_aprovacao → em_execucao → finalizada → entregue`. Cada transição grava no histórico. Erros: `400` transição inválida.

### POST `/ordens-servico/:id/aprovar-orcamento`
Atalho semântico: só funciona quando o status é `aguardando_aprovacao` e leva a OS para `em_execucao`. Erros: `400` se não estiver aguardando.

### POST `/ordens-servico/:id/{servicos|pecas|insumos}` · DELETE …
Adiciona/atualiza/remove os itens da OS. Peças e insumos **decrementam o estoque** ao serem reservados e **devolvem** ao serem removidos; é bloqueado se a OS já estiver `finalizada` ou `entregue`. Erros: `400` estoque insuficiente, `404` item não encontrado.

### GET `/ordens-servico/metricas/tempo-medio`
Tempo médio que as OS levam de `em_execucao` até `finalizada`, calculado pelo histórico de status.
```json
{ "tempoMedioMs": 0, "tempoMedioMinutos": 0, "tempoMedioHoras": 0 }
```

---

## Consulta pública (cliente)

### GET `/publico/ordens-servico/:id?numDocumento=...`

Endpoint **sem JWT** para o cliente acompanhar a própria OS. Exige a query `numDocumento` (CPF/CNPJ do dono, com ou sem máscara). A API compara só os dígitos.

- **200 OK** com o mesmo payload de `GET /ordens-servico/:id`.
- Erros: `400` se `numDocumento` ausente, `403` se o documento não confere com o dono, `404` se a OS não existe.

---

## Códigos de status comuns

| Código | Significado |
| ------ | ----------- |
| `200 OK` | Requisição bem-sucedida |
| `201 Created` | Recurso criado |
| `204 No Content` | Operação sem corpo de resposta (logout, delete) |
| `400 Bad Request` | Falha de validação do DTO |
| `401 Unauthorized` | Token ausente, inválido, expirado ou com formato não reconhecido |
| `403 Forbidden` | Token de cliente tentando rota de funcionário, ou OS pertence a outro cliente |
| `404 Not Found` | Recurso não encontrado |
| `409 Conflict` | Violação de unicidade (documento, email, placa) |
