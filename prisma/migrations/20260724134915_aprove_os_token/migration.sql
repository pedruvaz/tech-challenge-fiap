-- CreateTable
CREATE TABLE "token_aprovacao" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ordemServicoId" TEXT NOT NULL,
    "emailCliente" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_aprovacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_aprovacao_token_key" ON "token_aprovacao"("token");

-- AddForeignKey
ALTER TABLE "token_aprovacao" ADD CONSTRAINT "token_aprovacao_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "ordem_servico"("os_id") ON DELETE RESTRICT ON UPDATE CASCADE;
