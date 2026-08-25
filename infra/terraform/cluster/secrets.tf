resource "random_password" "jwt_access" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "api" {
  name        = "${var.project_name}/api"
  description = "DATABASE_URL e segredos JWT consumidos pela API."

  # Sem isto, destruir a stack agenda o segredo para exclusão com janela de
  # recuperação de 7 a 30 dias — e o próximo `apply` falha com "already
  # scheduled for deletion" porque o nome ainda está ocupado. Numa stack que
  # sobe e desce todo dia, isso trava tudo.
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "api" {
  secret_id = aws_secretsmanager_secret.api.id

  secret_string = jsonencode({
    DATABASE_URL = format(
      "postgresql://%s:%s@%s/%s?schema=public",
      var.db_username,
      urlencode(random_password.db.result),
      module.rds.db_instance_endpoint,
      var.db_name,
    )
    JWT_ACCESS_SECRET  = random_password.jwt_access.result
    JWT_REFRESH_SECRET = random_password.jwt_refresh.result
  })
}
