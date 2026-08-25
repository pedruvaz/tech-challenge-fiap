variable "aws_region" {
  description = "Região da AWS."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefixo e tag aplicados aos recursos."
  type        = string
  default     = "tech-challenge-fiap"
}

variable "cluster_name" {
  description = "Nome do cluster EKS. Precisa bater com `eks_cluster_name` da stack `base`."
  type        = string
  default     = "tech-challenge"
}

variable "kubernetes_version" {
  description = "Versão do Kubernetes no control plane."
  type        = string
  default     = "1.33"
}

variable "vpc_cidr" {
  description = "CIDR da VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs_count" {
  description = <<-EOT
    Quantas zonas de disponibilidade usar.

    Duas é o mínimo: o EKS exige subnets em pelo menos 2 AZs e o subnet group
    do RDS também. Subir para 3 aumenta o custo sem ganho para esta entrega.
  EOT
  type        = number
  default     = 2
}

variable "db_instance_class" {
  description = "Classe da instância RDS. `db.t4g.micro` é elegível ao free tier nos 12 primeiros meses."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Armazenamento do RDS em GB. O mínimo do Postgres é 20."
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Nome do banco criado na instância."
  type        = string
  default     = "oficina"
}

variable "db_username" {
  description = "Usuário master do Postgres."
  type        = string
  default     = "oficina_admin"
}

variable "install_metrics_server" {
  description = <<-EOT
    Instala o metrics-server via Helm.

    O HPA em `k8s/50-hpa.yaml` não funciona sem a API `metrics.k8s.io`, e
    escalabilidade automática é item avaliado. Não está confirmado se o EKS
    Auto Mode já entrega o metrics-server — depois do primeiro apply, testar
    com `kubectl top nodes`. Se já vier, basta trocar esta variável para false.
  EOT
  type        = bool
  default     = true
}
