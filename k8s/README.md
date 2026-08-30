# Manifestos Kubernetes — Tech Challenge (Fase 2)

Manifestos declarativos para rodar a API NestJS + Prisma em Kubernetes — no **EKS** (alvo da fase, provisionado por `infra/terraform/`) e localmente em **kind/minikube**. Escopo: rodar a app "no jeito K8s" — probes de liveness/readiness, graceful shutdown, HPA por CPU e migrations aplicadas por um Job separado antes das réplicas subirem.

> Depende dos endpoints `/health/liveness` e `/health/readiness` e do `enableShutdownHooks()` adicionados em [PR #41](https://github.com/pedruvaz/tech-challenge-fiap/pull/41).

## Layout

O diretório é dividido pelo que o CI aplica: `k8s/*.yaml` é o estado que o workflow de deploy aplica em todo release (`kubectl apply -f k8s/`, que **não é recursivo**); `jobs/` e `local/` ficam fora do apply em lote de propósito.

| Arquivo | O que faz |
|---|---|
| `00-namespace.yaml` | Namespace `tech-challenge` (isola tudo). |
| `05-rbac.yaml` | ServiceAccount `api` + Role/RoleBinding para o initContainer `wait-migrate` chamar `kubectl wait job/migrate`. |
| `10-configmap.yaml` | Envs não sensíveis (`NODE_ENV`, `PORT`, expirations do JWT). |
| `40-api-deployment.yaml` | Deployment da API com 2 réplicas, probes, preStop, securityContext não-root e initContainer que espera o Job. |
| `41-api-service.yaml` | Service `LoadBalancer` — NLB internet-facing no EKS Auto Mode; em kind fica `Pending` (inofensivo), acesso via port-forward. |
| `50-hpa.yaml` | HPA por CPU (min=2, max=6, target 70%). |
| `jobs/30-migrate-job.yaml` | Job que roda `prisma migrate deploy` uma vez por release — o deploy do CI o recria com a imagem da release; localmente, aplicar à mão. |
| `local/11-secret.example.yaml` | Template do Secret para dev local. **No EKS o Secret vem do Secrets Manager**, materializado pelo workflow de deploy. |
| `local/20-postgres.yaml` | StatefulSet do Postgres 16 + PVC — só dev local; no EKS o banco é RDS. |

## Como subir localmente (kind)

```bash
# 1. Cria o cluster
kind create cluster --name tech-challenge

# 2. Builda e carrega a imagem no kind (imagePullPolicy: IfNotPresent nos manifestos)
docker build -t tech-challenge-fiap:latest .
kind load docker-image tech-challenge-fiap:latest --name tech-challenge

# 3. Aplica namespace + RBAC + config
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/05-rbac.yaml
kubectl apply -f k8s/10-configmap.yaml

# 4. Cria o Secret real (NÃO usar o .example em prod)
cp k8s/local/11-secret.example.yaml k8s/local/11-secret.yaml
# edite k8s/local/11-secret.yaml e troque os JWT_*_SECRET
kubectl apply -f k8s/local/11-secret.yaml

# 5. Sobe o Postgres e espera ficar Ready
kubectl apply -f k8s/local/20-postgres.yaml
kubectl -n tech-challenge rollout status statefulset/postgres

# 6. Roda o Job de migrations
kubectl apply -f k8s/jobs/30-migrate-job.yaml
kubectl -n tech-challenge wait --for=condition=complete --timeout=300s job/migrate

# 7. Sobe a API + Service + HPA
kubectl apply -f k8s/40-api-deployment.yaml
kubectl apply -f k8s/41-api-service.yaml
kubectl apply -f k8s/50-hpa.yaml
kubectl -n tech-challenge rollout status deployment/api

# 8. Popula o banco — sem isso não existe usuário para logar (ver "Popular o banco")
kubectl -n tech-challenge exec deploy/api -- node dist/prisma/seed.js

# 9. Acessa via port-forward
kubectl -n tech-challenge port-forward svc/api 3000:3000
# API: http://localhost:3000/docs
# Health: http://localhost:3000/health/liveness | /health/readiness
```

Alternativa em uma linha (sem editar Secret — bom pra demo):

```bash
kubectl apply -f k8s/00-namespace.yaml -f k8s/05-rbac.yaml -f k8s/10-configmap.yaml \
              -f k8s/local/11-secret.example.yaml -f k8s/local/20-postgres.yaml -f k8s/jobs/30-migrate-job.yaml \
              -f k8s/40-api-deployment.yaml -f k8s/41-api-service.yaml -f k8s/50-hpa.yaml
```

## Reaplicar migrations (novo release)

Um `Job` do K8s é imutável depois de criado — pra rodar `migrate deploy` de novo, delete e reaplique:

```bash
kubectl -n tech-challenge delete job migrate --ignore-not-found
kubectl apply -f k8s/jobs/30-migrate-job.yaml
kubectl -n tech-challenge rollout restart deployment/api
```

## Popular o banco (seed)

O deploy roda migrations, **não roda o seed** — sem ele não existe usuário
para login. O container de produção não tem `ts-node` (devDependency, sai no
`npm prune`), então `npx prisma db seed` falha lá dentro; o Dockerfile compila
o seed junto do build justamente para isso:

```bash
kubectl -n tech-challenge exec deploy/api -- node dist/prisma/seed.js
```

Idempotente na prática: o seed usa upsert/critérios fixos, então rodar de novo
não duplica dados. Após o seed, `admin@oficina.com` / `senha123` loga no
Swagger.

## Verificar

```bash
kubectl -n tech-challenge get pods,svc,statefulset,deployment,hpa
kubectl -n tech-challenge logs deployment/api
kubectl -n tech-challenge describe hpa api
```

## No EKS (produção da fase)

- **Infra**: `infra/terraform/` — a stack `base/` cria ECR e a role OIDC do CI; a `cluster/` cria VPC, EKS Auto Mode, RDS e o segredo `tech-challenge-fiap/api` no Secrets Manager.
- **Deploy**: `.github/workflows/deploy.yml` — materializa o Secret `api-secrets` a partir do Secrets Manager, aplica `k8s/`, recria o Job de migration com a imagem da release (tag = SHA do commit) e faz `set image` + `rollout status`.
- **Imagem**: os manifestos declaram `tech-challenge-fiap:latest` como estado inicial (funciona no kind via `kind load docker-image`); no EKS a imagem real vem do ECR e é definida pelo deploy — `:latest` estático nunca é usado como mecanismo de rollout.
- **Exposição**: o Service provisiona um NLB internet-facing via EKS Auto Mode (sem Ingress por enquanto).
- **HPA**: depende do metrics-server — instalado pela stack `cluster/` (`addons.tf`).
