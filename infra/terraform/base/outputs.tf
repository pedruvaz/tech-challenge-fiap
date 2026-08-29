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

output "frontend_bucket_name" {
  description = "Bucket do site estático. Vai na var `S3_BUCKET_NAME` do repositório do frontend."
  value       = aws_s3_bucket.frontend.id
}

output "frontend_website_endpoint" {
  description = "URL pública do site do frontend (HTTP — endpoint de website do S3 não tem TLS)."
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "oidc_provider_arn" {
  description = "ARN do provider OIDC do GitHub nesta conta."
  value       = aws_iam_openid_connect_provider.github.arn
}

output "aws_account_id" {
  description = "Conta AWS onde a stack foi aplicada."
  value       = data.aws_caller_identity.current.account_id
}
