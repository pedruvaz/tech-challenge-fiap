resource "random_password" "db" {
  length = 32

  # O Postgres do RDS rejeita `/`, `@`, `"` e espaço na senha do master.
  # Além disso a senha entra numa connection string, onde `/` e `@` seriam
  # separadores — restringir aqui evita ter que fazer URL-encode depois.
  special          = true
  override_special = "!#%*-_=+"
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds"
  description = "Permite Postgres apenas a partir do cluster EKS."
  vpc_id      = module.vpc.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_eks" {
  security_group_id = aws_security_group.rds.id
  description       = "Postgres a partir dos pods do EKS"

  # No Auto Mode as ENIs dos pods recebem o security group primário do
  # cluster. Se em algum momento os pods deixarem de alcançar o banco, é este
  # o primeiro lugar para olhar — a alternativa é
  # `module.eks.node_security_group_id`.
  referenced_security_group_id = module.eks.cluster_primary_security_group_id

  from_port   = 5432
  to_port     = 5432
  ip_protocol = "tcp"
}

module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${var.project_name}-db"

  engine               = "postgres"
  engine_version       = "16"
  family               = "postgres16"
  major_engine_version = "16"
  instance_class       = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db.result
  port     = 5432

  # Deixamos a senha no nosso próprio Secrets Manager (ver secrets.tf) para
  # poder montar a DATABASE_URL completa num único segredo. Com o
  # gerenciamento nativo da AWS, seria preciso ler o segredo dela e recompor.
  manage_master_user_password = false

  multi_az               = false
  publicly_accessible    = false
  create_db_subnet_group = true
  subnet_ids             = module.vpc.private_subnets
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Esta stack é feita para subir e descer. Com deletion protection ligada ou
  # snapshot final obrigatório, o `terraform destroy` falha e sobra instância
  # rodando — que é exatamente o custo que queremos evitar.
  deletion_protection = false
  skip_final_snapshot = true

  backup_retention_period = 0
  create_monitoring_role  = false
}
