# EKS em Auto Mode.
#
# Auto Mode entrega compute, storage e load balancing gerenciados pela AWS —
# sem node group para configurar, com Karpenter, Bottlerocket e IMDSv2 por
# padrão. Custa visibilidade sobre o data plane e cobra uma taxa de
# gerenciamento sobre o custo das instâncias EC2. Para o prazo desta fase, o
# tempo economizado compensa.
#
# ATENÇÃO à versão do módulo: a v21 renomeou variáveis da v20
# (`cluster_name` virou `name`, `cluster_version` virou `kubernetes_version`).
# Se o `terraform init` puxar uma major diferente da pinada, os nomes abaixo
# não batem. Rodar `terraform validate` antes do primeiro plan.
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = var.cluster_name
  kubernetes_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Endpoint público para conseguir rodar kubectl da máquina local e do CI sem
  # bastion. Em produção isso seria privado com acesso via VPN.
  endpoint_public_access = true

  compute_config = {
    enabled    = true
    node_pools = ["general-purpose"]
  }

  # Quem roda o `terraform apply` vira admin do cluster. Sem isso, o cluster
  # sobe e ninguém consegue usar kubectl nele.
  enable_cluster_creator_admin_permissions = true

  access_entries = {
    # Permite que o workflow de deploy do GitHub Actions aplique manifestos.
    #
    # `eks:DescribeCluster` no IAM (concedido na stack `base`) só permite
    # montar o kubeconfig — quem autoriza o kubectl de fato é este access
    # entry. É o tropeço clássico dessa configuração.
    #
    # ClusterAdmin é amplo de propósito: o deploy precisa criar o próprio
    # Namespace `tech-challenge`, que é recurso cluster-scoped e portanto fora
    # do alcance de uma policy limitada a namespace.
    github_actions = {
      principal_arn = data.terraform_remote_state.base.outputs.github_actions_role_arn

      policy_associations = {
        admin = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = {
            type = "cluster"
          }
        }
      }
    }
  }
}
