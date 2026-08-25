# Terraform — stack `cluster`

VPC, EKS em Auto Mode, RDS Postgres e os segredos da API. É a metade cara da infra: **sobe para trabalhar ou gravar o vídeo, e desce depois.**

Depende da stack [`base`](../base/README.md) já aplicada — lê os outputs dela via `terraform_remote_state` para descobrir o ECR e a role do GitHub Actions.

## Custo

Aproximado, us-east-1. **Confirmar na calculadora da AWS** — preços mudam.

| Recurso | ~US$/mês se ficar ligado |
| --- | --- |
| EKS control plane | 73 |
| NAT Gateway (1) | 33 + tráfego |
| Nós EC2 (Auto Mode) | ~30 + taxa de gerenciamento |
| RDS `db.t4g.micro` | ~12 (free tier cobre 750h/mês nos 12 primeiros meses) |
| Load Balancer, quando o Service subir | ~16 + LCU |

**~US$ 160/mês esquecido ligado. ~US$ 1 por sessão de 4 horas.**

Toda a stack foi escrita para que `terraform destroy` funcione de primeira: RDS sem deletion protection e sem snapshot final, segredo com janela de recuperação zerada. Sem esses ajustes o destroy falha no meio e sobra recurso rodando — que é exatamente o custo que se queria evitar.

## Aplicar

```bash
terraform init
```

```bash
terraform validate
```

```bash
terraform apply
```

Leva de 15 a 20 minutos: o control plane do EKS sozinho gasta ~10, e o RDS mais ~10 em paralelo.

Depois:

```bash
aws eks update-kubeconfig --region us-east-1 --name tech-challenge
```

## Verificar o que a doc não garante

```bash
kubectl top nodes
```

Se responder, o metrics-server está de pé e o HPA vai funcionar. Se der erro de API não encontrada, algo falhou no `helm_release` — o fallback está comentado em `addons.tf`.

Não achei confirmação de que o EKS Auto Mode já entrega o metrics-server, então esta stack instala por padrão. Se `kubectl top` já funcionar antes do chart, é só setar `install_metrics_server = false`.

## Destruir

```bash
terraform destroy
```

Se o Service `type: LoadBalancer` da API estiver no ar, **derrube antes**:

```bash
kubectl -n tech-challenge delete svc api
```

O load balancer é criado pelo controller dentro do cluster, não pelo Terraform — o state não sabe que ele existe. Deixá-lo de pé mantém ENIs presas nas subnets e o destroy da VPC trava com erro de dependência, que é confuso de diagnosticar.

## Ligação com os manifestos do PR #42

Os manifestos em `/k8s` foram escritos para `kind` e precisam de ajuste para rodar aqui:

| Manifesto | Hoje | Precisa |
| --- | --- | --- |
| `40-api-deployment.yaml`, `30-migrate-job.yaml` | `image: tech-challenge-fiap:latest` + `IfNotPresent` | URL do ECR (`terraform output ecr_repository_url`) |
| `41-api-service.yaml` | `type: ClusterIP` | `type: LoadBalancer` |
| `20-postgres.yaml` | StatefulSet de Postgres | não usar — o banco é o RDS |
| `30-migrate-job.yaml` | `pg_isready -h postgres` com host fixo | host do RDS, vindo do Secret |
| `11-secret.yaml` | segredos em YAML | `terraform output create_k8s_secret_command` |

O `create_k8s_secret_command` é uma muleta consciente: materializa o Secret a partir do Secrets Manager por linha de comando. A solução correta é o External Secrets Operator ou o Secrets Store CSI driver sincronizando automaticamente — fica como melhoria se sobrar tempo.

## Se o `terraform init` reclamar de variável desconhecida

O módulo `terraform-aws-modules/eks/aws` renomeou variáveis na v21 (`cluster_name` → `name`, `cluster_version` → `kubernetes_version`). Este código usa os nomes da v21 e pina `~> 21.0`. Se o init resolver para outra major, os nomes não batem — foi por isso que o `terraform validate` está listado como passo separado acima, antes do plan.
