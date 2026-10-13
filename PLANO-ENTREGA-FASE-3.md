# Plano de entrega — Tech Challenge Fase 3

Estado dos quatro repositórios e divisão de tarefas até a entrega.

Atualizado em 13/10/2026.

---

## 1. Os repositórios

Todos públicos, na conta `pedruvaz`, com `main` e `dev` e pipeline próprio.

| # | Repositório | Conteúdo | Estado |
|---|---|---|---|
| 1 | [infra-k8s](https://github.com/pedruvaz/tech-challenge-fiap-infra-k8s) | VPC, EKS Auto Mode, ECR, OIDC, roles | Migrado do monorepo |
| 2 | [infra-db](https://github.com/pedruvaz/tech-challenge-fiap-infra-db) | RDS PostgreSQL, Secrets Manager, SGs | Extraído da stack `cluster` |
| 3 | [lambda-auth](https://github.com/pedruvaz/tech-challenge-fiap-lambda-auth) | Autenticação por CPF, emissão do JWT | Novo — código e testes prontos |
| 4 | [app-oficina](https://github.com/pedruvaz/tech-challenge-fiap-app-oficina) | API NestJS, Docker, manifestos k8s | Migrado do monorepo |

### Ordem de deploy

Cada repositório lê os outputs do anterior via `terraform_remote_state` no S3.
A ordem não é sugestão: fora dela o `apply` falha com *Unable to find remote
state*.

```
infra-k8s  ──►  infra-db  ──►  lambda-auth
    │                              
    └──────────────────────────►  app-oficina
```

| Stack | Lê | Exporta |
|---|---|---|
| `infra-k8s` | — | `vpc_id`, `private_subnet_ids`, `cluster_primary_security_group_id`, `cluster_name`, `ecr_repository_url`, ARNs das roles |
| `infra-db` | VPC, subnets, SG do cluster | `api_secret_arn/name`, `lambda_security_group_id`, `db_endpoint` |
| `lambda-auth` | subnets, SG da Lambda, segredo | `lambda_invoke_arn` |
| `app-oficina` | cluster, ECR, segredo | — |

---

## 2. BLOQUEADORES — fazer primeiro (só você consegue)

Estas três coisas não podem ser feitas por automação nesta sessão: o proxy
bloqueia escrita nesses endpoints da API do GitHub. **São cliques no site.**

### 2.1 Proteger as branches (requisito avaliado)

Em cada um dos 4 repositórios: *Settings → Branches → Add branch protection
rule*, para `main` **e** `dev`:

- [x] Require a pull request before merging
- [x] Require approvals: **1**
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require conversation resolution before merging
- [ ] Allow force pushes — **desmarcado**
- [ ] Allow deletions — **desmarcado**

> Se o grupo for mergear sozinho e 1 aprovação travar, baixe para 0 — o
> requisito é "sem commit direto, merge via PR", e isso o resto da regra já
> garante. Não deixe sem regra nenhuma.

### 2.2 Adicionar o usuário `soat-architecture`

Em cada um dos 4 repositórios: *Settings → Collaborators → Add people →
`soat-architecture`* (permissão **Read** basta).

É item explícito do entregável — a confirmação vai no PDF.

### 2.3 Configurar secrets e variables do Actions

Sem isso **nenhum pipeline de deploy roda**. Em cada repositório,
*Settings → Secrets and variables → Actions*:

| Repositório | Secret | Variable |
|---|---|---|
| infra-k8s | `AWS_TERRAFORM_ROLE_ARN` | `AWS_REGION` |
| infra-db | `AWS_TERRAFORM_ROLE_ARN` | `AWS_REGION` |
| lambda-auth | `AWS_TERRAFORM_ROLE_ARN` | `AWS_REGION` |
| app-oficina | `AWS_DEPLOY_ROLE_ARN` | `AWS_REGION`, `ECR_REPOSITORY`, `EKS_CLUSTER_NAME`, `API_SECRET_NAME` |

Os ARNs saem do `terraform output` da stack `base` do `infra-k8s`, depois do
primeiro apply:

```bash
terraform output github_terraform_role_arn   # -> AWS_TERRAFORM_ROLE_ARN
terraform output github_actions_role_arn     # -> AWS_DEPLOY_ROLE_ARN
```

**Ovo e galinha:** o primeiro `apply` da stack `base` tem de ser feito da
máquina de alguém, com credencial da AWS. Só depois existe a role que o
pipeline assume. Está documentado no README do `infra-k8s` (etapas T0/T1).

---

## 3. O que ainda falta construir

Em ordem de risco. Os dois primeiros itens são requisito explícito do
enunciado e **ainda não existem em lugar nenhum** — nem no monorepo antigo.

### T1 · API Gateway + VPC Link  ⚠️ maior risco

**Repositório:** `infra-k8s` (nova pasta `terraform/gateway/`)

O enunciado exige API Gateway protegendo as rotas. Hoje não há nada disso.
O que precisa existir:

- `aws_apigatewayv2_api` (HTTP API).
- Rota `POST /auth` → integração Lambda, usando o output `lambda_invoke_arn`
  do `lambda-auth` (é o `invoke_arn`, **não** o `arn` — trocar os dois dá 500
  no Gateway sem log nenhum na função).
- Rotas protegidas → integração com o EKS via **VPC Link**, que exige um
  **NLB interno** à frente do Service da API. O EKS não é exposto direto.
- `aws_apigatewayv2_authorizer` do tipo JWT, validando com a mesma
  `JWT_ACCESS_SECRET`.

> **Atenção:** o authorizer JWT nativo do API Gateway valida tokens **OIDC/
> JWKS**, não HS256 com segredo compartilhado. Como a Lambda assina em HS256,
> o caminho realista é um **Lambda authorizer** (REQUEST/TOKEN) que lê a mesma
> chave do Secrets Manager e valida. Decidir isso cedo — é o que mais pode
> atrasar.

**Dependência circular a evitar:** o Gateway precisa do ARN da Lambda e a
Lambda precisa da permissão `lambda:InvokeFunction` vinda do Gateway. Resolva
com `aws_lambda_permission` na stack do gateway, referenciando a função pelo
nome — não o contrário.

### T2 · Observabilidade (Datadog ou New Relic)

**Repositórios:** `app-oficina` (agente + dashboards) e `lambda-auth` (logs)

Também não existe ainda. O enunciado pede, nominalmente:

- Latência das APIs, CPU/memória do Kubernetes, healthchecks e uptime.
- Alertas para falha no processamento de ordens de serviço.
- Logs estruturados em JSON **com correlação entre requisições**.
- Dashboards: volume diário de OS, tempo médio por status (Diagnóstico,
  Execução, Finalização) e erros de integração.

O que já ajuda: a `lambda-auth` já emite log JSON com `correlationId`
propagado do `requestId` do API Gateway. Falta o mesmo na API e o agente.

Caminho mais curto: Datadog Agent via Helm no cluster (`datadog-agent`), com
`DD_API_KEY` vindo do Secrets Manager, e o Lambda Forwarder para os logs da
função.

### T3 · Alinhar o contrato do JWT

**Repositórios:** `lambda-auth` + `app-oficina`

Hoje há uma divergência real, documentada no README da Lambda:

| | Lambda emite | API espera |
|---|---|---|
| `sub` | UUID do `cliente` | `number` (id de `usuario`) |
| claims | `nome`, `email`, `tipo: CLIENTE` | `email`, `roles` |

A assinatura confere (mesma chave), então o token **passa** na validação — mas
o `req.user` chega com formato diferente do que o código tipa. Decidir:
estender `JwtPayload` para aceitar os dois tipos de sujeito, ou emitir `roles`
na Lambda. É mudança pequena, mas atravessa os dois repositórios.

### T4 · Documentação da arquitetura

**Onde:** sugiro `app-oficina/docs/` (já concentra a documentação das fases
anteriores) ou um 5º repositório só de docs.

Falta, nominalmente:

- Diagrama de componentes com a visão de nuvem — **atualizar**: os C4 em
  `docs/Model C4/` são da Fase 2 e não têm API Gateway nem Lambda.
- Diagrama de sequência do fluxo de autenticação e de abertura de OS.
- **RFCs** — escolha da nuvem, do banco, da estratégia de autenticação.
- **ADRs** — padrão de comunicação, uso de HPA, separação em 4 repositórios,
  1 cluster com 2 namespaces.
- Justificativa formal do banco + diagrama ER e relacionamentos.

Boa parte do raciocínio já está escrita nos READMEs novos e nos comentários do
Terraform — dá para extrair em vez de escrever do zero.

### T5 · Vídeo (até 15 min) e PDF

Roteiro que cobre o que é cobrado:

1. Autenticação com CPF (`POST /auth` → token).
2. Pipeline rodando (abrir um PR e mostrar o CI + o plan comentado).
3. Deploy automático (merge na `main` → Actions → rollout no EKS).
4. Consumo de rota protegida com o Bearer.
5. Dashboard de monitoramento, ao vivo.
6. Logs e traces correlacionados.

PDF com: links dos 4 repos, link do vídeo, links da documentação e a
confirmação do `soat-architecture`.

---

## 4. Divisão sugerida

Pensada para paralelizar: as trilhas A e B quase não se tocam.

| Trilha | Tarefas | Por quê junto |
|---|---|---|
| **A — Infra/Gateway** | T1 (gateway + VPC Link + authorizer) | É o item de maior risco; quem pegar deve começar hoje |
| **B — Observabilidade** | T2 (agente, dashboards, alertas) | Independente do gateway; só precisa do cluster de pé |
| **C — Integração** | T3 (contrato do JWT) + subir as stacks na ordem | Atravessa dois repos, exige quem conheça a API |
| **D — Documentação** | T4 (RFCs, ADRs, diagramas, ER) | Pode andar em paralelo o tempo todo |
| **Todos** | T5 no fim | O vídeo depende de tudo no ar |

**Caminho crítico:** `base`/`cluster` aplicados → `infra-db` → `lambda-auth` →
gateway → vídeo. Enquanto a infra não subir, a trilha B fica parada: vale
subir o cluster cedo, mesmo que só para medir, e **destruir na ordem inversa**
(`infra-db` antes do `infra-k8s`, senão o RDS segura o destroy da VPC).

> **Custo:** a stack do cluster fica em torno de US$ 160/mês ligada. Suba para
> gravar o vídeo e derrube depois. O que sustenta a avaliação é o código, o
> histórico de execuções na aba Actions e o vídeo.

---

## 5. O que foi decidido na separação

Registrado aqui porque vira ADR depois, e porque muda o que vocês vão ver nos
repositórios.

### Um cluster, dois namespaces

`dev` → `tech-challenge-homolog`, `main` → `tech-challenge`. O requisito de
"deploy automático das branches de homologação e produção" é atendido na
camada da aplicação.

Duplicar a infraestrutura criaria um segundo EKS e um segundo RDS na mesma
conta: os nomes colidiriam (role, ECR e cluster derivam de `project_name`, que
é fixo) e o custo dobraria. O isolamento que importa aqui — rede, quota, RBAC
e o Secret da aplicação — o namespace já entrega.

### Duas roles de CI, não uma

| Role | Quem assume | Pode |
|---|---|---|
| `…-github-actions` | os 4 repos + frontend | ECR, `eks:DescribeCluster`, ler o segredo, S3 do front |
| `…-github-terraform` | só os 3 repos de infra | PowerUser + IAM |

Assim um PR no código da API não ganha permissão para destruir o cluster.

### O SG da Lambda nasce no `infra-db`

O ingress do RDS precisa referenciar o SG da Lambda, e um SG não pode ser
referenciado antes de existir. Se nascesse no `lambda-auth`, as duas stacks
ficariam em dependência circular. Criado no `infra-db`, o grafo fica numa
direção só.

### A chave do JWT mora junto do banco

A Lambda assina e o authorizer valida. Chaves separadas fariam todo token
emitido ser recusado na porta de entrada. Uma chave só, no Secrets Manager,
lida pelos dois.

### OIDC: os dois formatos de `sub`

O GitHub emite `sub` como `OWNER/REPO` (repos antigos) e `OWNER@ID/REPO@ID`
(repos novos). O match do IAM é literal. Os quatro repositórios são novos e
estão cadastrados nos dois formatos — sem isso, falhariam com *Not authorized
to perform sts:AssumeRoleWithWebIdentity*.

---

## 6. Checklist do enunciado

| Requisito | Estado |
|---|---|
| 4 repositórios separados | ✅ criados e populados |
| CI/CD em cada um | ✅ pipelines escritos; ⚠️ faltam os secrets (§2.3) |
| `main` protegida, merge via PR | ⚠️ **manual** (§2.1) |
| Deploy automático homolog + prod | ✅ `dev`/`main` por namespace |
| API Gateway | ❌ **T1** |
| Function Serverless de auth | ✅ código e testes prontos |
| Banco gerenciado (Terraform) | ✅ |
| Cluster K8s com escalabilidade | ✅ EKS Auto Mode + HPA |
| Terraform | ✅ |
| Observabilidade e dashboards | ❌ **T2** |
| Logs estruturados JSON + correlação | 🟡 feito na Lambda; falta na API |
| Documentação (C4, sequência, RFC, ADR, ER) | 🟡 existe da Fase 2; precisa atualizar — **T4** |
| README por repositório | ✅ |
| `soat-architecture` nos 4 repos | ⚠️ **manual** (§2.2) |
| Vídeo até 15 min | ❌ **T5** |

---

## 7. Validação já feita

O que foi conferido antes do push, para vocês não refazerem:

- `terraform fmt -check` limpo nas três stacks; HCL parseia.
- Todo output lido via `terraform_remote_state` existe de fato no `outputs.tf`
  da stack de origem — conferido um a um.
- `lambda-auth`: typecheck limpo, **20/20 testes passando**, bundle gera
  143 KB.
- `app-oficina`: `npm ci` + build + **645/645 testes passando** depois da
  migração.
- Os 5 workflows YAML parseiam e têm os jobs esperados.
- O `sed` que troca o namespace foi testado nos manifestos reais: reescreve as
  10 ocorrências, renomeia o objeto `Namespace`, é idempotente e não toca em
  `k8s/local/`.

**Não foi possível validar aqui:** `terraform validate` completo, porque
`registry.terraform.io` é bloqueado pela política de rede desta sessão e os
providers/módulos não podem ser baixados. A validação roda no CI, que tem
acesso ao registry — espere o primeiro PR confirmar.
