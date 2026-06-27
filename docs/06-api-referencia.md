# 6 · Referência da API

> [← Voltar ao índice](./README.md)

- **Base URL (dev):** `http://localhost:3000`
- **Documentação interativa:** `http://localhost:3000/docs` (Swagger)
- **Autenticação:** header `Authorization: Bearer <accessToken>` em todas as rotas, **exceto** `GET /`, `POST /auth/login` e `POST /auth/refresh`.

A tabela abaixo resume os endpoints; os payloads detalhados vêm na sequência.

| Recurso | Método | Rota | Protegida | Descrição |
| ------- | ------ | ---- | :-------: | --------- |
| Health | `GET` | `/` | ❌ | Health check |
| Auth | `POST` | `/auth/login` | ❌ | Autentica e retorna par de tokens |
| Auth | `POST` | `/auth/refresh` | ❌ | Renova o par de tokens |
| Auth | `POST` | `/auth/logout` | ✅ | Revoga o refresh token |
| Usuários | `POST` | `/usuarios` | ✅ | Cria usuário |
| Usuários | `GET` | `/usuarios` | ✅ | Lista usuários |
| Usuários | `GET` | `/usuarios/:id` | ✅ | Busca usuário por id |
| Usuários | `PATCH` | `/usuarios/:id` | ✅ | Atualiza usuário |
| Usuários | `DELETE` | `/usuarios/:id` | ✅ | Remove (soft delete) usuário |
| Clientes | `POST` | `/clientes` | ✅ | Cria cliente |
| Clientes | `GET` | `/clientes` | ✅ | Lista clientes |
| Clientes | `GET` | `/clientes/:id` | ✅ | Busca cliente por id |
| Clientes | `PATCH` | `/clientes/:id` | ✅ | Atualiza cliente |
| Clientes | `DELETE` | `/clientes/:id` | ✅ | Remove (soft delete) cliente |
| Veículos | `POST` | `/veiculos` | ✅ | Cria veículo |
| Veículos | `GET` | `/veiculos` | ✅ | Lista veículos |
| Veículos | `GET` | `/veiculos/:id` | ✅ | Busca veículo por id |
| Veículos | `PATCH` | `/veiculos/:id` | ✅ | Atualiza veículo |
| Veículos | `DELETE` | `/veiculos/:id` | ✅ | Remove (soft delete) veículo |
| Peças | `POST` | `/pecas` | ✅ | Cria peça |
| Peças | `GET` | `/pecas` | ✅ | Lista peças |
| Peças | `GET` | `/pecas/:id` | ✅ | Busca peça por id |
| Peças | `PATCH` | `/pecas/:id` | ✅ | Atualiza peça |
| Peças | `DELETE` | `/pecas/:id` | ✅ | Remove peça |
| Insumos | `POST` | `/insumos` | ✅ | Cria insumo |
| Insumos | `GET` | `/insumos` | ✅ | Lista insumos |
| Insumos | `GET` | `/insumos/:id` | ✅ | Busca insumo por id |
| Insumos | `PATCH` | `/insumos/:id` | ✅ | Atualiza insumo |
| Insumos | `DELETE` | `/insumos/:id` | ✅ | Remove insumo |
| Serviços | `POST` | `/servico` | ✅ | Cria serviço |
| Serviços | `GET` | `/servico` | ✅ | Lista serviços |
| Serviços | `GET` | `/servico/:id` | ✅ | Busca serviço por id |
| Serviços | `PATCH` | `/servico/:id` | ✅ | Atualiza serviço |
| Serviços | `DELETE` | `/servico/:id` | ✅ | Remove serviço |

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
- **201 Created**. Erros: `409` placa já cadastrada.

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

## Códigos de status comuns

| Código | Significado |
| ------ | ----------- |
| `200 OK` | Requisição bem-sucedida |
| `201 Created` | Recurso criado |
| `204 No Content` | Operação sem corpo de resposta (logout, delete) |
| `400 Bad Request` | Falha de validação do DTO |
| `401 Unauthorized` | Token ausente, inválido ou expirado |
| `404 Not Found` | Recurso não encontrado |
| `409 Conflict` | Violação de unicidade (documento, email, placa) |
