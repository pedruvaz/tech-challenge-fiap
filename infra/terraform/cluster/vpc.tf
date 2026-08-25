data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = slice(data.aws_availability_zones.available.names, 0, var.azs_count)

  # /20 por subnet — folga de sobra para esta entrega.
  private_subnets = [for i in range(var.azs_count) : cidrsubnet(var.vpc_cidr, 4, i)]
  public_subnets  = [for i in range(var.azs_count) : cidrsubnet(var.vpc_cidr, 4, i + 8)]
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr

  azs             = local.azs
  private_subnets = local.private_subnets
  public_subnets  = local.public_subnets

  # NAT único em vez de um por AZ. Um NAT Gateway custa ~US$33/mês; três
  # custariam ~US$99. Em troca, o NAT vira ponto único de falha para saída de
  # internet — trade-off aceitável aqui, inaceitável em produção.
  enable_nat_gateway = true
  single_nat_gateway = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  # Tags que o AWS Load Balancer Controller usa para descobrir onde criar os
  # load balancers. Sem elas, um Service `type: LoadBalancer` fica em pending
  # sem mensagem de erro clara.
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}
