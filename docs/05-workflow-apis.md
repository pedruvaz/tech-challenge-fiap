# 5 · Workflow de Execução das APIs

> [← Voltar ao índice](./README.md)

Esta seção descreve os principais fluxos de negócio em diagramas de sequência. Os exemplos cobrem desde a autenticação até o ciclo completo de uma Ordem de Serviço.

> ℹ️ Os fluxos de **autenticação** e **cadastros** (cliente, veículo, peça, insumo, serviço, usuário) já estão implementados. O fluxo de **Ordem de Serviço** representa o comportamento planejado, cujo modelo de dados já está pronto.

## 1. Autenticação (login)

Toda rota protegida exige um access token válido. O fluxo abaixo obtém o par de tokens.

```mermaid
sequenceDiagram
    actor U as Usuário
    participant API as AuthController
    participant SV as AuthService
    participant DB as PostgreSQL

    U->>API: POST /auth/login { email, senha }
    API->>SV: login(dto)
    SV->>DB: busca usuário por email
    DB-->>SV: usuário (com hash da senha)
    SV->>SV: bcrypt.compare(senha, hash)
    SV->>SV: gera access + refresh token (JWT)
    SV->>DB: persiste hash do refresh token
    SV-->>API: { accessToken, refreshToken, usuario }
    API-->>U: 200 OK + tokens
```

## 2. Renovação e logout

```mermaid
sequenceDiagram
    actor U as Usuário
    participant API as AuthController
    participant SV as AuthService
    participant DB as PostgreSQL

    Note over U,DB: Renovação (access token expirado)
    U->>API: POST /auth/refresh { refreshToken }
    API->>SV: refresh(token)
    SV->>SV: verifica assinatura do refresh token
    SV->>DB: compara hash armazenado
    SV->>SV: gera novo par de tokens (rotação)
    SV->>DB: persiste novo hash
    SV-->>U: 200 OK + novos tokens

    Note over U,DB: Logout (revogação)
    U->>API: POST /auth/logout (Bearer access token)
    API->>SV: logout(userId)
    SV->>DB: refresh_token = null
    SV-->>U: 204 No Content
```

## 3. Cadastro de cliente e veículo

Pré-requisito para abrir uma Ordem de Serviço.

```mermaid
sequenceDiagram
    actor F as Funcionário (autenticado)
    participant CL as ClienteController
    participant VE as VeiculoController
    participant DB as PostgreSQL

    F->>CL: POST /clientes { numDocumento, nome, telefone, tipo }
    CL->>CL: valida CPF/CNPJ conforme o tipo
    CL->>DB: verifica documento duplicado
    CL->>DB: cria cliente
    CL-->>F: 201 Created (cliente)

    F->>VE: POST /veiculos { placa, marca, modelo, ano, cor }
    VE->>DB: verifica placa duplicada
    VE->>DB: cria veículo
    VE-->>F: 201 Created (veículo)
```

## 4. Ciclo de uma Ordem de Serviço (planejado)

Fluxo de ponta a ponta: da abertura à entrega, com consumo de itens e cálculo do valor final.

```mermaid
sequenceDiagram
    actor M as Mecânico
    participant OS as OrdemServicoController
    participant SV as OrdemServicoService
    participant DB as PostgreSQL

    M->>OS: POST /ordens-servico { clienteId, veiculoId }
    OS->>SV: cria OS (status = recebida, valor_final = 0)
    SV->>DB: insere ordem_servico
    SV-->>M: 201 Created (OS)

    Note over M,DB: Diagnóstico e orçamento
    M->>OS: PATCH /ordens-servico/:id (status = em_diagnostico)
    M->>OS: adiciona serviços / peças / insumos à OS
    SV->>DB: registra serviço_realizado / peca_utilizada / insumo_consumido
    SV->>SV: recalcula valor_final
    M->>OS: PATCH status = aguardando_aprovacao

    Note over M,DB: Aprovação e execução
    M->>OS: PATCH status = em_execucao
    SV->>DB: baixa estoque de peças/insumos
    M->>OS: PATCH status = finalizada

    Note over M,DB: Entrega
    M->>OS: PATCH status = entregue
    SV-->>M: 200 OK (OS concluída)
```

## 5. Acesso a rota protegida

Como o middleware JWT participa de qualquer chamada autenticada.

```mermaid
sequenceDiagram
    actor U as Usuário
    participant MW as JwtAuthMiddleware
    participant CT as Controller
    participant SV as Service

    U->>MW: GET /clientes (Authorization: Bearer <token>)
    alt token ausente ou inválido
        MW-->>U: 401 Unauthorized
    else token válido
        MW->>MW: verifyAsync(token, JWT_ACCESS_SECRET)
        MW->>CT: req.user = payload
        CT->>SV: findAll()
        SV-->>U: 200 OK (lista)
    end
```
