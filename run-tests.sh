#!/bin/bash
set -e

echo "========================================"
echo "  Tech Challenge — Ambiente de Testes"
echo "========================================"

echo ""
echo "[1/4] Subindo banco de dados..."
docker compose up -d db
echo "Aguardando banco ficar pronto..."
until docker compose exec -T db pg_isready -U postgres -d oficina > /dev/null 2>&1; do
  sleep 1
done
echo "  ✓ Banco pronto"

echo ""
echo "[2/4] Rodando migrations..."
npx prisma migrate deploy
echo "  ✓ Migrations aplicadas"

echo ""
echo "[3/4] Rodando seed..."
npx ts-node prisma/seed.ts
echo "  ✓ Seed concluído"

echo ""
echo "[4/4] Rodando testes E2E..."
npm run test:e2e

echo ""
echo "========================================"
echo "  Testes concluídos!"
echo "========================================"

docker compose down
