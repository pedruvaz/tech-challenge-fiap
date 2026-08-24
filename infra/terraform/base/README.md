# Terraform — stack `base`

Recursos permanentes e de custo praticamente zero: o repositório **ECR** e a confiança **OIDC** entre o GitHub Actions e a AWS.

Fica separada da stack `cluster/` (VPC, EKS, RDS) de propósito. Aquela é a cara — sobe para trabalhar e para gravar o vídeo, e é destruída depois. Se tudo estivesse num `apply` só, destruir para economizar apagaria o ECR (perdendo as imagens) e o provider OIDC (quebrando o CI). Esta stack sobe uma vez e fica.

**Custo:** ECR cobra ~US$ 0,10/GB-mês de armazenamento; com a lifecycle policy de 10 imagens isso fica em centavos. Provider OIDC, role e policy são gratuitos.

## Pré-requisitos

- Terraform >= 1.10 (usa lock nativo do S3, sem tabela DynamoDB)
- AWS CLI autenticada numa **conta própria** — `aws sts get-caller-identity` precisa responder
- Permissão para criar IAM role e OIDC provider

## Bootstrap (uma vez só)

O bucket de state precisa existir antes do primeiro `init` — é o ovo-e-galinha clássico do backend S3. Resolve-se à mão:

```bash
aws s3 mb s3://tf-state-tech-challenge-fiap --region us-east-1
```

```bash
aws s3api put-bucket-versioning --bucket tf-state-tech-challenge-fiap --versioning-configuration Status=Enabled
```

Nome de bucket S3 é único no mundo inteiro. Se `tf-state-tech-challenge-fiap` já existir, escolha outro e **troque também em `versions.tf`** — blocos de backend não aceitam variáveis.

Antes de qualquer `apply`, crie o alerta de custo. Cinco minutos que evitam queimar o crédito com um cluster esquecido ligado:

```bash
aws budgets create-budget --account-id $(aws sts get-caller-identity --query Account --output text) --budget '{"BudgetName":"tech-challenge","BudgetLimit":{"Amount":"25","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}'
```

## Aplicar

```bash
terraform init
```

```bash
terraform plan
```

```bash
terraform apply
```

Deve criar 6 recursos: repositório ECR, lifecycle policy, provider OIDC, role, policy e o attachment.

## Outputs e para onde eles vão

```bash
terraform output
```

| Output | Quem consome |
| --- | --- |
| `ecr_repository_url` | `image:` no `40-api-deployment.yaml` e no `30-migrate-job.yaml`; destino do push no CI |
| `github_actions_role_arn` | `role-to-assume` no workflow |
| `github_actions_role_name` | stack `cluster/`, para criar o EKS access entry de deploy |

## Ligando o CI (etapa seguinte)

Hoje o `.github/workflows/docker.yml` builda a imagem com `push: false` — valida o Dockerfile e descarta o resultado. Com esta stack no ar, ele passa a poder publicar:

```yaml
permissions:
  id-token: write   # obrigatório para o OIDC funcionar
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: <github_actions_role_arn>
      aws-region: us-east-1

  - uses: aws-actions/amazon-ecr-login@v2
    id: ecr

  - uses: docker/build-push-action@v6
    with:
      context: .
      push: true
      tags: <ecr_repository_url>:${{ github.sha }}
```

O `permissions: id-token: write` é o detalhe que costuma faltar — sem ele o GitHub não emite o token OIDC e o `configure-aws-credentials` falha com erro de credencial, que não sugere a causa.

> **Não editar o `docker.yml` agora.** Ele é tocado pela stack de PRs #33–#43 (commit `358713e`), e mexer nele na `main` cria conflito. Fazer depois do merge, ou combinar com o pedruvaz.

## Apertar a permissão depois da entrega

Enquanto o trabalho corre, `github_allowed_subjects = ["*"]` aceita qualquer branch e PR — que é o necessário para o CI rodar nos PRs. Depois de entregue:

```hcl
github_allowed_subjects = ["ref:refs/heads/main"]
```

## O que ainda falta para o deploy funcionar

Publicar imagem já funciona com esta stack. Fazer deploy no cluster precisa de mais duas coisas, ambas na stack `cluster/`:

1. O cluster EKS existir com o nome de `eks_cluster_name`.
2. Um **EKS access entry** mapeando `github_actions_role_arn` para um grupo com permissão de aplicar manifestos. Ter `eks:DescribeCluster` no IAM só permite montar o kubeconfig — quem autoriza o `kubectl` de fato é o controle de acesso do próprio cluster. É o segundo tropeço clássico dessa configuração.
