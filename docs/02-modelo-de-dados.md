# 2 · Modelo de Dados

> [← Voltar ao índice](./README.md)

O modelo é definido em [`prisma/schema.prisma`](../prisma/schema.prisma) e materializado no PostgreSQL via migrations versionadas em `prisma/migrations/`.

## Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    USUARIO ||--o{ ORDEM_SERVICO : "executa"
    CLIENTE ||--o{ ORDEM_SERVICO : "solicita"
    VEICULO ||--o{ ORDEM_SERVICO : "é atendido em"
    CLIENTE ||--o{ VEICULO_CLIENTE : ""
    VEICULO ||--o{ VEICULO_CLIENTE : ""
    ORDEM_SERVICO ||--o{ INSUMO_CONSUMIDO : ""
    INSUMO ||--o{ INSUMO_CONSUMIDO : ""
    ORDEM_SERVICO ||--o{ PECA_UTILIZADA : ""
    PECA ||--o{ PECA_UTILIZADA : ""
    ORDEM_SERVICO ||--o{ SERVICO_REALIZADO : ""
    SERVICO ||--o{ SERVICO_REALIZADO : ""

    USUARIO {
        int id_usuario PK
        string nome
        string email UK
        string senha
        Roles roles
        string refresh_token
        datetime criado_em
        datetime atualizado_em
        datetime deletado_em
    }
    CLIENTE {
        uuid cliente_id PK
        string num_documento UK
        string nome
        string telefone
        Tipo tipo
        datetime criado_em
        datetime atualizado_em
        datetime deletado_em
    }
    VEICULO {
        uuid veiculo_id PK
        string placa UK
        string marca
        string modelo
        string ano
        string cor
        datetime criado_em
        datetime atualizado_em
        datetime deletado_em
    }
    VEICULO_CLIENTE {
        uuid veiculo_id PK_FK
        uuid cliente_id PK_FK
    }
    ORDEM_SERVICO {
        uuid os_id PK
        int usuario_id FK
        uuid cliente_id FK
        uuid veiculo_id FK
        Status status
        decimal valor_final
        datetime criado_em
        datetime atualizado_em
        datetime deletado_em
    }
    INSUMO {
        int insumo_id PK
        string nome
        int qtd_estoque
        decimal valor_un
    }
    INSUMO_CONSUMIDO {
        uuid os_id PK_FK
        int insumo_id PK_FK
        int qtd_consumida
        decimal valor
    }
    PECA {
        int peca_id PK
        string nome
        int qtd_estoque
        decimal valor_un
    }
    PECA_UTILIZADA {
        uuid os_id PK_FK
        int peca_id PK_FK
        int qtd
        decimal valor
    }
    SERVICO {
        int servico_id PK
        string descricao
        decimal valor
    }
    SERVICO_REALIZADO {
        uuid os_id PK_FK
        int servico_id PK_FK
        int quantidade
        decimal valor
    }
```

## Enums

| Enum | Valores | Uso |
| ---- | ------- | --- |
| `Roles` | `admin`, `funcionario`, `mecanico` | Papel do usuário (padrão: `funcionario`) |
| `Tipo` | `pessoa_fisica`, `pessoa_juridica` | Tipo do cliente (define CPF ou CNPJ) |
| `Status` | `recebida`, `em_diagnostico`, `aguardando_aprovacao`, `em_execucao`, `finalizada`, `entregue` | Estágio da Ordem de Serviço (padrão: `recebida`) |

## Entidades

### Usuario (`usuario`)
Operadores do sistema (mecânicos, funcionários, administradores). A senha é armazenada com hash bcrypt; o `refresh_token` guarda o hash do token de renovação ativo.

### Cliente (`cliente`)
Pessoa física ou jurídica. O `num_documento` (CPF/CNPJ) é **único** e validado conforme o `tipo`. Possui veículos (N:N) e ordens de serviço.

### Veiculo (`veiculo`)
Veículo identificado pela `placa` (única). Pode pertencer a mais de um cliente ao longo do tempo (relação N:N via `veiculo_cliente`).

### VeiculoCliente (`veiculo_cliente`)
Tabela de junção que modela a relação **N:N** entre clientes e veículos. Chave primária composta (`veiculo_id`, `cliente_id`).

### OrdemServico (`ordem_servico`)
Agregado central. Vincula **mecânico** (usuário), **cliente** e **veículo**, controla o `status` e acumula o `valor_final` a partir dos itens consumidos.

### Insumo (`insumo`) e Peca (`peca`)
Itens de estoque com `qtd_estoque` e `valor_un`. Insumos são materiais de consumo (ex.: óleo); peças são componentes (ex.: filtro, pastilha).

### Servico (`servico`)
Catálogo de serviços oferecidos pela oficina, com `descricao` e `valor`.

### Tabelas de consumo (`insumo_consumido`, `peca_utilizada`, `servico_realizado`)
Relacionam a OS aos itens efetivamente usados, registrando **quantidade** e o **valor histórico** no momento do uso — preservando o preço cobrado mesmo que o catálogo/estoque mude depois.

## Convenções

- **Identificadores:** `Usuario`, `Insumo`, `Peca` e `Servico` usam `Int` autoincremento; `Cliente`, `Veiculo` e `OrdemServico` usam `UUID`.
- **Timestamps de auditoria:** `criado_em` (default `now()`), `atualizado_em` (`@updatedAt`).
- **Soft delete:** a coluna `deletado_em` (nullable) marca registros removidos sem apagá-los fisicamente — a API faz _soft delete_ nas operações de `DELETE`.
- **Mapeamento:** os campos em `camelCase` no schema Prisma são mapeados para `snake_case` no banco via `@map`/`@@map`.
- **Valores monetários:** `Decimal(10,2)`.
