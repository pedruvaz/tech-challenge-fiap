terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # O bucket é criado à mão uma única vez (etapa T0 — ver README).
  # Blocos de backend não aceitam variáveis, então o nome fica literal aqui.
  # Nome de bucket S3 é único no mundo inteiro: trocar por um seu antes do
  # primeiro `terraform init`.
  #
  # `use_lockfile` usa o lock nativo do S3 (Terraform >= 1.10) e dispensa a
  # tabela DynamoDB que as receitas antigas pedem.
  backend "s3" {
    bucket       = "tf-state-tech-challenge-fiap"
    key          = "base/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project_name
      Stack     = "base"
      ManagedBy = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}
