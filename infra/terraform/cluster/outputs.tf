output "cluster_name" {
  description = "Nome do cluster EKS."
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint do control plane."
  value       = module.eks.cluster_endpoint
}

output "configure_kubectl" {
  description = "Comando para apontar o kubectl local para este cluster."
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "ecr_repository_url" {
  description = "Repetido da stack `base` para facilitar — é o valor do `image:` nos manifestos."
  value       = data.terraform_remote_state.base.outputs.ecr_repository_url
}

output "db_endpoint" {
  description = "Endpoint do RDS (host:porta)."
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "api_secret_name" {
  description = "Nome do segredo no Secrets Manager com DATABASE_URL e chaves JWT."
  value       = aws_secretsmanager_secret.api.name
}

output "api_secret_arn" {
  description = "ARN do segredo — usado por External Secrets ou pelo Secrets Store CSI driver."
  value       = aws_secretsmanager_secret.api.arn
}

output "create_k8s_secret_command" {
  description = <<-EOT
    Atalho para materializar o Secret do Kubernetes a partir do Secrets Manager,
    enquanto o External Secrets Operator não estiver no ar.
  EOT
  value       = <<-EOT
    aws secretsmanager get-secret-value \
      --secret-id ${aws_secretsmanager_secret.api.name} \
      --query SecretString --output text \
    | jq -r 'to_entries | map("--from-literal=\(.key)=\(.value)") | join(" ")' \
    | xargs kubectl -n tech-challenge create secret generic api-secrets
  EOT
}
