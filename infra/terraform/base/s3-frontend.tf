# Bucket que serve o frontend como site estático.
#
# O CI do repositório do frontend builda o Vite e sincroniza o `dist/` para
# cá; o próprio S3 serve os arquivos no endpoint de website. Sem CloudFront
# de propósito: o endpoint de website é HTTP, mas a API atrás do NLB também
# é — nenhum dos dois lados força TLS, então não há mixed content.
resource "aws_s3_bucket" "frontend" {
  # Nome de bucket é global no mundo inteiro; o sufixo com o id da conta
  # garante unicidade sem precisar de nome sorteado.
  bucket = "${var.project_name}-front-${data.aws_caller_identity.current.account_id}"

  # O conteúdo é artefato de build, regenerável por qualquer push no CI —
  # pode sumir junto com a stack sem cerimônia.
  force_destroy = true
}

# SPA com React Router: rota desconhecida no S3 vira o próprio index.html,
# que resolve a rota no cliente. O S3 devolve o corpo certo mas com status
# 404 — o navegador renderiza mesmo assim; corrigir o status exigiria
# CloudFront, que está fora do escopo aqui.
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Site público de verdade: as quatro proteções default precisam cair, senão
# a policy de leitura anônima logo abaixo é rejeitada no apply.
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "frontend_public_read" {
  statement {
    sid       = "PublicReadGetObject"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_public_read.json

  # Sem o depends_on o apply pode correr as duas mudanças em paralelo e a
  # policy pública chegar antes do public access block cair — erro
  # intermitente clássico dessa dupla.
  depends_on = [aws_s3_bucket_public_access_block.frontend]
}
