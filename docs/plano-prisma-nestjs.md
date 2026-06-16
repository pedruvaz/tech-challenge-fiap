# Plano: Prisma ORM + NestJS — Oficina Mecânica

## Contexto

O projeto já tem `prisma` e `@prisma/client` instalados e um `schema.prisma` vazio.
O `AppModule` ainda usa TypeORM — a migração vai remover TypeORM e substituir por Prisma.

### Entidades identificadas no ER

| Entidade | Tipo | PK |
|---|---|---|
| `Usuario` | tabela principal | `idUsuario` (autoincrement) |
| `Cliente` | tabela principal | `clienteId` (uuid) |
| `Veiculo` | tabela principal | `veiculoId` (uuid) |
| `OrdemServico` | tabela principal | `osId` (uuid) |
| `Insumo` | tabela principal | `insumoId` (autoincrement) |
| `Peca` | tabela principal | `pecaId` (autoincrement) |
| `Servico` | tabela principal | `servicoId` (autoincrement) |
| `veiculo_cliente` | tabela de junção | `veiculoId` + `clienteId` |
| `insumos_consumidos` | tabela de detalhe | `osId` + `insumoId` |
| `pecas_utilizadas` | tabela de detalhe | `osId` + `pecaId` |
| `servicos_realizados` | tabela de junção | `osId` + `servicoId` |

**Enums:** `Roles` (admin, funcionario, mecanico), `Tipo` (pessoa_fisica, pessoa_juridica), `Status` (recebida, em_diagnostico, aguardando_aprovacao, em_execucao, finalizada, entregue)

**OBS do diagrama:**
- CNPJ alfanumérico com separação por hífen
- Todas as entidades devem ter `criado_em`, `atualizado_em`, `deletado_em` (soft delete)

---

## Etapas

| # | O que fazer | Arquivo(s) |
|---|---|---|
| 1 | Montar o `schema.prisma` com os models do ER | `prisma/schema.prisma` |
| 2 | Criar `PrismaService` | `src/prisma/prisma.service.ts` |
| 3 | Criar `PrismaModule` global | `src/prisma/prisma.module.ts` |
| 4 | Remover TypeORM do `AppModule` e importar `PrismaModule` | `src/app.module.ts` |
| 5 | Configurar `.env` e rodar a migration | terminal |
| 6 | (opcional) Aplicar migration automática no boot | `src/main.ts` |

---

## Etapa 1 — schema.prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────────────────
// ENUMS
// ──────────────────────────────────────────────

enum Roles {
  admin
  funcionario
  mecanico
}

enum Tipo {
  pessoa_fisica
  pessoa_juridica
}

enum Status {
  recebida
  em_diagnostico
  aguardando_aprovacao
  em_execucao
  finalizada
  entregue
}

// ──────────────────────────────────────────────
// USUARIO
// ──────────────────────────────────────────────

model Usuario {
  idUsuario  Int      @id @default(autoincrement())
  nome       String
  email      String   @unique
  senha      String
  roles      Roles    @default(funcionario)
  criadoEm  DateTime  @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt   @map("atualizado_em")
  deletadoEm DateTime?              @map("deletado_em")

  ordensServico OrdemServico[]

  @@map("usuario")
}

// ──────────────────────────────────────────────
// CLIENTE
// ──────────────────────────────────────────────

model Cliente {
  clienteId    String   @id @default(uuid())  @map("cliente_id")
  numDocumento String   @unique               @map("num_documento") // CPF ou CNPJ (alfanumérico com hífen)
  nome         String
  telefone     String
  tipo         Tipo
  criadoEm    DateTime  @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt      @map("atualizado_em")
  deletadoEm  DateTime?                 @map("deletado_em")

  veiculos VeiculoCliente[]

  @@map("cliente")
}

// ──────────────────────────────────────────────
// VEÍCULO
// ──────────────────────────────────────────────

model Veiculo {
  veiculoId String   @id @default(uuid()) @map("veiculo_id")
  placa     String   @unique
  marca     String
  modelo    String
  ano       String
  cor       String
  criadoEm    DateTime  @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt      @map("atualizado_em")
  deletadoEm  DateTime?                 @map("deletado_em")

  clientes      VeiculoCliente[]
  ordensServico OrdemServico[]

  @@map("veiculo")
}

// ──────────────────────────────────────────────
// VEÍCULO_CLIENTE (N:N)
// ──────────────────────────────────────────────

model VeiculoCliente {
  veiculoId String @map("veiculo_id")
  clienteId String @map("cliente_id")

  veiculo Veiculo @relation(fields: [veiculoId], references: [veiculoId])
  cliente Cliente @relation(fields: [clienteId], references: [clienteId])

  @@id([veiculoId, clienteId])
  @@map("veiculo_cliente")
}

// ──────────────────────────────────────────────
// ORDEM DE SERVIÇO
// ──────────────────────────────────────────────

model OrdemServico {
  osId       String  @id @default(uuid()) @map("os_id")
  usuarioId  Int                          @map("usuario_id")    // mecânico responsável
  clienteId  String                       @map("cliente_id")
  veiculoPlaca String                     @map("veiculo_placa")
  status     Status  @default(recebida)
  valorFinal Decimal @default(0)          @db.Decimal(10, 2) @map("valor_final")
  criadoEm    DateTime  @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt      @map("atualizado_em")
  deletadoEm  DateTime?                 @map("deletado_em")

  mecanico          Usuario              @relation(fields: [usuarioId], references: [idUsuario])
  veiculo           Veiculo              @relation(fields: [veiculoPlaca], references: [placa])
  insumosConsumidos InsumoConsumido[]
  pecasUtilizadas   PecaUtilizada[]
  servicosRealizados ServicoRealizado[]

  @@map("ordem_servico")
}

// ──────────────────────────────────────────────
// INSUMO
// ──────────────────────────────────────────────

model Insumo {
  insumoId   Int      @id @default(autoincrement()) @map("insumo_id")
  nome       String
  qtdEstoque Int      @map("qtd_estoque")
  valorUn    Decimal  @db.Decimal(10, 2) @map("valor_un")
  criadoEm    DateTime  @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt      @map("atualizado_em")
  deletadoEm  DateTime?                 @map("deletado_em")

  insumosConsumidos InsumoConsumido[]

  @@map("insumo")
}

// ──────────────────────────────────────────────
// INSUMOS_CONSUMIDOS (OS ↔ Insumo com quantidade)
// ──────────────────────────────────────────────

model InsumoConsumido {
  osId         String  @map("os_id")
  insumoId     Int     @map("insumo_id")
  qtdConsumida Int     @map("qtd_consumida")
  valor        Decimal @db.Decimal(10, 2)

  ordemServico OrdemServico @relation(fields: [osId],     references: [osId])
  insumo       Insumo       @relation(fields: [insumoId], references: [insumoId])

  @@id([osId, insumoId])
  @@map("insumos_consumidos")
}

// ──────────────────────────────────────────────
// PEÇA
// ──────────────────────────────────────────────

model Peca {
  pecaId     Int      @id @default(autoincrement()) @map("peca_id")
  nome       String
  qtdEstoque Int      @map("qtd_estoque")
  valorUn    Decimal  @db.Decimal(10, 2) @map("valor_un")
  criadoEm    DateTime  @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt      @map("atualizado_em")
  deletadoEm  DateTime?                 @map("deletado_em")

  pecasUtilizadas PecaUtilizada[]

  @@map("peca")
}

// ──────────────────────────────────────────────
// PECAS_UTILIZADAS (OS ↔ Peça com quantidade)
// ──────────────────────────────────────────────

model PecaUtilizada {
  osId   String  @map("os_id")
  pecaId Int     @map("peca_id")
  qtd    Int
  valor  Decimal @db.Decimal(10, 2)

  ordemServico OrdemServico @relation(fields: [osId],   references: [osId])
  peca         Peca         @relation(fields: [pecaId], references: [pecaId])

  @@id([osId, pecaId])
  @@map("pecas_utilizadas")
}

// ──────────────────────────────────────────────
// SERVIÇO
// ──────────────────────────────────────────────

model Servico {
  servicoId  Int      @id @default(autoincrement()) @map("servico_id")
  descricao  String
  valor      Decimal  @db.Decimal(10, 2)
  criadoEm    DateTime  @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt      @map("atualizado_em")
  deletadoEm  DateTime?                 @map("deletado_em")

  servicosRealizados ServicoRealizado[]

  @@map("servico")
}

// ──────────────────────────────────────────────
// SERVICOS_REALIZADOS (OS ↔ Serviço)
// ──────────────────────────────────────────────

model ServicoRealizado {
  osId      String @map("os_id")
  servicoId Int    @map("servico_id")

  ordemServico OrdemServico @relation(fields: [osId],      references: [osId])
  servico      Servico      @relation(fields: [servicoId], references: [servicoId])

  @@id([osId, servicoId])
  @@map("servicos_realizados")
}
```

---

## Etapa 2 — PrismaService

Crie `src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

---

## Etapa 3 — PrismaModule

Crie `src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

`@Global()` faz com que qualquer outro module possa injetar `PrismaService` sem precisar reimportar `PrismaModule`.

---

## Etapa 4 — AppModule (remover TypeORM, adicionar Prisma)

Substitua `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // seus outros modules aqui (ClienteModule, OrdemServicoModule, etc.)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## Etapa 5 — Configurar .env e rodar a migration

### .env (crie na raiz)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oficina"
```

### Comandos (desenvolvimento)

```bash
# Gera a migration e aplica no banco
npx prisma migrate dev --name init

# Abre o Prisma Studio para verificar as tabelas no navegador
npx prisma studio
```

Para cada mudança futura no schema:

```bash
npx prisma migrate dev --name <nome-da-mudanca>
```

---

## Etapa 6 — Migration automática no boot (recomendado para produção)

Em `src/main.ts`, adicione **antes** do `NestFactory.create`:

```typescript
import { execSync } from 'child_process';

async function bootstrap() {
  // Aplica migrations pendentes sem gerar novas (seguro em produção)
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  const app = await NestFactory.create(AppModule);
  // ... resto do bootstrap
}
```

> `migrate deploy` → aplica migrations existentes (produção)
> `migrate dev` → gera + aplica (só desenvolvimento)

---

## Etapa 7 — Como usar o PrismaService nos outros modules

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClienteService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    // soft delete: ignora registros com deletado_em preenchido
    return this.prisma.cliente.findMany({
      where: { deletadoEm: null },
    });
  }

  softDelete(clienteId: string) {
    return this.prisma.cliente.update({
      where: { clienteId },
      data: { deletadoEm: new Date() },
    });
  }
}
```

---

## Desinstalar TypeORM

```bash
npm uninstall @nestjs/typeorm typeorm
```

---

## Scripts úteis — adicione no package.json

```json
"db:migrate": "prisma migrate dev",
"db:deploy": "prisma migrate deploy",
"db:reset":  "prisma migrate reset --force",
"db:studio": "prisma studio"
```

---

## Checklist de execução

- [ ] Copiar o schema acima para `prisma/schema.prisma`
- [ ] Criar `.env` com `DATABASE_URL`
- [ ] Criar `src/prisma/prisma.service.ts`
- [ ] Criar `src/prisma/prisma.module.ts`
- [ ] Atualizar `src/app.module.ts` (remover TypeORM, importar PrismaModule)
- [ ] Rodar `npx prisma migrate dev --name init`
- [ ] Verificar tabelas com `npx prisma studio`
- [ ] Remover TypeORM: `npm uninstall @nestjs/typeorm typeorm`
