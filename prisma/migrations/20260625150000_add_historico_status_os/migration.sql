-- CreateTable
CREATE TABLE "historico_status_os" (
    "id" SERIAL NOT NULL,
    "os_id" TEXT NOT NULL,
    "status_anterior" "Status",
    "status_novo" "Status" NOT NULL,
    "usuario_id" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_status_os_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historico_status_os_os_id_idx" ON "historico_status_os"("os_id");

-- AddForeignKey
ALTER TABLE "historico_status_os" ADD CONSTRAINT "historico_status_os_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordem_servico"("os_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status_os" ADD CONSTRAINT "historico_status_os_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
