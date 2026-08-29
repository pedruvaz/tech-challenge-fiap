# Confiança entre o GitHub Actions e esta conta AWS.
#
# O objetivo é não guardar access key em secret do GitHub: o workflow troca o
# token OIDC efêmero que o próprio GitHub emite por credenciais temporárias
# da AWS. Se o repositório vazar, não vaza credencial junto.
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]

  # A AWS passou a validar a cadeia de certificados do GitHub internamente,
  # então este thumbprint não é mais o que autentica a conexão — mas o schema
  # do recurso continua exigindo o campo. São os dois valores publicados pelo
  # GitHub; manter ambos evita quebra na rotação do certificado.
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

data "aws_iam_policy_document" "github_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Restringe aos nossos repositórios: a API e o frontend, que usa a mesma
    # role para sincronizar o site no S3.
    #
    # Esta condição é o que separa "só o nosso CI assume a role" de "qualquer
    # workflow de qualquer repositório do GitHub assume a role". É o erro
    # clássico dessa configuração — sem ela, o provider OIDC confia no GitHub
    # inteiro.
    #
    # O frontend entra duas vezes de propósito: repositórios novos emitem o
    # `sub` no formato imutável (OWNER@ID/REPO@ID) e o match do IAM é
    # literal — só o nome clássico não casa e o STS recusa com "Not
    # authorized". Ver `github_frontend_repository_immutable`.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = flatten([
        for r in [
          var.github_repository,
          var.github_frontend_repository,
          var.github_frontend_repository_immutable,
          ] : [
          for s in var.github_allowed_subjects : "repo:${r}:${s}"
        ]
      ])
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name        = "${var.project_name}-github-actions"
  description = "Assumida pelo GitHub Actions via OIDC para publicar no ECR, fazer deploy no EKS e sincronizar o site do frontend no S3."

  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}

data "aws_iam_policy_document" "github_actions" {
  # `GetAuthorizationToken` não aceita recurso específico: a ação é global por
  # definição da API do ECR. É o único "*" desta policy.
  statement {
    sid       = "EcrLogin"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid    = "EcrPushPull"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]
    resources = [aws_ecr_repository.api.arn]
  }

  # Necessário para `aws eks update-kubeconfig` no workflow de deploy (etapa T5).
  # O cluster ainda não existe; uma policy do IAM pode referenciar um ARN futuro.
  statement {
    sid       = "EksDescribe"
    effect    = "Allow"
    actions   = ["eks:DescribeCluster"]
    resources = ["arn:aws:eks:${var.aws_region}:${data.aws_caller_identity.current.account_id}:cluster/${var.eks_cluster_name}"]
  }

  # O workflow de deploy lê este segredo (criado pela stack `cluster/`) para
  # materializar o Secret `api-secrets` dentro do cluster. Só leitura, e só
  # deste segredo — o sufixo `-*` cobre o hash aleatório que o Secrets Manager
  # acrescenta ao nome no ARN.
  statement {
    sid       = "ReadApiSecret"
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = ["arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:${var.project_name}/api-*"]
  }

  # O deploy do frontend é um `aws s3 sync`: lista o bucket para calcular o
  # diff, escreve o que mudou e apaga o que saiu do build. `ListBucket` age
  # sobre o bucket; as demais, sobre os objetos — separar os dois escopos é
  # obrigatório, no mesmo statement o sync falha com AccessDenied no List.
  statement {
    sid       = "FrontendSiteList"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.frontend.arn]
  }

  statement {
    sid    = "FrontendSiteWrite"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
  }
}

resource "aws_iam_policy" "github_actions" {
  name        = "${var.project_name}-github-actions"
  description = "Publicar imagem no ECR, descrever o cluster EKS para deploy e sincronizar o site do frontend no S3."
  policy      = data.aws_iam_policy_document.github_actions.json
}

resource "aws_iam_role_policy_attachment" "github_actions" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_actions.arn
}
