variable "aws_region" {
  description = "Região da AWS onde os recursos serão criados."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefixo e tag aplicados aos recursos. Também é o nome do repositório ECR."
  type        = string
  default     = "tech-challenge-fiap"
}

variable "github_repository" {
  description = "Repositório autorizado a assumir a role, no formato OWNER/REPO."
  type        = string
  default     = "pedruvaz/tech-challenge-fiap"
}

variable "github_allowed_subjects" {
  description = <<-EOT
    Padrões de claim `sub` do token OIDC autorizados, relativos ao repositório
    definido em `github_repository`.

    O default (`*`) libera qualquer branch, tag e pull request — é o que faz
    sentido enquanto o trabalho está em andamento e o CI roda em PRs.

    Depois da entrega, dá para apertar para apenas a branch principal:
      github_allowed_subjects = ["ref:refs/heads/main"]
  EOT
  type        = list(string)
  default     = ["*"]
}

variable "eks_cluster_name" {
  description = <<-EOT
    Nome do cluster EKS que a stack `cluster/` vai criar.

    Usado aqui só para escopar a permissão `eks:DescribeCluster` da role de
    deploy. O cluster não precisa existir ainda — uma policy do IAM pode
    referenciar um ARN futuro sem erro.
  EOT
  type        = string
  default     = "tech-challenge"
}

variable "ecr_keep_last_images" {
  description = "Quantas imagens com tag manter no ECR antes de expirar as mais antigas."
  type        = number
  default     = 10
}
