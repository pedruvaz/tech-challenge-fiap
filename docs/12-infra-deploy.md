# Guia de Deploy — Infraestrutura e CI/CD

Passo a passo completo para provisionar a infraestrutura na AWS e configurar o pipeline de deploy.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Como instalar |
|---|---|---|
| AWS CLI | v2 | `winget install Amazon.AWSCLI` |
| Terraform | >= 1.10 | `winget install Hashicorp.Terraform` |
| kubectl | qualquer | `winget install Kubernetes.kubectl` |
| Git | qualquer | já instalado |

---

## 1. Configurar AWS CLI

```powershell
aws configure
```

Preencha:
```
AWS Access Key ID:     <sua access key>
AWS Secret Access Key: <sua secret key>
Default region name:   us-east-1
Default output format: json
```

Confirme que está autenticado:

```powershell
aws sts get-caller-identity
```

---

## 2. Criar bucket S3 para estado do Terraform

Executar uma única vez. O bucket guarda o estado das duas stacks.

```powershell
aws s3api create-bucket --bucket tf-state-tech-challenge-fiap --region us-east-1
```

```powershell
aws s3api put-bucket-versioning --bucket tf-state-tech-challenge-fiap --versioning-configuration Status=Enabled
```

---

## 3. Stack `base/` — ECR + IAM OIDC

Cria o repositório de imagens Docker (ECR) e a role IAM usada pelo GitHub Actions via OIDC.
Deve ser aplicada **antes** da stack `cluster/`.

```powershell
cd infra/terraform/base
```

```powershell
terraform init
```

```powershell
terraform plan
```

```powershell
terraform apply
```

Digite `yes` quando solicitado.

Ver os outputs gerados:

```powershell
terraform output
```

Outputs relevantes:
- `ecr_repository_url` — URL do repositório ECR (usado como `image:` nos manifestos)
- `github_actions_role_arn` — ARN da role assumida pelo GitHub Actions

---

## 4. Stack `cluster/` — VPC + EKS + RDS + Secrets Manager

Cria toda a infraestrutura de runtime. **Leva entre 15 e 20 minutos.**

```powershell
cd ../cluster
```

```powershell
terraform init
```

```powershell
terraform plan
```

```powershell
terraform apply
```

Digite `yes` quando solicitado.

---

## 5. Coletar valores para os GitHub Secrets

Após o apply da stack `cluster/` terminar, execute os comandos abaixo para obter os valores.

**Endpoint do RDS (`DB_HOST`)** — copie apenas a parte antes de `:5432`:

```powershell
terraform output -raw db_endpoint
```

**Senha do banco e chaves JWT** — retorna JSON com `DATABASE_URL`, `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET`:

```powershell
aws secretsmanager get-secret-value --secret-id tech-challenge-fiap/api --region us-east-1 --query SecretString --output text
```

**Kubeconfig (`KUBE_CONFIG`)** — configura o kubectl e gera o base64:

```powershell
aws eks update-kubeconfig --name tech-challenge --region us-east-1
```

```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("$env:USERPROFILE\.kube\config"))
```

---

## 6. Configurar GitHub Secrets

Acesse: repositório → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Como obter |
|---|---|
| `DB_HOST` | `terraform output -raw db_endpoint` (sem `:5432`) |
| `DB_USERNAME` | `oficina_admin` (fixo — definido em `variables.tf`) |
| `DB_PASSWORD` | campo `DATABASE_URL` do Secrets Manager (entre `:` e `@`) |
| `DB_DATABASE` | `oficina` (fixo — definido em `variables.tf`) |
| `JWT_ACCESS_SECRET` | campo `JWT_ACCESS_SECRET` do Secrets Manager |
| `JWT_REFRESH_SECRET` | campo `JWT_REFRESH_SECRET` do Secrets Manager |
| `KUBE_CONFIG` | string base64 gerada pelo comando acima |

---

## 7. Publicar o código e disparar o pipeline

```powershell
cd "C:\Users\Usuario\Desktop\Software Architecture\tech-challenge-fiap"
```

```powershell
git add .github/workflows/ci.yml .github/workflows/cd.yml k8s/ infra/terraform/cluster/addons.tf
```

```powershell
git commit -m "feat(cicd): adiciona CI/CD unificado e manifestos Kubernetes"
```

```powershell
git push origin feature/melhorias-pipeline-cicd
```

Abra um Pull Request para `main` — o workflow **CI** dispara automaticamente.
Após merge, o workflow **CD** faz push da imagem para o GHCR e aplica os manifestos no EKS.

---

## 8. Verificar o deploy

Após o CD concluir, confirme que tudo está rodando:

```powershell
aws eks update-kubeconfig --name tech-challenge --region us-east-1
```

```powershell
kubectl get pods -n tech-challenge
```

```powershell
kubectl get services -n tech-challenge
```

```powershell
kubectl get hpa -n tech-challenge
```

---

## 9. Destruir a infraestrutura (após apresentação)

**Atenção: destrói todos os recursos e para o custo AWS.**

Destruir na ordem inversa — `cluster/` primeiro, depois `base/`:

```powershell
cd infra/terraform/cluster
```

```powershell
terraform destroy
```

```powershell
cd ../base
```

```powershell
terraform destroy
```

Digite `yes` em cada um quando solicitado.

---

## Referências

- Stack `base/`: [`infra/terraform/base/`](../infra/terraform/base/)
- Stack `cluster/`: [`infra/terraform/cluster/`](../infra/terraform/cluster/)
- Manifestos Kubernetes: [`k8s/`](../k8s/)
- Workflow CI: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- Workflow CD: [`.github/workflows/cd.yml`](../.github/workflows/cd.yml)
