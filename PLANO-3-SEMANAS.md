# Plano de 3 semanas — Fase 3, da teoria à entrega

Construído a partir das 27 aulas da fase (4 trilhas) cruzadas com o que já
está pronto nos quatro repositórios.

Período: **13/10 a 02/11/2026**. Complementa o `PLANO-ENTREGA-FASE-3.md`,
que tem o estado dos repos e os bloqueadores manuais.

---

## A ementa, e onde cada aula é cobrada na entrega

| Trilha | Aulas | O que ensina | Onde entra |
|---|---|---|---|
| **Desenvolvimento Serverless** (Luiz Zenha) | 1–6 | Lambda, Fargate, SQS/SNS, EventBridge, Step Functions · custos · ECS/ECR · **VPC + ALB + API Gateway** · **Cognito/OAuth2** · SAM | Lambda de auth, API Gateway, VPC Link |
| **API Gateway / APIM** (Milton Camara) | 1–6 | Conceito de API GW · Azure APIM · APIM na prática (cache, monitoramento) · **Kong**, Konga, Consumers | RFC da escolha do gateway |
| **Monitoramento e acesso avançado** | 1–12 | **SRE: SLI/SLO/SLA/Error Budget** · Golden Metrics · Tracing/OpenTelemetry · **Datadog** (APM, logs, infra, alertas, dashboards) · **New Relic** (idem, NRQL) · **alertas via Terraform** | Toda a observabilidade |
| **Zabbix / Prometheus** | 1–3 | Zabbix · **Prometheus, Grafana, Loki, Promtail** | Alternativa no RFC |

Observação que economiza tempo: a trilha de APIM é **Azure** e a de Kong é
**Docker Compose**. Vocês estão na AWS — o que vale dessas seis aulas é o
*conceito* e o material para justificar a escolha no RFC. A implementação
está na trilha Serverless, aulas 4 e 5.

---

## A decisão que precisa ser tomada no dia 1

As aulas 4 e 5 de Serverless ensinam este caminho:

```
Cliente → API Gateway → (JWT authorizer nativo ← Cognito User Pool)
                      → VPC Link → ALB em subnet privada → serviço
```

A metade de baixo serve exatamente para vocês: é o mesmo desenho que o
`infra-k8s` já tem, trocando ECS Fargate por EKS. **A metade de cima não
serve** — e é importante perceber isso antes de começar, não depois.

O enunciado manda a Function Serverless *validar o CPF, consultar o cliente
na base e emitir o JWT*. O Cognito autentica contra o diretório dele, não
contra a tabela `cliente` do RDS. Usar Cognito significaria abandonar o
requisito; usar o Lambda que já está pronto significa que o **authorizer JWT
nativo do API Gateway não serve**, porque ele valida token OIDC/JWKS e o
Lambda assina em HS256 com segredo compartilhado.

**Recomendação:** manter o Lambda e usar um **Lambda authorizer** (tipo
REQUEST) que lê a mesma `JWT_ACCESS_SECRET` do Secrets Manager. É o que
atende o enunciado, e o `infra-db` já guarda a chave num lugar só
exatamente para isso.

O Cognito não é desperdício: ele vira **a alternativa avaliada e recusada no
RFC de autenticação**, que é um entregável. Documentar por que foi recusado
vale mais que ter usado.

---

## Semana 1 (13–19/10) — API Gateway e autenticação ponta a ponta

Fecha o **T1**, o item de maior risco. Ao final da semana, um CPF tem de
virar token e o token tem de abrir uma rota protegida.

**Estudar antes de codar (≈2h):** Serverless aula 4 (VPC, ALB, API Gateway)
e aula 5 (OAuth2, authorizer). APIGW aula 1 só para o RFC.

| # | Tarefa | Repo | Saída |
|---|---|---|---|
| 1.1 | Subir `base` + `cluster` da máquina de alguém e guardar os ARNs | infra-k8s | secrets do Actions preenchidos (§2.3 do outro plano) |
| 1.2 | Aplicar `infra-db` e conferir o segredo | infra-db | `api_secret_arn`, `lambda_security_group_id` |
| 1.3 | Aplicar `lambda-auth` e invocar a função direto pela CLI | lambda-auth | token emitido com dado real |
| 1.4 | **NLB interno + VPC Link** | infra-k8s `terraform/gateway/` | `vpc_link_id` |
| 1.5 | **HTTP API + rota `POST /auth`** → `lambda_invoke_arn` | infra-k8s | rota pública funcionando |
| 1.6 | **Lambda authorizer** validando HS256 | lambda-auth | função `authorizer` |
| 1.7 | **Rotas protegidas** → VPC Link → NLB → Service do EKS | infra-k8s | 401 sem token, 200 com token |
| 1.8 | Alinhar o contrato do JWT (T3 do outro plano) | lambda-auth + app-oficina | `sub`/`roles` coerentes |

**Armadilhas que já conheço deste código:**

- Use `lambda_invoke_arn`, **não** `lambda_function_arn`, no
  `integration_uri`. Trocar dá 500 no Gateway sem log nenhum na função.
- `aws_lambda_permission` mora na stack do gateway, referenciando a função
  pelo nome. O contrário cria dependência circular entre os dois repos.
- O Service do EKS precisa virar NLB **interno**
  (`service.beta.kubernetes.io/aws-load-balancer-scheme: internal`). Hoje o
  `41-api-service.yaml` sobe NLB público — o enunciado quer o EKS atrás do
  gateway.
- A Lambda está em subnet privada: sem NAT ou VPC endpoint, a leitura do
  Secrets Manager trava até o timeout e parece lentidão do banco.

**Critério de pronto:** `curl -X POST .../auth -d '{"cpf":"..."}'` devolve
token, e o mesmo token abre uma rota protegida. Grave o terminal — serve
para o vídeo.

---

## Semana 2 (20–26/10) — Observabilidade

Fecha o **T2**. Toda a trilha de 12 aulas cai aqui.

**Estudar (≈3h):** Monitoramento aulas 1 (SLI/SLO/SLA, Golden Metrics,
OpenTelemetry), 2–6 (Datadog: APM, logs, infra, alertas, dashboards) e 10
(alertas, inclusive **via Terraform**).

Escolham **Datadog ou New Relic**, não os dois. As aulas 2–6 cobrem Datadog e
7–9/11–12 cobrem New Relic, com o mesmo roteiro. Datadog tem a vantagem de o
Agent aceitar OTLP nativamente — e aí entra o atalho abaixo.

**O atalho que vocês já têm:** `src/tracing.ts` no `app-oficina` já roda
OpenTelemetry com auto-instrumentação de HTTP, Nest e das queries via `pg`, e
escolhe o exporter por variável de ambiente. Apontar
`OTEL_EXPORTER_OTLP_ENDPOINT` para o Agent **já entrega tracing distribuído**
sem escrever código de instrumentação. É o conceito da aula 1 (Tracing +
OpenTelemetry) literalmente pronto.

| # | Tarefa | Onde | Aula que cobre |
|---|---|---|---|
| 2.1 | Agent via Helm no cluster, `DD_API_KEY` do Secrets Manager | infra-k8s | 4 (infra) |
| 2.2 | Ligar o OTLP: env no ConfigMap apontando pro Agent | app-oficina | 1, 2 |
| 2.3 | Log JSON com `correlationId` **na API** (a Lambda já tem) | app-oficina | 3 (logs) |
| 2.4 | Forwarder dos logs da Lambda | lambda-auth | 3 |
| 2.5 | Definir **SLI/SLO** antes dos alertas | docs | 1, 10 |
| 2.6 | Alertas, **em Terraform**, com nomenclatura descritiva | infra-k8s | 10 |
| 2.7 | Dashboards: volume diário de OS, tempo médio por status, erros | — | 6, 11 |

**Detalhe que a aula 10 bate e o enunciado cobra:** nome de alerta tem de
carregar a informação. `AWS-EKS-OficinaAPI-Prod-OS-Falha-Critical`, não
`alerta-01`. E o enunciado pede nominalmente *alerta para falha no
processamento de ordens de serviço* — é um alerta específico de negócio, não
só CPU e memória.

Os três dashboards cobrados (volume diário de OS, tempo médio por status
Diagnóstico/Execução/Finalização, erros de integração) saem da tabela
`historico_status_os`, que já existe no schema.

**Critério de pronto:** um request atravessa gateway → API → banco e aparece
como um trace único; um alerta dispara de verdade; os três dashboards estão
no ar.

---

## Semana 3 (27/10–02/11) — Documentação, vídeo e entrega

Fecha **T4** e **T5**. Sem código novo — e isso é proposital, porque é a
semana que todo grupo subestima.

| # | Entregável | Fonte |
|---|---|---|
| 3.1 | **Diagrama de componentes** atualizado | os C4 em `docs/Model C4/` são da Fase 2, sem gateway nem Lambda |
| 3.2 | **Diagrama de sequência**: autenticação e abertura de OS | — |
| 3.3 | **RFC — escolha da nuvem** | Serverless 1 e 2 (custos) |
| 3.4 | **RFC — estratégia de autenticação** | Serverless 5: Cognito avaliado e recusado, com o motivo |
| 3.5 | **RFC — escolha do gateway** | APIGW 1–3 (APIM) e POSTECH 4–6 (Kong) como alternativas |
| 3.6 | **RFC — escolha do banco** + ER e relacionamentos | `prisma/schema.prisma` |
| 3.7 | **ADRs**: 4 repos, 1 cluster/2 namespaces, HPA, 2 roles de CI, SG da Lambda no `infra-db`, chave JWT compartilhada | §5 do outro plano — já está escrito, é só formatar |
| 3.8 | **Vídeo** (≤15 min) | roteiro no outro plano |
| 3.9 | **PDF** com links e confirmação do `soat-architecture` | — |

**Aproveitem o que já existe:** os READMEs dos quatro repositórios e os
comentários do Terraform já explicam a maior parte das decisões, com o
motivo. ADR é quase recorte e colagem. Não reescrevam do zero.

**Grave o vídeo até quinta (30/10).** Sobra margem para regravar, e o cluster
não precisa ficar de pé o fim de semana inteiro (~US$ 160/mês ligado).

---

## Divisão entre as pessoas

As semanas 1 e 2 são quase independentes — dá para rodar em paralelo a partir
do momento em que o cluster estiver de pé.

| Pessoa | Semana 1 | Semana 2 | Semana 3 |
|---|---|---|---|
| **A** | T1: gateway, VPC Link, authorizer | apoia 2.1 | RFC do gateway e da auth |
| **B** | sobe as stacks (1.1–1.3) | T2: agent, OTLP, logs | dashboards no vídeo |
| **C** | contrato do JWT (1.8) | SLI/SLO e alertas | diagramas e ER |
| **D** | estuda as 12 aulas de monitoramento | dashboards | ADRs, PDF, edição |

**Caminho crítico:** stacks de pé → gateway → observabilidade → vídeo. Tudo
depende do passo 1.1, e o 1.1 depende dos três bloqueadores manuais do outro
plano. É literalmente o primeiro trabalho da segunda-feira.

---

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Lambda authorizer consumir a semana 1 inteira | **Alta** | Decidir no dia 1; se travar até quarta, expor `/auth` pelo gateway e proteger as demais rotas validando o JWT no próprio Nest (o middleware já existe) e documentar como limitação |
| Custo do cluster ligado 3 semanas | Alta | Subir só para testar e gravar; derrubar na ordem `infra-db` → `infra-k8s` |
| Dividir esforço entre Datadog e New Relic | Média | Escolher um na segunda-feira da semana 2 |
| Documentação espremida no último dia | Média | 3.7 pode começar já: o conteúdo está nos READMEs |
| Vídeo estourar 15 min | Média | Roteiro escrito e ensaiado; é corte, não regravação |

---

## Calendário

```
Semana 1  13/10 ─ 19/10   API Gateway + auth ponta a ponta
  seg 13  bloqueadores manuais + decisão do authorizer + sobe base/cluster
  ter 14  infra-db e lambda-auth aplicados
  qua 15  NLB interno + VPC Link
  qui 16  rota /auth + Lambda authorizer
  sex 17  rotas protegidas ponta a ponta
  fds     folga ou contingência

Semana 2  20/10 ─ 26/10   Observabilidade
  seg 20  escolher a ferramenta + Agent no cluster
  ter 21  OTLP ligado, tracing aparecendo
  qua 22  logs JSON correlacionados (API + Lambda)
  qui 23  SLI/SLO e alertas em Terraform
  sex 24  os três dashboards
  fds     contingência

Semana 3  27/10 ─ 02/11   Documentação e entrega
  seg 27  diagramas (componentes e sequência)
  ter 28  RFCs
  qua 29  ADRs + ER + justificativa do banco
  qui 30  GRAVAR O VÍDEO
  sex 31  editar, montar o PDF, revisar links
  01-02   margem
```
