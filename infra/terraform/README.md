# Infraestrutura — Terraform

Infra da Fase 2 na AWS: EKS para rodar a API, RDS como banco e ECR como registry das imagens.

Dividida em **duas stacks com ciclos de vida diferentes**:

| Stack | O que tem | Custo | Ciclo de vida |
| --- | --- | --- | --- |
| [`base/`](./base/README.md) | ECR, provider OIDC do GitHub, role de CI | ~US$ 0/mês | sobe uma vez e **fica** |
| [`cluster/`](./cluster/README.md) | VPC, EKS Auto Mode, RDS, Secrets Manager | ~US$ 160/mês ligado | **sobe e desce** |

A separação existe por causa do custo. A `cluster/` precisa ser destruída ao fim de cada sessão de trabalho, e num `apply` único isso apagaria junto o ECR — perdendo as imagens publicadas — e o provider OIDC, quebrando o CI. Separando, o CI continua publicando imagem mesmo sem cluster no ar.

A `cluster/` lê os outputs da `base/` via `terraform_remote_state`, então a ordem é sempre `base` primeiro.

## Ordem de execução

```bash
cd base && terraform init && terraform apply
```

```bash
cd cluster && terraform init && terraform apply
```

O bootstrap do bucket de state está no [README da `base`](./base/README.md) — precisa ser feito à mão antes do primeiro `init`, e é onde também está o comando do alerta de custo.

## Estado atual

Nenhuma das duas stacks foi aplicada ainda. O código não passou por `terraform validate` — não havia Terraform instalado na máquina onde foi escrito. Validar antes do primeiro `plan`.
