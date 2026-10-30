# RFC-003 · Estratégia de Autenticação e Autorização

> Status: **Implementada** — corrigida em [PR #68](https://github.com/pedruvaz/tech-challenge-fiap-app-oficina/pull/68) (Closes #1)

---

## Contexto

A API da oficina é acessada por dois perfis distintos com JWTs diferentes:

1. **Funcionário** — token emitido por `POST /auth/login` desta API, com `{ sub: number, email, roles }` (`roles` é um valor do enum `Roles` do Prisma, **não** uma lista).
2. **Cliente** — token emitido pela Lambda `POST /auth` (login por CPF), com `{ sub: uuid, nome, email, tipo: "CLIENTE" }`.

Ambos são assinados com o mesmo `JWT_ACCESS_SECRET` (HS256).

---

## Falha conhecida (corrigida)

**Issue #1 — Token de cliente dá acesso de funcionário a toda a API**

### Evidências originais

- `src/middleware/jwt-auth.middleware.ts`: `verifyAsync<JwtPayload>(token, { secret })` só validava a assinatura. Nenhuma verificação do formato do payload em runtime.
- `src/auth/types/jwt-payload.interface.ts`: tipo TypeScript assume `sub: number` e `roles: Roles` — inexistente em tokens de cliente.
- Zero `CanActivate` / `UseGuards` / `@Roles` em todo o `src/`. Qualquer token válido acessava qualquer rota.
- `src/common/decorators/usuario-autenticado.decorator.ts`: retornava `req.user?.sub` como `number`, causando crash silencioso ao receber UUID de cliente.

### Correção implementada (PR #68)

#### 1. Validação de formato no middleware (`src/middleware/jwt-auth.middleware.ts`)

O middleware agora valida o payload em runtime **após** verificar a assinatura, e expõe um objeto normalizado em `req.user`:

- Token de cliente: `sub` string não vazia + `tipo === "CLIENTE"` + `nome` string não vazia → `{ tipo: 'CLIENTE', clienteId, nome, email? }`
- Token de funcionário: `sub` número finito + `roles` em `{admin, funcionario, mecanico}` + sem `tipo` → `{ tipo: 'FUNCIONARIO', usuarioId, email, roles }`
- Qualquer outro formato: `401 Unauthorized`
- `algorithms: ['HS256']` fixado na chamada `verifyAsync`.

#### 2. Guard global (`src/common/guards/tipo-usuario.guard.ts`)

Registrado como `APP_GUARD` no `AppModule`. Comportamento:

- **Funcionário**: passa sempre.
- **Cliente**: só passa se a rota tiver `@AcessoCliente()` (allowlist explícita).
- Sem `req.user` (rota pública sem middleware): `ForbiddenException` — não deve chegar aqui pois as rotas públicas excluem o middleware.

#### 3. Allowlist de cliente (`@AcessoCliente`)

Apenas três handlers recebem o decorator:

| Rota | Restrição de posse |
|------|-------------------|
| `GET /ordens-servico` | `clienteId` da query ignorado; usa `clienteId` do token |
| `GET /ordens-servico/:id` | `403` se `view.clienteId !== token.clienteId` |
| `POST /ordens-servico/:id/aprovar-orcamento` | `403` se `view.clienteId !== token.clienteId` |

#### 4. Decorator `UsuarioAutenticado`

Retorna `req.user.usuarioId` (number) apenas para tokens de funcionário; retorna `undefined` para clientes. Rotas que gravam `usuarioId` já aceitam `undefined` (parâmetro opcional).

#### 5. Tipo `ReqUser` (`src/auth/types/req-user.ts`)

União discriminada usada em `req.user` e em `src/types/express.d.ts`.

---

## O que NÃO muda

- Formato dos tokens (Lambda e API de funcionário inalterados).
- Rotas públicas: `GET /`, `POST /auth/login`, `POST /auth/refresh`, `GET /publico/ordens-servico/:id`, `GET /aprovacao/confirmar`, `POST /aprovacao/processar`, `GET /health/*`.
- Fluxo de login e refresh do funcionário.
- Nenhuma restrição por papel entre `admin`, `funcionario` e `mecanico` foi introduzida.
