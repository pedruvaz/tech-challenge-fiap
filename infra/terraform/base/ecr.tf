resource "aws_ecr_repository" "api" {
  name = var.project_name

  # MUTABLE de propósito. Com IMMUTABLE, re-rodar um job do CI no mesmo commit
  # falha ao republicar a mesma tag SHA — atrito constante durante o trabalho.
  # Num ambiente de produção de verdade, IMMUTABLE é a escolha certa.
  image_tag_mutability = "MUTABLE"

  # Varredura de vulnerabilidade a cada push. Dá continuidade ao relatório
  # OWASP entregue na Fase 1 e o resultado sai no console do ECR.
  image_scanning_configuration {
    scan_on_push = true
  }

  # Permite `terraform destroy` mesmo com imagens publicadas. Sem isso, o
  # destroy falha e é preciso esvaziar o repositório à mão.
  force_delete = true
}

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name

  # Sem lifecycle policy o repositório cresce para sempre e vira custo silencioso.
  # A regra com tagStatus = "any" precisa ser sempre a de maior rulePriority.
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Descarta imagens sem tag após 1 dia"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Mantém apenas as últimas ${var.ecr_keep_last_images} imagens com tag"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.ecr_keep_last_images
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
