# Manifestos Kubernetes — Tech Challenge (Fase 2)

Manifestos declarativos para rodar a API NestJS + Prisma + Postgres em um cluster Kubernetes local (kind ou minikube). Escopo: rodar a app "no jeito K8s" — probes de liveness/readiness, graceful shutdown, HPA por CPU e migrations aplicadas por um Job separado antes das réplicas subirem.

> Depende dos endpoints `/health/liveness` e `/health/readiness` e do `enableShutdownHooks()` adicionados em [PR #41](https://github.com/pedruvaz/tech-challenge-fiap/pull/41).

## Arquivos

| Arquivo | O que faz |
|---|---|
| `00-namespace.yaml` | Namespace `tech-challenge` (isola tudo). |
| `05-rbac.yaml` | ServiceAccount `api` + Role/RoleBinding para o initContainer `wait-migrate` chamar `kubectl wait job/migrate`. |
| `10-configmap.yaml` | Envs não sensíveis (`NODE_ENV`, `PORT`, expirations do JWT). |
| `11-secret.example.yaml` | Template do Secret (`JWT_*`, credenciais do Postgres, `DATABASE_URL`). **Não usar em prod.** |
| `20-postgres.yaml` | StatefulSet do Postgres 16 + Service headless + PVC de 2Gi. |
| `30-migrate-job.yaml` | Job que roda `prisma migrate deploy` uma vez por release. |
| `40-api-deployment.yaml` | Deployment da API com 2 réplicas, probes, initContainer que espera o Job. |
| `41-api-service.yaml` | Service ClusterIP `api:3000`. |
| `50-hpa.yaml` | HPA por CPU (min=2, max=6, target 70%). |

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
cp k8s/11-secret.example.yaml k8s/11-secret.yaml
# edite k8s/11-secret.yaml e troque os JWT_*_SECRET
kubectl apply -f k8s/11-secret.yaml

# 5. Sobe o Postgres e espera ficar Ready
kubectl apply -f k8s/20-postgres.yaml
kubectl -n tech-challenge rollout status statefulset/postgres

# 6. Roda o Job de migrations
kubectl apply -f k8s/30-migrate-job.yaml
kubectl -n tech-challenge wait --for=condition=complete --timeout=300s job/migrate

# 7. Sobe a API + Service + HPA
kubectl apply -f k8s/40-api-deployment.yaml
kubectl apply -f k8s/41-api-service.yaml
kubectl apply -f k8s/50-hpa.yaml
kubectl -n tech-challenge rollout status deployment/api

# 8. Acessa via port-forward
kubectl -n tech-challenge port-forward svc/api 3000:3000
# API: http://localhost:3000/docs
# Health: http://localhost:3000/health/liveness | /health/readiness
```

Alternativa em uma linha (sem editar Secret — bom pra demo):

```bash
kubectl apply -f k8s/00-namespace.yaml -f k8s/05-rbac.yaml -f k8s/10-configmap.yaml \
              -f k8s/11-secret.example.yaml -f k8s/20-postgres.yaml -f k8s/30-migrate-job.yaml \
              -f k8s/40-api-deployment.yaml -f k8s/41-api-service.yaml -f k8s/50-hpa.yaml
```

## Reaplicar migrations (novo release)

Um `Job` do K8s é imutável depois de criado — pra rodar `migrate deploy` de novo, delete e reaplique:

```bash
kubectl -n tech-challenge delete job migrate --ignore-not-found
kubectl apply -f k8s/30-migrate-job.yaml
kubectl -n tech-challenge rollout restart deployment/api
```

## Verificar

```bash
kubectl -n tech-challenge get pods,svc,statefulset,deployment,hpa
kubectl -n tech-challenge logs deployment/api
kubectl -n tech-challenge describe hpa api
```

## Fora de escopo

- **Ingress** — usar `port-forward` no Service ClusterIP.
- **Terraform / IaC** — outro integrante do grupo.
- **CI/CD (publicar imagem em registry)** — outro integrante do grupo. Os manifestos assumem `tech-challenge-fiap:latest` presente no nó (via `kind load docker-image`).
