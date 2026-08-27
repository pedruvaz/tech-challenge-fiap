# CI/CD e Kubernetes — Documentação das Alterações

## Visão Geral

O pipeline foi reorganizado de **4 workflows independentes** (build, lint, test, docker) para **2 workflows integrados** com gate de qualidade e deploy automatizado no cluster EKS.

```
Antes                          Depois
──────────────────────         ──────────────────────────────────────
build.yml  (só build)          ci.yml  → build + lint + test + docker
lint.yml   (só lint)                     + quality gate
test.yml   (só testes)
docker.yml (build sem push)    cd.yml  → ci + push imagem + deploy k8s
```

---

## 1. Workflow de CI (`ci.yml`)

### O que faz

Dispara em todo **push** e **pull request** para `main` e `dev`. Roda 4 jobs em paralelo e um gate final que só passa se todos os 4 tiverem sucesso.

```
push / PR
    │
    ├─── build        → npm ci + prisma generate + nest build
    ├─── lint         → eslint com --fix
    ├─── test         → migrations + seed + testes unitários (70% cobertura) + e2e
    └─── docker       → valida docker-compose config + build da imagem (sem push)
              │
              └─── quality-gate  → falha explicitamente se qualquer job falhou
```

### Alterações em relação aos 4 workflows antigos

| Ponto | Antes | Depois |
|---|---|---|
| Organização | 4 arquivos separados, sem dependência entre si | 1 arquivo com jobs paralelos + gate |
| Quality Gate | Não existia | Job `quality-gate` com `if: always()` — falha explicitamente em vez de ser ignorado |
| Reutilização | Cada workflow rodava isolado | `ci.yml` expõe `workflow_call` para ser chamado pelo `cd.yml` |
| Concorrência | Sem controle | `concurrency` cancela runs anteriores na mesma branch (economiza minutos de Actions) |
| Cache | Ausente no lint/build | `npm` cache via `actions/setup-node` em todos os jobs |

### Por que o Quality Gate com `if: always()` é importante

Sem `if: always()`, se um job falha, o `quality-gate` é **pulado** (status: skipped) — o que aparece como verde no GitHub. Isso engana a proteção de branch. Com a correção, o gate **falha explicitamente**, bloqueando o merge do PR.

```yaml
# Comportamento anterior (errado)
quality-gate:
  needs: [build, lint, test, docker]
  # se "build" falhar → quality-gate é pulado → PR pode ser mergeado ❌

# Comportamento corrigido
quality-gate:
  needs: [build, lint, test, docker]
  if: always()               # roda mesmo que os needs falhem
  steps:
    - run: |
        if [[ needs.build.result != success ... ]]; then exit 1; fi
```

---

## 2. Workflow de CD (`cd.yml`)

### O que faz

Dispara **apenas em push para `main`** (pós-merge). Roda 3 jobs em sequência:

```
push → main
    │
    ├─── 1. ci           → chama ci.yml completo como gate de entrada
    │
    ├─── 2. push-image   → login GHCR + build + push de duas tags
    │         └── ghcr.io/<repo>:<sha>     (imutável, rastreável)
    │         └── ghcr.io/<repo>:latest    (conveniente para pull manual)
    │
    └─── 3. deploy       → kubectl aplica os manifestos no EKS
```

### Alterações em relação ao `docker.yml` antigo

| Ponto | Antes (`docker.yml`) | Depois (`cd.yml`) |
|---|---|---|
| Push da imagem | Não fazia push | Faz push para GHCR com tag `:<sha>` e `:latest` |
| Registry | — | GHCR (`ghcr.io`) usando `GITHUB_TOKEN` |
| Deploy | Não existia | Aplica todos os manifestos `k8s/` no cluster EKS |
| Secrets | Não tinha | Injeta 7 GitHub Secrets no cluster como K8s Secret |
| Gate de entrada | Sem gate | Roda o CI completo antes de qualquer deploy |
| `DATABASE_URL` | Hardcoded `@postgres:5432` | Usa `${{ secrets.DB_HOST }}` (endpoint do RDS) |

### Sequência do step de deploy

```
1. Configura kubectl  → decodifica KUBE_CONFIG (base64) para ~/.kube/config
2. Verifica cluster   → kubectl cluster-info
3. Cria namespace     → k8s/00-namespace.yaml
4. Injeta secrets     → kubectl create secret generic api-secrets (--dry-run | apply)
5. Remove exemplo     → rm k8s/11-secret.example.yaml (evita sobrescrever o secret real)
6. Patch da imagem    → sed substitui "tech-challenge-fiap:latest" pela tag :<sha> real
7. Limpa job antigo   → kubectl delete job migrate (para poder recriar)
8. Apply completo     → kubectl apply -f k8s/
9. Aguarda rollout    → kubectl rollout status deployment/api --timeout=300s
10. Smoke test        → kubectl get pods/services
```

### GitHub Secrets necessários

| Secret | Uso no CD |
|---|---|
| `KUBE_CONFIG` | Acesso ao cluster EKS (kubeconfig em base64) |
| `JWT_ACCESS_SECRET` | Injetado no K8s Secret `api-secrets` |
| `JWT_REFRESH_SECRET` | Injetado no K8s Secret `api-secrets` |
| `DB_HOST` | Compõe a `DATABASE_URL` com o endpoint do RDS |
| `DB_USERNAME` | Compõe a `DATABASE_URL` e o K8s Secret |
| `DB_PASSWORD` | Compõe a `DATABASE_URL` e o K8s Secret |
| `DB_DATABASE` | Compõe a `DATABASE_URL` e o K8s Secret |

---

## 3. Manifestos Kubernetes (`k8s/`)

O diretório `k8s/` estava vazio. Todos os arquivos abaixo foram criados.

### Ordem de aplicação

O CD aplica `kubectl apply -f k8s/` — o kubectl processa os arquivos em ordem alfabética, que coincide com a ordem numérica dos nomes:

```
00-namespace.yaml      → cria o namespace
11-secret.example.yaml → removido antes do apply (só documenta)
30-migrate-job.yaml    → roda as migrations antes da API subir
40-api-deployment.yaml → sobe a API (Deployment + Service)
50-hpa.yaml            → configura o autoscaling
```

### `00-namespace.yaml` — Isolamento

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: tech-challenge
```

**Por quê:** isola todos os recursos do projeto em um namespace próprio dentro do cluster EKS. Sem isso, os recursos ficam no namespace `default`, compartilhado com outros projetos.

---

### `11-secret.example.yaml` — Documentação de Secrets

Arquivo de exemplo que documenta quais secrets são necessários e como obtê-los. **Removido automaticamente pelo CD** antes do `kubectl apply` para não sobrescrever o K8s Secret real (que é criado com os valores do GitHub Secrets).

---

### `30-migrate-job.yaml` — Migrations do Banco

```
Prisma migrate deploy → roda uma vez → termina
```

**Por quê um Job separado e não um init container:**
- O Job roda **antes** do Deployment, garantindo que o banco está atualizado
- Se a migration falhar, o deploy para — a API não sobe com schema desatualizado
- O CD deleta o Job antigo antes de criar um novo (`kubectl delete job migrate --ignore-not-found`)
- O Job é removido automaticamente após 300s (`ttlSecondsAfterFinished: 300`)

```yaml
command: ["npx", "prisma", "migrate", "deploy"]
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: api-secrets
        key: DATABASE_URL
```

---

### `40-api-deployment.yaml` — API em Alta Disponibilidade

#### Deployment

| Configuração | Valor | Motivo |
|---|---|---|
| `replicas: 2` | 2 pods | Se um cair, o outro mantém a API no ar |
| `image` | `tech-challenge-fiap:latest` | Substituído pelo CD com a tag `:<sha>` exata |
| `containerPort` | 3000 | Porta que o NestJS escuta |
| CPU request/limit | 100m / 500m | Reserva mínima, limita consumo excessivo |
| Memory request/limit | 256Mi / 512Mi | NestJS + Prisma precisam de ~200MB em idle |

#### Rolling Update (zero downtime)

O Kubernetes, por padrão, faz rolling update: sobe pods novos antes de derrubar os antigos. Com 2 réplicas, durante o deploy sempre há pelo menos 1 pod atendendo requisições.

#### Probes (TCP)

```yaml
livenessProbe:   tcpSocket port 3000   # reinicia o pod se parar de responder
readinessProbe:  tcpSocket port 3000   # só envia tráfego quando o pod estiver pronto
```

> **Nota:** probes TCP são conservadoras — só verificam se a porta está aberta, não se a API está saudável. Para probes HTTP precisas, instale `@nestjs/terminus` e exponha `GET /health`.

#### Service (ClusterIP)

```yaml
type: ClusterIP
port: 80 → targetPort: 3000
```

Balanceia o tráfego entre as 2 réplicas dentro do cluster. Para expor externamente, altere para `type: LoadBalancer` ou adicione um Ingress.

---

### `50-hpa.yaml` — Autoscaling Horizontal

```
2 pods (mínimo)  ──── CPU > 70% ────→  até 10 pods
10 pods (máximo) ──── CPU < 70% ────→  reduz gradualmente
```

| Configuração | Valor |
|---|---|
| `minReplicas` | 2 (sempre alta disponibilidade) |
| `maxReplicas` | 10 (limite de custo) |
| CPU target | 70% |
| Memory target | 80% |

**Requisito:** `metrics-server` instalado no cluster. O Terraform já instala via Helm (`infra/terraform/cluster/addons.tf`) quando `install_metrics_server = true` (padrão).

---

## 4. Correção de código — `src/domains/ordem-servico/`

Durante os testes locais com `act`, o build e o lint falharam porque o refactor de Clean Architecture deixou dois arquivos referenciados mas nunca criados:

| Arquivo ausente | Criado em |
|---|---|
| `./dto/ordem-servico-response.dto` | `src/domains/ordem-servico/dto/ordem-servico-response.dto.ts` |
| `./ordem-servico.service` | `src/domains/ordem-servico/ordem-servico.service.ts` |

O `OrdemServicoResponseDto` recebe os dados brutos do Prisma e converte `Prisma.Decimal` para `number`, além de achatar as relações aninhadas (`servico.descricao`, `peca.nome`, `insumo.nome`).

O `OrdemServicoService` é uma **classe abstrata** (não interface) porque NestJS usa classes como tokens de injeção de dependência — o controller depende dela, os testes a mockam, e a implementação real é provida pelo módulo `src/modules/ordem-servico/`.

---

## 5. Fluxo completo após as alterações

```
Developer                GitHub                      AWS
──────────               ──────                      ───
git push feat/  ──────→  CI roda (build/lint/        
                          test/docker + gate)         
                          ✅ passa                    
                                                      
PR → main       ──────→  CI roda novamente           
merge           ──────→  CD inicia                   
                          │                           
                          ├─ CI (gate)               
                          ├─ push imagem → GHCR      
                          └─ deploy                  
                              ├─ namespace            
                              ├─ secrets (RDS + JWT)  
                              ├─ migrate job ─────→  RDS PostgreSQL
                              ├─ deployment ──────→  EKS (2 pods)
                              └─ HPA ─────────────→  EKS (2-10 pods)
```

---

## Referências

- CI: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- CD: [`.github/workflows/cd.yml`](../.github/workflows/cd.yml)
- Manifestos: [`k8s/`](../k8s/)
- Guia de deploy local: [`docs/05-infra-deploy.md`](./05-infra-deploy.md)
