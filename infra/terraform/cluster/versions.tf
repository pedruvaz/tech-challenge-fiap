terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Mesmo bucket da stack `base`, key diferente. Ver README da `base` para o
  # bootstrap do bucket.
  backend "s3" {
    bucket       = "tf-state-tech-challenge-fiap-679084116359"
    key          = "cluster/terraform.tfstate"
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
      Stack     = "cluster"
      ManagedBy = "terraform"
    }
  }
}

# Autenticação no cluster para instalar charts.
#
# O provider helm 3.x recebe `kubernetes` como atributo; nas versões 2.x era um
# bloco. Se aparecer erro de schema aqui, confira a major do provider instalado.
provider "helm" {
  kubernetes = {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", var.aws_region]
    }
  }
}

data "aws_caller_identity" "current" {}

# Outputs da stack `base` (ECR e role do GitHub Actions).
data "terraform_remote_state" "base" {
  backend = "s3"

  config = {
    bucket = "tf-state-tech-challenge-fiap-679084116359"
    key    = "base/terraform.tfstate"
    region = "us-east-1"
  }
}
