-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('admin', 'funcionario', 'mecanico');

-- CreateEnum
CREATE TYPE "Tipo" AS ENUM ('pessoa_fisica', 'pessoa_juridica');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('recebida', 'em_diagnostico', 'aguardando_aprovacao', 'em_execucao', 'finalizada', 'entregue');

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "roles" "Roles" NOT NULL DEFAULT 'funcionario',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "cliente" (
    "cliente_id" TEXT NOT NULL,
    "num_documento" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "tipo" "Tipo" NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "veiculo" (
    "veiculo_id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "veiculo_pkey" PRIMARY KEY ("veiculo_id")
);

-- CreateTable
CREATE TABLE "veiculo_cliente" (
    "veiculo_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,

    CONSTRAINT "veiculo_cliente_pkey" PRIMARY KEY ("veiculo_id","cliente_id")
);

-- CreateTable
CREATE TABLE "ordem_servico" (
    "os_id" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "veiculo_id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'recebida',
    "valor_final" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "ordem_servico_pkey" PRIMARY KEY ("os_id")
);

-- CreateTable
CREATE TABLE "insumo" (
    "insumo_id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "qtd_estoque" INTEGER NOT NULL,
    "valor_un" DECIMAL(10,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "insumo_pkey" PRIMARY KEY ("insumo_id")
);

-- CreateTable
CREATE TABLE "insumo_consumido" (
    "os_id" TEXT NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "qtd_consumida" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "insumo_consumido_pkey" PRIMARY KEY ("os_id","insumo_id")
);

-- CreateTable
CREATE TABLE "peca" (
    "peca_id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "qtd_estoque" INTEGER NOT NULL,
    "valor_un" DECIMAL(10,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "peca_pkey" PRIMARY KEY ("peca_id")
);

-- CreateTable
CREATE TABLE "peca_utilizada" (
    "os_id" TEXT NOT NULL,
    "peca_id" INTEGER NOT NULL,
    "qtd" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "peca_utilizada_pkey" PRIMARY KEY ("os_id","peca_id")
);

-- CreateTable
CREATE TABLE "servico" (
    "servico_id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "servico_pkey" PRIMARY KEY ("servico_id")
);

-- CreateTable
CREATE TABLE "servico_realizado" (
    "os_id" TEXT NOT NULL,
    "servico_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valor" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "servico_realizado_pkey" PRIMARY KEY ("os_id","servico_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_num_documento_key" ON "cliente"("num_documento");

-- CreateIndex
CREATE UNIQUE INDEX "veiculo_placa_key" ON "veiculo"("placa");

-- AddForeignKey
ALTER TABLE "veiculo_cliente" ADD CONSTRAINT "veiculo_cliente_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculo"("veiculo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculo_cliente" ADD CONSTRAINT "veiculo_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem_servico" ADD CONSTRAINT "ordem_servico_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculo"("veiculo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumo_consumido" ADD CONSTRAINT "insumo_consumido_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordem_servico"("os_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumo_consumido" ADD CONSTRAINT "insumo_consumido_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumo"("insumo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peca_utilizada" ADD CONSTRAINT "peca_utilizada_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordem_servico"("os_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peca_utilizada" ADD CONSTRAINT "peca_utilizada_peca_id_fkey" FOREIGN KEY ("peca_id") REFERENCES "peca"("peca_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servico_realizado" ADD CONSTRAINT "servico_realizado_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordem_servico"("os_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servico_realizado" ADD CONSTRAINT "servico_realizado_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servico"("servico_id") ON DELETE RESTRICT ON UPDATE CASCADE;
