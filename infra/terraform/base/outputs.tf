output "ecr_repository_url" {
  description = "URL do repositório ECR. Vira o `image:` dos manifestos e o destino do push no CI."
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_repository_arn" {
  description = "ARN do repositório ECR."
  value       = aws_ecr_repository.api.arn
}

output "github_actions_role_arn" {
  description = "Role assumida pelo GitHub Actions. Vai em `role-to-assume` no workflow."
  value       = aws_iam_role.github_actions.arn
}

output "github_actions_role_name" {
  description = "Nome da role — usado na stack `cluster/` para criar o EKS access entry de deploy."
  value       = aws_iam_role.github_actions.name
}

output "oidc_provider_arn" {
  description = "ARN do provider OIDC do GitHub nesta conta."
  value       = aws_iam_openid_connect_provider.github.arn
}

output "aws_account_id" {
  description = "Conta AWS onde a stack foi aplicada."
  value       = data.aws_caller_identity.current.account_id
}
